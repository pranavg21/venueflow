# VenueFlow - Real-time Crowd Intelligence Platform

## Overview
VenueFlow is a smart, dynamic assistant and live crowd management platform built for large-scale venues, specifically implemented here for **Wankhede Stadium**.

**Chosen Vertical:** Smart Stadium / Venue Crowd Management

## Approach and Logic
Large venues suffer from congestion, long wait times, and safety risks during peak events. VenueFlow solves this by aggregating real-time occupancy data across defined zones (gates, food courts, restrooms) and exposing this data through two interfaces:
1. **Attendee Interface**: Allows users to see live crowd heatmaps, find the fastest navigation routes using pathfinding algorithms, and ask an AI assistant contextual questions about the venue.
2. **Staff Interface**: Allows venue management to monitor zones, manually update occupancies, resolve overcrowding alerts, and request AI-generated crowd control strategies.

### Logical Decision Making
- **Status Derivation:** Zone status (Clear, Moderate, Crowded, Critical) and wait times are dynamically derived using mathematical thresholds based on live capacity ratios.
- **Pathfinding (Dijkstra's Algorithm):** Navigation utilizes Dijkstra's Algorithm, weighting edges based on the *congestion ratio* of the destination zone, naturally routing attendees around crowded areas.
- **AI Context Grounding:** The Gemini assistant doesn't just answer generic questions; it is injected with the live JSON state of the stadium every time a user prompts it, allowing it to provide hyper-accurate, real-time advice.

## How the Solution Works
- **Frontend (React + Vite):** Renders the Google Maps overlay, live metric dashboards, and the chat interface. Connects to Firebase via real-time WebSocket listeners.
- **Backend (Node + Express):** Handles the Gemini 2.5 Flash API proxying, Dijkstra pathfinding execution, authentication verification, and the live simulation engine.
- **Database (Firebase Realtime Database):** Acts as the single source of truth. Updates made here (either manually by staff or by the simulation tick) are instantly reflected on all connected client devices.
- **AI Assistant:** Powered by **Gemini 2.5 Flash**, the assistant provides fast, intelligent responses based on system context. 

## Assumptions & Refinements Needed
To build this prototype within the hackathon time constraints, several assumptions were made:
- **Data Collection:** We assume the venue has physical IoT sensors (turnstiles, cameras) capable of reporting live occupancy to the API. Currently, this is simulated using a backend "tick" engine for demonstration purposes.
- **Stand Mapping:** The polygonal physical boundaries of the stands are currently represented by precise point coordinates on the map. In a fully refined production build, these would be mapped as full geometry polygons on Google Maps.
- **Refinement:** More historical data would be needed to refine the wait-time exponential growth algorithms for different types of zones (e.g., restrooms vs. entry gates).

## Setup & Running Locally
1. Clone the repository.
2. Ensure you have a `.env` file containing Firebase, Gemini, and Google Maps API keys.
3. Install dependencies: `npm install` in both `/client` and `/server`.
4. Start backend: `cd server && npm run dev`
5. Start frontend: `cd client && npm run dev`
6. Click **Start Demo** on the bottom right of the homepage to activate the live simulation engine.

## Evaluation Focus Areas Addressed
- **Code Quality:** Organized in a clean monorepo structure with strict TypeScript constraints and modularized React components.
- **Google Services:** Meaningfully integrates Google Maps (Visualizations), Gemini 2.5 Flash (Dynamic Assistant), and Firebase (Real-time syncing).
- **Security:** API routes are protected, secrets are kept out of the frontend via the `.env` architecture, and Firebase Admin SDK is used securely on the backend.
