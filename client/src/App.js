import React from 'react';
import GlobalContextProvider from './context';
import AppRouter from './pages';

const App = () => {
    return (
        <div>
            <GlobalContextProvider>
                <AppRouter />
            </GlobalContextProvider>
        </div>
    );
}
 
export default App;
