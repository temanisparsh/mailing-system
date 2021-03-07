import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context';

import {Row, Col, message, Spin, Typography, Divider, Button, Dropdown, Menu, Form, Input} from 'antd';
import { DownOutlined } from '@ant-design/icons';

import {baseURI} from '../config';

import axios from 'axios';
import _ from 'lodash';

import {NavLink, Redirect} from 'react-router-dom';

const {Title} = Typography;

const categories = {
    'inbox': 'Inbox',
    'starred': 'Starred',
    'spam': 'Spam',
    'important': 'Important',
    'sent': 'Sent',
    'trash': 'Trash',
    'draft': 'Draft',
};

const EmailPage = (props) => {

    const { state, fetchProfile }  = useContext(GlobalContext);
    const [category, setCategory] = useState(null);
    const [folder, setFolder] = useState(null);
    const [email, setEmail] = useState(null);
    const [deleted, setDeleted] = useState(false);

    const checkCategoryAndFolder = (currentEmail) => {
        let found = false;
        _.forEach(categories, (value, key) => {
            const matched = _.find(state.user[key], mail => mail['$oid'] === currentEmail['_id']['$oid']);
            if (matched) {
                setCategory(key);                
                found = true;
            }
        });
        if (found) return;
        _.forEach(state.user.folders, currentFolder => {
            const matched = _.find(currentFolder.emails, mail => mail['$oid'] === currentEmail['_id']['$oid']);
            if (matched) {
                setFolder(currentFolder);
            }
        });
    }

    const fetchEmail = () => {
        const {params} = props.match;
        const {emailId} = params;
        const token = localStorage.getItem('jwt');
        axios.get(`${baseURI}/email/${emailId}`, {headers:{ 'Authorization': token }})
        .then((response) => {
            setEmail(response.data.email);
            checkCategoryAndFolder(response.data.email);
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    useEffect(() => {
        fetchEmail();
    }, []);

    const moveToCategory = (cat) => {
        const {params} = props.match;
        const {emailId} = params;
        const token = localStorage.getItem('jwt');
        axios.post(`${baseURI}/email/mark/${emailId}/${cat}`, {}, {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchEmail();
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    const moveToFolder = (fold) => {
        const {params} = props.match;
        const {emailId} = params;
        const folderId = fold['_id']['$oid'];
        const token = localStorage.getItem('jwt');
        axios.post(`${baseURI}/email/folder/${emailId}/${folderId}`, {}, {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchEmail();
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    const onDelete = () => {
        const {params} = props.match;
        const {emailId} = params;
        const token = localStorage.getItem('jwt');
        axios.delete(`${baseURI}/email/${emailId}`, {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchProfile();
            setDeleted(true);
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    if (deleted)
        return <Redirect to="/" />;

    return (
        <> 
            {email && <div style={{margin: '20px'}}>
                <Row>
                    {_.map(categories, (value, key) => {
                        if (category !== key) {
                            return (
                                <Col span={3}>
                                    <Button type="primary" onClick={() => moveToCategory(key)}>Move to {categories[key]}</Button> 
                                </Col>
                            );
                        }
                        return null;
                    })}

                    <Col span={3}>
                        <Dropdown
                            overlay = {
                                <Menu>
                                    {state.folders.map(fold => {

                                        if (folder && folder.folder_name === fold.folder_name) return null;

                                        return (
                                            <Menu.Item>
                                                <Button onClick={() => moveToFolder(fold)} >{fold.folder_name}</Button>
                                            </Menu.Item>
                                        );
                                    })}
                                </Menu>
                            }
                        >
                            <a className="ant-dropdown-link">
                                Move To <DownOutlined />
                            </a>
                        </Dropdown>
                    </Col>
                </Row>
                <Divider />
                <Row offset={8} span={12}>
                    <Col span={4} offset={4}>
                        <Title level={5} >To:</Title>
                    </Col>
                    <Col >
                        <Title level={5} >{_.invert(state.users)[email['to_user']['$oid']]}</Title>
                    </Col>
                </Row>
                <Divider />
                <Row offset={8} span={12}>
                    <Col span={4} offset={4}>
                        <Title level={5} >From:</Title>
                    </Col>
                    <Col >
                        <Title level={5} >{_.invert(state.users)[email['from_user']['$oid']]}</Title>
                    </Col>
                </Row>
                <Divider />
                <Row offset={8} span={12}>
                    <Col span={4} offset={4}>
                        <Title level={5} >Subject:</Title>
                    </Col>
                    <Col >
                        <Title level={5} >{email.subject}</Title>
                    </Col>
                </Row>
                <Divider />
                <Row offset={8} span={12}>
                    <Col span={4} offset={4}>
                        <Title level={5} >Body:</Title>
                    </Col>
                    <Col >
                        <Title level={5}>{email.content}</Title>
                    </Col>
                </Row>
                <Divider />

                <Button type="primary" onClick={onDelete} >
                    Delete Email
                </Button>
            </div>}
            {!email && <div style={{marginTop: '35vh', textAlign: 'center'}}>
                <Spin />
            </div>}
        </>
    );
}

export default EmailPage;