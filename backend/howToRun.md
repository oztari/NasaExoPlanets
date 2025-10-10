# 🚀 How to Run the Backend

## 1️⃣ Go to the backend folder
```bash
cd backend

2️⃣ Run the dev script

bash ./dev.sh

That script will:
	•	Create a virtual environment (.venv)
	•	Install or update all Python dependencies
	•	Launch the FastAPI server

You’ll see:

✅ Starting API on: http://127.0.0.1:8000


⸻

3️⃣ Open your browser
	•	Docs → http://127.0.0.1:8000/docs
	•	Root → http://127.0.0.1:8000

⸻

4️⃣ (Optional) Manual start if script fails

source .venv/bin/activate
uvicorn app:app --reload --port 8000


⸻

5️⃣ Test Example

curl -X POST "http://127.0.0.1:8000/predict?model=lr" \
  -H "Content-Type: application/json" \
  -d '{"koi_period":10.5,"koi_duration":3.2,"koi_depth":500,"koi_prad":1.9,"koi_model_snr":15,"koi_ror":0.03,"koi_impact":0.2,"koi_max_mult_ev":1,"koi_fpflag_ss":0,"koi_fpflag_co":0,"koi_fpflag_nt":0,"koi_fpflag_ec":0}'

Expected response:

{"prediction":"Confirmed","confidence":0.921}


⸻

6️⃣ Notes
	•	Models live in backend/models/
	•	Stop the server with CTRL + C
	•	If you see version warnings for scikit-learn, install:

python3 -m pip install scikit-learn==1.3.0


# 🚀 How to Run the Backend

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

You should see:
```
✅ Starting API on: http://127.0.0.1:8000
```

## 3) Open in your browser
- **Docs:** http://127.0.0.1:8000/docs  
- **Root:** http://127.0.0.1:8000

## 4) Manual start (if the script fails)
```bash
source .venv/bin/activate
uvicorn app:app --reload --port 8000
```

## 5) Quick test
```bash
curl -X POST "http://127.0.0.1:8000/predict?model=lr" \
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
Expected response (values will vary):
```json
{
  "prediction": "Confirmed",
  "confidence": 0.921
}
```

## 6) Notes
- Model files must exist here: /notebooks/models
  ```
  notebooks/models/logistic_regression_pipeline.joblib
  notebooks/models/random_forest_pipeline.joblib
  ```
- Stop the server with `CTRL + C`.
- If you see scikit-learn version warnings, align versions:
  ```bash
  python3 -m pip install "scikit-learn==1.3.0"
  ```
  or retrain/resave the models with your current scikit-learn version.
- Clean reset:
  ```bash
  rm -rf .venv
  bash ./dev.sh
  ```