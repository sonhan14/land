import axios from 'axios';

export const getPolygonsByNames = async (names) => {
    const promises = names.map((name, i) => {
        if (i === 1) {
            return null;
        }
        return axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                city: name.TenTinhThanhPho,
                format: 'json',
                polygon_geojson: 1,
            },
        });
    });

    const res = await Promise.all(promises);
    console.log(res, 'res');
    console.log('object');
};

export const getPolygonsQuanHuyen = async (id) => {
    try {
        const response = await axios.get(`https://api.quyhoach.xyz/get_polygon_district/${id}`);

        return response.data.duongdan[0];
    } catch (error) {
        console.error('Error fetching polygon data:', error);
        throw error;
    }
};

export const getPolygonsTinh = async (id) => {
    try {
        const response = await axios.get(`https://api.quyhoach.xyz/get_polygon_provinces/${id}`);

        return response.data.duongdan[0];
    } catch (error) {
        console.error('Error fetching polygon data:', error);
        throw error;
    }
};

