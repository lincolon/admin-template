import axios from "axios";

export function login(data) {
    return axios.post('/v1/auth/login-pwd', {...data, accountType: 'DOCTOR'});
}

export function loginByCode(data) {
    return axios.post('/v1/auth/login', {...data, accountType: 'DOCTOR'});
}


export function sendCode(data) {
    return axios.post('/v1/auth/verify-code', data);
}

// 获取腾讯IM userSig
export function getIMSign() {
    return axios.get('/v1/im/user-sig');
}

