import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useTable from '../../../hooks/useTable';
import { fetchAllProvince, fetchDistrictsByProvinces } from '../../../services/api';
import TableDisplay from '../../TableDisplay';
import { doGetQuyHoach } from '../../../redux/getQuyHoach/getQuyHoachSlice';
import ModalLogin from '../../Auth/ModalNotification';

const TablePlans = ({ handleCloseTableList, buttonMoRong }) => {
    const { getColumnSearchProps, query, getFilteredValue, onFilter } = useTable();
    const [dataSource, setDataSource] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const filteredProvinces = getFilteredValue('idProvince');
    const allPlannings = useSelector((state) => state.allPlannings.allPlannings);
    const KeHoachsdds = useSelector((state) => state.allPlannings.KeHoachsdds);
    const quyHoach2030 = useSelector((state) => state.allPlannings.quyHoach2030);
    const quyHoachDiaChinh = useSelector((state) => state.allPlannings.quyHoachDiaChinh);
    const quyHoachXayDung = useSelector((state) => state.allPlannings.quyHoachXayDung);
    const quyHoachTinh = useSelector((state) => state.allPlannings.quyHoachTinh);
    const QuyHoach1500 = useSelector((state) => state.allPlannings.QuyHoach1500);
    const currentPage = Number(query.page || 1);
    const dispatch = useDispatch();
    const [isShowLoginModal, setIsShowLoginModal] = useState(false);
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);

    const handleSetItem = (item) => {
        console.log('item', item);
        console.log('????', isAuthenticated);

        if (!isAuthenticated) {
            setIsShowLoginModal(true);
            return;
        }

        handleCloseTableList();
        dispatch(doGetQuyHoach(item));
    };

    const handleCloseIsLoginModal = () => {
        setIsShowLoginModal(false);
    };
    useEffect(() => {
        (async () => {
            try {
                const provinces = await fetchAllProvince();
                const districtsPromises = provinces.map((province) =>
                    fetchDistrictsByProvinces(province.TinhThanhPhoID),
                );
                const districtsData = await Promise.all(districtsPromises);
                const districts = districtsData.flat();
                setProvinces(provinces);
                setDistricts(districts);
                const plansDetailsInfo = (
                    buttonMoRong === 'button1'
                        ? KeHoachsdds
                        : buttonMoRong === 'button2'
                        ? QuyHoach1500
                        : buttonMoRong === 'button3'
                        ? quyHoachTinh
                        : buttonMoRong === 'button4'
                        ? quyHoachXayDung
                        : buttonMoRong === 'button5'
                        ? quyHoachDiaChinh
                        : buttonMoRong === 'button6'
                        ? quyHoach2030
                        : allPlannings
                ).map((item, i) => {
                    const province = provinces.find((province) => province.TinhThanhPhoID === item.idProvince);
                    const district = districts.find((district) => {
                        return district.DistrictID === item.idDistrict;
                    });
                    if (!province || !district) {
                        return {
                            ...item,
                            provinceName: item.name_tinh,
                        };
                    }
                    return {
                        ...item,
                        stt: i + 1,
                        provinceName: province.TenTinhThanhPho,
                        districtName: district.DistrictName,
                        nam_het_han: item.nam_het_han,
                    };
                });

                setDataSource(plansDetailsInfo);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        })();
    }, [buttonMoRong]);
    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (_, __, i) => <>{i + 1 + 500 * (currentPage - 1)}</>,
        },
        {
            title: 'Tên quy hoạch',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <h4>{text}</h4>,
            ...getColumnSearchProps('description'),
            width: '20%',
        },
        {
            title: 'Tỉnh/Thành phố',
            dataIndex: 'provinceName',
            key: 'idProvince',
            filters: provinces.map((province) => ({
                text: province.TenTinhThanhPho,
                value: province.TinhThanhPhoID,
            })),
            onFilter: (value, record) => {
                return record.idProvince === value;
            },
            filteredValue: getFilteredValue('idProvince'),
        },

        {
            title: 'Quân/Huyện',
            dataIndex: 'districtName',
            key: 'idDistrict',
            filteredValue: getFilteredValue('idDistrict'),
            filters: districts
                .filter((item) => {
                    if (filteredProvinces) {
                        console.log(filteredProvinces, 'filteredProvinces');
                        return filteredProvinces.includes(String(item.ProvinceID));
                    }
                    return true;
                })
                .map((district) => ({ text: district.DistrictName, value: district.DistrictID })),
            onFilter: (value, record) => {
                return record.idDistrict === value;
            },
        },
        // {
        //     title: 'Ngày tạo',
        //     dataIndex: 'date',
        // },
        {
            title: 'Năm hết hạn',
            dataIndex: 'nam_het_han',
            key: 'nam_het_han',
        },
        {
            title: 'Lệnh',
            key: 'action',
            render: (_, record) => (
                <button
                    onClick={() => {
                        handleSetItem(record);
                    }}
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                    Chi tiết
                </button>
            ),
        },
    ];

    return (
        <>
            <ModalLogin handleClose={handleCloseIsLoginModal} show={isShowLoginModal} />
            <TableDisplay dataSource={dataSource} columns={columns} currentPage={currentPage} onFilter={onFilter} />
        </>
    );
};

export default TablePlans;
