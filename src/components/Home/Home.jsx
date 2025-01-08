import { FaLocationArrow, FaPaintBrush } from 'react-icons/fa';
import { FaArrowRotateLeft, FaUpload } from 'react-icons/fa6';
import { FiPlus } from 'react-icons/fi';
import { GiGolfFlag, GiPathDistance } from 'react-icons/gi';
import { LuShare2 } from 'react-icons/lu';
import { MdDeleteForever, MdIntegrationInstructions } from 'react-icons/md';
import { RiSubtractLine } from 'react-icons/ri';
import './Home.scss';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GrLocation } from 'react-icons/gr';

import { Button, Drawer, message, notification, Spin, Tooltip } from 'antd';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import 'rc-slider/assets/index.css';
import { FileUploadIcon } from '../Icons';
import ModalDownMenu from './ModalDown/ModalDownMenu';
import ModalPriceFilter from './ModalDown/ModalPriceFilter';
import ModalDistance from './ModalDistance';
import { AimOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import fetchProvinceName from '../../function/findProvince';
import useTableListOpen from '../../hooks/useTableListOpen';
import useWindowSize from '../../hooks/useWindowSise';
import { backToMyLocation } from '../../redux/search/searchSlice';
import useGetMyLocation from '../Hooks/useGetMyLocation';
import Map from '../Map';
import TablePlans from './TablePlans';
import { TbRulerMeasure } from 'react-icons/tb';
import { setPlanByProvince, setPlansInfo } from '../../redux/plansSelected/plansSelected';
import { setTreeCheckedKey } from '../../redux/apiCache/treePlans';
import ModalUploadImages from './ModalUploadImages';
import {
    getAllPlannings,
    getKeHoachsdds,
    getQuyHoach1500,
    getQuyHoach2030,
    getQuyHoachDiaChinh,
    getQuyHoachTinh,
    getQuyHoachXayDung,
} from '../../redux/AllPlansSlice/AllPlansSlice';
import ModalInstruction from './ModalInstruction';
import MoDalQuyHoachCenter from './MoDalQuyHoachCenter/MoDalQuyHoachCenter';
import ModalLogin from '../Auth/ModalNotification';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function Home() {
    const [opacity, setOpacity] = useState(1);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [activeItem, setActiveItem] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalUpLoadVisible, setIsModalUploadVisible] = useState(false);
    const [isShowModalPrice, setIsShowModalPrice] = useState(false);
    const [isShowModalQuyhoach, setIsShowModalQuyhoach] = useState(false);
    const [idDistrict, setIdDistrict] = useState(null);
    const dispatch = useDispatch();
    const { isOpen, handleCloseTableList } = useTableListOpen();
    const myLoca = useGetMyLocation();
    const [messageApi, contextHolder] = message.useMessage();
    const { districtName, provinceName } = useSelector((state) => state.searchQuery.searchResult);
    const mapRef = useRef(null);
    const location = useLocation();
    const windowSize = useWindowSize();
    const [isRefreshTreeData, setIsRefreshTreeData] = useState(false);
    const [isSelectedMeasure, setIsSelectedMeasure] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [distances, setDistances] = useState([]);
    const [isShowModalDistance, setIsShowModalDistance] = useState(false);
    const plansStored = useSelector((state) => state.plansSelected.quyhoach);
    const planByProvince = useSelector((state) => state.plansSelected.quyhoachByProvince);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchUrlParams = new URLSearchParams(searchParams);
    const [isShowModalUpload, setIsShowModalUpload] = useState({ show: false });
    const isModalOpen = location.pathname === '/instruction';
    const [isShowModalInstruction, setIsShowModalInstruction] = useState(isModalOpen ? true : false);
    const [selectedButton, setSelectedButton] = useState(1);
    const [quyHoachList, setQuyHoachList] = useState([]);
    const [isShowModalQuyHoachCenter, setIsShowModalQuyHoachCenter] = useState(false);
    const [dataByType, setDataByType] = useState({
        QUAN_HUYEN: [],
        QUYHOACH_DIACHINH: [],
        QUYHOACH_TINH: [],
        QUYHOACH_XAYDUNG: [],
        QUYHOACH_PHANKHU: [],
    });
    const [buttonLabels, setButtonLabels] = useState([]);
    const [buttonMoRong, setButtonMoRong] = useState('button1');

    // useEffect(() => {
    //     const searchParams = new URLSearchParams(location.search);
    //     const vitriParam = searchParams.get('vitri');
    //     const vitri = vitriParam ? vitriParam.split(',').map(Number) : [];
    //     if (vitri.length === 2) {
    //       const fetchData = async () => {
    //         try {
    //           const data = await fetchProvinceName(vitri[0], vitri[1]);
    //           if (data) {
    //             setPosition(data);
    //           }
    //         } catch (error) {
    //           console.error('Error fetching province data:', error);
    //         }
    //       };

    //       fetchData();
    //     }
    //   }, [location.search]);

    // const {  displayName } = useSelector((state) => state.searchQuery.searchResult);
    const doRefreshTreeData = (value) => {
        if (value) {
            setIsRefreshTreeData(!isRefreshTreeData);
        } else {
            setIsRefreshTreeData(value);
        }
    };
    const handleRemoveAllPlans = () => {
        if (plansStored.length > 0 || planByProvince.length > 0) {
            messageApi.open({ type: 'success', content: 'Đã xóa toàn bộ quy hoạch' });
            dispatch(setPlansInfo([]));
            dispatch(setPlanByProvince([]));
            dispatch(setTreeCheckedKey([]));

            if (searchUrlParams.get('plans-by-province')) {
                searchUrlParams.delete('plans-by-province');
            }
            if (searchUrlParams.get('quyhoach')) {
                searchUrlParams.delete('quyhoach');
            }
            setSearchParams(searchUrlParams);
        } else {
            messageApi.info('Hiện tại chưa có quy hoạch nào cần xóa');
        }
    };
    const handleShareClick = () => {
        const urlParams = new URLSearchParams(location.search);
        if (selectedPosition) {
            const { lat, lon } = selectedPosition;

            urlParams.set('vitri', `${lat},${lon}`);

            const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;

            navigator.clipboard
                .writeText(newUrl)
                .then(() => {
                    messageApi.open({
                        type: 'success',
                        content: 'Đã sao chép vào bộ nhớ',
                    });
                })
                .catch((err) => {
                    messageApi.open({
                        type: 'error',
                        content: 'Lỗi khi sao chép vào bộ nhớ',
                    });
                });
        } else {
            messageApi.open({
                type: 'error',
                content: 'Vui lòng chọn vị trí bạn muốn chia sẻ',
            });
        }
    };

    const handleSliderChange = (event) => {
        setOpacity(event.target.value);
    };

    const handleLocationArrowClick = () => {
        if (!selectedPosition) {
            messageApi.open({ type: 'success', content: 'Vui lòng chọn vị trí bạn muốn tìm' });
        } else {
            const [lat, lon] = selectedPosition;
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
        }
    };

    const handleCloseModal = () => {
        setIsModalUploadVisible(false);
    };

    const handleClick = useCallback((index) => {
        setActiveItem(index);
        if (index === 3) {
            setIsModalVisible(true);
        } else if (index === 2) {
            setIsShowModalQuyhoach(true);
        }
    }, []);

    const handleModalClose = () => {
        setIsModalVisible(false);
        setActiveItem(0);
    };
    const handleClosePrice = () => {
        setIsShowModalPrice(false);
    };
    // const handleCloseQuyHoach = () => {
    //     setIsShowModalQuyhoach(false);
    //     setActiveItem(0);
    // };
    // const searchParams = new URLSearchParams(location.search);
    const handleBackToMyLocation = async () => {
        const map = mapRef.current;
        if (myLoca.lat && myLoca.lng && map) {
            map.flyTo([myLoca.lat, myLoca.lng], 17);
        }
        try {
            if (myLoca.lat && myLoca.lng) {
                const info = await fetchProvinceName(myLoca.lat, myLoca.lng);
                dispatch(
                    backToMyLocation({
                        lat: myLoca.lat,
                        lon: myLoca.lng,
                        provinceName: info?.provinceName,
                        districtName: info?.districtName,
                    }),
                );
                searchParams.set('vitri', `${myLoca.lat},${myLoca.lng}`);
                setSearchParams(searchParams);
            } else {
                message.error('Không thể xác định vị trí của bạn');
            }
        } catch (error) {
            console.log(error);
        }
    };
    const buttonRef = useRef();

    const showNotification = (type, message, description) => {
        notification[type]({
            message,
            description,
        });
    };
    const isPhoneSize = windowSize.windowWidth < 768;
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const data = await fetchAllQuyHoach();

    //             const processedList = data.map((qh) => ({
    //                 ...qh,
    //                 boundingbox: processBoundingBox(qh.boundingbox),
    //             }));

    //             setListQuyHoach(processedList);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    useEffect(() => {
        dispatch(getAllPlannings());
        dispatch(getKeHoachsdds());
        dispatch(getQuyHoach1500());
        dispatch(getQuyHoach2030());
        dispatch(getQuyHoachXayDung());
        dispatch(getQuyHoachTinh());
        dispatch(getQuyHoachDiaChinh());
    }, []);

    useEffect(() => {
        const vitriParam = searchParams.get('vitri');

        if (vitriParam) {
            const [lat, lon] = vitriParam.split(',').map(Number);

            if (lat && lon) {
                const apiUrl = `https://api.quyhoach.xyz/thongtin_district/${lat}/${lon}`;

                const fetchData = async () => {
                    try {
                        const response = await fetch(apiUrl);
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const data = await response.json();

                        const categorizedData = {
                            QUAN_HUYEN: data.dulieu.filter((item) => item.type === 'QUAN_HUYEN'),
                            QUYHOACH_DIACHINH: data.dulieu.filter((item) => item.type === 'QUYHOACH_DIACHINH'),
                            QUYHOACH_TINH: data.dulieu.filter((item) => item.type === 'QUYHOACH_TINH'),
                            QUYHOACH_XAYDUNG: data.dulieu.filter((item) => item.type === 'QUYHOACH_XAYDUNG'),
                            QUYHOACH_PHANKHU: data.dulieu.filter((item) => item.type === 'QUYHOACH_PHANKHU'),
                        };
                        setDataByType(categorizedData);
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                };

                fetchData();
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const priorities = [
            { key: 'QUAN_HUYEN', label: 'QH Quận Huyện', type: 1 },
            { key: 'QUYHOACH_DIACHINH', label: 'QH Địa Chính', type: 2 },
            { key: 'QUYHOACH_TINH', label: 'QH Tỉnh', type: 3 },
            { key: 'QUYHOACH_XAYDUNG', label: 'QH Xây Dựng', type: 5 },
            { key: 'QUYHOACH_PHANKHU', label: 'QH Phân Khu', type: 4 },
        ];

        const mergedData = [...dataByType.QUYHOACH_XAYDUNG, ...dataByType.QUYHOACH_PHANKHU];

        const extendedDataByType = {
            ...dataByType,
            QUYHOACH_KHAC: mergedData,
        };

        const isAllDataAvailable = priorities.every((priority) => extendedDataByType[priority.key].length > 0);

        const newButtonLabels = [];

        if (isAllDataAvailable) {
            newButtonLabels.push(
                { label: 'QH Quận Huyện', type: 1 },
                { label: 'QH Địa Chính', type: 2 },
                { label: 'QH Tỉnh', type: 3 },
                { label: 'QH Khác', type: 6 },
            );
        } else {
            priorities.forEach((priority) => {
                if (extendedDataByType[priority.key].length > 0) {
                    newButtonLabels.push({
                        label: priority.label,
                        type: priority.type,
                    });
                }
            });
        }

        setButtonLabels(newButtonLabels);
    }, [dataByType]);

    const handleButtonClick = (buttonType) => {
        setSelectedButton(buttonType);
        let filteredData = [];

        switch (buttonType) {
            case 1:
                filteredData = dataByType.QUAN_HUYEN;
                break;
            case 2:
                filteredData = dataByType.QUYHOACH_DIACHINH;
                break;
            case 3:
                filteredData = dataByType.QUYHOACH_TINH;
                break;
            case 4:
                filteredData = dataByType.QUYHOACH_PHANKHU;
                break;
            case 5:
                filteredData = dataByType.QUYHOACH_XAYDUNG;
                break;
            case 6:
                filteredData = [...dataByType.QUYHOACH_PHANKHU, ...dataByType.QUYHOACH_XAYDUNG];
                break;
            default:
                break;
        }

        setQuyHoachList(filteredData);
        setIsShowModalQuyHoachCenter(true);
    };

    const handleButtonMoRongClick = (button) => {
        setButtonMoRong(button);
    };

    return (
        <>
            {contextHolder}
            <div
                className="home-container"
                style={
                    isPhoneSize
                        ? { overflowY: 'auto', position: 'relative', height: '80vh' }
                        : { overflowY: 'auto', position: 'relative', height: '100vh' }
                }
            >
                <div
                    className="slider-container"
                    style={{
                        position: 'fixed',
                        top: 120,
                        right: 10,
                        zIndex: 1000,
                        padding: 10,
                        borderRadius: 4,
                        marginTop: isPhoneSize ? 40 : 0,
                    }}
                >
                    <div className="slider-container-range">
                        <div
                            className="nav-icon-arrow"
                            onClick={() => setOpacity((prev) => (prev === 1 ? 1 : prev + 0.1))}
                        >
                            <Tooltip title="Tăng" placement="left">
                                <FiPlus size={22} />
                            </Tooltip>
                        </div>
                        <input
                            type="range"
                            className="slider"
                            orientation="vertical"
                            value={opacity}
                            onChange={handleSliderChange}
                            min={0}
                            max={1}
                            step={0.01}
                            style={{
                                writingMode: 'bt-lr',
                                WebkitAppearance: 'slider-vertical',
                            }}
                        />
                        <div
                            className="nav-icon-arrow"
                            onClick={() => setOpacity((prev) => (prev === 0 ? 0 : prev - 0.1))}
                        >
                            <Tooltip title="Giảm" placement="left">
                                <RiSubtractLine size={22} />
                            </Tooltip>
                        </div>
                        <div className="nav-icon">
                            <div className="nav-icon-arrow">
                                <Tooltip title="Đặt lại quy hoạch" placement="left">
                                    <FaArrowRotateLeft size={20} onClick={handleRemoveAllPlans} />
                                </Tooltip>
                            </div>
                            {/* <div className="nav-icon-arrow" onClick={handleLocationArrowClick}>
                                <FaLocationArrow size={18} />
                            </div> */}
                            {/* <div className="nav-icon-flag-delete">
                                <GiGolfFlag size={24} />
                                <MdDeleteForever size={22} />
                            </div> */}
                            <div className="nav-icon-arrow">
                                <Tooltip title="Do đạc" placement="left">
                                    <Button
                                        shape="circle"
                                        type={isSelectedMeasure ? 'primary' : 'default'}
                                        onClick={() => {
                                            searchParams.delete('dodac');
                                            setSearchParams(searchParams);
                                            setDistances([]);
                                            setMarkers([]);
                                            setIsSelectedMeasure(!isSelectedMeasure);
                                        }}
                                    >
                                        <TbRulerMeasure size={18} />
                                    </Button>
                                </Tooltip>
                            </div>
                            <div className="nav-icon-arrow">
                                <Tooltip title="Thêm tọa độ" placement="left">
                                    <Button
                                        shape="circle"
                                        type={isShowModalDistance ? 'primary' : 'default'}
                                        onClick={() => {
                                            setIsShowModalDistance(!isShowModalDistance);
                                        }}
                                    >
                                        <GiPathDistance size={18} />
                                    </Button>
                                </Tooltip>
                            </div>
                            {/* <div className="nav-icon-arrow" onClick={handleShareClick}>
                                <LuShare2 size={20} />
                            </div> */}
                            <div className="nav-icon-arrow" onClick={handleBackToMyLocation}>
                                <Tooltip title="Vị trí hiện tại" placement="left">
                                    <AimOutlined size={20} />
                                </Tooltip>
                            </div>
                            <div className="nav-icon-arrow">
                                <Tooltip title="Hướng dẫn" placement="left">
                                    <Button
                                        shape="circle"
                                        type={isShowModalInstruction ? 'primary' : 'default'}
                                        onClick={() => {
                                            setIsShowModalInstruction(!isShowModalInstruction);
                                        }}
                                    >
                                        <MdIntegrationInstructions size={20} />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Container */}
                <div className="container-header">
                    <div className="container-header-select">
                        <div className="slider-container-location">
                            <GrLocation />
                            <span>
                                {provinceName && districtName ? `${provinceName}, ${districtName}` : 'Không có dữ liệu'}
                            </span>
                        </div>
                        <div
                            ref={buttonRef}
                            className={`slider-list-item ${activeItem === 3 ? 'active_item text-[10px]' : ''}`}
                            onClick={() => handleClick(3)}
                        >
                            Danh sách quy hoạch
                        </div>
                    </div>
                </div>
                <div className="container-buttons">
                    {buttonLabels.map((button) => (
                        <div
                            key={button.type}
                            className={`button-item ${selectedButton === button.type ? 'active' : ''}`}
                            onClick={() => handleButtonClick(button.type)}
                        >
                            {button.label}
                        </div>
                    ))}
                </div>
                <MoDalQuyHoachCenter
                    isShowModalQuyHoachCenter={isShowModalQuyHoachCenter}
                    setIsShowModalQuyHoachCenter={setIsShowModalQuyHoachCenter}
                    quyHoachList={quyHoachList}
                />
                {/* Map Container */}
                {!isOpen && (
                    <Map
                        opacity={opacity}
                        ref={mapRef}
                        setSelectedPosition={setSelectedPosition}
                        selectedPosition={selectedPosition}
                        setIdDistrict={setIdDistrict}
                        idDistrict={idDistrict}
                        markers={markers}
                        setMarkers={setMarkers}
                        isSelectedMeasure={isSelectedMeasure}
                        setIsSelectedMeasure={setIsSelectedMeasure}
                        distances={distances}
                        setDistances={setDistances}
                        setIsShowModalUpload={setIsShowModalUpload}
                    />
                )}

                <ModalDownMenu
                    show={isModalVisible}
                    handleClose={handleModalClose}
                    isRefreshTreeData={isRefreshTreeData}
                    doRefreshTreeData={doRefreshTreeData}
                />
                <ModalPriceFilter showPrice={isShowModalPrice} handleClosePrice={handleClosePrice} />

                {/* upload Image */}

                <ModalDistance
                    isShowModalDistance={isShowModalDistance}
                    setIsShowModalDistance={setIsShowModalDistance}
                    setIsSelectedMeasure={setIsSelectedMeasure}
                    setMarkers={setMarkers}
                    setDistances={setDistances}
                />
                {/* <ModalQuyHoach
                    isShowModalQuyHoach={isShowModalQuyhoach}
                    handleCloseQuyHoach={handleCloseQuyHoach}
                    idDistrict={idDistrict}
                /> */}
                <ModalUploadImages isShowModalUpload={isShowModalUpload} setIsShowModalUpload={setIsShowModalUpload} />
                <ModalInstruction
                    isShowModalInstruction={isShowModalInstruction}
                    setIsShowModalInstruction={setIsShowModalInstruction}
                />
            </div>

            <Drawer
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ marginLeft: 10 }}>Kho dữ liệu quy hoạch</span>
                        <div>
                            <Button
                                type={buttonMoRong === 'button1' ? 'primary' : 'default'}
                                style={{ marginRight: 8 }}
                                onClick={() => handleButtonMoRongClick('button1')}
                            >
                                Kế Hoạch Sử Dụng Đất
                            </Button>
                            <Button
                                type={buttonMoRong === 'button2' ? 'primary' : 'default'}
                                style={{ marginRight: 8 }}
                                onClick={() => handleButtonMoRongClick('button2')}
                            >
                                Quy Hoạch 1:500
                            </Button>
                            <Button
                                type={buttonMoRong === 'button3' ? 'primary' : 'default'}
                                style={{ marginRight: 8 }}
                                onClick={() => handleButtonMoRongClick('button3')}
                            >
                                Quy Hoạch 2030 Ghép Các Huyện
                            </Button>
                            <Button
                                type={buttonMoRong === 'button4' ? 'primary' : 'default'}
                                style={{ marginRight: 8 }}
                                onClick={() => handleButtonMoRongClick('button4')}
                            >
                                Quy Hoạch Xây Dựng
                            </Button>
                            <Button
                                type={buttonMoRong === 'button5' ? 'primary' : 'default'}
                                style={{ marginRight: 8 }}
                                onClick={() => handleButtonMoRongClick('button5')}
                            >
                                Bản Đồ Địa Chính
                            </Button>
                            <Button
                                type={buttonMoRong === 'button6' ? 'primary' : 'default'}
                                onClick={() => handleButtonMoRongClick('button6')}
                            >
                                Quy Hoạch Cấp Huyện 2030
                            </Button>
                        </div>
                    </div>
                }
                width={'100vw'}
                height={'100vh'}
                onClose={handleCloseTableList}
                open={isOpen}
                styles={{
                    body: {
                        paddingBottom: 80,
                    },
                }}
            >
                {!!isOpen && <TablePlans handleCloseTableList={handleCloseTableList} buttonMoRong={buttonMoRong} />}
            </Drawer>
        </>
    );
}

export default Home;
