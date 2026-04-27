// src/api/psychologistAppointment.ts
// 心理咨询预约相关API
import request from '@/utils/request';
/**
 * 获取我的心理咨询预约列表
 */
export function getMyAppointments(params) {
    return request({
        url: '/api/psychologist/appointment/list',
        method: 'get',
        params
    });
}
/**
 * 获取预约详情
 */
export function getAppointmentDetail(appointmentId) {
    return request({
        url: '/api/psychologist/appointment/' + appointmentId + '/detail',
        method: 'get'
    });
}
/**
 * 获取聊天消息列表
 */
export function getMessages(appointmentId, page = 1, size = 50) {
    return request({
        url: '/psychologist/messages/' + appointmentId,
        method: 'get',
        params: { page, size }
    });
}
/**
 * 发送聊天消息
 */
export function sendMessage(data) {
    return request({
        url: '/psychologist/messages/send',
        method: 'post',
        data
    });
}
