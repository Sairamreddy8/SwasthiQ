from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, date
import enum


class MedicineStatus(str, enum.Enum):
    ACTIVE = "Active"
    LOW_STOCK = "Low Stock"
    EXPIRED = "Expired"
    OUT_OF_STOCK = "Out of Stock"


class PurchaseOrderStatus(str, enum.Enum):
    PENDING = "Pending"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    expiry_date = Column(Date, nullable=False)
    manufacturer = Column(String(200), nullable=False)
    status = Column(String(50), nullable=False, default=MedicineStatus.ACTIVE.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sales = relationship("Sale", back_populates="medicine")
    purchase_orders = relationship("PurchaseOrder", back_populates="medicine")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity_sold = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)
    sale_date = Column(DateTime, default=datetime.utcnow)
    buyer_name = Column(String(200), nullable=False)

    medicine = relationship("Medicine", back_populates="sales")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    quantity_ordered = Column(Integer, nullable=False)
    supplier = Column(String(200), nullable=False)
    order_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), nullable=False, default=PurchaseOrderStatus.PENDING.value)
    expected_delivery = Column(Date, nullable=True)

    medicine = relationship("Medicine", back_populates="purchase_orders")
