import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import zonesRouter from './routes/zones.js';
import stationsRouter from './routes/stations.js';
import routingRouter from './routes/routing.js';
import eventsRouter from './routes/events.js';
import logsRouter from './routes/logs.js';

import { zonesStore } from './routes/zones.js';
import { stationsStore } from './routes/stations.js';
import { logsStore } from './routes/logs.js';

// Load environment configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all cross-origin requests
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });
});

let lastWeatherFetchSuccess = false;

// Fetch real temperature from Open-Meteo weather API for Bhopal zones
async function fetchRealBhopalWeather() {
  try {
    const zonesMapping = [
      { id: 'alpha', lat: 23.2324, lng: 77.3998 },
      { id: 'beta', lat: 23.2330, lng: 77.4300 },
      { id: 'gamma', lat: 23.2726, lng: 77.4100 }
    ];

    await Promise.all(zonesMapping.map(async (zone) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${zone.lat}&longitude=${zone.lng}&current=temperature_2m`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data.current && data.current.temperature_2m !== undefined) {
        const tempVal = Math.round(data.current.temperature_2m);
        const zStore = zonesStore.find(z => z.id === zone.id);
        if (zStore) {
          zStore.temp = `${tempVal}°C`;
          if (tempVal >= 40) {
            zStore.status = 'Extreme Heat';
            zStore.color = 'text-error';
          } else if (tempVal >= 38) {
            zStore.status = 'Elevated Warning';
            zStore.color = 'text-primary-container';
          } else {
            zStore.status = 'Normal Flow';
            zStore.color = 'text-tertiary';
          }
        }
      }
    }));
    
    lastWeatherFetchSuccess = true;
    console.log('[WEATHER API] Real-time Bhopal temperature telemetry sync complete.');
  } catch (err) {
    console.warn('[WEATHER API] Sync failed. Falling back to local temperature adjustments.', err.message);
    lastWeatherFetchSuccess = false;
  }
}

// Initial weather fetch on startup
fetchRealBhopalWeather();

// Fetch weather periodically every 5 minutes (300000ms)
setInterval(fetchRealBhopalWeather, 300000);

// Background live simulation loop (Flow updates & Logs)
setInterval(() => {
  // 1. Simulate station flow rate & status shifts
  stationsStore.forEach(st => {
    const flowVal = Math.floor(Math.random() * 80) + 10;
    st.flowRate = `${flowVal} pax/min`;
    if (flowVal > 70) {
      st.status = 'High Density';
      st.color = 'bg-error/20 border-error/50 text-error';
    } else if (flowVal < 25) {
      st.status = 'Low Density';
      st.color = 'bg-primary-container/20 border-primary-container/50 text-primary-container';
    } else {
      st.status = 'Normal Flow';
      st.color = 'bg-tertiary-container/20 border-tertiary-container/50 text-tertiary-container';
    }
  });

  // 2. Simulate temperature adjustments slightly (+- 1C) only if Weather API failed
  if (!lastWeatherFetchSuccess) {
    zonesStore.forEach(z => {
      const currentTemp = parseInt(z.temp, 10);
      const tempChange = Math.random() > 0.5 ? 1 : -1;
      let newTemp = currentTemp + tempChange;
      if (newTemp > 44) newTemp = 44;
      if (newTemp < 35) newTemp = 35;
      z.temp = `${newTemp}°C`;
    });
  }

  // 3. Add random dispatch events
  const eventTypes = ['SYSTEM', 'ROUTING', 'WEATHER', 'CRICKET', 'SENSOR'];
  const details = [
    'Commuter corridor redirection completed successfully.',
    'Thermal node telemetry synchronized in central grid.',
    'Stadium Shuttle Line 4 reports +12m queue time.',
    'Solar thermal warning updated for Zone Alpha.',
    'Re-routing algorithm loaded comfort weighting indices.'
  ];
  const newLog = `${eventTypes[Math.floor(Math.random() * eventTypes.length)]}: ${details[Math.floor(Math.random() * details.length)]}`;
  logsStore.push(newLog);
  if (logsStore.length > 50) logsStore.shift();
}, 4000);

// Base diagnostic endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Bhopal Tatkal Telemetry Core',
    timestamp: new Date().toISOString()
  });
});

// API Routes Mounting
app.use('/api/zones', zonesRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/routing', routingRouter);
app.use('/api/events', eventsRouter);
app.use('/api/logs', logsRouter);

// Standard 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: 'Internal system error' });
});

// Start Server listening
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Bhopal Tatkal Backend Core listening on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
