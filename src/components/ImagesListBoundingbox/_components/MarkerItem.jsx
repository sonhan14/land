import { Image } from 'antd';
import L from 'leaflet';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FaShareAlt } from 'react-icons/fa';
import { Marker, Popup, useMapEvent, useMapEvents } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import { icons } from '../../../assets';
import { DATA_TYPE } from '../../../constants/dataType';
import VideoModal from './VideoModal';
import YoutubeThumbnail from './YoutubeThumbnail';
import { useSelector } from 'react-redux';
import { THUNK_API_STATUS } from '../../../constants/thunkApiStatus';
import Image360Modal from './Image360Modal';

const redMarkerIcon = new L.Icon({
    iconUrl: icons.redMarker,
    iconSize: [24, 24],
    iconAnchor: [22, 38],
    popupAnchor: [-10, -50],
});
const MarkerItem = ({ item, handleShareMarkerLocation }) => {
    const location = item?.location?.split(',');
    const viewType = item?.loai_anh;
    const plansLocationId = item?.id_quyhoach;
    let videoId = '';
    const url = item?.imageHttp;
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [is360ImageModalOpen, setIs360ImageModalOpen] = useState(false);
    // const searchUrlParams = useGetParams();
    const markerRef = useRef(null);
    const popupRef = useRef(null);
    // const zoom = searchParams.get('zoom');
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const boundingBoxStatus = useSelector((state) => state.boundingboxSlice.status);
    const searchUrlParams = new URLSearchParams(searchParams);
    const isCorrectLocation = item?.id_quyhoach === Number(searchUrlParams.get('locationId'));
    const isDataAlReady = boundingBoxStatus !== THUNK_API_STATUS.PENDING;
    const shareData = { type: 'locationId', id: item?.id_quyhoach };

    const handleSetUrlParams = () => {
        searchUrlParams.set('locationId', plansLocationId);
        searchUrlParams.set('ups', 'sharing');
        setSearchParams(searchUrlParams);
    };
    const handleDeleteUrlParams = () => {
        searchUrlParams.delete('locationId');
        searchUrlParams.delete('ups');
        setSearchParams(searchUrlParams);
    };
    const handleChangePreview = (visible) => {
        if (!visible) {
            handleDeleteUrlParams();
        }
        setIsPreviewVisible(visible);
    };

    const handleOpenVideo = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
        handleSetUrlParams();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        handleDeleteUrlParams();
    };

    const handleOpenImage360 = () => {
        setIs360ImageModalOpen(true);
        handleSetUrlParams();
    };

    const handle360ImageCancel = () => {
        setIs360ImageModalOpen(false);
        handleDeleteUrlParams();
    };
    if (viewType === DATA_TYPE.FLYCAM_VIDEO) {
        if (url.includes('watch')) {
            // url example https://www.youtube.com/watch?v=SCM0xI64Peo
            videoId = url.split('=')?.[1];
        } else {
            // url example https://youtu.be/_MZ5y8wMAEk?si=GLhVAnNzifan0hJ3o
            videoId = url.split('/')?.[3].split('?')?.[0];
        }
    }

    useMapEvents({
        dragstart: () => {
            markerRef.current?.closePopup();
        },
        zoomstart: () => {
            markerRef.current?.closePopup();
        },
        // click: () => {
        //     markerRef.current?.openPopup();
        // },
    });

    useEffect(() => {
        if (markerRef.current && isCorrectLocation && isDataAlReady) {
            markerRef.current.openPopup();
        }
        if (
            (viewType === DATA_TYPE.FLYCAM || viewType === DATA_TYPE.GROUND_IMAGES) &&
            isCorrectLocation &&
            isDataAlReady &&
            !isPreviewVisible
        ) {
            setIsPreviewVisible(true);
        }
        if (
            (viewType === DATA_TYPE.FLYCAM_VIDEO || viewType === DATA_TYPE.VIDEO) &&
            isCorrectLocation &&
            isDataAlReady &&
            !isModalOpen
        ) {
            setIsModalOpen(true);
        }
        if (viewType === DATA_TYPE.IMAGE_360 && isCorrectLocation && isDataAlReady && !is360ImageModalOpen) {
            handleOpenImage360(true);
        }
    }, [boundingBoxStatus]);

    return (
        <>
            <Marker
                position={location}
                icon={redMarkerIcon}
                ref={markerRef}
                // eventHandlers={{
                //     click: (e) => {
                //         e.stopPropagation();
                //         return e.target.openPopup();
                //     },
                // }}
            >
                {/* <LTooltip
                permanent
                direction="top"
                offset={[-10, -30]}
                opacity={1}
                className="no-background-tooltip no-arrow-bg"
            >
                {item.description}
            </LTooltip> */}
                <Popup
                    ref={popupRef}
                    autoPan={false}
                    closeOnEscapeKey
                    autoClose
                    eventHandlers={{
                        click: (e) => e.target.open(),
                    }}
                >
                    {(viewType === DATA_TYPE.FLYCAM || viewType === DATA_TYPE.GROUND_IMAGES) && (
                        <Image
                            src={item?.imageHttp}
                            alt={item?.id_quyhoach}
                            className="popup-thumnail"
                            preview={{
                                visible: isPreviewVisible,
                                onVisibleChange: handleChangePreview,
                            }}
                        />
                    )}
                    {(viewType === DATA_TYPE.FLYCAM_VIDEO || viewType === DATA_TYPE.VIDEO) && (
                        <div onClick={handleOpenVideo}>
                            <YoutubeThumbnail youtubeId={videoId} />
                        </div>
                    )}
                    {viewType === DATA_TYPE.IMAGE_360 && (
                        <div onClick={handleOpenImage360}>
                            <img
                                src={url}
                                alt={`Ảnh quy hoạch ${item?.id_quyhoach}`}
                                className="image-360-thumbnail"
                                style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                            />
                        </div>
                    )}
                    <span className="popup-description">
                        Quy hoạch: {item?.description || 'Chưa có thông tin mô tả'}
                    </span>
                    <button className="button--share" onClick={() => handleShareMarkerLocation(location, shareData)}>
                        <FaShareAlt />
                        Chia sẻ vị trí
                    </button>
                </Popup>
            </Marker>
            <Image360Modal
                isModalOpen={is360ImageModalOpen}
                imageUrl={url}
                handleOk={handleOpenImage360}
                handleCancel={handle360ImageCancel}
            />
            <VideoModal isModalOpen={isModalOpen} url={url} handleCancel={handleCancel} handleOk={handleOk} />
        </>
    );
};

export default memo(MarkerItem);
