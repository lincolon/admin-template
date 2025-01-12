import {FileImageOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Segmented, Input, Space, Tooltip, Button, Modal, message, Form, Select, Divider, InputNumber, Descriptions, Tag, Badge, Statistic, Flex } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import TencentCloudChat from '@tencentcloud/chat';
import ConsultItem from './components/ConsultItem';
import ConversationItem from './components/ConversationItem';
import ConsultDetails from './components/ConsultDetails';

import useSelectSearch from '../../hooks/useSelectSearch';

import './style.less';
import localforage from 'localforage';

import {
    getConversationStatus,
    getChatHistory,
    getPrescriptionDetails,
    uploadImage,
    getConsultationDetails,
    getDiagnosisList1,
    getDiagnosisList2,
    getDiagnosisList3,
    getJixingList,
    getMedicineList,
    getMedicineDetails,
    addPrescription,
    sendMessageToPatient
} from './service';
import { DrawerForm, ProFormSelect, ProFormText, ProFormGroup, ProFormTextArea, ProFormDependency } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import dayjs from 'dayjs';

function getImgs(data, props) {
    const res = [];
    if(!data)return[];
    props.forEach(item => {
      Array.apply(null, {length: 5}).forEach((_, idx) => {
        if(data[`${item}${idx+1}`]){
          res.push(data[`${item}${idx+1}`])
        }
      })
    })
    return res;
}

export default function Dashboard(){

    const chatRef = useRef();
    const convListRef = useRef();
    const chatDataRef = useRef([]);
    const formRef = useRef();
    const [ visible, setVisible ] = useState(false);
    const [ tabvalue, setTabvalue ] = useState(6);
    const [ updateTimeStamp, setUpdateTimeStamp ] = useState(0);
    const [ inputValue, setInputValue ] = useState('');
    const [ convStatus, setConvStatus ] = useState(0);
    const [ standbyCount, setStandbyCount ] = useState(0);
    const [ conversationData, setConversationData ] = useState({
        doctorId: '',
        patientId: '',
        conversationId: '',
    });
    const [ preview, setPreviewData ] = useState({visible: false, data: null, type: 'preview' });
    const [ consultData, updateConsultData ] = useState({visible: false, data: null });
    const [ chatData, setChatData ] = useState({
        lastChatId: '',
        data: [],
        pageInfo: {}
    });

    const [ jxOptions ] = useSelectSearch({
        service: getJixingList,
        labelKey: 'name',
        keywords: 'keywords',
    })

    const [ zyOptions, searchZy, loadingZy ] = useSelectSearch({
        service: getDiagnosisList1,
        valueKey: 'diseaseCode',
        labelKey: (data) => `${data.diseaseCode}-${data.diseaseName}`,
        keywords: 'keywords',
        auto: false,
    })

    const [ xyOptions, searchXy, loadingXy ] = useSelectSearch({
        service: getDiagnosisList2,
        valueKey: 'diseaseCode',
        labelKey: (data) => `${data.diseaseCode}-${data.diseaseName}`,
        keywords: 'keywords',
        auto: false,
    })

    const [ zxOptions, searchZx, loadingZx ] = useSelectSearch({
        service: getDiagnosisList3,
        valueKey: 'diseaseCode',
        labelKey: (data) => `${data.diseaseCode}-${data.diseaseName}`,
        keywords: 'keywords',
        auto: false,
    })

    useEffect(() => {
        chatRef.current = TencentCloudChat.create({
            SDKAppID: process.env.CHAT_APP_ID
        });
        // 0 普通级别，日志量较多，接入时建议使用 ; 1 release 级别，SDK 输出关键信息，生产环境时建议使用;
        chatRef.current.setLogLevel(process.env.NODE_ENV === 'development' ? 0 : 1);
        // 注册腾讯云即时通信 IM 上传插件
        // chatRef.current.registerPlugin({'tim-upload-plugin': TIMUploadPlugin});
        
        localforage.getItem('imSign').then(imSign => {
            if(imSign){
                chatRef.current.login({
                    userID: imSign.userId,
                    userSig: imSign.userSig,
                })
                chatRef.current.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, onMessageReceived);
            }
        }).catch(() => {})
    }, [])

    // 消息接收事件处理函数
    const onMessageReceived = function(event) {
        // event.data - 存储 Message 对象的数组 - [Message]
        const messageList = event.data;
        messageList.forEach((message) => {
            const payloadData = JSON.parse(message.payload.data);
            switch(payloadData.MsgType){
                case TencentCloudChat.TYPES.MSG_TEXT:  // 文本消息
                case TencentCloudChat.TYPES.MSG_IMAGE:  // 图片消息
                case TencentCloudChat.TYPES.MSG_SOUND:  // 音频消息
                case TencentCloudChat.TYPES.MSG_VIDEO:  // 视频消息
                case TencentCloudChat.TYPES.MSG_CUSTOM: // 自定义消息
                    const payload = formatOriginChatData(message.ID, message.from, payloadData);
                    chatDataRef.current = chatDataRef.current.concat(payload);
                    setChatData({
                        ...chatData,
                        data: chatDataRef.current,
                        lastChatId: `item_${message.ID}`,
                    })
                default: // 其他消息
                break;
            }
        });
    };

    // 选择就诊人
    const handleChoosePainter = async ({
        id,
        status,
        doctorId,
        patientId,
        conversationId,
        patientName,
        patientGender,
        patientAge,
    }) => {
        if(status === 6){
            const res = await getConsultationDetails({consultationId: id})
            updateConsultData({
                visible: true,
                data: {
                    ...res.data,
                    faceImages: getImgs(res.data, ['tongue', 'face']),
                    mrImages: getImgs(res.data, ['mr'])
                }
            });
        }else{
            if(!conversationId){
                message.error('暂无会话信息');
                return;
            }
            const convStatusRes = await getConversationStatus({conversationId});
            const { data } = await getChatHistory({conversationId, page: 1, pageSize: 30});
            const historyMsg = data.items.reverse();
            setConvStatus(convStatusRes.data)
            setConversationData({
                doctorId,
                patientId,
                conversationId,
                patientName,
                patientGender,
                patientAge,
                visitNo: convStatusRes.data.visitNo
            });
            chatDataRef.current = historyMsg;
            setChatData({ 
                lastChatId: 'bottom',
                data: historyMsg, 
                pageInfo: data.pageInfo,
            })
        }
    }

    // 问诊单详情查看
    const handleConsultClick = async (consultationId) => {
        const res = await getConsultationDetails({consultationId})
        updateConsultData({
            visible: true,
            data: {
                ...res.data,
                faceImages: getImgs(res.data, ['tongue', 'face']),
                mrImages: getImgs(res.data, ['mr'])
            }
        });
    }

    // 处方单详情查看
    const handlePrescriptionClick = async (prescriptionId) => {
        const res = await getPrescriptionDetails({prescriptionId})
        setPreviewData({
            visible: true,
            data: res.data,
            type: 'prescription'
        })
    }

    // 发送文本消息
    const handleSendMsg = async () => {
        if(!inputValue || !conversationData.conversationId) return;
        const payload = formatLocalChatData({
            Text: inputValue,
          }, 'TIMTextElem');
        setInputValue('');
        sendMessageToPatient({
            conversationId: conversationData.conversationId,
            body: payload
        });
    }

    // 发送图片消息
    const handleSendImage = async () => {
        const file = document.getElementById('upload-input').files[0];
        if(!file || !conversationData.conversationId) return;
        const { data } = await uploadImage(file);
        const payload = formatLocalChatData({
            Url: data.url,
        }, 'TIMImageElem');
        sendMessageToPatient({
            conversationId: conversationData.conversationId,
            body: payload
        })
    }

    // 开具处方
    const handleAddPrescription = async (values) => {
        const { data } = await addPrescription({
            ...values, 
            ...values?.jiliang,
            ...conversationData
        });
        const xyzdName = values.xyzd ? xyOptions.find(item => item.value === values.xyzd)?.label : '';// 西医诊断
        const zyzdName = values.zyzd ? zyOptions.find(item => item.value === values.zyzd)?.label : '';// 中医诊断
        const payload = formatLocalChatData({
            type: 'Prescription',
            data: {
                status: 1,
                title: xyzdName || zyzdName,
                prescriptionId: data.prescriptionId
            },
        }, 'TIMCustomElem');
        sendMessageToPatient({
            conversationId: conversationData.conversationId,
            body: payload
        })
    }

    // 补填问诊单
    const handleAddConsult = async () => {
        
    }

    // 退款
    const handleRefund = async () => {
        
    }

    useEffect(() => {
        if (convListRef.current) {
          convListRef.current.scrollTop = convListRef.current.scrollHeight;
        }
    }, [chatData.data]);

    const previewFooter = preview.type === 'preview' ? {} : {footer: null};

    const isCanChat = convStatus.status === 1;

    return <div className="flexbox" style={{height: 'calc(100vh - 54px)'}}>
        <div style={{height: '100%', width: 300, background: '#fff'}}>
            <div style={{padding: 10}}>
                <Segmented
                    block
                    onChange={(value) => setTabvalue(value)}
                    value={tabvalue}
                    options={[
                        {value: 6, label: <Badge size='small' count={standbyCount} overflowCount={10}>待接诊</Badge>},
                        {value: 2, label: '问诊中'},
                        {value: 3, label: '已结束'},
                    ]}
                />
            </div>
            <div className="consult-list" style={{overflowY: 'auto'}}>
                <ConsultItem 
                    updateTimeStamp={updateTimeStamp}
                    type={tabvalue} 
                    onClick={(data) => handleChoosePainter(data)}
                    onUpdateCount={(count) => setStandbyCount(count)}
                />
            </div>
        </div>
        <div className="flex1 chat-wrapper flexbox" style={{flexDirection: 'column'}}>
            {
                conversationData?.conversationId &&
                <div className='status-bar'>
                    <Space size="small">
                    <Badge status={isCanChat ? 'processing' : 'default'} text={!isCanChat ? '已结束问诊' : '问诊中'} />
                    {
                        isCanChat ? (
                        convStatus?.type === 12 ?
                        <span className="inline fz-gray fz-12">第{convStatus?.rounds}/{convStatus?.totalRounds}次</span> :
                        <Space size="small">
                            <Statistic.Countdown 
                                value={new Date(convStatus?.deadline)} 
                                format="H 时 m 分 s 秒" 
                                onFinish={() => {
                                    setConvStatus({...convStatus, status: 0});
                                }}
                            /> 
                            <span className="inline" style={{paddingLeft: 4, lineHeight: 1.7}}>自动后结束问诊</span>
                        </Space>
                        ) : null
                    }
                    </Space>
                </div>
            }
            <div className='conv-list flex1' ref={convListRef}>
            {
                chatData.data.map(item => (
                    <ConversationItem 
                        id={`item_${item.id}`} 
                        key={item.id} 
                        from={item.from}
                        conversationId={item.conversationId}
                        MsgContent={item.MsgContent}
                        lastChatId={chatData.lastChatId}
                        onConsultCardClick={handleConsultClick}
                        onPrescriptionCardClick={handlePrescriptionClick}
                        onQuestionnaireCardClick={handleConsultClick}
                    />
                ))
            }
            </div>
            <div style={{background: '#f0f0f0', margin: 6, borderRadius: 4}}>
                <Input.TextArea
                    placeholder={conversationData.conversationId ? "请输入消息，按回车键发送消息" : "请选择患者进行聊天"}
                    rows={8}
                    variant="borderless" 
                    value={inputValue}
                    disabled={!isCanChat}
                    onChange={(e) => {setInputValue(e.target.value)}}
                    onPressEnter={handleSendMsg}
                    style={{padding: 12}}
                />
                <div className='flexbox' style={{padding:10}}>
                    <div className='flex1'>
                    {
                        conversationData.conversationId &&
                        <Space size="small">
                            <Tooltip title="发送图片">
                                <div className='file-wrapper'>
                                    <FileImageOutlined style={{color: '#333', fontSize: 20, cursor: 'pointer'}} />
                                    <input id='upload-input' type="file"  onChange={handleSendImage} />
                                </div>
                            </Tooltip>
                            <Tooltip title="视频通话">
                                <div className='video-wrapper'>
                                    <VideoCameraOutlined style={{color: '#333', fontSize: 20, cursor: 'pointer'}} />
                                </div>
                            </Tooltip>
                        </Space>
                    }
                    </div>
                    <div className='v-center'>
                        <Button 
                            type='primary' 
                            onClick={handleSendMsg}
                            disabled={!inputValue || !isCanChat}
                        >发送</Button>
                    </div>
                </div>
            </div>
            {
                isCanChat && 
                <div style={{padding: '4px 10px 10px'}}>
                    <Space size="small">
                        <Button type='primary' onClick={() => setVisible(true)}>辨证开方</Button>
                        <Button type='primary' onClick={() => setVisible(true)}>视频通话</Button>
                        <Button type='primary' onClick={handleAddConsult}>补填问诊单</Button>
                        {/* <Button onClick={handleRefund}>退款</Button> */}
                    </Space>
                </div>
             }
        </div>
        <div style={{height: '100%', width: 300, background: '#fff'}}>
            
        </div>
        <Modal
            centered
            closable
            destroyOnClose
            title="问诊单详情"
            footer={null}
            width={1000}
            open={consultData.visible}
            onCancel={() => updateConsultData({...consultData, visible: false})}
        >
            <ConsultDetails 
                data={consultData.data} 
                onAccept={(acceptStatus) => {
                    updateConsultData({...consultData, visible: false});
                    if(acceptStatus === 2){
                        // 接诊
                        setTabvalue(2);
                        handleChoosePainter({...consultData.data, status: 2});
                    }else {
                        // 拒诊
                        setUpdateTimeStamp(new Date().getTime());
                    }
                    
                }}
            />
        </Modal>
        <DrawerForm 
            layout='vertical'
            title="开具处方"
            width={1000}
            open={visible}
            formRef={formRef}
            footer={null}
            drawerProps={{
                footer: null,
                destroyOnClose: true,
                onClose: () => setVisible(false)
            }}
        >
            <ProFormGroup title="病情诊断">
                <ProFormSelect
                    label="西医诊断"
                    name="xyzd"
                    width="sm"
                    options={xyOptions}
                    placeholder="请输入西医诊断"
                    showSearch
                    allowClear
                    notFoundContent={null}
                    filterOption={false}
                    fieldProps={{
                        loading: loadingXy,
                        onSearch: searchXy,
                    }}
                />
                <ProFormSelect
                    label="中医诊断"
                    name="zyzd"
                    width="sm"
                    options={zyOptions}
                    placeholder="请输入中医诊断"
                    showSearch
                    allowClear
                    notFoundContent={null}
                    filterOption={false}
                    fieldProps={{
                        loading: loadingZy,
                        onSearch: searchZy,
                    }}
                />
                <ProFormSelect
                    label="中医证型"
                    name="zybz"
                    width="sm"
                    options={zxOptions}
                    placeholder="请输入中医证型"
                    showSearch
                    allowClear
                    notFoundContent={null}
                    filterOption={false}
                    fieldProps={{
                        loading: loadingZx,
                        onSearch: searchZx,
                    }}
                />
            </ProFormGroup>
            <ProFormGroup title="开方">
                <ProFormSelect
                    label="选择剂型"
                    name="dosageFormId"
                    width="sm"
                    options={jxOptions}
                    placeholder="请选择剂型"
                    showSearch
                    allowClear
                    onChange={() => {
                        formRef.current?.setFieldValue('cfType', null);
                        formRef.current?.setFieldValue('rp', undefined);
                    }}
                    notFoundContent={null}
                    rules={[{required: true, message: '请输入关键词搜索'}]} 
                />
                <ProFormDependency name={['dosageFormId']}>
                {
                    ({dosageFormId}) => {
                        const opts = jxOptions.find(item => item.value === dosageFormId);
                        return (
                            <ProFormSelect
                                label="选择药房"
                                name="cfType"
                                width="sm"
                                options={opts ? opts.sourceData.pharmacy.map(item => ({label: item.name, value: item.pharmacyNumber})) : []}
                                placeholder="请选择药房"
                                allowClear
                                notFoundContent={null}
                                onChange={() => {
                                    formRef.current?.setFieldValue('rp', undefined);
                                }}
                                rules={[{required: true, message: '请选择药房'}]} 
                            />
                        )
                    }
                }
                </ProFormDependency>
                <ProFormDependency name={['dosageFormId']}>
                {
                    ({dosageFormId}) => {
                        const opts = jxOptions.find(item => item.value === dosageFormId);
                        return ( opts && opts.sourceData.children.length > 0 &&
                            <ProFormSelect
                                label="代煎设置"
                                name="dosageFormSubId"
                                width="sm"
                                options={opts ? opts.sourceData.children.map(item => ({label: item.name, value: item.id})) : []}
                                placeholder="请选择代煎方式"
                                allowClear
                                notFoundContent={null}
                                rules={[{required: true, message: '请选择代煎方式'}]} 
                            />
                        )
                    }
                }
                </ProFormDependency>
            </ProFormGroup>
            <ProFormDependency name={['dosageFormId', 'cfType']}>
                {
                    ({dosageFormId, cfType}) => {
                        const opts = jxOptions.find(item => item.value === dosageFormId);
                        const isZy = opts && opts.sourceData.children.length > 0;
                        return (dosageFormId && cfType) ? isZy ? (
                            <Form.Item name="rp" noStyle rules={[{required: true, message: '请选择药材'}]}>
                                <ZyTable dosageFormId={dosageFormId} pharmacyNumber={cfType} />
                            </Form.Item>
                        ) : (
                            <Form.Item name="rp" noStyle rules={[{required: true, message: '请选择药品'}]}>
                                <XyTable dosageFormId={dosageFormId} pharmacyNumber={cfType}/>
                            </Form.Item>
                        ) : null;
                    }
                }
            </ProFormDependency>
            <ProFormDependency name={['dosageFormId', 'cfType']}>
                {
                    ({dosageFormId, cfType}) => {
                        const opts = jxOptions.find(item => item.value === dosageFormId);
                        const isZy = opts && opts.sourceData.children.length > 0;
                        return (dosageFormId && cfType) ? isZy && (
                            <Form.Item
                                name="jiliang"
                                noStyle
                                required
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (!value.jiliang || !value.jlPerDay || !value.times) {
                                                return Promise.reject(new Error('请完善计量信息'));
                                            }
                                            return Promise.resolve();
                                        },
                                    }
                                ]}
                            >
                                <JLInput />
                            </Form.Item>
                        ) : null;
                    }
                }
            </ProFormDependency>
            <Divider />
            <ProFormTextArea label="医嘱" name="yz" />
            <Divider />
            <div style={{textAlign: 'center'}}>
                <Space size="middle">
                    <Button 
                        color='primary' 
                        variant='filled' 
                        style={{width: 200}}
                        onClick={async () => {
                            const values = await formRef.current?.validateFields();
                            const jixing = jxOptions.find(item => item.value === values.dosageFormId);
                            const cfTypeName = jixing.sourceData.pharmacy.find(item => item.pharmacyNumber === values.cfType)?.name;// 药房名称，
                            const dosageFormSubName = jixing.sourceData.children.find(item => item.name === values.dosageFormSubId)?.name;
                         
                            setPreviewData({
                                visible: true,
                                type: 'preview',
                                data: {
                                    ...values,
                                    dosageFormName: jixing?.label,// 剂型，
                                    dosageFormSubName,// 代煎设置，
                                    cfTypeName,// 药房名称，
                                    xyzdName: values.xyzd ? xyOptions.find(item => item.value === values.xyzd)?.label : '',// 西医诊断
                                    zyzdName: values.zyzd ? zyOptions.find(item => item.value === values.zyzd)?.label : '',// 中医诊断
                                    zybzName: values.zybz ? zxOptions.find(item => item.value === values.zybz)?.label : '',// 中医证型
                                }
                            }) 
                        }}
                    >预览处方</Button>
                    <Button 
                        type='primary' 
                        style={{width: 200}}
                        onClick={async () => {
                            const values = await formRef.current?.validateFields();
                            setVisible(false);
                            setPreviewData({visible: false});
                            message.success('处方开具成功');
                            handleAddPrescription(values);
                        }}
                    >直接开方</Button>
                </Space>
            </div>
        </DrawerForm>
        <Modal
            title={<div>郑州市中医院互联网医院电子病历&nbsp;&nbsp;<Tag bordered={false} color="processing">普通药品处方</Tag></div>}
            open={preview.visible}
            centered
            destroyOnClose
            maskClosable={false}
            onCancel={() => setPreviewData({visible: false})}
            width={700}
            {...previewFooter}
            okText="确定开方"
            onOk={async () => {
                setVisible(false);
                setPreviewData({visible: false});
                message.success('处方开具成功');
                handleAddPrescription(preview.data);
            }}
        >
            <div style={{height: 600, overflowY: 'auto'}}>
                <MedicinePreviewer data={preview.data} patientData={conversationData}  />
            </div>
        </Modal>
    </div>
}

function MedicinePreviewer({data, patientData}) {
    return (
        <div>
            <Descriptions 
                title="患者信息"
                column={4}
                items={[
                    {key: '1', span: 4, label: '日期', children: dayjs().format('YYYY-MM-DD')},
                    {key: '2', label: '姓名', children: patientData?.patientName},
                    {key: '3', label: '性别', children: patientData?.patientGender === 1 ? '男' : '女'},
                    {key: '4', label: '年龄', children: patientData?.patientAge + '岁'},
                ]}
            />
            <Divider />
            <Descriptions 
                title="病情诊断"
                column={1}
                items={[
                    {key: '1', label: '西医诊断', children: data?.xyzdName || '无'},
                    {key: '2', label: '中医诊断', children: data?.zyzdName || '无'},
                    {key: '3', label: '中医证型', children: data?.zybzName || '无'},
                ]}
            />  
            <Divider />
            <Descriptions 
                title="开方"
                column={1}
                items={[
                    {key: '1', children: <span style={{fontWeight: 'bold', color: '#0C2556'}}>{data?.dosageFormName}<Divider type='vertical' />{data?.cfTypeName}</span>},
                ]}
            />
            <div style={{marginTop: 10}}>RP</div>
            <div className="rp-content">
                { data?.dosageFormId <= 2 ? <ZyRp data={data?.rp} {...data?.jiliang} /> : <XyRp data={data?.rp} /> }
            </div>
            <Divider />
            <Descriptions 
                title="医嘱"
                column={1}
                items={[
                    {key: '1', children: data?.yz || '无'},
                ]}
            />
        </div>
    )
}

function ZyRp({data, times, jiliang, jlPerDay}) {
    return (
        <div className='item-wrapper'>
            <Space size={[40, 6]} wrap>
            {data?.map(item => (
                <div key={item.id}>
                    {item.name} *{item.count}{item.unit}
                    {item.jf ? <Tag color="processing" size='small'>{item.jf}</Tag> : null}
                </div>
            ))}
            </Space>
            <div style={{color: '#0147EB', marginTop: 12}}>共{jiliang}剂，每日{jlPerDay}剂，每剂分{times}次使用</div>
        </div>
    )
}

function XyRp({data}) {
    return (
        data?.map(item => (
            <div className='item-wrapper'>
                <Space size="small" direction='vertical'>
                    <div style={{fontWeight: 'bold'}}>{item.name}</div>
                    <Space size="large">
                        <div>规格：{item.specification}</div>
                        <div>价格：{item.price}元/{item.packUnitName}</div>
                    </Space>
                    <div>用法用量：一次{item.dcyl}{item.doseUnitName},{item.frenquencyName}，{item.usageName}，用药{item.days}天</div>
                    <div>补充说明：{item.remark || '无'}</div>
                    <div>数量：{item.count}{item.unitName}</div>
                </Space>
            </div>
        ))
    )
}

function JLInput({value = {}, onChange}) {
    return (
        <Space style={{marginTop: 24}}>
            <div>
                共&nbsp;<InputNumber value={value?.jiliang} onChange={val => onChange({...value, jiliang: val})} />&nbsp;剂，
            </div>
            <div>
                每日&nbsp;<InputNumber value={value?.jlPerDay} onChange={val => onChange({...value, jlPerDay: val})} />&nbsp;剂，
            </div>
            <div>
                1剂分&nbsp;<InputNumber value={value?.times} onChange={val => onChange({...value, times: val})} />&nbsp;次使用
            </div>
        </Space>
    )
}

function formatLocalChatData(payload, MsgType) {
    return {
        MsgType,
        MsgContent: {
          Text: '', // 文本内容
          Second: '', // 语音时长
          Size: '', // 语音文件大小
          Url: '', // 图片地址
          type: '', // 卡片类型
          data: {}, // 卡片数据
          ...payload
        }
    }
}
  
function formatOriginChatData(id, from, payload) {
    return {
      id,
      from,
      MsgContent: payload
    }
}

// 中药可编辑表格组件
function ZyTable({ value = [], onChange, pharmacyNumber, dosageFormId }) {

    const editableKeys = value.map(item => item.id)

    const [ options, handleSearch, loading ] = useSelectSearch({
        service: getMedicineList,
        labelKey: 'name',
        keywords: 'keywords',
        auto: false,
        params: {
            eastOrWest: 1,
            keywords: '',
            dosageFormId,
            pharmacyNumber
        }
    })

    const handleChange = (val) => {
        if (!val) return;
        const { sourceData } = options.find(item => item.value === val);
        onChange(value.concat({...sourceData, count: '', jf: ''}));
    }

    const columns = [
        {
            title: '药材名称',
            dataIndex: 'name',
            readonly: true,
            ellipsis: true,
        },
        {
            title: '药材编码',
            dataIndex: 'drugCode',
            readonly: true,
            ellipsis: true,
        },
        {
            title: '单价',
            dataIndex: 'price',
            readonly: true,
            ellipsis: true,
            valueType: 'digit',
            width: 80
        },
        {
            title: '数量',
            valueType: 'digit',
            dataIndex: 'count',
            valueType: 'digit',
            width: 50
        },
        {
            title: '单位',
            dataIndex: 'unit',
            readonly: true,
            width: 80
        },
        {
            title: '煎法',
            dataIndex: 'jf',
            width: 200
        },
        {
            title: '操作',
            valueType: 'option',
            width: 50,
            render: () => {
              return null;
            },
        },
    ]

    return (
        <section style={{background: '#1da57a'}} >
            <Select 
                style={{width: 300, margin: 10}}
                options={options}
                onChange={handleChange}
                placeholder="请输入中药名称或者首字母(大写)搜索药材"
                allowClear
                notFoundContent={null}
                filterOption={false}
                showSearch
                onSearch={handleSearch}
                loading={loading}
            />
            <EditableProTable 
                rowKey="id"
                size='small'
                bordered
                value={value}
                columns={columns}
                onChange={(v) => onChange(v)}
                recordCreatorProps={false}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    actionRender: (row, config, defaultDoms) => {
                        return [defaultDoms.delete];
                    },
                    onValuesChange: (record, recordList) => {
                        onChange(recordList);
                    },
                }}
            />
        </section>
    )
}

// 西药可编辑表格组件
function XyTable({ value = [], onChange, pharmacyNumber, dosageFormId }) {

    const [ columns, setColumns ] = useState([])
    const ref = useRef({
        usage: [],
        frequency: []
    });

    const editableKeys = value.map(item => item.id)

    const [ options, handleSearch, loading ] = useSelectSearch({
        service: getMedicineList,
        labelKey: 'name',
        keywords: 'keywords',
        auto: false,
        params: {
            eastOrWest: 2,
            dosageFormId,
            pharmacyNumber
        }
    })

    useEffect(() => {
        (async () => {
            const res = await getMedicineDetails({id: 1});
            const usage = res.data.usage.map(item => ({label: item.usageName, value: item.usageCode}));
            const frequency = res.data.frequency.map(item => ({label: item.frenquencyName, value: item.frenquencyCode}));
            setColumns(
                [
                    {
                        title: '药品名称',
                        dataIndex: 'name',
                        readonly: true,
                        ellipsis: true,
                        width: 100
                    },
                    {
                        title: '规格',
                        dataIndex: 'specification',
                        readonly: true,
                        width: 80,
                        ellipsis: true
                    },
                    {
                        title: '单次药量',
                        dataIndex: 'dcyl',
                        width: 100,
                        valueType: 'digit'
                    },
                    {
                        title: '单位',
                        dataIndex: 'doseUnitCode',
                        readonly: true,
                        width: 50,
                    },
                    {
                        title: '给药频率',
                        dataIndex: 'frenquencyCode',
                        width: 120,
                        valueType: 'select',
                        fieldProps: {
                            allowClear: true,
                            showSearch: true,
                            options: frequency
                        }
                    },
                    {
                        title: '给药途径',
                        dataIndex: 'usageCode',
                        valueType: 'select',
                        width: 100,
                        fieldProps: {
                            allowClear: true,
                            showSearch: true,
                            options: usage
                        }
                    },
                    {
                        title: '用药天数',
                        dataIndex: 'days',
                        width: 80,
                        valueType: 'digit'
                    },
                    {
                        title: '开药量',
                        dataIndex: 'count',
                        valueType: 'digit',
                        width: 80,
                    },
                    {
                        title: '单位',
                        dataIndex: 'packUnitName',
                        readonly: true,
                        width: 50,
                    },
                    {
                        title: '补充说明',
                        dataIndex: 'remark',
                        width: 150,
                    },
                    {
                        title: '操作',
                        valueType: 'option',
                        width: 50,
                        fixed: 'right',
                        render: () => {
                          return null;
                        },
                    },
                ]
            )
            ref.current = {
                usage,
                frequency
            }
        })();
    }, []);

    const handleChange = (val) => {
        if (!val) return;
        const { sourceData } = options.find(item => item.value === val);
        onChange(value.concat({
            ...sourceData, 
            frenquencyName: '',
            frenquencyCode: '',
            usageName: '',
            usageCode:'',
            usageInput: '',
            doseUnitCode: sourceData.unitCode,
            doseUnitName: sourceData.unitName,
            days: '', 
            dcyl: '', 
            remark: ''
        }));
    }

    return (
        <section style={{background: '#1da57a'}}>
        <Select 
            style={{width: 300, margin: 10}}
            options={options}
            onChange={handleChange}
            placeholder="请输入药品首字母(大写)关键字搜索"
            allowClear
            showSearch
            notFoundContent={null}
            filterOption={false}
            onSearch={handleSearch}
            loading={loading}
        />
        <EditableProTable 
            size='small'
            rowKey="id"
            bordered
            value={value}
            columns={columns}
            onChange={(v) => onChange(v)}
            recordCreatorProps={false}
            editable={{
                type: 'multiple',
                editableKeys,
                actionRender: (row, config, defaultDoms) => {
                    return [defaultDoms.delete];
                },
                onValuesChange: (record, recordList) => {
                    const newDataList = recordList.map(item => ({
                        ...item,
                        usageName: item.usageCode ? ref.current.usage.find(el => el.value === item.usageCode).label : '',
                        frenquencyName: item.frenquencyCode ? ref.current.frequency.find(el => el.value === item.frenquencyCode).label : ''
                    }))
                    onChange(newDataList);
                },
                // onChange: setEditableRowKeys,
            }}
        />
        </section>
    )
}