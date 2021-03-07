import React, { useContext, useState } from 'react';
import { GlobalContext } from '../context';

import {Row, Col, Form, Button, Input, message, Checkbox } from 'antd';
import {baseURI} from '../config';

import axios from 'axios';

const NewMailPage = () => {

    const { state, fetchProfile }  = useContext(GlobalContext);

    const [isDraft, setIsDraft] = useState(false);

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
        .post(`${baseURI}/email/send`, {subject, content, to_user: state.users[to], is_draft: false} , {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
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
        .post(`${baseURI}/email/draft`, {subject, content, to_user: state.users[to], is_draft: false} , {headers:{ 'Authorization': token }})
        .then((response) => {
            message.success(response.data.message);
            fetchProfile();
        }, (error) => {
            message.error(error.response.data.message);
        });
    }

    const onSubmit = (event) => {
        if (!isDraft) sendEmail(event);
        else saveDraft(event);
    };

    return (
        <div>
            <Row>
                <Col offset={4} span={16}>
                    <Form
                        name="New Email"
                        onFinish={onSubmit}
                        labelCol={{span: 4}}
                    >
                        <Form.Item label="To" name="to">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Subject" name="subject">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Email Content" name="content">
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
        </div>
    );
}
 
export default NewMailPage;