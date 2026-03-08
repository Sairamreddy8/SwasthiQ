from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from database import get_db
from models import Medicine, Sale, PurchaseOrder, MedicineStatus
from schemas import (
    SalesSummary,
    ItemsSoldSummary,
    LowStockItem,
    PurchaseOrderSummary,
    PurchaseOrderResponse,
    SaleResponse,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/sales-summary", response_model=SalesSummary)
def get_sales_summary(db: Session = Depends(get_db)):
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    sales_today = (
        db.query(Sale)
        .filter(Sale.sale_date >= start_of_day, Sale.sale_date <= end_of_day)
        .all()
    )

    total_revenue = sum(s.total_amount for s in sales_today)
    total_count = len(sales_today)
    avg_value = total_revenue / total_count if total_count > 0 else 0.0

    return SalesSummary(
        total_revenue=round(total_revenue, 2),
        total_sales_count=total_count,
        average_order_value=round(avg_value, 2),
    )


@router.get("/items-sold", response_model=ItemsSoldSummary)
def get_items_sold(db: Session = Depends(get_db)):
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    start_of_week = datetime.combine(today - timedelta(days=today.weekday()), datetime.min.time())
    start_of_month = datetime.combine(today.replace(day=1), datetime.min.time())

    items_today = (
        db.query(func.coalesce(func.sum(Sale.quantity_sold), 0))
        .filter(Sale.sale_date >= start_of_day)
        .scalar()
    )

    items_week = (
        db.query(func.coalesce(func.sum(Sale.quantity_sold), 0))
        .filter(Sale.sale_date >= start_of_week)
        .scalar()
    )

    items_month = (
        db.query(func.coalesce(func.sum(Sale.quantity_sold), 0))
        .filter(Sale.sale_date >= start_of_month)
        .scalar()
    )

    return ItemsSoldSummary(
        total_items_today=items_today,
        total_items_this_week=items_week,
        total_items_this_month=items_month,
    )


@router.get("/low-stock", response_model=list[LowStockItem])
def get_low_stock(db: Session = Depends(get_db)):
    medicines = (
        db.query(Medicine)
        .filter(Medicine.quantity < 10, Medicine.status != MedicineStatus.OUT_OF_STOCK.value)
        .order_by(Medicine.quantity.asc())
        .all()
    )
    return [
        LowStockItem(
            id=m.id, name=m.name, category=m.category, quantity=m.quantity, status=m.status
        )
        for m in medicines
    ]


@router.get("/purchase-orders", response_model=PurchaseOrderSummary)
def get_purchase_order_summary(db: Session = Depends(get_db)):
    orders = db.query(PurchaseOrder).all()

    pending = [o for o in orders if o.status == "Pending"]
    delivered = [o for o in orders if o.status == "Delivered"]

    order_responses = []
    for o in orders:
        med = db.query(Medicine).filter(Medicine.id == o.medicine_id).first()
        order_responses.append(
            PurchaseOrderResponse(
                id=o.id,
                medicine_id=o.medicine_id,
                medicine_name=med.name if med else "Unknown",
                quantity_ordered=o.quantity_ordered,
                supplier=o.supplier,
                order_date=o.order_date,
                status=o.status,
                expected_delivery=o.expected_delivery,
            )
        )

    return PurchaseOrderSummary(
        total_orders=len(orders),
        pending_orders=len(pending),
        delivered_orders=len(delivered),
        total_value=0,
        orders=order_responses,
    )


@router.get("/recent-sales", response_model=list[SaleResponse])
def get_recent_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).order_by(Sale.sale_date.desc()).limit(10).all()
    result = []
    for s in sales:
        med = db.query(Medicine).filter(Medicine.id == s.medicine_id).first()
        result.append(
            SaleResponse(
                id=s.id,
                medicine_id=s.medicine_id,
                medicine_name=med.name if med else "Unknown",
                quantity_sold=s.quantity_sold,
                total_amount=s.total_amount,
                sale_date=s.sale_date,
                buyer_name=s.buyer_name,
            )
        )
    return result
