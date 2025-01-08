import { Button, Modal } from 'antd';
import { memo, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import './ModalDownMenu.scss';
import TreeDirectory from '../../TreeDirectory';
import useTableListOpen from '../../../hooks/useTableListOpen';
import useWindowSize from '../../../hooks/useWindowSise';
import { useSelector } from 'react-redux';
import ModalLogin from '../../Auth/ModalNotification';

const ModalDownMenu = ({ handleClose, show, doRefreshTreeData, isRefreshTreeData }) => {
    const [disabled, setDisabled] = useState(true);
    const { handleOpenTableList } = useTableListOpen();
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
    const [isShowLoginModal, setIsShowLoginModal] = useState(false);

    const handleOpenTable = () => {
        if (!isAuthenticated) {
            setIsShowLoginModal(true);
            return;
        }
        handleOpenTableList();
        handleClose();
    };
    const windowSize = useWindowSize();
    const [bounds, setBounds] = useState({
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    });
    const draggleRef = useRef(null);

    const onStart = (_event, uiData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    const handleCloseIsLoginModal = () => {
        setIsShowLoginModal(false);
    };

    return (
        <>
            <Modal
                key={1212}
                open={show}
                onCancel={handleClose}
                footer={null}
                mask={false}
                destroyOnClose={true}
                modalRender={(modal) => (
                    <Draggable
                        disabled={disabled}
                        bounds={bounds}
                        nodeRef={draggleRef}
                        onStart={(event, uiData) => onStart(event, uiData)}
                    >
                        <div ref={draggleRef}>{modal}</div>
                    </Draggable>
                )}
                title={
                    <div
                        style={{
                            width: '100%',
                            cursor: 'move',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '24px',
                            display: 'flex',
                            gap: '10px',
                        }}
                        onMouseOver={() => {
                            if (disabled) {
                                setDisabled(false);
                            }
                        }}
                        onMouseOut={() => {
                            setDisabled(true);
                        }}
                        onFocus={() => {}}
                        onBlur={() => {}}
                    >
                        <span>Danh Sách Quy Hoạch</span>
                        {windowSize.windowWidth > 768 && <Button onClick={handleOpenTable}>Mở rộng</Button>}
                    </div>
                }
            >
                <div className="menu__container">
                    <TreeDirectory isRefreshTreeData={isRefreshTreeData} doRefreshTreeData={doRefreshTreeData} />
                </div>
            </Modal>
            <ModalLogin handleClose={handleCloseIsLoginModal} show={isShowLoginModal} />
        </>
    );
};

export default memo(ModalDownMenu);
