import { Button, Card, Descriptions, Form, Image, Input, message, Modal, Select, Space, Spin, Upload, UploadFile } from 'antd';
import { useEffect, useState } from 'react';
import { ReactComponent as Edit } from '@/assets/svg/Edit.svg';
import { validateInput } from '@/utils/rules';
import styles from './index.less';
import { getUser, updateUser } from '@/services/Personal Center/api';
import { uploadImg } from '@/services/uploadImg/api';
import { getRoles } from '@/services/authorityManagement/roles/api';
import { get } from 'lodash';
import { getLoginInfo } from '@/utils/userInfo';
import { getUserInfoAgain } from '@/services/configAPI/api';
import { initPermissions } from '@/utils/auth';


const mockData = {
    name: 'John Doe',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
    role: 'Admin',
    email: 'test@qq.com',
    phone: '123456789'
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
        name: string;
        avatar: string;
        role: string;
        email: string;
        phone: string;
        nickname?: string;
    }

    const [data, setData] = useState<UserData>({
        name: '',
        avatar: '',
        role: '',
        email: '',
        phone: '',
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
    const [roleList, setRoleList] = useState<any[]>([]);

    useEffect(() => {
        getUserInfo();
        getRoleList();
    }, []);

    const getRoleList = async () => {
        const res = await getRoles();
        setRoleList(res.data);
    }

    const getUserInfo = async () => {
        const params = new URLSearchParams(window.location.hash.split('?')[1]); // 从 hash 部分提取查询参数
        const userId = params.get('id') || '';
        // const params = new URLSearchParams(location.search);
        // const userId = params.get('id') || '';
        const { data } = await getUser(userId);
        // console.log(data, userId, '1', params, 'data');
        setData(data);
        setDefaultUrl(data.avatar);
        setUploadFileList([{ uid: '-1', name: 'image', status: 'done', url: data.avatar }]);

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
        let avatar = defaultUrl;
        console.log(values, 'values', values.url);
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
        const { name, role, email, phone } = values;
        try {
            const res = await updateUser(userId, { nickname: name, role, email, phone, avatar });
            if (res.msg === 'SUCCESS') {
                const userInfo = getLoginInfo();
                if (userInfo.id === userId) {
                    const { data } = await getUserInfoAgain(userId);
                    if (role !== userInfo.role) {
                        localStorage.setItem('UserInfo', JSON.stringify({ ...data, name: data.nickname }));
                        initPermissions();
                    } else {
                        localStorage.setItem('UserInfo', JSON.stringify({ ...data, name: data.nickname }));
                    }
                }
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
            label: 'Nickname',
            children: data.nickname,
        },
        {
            key: '3',
            label: 'Role',
            children: data.role,
        },
        {
            key: '4',
            label: 'Email',
            children: data.email,
        },
        {
            key: '5',
            label: 'Phone Number',
            children: data.phone,
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
                    extra={<span className='extraAction' onClick={handleEdit} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', }}> <Edit style={{ marginRight: '5px' }} /> <span style={{ color: 'rgba(0, 82, 217, 1)', fontSize: '14px' }}>Edit</span></span>}
                    items={items}
                />
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

                        <Form.Item name="name" label="Nickname" rules={[{ required: true, message: 'Please enter the Nickname' }, validateInput]} initialValue={data.nickname}>
                            <Input style={{ width: '70%' }} allowClear />
                        </Form.Item>
                        {/* <Form.Item name="role" label="Role" rules={[{ required: true }, validateInput]} initialValue={data.role}>
                            <Input style={{ width: '70%' }} allowClear />
                        </Form.Item> */}
                        <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select the Role' }, validateInput]} initialValue={data.role}>
                            <Select
                                style={{ width: '70%' }}
                                placeholder=""
                                fieldNames={{
                                    label: 'name',
                                    value: 'name'
                                }}
                                options={roleList}
                            >
                            </Select>
                        </Form.Item>
                        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter the Email' }, validateInput]} initialValue={data.email}>
                            <Input style={{ width: '70%' }} allowClear />
                        </Form.Item>
                        <Form.Item name="phone" label="Phone Number" rules={[validateInput]} initialValue={data.phone}>
                            <Input style={{ width: '70%' }} allowClear />
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
