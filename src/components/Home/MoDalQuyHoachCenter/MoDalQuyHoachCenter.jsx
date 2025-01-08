import { Input, Modal, Radio, List } from 'antd';
import { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './MoDalQuyHoachCenter.scss';
import { doGetQuyHoach } from '../../../redux/getQuyHoach/getQuyHoachSlice';
import ModalLogin from '../../Auth/ModalNotification';

function ModalQuyHoachCenter({ isShowModalQuyHoachCenter, setIsShowModalQuyHoachCenter, quyHoachList }) {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
    const [isShowLoginModal, setIsShowLoginModal] = useState(false);

    const handleSetItem = (item) => {
        if (!isAuthenticated) {
            setIsShowLoginModal(true);
            return;
        }
        dispatch(doGetQuyHoach(item));
        setIsShowModalQuyHoachCenter(false);
    };

    const handleCloseIsLoginModal = () => {
        setIsShowLoginModal(false);
    };

    return (
        <>
            <Modal
                open={isShowModalQuyHoachCenter}
                title="Danh sách quy hoạch tại vị trí hiện tại"
                footer={null}
                centered
                onCancel={() => setIsShowModalQuyHoachCenter(false)}
            >
                {quyHoachList && quyHoachList.length > 0 ? (
                    <div className="modal-content">
                        <List
                            dataSource={quyHoachList}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => handleSetItem(item)}
                                    className="list-item"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="item">
                                        {/* <img
                                        src={item.imageUrl}
                                        alt={`Map thumbnail for ${item.description}`}
                                        className="item-img"
                                    /> */}
                                        <div className="item-text">
                                            {item.description}
                                            <div className="item-text-info"> Zoom: {item.zoom}</div>
                                            <div className="item-text-info"> Số lượng xem: {item.so_lan_view}</div>
                                        </div>
                                    </div>
                                    {/* {item.description} */}
                                </List.Item>
                            )}
                        />
                    </div>
                ) : (
                    <p>Không có quy hoạch</p>
                )}
            </Modal>

            <ModalLogin handleClose={handleCloseIsLoginModal} show={isShowLoginModal} />
        </>
    );
}

export default memo(ModalQuyHoachCenter);
