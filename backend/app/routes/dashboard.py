from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("")
def get_dashboard(
    db: Session = Depends(get_db)
):
    products = db.query(Product).all()

    low_stock = [
        product
        for product in products
        if product.stock <= product.min_stock
    ]

    overstock = [
        product
        for product in products
        if product.stock >= product.max_stock
    ]

    return {
        "merchant": {
            "name": "Sharma General Store",
            "location": "Pune"
        },

        "sales_today": 18450,

        "orders_today": 28,

        "sales_growth": 12.4,

        "low_stock_count": len(low_stock),

        "overstock_count": len(overstock),

        "ai_opportunities": (
            len(low_stock) +
            len(overstock)
        )
    }