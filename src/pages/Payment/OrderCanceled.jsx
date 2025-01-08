import { Button, Result, Watermark } from 'antd';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCanceled = () => {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const isCanceled = params.get('cancel') === 'true';

    useEffect(() => {
        if (!isCanceled) {
            navigate('/');
        }
    }, []);

    if (!isCanceled) {
        return null;
    }
    return (
        <Watermark
            content={['Land Invest', 'Oops :(!']}
            font={{ fontSize: '18', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}
        >
            <div className="checkout" />
            <Result
                status="error"
                title="Thanh toán thất bại!"
                subTitle="Liên hệ với chúng tôi để được hỗ trợ."
                className="checkout-modal-content"
                extra={[
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

export default OrderCanceled;
