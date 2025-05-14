import React from 'react';
import { useNavigate } from 'react-router';
import './style.css';

export default function Logo(){

    const navigate = useNavigate();

    return (
        <div onClick={() => {navigate('/app', { replace: true })}}>
            <span className={`logo img-cover mgt-block`}></span>
        </div>
    )
}