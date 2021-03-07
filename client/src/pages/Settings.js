import React, { useContext } from 'react';
import { GlobalContext } from '../context';

import {Row, Col, Form, Button, Input, Typography, Divider, message } from 'antd';
import {baseURI} from '../config';

import axios from 'axios';

const {Title} = Typography;

const SettingsPage = () => {

    const { state, fetchProfile }  = useContext(GlobalContext);

    const onSettingsUpdate = (event) => {

        const {first_name, last_name} = event;

        if (!first_name) {
            message.error('First Name cannot be empty');
            return;
        } 

        if (!last_name) {
            message.error('Last Name cannot be empty');
            return;
        } 

        const token = localStorage.getItem('jwt');

        axios
        .put(`${baseURI}/user/settings`, { first_name, last_name }, {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });

    }

    const onPasswordUpdate = (event) => {

        const {old_password, new_password, confirm_password} = event;

        if (confirm_password !== new_password) {
            message.error('Passwords do not match!');
            return;
        }

        if (!old_password) {
            message.error('Old Password cannot be empty');
            return;
        } 

        if (!new_password) {
            message.error('New Password cannot be empty');
            return;
        } 

        const token = localStorage.getItem('jwt');

        axios
        .put(`${baseURI}/user/reset_password`, { old_password, new_password }, {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    return (
        <div>
            <Row>
                <Col span={6} offset={8}>
                    <Row>
                        <Col span={4} offset={4}>
                            <Title level={5} >Email:</Title>
                        </Col>
                        <Col >
                            <Title level={5} >{state.user.email}</Title>
                        </Col>
                    </Row>
                    <Divider />
                    <Row>
                        <Col offset={2}>
                        <Title level={4} >Account Settings</Title>
                            <Form
                                name="Settings"
                                onFinish={onSettingsUpdate}
                            >
                                <Form.Item label="First Name" name="first_name" initialValue={state.user.first_name}>
                                    <Input />
                                </Form.Item>

                                <Form.Item label="Last Name" name="last_name" initialValue={state.user.last_name}>
                                    <Input />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" >
                                        Update Settings
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                    <Divider />
                    <Row>
                        <Col offset={2}>
                            <Title level={4} >Password Settings</Title>
                            <Form
                                name="Password Settings"
                                onFinish={onPasswordUpdate}
                            >
                                <Form.Item label="Old Password" name="old_password">
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item label="New Password" name="new_password">
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item label="Confirm Password" name="confirm_password">
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" >
                                        Update Password
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
}
 
export default SettingsPage;