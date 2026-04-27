import request from './user';
export const getTemplate = (id) => {
    return request({
        url: `/assessment/template/${id}`,
        method: 'get'
    });
};
export const submitAssessment = (templateId, patientContactId, answers) => {
    return request({
        url: `/assessment/submit/${templateId}`,
        method: 'post',
        data: { patientContactId, answers }
    });
};
export const getPublicTemplates = () => {
    return request({
        url: '/assessment/templates',
        method: 'get'
    });
};
export const getUserRecords = (params) => {
    return request({
        url: '/assessment/records',
        method: 'get',
        params
    });
};
export const getRecordDetail = (id) => {
    return request({
        url: `/assessment/record/${id}`,
        method: 'get'
    });
};
