import React from 'react'
import { useRoutes, Navigate, BrowserRouter } from 'react-router-dom'
// import routes from '../config/routes'

import LoginPage from './Login'
import Page403 from './Errors/403';
import NotFound from './Errors/404';
import Page500 from './Errors/500';
import MainLayout from '../components/MainLayout';

import demoRoutes from '../routes/demo';

function EntryPoint(){
    // const isLogined = Cookie.get(process.env.TOEKN_NAME);
    const isLogined = true;
    return !isLogined ? <Navigate to="login" replace /> : <Navigate to="/" />
}

function RoutesWrapper({routes}){
    return useRoutes(routes);
}

const routes = [
    ...demoRoutes
]

const baseRoutes = [
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '',
        element: <MainLayout routes={routes} />,
        children: [
            {
                path: '/',
                element: <EntryPoint />,
            }
        ].concat(routes)
    },
    { path: '403', element: <Page403 /> },
    { path: '404', element: <NotFound /> },
    { path: '500', element: <Page500 /> },
    { path: '*', element: <NotFound /> },
]

export default function Main(){ 

    return (
        <BrowserRouter>
            <RoutesWrapper routes={baseRoutes}/>
        </BrowserRouter>
    )
}