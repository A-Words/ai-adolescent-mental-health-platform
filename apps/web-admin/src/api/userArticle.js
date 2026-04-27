import request from './user';
export const publishArticle = (data) => {
    return request({
        url: '/article/user',
        method: 'post',
        data
    });
};
export const getMyArticles = (params) => {
    return request({
        url: '/article/user/list',
        method: 'get',
        params
    });
};
export const updateMyArticle = (data) => {
    return request({
        url: `/article/user/${data.id}`,
        method: 'put',
        data
    });
};
export const deleteMyArticle = (id) => {
    return request({
        url: `/article/user/${id}`,
        method: 'delete'
    });
};
export const withdrawArticle = (id) => {
    return request({
        url: `/article/user/${id}/withdraw`,
        method: 'post'
    });
};
export const getUserArticleDetail = (id) => {
    return request({
        url: `/article/user/detail/${id}`,
        method: 'get'
    });
};
export const getUserArticleDetailByUser = (userId, articleId) => {
    return request({
        url: `/article/user/${userId}/${articleId}`,
        method: 'get'
    });
};
export const getAllPublishedArticles = (params) => {
    return request({
        url: '/article/user/list/published',
        method: 'get',
        params
    });
};
export const uploadArticleCover = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request({
        url: '/article/user/cover/upload',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
// 用户文章互动
export const interactUserArticle = (articleId, type) => {
    return request({
        url: `/article/user/${articleId}/interact`,
        method: 'post',
        params: { type }
    });
};
// 用户文章评论
export const addUserArticleComment = (data) => {
    return request({
        url: '/article/user/comment',
        method: 'post',
        data
    });
};
export const getUserArticleComments = (articleId) => {
    return request({
        url: `/article/user/comments/${articleId}`,
        method: 'get'
    });
};
export const likeUserArticleComment = (commentId) => {
    return request({
        url: `/article/user/comment/like/${commentId}`,
        method: 'post'
    });
};
// 审核相关
export const getPendingArticles = (params) => {
    return request({
        url: '/article/audit/list',
        method: 'get',
        params
    });
};
export const auditArticle = (id, data) => {
    return request({
        url: `/article/audit/${id}`,
        method: 'post',
        data
    });
};
export const offlineArticle = (id, reason) => {
    return request({
        url: `/article/user/${id}/offline`,
        method: 'post',
        params: { reason }
    });
};
// 管理员对用户文章上架/下架
export const offlineUserArticle = (id) => {
    return request({
        url: `/article/user/${id}/offline`,
        method: 'post',
        params: { reason: '管理员下架' }
    });
};
export const onlineUserArticle = (id) => {
    return request({
        url: `/article/user/${id}/online`,
        method: 'post'
    });
};
