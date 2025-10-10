from fastapi import FastAPI, Response ##Currently not in use in this program
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel  
import joblib
from pathlib import Path
from typing import Optional, Dict, Any
import joblib
import numpy as np
import pandas as pd
import sklearn

# ----------------------------
# Model paths
# ----------------------------
BASE_DIR = Path(__file__).resolve().parent # Directory where this file lives
MODEL_DIR = BASE_DIR.parent / "notebooks" / "models" # Points to where ../notebooks/models is relative to this file
LR_PATH = MODEL_DIR / "logistic_regression_pipeline.joblib" # File path for the LR ML model
RF_PATH = MODEL_DIR / "random_forest_pipeline.joblib" # File path for the RF ML model

# ----------------------------
# App
# ----------------------------
app = FastAPI(title="Exoplanet Classifier API") # Creating a FastAPI with a title. This basically initializes the webapp

# Allow your Vite dev server to call the API
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origins=["*"],  # Allow all origins for debugging
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

# Runs once when the API starts and loads the LR and RF ML model pipelines.
# Defines a stable label order to prevent swapped results.
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

# Creates a mapping: ensures model classes are consistently renamed/aligned.
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
# Defines the input JSON structure for the /predict endpoint
# Each attribute is optional so missing fields wont cause errors
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

# Ensures input DataFrame matches what the ML model expects
# Adds missing columns as NaN
# Reorders columns to match training
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

# Converts raw model outputs (e.g. "CAND") into clean labels ("Candidate")

def remap_prediction(pred: Any, mapping: Dict[str, str]) -> str:
    pred_str = str(pred)
    return mapping.get(pred_str, pred_str)

# Extracts the sklearn version used when the model was saved
def get_saved_sklearn_version(model):
    return getattr(model, "_sklearn_version", getattr(model, "__sklearn_version__", "unknown"))

# Returns a probability/confidence score:
#   If model has predict_proba: use it
#   If not: use decision_function and convert via sigmoid/softmax
#   Otherwise: fallback = 0.0
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

# Selects logistic regression model or random forest model based on model string
# Raises error if invalid
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

# Simple landing page
@app.get("/")
def root():
    return {"message": "Welcome to the Exoplanet Classifier API 🚀"}

# Confirms models loaded properly
@app.get("/health")
def health():
    ok = all(x is not None for x in [globals().get("lr_model"), globals().get("rf_model")])
    return {"ok": ok}

# Prediction route that accepts JSON input following ExoplanetData
# Default model is set to Random Forest "rf"
# converts input  -> data frame -> aligns columns -> Feeds into chosen model
# Gets prediction + probability
# Returns JSON : "prediction" and "confidence"
@app.post("/predict")
def predict(data: ExoplanetData, model: str = "rf"):
    print("Received request")
    input_df = pd.DataFrame([data.dict()])

    if model == "lr":
        print("Model. LR chosen")
        input_df = align_to_model_columns(input_df, lr_model)
        raw_pred = lr_model.predict(input_df)[0]
        pred = remap_prediction(raw_pred, lr_mapping)  # ✅ remap
        proba = lr_model.predict_proba(input_df).max()
    else:
        print("Model RF chosen")
        input_df = align_to_model_columns(input_df, rf_model)
        print("formatted to align with model columns", input_df)
        raw_pred = rf_model.predict(input_df)[0]
        print("Raw predictions")
        pred = remap_prediction(raw_pred, rf_mapping)  # ✅ remap
        print("Remap prediction")
        proba = rf_model.predict_proba(input_df).max()
        print("predict probe")

    # ✅ Clean probability
    if np.isnan(proba) or np.isinf(proba):
        proba = 0.0

    return {"prediction": pred, "confidence": round(proba, 3)}

# Uses sklearn runtime vesion and model pickle versions.
# Useful to debug version mismatches
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

# Loads raw dataset (exoplanets_2025.csv), selects relevant columns
# Converts each row into JSON serializable dict
# Returns list of KOI entires for frontend explorer
@app.get("/koi/list")
def list_koi():
    """Return a list of KOI objects for the Explorer page"""
    try:
        # Load the exoplanets data
        data_path = BASE_DIR.parent / "data" / "raw" / "exoplanets_2025.csv"
        df = pd.read_csv(data_path)
        
        # Select relevant columns for the Explorer
        columns = [
            'kepid', 'kepoi_name', 'koi_disposition', 'koi_period', 'koi_duration',
            'koi_depth', 'koi_prad', 'koi_model_snr', 'koi_snr', 'koi_score',
            'koi_ror', 'koi_impact', 'koi_max_mult_ev', 'koi_fpflag_ss',
            'koi_fpflag_co', 'koi_fpflag_nt', 'koi_fpflag_ec'
        ]
        
        # Filter to only include columns that exist in the data
        existing_columns = [col for col in columns if col in df.columns]
        df_filtered = df[existing_columns].copy()
        
        # Convert to list of dictionaries and handle NaN values
        koi_list = []
        for _, row in df_filtered.iterrows():
            koi_item = {}
            for col in existing_columns:
                value = row[col]
                # Convert NaN to None for JSON serialization
                if pd.isna(value):
                    koi_item[col] = None
                else:
                    koi_item[col] = value
            koi_list.append(koi_item)
        
        return koi_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load KOI data: {str(e)}")
    
