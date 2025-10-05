## ▶️ **Live App**
[**Open the App »**](https://nasa-exo-planets.vercel.app/)  
**https://nasa-exo-planets.vercel.app/**

# Exoplanet KOI DR25 Binary & Multiclass Study — Methods & Results (Detailed)

> **Objective (Binary):** Learn to predict the Kepler pipeline’s *triage decision*—whether a KOI is a **CANDIDATE (1)** or **FALSE POSITIVE (0)**—using astrophysical/diagnostic features **without** relying on pipeline meta-outputs that trivially encode the label.
>
> **Objective (Multiclass):** Predict the archive disposition **FALSE POSITIVE / CANDIDATE / CONFIRMED**, evaluate which features drive separability, and analyze the error structure.

---

## 1) Data, Targets, and Scientific Framing

### 1.1 Source and scope

* **Catalog:** Kepler KOI Q1–Q17 DR25 cumulative catalog.
* **Initial shape:** 8,054 rows × 153 columns (mixed numeric/string; includes flags, magnitudes, transit stats, stellar params, etc.).
* **Unit of analysis:** Each row is a KOI (a star + a detected periodic transit-like signal).

### 1.2 Disposition fields and what they mean

* **`koi_disposition`** (*archive/final*): {CONFIRMED, CANDIDATE, FALSE POSITIVE}. CONFIRMED typically incorporates **external** follow-up (RV, TTVs, validation).
* **`koi_pdisposition`** (*pipeline*): {CANDIDATE, FALSE POSITIVE}. This is the Kepler **pipeline-only** outcome (pre–final vetting).

### 1.3 Targets used

* **Binary target (primary):** `ExoplanetCandidate = 1` if `koi_pdisposition == CANDIDATE`, else `0`.

  * **Class balance:** 4,034 vs 4,020 (nearly 50/50).
  * **Scientific meaning:** We are modeling the **pipeline’s triage**, not astrophysical confirmation.
* **Multiclass target (secondary):** `koi_disposition ∈ {FALSE POSITIVE, CANDIDATE, CONFIRMED}`.

> **Why this matters:** High performance on the **binary** target means we can approximate the pipeline’s internal triage from astrophysical/diagnostic signals; it does **not** mean we are proving planets. High performance on the **multiclass** target demonstrates how well photometry-derived features separate FP/C/Conf—but may still lean on pipeline heuristics if such columns are included.

---

## 2) Preprocessing and Feature Space

### 2.1 Column vetting

* **Drop non-numeric identifiers / strings:** e.g., `kepler_name`, `kepoi_name`, delivery tags, coordinate strings.
* **Sanitize values:** Convert ±∞→NaN; ensure parsing of numerics.
* **Remove degenerate columns:** Drop all-NaN columns (24) and constant columns (5).

### 2.2 Missing data handling

* **Strategy:** Median imputation **inside** each model pipeline.
* **Rationale:** Keeps imputer fit within **training folds only** → avoids leakage from test/validation statistics.

### 2.3 Scaling

* **Applied to:** Linear/distance-based models (Logistic Regression, KNN) via `StandardScaler` **inside** the pipeline.
* **Not applied to:** Tree models (Decision Tree, Random Forest) where scaling is unnecessary.

### 2.4 Train/validation/test splits

* **Outer split:** 60% train / 40% test, **stratified** by the target.
* **Inner split:** From the training portion, 60/40 train/validation, **stratified**.
* **Procedure:** Select best model on validation; refit on full train; evaluate once on held-out test.

> **Justification:** Stratification preserves class ratios, reducing variance in metrics. Pipelines ensure preprocessing is confined to training-only statistics.

---

## 3) Metrics and Reporting Conventions

* **Accuracy** = (TP+TN)/N
* **Precision (positive class)** = TP/(TP+FP)
* **Recall (positive class)** = TP/(TP+FN)
* **F1** = 2·(Precision·Recall)/(Precision+Recall)
* **Confusion matrix (binary)** with label order [0,1]:
  [
  \begin{bmatrix}
  \text{TN} & \text{FP}\
  \text{FN} & \text{TP}
  \end{bmatrix}
  ]
* **Multiclass:** Per-class Precision/Recall/F1 + macro averages; 3×3 confusion matrix.

> **Why these metrics:** F1 balances precision/recall; confusion matrices make error modes explicit (e.g., Candidate→Confirmed confusions).

---

## 4) Baseline Binary Model — What Happened and Why It’s a Red Flag

### 4.1 Features included (leaky)

* All cleaned **numeric** features, including:

  * **`koi_fpflag_*`**: not-transit-like, stellar eclipse, centroid offset, ephemeris match (pipeline diagnostic flags).
  * **`koi_score`**: pipeline confidence.

### 4.2 Models trained

* Logistic Regression (LR), KNN, Decision Tree (DT), Random Forest (RF).

### 4.3 Observed performance (validation & test)

* **Validation:** LR F1 ≈ 0.998; RF/DT ≈ 0.992; KNN ≈ 0.94.
* **Held-out test (LR):** Acc/F1 ≈ 0.998, confusion matrix ~ (\begin{bmatrix}1607&1\5&1609\end{bmatrix}) over N=3,222.

### 4.4 Leakage diagnosis

* **Symptom:** Near-perfect performance is **implausible** if features do not encode the label.
* **Audit results:**

  * **`koi_fpflag_*`** are **decision-encoding** (they *are* the pipeline’s rejection reasons).
  * **`koi_score`** correlated with the label at **≈ 0.974**.

> **Interpretation:** The baseline learned to **replicate the pipeline’s decision** because it was given the pipeline’s **own decisions and confidence** as features.

---

## 5) Improved Binary Model v1 — Remove Pipeline Flags, Keep `koi_score`

### 5.1 Change

* Dropped all `koi_fpflag_*` features; **kept** `koi_score`.

### 5.2 Outcome

* Performance remained extremely high (LR F1 ≈ 0.985).

### 5.3 Interpretation

* **`koi_score` is sufficient** to proxy the pipeline decision.
* The model still “cheated” via a single high-leakage feature.

---

## 6) Improved Binary Model v2 — Remove Flags **and** `koi_score`

### 6.1 Change

* Remove **all** `koi_fpflag_*` **and** `koi_score`.
* Retain astrophysical/photometric/diagnostic features: transit depth/duration/SNR, centroid metrics (not the categorical flags), counts (# events), magnitudes, geometric ratios (e.g., `koi_ror`), etc.

### 6.2 Winner and performance (held-out test)

* **Winner:** Random Forest.
* **Accuracy/F1:** ≈ **0.919**.
* **Confusion matrix:** (\begin{bmatrix}1479&129\131&1483\end{bmatrix}).

### 6.3 What the model learned (Permutation Importance)

* **Centroid metrics** (e.g., `koi_dikco_msky`, `koi_dicco_msky`): detect **off-target** signal → classic FP indicator.
* **Transit strength/statistics** (e.g., `koi_model_snr`, `koi_num_transits`): stronger, repeatable signals more planet-like.
* **Geometry/size** (e.g., `koi_prad`, `koi_dor`, `koi_ror`): implausible sizes favor stellar eclipses; plausible ranges support planets.

### 6.4 Why this is scientifically credible

* The important features align with astrophysical expectations for separating **true transits** from **eclipsing binaries/contaminants**.
* No single proxy encodes the label; correlations drop to ~0.28–0.38 for top features post-cleanup.

> **Key takeaway:** After removing leakage, performance is strong but realistic; the RF is learning **physical cues**, not meta-labels.

---

## 7) Binary Diagnostics and Robustness Checks

### 7.1 Correlation scanning

* With `koi_score`: corr(target) ≈ **0.974** (smoking gun).
* Without it: top |corr| values ~**0.28–0.38** (typical for tabular science datasets).

### 7.2 Shuffle-label control

* Randomizing labels dropped performance toward chance (F1 ~0.5 for binary), indicating the real model extracts genuine signal.

### 7.3 Learning curves & CV stability (recommended and/or run)

* Train/validation curves converge with more data → healthy bias/variance.
* K-fold macro-F1 close to held-out test; modest stddev → stability.

### 7.4 Threshold tuning & calibration (operational choice)

* For **high recall** (don’t miss planets): lower threshold (e.g., 0.5) balances recall/precision.
* For **high precision** (avoid false confirmations): raise threshold (e.g., 0.7–0.8).
* **CalibratedClassifierCV**: aligns predicted probabilities with observed frequencies—useful for candidate triage lists.

---

## 8) Multiclass Extension — Results and Interpretation

### 8.1 Setup

* **Classes:** 0=FALSE POSITIVE (N=3,965), 1=CANDIDATE (N=1,360), 2=CONFIRMED (N=2,729).
* **Features:** 99–104 numeric after cleaning (in this run, **`koi_score` removed**, but **`koi_fpflag_*` kept** — see validity note).
* **Splits:** Stratified 60/40 train/test; imputation + scaling (for linear/distance models) in-pipeline.

### 8.2 Models & headline test metrics (N=3,222)

| Model                             |   Accuracy | Macro Precision | Macro Recall |   Macro F1 |
| --------------------------------- | ---------: | --------------: | -----------: | ---------: |
| Logistic Regression (multinomial) | **0.9097** |          0.8720 |   **0.8789** | **0.8745** |
| Random Forest (300, balanced)     |     0.9063 |      **0.8847** |       0.8439 |     0.8586 |
| Decision Tree (balanced)          |     0.8842 |          0.8419 |       0.8465 |     0.8441 |
| KNN (k=5, Manhattan)              |     0.8532 |          0.8115 |       0.7853 |     0.7909 |

* **Best overall:** Logistic Regression (Acc ~0.91, Macro-F1 ~0.875).

### 8.3 Class-wise (LR best model)

* **False Positive (n=1,586):** Precision 0.978, Recall 0.994, F1 0.986.
* **Candidate (n=544):** Precision 0.733, Recall 0.802, F1 0.766.
* **Confirmed (n=1,092):** Precision 0.905, Recall 0.842, F1 0.872.

### 8.4 Confusion matrix (rows=actual, cols=predicted, LR)

[
\begin{bmatrix}
1576 & 3 & 7\
19 & 436 & 89\
17 & 156 & 919
\end{bmatrix}
]

**Interpretation:**

* FP ↔ (C/Conf) confusion is minimal → **FPs are well separated**.
* The majority of errors are **Candidate ↔ Confirmed**, reflecting real-world ambiguity when only photometry is used.

### 8.5 Feature drivers (Permutation / Coefficients)

* **Strong drivers (LR coefs / RF importance):**

  * Pipeline flags `koi_fpflag_*` rank highly → capture diagnostic heuristics (e.g., centroid offset, not-transit-like, eclipsing-binary proxies).
  * Astrophysical signals also contribute: transit depth (`koi_depth`), impact parameter (`koi_impact`), magnitude bands, centroid metrics, # events (`koi_count`).

> **Validity note:** Unlike the binary “Improved v2” setting, this multiclass run **kept** `koi_fpflag_*`. Report this explicitly; for a purist “physics-only” claim, re-run multiclass **without** these flags and present an ablation table.

### 8.6 Generalization checks

* **Learning curves:** Macro-F1 rises smoothly; train/val curves approach each other.
* **Shuffled-label CV:** Macro-F1 ≈ 0.32 (near 1/3 chance) → models learn genuine structure.

---

## 9) Rationale

1. **Targeted the pipeline triage, not confirmation.**

   * *Why:* Closest to what can be predicted from Kepler photometry alone without external RV/TTV.
2. **Kept preprocessing inside pipelines.**

   * *Why:* Prevents leakage by ensuring imputation/scaling use **train-only** stats.
3. **Stratified splits and consistent label order.**

   * *Why:* Stable metrics; confusion matrices are interpretable and comparable.
4. **Leakage audit via correlations and domain heuristics.**

   * *Why:* Near-perfect metrics triggered inspection; removing `koi_fpflag_*` and `koi_score` enforced a fair test of astrophysical learning.
5. **Permutation importance for interpretability.**

   * *Why:* Confirms that post-cleanup, models key off **centroid**, **SNR**, **geometry**, **# events**—physically sensible.
6. **Threshold tuning & probability calibration.**

   * *Why:* Lets you optimize for science goals (high precision for follow-up triage vs high recall to avoid missed planets).

---

## 10) Error Anatomy & Subgroup Expectations

* **Candidate ↔ Confirmed** is the hardest boundary (photometry alone cannot guarantee confirmation without follow-up).
* **False Positives** are easier due to characteristic signatures (centroid shifts, odd-even depth, unrealistically large radius ratio, ephemeris matches to known binaries).
* **SNR dependence (expected):** Lower SNR regimes increase ambiguity; performance should degrade gracefully (recommend reporting per-SNR bins).
* **Magnitude dependence (expected):** Faint targets (e.g., high `koi_kmag`) have noisier light curves → more confusion.

> **Actionable check:** Add stratified reports (e.g., by SNR tertiles, magnitude bands, period bins) to show robustness across regimes.

---

## 11) Limitations & Caveats

* **Ground truth drift:** `koi_pdisposition` reflects pipeline-era knowledge; later reclassifications may occur.
* **Residual heuristics:** In multiclass runs that kept `koi_fpflag_*`, performance partially reflects pipeline heuristics.
* **Feature quality:** Some centroid/photometric diagnostics are themselves noisy; importance does not imply causality.
* **Selection effects:** KOIs are a pre-filtered set; results do not generalize to arbitrary light curves without a detection stage.

---

## 12) Practical Next Steps (with why)

1. **Ablation (multiclass):** Re-run without `koi_fpflag_*`; compare (a) with flags vs (b) physics-only.

   * *Why:* Quantify dependence on pipeline heuristics.
2. **Threshold policy:** Choose operating points that match mission goals (e.g., Confirmed precision ≥95%).

   * *Why:* Telescope time is costly; false confirmations are worse than missed candidates.
3. **Calibration:** Use `CalibratedClassifierCV` (isotonic or sigmoid) on RF.

   * *Why:* Trustworthy probability scores for triage lists.
4. **Model variants:** Try `HistGradientBoostingClassifier` (handles missing values natively; strong tabular baseline).

   * *Why:* Can outperform RF/LR on mixed-feature tabular problems.
5. **Interpretability:** Add SHAP for per-KOI explanations.

   * *Why:* Reviewer-facing, case-level insight.
6. **External check:** If feasible, test on a later KOI cut or mapped TESS slice.

   * *Why:* Demonstrate portability beyond DR25.

---

## 13) Reproducible Skeleton (pseudocode)

```python
# Load
X_raw = read_csv('dr25_koi.csv')

# Clean
X = drop_non_numeric_and_ids(X_raw)
X = replace_inf_with_nan(X)
X = drop_all_nan_and_constant_cols(X)

# Target
y_bin = (X_raw['koi_pdisposition'] == 'CANDIDATE').astype(int)

# Feature sets
FEATS_BASELINE = select_numeric_cols(X)  # includes koi_fpflag_* and koi_score
FEATS_IMP1 = FEATS_BASELINE.drop(columns=koi_fpflag_cols)  # keep koi_score
FEATS_IMP2 = FEATS_IMP1.drop(columns=['koi_score'])  # physics-only

# Split (stratified)
X_tr, X_te, y_tr, y_te = stratified_split(FEATS_IMP2, y_bin, test_size=0.4)
X_tr_in, X_va, y_tr_in, y_va = stratified_split(X_tr, y_tr, test_size=0.4)

# Pipelines
LR = Pipeline([
  ('imp', SimpleImputer(strategy='median')),
  ('sc', StandardScaler()),
  ('clf', LogisticRegression(max_iter=1000))
])
RF = Pipeline([
  ('imp', SimpleImputer(strategy='median')),
  ('clf', RandomForestClassifier(n_estimators=300, class_weight='balanced', random_state=42))
])

# Train/validate, pick winner, refit on full train, evaluate on test
```

---

## 14) Summary Tables (Binary regimes)

| Regime         | Features included                               | Winner | Held-out F1 | Notes                              |
| -------------- | ----------------------------------------------- | ------ | ----------: | ---------------------------------- |
| Baseline       | All numeric (incl. `koi_fpflag_*`, `koi_score`) | LR     |      ~0.998 | Severe leakage via flags/score     |
| Improved-1     | Drop `koi_fpflag_*`                             | LR     |      ~0.985 | Still leakage via `koi_score`      |
| **Improved-2** | Drop `koi_fpflag_*` + `koi_score`               | **RF** |  **~0.919** | Physics/diagnostics drive learning |

---

## 15) “How to Read the Numbers” (for non-ML readers)

* **If you want to catch almost all *real* planets (high recall):** Use a **lower** threshold (e.g., 0.5). You’ll see more candidates flagged as planet-like, with some false alarms.
* **If you want to avoid false confirmations (high precision):** Use a **higher** threshold (e.g., 0.7–0.8). You’ll miss some real planets, but nearly everything you call “confirmed-like” will be correct.
* **Why we trust the model now:** After removing pipeline meta-features, the model uses cues astronomers use—**centroid offset**, **signal strength**, **geometric plausibility**, **repeatability**—and passes sanity checks (learning curves, shuffled-label control).

---

## 16) One-Paragraph Abstract (Binary)

We trained machine-learning classifiers to reproduce the Kepler pipeline’s binary triage of transit signals (CANDIDATE vs FALSE POSITIVE) using the DR25 KOI catalog (n=8,054). A baseline that included the KOI false-positive flags and the pipeline confidence score (`koi_score`) achieved near-perfect performance on a held-out test set (F1≈0.998), indicating label leakage. After removing the four false-positive flags and `koi_score`, a Random Forest trained on astrophysical and diagnostic features achieved F1≈0.919. Diagnostics (correlations, permutation importance) showed the model relies on centroid offset metrics, transit SNR, number of observed transits, and geometric/size features—consistent with astrophysical expectations for distinguishing genuine planetary transits from eclipsing binaries and contaminated signals. These results demonstrate robust emulation of the pipeline’s triage using physically meaningful features, while highlighting the importance of leakage control when modeling catalog dispositions.

---

## 17) One-Paragraph Summary (Multiclass)

On a 3-class task (FALSE POSITIVE, CANDIDATE, CONFIRMED), a multinomial Logistic Regression achieves ~0.91 accuracy and ~0.87 macro-F1 on a held-out test set. Most confusion is between CANDIDATE and CONFIRMED, reflecting the scientific gray zone where photometry alone is inconclusive. Permutation/coef analyses show pipeline diagnostic flags (if included) and astrophysical features (depth, impact parameter, centroid metrics, magnitudes, # events) drive performance. A shuffled-label control collapses to chance-level macro-F1 (~0.33), confirming genuine generalization. We recommend an ablation that removes `koi_fpflag_*` to quantify physics-only predictivity.

---

## 18) Reviewer Q&A (Quick Answers)

* **Q:** Why not use `koi_score` if it’s predictive?

  * **A:** It encodes the pipeline’s own verdict; including it reduces the exercise to copying the pipeline rather than learning astrophysical cues.
* **Q:** How do you know you didn’t leak information?

  * **A:** Preprocessing is inside pipelines; correlations checked; flags/score removed; shuffled-label baseline drops to chance.
* **Q:** Why is CANDIDATE vs CONFIRMED hard?

  * **A:** Photometry cannot definitively confirm planet mass/radius without external validation (RV/TTV). Ambiguity is expected.
* **Q:** Are results sensitive to class imbalance?

  * **A:** Classes are moderately imbalanced; we used stratification and (where appropriate) class weights. Macro metrics are reported.
