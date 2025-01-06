import axios from 'axios';
import { isString } from 'lodash-es';

// 登录
export function login(data) {
  return axios.post('/v1/auth/login-pwd', {...data, accountType: ' DOCTOR'});
}

// 刷新token
export function refreshToken() {
    return axios.post('/v2/auth/refresh-token');
}

// 文件上传
export function uploadImage(file) {
  return axios.post('/v1/upload-file', { file, withFile: true });
}

// 问诊单 - 接诊/拒诊
export function acceptOrRefusePaint(data) {
  return axios.post('/v1/doctors/consultation/opt', data);
}
    