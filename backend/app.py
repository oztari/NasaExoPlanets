from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, Any
import joblib
import numpy as np
import pandas as pd

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

    lr_mapping = build_mapping(lr_model)
    rf_mapping = build_mapping(rf_model)

    print("LR classes:", getattr(lr_model, "classes_", None))
    print("RF classes:", getattr(rf_model, "classes_", None))

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

@app.post("/predict")
def predict(data: ExoplanetData, model: str = "rf"):
    try:
        m, mapping = choose_model(model)
        df = pd.DataFrame([data.dict()])
        df = align_to_model_columns(df, m)

        raw_pred = m.predict(df)[0]
        if not hasattr(m, "predict_proba"):
            raise HTTPException(status_code=500, detail="model has no predict_proba")
        proba = float(np.max(m.predict_proba(df)))

        pred = remap_prediction(raw_pred, mapping)

        if np.isnan(proba) or np.isinf(proba):
            proba = 0.0

        return {"prediction": pred, "confidence": round(proba, 3)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"prediction failed: {e}")
    

