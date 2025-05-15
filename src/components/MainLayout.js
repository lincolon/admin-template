import React, { useState } from 'react';
import { 
  InfoCircleFilled,
  QuestionCircleFilled,
  GithubFilled,
} from '@ant-design/icons';
import Logo from './Logo'
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ProLayout,
} from '@ant-design/pro-components';

function MainLayout() {

  const currentPath = useLocation().pathname;
  const [pathname, setPathname] = useState(currentPath);

  const navigate = useNavigate();
  
  return (
    <section style={{height: '100vh', overflow: 'auto'}}>
    <ProLayout
      fixedHeader
      fixSiderbar
      siderWidth={256}
      logo={<Logo />}
      title={process.env.PROJECT_NAME}
      menu={{type: 'group'}}
      layout='side'
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
      route={{
        path: '/',
        routes: [
          {
            path: '/login',
            name: '登录页',
            icon: <GithubFilled />
            // component: './Login',
          },
          {
            path: '/list',
            name: '列表页',
            // component: './App',
          },
          {
            path: '/details',
            name: '详情页',
            // component: './App',
          },
        ],
      }}
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        title: '七妮妮',
      }}
      actionsRender={(props) => {
        if (props.isMobile) return [];
        return [
          <InfoCircleFilled key="InfoCircleFilled" />,
          <QuestionCircleFilled key="QuestionCircleFilled" />,
          <GithubFilled key="GithubFilled" />,
        ];
      }}
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
      token={{
        pageContainer: {
          paddingInlinePageContainerContent: 24,
          paddingBlockPageContainerContent: 20
        }
      }}
    >
      <Outlet />
    </ProLayout>
    </section>
  );
}

export default MainLayout;
