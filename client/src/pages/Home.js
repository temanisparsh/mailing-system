import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context';

import {Row, Col, message, Form, Input, Typography, Divider, List, Button, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import {baseURI} from '../config';

import axios from 'axios';
import _ from 'lodash';
import { NavLink } from 'react-router-dom';

const {Title, Text} = Typography;

const HomePage = () => {

    const { state, fetchProfile }  = useContext(GlobalContext);
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        const email_ids = _.map(state.user.inbox, email => email['$oid'])
        const token = localStorage.getItem('jwt');
        axios.post(`${baseURI}/email/all`, {email_ids}, {headers:{ 'Authorization': token }})
        .then((response) => {
            setEmails(response.data.emails);
        }, (error) => {
            message.error(error.response.data.message);
        });
    }, []);

    const onFolderSubmit = (event) => {
        const {folder_name} = event;

        if (!folder_name) {
            message.error('Folder Name cannot be empty');
            return;
        }

        const token = localStorage.getItem('jwt');
        axios.post(`${baseURI}/folder`, {folder_name}, {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });
    };

    return (
        <div style={{margin: '20px'}}>
            <Row>
                <Col span={6} offset={1}>
                    <NavLink to="/mail/new">
                        <Button type="primary">
                            New Email
                        </Button>
                    </NavLink>
                </Col>
                <Col span={6} offset={4}>
                    <Dropdown
                        overlay = {
                            <Menu>
                                <Menu.Item>
                                    <NavLink to="/category/starred">Starred</NavLink>
                                </Menu.Item>

                                <Menu.Item>
                                    <NavLink to="/category/important">Important</NavLink>
                                </Menu.Item>

                                <Menu.Item>
                                    <NavLink to="/category/trash">Trash</NavLink>
                                </Menu.Item>

                                <Menu.Item>
                                    <NavLink to="/category/sent">Sent</NavLink>
                                </Menu.Item>

                                <Menu.Item>
                                    <NavLink to="/category/draft">Draft</NavLink>
                                </Menu.Item>

                                <Menu.Item>
                                    <NavLink to="/category/spam">Spam</NavLink>
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <a className="ant-dropdown-link">
                            Inbox <DownOutlined />
                        </a>
                    </Dropdown>
                </Col>

                <Col span={6}>
                    <Dropdown
                        overlay = {
                            <Menu>
                                {state.folders.map(folder => (
                                    <Menu.Item>
                                        <NavLink to={`/folder/${folder['_id']['$oid']}`} >{folder.folder_name}</NavLink>
                                    </Menu.Item>
                                ))}
                            </Menu>
                        }
                    >
                        <a className="ant-dropdown-link">
                            View Folder <DownOutlined />
                        </a>
                    </Dropdown>
                </Col>
            </Row>

            <Divider />

            <List header={'Inbox'} bordered dataSource={['Empty', ...emails]} renderItem = {
                (email) => {
                    if (email === 'Empty') {
                        return (
                            <List.Item>
                                    <Title level={5} >From</Title>
                                    <Title level={5} >Subject</Title>
                                    <Title level={5} >Content</Title>
                                    <Button></Button>
                            </List.Item>
                        );
                    }
                    return (
                        <List.Item>
                                <Text>{_.invert(state.users)[email['from_user']['$oid']]}</Text>
                                <Text>{email.subject}</Text>
                                <Text>{email.content && email.content.length > 100 ? email.content.slice(0, 100) : email.content}</Text>
                                <NavLink to={`/email/${email['_id']['$oid']}`}>
                                    <Button>View Email</Button>
                                </NavLink>
                        </List.Item>
                    );
                }
            }/>

            <Divider />

            <Row span={6} offset={8}>
                <Form
                    name="Folder"
                    onFinish={onFolderSubmit}
                >
                    <Form.Item label="Folder" name="folder_name">
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" >
                            Add Folder
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </div>
    );
}

export default HomePage;