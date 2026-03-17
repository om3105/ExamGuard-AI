# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ./app ./app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 9000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:9000/health')" || exit 1

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000", "--workers", "2"]
