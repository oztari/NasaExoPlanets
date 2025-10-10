# Notebooks – Model Development and Analysis

This folder documents the iterative development of machine learning models for the **Exoplanet Detector web application**.  
Each notebook represents a distinct stage of experimentation, showing how the models evolved from a simple baseline to the final production-ready pipelines.

The **final selected models** are the **Logistic Regression (LR)** and **Random Forest (RF)** pipelines developed in `multiclass_analysis.ipynb`.


## 📑 Notebook Summaries

### 1. `baseline_model.ipynb`
- **Goal:** Create a simple benchmark for classification.
- **Modifications:**
  - Minimal preprocessing; used raw Kepler KOI features without heavy cleaning.
  - Included all available astrophysical and diagnostic features (e.g., `koi_fpflag_*`, `koi_score`).
- **Why:** Establish a “control” performance level for comparison with future models.
- **Interpretation of Results:**
  - Models achieved deceptively high accuracy due to **leakage-prone features** (like NASA’s own `fpflag` fields).
  - Highlighted the need to carefully filter features to avoid overfitting and trivial predictions.


### 2. `modified_model.ipynb`
- **Goal:** Improve on the baseline by removing leakage and refining preprocessing.
- **Modifications:**
  - **Dropped features:**  
    - NASA pipeline flags (`koi_fpflag_nt`, `koi_fpflag_ss`, `koi_fpflag_co`, `koi_fpflag_ec`) – they encode the label and cause leakage.  
    - Direct scoring features like `koi_score` – trivially correlated with disposition.
  - Applied **feature scaling** for models like Logistic Regression.
  - Performed **class balancing** experiments to reduce bias toward the dominant “False Positive” class.
- **Why:** Force the model to learn **real astrophysical patterns** (e.g., orbital period, depth, duration) rather than cheat with metadata.
- **Interpretation of Results:**
  - Performance dropped compared to the baseline (expected, since leakage features were removed).  
  - Provided a more **realistic estimate of generalization power**.


### 3. `multiclass_model.ipynb`
- **Goal:** Transition from binary to **multiclass classification** (`Confirmed`, `Candidate`, `False Positive`).
- **Modifications:**
  - Adapted pipelines to handle **3-class targets**.
  - Dropped the same leakage features as before.  
  - Added **cross-validation** and stratified sampling to ensure fair evaluation across imbalanced classes.
- **Why:** The real scientific use case requires distinguishing not just “planet vs not” but also between *candidates* and *confirmed planets*.
- **Interpretation of Results:**
  - Logistic Regression showed **interpretability** via coefficients but struggled with recall on minority classes.  
  - Random Forest performed better overall in multiclass setting, especially in handling nonlinear feature interactions.  
  - First signs that RF would be the stronger candidate for deployment.


### 4. `multiclass_analysis.ipynb`
- **Goal:** Perform in-depth evaluation and finalize models for production.
- **Modifications:**
  - Conducted **calibration analysis** to check probability reliability.
  - Inspected **feature importances** (RF) and **coefficients** (LR) to interpret what drives predictions:
    - Orbital period, transit depth, and stellar parameters were key discriminators.
  - Compared metrics across multiple thresholds (strict vs baseline).
  - Tuned Random Forest depth and leaf size to reduce overfitting.
- **Why:** Needed rigorous testing before selecting the final production pipelines.
- **Interpretation of Results:**
  - **Logistic Regression (LR):**
    - Pros: Transparent, interpretable coefficients.  
    - Cons: Struggles with complex nonlinear separations.  
  - **Random Forest (RF):**
    - Pros: Higher recall and balanced accuracy, robust to noise.  
    - Cons: Less interpretable, but feature importances still provide scientific insight.
  - **Final Decision:** Both LR and RF pipelines were selected:
    - **LR** → for transparency and interpretability.  
    - **RF** → for robustness and stronger predictive performance.


## Development Workflow

1. **Baseline:** Start with all features → identified leakage and inflated metrics.  
2. **Modified:** Drop leakage features, scale inputs → more realistic models.  
3. **Multiclass:** Move from binary → full NASA disposition classification.  
4. **Analysis:** Deep evaluation, calibration, interpretation → finalized LR and RF pipelines.  


## Final Takeaway

The **Logistic Regression** and **Random Forest** pipelines from `multiclass_analysis.ipynb` represent the **final, production-ready models** used in the Exoplanet Detector web application.  

Earlier notebooks serve as a record of the **iterative scientific process**: testing, refining, and justifying design decisions in a transparent and reproducible way.


