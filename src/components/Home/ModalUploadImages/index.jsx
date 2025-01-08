import { Button, Form, Input, message, Modal, Select, Upload } from 'antd';
import { memo, useEffect, useLayoutEffect, useState } from 'react';
import './ModalUploadImages.scss';
import { CiCircleRemove } from 'react-icons/ci';
import { UploadOutlined } from '@ant-design/icons';
import { getLocationInBoudingBox, postImageLocation, postUploadImage } from '../../../services/api';
const { TextArea } = Input;
const types = [
    {
        label: <span>Ảnh</span>,
        title: 'Ảnh',
        options: [
            { label: <span>Ảnh flycam</span>, value: 0 },
            { label: <span>Ảnh 360</span>, value: 1 },
            { label: <span>Ảnh dưới đất</span>, value: 2 },
        ],
    },
    {
        label: <span>Video</span>,
        title: 'Video',
        options: [
            { label: <span>Video</span>, value: 3 },
            { label: <span>Video flycam</span>, value: 4 },
        ],
    },
];
function ModalUploadImages({ isShowModalUpload, setIsShowModalUpload }) {
    const [loading, setLoading] = useState(false);
    const [isTypeLink, setIsTypeLink] = useState(false);
    const [imageList, setImageList] = useState([]);
    const [image, setImage] = useState([]);
    const [error, setError] = useState('');
    const [form] = Form.useForm();
    const [isVideo, setIsVideo] = useState(false);
    const props = {
        multiple: true,
        accept: 'image/*',
        beforeUpload: (file) => {
            return false;
        },
        onRemove: (file) => {},
    };
    const handleOnFinish = async (e) => {
        setLoading(true);
        if (!isTypeLink) {
            const formData = new FormData();
            e.image.fileList.forEach((file) => {
                formData.append('image_upload', file.originFileObj);
            });
            try {
                const res = await postImageLocation(formData);
                if (res.status == 200) {
                    const formData = new FormData();
                    formData.append('image_link', res.imagelink.join('|'));
                    formData.append('is_360', e.type);
                    formData.append('body_text', e.description);
                    formData.append('title_image', e.title);
                    const resPost = await postUploadImage(
                        isShowModalUpload.location[0],
                        isShowModalUpload.location[1],
                        formData,
                    );
                    if (resPost.status == 200) {
                        message.success('Bạn đã tải lên thành công !');
                        form.setFieldsValue({
                            title: '',
                            // image: { fileList: [] },
                            description: '',
                        });
                    } else {
                        message.error('Bạn đã tải lên không thành công !');
                    }
                }
            } catch {
                message.error('Error upload image !');
            }
        } else {
            try {
                if (imageList.length === 0) {
                    setError('Chưa có ảnh nào !');
                    setLoading(false);
                    return;
                }
                const image_link = imageList.join('|');
                const formData = new FormData();
                formData.append('image_link', image_link);
                formData.append('is_360', e.type);
                formData.append('body_text', e.description);
                formData.append('title_image', e.title);
                const resPost = await postUploadImage(
                    isShowModalUpload.location[0],
                    isShowModalUpload.location[1],
                    formData,
                );
                console.log(resPost);
                if (resPost.status == 200) {
                    message.success('Bạn đã tải lên thành công !');
                    form.setFieldsValue({
                        title: '',
                        description: '',
                    });
                    setImageList([]);
                } else {
                    message.error('Bạn đã tải lên không thành công !');
                }
            } catch {
                message.error('Error upload image !');
            }
        }
        setLoading(false);
    };
    const handleChangeType = (value) => {
        if (value === 'link') {
            setIsTypeLink(true);
        } else {
            setIsTypeLink(false);
        }
    };
    const handleChoseType = (e) => {
        if (e >= 3) {
            setIsTypeLink(true);
            setIsVideo(true);
            form.setFieldValue('typeUpload', 'link');
        } else {
            setIsVideo(false);
        }
    };
    const handleAddImage = () => {
        const urlRegex = isVideo
            ? /^(https?\:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|shorts\/)([a-zA-Z0-9_-]{11})$/
            : /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/[\w\d\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
        setError('');
        if (urlRegex.test(image)) {
            if (imageList.includes(image)) {
                setError('Ảnh đã tồn tại !');
            } else {
                setImageList([...imageList, image]);
                setImage('');
            }
        } else {
            setError(isVideo ? 'Vui lòng nhập vào link youtube' : 'Vui lòng nhập vào link !');
        }
    };
    const handleRemoveImage = (id) => {
        const newListImage = imageList.filter((_, index) => id !== index);
        setImageList(newListImage);
    };
    useLayoutEffect(() => {
        const fetchApi = async () => {
            if (isShowModalUpload.location) {
                const getDistric = await getLocationInBoudingBox(
                    isShowModalUpload.location[0],
                    isShowModalUpload.location,
                );
                form.setFieldsValue({
                    address: getDistric.diachi,
                });
            }
        };
        fetchApi();
    }, [isShowModalUpload]);
    useEffect(() => {
        setImageList([]);
    }, [isVideo]);
    return (
        <>
            <Modal
                open={isShowModalUpload.show}
                width={500}
                centered={true}
                onCancel={() => {
                    setIsShowModalUpload((state) => ({ ...state, show: false }));
                }}
                title="Thêm hình ảnh mảnh đất, dự án"
                footer={null}
                className="custom-modal-upload"
            >
                <Form form={form} onFinish={handleOnFinish} disabled={loading}>
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập vào tiều đề !',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Loại ảnh">
                        <Select onChange={handleChoseType} defaultValue={0} options={types} />
                    </Form.Item>
                    <Form.Item name="typeUpload" hidden={isVideo} style={{ margin: '0' }}>
                        <Select
                            defaultValue="file"
                            style={{ width: 100, marginBottom: '30px' }}
                            onChange={handleChangeType}
                            options={[
                                { value: 'file', label: 'File' },
                                { value: 'link', label: 'Link' },
                            ]}
                        />
                    </Form.Item>
                    {!isTypeLink ? (
                        <Form.Item
                            name="image"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng upload ảnh !',
                                },
                            ]}
                        >
                            <Upload {...props}>
                                <Button type="primary" icon={<UploadOutlined />}>
                                    Chọn ảnh
                                </Button>
                                <p className="text-tutorial">(Vui lòng nhấn nút "Ctrl" để trọn nhiều ảnh)</p>
                            </Upload>
                        </Form.Item>
                    ) : (
                        <>
                            <div className="input-image">
                                <Input
                                    value={image}
                                    onChange={(e) => {
                                        setError('');
                                        setImage(e.target.value);
                                    }}
                                    placeholder={
                                        isVideo ? 'Vui lòng nhập vào link video youtube' : 'Vui lòng nhập vào link ảnh'
                                    }
                                    allowClear
                                />
                                <Button style={{ marginLeft: '10px' }} type="primary" onClick={handleAddImage}>
                                    Add
                                </Button>
                            </div>
                            <p className="text-error">{error}</p>
                            <ul className="list-image">
                                {imageList.map((image, index) => (
                                    <li key={index} className="list-image__item">
                                        <p>{image}</p>
                                        <Button
                                            style={{ border: 'none' }}
                                            icon={<CiCircleRemove />}
                                            shape="circle"
                                            onClick={() => handleRemoveImage(index)}
                                        ></Button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    <Form.Item name="address" label="Địa chỉ">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập vào mô tả !',
                            },
                        ]}
                    >
                        <TextArea showCount />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Hoàn tất
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default memo(ModalUploadImages);
