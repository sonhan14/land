import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Tree } from 'antd';
import Search from 'antd/es/input/Search';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import removeAccents from 'remove-accents';
import { useDebounce } from 'use-debounce';
import { THUNK_API_STATUS } from '../../constants/thunkApiStatus';
import { calculateLocation } from '../../function/calculateLocation';
import fetchProvinceName from '../../function/findProvince';
import { getTreePlans, searchTreePlans, setExpandedKeys, setTreeCheckedKey } from '../../redux/apiCache/treePlans';
import { setPlanByProvince, setPlansInfo } from '../../redux/plansSelected/plansSelected';
import { setCurrentLocation } from '../../redux/search/searchSlice';
import { getAllPlansDetails } from '../../services/api';
import ModalLogin from '../Auth/ModalNotification';
import { setActiveLayer } from '../../redux/mapLayer/mapLayerSlice';

const TreeDirectory = ({ doRefreshTreeData, isRefreshTreeData }) => {
    const treePlans = useSelector((state) => state.treePlans);
    const quyHoachIdsStored = useSelector((state) => state.plansSelected.quyhoach);
    const quyhoachByProvinceStored = useSelector((state) => state.plansSelected.quyhoachByProvince);
    const allPlannings = useSelector((state) => state.allPlannings.allPlannings);
    const [searchTerm, setSearchTerm] = useState();
    const dispatch = useDispatch();
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchUrlParams = new URLSearchParams(searchParams);
    const searchTreeData = useSelector((state) => state.treePlans.searchTreeData);
    const treeCheckedKeys = useSelector((state) => state.treePlans.treeCheckedKeys);
    const currentLocationIndex = 1;
    const latitudeIndex = 1;
    const longitudeIndex = 0;
    const location = searchParams.get('vitri')?.split(',');
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
    const [isShowLoginModal, setIsShowLoginModal] = useState(false);
    // const planningDataIndex = 1;

    const onCheck = useCallback(
        async (checkedKeysValue, info) => {
            try {
                let center = [];
                let checkedKeys = [];
                const plansParams = [];
                const currentNode = info.node;
                const provincePlans = [];
                const currentLocationId = Number(currentNode.key.split('-')?.[currentLocationIndex]);

                // const map = {};
                // const memory = [];
                if (!isAuthenticated) {
                    setIsShowLoginModal(true);
                    return;
                }

                if (!Array.isArray(checkedKeysValue)) return;

                const provincePlansIds = checkedKeysValue
                    .filter((key) => key?.startsWith('province-'))
                    .map((key) => {
                        const item = key?.split('-');
                        return item[1];
                    });
                const quyhoachIds = checkedKeysValue
                    .filter((key) => key?.startsWith('plan-'))
                    .map((key) => {
                        const item = key?.split('-');
                        const provinceId = item[2];
                        const planningId = item[1];

                        plansParams.push([item[1], item[2]].join('-'));
                        if (!provincePlansIds.includes(provinceId)) return planningId;

                        return null;
                    })
                    .filter((item) => item != null);

                const allPlansId = checkedKeysValue
                    .filter((key) => key?.startsWith('plan-'))
                    .map((key) => {
                        const item = key?.split('-');
                        const planningId = item[1];
                        return planningId;
                    });
                // plans use for set plans images
                const plansFiltered = allPlannings.filter((item) => quyhoachIds.includes(item.id.toString()));
                // plans use for calculate location
                const plansFilteredLocation = allPlannings.filter((item) => allPlansId.includes(item.id.toString()));

                if (provincePlansIds.length > 0) {
                    const [, provinceResponse] = await getAllPlansDetails();
                    for (const item of provinceResponse) {
                        if (provincePlans.length === provincePlansIds.length) break;

                        if (provincePlansIds.includes(`${item.id_tinh}`)) {
                            const province = {
                                diachinh: item.diachinh,
                                id_tinh: item.id_tinh,
                                link_image: item.link_image,
                                name_tinh: item.name_tinh,
                            };
                            provincePlans.push(province);
                            dispatch(setActiveLayer(item.map_type || 'VE_TINH'));
                        }
                    }
                }

                if (!currentNode.checked) {
                    if (currentNode.key.includes('province')) {
                        const allProvinceNow = plansFilteredLocation
                            .filter((item) => {
                                return item.idProvince === currentLocationId;
                            })
                            .map((item) => {
                                if (!item.location) {
                                    return item.boundingbox?.replace(/[\[\]]/g, '').split(',');
                                } else {
                                    return item.location?.replace(/[\[\]]/g, '').split(',');
                                }
                            });
                        console.log(allProvinceNow);

                        center = calculateLocation(allProvinceNow);
                    } else if (currentNode.key.includes('district')) {
                        const currentDistrict = Number(currentNode.key.split('-')[currentLocationIndex]);
                        const districtPlansFilltered = plansFilteredLocation
                            .filter((item) => {
                                if (currentDistrict === item.idDistrict) {
                                    dispatch(setActiveLayer(item.map_type));
                                }
                                return currentDistrict === item.idDistrict;
                            })
                            .map((item) => {
                                if (!item.location) {
                                    return item.boundingbox?.replace(/[\[\]]/g, '').split(',');
                                } else {
                                    return item.location?.replace(/[\[\]]/g, '').split(',');
                                }
                            });
                        console.log(districtPlansFilltered);
                        center = calculateLocation(districtPlansFilltered);
                    } else {
                        const currentPlan = Number(currentNode.key.split('-')[currentLocationIndex]);
                        const currentPlansFilltered = plansFilteredLocation
                            .filter((item) => {
                                if (currentPlan === item.id) {
                                    dispatch(setActiveLayer(item.map_type));
                                }
                                return currentPlan === item.id;
                            })
                            .map((item) => {
                                if (!item.location) {
                                    return item.boundingbox?.replace(/[\[\]]/g, '').split(',');
                                } else {
                                    return item.location?.replace(/[\[\]]/g, '').split(',');
                                }
                            });

                        center = calculateLocation(currentPlansFilltered);
                        console.log(plansFilteredLocation.filter((item) => currentPlan === item.id));
                    }
                    const locationInfo = await fetchProvinceName(center[latitudeIndex], center[longitudeIndex]);
                    dispatch(
                        setCurrentLocation({
                            lat: center[latitudeIndex],
                            lon: center[longitudeIndex],
                            provinceName: locationInfo?.provinceName,
                            districtName: locationInfo?.districtName,
                        }),
                    );
                } else {
                    const lat = location[0];
                    const lng = location[1];
                    const locationInfo = await fetchProvinceName(lat, lng);
                    dispatch(
                        setCurrentLocation({
                            lat,
                            lon: lng,
                            provinceName: locationInfo?.provinceName,
                            districtName: locationInfo?.districtName,
                        }),
                    );
                }

                if (provincePlansIds.length > 0) {
                    searchUrlParams.set('plans-by-province', provincePlansIds.join(','));
                } else {
                    searchUrlParams.delete('plans-by-province');
                }
                if (plansParams.length > 0) {
                    searchUrlParams.set('quyhoach', plansParams.join(','));
                } else {
                    searchUrlParams.delete('quyhoach');
                }

                searchUrlParams.delete('id');
                searchUrlParams.delete('type')

                dispatch(setPlanByProvince(provincePlans));
                dispatch(setPlansInfo(plansFiltered));
                setSearchParams(searchUrlParams);

                checkedKeys = plansFilteredLocation;

                dispatch(setTreeCheckedKey(checkedKeys.map((item) => ({ id: item.id, idProvince: item.idProvince }))));
            } catch (error) {
                console.log(error);
            }
        },
        [dispatch, searchParams, setSearchParams],
    );

    const handleSearchTree = useCallback((debouncedSearchTerm) => {
        if (!debouncedSearchTerm) {
            return dispatch(searchTreePlans({ newTree: [], expandedKeys: [], autoExpandParent: false }));
        }
        const data = filterTreeData(debouncedSearchTerm);
        dispatch(searchTreePlans(data));
        setLoadingSearch(false);
    }, []);

    const filterTreeData = (searchTerm) => {
        const normalizedTerm = removeAccents(searchTerm?.toLowerCase());
        const expandedKeysSet = new Set();
        const filterNodes = (nodes, parentMatched = false) => {
            return nodes.reduce((acc, node) => {
                const nodeMatch = removeAccents(node.title?.toLowerCase())?.includes(normalizedTerm);
                const filteredChildren = node.children ? filterNodes(node.children, nodeMatch || parentMatched) : [];

                if (nodeMatch || filteredChildren.length > 0 || parentMatched) {
                    if (nodeMatch || parentMatched) {
                        expandedKeysSet.add(node.key);
                    }
                    return [
                        ...acc,
                        {
                            ...node,
                            children: filteredChildren,
                        },
                    ];
                }
                return acc;
            }, []);
        };

        const filteredData = filterNodes(treePlans.treeOriginal);

        return { newTree: filteredData, expandedKeys: Array.from(expandedKeysSet), autoExpandParent: true };
    };

    const onExpand = (expandedKeysValue) => {
        dispatch(setExpandedKeys(expandedKeysValue));
    };

    const handleCloseIsLoginModal = () => {
        setIsShowLoginModal(false);
    };

    useEffect(() => {
        dispatch(getTreePlans());
    }, []);

    useEffect(() => {
        handleSearchTree(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <>
            <Search
                loading={loadingSearch}
                placeholder="Search provinces or districts"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setLoadingSearch(true);
                }}
                style={{ marginBottom: 8 }}
            />
            {treePlans.status === THUNK_API_STATUS.PENDING && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                </div>
            )}
            {treePlans.treeOriginal.length > 0 && treePlans.status === THUNK_API_STATUS.SUCCESS ? (
                <Tree
                    showLine
                    treeData={searchTreeData.length > 0 ? searchTreeData : treePlans.treeOriginal}
                    checkable
                    checkedKeys={treeCheckedKeys?.map((item) => {
                        if (item.isProvince) {
                            return `province-${item.idProvince}`;
                        }
                        return `plan-${item.id}-${item.idProvince}`;
                    })}
                    onCheck={onCheck}
                    expandedKeys={treePlans.expandedKeys}
                    autoExpandParent={treePlans.autoExpandParent}
                    onExpand={onExpand}
                />
            ) : (
                <p className="text-center">Dữ liệu đang cập nhật!</p>
            )}
            <ModalLogin handleClose={handleCloseIsLoginModal} show={isShowLoginModal} />
        </>
    );
};

export default memo(TreeDirectory);
