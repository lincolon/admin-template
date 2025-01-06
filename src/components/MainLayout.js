import React from 'react';
import { Layout } from 'antd';
import TopHeader from './TopHeader'
import Logo from './Logo'
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

function MainLayout() {

  const navigate = useNavigate();
  
  return (
      <Layout style={{ 
        minHeight: '100vh', 
      }}>
        <Header style={{
          position: 'fixed', 
          // background: '#fff', 
          padding: 0, 
          zIndex: 999, 
          width: '100%', 
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.13)', 
          left: 0, 
          // paddingLeft: offsetLeft, 
          height: 54,
          linHeight: 54,
          transition: 'padding-left 0.2s' 
        }}  
        >
          <section style={{position: 'relative', height: '100%', lineHeight: 1}}>
            <Logo navigate={navigate}/>
            <TopHeader />
          </section>
        </Header>
        <Content style={{ minHeight: 'auto', paddingTop: 54}} id="mainContainer">
          <Outlet />
        </Content>
      </Layout>
  );
}

export default MainLayout;
