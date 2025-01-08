import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import './AuctionList.css';
import { format } from 'date-fns';
import axios from 'axios';

const AuctionsList = () => {
    const [auction, setAuction] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAddress, setSelectedAddress] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); // Số trang tối đa
    const [apiBaseUrl, setApiBaseUrl] = useState('https://api.quyhoach.xyz/api/daugia/thongtin');
    const [activeButton, setActiveButton] = useState('thongtin');

    useEffect(() => {
        const fetchAuctionsData = async () => {
            try {
                const res = await axios.get(`${apiBaseUrl}?page=${page}`);
                const data = res.data;

                // Sắp xếp dữ liệu theo ngày
                const sortedData = data.sort((a, b) => {
                    const dateA = new Date(a.EventSchedule || a.CreateAt);
                    const dateB = new Date(b.EventSchedule || b.CreateAt);
                    return dateB - dateA;
                });

                const formatDate = sortedData.map((auction) => ({
                    ...auction,
                    RegistrationStartTime: auction.RegistrationStartTime
                        ? format(new Date(auction.RegistrationStartTime), 'HH:mm dd/MM/yyyy')
                        : null,
                    RegistrationEndTime: auction.RegistrationEndTime
                        ? format(new Date(auction.RegistrationEndTime), 'HH:mm dd/MM/yyyy')
                        : null,
                    EventSchedule: auction.EventSchedule
                        ? format(new Date(auction.EventSchedule), 'HH:mm dd/MM/yyyy')
                        : null,
                }));

                setAuction(formatDate);
                setTotalPages(res.headers['x-total-pages'] || 10); // Lấy tổng số trang từ headers API
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu đấu giá:', error);
            }
        };

        fetchAuctionsData();
    }, [page, apiBaseUrl]);

    const handleBdsUbndClick = () => {
        setApiBaseUrl('https://api.quyhoach.xyz//api/daugia/bds_ubnd');
        setActiveButton('bds_ubnd');
        setPage(1); // Reset về trang đầu
    };

    const handleThongTinClick = () => {
        setApiBaseUrl('https://api.quyhoach.xyz//api/daugia/thongtin');
        setActiveButton('thongtin');
        setPage(1); // Reset về trang đầu
    };

    const paginate = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const filteredAuctions = auction.filter((auction) => {
        return (
            (auction.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                auction.AuctionAddress.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedAddress === '' || auction.AuctionAddress.toLowerCase().includes(selectedAddress.toLowerCase()))
        );
    });

    const uniqueAddresses = [...new Set(auction.map((a) => a.AuctionAddress))];

    return (
        <Container>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tiêu đề hoặc địa chỉ"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"

                />
                <button onClick={handleThongTinClick} className={`button-style ${activeButton === 'thongtin' ? 'active' : ''}`}style={{ marginRight: '3px' }}  >
                    Tất Cả Đấu Giá
                </button>

                <button onClick={handleBdsUbndClick} className={`button-style ${activeButton === 'bds_ubnd' ? 'active' : ''}`}style={{ marginRight: '3px' }}>
                    BĐS UBND
                </button>

                <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="address-select"
                >
                    <option value="">Chọn địa chỉ đấu giá</option>
                    {uniqueAddresses.map((address, index) => (
                        <option key={index} value={address}>
                            {address}
                        </option>
                    ))}
                </select>
            </div>

            <div className="auctions">
                {filteredAuctions.length > 0 ? (
                    filteredAuctions.map((auction, index) => (
                        <div key={index} className="auctions-list">
                            <p className="auctions-list-title">{auction.Title}</p>
                            <p className="auctions-list-time">Địa chỉ đấu giá tại {auction.AuctionAddress}</p>
                            <p className="auctions-list-time">
                                (Đăng ký tham gia đấu giá từ:{' '}
                                {auction.RegistrationStartTime ? auction.RegistrationStartTime : 'N/A'}; Thời gian tổ
                                chức đấu giá: {auction.RegistrationEndTime ? auction.RegistrationEndTime : 'N/A'} )
                            </p>
                            <p className="auctions-list-time">
                                (Ngày công khai: {auction.EventSchedule ? auction.EventSchedule : 'N/A'})
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Không có dữ liệu.</p>
                )}
            </div>

            <div className="pagination">
                <button onClick={() => paginate(page - 1)} disabled={page === 1}>
                    Trang trước
                </button>
                <span>{`Trang ${page} / ${totalPages}`}</span>
                <button onClick={() => paginate(page + 1)} disabled={page >= totalPages}>
                    Trang sau
                </button>
            </div>
        </Container>
    );
};


export default AuctionsList;
