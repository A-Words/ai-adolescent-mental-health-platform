import request from './user';
export const followUser = (userId) => {
    return request({
        url: `/user/follow/${userId}`,
        method: 'post'
    });
};
export const unfollowUser = (userId) => {
    return request({
        url: `/user/follow/${userId}`,
        method: 'delete'
    });
};
export const getMyFollowings = (params) => {
    return request({
        url: '/user/followings',
        method: 'get',
        params
    });
};
export const getMyFollowers = (params) => {
    return request({
        url: '/user/followers',
        method: 'get',
        params
    });
};
export const getFollowStatus = (userId) => {
    return request({
        url: `/user/follow/${userId}/status`,
        method: 'get'
    });
};
export const getUserFollowings = (userId, params) => {
    return request({
        url: `/user/${userId}/followings`,
        method: 'get',
        params
    });
};
export const getUserFollowers = (userId, params) => {
    return request({
        url: `/user/${userId}/followers`,
        method: 'get',
        params
    });
};
