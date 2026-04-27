// 书籍管理 API - 超级管理员端
import request from '@/api/user';
// 获取书籍管理列表
export function getBookAdminList(params) {
    return request({
        url: '/admin/book/list',
        method: 'get',
        params
    });
}
// 获取书籍详情（编辑回显）
export function getBookAdminDetail(id) {
    return request({
        url: `/admin/book/${id}`,
        method: 'get'
    });
}
// 新增书籍
export function addBook(data) {
    return request({
        url: '/admin/book',
        method: 'post',
        data
    });
}
// 修改书籍
export function updateBook(id, data) {
    return request({
        url: `/admin/book/${id}`,
        method: 'put',
        data
    });
}
// 删除书籍
export function deleteBook(id) {
    return request({
        url: `/admin/book/${id}`,
        method: 'delete'
    });
}
// 获取书籍评论列表
export function getBookCommentList(bookId, params) {
    return request({
        url: `/book/${bookId}/comment/list`,
        method: 'get',
        params
    });
}
// 删除书籍评论
export function deleteBookComment(id) {
    return request({
        url: `/admin/book/comment/${id}`,
        method: 'delete'
    });
}
// 获取所有书籍的评论（用于评论管理）
export function getAllBookComments(params) {
    return request({
        url: '/admin/book/comments',
        method: 'get',
        params
    });
}
