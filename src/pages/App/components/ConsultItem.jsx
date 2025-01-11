
import { Divider, Space, Tag } from 'antd';

import { getConsultationList } from '../service'
import { useEffect, useState } from 'react';

const types =  {
    '1': {text: '图文问诊', color: '#165dff'},
    '2': {text: '音频问诊', color: '#bf6dff'},
    '3': {text: '视频问诊', color: '#00c6a2'}
};

export default function ConsultItem({ type, onClick }) {

    const [ state, setState ] = useState({
        list: [],
        pageInfo: {}
    })


    useEffect(() => {
        getConsultationList({ status: type }).then(res => {
            setState({
                list: res.data.items,
                pageInfo: res.data.pageInfo,
            })
        })
    }, [type])

  return state.list.map(item => {
        const [ type, _ ] = item.type.split('-');
        return (
        <div className='consultItem' onClick={() => onClick(item)} key={item.id}>
            <div style={{color: '#0C2556', fontWeight: 500}}>
                <Space size={10}>
                    <span>{item.patientName}</span>
                    <span>{item.patientGender === 1 ? '男' : '女'}</span>
                    <span>{item.patientAge}岁</span>
                </Space>
            </div>
            <Divider style={{margin: '10px 0'}} />
            <div>
                <Space direction='vertical'>
                    <div className='fz-12 fz-gray'>问诊类型：<Tag color={types[type].color}>{types[type].text}</Tag></div>
                    <div className='fz-12 fz-gray'>订单号：{item.orderId}</div>
                    <div className='fz-12 fz-gray word-ellipsis'>病情描述：{item.diseaseDescription}</div>
                </Space>
            </div>
        </div>
        )
    }
  );
}