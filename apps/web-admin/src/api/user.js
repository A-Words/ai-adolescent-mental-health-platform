import axios from 'axios';
const request = axios.create({
    baseURL: '/api',
    timeout: 5000
});
// 请求拦截器
request.interceptors.request.use(config => {
    // 排除不需要 Token 的公开接口
    const publicPaths = [
        '/user/login',
        '/user/register',
        '/user/email/send',
        '/user/login/email',
        '/user/login/email/password',
        '/user/register/email',
        '/user/forgot/send',
        '/user/forgot/reset',
        '/user/forgot/verify'
    ];
    const isPublicApi = publicPaths.some(path => config.url?.includes(path));
    if (!isPublicApi) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['token'] = token;
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});
// 响应拦截器
request.interceptors.response.use(response => {
    const res = response.data;
    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
        return res;
    }
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
// ==================== 登录/注册 ====================
export const login = (data, remember) => {
    return request({
        url: '/user/login',
        method: 'post',
        data,
        params: remember !== undefined ? { remember } : undefined
    });
};
export const logout = () => {
    return request({
        url: '/user/logout',
        method: 'post'
    });
};
export const register = (data) => {
    return request({
        url: '/user/register',
        method: 'post',
        data
    });
};
// ==================== 邮箱登录/注册（新增） ====================
/** 发送邮箱验证码（注册/登录共用） */
export const sendEmailCode = (data) => {
    return request({
        url: '/user/email/send',
        method: 'post',
        data
    });
};
/** 邮箱 + 验证码登录 */
export const loginByEmailCode = (data) => {
    return request({
        url: '/user/login/email',
        method: 'post',
        data
    });
};
/** 邮箱 + 密码登录 */
export const loginByEmailPassword = (data) => {
    return request({
        url: '/user/login/email/password',
        method: 'post',
        data
    });
};
/** 邮箱 + 验证码注册 */
export const registerByEmail = (data) => {
    return request({
        url: '/user/register/email',
        method: 'post',
        data
    });
};
// ==================== 忘记密码（新增） ====================
/** 发送忘记密码验证码 */
export const sendForgotCode = (data) => {
    return request({
        url: '/user/forgot/send',
        method: 'post',
        data
    });
};
/** 重置密码 */
export const resetPassword = (data) => {
    return request({
        url: '/user/forgot/reset',
        method: 'post',
        data
    });
};
/** 验证忘记密码验证码（仅验证，不重置） */
export const verifyForgotCode = (data) => {
    return request({
        url: '/user/forgot/verify',
        method: 'post',
        data
    });
};
// ==================== 用户信息 ====================
export const getUserInfo = () => {
    return request({
        url: '/user/info',
        method: 'get'
    });
};
export const updateUserInfo = (data) => {
    return request({
        url: '/user/update',
        method: 'post',
        data
    });
};
/** 获取邮箱修改次数信息 */
export const getEmailChangeInfo = () => {
    return request({
        url: '/user/email/change-info',
        method: 'get'
    });
};
/** 发送修改邮箱的验证码（发到新邮箱） */
export const sendChangeEmailCode = (data) => {
    return request({
        url: '/user/email/send-code',
        method: 'post',
        data
    });
};
// ==================== 微信公众号扫码登录（已禁用） ====================
/*
 * 已临时禁用 — 原因：微信 OAuth2 回调要求公网 HTTPS 域名
 * 取消下方注释 + 后端配置后启用
 */
// export const getWxGzhQrCode = (): Promise<ApiResponse<any>> => { ... }
// export const pollWxGzhStatus = (sceneId: string): Promise<ApiResponse<any>> => { ... }
// export const refreshWxGzhQrCode = (): Promise<ApiResponse<any>> => { ... }
// export const wxGzhCallback = (code: string, state: string): Promise<ApiResponse<any>> => { ... }
// export const sendWxEmailCode = (data: any): Promise<ApiResponse<any>> => { ... }
// export const bindWxEmail = (data: any): Promise<ApiResponse<any>> => { ... }
// ==================== 其他 ====================
export const getPatientContacts = () => {
    return request({
        url: '/patient/list',
        method: 'get'
    });
};
export default request;
