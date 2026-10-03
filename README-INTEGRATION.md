# Merchant Copilot — Frontend + Python Backend

This bundle contains the React frontend and the FastAPI backend with its included SQLite database. Installed dependencies and temporary files are excluded.

## Start the backend

From the `backend` directory, install Python dependencies and start the API on port 8001:

```sh
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

On Windows, activate the environment with `.venv\Scripts\activate` instead. The included `merchant.db` already contains the sample records. `seed.py` drops and recreates the database; run it only if you intentionally want to reset that data.

## Start the frontend

In a second terminal, from the `frontend` directory:

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5181
```

Open the local URL printed by Vite. Its development proxy forwards `/api` and `/invoice` requests to `http://127.0.0.1:8001`.

## Connected backend features

- Dashboard summary and inventory charts
- Inventory list and restock request endpoint
- Stock and overstock insights
- Invoice generation and preview
- Merchant chat grounded in current product, inventory, sales, and order records

## Merchant chat

Open `/chat` and set `SARVAM_API_KEY` in `backend/.env`. Install the updated backend requirements and restart FastAPI. The key stays server-side. Chat keeps up to eight recent turns in the browser and applies a per-IP request limit. Cognee memory remains disabled; the no-op provider and adapter are scaffolding only until authentication and tenant-scoped data are developed.

For local development, the project’s alternate Vite config uses port `5182` and proxies API calls to backend port `8002`.

The backend's sales summary is currently returned as fixed values by its dashboard route. The category chart estimates sales from units sold and current product prices. The restock endpoint currently returns an acknowledgement without persisting a restock record or changing stock.
