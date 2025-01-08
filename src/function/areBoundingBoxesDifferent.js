export const areBoundingBoxesDifferent = (current, southwest, northeast) => {
    const threshold = 0.0001; // Ngưỡng sai số nhỏ
    return (
        Math.abs(current.minLat - southwest.lat) > threshold ||
        Math.abs(current.maxLat - northeast.lat) > threshold ||
        Math.abs(current.minLng - southwest.lng) > threshold ||
        Math.abs(current.maxLng - northeast.lng) > threshold
    );
};
