#!/bin/bash

# Ensure script stops on first error
set -e

echo "Deploying AEGIS to Google Cloud Run..."

# Check for gcloud
if ! command -v gcloud &> /dev/null
then
    echo "gcloud could not be found. Please install the Google Cloud CLI."
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "(unset)" ]; then
    echo "No Google Cloud project is configured."
    echo "Please set your project ID by running: gcloud config set project YOUR_PROJECT_ID"
    echo "If you haven't logged in, run: gcloud auth login"
    exit 1
fi

echo "Using Project ID: $PROJECT_ID"

# Enable required services
echo "Enabling Cloud Run and Cloud Build APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

REGION="asia-south1" # Change this if you prefer another region

# 1. Deploy Backend
echo "Deploying Backend..."
cd backend
# Note: Add your environment variables like GEMINI_API_KEY, FIREBASE_PROJECT_ID, etc. here or via the Cloud Console later
# Example: gcloud run deploy aegis-backend --source . --region $REGION --allow-unauthenticated --set-env-vars="NODE_ENV=production,GEMINI_API_KEY=your_key"
gcloud run deploy aegis-backend \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"

# Get backend URL
BACKEND_URL=$(gcloud run services describe aegis-backend --platform managed --region $REGION --format 'value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

cd ..

# 2. Deploy Frontend
echo "Deploying Frontend..."
cd frontend

# Deploy using source (Cloud Build will use our Dockerfile)
# Note: Add your Firebase env vars to --set-build-env-vars if needed
gcloud run deploy aegis-frontend \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-build-env-vars="VITE_API_URL=$BACKEND_URL"

FRONTEND_URL=$(gcloud run services describe aegis-frontend --platform managed --region $REGION --format 'value(status.url)')
echo "Frontend deployed at: $FRONTEND_URL"

echo "Deployment Complete!"
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
