# Exoplanet KOI Classifier

▶️ **[Live App](https://nasa-exo-planets.vercel.app/)**  
📄 **[Full Methods & Results Report](docs/methods.md)**  

---

## Overview
This project predicts whether a Kepler Object of Interest (KOI) is a **Candidate, Confirmed Exoplanet, or False Positive** using ML models trained on NASA’s Kepler DR25 cumulative catalog.  

- **Binary task:** Candidate vs False Positive  
- **Multiclass task:** False Positive / Candidate / Confirmed  
- Built with **scikit-learn**, **FastAPI**, and **React**.  

---

## Demo
- Try it live: [App Link](https://nasa-exo-planets.vercel.app/)  
- Example: Upload KOI parameters → classifier predicts category + confidence  
- (Add screenshots/GIFs here for quick visual impact)  

---

## Quickstart

Clone and install dependencies:

```bash
git clone https://github.com/oztari/NasaExoPlanets.git
cd NasaExoPlanets
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app:app --reload
```
Open [http://localhost:8000/docs](http://localhost:8000/docs) for the API.  

---

## Project Status
- ✅ Binary classifier (Random Forest, Logistic Regression)  
- ✅ Multiclass classifier (Logistic Regression, Random Forest)  
- ⏳ Adding SHAP explanations and per-KOI light curve visualizations  

---

## Results (High-Level)
- **Binary (no leakage features):** Random Forest, F1 ≈ 0.92  
- **Multiclass:** Logistic Regression, Acc ≈ 0.91, Macro-F1 ≈ 0.87  
- Main confusion: Candidate ↔ Confirmed (expected from photometry-only input)  

📄 See the [full report](docs/methods.md) for detailed methodology, metrics, and scientific rationale.  

---

## Contributing
PRs welcome. See `CONTRIBUTING.md`.  

---

## License
MIT
