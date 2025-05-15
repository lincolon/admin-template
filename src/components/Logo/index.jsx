import React from 'react';
import { useNavigate } from 'react-router';

export default function Logo(){

    const navigate = useNavigate();

    return (
        <div 
            onClick={() => {navigate('/', { replace: true })}}
            className="img-cover inline-flex"
            style={{
                width: 34,
                height: 34,
                cursor: 'pointer',
                backgroundImage: `url(${require('../../assets/logo.png')})`,
            }}
        ></div>
    )
}