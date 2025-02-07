import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { FacebookOutlined, TwitterOutlined, SettingOutlined } from '@ant-design/icons';
import './index.less';
import { login } from '@/services/Login/api';
import { useModel } from '@umijs/max';
import { getMenuList, initPermissions } from '@/utils/auth';

const { Title, Text } = Typography;

const Login = () => {
    const { setInitialState } = useModel('@@initialState');

    const onFinish = async (values: any) => {
        console.log('Success:', values);
        const { data } = await login(values);
        if (data.token) {
            localStorage.setItem('UserInfo', JSON.stringify({ ...data, name: data.nickname }));
            message.open({
                type: 'success',
                content: "Login successful",
                duration: 1.5
            })

            initPermissions();

            await setInitialState((s: any) => ({
                ...s,
                currentUser: { ...data, token: data.token, name: data.nickname },
            }));
            window.location.href = '/';
            return;
        } else {
            message.open({
                type: 'error',
                content: "The information is incorrect, please fill it out again",
                duration: 2
            })
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="login-container">
            <div className='title-box'>Admin Panel</div>
            <div className="login-box">
                <Title level={3} className="login-title">
                    Login
                </Title>
                <Text className="login-subtitle">Sign in to your account</Text>
                <Form
                    name="login"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="nickname"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input placeholder="Nickname" className="login-input" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input placeholder="Email" className="login-input" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password placeholder="Password" className="login-input" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-button">
                            Login
                        </Button>
                    </Form.Item>
                    <Text className="forgot-password">Forgot password?</Text>
                </Form>
                {/* <div className="social-icons">
                    <FacebookOutlined className="icon" />
                    <TwitterOutlined className="icon" />
                    <SettingOutlined className="icon" />
                </div> */}
            </div>
        </div>
    );
};

export default Login;
