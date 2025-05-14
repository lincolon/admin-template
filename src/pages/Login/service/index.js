import axios from "axios";

export function login(data) {
    return axios.post('/v1/auth/login-pwd', data);
}


export function sendCode(data) {
    return axios.post('/v1/auth/verify-code', data);
}



