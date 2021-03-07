import React, { useContext } from 'react';
import { NavLink, Redirect } from 'react-router-dom';

import axios from 'axios';

import { Row, Col, Form, Input, Button, message, Typography } from 'antd';

import { GlobalContext } from '../context';
import { baseURI } from '../config';

const { Title } = Typography;

const RegisterPage = () => {
    const { state, fetchProfile }  = useContext(GlobalContext);

    const onFinish = (event) => {
        const {email, password, first_name, last_name, confirm_password} = event;

        if (password !== confirm_password) {
            message.error('Passwords do not match!');
            return;
        }

        if (!email) {
            message.error('Email cannot be empty');
            return;
        } 

        if (!password) {
            message.error('Password cannot be empty');
            return;
        } 

        if (!first_name) {
            message.error('First Name cannot be empty');
            return;
        } 

        if (!last_name) {
            message.error('Last Name cannot be empty');
            return;
        } 

        axios.post(`${baseURI}/auth/register`, { email, password, first_name, last_name }, {}).then((response) => {
            const {token} = response.data;
            localStorage.setItem('jwt', token);
            message.success('Registration Successful!');
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    if (state.user)
        return <Redirect to={{ pathname: '/home' }} />

    return (
        <div style={{marginTop: '20vh'}}>
            <Row>
                <Col offset={8} span={8}>
                    <Title level={2}>Register</Title>
                    <Form
                        name="Register"
                        onFinish={onFinish}
                    >
                        <Form.Item label="Email" name="email" >
                            <Input />
                        </Form.Item>

                        <Form.Item label="First Name" name="first_name" >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Last Name" name="last_name" >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Password" name="password" >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item label="Confirm Password" name="confirm_password" >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" >
                                Register
                            </Button>
                        </Form.Item>
                    </Form>
                    <NavLink to="/" >Already have an account? Signin instead!</NavLink>
                </Col>
            </Row>
        </div>
    );
}
 
export default RegisterPage;