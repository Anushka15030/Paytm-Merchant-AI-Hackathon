from datetime import datetime

from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey

from .database import Base


# ==========================================
# PRODUCT
# ==========================================

class Product(Base):

    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    category = Column(
        String,
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    stock = Column(
        Integer,
        nullable=False
    )

    min_stock = Column(
        Integer,
        nullable=False
    )

    max_stock = Column(
        Integer,
        nullable=False
    )

    supplier = Column(
        String,
        nullable=True
    )

    sales_7d = Column(
        Integer,
        default=0
    )

    sales_30d = Column(
        Integer,
        default=0
    )


# ==========================================
# ORDER
# ==========================================

class Order(Base):

    __tablename__ = "orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_name = Column(
        String,
        nullable=True
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0
    )

    status = Column(
        String,
        default="PENDING"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================================
# SALE
# ==========================================

class Sale(Base):

    __tablename__ = "sales"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================================
# RESTOCK REQUEST
# ==========================================

class RestockRequest(Base):

    __tablename__ = "restock_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String,
        nullable=False,
        default="PENDING"
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    decision_at = Column(DateTime, nullable=True)

    remind_at = Column(DateTime, nullable=True)

    do_not_remind = Column(Boolean, nullable=False, default=False)

    invoice_id = Column(String, nullable=True, unique=True)

    invoice_total = Column(Float, nullable=True)

    reminder_sent_at = Column(DateTime, nullable=True)

    reminder_attempts = Column(Integer, nullable=False, default=0)
