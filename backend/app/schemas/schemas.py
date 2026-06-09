from pydantic import BaseModel, EmailStr, Field
from decimal import Decimal
from typing import List

class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    sku: str = Field(min_length=2, max_length=80)
    price: Decimal = Field(gt=0)
    quantity: int = Field(ge=0)

class ProductCreate(ProductBase): pass
class ProductUpdate(ProductBase): pass
class ProductOut(ProductBase):
    id: int
    class Config: from_attributes = True

class CustomerCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=30)

class CustomerOut(CustomerCreate):
    id: int
    class Config: from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(min_length=1)

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    class Config: from_attributes = True

class OrderOut(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    status: str
    items: List[OrderItemOut]
    class Config: from_attributes = True

class DashboardOut(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: int
