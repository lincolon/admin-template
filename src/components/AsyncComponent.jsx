import React from 'react';
import { Spin } from 'antd';

export default function AsyncComponent({src}){

    const Comp = React.lazy(() => import(`@pages/${src}`))
  
    return <React.Suspense fallback={<Loading />}>
      <Comp />
    </React.Suspense>
}

function Loading(){
    return <div
            style={{
              textAlign: 'center',
              padding: '100px 0',
            }}
          ><Spin /></div>
  }