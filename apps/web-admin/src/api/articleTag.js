import request from './user';
export const getArticleTags = () => {
    return request({
        url: '/article/tag/list',
        method: 'get'
    });
};
export const addArticleTag = (data) => {
    return request({
        url: '/article/tag',
        method: 'post',
        data
    });
};
export const updateArticleTag = (data) => {
    return request({
        url: `/article/tag/${data.id}`,
        method: 'put',
        data
    });
};
export const deleteArticleTag = (id) => {
    return request({
        url: `/article/tag/${id}`,
        method: 'delete'
    });
};
