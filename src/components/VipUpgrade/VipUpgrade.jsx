import React, { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './VipUpgrade.css';
import { Button, Card, message, Modal, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toVndCurrency } from '../../function/Payment/toVndCurrency';
import { cancelCheckout, createCheckout } from '../../services/api';
import { generateHMAC } from '../../function/Payment/generateHMAC';
import { usePayOS } from '@payos/payos-checkout';
import { LoadingOutlined } from '@ant-design/icons';
import { decodeJWT } from '../../function/JwtDecode';

const VipUpgrade = () => {
    const isAuthenticated = useSelector((state) => state.account.isAuthenticated);
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [isPayOsOpen, setIsPayOsOpen] = useState();
    const [itemClicked, setItemClicked] = useState();

    const returnUrl = `${window.location.origin}`;
    const cancelUrl = `${window.location.origin}`;
    const description = `Thanh toan #${userId}`;
    const accessToken = window.localStorage.getItem('access_token');
    const jwtData = decodeJWT(accessToken);

    const [payOSConfig, setPayOSConfig] = useState({
        RETURN_URL: window.location.origin,
        cancelUrl: window.location.origin,
        ELEMENT_ID: 'embedded-payment-container',
        CHECKOUT_URL: '',
        embedded: false,
        onSuccess: (event) => {
            console.log(event);
            messageApi.open({ type: 'success', content: 'Thanh toán thành công!' });
            setItemClicked(null);
            setIsPayOsOpen(false);
        },
        onCancel: async (event) => {
            messageApi.open({ type: 'success', content: 'Hủy thanh toán thành công!' });
            setIsPayOsOpen(false);
            setItemClicked(null);
        },
    });

    const { open, exit } = usePayOS(payOSConfig);

    const handleGetPaymentLink = async (pkg) => {
        const orderCode = Number(String(Date.now()).slice(-6));
        const signatureData = `amount=${pkg.price}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
        const signature = generateHMAC(signatureData);
        const dataCheckout = {
            orderCode,
            amount: pkg.price,
            description,
            item: [
                {
                    name: pkg.duration,
                    quantity: 1,
                    price: pkg.price,
                },
            ],
            cancelUrl,
            returnUrl,
            expiredAt: Math.floor(Date.now() / 1000) + 20 * 60,
            signature,
        };

        setIsPayOsOpen(true);

        exit();

        const { data, code } = await createCheckout(dataCheckout);

        if (code === '00') {
            setPayOSConfig((oldConfig) => ({
                ...oldConfig,
                CHECKOUT_URL: data.checkoutUrl,
                onExit: async () => {
                    await cancelCheckout(orderCode);
                    setIsPayOsOpen(false);
                    setItemClicked(null);
                },
            }));
        } else {
            messageApi.open({ type: 'error', content: 'Có lỗi xảy ra!' });
            setIsPayOsOpen(false);
            setItemClicked(null);
        }
    };

    const features = [
        'Không giới hạn các tính năng trên App và Website landInvest',
        'Kiểm tra quy hoạch đất đai trên 63 tỉnh thành.',
        'Xem vị trí số thửa đất, xem quy hoạch thửa đất.',
        'Đề xuất diện tích và kích thước thửa đất.',
        'Tìm thửa đất theo góc nhìn.',
        'Tìm thửa đất trên sổ theo số thửa.',
        'Xem các dạng đất đai như: QH 2030, QH 2024, QH kế hoạch, QH phân khu,…',
        'Được yêu cầu thông tin về bản đồ và các bên có nhu cầu.',
        'Được nhận VIP 30 ngày cho tài khoản đăng ký trên landInvest.',
        'Được khai thác thông tin từ tài khoản khách hàng như: cho thuê, mua và thừa đất trên landInvest.',
        'Đăng kiểm tra quyền sử dụng vị trí thửa đất và thuê chuyển viên landInvest tư vấn.',
        'Tặng tài khoản VIP cho thành viên đưa 100 thửa đất công khai trên bản đồ landInvest.',
    ];

    const packages = [
        { duration: '1 tháng', price: 150000, color: 'green' },
        { duration: '3 tháng', price: 400000, color: 'red' },
        { duration: '6 tháng', price: 600000, color: 'blue' },
        { duration: '1 năm', price: 1000000, color: 'purple' },
    ];

    const highlightLand = (text) => {
        return text.split('land').map((part, index, arr) => (
            <React.Fragment key={index}>
                {part}
                {index < arr.length - 1 && <span className="land-highlight">land</span>}
            </React.Fragment>
        ));
    };

    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL !== '') {
            open();
        }
    }, [payOSConfig]);

    useEffect(() => {
        if (accessToken) {
            setUserId(jwtData.sub.UserID);
        }
    }, []);
    return (
        <>
            {contextHolder}
            <div className="upgrade-container">
                <h2 className="upgrade-title">
                    Nâng cấp VIP để sử dụng tất cả tính năng của{' '}
                    <span>
                        <span className="land">land</span>
                        <span className="invest">Invest</span>
                    </span>
                </h2>
                <div className="col">
                    <div className="upgrade-description-container">
                        <h3 className="upgrade-description">
                            Với gói VIP của{' '}
                            <span>
                                <span className="land">land</span>
                                <span className="invest">Invest</span>
                            </span>
                            , bạn sẽ được:
                        </h3>
                        <ul className="feature-list">
                            {features.map((feature, index) => (
                                <li key={index} className="feature-item">
                                    <FaCheckCircle className="icon-check" style={{ color: '#19c719' }} />
                                    <span> {highlightLand(feature)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="package-container">
                        {packages.map((pkg, index) => (
                            <div key={index} className={`package package-${pkg.color}`}>
                                <div className="package-content">
                                    <h3>{pkg.duration}</h3>
                                    <p className="price">{toVndCurrency(pkg.price)}</p>
                                </div>
                                <button
                                    className={`vip-button ${isPayOsOpen ? 'disabled' : ''}`}
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            messageApi.open({
                                                type: 'info',
                                                content: 'Bạn cần đăng nhập để có thể nạp vip!',
                                            });
                                            return;
                                        }
                                        handleGetPaymentLink(pkg);
                                        setItemClicked(index);
                                    }}
                                >
                                    {itemClicked === index && (
                                        <Spin
                                            indicator={<LoadingOutlined spin />}
                                            size="default"
                                            style={{ fontSize: 24 }}
                                        />
                                    )}
                                    Nạp VIP
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* bo */}
            </div>
            <div id="embedded-payment-container"></div>
        </>
    );
};

export default VipUpgrade;
