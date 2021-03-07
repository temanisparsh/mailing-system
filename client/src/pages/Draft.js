import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context';

import {Row, Col, Form, Button, Input, message, Checkbox, Spin } from 'antd';
import {baseURI} from '../config';

import axios from 'axios';
import _ from 'lodash';
import { Redirect } from 'react-router-dom';

const DraftPage = (props) => {

    const { state, fetchProfile }  = useContext(GlobalContext);

    const [isDraft, setIsDraft] = useState(false);
    const [email, setEmail] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const {params} = props.match;
        const {emailId} = params;
        const token = localStorage.getItem('jwt');
        axios.get(`${baseURI}/email/${emailId}`, {headers:{ 'Authorization': token }})
        .then((response) => {
            setEmail(response.data.email);
        }, (error) => {
            message.error(error.response.data.message);
        });
    }, []);

    const sendEmail = (event) => {
        const {content, subject, to} = event;
        if (!content) {
            message.error('Message Body cannot be empty');
            return;
        }
        if (!subject) {
            message.error('Subject Cannot be empty');
            return;
        }
        if (!to) {
            message.error('Reveivers email ID cannot be empty');
            return;
        }
        if (!(state.users)[to]) {
            message.error('Email Id does not exist!');
            return;
        }
        const token = localStorage.getItem('jwt');
        axios
        .post(`${baseURI}/email/send`, {email_id: email['_id']['$oid'], subject, content, to_user: state.users[to], is_draft: true} , {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            setSuccess(true);
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    const saveDraft = (event) => {
        let {content, subject, to} = event;
        if (to && !(state.users)[to]) {
            message.error('Email Id does not exist!');
            return;
        }

        content = content || '';
        subject = subject || '';

        const token = localStorage.getItem('jwt');
        axios
        .put(`${baseURI}/email/draft`, {email_id: email['_id']['$oid'], subject, content, to_user: state.users[to], is_draft: false} , {headers:{ 'Authorization': token }})
        .then((response) => {
            if (!isDraft) sendEmail(event);
            else {
                message.success(response.data.message);
                fetchProfile();
            }
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    const onSubmit = (event) => {
        saveDraft(event);
    };

    if (success) return <Redirect to="/home" />

    return (
        <> 
            {email && <div>
                <Row>
                    <Col offset={4} span={16}>
                        <Form
                            name="New Email"
                            onFinish={onSubmit}
                            labelCol={{span: 4}}
                        >
                            <Form.Item label="To" name="to" initialValue={
                                (email['to_user'] &&
                                email['to_user']['$oid'] &&
                                _.invert(state.users)[email['to_user']['$oid']]
                                ) ? _.invert(state.users)[email['to_user']['$oid']]
                                : ''
                            }>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Subject" name="subject" initialValue={email.subject}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Email Content" name="content" initialValue={email.content}>
                                <Input.TextArea
                                    style={{height: 300}}
                                />
                            </Form.Item>

                            <Form.Item label="&nbsp;">
                                <Button type="primary" htmlType="submit" >
                                    {isDraft ? 'Save as Draft' : 'Send Email'}
                                </Button>
                            </Form.Item>

                        </Form>

                        <Checkbox onChange={() => setIsDraft(!isDraft)} style={{marginLeft: '140px'}}>
                            Save as draft
                        </Checkbox>
                    </Col>
                </Row>
            </div>}
            {!email && <div style={{marginTop: '35vh', textAlign: 'center'}}>
                <Spin />
            </div>}
        </>
    );
}

export default DraftPage;