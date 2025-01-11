import React from 'react';
import { Layout } from 'antd';
import TopHeader from './TopHeader'
import Logo from './Logo'
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;

function MainLayout() {

  const navigate = useNavigate();
  
  return (
    <div className='flexbox'>
      <div style={{position: 'relative', zIndex: 10000, backgroundColor: '#0C2556', width: 80}}>
        <Logo navigate={navigate}/>
      </div>
      <Layout style={{ 
        minHeight: '100vh', 
      }}>
        <Header style={{
          position: 'fixed', 
          padding: 0, 
          zIndex: 999, 
          width: '100%', 
          boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.13)', 
          left: 0, 
          height: 54,
          linHeight: 54,
          backgroundColor: '#fff'
        }}  
        >
          <div className='flexbox' style={{position: 'relative', height: '100%', lineHeight: 1}}>
            <div 
              className='flex1'
              style={{
                paddingLeft: 100,
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
                lineHeight: '54px',
                fontStyle: 'italic',
                letterSpacing: 1,
              }}
            >郑州市中医院医生工作台</div>
            <TopHeader />
          </div>
        </Header>
        <Content style={{ minHeight: 'auto', paddingTop: 54}} id="mainContainer">
          <Outlet />
        </Content>
      </Layout>
    </div>
  );
}

export default MainLayout;
