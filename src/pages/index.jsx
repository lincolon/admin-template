import React from 'react'
import { useRoutes, Navigate, BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN'; 

// import routes from '../config/routes'

import LoginPage from './Login'
import App from './App'
import Page403 from './Errors/403';
import NotFound from './Errors/404';
import Page500 from './Errors/500';
import MainLayout from '../components/MainLayout';

const baseRoutes = [
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/*',
        element: <MainLayout />,
        children: [
            {
                path: '',
                element: <EntryPoint />,
            },
            {
                path: 'app',
                element: <App />,
            }
        ]
    },
    { path: '403', element: <Page403 /> },
    { path: '404', element: <NotFound /> },
    { path: '500', element: <Page500 /> },
    { path: '*', element: <NotFound /> },
]

function EntryPoint(){
    // const isLogined = Cookie.get(projectConfig.token_name);
    const isLogined = true;
    return !isLogined ? <Navigate to="login" replace /> : <Navigate to="app" />
}

function RoutesWrapper({routes}){
    return useRoutes(routes);
}



export default function Main(){ 

    return (
        <ConfigProvider 
            locale={zhCN}
            theme={{
                token: {
                    colorPrimary: '#165DFF',
                },
                components: {
                    Statistic: {
                        contentFontSize: 14
                    },
                }
            }}
        >
            <BrowserRouter>
                <RoutesWrapper routes={baseRoutes}/>
            </BrowserRouter>
        </ConfigProvider>
    )
}