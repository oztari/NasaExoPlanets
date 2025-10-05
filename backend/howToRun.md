# How to Run the Backend

## 1) Go to the backend folder
```bash
cd backend
```

## 2) Run the dev script (recommended)
```bash
bash ./dev.sh
```
This script will:
- create a virtual environment `.venv`
- install or update all Python dependencies
- launch the FastAPI server

You should see something like:
```
✅ Starting API on: http://127.0.0.1:8000
```

## 3) Open in your browser
- Docs: http://127.0.0.1:8000/docs
- Root: http://127.0.0.1:8000

## 4) Manual start (if the script fails)
```bash
source .venv/bin/activate
uvicorn app:app --reload --port 8000
```

## 5) Quick test
```bash
curl -X POST "http://127.0.0.1:8000/predict?model=rf" \
  -H "Content-Type: application/json" \
  -d '{
    "koi_period": 10.5,
    "koi_duration": 3.2,
    "koi_depth": 500,
    "koi_prad": 1.9,
    "koi_model_snr": 15,
    "koi_ror": 0.03,
    "koi_impact": 0.2,
    "koi_max_mult_ev": 1,
    "koi_fpflag_ss": 0,
    "koi_fpflag_co": 0,
    "koi_fpflag_nt": 0,
    "koi_fpflag_ec": 0
  }'
```

## 6) Model files location
The API expects models at:
```
notebooks/models/logistic_regression_pipeline.joblib
notebooks/models/random_forest_pipeline.joblib
```

## 7) Troubleshooting sklearn version mismatch
If you see an error like:
```
'DecisionTreeClassifier' object has no attribute 'monotonic_cst'
```
that indicates a scikit-learn version mismatch between the version used to train the models and your runtime.

1. Inspect versions from the API:
```bash
curl http://127.0.0.1:8000/versions
```
You will get the runtime sklearn version and the versions the models were saved with.

2. Align versions (choose one):
- Pin runtime to the saved version (recommended):
  ```bash
  python3 -m pip install "scikit-learn==<saved_version>"
  ```
- Or re-export the models using your current runtime scikit-learn.

3. Restart the server after changing packages.

## 8) Misc
- Stop the server with `CTRL + C`.
- Clean reset:
  ```bash
  rm -rf .venv
  bash ./dev.sh
  ```
