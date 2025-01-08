export function isPointInBounds(lat,lng, bounds) {
    const { minLat, maxLat, minLng, maxLng } = bounds;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  
}
