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
import routes from '../config/routes';

function MainLayout() {

  const currentPath = useLocation().pathname;
  const [pathname, setPathname] = useState(currentPath);

  const navigate = useNavigate();
  
  return (
    <section style={{height: '100vh', overflow: 'auto'}}>
    <ProLayout
      fixedHeader
      fixSiderbar
      logo={<Logo />}
      siderWidth={256}
      title={process.env.PROJECT_NAME}
      location={{pathname}}
      layout='mix' // 'side' | 'top' | 'mix'
      // menu={{type: 'group'}}
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
            routes: [
              {
                path: '/list/cardList',
                name: '卡片列表'
              },
              {
                path: '/list/basicList',
                name: '基础列表'
              },
              {
                path: '/list/searchList',
                name: '搜索列表'
              }
            ]
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
