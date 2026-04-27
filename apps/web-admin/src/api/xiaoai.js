import request from '@/utils/request';
/**
 * 小爱倾听师 API
 */
export const xiaoaiApi = {
    /**
     * 获取用户剩余时长
     */
    getRemainingTime: () => {
        return request.get('/api/xiaoai/remaining');
    },
    /**
     * 获取会员类型
     * @returns 0-非会员, 1-VIP, 2-SVIP
     */
    getMemberType: () => {
        return request.get('/api/xiaoai/member-type');
    },
    /**
     * 获取每日时长限制
     */
    getDailyLimit: () => {
        return request.get('/api/xiaoai/daily-limit');
    },
    /**
     * 获取今日消息记录
     */
    getTodayMessages: () => {
        return request.get('/api/xiaoai/today-messages');
    },
    /**
     * 上报使用时长（前端每5秒调用一次）
     * @param seconds 本次使用的秒数
     */
    reportUsageTime: (seconds) => {
        return request.post('/api/xiaoai/report-usage', { seconds });
    }
};
