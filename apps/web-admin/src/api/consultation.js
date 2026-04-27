import request from './user';
export const getDoctorAppointments = (params) => {
    return request({
        url: '/consultation/doctor/appointments',
        method: 'get',
        params
    });
};
export const updateAppointmentStatus = (id, status) => {
    return request({
        url: `/consultation/appointment/${id}/status`,
        method: 'put',
        data: { status }
    });
};
// Search doctors with filters
export const searchDoctors = (params) => {
    return request.get('/consultation/doctors/search', { params });
};
// Messages
export const sendMessage = (data) => {
    return request.post('/consultation/message/send', data);
};
export const getMessageHistory = (appointmentId) => {
    return request.get(`/consultation/message/history/${appointmentId}`);
};
// Complaints
export const submitComplaint = (data) => {
    return request.post('/complaint/submit', data);
};
export const auditComplaint = (id, status, auditRemark) => {
    return request.post(`/complaint/audit/${id}`, null, { params: { status, auditRemark } });
};
export const getComplaintList = (params) => {
    return request.get('/complaint/list', { params });
};
// Reschedule/Refund
export const rescheduleAppointment = (id, newScheduleId) => {
    return request.post(`/consultation/appointment/${id}/reschedule`, null, { params: { newScheduleId } });
};
export const refundAppointment = (id) => {
    return request.post(`/consultation/appointment/${id}/refund`);
};
export const restrictDoctor = (doctorId, enabled) => {
    return request.post(`/consultation/admin/doctor/${doctorId}/restrict`, null, { params: { enabled } });
};
export const deleteMeme = (id) => {
    return request.post(`/consultation/admin/meme/${id}/delete`, null);
};
