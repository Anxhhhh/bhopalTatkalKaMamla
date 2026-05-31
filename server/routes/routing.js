import express from 'express';

const router = express.Router();

// POST /api/routing/calculate
router.post('/calculate', (req, res) => {
  const { source, destination, preference } = req.body;

  if (!source || !destination) {
    return res.status(400).json({ error: 'source and destination parameters are required' });
  }

  const routePreference = preference || 'comfort';

  // Generate a mock response based on preferences
  let result = {};

  if (routePreference === 'speed') {
    result = {
      routeName: 'Link Road Express Corridor',
      travelTime: '11 mins',
      comfortIndex: '48%',
      distance: '4.8 km',
      incidents: [
        'Congestion high near Zone Alpha junction (+5m delay).',
        'Direct sun exposure (No shade coverage).'
      ],
      steps: [
        'Depart from origin zone.',
        'Merge onto Link Road Express Corridor.',
        'Proceed straight through Major Crossing.',
        'Arrive at target zone.'
      ]
    };
  } else {
    // default: comfort
    result = {
      routeName: 'Shaded Boulevard & Lake Bypass',
      travelTime: '15 mins',
      comfortIndex: '88%',
      distance: '5.6 km',
      incidents: [
        'Zero traffic incidents.',
        'Max shade density (90% canopy coverage).',
        'Avoids Zone Alpha heat island.'
      ],
      steps: [
        'Depart from origin zone.',
        'Turn left onto Shaded Boulevard bypass.',
        'Follow Lake shore parkway corridor (temperature decreases -3°C).',
        'Enter target zone via green gate corridor.'
      ]
    };
  }

  res.json({
    source,
    destination,
    preference: routePreference,
    timestamp: new Date().toISOString(),
    route: result
  });
});

export default router;
