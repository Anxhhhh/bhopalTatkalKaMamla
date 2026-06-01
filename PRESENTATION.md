# 🏙️ Project Presentation: Bhopal Tatkal Mamla

Use this guide for slides, notes, or explanations for your project presentation.

---

## 1. Project Overview (What the Website is About)
**Bhopal Tatkal Mamla** is a premium, next-generation urban monitoring dashboard and comfort-focused route optimizer designed for the city of Bhopal, India. 

### The Core Problem it Solves:
Standard navigation apps focus purely on the *fastest* route, often leading commuters through congested highways under extreme sun exposure. During Indian summers or major sporting events, commuters face severe heatwaves and massive traffic bottlenecks.

### The Solution:
Our platform introduces **Comfort Routing** and **Real-Time Telemetry Tracking** by combining:
1. **Live Traffic Densities** to avoid crowded hubs.
2. **Real-time Thermal Telemetry** to avoid urban heat islands.
3. **Smart Rerouting Event Triggers** (e.g., automated crowd redirections during stadium events).

---

## 2. Technical Architecture & Tech Stack
The platform is built using a modern, decoupled **MERN-lite** architecture:

*   **Frontend**: 
    *   **React** (component-based interactive UI)
    *   **Vite** (ultra-fast bundler and development server)
    *   **Tailwind CSS v4** (custom utilities, fluid animations, and premium dark glassmorphism styling)
*   **Backend**: 
    *   **Node.js & Express** (handling configuration secrets, routing APIs, and background data synchronization)
*   **External Services & API Integrations**:
    *   **Google Maps JavaScript SDK**: Renders interactive maps with customized styles.
    *   **Google Directions API**: Calculates real route durations, driving steps, and draws active paths.
    *   **Open-Meteo API**: Automatically polls live weather telemetry for Bhopal coordinates.

---

## 3. Website Flow (How It Works)

1.  **Landing Page**: Commuters are welcomed by a sleek, cyberpunk-styled dashboard preview featuring a satellite map of Bhopal. They can inspect the core modules (Traffic, Heat, Crowd, and Comfort features) or select **Launch App** to enter the control room.
2.  **Dashboard Control Room**: 
    *   **Left Column**: Shows active sensors for Bhopal's critical zones (Zone Alpha: TT Nagar, Zone Beta: MP Nagar, Zone Gamma: Bhopal Junction). Below it runs a live terminal logging simulated system-wide telemetry dispatch events.
    *   **Center Column**: Houses the main Google Map with interactive location markers. Commuters can switch views between **Satellite**, **Vector Grid**, or **Heatmap** (which overlays a live **Google Traffic Layer**).
    *   **Right Column**: Tracks transit hub flow rates (e.g., Habibganj Station passenger flow) and key command variables.

---

## 4. Key Premium Features & Implementations

### 🟢 A. Live Weather Telemetry (Heat-Aware Grid)
*   Instead of static dummy files, the backend queries the **Open-Meteo API** every 5 minutes using latitude/longitude coordinates for TT Nagar, MP Nagar, and Bhopal Junction.
*   If temperatures climb above 40°C, the system dynamically changes status alarms on the dashboard to **"Extreme Heat"** or **"Elevated Warning"** so commuters know which areas to avoid.

### 🟢 B. Comfort Routing Calculator
*   Commuters choose their origin, destination, and priority preference (**Comfort** vs. **Speed**).
*   The system uses the **Google Directions Service** to compute the path. It maps the route polyline onto the interactive dashboard in real time, showing the exact distance, travel duration, and navigation instructions.
*   If the user selects "Comfort", the app computes a higher comfort score emphasizing shaded boulevard bypasses to avoid direct sun exposure.

### 🟢 C. Interactive Traffic Heatmap
*   Toggling the **Heatmap** view embeds a real-time Google Maps Traffic Layer. It instantly displays color-coded congestion data (green, yellow, red lines) directly on the streets of Bhopal, pulling live telemetry from Google's database.

### 🟢 D. Special Event Management (Cricket Mode)
*   A dedicated controller enables **Cricket Mode** for matches at Aishbagh Stadium.
*   When active, it displays match-day analytics (such as live ticket scan rates, gate congestion, stadium shuttle delays, and parking space counters) and routes non-essential traffic away from the stadium to prevent gridlock.

---

## 5. Deployment Flow (Production-Ready)
To ensure optimal performance and security, we decoupled the front and back ends:
*   **Backend (Render)**: Hosts the Express server, securely stores the Google Maps API key, runs background weather sync intervals, and serves telemetry APIs via CORS.
*   **Frontend (Netlify)**: Hosts the static React build, loading the Google Maps SDK dynamically on the client side using the environment variable `VITE_API_URL` to query the Render server.
