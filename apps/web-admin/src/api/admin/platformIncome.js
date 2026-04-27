// src/api/admin/platformIncome.ts
// 超级管理员 - 平台收入管理API
import request from '@/utils/request';
/**
 * 获取平台收入统计（分模块）
 */
export function getPlatformIncomeStats(params) {
    return request({
        url: '/api/admin/platform-income/stats',
        method: 'get',
        params
    });
}
/**
 * 获取收入趋势数据（按日）
 */
export function getPlatformIncomeTrend(params) {
    return request({
        url: '/api/admin/platform-income/trend',
        method: 'get',
        params
    });
}
/**
 * 获取心理咨询收入明细列表
 */
export function getConsultationIncomeList(params) {
    return request({
        url: '/api/admin/platform-income/consultation/list',
        method: 'get',
        params
    });
}
