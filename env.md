# Environment Variables Guide

This document lists all the environment variables required for the AEGIS platform and step-by-step instructions on how to get them. **All services used are free tier / no cost.**

---

## Free Tier Services Used

| Service                  | Free Tier Limit                                 | Cost   |
| ------------------------ | ----------------------------------------------- | ------ |
| **Gemini API (AI Studio)** | 15 RPM (free tier)                            | Free   |
| **Firebase Auth**        | 50,000 MAU (Spark plan)                         | Free   |
| **Cloud Firestore**      | 1 GiB storage, 50K reads/day, 20K writes/day    | Free   |
| **Firebase Hosting**     | 10 GB/month transfer                            | Free   |

---

## 1. Backend Environment Variables (`backend/.env`)

| Variable Name            | Description                                      | How to Get It                                                                                                                                            |
| ------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                   | The port the backend server runs on.             | Default to `3001`.                                                                                                                                       |
| `NODE_ENV`               | Environment mode.                                | Set to `development` for local, `production` for deploy.                                                                                                 |
| `DEV_MODE`               | Bypass Firebase Auth for local testing.          | Set to `true` for local development (no Firebase Auth needed). Set to `false` in production.                                                             |
| `GEMINI_API_KEY`         | API key for Google Gemini (Core AI).             | See **Step 1** below.                                                                                                                                    |
| `FIREBASE_PROJECT_ID`    | Firebase project ID.                             | See **Step 2** below.                                                                                                                                    |
| `FIREBASE_PRIVATE_KEY`   | Firebase Admin SDK private key.                  | See **Step 3** below.                                                                                                                                    |
| `FIREBASE_CLIENT_EMAIL`  | Firebase Admin SDK client email.                 | See **Step 3** below.                                                                                                                                    |
| `FRONTEND_URL`           | URL of the frontend (for CORS).                  | Default to `http://localhost:5173` for local dev.                                                                                                        |

## 2. Frontend Environment Variables (`frontend/.env`)

| Variable Name                       | Description                   | How to Get It                   |
| ----------------------------------- | ----------------------------- | ------------------------------- |
| `VITE_API_BASE_URL`                 | Base URL for the backend API. | Default: `http://localhost:3001` |
| `VITE_FIREBASE_API_KEY`             | Firebase Client API Key.      | See **Step 4** below.           |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain.         | See **Step 4** below.           |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase Project ID.          | See **Step 4** below.           |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket.      | See **Step 4** below.           |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID. | See **Step 4** below.           |
| `VITE_FIREBASE_APP_ID`              | Firebase App ID.              | See **Step 4** below.           |

> **Note:** If you leave the frontend `.env` with placeholder values, the app will automatically run in **Dev Mode** — Firebase Auth is bypassed and a "Quick Demo Login" button appears. This is perfect for local development and demo purposes.

---

## Step-by-Step Setup Guide

### Step 1: Get a Gemini API Key (FREE)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"**.
4. Select your Google Cloud project (or create one).
5. Copy the generated API key.
6. Paste it as `GEMINI_API_KEY` in `backend/.env`.

### Step 2: Create a Firebase Project (FREE Spark Plan)

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **"Create a project"** (or select an existing one).
3. Enter a project name (e.g., `aegis`).
4. Disable Google Analytics (optional, saves a step).
5. Click **Create Project**.
6. Once created, go to **Project Settings** (gear icon in the sidebar).
7. Copy the **"Project ID"** — this is your `FIREBASE_PROJECT_ID`.

### Step 3: Get Firebase Admin SDK Credentials (for Backend)

1. In Firebase Console, go to **Project Settings** → **Service accounts** tab.
2. Click **"Generate new private key"**.
3. A JSON file will download. Open it and copy:
   - `private_key` → paste as `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n` characters).
   - `client_email` → paste as `FIREBASE_CLIENT_EMAIL`.
4. **Important:** Never commit this JSON file or `.env` to version control!

### Step 4: Get Firebase Client Config (for Frontend)

1. In Firebase Console, go to **Project Settings** → **General** tab.
2. Scroll down to **"Your apps"**.
3. Click **"Add app"** → Choose **Web** (</> icon).
4. Register a name (e.g., `aegis-web`) and click **"Register app"**.
5. Copy the config values shown:
   ```
   apiKey → VITE_FIREBASE_API_KEY
   authDomain → VITE_FIREBASE_AUTH_DOMAIN
   projectId → VITE_FIREBASE_PROJECT_ID
   storageBucket → VITE_FIREBASE_STORAGE_BUCKET
   messagingSenderId → VITE_FIREBASE_MESSAGING_SENDER_ID
   appId → VITE_FIREBASE_APP_ID
   ```
6. Paste them into `frontend/.env`.

### Step 5: Enable Firebase Auth (FREE)

1. In Firebase Console, go to **Build** → **Authentication**.
2. Click **"Get started"**.
3. Enable **Email/Password** sign-in method.
4. (Optional) Enable **Google** sign-in method for Google SSO.

### Step 6: Enable Cloud Firestore (FREE)

1. In Firebase Console, go to **Build** → **Firestore Database**.
2. Click **"Create database"**.
3. Choose **"Start in test mode"** (for development).
4. Select a region close to you.
5. Click **Enable**.

---

## Quick Start (Local Development)

```bash
# 1. Set up backend
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev

# 2. Set up frontend (in another terminal)
cd frontend
# The default .env works in Dev Mode (no Firebase needed)
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. Click **"Quick Demo Login"** to enter dev mode immediately.

---

## Important Security Notes

- **Never commit `.env` files** to version control. They are already in `.gitignore`.
- **Never commit Firebase service account JSON** files. Store credentials only in `.env`.
- In production, set `DEV_MODE=false` and configure real Firebase Auth credentials.
