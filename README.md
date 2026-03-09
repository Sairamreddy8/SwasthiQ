# SwasthiQ Backend API

This is the FastAPI backend for the SwasthiQ Pharmacy Management System. It handles inventory management, sales tracking, and dashboard analytics with a focus on data consistency and automated status management.

## 🚀 API Structure

The API is organized into three main resource groups:

### 1. Inventory (`/api/inventory`)
Manages the pharmacy's stock of medicines.
- `GET /` - List all medicines (supports search & status filtering).
- `GET /summary` - Get high-level inventory metrics (total value, low stock count, etc.).
- `POST /` - Add a new medicine.
- `GET /{id}` - Get details of a specific medicine.
- `PUT /{id}` - Update medicine details.
- `PATCH /{id}/status` - Manually override a medicine's status.

### 2. Sales (`/api/sales`)
Handles transactions and ensures inventory integrity.
- `GET /` - List recent sales history.
- `POST /` - Record a new sale (updates inventory automatically).

### 3. Dashboard (`/api/dashboard`)
Provides aggregated data for the frontend charts and stats.
- `GET /sales-summary` - Daily revenue and order counts.
- `GET /items-sold` - Comparison of items sold (Today vs Week vs Month).
- `GET /low-stock` - List of items requiring immediate reorder.
- `GET /recent-sales` - Simple list of the last 10 transactions.

---

## 🛡️ Data Consistency & Business Logic

The backend ensures that your pharmacy data remains accurate and consistent through several Python-driven mechanisms:

### 1. Automated Status Management
The system uses a helper function `_determine_status()` to ensure that a medicine's status is always a direct reflection of its physical state:
- **Expired**: Triggered automatically if `expiry_date < today`.
- **Out of Stock**: Triggered if `quantity == 0`.
- **Low Stock**: Triggered if `quantity < 10`.
- **Active**: Default for items with sufficient stock.

Every time a medicine is updated or fetched via the API, the system re-evaluates its status to prevent human error.

### 2. Atomicity in Transactions
When a sale is made via `POST /api/sales`, the backend performs multiple checks within a single database transaction:
- **Existence Check**: Verifies the medicine exists in the database.
- **Expiry Guard**: Blocks the sale if the medicine is marked as 'Expired'.
- **Stock Validation**: Ensures the quantity being sold does not exceed available stock.
- **Inventory Deduction**: Subtracts the sold quantity and re-calculates the medicine's status (e.g., flipping it to 'Low Stock') in the same step.

If any of these checks fail, the entire transaction is rolled back, ensuring you never have "ghost sales" or negative inventory.

### 3. Input Validation (Pydantic)
All incoming data is strictly validated using Pydantic schemas. This ensures that:
- Prices cannot be negative.
- Quantities must be integers.
- Required fields (like generic name or manufacturer) are never missing.

---

## 🛠️ Local Setup

1. **Install Dependencies**: `pip install -r requirements.txt`
2. **Seed Database**: `python seed.py` (Creates initial inventory)
3. **Run Server**: `uvicorn main:app --reload`
4. **Interactive Docs**: Visit `http://localhost:8000/docs` to test endpoints via Swagger UI.
