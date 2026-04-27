import request from './user';
export const getMessages = (params) => {
    return request({
        url: '/user/messages',
        method: 'get',
        params
    });
};
export const markMessageRead = (id) => {
    return request({
        url: `/user/messages/${id}/read`,
        method: 'put'
    });
};
export const markAllMessagesRead = () => {
    return request({
        url: '/user/messages/read-all',
        method: 'put'
    });
};
export const getUnreadCount = () => {
    return request({
        url: '/user/messages/unread-count',
        method: 'get'
    });
};
