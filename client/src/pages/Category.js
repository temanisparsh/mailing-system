import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context';

import {Row, Col, message, Spin, Typography, Divider, List, Button } from 'antd';
import {baseURI} from '../config';

import axios from 'axios';
import _ from 'lodash';
import { NavLink, Redirect } from 'react-router-dom';

const {Title, Text} = Typography;

const categories = {
    'starred': 'Starred',
    'spam': 'Spam',
    'important': 'Important',
    'sent': 'Sent',
    'trash': 'Trash',
    'draft': 'Draft',
};

const CategoryPage = (props) => {

    const { state }  = useContext(GlobalContext);
    const [emails, setEmails] = useState([]);
    const [category, setCategory] = useState(null);

    useEffect(() => {
        const {params} = props.match;
        const {categoryName} = params;
        setCategory(categoryName);
        const token = localStorage.getItem('jwt');
        const email_ids = _.map(state.user[categoryName], email => email['$oid'])
        axios.post(`${baseURI}/email/all`, {email_ids}, {headers:{ 'Authorization': token }})
        .then((response) => {
            setEmails(response.data.emails);
        }, (error) => {
            message.error(error.response.data.message);
        });
    }, []);

    if (category && !categories[category])
        return <Redirect to="/" />

    return (
        <div style={{margin: '20px'}}>
            <List header={categories[category]} bordered dataSource={['Empty', ...emails]} renderItem = {
                (email) => {
                    if (email === 'Empty') {
                        return (
                            <List.Item>
                                    <Title level={5} >{category === 'draft' ? 'To': 'From'}</Title>
                                    <Title level={5} >Subject</Title>
                                    <Title level={5} >Content</Title>
                                    <Button></Button>
                            </List.Item>
                        );
                    }
                    return (
                        <List.Item>
                                <Text>{category === 'draft'
                                ? (email['to_user'] && _.invert(state.users)[email['to_user']['$oid']])
                                : _.invert(state.users)[email['from_user']['$oid']]}</Text>
                                <Text>{email.subject}</Text>
                                <Text>{email.content && email.content.length > 100 ? email.content.slice(0, 100) : email.content}</Text>
                                <NavLink to={category === 'draft' ? `/draft/${email['_id']['$oid']}` : `/email/${email['_id']['$oid']}`}>
                                    <Button>{ category === 'draft' ? 'Edit Draft' : 'View Email'}</Button>
                                </NavLink>
                        </List.Item>
                    );
                }
            }/>
        </div>
    );
}

export default CategoryPage;