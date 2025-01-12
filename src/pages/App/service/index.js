import axios from "axios";


// 患者列表
export function getPatientList() {
    return axios.get('/v1/doctors/patient/list');
}
// 医生信息
export function getDoctorInfo() {
    return axios.post('/v1/doctors/info');
}
// 更新医生信息
export function updateDoctorInfo(data) {
    return axios.post('/v1/doctors/info/update', { data });
}

// 预问诊单模板详情（医生预览某个模板内的问题列表）
export function getQuestionTemplate(params) {
    return axios.get('/api/permission', { params });
}

// 获取某个问诊单问题列表及答案
export function getAnswers(params) {
    return axios.get('/v1/doctors/question/list', { params });
}

// 剂型列表
export function getJixingList() {
    return axios.get('/v1/orders/jixing/list');
}

// 根据剂型查询药房列表
export function getMedicineRoom(params) {
    return axios.get('/v1/orders/pharmacy', { params });
}

// 查询中医诊断、西医诊断、中医证型列表
export function getDiagnosisList1(params) {
    return axios.get('/v1/doctors/diagnosis/list', { params: { ...params, type: 1 } });
}

export function getDiagnosisList2(params) {
    return axios.get('/v1/doctors/diagnosis/list', { params: { ...params, type: 2 } });
}

export function getDiagnosisList3(params) {
    return axios.get('/v1/doctors/diagnosis/list', { params: { ...params, type: 3 } });
}

// 查询药品列表
export function getMedicineList(params) {
    return axios.get('/v1/orders/medicine/search', { params });
}

// 获取问诊单列表
export function getConsultationList(params) {
    return axios.get('/v1/doctors/consultation/list', { params, hideLoading: true });
}

// 结束问诊单
export function endConsultation(data) {
    return axios.post('/v1/im/close-session', data);
}

// 结束问诊单
export function isCanOverSession(params) {
    return axios.get('/v1/im/ifclose', {params});
}

// 结束问诊单
export function getOverReasons(params) {
    return axios.get('/v1/doctors/consultation-close-reason', {params});
}

// 获取问诊列表
export function dataAnalyses(data) {
    return axios.post('/data/analyses', data);
}

// 获取患者信息
export function getPatientInfo(data) {
    return axios.post('/medical/getPatientInfo', data);
}

// 获取患者就医记录
export function getRecord(data) {
    return axios.post('/medical/getRecord', data);
}

// 获取患者病历
export function getMedicalRecord(data) {
    return axios.post('/medical/getMedicalRecord', data);
}

// 获取患者用药记录
export function getMedicineRecord(data) {
    return axios.post('/medical/getMedicineRecord', data);
}


// 获取会话状态
export function getConversationStatus(params) {
    return axios.get("/v1/im/conversation/status", {params});
}
// 获取聊天记录
export function getChatHistory(params) {
    return axios.get("/v1/im/history", {params});
}

export function sendMessageToPatient(data) {
    return axios.post("/v1/im/send-to-patient", data, { hideLoading: true });
}

// 文件上传
export function uploadImage(file) {
    return axios.post('/v1/upload-file', { file, withFile: true });
}

// 开具处方单给患者
export function addPrescription(data) {
    return axios.post('/v1/orders/prescription/add', data);
}

// 处方单详情
export function getPrescriptionDetails(params) {
    return axios.get('/v2/orders/prescription/detail', { params });
}

// 问诊单详情
export function getConsultationDetails(params) {
    return axios.get('/v1/doctors/consultation/detail', { params });
}  

// 获取某个问诊单问题列表及答案
export function getConsultationAnswers(params) {
    return axios.get('/v1/doctors/question/list', { params });
}

// 获取问诊单模板
export function getConsultationTemplate(params) {
    return axios.get('/v1/doctors/question/detail', { params });
}

// 获取问诊单问题
export function getPreConsultation(params) {
    return axios.get('/v1/doctors/question/detail', { params });
}

// 问诊单 - 接诊/拒诊
export function acceptOrRefusePaint(data) {
    return axios.post('/v1/orders/consultation/opt', data);
}

// 获取药品详情
export function getMedicineDetails(params) {
    return axios.get('/v1/orders/medicine/detail', {params});
}