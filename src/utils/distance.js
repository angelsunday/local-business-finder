// Haversine formula — calculates the great-circle distance between two
// points on a sphere. Gives straight-line ("as the crow flies") distance,
// not walking or driving distance.
// Both arguments are [latitude, longitude] arrays. Returns kilometres.

const EARTH_RADIUS_KM = 6371;

// Trig functions in JS work in radians, but coordinates are in degrees
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function getDistanceKm([lat1, lon1], [lat2, lon2]) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // 'a' is the square of half the chord length between the points
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  // 'c' is the angular distance in radians
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

// Turns 0.42 into "420 m" and 2.7 into "2.7 km" for display
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
