from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

router = APIRouter(
    prefix="/api/insights",
    tags=["AI Insights"]
)


@router.get("")
def get_insights(
    db: Session = Depends(get_db)
):
    products = db.query(models.Product).all()

    insights = []

    for product in products:

        # -------------------------
        # LOW STOCK
        # -------------------------
        if product.stock <= product.min_stock:

            daily_sales = product.sales_7d / 7

            if daily_sales > 0:
                days_left = round(
                    product.stock / daily_sales,
                    1
                )
            else:
                days_left = None

            recommended_quantity = (
                product.max_stock - product.stock
            )

            insights.append({
                "type": "LOW_STOCK",
                "priority": "HIGH",
                "product_id": product.id,
                "product": product.name,
                "message": f"{product.name} may run out soon.",
                "days_left": days_left,
                "recommended_quantity": recommended_quantity,
                "recommended_action": "Restock"
            })

        # -------------------------
        # OVERSTOCK
        # -------------------------
        elif product.stock >= product.max_stock:

            insights.append({
                "type": "OVERSTOCK",
                "priority": "MEDIUM",
                "product_id": product.id,
                "product": product.name,
                "message": f"{product.name} has excess inventory.",
                "recommended_action": "Consider a discount campaign."
            })

    return {
        "count": len(insights),
        "insights": insights
    }