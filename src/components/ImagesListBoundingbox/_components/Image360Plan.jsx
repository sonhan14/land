import { EnvironmentOutlined } from '@ant-design/icons';
import { Button, Skeleton } from 'antd';
import { memo } from 'react';
import { useDispatch } from 'react-redux';
import { setLocation } from '../../../redux/LocationSlice/locationSlice';

const Image360Plan = ({ item, onViewImage360 }) => {
    const location = item.location.split(',');
    const dispatch = useDispatch();
    const url = item.imageHttp;

    // example "https://quyhoach.xyz/image_public/louiscity-daimo.jpg"
    const imageId = item.imageHttp.split('/')[4].slice(0, -4);

    // Check url location is equal to location return by api

    const handleCheckLocationIsEqual = (e) => {
        e.stopPropagation();
        dispatch(setLocation({ lat: location[0], lng: location[1] }));
    };

    return (
        <div className="my-3 image-location" onClick={() => onViewImage360(url, imageId)}>
            <img src={url} alt={`Ảnh quy hoạch ${item.id_quyhoach}`} className="image-item" />
            {!item && <Skeleton.Image active={true} />}
            <Button
                size="small"
                onClick={handleCheckLocationIsEqual}
                className="image-location-btn"
                icon={<EnvironmentOutlined />}
                iconPosition="end"
            >
                Đi tới
            </Button>
        </div>
    );
};

export default memo(Image360Plan);
