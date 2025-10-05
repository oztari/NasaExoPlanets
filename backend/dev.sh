#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# 1) Create venv if missing
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv .venv
fi

# 2) Activate and make sure pip exists
# shellcheck source=/dev/null
source .venv/bin/activate
python3 -m ensurepip --upgrade >/dev/null 2>&1 || true
python3 -m pip install --upgrade pip wheel setuptools

# 3) Install dependencies
echo "Installing dependencies..."
if [ -f "requirements.txt" ]; then
  python3 -m pip install -r requirements.txt
else
  # fallback if no requirements file
  python3 -m pip install fastapi "uvicorn[standard]" pandas numpy scikit-learn joblib pydantic
fi

# 3b) Always ensure critical packages exist (self-healing)
python3 - <<'EOF'
import importlib, subprocess, sys
# map pip package names to importable module names
needed = {
    "fastapi": "fastapi",
    "uvicorn[standard]": "uvicorn",
    "pandas": "pandas",
    "numpy": "numpy",
    "scikit-learn": "sklearn",
    "joblib": "joblib",
    "pydantic": "pydantic",
}
for pip_name, module_name in needed.items():
    try:
        importlib.import_module(module_name)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name])
EOF

# 4) Run the server
echo ""
echo " ----------------------------------------"
current_port=8000
while lsof -i :$current_port -sTCP:LISTEN -t >/dev/null ; do
  current_port=$((current_port + 1))
done

echo "✅ Starting API on: http://127.0.0.1:$current_port"
echo "Docs: http://127.0.0.1:$current_port/docs"
echo " ----------------------------------------"

echo "Press CTRL+C to stop."
exec python3 -m uvicorn app:app --reload --port "$current_port"
