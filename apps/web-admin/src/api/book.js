// src/api/book.ts
import request from '@/utils/request';
// 获取书籍列表
export function getBookList(params) {
    return request({
        url: '/api/book/list',
        method: 'get',
        params
    });
}
// 获取书籍详情
export function getBookDetail(id) {
    return request({
        url: `/api/book/${id}`,
        method: 'get'
    });
}
// 增加书籍浏览数 (兼容新名称)
export function addBookView(id) {
    return request({
        url: `/api/book/${id}/view`,
        method: 'post'
    });
}
// 增加书籍浏览数 (兼容旧名称)
export function increaseViewCount(id) {
    return addBookView(id);
}
// 提交书籍评论 (兼容新名称)
export function submitBookComment(data) {
    return request({
        url: '/api/book/comment',
        method: 'post',
        data
    });
}
// 提交书籍评论 (兼容旧名称)
export function addBookComment(data) {
    return submitBookComment(data);
}
// 获取书籍评论列表
export function getBookComments(bookId, params) {
    return request({
        url: `/api/book/${bookId}/comment/list`,
        method: 'get',
        params
    });
}
