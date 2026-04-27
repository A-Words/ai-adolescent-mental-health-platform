/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed, nextTick, reactive, onUnmounted, watch } from 'vue';
import request from '@/api/user';
import { searchDoctors, sendMessage as apiSendMessage, getMessageHistory, submitComplaint } from '@/api/consultation';
import { submitConsultationFeedback } from '@/api/feedback';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Location, Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
const debounce = (fn, delay = 500) => {
    let timer = null;
    return (...args) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => fn(...args), delay);
    };
};
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = computed(() => user.id);
const router = useRouter();
const uploadHeaders = computed(() => {
    return {
        token: localStorage.getItem('token') || ''
    };
});
const isSearching = ref(false);
const searchQuery = reactive({
    name: '',
    minRating: undefined,
    maxPrice: undefined,
});
const searchResults = ref([]);
const handleSearch = async () => {
    if (!searchQuery.name && !searchQuery.minRating && !searchQuery.maxPrice) {
        isSearching.value = false;
        return;
    }
    isSearching.value = true;
    try {
        const res = await searchDoctors(searchQuery);
        if (res.code === 200) {
            searchResults.value = res.data;
        }
    }
    catch (e) {
        ElMessage.error('搜索失败');
    }
};
const debouncedSearch = debounce(handleSearch, 500);
const myAppointments = ref([]);
const fetchMyAppointments = async () => {
    try {
        const res = await request.get('/consultation/appointments/my');
        if (res.code === 200) {
            myAppointments.value = res.data.records.map((a) => ({
                id: a.id,
                doctorId: a.doctorId,
                doctorName: a.doctorName,
                hospitalName: a.hospitalName !== null ? a.hospitalName : '暂无数据',
                date: a.workDate + (a.workShift === 1 ? ' 上午' : a.workShift === 2 ? ' 下午' : ' 晚班'),
                type: a.type === 1 ? 'online' : 'offline',
                status: a.status,
                payStatus: a.payStatus,
                fee: a.fee,
                hasFeedback: false // Can be enhanced later
            }));
            chatList.value = res.data.records
                .filter((a) => a.type === 1 && [0, 1].includes(a.status))
                .map((a) => ({
                id: a.id,
                appointmentId: a.id,
                doctorName: a.doctorName,
                doctorAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
                lastMessage: '点击查看咨询',
                time: a.workDate,
                messages: []
            }));
        }
    }
    catch (e) { }
};
const cancelAppointment = async (row) => {
    try {
        const res = await request.post(`/consultation/appointment/${row.id}/cancel`);
        if (res.code === 200) {
            ElMessage.success(res.data || '取消成功');
            fetchMyAppointments();
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error('操作失败');
    }
};
const payAppointment = async (row) => {
    try {
        const res = await request.post(`/consultation/appointment/${row.id}/pay`);
        if (res.code === 200) {
            ElMessage.success('支付成功');
            fetchMyAppointments();
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error('支付失败');
    }
};
const activeTab = ref('offline');
watch(activeTab, (val) => {
    if (val === 'history' || val === 'online') {
        fetchMyAppointments();
    }
});
const step = ref(1);
const hospitals = ref([]);
const departments = ref([]);
const doctors = ref([]);
const chatList = ref([]);
const currentChat = ref(null);
const chatInput = ref('');
const messageBox = ref(null);
let sse = null;
// Removed mock myAppointments
const detailVisible = ref(false);
const appointmentDetail = ref(null);
const handleViewDetail = async (row) => {
    try {
        const res = await request.get(`/consultation/appointment/${row.id}/detail`);
        if (res.code === 200) {
            appointmentDetail.value = res.data;
            detailVisible.value = true;
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error('获取详情失败');
    }
};
const formatWorkDate = (detail) => {
    if (!detail.workDate)
        return '';
    const shift = detail.workShift === 1 ? ' 上午' : detail.workShift === 2 ? ' 下午' : ' 晚班';
    return detail.workDate + shift;
};
const formatTime = (time) => {
    return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '';
};
const consultationFeedbackVisible = ref(false);
const cfForm = reactive({ appointmentId: undefined, doctorId: undefined, rating: 5, content: '' });
const openFeedbackDialog = (row) => {
    cfForm.appointmentId = row.id;
    cfForm.doctorId = row.doctorId;
    cfForm.rating = 5;
    cfForm.content = '';
    consultationFeedbackVisible.value = true;
};
const submitConsultationFeedbackForm = async () => {
    if (!cfForm.content) {
        ElMessage.warning('请输入反馈内容');
        return;
    }
    const res = await submitConsultationFeedback(cfForm);
    if (res.code === 200) {
        ElMessage.success('评价成功');
        consultationFeedbackVisible.value = false;
        // Update local status
        const item = myAppointments.value.find(i => i.id === cfForm.appointmentId);
        if (item)
            item.hasFeedback = true;
    }
    else {
        ElMessage.error(res.message || '评价失败');
    }
};
const complaintVisible = ref(false);
const complaintForm = reactive({
    appointmentId: undefined,
    content: '',
    proofImages: []
});
const openComplaintDialog = (row) => {
    complaintForm.appointmentId = row.id;
    complaintForm.content = '';
    complaintForm.proofImages = [];
    complaintVisible.value = true;
};
const handleUploadSuccess = (res) => {
    if (res.code === 200) {
        complaintForm.proofImages.push(res.data);
    }
};
const handleRemove = (file) => {
    const url = file.response?.data;
    if (url) {
        const index = complaintForm.proofImages.indexOf(url);
        if (index > -1) {
            complaintForm.proofImages.splice(index, 1);
        }
    }
};
const submitComplaintForm = async () => {
    if (!complaintForm.content) {
        ElMessage.warning('请填写投诉内容');
        return;
    }
    if (!complaintForm.appointmentId) {
        ElMessage.warning('预约ID不存在');
        return;
    }
    try {
        const res = await submitComplaint({
            appointmentId: complaintForm.appointmentId,
            content: complaintForm.content,
            proofImages: complaintForm.proofImages
        });
        if (res.code === 200) {
            ElMessage.success('投诉提交成功，请等待审核');
            complaintVisible.value = false;
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error('提交失败');
    }
};
const startNewConsultation = () => {
    activeTab.value = 'offline';
    step.value = 1;
};
const openChat = async (chat) => {
    currentChat.value = chat;
    try {
        const res = await getMessageHistory(chat.appointmentId);
        if (res.code === 200) {
            currentChat.value.messages = res.data.map((m) => ({
                id: m.id,
                content: m.content,
                type: m.type === 0 ? 'text' : m.type === 1 ? 'image' : m.type === 2 ? 'assessment' : 'prescription',
                isSelf: m.senderId === userId.value
            }));
            scrollToBottom();
            setupSse(chat.appointmentId);
        }
    }
    catch (e) {
        ElMessage.error('获取聊天历史失败');
    }
};
const setupSse = (appointmentId) => {
    if (sse) {
        sse.close();
    }
    const token = localStorage.getItem('token') || '';
    sse = new EventSource(`/api/consultation/message/stream/${appointmentId}?token=${encodeURIComponent(token)}`);
    sse.onmessage = (e) => {
        try {
            const m = JSON.parse(e.data);
            if (m.senderId === userId.value)
                return;
            currentChat.value?.messages.push({
                id: m.id,
                content: m.content,
                type: m.type === 0 ? 'text' : 'image',
                isSelf: false
            });
            scrollToBottom();
        }
        catch { }
    };
};
const sendMessage = async () => {
    if (!chatInput.value)
        return;
    try {
        const res = await apiSendMessage({
            appointmentId: currentChat.value.appointmentId,
            content: chatInput.value,
            type: 0 // Text
        });
        if (res.code === 200) {
            currentChat.value.messages.push({
                id: Date.now(),
                type: 'text',
                content: chatInput.value,
                isSelf: true
            });
            chatInput.value = '';
            scrollToBottom();
        }
    }
    catch (e) {
        ElMessage.error('发送失败');
    }
};
const takeAssessment = (id) => {
    router.push(`/assessment/${id}`);
};
const scrollToBottom = () => {
    nextTick(() => {
        if (messageBox.value) {
            messageBox.value.scrollTop = messageBox.value.scrollHeight;
        }
    });
};
const selectedHospital = ref(null);
const selectedDepartment = ref(null);
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const bookingVisible = ref(false);
const currentDoctor = ref(null);
const bookingLoading = ref(false);
const loadingDoctors = ref(false);
const next7Days = computed(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = dayjs().add(i, 'day');
        days.push({
            value: d.format('YYYY-MM-DD'),
            label: i === 0 ? '今天' : i === 1 ? '明天' : d.format('dddd'), // You might need locale config for 'dddd' to be Chinese
            dateStr: d.format('MM-DD')
        });
    }
    return days;
});
const fetchHospitals = async () => {
    try {
        const res = await request.get('/common/hospitals');
        if (res.code === 200) {
            hospitals.value = res.data;
        }
    }
    catch (e) { }
};
const selectHospital = async (h) => {
    selectedHospital.value = h;
    step.value = 2;
    // Fetch departments
    try {
        const res = await request.get('/common/departments', { params: { hospitalId: h.id } });
        if (res.code === 200) {
            departments.value = res.data;
        }
    }
    catch (e) { }
};
const selectDepartment = (d) => {
    selectedDepartment.value = d;
    step.value = 3;
    fetchAvailableDoctors();
};
const fetchAvailableDoctors = async () => {
    if (!selectedDepartment.value)
        return;
    loadingDoctors.value = true;
    try {
        // Need to implement this endpoint in ConsultationController
        const res = await request.get('/consultation/doctors/available', {
            params: {
                departmentId: selectedDepartment.value.id,
                date: selectedDate.value
            }
        });
        if (res.code === 200) {
            doctors.value = res.data;
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        loadingDoctors.value = false;
    }
};
const description = ref('');
const bookingType = ref(0);
const currentAppointmentId = ref('');
const payLoading = ref(false);
const selectedPatientId = ref(null);
const patients = ref([]);
const fetchPatients = async () => {
    try {
        const res = await request.get('/patient/list');
        if (res.code === 200) {
            patients.value = res.data;
            if (patients.value.length === 0) {
                ElMessageBox.confirm('您还没有添加就诊人信息，请先前往病历管理添加就诊人。', '提示', {
                    confirmButtonText: '前往添加',
                    cancelButtonText: '取消',
                    type: 'info'
                }).then(() => {
                    router.push('/patient-records');
                });
            }
        }
    }
    catch (e) { }
};
const handleBook = (doc) => {
    currentDoctor.value = doc;
    fetchPatients();
    bookingVisible.value = true;
};
const confirmBooking = () => {
    bookingVisible.value = false;
    step.value = 4;
};
const submitBooking = async () => {
    if (!selectedPatientId.value) {
        ElMessage.warning('请选择就诊人');
        return;
    }
    if (!description.value) {
        ElMessage.warning('请填写病情描述');
        return;
    }
    bookingLoading.value = true;
    try {
        // Need scheduleId. 
        // Logic: Fetch schedules for doctor/date, pick first available. 
        // ideally user picks specific time slot if supported, but let's stick to "Day/Shift" -> Schedule
        const schedRes = await request.get('/consultation/schedules', {
            params: {
                doctorId: currentDoctor.value.id,
                startDate: selectedDate.value,
                endDate: selectedDate.value
            }
        });
        if (schedRes.code === 200 && schedRes.data.length > 0) {
            const schedule = schedRes.data[0];
            const res = await request.post('/consultation/appointment', {
                scheduleId: schedule.id,
                patientContactId: selectedPatientId.value,
                description: description.value,
                type: bookingType.value
            });
            if (res.code === 200) {
                ElMessage.success('预约成功，请前往支付');
                currentAppointmentId.value = res.data; // Backend returns ID string
                step.value = 5;
            }
            else {
                ElMessage.error(res.message);
            }
        }
        else {
            ElMessage.error('该医生今日已无号源');
        }
    }
    catch (e) {
        console.error(e);
        ElMessage.error('预约失败');
    }
    finally {
        bookingLoading.value = false;
    }
};
const handlePayment = async () => {
    payLoading.value = true;
    try {
        const res = await request.post(`/consultation/appointment/${currentAppointmentId.value}/pay`);
        if (res.code === 200) {
            ElMessage.success('支付成功');
            // Redirect to My Appointments or Success Page
            // For now, reload or reset
            step.value = 1;
            activeTab.value = 'history'; // Switch to history tab (My Appointments)
            // Ideally trigger refresh of history
            // But 'history' tab uses myAppointments mock in original code, need to update it to fetch real data
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error('支付失败');
    }
    finally {
        payLoading.value = false;
    }
};
const goToMyAppointments = () => {
    activeTab.value = 'history';
    // refresh logic needed
};
onMounted(() => {
    fetchHospitals();
    fetchMyAppointments();
});
onUnmounted(() => {
    if (sse)
        sse.close();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-card']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-link']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pager']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['hospital-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hospital-info']} */ ;
/** @type {__VLS_StyleScopedClasses['doc-info']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['message-row']} */ ;
/** @type {__VLS_StyleScopedClasses['self']} */ ;
/** @type {__VLS_StyleScopedClasses['text-msg']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-search-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select__placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select__clear']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dept-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dept-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--default']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dept-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dept-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['date-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['date-num']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['date-num']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table__cell']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--warning']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--success']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-textarea__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "consultation-container" },
});
/** @type {__VLS_StyleScopedClasses['consultation-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "consultation-tabs" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "consultation-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['consultation-tabs']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "找医生/预约挂号",
    name: "offline",
}));
const __VLS_8 = __VLS_7({
    label: "找医生/预约挂号",
    name: "offline",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
if (__VLS_ctx.step === 1) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-container" },
    });
    /** @type {__VLS_StyleScopedClasses['step-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "search-filter cosmic-toolbar" },
    });
    /** @type {__VLS_StyleScopedClasses['search-filter']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filter-options cosmic-filter-row" },
    });
    /** @type {__VLS_StyleScopedClasses['filter-options']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-filter-row']} */ ;
    let __VLS_12;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.searchQuery.minRating),
        placeholder: "评分",
        clearable: true,
        popperClass: "cosmic-select-dropdown",
        ...{ class: "cosmic-select" },
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.searchQuery.minRating),
        placeholder: "评分",
        clearable: true,
        popperClass: "cosmic-select-dropdown",
        ...{ class: "cosmic-select" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_17;
    const __VLS_18 = ({ change: {} },
        { onChange: (__VLS_ctx.handleSearch) });
    /** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
    const { default: __VLS_19 } = __VLS_15.slots;
    let __VLS_20;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        label: "不限",
        value: (undefined),
    }));
    const __VLS_22 = __VLS_21({
        label: "不限",
        value: (undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        label: "4.5分以上",
        value: (4.5),
    }));
    const __VLS_27 = __VLS_26({
        label: "4.5分以上",
        value: (4.5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        label: "4.0分以上",
        value: (4.0),
    }));
    const __VLS_32 = __VLS_31({
        label: "4.0分以上",
        value: (4.0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    // @ts-ignore
    [activeTab, step, searchQuery, handleSearch,];
    var __VLS_15;
    var __VLS_16;
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.searchQuery.maxPrice),
        placeholder: "价格",
        clearable: true,
        popperClass: "cosmic-select-dropdown",
        ...{ class: "cosmic-select" },
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.searchQuery.maxPrice),
        placeholder: "价格",
        clearable: true,
        popperClass: "cosmic-select-dropdown",
        ...{ class: "cosmic-select" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_40;
    const __VLS_41 = ({ change: {} },
        { onChange: (__VLS_ctx.handleSearch) });
    /** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
    const { default: __VLS_42 } = __VLS_38.slots;
    let __VLS_43;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        label: "不限",
        value: (undefined),
    }));
    const __VLS_45 = __VLS_44({
        label: "不限",
        value: (undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_48;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        label: "50元以下",
        value: (50),
    }));
    const __VLS_50 = __VLS_49({
        label: "50元以下",
        value: (50),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_53;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        label: "100元以下",
        value: (100),
    }));
    const __VLS_55 = __VLS_54({
        label: "100元以下",
        value: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    let __VLS_58;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        label: "200元以下",
        value: (200),
    }));
    const __VLS_60 = __VLS_59({
        label: "200元以下",
        value: (200),
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    // @ts-ignore
    [searchQuery, handleSearch,];
    var __VLS_38;
    var __VLS_39;
    let __VLS_63;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.searchQuery.name),
        placeholder: "按医生姓名搜索...",
        ...{ class: "search-input cosmic-search-input" },
        clearable: true,
    }));
    const __VLS_65 = __VLS_64({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.searchQuery.name),
        placeholder: "按医生姓名搜索...",
        ...{ class: "search-input cosmic-search-input" },
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    let __VLS_68;
    const __VLS_69 = ({ input: {} },
        { onInput: (__VLS_ctx.debouncedSearch) });
    /** @type {__VLS_StyleScopedClasses['search-input']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-search-input']} */ ;
    const { default: __VLS_70 } = __VLS_66.slots;
    {
        const { append: __VLS_71 } = __VLS_66.slots;
        let __VLS_72;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
            ...{ 'onClick': {} },
            ...{ class: "cosmic-search-btn" },
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onClick': {} },
            ...{ class: "cosmic-search-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_77;
        const __VLS_78 = ({ click: {} },
            { onClick: (__VLS_ctx.handleSearch) });
        /** @type {__VLS_StyleScopedClasses['cosmic-search-btn']} */ ;
        const { default: __VLS_79 } = __VLS_75.slots;
        // @ts-ignore
        [searchQuery, handleSearch, debouncedSearch,];
        var __VLS_75;
        var __VLS_76;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_66;
    var __VLS_67;
    if (__VLS_ctx.isSearching) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "doctor-list" },
        });
        /** @type {__VLS_StyleScopedClasses['doctor-list']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        let __VLS_80;
        /** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
        elRow;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            gutter: (20),
        }));
        const __VLS_82 = __VLS_81({
            gutter: (20),
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        const { default: __VLS_85 } = __VLS_83.slots;
        for (const [doc] of __VLS_vFor((__VLS_ctx.searchResults))) {
            let __VLS_86;
            /** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
            elCol;
            // @ts-ignore
            const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
                span: (24),
                key: (doc.id),
            }));
            const __VLS_88 = __VLS_87({
                span: (24),
                key: (doc.id),
            }, ...__VLS_functionalComponentArgsRest(__VLS_87));
            const { default: __VLS_91 } = __VLS_89.slots;
            let __VLS_92;
            /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
            elCard;
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
                shadow: "hover",
                ...{ class: "doctor-item-card" },
            }));
            const __VLS_94 = __VLS_93({
                shadow: "hover",
                ...{ class: "doctor-item-card" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_93));
            /** @type {__VLS_StyleScopedClasses['doctor-item-card']} */ ;
            const { default: __VLS_97 } = __VLS_95.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "doctor-item" },
            });
            /** @type {__VLS_StyleScopedClasses['doctor-item']} */ ;
            let __VLS_98;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
                size: (64),
                src: (doc.headPath || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'),
            }));
            const __VLS_100 = __VLS_99({
                size: (64),
                src: (doc.headPath || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_99));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "doc-info" },
            });
            /** @type {__VLS_StyleScopedClasses['doc-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            (doc.realName);
            let __VLS_103;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
                size: "small",
            }));
            const __VLS_105 = __VLS_104({
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_104));
            const { default: __VLS_108 } = __VLS_106.slots;
            (doc.title);
            // @ts-ignore
            [isSearching, searchResults,];
            var __VLS_106;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (doc.specialty);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "hospital" },
            });
            /** @type {__VLS_StyleScopedClasses['hospital']} */ ;
            (doc.hospitalName);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "rating" },
            });
            /** @type {__VLS_StyleScopedClasses['rating']} */ ;
            let __VLS_109;
            /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
            elRate;
            // @ts-ignore
            const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
                modelValue: (doc.ratingScore),
                disabled: true,
                showScore: true,
                textColor: "#ff9900",
            }));
            const __VLS_111 = __VLS_110({
                modelValue: (doc.ratingScore),
                disabled: true,
                showScore: true,
                textColor: "#ff9900",
            }, ...__VLS_functionalComponentArgsRest(__VLS_110));
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "price" },
            });
            /** @type {__VLS_StyleScopedClasses['price']} */ ;
            (doc.consultationPrice);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "doc-action" },
            });
            /** @type {__VLS_StyleScopedClasses['doc-action']} */ ;
            let __VLS_114;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_116 = __VLS_115({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_115));
            let __VLS_119;
            const __VLS_120 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.step === 1))
                            return;
                        if (!(__VLS_ctx.isSearching))
                            return;
                        __VLS_ctx.handleBook(doc);
                        // @ts-ignore
                        [handleBook,];
                    } });
            const { default: __VLS_121 } = __VLS_117.slots;
            // @ts-ignore
            [];
            var __VLS_117;
            var __VLS_118;
            // @ts-ignore
            [];
            var __VLS_95;
            // @ts-ignore
            [];
            var __VLS_89;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_83;
        if (!__VLS_ctx.searchResults.length) {
            let __VLS_122;
            /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
            elEmpty;
            // @ts-ignore
            const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
                description: "未搜索到匹配医生",
            }));
            const __VLS_124 = __VLS_123({
                description: "未搜索到匹配医生",
            }, ...__VLS_functionalComponentArgsRest(__VLS_123));
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        let __VLS_127;
        /** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
        elRow;
        // @ts-ignore
        const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
            gutter: (20),
        }));
        const __VLS_129 = __VLS_128({
            gutter: (20),
        }, ...__VLS_functionalComponentArgsRest(__VLS_128));
        const { default: __VLS_132 } = __VLS_130.slots;
        for (const [h] of __VLS_vFor((__VLS_ctx.hospitals))) {
            let __VLS_133;
            /** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
            elCol;
            // @ts-ignore
            const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
                span: (6),
                key: (h.id),
            }));
            const __VLS_135 = __VLS_134({
                span: (6),
                key: (h.id),
            }, ...__VLS_functionalComponentArgsRest(__VLS_134));
            const { default: __VLS_138 } = __VLS_136.slots;
            let __VLS_139;
            /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
            elCard;
            // @ts-ignore
            const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
                ...{ 'onClick': {} },
                shadow: "hover",
                ...{ class: "hospital-card" },
            }));
            const __VLS_141 = __VLS_140({
                ...{ 'onClick': {} },
                shadow: "hover",
                ...{ class: "hospital-card" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_140));
            let __VLS_144;
            const __VLS_145 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.step === 1))
                            return;
                        if (!!(__VLS_ctx.isSearching))
                            return;
                        __VLS_ctx.selectHospital(h);
                        // @ts-ignore
                        [searchResults, hospitals, selectHospital,];
                    } });
            /** @type {__VLS_StyleScopedClasses['hospital-card']} */ ;
            const { default: __VLS_146 } = __VLS_142.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: (h.picture || 'https://via.placeholder.com/300x200?text=Hospital'),
                ...{ class: "hospital-img" },
            });
            /** @type {__VLS_StyleScopedClasses['hospital-img']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "hospital-info" },
            });
            /** @type {__VLS_StyleScopedClasses['hospital-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            (h.name);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "address" },
            });
            /** @type {__VLS_StyleScopedClasses['address']} */ ;
            let __VLS_147;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({}));
            const __VLS_149 = __VLS_148({}, ...__VLS_functionalComponentArgsRest(__VLS_148));
            const { default: __VLS_152 } = __VLS_150.slots;
            let __VLS_153;
            /** @ts-ignore @type {typeof __VLS_components.Location} */
            Location;
            // @ts-ignore
            const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({}));
            const __VLS_155 = __VLS_154({}, ...__VLS_functionalComponentArgsRest(__VLS_154));
            // @ts-ignore
            [];
            var __VLS_150;
            (h.address || '暂无地址');
            // @ts-ignore
            [];
            var __VLS_142;
            var __VLS_143;
            // @ts-ignore
            [];
            var __VLS_136;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_130;
    }
}
if (__VLS_ctx.step === 2) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-container cosmic-step" },
    });
    /** @type {__VLS_StyleScopedClasses['step-container']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-step']} */ ;
    let __VLS_158;
    /** @ts-ignore @type {typeof __VLS_components.elPageHeader | typeof __VLS_components.ElPageHeader} */
    elPageHeader;
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
        ...{ 'onBack': {} },
        ...{ class: "cosmic-page-header" },
        content: "选择科室",
    }));
    const __VLS_160 = __VLS_159({
        ...{ 'onBack': {} },
        ...{ class: "cosmic-page-header" },
        content: "选择科室",
    }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    let __VLS_163;
    const __VLS_164 = ({ back: {} },
        { onBack: (...[$event]) => {
                if (!(__VLS_ctx.step === 2))
                    return;
                __VLS_ctx.step = 1;
                // @ts-ignore
                [step, step,];
            } });
    /** @type {__VLS_StyleScopedClasses['cosmic-page-header']} */ ;
    var __VLS_161;
    var __VLS_162;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dept-list" },
    });
    /** @type {__VLS_StyleScopedClasses['dept-list']} */ ;
    for (const [d] of __VLS_vFor((__VLS_ctx.departments))) {
        let __VLS_165;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165({
            ...{ 'onClick': {} },
            key: (d.id),
            ...{ class: "dept-btn cosmic-dept-btn" },
            type: (__VLS_ctx.selectedDepartment?.id === d.id ? 'primary' : 'default'),
        }));
        const __VLS_167 = __VLS_166({
            ...{ 'onClick': {} },
            key: (d.id),
            ...{ class: "dept-btn cosmic-dept-btn" },
            type: (__VLS_ctx.selectedDepartment?.id === d.id ? 'primary' : 'default'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_166));
        let __VLS_170;
        const __VLS_171 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.step === 2))
                        return;
                    __VLS_ctx.selectDepartment(d);
                    // @ts-ignore
                    [departments, selectedDepartment, selectDepartment,];
                } });
        /** @type {__VLS_StyleScopedClasses['dept-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-dept-btn']} */ ;
        const { default: __VLS_172 } = __VLS_168.slots;
        (d.name);
        // @ts-ignore
        [];
        var __VLS_168;
        var __VLS_169;
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.departments.length) {
        let __VLS_173;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
            description: "该医院暂无科室信息",
        }));
        const __VLS_175 = __VLS_174({
            description: "该医院暂无科室信息",
        }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    }
}
if (__VLS_ctx.step === 3) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-container cosmic-step" },
    });
    /** @type {__VLS_StyleScopedClasses['step-container']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-step']} */ ;
    let __VLS_178;
    /** @ts-ignore @type {typeof __VLS_components.elPageHeader | typeof __VLS_components.ElPageHeader} */
    elPageHeader;
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent1(__VLS_178, new __VLS_178({
        ...{ 'onBack': {} },
        ...{ class: "cosmic-page-header" },
        content: (`${__VLS_ctx.selectedHospital?.name} - ${__VLS_ctx.selectedDepartment?.name}`),
    }));
    const __VLS_180 = __VLS_179({
        ...{ 'onBack': {} },
        ...{ class: "cosmic-page-header" },
        content: (`${__VLS_ctx.selectedHospital?.name} - ${__VLS_ctx.selectedDepartment?.name}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    let __VLS_183;
    const __VLS_184 = ({ back: {} },
        { onBack: (...[$event]) => {
                if (!(__VLS_ctx.step === 3))
                    return;
                __VLS_ctx.step = 2;
                // @ts-ignore
                [step, step, departments, selectedDepartment, selectedHospital,];
            } });
    /** @type {__VLS_StyleScopedClasses['cosmic-page-header']} */ ;
    var __VLS_181;
    var __VLS_182;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "date-selector cosmic-date-selector" },
    });
    /** @type {__VLS_StyleScopedClasses['date-selector']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-date-selector']} */ ;
    let __VLS_185;
    /** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
    elRadioGroup;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.selectedDate),
        ...{ class: "cosmic-date-group" },
    }));
    const __VLS_187 = __VLS_186({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.selectedDate),
        ...{ class: "cosmic-date-group" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    let __VLS_190;
    const __VLS_191 = ({ change: {} },
        { onChange: (__VLS_ctx.fetchAvailableDoctors) });
    /** @type {__VLS_StyleScopedClasses['cosmic-date-group']} */ ;
    const { default: __VLS_192 } = __VLS_188.slots;
    for (const [date] of __VLS_vFor((__VLS_ctx.next7Days))) {
        let __VLS_193;
        /** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
        elRadioButton;
        // @ts-ignore
        const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({
            key: (date.value),
            label: (date.value),
        }));
        const __VLS_195 = __VLS_194({
            key: (date.value),
            label: (date.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_194));
        const { default: __VLS_198 } = __VLS_196.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "date-cell" },
        });
        /** @type {__VLS_StyleScopedClasses['date-cell']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (date.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "date-num" },
        });
        /** @type {__VLS_StyleScopedClasses['date-num']} */ ;
        (date.dateStr);
        // @ts-ignore
        [selectedDate, fetchAvailableDoctors, next7Days,];
        var __VLS_196;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_188;
    var __VLS_189;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "doctor-list" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingDoctors) }, null, null);
    /** @type {__VLS_StyleScopedClasses['doctor-list']} */ ;
    if (!__VLS_ctx.doctors.length) {
        let __VLS_199;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_200 = __VLS_asFunctionalComponent1(__VLS_199, new __VLS_199({
            description: "该日期暂无医生排班",
        }));
        const __VLS_201 = __VLS_200({
            description: "该日期暂无医生排班",
        }, ...__VLS_functionalComponentArgsRest(__VLS_200));
    }
    else {
        let __VLS_204;
        /** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
        elRow;
        // @ts-ignore
        const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
            gutter: (20),
        }));
        const __VLS_206 = __VLS_205({
            gutter: (20),
        }, ...__VLS_functionalComponentArgsRest(__VLS_205));
        const { default: __VLS_209 } = __VLS_207.slots;
        for (const [doc] of __VLS_vFor((__VLS_ctx.doctors))) {
            let __VLS_210;
            /** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
            elCol;
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
                span: (24),
                key: (doc.id),
            }));
            const __VLS_212 = __VLS_211({
                span: (24),
                key: (doc.id),
            }, ...__VLS_functionalComponentArgsRest(__VLS_211));
            const { default: __VLS_215 } = __VLS_213.slots;
            let __VLS_216;
            /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
            elCard;
            // @ts-ignore
            const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
                shadow: "hover",
                ...{ class: "doctor-item-card" },
            }));
            const __VLS_218 = __VLS_217({
                shadow: "hover",
                ...{ class: "doctor-item-card" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_217));
            /** @type {__VLS_StyleScopedClasses['doctor-item-card']} */ ;
            const { default: __VLS_221 } = __VLS_219.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "doctor-item" },
            });
            /** @type {__VLS_StyleScopedClasses['doctor-item']} */ ;
            let __VLS_222;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
                size: (64),
                src: (doc.headPath || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'),
            }));
            const __VLS_224 = __VLS_223({
                size: (64),
                src: (doc.headPath || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_223));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "doc-info" },
            });
            /** @type {__VLS_StyleScopedClasses['doc-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            (doc.realName);
            let __VLS_227;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
                size: "small",
            }));
            const __VLS_229 = __VLS_228({
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_228));
            const { default: __VLS_232 } = __VLS_230.slots;
            (doc.title);
            // @ts-ignore
            [vLoading, loadingDoctors, doctors, doctors,];
            var __VLS_230;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (doc.specialty);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "price" },
            });
            /** @type {__VLS_StyleScopedClasses['price']} */ ;
            (doc.consultationPrice);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "doc-action" },
            });
            /** @type {__VLS_StyleScopedClasses['doc-action']} */ ;
            let __VLS_233;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_235 = __VLS_234({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_234));
            let __VLS_238;
            const __VLS_239 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.step === 3))
                            return;
                        if (!!(!__VLS_ctx.doctors.length))
                            return;
                        __VLS_ctx.handleBook(doc);
                        // @ts-ignore
                        [handleBook,];
                    } });
            const { default: __VLS_240 } = __VLS_236.slots;
            // @ts-ignore
            [];
            var __VLS_236;
            var __VLS_237;
            // @ts-ignore
            [];
            var __VLS_219;
            // @ts-ignore
            [];
            var __VLS_213;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_207;
    }
}
if (__VLS_ctx.step === 4) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-container" },
    });
    /** @type {__VLS_StyleScopedClasses['step-container']} */ ;
    let __VLS_241;
    /** @ts-ignore @type {typeof __VLS_components.elPageHeader | typeof __VLS_components.ElPageHeader} */
    elPageHeader;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent1(__VLS_241, new __VLS_241({
        ...{ 'onBack': {} },
        content: "填写病情描述",
    }));
    const __VLS_243 = __VLS_242({
        ...{ 'onBack': {} },
        content: "填写病情描述",
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    let __VLS_246;
    const __VLS_247 = ({ back: {} },
        { onBack: (...[$event]) => {
                if (!(__VLS_ctx.step === 4))
                    return;
                __VLS_ctx.step = 3;
                // @ts-ignore
                [step, step,];
            } });
    var __VLS_244;
    var __VLS_245;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-container" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['form-container']} */ ;
    let __VLS_248;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent1(__VLS_248, new __VLS_248({
        labelWidth: "100px",
    }));
    const __VLS_250 = __VLS_249({
        labelWidth: "100px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    const { default: __VLS_253 } = __VLS_251.slots;
    let __VLS_254;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_255 = __VLS_asFunctionalComponent1(__VLS_254, new __VLS_254({
        label: "病情描述",
    }));
    const __VLS_256 = __VLS_255({
        label: "病情描述",
    }, ...__VLS_functionalComponentArgsRest(__VLS_255));
    const { default: __VLS_259 } = __VLS_257.slots;
    let __VLS_260;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260({
        modelValue: (__VLS_ctx.description),
        type: "textarea",
        rows: (5),
        placeholder: "请详细描述您的症状、持续时间、既往病史等，以便医生更好地为您服务。",
    }));
    const __VLS_262 = __VLS_261({
        modelValue: (__VLS_ctx.description),
        type: "textarea",
        rows: (5),
        placeholder: "请详细描述您的症状、持续时间、既往病史等，以便医生更好地为您服务。",
    }, ...__VLS_functionalComponentArgsRest(__VLS_261));
    // @ts-ignore
    [description,];
    var __VLS_257;
    let __VLS_265;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_266 = __VLS_asFunctionalComponent1(__VLS_265, new __VLS_265({}));
    const __VLS_267 = __VLS_266({}, ...__VLS_functionalComponentArgsRest(__VLS_266));
    const { default: __VLS_270 } = __VLS_268.slots;
    let __VLS_271;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_272 = __VLS_asFunctionalComponent1(__VLS_271, new __VLS_271({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_273 = __VLS_272({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_272));
    let __VLS_276;
    const __VLS_277 = ({ click: {} },
        { onClick: (__VLS_ctx.submitBooking) });
    const { default: __VLS_278 } = __VLS_274.slots;
    // @ts-ignore
    [submitBooking,];
    var __VLS_274;
    var __VLS_275;
    // @ts-ignore
    [];
    var __VLS_268;
    // @ts-ignore
    [];
    var __VLS_251;
}
if (__VLS_ctx.step === 5) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-container" },
    });
    /** @type {__VLS_StyleScopedClasses['step-container']} */ ;
    let __VLS_279;
    /** @ts-ignore @type {typeof __VLS_components.elResult | typeof __VLS_components.ElResult | typeof __VLS_components.elResult | typeof __VLS_components.ElResult} */
    elResult;
    // @ts-ignore
    const __VLS_280 = __VLS_asFunctionalComponent1(__VLS_279, new __VLS_279({
        icon: "success",
        title: "预约提交成功",
        subTitle: "请支付挂号费以完成预约",
    }));
    const __VLS_281 = __VLS_280({
        icon: "success",
        title: "预约提交成功",
        subTitle: "请支付挂号费以完成预约",
    }, ...__VLS_functionalComponentArgsRest(__VLS_280));
    const { default: __VLS_284 } = __VLS_282.slots;
    {
        const { extra: __VLS_285 } = __VLS_282.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ style: {} },
        });
        (__VLS_ctx.currentDoctor?.consultationPrice);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ style: {} },
        });
        let __VLS_286;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_287 = __VLS_asFunctionalComponent1(__VLS_286, new __VLS_286({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.payLoading),
        }));
        const __VLS_288 = __VLS_287({
            ...{ 'onClick': {} },
            type: "primary",
            loading: (__VLS_ctx.payLoading),
        }, ...__VLS_functionalComponentArgsRest(__VLS_287));
        let __VLS_291;
        const __VLS_292 = ({ click: {} },
            { onClick: (__VLS_ctx.handlePayment) });
        const { default: __VLS_293 } = __VLS_289.slots;
        // @ts-ignore
        [step, currentDoctor, payLoading, handlePayment,];
        var __VLS_289;
        var __VLS_290;
        let __VLS_294;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_295 = __VLS_asFunctionalComponent1(__VLS_294, new __VLS_294({
            ...{ 'onClick': {} },
        }));
        const __VLS_296 = __VLS_295({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_295));
        let __VLS_299;
        const __VLS_300 = ({ click: {} },
            { onClick: (__VLS_ctx.goToMyAppointments) });
        const { default: __VLS_301 } = __VLS_297.slots;
        // @ts-ignore
        [goToMyAppointments,];
        var __VLS_297;
        var __VLS_298;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_282;
}
// @ts-ignore
[];
var __VLS_9;
let __VLS_302;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_303 = __VLS_asFunctionalComponent1(__VLS_302, new __VLS_302({
    label: "线上医生咨询",
    name: "online",
}));
const __VLS_304 = __VLS_303({
    label: "线上医生咨询",
    name: "online",
}, ...__VLS_functionalComponentArgsRest(__VLS_303));
const { default: __VLS_307 } = __VLS_305.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-container" },
});
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
if (!__VLS_ctx.currentChat) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-list" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-list']} */ ;
    if (__VLS_ctx.chatList.length === 0) {
        let __VLS_308;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_309 = __VLS_asFunctionalComponent1(__VLS_308, new __VLS_308({
            description: "暂无咨询会话",
        }));
        const __VLS_310 = __VLS_309({
            description: "暂无咨询会话",
        }, ...__VLS_functionalComponentArgsRest(__VLS_309));
        const { default: __VLS_313 } = __VLS_311.slots;
        let __VLS_314;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_315 = __VLS_asFunctionalComponent1(__VLS_314, new __VLS_314({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_316 = __VLS_315({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_315));
        let __VLS_319;
        const __VLS_320 = ({ click: {} },
            { onClick: (__VLS_ctx.startNewConsultation) });
        const { default: __VLS_321 } = __VLS_317.slots;
        // @ts-ignore
        [currentChat, chatList, startNewConsultation,];
        var __VLS_317;
        var __VLS_318;
        // @ts-ignore
        [];
        var __VLS_311;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        for (const [chat] of __VLS_vFor((__VLS_ctx.chatList))) {
            let __VLS_322;
            /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
            elCard;
            // @ts-ignore
            const __VLS_323 = __VLS_asFunctionalComponent1(__VLS_322, new __VLS_322({
                ...{ 'onClick': {} },
                key: (chat.id),
                ...{ class: "chat-item" },
            }));
            const __VLS_324 = __VLS_323({
                ...{ 'onClick': {} },
                key: (chat.id),
                ...{ class: "chat-item" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_323));
            let __VLS_327;
            const __VLS_328 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.currentChat))
                            return;
                        if (!!(__VLS_ctx.chatList.length === 0))
                            return;
                        __VLS_ctx.openChat(chat);
                        // @ts-ignore
                        [chatList, openChat,];
                    } });
            /** @type {__VLS_StyleScopedClasses['chat-item']} */ ;
            const { default: __VLS_329 } = __VLS_325.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "chat-summary" },
            });
            /** @type {__VLS_StyleScopedClasses['chat-summary']} */ ;
            let __VLS_330;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_331 = __VLS_asFunctionalComponent1(__VLS_330, new __VLS_330({
                src: (chat.doctorAvatar),
            }));
            const __VLS_332 = __VLS_331({
                src: (chat.doctorAvatar),
            }, ...__VLS_functionalComponentArgsRest(__VLS_331));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "info" },
            });
            /** @type {__VLS_StyleScopedClasses['info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            (chat.doctorName);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (chat.lastMessage);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "time" },
            });
            /** @type {__VLS_StyleScopedClasses['time']} */ ;
            (chat.time);
            // @ts-ignore
            [];
            var __VLS_325;
            var __VLS_326;
            // @ts-ignore
            [];
        }
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-room" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-room']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-header" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
    let __VLS_335;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_336 = __VLS_asFunctionalComponent1(__VLS_335, new __VLS_335({
        ...{ 'onClick': {} },
        icon: "ArrowLeft",
        circle: true,
    }));
    const __VLS_337 = __VLS_336({
        ...{ 'onClick': {} },
        icon: "ArrowLeft",
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_336));
    let __VLS_340;
    const __VLS_341 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.currentChat))
                    return;
                __VLS_ctx.currentChat = null;
                // @ts-ignore
                [currentChat,];
            } });
    var __VLS_338;
    var __VLS_339;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.currentChat.doctorName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "messages" },
        ref: "messageBox",
    });
    /** @type {__VLS_StyleScopedClasses['messages']} */ ;
    for (const [msg] of __VLS_vFor((__VLS_ctx.currentChat.messages))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (msg.id),
            ...{ class: "message-row" },
            ...{ class: ({ 'self': msg.isSelf }) },
        });
        /** @type {__VLS_StyleScopedClasses['message-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['self']} */ ;
        if (!msg.isSelf) {
            let __VLS_342;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_343 = __VLS_asFunctionalComponent1(__VLS_342, new __VLS_342({
                src: (__VLS_ctx.currentChat.doctorAvatar),
            }));
            const __VLS_344 = __VLS_343({
                src: (__VLS_ctx.currentChat.doctorAvatar),
            }, ...__VLS_functionalComponentArgsRest(__VLS_343));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "message-content" },
        });
        /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
        if (msg.type === 'text') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "text-msg" },
            });
            /** @type {__VLS_StyleScopedClasses['text-msg']} */ ;
            (msg.content);
        }
        if (msg.type === 'image') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "image-msg" },
            });
            /** @type {__VLS_StyleScopedClasses['image-msg']} */ ;
            let __VLS_347;
            /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
            elImage;
            // @ts-ignore
            const __VLS_348 = __VLS_asFunctionalComponent1(__VLS_347, new __VLS_347({
                src: (msg.content),
                previewSrcList: ([msg.content]),
                ...{ style: {} },
            }));
            const __VLS_349 = __VLS_348({
                src: (msg.content),
                previewSrcList: ([msg.content]),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_348));
        }
        if (msg.type === 'assessment') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "assessment-card" },
            });
            /** @type {__VLS_StyleScopedClasses['assessment-card']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            (msg.content.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (msg.content.desc);
            let __VLS_352;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_353 = __VLS_asFunctionalComponent1(__VLS_352, new __VLS_352({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_354 = __VLS_353({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_353));
            let __VLS_357;
            const __VLS_358 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.currentChat))
                            return;
                        if (!(msg.type === 'assessment'))
                            return;
                        __VLS_ctx.takeAssessment(msg.content.id);
                        // @ts-ignore
                        [currentChat, currentChat, currentChat, takeAssessment,];
                    } });
            const { default: __VLS_359 } = __VLS_355.slots;
            // @ts-ignore
            [];
            var __VLS_355;
            var __VLS_356;
        }
        if (msg.isSelf) {
            let __VLS_360;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_361 = __VLS_asFunctionalComponent1(__VLS_360, new __VLS_360({
                src: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
            }));
            const __VLS_362 = __VLS_361({
                src: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
            }, ...__VLS_functionalComponentArgsRest(__VLS_361));
        }
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-area" },
    });
    /** @type {__VLS_StyleScopedClasses['input-area']} */ ;
    let __VLS_365;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_366 = __VLS_asFunctionalComponent1(__VLS_365, new __VLS_365({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.chatInput),
        placeholder: "请输入消息...",
    }));
    const __VLS_367 = __VLS_366({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.chatInput),
        placeholder: "请输入消息...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_366));
    let __VLS_370;
    const __VLS_371 = ({ keyup: {} },
        { onKeyup: (__VLS_ctx.sendMessage) });
    var __VLS_368;
    var __VLS_369;
    let __VLS_372;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_373 = __VLS_asFunctionalComponent1(__VLS_372, new __VLS_372({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_374 = __VLS_373({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_373));
    let __VLS_377;
    const __VLS_378 = ({ click: {} },
        { onClick: (__VLS_ctx.sendMessage) });
    const { default: __VLS_379 } = __VLS_375.slots;
    // @ts-ignore
    [chatInput, sendMessage, sendMessage,];
    var __VLS_375;
    var __VLS_376;
}
// @ts-ignore
[];
var __VLS_305;
let __VLS_380;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_381 = __VLS_asFunctionalComponent1(__VLS_380, new __VLS_380({
    label: "我的咨询/预约",
    name: "history",
}));
const __VLS_382 = __VLS_381({
    label: "我的咨询/预约",
    name: "history",
}, ...__VLS_functionalComponentArgsRest(__VLS_381));
const { default: __VLS_385 } = __VLS_383.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "history-list cosmic-history-panel" },
});
/** @type {__VLS_StyleScopedClasses['history-list']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-history-panel']} */ ;
let __VLS_386;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_387 = __VLS_asFunctionalComponent1(__VLS_386, new __VLS_386({
    data: (__VLS_ctx.myAppointments),
    ...{ class: "cosmic-appointments-table" },
    ...{ style: {} },
}));
const __VLS_388 = __VLS_387({
    data: (__VLS_ctx.myAppointments),
    ...{ class: "cosmic-appointments-table" },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_387));
/** @type {__VLS_StyleScopedClasses['cosmic-appointments-table']} */ ;
const { default: __VLS_391 } = __VLS_389.slots;
let __VLS_392;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_393 = __VLS_asFunctionalComponent1(__VLS_392, new __VLS_392({
    prop: "doctorName",
    label: "医生",
}));
const __VLS_394 = __VLS_393({
    prop: "doctorName",
    label: "医生",
}, ...__VLS_functionalComponentArgsRest(__VLS_393));
let __VLS_397;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_398 = __VLS_asFunctionalComponent1(__VLS_397, new __VLS_397({
    prop: "hospitalName",
    label: "医院",
}));
const __VLS_399 = __VLS_398({
    prop: "hospitalName",
    label: "医院",
}, ...__VLS_functionalComponentArgsRest(__VLS_398));
let __VLS_402;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_403 = __VLS_asFunctionalComponent1(__VLS_402, new __VLS_402({
    prop: "date",
    label: "时间",
}));
const __VLS_404 = __VLS_403({
    prop: "date",
    label: "时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_403));
let __VLS_407;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_408 = __VLS_asFunctionalComponent1(__VLS_407, new __VLS_407({
    prop: "type",
    label: "类型",
}));
const __VLS_409 = __VLS_408({
    prop: "type",
    label: "类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_408));
const { default: __VLS_412 } = __VLS_410.slots;
{
    const { default: __VLS_413 } = __VLS_410.slots;
    const [scope] = __VLS_vSlot(__VLS_413);
    (scope.row.type === 'offline' ? '线下挂号' : '线上咨询');
    // @ts-ignore
    [myAppointments,];
}
// @ts-ignore
[];
var __VLS_410;
let __VLS_414;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_415 = __VLS_asFunctionalComponent1(__VLS_414, new __VLS_414({
    prop: "status",
    label: "状态",
}));
const __VLS_416 = __VLS_415({
    prop: "status",
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_415));
const { default: __VLS_419 } = __VLS_417.slots;
{
    const { default: __VLS_420 } = __VLS_417.slots;
    const [scope] = __VLS_vSlot(__VLS_420);
    if (scope.row.status === 4) {
        let __VLS_421;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_422 = __VLS_asFunctionalComponent1(__VLS_421, new __VLS_421({
            type: "warning",
        }));
        const __VLS_423 = __VLS_422({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_422));
        const { default: __VLS_426 } = __VLS_424.slots;
        // @ts-ignore
        [];
        var __VLS_424;
    }
    else if (scope.row.status === 0) {
        let __VLS_427;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_428 = __VLS_asFunctionalComponent1(__VLS_427, new __VLS_427({
            type: "primary",
        }));
        const __VLS_429 = __VLS_428({
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_428));
        const { default: __VLS_432 } = __VLS_430.slots;
        // @ts-ignore
        [];
        var __VLS_430;
    }
    else if (scope.row.status === 1) {
        let __VLS_433;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_434 = __VLS_asFunctionalComponent1(__VLS_433, new __VLS_433({
            type: "success",
        }));
        const __VLS_435 = __VLS_434({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_434));
        const { default: __VLS_438 } = __VLS_436.slots;
        // @ts-ignore
        [];
        var __VLS_436;
    }
    else if (scope.row.status === 2) {
        let __VLS_439;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_440 = __VLS_asFunctionalComponent1(__VLS_439, new __VLS_439({
            type: "info",
        }));
        const __VLS_441 = __VLS_440({
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_440));
        const { default: __VLS_444 } = __VLS_442.slots;
        // @ts-ignore
        [];
        var __VLS_442;
    }
    else {
        let __VLS_445;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_446 = __VLS_asFunctionalComponent1(__VLS_445, new __VLS_445({
            type: "danger",
        }));
        const __VLS_447 = __VLS_446({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_446));
        const { default: __VLS_450 } = __VLS_448.slots;
        // @ts-ignore
        [];
        var __VLS_448;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_417;
let __VLS_451;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_452 = __VLS_asFunctionalComponent1(__VLS_451, new __VLS_451({
    label: "操作",
    width: "250",
}));
const __VLS_453 = __VLS_452({
    label: "操作",
    width: "250",
}, ...__VLS_functionalComponentArgsRest(__VLS_452));
const { default: __VLS_456 } = __VLS_454.slots;
{
    const { default: __VLS_457 } = __VLS_454.slots;
    const [scope] = __VLS_vSlot(__VLS_457);
    let __VLS_458;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_459 = __VLS_asFunctionalComponent1(__VLS_458, new __VLS_458({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_460 = __VLS_459({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_459));
    let __VLS_463;
    const __VLS_464 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleViewDetail(scope.row);
                // @ts-ignore
                [handleViewDetail,];
            } });
    const { default: __VLS_465 } = __VLS_461.slots;
    // @ts-ignore
    [];
    var __VLS_461;
    var __VLS_462;
    if (scope.row.status === 4) {
        let __VLS_466;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_467 = __VLS_asFunctionalComponent1(__VLS_466, new __VLS_466({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }));
        const __VLS_468 = __VLS_467({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_467));
        let __VLS_471;
        const __VLS_472 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 4))
                        return;
                    __VLS_ctx.payAppointment(scope.row);
                    // @ts-ignore
                    [payAppointment,];
                } });
        const { default: __VLS_473 } = __VLS_469.slots;
        // @ts-ignore
        [];
        var __VLS_469;
        var __VLS_470;
    }
    if (scope.row.status === 4 || scope.row.status === 0) {
        let __VLS_474;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_475 = __VLS_asFunctionalComponent1(__VLS_474, new __VLS_474({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_476 = __VLS_475({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_475));
        let __VLS_479;
        const __VLS_480 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 4 || scope.row.status === 0))
                        return;
                    __VLS_ctx.cancelAppointment(scope.row);
                    // @ts-ignore
                    [cancelAppointment,];
                } });
        const { default: __VLS_481 } = __VLS_477.slots;
        (scope.row.status === 0 ? '退号/退费' : '取消预约');
        // @ts-ignore
        [];
        var __VLS_477;
        var __VLS_478;
    }
    if (scope.row.status === 1 && !scope.row.hasFeedback) {
        let __VLS_482;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_483 = __VLS_asFunctionalComponent1(__VLS_482, new __VLS_482({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_484 = __VLS_483({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_483));
        let __VLS_487;
        const __VLS_488 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 1 && !scope.row.hasFeedback))
                        return;
                    __VLS_ctx.openFeedbackDialog(scope.row);
                    // @ts-ignore
                    [openFeedbackDialog,];
                } });
        const { default: __VLS_489 } = __VLS_485.slots;
        // @ts-ignore
        [];
        var __VLS_485;
        var __VLS_486;
    }
    else if (scope.row.hasFeedback) {
        let __VLS_490;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_491 = __VLS_asFunctionalComponent1(__VLS_490, new __VLS_490({
            type: "info",
        }));
        const __VLS_492 = __VLS_491({
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_491));
        const { default: __VLS_495 } = __VLS_493.slots;
        // @ts-ignore
        [];
        var __VLS_493;
    }
    if (scope.row.status === 1 || scope.row.status === 3) {
        let __VLS_496;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_497 = __VLS_asFunctionalComponent1(__VLS_496, new __VLS_496({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }));
        const __VLS_498 = __VLS_497({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_497));
        let __VLS_501;
        const __VLS_502 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 1 || scope.row.status === 3))
                        return;
                    __VLS_ctx.openComplaintDialog(scope.row);
                    // @ts-ignore
                    [openComplaintDialog,];
                } });
        const { default: __VLS_503 } = __VLS_499.slots;
        // @ts-ignore
        [];
        var __VLS_499;
        var __VLS_500;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_454;
// @ts-ignore
[];
var __VLS_389;
// @ts-ignore
[];
var __VLS_383;
// @ts-ignore
[];
var __VLS_3;
let __VLS_504;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_505 = __VLS_asFunctionalComponent1(__VLS_504, new __VLS_504({
    modelValue: (__VLS_ctx.detailVisible),
    title: "预约详情",
    width: "600px",
    ...{ class: "cosmic-dialog" },
}));
const __VLS_506 = __VLS_505({
    modelValue: (__VLS_ctx.detailVisible),
    title: "预约详情",
    width: "600px",
    ...{ class: "cosmic-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_505));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
const { default: __VLS_509 } = __VLS_507.slots;
if (__VLS_ctx.appointmentDetail) {
    let __VLS_510;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_511 = __VLS_asFunctionalComponent1(__VLS_510, new __VLS_510({
        column: (1),
        border: true,
    }));
    const __VLS_512 = __VLS_511({
        column: (1),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_511));
    const { default: __VLS_515 } = __VLS_513.slots;
    let __VLS_516;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_517 = __VLS_asFunctionalComponent1(__VLS_516, new __VLS_516({
        label: "医院",
    }));
    const __VLS_518 = __VLS_517({
        label: "医院",
    }, ...__VLS_functionalComponentArgsRest(__VLS_517));
    const { default: __VLS_521 } = __VLS_519.slots;
    (__VLS_ctx.appointmentDetail.hospitalName);
    // @ts-ignore
    [detailVisible, appointmentDetail, appointmentDetail,];
    var __VLS_519;
    let __VLS_522;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_523 = __VLS_asFunctionalComponent1(__VLS_522, new __VLS_522({
        label: "地址",
    }));
    const __VLS_524 = __VLS_523({
        label: "地址",
    }, ...__VLS_functionalComponentArgsRest(__VLS_523));
    const { default: __VLS_527 } = __VLS_525.slots;
    (__VLS_ctx.appointmentDetail.hospitalAddress || '暂无');
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_525;
    let __VLS_528;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_529 = __VLS_asFunctionalComponent1(__VLS_528, new __VLS_528({
        label: "医生",
    }));
    const __VLS_530 = __VLS_529({
        label: "医生",
    }, ...__VLS_functionalComponentArgsRest(__VLS_529));
    const { default: __VLS_533 } = __VLS_531.slots;
    (__VLS_ctx.appointmentDetail.doctorName);
    (__VLS_ctx.appointmentDetail.doctorTitle || '医生');
    // @ts-ignore
    [appointmentDetail, appointmentDetail,];
    var __VLS_531;
    let __VLS_534;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_535 = __VLS_asFunctionalComponent1(__VLS_534, new __VLS_534({
        label: "就诊时间",
    }));
    const __VLS_536 = __VLS_535({
        label: "就诊时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_535));
    const { default: __VLS_539 } = __VLS_537.slots;
    (__VLS_ctx.formatWorkDate(__VLS_ctx.appointmentDetail));
    // @ts-ignore
    [appointmentDetail, formatWorkDate,];
    var __VLS_537;
    let __VLS_540;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_541 = __VLS_asFunctionalComponent1(__VLS_540, new __VLS_540({
        label: "状态",
    }));
    const __VLS_542 = __VLS_541({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_541));
    const { default: __VLS_545 } = __VLS_543.slots;
    if (__VLS_ctx.appointmentDetail.status === 4) {
        let __VLS_546;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_547 = __VLS_asFunctionalComponent1(__VLS_546, new __VLS_546({
            type: "warning",
        }));
        const __VLS_548 = __VLS_547({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_547));
        const { default: __VLS_551 } = __VLS_549.slots;
        // @ts-ignore
        [appointmentDetail,];
        var __VLS_549;
    }
    else if (__VLS_ctx.appointmentDetail.status === 0) {
        let __VLS_552;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_553 = __VLS_asFunctionalComponent1(__VLS_552, new __VLS_552({
            type: "primary",
        }));
        const __VLS_554 = __VLS_553({
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_553));
        const { default: __VLS_557 } = __VLS_555.slots;
        // @ts-ignore
        [appointmentDetail,];
        var __VLS_555;
    }
    else if (__VLS_ctx.appointmentDetail.status === 1) {
        let __VLS_558;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_559 = __VLS_asFunctionalComponent1(__VLS_558, new __VLS_558({
            type: "success",
        }));
        const __VLS_560 = __VLS_559({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_559));
        const { default: __VLS_563 } = __VLS_561.slots;
        // @ts-ignore
        [appointmentDetail,];
        var __VLS_561;
    }
    else if (__VLS_ctx.appointmentDetail.status === 2) {
        let __VLS_564;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_565 = __VLS_asFunctionalComponent1(__VLS_564, new __VLS_564({
            type: "info",
        }));
        const __VLS_566 = __VLS_565({
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_565));
        const { default: __VLS_569 } = __VLS_567.slots;
        // @ts-ignore
        [appointmentDetail,];
        var __VLS_567;
    }
    else {
        let __VLS_570;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_571 = __VLS_asFunctionalComponent1(__VLS_570, new __VLS_570({
            type: "danger",
        }));
        const __VLS_572 = __VLS_571({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_571));
        const { default: __VLS_575 } = __VLS_573.slots;
        // @ts-ignore
        [];
        var __VLS_573;
    }
    // @ts-ignore
    [];
    var __VLS_543;
    let __VLS_576;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_577 = __VLS_asFunctionalComponent1(__VLS_576, new __VLS_576({
        label: "挂号费",
    }));
    const __VLS_578 = __VLS_577({
        label: "挂号费",
    }, ...__VLS_functionalComponentArgsRest(__VLS_577));
    const { default: __VLS_581 } = __VLS_579.slots;
    (__VLS_ctx.appointmentDetail.fee);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_579;
    if (__VLS_ctx.appointmentDetail.payTime) {
        let __VLS_582;
        /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
        elDescriptionsItem;
        // @ts-ignore
        const __VLS_583 = __VLS_asFunctionalComponent1(__VLS_582, new __VLS_582({
            label: "支付时间",
        }));
        const __VLS_584 = __VLS_583({
            label: "支付时间",
        }, ...__VLS_functionalComponentArgsRest(__VLS_583));
        const { default: __VLS_587 } = __VLS_585.slots;
        (__VLS_ctx.formatTime(__VLS_ctx.appointmentDetail.payTime));
        // @ts-ignore
        [appointmentDetail, appointmentDetail, formatTime,];
        var __VLS_585;
    }
    let __VLS_588;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_589 = __VLS_asFunctionalComponent1(__VLS_588, new __VLS_588({
        label: "病情描述",
    }));
    const __VLS_590 = __VLS_589({
        label: "病情描述",
    }, ...__VLS_functionalComponentArgsRest(__VLS_589));
    const { default: __VLS_593 } = __VLS_591.slots;
    (__VLS_ctx.appointmentDetail.description);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_591;
    if (__VLS_ctx.appointmentDetail.feedbackContent) {
        let __VLS_594;
        /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
        elDescriptionsItem;
        // @ts-ignore
        const __VLS_595 = __VLS_asFunctionalComponent1(__VLS_594, new __VLS_594({
            label: "我的评价",
        }));
        const __VLS_596 = __VLS_595({
            label: "我的评价",
        }, ...__VLS_functionalComponentArgsRest(__VLS_595));
        const { default: __VLS_599 } = __VLS_597.slots;
        let __VLS_600;
        /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
        elRate;
        // @ts-ignore
        const __VLS_601 = __VLS_asFunctionalComponent1(__VLS_600, new __VLS_600({
            modelValue: (__VLS_ctx.appointmentDetail.feedbackRating),
            disabled: true,
            showScore: true,
            textColor: "#ff9900",
        }));
        const __VLS_602 = __VLS_601({
            modelValue: (__VLS_ctx.appointmentDetail.feedbackRating),
            disabled: true,
            showScore: true,
            textColor: "#ff9900",
        }, ...__VLS_functionalComponentArgsRest(__VLS_601));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ style: {} },
        });
        (__VLS_ctx.appointmentDetail.feedbackContent);
        if (__VLS_ctx.appointmentDetail.feedbackReply) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ style: {} },
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ style: {} },
            });
            (__VLS_ctx.appointmentDetail.feedbackReply);
        }
        // @ts-ignore
        [appointmentDetail, appointmentDetail, appointmentDetail, appointmentDetail, appointmentDetail,];
        var __VLS_597;
    }
    // @ts-ignore
    [];
    var __VLS_513;
}
{
    const { footer: __VLS_605 } = __VLS_507.slots;
    let __VLS_606;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_607 = __VLS_asFunctionalComponent1(__VLS_606, new __VLS_606({
        ...{ 'onClick': {} },
    }));
    const __VLS_608 = __VLS_607({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_607));
    let __VLS_611;
    const __VLS_612 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
                // @ts-ignore
                [detailVisible,];
            } });
    const { default: __VLS_613 } = __VLS_609.slots;
    // @ts-ignore
    [];
    var __VLS_609;
    var __VLS_610;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_507;
let __VLS_614;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_615 = __VLS_asFunctionalComponent1(__VLS_614, new __VLS_614({
    modelValue: (__VLS_ctx.bookingVisible),
    title: "确认预约信息",
    width: "450px",
    ...{ class: "cosmic-dialog" },
}));
const __VLS_616 = __VLS_615({
    modelValue: (__VLS_ctx.bookingVisible),
    title: "确认预约信息",
    width: "450px",
    ...{ class: "cosmic-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_615));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
const { default: __VLS_619 } = __VLS_617.slots;
let __VLS_620;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_621 = __VLS_asFunctionalComponent1(__VLS_620, new __VLS_620({
    labelWidth: "80px",
}));
const __VLS_622 = __VLS_621({
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_621));
const { default: __VLS_625 } = __VLS_623.slots;
let __VLS_626;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_627 = __VLS_asFunctionalComponent1(__VLS_626, new __VLS_626({
    label: "医生",
}));
const __VLS_628 = __VLS_627({
    label: "医生",
}, ...__VLS_functionalComponentArgsRest(__VLS_627));
const { default: __VLS_631 } = __VLS_629.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.currentDoctor?.realName);
(__VLS_ctx.currentDoctor?.title);
// @ts-ignore
[currentDoctor, currentDoctor, bookingVisible,];
var __VLS_629;
let __VLS_632;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_633 = __VLS_asFunctionalComponent1(__VLS_632, new __VLS_632({
    label: "就诊人",
    required: true,
}));
const __VLS_634 = __VLS_633({
    label: "就诊人",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_633));
const { default: __VLS_637 } = __VLS_635.slots;
let __VLS_638;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_639 = __VLS_asFunctionalComponent1(__VLS_638, new __VLS_638({
    modelValue: (__VLS_ctx.selectedPatientId),
    placeholder: "请选择就诊人",
    ...{ style: {} },
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}));
const __VLS_640 = __VLS_639({
    modelValue: (__VLS_ctx.selectedPatientId),
    placeholder: "请选择就诊人",
    ...{ style: {} },
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}, ...__VLS_functionalComponentArgsRest(__VLS_639));
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
const { default: __VLS_643 } = __VLS_641.slots;
for (const [p] of __VLS_vFor((__VLS_ctx.patients))) {
    let __VLS_644;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_645 = __VLS_asFunctionalComponent1(__VLS_644, new __VLS_644({
        key: (p.id),
        label: (p.name),
        value: (p.id),
    }));
    const __VLS_646 = __VLS_645({
        key: (p.id),
        label: (p.name),
        value: (p.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_645));
    // @ts-ignore
    [selectedPatientId, patients,];
}
// @ts-ignore
[];
var __VLS_641;
let __VLS_649;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_650 = __VLS_asFunctionalComponent1(__VLS_649, new __VLS_649({
    ...{ 'onClick': {} },
    type: "primary",
    underline: "never",
    ...{ style: {} },
}));
const __VLS_651 = __VLS_650({
    ...{ 'onClick': {} },
    type: "primary",
    underline: "never",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_650));
let __VLS_654;
const __VLS_655 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.router.push('/patient-records');
            // @ts-ignore
            [router,];
        } });
const { default: __VLS_656 } = __VLS_652.slots;
// @ts-ignore
[];
var __VLS_652;
var __VLS_653;
// @ts-ignore
[];
var __VLS_635;
let __VLS_657;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_658 = __VLS_asFunctionalComponent1(__VLS_657, new __VLS_657({
    label: "日期",
}));
const __VLS_659 = __VLS_658({
    label: "日期",
}, ...__VLS_functionalComponentArgsRest(__VLS_658));
const { default: __VLS_662 } = __VLS_660.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.selectedDate);
// @ts-ignore
[selectedDate,];
var __VLS_660;
let __VLS_663;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_664 = __VLS_asFunctionalComponent1(__VLS_663, new __VLS_663({
    label: "病情描述",
    required: true,
}));
const __VLS_665 = __VLS_664({
    label: "病情描述",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_664));
const { default: __VLS_668 } = __VLS_666.slots;
let __VLS_669;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_670 = __VLS_asFunctionalComponent1(__VLS_669, new __VLS_669({
    type: "textarea",
    modelValue: (__VLS_ctx.description),
    rows: (3),
    placeholder: "请简单描述您的症状...",
}));
const __VLS_671 = __VLS_670({
    type: "textarea",
    modelValue: (__VLS_ctx.description),
    rows: (3),
    placeholder: "请简单描述您的症状...",
}, ...__VLS_functionalComponentArgsRest(__VLS_670));
// @ts-ignore
[description,];
var __VLS_666;
let __VLS_674;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_675 = __VLS_asFunctionalComponent1(__VLS_674, new __VLS_674({
    label: "预约类型",
    required: true,
}));
const __VLS_676 = __VLS_675({
    label: "预约类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_675));
const { default: __VLS_679 } = __VLS_677.slots;
let __VLS_680;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_681 = __VLS_asFunctionalComponent1(__VLS_680, new __VLS_680({
    modelValue: (__VLS_ctx.bookingType),
}));
const __VLS_682 = __VLS_681({
    modelValue: (__VLS_ctx.bookingType),
}, ...__VLS_functionalComponentArgsRest(__VLS_681));
const { default: __VLS_685 } = __VLS_683.slots;
let __VLS_686;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_687 = __VLS_asFunctionalComponent1(__VLS_686, new __VLS_686({
    label: (0),
}));
const __VLS_688 = __VLS_687({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_687));
const { default: __VLS_691 } = __VLS_689.slots;
// @ts-ignore
[bookingType,];
var __VLS_689;
let __VLS_692;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_693 = __VLS_asFunctionalComponent1(__VLS_692, new __VLS_692({
    label: (1),
    disabled: (__VLS_ctx.currentDoctor?.isOnlineConsultEnabled === 0),
}));
const __VLS_694 = __VLS_693({
    label: (1),
    disabled: (__VLS_ctx.currentDoctor?.isOnlineConsultEnabled === 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_693));
const { default: __VLS_697 } = __VLS_695.slots;
// @ts-ignore
[currentDoctor,];
var __VLS_695;
// @ts-ignore
[];
var __VLS_683;
// @ts-ignore
[];
var __VLS_677;
// @ts-ignore
[];
var __VLS_623;
{
    const { footer: __VLS_698 } = __VLS_617.slots;
    let __VLS_699;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_700 = __VLS_asFunctionalComponent1(__VLS_699, new __VLS_699({
        ...{ 'onClick': {} },
    }));
    const __VLS_701 = __VLS_700({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_700));
    let __VLS_704;
    const __VLS_705 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.bookingVisible = false;
                // @ts-ignore
                [bookingVisible,];
            } });
    const { default: __VLS_706 } = __VLS_702.slots;
    // @ts-ignore
    [];
    var __VLS_702;
    var __VLS_703;
    let __VLS_707;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_708 = __VLS_asFunctionalComponent1(__VLS_707, new __VLS_707({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_709 = __VLS_708({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_708));
    let __VLS_712;
    const __VLS_713 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmBooking) });
    const { default: __VLS_714 } = __VLS_710.slots;
    // @ts-ignore
    [confirmBooking,];
    var __VLS_710;
    var __VLS_711;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_617;
let __VLS_715;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_716 = __VLS_asFunctionalComponent1(__VLS_715, new __VLS_715({
    modelValue: (__VLS_ctx.consultationFeedbackVisible),
    title: "咨询反馈",
    width: "500px",
    ...{ class: "cosmic-dialog" },
}));
const __VLS_717 = __VLS_716({
    modelValue: (__VLS_ctx.consultationFeedbackVisible),
    title: "咨询反馈",
    width: "500px",
    ...{ class: "cosmic-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_716));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
const { default: __VLS_720 } = __VLS_718.slots;
let __VLS_721;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_722 = __VLS_asFunctionalComponent1(__VLS_721, new __VLS_721({
    model: (__VLS_ctx.cfForm),
}));
const __VLS_723 = __VLS_722({
    model: (__VLS_ctx.cfForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_722));
const { default: __VLS_726 } = __VLS_724.slots;
let __VLS_727;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_728 = __VLS_asFunctionalComponent1(__VLS_727, new __VLS_727({
    label: "评分",
}));
const __VLS_729 = __VLS_728({
    label: "评分",
}, ...__VLS_functionalComponentArgsRest(__VLS_728));
const { default: __VLS_732 } = __VLS_730.slots;
let __VLS_733;
/** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate | typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
elRate;
// @ts-ignore
const __VLS_734 = __VLS_asFunctionalComponent1(__VLS_733, new __VLS_733({
    modelValue: (__VLS_ctx.cfForm.rating),
}));
const __VLS_735 = __VLS_734({
    modelValue: (__VLS_ctx.cfForm.rating),
}, ...__VLS_functionalComponentArgsRest(__VLS_734));
// @ts-ignore
[consultationFeedbackVisible, cfForm, cfForm,];
var __VLS_730;
let __VLS_738;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_739 = __VLS_asFunctionalComponent1(__VLS_738, new __VLS_738({
    label: "反馈内容",
}));
const __VLS_740 = __VLS_739({
    label: "反馈内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_739));
const { default: __VLS_743 } = __VLS_741.slots;
let __VLS_744;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_745 = __VLS_asFunctionalComponent1(__VLS_744, new __VLS_744({
    type: "textarea",
    modelValue: (__VLS_ctx.cfForm.content),
    rows: (4),
    placeholder: "请评价医生的服务...",
}));
const __VLS_746 = __VLS_745({
    type: "textarea",
    modelValue: (__VLS_ctx.cfForm.content),
    rows: (4),
    placeholder: "请评价医生的服务...",
}, ...__VLS_functionalComponentArgsRest(__VLS_745));
// @ts-ignore
[cfForm,];
var __VLS_741;
// @ts-ignore
[];
var __VLS_724;
{
    const { footer: __VLS_749 } = __VLS_718.slots;
    let __VLS_750;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_751 = __VLS_asFunctionalComponent1(__VLS_750, new __VLS_750({
        ...{ 'onClick': {} },
    }));
    const __VLS_752 = __VLS_751({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_751));
    let __VLS_755;
    const __VLS_756 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.consultationFeedbackVisible = false;
                // @ts-ignore
                [consultationFeedbackVisible,];
            } });
    const { default: __VLS_757 } = __VLS_753.slots;
    // @ts-ignore
    [];
    var __VLS_753;
    var __VLS_754;
    let __VLS_758;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_759 = __VLS_asFunctionalComponent1(__VLS_758, new __VLS_758({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_760 = __VLS_759({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_759));
    let __VLS_763;
    const __VLS_764 = ({ click: {} },
        { onClick: (__VLS_ctx.submitConsultationFeedbackForm) });
    const { default: __VLS_765 } = __VLS_761.slots;
    // @ts-ignore
    [submitConsultationFeedbackForm,];
    var __VLS_761;
    var __VLS_762;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_718;
let __VLS_766;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_767 = __VLS_asFunctionalComponent1(__VLS_766, new __VLS_766({
    modelValue: (__VLS_ctx.complaintVisible),
    title: "投诉医生",
    width: "500px",
    ...{ class: "cosmic-dialog" },
}));
const __VLS_768 = __VLS_767({
    modelValue: (__VLS_ctx.complaintVisible),
    title: "投诉医生",
    width: "500px",
    ...{ class: "cosmic-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_767));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
const { default: __VLS_771 } = __VLS_769.slots;
let __VLS_772;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_773 = __VLS_asFunctionalComponent1(__VLS_772, new __VLS_772({
    model: (__VLS_ctx.complaintForm),
    labelWidth: "80px",
}));
const __VLS_774 = __VLS_773({
    model: (__VLS_ctx.complaintForm),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_773));
const { default: __VLS_777 } = __VLS_775.slots;
let __VLS_778;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_779 = __VLS_asFunctionalComponent1(__VLS_778, new __VLS_778({
    label: "投诉内容",
    required: true,
}));
const __VLS_780 = __VLS_779({
    label: "投诉内容",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_779));
const { default: __VLS_783 } = __VLS_781.slots;
let __VLS_784;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_785 = __VLS_asFunctionalComponent1(__VLS_784, new __VLS_784({
    type: "textarea",
    modelValue: (__VLS_ctx.complaintForm.content),
    rows: (4),
    placeholder: "请详细描述医生在咨询中的不合理行为...",
}));
const __VLS_786 = __VLS_785({
    type: "textarea",
    modelValue: (__VLS_ctx.complaintForm.content),
    rows: (4),
    placeholder: "请详细描述医生在咨询中的不合理行为...",
}, ...__VLS_functionalComponentArgsRest(__VLS_785));
// @ts-ignore
[complaintVisible, complaintForm, complaintForm,];
var __VLS_781;
let __VLS_789;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_790 = __VLS_asFunctionalComponent1(__VLS_789, new __VLS_789({
    label: "上传证明",
}));
const __VLS_791 = __VLS_790({
    label: "上传证明",
}, ...__VLS_functionalComponentArgsRest(__VLS_790));
const { default: __VLS_794 } = __VLS_792.slots;
let __VLS_795;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_796 = __VLS_asFunctionalComponent1(__VLS_795, new __VLS_795({
    action: "/api/common/upload",
    headers: (__VLS_ctx.uploadHeaders),
    listType: "picture-card",
    onSuccess: (__VLS_ctx.handleUploadSuccess),
    onRemove: (__VLS_ctx.handleRemove),
}));
const __VLS_797 = __VLS_796({
    action: "/api/common/upload",
    headers: (__VLS_ctx.uploadHeaders),
    listType: "picture-card",
    onSuccess: (__VLS_ctx.handleUploadSuccess),
    onRemove: (__VLS_ctx.handleRemove),
}, ...__VLS_functionalComponentArgsRest(__VLS_796));
const { default: __VLS_800 } = __VLS_798.slots;
let __VLS_801;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_802 = __VLS_asFunctionalComponent1(__VLS_801, new __VLS_801({}));
const __VLS_803 = __VLS_802({}, ...__VLS_functionalComponentArgsRest(__VLS_802));
const { default: __VLS_806 } = __VLS_804.slots;
let __VLS_807;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_808 = __VLS_asFunctionalComponent1(__VLS_807, new __VLS_807({}));
const __VLS_809 = __VLS_808({}, ...__VLS_functionalComponentArgsRest(__VLS_808));
// @ts-ignore
[uploadHeaders, handleUploadSuccess, handleRemove,];
var __VLS_804;
// @ts-ignore
[];
var __VLS_798;
// @ts-ignore
[];
var __VLS_792;
// @ts-ignore
[];
var __VLS_775;
{
    const { footer: __VLS_812 } = __VLS_769.slots;
    let __VLS_813;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_814 = __VLS_asFunctionalComponent1(__VLS_813, new __VLS_813({
        ...{ 'onClick': {} },
    }));
    const __VLS_815 = __VLS_814({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_814));
    let __VLS_818;
    const __VLS_819 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.complaintVisible = false;
                // @ts-ignore
                [complaintVisible,];
            } });
    const { default: __VLS_820 } = __VLS_816.slots;
    // @ts-ignore
    [];
    var __VLS_816;
    var __VLS_817;
    let __VLS_821;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_822 = __VLS_asFunctionalComponent1(__VLS_821, new __VLS_821({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_823 = __VLS_822({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_822));
    let __VLS_826;
    const __VLS_827 = ({ click: {} },
        { onClick: (__VLS_ctx.submitComplaintForm) });
    const { default: __VLS_828 } = __VLS_824.slots;
    // @ts-ignore
    [submitComplaintForm,];
    var __VLS_824;
    var __VLS_825;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_769;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
