# VenueFlow — Real-Time Crowd Intelligence for Wankhede Stadium

[![Google Cloud Run](https://img.shields.io/badge/Deployed%20on-Google%20Cloud%20Run-blue?logo=google-cloud)](https://cloud.google.com/run)
[![Firebase](https://img.shields.io/badge/Powered%20by-Firebase-orange?logo=firebase)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.0-purple?logo=google)](https://ai.google.dev)

> Live crowd management platform that solves congestion, coordination, and navigation at large-scale sporting venues.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Google Cloud Run                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Express.js Server (Node 22)             │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐    │  │
│  │  │ /api/    │ /api/    │ /api/ai  │ /api/health  │    │  │
│  │  │ zones    │ alerts   │ chat +   │              │    │  │
│  │  │          │          │ recs     │              │    │  │
│  │  └────┬─────┴────┬─────┴────┬─────┴──────────────┘    │  │
│  │       │          │          │                          │  │
│  │  ┌────▼──────────▼──┐  ┌───▼──────────┐               │  │
│  │  │  Firebase Admin  │  │  Gemini 2.0  │               │  │
│  │  │  (RTDB + Auth)   │  │  Flash API   │               │  │
│  │  └──────────────────┘  └──────────────┘               │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐    │  │
│  │  │        Static Files (Vite build output)        │    │  │
│  │  │  React 19 SPA + Google Maps JS API             │    │  │
│  │  └────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │     Firebase Realtime Database       │
        │  ┌──────────┐  ┌──────────────────┐ │
        │  │  zones/   │  │  alerts/         │ │
        │  │  (6 zones)│  │  (operational)   │ │
        │  └──────────┘  └──────────────────┘ │
        └─────────────────────────────────────┘
```

### Google Services Used (5)

| Service | Purpose |
|---------|---------|
| **Cloud Run** | Production deployment — single container, auto-scaling |
| **Firebase RTDB** | Real-time zone & alert data — push-based sync via `onValue` |
| **Firebase Auth** | Staff authentication — email/password, custom claims for role |
| **Google Maps JS API** | Venue visualization — satellite view with color-coded zone markers |
| **Gemini 2.0 Flash** | AI chat (attendee Q&A) + crowd recommendations (staff advisory) |

## Features

### Attendee Interface (public, mobile-first)
- 🗺️ **Live Zone Map** — Google Maps satellite view with real-time congestion markers
- 📊 **Zone Status Grid** — All zones with occupancy bars, wait times, status badges
- 🧭 **Congestion-Aware Navigation** — Dijkstra's algorithm finds least-congested routes
- 🤖 **AI Chat** — Ask natural-language questions grounded in live data

### Staff Interface (auth-protected)
- 📈 **Zone Control** — Sliders to update occupancy (auto-derives status + wait time)
- 🚨 **Alert Manager** — Create, acknowledge, resolve incidents in real-time
- 🤖 **AI Recommendations** — Gemini generates crowd management advice from live data
- 🔐 **Firebase Auth** — Email/password login with staff role verification

## Prerequisites

- **Node.js** 22+
- **npm** 10+
- **Google Cloud CLI** (`gcloud`) installed and authenticated
- **Firebase project** with Realtime Database + Authentication enabled
- **Google Maps API key** with Maps JavaScript API enabled
- **Gemini API key** from Google AI Studio

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create a new project
2. Enable **Realtime Database**:
   - Firebase Console → Build → Realtime Database → Create Database
   - Start in **locked mode** (we'll apply rules)
   - Note the database URL (e.g., `https://your-project-default-rtdb.firebaseio.com`)
3. Enable **Authentication**:
   - Firebase Console → Build → Authentication → Get Started
   - Enable **Email/Password** sign-in method
4. Create a **staff user**:
   - Firebase Console → Authentication → Add User
   - Create a user with email/password (e.g., `staff@venueflow.app`)
5. Set **custom claims** for the staff user:
   ```bash
   # From the Firebase Admin SDK or Firebase CLI:
   # Run this once to give the user staff privileges
   firebase functions:config:set staff.email="staff@venueflow.app"
   ```
   Or use the Firebase Admin SDK in a one-off script:
   ```javascript
   const admin = require('firebase-admin');
   admin.auth().getUserByEmail('staff@venueflow.app')
     .then(user => admin.auth().setCustomUserClaims(user.uid, { role: 'staff' }))
     .then(() => console.log('Staff role set'));
   ```
6. Generate a **service account key**:
   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Base64-encode it: `base64 -w 0 service-account.json`
   - This becomes `FIREBASE_SERVICE_ACCOUNT_BASE64`
7. Get the **web app config**:
   - Firebase Console → Project Settings → General → Your apps → Web app
   - Copy the config values for the `VITE_FIREBASE_*` env vars
8. Apply **security rules**:
   - Firebase Console → Realtime Database → Rules
   - Paste the contents of `database.rules.json`

## Environment Variables

Create a `.env` file from the example:
```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_DATABASE_URL` | Firebase RTDB URL |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64-encoded service account JSON |
| `FIREBASE_DATABASE_URL` | Firebase RTDB URL (server-side) |
| `GEMINI_API_KEY` | Gemini API key from AI Studio |
| `PORT` | Server port (default: 8080) |
| `NODE_ENV` | Environment (development/production) |
| `CORS_ORIGIN` | Allowed CORS origin |

## Local Development

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
cd ../scripts && npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Fill in all env vars
```

### 3. Seed the database
```bash
cd scripts && npx ts-node seed.ts
```
This populates 6 Wankhede Stadium zones with realistic congestion data and one sample alert.

### 4. Run the dev servers
```bash
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

The client proxies `/api` requests to the server via Vite's dev proxy.

- **Client**: http://localhost:5173
- **Server API**: http://localhost:8080/api

## Testing

```bash
cd server && npm test
```

Tests cover:
- Zone status derivation at all boundary values
- Wait time estimation accuracy
- Dijkstra's pathfinding (congestion avoidance)
- API input validation (Zod schemas)
- Alert lifecycle validation

## Docker (Local Production Build)

```bash
# Build and run with docker-compose
docker-compose --env-file .env up --build
```

Access at http://localhost:8080

## Cloud Run Deployment

### 1. Set your project
```bash
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 3. Build and deploy
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/venueflow \
  --build-arg VITE_FIREBASE_API_KEY=your-key \
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com \
  --build-arg VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com \
  --build-arg VITE_FIREBASE_PROJECT_ID=your-project-id \
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com \
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=123456 \
  --build-arg VITE_FIREBASE_APP_ID=your-app-id \
  --build-arg VITE_GOOGLE_MAPS_API_KEY=your-maps-key

gcloud run deploy venueflow \
  --image gcr.io/YOUR_PROJECT_ID/venueflow \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-sa" \
  --set-env-vars "FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com" \
  --set-env-vars "GEMINI_API_KEY=your-gemini-key" \
  --set-env-vars "CORS_ORIGIN=https://venueflow-xxxx.run.app"
```

### 4. Update CORS_ORIGIN
After deployment, note the Cloud Run URL and update `CORS_ORIGIN`:
```bash
gcloud run services update venueflow \
  --region asia-south1 \
  --set-env-vars "CORS_ORIGIN=https://venueflow-xxxx-xx.a.run.app"
```

## Firebase Security Rules

Apply these rules in Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "zones": {
      ".read": true,
      ".write": "auth != null && auth.token.role === 'staff'"
    },
    "alerts": {
      ".read": "auth != null && auth.token.role === 'staff'",
      ".write": "auth != null && auth.token.role === 'staff'"
    },
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

## Project Structure

```
venueflow/
├── client/                    # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── attendee/      # Public-facing components
│   │   │   ├── staff/         # Auth-protected components
│   │   │   └── shared/        # Reusable UI components
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Firebase + API clients
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── server/                    # Express.js API server
│   └── src/
│       ├── routes/            # API route handlers
│       ├── middleware/        # Auth, security, validation
│       ├── services/          # Firebase Admin, Gemini, calculations
│       └── types/             # Server-side types
├── scripts/                   # Database seed script
├── tests/                     # Test suites
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local production testing
├── database.rules.json        # Firebase RTDB security rules
└── .env.example               # Environment variable documentation
```

## License

MIT

---

Built for Google PromptWars on Hack2Skill. Powered by Google Cloud.
