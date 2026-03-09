from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# ─── Medicine Schemas ───────────────────────────────────────

class MedicineBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=0)
    expiry_date: date
    manufacturer: str = Field(..., min_length=1, max_length=200)


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    expiry_date: Optional[date] = None
    manufacturer: Optional[str] = Field(None, min_length=1, max_length=200)


class MedicineResponse(MedicineBase):
    id: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Active|Low Stock|Expired|Out of Stock)$")


# ─── Sale Schemas ───────────────────────────────────────────

class SaleCreate(BaseModel):
    medicine_id: int
    quantity_sold: int = Field(..., gt=0)
    buyer_name: str = Field(..., min_length=1, max_length=200)


class SaleResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    quantity_sold: int
    total_amount: float
    sale_date: Optional[datetime] = None
    buyer_name: str

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ──────────────────────────────────────

class SalesSummary(BaseModel):
    total_revenue: float
    total_sales_count: int
    average_order_value: float


class ItemsSoldSummary(BaseModel):
    total_items_today: int
    total_items_this_week: int
    total_items_this_month: int


class LowStockItem(BaseModel):
    id: int
    name: str
    category: str
    quantity: int
    status: str

    class Config:
        from_attributes = True


class PurchaseOrderResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    quantity_ordered: int
    supplier: str
    order_date: Optional[datetime] = None
    status: str
    expected_delivery: Optional[date] = None

    class Config:
        from_attributes = True


class PurchaseOrderSummary(BaseModel):
    total_orders: int
    pending_orders: int
    delivered_orders: int
    total_value: float
    orders: List[PurchaseOrderResponse]


class InventorySummary(BaseModel):
    total_medicines: int
    active_count: int
    low_stock_count: int
    expired_count: int
    out_of_stock_count: int
    total_inventory_value: float
