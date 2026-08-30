// =========================================================================
// SCOS SPATIAL ENGINE — HAVERSINE PROXIMITY & GEOSPATIAL CALCULATIONS
// =========================================================================

/**
 * Earth radius in meters (mean radius)
 */
const EARTH_RADIUS_METERS = 6371000;

export interface DistanceCalculationResult {
  distanceMeters: number;
  distanceKm: string;
  isValid: boolean;
  disclaimer: string;
}

/**
 * Calculate Haversine distance between two geographic coordinates.
 * Coordinates must be in decimal degrees.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): DistanceCalculationResult {
  const disclaimer =
    'Haversine distance calculation on prototype spatial coordinates. Not survey-grade positional accuracy.';

  // Coordinate validation
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2) ||
    lat1 < -90 ||
    lat1 > 90 ||
    lat2 < -90 ||
    lat2 > 90 ||
    lon1 < -180 ||
    lon1 > 180 ||
    lon2 < -180 ||
    lon2 > 180
  ) {
    return {
      distanceMeters: Infinity,
      distanceKm: 'Invalid Coordinates',
      isValid: false,
      disclaimer,
    };
  }

  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = Math.round(EARTH_RADIUS_METERS * c * 10) / 10;

  const distanceKm =
    distanceMeters >= 1000
      ? `${(distanceMeters / 1000).toFixed(2)} km`
      : `${Math.round(distanceMeters)} m`;

  return {
    distanceMeters,
    distanceKm,
    isValid: true,
    disclaimer,
  };
}

/**
 * Filter and sort items by proximity to a focal point.
 */
export function filterByProximity<T extends { location: { latitude: number; longitude: number } }>(
  targetLat: number,
  targetLon: number,
  items: T[],
  maxRadiusMeters: number = 2000
): Array<{ item: T; distanceMeters: number; distanceKm: string }> {
  return items
    .map((item) => {
      const calc = calculateHaversineDistance(
        targetLat,
        targetLon,
        item.location.latitude,
        item.location.longitude
      );
      return {
        item,
        distanceMeters: calc.distanceMeters,
        distanceKm: calc.distanceKm,
        isValid: calc.isValid,
      };
    })
    .filter((entry) => entry.isValid && entry.distanceMeters <= maxRadiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
