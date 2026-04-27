// src/api/psychologistAdminPage.ts
// 心理咨询师管理端页面API
import request from '@/utils/request';
/**
 * 获取我的心理咨询师信息
 */
export function getMyPsychologistProfile() {
    return request({
        url: '/api/psychologist/admin/me',
        method: 'get'
    });
}
/**
 * 获取工作台统计数据
 */
export function getDashboardStats() {
    return request({
        url: '/api/psychologist/admin/dashboard/stats',
        method: 'get'
    });
}
/**
 * 获取我的预约列表（心理咨询师端）
 */
export function getMyAppointments(params) {
    return request({
        url: '/api/psychologist/admin/appointments',
        method: 'get',
        params
    });
}
/**
 * 接受/拒绝预约
 */
export function handleAppointment(appointmentId, accepted, videoLink, rejectReason) {
    return request({
        url: `/api/psychologist/admin/appointments/${appointmentId}/handle`,
        method: 'post',
        params: { accepted },
        data: { videoLink, rejectReason }
    });
}
/**
 * 发送视频会议链接或线下地址
 */
export function sendVideoLink(data) {
    return request({
        url: `/api/psychologist/admin/appointments/${data.appointmentId}/video-link`,
        method: 'post',
        params: {
            videoLink: data.videoLink,
            offlineAddress: data.offlineAddress,
            startTime: data.startTime,
            endTime: data.endTime
        }
    });
}
/**
 * 开始咨询
 */
export function startConsultation(data) {
    return request({
        url: `/api/psychologist/admin/appointments/${data.appointmentId}/start`,
        method: 'post',
        params: { startTime: data.startTime }
    });
}
/**
 * 完成咨询
 */
export function completeConsultationApi(appointmentId) {
    return request({
        url: `/api/psychologist/admin/appointments/${appointmentId}/complete`,
        method: 'post'
    });
}
/**
 * 获取我的排班
 */
export function getMySchedules(startDate, endDate) {
    return request({
        url: '/api/psychologist/admin/schedules',
        method: 'get',
        params: { startDate, endDate }
    });
}
/**
 * 保存排班
 */
export function saveSchedule(data) {
    return request({
        url: '/api/psychologist/admin/schedule',
        method: 'post',
        data
    });
}
/**
 * 批量保存排班
 */
export function saveSchedules(schedules) {
    return request({
        url: '/api/psychologist/admin/schedules/batch',
        method: 'post',
        data: schedules
    });
}
/**
 * 获取排班时段详情（包含已预约人数、最大预约人数、预约列表）
 */
export function getScheduleSlotDetail(scheduleDate, timeSlot) {
    return request({
        url: '/api/psychologist/admin/schedule/slot-detail',
        method: 'get',
        params: { scheduleDate, timeSlot }
    });
}
/**
 * 更新排班状态（仅允许 休息<->可预约 的切换）
 */
export function updateScheduleStatus(scheduleId, status) {
    return request({
        url: '/api/psychologist/admin/schedule/status',
        method: 'post',
        params: { scheduleId, status }
    });
}
/**
 * 更新排班信息（最大预约人数等）
 */
export function updateSchedule(scheduleId, maxAppointments) {
    return request({
        url: '/api/psychologist/admin/schedule',
        method: 'put',
        params: { scheduleId, maxAppointments }
    });
}
/**
 * 删除排班
 */
export function deleteSchedule(scheduleId) {
    return request({
        url: `/api/psychologist/admin/schedule/${scheduleId}`,
        method: 'delete'
    });
}
/**
 * 删除指定日期之前的历史排班（仅删除无预约的记录）
 */
export function deleteOldSchedules(beforeDate) {
    return request({
        url: '/api/psychologist/admin/schedules/old',
        method: 'delete',
        params: { beforeDate }
    });
}
/**
 * 更新个人资料
 */
export function updateMyProfile(data) {
    return request({
        url: '/api/psychologist/admin/profile',
        method: 'put',
        data
    });
}
/**
 * 获取我的收入统计
 */
export function getMyIncomeStats() {
    return request({
        url: '/api/psychologist/income/stats',
        method: 'get'
    });
}
/**
 * 获取我的收入列表
 */
export function getMyIncomeList(params) {
    return request({
        url: '/api/psychologist/income/details',
        method: 'get',
        params
    });
}
/**
 * 获取我的余额
 */
export function getMyBalance() {
    return request({
        url: '/api/psychologist/income/balance',
        method: 'get'
    });
}
/**
 * 获取我的提现记录
 */
export function getMyWithdrawList(params) {
    return request({
        url: '/api/psychologist/income/withdraw/list',
        method: 'get',
        params
    });
}
/**
 * 申请提现
 */
export function applyWithdraw(amount) {
    return request({
        url: '/api/psychologist/income/withdraw',
        method: 'post',
        params: { amount }
    });
}
/**
 * 获取收入趋势
 */
export function getIncomeTrend(params) {
    return request({
        url: '/api/psychologist/income/trend',
        method: 'get',
        params
    });
}
/**
 * 获取聊天消息
 */
export function getMessages(appointmentId) {
    return request({
        url: `/api/psychologist/admin/messages/${appointmentId}`,
        method: 'get'
    });
}
/**
 * 发送消息
 */
export function sendMessage(data) {
    return request({
        url: '/api/psychologist/admin/messages/send',
        method: 'post',
        data
    });
}
/**
 * 获取预约详情（包含评价信息和收入计算）
 */
export function getAppointmentDetail(appointmentId) {
    return request({
        url: `/api/psychologist/admin/appointments/${appointmentId}/detail`,
        method: 'get'
    });
}
