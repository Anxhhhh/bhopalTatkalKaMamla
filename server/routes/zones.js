import express from 'express';

const router = express.Router();

// Mock store for Zones telemetry
export let zonesStore = [
  { id: 'alpha', name: 'Zone Alpha', temp: '42°C', status: 'Extreme Heat', color: 'text-error', density: 'High', coordinates: '23.2599° N, 77.4126° E' },
  { id: 'beta', name: 'Zone Beta', temp: '36°C', status: 'Normal Flow', color: 'text-tertiary', density: 'Low', coordinates: '23.2324° N, 77.4302° E' },
  { id: 'gamma', name: 'Zone Gamma', temp: '39°C', status: 'Elevated Warning', color: 'text-primary-container', density: 'Medium', coordinates: '23.2842° N, 77.3998° E' }
];

// GET /api/zones
router.get('/', (req, res) => {
  res.json(zonesStore);
});

// GET /api/zones/:id
router.get('/:id', (req, res) => {
  const zone = zonesStore.find(z => z.id === req.params.id);
  if (!zone) {
    return res.status(404).json({ error: 'Zone not found' });
  }
  res.json(zone);
});

// PUT /api/zones/:id (to simulate sensory updates)
router.put('/:id', (req, res) => {
  const idx = zonesStore.findIndex(z => z.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Zone not found' });
  }
  
  const updatedZone = {
    ...zonesStore[idx],
    ...req.body
  };
  
  zonesStore[idx] = updatedZone;
  res.json(updatedZone);
});

export default router;
