import React, { createContext, useReducer } from 'react';
import Reducer from './reducer';

import axios from 'axios';
import { baseURI } from '../config';

const intialState = {
    user: null,
    users: [],
};

export const GlobalContext = createContext();

const GlobalContextProvider = (props) => {
    const [state, dispatch] = useReducer(Reducer, intialState);

    const fetchProfile = () => {
        const token = localStorage.getItem('jwt');
        if (!token) return;
        axios.get(`${baseURI}/user/home`, {headers:{ 'Authorization': token }}).then((response) => {
            const {user, folders} = response.data;
            localStorage.setItem('jwt', token);
            dispatch({ type: 'LOAD_PROFILE', user, folders });
        }, (error) => {});
    }

    return (
        <GlobalContext.Provider value={{ state, dispatch, fetchProfile }}>
            {props.children}
        </GlobalContext.Provider>
    );
};
export default GlobalContextProvider;