from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, Any
import joblib
import numpy as np
import pandas as pd
import sklearn

# ----------------------------
# Model paths
# ----------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "notebooks" / "models"
LR_PATH = MODEL_DIR / "logistic_regression_pipeline.joblib"
RF_PATH = MODEL_DIR / "random_forest_pipeline.joblib"

# ----------------------------
# App
# ----------------------------
app = FastAPI(title="Exoplanet Classifier API")

# Allow your Vite dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Load models at startup
# ----------------------------
def _patch_sklearn_compat(obj):
    """
    - Adds missing attributes expected by newer sklearn versions on older pickles,
      e.g., DecisionTreeClassifier.monotonic_cst used by RandomForest trees.
    - Traverses common containers like Pipeline and ensembles.
    """
    try:
        from sklearn.tree import DecisionTreeClassifier
        from sklearn.pipeline import Pipeline
    except Exception:
        return

    seen = set()

    def visit(x):
        if x is None:
            return
        try:
            key = id(x)
            if key in seen:
                return
            seen.add(key)
        except Exception:
            pass

        # Direct estimator fixes
        try:
            if isinstance(x, DecisionTreeClassifier):
                if not hasattr(x, "monotonic_cst"):
                    # Default consistent with sklearn when not provided
                    setattr(x, "monotonic_cst", None)
        except Exception:
            pass

        # Pipelines
        try:
            if isinstance(x, Pipeline):
                for step in x.named_steps.values():
                    visit(step)
        except Exception:
            pass

        # Common ensemble containers
        for attr in ("estimators_", "estimators"):
            try:
                ests = getattr(x, attr, None)
                if ests is not None:
                    for e in ests:
                        visit(e)
            except Exception:
                pass

        # Base estimator pattern
        for attr in ("base_estimator_", "base_estimator"):
            try:
                be = getattr(x, attr, None)
                if be is not None:
                    visit(be)
            except Exception:
                pass

    visit(obj)

@app.on_event("startup")
def load_models():
    global lr_model, rf_model, lr_mapping, rf_mapping

    try:
        lr_model = joblib.load(LR_PATH)
        rf_model = joblib.load(RF_PATH)
    except Exception as e:
        raise RuntimeError(f"Failed to load model files: {e}")

    # Force a consistent standard order (alphabetical)
    # Example standard names. Adjust if your canonical labels differ.
    STANDARD_ORDER = ["Candidate", "Confirmed", "False Positive"]

    def build_mapping(model) -> Dict[str, str]:
        if not hasattr(model, "classes_"):
            raise RuntimeError("Model is missing classes_. It must be a classifier.")
        classes_sorted = sorted(list(model.classes_))
        if len(classes_sorted) != len(STANDARD_ORDER):
            raise RuntimeError(
                f"Model has {len(classes_sorted)} classes. Expected {len(STANDARD_ORDER)}."
            )
        return {raw: std for raw, std in zip(classes_sorted, STANDARD_ORDER)}

    # Patch compatibility shims if needed
    try:
        _patch_sklearn_compat(lr_model)
        _patch_sklearn_compat(rf_model)
    except Exception:
        pass

    lr_mapping = build_mapping(lr_model)
    rf_mapping = build_mapping(rf_model)

    print("LR classes:", getattr(lr_model, "classes_", None))
    print("RF classes:", getattr(rf_model, "classes_", None))

    # Log sklearn versions to help diagnose pickle compatibility issues
    try:
        print("Runtime sklearn:", sklearn.__version__)
        print("LR saved with sklearn:", get_saved_sklearn_version(lr_model))
        print("RF saved with sklearn:", get_saved_sklearn_version(rf_model))
    except Exception:
        pass

# ----------------------------
# Request model
# ----------------------------
class ExoplanetData(BaseModel):
    koi_period: Optional[float] = None
    koi_duration: Optional[float] = None
    koi_depth: Optional[float] = None
    koi_prad: Optional[float] = None
    koi_model_snr: Optional[float] = None
    koi_snr: Optional[float] = None
    koi_score: Optional[float] = None
    koi_ror: Optional[float] = None
    koi_impact: Optional[float] = None
    koi_max_mult_ev: Optional[float] = None
    koi_fpflag_ss: Optional[int] = None
    koi_fpflag_co: Optional[int] = None
    koi_fpflag_nt: Optional[int] = None
    koi_fpflag_ec: Optional[int] = None

# ----------------------------
# Helpers
# ----------------------------
def align_to_model_columns(df: pd.DataFrame, model) -> pd.DataFrame:
    expected = None

    # Directly on the estimator
    if hasattr(model, "feature_names_in_"):
        expected = list(model.feature_names_in_)
    # Or find inside a pipeline
    elif hasattr(model, "named_steps"):
        for step in model.named_steps.values():
            if hasattr(step, "feature_names_in_"):
                expected = list(step.feature_names_in_)
                break

    if expected is None:
        # Fallback: keep whatever columns were sent
        expected = list(df.columns)

    # Add missing expected columns as NaN, then reorder
    for col in expected:
        if col not in df.columns:
            df[col] = np.nan

    return df[expected]

def remap_prediction(pred: Any, mapping: Dict[str, str]) -> str:
    pred_str = str(pred)
    return mapping.get(pred_str, pred_str)

def get_saved_sklearn_version(model):
    return getattr(model, "_sklearn_version", getattr(model, "__sklearn_version__", "unknown"))

def get_confidence(model, X):
    """Return a confidence score even if the estimator lacks predict_proba."""
    import numpy as np

    # Preferred: probabilities
    if hasattr(model, "predict_proba"):
        try:
            return float(np.max(model.predict_proba(X)))
        except Exception:
            pass

    # Fallback: decision_function -> sigmoid/softmax
    if hasattr(model, "decision_function"):
        try:
            df = model.decision_function(X)
            df = np.asarray(df)
            if df.ndim == 1:
                # binary distance to boundary
                return float(1.0 / (1.0 + np.exp(-abs(df[0]))))
            else:
                # multiclass softmax
                row = df[0] - np.max(df[0])
                probs = np.exp(row) / np.sum(np.exp(row))
                return float(np.max(probs))
        except Exception:
            pass

    # Last resort
    return 0.0

def choose_model(name: str):
    name = (name or "").lower()
    if name == "lr":
        return lr_model, lr_mapping
    if name == "rf":
        return rf_model, rf_mapping
    raise HTTPException(status_code=400, detail="model must be 'rf' or 'lr'")

# ----------------------------
# Routes
# ----------------------------
@app.get("/")
def root():
    return {"message": "Welcome to the Exoplanet Classifier API 🚀"}

@app.get("/health")
def health():
    ok = all(x is not None for x in [globals().get("lr_model"), globals().get("rf_model")])
    return {"ok": ok}

@app.get("/versions")
def versions():
    try:
        lr_saved = get_saved_sklearn_version(globals().get("lr_model")) if globals().get("lr_model") is not None else None
        rf_saved = get_saved_sklearn_version(globals().get("rf_model")) if globals().get("rf_model") is not None else None
    except Exception:
        lr_saved, rf_saved = None, None
    return {
        "runtime": sklearn.__version__,
        "lr_saved": lr_saved,
        "rf_saved": rf_saved,
    }

@app.post("/predict")
def predict(data: ExoplanetData, model: str = "rf"):
    try:
        m, mapping = choose_model(model)
        df = pd.DataFrame([data.dict()])
        df = align_to_model_columns(df, m)

        raw_pred = m.predict(df)[0]
        pred = remap_prediction(str(raw_pred), mapping)

        proba = get_confidence(m, df)
        if np.isnan(proba) or np.isinf(proba):
            proba = 0.0

        return {"prediction": pred, "confidence": round(float(proba), 3)}
    except HTTPException:
        raise
    except Exception as e:
        # Add a helpful hint for sklearn version mismatches (e.g., monotonic_cst)
        msg = str(e)
        if "monotonic_cst" in msg or "has no attribute 'monotonic_cst'" in msg:
            msg += " | Possible scikit-learn version mismatch between training and runtime. Check /versions and align sklearn versions."
        raise HTTPException(status_code=500, detail=f"prediction failed: {msg}")
    
