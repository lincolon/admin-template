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
    label: '一级菜单1',
    path: 'disaster-areas',
    icon: <DashboardOutlined />,
    element: <AsyncComponent src="Example/index" />,
  },
  {
    label: '一级菜单2',
    path: 'system',
    icon: <SettingOutlined />,
    children: [
      {
        label: '二级菜单1',
        path: 'users1',
        element: <AsyncComponent src="Example/index" />,
        sidesubmenu: true,
        children: [
          {
            label: '三级菜单1',
            path: 'users11',
            element: <AsyncComponent src="Example/index" />
          },
          {
            label: '三级菜单12',
            path: 'users12',
            element: <AsyncComponent src="Example/index" />,
          },
          {
            label: '三级菜单13',
            path: 'users13',
            element: <AsyncComponent src="Example/index" />,
          }
        ]
      },
      {
        label: '二级菜单2',
        path: 'users2',
        element: <AsyncComponent src="Example/index" />,
      },
      {
        label: '二级菜单3',
        path: 'users3',
        element: <AsyncComponent src="Example/index" />,
      }
    ]
  },
]

export default routes;