/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, watch, reactive, computed, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyPatients, markAppointmentMissed as markMissedApi } from '@/api/doctor';
import { rescheduleAppointment, sendMessage as apiSendMessage, getMessageHistory } from '@/api/consultation';
import { getUserRecords } from '@/api/assessment';
import request from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { recognizeMemesBatch, getMemeDetail } from '@/api/meme';
const user = JSON.parse(localStorage.getItem('user') || '{}');
const doctorId = computed(() => user.id);
const router = useRouter();
const activeTab = ref('appointments');
// Appointments
const appointments = ref([]);
const loadingAppt = ref(false);
const statusFilter = ref(0); // Default to Pending Diagnosis
const typeFilter = ref(undefined);
// Chat logic
const activeChats = ref([]);
const currentChat = ref(null);
const messages = ref([]);
const chatInput = ref('');
const messageBox = ref(null);
let sse = null;
const fetchActiveChats = () => {
    // Active chats are appointments with status 0 and type 1
    activeChats.value = appointments.value
        .filter((a) => a.status === 0 && a.type === 1)
        .map((a) => ({
        id: a.id,
        patientName: a.patientName,
        patientAvatar: a.patientAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        lastMessage: '点击开始咨询'
    }));
};
const selectChat = async (chat) => {
    currentChat.value = chat;
    await fetchChatHistory(chat.id);
    await runMemeRecognitionInBatches();
    setupSse(chat.id);
};
const openChat = (row) => {
    activeTab.value = 'chat';
    const chat = {
        id: row.id,
        patientName: row.patientName,
        patientAvatar: row.patientAvatar
    };
    selectChat(chat);
};
const setupSse = (appointmentId) => {
    if (sse) {
        sse.close();
    }
    const token = localStorage.getItem('token') || '';
    sse = new EventSource(`/api/consultation/message/stream/${appointmentId}?token=${encodeURIComponent(token)}`);
    sse.onmessage = async (e) => {
        try {
            const m = JSON.parse(e.data);
            if (m.senderId === doctorId.value)
                return;
            messages.value.push({ id: m.id, content: m.content, type: m.type, isSelf: false });
            if (m.type === 0) {
                try {
                    const res = await recognizeMemesBatch([m.content]);
                    if (res.code === 200 && res.data && res.data[0] && res.data[0].length) {
                        memeMatches.value[m.id] = res.data[0];
                    }
                }
                catch { }
            }
            scrollToBottom();
        }
        catch { }
    };
};
const fetchChatHistory = async (appointmentId) => {
    try {
        const res = await getMessageHistory(appointmentId);
        if (res.code === 200) {
            messages.value = res.data.map((m) => ({
                id: m.id,
                content: m.content,
                type: m.type,
                isSelf: m.senderId === doctorId.value
            }));
            scrollToBottom();
        }
    }
    catch (e) {
        ElMessage.error('获取聊天历史失败');
    }
};
const sendChatMessage = async () => {
    if (!chatInput.value || !currentChat.value)
        return;
    try {
        const res = await apiSendMessage({
            appointmentId: currentChat.value.id,
            content: chatInput.value,
            type: 0 // Text
        });
        if (res.code === 200) {
            messages.value.push({
                id: Date.now(),
                content: chatInput.value,
                type: 0,
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
const handleChatImageUpload = async (res) => {
    if (res.code === 200 && currentChat.value) {
        const imageUrl = res.data;
        try {
            await apiSendMessage({
                appointmentId: currentChat.value.id,
                content: imageUrl,
                type: 1 // Image
            });
            messages.value.push({
                id: Date.now(),
                content: imageUrl,
                type: 1,
                isSelf: true
            });
            scrollToBottom();
        }
        catch (e) {
            ElMessage.error('图片发送失败');
        }
    }
};
const scrollToBottom = () => {
    nextTick(() => {
        if (messageBox.value) {
            messageBox.value.scrollTop = messageBox.value.scrollHeight;
        }
    });
};
const handleReschedule = async (row) => {
    // Reschedule requires picking a new schedule. 
    // For simplicity, let's open a dialog or pick next available.
    // Here we'll just show an example of calling the API if we had the newScheduleId.
    ElMessageBox.prompt('请输入新的排班ID进行改期（实际应从列表选择）', '退回改期', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    }).then(async (action) => {
        const value = action.value;
        if (!value)
            return;
        try {
            const res = await rescheduleAppointment(row.id, parseInt(value));
            if (res.code === 200) {
                ElMessage.success('已成功退回并改期');
                fetchAppointments();
            }
            else {
                ElMessage.error(res.message);
            }
        }
        catch (e) {
            ElMessage.error('改期失败');
        }
    });
};
// Detail view
const detailVisible = ref(false);
const appointmentDetail = ref(null);
// History logic
const historyVisible = ref(false);
const historyRecords = ref([]);
const assessmentRecords = ref([]);
const handleHistory = async (_row) => {
    if (!_row.patientContactId)
        return;
    historyVisible.value = true;
    // 获取历史病历
    try {
        const res = await request.get(`/medical-record/list/${_row.patientContactId}`);
        if (res.code === 200) {
            historyRecords.value = res.data;
        }
    }
    catch (e) {
        ElMessage.error('获取历史病历失败');
    }
    // 获取测评记录
    try {
        const res = await getUserRecords({ patientContactId: _row.patientContactId, size: 50 });
        if (res.code === 200) {
            assessmentRecords.value = res.data.records;
        }
    }
    catch (e) {
        console.error('获取测评记录失败', e);
    }
};
const getStatusText = (status) => {
    const map = { 0: '待就诊', 1: '已完成', 2: '已取消', 3: '爽约', 4: '待支付' };
    return map[status] || '未知';
};
const fetchAppointments = async () => {
    loadingAppt.value = true;
    try {
        const res = await request.get('/consultation/doctor/appointments', {
            params: {
                status: statusFilter.value,
                type: typeFilter.value
            }
        });
        if (res.code === 200) {
            appointments.value = res.data.records;
            fetchActiveChats();
        }
    }
    catch (e) { }
    finally {
        loadingAppt.value = false;
    }
};
// Complete Appointment logic
const completeVisible = ref(false);
const completeLoading = ref(false);
const fileList = ref([]);
const completeForm = reactive({
    id: null,
    symptoms: '',
    department: '',
    hospital: '',
    remarks: '',
    images: []
});
const uploadHeaders = computed(() => {
    return {
        token: localStorage.getItem('token') || ''
    };
});
const memeMatches = ref({});
const escapeHtml = (str) => str.replace(/[&<>"']/g, (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[s]));
const getRenderedText = (msg) => {
    let text = escapeHtml(msg.content || '');
    const matches = memeMatches.value[msg.id] || [];
    for (const m of matches) {
        const safe = m.meme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(safe, 'g');
        text = text.replace(re, `<span class="meme-link" data-id="${m.id}">${escapeHtml(m.meme)}</span>`);
    }
    return text;
};
const handleMemeClick = async (e) => {
    const target = e.target;
    if (target && target.classList.contains('meme-link')) {
        const id = Number(target.getAttribute('data-id'));
        try {
            const res = await getMemeDetail(id);
            if (res.code === 200) {
                const explain = res.data.explain || '暂无解释';
                // 将字面量 \n 转换为真正的换行，然后在每个换行后添加两个全角空格（段首缩进）
                const formattedExplain = explain.replace(/\\n/g, '\n').replace(/\n/g, '<br>    ');
                ElMessageBox.alert(`<div style="white-space: pre-wrap; line-height: 1.8;">  ${formattedExplain}</div>`, res.data.meme || '热梗', {
                    confirmButtonText: '关闭',
                    dangerouslyUseHTMLString: true
                });
            }
        }
        catch { }
    }
};
const runMemeRecognitionInBatches = async () => {
    const texts = messages.value.filter((m) => m.type === 0).map((m) => ({ msg: m, text: m.content }));
    for (let i = 0; i < texts.length; i += 5) {
        const slice = texts.slice(i, i + 5);
        try {
            const res = await recognizeMemesBatch(slice.map(s => s.text));
            if (res.code === 200) {
                const results = res.data;
                slice.forEach((s, idx) => {
                    const matches = results[idx] || [];
                    if (matches && matches.length) {
                        memeMatches.value[s.msg.id] = matches;
                    }
                });
            }
        }
        catch { }
    }
};
const handleComplete = (row) => {
    Object.assign(completeForm, {
        id: row.id,
        symptoms: row.description || '',
        department: '',
        hospital: row.hospitalName || '',
        remarks: '',
        images: []
    });
    fileList.value = [];
    completeVisible.value = true;
};
const handleUploadError = (error) => {
    let message = '上传失败';
    try {
        const response = JSON.parse(error.message);
        message = response.message || message;
    }
    catch (e) {
        if (error.message && error.message.includes('400')) {
            message = '文件上传异常,文件不能超过3MB'; // Fallback if backend JSON is not parsed by axios error
        }
    }
    ElMessage.error(message);
};
const beforeUpload = (file) => {
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
        ElMessage.error('上传头像图片大小不能超过 3MB!');
        return false;
    }
    fileList.value.push(file);
    return false; // Prevent auto upload
};
const handleChange = (uploadFile, uploadFiles) => {
    fileList.value = uploadFiles;
    if (uploadFile.size / 1024 / 1024 > 3) {
        ElMessage.error('上传图片大小不能超过 3MB!');
        const idx = fileList.value.indexOf(uploadFile);
        if (idx > -1)
            fileList.value.splice(idx, 1);
    }
};
const handleRemoveImage = (file) => {
    const index = fileList.value.indexOf(file);
    if (index > -1) {
        fileList.value.splice(index, 1);
    }
};
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'medical-record');
    return request.post('/common/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
const submitComplete = async () => {
    if (!completeForm.symptoms || !completeForm.department) {
        ElMessage.warning('请填写症状和科室');
        return;
    }
    // Upload pending files
    const pendingFiles = fileList.value.filter((f) => f.raw);
    const newImageUrls = [];
    if (pendingFiles.length > 0) {
        const loadingMsg = ElMessage({
            message: '正在上传图片...',
            type: 'info',
            duration: 0
        });
        try {
            for (const file of pendingFiles) {
                const res = await uploadFile(file.raw);
                if (res.code === 200) {
                    newImageUrls.push(res.data);
                }
                else {
                    throw new Error(res.message || '上传失败');
                }
            }
            loadingMsg.close();
        }
        catch (e) {
            loadingMsg.close();
            ElMessage.error(e.message || '图片上传失败');
            return;
        }
    }
    completeForm.images = newImageUrls;
    completeLoading.value = true;
    try {
        const res = await request.post('/consultation/appointment/complete', completeForm);
        if (res.code === 200) {
            ElMessage.success('就诊已完成');
            completeVisible.value = false;
            fetchAppointments();
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error('操作失败');
    }
    finally {
        completeLoading.value = false;
    }
};
const markMissed = async (row) => {
    try {
        await ElMessageBox.confirm('确认标记为爽约吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
        });
        await markMissedApi(row.id);
        ElMessage.success('已标记为爽约');
        fetchAppointments();
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.response?.data?.message || '标记爽约失败');
        }
    }
};
// Patients
const patients = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const fetchPatients = async () => {
    loading.value = true;
    try {
        const res = await getMyPatients({ page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            patients.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        ElMessage.error('加载失败');
    }
    finally {
        loading.value = false;
    }
};
const viewPatient = (id) => {
    router.push(`/doctor/patient/${id}`);
};
watch(activeTab, (val) => {
    if (val === 'appointments')
        fetchAppointments();
    else
        fetchPatients();
});
onMounted(() => {
    fetchAppointments();
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
/** @type {__VLS_StyleScopedClasses['chat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-row']} */ ;
/** @type {__VLS_StyleScopedClasses['self']} */ ;
/** @type {__VLS_StyleScopedClasses['text-msg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "doctor-workbench" },
});
/** @type {__VLS_StyleScopedClasses['doctor-workbench']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "预约管理",
    name: "appointments",
}));
const __VLS_8 = __VLS_7({
    label: "预约管理",
    name: "appointments",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-bar" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "预约状态",
    clearable: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "预约状态",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_17;
const __VLS_18 = ({ change: {} },
    { onChange: (__VLS_ctx.fetchAppointments) });
const { default: __VLS_19 } = __VLS_15.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    label: "待就诊",
    value: (0),
}));
const __VLS_22 = __VLS_21({
    label: "待就诊",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    label: "已完成",
    value: (1),
}));
const __VLS_27 = __VLS_26({
    label: "已完成",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    label: "已取消",
    value: (2),
}));
const __VLS_32 = __VLS_31({
    label: "已取消",
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    label: "爽约",
    value: (3),
}));
const __VLS_37 = __VLS_36({
    label: "爽约",
    value: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
// @ts-ignore
[activeTab, statusFilter, fetchAppointments,];
var __VLS_15;
var __VLS_16;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.typeFilter),
    placeholder: "预约类型",
    clearable: true,
}));
const __VLS_42 = __VLS_41({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.typeFilter),
    placeholder: "预约类型",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_45;
const __VLS_46 = ({ change: {} },
    { onChange: (__VLS_ctx.fetchAppointments) });
const { default: __VLS_47 } = __VLS_43.slots;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    label: "线下挂号",
    value: (0),
}));
const __VLS_50 = __VLS_49({
    label: "线下挂号",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    label: "线上咨询",
    value: (1),
}));
const __VLS_55 = __VLS_54({
    label: "线上咨询",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
// @ts-ignore
[fetchAppointments, typeFilter,];
var __VLS_43;
var __VLS_44;
let __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    data: (__VLS_ctx.appointments),
}));
const __VLS_60 = __VLS_59({
    data: (__VLS_ctx.appointments),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingAppt) }, null, null);
const { default: __VLS_63 } = __VLS_61.slots;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    prop: "workDate",
    label: "日期",
    width: "120",
}));
const __VLS_66 = __VLS_65({
    prop: "workDate",
    label: "日期",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_69;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    prop: "workShift",
    label: "班次",
    width: "80",
}));
const __VLS_71 = __VLS_70({
    prop: "workShift",
    label: "班次",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
const { default: __VLS_74 } = __VLS_72.slots;
{
    const { default: __VLS_75 } = __VLS_72.slots;
    const [scope] = __VLS_vSlot(__VLS_75);
    (scope.row.workShift === 1 ? '上午' : scope.row.workShift === 2 ? '下午' : '晚班');
    // @ts-ignore
    [appointments, vLoading, loadingAppt,];
}
// @ts-ignore
[];
var __VLS_72;
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    prop: "type",
    label: "类型",
    width: "100",
}));
const __VLS_78 = __VLS_77({
    prop: "type",
    label: "类型",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const { default: __VLS_81 } = __VLS_79.slots;
{
    const { default: __VLS_82 } = __VLS_79.slots;
    const [scope] = __VLS_vSlot(__VLS_82);
    let __VLS_83;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
        type: (scope.row.type === 1 ? 'warning' : 'info'),
    }));
    const __VLS_85 = __VLS_84({
        type: (scope.row.type === 1 ? 'warning' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    const { default: __VLS_88 } = __VLS_86.slots;
    (scope.row.type === 1 ? '线上咨询' : '线下挂号');
    // @ts-ignore
    [];
    var __VLS_86;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_79;
let __VLS_89;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
    prop: "patientName",
    label: "患者姓名",
    width: "120",
}));
const __VLS_91 = __VLS_90({
    prop: "patientName",
    label: "患者姓名",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    prop: "patientPhone",
    label: "联系电话",
    width: "150",
}));
const __VLS_96 = __VLS_95({
    prop: "patientPhone",
    label: "联系电话",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    prop: "description",
    label: "病情描述",
    minWidth: "200",
    showOverflowTooltip: true,
}));
const __VLS_101 = __VLS_100({
    prop: "description",
    label: "病情描述",
    minWidth: "200",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
let __VLS_104;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_106 = __VLS_105({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const { default: __VLS_109 } = __VLS_107.slots;
{
    const { default: __VLS_110 } = __VLS_107.slots;
    const [scope] = __VLS_vSlot(__VLS_110);
    if (scope.row.status === 0) {
        let __VLS_111;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
            type: "primary",
        }));
        const __VLS_113 = __VLS_112({
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_112));
        const { default: __VLS_116 } = __VLS_114.slots;
        // @ts-ignore
        [];
        var __VLS_114;
    }
    else if (scope.row.status === 1) {
        let __VLS_117;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
            type: "success",
        }));
        const __VLS_119 = __VLS_118({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        const { default: __VLS_122 } = __VLS_120.slots;
        // @ts-ignore
        [];
        var __VLS_120;
    }
    else if (scope.row.status === 2) {
        let __VLS_123;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
            type: "info",
        }));
        const __VLS_125 = __VLS_124({
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_124));
        const { default: __VLS_128 } = __VLS_126.slots;
        // @ts-ignore
        [];
        var __VLS_126;
    }
    else if (scope.row.status === 3) {
        let __VLS_129;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
            type: "danger",
        }));
        const __VLS_131 = __VLS_130({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_130));
        const { default: __VLS_134 } = __VLS_132.slots;
        // @ts-ignore
        [];
        var __VLS_132;
    }
    else {
        let __VLS_135;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({
            type: "warning",
        }));
        const __VLS_137 = __VLS_136({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_136));
        const { default: __VLS_140 } = __VLS_138.slots;
        // @ts-ignore
        [];
        var __VLS_138;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_107;
let __VLS_141;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
    label: "操作",
    minWidth: "400",
    fixed: "right",
}));
const __VLS_143 = __VLS_142({
    label: "操作",
    minWidth: "400",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
const { default: __VLS_146 } = __VLS_144.slots;
{
    const { default: __VLS_147 } = __VLS_144.slots;
    const [scope] = __VLS_vSlot(__VLS_147);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "action-buttons" },
    });
    /** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
    if (scope.row.status === 0 && scope.row.type === 1) {
        let __VLS_148;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }));
        const __VLS_150 = __VLS_149({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_149));
        let __VLS_153;
        const __VLS_154 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 0 && scope.row.type === 1))
                        return;
                    __VLS_ctx.openChat(scope.row);
                    // @ts-ignore
                    [openChat,];
                } });
        const { default: __VLS_155 } = __VLS_151.slots;
        // @ts-ignore
        [];
        var __VLS_151;
        var __VLS_152;
    }
    if (scope.row.status === 0) {
        let __VLS_156;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_158 = __VLS_157({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        let __VLS_161;
        const __VLS_162 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 0))
                        return;
                    __VLS_ctx.handleComplete(scope.row);
                    // @ts-ignore
                    [handleComplete,];
                } });
        const { default: __VLS_163 } = __VLS_159.slots;
        // @ts-ignore
        [];
        var __VLS_159;
        var __VLS_160;
    }
    if (scope.row.status === 0) {
        let __VLS_164;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_166 = __VLS_165({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
        let __VLS_169;
        const __VLS_170 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 0))
                        return;
                    __VLS_ctx.markMissed(scope.row);
                    // @ts-ignore
                    [markMissed,];
                } });
        const { default: __VLS_171 } = __VLS_167.slots;
        // @ts-ignore
        [];
        var __VLS_167;
        var __VLS_168;
    }
    if (scope.row.status === 0) {
        let __VLS_172;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({
            ...{ 'onClick': {} },
            size: "small",
            type: "info",
        }));
        const __VLS_174 = __VLS_173({
            ...{ 'onClick': {} },
            size: "small",
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        let __VLS_177;
        const __VLS_178 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 0))
                        return;
                    __VLS_ctx.handleReschedule(scope.row);
                    // @ts-ignore
                    [handleReschedule,];
                } });
        const { default: __VLS_179 } = __VLS_175.slots;
        // @ts-ignore
        [];
        var __VLS_175;
        var __VLS_176;
    }
    let __VLS_180;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_182 = __VLS_181({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    let __VLS_185;
    const __VLS_186 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleHistory(scope.row);
                // @ts-ignore
                [handleHistory,];
            } });
    const { default: __VLS_187 } = __VLS_183.slots;
    // @ts-ignore
    [];
    var __VLS_183;
    var __VLS_184;
    let __VLS_188;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent1(__VLS_188, new __VLS_188({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_190 = __VLS_189({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    let __VLS_193;
    const __VLS_194 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewPatient(scope.row.patientId);
                // @ts-ignore
                [viewPatient,];
            } });
    const { default: __VLS_195 } = __VLS_191.slots;
    // @ts-ignore
    [];
    var __VLS_191;
    var __VLS_192;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_144;
// @ts-ignore
[];
var __VLS_61;
// @ts-ignore
[];
var __VLS_9;
let __VLS_196;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
    label: "在线咨询",
    name: "chat",
}));
const __VLS_198 = __VLS_197({
    label: "在线咨询",
    name: "chat",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
const { default: __VLS_201 } = __VLS_199.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-workbench" },
});
/** @type {__VLS_StyleScopedClasses['chat-workbench']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-list" },
});
/** @type {__VLS_StyleScopedClasses['chat-list']} */ ;
if (__VLS_ctx.activeChats.length === 0) {
    let __VLS_202;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
        description: "暂无进行中的线上咨询",
    }));
    const __VLS_204 = __VLS_203({
        description: "暂无进行中的线上咨询",
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
}
else {
    for (const [chat] of __VLS_vFor((__VLS_ctx.activeChats))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.activeChats.length === 0))
                        return;
                    __VLS_ctx.selectChat(chat);
                    // @ts-ignore
                    [activeChats, activeChats, selectChat,];
                } },
            key: (chat.id),
            ...{ class: "chat-item" },
            ...{ class: ({ active: __VLS_ctx.currentChat?.id === chat.id }) },
        });
        /** @type {__VLS_StyleScopedClasses['chat-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        let __VLS_207;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_208 = __VLS_asFunctionalComponent1(__VLS_207, new __VLS_207({
            src: (chat.patientAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'),
        }));
        const __VLS_209 = __VLS_208({
            src: (chat.patientAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_208));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info" },
        });
        /** @type {__VLS_StyleScopedClasses['info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "name" },
        });
        /** @type {__VLS_StyleScopedClasses['name']} */ ;
        (chat.patientName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "last-msg" },
        });
        /** @type {__VLS_StyleScopedClasses['last-msg']} */ ;
        (chat.lastMessage);
        // @ts-ignore
        [currentChat,];
    }
}
if (__VLS_ctx.currentChat) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-room" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-room']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-header" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.currentChat.patientName);
    let __VLS_212;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent1(__VLS_212, new __VLS_212({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_214 = __VLS_213({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    let __VLS_217;
    const __VLS_218 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.currentChat))
                    return;
                __VLS_ctx.handleComplete(__VLS_ctx.currentChat);
                // @ts-ignore
                [handleComplete, currentChat, currentChat, currentChat,];
            } });
    const { default: __VLS_219 } = __VLS_215.slots;
    // @ts-ignore
    [];
    var __VLS_215;
    var __VLS_216;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "messages" },
        ref: "messageBox",
    });
    /** @type {__VLS_StyleScopedClasses['messages']} */ ;
    for (const [msg] of __VLS_vFor((__VLS_ctx.messages))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (msg.id),
            ...{ class: "message-row" },
            ...{ class: ({ 'self': msg.isSelf }) },
        });
        /** @type {__VLS_StyleScopedClasses['message-row']} */ ;
        /** @type {__VLS_StyleScopedClasses['self']} */ ;
        if (!msg.isSelf) {
            let __VLS_220;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_221 = __VLS_asFunctionalComponent1(__VLS_220, new __VLS_220({
                src: (__VLS_ctx.currentChat.patientAvatar),
            }));
            const __VLS_222 = __VLS_221({
                src: (__VLS_ctx.currentChat.patientAvatar),
            }, ...__VLS_functionalComponentArgsRest(__VLS_221));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "message-content" },
        });
        /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
        if (msg.type === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (__VLS_ctx.handleMemeClick) },
                ...{ class: "text-msg" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.getRenderedText(msg)) }, null, null);
            /** @type {__VLS_StyleScopedClasses['text-msg']} */ ;
        }
        if (msg.type === 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "image-msg" },
            });
            /** @type {__VLS_StyleScopedClasses['image-msg']} */ ;
            let __VLS_225;
            /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
            elImage;
            // @ts-ignore
            const __VLS_226 = __VLS_asFunctionalComponent1(__VLS_225, new __VLS_225({
                src: (msg.content),
                previewSrcList: ([msg.content]),
            }));
            const __VLS_227 = __VLS_226({
                src: (msg.content),
                previewSrcList: ([msg.content]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_226));
        }
        if (msg.isSelf) {
            let __VLS_230;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_231 = __VLS_asFunctionalComponent1(__VLS_230, new __VLS_230({
                src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
            }));
            const __VLS_232 = __VLS_231({
                src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
            }, ...__VLS_functionalComponentArgsRest(__VLS_231));
        }
        // @ts-ignore
        [currentChat, messages, handleMemeClick, getRenderedText,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-area" },
    });
    /** @type {__VLS_StyleScopedClasses['input-area']} */ ;
    let __VLS_235;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({
        action: "/api/common/upload",
        headers: (__VLS_ctx.uploadHeaders),
        showFileList: (false),
        onSuccess: (__VLS_ctx.handleChatImageUpload),
    }));
    const __VLS_237 = __VLS_236({
        action: "/api/common/upload",
        headers: (__VLS_ctx.uploadHeaders),
        showFileList: (false),
        onSuccess: (__VLS_ctx.handleChatImageUpload),
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    const { default: __VLS_240 } = __VLS_238.slots;
    let __VLS_241;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent1(__VLS_241, new __VLS_241({
        icon: "Picture",
        circle: true,
    }));
    const __VLS_243 = __VLS_242({
        icon: "Picture",
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    // @ts-ignore
    [uploadHeaders, handleChatImageUpload,];
    var __VLS_238;
    let __VLS_246;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent1(__VLS_246, new __VLS_246({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.chatInput),
        placeholder: "请输入消息...",
    }));
    const __VLS_248 = __VLS_247({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.chatInput),
        placeholder: "请输入消息...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_247));
    let __VLS_251;
    const __VLS_252 = ({ keyup: {} },
        { onKeyup: (__VLS_ctx.sendChatMessage) });
    var __VLS_249;
    var __VLS_250;
    let __VLS_253;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent1(__VLS_253, new __VLS_253({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_255 = __VLS_254({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    let __VLS_258;
    const __VLS_259 = ({ click: {} },
        { onClick: (__VLS_ctx.sendChatMessage) });
    const { default: __VLS_260 } = __VLS_256.slots;
    // @ts-ignore
    [chatInput, sendChatMessage, sendChatMessage,];
    var __VLS_256;
    var __VLS_257;
}
// @ts-ignore
[];
var __VLS_199;
// @ts-ignore
[];
var __VLS_3;
let __VLS_261;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({
    modelValue: (__VLS_ctx.detailVisible),
    title: "预约详情",
    width: "600px",
}));
const __VLS_263 = __VLS_262({
    modelValue: (__VLS_ctx.detailVisible),
    title: "预约详情",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
const { default: __VLS_266 } = __VLS_264.slots;
if (__VLS_ctx.appointmentDetail) {
    let __VLS_267;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent1(__VLS_267, new __VLS_267({
        column: (2),
        border: true,
    }));
    const __VLS_269 = __VLS_268({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_268));
    const { default: __VLS_272 } = __VLS_270.slots;
    let __VLS_273;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_274 = __VLS_asFunctionalComponent1(__VLS_273, new __VLS_273({
        label: "患者姓名",
    }));
    const __VLS_275 = __VLS_274({
        label: "患者姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_274));
    const { default: __VLS_278 } = __VLS_276.slots;
    (__VLS_ctx.appointmentDetail.patientName);
    // @ts-ignore
    [detailVisible, appointmentDetail, appointmentDetail,];
    var __VLS_276;
    let __VLS_279;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_280 = __VLS_asFunctionalComponent1(__VLS_279, new __VLS_279({
        label: "联系电话",
    }));
    const __VLS_281 = __VLS_280({
        label: "联系电话",
    }, ...__VLS_functionalComponentArgsRest(__VLS_280));
    const { default: __VLS_284 } = __VLS_282.slots;
    (__VLS_ctx.appointmentDetail.patientPhone);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_282;
    let __VLS_285;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_286 = __VLS_asFunctionalComponent1(__VLS_285, new __VLS_285({
        label: "就诊日期",
    }));
    const __VLS_287 = __VLS_286({
        label: "就诊日期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_286));
    const { default: __VLS_290 } = __VLS_288.slots;
    (__VLS_ctx.appointmentDetail.workDate);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_288;
    let __VLS_291;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_292 = __VLS_asFunctionalComponent1(__VLS_291, new __VLS_291({
        label: "班次",
    }));
    const __VLS_293 = __VLS_292({
        label: "班次",
    }, ...__VLS_functionalComponentArgsRest(__VLS_292));
    const { default: __VLS_296 } = __VLS_294.slots;
    (__VLS_ctx.appointmentDetail.workShift === 1 ? '上午' : '下午');
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_294;
    let __VLS_297;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent1(__VLS_297, new __VLS_297({
        label: "挂号费",
    }));
    const __VLS_299 = __VLS_298({
        label: "挂号费",
    }, ...__VLS_functionalComponentArgsRest(__VLS_298));
    const { default: __VLS_302 } = __VLS_300.slots;
    (__VLS_ctx.appointmentDetail.fee);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_300;
    let __VLS_303;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_304 = __VLS_asFunctionalComponent1(__VLS_303, new __VLS_303({
        label: "状态",
    }));
    const __VLS_305 = __VLS_304({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_304));
    const { default: __VLS_308 } = __VLS_306.slots;
    (__VLS_ctx.getStatusText(__VLS_ctx.appointmentDetail.status));
    // @ts-ignore
    [appointmentDetail, getStatusText,];
    var __VLS_306;
    let __VLS_309;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_310 = __VLS_asFunctionalComponent1(__VLS_309, new __VLS_309({
        label: "描述",
        span: (2),
    }));
    const __VLS_311 = __VLS_310({
        label: "描述",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_310));
    const { default: __VLS_314 } = __VLS_312.slots;
    (__VLS_ctx.appointmentDetail.description);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_312;
    // @ts-ignore
    [];
    var __VLS_270;
}
if (__VLS_ctx.appointmentDetail?.medicalRecord) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "medical-record-info" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['medical-record-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    let __VLS_315;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_316 = __VLS_asFunctionalComponent1(__VLS_315, new __VLS_315({
        column: (1),
        border: true,
    }));
    const __VLS_317 = __VLS_316({
        column: (1),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_316));
    const { default: __VLS_320 } = __VLS_318.slots;
    let __VLS_321;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_322 = __VLS_asFunctionalComponent1(__VLS_321, new __VLS_321({
        label: "科室",
    }));
    const __VLS_323 = __VLS_322({
        label: "科室",
    }, ...__VLS_functionalComponentArgsRest(__VLS_322));
    const { default: __VLS_326 } = __VLS_324.slots;
    (__VLS_ctx.appointmentDetail.medicalRecord.department);
    // @ts-ignore
    [appointmentDetail, appointmentDetail,];
    var __VLS_324;
    let __VLS_327;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_328 = __VLS_asFunctionalComponent1(__VLS_327, new __VLS_327({
        label: "诊断",
    }));
    const __VLS_329 = __VLS_328({
        label: "诊断",
    }, ...__VLS_functionalComponentArgsRest(__VLS_328));
    const { default: __VLS_332 } = __VLS_330.slots;
    (__VLS_ctx.appointmentDetail.medicalRecord.symptoms);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_330;
    let __VLS_333;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_334 = __VLS_asFunctionalComponent1(__VLS_333, new __VLS_333({
        label: "备注",
    }));
    const __VLS_335 = __VLS_334({
        label: "备注",
    }, ...__VLS_functionalComponentArgsRest(__VLS_334));
    const { default: __VLS_338 } = __VLS_336.slots;
    (__VLS_ctx.appointmentDetail.medicalRecord.remarks);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_336;
    let __VLS_339;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_340 = __VLS_asFunctionalComponent1(__VLS_339, new __VLS_339({
        label: "病历图片",
    }));
    const __VLS_341 = __VLS_340({
        label: "病历图片",
    }, ...__VLS_functionalComponentArgsRest(__VLS_340));
    const { default: __VLS_344 } = __VLS_342.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "image-list" },
    });
    /** @type {__VLS_StyleScopedClasses['image-list']} */ ;
    for (const [img] of __VLS_vFor((__VLS_ctx.appointmentDetail.medicalRecord.images))) {
        let __VLS_345;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_346 = __VLS_asFunctionalComponent1(__VLS_345, new __VLS_345({
            key: (img),
            src: (img),
            previewSrcList: (__VLS_ctx.appointmentDetail.medicalRecord.images),
            ...{ style: {} },
            fit: "cover",
        }));
        const __VLS_347 = __VLS_346({
            key: (img),
            src: (img),
            previewSrcList: (__VLS_ctx.appointmentDetail.medicalRecord.images),
            ...{ style: {} },
            fit: "cover",
        }, ...__VLS_functionalComponentArgsRest(__VLS_346));
        // @ts-ignore
        [appointmentDetail, appointmentDetail,];
    }
    // @ts-ignore
    [];
    var __VLS_342;
    // @ts-ignore
    [];
    var __VLS_318;
}
{
    const { footer: __VLS_350 } = __VLS_264.slots;
    let __VLS_351;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_352 = __VLS_asFunctionalComponent1(__VLS_351, new __VLS_351({
        ...{ 'onClick': {} },
    }));
    const __VLS_353 = __VLS_352({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_352));
    let __VLS_356;
    const __VLS_357 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
                // @ts-ignore
                [detailVisible,];
            } });
    const { default: __VLS_358 } = __VLS_354.slots;
    // @ts-ignore
    [];
    var __VLS_354;
    var __VLS_355;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_264;
let __VLS_359;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_360 = __VLS_asFunctionalComponent1(__VLS_359, new __VLS_359({
    modelValue: (__VLS_ctx.historyVisible),
    title: "历史记录",
    width: "800px",
}));
const __VLS_361 = __VLS_360({
    modelValue: (__VLS_ctx.historyVisible),
    title: "历史记录",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_360));
const { default: __VLS_364 } = __VLS_362.slots;
let __VLS_365;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_366 = __VLS_asFunctionalComponent1(__VLS_365, new __VLS_365({
    type: "border-card",
}));
const __VLS_367 = __VLS_366({
    type: "border-card",
}, ...__VLS_functionalComponentArgsRest(__VLS_366));
const { default: __VLS_370 } = __VLS_368.slots;
let __VLS_371;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_372 = __VLS_asFunctionalComponent1(__VLS_371, new __VLS_371({
    label: "历史病历",
}));
const __VLS_373 = __VLS_372({
    label: "历史病历",
}, ...__VLS_functionalComponentArgsRest(__VLS_372));
const { default: __VLS_376 } = __VLS_374.slots;
if (__VLS_ctx.historyRecords.length > 0) {
    let __VLS_377;
    /** @ts-ignore @type {typeof __VLS_components.elTimeline | typeof __VLS_components.ElTimeline | typeof __VLS_components.elTimeline | typeof __VLS_components.ElTimeline} */
    elTimeline;
    // @ts-ignore
    const __VLS_378 = __VLS_asFunctionalComponent1(__VLS_377, new __VLS_377({}));
    const __VLS_379 = __VLS_378({}, ...__VLS_functionalComponentArgsRest(__VLS_378));
    const { default: __VLS_382 } = __VLS_380.slots;
    for (const [record, index] of __VLS_vFor((__VLS_ctx.historyRecords))) {
        let __VLS_383;
        /** @ts-ignore @type {typeof __VLS_components.elTimelineItem | typeof __VLS_components.ElTimelineItem | typeof __VLS_components.elTimelineItem | typeof __VLS_components.ElTimelineItem} */
        elTimelineItem;
        // @ts-ignore
        const __VLS_384 = __VLS_asFunctionalComponent1(__VLS_383, new __VLS_383({
            key: (index),
            timestamp: (record.visitDate),
            placement: "top",
        }));
        const __VLS_385 = __VLS_384({
            key: (index),
            timestamp: (record.visitDate),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_384));
        const { default: __VLS_388 } = __VLS_386.slots;
        let __VLS_389;
        /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
        elCard;
        // @ts-ignore
        const __VLS_390 = __VLS_asFunctionalComponent1(__VLS_389, new __VLS_389({}));
        const __VLS_391 = __VLS_390({}, ...__VLS_functionalComponentArgsRest(__VLS_390));
        const { default: __VLS_394 } = __VLS_392.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        (record.hospital);
        (record.department);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (record.symptoms);
        if (record.remarks) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (record.remarks);
        }
        if (record.images && record.images.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ style: {} },
            });
            for (const [img] of __VLS_vFor((record.images))) {
                let __VLS_395;
                /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
                elImage;
                // @ts-ignore
                const __VLS_396 = __VLS_asFunctionalComponent1(__VLS_395, new __VLS_395({
                    key: (img),
                    src: (img),
                    previewSrcList: (record.images),
                    ...{ style: {} },
                    fit: "cover",
                }));
                const __VLS_397 = __VLS_396({
                    key: (img),
                    src: (img),
                    previewSrcList: (record.images),
                    ...{ style: {} },
                    fit: "cover",
                }, ...__VLS_functionalComponentArgsRest(__VLS_396));
                // @ts-ignore
                [historyVisible, historyRecords, historyRecords,];
            }
        }
        // @ts-ignore
        [];
        var __VLS_392;
        // @ts-ignore
        [];
        var __VLS_386;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_380;
}
else {
    let __VLS_400;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_401 = __VLS_asFunctionalComponent1(__VLS_400, new __VLS_400({
        description: "暂无历史病历记录",
    }));
    const __VLS_402 = __VLS_401({
        description: "暂无历史病历记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_401));
}
// @ts-ignore
[];
var __VLS_374;
let __VLS_405;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_406 = __VLS_asFunctionalComponent1(__VLS_405, new __VLS_405({
    label: "测评记录",
}));
const __VLS_407 = __VLS_406({
    label: "测评记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_406));
const { default: __VLS_410 } = __VLS_408.slots;
let __VLS_411;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_412 = __VLS_asFunctionalComponent1(__VLS_411, new __VLS_411({
    data: (__VLS_ctx.assessmentRecords),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_413 = __VLS_412({
    data: (__VLS_ctx.assessmentRecords),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_412));
const { default: __VLS_416 } = __VLS_414.slots;
let __VLS_417;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_418 = __VLS_asFunctionalComponent1(__VLS_417, new __VLS_417({
    prop: "templateTitle",
    label: "量表名称",
    minWidth: "150",
}));
const __VLS_419 = __VLS_418({
    prop: "templateTitle",
    label: "量表名称",
    minWidth: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_418));
let __VLS_422;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_423 = __VLS_asFunctionalComponent1(__VLS_422, new __VLS_422({
    prop: "record.createTime",
    label: "测评时间",
    width: "160",
}));
const __VLS_424 = __VLS_423({
    prop: "record.createTime",
    label: "测评时间",
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_423));
let __VLS_427;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_428 = __VLS_asFunctionalComponent1(__VLS_427, new __VLS_427({
    prop: "record.resultScore",
    label: "得分",
    width: "80",
}));
const __VLS_429 = __VLS_428({
    prop: "record.resultScore",
    label: "得分",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_428));
let __VLS_432;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_433 = __VLS_asFunctionalComponent1(__VLS_432, new __VLS_432({
    prop: "record.resultAnalysis",
    label: "结果分析",
    showOverflowTooltip: true,
}));
const __VLS_434 = __VLS_433({
    prop: "record.resultAnalysis",
    label: "结果分析",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_433));
// @ts-ignore
[assessmentRecords,];
var __VLS_414;
if (__VLS_ctx.assessmentRecords.length === 0) {
    let __VLS_437;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_438 = __VLS_asFunctionalComponent1(__VLS_437, new __VLS_437({
        description: "暂无测评记录",
    }));
    const __VLS_439 = __VLS_438({
        description: "暂无测评记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_438));
}
// @ts-ignore
[assessmentRecords,];
var __VLS_408;
// @ts-ignore
[];
var __VLS_368;
{
    const { footer: __VLS_442 } = __VLS_362.slots;
    let __VLS_443;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_444 = __VLS_asFunctionalComponent1(__VLS_443, new __VLS_443({
        ...{ 'onClick': {} },
    }));
    const __VLS_445 = __VLS_444({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_444));
    let __VLS_448;
    const __VLS_449 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.historyVisible = false;
                // @ts-ignore
                [historyVisible,];
            } });
    const { default: __VLS_450 } = __VLS_446.slots;
    // @ts-ignore
    [];
    var __VLS_446;
    var __VLS_447;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_362;
let __VLS_451;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_452 = __VLS_asFunctionalComponent1(__VLS_451, new __VLS_451({
    modelValue: (__VLS_ctx.completeVisible),
    title: "填写就诊病历",
    width: "600px",
}));
const __VLS_453 = __VLS_452({
    modelValue: (__VLS_ctx.completeVisible),
    title: "填写就诊病历",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_452));
const { default: __VLS_456 } = __VLS_454.slots;
let __VLS_457;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_458 = __VLS_asFunctionalComponent1(__VLS_457, new __VLS_457({
    model: (__VLS_ctx.completeForm),
    labelWidth: "100px",
}));
const __VLS_459 = __VLS_458({
    model: (__VLS_ctx.completeForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_458));
const { default: __VLS_462 } = __VLS_460.slots;
let __VLS_463;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_464 = __VLS_asFunctionalComponent1(__VLS_463, new __VLS_463({
    label: "就诊科室",
    required: true,
}));
const __VLS_465 = __VLS_464({
    label: "就诊科室",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_464));
const { default: __VLS_468 } = __VLS_466.slots;
let __VLS_469;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_470 = __VLS_asFunctionalComponent1(__VLS_469, new __VLS_469({
    modelValue: (__VLS_ctx.completeForm.department),
}));
const __VLS_471 = __VLS_470({
    modelValue: (__VLS_ctx.completeForm.department),
}, ...__VLS_functionalComponentArgsRest(__VLS_470));
// @ts-ignore
[completeVisible, completeForm, completeForm,];
var __VLS_466;
let __VLS_474;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_475 = __VLS_asFunctionalComponent1(__VLS_474, new __VLS_474({
    label: "就诊医院",
}));
const __VLS_476 = __VLS_475({
    label: "就诊医院",
}, ...__VLS_functionalComponentArgsRest(__VLS_475));
const { default: __VLS_479 } = __VLS_477.slots;
let __VLS_480;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_481 = __VLS_asFunctionalComponent1(__VLS_480, new __VLS_480({
    modelValue: (__VLS_ctx.completeForm.hospital),
}));
const __VLS_482 = __VLS_481({
    modelValue: (__VLS_ctx.completeForm.hospital),
}, ...__VLS_functionalComponentArgsRest(__VLS_481));
// @ts-ignore
[completeForm,];
var __VLS_477;
let __VLS_485;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_486 = __VLS_asFunctionalComponent1(__VLS_485, new __VLS_485({
    label: "症状/诊断",
    required: true,
}));
const __VLS_487 = __VLS_486({
    label: "症状/诊断",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_486));
const { default: __VLS_490 } = __VLS_488.slots;
let __VLS_491;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_492 = __VLS_asFunctionalComponent1(__VLS_491, new __VLS_491({
    type: "textarea",
    modelValue: (__VLS_ctx.completeForm.symptoms),
    rows: (3),
}));
const __VLS_493 = __VLS_492({
    type: "textarea",
    modelValue: (__VLS_ctx.completeForm.symptoms),
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_492));
// @ts-ignore
[completeForm,];
var __VLS_488;
let __VLS_496;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_497 = __VLS_asFunctionalComponent1(__VLS_496, new __VLS_496({
    label: "病历图片",
}));
const __VLS_498 = __VLS_497({
    label: "病历图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_497));
const { default: __VLS_501 } = __VLS_499.slots;
let __VLS_502;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_503 = __VLS_asFunctionalComponent1(__VLS_502, new __VLS_502({
    action: "#",
    listType: "picture-card",
    onError: (__VLS_ctx.handleUploadError),
    beforeUpload: (__VLS_ctx.beforeUpload),
    onChange: (__VLS_ctx.handleChange),
    onRemove: (__VLS_ctx.handleRemoveImage),
    fileList: (__VLS_ctx.fileList),
    autoUpload: (false),
    multiple: true,
}));
const __VLS_504 = __VLS_503({
    action: "#",
    listType: "picture-card",
    onError: (__VLS_ctx.handleUploadError),
    beforeUpload: (__VLS_ctx.beforeUpload),
    onChange: (__VLS_ctx.handleChange),
    onRemove: (__VLS_ctx.handleRemoveImage),
    fileList: (__VLS_ctx.fileList),
    autoUpload: (false),
    multiple: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_503));
const { default: __VLS_507 } = __VLS_505.slots;
let __VLS_508;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_509 = __VLS_asFunctionalComponent1(__VLS_508, new __VLS_508({}));
const __VLS_510 = __VLS_509({}, ...__VLS_functionalComponentArgsRest(__VLS_509));
const { default: __VLS_513 } = __VLS_511.slots;
let __VLS_514;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_515 = __VLS_asFunctionalComponent1(__VLS_514, new __VLS_514({}));
const __VLS_516 = __VLS_515({}, ...__VLS_functionalComponentArgsRest(__VLS_515));
// @ts-ignore
[handleUploadError, beforeUpload, handleChange, handleRemoveImage, fileList,];
var __VLS_511;
// @ts-ignore
[];
var __VLS_505;
// @ts-ignore
[];
var __VLS_499;
let __VLS_519;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_520 = __VLS_asFunctionalComponent1(__VLS_519, new __VLS_519({
    label: "备注",
}));
const __VLS_521 = __VLS_520({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_520));
const { default: __VLS_524 } = __VLS_522.slots;
let __VLS_525;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_526 = __VLS_asFunctionalComponent1(__VLS_525, new __VLS_525({
    type: "textarea",
    modelValue: (__VLS_ctx.completeForm.remarks),
    rows: (2),
}));
const __VLS_527 = __VLS_526({
    type: "textarea",
    modelValue: (__VLS_ctx.completeForm.remarks),
    rows: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_526));
// @ts-ignore
[completeForm,];
var __VLS_522;
// @ts-ignore
[];
var __VLS_460;
{
    const { footer: __VLS_530 } = __VLS_454.slots;
    let __VLS_531;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_532 = __VLS_asFunctionalComponent1(__VLS_531, new __VLS_531({
        ...{ 'onClick': {} },
    }));
    const __VLS_533 = __VLS_532({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_532));
    let __VLS_536;
    const __VLS_537 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.completeVisible = false;
                // @ts-ignore
                [completeVisible,];
            } });
    const { default: __VLS_538 } = __VLS_534.slots;
    // @ts-ignore
    [];
    var __VLS_534;
    var __VLS_535;
    let __VLS_539;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_540 = __VLS_asFunctionalComponent1(__VLS_539, new __VLS_539({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.completeLoading),
    }));
    const __VLS_541 = __VLS_540({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.completeLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_540));
    let __VLS_544;
    const __VLS_545 = ({ click: {} },
        { onClick: (__VLS_ctx.submitComplete) });
    const { default: __VLS_546 } = __VLS_542.slots;
    // @ts-ignore
    [completeLoading, submitComplete,];
    var __VLS_542;
    var __VLS_543;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_454;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
