import React, { useState } from 'react';
import { Layout } from 'antd';
import Logo from './Logo'
import { Outlet, useNavigate } from 'react-router-dom';
import {
  PageContainer,
  ProCard,
  ProLayout,
} from '@ant-design/pro-components';

function MainLayout() {

  const [pathname, setPathname] = useState('/app');

  const navigate = useNavigate();
  
  return (
    <ProLayout
      fixedHeader
      fixSiderbar
      siderWidth={256}
      logo={<Logo />}
      title={process.env.PROJECT_NAME}
      menu={{type: 'group'}}
      bgLayoutImgList={[
        {
          src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
          left: 85,
          bottom: 100,
          height: '303px',
        },
        {
          src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
          bottom: -68,
          right: -45,
          height: '303px',
        },
        {
          src: 'https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png',
          bottom: 0,
          left: 0,
          width: '331px',
        },
      ]}
      route={[
        {name: '第一页',path: '/login' },
        {name: '第二页',path: '/app'},
      ]}
      
      
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        title: '七妮妮',
      }}
      // actionsRender={(props) => {
      //   if (props.isMobile) return [];
      //   return [
      //     <InfoCircleFilled key="InfoCircleFilled" />,
      //     <QuestionCircleFilled key="QuestionCircleFilled" />,
      //     <GithubFilled key="GithubFilled" />,
      //   ];
      // }}
      location={{pathname}}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            setPathname(item.path || '/welcome');
            navigate(item.path || '/welcome');
          }}
        >
          {dom}
        </div>
      )}
    >
      <PageContainer>
        <ProCard
          style={{
            height: '100vh',
            minHeight: 200,
          }}
        >
          <div />
        </ProCard>
      </PageContainer>
    </ProLayout>
  );
}

export default MainLayout;
