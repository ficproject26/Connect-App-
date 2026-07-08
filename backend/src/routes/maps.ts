import { Router, Request, Response } from 'express';

const router = Router();

// Geolocation distance formula
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate street-aligned simulated route coordinates
function interpolateRoute(lat1: number, lon1: number, lat2: number, lon2: number, stepsCount = 12): [number, number][] {
  const points: [number, number][] = [];
  
  // We simulate street grids instead of a straight line.
  // We go vertically first, then horizontally, adding a bit of noise for realistic curves.
  const midLat = lat1 + (lat2 - lat1) * 0.4;
  const midLng = lon1 + (lon2 - lon1) * 0.7;

  const controlPoints = [
    [lat1, lon1],
    [midLat, lon1],
    [midLat, midLng],
    [lat2, midLng],
    [lat2, lon2]
  ];

  // Interpolate between control points
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const start = controlPoints[i];
    const end = controlPoints[i + 1];
    
    const segmentSteps = Math.ceil(stepsCount / (controlPoints.length - 1));
    for (let j = 0; j < segmentSteps; j++) {
      const t = j / segmentSteps;
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      // Add micro noise (±0.0001) for route curvature
      const jitterLat = lat + (Math.sin(j) * 0.00015);
      const jitterLng = lng + (Math.cos(j) * 0.00015);
      
      points.push([jitterLat, jitterLng]);
    }
  }

  points.push([lat2, lon2]);
  return points as [number, number][];
}

// POST: /api/maps/route
router.post('/route', (req: Request, res: Response) => {
  const { startLat, startLng, endLat, endLng } = req.body;

  if (startLat === undefined || startLng === undefined || endLat === undefined || endLng === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'startLat, startLng, endLat, and endLng are required.'
    });
  }

  try {
    const lat1 = Number(startLat);
    const lon1 = Number(startLng);
    const lat2 = Number(endLat);
    const lon2 = Number(endLng);

    const distance = getDistance(lat1, lon1, lat2, lon2);
    // Assume average velocity of 24 km/h (0.4 km per minute)
    const duration = Math.ceil(distance / 0.4) + 2; // add 2 mins buffer for traffic
    
    const routePath = interpolateRoute(lat1, lon1, lat2, lon2);

    res.json({
      status: 'success',
      data: {
        distance: parseFloat(distance.toFixed(2)), // km
        duration, // minutes
        route: routePath
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate route: ' + error.message
    });
  }
});

export default router;
