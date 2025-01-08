import { useState, useEffect } from 'react';

function useGetMyLocation() {
    const [location, setLocation] = useState({ lat: null, lng: null });
    useEffect(() => {
        let locationId = 0;
        if (navigator.geolocation) {
            locationId = navigator.geolocation.watchPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.log(error);
                },
                {
                    enableHighAccuracy: true, // Đảm bảo độ chính xác cao
                    timeout: 10000, // Thời gian chờ
                    maximumAge: 0, // Không sử dụng vị trí đã lưu
                },
            );
        } 
        return () => navigator.geolocation.clearWatch(locationId);
    }, []);

    return location;
}

export default useGetMyLocation;
