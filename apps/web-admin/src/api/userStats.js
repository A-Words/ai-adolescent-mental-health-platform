import request from './user';
export const getMyStats = () => {
    return request({
        url: '/user/stats',
        method: 'get'
    });
};
export const getUserStats = (userId) => {
    return request({
        url: `/user/stats/${userId}`,
        method: 'get'
    });
};
export const getPrivacySetting = () => {
    return request({
        url: '/user/privacy',
        method: 'get'
    });
};
export const updatePrivacySetting = (data) => {
    return request({
        url: '/user/privacy',
        method: 'put',
        data
    });
};
