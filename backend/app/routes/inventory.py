from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Header
from datetime import datetime, timedelta
import os
import secrets

from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

from ..schemas import InventoryItem
from ..schemas import RestockRequest
from ..schemas import RestockResponse
from ..schemas import RestockRequestRecord
from ..schemas import RestockDecision
from ..schemas import RestockDecisionResponse
from ..schemas import DueReminder
from ..schemas import ReminderSentResponse


router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventory"]
)


# ==========================================
# GET INVENTORY
# ==========================================

@router.get(
    "",
    response_model=list[InventoryItem]
)
def get_inventory(
    db: Session = Depends(get_db)
):

    products = (
        db.query(models.Product)
        .order_by(models.Product.id)
        .all()
    )

    return [
        {
            "id": product.id,

            "name": product.name,

            "category": product.category,

            "price": product.price,

            "stock": product.stock,

            "min_stock": product.min_stock,

            "max_stock": product.max_stock,

            "supplier": product.supplier,

            "sales_7d": product.sales_7d or 0,

            "sales_30d": product.sales_30d or 0,

            "status": (
                "LOW"
                if product.stock <= product.min_stock

                else "OVERSTOCK"
                if product.stock >= product.max_stock

                else "HEALTHY"
            )
        }

        for product in products
    ]


# ==========================================
# CREATE RESTOCK
# ==========================================

@router.post(
    "/restock",
    response_model=RestockResponse
)
def create_restock_order(
    data: RestockRequest,

    db: Session = Depends(get_db)
):

    if data.quantity <= 0:

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )


    product = (
        db.query(models.Product)

        .filter(
            models.Product.id == data.product_id
        )

        .first()
    )


    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )


    request = models.RestockRequest(
        product_id=product.id,
        quantity=data.quantity,
        status="PENDING"
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    return {

        "id": request.id,

        "success": True,

        "message": (
            f"Restock order created for "
            f"{product.name}"
        ),

        "product": product.name,

        "quantity": data.quantity,

        "supplier": product.supplier,

        "status": request.status,

        "created_at": request.created_at.isoformat()
    }


@router.get(
    "/restock-requests",
    response_model=list[RestockRequestRecord]
)
def get_restock_requests(
    db: Session = Depends(get_db)
):
    requests = (
        db.query(models.RestockRequest, models.Product)
        .join(models.Product, models.RestockRequest.product_id == models.Product.id)
        .order_by(models.RestockRequest.created_at.desc())
        .all()
    )

    return [
        {
            "id": request.id,
            "product_id": request.product_id,
            "product": product.name,
            "quantity": request.quantity,
            "supplier": product.supplier,
            "status": request.status,
            "created_at": request.created_at.isoformat(),
            "decision_at": request.decision_at.isoformat() if request.decision_at else None,
            "remind_at": request.remind_at.isoformat() if request.remind_at else None,
            "do_not_remind": request.do_not_remind,
            "reminder_due": bool(
                request.remind_at
                and request.remind_at <= datetime.utcnow()
                and request.status == "REJECTED"
                and not request.do_not_remind
                and request.reminder_sent_at is None
            ),
            "invoice_id": request.invoice_id,
            "invoice_total": request.invoice_total,
            "reminder_sent_at": request.reminder_sent_at.isoformat() if request.reminder_sent_at else None,
            "reminder_attempts": request.reminder_attempts or 0,
        }
        for request, product in requests
    ]


@router.get("/reminders/due", response_model=list[DueReminder])
def get_due_reminders(db: Session = Depends(get_db)):
    """Return rejected requests due for a reminder that have not been sent."""
    due = (
        db.query(models.RestockRequest, models.Product)
        .join(models.Product, models.RestockRequest.product_id == models.Product.id)
        .filter(
            models.RestockRequest.status == "REJECTED",
            models.RestockRequest.do_not_remind.is_(False),
            models.RestockRequest.remind_at.is_not(None),
            models.RestockRequest.remind_at <= datetime.utcnow(),
            models.RestockRequest.reminder_sent_at.is_(None),
        )
        .order_by(models.RestockRequest.remind_at.asc())
        .all()
    )
    return [
        {
            "id": request.id,
            "product_id": request.product_id,
            "product": product.name,
            "quantity": request.quantity,
            "supplier": product.supplier,
            "status": request.status,
            "remind_at": request.remind_at.isoformat(),
            "reminder_attempts": request.reminder_attempts or 0,
        }
        for request, product in due
    ]


@router.post(
    "/restock-requests/{request_id}/reminder-sent",
    response_model=ReminderSentResponse,
)
def mark_reminder_sent(
    request_id: int,
    db: Session = Depends(get_db),
    x_api_key: str | None = Header(default=None),
):
    configured_key = os.getenv("N8N_API_KEY")
    if configured_key and not secrets.compare_digest(x_api_key or "", configured_key):
        raise HTTPException(status_code=401, detail="Invalid n8n API key")

    request = (
        db.query(models.RestockRequest)
        .filter(models.RestockRequest.id == request_id)
        .first()
    )
    if not request:
        raise HTTPException(status_code=404, detail="Restock request not found")
    if request.status != "REJECTED" or request.do_not_remind or not request.remind_at:
        raise HTTPException(status_code=409, detail="This request has no scheduled reminder")
    if request.remind_at > datetime.utcnow():
        raise HTTPException(status_code=409, detail="Reminder is not due yet")
    if request.reminder_sent_at:
        raise HTTPException(status_code=409, detail="Reminder was already marked as sent")

    now = datetime.utcnow()
    request.reminder_sent_at = now
    request.reminder_attempts = (request.reminder_attempts or 0) + 1
    db.commit()
    return {
        "success": True,
        "id": request.id,
        "reminder_sent_at": now.isoformat(),
        "message": "Reminder delivery recorded.",
    }


@router.post(
    "/restock-requests/{request_id}/decision",
    response_model=RestockDecisionResponse
)
def decide_restock_request(
    request_id: int,
    data: RestockDecision,
    db: Session = Depends(get_db),
):
    request = (
        db.query(models.RestockRequest)
        .filter(models.RestockRequest.id == request_id)
        .first()
    )
    if not request:
        raise HTTPException(status_code=404, detail="Restock request not found")
    if request.status != "PENDING":
        raise HTTPException(status_code=409, detail="This request has already been decided")

    product = (
        db.query(models.Product)
        .filter(models.Product.id == request.product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    now = datetime.utcnow()
    request.decision_at = now
    if data.action == "approve":
        request.status = "APPROVED"
        request.invoice_id = f"INV-R{request.id}-{now.strftime('%Y%m%d%H%M%S')}"
        # Demo estimate: product.price is used because supplier cost is not in the seed data.
        request.invoice_total = round(request.quantity * product.price, 2)
        message = "Restock approved and supplier invoice generated. Stock will change when delivery is received."
    else:
        if data.do_not_remind:
            request.status = "REJECTED"
            request.do_not_remind = True
            request.remind_at = None
            message = "Restock rejected. Reminders are turned off."
        else:
            if data.remind_after_days is None or not 1 <= data.remind_after_days <= 30:
                raise HTTPException(
                    status_code=422,
                    detail="Choose a reminder interval from 1 to 30 days, or turn reminders off.",
                )
            request.status = "REJECTED"
            request.do_not_remind = False
            request.remind_at = now + timedelta(days=data.remind_after_days)
            message = f"Restock rejected. A reminder is scheduled in {data.remind_after_days} days."

    db.commit()
    db.refresh(request)
    return {
        "success": True,
        "id": request.id,
        "product": product.name,
        "quantity": request.quantity,
        "supplier": product.supplier,
        "status": request.status,
        "decision_at": request.decision_at.isoformat(),
        "remind_at": request.remind_at.isoformat() if request.remind_at else None,
        "do_not_remind": request.do_not_remind,
        "invoice_id": request.invoice_id,
        "invoice_total": request.invoice_total,
        "message": message,
    }
