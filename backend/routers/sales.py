from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Medicine, Sale, MedicineStatus
from schemas import SaleCreate, SaleResponse
from datetime import datetime

router = APIRouter(prefix="/api/sales", tags=["Sales"])

@router.post("", response_model=SaleResponse, status_code=201)
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    # 1. Check if medicine exists
    medicine = db.query(Medicine).filter(Medicine.id == sale.medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # 2. Check if medicine is expired
    if medicine.status == MedicineStatus.EXPIRED.value:
        raise HTTPException(status_code=400, detail="Cannot sell expired medicines")

    # 3. Check inventory
    if medicine.quantity < sale.quantity_sold:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient inventory. Available: {medicine.quantity}"
        )

    # 4. Create Sale record
    total_amount = round(medicine.price * sale.quantity_sold, 2)
    new_sale = Sale(
        medicine_id=sale.medicine_id,
        quantity_sold=sale.quantity_sold,
        total_amount=total_amount,
        buyer_name=sale.buyer_name,
        sale_date=datetime.utcnow()
    )
    
    # 5. Update Medicine inventory
    medicine.quantity -= sale.quantity_sold
    
    # 6. Update status if needed (Low Stock or Out of Stock)
    if medicine.quantity == 0:
        medicine.status = MedicineStatus.OUT_OF_STOCK.value
    elif medicine.quantity < 10:
        medicine.status = MedicineStatus.LOW_STOCK.value
        
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    
    # Attach medicine name for response if schema expects it
    new_sale.medicine_name = medicine.name
    
    return new_sale

@router.get("", response_model=list[SaleResponse])
def list_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).order_by(Sale.sale_date.desc()).all()
    # Attach medicine names
    for s in sales:
        med = db.query(Medicine).filter(Medicine.id == s.medicine_id).first()
        s.medicine_name = med.name if med else "Unknown"
    return sales
