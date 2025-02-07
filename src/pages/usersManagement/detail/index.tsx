import { Button, Card, DatePicker, Descriptions, Empty, Form, Image, Input, message, Modal, Space, Spin, Upload, UploadFile } from 'antd';
import { useEffect, useState } from 'react';
import { ReactComponent as Edit } from '@/assets/svg/Edit.svg';
import { disabledDate, validateInput } from '@/utils/rules';
import styles from './index.less';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';
import user from 'mock/user';
import { findUserWebById, getData, updateUserWeb } from '@/services/userManagement/api';
import { uploadImg } from '@/services/uploadImg/api';


const mockData = {
    name: 'John Doe',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    created: '2024-10-05',
    updated: '2025-10-05',
}



const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 15, span: 16 },
};


const UserDetail = () => {
    interface UserData {
        email: string;
        avatar: string;
        createdAt: string;
        updatedAt: string;
    }
    const [data, setData] = useState<UserData>({
        email: '',
        avatar: '',
        createdAt: '',
        updatedAt: '',
    });
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([
        {
            uid: '-1',
            name: 'image',
            status: 'done',
            url: '',
        },
    ]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImages, setPreviewImages] = useState('');
    const [defaultUrl, setDefaultUrl] = useState('');
    const [dataGraph, setDataGraph] = useState<any>([]);
    const [config, setConfig] = useState<any>({});

    const permission = JSON.parse(localStorage.getItem('permissions') || '[]');
    let flag = false;
    if(permission){
     permission.forEach((item: any) => {
      console.log('item', item)
      if(item.path===('/usersManagement')){
        flag = item.canWrite;
      }
     })
    }

    useEffect(() => {
        // 获取用户信息
        getUserInfo();
    }, []);

    const getUserInfo = async () => {
        const params = new URLSearchParams(window.location.hash.split('?')[1]); // 从 hash 部分提取查询参数
        const userId = params.get('id') || '';
        // const params = new URLSearchParams(location.search);
        // const userId = params.get('id') || '';
        // console.log(userId, 'userId');
        const { data } = await findUserWebById(userId);
        data[0].createdAt = dayjs(data[0].createdAt).format('YYYY-MM-DD');
        data[0].updatedAt = dayjs(data[0].updatedAt).format('YYYY-MM-DD');
        setData(data[0]);
        setDefaultUrl(data[0].avatar);
        setUploadFileList([{ uid: '-1', name: 'image', status: 'done', url: data[0].avatar }]);

        // 获取数据
        const res = await getData(userId);
        let arr: any = [];
        const dataMap = res.data;
        const keys = Object.keys(dataMap);
        keys.forEach((key: any) => {
            arr.push({ date: key, value: dataMap[key], type: 'value' });
        });
        setDataGraph(arr);
        setConfig({
            data: arr,
            xField: 'date',
            yField: 'value',
            seriesField: 'type',
            xAxis: { type: 'timeCat' },
            slider: {
                start: 0.1,
                end: 0.9,
            },
        });
    }


    const handleEdit = () => {
        setIsShow(true);
    }

    const onReset = async () => {
        // 重置表单
        form.resetFields();
        // 重置上传文件列表
        form.setFieldsValue({ url: defaultUrl });
        setUploadFileList([{
            uid: '-1',
            name: 'image',
            status: 'done',
            url: defaultUrl,
        }]);

        setIsShow(false);
    };

    const onFinish = async (values: any) => {
        const params = new URLSearchParams(window.location.hash.split('?')[1]); // 从 hash 部分提取查询参数
        const userId = params.get('id') || '';
        console.log('Success:', values, dayjs(values.createdAt).format('YYYY-MM-DD'), dayjs(values.updatedAt).format('YYYY-MM-DD'));
        let avatar = defaultUrl;
        // 上传头像
        if (values.url) {
            const file = uploadFileList[0].originFileObj;
            const fileupload = new FormData();
            if (file) {
                fileupload.append('fileupload', values.url[0].originFileObj);
            }
            console.log(fileupload, 'fileupload', uploadFileList[0].originFileObj);
            const { url } = await uploadImg(fileupload);
            avatar = url;
        }


        setLoading(true);
        let { email, createdAt, updatedAt } = values;
        createdAt = dayjs(createdAt).format('YYYY-MM-DD');
        updatedAt = dayjs(updatedAt).format('YYYY-MM-DD');
        console.log(createdAt, updatedAt, 'createdAt, updatedAt');
        try {
            const res = await updateUserWeb(userId, { email, createdAt, updatedAt, avatar });
            if (res.msg === 'SUCCESS') {
                message.success('Update successfully');
                setIsShow(false);
            } else {
                message.error('Update failed');
            }
        } catch (err: any) {
            message.error(err.msg);
        } finally {
            setLoading(false);
            getUserInfo();
        }
    }

    const handleChanges = ({ fileList }: any) => {
        console.log(fileList, 'hfdjlks');
        if (fileList && fileList.length) {
            const isLt5M = fileList[0].size / 1024 / 1024 > 5;
            if (isLt5M) {
                message.error('Picture size should not exceed 5M!');
                return;
            }
        }
        setUploadFileList(fileList);
        // 更新表单字段的值
        form.setFieldsValue({ url: fileList });
        // 如果删除了所有文件，手动触发表单验证以显示错误提示
        if (fileList.length === 0) {
            form.validateFields(['url']);
        }
    };

    // 获取图片预览
    const getBase64 = (file: any) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    // 处理上传前的操作
    const handleBeforeUploads = async (file: any) => {
        file.preview = await getBase64(file);
        return false; // 阻止自动上传
    };

    // 预览文件
    const handlePreviews = async (file: any) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        setPreviewImages(file.url || file.preview);
        setPreviewVisible(true);
    };

    const items = [
        {
            key: '1',
            label: 'Avatar',
            children: <Image
                width={28}
                preview={true}
                src={data.avatar}
            />,
        },
        {
            key: '2',
            label: 'email',
            children: data.email,
        },
        {
            key: '3',
            label: 'Created At',
            children: data.createdAt,
        },
        {
            key: '4',
            label: 'Updated At',
            children: data.updatedAt,
        },
        {
            key: '999',
            label: '',
            children: '',
        },
    ];

    return (
        <>
            <Card >
                <Descriptions
                    className='Pdescriptions'
                    column={2}
                    title="Personal Information"
                    size={'middle'}
                    extra={flag?<span className='extraAction' onClick={handleEdit} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', }}> <Edit style={{ marginRight: '5px' }} /> <span style={{ color: 'rgba(0, 82, 217, 1)', fontSize: '14px' }}>Edit</span></span>:null}
                    items={items}
                />
            </Card>

            <Card style={{ marginTop: 30 }}>
                <h3 style={{ textAlign: 'center' }}>Record Usage Diagram</h3> {/* 标题 */}
                {dataGraph.length ? <Line {...config} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Card>

            <Modal title="Edit Basic Information" width={650} open={isShow} onCancel={() => onReset()} footer={null} okText="Confirm"
                cancelText="Cancel">
                <Spin spinning={loading}>
                    <Form
                        {...layout}
                        form={form}
                        name="form_in_modal"
                        onFinish={onFinish}
                        style={{ maxWidth: 600 }}
                    >

                        <Form.Item
                            name="url"
                            label="Photo"
                            valuePropName="uploadFileList"
                            getValueFromEvent={({ fileList }) => fileList}
                        // rules={[{ required: true }]}
                        >
                            <Upload
                                accept="image/*"
                                listType="picture-card"
                                fileList={uploadFileList}
                                onChange={handleChanges}
                                onPreview={handlePreviews}
                                beforeUpload={handleBeforeUploads}
                                maxCount={1}
                                showUploadList={{
                                    showPreviewIcon: true,
                                    showRemoveIcon: false,
                                }}
                                className={styles.overrideUpload}
                            >
                                <div>
                                    <div className="text_upload" style={{ marginTop: 8 }}>
                                        Change Avatar
                                    </div>
                                </div>
                            </Upload>
                            <Image
                                wrapperStyle={{ display: 'none' }}
                                preview={{
                                    visible: previewVisible,
                                    onVisibleChange: (visible) => setPreviewVisible(visible),
                                    afterOpenChange: (visible) => !visible && setPreviewVisible(false),
                                }}
                                src={previewImages}
                            />
                        </Form.Item>

                        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter the email' }, validateInput]} initialValue={data.email}>
                            <Input style={{ width: '70%' }} allowClear disabled/>
                        </Form.Item>
                        <Form.Item name="createdAt" label="Created At" initialValue={data.createdAt ? dayjs(data.createdAt, 'YYYY-MM-DD') : ''}>
                            <DatePicker disabledDate={disabledDate} format={'YYYY-MM-DD'} />
                        </Form.Item>
                        <Form.Item name="updatedAt" label="Updated At" initialValue={data.updatedAt ? dayjs(data.updatedAt, 'YYYY-MM-DD') : ''}>
                            <DatePicker disabledDate={disabledDate} format={'YYYY-MM-DD'} />
                        </Form.Item>

                        <Form.Item {...tailLayout}>
                            <Space>
                                <Button htmlType="button" className='resetButton' onClick={onReset}>
                                    Cancel
                                </Button>
                                <Button type="primary" className='searchButton' htmlType="submit" disabled={loading}>
                                    Save
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    )
}

export default UserDetail;
