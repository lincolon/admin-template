import React, { useRef, useState } from 'react';
import { Form, Input, Button, Layout, message } from 'antd';
import {
  LockOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'
import Cookie from 'js-cookie';
import './login.less';
import rules from '../../utils/rules';

import storage from 'localforage'
import { ProFormText } from '@ant-design/pro-form';

const { Content } = Layout;

const { phoneReg } = rules;

function LoginPage(props) {

  const [ form ] = Form.useForm();
  const navgiate = useNavigate()

  const handleSubmit = async (values) => {
    // 这里可以使用登录的接口
    navgiate('/app');
  }

  return (
    <Layout className="loginLayeroutContainer">
      <Content className="loginLayeroutContent">
        <div className='banner'></div>
        <section className="loginFormContainer">
          <div style={{
            width: 400
          }}>
            <h2 style={{textAlign: 'center', color: '#3A3F63'}}>{process.env.PROJECT_NAME}</h2>
            <div style={{textAlign: 'center', color: '#6A74A5', marginBottom: 20}}>欢迎使用</div>
            <Form 
              form={form}
              onFinish={handleSubmit} 
              className="login-form"
              initialValues={{userName: '13586578127', code: '1234'}}
            >
              <ProFormText 
                name="userName" 
                placeholder='请输入登录账号'
                fieldProps={{
                  size: 'large',
                  prefix: <PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />,
                }}
                rules={[{ required: true, message: '请输入登录账号' }]}
              />
              <ProFormText.Password
                name="password" 
                placeholder='请输入登录密码'
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />,
                }}
                rules={[{ required: true, message: '请输入登录密码' }]}
              />
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

export default LoginPage;