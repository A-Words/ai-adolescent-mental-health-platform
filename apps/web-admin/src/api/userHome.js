import request from './user';
export const getUserHome = (userId) => {
    return request({
        url: `/user/home/${userId}`,
        method: 'get'
    });
};
export const getUserArticles = (userId, params) => {
    return request({
        url: `/user/home/${userId}/articles`,
        method: 'get',
        params
    });
};
export const getUserLikes = (userId, params) => {
    return request({
        url: `/user/home/${userId}/likes`,
        method: 'get',
        params
    });
};
export const getUserFollowings = (userId, params) => {
    return request({
        url: `/user/home/${userId}/followings`,
        method: 'get',
        params
    });
};
export const getUserFollowers = (userId, params) => {
    return request({
        url: `/user/home/${userId}/followers`,
        method: 'get',
        params
    });
};
// 用户内容相关
export const getMyPublishedArticles = (params) => {
    return request({
        url: '/user/content/articles',
        method: 'get',
        params
    });
};
export const getMyLikes = (params) => {
    return request({
        url: '/user/content/likes',
        method: 'get',
        params
    });
};
export const getMyCollections = (params) => {
    return request({
        url: '/user/content/collections',
        method: 'get',
        params
    });
};
export const getFollowArticles = (params) => {
    return request({
        url: '/user/content/follow-articles',
        method: 'get',
        params
    });
};
