from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from .database import Base, engine
from .routes.inventory import router as inventory_router
from .routes.dashboard import router as dashboard_router
from .routes.insights import router as insights_router
from .routes.orders import router as orders_router

from . import models


Base.metadata.create_all(bind=engine)

# Additive SQLite migration for existing local demo databases.
with engine.begin() as connection:
    existing_tables = inspect(engine).get_table_names()
    if "restock_requests" in existing_tables:
        existing_columns = {
            column["name"]
            for column in inspect(engine).get_columns("restock_requests")
        }
        additions = {
            "decision_at": "DATETIME",
            "remind_at": "DATETIME",
            "do_not_remind": "BOOLEAN NOT NULL DEFAULT 0",
            "invoice_id": "VARCHAR",
            "invoice_total": "FLOAT",
            "reminder_sent_at": "DATETIME",
            "reminder_attempts": "INTEGER NOT NULL DEFAULT 0",
        }
        for column_name, column_type in additions.items():
            if column_name not in existing_columns:
                connection.execute(
                    text(
                        f"ALTER TABLE restock_requests "
                        f"ADD COLUMN {column_name} {column_type}"
                    )
                )


app = FastAPI(
    title="Paytm AI Business Copilot"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(inventory_router)
app.include_router(dashboard_router)
app.include_router(insights_router)
app.include_router(orders_router)


@app.get("/")
def root():
    return {
        "message": "Paytm AI Business Copilot API"
    }
