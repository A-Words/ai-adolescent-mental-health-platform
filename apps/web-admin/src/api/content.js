import request from './user';
// 获取文章列表
export const getArticles = (params) => {
    return request({
        url: '/content/articles',
        method: 'get',
        params
    });
};
// 获取文章详情
export const getArticleDetail = (id) => {
    return request({
        url: `/content/article/detail/${id}`,
        method: 'get'
    });
};
// 文章互动
export const interactArticle = (articleId, type) => {
    return request({
        url: '/content/article/interact',
        method: 'post',
        params: { articleId, type }
    });
};
// 发表评论
export const addArticleComment = (data) => {
    return request({
        url: '/content/article/comment',
        method: 'post',
        data
    });
};
// 获取评论列表
export const getArticleComments = (articleId) => {
    return request({
        url: `/content/article/comments/${articleId}`,
        method: 'get'
    });
};
// 评论点赞
export const likeArticleComment = (commentId) => {
    return request({
        url: `/content/article/comment/like/${commentId}`,
        method: 'post'
    });
};
// 获取课程列表
export const getCourses = (params) => {
    return request({
        url: '/content/courses',
        method: 'get',
        params
    });
};
// 获取课程详情
export const getCourseDetail = (id) => {
    return request({
        url: `/content/course/${id}`,
        method: 'get'
    });
};
