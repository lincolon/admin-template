import {FileImageOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Segmented, Input, Space, Tooltip, Button, Modal, message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import TencentCloudChat from '@tencentcloud/chat';
import ConsultItem from './components/ConsultItem';
import ConversationItem from './components/ConversationItem';
import ConsultDetails from './components/ConsultDetails';

import './style.less';
import localforage from 'localforage';

import {
    getConversationStatus,
    getChatHistory,
    acceptOrRefusePaint,
    uploadImage,
    getConsultationDetails
} from './service';

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
    const [ tabvalue, setTabvalue ] = useState(6);
    const [ inputValue, setInputValue ] = useState('');
    const [ acceptStatus, setAcceptStatus ] = useState(0);
    const [ conversationId, setConversationId ] = useState('');
    const [ consultData, updateConsultData ] = useState({visible: false, data: null });
    const [ chatData, setChatData ] = useState({
        lastChatId: '',
        data: [],
        pageInfo: {}
    });

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
            setConversationId(conversationId);
            setAcceptStatus(0);
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
            setAcceptStatus(1);
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
                    setAcceptStatus(-1);
                },
            });
            
        }
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
                           acceptStatus === 0 && 
                            <>
                                <Button size='small' onClick={()=>handleAccept('accept')}>接诊</Button>
                                <Button size='small' onClick={()=>handleAccept('refuse')}>拒诊</Button>
                            </>
                        }
                        {
                            acceptStatus === 1 && <>
                                <Button size='small'>辨证开方</Button>
                                <Button size='small'>辨证开方</Button>
                                <Button size='small'>补填问诊单</Button>
                                <Button size='small'>退款</Button>
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
                    disabled={!conversationId}
                    onChange={(e) => {setInputValue(e.target.value)}}
                    onPressEnter={handleSendMsg}
                />
                <div className='flexbox' style={{justifyContent: 'flex-end', padding:10}}>
                    <Button 
                        type='primary' 
                        onClick={handleSendMsg}
                        disabled={!inputValue || !conversationId}
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
        >
            <ConsultDetails data={consultData.data} />
        </Modal>
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