import request from './user';
// 检查申请资格
export const checkApplyEligibility = () => {
    return request({
        url: '/psychologist-apply/check',
        method: 'get'
    });
};
// 获取入驻状态
export const getApplyStatus = () => {
    return request({
        url: '/psychologist-apply/status',
        method: 'get'
    });
};
// 提交基本资料
export const submitBasicInfo = (data) => {
    return request({
        url: '/psychologist-apply/basic',
        method: 'post',
        data
    });
};
// 提交案例报告
export const submitReport = (data) => {
    return request({
        url: '/psychologist-apply/report',
        method: 'post',
        data
    });
};
// 获取申请详情
export const getApplyDetail = () => {
    return request({
        url: '/psychologist-apply/detail',
        method: 'get'
    });
};
// 上传附件
export const uploadApplyFile = (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return request({
        url: '/psychologist-apply/upload',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
// ==================== 管理员端API ====================
// 获取所有入驻申请列表
export const getAdminApplyList = (status) => {
    return request({
        url: '/admin/psychologist/list',
        method: 'get',
        params: { status }
    });
};
// 获取已入驻心理咨询师列表
export const getApprovedPsychologists = () => {
    return request({
        url: '/admin/psychologist/psychologists',
        method: 'get'
    });
};
// 获取申请详情（管理员）
export const getAdminApplyDetail = (id) => {
    return request({
        url: `/admin/psychologist/apply/${id}`,
        method: 'get'
    });
};
// 审核基本资料
export const reviewApply = (id, approved, reason) => {
    return request({
        url: `/admin/psychologist/apply/${id}/review`,
        method: 'post',
        data: { approved, reason }
    });
};
// 标记笔试结果
export const markPaperResult = (id, passed, reason) => {
    return request({
        url: `/admin/psychologist/apply/${id}/paper`,
        method: 'post',
        data: { passed, reason }
    });
};
// 标记案例报告结果
export const markReportResult = (id, passed, reason) => {
    return request({
        url: `/admin/psychologist/apply/${id}/report`,
        method: 'post',
        data: { passed, reason }
    });
};
// 标记面谈结果
export const markInterviewResult = (id, approved, interviewTime, interviewLocation, reason) => {
    return request({
        url: `/admin/psychologist/apply/${id}/interview`,
        method: 'post',
        data: { approved, interviewTime, interviewLocation, reason }
    });
};
