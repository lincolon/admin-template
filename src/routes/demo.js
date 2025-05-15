import {
    BarsOutlined, BranchesOutlined
} from '@ant-design/icons'
import AsyncComponent from '../components/AsyncComponent'

export default [
    {
        path: '/list',
        element: <AsyncComponent src="List/index" />,
        icon: <BarsOutlined />,
        name: '基础列表',
        children: [
            {
                path: '/list/list1',
                element: <AsyncComponent src="List/index" />,
                name: '列表1',
            },
            {
                path: '/list/list2',
                element: <AsyncComponent src="List/index" />,
                name: '列表2',
            },
        ]
    },
    {
        path: '/details',
        element: <AsyncComponent src="Details/index" />,
        icon: <BranchesOutlined />,
        name: '详情页',
    },
]