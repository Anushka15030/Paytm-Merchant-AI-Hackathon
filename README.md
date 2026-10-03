# Paytm-Merchant-AI-Hackathon
# Configure Gemini for WhatsApp order chat

The WhatsApp order demo uses Gemini to interpret customer messages and draft replies. The backend validates the selected product and quantity against the live inventory before creating an order. Payments remain simulated.

1. From `backend/`, copy `.env.example` to `.env`.
2. Replace `your_key_here` with your Gemini API key. Keep `.env` private and out of version control.
3. Install backend dependencies with `pip install -r requirements.txt`.
4. Restart the FastAPI server. The chat will show a configuration message until a valid key is set.

`GEMINI_MODEL` defaults to `gemini-3.8-flash` and can be changed in `backend/.env`.

# Merchant chat

The `/chat` page uses Sarvam to answer questions from current inventory, sales, and order records. Set `SARVAM_API_KEY` in `backend/.env`, install backend requirements, and restart FastAPI. Cognee remains disabled; its provider scaffold is retained for later work.
