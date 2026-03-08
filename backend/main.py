from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers.dashboard import router as dashboard_router
from routers.inventory import router as inventory_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SwasthiQ API",
    description="Pharmacy Management System API",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(inventory_router)


@app.get("/")
def root():
    return {"message": "SwasthiQ API is running", "docs": "/docs"}
