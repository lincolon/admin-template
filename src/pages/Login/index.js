import React, { useRef, useState } from 'react';
import { Form, Input, Button, Layout, message } from 'antd';
import {
  LockOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'
import Cookie from 'js-cookie';
import './login.less';
import CFooter from '../../components/CFooter';
import rules from '../../utils/rules';

import { login, loginByCode, sendCode, getIMSign  } from './service';

import storage from 'localforage'
import { ProFormDependency } from '@ant-design/pro-form';

const { Content } = Layout;

const { phoneReg } = rules;


function LoginPage(props) {

  const [ form ] = Form.useForm();
  const navgiate = useNavigate()

  const handleSubmit = async (values) => {
    const { data: { token, user } } = await loginByCode({mobilePhone: values.userName, code: values.code})
    storage.setItem('accessToken', token.accessToken).then(async () => {
      storage.setItem('refreshToken', token.refreshToken);
      const imSign = await getIMSign();
      storage.setItem('imSign', imSign.data);
      await storage.setItem('userInfo', user);
      navgiate('/app');
    });
    
  }

  return (
    <Layout className="loginLayeroutContainer">
      <Content className="loginLayeroutContent">
        <div className='banner'></div>
        <section className="loginFormContainer">
          <div style={{
            width: 400
          }}>
            <h2 style={{textAlign: 'center', color: '#3A3F63'}}>郑州市中医院互联网医院医生工作站</h2>
            <div style={{textAlign: 'center', color: '#6A74A5', marginBottom: 20}}>欢迎使用</div>
            <Form 
              form={form}
              onFinish={handleSubmit} 
              className="login-form"
              initialValues={{userName: '13586578127', code: '1234'}}
            >
              <Form.Item
                name="userName"
                rules={[
                  { required: true, message: '请输入登录账号' },
                ]}
              >
                <Input 
                  size="large" 
                  prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
                  placeholder="登录手机" 
                />
              </Form.Item>
              <ProFormDependency name={['userName']}>
                {
                  ({userName}) => {
                    return <Form.Item
                      name="code"
                      rules={[
                        { required: true, message: '请输入验证码' },
                      ]}
                    >
                    <CodeSender phone={userName} />
                  </Form.Item>
                  }
                }
              </ProFormDependency>
              <Form.Item>
                <Button size="large" type="primary" shape="round" htmlType="submit" className="loginFormButton">
                  登&nbsp;&nbsp;录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </section>
      </Content>
    </Layout>
  )
}

function CodeSender({ phone, onChange, value }) {

  const [ disabled, setDisabled ] = useState(false);
  const [ countDown, setCountDown ] = useState('获取验证码');
  const timer = useRef(null);

  const handleSendCode = async () => {
    if(phoneReg.test(phone)) {
      await sendCode({mobilePhone: phone});
      setDisabled(true);
      let time = 60;
      timer.current = setInterval(() => {
        if(time <= 1) {
          clearInterval(timer.current);
          setDisabled(false);
          setCountDown('获取验证码')
        } else {
          setCountDown(`${time}秒后重新获取`);
          time--;
        }
      }, 1000);
    }else{
      message.error('请输入正确的手机号');
    }
  }

  return (
    <Input 
      prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
      size="large" 
      value={value}
      placeholder="请输入验证码" 
      onChange={onChange}
      addonAfter={
        <Button disabled={disabled} type="link" onClick={handleSendCode}>{countDown}</Button>
      }
    />
  )
}

export default LoginPage;