// src/api/order.ts
// 订单相关API
import request from '@/utils/request';
/**
 * 获取我的订单列表
 */
export function getMyOrders(params) {
    return request({
        url: '/api/order/list',
        method: 'get',
        params
    });
}
/**
 * 获取订单详情
 */
export function getOrderDetail(orderId) {
    return request({
        url: `/api/order/${orderId}`,
        method: 'get'
    });
}
/**
 * 获取心理咨询订单列表
 */
export function getPsychologistOrders(params) {
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
        url: `/api/psychologist/appointment/${appointmentId}/detail`,
        method: 'get'
    });
}
/**
 * 获取书籍订单列表
 */
export function getBookOrders(params) {
    return request({
        url: '/api/book/order/list',
        method: 'get',
        params
    });
}
/**
 * 获取测评订单列表
 */
export function getAssessmentOrders(params) {
    return request({
        url: '/api/assessment/order/list',
        method: 'get',
        params
    });
}
/**
 * 取消订单
 */
export function cancelOrder(orderId, type) {
    return request({
        url: `/api/order/${orderId}/cancel`,
        method: 'post',
        data: { type }
    });
}
/**
 * 获取订单统计数据
 */
export function getOrderStats() {
    return request({
        url: '/api/order/stats',
        method: 'get'
    });
}
