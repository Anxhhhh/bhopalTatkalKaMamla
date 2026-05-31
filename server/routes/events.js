import express from 'express';

const router = express.Router();

// Mock store for Event status
export let cricketEventStore = {
  active: true,
  eventName: 'Bhopal Premier Cricket League Finals',
  venue: 'Aishbagh Stadium Zone',
  ticketScansPerHour: 14240,
  gateCongestionIndex: 92,
  alternativeParkingSpots: 120,
  shuttleStatus: 'DELAYED (14m)',
  transitCorridorRedirect: 'ACTIVE'
};

// GET /api/events/cricket
router.get('/cricket', (req, res) => {
  res.json(cricketEventStore);
});

// POST /api/events/toggle
router.post('/toggle', (req, res) => {
  const { active } = req.body;
  if (active === undefined) {
    // Toggle state if not provided
    cricketEventStore.active = !cricketEventStore.active;
  } else {
    cricketEventStore.active = !!active;
  }

  res.json({
    message: `Cricket mode status set to ${cricketEventStore.active ? 'ACTIVE' : 'INACTIVE'}`,
    event: cricketEventStore
  });
});

// POST /api/events/cricket/update (simulate updating metrics)
router.post('/cricket/update', (req, res) => {
  const { ticketScans, congestionIndex, parkingSpots, shuttleStatus } = req.body;

  if (ticketScans !== undefined) cricketEventStore.ticketScansPerHour = parseInt(ticketScans, 10);
  if (congestionIndex !== undefined) cricketEventStore.gateCongestionIndex = parseInt(congestionIndex, 10);
  if (parkingSpots !== undefined) cricketEventStore.alternativeParkingSpots = parseInt(parkingSpots, 10);
  if (shuttleStatus !== undefined) cricketEventStore.shuttleStatus = String(shuttleStatus);

  res.json({
    message: 'Stadium analytics telemetry updated successfully',
    event: cricketEventStore
  });
});

export default router;
