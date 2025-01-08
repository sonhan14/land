import { message, notification, Radio, Spin } from 'antd';
import L from 'leaflet';
import React, { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaMapMarkedAlt } from 'react-icons/fa';
import {
    LayersControl,
    MapContainer,
    Marker,
    Pane,
    Polygon,
    Popup,
    TileLayer,
    Tooltip as TooltipLeaflet,
    useMap,
    useMapEvents,
    ZoomControl,
} from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import fetchProvinceName from '../../function/findProvince';
import { formatToVND } from '../../function/formatToVND';
import ResetCenterView from '../../function/resetCenterView';
import useMapParams from '../../hooks/useMapParams';
import useWindowSize from '../../hooks/useWindowSise';
import { selectFilteredMarkers } from '../../redux/filter/filterSelector';
import { setListMarker } from '../../redux/listMarker/listMarkerSllice';
import { setPlanByProvince, setPlansInfo } from '../../redux/plansSelected/plansSelected';
import { setCurrentLocation } from '../../redux/search/searchSlice';
import {
    fetchListInfo,
    fetQuyHoachByIdDistrict,
    getAllPlansDetails,
    getAreaLocation,
    getLocationInBoudingBox,
} from '../../services/api';
import DrawerView from '../Home/DrawerView';
// import useGetParams from '../Hooks/useGetParams';
import { CloseOutlined } from '@ant-design/icons';
import * as turf from '@turf/turf';
import { Tooltip } from 'antd';
import axios from 'axios';
import _ from 'lodash';
import ReactDOMServer from 'react-dom/server';
import { FaList, FaLocationDot } from 'react-icons/fa6';
import { THUNK_API_STATUS } from '../../constants/thunkApiStatus';
import { areBoundingBoxesDifferent } from '../../function/areBoundingBoxesDifferent';
import { calculateLocation } from '../../function/calculateLocation';
import handleGetLocation from '../../function/handleGetLocation';
import handleShareLocation from '../../function/handleShareLocation';
import { isPointInBounds } from '../../function/isPointInBounds';
import { setTreeCheckedKey } from '../../redux/apiCache/treePlans';
import { getBoundingboxData, setCurrentBoundingBox } from '../../redux/boundingMarkerBoxSlice/boundingMarkerBoxSlice';
import { doGetQuyHoach } from '../../redux/getQuyHoach/getQuyHoachSlice';
import { fetchListRegulations } from '../../redux/ListRegulations/ListRegulationsSlice';
import { setActiveLayer } from '../../redux/mapLayer/mapLayerSlice';
import GoToLocation from '../_common/GoToLocation';
import GetBoundingBoxOnFirstRender from '../GetBoundingBoxOnFirstRender/GetBoundingBoxOnFirstRender';
import useGetParams from '../Hooks/useGetParams';
import MarkerItem from '../ImagesListBoundingbox/_components/MarkerItem';
import ImageList from '../ImagesListBoundingbox/ImagesList';
import ListRegulations from '../ListRegulations/ListRegulations';
import LocationInfoSidebar from '../LocationInfoSidebar/LocationInfoSidebar';
import UserLocationMarker from '../UserLocationMarker';

const customIcon = new L.Icon({
    iconUrl: require('../../assets/marker.png'),
    iconSize: [38, 38],
    iconAnchor: [22, 38],
    popupAnchor: [-3, -38],
});
const dotIcon = new L.DivIcon({
    className: 'custom-dot-icon',
    html: `<div></div>`,
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
});
const iconHtml = ReactDOMServer.renderToStaticMarkup(
    <div style={{ color: 'red', fontSize: '30px' }}>
        <FaLocationDot />
    </div>,
);

// Tạo DivIcon với HTML
const iconLocation = L.divIcon({
    html: iconHtml,
    className: '', // Loại bỏ class mặc định
    iconSize: [30, 30],
    iconAnchor: [15, 30], // Tâm của icon
});
const Map = forwardRef(
    (
        {
            opacity,
            setSelectedPosition,
            setIdDistrict,
            idDistrict,
            isSelectedMeasure,
            setIsSelectedMeasure,
            markers,
            setMarkers,
            distances,
            setDistances,
            setIsShowModalUpload,
        },
        ref,
    ) => {
        const [isOverview, setIsOverview] = useState(false);
        const [listenDblClick, setListenDblClick] = useState(false);
        const [idProvince, setIdProvince] = useState();
        const [selectedMarker, setSelectedMarker] = useState(null);
        const [isDrawerVisible, setIsDrawerVisible] = useState(false);
        const searchUrlParams = useGetParams();
        const [searchParams, setSearchParams] = useSearchParams();
        const locationLink = useLocation();
        const dispatch = useDispatch();
        const listMarker = useSelector(selectFilteredMarkers);
        const currentLocation = useSelector((state) => state.searchQuery.searchResult);
        const [messageApi, contextHolder] = message.useMessage();
        const [api, contextHolderNoti] = notification.useNotification();
        const plansStored = useSelector((state) => state.plansSelected.quyhoach);
        const quyhoachByProvince = useSelector((state) => state.plansSelected.quyhoachByProvince);
        const boundingboxDataLocation = useSelector((state) => state.boundingboxSlice.boundingboxData);
        const boundingboxStatus = useSelector((state) => state.boundingboxSlice.status);
        const currentBoundingBox = useSelector((state) => state.boundingboxSlice.currentBoundingBox);
        const listRegulations = useSelector((state) => state.listRegulationsSlice.listRegulations);
        const RegulationsImagesList = listRegulations?.list_image;
        const treeCheckedKeys = useSelector((state) => state.treePlans.treeCheckedKeys);
        const { initialCenter, initialZoom } = useMapParams();
        const windowSize = useWindowSize();
        const [searchPara, setSearchPara] = useSearchParams();
        const closeDrawer = () => setIsDrawerVisible(false);

        const [mapZoom, setMapZoom] = useState(13);
        const [isShowImagesList, setIsShowImagesList] = useState(false);
        const [isShowBtnOpen, setIsShowBtnOpen] = useState(false);
        const [area, setArea] = useState(null);
        const [isShowListRegulation, setisShowListRegulation] = useState(true);
        const [processedRegions, setProcessedRegions] = useState([]);
        const [markerPosition, setMarkerPosition] = useState(null);
        const [popupInfo, setPopupInfo] = useState(null);
        const markerRef = useRef(null);
        const [undoStack, setUndoStack] = useState([]);
        const [redoStack, setRedoStack] = useState([]);
        const [trigger, setTrigger] = useState(false);
        const [polygonArea, setPolygonArea] = useState({ distances: [], polygon: [] });
        const [isShowModalArea, setIsShowModalArea] = useState(false);
        const [address, setAddress] = useState('');
        const itemQuyHoach = useSelector((state) => state.getquyhoach.itemQuyHoach);

        const itemSearch = useSelector((state) => state.searchQuery.searchResult);
        const [location, setLocation] = useState([0, 0]); // Vị trí hiện tại
        const [isLocationInfoOpen, setIsLocationInfoOpen] = useState(false); // Thông tin vị trí có mở không
        const [isLongClick, setIsLongClick] = useState(false); // Kiểm tra click dài
        const [pressTimer, setPressTimer] = useState(null); // Timer cho click dài
        const activeLayer = useSelector((state) => state.mapLayer.activeLayer);
        const userAgent = navigator.userAgent;

        const id = searchParams.get('id');
        const type = searchParams.get('type');

        const [polygonPoint, setPolygonPoint] = useState(null);

        const handleUpdateDistance = useCallback((markers) => {
            if (markers.length > 1) {
                setDistances((prevDistances) => {
                    const newDistances = [];
                    markers.forEach((marker, index) => {
                        if (index === markers.length - 1) {
                            const distanceStartToLast = L.latLng(marker).distanceTo(markers[0]);
                            newDistances.push({
                                start: marker,
                                end: markers[0],
                                distance: distanceStartToLast,
                            });
                        } else {
                            const distance = L.latLng(marker).distanceTo(markers[index + 1]);
                            newDistances.push({
                                start: marker,
                                end: markers[index + 1],
                                distance: distance,
                            });
                        }
                    });
                    return newDistances;
                });
            } else {
                setDistances([]);
            }
        }, []);
        const handleUpdateArea = useCallback((markers) => {
            if (markers.length > 2) {
                const polygon = L.polygon(markers);
                const geoJson = polygon.toGeoJSON();
                const newArea = turf.area(geoJson);
                setArea(newArea);
            }
        }, []);
        const fetchReverseGeocode = async (lat, lon) => {
            const url = `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lon}&zoom=18&format=jsonv2`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data && data.display_name) {
                    return data.display_name;
                } else {
                    console.error('Không tìm thấy thông tin vị trí');
                    return null;
                }
            } catch (error) {
                console.error('Lỗi khi gọi API Nominatim:', error);
                return null;
            }
        };
        const [isLoading, setIsLoaing] = useState(false);
        const [locationData, setLocationData] = useState({
            description: '',
            idDistrict: 0,
            idProvince: 0,
            id_quyhoach: 0,
            imageHttp: '',
            loai_anh: '',
            location: '',
        });
        const allPlannings = useSelector((state) => state.allPlannings.allPlannings);
        const [RegulationImages, setRegulationImages] = useState(null);
        const [selectedBounds, setSelectedBounds] = useState(null);
        const [imageOverlay, setImageOverlay] = useState(null);

        // const mapRef = useRef();
        // const sharing = searchParams.get('ups');

        const onCloseLocationInfo = () => {
            setIsLocationInfoOpen(false);
        };

        const onOpenLocationInfo = (locationData) => {
            setIsLocationInfoOpen(true);
            setLocationData(locationData);
        };

        const handleShareLocationNow = useCallback(
            (location, viewPayload) => {
                handleShareLocation(location, viewPayload, messageApi);
            },
            [location],
        );

        const handleShareMarkerLocation = useCallback((location, viewPayload) => {
            handleShareLocation(location, viewPayload, messageApi);
        }, []);

        const handleShareLogoLocation = useCallback((point) => {
            handleGetLocation(point, messageApi);
        }, []);

        const onCloseImageList = () => {
            setIsShowImagesList(false);
        };

        const onOpenImageList = () => {
            setIsShowImagesList(true);
        };
        const onCloseBtnImageList = () => {
            setIsShowBtnOpen(false);
        };

        const onOpenBtnImageList = () => {
            setIsShowBtnOpen(true);
        };
        const handleGetImagesListDistricts = useCallback(
            async (_southWest, _northEast) => {
                const southWest = _southWest;
                const northEast = _northEast;
                // Check if the user has moved long

                if (isShowBtnOpen) {
                    const isBoundingBoxChanged = areBoundingBoxesDifferent(currentBoundingBox, southWest, northEast);
                    if (
                        currentBoundingBox.minLat > 0 &&
                        isBoundingBoxChanged &&
                        boundingboxStatus !== THUNK_API_STATUS.PENDING
                    ) {
                        // console.log(southWest);
                        // console.log(northEast);

                        dispatch(getBoundingboxData({ southWest: southWest, northEast: northEast }));

                        dispatch(
                            setCurrentBoundingBox({
                                minLat: southWest.lat,
                                maxLat: northEast.lat,
                                minLng: southWest.lng,
                                maxLng: northEast.lng,
                            }),
                        );
                    } else {
                        dispatch(
                            setCurrentBoundingBox({
                                minLat: southWest.lat,
                                maxLat: northEast.lat,
                                minLng: southWest.lng,
                                maxLng: northEast.lng,
                            }),
                        );
                    }
                }
            },
            [isShowBtnOpen, currentBoundingBox],
        );

        const handleGetAreaName = useCallback(async (lat, lng) => {
            const info = await fetchProvinceName(lat, lng);

            dispatch(
                setCurrentLocation({
                    provinceName: info?.provinceName,
                    districtName: info?.districtName,
                }),
            );
        }, []);

        const debouncedHandleGetAreaName = useMemo(() => _.debounce(handleGetAreaName, 2000), [handleGetAreaName]);
        const debouncedHandleBoundingBox = useMemo(
            () => _.debounce(handleGetImagesListDistricts, 1000),
            [handleGetImagesListDistricts],
        );
        const MapEvents = () => {
            const map = useMapEvents({
                moveend: async (e) => {
                    const map = e.target;
                    const center = map.getCenter();
                    const zoom = map.getZoom();
                    const { _northEast, _southWest } = map.getBounds();

                    debouncedHandleGetAreaName(center.lat, center.lng);

                    searchUrlParams.set('vitri', `${center.lat},${center.lng}`);
                    searchUrlParams.set('zoom', `${zoom}`);
                    setSearchParams(searchUrlParams);

                    // const newUrl = `${locationLink.pathname}?${searchParams.toString()}`;
                    // window.history.replaceState({}, '', newUrl);

                    // setMarkerPosition([center.lat, center.lng]);

                    if (zoom >= 15) {
                        debouncedHandleBoundingBox(_southWest, _northEast);
                        if (!isShowBtnOpen && isShowImagesList) {
                            setIsShowImagesList(true);
                        } else if (!isShowBtnOpen) {
                            setIsShowBtnOpen(true);
                        }
                    } else {
                        if (isShowBtnOpen) {
                            setIsShowBtnOpen(false);
                        }
                        if (isShowImagesList) {
                            setIsShowImagesList(false);
                        }
                    }
                    if (zoom !== mapZoom) {
                        setMapZoom(zoom);
                    }

                    if (zoom >= 15) {
                        handleGetListRegulation(_southWest, _northEast); //When zoom is 15, data will be retrieved
                    } else {
                        setisShowListRegulation(false);
                    }
                },

                //     async (e) => {
                //         const { lat, lng } = e?.latlng;
                //         // const mapCenter = map.getCenter();

                //         console.log(lat, lng);

                //         map.setView([lat, lng]);
                //         setSelectedPosition({ lat, lng });

                //         try {
                //             // Call API province
                //             // const info = await getLocationInBoudingBox(lat, lng);
                //             const info = await fetchProvinceName(lat, lng);
                //             // Update position info
                //             dispatch(
                //                 setCurrentLocation({
                //                     lat,
                //                     lon: lng,
                //                     provinceName: info.provinceName,
                //                     districtName: info.districtName,
                //                 }),
                //             );
                //             // Call API district
                //             const res = await getLocationInBoudingBox(lat, lng);
                //             res ? setIdDistrict(res.district) : setIdDistrict(null);
                //             setListenDblClick(Math.random());
                //         } catch (error) {
                //             setIdDistrict(null);
                //         }
                //     },
                //     500,
                //     { leading: false, trailing: true },
                // ),
                zoomend: async () => {
                    const zoom = map.getZoom();
                    if (zoom < 10) {
                        setIsOverview(true);
                    } else {
                        setIsOverview(false);
                    }
                },
                mousedown() {
                    if (!isLocationInfoOpen) {
                        const timer = setTimeout(() => {
                            setIsLongClick(true);
                        }, 1000);
                        setPressTimer(timer);
                    }
                },
                // click(event) {
                //     const { lat, lng } = event.latlng;
                //     if (isLocationInfoOpen) {
                //         setLocation([lat, lng]);
                //     }
                // },
                // mouseup(event) {
                //     if (!isLongClick && isLocationInfoOpen) return;
                //     const { lat, lng } = event.latlng;
                //     if (!isLongClick) {
                //         clearTimeout(pressTimer);
                //     } else {
                //         setLocation([lat, lng]);
                //         onOpenLocationInfo();
                //         setIsLongClick(false);
                //     }
                // },
                // contextmenu(event) {
                //     event.preventDefault(); // Chặn menu ngữ cảnh mặc định
                //     console.log('Chuột phải bị block trên bản đồ');
                // },
                click(event) {
                    const { lat, lng } = event.latlng;
                    const map = ref.current;

                    if (map.getBounds().contains(event.latlng)) {
                        setLocation([lat, lng]);

                        if (!isLocationInfoOpen) {
                            const timer = setTimeout(() => {
                                setIsLongClick(true);
                                onOpenLocationInfo();

                                // if (!marker) {
                                //     const newMarker = L.marker([lat, lng]).addTo(map);
                                //     setMarker(newMarker);
                                // } else {
                                //     marker.setLatLng([lat, lng]);
                                // }
                            }, 1000);
                            setPressTimer(timer);
                        } else {
                            if (isLongClick) {
                                onOpenLocationInfo();
                                setIsLongClick(false);
                            }

                            // if (!marker) {
                            //     const newMarker = L.marker([lat, lng]).addTo(map);
                            //     setMarker(newMarker);
                            // } else {
                            //     marker.setLatLng([lat, lng]);
                            // }
                        }
                    }
                },
                mousemove() {
                    if (isLongClick && pressTimer) {
                        setIsLongClick(false);
                        clearTimeout(pressTimer);
                    }
                },
            });
            map.doubleClickZoom.enable();

            return null;
        };

        // call API to get list regulation
        const handleGetListRegulation = useCallback(
            async (_southWest, _northEast) => {
                // Chuẩn hóa và tạo khóa cho vùng hiện tại
                const regionKey = `${_southWest.lat.toFixed(6)},${_southWest.lng.toFixed(6)}-${_northEast.lat.toFixed(
                    6,
                )},${_northEast.lng.toFixed(6)}`;

                // Kiểm tra nếu vùng đã được xử lý
                if (processedRegions.includes(regionKey)) {
                    return;
                }
                try {
                    // Gọi API với tọa độ hiện tại
                    const response = await fetchListRegulations({
                        southWest: _southWest,
                        northEast: _northEast,
                    });
                    // Kiểm tra dữ liệu trả về từ API
                    if (!response || response.length === 0) {
                        console.log('Không có vùng quy hoạch.');
                        setisShowListRegulation(false);
                        return;
                    }
                    // Cập nhật danh sách vùng đã xử lý
                    setProcessedRegions((prev) => [...prev, regionKey]);
                    // setisShowListRegulation(true);
                    // Gửi thông tin vùng lên Redux store
                    dispatch(fetchListRegulations({ southWest: _southWest, northEast: _northEast }));
                } catch (error) {
                    console.error('Lỗi khi gọi API:', error);
                }
            },
            [processedRegions, dispatch],
        );
        const normalizeBoundingBox = (boundingbox) => {
            if (!boundingbox) return [];
            if (typeof boundingbox === 'string') {
                return boundingbox.split(',').map((coord) => parseFloat(coord.trim()));
            }
            if (Array.isArray(boundingbox)) {
                return boundingbox.map((coord) => parseFloat(coord));
            }
            console.warn('BoundingBox không hợp lệ:', boundingbox);
            return [];
        };
        // click to bounding box for list regulation
        const handleItemClick = (item) => {
            const { boundingbox, type, map_type } = item;
            const sharing = searchParams.get('ups');
            const currentBounds = ref?.current?.getBounds();

            // Normalize the bounding box
            const targetBoundingBox = normalizeBoundingBox(boundingbox);
            if (!targetBoundingBox || targetBoundingBox.length < 4) {
                return;
            }
            const [minLon, minLat, maxLon, maxLat] = targetBoundingBox;
            const centerLat = (minLat + maxLat) / 2;
            const centerLon = (minLon + maxLon) / 2;
            const targetImage = item;

            if (!targetImage) {
                console.warn('No matching regulation image found for:', boundingbox, type);
                return;
            }

            // Update RegulationImages state
            if (map_type) {
                dispatch(setActiveLayer(map_type));
            }
            setRegulationImages([targetImage]);

            // Update URL search params (optional)
            const boundingboxArray = Array.isArray(boundingbox)
                ? boundingbox
                : boundingbox.split(',').map((item) => parseFloat(item.trim()));
            searchParams.set('boundingbox', boundingboxArray.join(','));
            searchParams.set('id', item.id); // Add id to search params
            searchParams.set('type', item.type); // Add type to search params
            setSearchParams(searchParams);

            // Fly to the map center
            if (boundingbox && ref.current) {
                const currentBoundingBox = boundingbox.split(',');
                const lat = (Number(currentBoundingBox[1]) + Number(currentBoundingBox[3])) / 2;
                const lng = (Number(currentBoundingBox[0]) + Number(currentBoundingBox[2])) / 2;
                const point = L.latLng(lat, lng);

                if (!currentBounds.contains(point)) {
                    if (ref.current && typeof ref.current.flyTo === 'function' && !sharing) {
                        ref.current.flyTo([centerLat, centerLon], 16); // Smooth map movement
                    }
                }
            }
        };

        useEffect(() => {
            if (id && type) {
                // Gọi API khi có id và type và chưa có itemQuyHoach
                axios
                    .get(`https://api.quyhoach.xyz/thongtin_quyhoach/${type}/${id}`)
                    .then((response) => {
                        const data = response.data;

                        if (data && data.dulieu) {
                            handleItemClick(data.dulieu[0]);
                            handleItemClick(
                                data.dulieu[0].boundingbox,
                                data.dulieu[0].type,
                                data.dulieu[0].nam_het_han,
                            );
                        } else {
                            console.error('No valid data received from API');
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching data from API:', error);
                    });
            }
        }, [id, type]);

        useEffect(() => {
            if (itemQuyHoach) {
                handleItemClick(itemQuyHoach);
                handleItemClick(itemQuyHoach.boundingbox, itemQuyHoach.type, itemQuyHoach.nam_het_han);
                dispatch(doGetQuyHoach(null));
            }
        }, [itemQuyHoach]);

        useEffect(() => {
            console.log('user0', userAgent);

        }, [userAgent]);

        // Debounce the function to avoid calling it too frequently

        const toggleList = () => {
            setisShowListRegulation((prevState) => !prevState); // Chuyển đổi trạng thái
        };

        const handleShareClick = (lat, lng) => {
            const urlParams = new URLSearchParams(locationLink.search);

            urlParams.set('vitri', `${lat},${lng}`);

            const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;

            navigator.clipboard
                .writeText(newUrl)
                .then(() => {
                    messageApi.open({
                        type: 'success',
                        content: 'Đã sao chép vào bộ nhớ',
                    });
                })
                .catch(() => {
                    messageApi.open({
                        type: 'error',
                        content: 'Lỗi khi sao chép vào bộ nhớ',
                    });
                });
        };

        const openNotification = (pauseOnHover, plansParams) => (data, plans) => {
            api.open({
                message: 'Khu vực này có nhiều quy hoạch, vui lòng chọn quy hoạch để xem!',
                description: (
                    <Radio.Group
                        onChange={(e) => {
                            const target = plans.map((item) => item).filter((item) => item.id === e.target.value);
                            const isPlanUrlExist = plansParams.some(
                                (item) => Number(item.split('-')[0]) === data[0].id,
                            );
                            dispatch(setPlansInfo([...plansStored, ...target]));
                            if (!isPlanUrlExist && plansParams.length > 0) {
                                searchUrlParams.set(
                                    'quyhoach',
                                    `${e.target.value}-${target[0].idProvince},${plansParams?.join(',')}`,
                                );
                            } else {
                                searchUrlParams.set('quyhoach', `${e.target.value}-${target[0].idProvince}`);
                            }

                            setSearchPara(searchUrlParams);
                            dispatch(
                                setTreeCheckedKey([
                                    ...treeCheckedKeys,
                                    { id: target.id, idProvince: target.idProvince },
                                ]),
                            );
                            api.destroy();
                        }}
                        value={data[0].id}
                    >
                        {data.map((plan) => (
                            <Radio key={plan.id} value={plan.id}>
                                {plan.description}
                            </Radio>
                        ))}
                    </Radio.Group>
                ),
                showProgress: true,
                pauseOnHover,
            });
        };
        const hanleUpdateMarker = useCallback(
            (e, action, index) => {
                const newLatLng = e.latlng;
                if (action === 'click') {
                    setMarkers((prevMarkers) => {
                        const newMarkers = [...prevMarkers, newLatLng];
                        handleUpdateArea(newMarkers);
                        if (prevMarkers.length > 0) {
                            const lastLatLng = prevMarkers[prevMarkers.length - 1];
                            const startLng = prevMarkers[0];
                            const distanceLast = L.latLng(lastLatLng).distanceTo(newLatLng);
                            const distanceStart = L.latLng(startLng).distanceTo(newLatLng);
                            setDistances((prevDistances) => {
                                if (prevMarkers.length >= 2) {
                                    const newPrevDistances = [...prevDistances];
                                    if (prevMarkers.length === 2) {
                                        return [
                                            ...prevDistances,
                                            {
                                                start: lastLatLng,
                                                end: newLatLng,
                                                distance: distanceLast,
                                            },
                                            {
                                                start: startLng,
                                                end: newLatLng,
                                                distance: distanceStart,
                                            },
                                        ];
                                    }
                                    newPrevDistances.pop();
                                    return [
                                        ...newPrevDistances,
                                        {
                                            start: lastLatLng,
                                            end: newLatLng,
                                            distance: distanceLast,
                                        },
                                        {
                                            start: startLng,
                                            end: newLatLng,
                                            distance: distanceStart,
                                        },
                                    ];
                                } else {
                                    return [
                                        ...prevDistances,
                                        {
                                            start: startLng,
                                            end: newLatLng,
                                            distance: distanceStart,
                                        },
                                    ];
                                }
                            });
                        }
                        searchParams.set('dodac', JSON.stringify(newMarkers));
                        setSearchParams(searchParams);
                        setUndoStack([...undoStack, prevMarkers]);
                        setRedoStack([]); // Xóa redo stack khi có thay đổi mới
                        return newMarkers;
                    });
                } else if (action === 'drag') {
                    setMarkers((prevMarkers) => {
                        const newMarkers = [...prevMarkers];
                        newMarkers.forEach((_, indexMarker) => {
                            if (indexMarker === index) {
                                newMarkers[index] = newLatLng;
                            }
                        });
                        return newMarkers;
                    });
                } else if (action === 'dragend') {
                    handleUpdateArea(markers);
                    if (markers.length > 1) {
                        setDistances((prevDistances) => {
                            const newDistances = [];
                            markers.forEach((marker, index) => {
                                if (index === markers.length - 1) {
                                    const distanceStartToLast = L.latLng(marker).distanceTo(markers[0]);
                                    newDistances.push({
                                        start: marker,
                                        end: markers[0],
                                        distance: distanceStartToLast,
                                    });
                                } else {
                                    const distance = L.latLng(marker).distanceTo(markers[index + 1]);
                                    newDistances.push({
                                        start: marker,
                                        end: markers[index + 1],
                                        distance: distance,
                                    });
                                }
                            });
                            return newDistances;
                        });
                    }
                    searchParams.set('dodac', JSON.stringify(markers));
                    setSearchParams(searchParams);
                }
            },
            [markers],
        );
        const MapClickHandler = () => {
            useMapEvents({
                click: (e) => {
                    hanleUpdateMarker(e, 'click');
                },
            });
            return null;
        };

        const fetchBoundData = async (lat, lng) => {
            try {
                const response = await axios.get('https://guland.vn/get-bound-2', {
                    params: {
                        marker_lat: lat,
                        marker_lng: lng,
                    },
                    headers: {
                        'User-Agent': userAgent,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };


        const MapEventArea = () => {
            useMapEvents({
                click: async (e) => {
                    setIsShowModalArea(true);
                    const newLocation = e.latlng;
                    setLocation([newLocation.lat, newLocation.lng]);

                    console.log([newLocation.lat, newLocation.lng]);

                    // const res = await getAreaLocation(newLocation.lat, newLocation.lng);

                    const newRes = await fetchBoundData(newLocation.lat, newLocation.lng);

                    // console.log(res);

                    console.log("new Res", newRes);

                    setPolygonPoint(newRes)

                    if (newRes) {
                        const getAddress = await getLocationInBoudingBox(newLocation.lat, newLocation.lng);
                        if (getAddress.diachi) {
                            setAddress(getAddress.diachi);
                        }
                        const polygon = newRes.points.slice(1);
                        const newDistances = [];
                        polygon.forEach((marker, index) => {
                            if (index === polygon.length - 1) {
                                const distanceStartToLast = L.latLng(marker).distanceTo(polygon[0]);
                                newDistances.push({
                                    start: marker,
                                    end: polygon[0],
                                    distance: distanceStartToLast,
                                });
                            } else {
                                const distance = L.latLng(marker).distanceTo(polygon[index + 1]);
                                newDistances.push({
                                    start: marker,
                                    end: polygon[index + 1],
                                    distance: distance,
                                });
                            }
                        });
                        const convertedCoords = newRes.points.map((point) => [point.lng, point.lat]);
                        const geoJsonPolygon = turf.polygon([convertedCoords]);
                        const center = turf.center(geoJsonPolygon).geometry.coordinates;
                        const area = newRes.address.split('Diện tích: ')[1];
                        const icon = L.divIcon({
                            className: 'custom-icon-distance',
                            html: `<div style="color: black;">
                                ${area}
                            </div>`,
                            iconSize: [100, 30], // Kích thước của icon
                            iconAnchor: [50, 15], // Chỉ định vị trí neo của icon
                        });
                        const middleLatLng = L.latLng(center[1], center[0]);
                        const newPolygonArea = {
                            polygon,
                            address: newRes.address,
                            distances: newDistances,
                            area: (
                                <Marker position={middleLatLng} icon={icon}>
                                    {`${area} m`}
                                </Marker>
                            ),
                        };
                        setPolygonArea(newPolygonArea);
                    } else {
                        setPolygonArea({ ...polygonArea, adderss: 'Không có dữ liệu ...' });
                    }
                },
            });
            return null;
        };
        const GetMarkerInboundingBox = () => {
            const map = useMap();
            const zoom = map.getZoom();
            const { _northEast, _southWest } = map.getBounds();
            useEffect(() => {
                if (zoom >= 1 && boundingboxDataLocation.link_image?.length < 0) {
                    dispatch(getBoundingboxData(_southWest, _northEast));
                }
            }, []);
            return null;
        };

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const plansByDistrict = await fetQuyHoachByIdDistrict(idDistrict);
                    const firstPlan = plansByDistrict?.[0];
                    const plansParams = searchParams.get('quyhoach') ? searchParams.get('quyhoach').split(',') : [];
                    if (plansByDistrict && plansByDistrict.length > 0 && firstPlan?.huyen_image !== '') {
                        const isPlanUrlExist = plansParams.some((item) => Number(item.split('-')[0]) === firstPlan.id);

                        if (plansByDistrict.length > 1) {
                            openNotification(true, plansParams)(plansByDistrict, allPlannings);

                            dispatch(
                                setPlansInfo([
                                    ...plansStored,
                                    ...allPlannings.filter((item) => item.id === firstPlan.id),
                                ]),
                            );

                            if (!isPlanUrlExist && plansParams.length > 0) {
                                searchUrlParams.set(
                                    'quyhoach',
                                    `${firstPlan.id}-${firstPlan.idProvince},${plansParams?.join(',')}`,
                                );
                            } else {
                                searchUrlParams.set('quyhoach', `${firstPlan.id}-${firstPlan.idProvince}`);
                            }
                            setSearchPara(searchUrlParams);
                        } else {
                            dispatch(
                                setPlansInfo([
                                    ...plansStored,
                                    ...allPlannings.filter((item) => item.id === firstPlan.id),
                                ]),
                            );
                            if (!isPlanUrlExist && plansParams.length > 0) {
                                searchUrlParams.set(
                                    'quyhoach',
                                    `${firstPlan.id}-${firstPlan.idProvince},${plansParams?.join(',')}`,
                                );
                            } else {
                                searchUrlParams.set('quyhoach', `${firstPlan.id}-${firstPlan.idProvince}`);
                            }
                            setSearchPara(searchUrlParams);
                        }

                        // Checked in tree plans list
                        dispatch(
                            setTreeCheckedKey([
                                ...treeCheckedKeys,
                                { id: firstPlan.id, idProvince: firstPlan.idProvince },
                            ]),
                        );
                    } else {
                        if (idDistrict && listenDblClick) {
                            messageApi.info('Không tìm thấy quy hoạch cho khu vực này');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchData();
        }, [listenDblClick]);
        const handleUndo = useCallback(() => {
            console.log('ctrl z');
            if (undoStack.length > 0) {
                const previousState = undoStack[undoStack.length - 1];
                handleUpdateDistance(previousState);
                handleUpdateArea(previousState);
                setRedoStack((prevRedoStack) => [markers, ...prevRedoStack]);
                setUndoStack((prevUndoStack) => prevUndoStack.slice(0, -1));
                setMarkers(previousState);
            }
        }, [undoStack]);
        const handleRedo = useCallback(() => {
            if (redoStack.length > 0) {
                const nextState = redoStack[0];
                setUndoStack((prevUndoStack) => [...prevUndoStack, markers]);
                setRedoStack((prevRedoStack) => prevRedoStack.slice(1));
                handleUpdateDistance(nextState);
                handleUpdateArea(nextState);
                setMarkers(nextState);
            }
        }, [redoStack]);
        useEffect(() => {
            (async () => {
                try {
                    const vitri = searchParams.get('vitri') ? searchParams.get('vitri').split(',') : [];
                    const sharing = searchParams.get('ups');
                    const locationId = searchParams.get('locationId');
                    const LatitudeUrlIndex = 1;
                    const LongitudeUrlIndex = 0;
                    const quyhoachIds = searchParams.get('quyhoach') ? searchParams.get('quyhoach').split(',') : [];
                    const quyhoachProvinceIds = searchParams.get('plans-by-province')
                        ? searchParams.get('plans-by-province').split(',')
                        : [];
                    const provincePlans = [];
                    let center = [];
                    const childrenboundingboxData = [];
                    const firstPlanningIndex = 0;

                    // dispatch(setInitialBoundingBox())

                    if (quyhoachProvinceIds.length > 0) {
                        const [, provincesResponse] = await getAllPlansDetails();

                        for (const item of provincesResponse) {
                            if (quyhoachProvinceIds.length === provincePlans.length) break;

                            if (quyhoachProvinceIds.includes(`${item.id_tinh}`)) {
                                const province = {
                                    diachinh: item.diachinh,
                                    id_tinh: item.id_tinh,
                                    link_image: item.link_image,
                                    name_tinh: item.name_tinh,
                                    quan_huyen_1_tinh: item.quan_huyen_1_tinh,
                                };
                                provincePlans.push(province);
                            }
                        }

                        // get children boundingbox of province
                        provincePlans[firstPlanningIndex].quan_huyen_1_tinh.forEach((item) => {
                            const boundingboxData = item.quyhoach.map((planItem) => {
                                if (!planItem.location) {
                                    if (planItem.boundingbox.startsWith('[') && planItem.boundingbox.endsWith(']')) {
                                        return JSON.parse(planItem);
                                    }
                                }
                                if (!planItem.boundingbox) {
                                    if (planItem.location.startsWith('[') && planItem.location.endsWith(']')) {
                                        return JSON.parse(planItem);
                                    }
                                }
                                return !planItem.location
                                    ? planItem.boundingbox.split(',')
                                    : planItem.location.split(',');
                            });

                            childrenboundingboxData.push(...boundingboxData);
                        });

                        center = calculateLocation(childrenboundingboxData);

                        dispatch(setPlanByProvince(provincePlans));

                        if (locationId || sharing) {
                            const lat = parseFloat(vitri?.[0]);
                            const lng = parseFloat(vitri?.[1]);
                            const info = await fetchProvinceName(lat, lng);
                            setLocation([lat, lng]);
                            dispatch(
                                setCurrentLocation({
                                    lat,
                                    lon: lng,
                                    provinceName: info.provinceName,
                                    districtName: info.districtName,
                                }),
                            );
                        } else {
                            const info = await fetchProvinceName(center[LatitudeUrlIndex], center[LongitudeUrlIndex]);
                            dispatch(
                                setCurrentLocation({
                                    lat: center[LatitudeUrlIndex],
                                    lon: center[LongitudeUrlIndex],
                                    provinceName: info?.provinceName,
                                    districtName: info?.districtName,
                                }),
                            );
                        }

                        dispatch(
                            setTreeCheckedKey([
                                ...treeCheckedKeys,
                                ...provincePlans.map((item) => ({ isProvince: true, idProvince: item.id_tinh })),
                            ]),
                        );
                        return;
                    } else {
                        if (quyhoachByProvince.length > 0) {
                            dispatch(setPlanByProvince([]));
                            dispatch(setTreeCheckedKey([...treeCheckedKeys.filter((item) => !item.isProvince)]));
                        }
                    }

                    if (quyhoachIds.length > 0) {
                        const currentPlan = Number(quyhoachIds?.[0]?.split('-')[0]);
                        const allPlansId = quyhoachIds.map((item) => item.split('-')[0]);

                        const map = {};
                        const memory = [];

                        const plansFiltered = allPlannings
                            .filter((item) => allPlansId.includes(item.id.toString()))
                            .filter((item) => {
                                const key = `${item.idDistrict}-${item.idProvince}`;
                                const hasManyPlan = map[key] > 1;
                                const is2030 = item.description.toLowerCase().includes('2030');
                                const isNotInMemory = !memory.includes(key);

                                if (hasManyPlan && is2030) {
                                    return true;
                                } else if (isNotInMemory) {
                                    memory.push(key);
                                    return true;
                                }
                                return false;
                            });
                        // .map((item) => item);

                        //  Mấy đoạn tương tự thế này lặp nhiều lần nhưng chưa có thời gian refactor lại
                        const currentPlansFilltered = plansFiltered
                            .filter((item) => currentPlan === item.id)
                            .map((item) => {
                                if (!item.location) {
                                    return item.boundingbox?.replace(/[\[\]]/g, '').split(',');
                                } else {
                                    return item.location?.replace(/[\[\]]/g, '').split(',');
                                }
                            });

                        center = calculateLocation(currentPlansFilltered);

                        dispatch(setPlansInfo(plansFiltered));

                        if (locationId || sharing) {
                            const lat = parseFloat(vitri?.[0]);
                            const lng = parseFloat(vitri?.[1]);
                            setLocation([lat, lng]);

                            const info = await fetchProvinceName(lat, lng);
                            dispatch(
                                setCurrentLocation({
                                    lat,
                                    lon: lng,
                                    provinceName: info.provinceName,
                                    districtName: info.districtName,
                                }),
                            );
                        } else {
                            const info = await fetchProvinceName(center[LatitudeUrlIndex], center[LongitudeUrlIndex]);
                            dispatch(
                                setCurrentLocation({
                                    lat: center[LatitudeUrlIndex],
                                    lon: center[LongitudeUrlIndex],
                                    provinceName: info?.provinceName,
                                    districtName: info?.districtName,
                                }),
                            );
                        }
                    } else if (vitri && vitri.length > 1) {
                        const lat = parseFloat(vitri?.[0]);
                        const lng = parseFloat(vitri?.[1]);
                        dispatch(setPlansInfo([]));
                        const info = await fetchProvinceName(lat, lng);
                        dispatch(
                            setCurrentLocation({
                                lat,
                                lon: lng,
                                provinceName: info.provinceName,
                                districtName: info.districtName,
                            }),
                        );
                    }
                    if (sharing && vitri && vitri.length > 1) {
                        const lat = parseFloat(vitri?.[0]);
                        const lng = parseFloat(vitri?.[1]);
                        setLocation([lat, lng]);
                    }
                } catch (error) {
                    console.log('error', error);
                    setIdDistrict(null);
                }
            })();
        }, []);

        useEffect(() => {
            if (!idProvince) return;

            const fetchData = async () => {
                try {
                    const data = await fetchListInfo(idProvince);
                    dispatch(setListMarker(data.data || []));
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchData();
        }, [idProvince]);
        useEffect(() => {
            if (boundingboxStatus === THUNK_API_STATUS.PENDING && ref.current) {
                ref.current.dragging.disable();
                ref.current.touchZoom.disable();
                ref.current.scrollWheelZoom.disable();
                ref.current.boxZoom.disable();
                ref.current.keyboard.disable();
            } else {
                if (ref.current) {
                    ref.current.dragging.enable();
                    ref.current.touchZoom.enable();
                    ref.current.scrollWheelZoom.enable();
                    ref.current.boxZoom.enable();
                    ref.current.keyboard.enable();
                }
            }
        }, [boundingboxStatus]);

        useEffect(() => {
            const handleKeyDown = (event) => {
                if (event.ctrlKey && event.key === 'z') {
                    event.preventDefault();
                    handleUndo();
                } else if (event.ctrlKey && event.key === 'y') {
                    event.preventDefault();
                    handleRedo();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, [redoStack, undoStack]);
        useEffect(() => {
            if (!isSelectedMeasure) {
                setRedoStack([]);
                setUndoStack([]);
            }
        }, [isSelectedMeasure]);
        useEffect(() => {
            const dodacParams = JSON.parse(searchParams.get('dodac'));
            if (dodacParams) {
                const dodacParams = JSON.parse(searchParams.get('dodac'));
                const distances = [];
                dodacParams?.forEach((item, index) => {
                    if (index === dodacParams.length - 1) {
                        const distanceStartToLast = L.latLng(item).distanceTo(dodacParams[0]);
                        distances.push({
                            start: item,
                            end: dodacParams[0],
                            distance: distanceStartToLast,
                        });
                    } else {
                        const distance = L.latLng(item).distanceTo(dodacParams[index + 1]);
                        distances.push({
                            start: item,
                            end: dodacParams[index + 1],
                            distance: distance,
                        });
                    }
                });
                const polygon = L.polygon(dodacParams);
                const geoJson = polygon.toGeoJSON();
                const newArea = turf.area(geoJson);
                if (dodacParams) {
                    setIsSelectedMeasure(true);
                }
                setDistances(distances);
                setArea(newArea);
                setMarkers(dodacParams);
            }
        }, []);

        return (
            <>
                {contextHolder}
                {contextHolderNoti}
                {isShowListRegulation && (
                    <ListRegulations handleItemClick={handleItemClick} RegulationsImagesList={RegulationsImagesList} />
                )}
                {/* <Modal
                title="Khu vực này có nhiều quy hoạch, vui lòng chọn quy hoạch để xem!"
                open={planOption.length > 1}
                onOk={() => setPlanOption([])}
                onCancel={() => setPlanOption([])}
                centered
            >
                <Radio.Group onChange={(e) => setSelectedIDQuyHoach(e.target.value)} value={selectedIDQuyHoach}>
                    {planOption.map((plan) => (
                        <Radio key={plan.id} value={plan.id}>
                            {plan.description}
                        </Radio>
                    ))}
                </Radio.Group>
            </Modal> */}

                {/* show bounding box data button */}
                <div
                    className={`image-list-open bg-white ${!isShowBtnOpen ? 'close' : ''}`}
                    onClick={() => {
                        onOpenImageList();
                        onCloseBtnImageList();
                    }}
                >
                    {/* <img src={icons.mapIcon} alt="Ảnh danh sách quy hoạch" className="image-list-icon" /> */}
                    <FaMapMarkedAlt className="image-list-icon" />
                </div>
                <div>
                    <FaList
                        className="icon-wrapper-regulation"
                        style={{ fontSize: '16px', cursor: 'pointer' }}
                        onClick={(event) => {
                            event.stopPropagation(); // Ngừng sự kiện lan truyền
                            toggleList(); // Toggle hiển thị danh sách
                        }}
                    />
                </div>

                {/* Images list when travel to district */}

                {/* {isShowImagesList && ( */}
                <ImageList isShowImagesList={isShowImagesList} mapZoom={mapZoom}>
                    <div
                        className="close-boudingbox-list"
                        onClick={() => {
                            onOpenBtnImageList();
                            onCloseImageList();
                        }}
                    >
                        <CloseOutlined className="close-icon" />
                    </div>
                </ImageList>
                {/* )} */}

                <MapContainer
                    style={{
                        width: '100vw',
                        height: windowSize.windowWidth > 768 ? 'calc(100vh - 60px)' : 'calc(100vh - 30%)',
                    }}
                    center={initialCenter}
                    zoom={initialZoom}
                    s
                    maxZoom={30}
                    ref={ref}
                    zoomControl={false}
                >
                    {markerPosition && (
                        <Marker position={markerPosition} icon={customIcon}>
                            <Popup>
                                <div>
                                    <h3>Vị trí trung tâm</h3>
                                    <p>
                                        Lat: {markerPosition[0]}, Lng: {markerPosition[1]}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {itemSearch?.coordinates?.length > 0 && (
                        <Polygon
                            positions={itemSearch.coordinates.map(([lng, lat]) => [lat, lng])}
                            pathOptions={{
                                color: 'blue',
                                fillColor: 'rgba(0, 0, 255, 0.2)',
                                weight: 2,
                            }}
                        />
                    )}

                    {polygonPoint?.points?.length > 0 && (
                        <Polygon
                            positions={polygonPoint.points.map(point => [point.lat, point.lng])}
                            pathOptions={{
                                color: 'blue',
                                fillColor: 'rgba(0, 0, 255, 0.2)',
                                weight: 2,
                            }}
                        />
                    )}
                    <ZoomControl position="bottomright" />
                    <UserLocationMarker />
                    {!isSelectedMeasure && <MapEvents />}
                    <GoToLocation />
                    {currentLocation && <ResetCenterView lat={currentLocation.lat} lon={currentLocation.lon} />}
                    <GetBoundingBoxOnFirstRender />
                    <LayersControl>
                        {windowSize.windowWidth < 768 && (
                            <LayersControl.BaseLayer checked name="Map vệ tinh">
                                {/* <TileLayer
                                url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHVhbmFuaDMxaiIsImEiOiJjbTMzMmo2d3AxZ2g0Mmlwejl1YzM0czRoIn0.vCpAJx2b_FVhC3LDfmdLTA`}
                                attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
                                maxZoom={22}
                            /> */}
                                <TileLayer
                                    url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                                    attribution="&copy; <a href='https://www.google.com/maps'>Google Maps</a> contributors"
                                    maxZoom={22}
                                />
                            </LayersControl.BaseLayer>
                        )}
                        {windowSize.windowWidth > 768 && (
                            <LayersControl.BaseLayer checked={activeLayer === 'VE_TINH' && true} name="Map vệ tinh">
                                <TileLayer
                                    url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                                    maxZoom={30}
                                    attribution="&copy; <a href='https://www.google.com/maps'>Google Maps</a> contributors"
                                />
                            </LayersControl.BaseLayer>
                        )}

                        <LayersControl.BaseLayer checked={activeLayer === 'GIAO_THONG' && true} name="Map mặc định">
                            <TileLayer
                                maxZoom={25}
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                    <Pane name="PaneThai" style={{ zIndex: 650 }}>
                        {plansStored &&
                            plansStored.length > 0 &&
                            plansStored.map((item, index) => {
                                return (
                                    <TileLayer
                                        key={index}
                                        url={`${item.huyen_image}/{z}/{x}/{y}`}
                                        pane="overlayPane"
                                        // set min zoom = item.min_zoom is avoid leaflet map lag
                                        minZoom={item.min_zoom ? item.min_zoom - 2 : 9}
                                        minNativeZoom={item.min_zoom ? item.min_zoom - 1 : 12}
                                        maxNativeZoom={item.zoom ? item.zoom : 18}
                                        maxZoom={25}
                                        opacity={opacity}
                                    />
                                );
                            })}
                        {quyhoachByProvince &&
                            quyhoachByProvince.length > 0 &&
                            quyhoachByProvince.map((item, index) => {
                                return (
                                    <TileLayer
                                        key={item.id_tinh}
                                        url={`${item.link_image}/{z}/{x}/{y}`}
                                        pane="overlayPane"
                                        // set min zoom = item.min_zoom is avoid leaflet map lag
                                        minZoom={item.min_zoom ? item.min_zoom - 2 : 9}
                                        minNativeZoom={item.min_zoom ? item.min_zoom - 1 : 12}
                                        maxNativeZoom={item.zoom ? item.zoom : 18}
                                        maxZoom={25}
                                        opacity={opacity}
                                    />
                                );
                            })}
                        {RegulationImages &&
                            RegulationImages.length > 0 &&
                            RegulationImages.map((item, index) => (
                                <TileLayer
                                    key={index}
                                    url={`${item.link_quyhoach}/{z}/{x}/{y}`} // Link for the tile layer
                                    pane="overlayPane"
                                    minNativeZoom={item.min_zoom ? item.min_zoom : 12}
                                    maxNativeZoom={item.zoom ? item.zoom : 18}
                                    // set min zoom = item.min_zoom is avoid leaflet map lag
                                    minZoom={item.min_zoom ? item.min_zoom - 2 : 9}
                                    maxZoom={25}
                                    opacity={opacity} // Dynamic opacity
                                />
                            ))}
                    </Pane>
                    {/* {currentLocation && currentLocation.lat && currentLocation.lon && (
                    <Marker position={[currentLocation.lat, currentLocation.lon]} icon={customIcon}>
                        <Popup>
                            <div>
                                <h3 style={{ fontWeight: 600 }}>
                                    Tỉnh {currentLocation?.provinceName}, Huyện {currentLocation?.districtName}
                                </h3>
                                <p>
                                    Vị trí: {currentLocation?.lat}, {currentLocation?.lon}
                                </p>
                                <button
                                    className="button--share"
                                    onClick={() => handleShareClick(currentLocation?.lat, currentLocation?.lon)}
                                >
                                    <FaShareAlt />
                                    Chia sẻ
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                )} */}
                    {/* {initialCenter && (
                    <>
                        <Marker position={initialCenter} icon={customIcon}>
                            <Popup>Vị trí trung tâm</Popup>
                        </Marker>
                    </>
                )} */}

                    {/* Marker in location now */}
                    {mapZoom >= 15 && boundingboxDataLocation?.list_image?.length > 0 && (
                        <>
                            {boundingboxDataLocation?.list_image?.map((item) => {
                                return (
                                    <MarkerItem
                                        item={item}
                                        key={item.id_quyhoach}
                                        handleShareMarkerLocation={handleShareMarkerLocation}
                                    />
                                );
                            })}
                        </>
                    )}
                    {isShowListRegulation && (
                        <ListRegulations
                            handleItemClick={handleItemClick}
                            RegulationsImagesList={RegulationsImagesList}
                        />
                    )}
                    {listMarker.map((marker) => (
                        <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={customIcon}>
                            <Popup>
                                <div>
                                    <h3 style={{ fontWeight: 600 }}>{marker.description}</h3>
                                    <p style={{ fontSize: 20, fontWeight: 400, margin: '12px 0' }}>
                                        Giá/m²: {formatToVND(marker.priceOnM2)}
                                    </p>
                                    <button
                                        className="button--detail"
                                        onClick={() => {
                                            setIsDrawerVisible(true);
                                            setSelectedMarker(marker);
                                        }}
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* {polygon && <Polygon pathOptions={{ fillColor: 'transparent' }} positions={polygon} />} */}
                    {selectedMarker && (
                        <DrawerView
                            isDrawerVisible={isDrawerVisible}
                            closeDrawer={closeDrawer}
                            addAt={selectedMarker.addAt}
                            images={selectedMarker.imageLink}
                            description={selectedMarker.description}
                            priceOnM2={selectedMarker.priceOnM2}
                            typeArea={selectedMarker.typeArea}
                            area={selectedMarker.area}
                        />
                    )}

                    <LocationInfoSidebar
                        inforArea={polygonArea.address}
                        location={location}
                        locationData={locationData}
                        isLocationInfoOpen={isLocationInfoOpen}
                        handleShareLogoLocation={handleShareLogoLocation}
                        handleShareLocationNow={handleShareLocationNow}
                        onCloseLocationInfo={onCloseLocationInfo}
                        setIsShowModalUpload={setIsShowModalUpload}
                        handleShareClick={handleShareClick} // Truyền hàm này vào Sidebar
                        handleItemClick={handleItemClick}
                        RegulationsImagesList={RegulationsImagesList}
                    />

                    {/* {polygonSessionStorage.length > 0 &&
                    isOverview &&
                    polygonSessionStorage.map((polygon, index) => {
                        return (
                            <Polygon
                                key={index}
                                positions={polygon.geometry.coordinates[0].map((coord) => [coord[1], coord[0]])}
                                color="pink"
                                fillOpacity={0.5}
                                fillColor="pink"
                            />
                        );
                    })} */}
                    {/* <Polygon
                    positions={polygon.geometry.coordinates[0].map((coord) => [coord[1], coord[0]])}
                    color="pink"
                    fillOpacity={0.5}
                    fillColor="pink"
                /> */}
                    {/* {isOverview &&
                    polygonsData.map((item) => {
                        if (item.type === 'Polygon') {
                            return (
                                <Polygon
                                    positions={item.polygons[0].map((coord) => [coord[1], coord[0]])}
                                    color="pink"
                                    fillOpacity={0.5}
                                    fillColor="pink"
                                />
                            );
                        } else if (item.type === 'MultiPolygon') {
                            return item.polygons.map((coordinates) => (
                                <Polygon
                                    positions={coordinates[0].map((coord) => [coord[1], coord[0]])}
                                    color="pink"
                                    fillOpacity={0.5}
                                    fillColor="pink"
                                />
                            ));
                        } else {
                            return null;
                        }
                    })} */}
                    {markers.length >= 2 && (
                        <Polygon positions={markers} color="blue">
                            <TooltipLeaflet sticky>
                                {area?.toFixed(2)} m<sup>2</sup> |{' '}
                                {distances.reduce((acc, cur) => acc + cur.distance, 0).toFixed(2)} m
                            </TooltipLeaflet>
                        </Polygon>
                    )}
                    {isSelectedMeasure && <MapClickHandler />}
                    {markers.map((position, index) => (
                        <Marker
                            draggable
                            key={index}
                            position={position}
                            icon={dotIcon}
                            eventHandlers={{
                                dragstart: (e) => {
                                    setUndoStack([...undoStack, markers]);
                                    setDistances([]);
                                },
                                drag: (e) => {
                                    hanleUpdateMarker(e, 'drag', index, position);
                                },
                                dragend: (e) => {
                                    setRedoStack([...redoStack, markers]);
                                    hanleUpdateMarker(e, 'dragend', index);
                                },
                            }}
                        />
                    ))}
                    {distances.map((distance, index) => {
                        const icon = L.divIcon({
                            className: 'custom-icon-distance',
                            html: `<div>
                                  ${distance.distance?.toFixed(2)} m
                                </div>`,
                            iconSize: [100, 30],
                            iconAnchor: [40, 15],
                        });
                        const middleLatLng = L.latLng(
                            (distance.start.lat + distance.end.lat) / 2,
                            (distance.start.lng + distance.end.lng) / 2,
                        );
                        return (
                            <Marker position={middleLatLng} icon={icon}>
                                <Tooltip key={index} direction="top" offset={[0, -10]} permanent>
                                    {`${distance.distance?.toFixed(2)} m`}
                                    <Marker position={middleLatLng} icon={icon} />
                                </Tooltip>
                            </Marker>
                        );
                    })}
                    {polygonArea?.distances?.map((distance, index) => {
                        const icon = L.divIcon({
                            className: 'custom-icon-distance',
                            html: `<div>
                                ${distance.distance?.toFixed(2)} m
                            </div>`,
                            iconSize: [100, 30], // Kích thước của icon
                            iconAnchor: [40, 15], // Chỉ định vị trí neo của icon
                        });
                        const middleLatLng = L.latLng(
                            (distance.start.lat + distance.end.lat) / 2,
                            (distance.start.lng + distance.end.lng) / 2,
                        );
                        return (
                            <>
                                <Marker position={middleLatLng} icon={icon}>
                                    {`${distance.distance?.toFixed(2)} m`}
                                </Marker>
                            </>
                        );
                    })}

                    {location.length > 0 && <Marker position={location} icon={iconLocation} />}
                    {!isSelectedMeasure && <MapEventArea />}
                    {polygonArea?.area}
                    <Polygon positions={polygonArea?.polygon} color="rgb(23,119,255)" />
                </MapContainer>
                {/* loading */}
                {boundingboxStatus === THUNK_API_STATUS.PENDING && (
                    <div className="loading-screen">
                        <Spin size="default" />
                    </div>
                )}
            </>
        );
    },
);

export default memo(Map);
