import { message } from 'antd';
import { memo, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../../redux/LocationSlice/locationSlice';

const GoToLocation = () => {
    const map = useMap();
    const zoom = 20;
    const mapCenter = map.getCenter();
    const location = useSelector((state) => state.locationSlice.location);
    const lng = Number(location.lng).toFixed(5);
    const lat = Number(location.lat).toFixed(5);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        if (Object.values(location).length > 0) {
            if (mapCenter.lat.toFixed(5) !== lat && mapCenter.lng.toFixed(5) !== lng) {
                map.flyTo({ lat, lng }, zoom, {
                    duration: 1,
                });
            } else if (mapCenter.lat.toFixed(5) === lat && mapCenter.lng.toFixed(5) === lng) {
                messageApi.open({ type: 'info', content: 'Bạn đã ở khu vực này rồi!' });
            }
        }
    }, [location]);

    return <>{contextHolder}</>;
};

export default memo(GoToLocation);
