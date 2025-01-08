import { Modal } from 'antd';
import React, { memo } from 'react';
import ReactPannellum from 'react-pannellum';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';

const Image360Modal = ({ imageUrl, isModalOpen, handleCancel, handleOk }) => {
    const origin = window.location.origin;
    const headers = {
        method: 'GET',
        Referer: 'http://localhost:3000',
        Origin: 'http://localhost:3000/',
        Accept: 'image/*',
        'Content-Type': 'image/jpg',
    };

    return (
        <Modal open={isModalOpen} onOk={handleOk} width={'60vw'} height={"74vh"} className='image-360-modal' onCancel={handleCancel} footer={<></>}>
            <div
                style={{
                    width: '100%',
                    height: '60vh',
                    padding: '0 12px',
                }}
                // className='boudingbox-modal-content'
            >
                <ReactPhotoSphereViewer
                    src={imageUrl}
                    requestHeaders={headers}
                    height={'100%'}
                    width={'100%'}
                    navbar={false}
                />
                {/* <ReactPannellum
                    id="1"
                    sceneId="firstScene"
                    imageSource={`${imageUrl}`}
                /> */}

            </div>
        </Modal>
    );
};

export default memo(Image360Modal);
