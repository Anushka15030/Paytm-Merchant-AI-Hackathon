from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    tags=["Orders"]
)


class InvoiceRequest(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float
    supplier: str


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