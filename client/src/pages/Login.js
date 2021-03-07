import React, { useContext } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

import axios from 'axios';

import { Row, Col, Form, Input, Button, message, Typography } from 'antd';

import { GlobalContext } from '../context';
import { baseURI } from '../config';

const { Title } = Typography;

const LoginPage = () => {
    const { state, fetchProfile }  = useContext(GlobalContext);

    const onFinish = (event) => {
        const {email, password} = event;

        if (!email) {
            message.error('Email cannot be empty');
            return;
        }

        if (!password) {
            message.error('Password cannot be empty');
            return;
        }

        axios.post(`${baseURI}/auth/login`, { email, password }, {}).then((response) => {
            const {token} = response.data;
            localStorage.setItem('jwt', token);
            message.success('Login Successful!');
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    if (state.user)
        return <Redirect to={{ pathname: '/home' }} />

    return (
        <div style={{marginTop: '40vh'}}>
            <Row>
                <Col offset={8} span={8}>
                    <Title level={2}>Login</Title>
                    <Form
                        name="Login"
                        onFinish={onFinish}
                    >
                        <Form.Item label="Email" name="email" >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Password" name="password" >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" >
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                    <NavLink to="/register" >Don't Have an account? Sign up instead</NavLink>
                </Col>
            </Row>
        </div>
    );
}
 
export default LoginPage;