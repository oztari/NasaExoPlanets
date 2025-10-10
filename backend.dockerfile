# syntax=docker/dockerfile:1

# Use an official Python base image (force AMD64 architecture)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY . .

# Expose the port uvicorn will run on
EXPOSE 8000

# Run the API with uvicorn
CMD ["uvicorn", "backend.app:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
