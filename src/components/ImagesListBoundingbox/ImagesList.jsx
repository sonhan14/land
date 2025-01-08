import { ConfigProvider, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import All360ImageList from './_components/AllI360mageList';
import AllImageList from './_components/AllImageList';
import AllVideoList from './_components/AllVideoList';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLocation } from '../../redux/LocationSlice/locationSlice';

const ImageList = ({ children, isShowImagesList }) => {
    const [activeKey, setActiveKey] = useState('1');
    const [searchParams, _] = useSearchParams();
    const videoId = searchParams.get('v');
    const image360Id = searchParams.get('360');
    const imageId = searchParams.get('thumb');
    const dispatch = useDispatch();
    const items = [
        {
            key: '1',
            label: 'Ảnh',
            children: <AllImageList />,
        },
        {
            key: '2',
            label: '360',
            children: <All360ImageList />,
        },
        {
            key: '3',
            label: 'Video',
            children: <AllVideoList />,
        },
    ];

    const handleTabChange = (key) => {
        setActiveKey(key);
    };

    useEffect(() => {
        if (videoId) {
            setActiveKey('3');
        }
        if (image360Id) {
            setActiveKey('2');
        }
        if (imageId) {
            setActiveKey('1');
        }
        return () => dispatch(setLocation({ lat: '', lng: '' }));
    }, [videoId, image360Id, imageId]);
    return (
        <div className={`images-list-wrapper ${isShowImagesList ? 'open user-select-none pointer-events-none' : ''}`}>
            <ConfigProvider
                theme={{
                    components: {
                        Tabs: {
                            cardBg: '#fff',
                        },
                    },
                }}
            >
                <Tabs
                    defaultActiveKey={'1'}
                    activeKey={activeKey}
                    onChange={handleTabChange}
                    items={items}
                    className="images-list-tab"
                />
            </ConfigProvider>
            {children}
        </div>
    );
};

export default ImageList;
