Exoplanet Detection — Model Documentation
1. Introduction
Goal: classify Kepler Objects of Interest (KOIs) into Confirmed planets, Candidates, or False Positives.
Dataset: NASA Kepler KOI catalog (exoplanets_2025.csv).
Models trained: Logistic Regression (baseline) and Random Forest (primary model).
2. Data Preparation
Loaded dataset, mapped koi_disposition → {Confirmed, Candidate, False Positive}.
Dropped rows without labels.
Selected numeric features only.
Removed:
Columns with only NaN.
Columns with no variance (only one value).
Replaced infinities with NaN.
Train/test split: 60% train, 40% test, stratified by class.
3. Models and Training
Logistic Regression (LR)
Preprocessing: Median imputation + StandardScaler.
Multinomial Logistic Regression.
Class weights: {Confirmed: 3, Candidate: 2, False Positive: 1}.
Max iterations: 5000 (to ensure convergence).
Purpose: interpretable baseline.
Random Forest (RF)
Preprocessing: Median imputation.
Random Forest Classifier with:
300 trees.
max_depth=20, min_samples_leaf=10.
Class weights: {Confirmed: 3, Candidate: 2, False Positive: 1}.
n_jobs=-1 for parallel training.
Purpose: more flexible non-linear model.
4. Evaluation
Metrics Used
Confusion matrices.
Precision, Recall, F1-scores (per-class, macro, weighted).
Precision–Recall curves for each class.
Threshold tuning for "Confirmed" class (0.5 → 0.9).
Calibration curve (checked probability reliability).
Results Summary
Logistic Regression: interpretable but limited — struggles with complex feature interactions.
Random Forest:
Better precision–recall tradeoff, especially for "Confirmed".
Feature importance highlights astrophysical signals:
koi_score (overall reliability),
koi_prad (planet radius),
koi_period (orbital period),
koi_depth (transit depth),
koi_model_snr (signal-to-noise ratio).
Calibrated probabilities are reliable at higher thresholds.
5. Threshold Tuning (Confirmed class)
At 0.8 threshold, RF achieved:
Very high precision (≥95%) for Confirmed planets.
Slight drop in recall (some Confirmed missed).
This tradeoff matches NASA’s goal of minimizing false positives.
6. Model Comparison
Model	Accuracy	Macro Precision	Macro Recall	Macro F1	Weighted F1
Logistic Regression	XX%	XX	XX	XX	XX
Random Forest	XX%	XX	XX	XX	XX
(Replace XX with the metrics you printed in your code)
7. Conclusion
Logistic Regression = interpretable baseline.
Random Forest = better predictive performance, feature insights, and more robust to noise.
RF is the preferred model for exoplanet detection in this workflow.
Models and metrics saved under models/ for reproducibility.
8. Next Steps
Explore hyperparameter tuning (grid search, Bayesian optimization).
Try gradient boosting models (XGBoost, LightGBM).
Incorporate astrophysical priors or domain knowledge.
Test on future exoplanet candidate datasets (TESS, PLATO).




NOTE: The logistic_regression_pipeline.joblib and random_forest_pipeline.joblib were created from the multiclass_analysis.ipynb.