import { Button, Checkbox, Descriptions, Divider, Drawer, Form, Image, Input, Modal, Radio, Space } from "antd";
import React, { useState } from "react";
import { getPreConsultation, acceptOrRefusePaint } from '../service'

export default function ConsultDetails({ data, onAccept }) {

    const [form] = Form.useForm();

    const [ questions, setQuestions ] = useState({
        visible: false,
        ques: null,
    })

    const handleAccept = async () => {
        await acceptOrRefusePaint({consultationId: data.id, status: 2});
        onAccept(2);
    }

    const handleRefuse = () => {
        let reason;
        Modal.confirm({
            title: '拒绝理由',
            centered: true,
            content: <Input.TextArea onChange={e => reason = e.target.value} />,
            onOk: async () => {
                await acceptOrRefusePaint({consultationId: data.id, status: 7, reason});
                onAccept(7);
            }
        })
    }

    const showQuestion = async () => {
        const res = await getPreConsultation({modelType: data.patientAge <= 14 ? 3 : data.patientGender});
        setQuestions({
            visible: true,
            ques: res.data,
        });
        form.setFieldsValue(JSON.parse(data.consultationAnswer))
    }

    return (
        <>
        <Divider />
        <Descriptions 
            title="患者信息"
            items={[
                {
                    key: '1',
                    label: '姓名',
                    children: data?.patientName
                },
                {
                    key: '2',
                    label: '性别',
                    children: data?.patientGender === 1 ? '男' : '女',
                },
                {
                    key: '3',
                    label: '年龄',
                    children: data?.patientAge + '岁',
                },
                {
                    key: '4',
                    label: '身高',
                    children: data?.height + 'cm',
                },
                {
                    key: '5',
                    label: '体重',
                    children: data?.weight + 'kg',
                }
            ]}
        />
        <Divider />
        <Descriptions 
            title="病情描述"
            items={[
                {
                    key: '1',
                    label: '疾病名称或症状',
                    children: data?.diseaseNameOrzz
                },
                {
                    key: '2',
                    label: '疾病描述',
                    children: data?.diseaseDescription,
                },
                {
                    key: '3',
                    label: '服用药物',
                    children: data?.takedMedicine || '无',
                },
                {
                    key: '4',
                    label: '过敏史',
                    children: data?.guominshi || '无',
                },
                {
                    key: '5',
                    label: '既往病史',
                    children: data?.guominshi || '无',
                },
                {
                    key: '6',
                    label: '婚育史',
                    children: data?.hunyushi || '未知',
                },
                {
                    key: '6-1',
                    label: '问诊单',
                    children: <a onClick={showQuestion}>查看问诊单</a>,
                },
                {
                    key: '7',
                    label: '线下医院是否就诊过',
                    children: data?.isToHospital === 1 ? '就诊过' : '未诊过',
                },
                {
                    key: '8',
                    label: '就诊医院',
                    children: data?.vHospital || '--',
                },
                {
                    key: '9',
                    label: '就诊结果',
                    children: data?.vResult || '--',
                    span: 3,
                },
                {
                    key: '10',
                    label: '舌面照',
                    span: 3,
                    children: data?.faceImages?.length > 0 ? <Image.PreviewGroup><Space size="small">{data.faceImages.map((img) => <Image width={50} src={img} alt="舌面照" />)}</Space></Image.PreviewGroup> : '未上传',
                },
                {
                    key: '11',
                    labelStyle: {width: 80},
                    label: '相关的就诊病历、检查报告或化验单',
                    span: 3,
                    children: data?.mrImages?.length > 0 ? <Image.PreviewGroup><Space size="small">{data.mrImages.map((img) => <Image width={50} src={img} alt="相关的就诊病历、检查报告或化验单" />)}</Space></Image.PreviewGroup> : '未上传',
                }
            ]}
        />
        {
            data.status === 6 &&
            <>
                <Divider />
                <div style={{textAlign: 'center'}}>
                    <Space size="large">
                        <Button onClick={handleRefuse} color="primary" variant='filled'>拒绝接诊</Button>
                        <Button onClick={handleAccept} type="primary">立即接诊</Button>
                    </Space>
                </div>
            </>
        }
        <Drawer 
            title="问诊单" 
            open={questions.visible}
            onClose={() => setQuestions({...questions, visible: false})}
        >
            <Form form={form} layout="vertical">
            {
                questions.ques && questions.ques.map((item, idx) => {
                    return <Form.Item key={idx} label={item.title + (item.type === 'm' ? '(多选)' : '(单选)')} name={item.id}>
                            <Checkbox.Group 
                                disabled 
                                rootClassName="wenzhen-checkbox"
                                options={item.ques.map((q, i) => ({ label: q, value: i+1 }))}
                            />
                        </Form.Item>
                 })
            }
            </Form>
        </Drawer>
        </>
    )
}