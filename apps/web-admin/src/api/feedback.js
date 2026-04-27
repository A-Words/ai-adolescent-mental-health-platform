import request from './user';
// Platform Feedback
export const submitPlatformFeedback = (data) => {
    return request({
        url: '/feedback/platform',
        method: 'post',
        data
    });
};
export const getMyPlatformFeedback = (params) => {
    return request({
        url: '/feedback/platform/my',
        method: 'get',
        params
    });
};
export const getPlatformFeedbacks = (params) => {
    return request({
        url: '/feedback/platform/list',
        method: 'get',
        params
    });
};
export const updatePlatformFeedbackStatus = (id, data) => {
    return request({
        url: `/feedback/platform/${id}/status`,
        method: 'put',
        data
    });
};
// Consultation Feedback
export const submitConsultationFeedback = (data) => {
    return request({
        url: '/feedback/consultation',
        method: 'post',
        data
    });
};
export const getMyConsultationFeedback = (params) => {
    return request({
        url: '/feedback/consultation/my',
        method: 'get',
        params
    });
};
export const getConsultationFeedbacks = (params) => {
    return request({
        url: '/feedback/consultation/list',
        method: 'get',
        params
    });
};
export const processConsultationFeedback = (id, data) => {
    return request({
        url: `/feedback/consultation/${id}/process`,
        method: 'put',
        data
    });
};
