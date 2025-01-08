import React, { useEffect, useState } from 'react';
import { Image, message } from 'antd';
import { getLocationInBoudingBox } from '../../services/api.js';
import './ListGetDistrictProvinces.css';
import { useSelector } from 'react-redux';
import ModalLogin from '../Auth/ModalNotification.js';

const ListGetDistrictProvinces = ({ location, handleItemClick, address }) => {
    const [quyHoachData, setQuyHoachData] = useState([]);
    const [diaChi, setDiaChi] = useState('');
    const [district, setDistrict] = useState('');
    const [provinces, setProvinces] = useState('');
    const [messageText, setMessageText] = useState('');
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
    const [isShowLoginModal, setIsShowLoginModal] = useState(false);

    const handleCloseIsLoginModal = () => {
        setIsShowLoginModal(false);
    };

    useEffect(() => {
        if (location && location.length === 2) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const res = await getLocationInBoudingBox(location[0], location[1]);
                    if (res?.quyhoach?.length > 0) {
                        setDiaChi(res.diachi || 'Không xác định');
                        setDistrict(res.district || 'Không có dữ liệu district');
                        setProvinces(res.provinces || 'Không có dữ liệu province');
                        setMessageText(res.message || 'Không có dữ liệu message');
                        setQuyHoachData(res.quyhoach);
                    } else {
                        setDiaChi('Không có dữ liệu quy hoạch.');
                        setQuyHoachData([]);
                        messageApi.warning('Không tìm thấy dữ liệu quy hoạch.');
                    }
                } catch (error) {
                    setDiaChi('Lỗi khi lấy dữ liệu.');
                    setQuyHoachData([]);
                    // messageApi.error('Lỗi khi lấy dữ liệu quy hoạch.');
                    console.error('API Error:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setDiaChi('Vị trí không hợp lệ');
            setQuyHoachData([]);
            messageApi.error('Vị trí không hợp lệ');
        }
    }, [location, messageApi]);

    return (
        <>
            {contextHolder}
            <div className="list-container">
                <p className="address">
                    <h4>Địa chỉ:</h4> {diaChi}
                    <br />
                    <b>Thông tin địa chính:</b> {address}
                    <br />
                    <b>District:</b> {district}
                    <br />
                    <b>Message:</b> {messageText}
                    <br />
                    <b>Province:</b> {provinces}
                </p>
                {loading ? (
                    <p className="loading-message">Đang tải dữ liệu...</p>
                ) : quyHoachData.length > 0 ? (
                    quyHoachData.map((item, index) => (
                        <div
                            key={index}
                            className="quyhoach-item"
                            onClick={() => {
                                if (!isAuthenticated) {
                                    setIsShowLoginModal(true);
                                    return;
                                }
                                handleItemClick(item); // Xử lý khi click vào bounding box
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <h4>{item.description}</h4>
                            <p>
                                <b>Hạn sử dụng:</b> {item.nam_het_han}
                            </p>
                            <p>
                                <b>Bounding Box:</b> {item.boundingbox || 'Không có'}
                            </p>
                            <p className="zoom-info">
                                <b>Zoom:</b> {item.zoom}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="info-message">Không có dữ liệu quy hoạch nào.</p>
                )}
            </div>
            <ModalLogin handleClose={handleCloseIsLoginModal} show={isShowLoginModal} />
        </>
    );
};

export default ListGetDistrictProvinces;
