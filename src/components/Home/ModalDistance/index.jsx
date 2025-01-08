import { InputNumber, Modal, Form, Button, Space, message } from 'antd';
import { memo, useState } from 'react';
import L from 'leaflet';
import './ModalDistance.scss';
import InputShowList from './InputShowList';
function ModalDistance({
    isShowModalDistance,
    setIsShowModalDistance,
    setIsSelectedMeasure,
    setMarkers,
    setDistances,
}) {
    const [form] = Form.useForm();
    const [list, setList] = useState([]);
    const handleDraw = () => {
        if (!Array.isArray(list)) {
            console.error('list is not an array');
            return;
        }
        if (list.length < 2) {
            message.error('Vui lòng nhập ít nhất 2 điểm');
            return;
        }
        const markersDraw = list.map((item) => L.latLng(item.lat, item.lng));
        const ArrayDistances = [];
        markersDraw.forEach((item, index) => {
            if (index < markersDraw.length - 1) {
                if (index === markersDraw.length - 2) {
                    const distance = markersDraw[0].distanceTo(markersDraw[index + 1]);
                    ArrayDistances.push({
                        start: markersDraw[0],
                        end: markersDraw[index + 1],
                        distance,
                    });
                }
                const distance = item.distanceTo(markersDraw[index + 1]);
                ArrayDistances.push({
                    start: item,
                    end: markersDraw[index + 1],
                    distance,
                });
            }
        });
        setDistances(ArrayDistances);
        setMarkers(markersDraw);
        setIsSelectedMeasure(true);
        setIsShowModalDistance(false);
    };
    const handleFinish = (e) => {
        form.setFieldsValue({
            lat: '',
            lng: '',
        });
        setList([
            ...list,
            {
                id: Date.now(),
                ...e,
            },
        ]);
    };
    return (
        <Modal
            className="custom-modal-distance"
            title="Nhập tạo độ để tính diện tích"
            centered
            open={isShowModalDistance}
            width={500}
            footer={null}
            onCancel={() => setIsShowModalDistance(false)}
        >
            <Form onFinish={handleFinish} form={form}>
                <Form.Item
                    label="Tạo độ X : "
                    name="lat"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập vào tạo độ X',
                        },
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label="Tạo độ Y : "
                    name="lng"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập vào tạo độ Y',
                        },
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item>
                    <Button htmlType="submit" type="primary">
                        Add
                    </Button>
                </Form.Item>
            </Form>
            <h5>Danh sách tạo độ</h5>
            <div>
                {list.map((item, index) => (
                    <Space direction="vertical">
                        <InputShowList setList={setList} item={item} />
                    </Space>
                ))}
            </div>
            <div style={{ marginTop: '15px' }}>
                <Button type="primary" onClick={handleDraw}>
                    Vẽ
                </Button>
                <Button style={{ marginLeft: '15px' }} onClick={() => setIsShowModalDistance(false)}>
                    Hủy
                </Button>
            </div>
        </Modal>
    );
}

export default memo(ModalDistance);
