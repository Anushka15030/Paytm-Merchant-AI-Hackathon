from typing import Literal, Optional

from pydantic import BaseModel


# ==========================================
# INVENTORY
# ==========================================

class InventoryItem(BaseModel):

    id: int

    name: str

    category: str

    price: float

    stock: int

    min_stock: int

    max_stock: int

    supplier: Optional[str] = None

    sales_7d: int

    sales_30d: int

    status: str


# ==========================================
# RESTOCK
# ==========================================

class RestockRequest(BaseModel):

    product_id: int

    quantity: int


class RestockResponse(BaseModel):

    id: int

    success: bool

    message: str

    product: str

    quantity: int

    supplier: Optional[str] = None

    status: str

    created_at: str


class RestockRequestRecord(BaseModel):

    id: int

    product_id: int

    product: str

    quantity: int

    supplier: Optional[str] = None

    status: str

    created_at: str

    decision_at: Optional[str] = None

    remind_at: Optional[str] = None

    do_not_remind: bool = False

    reminder_due: bool = False

    invoice_id: Optional[str] = None

    invoice_total: Optional[float] = None

    reminder_sent_at: Optional[str] = None

    reminder_attempts: int = 0


class DueReminder(BaseModel):

    id: int

    product_id: int

    product: str

    quantity: int

    supplier: Optional[str] = None

    status: str

    remind_at: str

    reminder_attempts: int


class ReminderSentResponse(BaseModel):

    success: bool

    id: int

    reminder_sent_at: str

    message: str


class RestockDecision(BaseModel):

    action: Literal["approve", "reject"]

    remind_after_days: Optional[int] = None

    do_not_remind: bool = False


class RestockDecisionResponse(BaseModel):

    success: bool

    id: int

    product: str

    quantity: int

    supplier: Optional[str] = None

    status: str

    decision_at: str

    remind_at: Optional[str] = None

    do_not_remind: bool

    invoice_id: Optional[str] = None

    invoice_total: Optional[float] = None

    message: str


# ==========================================
# INVOICE
# ==========================================

class InvoiceRequest(BaseModel):

    product_id: int

    product_name: str

    quantity: int

    price: float

    supplier: str


class InvoiceResponse(BaseModel):

    success: bool

    invoice_id: str

    product: str

    quantity: int

    price: float

    supplier: str

    total: float

    status: str
