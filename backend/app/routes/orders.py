import json
import logging
import os
import re
from datetime import datetime
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ValidationError
from pydantic import Field
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

from .. import models
from ..database import get_db

router = APIRouter(
    tags=["Orders"]
)
logger = logging.getLogger(__name__)


class InvoiceRequest(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float
    supplier: str


class DemoMessageRequest(BaseModel):
    message: str
    customer_id: str = Field(default="demo-customer", alias="customerId")
    customer_name: Optional[str] = "Demo Customer"
    customer_phone: Optional[str] = None


class GeminiOrderInterpretation(BaseModel):
    intent: Literal["place_order", "ask_clarification", "not_an_order"]
    product_id: int = 0
    quantity: int = 0
    reply: str = ""
    summary: str = ""


def _interpret_with_gemini(message: str, products: list[models.Product]) -> GeminiOrderInterpretation:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise HTTPException(status_code=503, detail="Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend.")

    catalog = [{"id": p.id, "name": p.name, "category": p.category, "price": p.price, "stock": p.stock} for p in products]
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    prompt = f"""You are the ordering assistant for a small Indian shop. Understand the customer's latest message and respond naturally and briefly in the language they used (Hindi/Hinglish or English).
Choose only product IDs from this catalog: {json.dumps(catalog, ensure_ascii=False)}
Rules:
- Use intent place_order only for a clear request for exactly one catalog product.
- Use ask_clarification for unclear product, missing details, multiple items, or quantity ambiguity.
- Use not_an_order for unrelated requests.
- Set product_id to 0 unless a single catalog product is clearly identified.
- Set quantity to the number requested, default to 1 only when omitted. Do not invent catalog details.
- Do not claim an order is confirmed or paid. Payment is handled separately.
- reply is the customer-facing answer. summary is a concise internal order interpretation.
Customer message: {message!r}"""
    try:
        client = genai.Client(api_key=api_key)
        chat = client.chats.create(
            model=model_name,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiOrderInterpretation,
                temperature=0.2,
                max_output_tokens=256,
            ),
        )
        response = chat.send_message(prompt)
        # Prefer the SDK's schema-parsed value; fall back to validating the JSON
        # text for SDK versions that do not populate response.parsed.
        parsed = response.parsed
        if isinstance(parsed, GeminiOrderInterpretation):
            return parsed
        if isinstance(parsed, dict):
            return GeminiOrderInterpretation.model_validate(parsed)
        if not response.text:
            raise ValueError("Gemini returned an empty response")
        return GeminiOrderInterpretation.model_validate_json(response.text)
    except HTTPException:
        raise
    except ValidationError as error:
        logger.error(
            "Gemini response validation failed for model %s: %s",
            model_name,
            error.errors(include_input=False),
        )
        raise HTTPException(status_code=502, detail="Gemini returned an unexpected reply. Please try again.") from error
    except Exception as error:
        # Log diagnostic metadata only; provider messages may contain request data.
        logger.error(
            "Gemini request failed for model %s: %s (code=%s, status=%s)",
            model_name,
            type(error).__name__,
            getattr(error, "code", None),
            getattr(error, "status_code", None),
        )
        if getattr(error, "code", None) == 404:
            raise HTTPException(
                status_code=502,
                detail="Gemini could not find the configured model. Check GEMINI_MODEL in backend/.env; use a model available to your Gemini API key.",
            ) from error
        raise HTTPException(status_code=502, detail="Gemini could not process that message. Please try again.") from error


_ORDER_WORDS = {
    "bhai", "please", "plz", "bhej", "bhejo", "bhejdo", "bhejdena", "dena", "do", "de",
    "chahiye", "order", "mujhe", "ek", "aur", "send", "give", "me", "want", "need",
    "kindly", "pack", "packet",
}
_PRODUCT_SYNONYMS = {
    "doodh": "milk",
    "coca": "coke",
    "cola": "coke",
}
_SIZE_WORDS = {"ml", "l", "kg", "g", "gm", "gram", "grams", "litre", "liter", "litres", "liters"}


def _normalized_words(value: str) -> set[str]:
    cleaned = re.sub(r"\b\d+\s*(?:ml|l|kg|g|gm|gram|grams|litres?|liters?)\b", " ", value.lower())
    words = re.findall(r"[a-z]+", cleaned)
    return {
        _PRODUCT_SYNONYMS.get(word, word)
        for word in words
        if word not in _ORDER_WORDS and word not in _SIZE_WORDS
    }


def _extract_quantity(message: str) -> int:
    for match in re.finditer(r"\b(\d+)\b", message.lower()):
        following = message[match.end():].lstrip().lower()
        if re.match(r"(?:ml|l|kg|g|gm|grams?)\b", following):
            continue
        return int(match.group(1))
    return 1


def _fallback_parse_order(message: str, products: list[models.Product]) -> GeminiOrderInterpretation:
    """Deterministically match the message to existing catalog names and aliases."""
    quantity = _extract_quantity(message)
    request_words = _normalized_words(message)
    matches: list[tuple[int, models.Product]] = []
    for product in products:
        product_words = _normalized_words(product.name)
        overlap = request_words & product_words
        if overlap:
            # Prefer the candidate matching the most distinctive requested words.
            matches.append((len(overlap), product))

    if not matches:
        logger.warning("Product not found: %s", " ".join(sorted(request_words)) or "(empty message)")
        return GeminiOrderInterpretation(
            intent="ask_clarification",
            reply="Sorry bhai, ye product mujhe nahi mila. Please try another product.",
            summary="No matching product was found in the current inventory.",
        )

    matches.sort(key=lambda item: (-item[0], item[1].id))
    product = matches[0][1]
    logger.info("Fallback parser detected: %s x %s", product.name, quantity)
    return GeminiOrderInterpretation(
        intent="place_order",
        product_id=product.id,
        quantity=quantity,
        reply=f"Bhai 👍 {quantity} × {product.name} ka order ready hai. Payment ke baad order confirm hoga.",
        summary=f"Customer wants {quantity} × {product.name}.",
    )


def _payload(order: models.Order, product: models.Product) -> dict:
    return {"orderId": order.public_code, "customerId": order.customer_name, "customerPhone": order.customer_phone,
            "customerMessage": order.customer_message, "productId": product.id, "product": product.name,
            "quantity": order.quantity, "unitPrice": order.unit_price, "amount": order.total_amount,
            "status": order.status, "paymentStatus": order.payment_status,
            "paymentUrl": f"/mock-payment/{order.public_code}", "invoiceId": order.invoice_id,
            "createdAt": order.created_at.isoformat() if order.created_at else None,
            "paidAt": order.paid_at.isoformat() if order.paid_at else None, "stockAfter": product.stock}


@router.post("/api/whatsapp/message")
def receive_demo_message(data: DemoMessageRequest, db: Session = Depends(get_db)):
    products = db.query(models.Product).order_by(models.Product.id).all()
    try:
        interpretation = _interpret_with_gemini(data.message, products)
        logger.info("Gemini order parsing successful")
    except Exception as error:
        # Gemini availability must not prevent supported demo orders.
        cause = error.__cause__ or error
        logger.warning(
            "Gemini unavailable, using fallback parser: %s (code=%s, status=%s)",
            type(cause).__name__,
            getattr(cause, "code", getattr(cause, "status_code", None)),
            getattr(cause, "status_code", None),
        )
        interpretation = _fallback_parse_order(data.message, products)
    product_by_id = {product.id: product for product in products}
    product = product_by_id.get(interpretation.product_id)
    if interpretation.intent != "place_order" or not product:
        return {"success": False, "reply": interpretation.reply or "Sorry bhai, ye product mujhe nahi mila. Please try another product.", "aiSummary": {"text": interpretation.summary}}
    quantity = interpretation.quantity
    if quantity < 1 or quantity > 100:
        return {"success": False, "reply": "Please choose a quantity from 1 to 100.", "aiSummary": {"text": "Requested quantity is outside the supported range."}}
    if product.stock < quantity:
        return {"success": False, "reply": f"Only {product.stock} units of {product.name} are currently in stock. How many would you like?", "aiSummary": {"text": f"Requested {quantity} × {product.name}, but only {product.stock} are available."}}
    total = round(float(product.price) * quantity, 2)
    order = models.Order(customer_name=data.customer_name or data.customer_id, customer_phone=data.customer_phone,
                         total_amount=total, status="PENDING", payment_status="PENDING", product_id=product.id,
                         quantity=quantity, unit_price=product.price, customer_message=data.message, source="MOCK_WHATSAPP")
    db.add(order); db.flush(); order.public_code = f"ORD-{order.id + 1000:04d}"; db.commit(); db.refresh(order)
    return {**_payload(order, product), "success": True,
            "aiSummary": {"intent": "Place an order", "product": product.name, "quantity": quantity,
                          "availableStock": product.stock, "total": total,
                          "text": interpretation.summary or f"Customer wants {quantity} × {product.name}. {product.stock} currently in stock; order total is ₹{total:g}."},
            "reply": interpretation.reply}


@router.get("/api/orders/{order_code}")
def get_demo_order(order_code: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.public_code == order_code).first()
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Order product not found")
    return _payload(order, product)


@router.post("/api/payment/mock/{order_code}")
def complete_mock_payment(order_code: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.public_code == order_code).first()
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Order product not found")
    if order.status != "PAID":
        if product.stock < order.quantity: raise HTTPException(status_code=409, detail="There is not enough stock to complete this order.")
        now = datetime.utcnow(); product.stock -= order.quantity
        product.sales_7d = (product.sales_7d or 0) + order.quantity; product.sales_30d = (product.sales_30d or 0) + order.quantity
        db.add(models.Sale(product_id=product.id, quantity=order.quantity, amount=order.total_amount, created_at=now))
        order.status = "PAID"; order.payment_status = "SUCCESS"; order.paid_at = now; order.invoice_id = f"INV-{order.public_code}"
        db.commit(); db.refresh(order); db.refresh(product)
    return {"success": True, "demo": True, "message": "Demo payment successful.", **_payload(order, product)}


@router.get("/api/orders/{order_code}/invoice")
def get_demo_invoice(order_code: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.public_code == order_code).first()
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "PAID" or order.payment_status != "SUCCESS": raise HTTPException(status_code=409, detail="Invoice is available after payment is complete.")
    product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
    return {"invoiceId": order.invoice_id, "storeName": "Sharma General Store", "orderId": order.public_code,
            "customerName": order.customer_name or "Demo Customer", "customerPhone": order.customer_phone,
            "product": product.name, "quantity": order.quantity, "unitPrice": order.unit_price,
            "total": order.total_amount, "paymentStatus": order.payment_status,
            "createdAt": (order.paid_at or order.created_at).isoformat()}


@router.post("/invoice")
def generate_invoice(request: InvoiceRequest):

    total = request.quantity * request.price

    invoice_id = (
        f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )

    return {
        "success": True,
        "invoice_id": invoice_id,
        "product": request.product_name,
        "quantity": request.quantity,
        "price": request.price,
        "supplier": request.supplier,
        "total": total,
        "status": "GENERATED"
    }
