import { Button, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCheckout } from '../../services/api';
import CryptoJS from 'crypto-js';

const generateHMAC = (data) => {
    const secretKey = process.env.REACT_APP_PAY_OS_CHECKSUM_KEY;

    const signature = CryptoJS.HmacSHA256(data, secretKey).toString(CryptoJS.enc.Hex);

    return signature.toString();
};

const Checkout = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const returnUrl = `${window.location.origin}/order-success`;
    const cancelUrl = `${window.location.origin}/order-canceled`;
    const description = 'Test thanh toan payOs';
    const amount = 2000;
    const dataItem = {
        name: '3 coin',
        quanlity: 3,
        price: 3000,
    };

    const handleCheckout = async () => {
        const orderCode = Number(String(Date.now()).slice(-6));
        const expiredAt = Math.floor(Date.now() / 1000) + 20 * 60;
        const signatureData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
        const signature = generateHMAC(signatureData);
        const dataCheckout = {
            orderCode,
            amount,
            description,
            item: [dataItem],
            cancelUrl,
            returnUrl,
            expiredAt,
            signature,
        };
        const { data, code } = await createCheckout(dataCheckout);

        console.log(data);
        if (code === '00') {
            window.location.href = data.checkoutUrl;
        } else {
            console.log();
            messageApi.open({ type: 'error', content: 'Có lỗi xảy ra!' });
        }
    };
    return (
        <div>
            {contextHolder}
            <Button onClick={handleCheckout} loading={isLoading} disabled={isLoading}>
                Thanh toán
            </Button>
        </div>
    );
};

export default Checkout;
