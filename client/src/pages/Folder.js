import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context';

import {Form, Input, Row, Col, message, Spin, Typography, Divider, List, Button } from 'antd';
import {baseURI} from '../config';

import axios from 'axios';
import _ from 'lodash';
import { NavLink, Redirect } from 'react-router-dom';

const {Title, Text} = Typography;

const FolderPage = (props) => {

    const { state, fetchProfile }  = useContext(GlobalContext);
    const [emails, setEmails] = useState([]);
    const [folder, setFolder] = useState(null);
    const [deleted, setDeleted] = useState(false);

    const fetchFolder = () => {
        const {params} = props.match;
        const {folderId} = params;
        const token = localStorage.getItem('jwt');
        const foundFolder = _.find(state.folders, folder => folderId === folder['_id']['$oid']);
        if (!foundFolder) {
            message.error('Invalid Folder Id!');
        }
        setFolder(foundFolder);
        
        const email_ids = _.map(foundFolder.emails, email => email['$oid'])
        
        axios.post(`${baseURI}/email/all`, {email_ids}, {headers:{ 'Authorization': token }})
        .then((response) => {
            setEmails(response.data.emails);
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    useEffect(() => {
        fetchFolder();
    }, []);

    const onDelete = (event) => {
        const token = localStorage.getItem('jwt');
        axios.delete(`${baseURI}/folder?folder_id=${folder['_id']['$oid']}`, {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchProfile();
            setDeleted(true);
        }, (error) => {
            message.error(error.response.data.message);
        });
    };

    if (deleted)
        return <Redirect to="/" />
    
    const onUpdate = (event) => {
        const {folder_name} = event;

        if (!folder_name) {
            message.error('Folder Name cannot be empty');
            return;
        }

        const token = localStorage.getItem('jwt');
        axios.put(`${baseURI}/folder?folder_id=${folder['_id']['$oid']}`, {folder_name}, {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchProfile();
            fetchFolder();
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    return (
        <>
            { folder && <div style={{margin: '20px'}}>
                <Row span={6} offset={8}>
                    <Form
                        name="Folder"
                        onFinish={onUpdate}
                    >
                        <Form.Item label="Folder" name="folder_name" initialValue={folder.folder_name}>
                            <Input />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" >
                                Update Folder Name
                            </Button>
                        </Form.Item>
                    </Form>
                </Row>

                <List bordered dataSource={['Empty', ...emails]} renderItem = {
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
                <Button onClick={onDelete} type="primary" >
                    Delete Folder
                </Button>
            </div>}
        </>
    );
}

export default FolderPage;