import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { GlobalContext } from '../context';

import { PageHeader, Button, message } from 'antd';

const Header = () => {
    const { state, dispatch }  = useContext(GlobalContext);

    if (!(state.user)) return '';

    const onLogout = (event) => {
        localStorage.removeItem('jwt');
        message.success('User logged out!');
        dispatch({ type: 'LOAD_PROFILE', user: null });
    }

    const extras = [
        <Button type="primary">
            <NavLink to="/settings" >Settings</NavLink>
        </Button>
    ]

    if (state.user) extras.push(
        <Button type="primary" onClick={onLogout}>
            Logout
        </Button>
    );

    return (
        <div>
            <NavLink to="/">
                <PageHeader
                    ghost={false}
                    title="Mailing System"
                    extra={extras}
                />
            </NavLink>
        </div>
    );
}

export default Header;