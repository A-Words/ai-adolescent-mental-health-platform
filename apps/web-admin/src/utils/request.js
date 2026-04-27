// src/utils/request.ts
import axios from 'axios';
import { ElMessage } from 'element-plus';
// 创建 axios 实例
const service = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL || 'http://122.51.12.200:8080',
    // baseURL: import.meta.env.VITE_API_BASE_URL || 'https://122.51.12.200:8080',
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
});
// 请求拦截器
service.interceptors.request.use((config) => {
    // 从本地存储获取 token
    const token = localStorage.getItem('token');
    // 如果 token 存在，添加到请求头
    if (token && config.headers) {
        // 优先使用 Authorization Bearer 格式
        config.headers['Authorization'] = `Bearer ${token}`;
        // 同时设置 token 字段以兼容后端
        config.headers['token'] = token;
    }
    return config;
}, (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
});
// 响应拦截器
service.interceptors.response.use((response) => {
    const res = response.data;
    // 如果响应状态码不是 200，则视为错误
    if (res.code !== 200) {
        // 处理特定的错误码
        if (res.code === 401) {
            // 未授权，跳转到登录页
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            ElMessage.error('登录已过期，请重新登录');
            // 注意：这里不能直接使用 useRouter，需要在组件中处理跳转
        }
        else if (res.code === 403) {
            ElMessage.error('权限不足，无法访问');
        }
        else {
            // 其他错误，显示错误消息
            ElMessage.error(res.message || '请求失败');
        }
        return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
}, (error) => {
    console.error('响应拦截器错误:', error);
    // 处理 HTTP 状态码
    if (error.response) {
        switch (error.response.status) {
            case 400:
                ElMessage.error('请求错误');
                break;
            case 401:
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                ElMessage.error('未授权，请先登录');
                break;
            case 403:
                ElMessage.error('拒绝访问');
                break;
            case 404:
                ElMessage.error('请求的资源不存在');
                break;
            case 500:
                ElMessage.error('服务器内部错误');
                break;
            case 502:
                ElMessage.error('网关错误');
                break;
            case 503:
                ElMessage.error('服务不可用');
                break;
            case 504:
                ElMessage.error('网关超时');
                break;
            default:
                ElMessage.error('网络错误，请稍后重试');
        }
    }
    else if (error.request) {
        // 请求已发出但没有收到响应
        ElMessage.error('网络连接异常，请检查网络');
    }
    else {
        // 发送请求时出错
        ElMessage.error('请求发送失败');
    }
    return Promise.reject(error);
});
// 封装 GET 请求
export function get(url, config) {
    return service.get(url, config);
}
// 封装 POST 请求
export function post(url, data, config) {
    return service.post(url, data, config);
}
// 封装 PUT 请求
export function put(url, data, config) {
    return service.put(url, data, config);
}
// 封装 DELETE 请求
export function del(url, config) {
    return service.delete(url, config);
}
// 默认导出 service 实例
export default service;
