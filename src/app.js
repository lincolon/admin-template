import React from 'react';
import * as ReactDOM from 'react-dom/client';
import storage from 'localforage';
import App from './pages/index';
import '@modules/nprogress/nprogress.css'; 
import './global.less'

import projectConfig from '../project.config.json'

import initRequest from './utils/request';

storage.config({
    name: projectConfig.token_name
});

initRequest();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
