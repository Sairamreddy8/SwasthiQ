#!/bin/bash
# Exit on error
set -e

echo "🌱 Starting database seeding..."
python seed.py

echo "🚀 Starting FastAPI server..."
# Use Gunicorn with Uvicorn workers for production stability
exec gunicorn main:app --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}
