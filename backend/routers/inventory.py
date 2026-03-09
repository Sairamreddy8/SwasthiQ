from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from database import get_db
from models import Medicine, MedicineStatus
from schemas import (
    MedicineCreate,
    MedicineUpdate,
    MedicineResponse,
    StatusUpdate,
    InventorySummary,
)

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/summary", response_model=InventorySummary)
def get_inventory_summary(db: Session = Depends(get_db)):
    medicines = db.query(Medicine).all()
    total = len(medicines)
    active = sum(1 for m in medicines if m.status == MedicineStatus.ACTIVE.value)
    low = sum(1 for m in medicines if m.status == MedicineStatus.LOW_STOCK.value)
    expired = sum(1 for m in medicines if m.status == MedicineStatus.EXPIRED.value)
    oos = sum(1 for m in medicines if m.status == MedicineStatus.OUT_OF_STOCK.value)
    total_value = sum(m.price * m.quantity for m in medicines)

    return InventorySummary(
        total_medicines=total,
        active_count=active,
        low_stock_count=low,
        expired_count=expired,
        out_of_stock_count=oos,
        total_inventory_value=round(total_value, 2),
    )


@router.get("", response_model=list[MedicineResponse])
def list_medicines(
    search: str = Query(None, description="Search by name or category"),
    status: str = Query(None, description="Filter by status"),
    category: str = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    query = db.query(Medicine)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Medicine.name.ilike(search_term)) | (Medicine.category.ilike(search_term))
        )

    if status:
        query = query.filter(Medicine.status == status)

    if category:
        query = query.filter(Medicine.category == category)

    medicines = query.order_by(Medicine.name).all()

    # Auto-update statuses based on current state
    for m in medicines:
        _auto_update_status(m, db)

    return medicines


@router.get("/{medicine_id}", response_model=MedicineResponse)
def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine


@router.post("", response_model=MedicineResponse, status_code=201)
def create_medicine(medicine: MedicineCreate, db: Session = Depends(get_db)):
    status = _determine_status(medicine.quantity, medicine.expiry_date)
    db_medicine = Medicine(
        name=medicine.name,
        category=medicine.category,
        price=medicine.price,
        quantity=medicine.quantity,
        expiry_date=medicine.expiry_date,
        manufacturer=medicine.manufacturer,
        status=status,
    )
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@router.put("/{medicine_id}", response_model=MedicineResponse)
def update_medicine(medicine_id: int, updates: MedicineUpdate, db: Session = Depends(get_db)):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(medicine, field, value)

    # Recalculate status
    medicine.status = _determine_status(medicine.quantity, medicine.expiry_date)

    db.commit()
    db.refresh(medicine)
    return medicine


@router.patch("/{medicine_id}/status", response_model=MedicineResponse)
def update_medicine_status(medicine_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    medicine.status = status_update.status
    
    if status_update.status == MedicineStatus.OUT_OF_STOCK.value:
        medicine.quantity = 0
    elif status_update.status == MedicineStatus.EXPIRED.value:
        # Set expiry to yesterday to make it persistent
        medicine.expiry_date = (date.today() - timedelta(days=1))
    elif status_update.status == MedicineStatus.ACTIVE.value:
        # Ensure it has quantity and valid expiry if marked active manually
        if medicine.quantity == 0:
            medicine.quantity = 100
        if medicine.expiry_date < date.today():
             medicine.expiry_date = (date.today() + timedelta(days=365))

    db.commit()
    db.refresh(medicine)
    return medicine


def _determine_status(quantity: int, expiry_date: date) -> str:
    if expiry_date < date.today():
        return MedicineStatus.EXPIRED.value
    if quantity == 0:
        return MedicineStatus.OUT_OF_STOCK.value
    if quantity < 10:
        return MedicineStatus.LOW_STOCK.value
    return MedicineStatus.ACTIVE.value


def _auto_update_status(medicine: Medicine, db: Session):
    new_status = _determine_status(medicine.quantity, medicine.expiry_date)
    if medicine.status != new_status:
        medicine.status = new_status
        db.commit()
