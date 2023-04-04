import {
  DashboardOutlined,
  AppstoreOutlined,
  CrownOutlined,
  ProfileOutlined,
  BranchesOutlined,
  PayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons'; 
import { Spin } from 'antd';

import React from 'react';

function Loading(){
  return <div
          style={{
            textAlign: 'center',
            padding: '100px 0',
          }}
        ><Spin /></div>
}

function AsyncComponent({src}){

  const Comp = React.lazy(() => import(`@/pages/${src}`))

  return <React.Suspense fallback={<Loading />}>
    <Comp />
  </React.Suspense>
}

const routes = [
  {
    label: '一级菜单',
    path: 'disaster-areas',
    icon: <DashboardOutlined />,
    element: <AsyncComponent src="Example/index" />,
  },
  {
    label: '一级菜单',
    path: 'system',
    icon: <SettingOutlined />,
    children: [
      {
        label: '二级菜单',
        path: 'users',
        element: <AsyncComponent src="Example/index" />,
      }
    ]
  },
]

export default routes;