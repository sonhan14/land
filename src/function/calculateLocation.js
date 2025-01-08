export const calculateLocation = (plans) => {
    let minLon = 0;
    let minLat = 0;
    let maxLon = 0;
    let maxLat = 0;
    const center = [];

    const everage = plans.length * 2;
    
    plans.forEach((item) => {
        minLon += Number(item[0]);
        minLat += Number(item[1]);
        maxLon += Number(item[2]);
        maxLat += Number(item[3]);
    });
    const centerLon = (minLon + maxLon) / everage;
    const centerLat = (minLat + maxLat) / everage;

    center.push(centerLon);
    center.push(centerLat);

    return center;
};
