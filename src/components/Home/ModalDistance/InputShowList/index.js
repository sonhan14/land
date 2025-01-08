import { Space, InputNumber, Button } from 'antd';
import { useState } from 'react';
function InputShowList({ item, setList }) {
    const [xValue, setXValue] = useState(item.lat);
    const [yValue, setYValue] = useState(item.lng);
    const handleDelete = () => {
        setList((state) => {
            const newState = state.filter((a) => a.id !== item.id);
            return newState;
        });
    };
    const handleOnBlurX = (e) => {
        if (e.target.value == '') {
            setXValue(item.lat);
        } else {
            setList((state) => {
                const newState = [...state];
                const find = newState.findIndex((a) => a.id === item.id);
                newState[find] = {
                    id: item.id,
                    lat: Number(e.target.value),
                    lng: item.lng,
                };
                return newState;
            });
            setXValue(e.target.value);
        }
    };
    const handleOnBlurY = (e) => {
        if (e.target.value == '') {
            setYValue(item.lng);
        } else {
            setList((state) => {
                const newState = [...state];
                const find = newState.findIndex((a) => a.id === item.id);
                newState[find] = {
                    id: item.id,
                    lat: item.lat,
                    lng: Number(e.target.value),
                };
                return newState;
            });
            setYValue(e.target.value);
        }
    };
    return (
        <Space.Compact key={item.id} style={{ marginTop: '10px' }}>
            <InputNumber addonBefore="X" placeholder="X : " value={xValue} onBlur={handleOnBlurX} />
            <InputNumber addonAfter="Y" placeholder="Y : " value={yValue} onBlur={handleOnBlurY} />
            <Button style={{ paddingLeft: '10px' }} type="primary" onClick={() => handleDelete()}>
                Xóa
            </Button>
        </Space.Compact>
    );
}

export default InputShowList;
