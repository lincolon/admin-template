import React from 'react';
import { Avatar, Divider, Image } from 'antd';
import { RightOutlined, VideoCameraOutlined, AudioOutlined } from '@ant-design/icons';
// import { sendMessageToPatient } from "../service";

// import { renderChatContent } from '../../../utils/helper'

const avatars = {
    doctor: require('../../../assets/doctor.png'),
    patient: require('../../../assets/user.png'),
}

//问诊单卡片
function ConsulationCard({ data, onClick }){
    return (
        <div 
            className='conv-card' 
            onClick={() => {onClick(data.consultationId)}}
        >
            <div className='flexbox card-title v-center'>
                <div className='v-center light fz-15'>{data.patientName}</div>
                <Divider type='vertical' style={{margin: '0 10px',top:1,borderColor: 'rgba(255,255,255,0.5)'}} />
                <div className='v-center light fz-15'>{data.patientGender === 1 ? '男' : '女'}</div>
                <Divider type='vertical' style={{margin: '0 10px',top:1,borderColor: 'rgba(255,255,255,0.5)'}} />
                <div className='v-center light fz-15'>{data.patientAge}岁</div>
            </div>
            <div className='card-content'>
                <div className='fz-12 fz-gray' style={{marginBottom: 3}}>病情描述：</div>
                <div className='fz-14'>{data.diseaseDescription}</div>
                <Divider style={{margin: '10px 0'}} />
                <div className='flexbox' >
                    <div className='flex1 fz-12 fz-gray'>查看问诊详情</div>
                    <div className='v-center'>
                        <RightOutlined style={{fontSize: 14, color: '#ccc'}} />
                    </div>
                </div>
            </div>
        </div>
    )
}

// 处方单卡片
function PrescriptionCard({ data, onClick }){
    return (
        <div
            className='conv-prescription-card'
            onClick={() => {onClick(data.prescriptionId)}}
        >
            <div className='conv-prescription-card-content v-center'>
                <img src={require('../../../assets/chat/prescription_icon.png')} className='inline-block' width="24" />
                <span style={{marginLeft: 5}} className='inline-block fz-15 fz-weight'>{data?.title}</span>
            </div>
            <div className='flexbox conv-prescription-card-footer v-center'>
                <div className='flex1 fz-12 fz-gray'>查看处方详情</div>
                <div className='v-center'>
                    <RightOutlined style={{fontSize: 14, color: '#ccc'}} />
                </div>
            </div>
        </div>
    )
}

// 问诊表卡片
function QuestionnaireCard({ data }){
    return (
        <div 
            className='flexbox conv-questionnaire-card'
            onClick={() => {}}
        >
            <div></div>
            <div className='flex1'>
                <div className='fz-15 fz-weight'>问诊表</div>
                <div className='fz-12 fz-gray'>为了跟进您的健康状况，为您挑选了本量表，请认真填写</div>
            </div>
        </div>
    )
}

// 音频组件
function Audio({ url }) {

    const handlePlay = () => {
        const audioCtx = Taro.createInnerAudioContext({
            useWebAudioImplement: true
        });
        audioCtx.src = url;
        audioCtx.play();
    };

    return (
      <div className='audio' onClick={handlePlay}>
        <AudioOutlined size={10} />
    </div>
    )
}

// 渲染会话内容
function renderChatContent (msgContent, onConsultCardClick, onPrescriptionCardClick, onQuestionnaireCardClick) {
    const { MsgType, MsgContent } = msgContent;
    switch (MsgType) {
      case 'TIMTextElem': return <div className='conv-text text'>{MsgContent.Text}</div>;
      case 'TIMImageElem': return <Image src={MsgContent.Url} className='image' />;
      case 'TIMSoundElem': 
        return <Audio url={MsgContent.Url} />;
      case 'TIMAudio': 
        return <div className='text'><AudioOutlined /> 语音通话时长</div>;
      case 'TIMVideo': 
        return <div className='text'><VideoCameraOutlined /> 视频通话时长</div>;
      case 'TIMCustomElem': 
        const { data, type } = MsgContent;
        switch (type) {
          case 'Consultation': return <ConsulationCard data={{...data, orderId: msgContent.orderId}} onClick={onConsultCardClick} />; // 问诊单
          case 'Prescription': return <PrescriptionCard data={data} onClick={onPrescriptionCardClick} />; // 处方单
          case 'Questionnaire': return <QuestionnaireCard data={data} onClick={onQuestionnaireCardClick} />; // 问诊表单
          default: return null;
        };
      default: return '[未知消息]';
    }
}

// 会话内容组件
function ConversationItem({ 
    id, 
    from,
    conversationId,
    lastChatId,
    MsgContent,
    onConsultCardClick,
    onPrescriptionCardClick,
    onQuestionnaireCardClick
}) {
    const isDoctor = !from.includes('PATIENT');
    const avatar = isDoctor ? avatars.doctor : avatars.patient;
    // const [ state, setState ] = useState({
    //     isLoading: false,
    //     isError: false
    // });

    // useEffect(() => {
    //     console.log('useEffect conversationId: ', conversationId)
    //     if (lastChatId === id && isDoctor) {
    //         let hasSend = false;
    //         sendMessageToPatient({
    //             conversationId,
    //             body: MsgContent
    //         }).then(res => {
    //             hasSend = res.success && res.data.ActionStatus !== 'FAIL';;
    //             // 3秒消息还没发出去就显示loading
    //             let timer = setTimeout(() => {
    //                 if (hasSend) {
    //                     clearTimeout(timer);
    //                 }else{
    //                     setState({  ...state, isLoading: true });
    //                     // 10秒消息还没发出去就显示错误
    //                     timer = setTimeout(() => {
    //                         if (hasSend) {
    //                             setState({ ...state, isLoading: false });
    //                         }else{
    //                             setState({ ...state, isError: true, isLoading: false });
    //                         }
    //                         clearTimeout(timer);
    //                     }, 10000);
    //                 }
    //             }, 3000);
    //         })
    //     }
    // }, [id]);

    return (
        <div 
            id={id} 
            className={`conv-item flexbox ${isDoctor ? 'self' : 'other'}`}
        >
            <Avatar size={40} className="conv-avatar" src={avatar} />
            <div className="conv-content">{renderChatContent(MsgContent, onConsultCardClick, onPrescriptionCardClick, onQuestionnaireCardClick)}</div>
            {/* {
                isDoctor && <>
                {
                    state.isLoading && <div className='status-box h-center'>
                        <LoadingOutlined style={{color: '#666', fontSize: 14}} />
                    </div>
                }
                {
                    state.isError && <div className='status-box h-center'>
                        <InfoCircleOutlined style={{color: '#FC5A5A', fontSize: 16}} />
                    </div>
                }
                </>
            } */}
        </div>
    )
}



export default React.memo(ConversationItem);