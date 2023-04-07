import { Menu } from 'antd';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import React from 'react';
import routes from '../../config/routes';

function getMenuConfig(routes, key) {
  let res = [];
  if(!Array.isArray(routes)){
     return []; 
  }

  for(let i = 0; i < routes.length; i++){
    const el = routes[i];
    const path = el.path;
    let childrenRoutes = el.children;

    if(el.hideInNav)continue;

    if(childrenRoutes){
      childrenRoutes = childrenRoutes.map(item => ({...item, path: `${path}/${item.path}`}))
    }

    // const k = !key ? `${i}` : `${key}-${i}`;

    res.push({
      key: path,
      label: el.label,
      icon: el.icon,
      path: path,
      sidesubmenu: el.sidesubmenu,
      children: childrenRoutes && !el.sidesubmenu && getMenuConfig(childrenRoutes, path)
    })
  };

  return res;  
}

function getSelectedKey(pathname, config) {
  let activeKeys = [];
  for(let i = 0; i < config.length; i++){
    const item = config[i];
    if(item.children && item.children.length > 0){
      const res = getSelectedKey(pathname, item.children);
      if(res.length > 0){
        activeKeys = res;
        break;
      }
    }else if(pathname === `/${item.path}`){
      activeKeys.push(item.key);
      break;
    }
  }

  return activeKeys;
}


const routesConfig = getMenuConfig(routes);

export default function NavMenu({menuCollapsed}) {

  const { pathname } = useLocation();
  const navigate = useNavigate();
  console.log(pathname);

  const defaultSelectedKeys = getSelectedKey(pathname, routesConfig);

  const defaultOpenKeys = !menuCollapsed ? routesConfig.map(item => item.key) : [];

  // const appendProps = {expandIcon: () => null};
  console.log(defaultSelectedKeys)

  const handleMenuClick = useCallback(({ item, key }) => {
    navigate(item.props.path);
  }, [])

  return <Menu
          defaultSelectedKeys={defaultSelectedKeys}
          defaultOpenKeys={defaultOpenKeys}
          mode="inline"
          theme="dark"
          items={routesConfig}
          onClick={handleMenuClick}
        />
}

{/* <section className="menu-wrapper">
  <div className="main-menu mgt-block">
    <Menu items={routesConfig} />
  </div>
  <div className="mgt-block">
    <SubMenu items={routesConfig} />
  </div>
</section> */}

// function Menu({items}) {
  
//   return items.map(item => (
//     !item.hideInNav && 
//     <div className="menu-item">
//       <div className="top-menu">
//         {item.icon && <span className="mgt-block icon">{item.icon}</span>}
//         <span className="mgt-block label">{item.label}</span>
//       </div>
//       {
//         item.children && item.children.length > 0 && 
//         <div className="sub-menu">
//           <Menu items={item.children} />
//         </div>
//       }
//     </div>
//   ))
// }

// function SubMenu({items}) {
//   return (
//     <div className="sub-sub-menu">
//       {
//         items.map(item => <div key={item.label}><Link to={item.path}>{item.label}</Link></div>)
//       }
//     </div>
//   )
// }
