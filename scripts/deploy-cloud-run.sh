#!/bin/bash
PROJECT_ID="tap-d-link"
SERVICE_NAME="ssrtapdlink"
REGION="us-central1"

echo "🚀 Starting Cloud Run deployment for $SERVICE_NAME..."

# 1. Build the image using Google Cloud Build
echo "📦 Building image via Cloud Build..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# 2. Deploy the image to Cloud Run
echo "🌍 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000

echo "✅ Deployment finished!"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)'
