import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { getBoundingboxData } from '../../redux/boundingMarkerBoxSlice/boundingMarkerBoxSlice';

const GetBoundingBoxOnFirstRender = () => {
    const map = useMap();
    const mapZoom = map.getZoom();
    const { _northEast, _southWest } = map.getBounds();
    const southWest = _southWest;
    const northEast = _northEast;
    const dispatch = useDispatch();

    useEffect(() => {
        if (mapZoom >= 15) {
            dispatch(getBoundingboxData({ southWest: southWest, northEast: northEast }));
        }
    }, []);

    return <></>;
};

export default GetBoundingBoxOnFirstRender;
