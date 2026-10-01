from datetime import datetime

from app.database import Base
from app.database import SessionLocal
from app.database import engine

from app.models import Product
from app.models import Order
from app.models import Sale


# ==========================================
# RESET DATABASE
# ==========================================

Base.metadata.drop_all(
    bind=engine
)

Base.metadata.create_all(
    bind=engine
)


db = SessionLocal()


# ==========================================
# PRODUCTS
# ==========================================

products = [

    Product(
        name="Amul Milk 500ml",
        category="Dairy",
        price=30,
        stock=4,
        min_stock=10,
        max_stock=100,
        supplier="Amul",
        sales_7d=72,
        sales_30d=290
    ),

    Product(
        name="Coke 500ml",
        category="Beverages",
        price=40,
        stock=80,
        min_stock=20,
        max_stock=60,
        supplier="Coca-Cola",
        sales_7d=18,
        sales_30d=75
    ),

    Product(
        name="Pepsi 500ml",
        category="Beverages",
        price=40,
        stock=75,
        min_stock=20,
        max_stock=60,
        supplier="PepsiCo",
        sales_7d=16,
        sales_30d=68
    ),

    Product(
        name="Aashirvaad Atta 5kg",
        category="Grocery",
        price=280,
        stock=3,
        min_stock=5,
        max_stock=50,
        supplier="ITC",
        sales_7d=21,
        sales_30d=90
    ),

    Product(
        name="Tata Salt 1kg",
        category="Grocery",
        price=28,
        stock=25,
        min_stock=10,
        max_stock=40,
        supplier="Tata Consumer",
        sales_7d=12,
        sales_30d=50
    ),

    Product(
        name="Parle-G Biscuits",
        category="Snacks",
        price=10,
        stock=30,
        min_stock=10,
        max_stock=50,
        supplier="Parle",
        sales_7d=20,
        sales_30d=85
    )
]


db.add_all(products)


# ==========================================
# SALES
# ==========================================

sales = [

    Sale(
        product_id=1,
        quantity=100,
        amount=3000,
        created_at=datetime.utcnow()
    ),

    Sale(
        product_id=2,
        quantity=100,
        amount=4000,
        created_at=datetime.utcnow()
    ),

    Sale(
        product_id=3,
        quantity=80,
        amount=3200,
        created_at=datetime.utcnow()
    ),

    Sale(
        product_id=4,
        quantity=15,
        amount=4200,
        created_at=datetime.utcnow()
    ),

    Sale(
        product_id=5,
        quantity=50,
        amount=1400,
        created_at=datetime.utcnow()
    ),

    Sale(
        product_id=6,
        quantity=265,
        amount=2650,
        created_at=datetime.utcnow()
    )
]


db.add_all(sales)


# ==========================================
# ORDERS
# ==========================================

for i in range(28):

    order = Order(

        customer_name=(
            f"Customer {i + 1}"
        ),

        total_amount=500 + (
            i * 20
        ),

        status="COMPLETED",

        created_at=datetime.utcnow()
    )

    db.add(order)


# ==========================================
# SAVE
# ==========================================

db.commit()

db.close()


print(
    "Database seeded successfully!"
)

print(
    "Products: 6"
)

print(
    "Sales today: ₹18,450"
)

print(
    "Orders today: 28"
)