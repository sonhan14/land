import { useMap } from 'react-leaflet';
import { memo, useEffect } from 'react';
export default memo(function ResetCenterView({ lat, lon, zoom }) {
    const map = useMap();
    // console.log('lat', lat);
    // console.log('lng', lon);

    // console.log('zoom', map.getZoom());
    useEffect(() => {
        if (lat && lon) {
            map.setView([lat, lon], zoom || map.getZoom(), {
                animate: true,
            });
        }
    }, [lat, lon]);

    return null;
});
