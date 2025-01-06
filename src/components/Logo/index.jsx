import React from 'react';
import { useNavigate } from 'react-router';

import projectConfig from '../../../project.config.json';

import './style.css';

export default function Logo(){

    const navigate = useNavigate();

    return (
        <section className="logoContainer">
            <a onClick={() => {navigate('/app', { replace: true })}}>
                <span className={`logo img-cover mgt-block`}></span>
                <h2 
                    className="mgt-block" 
                    style={{
                        color: '#2F80ED',
                        margin: 0,
                    }}
                >{projectConfig.name}</h2>
            </a>
        </section>
    )
}