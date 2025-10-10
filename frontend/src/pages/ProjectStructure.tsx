import './ProjectStructure.css';

const ProjectStructure = () => {
  return (
    <div className="page-container">
      <div className="page-content">
        <header className="page-header">
          <h1>Project Structure</h1>
          <p className="page-subtitle">Understanding our NASA exoplanet detection system</p>
        </header>

        <section className="content-section">
          <h2>Project Overview</h2>
          <p>
            This project uses machine learning to analyze Kepler Space Telescope data and classify 
            potential exoplanets. We built models that can distinguish between real planetary transit 
            signals and false positives with over 91% accuracy.
          </p>
          <div className="overview-stats">
            <div className="stat-card">
              <h3>8,054</h3>
              <p>KOI Objects Analyzed</p>
            </div>
            <div className="stat-card">
              <h3>91.9%</h3>
              <p>Model Accuracy</p>
            </div>
            <div className="stat-card">
              <h3>153</h3>
              <p>Original Features</p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>Folder Structure</h2>
          <div className="folder-structure">
            <div className="folder-item">
              <h3>📁 backend/</h3>
              <p>Flask API server for serving ML predictions</p>
              <ul>
                <li><code>app.py</code> - Main Flask application</li>
                <li><code>utils.py</code> - Helper functions and data processing</li>
                <li><code>models/</code> - Trained ML models (Random Forest, Logistic Regression)</li>
              </ul>
            </div>

            <div className="folder-item">
              <h3>📁 data/</h3>
              <p>Raw datasets and data documentation</p>
              <ul>
                <li><code>raw/exoplanets_2025.csv</code> - Kepler KOI DR25 dataset (8,054 objects)</li>
                <li><code>raw/columns_meaning.csv</code> - Feature descriptions and meanings</li>
              </ul>
            </div>

            <div className="folder-item">
              <h3>📁 frontend/</h3>
              <p>React web application for user interface</p>
              <ul>
                <li><code>src/</code> - React components and pages</li>
                <li><code>public/</code> - Static assets</li>
                <li><code>package.json</code> - Dependencies and scripts</li>
              </ul>
            </div>

            <div className="folder-item">
              <h3>📁 notebooks/</h3>
              <p>Jupyter notebooks for data analysis and model training</p>
              <ul>
                <li><code>preprocessing.ipynb</code> - Data cleaning and feature engineering</li>
                <li><code>baseline_model.ipynb</code> - Initial model with pipeline features</li>
                <li><code>modified_model.ipynb</code> - Improved model without leakage</li>
                <li><code>multiclass_analysis.ipynb</code> - 3-class classification analysis</li>
              </ul>
            </div>

            <div className="folder-item">
              <h3>📁 results/</h3>
              <p>Model outputs, metrics, and evaluation results</p>
              <ul>
                <li><code>model_comparison_metrics.csv</code> - Performance comparisons</li>
                <li><code>confusion_matrix_improved.csv</code> - Classification results</li>
                <li><code>validation_results_improved.csv</code> - Validation metrics</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>Our Methodology</h2>
          <div className="methodology-grid">
            <div className="method-step">
              <div className="step-number">1</div>
              <h3>Data Collection</h3>
              <p>Started with Kepler KOI DR25 dataset containing 8,054 objects with 153 features including transit parameters, stellar properties, and pipeline diagnostics.</p>
            </div>

            <div className="method-step">
              <div className="step-number">2</div>
              <h3>Data Preprocessing</h3>
              <p>Cleaned data by removing non-numeric identifiers, handling missing values with median imputation, and dropping constant or all-NaN columns.</p>
            </div>

            <div className="method-step">
              <div className="step-number">3</div>
              <h3>Feature Engineering</h3>
              <p>Removed pipeline meta-features to prevent data leakage, focusing on astrophysical signals like transit depth, duration, and centroid metrics.</p>
            </div>

            <div className="method-step">
              <div className="step-number">4</div>
              <h3>Model Training</h3>
              <p>Trained multiple models (Random Forest, Logistic Regression, Decision Tree, KNN) using stratified cross-validation and pipeline-based preprocessing.</p>
            </div>

            <div className="method-step">
              <div className="step-number">5</div>
              <h3>Evaluation</h3>
              <p>Selected Random Forest as the best performer with 91.9% accuracy on held-out test data, validated using confusion matrices and feature importance.</p>
            </div>

            <div className="method-step">
              <div className="step-number">6</div>
              <h3>Deployment</h3>
              <p>Created Flask API and React frontend for interactive predictions, allowing users to explore the model's capabilities in real-time.</p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>Key Features Our Model Uses</h2>
          <div className="features-grid">
            <div className="feature-category">
              <h3>🎯 Centroid Metrics</h3>
              <p>Detect off-target signals that indicate false positives from nearby eclipsing binaries or background stars.</p>
              <code>koi_dikco_msky, koi_dicco_msky</code>
            </div>

            <div className="feature-category">
              <h3>📊 Transit Strength</h3>
              <p>Signal-to-noise ratio and number of observed transits help distinguish genuine planetary signals from noise.</p>
              <code>koi_model_snr, koi_num_transits</code>
            </div>

            <div className="feature-category">
              <h3>📏 Geometric Properties</h3>
              <p>Planet radius, orbital parameters, and stellar radius ratios reveal physically plausible vs. impossible configurations.</p>
              <code>koi_prad, koi_dor, koi_ror</code>
            </div>

            <div className="feature-category">
              <h3>✨ Stellar Properties</h3>
              <p>Host star characteristics including magnitude and effective temperature provide context for planet detectability.</p>
              <code>koi_kmag, koi_teff</code>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>Model Performance</h2>
          <div className="performance-summary">
            <h3>Binary Classification Results</h3>
            <p>Distinguishing between CANDIDATE and FALSE POSITIVE classifications:</p>
            
            <div className="performance-metrics">
              <div className="metric">
                <h4>Accuracy</h4>
                <span className="metric-value">91.9%</span>
              </div>
              <div className="metric">
                <h4>Precision</h4>
                <span className="metric-value">91.8%</span>
              </div>
              <div className="metric">
                <h4>Recall</h4>
                <span className="metric-value">91.9%</span>
              </div>
              <div className="metric">
                <h4>F1-Score</h4>
                <span className="metric-value">91.9%</span>
              </div>
            </div>

            <div className="confusion-note">
              <p><strong>Confusion Matrix:</strong> Out of 3,222 test samples, our model correctly classified 2,962 objects with only 260 misclassifications.</p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <h2>Scientific Impact</h2>
          <p>
            Our approach demonstrates that machine learning can effectively replicate the Kepler pipeline's 
            decision-making process using only astrophysical features, without relying on pipeline 
            meta-outputs. This has important implications for:
          </p>
          <ul className="impact-list">
            <li>Automated screening of future transit surveys (TESS, PLATO)</li>
            <li>Reducing manual review time for astronomers</li>
            <li>Improving detection of Earth-like planets in habitable zones</li>
            <li>Understanding which physical properties best distinguish real planets from false positives</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ProjectStructure;