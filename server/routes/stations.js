import express from 'express';

const router = express.Router();

// Mock store for Stations density flow
export let stationsStore = [
  { id: 'habibganj', name: 'Habibganj Station (A)', status: 'High Density', color: 'bg-error/20 border-error/50 text-error', flowRate: '89 pax/min' },
  { id: 'bhopal_junction', name: 'Bhopal Junction (B)', status: 'Normal Flow', color: 'bg-tertiary-container/20 border-tertiary-container/50 text-tertiary-container', flowRate: '42 pax/min' },
  { id: 'nadra_bus', name: 'Nadra Bus Stand (C)', status: 'Low Density', color: 'bg-primary-container/20 border-primary-container/50 text-primary-container', flowRate: '18 pax/min' }
];

// GET /api/stations
router.get('/', (req, res) => {
  res.json(stationsStore);
});

// GET /api/stations/:id
router.get('/:id', (req, res) => {
  const station = stationsStore.find(s => s.id === req.params.id);
  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }
  res.json(station);
});

// POST /api/stations/:id/flow (sensor ingestion simulation)
router.post('/:id/flow', (req, res) => {
  const idx = stationsStore.findIndex(s => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Station not found' });
  }

  const { flowRate } = req.body;
  if (flowRate === undefined) {
    return res.status(400).json({ error: 'flowRate field is required' });
  }

  const parsedFlow = parseInt(flowRate, 10);
  let status = 'Normal Flow';
  let color = 'bg-tertiary-container/20 border-tertiary-container/50 text-tertiary-container';

  if (parsedFlow > 70) {
    status = 'High Density';
    color = 'bg-error/20 border-error/50 text-error';
  } else if (parsedFlow < 25) {
    status = 'Low Density';
    color = 'bg-primary-container/20 border-primary-container/50 text-primary-container';
  }

  const updatedStation = {
    ...stationsStore[idx],
    flowRate: `${parsedFlow} pax/min`,
    status,
    color
  };

  stationsStore[idx] = updatedStation;
  res.json(updatedStation);
});

export default router;
