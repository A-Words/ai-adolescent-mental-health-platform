import request from './user';
export const getMyPatients = (params) => {
    return request({
        url: '/doctor/patients',
        method: 'get',
        params
    });
};
export const completeAppointment = (appointmentId) => {
    return request({
        url: `/consultation/appointment/${appointmentId}/complete`,
        method: 'post'
    });
};
export const markAppointmentMissed = (appointmentId) => {
    return request({
        url: `/consultation/appointment/${appointmentId}/missed`,
        method: 'post'
    });
};
