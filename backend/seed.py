"""Seed the database with realistic sample data."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, date, timedelta
import random
from database import engine, SessionLocal, Base
from models import Medicine, Sale, PurchaseOrder, MedicineStatus, PurchaseOrderStatus


def seed():
    # Only create tables if they don't exist, don't drop them!
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if we already have data
    if db.query(Medicine).first():
        print("🌱 Database already has data. Skipping seed.")
        db.close()
        return

    print("🌱 Seeding database with initial data...")

    # ── Medicines ───────────────────────────────────────────
    medicines_data = [
        ("Paracetamol 500mg", "Pain Relief", 12.50, 150, "2027-06-15", "Sun Pharma"),
        ("Amoxicillin 250mg", "Antibiotic", 45.00, 85, "2027-03-20", "Cipla"),
        ("Cetirizine 10mg", "Allergy", 8.75, 200, "2027-09-10", "Dr. Reddy's"),
        ("Metformin 500mg", "Diabetes", 22.00, 120, "2027-12-01", "Lupin"),
        ("Omeprazole 20mg", "Gastric", 18.50, 5, "2027-04-15", "Torrent Pharma"),
        ("Azithromycin 500mg", "Antibiotic", 65.00, 3, "2027-08-22", "Zydus"),
        ("Ibuprofen 400mg", "Pain Relief", 15.00, 180, "2027-07-30", "Mankind"),
        ("Atorvastatin 10mg", "Cardiac", 35.00, 7, "2027-11-18", "Sun Pharma"),
        ("Losartan 50mg", "Cardiac", 28.00, 95, "2027-10-05", "Cipla"),
        ("Amlodipine 5mg", "Cardiac", 20.00, 0, "2027-05-12", "Dr. Reddy's"),
        ("Montelukast 10mg", "Respiratory", 42.00, 60, "2027-02-28", "Lupin"),
        ("Pantoprazole 40mg", "Gastric", 25.00, 110, "2027-01-15", "Torrent Pharma"),
        ("Clopidogrel 75mg", "Cardiac", 55.00, 45, "2026-01-10", "Zydus"),
        ("Doxycycline 100mg", "Antibiotic", 30.00, 8, "2027-06-20", "Mankind"),
        ("Levofloxacin 500mg", "Antibiotic", 70.00, 75, "2027-09-25", "Sun Pharma"),
        ("Ranitidine 150mg", "Gastric", 10.00, 0, "2025-12-01", "Cipla"),
        ("Aspirin 150mg", "Pain Relief", 5.50, 250, "2027-08-14", "Dr. Reddy's"),
        ("Metoprolol 50mg", "Cardiac", 32.00, 2, "2027-04-30", "Lupin"),
        ("Vitamin D3 1000IU", "Supplement", 15.00, 300, "2028-01-01", "Torrent Pharma"),
        ("Multivitamin Tablet", "Supplement", 12.00, 180, "2027-11-30", "Mankind"),
    ]

    medicines = []
    for name, cat, price, qty, exp, mfr in medicines_data:
        exp_date = date.fromisoformat(exp)
        if exp_date < date.today():
            status = MedicineStatus.EXPIRED.value
        elif qty == 0:
            status = MedicineStatus.OUT_OF_STOCK.value
        elif qty < 10:
            status = MedicineStatus.LOW_STOCK.value
        else:
            status = MedicineStatus.ACTIVE.value

        med = Medicine(
            name=name, category=cat, price=price, quantity=qty,
            expiry_date=exp_date, manufacturer=mfr, status=status,
        )
        db.add(med)
        medicines.append(med)

    db.commit()
    for m in medicines:
        db.refresh(m)

    # ── Sales (spread across last 30 days, some today) ──────
    buyers = [
        "City Hospital", "Green Pharmacy", "Raj Clinic", "Medicare Store",
        "Apollo Pharmacy", "Health Plus", "Wellness Center", "MedLife",
        "Sai Medical", "LifeCare Pharmacy",
    ]
    today = datetime.now()

    for i in range(50):
        med = random.choice([m for m in medicines if m.quantity > 0 and m.status != MedicineStatus.EXPIRED.value])
        qty = random.randint(1, 10)
        # make ~15 sales today
        if i < 15:
            sale_dt = today.replace(
                hour=random.randint(8, 17),
                minute=random.randint(0, 59),
                second=0, microsecond=0,
            )
        else:
            days_ago = random.randint(1, 30)
            sale_dt = today - timedelta(
                days=days_ago,
                hours=random.randint(0, 8),
            )
        sale = Sale(
            medicine_id=med.id,
            quantity_sold=qty,
            total_amount=round(med.price * qty, 2),
            sale_date=sale_dt,
            buyer_name=random.choice(buyers),
        )
        db.add(sale)

    db.commit()

    # ── Purchase Orders ─────────────────────────────────────
    suppliers = [
        "MedSupply India", "PharmaDist Co.", "HealthSource Ltd.",
        "BioMed Distributors", "PharmaWholesale Inc.",
    ]
    statuses = [PurchaseOrderStatus.PENDING.value, PurchaseOrderStatus.DELIVERED.value]

    for i in range(10):
        med = random.choice(medicines)
        order_dt = today - timedelta(days=random.randint(1, 15))
        status = random.choice(statuses)
        delivery = (order_dt + timedelta(days=random.randint(3, 14))).date() if status == PurchaseOrderStatus.PENDING.value else None

        po = PurchaseOrder(
            medicine_id=med.id,
            quantity_ordered=random.randint(20, 200),
            supplier=random.choice(suppliers),
            order_date=order_dt,
            status=status,
            expected_delivery=delivery,
        )
        db.add(po)

    db.commit()
    db.close()
    print("✅ Database seeded successfully!")


if __name__ == "__main__":
    seed()
