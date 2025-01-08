import { Button, Result, Watermark } from 'antd';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('code') === '00';

    useEffect(() => {
        if (!isSuccess) {
            navigate('/');
        }
    }, []);

    if (!isSuccess) {
        return null;
    }
    return (
        <Watermark
            content={['Land Invest', 'Cảm ơn!']}
            font={{ fontSize: '18', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}
        >
            <div className="checkout" />
            <Result
                status="success"
                title="Đơn thanh toán của bạn đã thành công!"
                // subTitle="Bạn sẽ nhận được thông báo xác nhận qua email của chúng tôi."
                className="checkout-modal-content"
                extra={[
                    // <Button
                    //     onClick={() => {
                    //         navigate('/', { replace: true });
                    //     }}
                    //     type="primary"
                    //     key="home"
                    // >
                    //     Kiểm tra trạng thái
                    // </Button>,
                    <Button
                        key="my-order"
                        onClick={() => {
                            navigate('/', { replace: true });
                        }}
                    >
                        Trang chủ
                    </Button>,
                ]}
            />
        </Watermark>
    );
};

export default OrderSuccess;
