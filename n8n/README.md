# Restock reminder workflow

`restock-reminder.workflow.json` is an importable n8n workflow. It checks for due rejected restock requests every minute, sends an email, then records the delivery with the backend. Failed email sends do not reach the mark-sent step, so the next schedule run retries them.

## Configure n8n

1. In n8n, choose **Workflows → Import from File** and select `restock-reminder.workflow.json`.
2. Open **Send reminder email** and create/select an SMTP credential. Replace `merchant-copilot@example.com` and `merchant@example.com` with your sender and merchant recipient addresses.
3. The default backend URL is `http://host.docker.internal:8002`, for n8n running in Docker while this project runs on the host. For n8n running directly on the same machine, use `http://127.0.0.1:8002`. For another host, use a URL reachable by n8n.
4. If `N8N_API_KEY` is set for the backend, add an `X-API-Key` header with the same value to the **Record successful delivery** HTTP Request node. Leave the backend key unset for a local-only demo.
5. Use **Execute workflow** to test, then activate the workflow to poll every minute.

## Test a reminder

Reject a restock request with a reminder interval, then set its `remind_at` field to a past timestamp in the local SQLite database. The due endpoint should return it:

```sh
curl http://127.0.0.1:8002/api/inventory/reminders/due
```

After n8n sends the email, the workflow calls the `reminder-sent` endpoint. The request should then disappear from the due endpoint and show a `reminder_sent_at` timestamp in `GET /api/inventory/restock-requests`.

## Local project setup

Run the API on port `8002` if using the workflow defaults:

```sh
cd backend
../.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

If you change the API port, update both HTTP Request node URLs in the workflow.
