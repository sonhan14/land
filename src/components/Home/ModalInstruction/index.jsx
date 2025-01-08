import { Input, Modal, Radio } from 'antd';
import { memo, useState } from 'react';
import './ModalInstruction.scss';
import img from '../../../assets/instruction.webp';
const options = [
    { label: 'QH sử dụng đất', value: true },
    { label: 'QH phân khu', value: false },
];
const landTypes = [
    { index: '1', title: 'Đất nông nghiệp', landCode: 'NNP', color: '#ffff64' },
    { index: '1.1', title: 'Đất sản xuất nông nghiệp', landCode: 'SXN', color: '#fefc6e' },
    { index: '1.1.1', title: 'Đất trồng cây hàng năm', landCode: 'CHN', color: '#fefc78' },
    { index: '1.1.1.1', title: 'Đất trồng lúa', landCode: 'LUA', color: '#fefc82' },
    { index: '1.1.1.1.1', title: 'Đất chuyên trồng lúa nước', landCode: 'LUC', color: '#fefc8c' },
    { index: '1.1.1.1.2', title: 'Đất trồng lúa nước còn lại', landCode: 'LUK', color: '#fefc96' },
    { index: '1.1.1.1.3', title: 'Đất trồng lúa nương', landCode: 'LUN', color: '#fefcb4' },
    { index: '1.1.1.2', title: 'Đất trồng cây hàng năm khác', landCode: 'HNK', color: '#ffef84' },
    { index: '1.1.1.2.1', title: 'Đất bằng trồng cây hàng năm khác', landCode: 'BHK', color: '#ffefb4' },
    { index: '1.1.1.2.2', title: 'Đất nương rẫy trồng cây hàng năm khác', landCode: 'NHK', color: '#ffefb4' },
    { index: '1.1.2', title: 'Đất trồng cây lâu năm', landCode: 'CLN', color: '#ffd29f' },
    { index: '1.2', title: 'Đất lâm nghiệp', landCode: 'LNP', color: '#aaff33' },
    { index: '1.2.1', title: 'Đất rừng sản xuất', landCode: 'RSX', color: '#b4ffb4' },
    { index: '1.2.1.1', title: 'Đất có rừng sản xuất là rừng tự nhiên', landCode: 'RSN', color: '#b4ffb4' },
    { index: '1.2.1.2', title: 'Đất có rừng sản xuất là rừng trồng', landCode: 'RST', color: '#b4ffb4' },
    { index: '1.2.1.3', title: 'Đất đang được sử dụng để phát triển rừng sản xuất', landCode: 'RSM', color: '#bfff1e' },
    { index: '1.2.2', title: 'Đất rừng phòng hộ', landCode: 'RPH', color: '#bfff1e' },
    { index: '1.2.2.1', title: 'Đất có rừng phòng hộ là rừng tự nhiên', landCode: 'RPN', color: '#bfff1e' },
    { index: '1.2.2.2', title: 'Đất có rừng phòng hộ là rừng trồng', landCode: 'RPT', color: '#bfff1e' },
    { index: '1.2.2.3', title: 'Đất đang được sử dụng để phát triển rừng phòng hộ', landCode: 'RPM', color: '#bfff1e' },
    { index: '1.2.3', title: 'Đất rừng đặc dụng', landCode: 'RDD', color: '#6dff64' },
    { index: '1.2.3.1', title: 'Đất có rừng đặc dụng là rừng tự nhiên', landCode: 'RDN', color: '#6dff64' },
    { index: '1.2.3.2', title: 'Đất có rừng đặc dụng là rừng trồng', landCode: 'RDT', color: '#6dff64' },
    { index: '1.2.3.3', title: 'Đất đang được sử dụng để phát triển rừng đặc dụng', landCode: 'RDM', color: '#6dff64' },
    { index: '1.3', title: 'Đất nuôi trồng thủy sản', landCode: 'NTS', color: '#aaffff' },
    { index: '1.4', title: 'Đất làm muối', landCode: 'LMU', color: '#fffffe' },
    { index: '1.5', title: 'Đất nông nghiệp khác', landCode: 'NKH', color: '#f5ffb4' },
    { index: '2', title: 'Đất phi nông nghiệp', landCode: 'PNN', color: '#ffff64' },
    { index: '2.1', title: 'Đất ở', landCode: 'OTC', color: '#ffb4ff' },
    { index: '2.1.1', title: 'Đất ở tại nông thôn', landCode: 'ONT', color: '#ffd0ff' },
    { index: '2.1.2', title: 'Đất ở tại đô thị', landCode: 'ODT', color: '#ffa0ff' },
    { index: '2.2', title: 'Đất chuyên dùng', landCode: 'CDG', color: '#ffa0ff' },
    { index: '2.2.1', title: 'Đất xây dựng trụ sở cơ quan', landCode: 'TSC', color: '#ffaaa0' },
    { index: '2.2.2', title: 'Đất quốc phòng', landCode: 'CQP', color: '#ff6450' },
    { index: '2.2.3', title: 'Đất an ninh', landCode: 'CAN', color: '#ff5146' },
    { index: '2.2.4', title: 'Đất xây dựng công trình sự nghiệp', landCode: 'DSN', color: '#ffa0aa' },
    { index: '2.2.4.1', title: 'Đất xây dựng trụ sở của tổ chức sự nghiệp', landCode: 'DTS', color: '#ffaaa0' },
    { index: '2.2.4.2', title: 'Đất xây dựng cơ sở văn hóa', landCode: 'DVH', color: '#ffaaa0' },
    { index: '2.2.4.3', title: 'Đất xây dựng cơ sở dịch vụ xã hội', landCode: 'DXH', color: '#ffaaa0' },
    { index: '2.2.4.4', title: 'Đất xây dựng cơ sở y tế', landCode: 'DYT', color: '#ffaaa0' },
    { index: '2.2.4.5', title: 'Đất xây dựng cơ sở giáo dục và đào tạo', landCode: 'DGD', color: '#ffaaa0' },
    { index: '2.2.4.6', title: 'Đất xây dựng cơ sở thể dục thể thao', landCode: 'DTT', color: '#ffaaa0' },
    { index: '2.2.4.7', title: 'Đất xây dựng cơ sở khoa học và công nghệ', landCode: 'DKH', color: '#ffaaa0' },
    { index: '2.2.4.8', title: 'Đất xây dựng cơ sở ngoại giao', landCode: 'DNG', color: '#ffaaa0' },
    { index: '2.2.4.9', title: 'Đất xây dựng công trình sự nghiệp khác', landCode: 'DSK', color: '#ffaaa0' },
    { index: '2.2.5', title: 'Đất sản xuất, kinh doanh phi nông nghiệp', landCode: 'CSK', color: '#ffa0aa' },
    { index: '2.2.5.1', title: 'Đất khu công nghiệp', landCode: 'SKK', color: '#ffaaa0' },
    { index: '2.2.5.2', title: 'Đất cụm công nghiệp', landCode: 'SKN', color: '#ffaaa0' },
    { index: '2.2.5.3', title: 'Đất khu chế xuất', landCode: 'SKT', color: '#ffaaa0' },
    { index: '2.2.5.4', title: 'Đất thương mại, dịch vụ', landCode: 'TMD', color: '#ffaaa0' },
    { index: '2.2.5.5', title: 'Đất cơ sở sản xuất phi nông nghiệp', landCode: 'SKC', color: '#ffaaa0' },
    { index: '2.2.5.6', title: 'Đất sử dụng cho hoạt động khoáng sản', landCode: 'SKS', color: '#cdaacd' },
    { index: '2.2.5.7', title: 'Đất sản xuất vật liệu xây dựng, làm đồ gốm', landCode: 'SKX', color: '#cdaacd' },
    { index: '2.2.6', title: 'Đất có mục đích công cộng', landCode: 'CCC', color: '#ffaaa0' },
    { index: '2.2.6.1', title: 'Đất giao thông', landCode: 'DGT', color: '#ffaa33' },
    { index: '2.2.6.2', title: 'Đất thủy lợi', landCode: 'DTL', color: '#aaffff' },
    { index: '2.2.6.3', title: 'Đất có di tích lịch sử - văn hóa', landCode: 'DDT', color: '#ffaaa0' },
    { index: '2.2.6.4', title: 'Đất danh lam thắng cảnh', landCode: 'DDL', color: '#ffaaa0' },
    { index: '2.2.6.5', title: 'Đất sinh hoạt cộng đồng', landCode: 'DSH', color: '#ffaaa0' },
    { index: '2.2.6.6', title: 'Đất khu vui chơi, giải trí công cộng', landCode: 'DKV', color: '#ffaaa0' },
    { index: '2.2.6.7', title: 'Đất công trình năng lượng', landCode: 'DNL', color: '#ffaaa0' },
    { index: '2.2.6.8', title: 'Đất công trình bưu chính viễn thông', landCode: 'DBV', color: '#ffaaa0' },
    { index: '2.2.6.9', title: 'Đất chợ', landCode: 'DCH', color: '#ffaaa0' },
    { index: '2.2.6.10', title: 'Đất bãi thải, xử lý chất thải', landCode: 'DRA', color: '#cdaacc' },
    { index: '2.2.6.11', title: 'Đất công trình công cộng khác', landCode: 'DCK', color: '#ffaaa0' },
    { index: '2.3', title: 'Đất cơ sở tôn giáo', landCode: 'TON', color: '#ffaaa0' },
    { index: '2.4', title: 'Đất cơ sở tín ngưỡng', landCode: 'TIN', color: '#ffaaa0' },
    { index: '2.5', title: 'Đất nghĩa trang, nghĩa địa, nhà tang lễ, nhà hỏa táng', landCode: 'NTD', color: '#d2d2d2' },
    { index: '2.6', title: 'Đất sông, ngòi, kênh, rạch, suối', landCode: 'SON', color: '#a0ffff' },
    { index: '2.7', title: 'Đất có mặt nước chuyên dùng', landCode: 'MNC', color: '#a0ffff' },
    { index: '2.8', title: 'Đất phi nông nghiệp khác', landCode: 'PNK', color: '#ffaaa0' },
    { index: '3', title: 'Đất chưa sử dụng', landCode: 'CSD', color: '#fffffe' },
    { index: '3.1', title: 'Đất bằng chưa sử dụng', landCode: 'BCS', color: '#fffffe' },
    { index: '3.2', title: 'Đất đồi núi chưa sử dụng', landCode: 'DCS', color: '#fffffe' },
    { index: '3.3', title: 'Núi đá không có rừng cây', landCode: 'NCS', color: '#e6e6c8' },
    { index: '4', title: 'Đất có mặt nước ven biển (chỉ tiêu quan sát)', landCode: 'MVB', color: '#b4ffff' },
    { index: '4.1', title: 'Đất mặt nước ven biển nuôi trồng thủy sản', landCode: 'MVT', color: '#b4ffff' },
    { index: '4.2', title: 'Đất mặt nước ven biển có rừng', landCode: 'MVR', color: '#b4ffff' },
    { index: '4.3', title: 'Đất mặt nước ven biển có mục đích khác', landCode: 'MVK', color: '#b4ffff' },
];
function removeVietnameseTonesAndToLower(str) {
    const vietnameseChars = {
        à: 'a',
        á: 'a',
        ạ: 'a',
        ả: 'a',
        ã: 'a',
        â: 'a',
        ầ: 'a',
        ấ: 'a',
        ậ: 'a',
        ẩ: 'a',
        ẫ: 'a',
        ă: 'a',
        ằ: 'a',
        ắ: 'a',
        ặ: 'a',
        ẳ: 'a',
        ẵ: 'a',
        è: 'e',
        é: 'e',
        ẹ: 'e',
        ẻ: 'e',
        ẽ: 'e',
        ê: 'e',
        ề: 'e',
        ế: 'e',
        ệ: 'e',
        ể: 'e',
        ễ: 'e',
        ì: 'i',
        í: 'i',
        ị: 'i',
        ỉ: 'i',
        ĩ: 'i',
        ò: 'o',
        ó: 'o',
        ọ: 'o',
        ỏ: 'o',
        õ: 'o',
        ô: 'o',
        ồ: 'o',
        ố: 'o',
        ộ: 'o',
        ổ: 'o',
        ỗ: 'o',
        ơ: 'o',
        ờ: 'o',
        ớ: 'o',
        ợ: 'o',
        ở: 'o',
        ỡ: 'o',
        ù: 'u',
        ú: 'u',
        ụ: 'u',
        ủ: 'u',
        ũ: 'u',
        ư: 'u',
        ừ: 'u',
        ứ: 'u',
        ự: 'u',
        ử: 'u',
        ữ: 'u',
        ỳ: 'y',
        ý: 'y',
        ỵ: 'y',
        ỷ: 'y',
        ỹ: 'y',
        đ: 'd',
        Đ: 'd',
    };

    return str
        .split('')
        .map((char) => vietnameseChars[char] || char) // Chuyển các ký tự có dấu thành không dấu
        .join('')
        .toLowerCase(); // Chuyển tất cả thành chữ thường
}
function ModalInstruction({ isShowModalInstruction, setIsShowModalInstruction }) {
    const [isShowLandCode, setIsShowLandCode] = useState(true);
    const [data, setData] = useState(landTypes);
    const [type, setType] = useState('');
    const [code, setCode] = useState('');
    const handleChangeType = (e) => {
        const newType = removeVietnameseTonesAndToLower(e.target.value);
        setType(e.target.value);
        const temp = newType.split(' ').map((str) => str.trim());
        const typeArray = temp.filter((item) => item !== '');
        if (newType !== '') {
            if (code !== '') {
                const newData = landTypes.filter((item) => {
                    const title = removeVietnameseTonesAndToLower(item.title);
                    const index = removeVietnameseTonesAndToLower(item.index);
                    const codeSeach = item.landCode;
                    const condition1 = typeArray.every((key) => title.includes(key));
                    const condition2 = index.includes(typeArray[0]);
                    const condition3 = codeSeach.includes(code);
                    if (condition2 && typeArray >= 2) {
                        const newArray = typeArray.slice(1);
                        const newCondition1 = newArray.every((key) => title.includes(key));
                        return newCondition1 && condition2 && condition3;
                    } else {
                    }
                    return (condition1 || condition2) && condition3;
                });
                setData(newData);
            } else {
                const newData = landTypes.filter((item) => {
                    const title = removeVietnameseTonesAndToLower(item.title);
                    const index = removeVietnameseTonesAndToLower(item.index);
                    const condition1 = typeArray.every((key) => title.includes(key));
                    const condition2 = index.includes(typeArray[0]);
                    if (condition2 && typeArray.length >= 2) {
                        const newArray = typeArray.slice(1);
                        const newCondition1 = newArray.every((key) => title.includes(key));
                        return newCondition1 && condition2;
                    }
                    return condition1 || condition2;
                });
                setData(newData);
            }
        } else {
            setData(landTypes);
        }
    };
    const handleChangeCode = (e) => {
        const newCode = e.target.value;
        setCode(newCode);
        if (newCode !== '') {
            if (type !== '') {
                const newData = data.filter((item) => {
                    return item.landCode.toLowerCase().includes(newCode);
                });
                setData(newData);
            } else {
                const newData = landTypes.filter((item) => {
                    return item.landCode.toLowerCase().includes(newCode);
                });
                setData(newData);
            }
        } else {
            setData(landTypes);
        }
    };
    const handleOnChange = (e) => {
        setIsShowLandCode(e.target.value);
    };
    return (
        <Modal
            open={isShowModalInstruction}
            title="Bảng ký hiệu các loại đất"
            footer={null}
            centered
            onCancel={() => setIsShowModalInstruction(false)}
        >
            <p className="text-introduce">
                LandInvest cung cấp bảng ký hiệu kèm theo màu sắc các loại đất được thể hiện trên bản đồ quy hoạch sử
                dụng đất giúp bạn dễ dàng phân biệt các loại đất khi tra cứu quy hoạch đất đai trên LandInvest.
            </p>
            <Radio.Group
                className="radio-button"
                options={options}
                defaultValue={true}
                optionType="button"
                buttonStyle="solid"
                onChange={handleOnChange}
            />
            {isShowLandCode ? (
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th scope="col" class="col-8">
                                Loại đất
                            </th>
                            <th scope="col" class="col-4">
                                Mã đất
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <Input
                                    value={type}
                                    onChange={handleChangeType}
                                    placeholder="Tìm loại đất hoặc thứ tự danh mục"
                                />
                            </td>
                            <td>
                                <Input value={code} onChange={handleChangeCode} placeholder="Tìm mã đất" />
                            </td>
                        </tr>
                        {data.map((item) => (
                            <tr>
                                <td>
                                    <div className="land-type">
                                        <p className="land-type__index">{item.index}</p>
                                        <p className="land-type__title">{item.title}</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="land-code" style={{ backgroundColor: item.color }}>
                                        {item.landCode}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <img src={img} className="mt-3" />
            )}
        </Modal>
    );
}

export default memo(ModalInstruction);
