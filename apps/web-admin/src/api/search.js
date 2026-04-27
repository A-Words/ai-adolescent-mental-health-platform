import axios from 'axios';
// ==================== axios 实例 ====================
const request = axios.create({
    baseURL: '/api',
    timeout: 5000
});
// 请求拦截器
request.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});
// 响应拦截器
request.interceptors.response.use(response => {
    const res = response.data;
    if (res.code !== 200) {
        return Promise.resolve(res);
    }
    return res;
}, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
// ==================== 搜索 API ====================
/**
 * 全局搜索（文章+课程）
 * @param params 搜索参数
 */
export function searchContent(params) {
    return request({
        url: '/search/global',
        method: 'get',
        params
    });
}
/**
 * 搜索文章
 * @param params 搜索参数
 */
export function searchArticles(params) {
    const searchParams = { ...params, type: 'article' };
    return request({
        url: '/search/articles',
        method: 'get',
        params: searchParams
    });
}
/**
 * 搜索课程
 * @param params 搜索参数
 */
export function searchCourses(params) {
    const searchParams = { ...params, type: 'course' };
    return request({
        url: '/search/courses',
        method: 'get',
        params: searchParams
    });
}
/**
 * 获取热门搜索关键词
 */
export function getHotKeywords() {
    return request({
        url: '/search/hot-keywords',
        method: 'get'
    });
}
/**
 * 保存搜索历史
 * @param keyword 搜索关键词
 */
export function saveSearchHistory(keyword) {
    return request({
        url: '/search/history',
        method: 'post',
        data: { keyword }
    });
}
/**
 * 获取搜索历史
 */
export function getSearchHistory() {
    return request({
        url: '/search/history',
        method: 'get'
    });
}
/**
 * 清空搜索历史
 */
export function clearSearchHistory() {
    return request({
        url: '/search/history',
        method: 'delete'
    });
}
/**
 * 获取搜索建议（自动补全）
 * @param keyword 关键词前缀
 */
export function getSearchSuggestions(keyword) {
    return request({
        url: '/search/suggestions',
        method: 'get',
        params: { keyword }
    });
}
export default {
    searchContent,
    searchArticles,
    searchCourses,
    getHotKeywords,
    saveSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    getSearchSuggestions
};
