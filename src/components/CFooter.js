import { Layout } from 'antd';

export default function () {
  const now = new Date().getFullYear();
  const initDate = '2022';
  let crDate = initDate, serviceAddr = '';
  if(now > parseInt(initDate, 10)){
    crDate = `${crDate}-${now}`;
  }
  return (
    <Layout.Footer style={{textAlign: "center", padding: '0px 50px 10px',backgroundColor:'#f3f6f9'}}>
      ©{crDate} Co., Ltd.
    </Layout.Footer>
  )
}