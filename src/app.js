import React from 'react';
import { ConfigProvider } from 'antd';
import * as ReactDOM from 'react-dom/client';
import storage from 'localforage';
import App from './pages/index';
import '@modules/nprogress/nprogress.css'; 
import './global.less'
import './reset.less'

import initRequest from './utils/request';

import zhCN from 'antd/lib/locale/zh_CN.js';

storage.config({
    name: process.env.TOEKN_NAME,
});

initRequest();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
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
        <App />
    </ConfigProvider>
);
