import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import axios from 'axios';
import { GlobalContext } from '../context';
import { baseURI }from '../config';

import LoginPage from './Login';
import RegisterPage from './Register';
import HomePage from './Home';
import SettingsPage from './Settings';
import NewMailPage from './NewMail';
import DraftPage from './Draft';
import FolderPage from './Folder';
import CategoryPage from './Category';
import EmailPage from './Email';

import Header from './Header';
import Footer from './Footer';

const AppRouter = () => {

    const {state, dispatch, fetchProfile} = useContext(GlobalContext);

    useEffect(() => {
        axios.get(`${baseURI}/user/all`).then((response) => {
            const users = response.data.users;
            dispatch({ type: 'LOAD_EMAILS', users });
        }, (error) => {});
    }, []);
    
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!state.user && token) {
            try {
                fetchProfile();
            }
            catch (err) {}
        }
    }, [fetchProfile, state]);

    const PrivateRoute = ({ component: Component, ...rest}) => (
        <Route 
            {...rest} 
            render = {(props) => (
                state.user ? <Component {...props} /> : <Redirect to={{ pathname: '/'}} />
            )} 
        />
    )

    return (
        <Router>
            <Header />
            <div style={{minHeight: '90vh'}}>
                <Switch>
                    <Route exact path="/" component={LoginPage} />
                    <Route exact path="/register" component={RegisterPage} />
                    <PrivateRoute exact path="/home" component={HomePage} />
                    <PrivateRoute exact path="/settings" component={SettingsPage} />
                    <PrivateRoute exact path="/mail/new" component={NewMailPage} />
                    <PrivateRoute exact path="/draft/:emailId" component={DraftPage} />
                    <PrivateRoute exact path="/email/:emailId" component={EmailPage} />
                    <PrivateRoute exact path="/category/:categoryName" component={CategoryPage} />
                    <PrivateRoute exact path="/folder/:folderId" component={FolderPage} />
                </Switch>
            </div>
            <Footer />
        </Router>
    );
}

export default AppRouter;
