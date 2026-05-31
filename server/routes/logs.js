import express from 'express';

const router = express.Router();

// Mock store for central system log events
export let logsStore = [
  'SYSTEM: Ingestion Core connected to 1,240 municipal sensors.',
  'ROUTING: Recalculating active corridors near TT Nagar.',
  'WEATHER: Temperature spike detected in Zone Alpha (42°C).',
  'CRICKET: Stadium Zone flow-redirection system standby.',
  'ALERT: Congestion on Hoshangabad Road elevated (+24%).'
];

// GET /api/logs
router.get('/', (req, res) => {
  res.json(logsStore);
});

// POST /api/logs
router.post('/', (req, res) => {
  const { category, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message field is required' });
  }

  const logCategory = category ? category.toUpperCase() : 'INFO';
  const newLog = `${logCategory}: ${message}`;

  logsStore.push(newLog);

  // keep last 50 logs only
  if (logsStore.length > 50) {
    logsStore.shift();
  }

  res.status(201).json({
    message: 'Log entry published successfully',
    log: newLog,
    allLogs: logsStore
  });
});

export default router;
