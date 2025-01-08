import { CheckCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Button, Image, Skeleton } from 'antd';
import { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../../../redux/LocationSlice/locationSlice';
const ImagePlan = ({ item }) => {
    const location = item.location.split(',');
    const locationWasGoto = useSelector((state) => state.locationSlice.location.planningId);
    const dispatch = useDispatch();

    // Check url location is equal to location return by api
    const handleCheckLocationIsEqual = () => {
        dispatch(setLocation({ lat: location[0], lng: location[1], planningId: item.id_quyhoach }));
    };

    useEffect(() => {
        return () => {
            if (item.id_quyhoach === locationWasGoto) {
                dispatch(setLocation({ planningId: 0 }));
            }
        };
    }, []);
    return (
        <div className="my-3 image-location">
            <Image
                src={item?.imageHttp}
                loading="lazy"
                alt={`Ảnh quy hoạch ${item.id_quyhoach}`}
                className="image-item"
            />
            {!item && <Skeleton.Image active={true} />}
            <button
                onClick={handleCheckLocationIsEqual}
                className={`image-location-btn ${locationWasGoto === item.id_quyhoach ? 'active' : ''}`}
            >
                Đi tới
                {locationWasGoto === item.id_quyhoach && <CheckCircleOutlined style={{ color: 'green' }} />}
            </button>
        </div>
    );
};

export default memo(ImagePlan);
