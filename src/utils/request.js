import axios from 'axios';
import { notification } from 'antd'
import NProgress from 'nprogress';
import Cookie from 'js-cookie';
import localforage from 'localforage';

const hostApi = process.env.HOST_API;
const token_name = process.env.TOKEN_NAME;

console.log(hostApi);

const requestQueen = {
  data: [],
  isLoading: function(url) {
    return this.data.indexOf(url) > -1;
  },
  push: function(url) {
    this.data.push(url)
  },
  remove: function(url){
    const idx = this.data.indexOf(url);
    if(idx > -1){
      this.data.splice(idx, 1);
    }
  }
}

function dataFormatter(data) {
  if(!data)return {};
  let res = data;
  if(data['withFile']){
    res = new FormData();
    for(const k in data){
      res.append(k, data[k])
    }
  }else if(data.pageSize){
    res.page = data.current;
    res.page_size = data.pageSize;
    delete res.current;
    delete res.pageSize;
  }
  return res
}

export default function initRequest(){

  axios.defaults.baseURL = hostApi;
  axios.defaults.timeout = 60000;

  axios.interceptors.request.use(async function (config) {
    // 在发送请求之前做些什么
    const authorization = {
      authorization: config.headers?.authorization
    };
    const accessToken = await localforage.getItem('accessToken')
    if(config.url.indexOf('/login') === -1){
      authorization["authorization"] = `Bearer ${accessToken}`;
    }

    if(requestQueen.isLoading(config.url))return;

    requestQueen.push(config.url);

    if(!config.hideLoading){
      NProgress.start();
    }

    return {
      ...config,
      data: dataFormatter(config.data),
      headers: {
        common: {
          ...config.headers.common,
          ...authorization
        },
        post: {
          'Content-Type': (!config.data || !config.data.withFile) ? 'application/json; charset=utf-8' : 'multipart/form-data; charset=utf-8'
        }
      }
    };
  });

  axios.interceptors.response.use(async function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么

    const {code, msg} = response.data;
    const { config } = response;
   
    requestQueen.remove(config.url);
    if(!config.hideLoading){
      NProgress.done();
    }

    if([0, 200].includes(code)){
      return {
        success: true,
        data: response.data.data,
      };
    }else if(+code === 8000){
      location.replace('/login');
    } else if(+code === 1003) {
      const access_token =  await refreshToken();
      Cookie.set(token_name, access_token);
      return axios.request({
        url: config.url, 
        data: config.data, 
        params: config.params,
        method: config.method,
        headers: {
          authorization:  `Bearer ${access_token}`
        }
      });
    }else {
      notification.error({
        message: msg
      })
      return Promise.reject({code, message: msg, url: config.url});
    }
  }, function (error) {
    
    NProgress.done();
    if(error.url){
      requestQueen.remove(config.url);
    }
    return Promise.reject(error);
  });
}

async function refreshToken() {
  const _accessToken = await localforage.getItem('accessToken');
  const userInfo = await localforage.getItem('userInfo');
  const refreshToken = await localforage.getItem('refreshToken');
  const res = await axios.request({
      url: hostApi +'/v2/auth/refresh-token',
      method: 'POST',
      header: {
          'authorization': `Bearer ${_accessToken}`
      },
      data: {
          refreshToken,
          mobilePhone: userInfo.mobilePhone,
          accountType: 'DOCTOR'
      }
  })
  if([0,200].includes(res.data.code)){
      localforage.setItem('accessToken', res.data.accessToken);
      localforage.setItem('refreshToken', res.data.refreshToken);
      return res.data.accessToken;
  }else{
    location.replace('/login');
  }
}
