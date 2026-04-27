// src/api/psychologist.ts
// 心理咨询师相关API
import request from '@/utils/request';
// ===== 心理咨询师API =====
/**
 * 获取心理咨询师列表
 */
export function getPsychologistList(params) {
    return request({
        url: '/api/psychologist/list',
        method: 'get',
        params
    });
}
/**
 * 获取心理咨询师详情
 */
export function getPsychologistDetail(id) {
    return request({
        url: `/api/psychologist/${id}`,
        method: 'get'
    });
}
/**
 * 获取收藏的心理咨询师列表
 */
export function getFavoritePsychologists() {
    return request({
        url: '/api/psychologist/favorites',
        method: 'get'
    });
}
/**
 * 收藏/取消收藏心理咨询师
 */
export function toggleFavorite(psychologistId) {
    return request({
        url: `/api/psychologist/favorite/${psychologistId}`,
        method: 'post'
    });
}
/**
 * 获取心理咨询师排班
 */
export function getPsychologistSchedule(psychologistId, startDate, endDate) {
    return request({
        url: `/api/psychologist/${psychologistId}/schedule`,
        method: 'get',
        params: { startDate, endDate }
    });
}
/**
 * 获取心理咨询师服务价格
 */
export function getPsychologistServices(psychologistId) {
    return request({
        url: `/api/psychologist/${psychologistId}/services`,
        method: 'get'
    });
}
/**
 * 获取咨询历史
 */
export function getConsultationHistory() {
    return request({
        url: '/api/psychologist/history',
        method: 'get'
    });
}
/**
 * 获取我的所有预约（分页）
 */
export function getAllMyAppointments(params) {
    return request({
        url: '/api/psychologist/appointment/list',
        method: 'get',
        params
    });
}
/**
 * 获取当前预约状态
 */
export function getCurrentAppointments() {
    return request({
        url: '/api/psychologist/appointments/current',
        method: 'get'
    });
}
/**
 * 创建预约
 */
export function createAppointment(params) {
    return request({
        url: '/api/psychologist/appointment',
        method: 'post',
        data: params
    });
}
/**
 * 取消预约
 */
export function cancelAppointment(params) {
    return request({
        url: `/api/psychologist/appointment/${params.appointmentId}/cancel`,
        method: 'post',
        params: { appointmentId: params.appointmentId },
        data: { cancelReason: params.cancelReason }
    });
}
/**
 * 评价预约
 */
export function rateAppointment(params) {
    return request({
        url: `/api/psychologist/appointment/${params.appointmentId}/rate`,
        method: 'post',
        params: { rating: params.rating, content: params.comment, isAnonymous: params.isAnonymous }
    });
}
/**
 * 获取可用的咨询领域列表
 */
export function getConsultationFields() {
    return request({
        url: '/api/dict/consultation-fields',
        method: 'get'
    });
}
/**
 * 获取可用的资质类型列表
 */
export function getQualifications() {
    return request({
        url: '/dict/qualifications',
        method: 'get'
    });
}
// ===== 心理咨询消息API =====
/**
 * 发送文本消息
 */
export function sendMessage(params) {
    return request({
        url: '/api/psychologist/message/send',
        method: 'post',
        data: {
            appointmentId: params.appointmentId,
            receiverId: params.receiverId,
            content: params.content,
            contentType: params.contentType || 0
        }
    });
}
/**
 * 发送图片消息
 */
export function sendImageMessage(params) {
    return request({
        url: '/psychologist/message/send/image',
        method: 'post',
        data: params
    });
}
/**
 * 获取消息历史
 */
export function getMessageHistory(appointmentId) {
    return request({
        url: `/api/psychologist/message/history/${appointmentId}`,
        method: 'get'
    });
}
/**
 * 获取新消息（轮询）
 */
export function getNewMessages(appointmentId, lastTime) {
    return request({
        url: `/psychologist/message/new/${appointmentId}`,
        method: 'get',
        params: { lastTime }
    });
}
/**
 * 获取对话列表（咨询师端）
 */
export function getConversations() {
    return request({
        url: '/api/psychologist/message/conversations',
        method: 'get'
    });
}
/**
 * 支付预约
 */
export function payAppointment(appointmentId) {
    return request({
        url: `/api/psychologist/appointment/${appointmentId}/pay`,
        method: 'post'
    });
}
/**
 * 更新在线状态（手动切换）
 * @param status 在线状态（0-离线，1-在线，2-忙碌）
 */
export function updateOnlineStatus(status) {
    return request({
        url: '/api/psychologist/status',
        method: 'post',
        params: { status }
    });
}
// ===== 在线状态常量 =====
export const OnlineStatus = {
    OFFLINE: 0,
    ONLINE: 1,
    BUSY: 2
};
export const OnlineStatusText = {
    [OnlineStatus.OFFLINE]: '离线',
    [OnlineStatus.ONLINE]: '在线',
    [OnlineStatus.BUSY]: '忙碌'
};
