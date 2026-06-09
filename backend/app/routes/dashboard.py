from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Product, Customer, Order
from app.schemas.schemas import DashboardOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardOut)
def dashboard_summary(db: Session = Depends(get_db)):
    return {
        "total_products": db.query(Product).count(),
        "total_customers": db.query(Customer).count(),
        "total_orders": db.query(Order).count(),
        "low_stock_products": db.query(Product).filter(Product.quantity < 5).count(),
    }
