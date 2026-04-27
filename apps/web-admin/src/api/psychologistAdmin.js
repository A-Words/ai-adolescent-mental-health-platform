// src/api/psychologistAdmin.ts
// 心理咨询师管理端API
import request from '@/utils/request';
/**
 * 获取心理咨询师列表（管理端）
 */
export function getAdminPsychologistList(params) {
    return request({
        url: '/api/admin/psychologist/list',
        method: 'get',
        params
    });
}
/**
 * 获取心理咨询师详情（管理端）
 */
export function getAdminPsychologistDetail(id) {
    return request({
        url: `/api/admin/psychologist/${id}`,
        method: 'get'
    });
}
/**
 * 添加心理咨询师
 */
export function addPsychologist(data) {
    return request({
        url: '/api/admin/psychologist',
        method: 'post',
        data
    });
}
/**
 * 更新心理咨询师
 */
export function updatePsychologist(id, data) {
    return request({
        url: `/api/admin/psychologist/${id}`,
        method: 'put',
        data
    });
}
/**
 * 删除心理咨询师
 */
export function deletePsychologist(id) {
    return request({
        url: `/api/admin/psychologist/${id}`,
        method: 'delete'
    });
}
/**
 * 启用/禁用心理咨询师
 */
export function updatePsychologistStatus(id, enabled) {
    return request({
        url: `/api/admin/psychologist/${id}/status`,
        method: 'post',
        params: { enabled }
    });
}
/**
 * 获取平台收入统计
 */
export function getPlatformIncomeStats() {
    return request({
        url: '/api/admin/psychologist/income/stats',
        method: 'get'
    });
}
/**
 * 获取心理咨询师收入列表
 */
export function getPsychologistIncomeList(params) {
    return request({
        url: '/api/admin/psychologist/income/list',
        method: 'get',
        params
    });
}
/**
 * 获取心理咨询师余额列表
 */
export function getPsychologistBalanceList(params) {
    return request({
        url: '/api/admin/psychologist/balance/list',
        method: 'get',
        params
    });
}
/**
 * 获取心理咨询师提现列表
 */
export function getPsychologistWithdrawList(params) {
    return request({
        url: '/api/admin/psychologist/withdraw/list',
        method: 'get',
        params
    });
}
/**
 * 审核提现申请
 */
export function auditWithdraw(id, status, remark) {
    return request({
        url: `/api/admin/psychologist/withdraw/${id}/audit`,
        method: 'post',
        data: { status, remark }
    });
}
/**
 * 获取资料审核列表（管理端）
 */
export function getProfileAuditList(params) {
    return request({
        url: '/api/admin/psychologist/audit/list',
        method: 'get',
        params
    });
}
/**
 * 获取资料审核详情（管理端）
 */
export function getProfileAuditDetail(id) {
    return request({
        url: `/api/admin/psychologist/audit/${id}`,
        method: 'get'
    });
}
/**
 * 通过资料审核（管理端）
 */
export function approveProfileAudit(id, remark) {
    return request({
        url: `/api/admin/psychologist/audit/${id}/approve`,
        method: 'post',
        params: { remark }
    });
}
/**
 * 拒绝资料审核（管理端）
 */
export function rejectProfileAudit(id, remark) {
    return request({
        url: `/api/admin/psychologist/audit/${id}/reject`,
        method: 'post',
        params: { remark }
    });
}
// ========== 擅长领域关联管理 ==========
/**
 * 获取心理咨询师的擅长领域列表
 */
export function getPsychologistFields(psychologistId) {
    return request({
        url: `/api/admin/psychologist/${psychologistId}/fields`,
        method: 'get'
    });
}
/**
 * 添加擅长领域
 */
export function addPsychologistField(psychologistId, data) {
    return request({
        url: `/api/admin/psychologist/${psychologistId}/fields`,
        method: 'post',
        data
    });
}
/**
 * 更新擅长领域
 */
export function updatePsychologistField(id, data) {
    return request({
        url: `/api/admin/psychologist/fields/${id}`,
        method: 'put',
        data
    });
}
/**
 * 删除擅长领域
 */
export function deletePsychologistField(id) {
    return request({
        url: `/api/admin/psychologist/fields/${id}`,
        method: 'delete'
    });
}
/**
 * 获取所有咨询领域（用于下拉选择）
 */
export function getFieldOptions() {
    return request({
        url: '/api/admin/psychologist/fields/options',
        method: 'get'
    });
}
// ========== 资质关联管理 ==========
/**
 * 获取心理咨询师的资质列表
 */
export function getPsychologistQualifications(psychologistId) {
    return request({
        url: `/api/admin/psychologist/${psychologistId}/qualifications`,
        method: 'get'
    });
}
/**
 * 添加资质
 */
export function addPsychologistQualification(psychologistId, data) {
    return request({
        url: `/api/admin/psychologist/${psychologistId}/qualifications`,
        method: 'post',
        data
    });
}
/**
 * 更新资质
 */
export function updatePsychologistQualification(id, data) {
    return request({
        url: `/api/admin/psychologist/qualifications/${id}`,
        method: 'put',
        data
    });
}
/**
 * 删除资质
 */
export function deletePsychologistQualification(id) {
    return request({
        url: `/api/admin/psychologist/qualifications/${id}`,
        method: 'delete'
    });
}
/**
 * 获取所有资质类型（用于下拉选择）
 */
export function getQualificationOptions() {
    return request({
        url: '/api/admin/psychologist/qualifications/options',
        method: 'get'
    });
}
