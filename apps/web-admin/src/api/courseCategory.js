import request from './user';
export const getCourseCategories = () => {
    return request({
        url: '/content/admin/course-category/list',
        method: 'get'
    });
};
export const getEnabledCategories = () => {
    return request({
        url: '/content/admin/course-category/enabled',
        method: 'get'
    });
};
export const addCourseCategory = (data) => {
    return request({
        url: '/content/admin/course-category',
        method: 'post',
        data
    });
};
export const updateCourseCategory = (id, data) => {
    return request({
        url: `/content/admin/course-category/${id}`,
        method: 'put',
        data
    });
};
export const deleteCourseCategory = (id) => {
    return request({
        url: `/content/admin/course-category/${id}`,
        method: 'delete'
    });
};
