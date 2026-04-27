import request from './user';
/**
 * 获取超级管理员大屏数据
 */
export const getAdminOverview = () => {
    return request({
        url: '/stats/admin/overview',
        method: 'get'
    });
};
/**
 * 获取医院管理员大屏数据
 */
export const getHospitalOverview = () => {
    return request({
        url: '/stats/hospital/overview',
        method: 'get'
    });
};
/**
 * 获取医生大屏数据
 */
export const getDoctorOverview = () => {
    return request({
        url: '/stats/doctor/overview',
        method: 'get'
    });
};
