import { CloseOutlined, EnvironmentOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Button, Drawer, Image, Modal, Spin, Tooltip, message } from 'antd';
import React, { memo, useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { mapImages } from '../../assets/mapImage';
import { deleteGulandOnTileLayer, getImageMapLayer, getUrlMapLayer } from '../../services/api';
import { MdFileUpload } from 'react-icons/md';
import './LocationInfoSidebar.css';
import ListGetDistrictProvinces from '../ListGetDistrictProvinces/ListGetDistrictProvinces.jsx';
const LocationInfoSidebar = ({
    inforArea,
    onCloseLocationInfo,
    isLocationInfoOpen,
    locationData,
    handleShareLocationNow,
    handleShareLogoLocation,
    location,
    setIsShowModalUpload,
    RegulationsImagesList,
    handleItemClick,
}) => {
    const map = useMap();
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [fullAddress, setFullAddress] = useState('');
    const [addressDetails, setAddressDetails] = useState({});
    const [provincePlansId, setProvincePlansId] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchUrlParams = new URLSearchParams(searchParams);
    const provinceId = searchParams.get('plans-by-province');
    const quyhoachByProvince = useSelector((state) => state.plansSelected.quyhoachByProvince);
    const quyhoach = useSelector((state) => state.plansSelected.quyhoach);
    const cacheProvince = useSelector((state) => state.plansSelected.cacheProvince);
    const mapZoom = map.getZoom();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();
    const [layerUrl, setLayerUrl] = useState('');
    const [isLayerUrlLoading, setIsLayerUrlLoading] = useState(false);

    const tileLayer = `https://api.quyhoach.xyz/get_quyhoach_theo_tinh/${provincePlansId}/${mapZoom}/${coordinates.x}/${coordinates.y}`;

    const handleShareAddress = () => {
        navigator.clipboard
            .writeText(fullAddress)
            .then(() => {
                message.success('Địa chỉ đã được sao chép vào bộ nhớ');
            })
            .catch(() => {
                message.error('Không thể sao chép địa chỉ');
            });
    };

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        setIsModalOpen(false);
        const res = await deleteGulandOnTileLayer(provincePlansId, mapZoom, coordinates.x, coordinates.y);
        console.log(res);
        if (res.includes('/home/son/Documents/quyhoach-theotinh')) {
            messageApi.open({ type: 'success', content: 'Xóa thành công' });
            setSearchParams(searchParams);
        } else {
            messageApi.open({
                type: 'error',
                content:
                    'Xóa thất bại nếu đã load lại trang thì bấm vào danh sách quy hoạch rồi chọn lại quy hoạch tỉnh',
            });
        }
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // Lấy tọa độ tile x, y từ bản đồ
    useEffect(() => {
        if (location.length > 0) {
            const point = map.project(location, mapZoom);
            const tileSize = 256;
            const tileX = Math.floor(point.x / tileSize);
            const tileY = Math.floor(point.y / tileSize);
            setCoordinates({ x: tileX, y: tileY });
        }
    }, [location, map, mapZoom]);

    useEffect(() => {
        if (location && location.length > 0) {
            const fetchReverseGeocode = async (lat, lon) => {
                const url = `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lon}&zoom=18&format=jsonv2&addressdetails=1`;
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data && data.address) {
                        setFullAddress(data.display_name || 'Không tìm thấy thông tin');
                        setAddressDetails(data.address);
                    } else {
                        setFullAddress('Không thể lấy thông tin địa chỉ');
                    }
                } catch (error) {
                    console.error('Lỗi khi gọi API Nominatim:', error);
                    setFullAddress('Không thể lấy thông tin địa chỉ');
                }
            };
            fetchReverseGeocode(location[0], location[1]);

            (async () => {
                setIsLayerUrlLoading(true);
                try {
                    const { duongdan } = await getUrlMapLayer(mapZoom, coordinates.x, coordinates.y);
                    setLayerUrl(duongdan);
                } catch (error) {
                    console.error(error);
                }
                setIsLayerUrlLoading(false);
            })();
        }
    }, [location]);

    useEffect(() => {
        (async () => {
            const provincePlans = quyhoachByProvince.find((item) => Number(item.id_tinh) === Number(provinceId));
            if (provincePlans) {
                const provincePlansArray = provincePlans.link_image.split('/');
                // set province plan id
                setProvincePlansId(provincePlansArray[provincePlansArray.length - 1]);
            }
        })();
    }, [location]);
    return (
        <>
            {contextHolder}
            <Drawer
                placement={window.innerWidth < 768 ? 'bottom' : 'left'}
                mask={false}
                closeIcon={<CloseOutlined style={{ fontSize: 18 }} />}
                onClose={onCloseLocationInfo}
                open={isLocationInfoOpen}
                key={'bottom'}
                width={window.innerWidth < 768 ? '100%' : 360}
                height={window.innerWidth < 768 ? 'auto' : '100%'}
                className={`overflow-y-hidden ${window.innerWidth > 768 && 'desktop'}`}
            >
                {' '}
                <div className="ant-drawer-body-wrapper">
                    <div>
                        {/* {!locationData?.imageHttp && (
                            <img
                                src={mapImages?.locationInfo}
                                alt="default map 2x"
                                srcSet={mapImages?.locationInfoHd}
                                style={{ width: '100%' }}
                            />
                        )} */}
                        {tileLayer && <Image src={tileLayer} style={{ width: '100%' }} />}
                    </div>

                    <div className="bg-white ant-drawer-body-title-wrapper">
                        <span className="ant-drawer-body-title">
                            {mapZoom}/{coordinates.x}/{coordinates.y}
                        </span>
                        {isLayerUrlLoading && (
                            <Spin
                                spinning
                                size="small"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            />
                        )}
                        {!isLayerUrlLoading && <span className="ant-drawer-body-title">{layerUrl}</span>}

                        {/* <span
                        className="ant-drawer-body-title-coppy"
                        onClick={() => handleShareLogoLocation(`${mapZoom}/${coordinates.x}/${coordinates.y}`)}
                    >
                        Copy
                    </span> */}
                    </div>

                    <div>
                        <div className="ant-drawer-body-function">
                            {(quyhoachByProvince.length > 0 || quyhoach.length > 0) && (
                                <Tooltip title="Lấy tọa độ hiện tại">
                                    <div
                                        className="ant-drawer-body-function-item-wrapper"
                                        onClick={() =>
                                            handleShareLogoLocation(`${mapZoom}/${coordinates.x}/${coordinates.y}`)
                                        }
                                    >
                                        <div className="ant-drawer-body-function-item">
                                            <EnvironmentOutlined className="ant-drawer-body-function-item-icon" />
                                        </div>
                                        <span className="ant-drawer-body-function-item-text">Lấy z x y</span>
                                    </div>
                                </Tooltip>
                            )}

                            <Tooltip title="Chia sẻ vị trí hiện tại">
                                <div
                                    className="ant-drawer-body-function-item-wrapper"
                                    onClick={() => handleShareLocationNow(location)}
                                >
                                    <div className="ant-drawer-body-function-item">
                                        <ShareAltOutlined className="ant-drawer-body-function-item-icon" />
                                    </div>
                                    <span className="ant-drawer-body-function-item-text">Chia sẻ</span>
                                </div>
                            </Tooltip>
                            <Tooltip title="Thêm ảnh cho vị trí hiện tại">
                                <div
                                    className="ant-drawer-body-function-item-wrapper"
                                    onClick={() => {
                                        setIsShowModalUpload({
                                            show: true,
                                            location,
                                        });
                                    }}
                                >
                                    <div className="ant-drawer-body-function-item">
                                        <MdFileUpload size={24} />
                                    </div>
                                    <span className="ant-drawer-body-function-item-text">Upload ảnh</span>
                                </div>
                            </Tooltip>
                        </div>
                        {(quyhoachByProvince.length > 0 || quyhoach.length > 0) && (
                            <div className="ant-drawer-body-tile-layer-wrapper">
                                <img src={tileLayer} alt="ảnh tile layer" className="ant-drawer-body-tile-layer-img" />
                                {/* <Button type="primary" danger onClick={showModal}>
                                    Xóa
                                </Button> */}
                            </div>
                        )}

                        <br />
                        {/* <div className="location-info">
                            <h5>Địa chỉ:</h5>
                            <p>{fullAddress}</p>

                            {fullAddress && (
                                <Tooltip title="Sao chép địa chỉ đầy đủ">
                                    <span
                                        className="ant-drawer-body-title-coppy"
                                        onClick={handleShareAddress}
                                        style={{ color: '#1890ff', cursor: 'pointer' }}
                                    >
                                        Sao chép địa chỉ
                                    </span>
                                </Tooltip>
                            )}
                        </div> */}
                        <ListGetDistrictProvinces
                            address={inforArea}
                            location={location}
                            provincePlansId={provincePlansId}
                            handleItemClick={handleItemClick}
                            RegulationsImagesList={RegulationsImagesList}
                        />
                    </div>
                </div>
                {/* <Modal title="Thông báo" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <p>Bạn có muốn xóa ảnh này không</p>
                </Modal> */}
            </Drawer>
        </>
    );
};

export default memo(LocationInfoSidebar);
