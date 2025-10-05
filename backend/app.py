from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel  
import joblib
from pathlib import Path
from typing import Optional
import numpy as np
import pandas as pd

# ----------------------------
# Load models
# ----------------------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "notebooks" / "models"

lr_model = joblib.load(MODEL_DIR / "logistic_regression_pipeline.joblib")
rf_model = joblib.load(MODEL_DIR / "random_forest_pipeline.joblib")

print("Logistic Regression raw classes:", lr_model.classes_)
print("Random Forest raw classes:", rf_model.classes_)

# ----------------------------
# Force a consistent standard order (alphabetical)
# ----------------------------
STANDARD_ORDER = ["Candidate", "Confirmed", "False Positive"]

lr_mapping = {cls: std for cls, std in zip(sorted(lr_model.classes_), STANDARD_ORDER)}
rf_mapping = {cls: std for cls, std in zip(sorted(rf_model.classes_), STANDARD_ORDER)}

def remap_prediction(pred: str, mapping: dict) -> str:
    """Remap raw model prediction to standardized class name."""
    return mapping.get(pred, pred)

# ----------------------------
# FastAPI setup
# ----------------------------
app = FastAPI(title="Exoplanet Classifier API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define expected input format
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
# Utility: align input to model
# ----------------------------
def align_to_model_columns(df: pd.DataFrame, model) -> pd.DataFrame:
    expected = None
    if hasattr(model, "feature_names_in_"):
        expected = list(model.feature_names_in_)
    elif hasattr(model, "named_steps"):
        for step in model.named_steps.values():
            if hasattr(step, "feature_names_in_"):
                expected = list(step.feature_names_in_)
                break

    if expected is None:
        expected = list(df.columns)

    # Add missing columns as NaN and reorder
    for col in expected:
        if col not in df.columns:
            df[col] = np.nan
    return df[expected]

# ----------------------------
# Routes
# ----------------------------
@app.get("/")
def root():
    return {"message": "Welcome to the Exoplanet Classifier API 🚀"}

@app.post("/predict")
def predict(data: ExoplanetData, model: str = "rf"):
    input_df = pd.DataFrame([data.dict()])

    if model == "lr":
        input_df = align_to_model_columns(input_df, lr_model)
        raw_pred = lr_model.predict(input_df)[0]
        pred = remap_prediction(raw_pred, lr_mapping)  # ✅ remap
        proba = lr_model.predict_proba(input_df).max()
    else:
        input_df = align_to_model_columns(input_df, rf_model)
        raw_pred = rf_model.predict(input_df)[0]
        pred = remap_prediction(raw_pred, rf_mapping)  # ✅ remap
        proba = rf_model.predict_proba(input_df).max()

    # ✅ Clean probability
    if np.isnan(proba) or np.isinf(proba):
        proba = 0.0

    return {
        "prediction": str(pred),
        "confidence": round(float(proba), 3)
    }