import {FileImageOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Segmented, Input, Space, Tooltip, Button, Modal, message, Form, Select, Divider } from 'antd';
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
    acceptOrRefusePaint,
    uploadImage,
    getConsultationDetails,
    getDiagnosisList1,
    getDiagnosisList2,
    getDiagnosisList3,
    getJixingList,
    getMedicineList
} from './service';
import { DrawerForm, ProFormSelect, ProFormText, ProFormGroup, ProFormTextArea, ProFormDependency } from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';

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
    const convRef = useRef();
    const formRef = useRef();
    const [ visible, setVisible ] = useState(false);
    const [ tabvalue, setTabvalue ] = useState(6);
    const [ inputValue, setInputValue ] = useState('');
    const [ convStatus, setConvStatus ] = useState(0);
    const [ conversationId, setConversationId ] = useState('');
    const [ consultData, updateConsultData ] = useState({visible: false, data: null });
    const [ chatData, setChatData ] = useState({
        lastChatId: '',
        data: [],
        pageInfo: {}
    });

    const [ jxOptions, searchJx ] = useSelectSearch({
        service: getJixingList,
        labelKey: 'name',
        keywords: 'keywords',
    })

    const [ zyOptions, searchZy, loadingZy, handleZyDropdownVisibleChange ] = useSelectSearch({
        service: getDiagnosisList1,
        labelKey: (data) => `${data.diseaseCode}-${data.diseaseName}`,
        keywords: 'keywords',
        auto: false,
    })

    const [ xyOptions, searchXy, loadingXy, handleXyDropdownVisibleChange ] = useSelectSearch({
        service: getDiagnosisList2,
        labelKey: (data) => `${data.diseaseCode}-${data.diseaseName}`,
        keywords: 'keywords',
        auto: false,
    })

    const [ zxOptions, searchZx, loadingZx, handleZxDropdownVisibleChange ] = useSelectSearch({
        service: getDiagnosisList3,
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

    const onMessageReceived = function(event) {
        // event.data - 存储 Message 对象的数组 - [Message]
        const messageList = event.data;
        console.log('onMessageReceived', messageList)
        messageList.forEach((message) => {
          const isDoctor = !message.from.includes('PATIENT');
          console.log('isDoctor', isDoctor)
          const payloadData = JSON.parse(message.payload.data);
          if(!isDoctor){
            switch(payloadData.MsgType){
              case TencentCloudChat.TYPES.MSG_TEXT:  // 文本消息
              case TencentCloudChat.TYPES.MSG_IMAGE:  // 图片消息
              case TencentCloudChat.TYPES.MSG_SOUND:  // 音频消息
              case TencentCloudChat.TYPES.MSG_VIDEO:  // 视频消息
              case TencentCloudChat.TYPES.MSG_CUSTOM: // 自定义消息
                const payload = formatOriginChatData(message.ID, message.from, payloadData);
                setChatData({
                  ...chatData,
                  data: chatData.data.concat(payload),
                  lastChatId: `item_${message.ID}`,
                })
              default: // 其他消息
                break;
            }
          }
        });
    };

    const handleChoosePainter = async ({
        id,
        status,
        conversationId
    }) => {
        setConvStatus(status)
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
            setConversationId(conversationId);
            const convStatus = await getConversationStatus({conversationId});
            const { data } = await getChatHistory({conversationId, page: 1, pageSize: 30});
            const historyMsg = data.items.reverse();
            setChatData({ 
                lastChatId: 'bottom',
                data: historyMsg, 
                pageInfo: data.pageInfo,
            })
        }
    }

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

    const handleSendMsg = async () => {
        if(!inputValue || !conversationId) return;
        const payload = formatLocalChatData({
            Text: inputValue,
          }, 'TIMTextElem');
        setInputValue('');
        setChatData({
          ...chatData,
          data: chatData.data.concat({...payload, conversationId}),
          lastChatId: `item_${payload.id}`,
        })
    }

    const handleSendImage = async () => {
        const file = document.getElementById('upload-input').files[0];
        if(!file || !conversationId) return;
        const { data } = await uploadImage(file);
        const payload = formatLocalChatData({
            Url: data.url,
          }, 'TIMImageElem');
        setChatData({
          ...chatData,
          data: chatData.data.concat({...payload, conversationId}),
          lastChatId: `item_${payload.id}`,
        })
    }

    const handleAccept = async (type) => {
        if(type === 'accept'){
            const { data } = await acceptOrRefusePaint({conversationId, type: 2});
        } else {
            // 拒绝请弹窗输入原因
            let reason;
            Modal.confirm({
                title: '拒绝原因',
                centered: true,
                maskClosable: false,
                content: <Input.TextArea onChange={e => reason = e.target.value} placeholder="请输入拒绝原因"  />,
                onOk: async () => {
                    if(!reason){
                        message.warning('请输入拒绝原因');
                        return;
                    }
                    await acceptOrRefusePaint({conversationId, type: 7, reason});
                },
            });
            
        }
    }

    // 辨证开方
    const handleKaifang = async () => {
        setVisible(true);
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

    return <div className="flexbox" style={{height: 'calc(100vh - 54px)'}}>
        <div style={{height: '100%', width: 300, background: '#fff'}}>
            <div style={{padding: 10}}>
                <Segmented
                    block
                    onChange={(value) => setTabvalue(value)}
                    options={[
                        {value: 6, label: '待接诊'},
                        {value: 2, label: '问诊中'},
                        {value: 3, label: '已结束'},
                    ]}
                />
            </div>
            <div className="consult-list" style={{overflowY: 'auto'}}>
                <ConsultItem 
                    type={tabvalue} 
                    onClick={(data) => handleChoosePainter(data)}
                />
            </div>
        </div>
        <div className="flex1 chat-wrapper flexbox" style={{flexDirection: 'column'}}>
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
                        onPrescriptionCardClick={handleConsultClick}
                        onQuestionnaireCardClick={handleConsultClick}
                    />
                ))
            }
            </div>
            <div className='toolbar flexbox'>
                {
                    conversationId &&
                <>
                <div className='flex1'>
                    <Space size={20}>
                        <Tooltip title="发送图片">
                            <div className='file-wrapper'>
                                <FileImageOutlined style={{color: '#999', fontSize: 20, cursor: 'pointer'}} />
                                <input id='upload-input' type="file"  onChange={handleSendImage} />
                            </div>
                        </Tooltip>
                        <Tooltip title="视频通话">
                            <VideoCameraOutlined style={{color: '#999', fontSize: 20, cursor: 'pointer'}} />
                        </Tooltip>
                    </Space>
                </div>
                <div>
                    <Space size={14}>
                        
                        {
                            // convStatus === 2 && 
                            <>
                                <Button size='small' color='primary' variant='filled' onClick={handleKaifang}>辨证开方</Button>
                                <Button size='small' color='primary' variant='filled' onClick={handleAddConsult}>补填问诊单</Button>
                                <Button size='small' color='danger' variant='filled' onClick={handleRefund}>退款</Button>
                            </>
                        }
                    </Space>
                </div>
                </>
                }
            </div>
            <div>
                <Input.TextArea
                    placeholder={conversationId ? "请输入消息，按回车键发送消息" : "请选择患者进行聊天"}
                    rows={8}
                    variant="borderless" 
                    value={inputValue}
                    disabled={!convStatus === 2}
                    onChange={(e) => {setInputValue(e.target.value)}}
                    onPressEnter={handleSendMsg}
                />
                <div className='flexbox' style={{justifyContent: 'flex-end', padding:10}}>
                    <Button 
                        type='primary' 
                        onClick={handleSendMsg}
                        disabled={!inputValue || !convStatus === 2}
                    >发送</Button>
                </div>
            </div>
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
            <ConsultDetails data={consultData.data} />
        </Modal>
        <DrawerForm 
            layout='vertical'
            title="开具处方"
            width={760}
            open={visible}
            formRef={formRef}
        >
            <ProFormGroup title="病情诊断">
                <ProFormSelect
                    label="西医诊断"
                    name="xyzd"
                    width="sm"
                    options={zyOptions}
                    placeholder="请输入西医诊断"
                    showSearch
                    allowClear
                    notFoundContent={null}
                    filterOption={false}
                    fieldProps={{
                        loading: loadingZy,
                        onSearch: searchZy,
                    }}
                    rules={[{required: true, message: '请输入关键词搜索'}]} 
                />
                <ProFormSelect
                    label="中医诊断"
                    name="zyzd"
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
                    rules={[{required: true, message: '请输入关键词搜索'}]} 
                />
                <ProFormSelect
                    label="中医证型"
                    name="zybz"
                    width="sm"
                    options={zxOptions}
                    placeholder="请输入西医诊断"
                    showSearch
                    allowClear
                    notFoundContent={null}
                    filterOption={false}
                    fieldProps={{
                        loading: loadingZx,
                        onSearch: searchZx,
                    }}
                    rules={[{required: true, message: '请输入关键词搜索'}]} 
                />
            </ProFormGroup>
            <ProFormGroup title="开方">
                <ProFormSelect
                    label="选择剂型"
                    name="dosageFormId"
                    width="sm"
                    options={jxOptions}
                    placeholder="请输入西医诊断"
                    showSearch
                    allowClear
                    notFoundContent={null}
                    rules={[{required: true, message: '请输入关键词搜索'}]} 
                />
                <ProFormDependency name={['dosageFormId']}>
                {
                    ({dosageFormId}) => {
                        const opts = jxOptions.find(item => item.value === dosageFormId);
                        formRef.current?.setFieldValue('cfType', null);
                        return (
                            <ProFormSelect
                                label="选择药房"
                                name="cfType"
                                width="sm"
                                options={opts ? opts.sourceData.pharmacy.map(item => ({label: item.name, value: item.pharmacyNumber})) : []}
                                placeholder="请选择药房"
                                allowClear
                                notFoundContent={null}
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
                            <Form.Item name="rp" noStyle>
                                <ZyTable dosageFormId={dosageFormId} pharmacyNumber={cfType} />
                            </Form.Item>
                        ) : (
                            <Form.Item name="rp" noStyle>
                                <XyTable dosageFormId={dosageFormId} pharmacyNumber={cfType}/>
                            </Form.Item>
                        ) : null;
                    }
                }
            </ProFormDependency>
            <Divider />
            <ProFormTextArea label="补充说明" name="remarks" />
        </DrawerForm>
    </div>
}

function formatLocalChatData(payload, MsgType) {
    return {
      from: 'DOCTOR',
      id: new Date().valueOf(),
      MsgContent: {
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

    const [editableKeys, setEditableRowKeys] = useState([]);

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
        onChange(value.concat({...sourceData, count: 0}));
    }

    const columns = [
        {
            title: '药材名称',
            dataIndex: 'name',
        },
        {
            title: '药材编码',
            dataIndex: 'serialNumber',
        },
        {
            title: '单价',
            dataIndex: 'price',
        },
        {
            title: '数量',
            valueType: 'digit',
            dataIndex: 'count',
            editable: true
        },
        {
            title: '单位',
            dataIndex: 'unit',
        },
    ]

    console.log('value:', value)

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
                        console.log('record:', recordList)
                        onChange(recordList);
                    },
                    onChange: setEditableRowKeys,
                }}
            />
        </section>
    )
}

// 西药可编辑表格组件
function XyTable({ value, onChange, pharmacyNumber, dosageFormId }) {

    const [editableKeys, setEditableRowKeys] = useState([]);

    const [ options, handleSearch, loading ] = useSelectSearch({
        service: getMedicineList,
        keywords: 'keywords',
        auto: false,
        params: {
            eastOrWest: 2,
            dosageFormId,
            pharmacyNumber
        }
    })

    const handleChange = (value) => {

    }

    const columns = [
        {
            title: '药材名称',
            dataIndex: 'name',
            readyOnly: true,
        },
        {
            title: '药材编码',
            dataIndex: 'serialNumber',
            readyOnly: true,
        },
        {
            title: '单价',
            dataIndex: 'price',
            readyOnly: true,
        },
        {
            title: '数量',
            dataIndex: 'count',
        },
        {
            title: '单位',
            dataIndex: 'unit',
            readyOnly: true,
        },
    ]

    return (
        <section 
            style={{background: '#1da57a'}}
        >
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
            bordered
            dataSource={value || []}
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
                onChange: setEditableRowKeys,
            }}
        />
        </section>
    )
}