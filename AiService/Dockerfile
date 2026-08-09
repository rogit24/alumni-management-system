FROM python:3.10-slim

WORKDIR /app

# Copy dependency requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY main.py .

# Expose port
EXPOSE 8000

# Set environment defaults
ENV PORT=8000
ENV EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://service-registry:8761/eureka/
ENV EUREKA_INSTANCE_IP_ADDRESS=ai-service

# Run server
CMD ["python", "main.py"]
