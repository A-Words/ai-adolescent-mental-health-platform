/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, Coin, Star, User, ChatDotRound, VideoPlay, CircleCheck, Clock, Wallet } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getMyPsychologistProfile, getMyAppointments, handleAppointment, sendVideoLink, startConsultation, completeConsultationApi, getDashboardStats } from '@/api/psychologistAdminPage';
import { updateOnlineStatus, OnlineStatus, OnlineStatusText } from '@/api/psychologist';
const router = useRouter();
// 在线状态
const onlineStatus = ref(OnlineStatus.OFFLINE);
const statusLoading = ref(false);
const getStatusText = (status) => {
    if (status === OnlineStatus.ONLINE || status === OnlineStatus.BUSY || status === OnlineStatus.OFFLINE) {
        return OnlineStatusText[status];
    }
    return '离线';
};
const getStatusClass = (status) => {
    switch (status) {
        case OnlineStatus.ONLINE: return 'status-online';
        case OnlineStatus.BUSY: return 'status-busy';
        default: return 'status-offline';
    }
};
const handleStatusChange = async (newStatus) => {
    const oldStatus = onlineStatus.value;
    statusLoading.value = true;
    try {
        await updateOnlineStatus(newStatus);
        ElMessage.success(`状态已更新为：${getStatusText(newStatus)}`);
    }
    catch (error) {
        ElMessage.error('状态更新失败');
        onlineStatus.value = oldStatus;
    }
    finally {
        statusLoading.value = false;
    }
};
// 获取当前心理师在线状态
const fetchOnlineStatus = async () => {
    try {
        const res = await getMyPsychologistProfile();
        if (res.data?.psychologist?.onlineStatus !== undefined) {
            onlineStatus.value = res.data.psychologist.onlineStatus;
        }
    }
    catch (error) {
        console.error('获取在线状态失败', error);
    }
};
// 心理师信息
const psychologistName = ref('心理咨询师');
// 统计数据
const stats = ref({
    todayAppointments: 0,
    todayIncome: 0,
    totalConsultations: 0,
    rating: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    toStartAppointments: 0,
    inProgressAppointments: 0,
    pendingWithdrawals: 0
});
// 今日预约
const loading = ref(false);
const todayAppointments = ref([]);
// 图表
const incomeChartRef = ref(null);
// 拒绝对话框
const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const currentRejectItem = ref(null);
// 开始咨询对话框
const startDialogVisible = ref(false);
const startTime = ref('');
const currentAppointment = ref(null);
// 视频链接对话框
const videoLinkDialogVisible = ref(false);
const videoForm = reactive({
    platform: 'tencent',
    link: '',
    startTime: '',
    remark: ''
});
// 服务类型
const serviceTypeMap = {
    text: '图文咨询', video: '视频咨询', voice: '语音咨询', offline: '线下面询',
    TEXT: '图文咨询', VIDEO: '视频咨询', VOICE: '语音咨询', OFFLINE: '线下面询'
};
const getServiceTypeName = (type) => serviceTypeMap[type] || type;
// 状态
const statusMap = {
    0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 7: '待进行', 8: '已评价'
};
const getStatusName = (status) => statusMap[status] || '未知';
const getStatusType = (status) => {
    const types = {
        0: 'warning', 1: 'info', 2: 'danger', 3: 'primary', 4: 'success', 5: 'info', 6: 'danger', 7: 'warning', 8: 'success'
    };
    return types[status] || 'info';
};
// 跳转到预约列表
const goToAppointments = (status) => {
    router.push(`/psychologist-admin/appointments${status !== undefined ? '?status=' + status : ''}`);
};
// 跳转到收入页面
const goToIncome = () => {
    router.push('/psychologist-admin/income');
};
// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr)
        return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime()))
        return '-';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
};
// 格式化时间
const formatTime = (dateStr) => {
    if (!dateStr)
        return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime()))
        return '-';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
// 接受预约
const acceptAppointment = async (item) => {
    try {
        const res = await handleAppointment(item.id, true);
        if (res.code === 200) {
            ElMessage.success('已接受预约');
            fetchTodayAppointments();
            fetchDashboardStats();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
// 显示拒绝对话框
const showRejectDialog = (item) => {
    currentRejectItem.value = item;
    rejectReason.value = '';
    rejectDialogVisible.value = true;
};
// 确认拒绝
const confirmReject = async () => {
    if (!rejectReason.value.trim()) {
        ElMessage.warning('请输入拒绝原因');
        return;
    }
    try {
        const res = await handleAppointment(currentRejectItem.value.id, false, '', rejectReason.value);
        if (res.code === 200) {
            ElMessage.success('已拒绝预约');
            rejectDialogVisible.value = false;
            fetchTodayAppointments();
            fetchDashboardStats();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
// 提供视频链接
const provideVideoLink = (item) => {
    currentAppointment.value = item;
    videoForm.link = '';
    videoForm.startTime = '';
    videoForm.remark = '';
    videoLinkDialogVisible.value = true;
};
// 提交视频链接
const submitVideoLink = async () => {
    if (!videoForm.link) {
        ElMessage.warning('请输入会议链接');
        return;
    }
    try {
        const res = await sendVideoLink({
            appointmentId: currentAppointment.value.id,
            videoLink: videoForm.link,
            startTime: videoForm.startTime || undefined
        });
        if (res.code === 200) {
            ElMessage.success('已发送视频链接');
            videoLinkDialogVisible.value = false;
            fetchTodayAppointments();
            fetchDashboardStats();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
// 显示开始咨询对话框
const showStartDialog = (item) => {
    currentAppointment.value = item;
    startTime.value = '';
    startDialogVisible.value = true;
};
// 确认开始咨询
const confirmStartConsultation = async () => {
    try {
        const res = await startConsultation({
            appointmentId: currentAppointment.value.id,
            startTime: startTime.value || undefined
        });
        if (res.code === 200) {
            ElMessage.success('咨询已开始');
            startDialogVisible.value = false;
            fetchTodayAppointments();
            fetchDashboardStats();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
// 完成咨询
const completeConsultation = async (item) => {
    try {
        await ElMessageBox.confirm('确定要完成此咨询吗？完成后用户可以进行评价。', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await completeConsultationApi(item.id);
        if (res.code === 200) {
            ElMessage.success('咨询已完成');
            fetchTodayAppointments();
            fetchDashboardStats();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '操作失败');
        }
    }
};
// 打开聊天
const openChat = (item) => {
    router.push(`/psychologist-admin/chat?userId=${item.userId}&appointmentId=${item.id}`);
};
// 查看详情
const viewDetail = (item) => {
    router.push(`/psychologist-admin/appointments?detail=${item.id}`);
};
// 获取工作台统计数据
const fetchDashboardStats = async () => {
    try {
        const res = await getDashboardStats();
        if (res.code === 200 && res.data) {
            const data = res.data;
            psychologistName.value = data.realName || data.nickname || '心理咨询师';
            stats.value.todayAppointments = data.todayAppointments || 0;
            stats.value.todayIncome = data.todayIncome || 0;
            stats.value.totalConsultations = data.totalConsultations || 0;
            stats.value.rating = data.rating || 0;
            stats.value.pendingAppointments = data.pendingAppointments || 0;
            stats.value.confirmedAppointments = data.confirmedAppointments || 0;
            stats.value.toStartAppointments = data.toStartAppointments || 0;
            stats.value.inProgressAppointments = data.inProgressAppointments || 0;
            stats.value.pendingWithdrawals = data.pendingWithdrawals || 0;
        }
    }
    catch (error) {
        console.error('获取工作台统计失败:', error);
    }
};
// 获取个人信息（兼容旧接口）
const fetchProfile = async () => {
    try {
        const res = await getMyPsychologistProfile();
        if (res.code === 200 && res.data) {
            const data = res.data.psychologist || res.data;
            psychologistName.value = data.realName || data.nickname || '心理咨询师';
        }
    }
    catch (error) {
        console.error('获取个人信息失败:', error);
    }
};
// 获取今日预约
const fetchTodayAppointments = async () => {
    loading.value = true;
    try {
        const res = await getMyAppointments({
            page: 1,
            size: 10,
            status: undefined
        });
        if (res.code === 200) {
            todayAppointments.value = res.data.records || [];
        }
    }
    catch (error) {
        console.error('获取预约列表失败:', error);
    }
    finally {
        loading.value = false;
    }
};
// 初始化图表
const initChart = () => {
    if (!incomeChartRef.value)
        return;
    const chart = echarts.init(incomeChartRef.value);
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['收入', '订单数']
        },
        xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: { lineStyle: { color: '#dcdfe6' } },
            axisLabel: { color: '#606266' }
        },
        yAxis: [
            {
                type: 'value',
                name: '收入',
                axisLine: { lineStyle: { color: '#409EFF' } },
                axisLabel: { color: '#606266' },
                splitLine: { lineStyle: { color: '#ebeef5' } }
            },
            {
                type: 'value',
                name: '订单数',
                axisLine: { lineStyle: { color: '#67C23A' } },
                axisLabel: { color: '#606266' },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: '收入',
                type: 'bar',
                data: [1200, 1800, 1500, 2100, 1900, 2400, 2000],
                itemStyle: { color: '#409EFF' },
                barWidth: '40%'
            },
            {
                name: '订单数',
                type: 'line',
                yAxisIndex: 1,
                data: [3, 5, 4, 6, 5, 7, 6],
                smooth: true,
                lineStyle: { color: '#67C23A', width: 2 },
                itemStyle: { color: '#67C23A' }
            }
        ]
    };
    chart.setOption(option);
};
onMounted(() => {
    fetchDashboardStats();
    fetchProfile();
    fetchTodayAppointments();
    fetchOnlineStatus();
    setTimeout(initChart, 100);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['status-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pending-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pending-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pending-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['appointment-card']} */ ;
/** @type {__VLS_StyleScopedClasses['appointment-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-workbench-container" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-workbench-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "page-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
(__VLS_ctx.psychologistName);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "online-status-section" },
});
/** @type {__VLS_StyleScopedClasses['online-status-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "status-card" },
});
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "status-info" },
});
/** @type {__VLS_StyleScopedClasses['status-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "status-label" },
});
/** @type {__VLS_StyleScopedClasses['status-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "status-value" },
    ...{ class: (__VLS_ctx.getStatusClass(__VLS_ctx.onlineStatus)) },
});
/** @type {__VLS_StyleScopedClasses['status-value']} */ ;
(__VLS_ctx.getStatusText(__VLS_ctx.onlineStatus));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "status-toggle" },
});
/** @type {__VLS_StyleScopedClasses['status-toggle']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.onlineStatus),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "在线",
    inactiveText: "离线",
    loading: (__VLS_ctx.statusLoading),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.onlineStatus),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "在线",
    inactiveText: "离线",
    loading: (__VLS_ctx.statusLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: (__VLS_ctx.handleStatusChange) });
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "status-hint" },
});
/** @type {__VLS_StyleScopedClasses['status-hint']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-grid" },
});
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon blue" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['blue']} */ ;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    size: "32",
}));
const __VLS_9 = __VLS_8({
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
const { default: __VLS_12 } = __VLS_10.slots;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.Calendar} */
Calendar;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({}));
const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
// @ts-ignore
[psychologistName, getStatusClass, onlineStatus, onlineStatus, onlineStatus, getStatusText, statusLoading, handleStatusChange,];
var __VLS_10;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.stats.todayAppointments);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon gold" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['gold']} */ ;
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    size: "32",
}));
const __VLS_20 = __VLS_19({
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.Coin} */
Coin;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
// @ts-ignore
[stats,];
var __VLS_21;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.stats.todayIncome);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon purple" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['purple']} */ ;
let __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    size: "32",
}));
const __VLS_31 = __VLS_30({
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const { default: __VLS_34 } = __VLS_32.slots;
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.Star} */
Star;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({}));
const __VLS_37 = __VLS_36({}, ...__VLS_functionalComponentArgsRest(__VLS_36));
// @ts-ignore
[stats,];
var __VLS_32;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.stats.totalConsultations);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon green" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    size: "32",
}));
const __VLS_42 = __VLS_41({
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_45 } = __VLS_43.slots;
let __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.User} */
User;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({}));
const __VLS_48 = __VLS_47({}, ...__VLS_functionalComponentArgsRest(__VLS_47));
// @ts-ignore
[stats,];
var __VLS_43;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.stats.rating);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-section" },
});
/** @type {__VLS_StyleScopedClasses['pending-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-grid" },
});
/** @type {__VLS_StyleScopedClasses['pending-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goToAppointments(0);
            // @ts-ignore
            [stats, goToAppointments,];
        } },
    ...{ class: "pending-card" },
});
/** @type {__VLS_StyleScopedClasses['pending-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-icon" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['pending-icon']} */ ;
let __VLS_51;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    size: "24",
}));
const __VLS_53 = __VLS_52({
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
const { default: __VLS_56 } = __VLS_54.slots;
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.Clock} */
Clock;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({}));
const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
// @ts-ignore
[];
var __VLS_54;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-info" },
});
/** @type {__VLS_StyleScopedClasses['pending-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-count" },
});
/** @type {__VLS_StyleScopedClasses['pending-count']} */ ;
(__VLS_ctx.stats.pendingAppointments);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-label" },
});
/** @type {__VLS_StyleScopedClasses['pending-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goToAppointments(1);
            // @ts-ignore
            [stats, goToAppointments,];
        } },
    ...{ class: "pending-card" },
});
/** @type {__VLS_StyleScopedClasses['pending-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-icon" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['pending-icon']} */ ;
let __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    size: "24",
}));
const __VLS_64 = __VLS_63({
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
const { default: __VLS_67 } = __VLS_65.slots;
let __VLS_68;
/** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
CircleCheck;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({}));
const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
// @ts-ignore
[];
var __VLS_65;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-info" },
});
/** @type {__VLS_StyleScopedClasses['pending-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-count" },
});
/** @type {__VLS_StyleScopedClasses['pending-count']} */ ;
(__VLS_ctx.stats.confirmedAppointments);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-label" },
});
/** @type {__VLS_StyleScopedClasses['pending-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goToAppointments(7);
            // @ts-ignore
            [stats, goToAppointments,];
        } },
    ...{ class: "pending-card" },
});
/** @type {__VLS_StyleScopedClasses['pending-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-icon" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['pending-icon']} */ ;
let __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    size: "24",
}));
const __VLS_75 = __VLS_74({
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
const { default: __VLS_78 } = __VLS_76.slots;
let __VLS_79;
/** @ts-ignore @type {typeof __VLS_components.VideoPlay} */
VideoPlay;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({}));
const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
// @ts-ignore
[];
var __VLS_76;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-info" },
});
/** @type {__VLS_StyleScopedClasses['pending-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-count" },
});
/** @type {__VLS_StyleScopedClasses['pending-count']} */ ;
(__VLS_ctx.stats.toStartAppointments);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-label" },
});
/** @type {__VLS_StyleScopedClasses['pending-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.goToAppointments(3);
            // @ts-ignore
            [stats, goToAppointments,];
        } },
    ...{ class: "pending-card" },
});
/** @type {__VLS_StyleScopedClasses['pending-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-icon" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['pending-icon']} */ ;
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    size: "24",
}));
const __VLS_86 = __VLS_85({
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const { default: __VLS_89 } = __VLS_87.slots;
let __VLS_90;
/** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
ChatDotRound;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({}));
const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
// @ts-ignore
[];
var __VLS_87;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-info" },
});
/** @type {__VLS_StyleScopedClasses['pending-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-count" },
});
/** @type {__VLS_StyleScopedClasses['pending-count']} */ ;
(__VLS_ctx.stats.inProgressAppointments);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-label" },
});
/** @type {__VLS_StyleScopedClasses['pending-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.goToIncome) },
    ...{ class: "pending-card" },
});
/** @type {__VLS_StyleScopedClasses['pending-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-icon" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['pending-icon']} */ ;
let __VLS_95;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
    size: "24",
}));
const __VLS_97 = __VLS_96({
    size: "24",
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
const { default: __VLS_100 } = __VLS_98.slots;
let __VLS_101;
/** @ts-ignore @type {typeof __VLS_components.Wallet} */
Wallet;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({}));
const __VLS_103 = __VLS_102({}, ...__VLS_functionalComponentArgsRest(__VLS_102));
// @ts-ignore
[stats, goToIncome,];
var __VLS_98;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pending-info" },
});
/** @type {__VLS_StyleScopedClasses['pending-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-count" },
});
/** @type {__VLS_StyleScopedClasses['pending-count']} */ ;
(__VLS_ctx.stats.pendingWithdrawals);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "pending-label" },
});
/** @type {__VLS_StyleScopedClasses['pending-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "today-section" },
});
/** @type {__VLS_StyleScopedClasses['today-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "appointments-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['appointments-list']} */ ;
if (__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading) {
    let __VLS_106;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
        description: "今日暂无预约",
    }));
    const __VLS_108 = __VLS_107({
        description: "今日暂无预约",
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "appointment-cards" },
    });
    /** @type {__VLS_StyleScopedClasses['appointment-cards']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.todayAppointments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-card" },
            key: (item.id),
        });
        /** @type {__VLS_StyleScopedClasses['appointment-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-time" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-time']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "time-slot" },
        });
        /** @type {__VLS_StyleScopedClasses['time-slot']} */ ;
        (__VLS_ctx.formatDate(item.appointmentTime));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "time-range" },
        });
        /** @type {__VLS_StyleScopedClasses['time-range']} */ ;
        (__VLS_ctx.formatTime(item.appointmentTime));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-user" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-user']} */ ;
        let __VLS_111;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
            size: (48),
            src: (item.userHead),
        }));
        const __VLS_113 = __VLS_112({
            size: (48),
            src: (item.userHead),
        }, ...__VLS_functionalComponentArgsRest(__VLS_112));
        const { default: __VLS_116 } = __VLS_114.slots;
        let __VLS_117;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({}));
        const __VLS_119 = __VLS_118({}, ...__VLS_functionalComponentArgsRest(__VLS_118));
        const { default: __VLS_122 } = __VLS_120.slots;
        let __VLS_123;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({}));
        const __VLS_125 = __VLS_124({}, ...__VLS_functionalComponentArgsRest(__VLS_124));
        // @ts-ignore
        [stats, vLoading, loading, loading, todayAppointments, todayAppointments, formatDate, formatTime,];
        var __VLS_120;
        // @ts-ignore
        [];
        var __VLS_114;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-info" },
        });
        /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "user-name" },
        });
        /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
        (item.userName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "user-problem" },
        });
        /** @type {__VLS_StyleScopedClasses['user-problem']} */ ;
        (item.userBasicInfo?.problems || '-');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-service" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-service']} */ ;
        let __VLS_128;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({}));
        const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
        const { default: __VLS_133 } = __VLS_131.slots;
        (__VLS_ctx.getServiceTypeName(item.serviceType));
        // @ts-ignore
        [getServiceTypeName,];
        var __VLS_131;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "service-price" },
        });
        /** @type {__VLS_StyleScopedClasses['service-price']} */ ;
        (item.fee);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-status" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-status']} */ ;
        let __VLS_134;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
            type: (__VLS_ctx.getStatusType(item.status)),
        }));
        const __VLS_136 = __VLS_135({
            type: (__VLS_ctx.getStatusType(item.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_135));
        const { default: __VLS_139 } = __VLS_137.slots;
        (item.statusText || __VLS_ctx.getStatusName(item.status));
        // @ts-ignore
        [getStatusType, getStatusName,];
        var __VLS_137;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-actions']} */ ;
        if (item.status === 0) {
            let __VLS_140;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_142 = __VLS_141({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_141));
            let __VLS_145;
            const __VLS_146 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!(item.status === 0))
                            return;
                        __VLS_ctx.acceptAppointment(item);
                        // @ts-ignore
                        [acceptAppointment,];
                    } });
            const { default: __VLS_147 } = __VLS_143.slots;
            // @ts-ignore
            [];
            var __VLS_143;
            var __VLS_144;
            let __VLS_148;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
                ...{ 'onClick': {} },
                type: "danger",
                size: "small",
            }));
            const __VLS_150 = __VLS_149({
                ...{ 'onClick': {} },
                type: "danger",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_149));
            let __VLS_153;
            const __VLS_154 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!(item.status === 0))
                            return;
                        __VLS_ctx.showRejectDialog(item);
                        // @ts-ignore
                        [showRejectDialog,];
                    } });
            const { default: __VLS_155 } = __VLS_151.slots;
            // @ts-ignore
            [];
            var __VLS_151;
            var __VLS_152;
        }
        else if (item.status === 7) {
            let __VLS_156;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
                ...{ 'onClick': {} },
                type: "success",
                size: "small",
            }));
            const __VLS_158 = __VLS_157({
                ...{ 'onClick': {} },
                type: "success",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_157));
            let __VLS_161;
            const __VLS_162 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!(item.status === 7))
                            return;
                        __VLS_ctx.showStartDialog(item);
                        // @ts-ignore
                        [showStartDialog,];
                    } });
            const { default: __VLS_163 } = __VLS_159.slots;
            let __VLS_164;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({}));
            const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
            const { default: __VLS_169 } = __VLS_167.slots;
            let __VLS_170;
            /** @ts-ignore @type {typeof __VLS_components.VideoPlay} */
            VideoPlay;
            // @ts-ignore
            const __VLS_171 = __VLS_asFunctionalComponent1(__VLS_170, new __VLS_170({}));
            const __VLS_172 = __VLS_171({}, ...__VLS_functionalComponentArgsRest(__VLS_171));
            // @ts-ignore
            [];
            var __VLS_167;
            // @ts-ignore
            [];
            var __VLS_159;
            var __VLS_160;
            let __VLS_175;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_177 = __VLS_176({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_176));
            let __VLS_180;
            const __VLS_181 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!(item.status === 7))
                            return;
                        __VLS_ctx.openChat(item);
                        // @ts-ignore
                        [openChat,];
                    } });
            const { default: __VLS_182 } = __VLS_178.slots;
            // @ts-ignore
            [];
            var __VLS_178;
            var __VLS_179;
        }
        else if (item.status === 3) {
            let __VLS_183;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_184 = __VLS_asFunctionalComponent1(__VLS_183, new __VLS_183({
                ...{ 'onClick': {} },
                type: "warning",
                size: "small",
            }));
            const __VLS_185 = __VLS_184({
                ...{ 'onClick': {} },
                type: "warning",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_184));
            let __VLS_188;
            const __VLS_189 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 7))
                            return;
                        if (!(item.status === 3))
                            return;
                        __VLS_ctx.completeConsultation(item);
                        // @ts-ignore
                        [completeConsultation,];
                    } });
            const { default: __VLS_190 } = __VLS_186.slots;
            let __VLS_191;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({}));
            const __VLS_193 = __VLS_192({}, ...__VLS_functionalComponentArgsRest(__VLS_192));
            const { default: __VLS_196 } = __VLS_194.slots;
            let __VLS_197;
            /** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
            CircleCheck;
            // @ts-ignore
            const __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197({}));
            const __VLS_199 = __VLS_198({}, ...__VLS_functionalComponentArgsRest(__VLS_198));
            // @ts-ignore
            [];
            var __VLS_194;
            // @ts-ignore
            [];
            var __VLS_186;
            var __VLS_187;
            let __VLS_202;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_204 = __VLS_203({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_203));
            let __VLS_207;
            const __VLS_208 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 7))
                            return;
                        if (!(item.status === 3))
                            return;
                        __VLS_ctx.openChat(item);
                        // @ts-ignore
                        [openChat,];
                    } });
            const { default: __VLS_209 } = __VLS_205.slots;
            // @ts-ignore
            [];
            var __VLS_205;
            var __VLS_206;
        }
        else if (item.status === 1) {
            let __VLS_210;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_212 = __VLS_211({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_211));
            let __VLS_215;
            const __VLS_216 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 7))
                            return;
                        if (!!(item.status === 3))
                            return;
                        if (!(item.status === 1))
                            return;
                        __VLS_ctx.openChat(item);
                        // @ts-ignore
                        [openChat,];
                    } });
            const { default: __VLS_217 } = __VLS_213.slots;
            // @ts-ignore
            [];
            var __VLS_213;
            var __VLS_214;
        }
        else {
            let __VLS_218;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218({
                ...{ 'onClick': {} },
                size: "small",
            }));
            const __VLS_220 = __VLS_219({
                ...{ 'onClick': {} },
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_219));
            let __VLS_223;
            const __VLS_224 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.todayAppointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 7))
                            return;
                        if (!!(item.status === 3))
                            return;
                        if (!!(item.status === 1))
                            return;
                        __VLS_ctx.viewDetail(item);
                        // @ts-ignore
                        [viewDetail,];
                    } });
            const { default: __VLS_225 } = __VLS_221.slots;
            // @ts-ignore
            [];
            var __VLS_221;
            var __VLS_222;
        }
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "income-section" },
});
/** @type {__VLS_StyleScopedClasses['income-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "income-chart" },
});
/** @type {__VLS_StyleScopedClasses['income-chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "incomeChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
let __VLS_226;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent1(__VLS_226, new __VLS_226({
    modelValue: (__VLS_ctx.rejectDialogVisible),
    title: "拒绝预约",
    width: "400px",
}));
const __VLS_228 = __VLS_227({
    modelValue: (__VLS_ctx.rejectDialogVisible),
    title: "拒绝预约",
    width: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_227));
const { default: __VLS_231 } = __VLS_229.slots;
let __VLS_232;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent1(__VLS_232, new __VLS_232({}));
const __VLS_234 = __VLS_233({}, ...__VLS_functionalComponentArgsRest(__VLS_233));
const { default: __VLS_237 } = __VLS_235.slots;
let __VLS_238;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_239 = __VLS_asFunctionalComponent1(__VLS_238, new __VLS_238({
    label: "拒绝原因",
    required: true,
}));
const __VLS_240 = __VLS_239({
    label: "拒绝原因",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_239));
const { default: __VLS_243 } = __VLS_241.slots;
let __VLS_244;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent1(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.rejectReason),
    type: "textarea",
    rows: (3),
    placeholder: "请输入拒绝原因",
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.rejectReason),
    type: "textarea",
    rows: (3),
    placeholder: "请输入拒绝原因",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
// @ts-ignore
[rejectDialogVisible, rejectReason,];
var __VLS_241;
// @ts-ignore
[];
var __VLS_235;
{
    const { footer: __VLS_249 } = __VLS_229.slots;
    let __VLS_250;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent1(__VLS_250, new __VLS_250({
        ...{ 'onClick': {} },
    }));
    const __VLS_252 = __VLS_251({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    let __VLS_255;
    const __VLS_256 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.rejectDialogVisible = false;
                // @ts-ignore
                [rejectDialogVisible,];
            } });
    const { default: __VLS_257 } = __VLS_253.slots;
    // @ts-ignore
    [];
    var __VLS_253;
    var __VLS_254;
    let __VLS_258;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_259 = __VLS_asFunctionalComponent1(__VLS_258, new __VLS_258({
        ...{ 'onClick': {} },
        type: "danger",
    }));
    const __VLS_260 = __VLS_259({
        ...{ 'onClick': {} },
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_259));
    let __VLS_263;
    const __VLS_264 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmReject) });
    const { default: __VLS_265 } = __VLS_261.slots;
    // @ts-ignore
    [confirmReject,];
    var __VLS_261;
    var __VLS_262;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_229;
let __VLS_266;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({
    modelValue: (__VLS_ctx.startDialogVisible),
    title: "开始咨询",
    width: "400px",
}));
const __VLS_268 = __VLS_267({
    modelValue: (__VLS_ctx.startDialogVisible),
    title: "开始咨询",
    width: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
const { default: __VLS_271 } = __VLS_269.slots;
let __VLS_272;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent1(__VLS_272, new __VLS_272({
    labelWidth: "100px",
}));
const __VLS_274 = __VLS_273({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
const { default: __VLS_277 } = __VLS_275.slots;
let __VLS_278;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_279 = __VLS_asFunctionalComponent1(__VLS_278, new __VLS_278({
    label: "咨询开始时间",
}));
const __VLS_280 = __VLS_279({
    label: "咨询开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_279));
const { default: __VLS_283 } = __VLS_281.slots;
let __VLS_284;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent1(__VLS_284, new __VLS_284({
    modelValue: (__VLS_ctx.startTime),
    type: "datetime",
    placeholder: "选择开始时间（可选）",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}));
const __VLS_286 = __VLS_285({
    modelValue: (__VLS_ctx.startTime),
    type: "datetime",
    placeholder: "选择开始时间（可选）",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
// @ts-ignore
[startDialogVisible, startTime,];
var __VLS_281;
if (__VLS_ctx.currentAppointment?.videoLink) {
    let __VLS_289;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_290 = __VLS_asFunctionalComponent1(__VLS_289, new __VLS_289({
        label: "视频链接",
    }));
    const __VLS_291 = __VLS_290({
        label: "视频链接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_290));
    const { default: __VLS_294 } = __VLS_292.slots;
    let __VLS_295;
    /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
    elLink;
    // @ts-ignore
    const __VLS_296 = __VLS_asFunctionalComponent1(__VLS_295, new __VLS_295({
        type: "primary",
        href: (__VLS_ctx.currentAppointment?.videoLink),
        target: "_blank",
    }));
    const __VLS_297 = __VLS_296({
        type: "primary",
        href: (__VLS_ctx.currentAppointment?.videoLink),
        target: "_blank",
    }, ...__VLS_functionalComponentArgsRest(__VLS_296));
    const { default: __VLS_300 } = __VLS_298.slots;
    (__VLS_ctx.currentAppointment?.videoLink);
    // @ts-ignore
    [currentAppointment, currentAppointment, currentAppointment,];
    var __VLS_298;
    // @ts-ignore
    [];
    var __VLS_292;
}
// @ts-ignore
[];
var __VLS_275;
{
    const { footer: __VLS_301 } = __VLS_269.slots;
    let __VLS_302;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_303 = __VLS_asFunctionalComponent1(__VLS_302, new __VLS_302({
        ...{ 'onClick': {} },
    }));
    const __VLS_304 = __VLS_303({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_303));
    let __VLS_307;
    const __VLS_308 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.startDialogVisible = false;
                // @ts-ignore
                [startDialogVisible,];
            } });
    const { default: __VLS_309 } = __VLS_305.slots;
    // @ts-ignore
    [];
    var __VLS_305;
    var __VLS_306;
    let __VLS_310;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_311 = __VLS_asFunctionalComponent1(__VLS_310, new __VLS_310({
        ...{ 'onClick': {} },
        type: "success",
    }));
    const __VLS_312 = __VLS_311({
        ...{ 'onClick': {} },
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_311));
    let __VLS_315;
    const __VLS_316 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmStartConsultation) });
    const { default: __VLS_317 } = __VLS_313.slots;
    // @ts-ignore
    [confirmStartConsultation,];
    var __VLS_313;
    var __VLS_314;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_269;
let __VLS_318;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_319 = __VLS_asFunctionalComponent1(__VLS_318, new __VLS_318({
    modelValue: (__VLS_ctx.videoLinkDialogVisible),
    title: "提供视频会议链接",
    width: "500px",
}));
const __VLS_320 = __VLS_319({
    modelValue: (__VLS_ctx.videoLinkDialogVisible),
    title: "提供视频会议链接",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_319));
const { default: __VLS_323 } = __VLS_321.slots;
let __VLS_324;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent1(__VLS_324, new __VLS_324({
    labelWidth: "100px",
}));
const __VLS_326 = __VLS_325({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
const { default: __VLS_329 } = __VLS_327.slots;
let __VLS_330;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_331 = __VLS_asFunctionalComponent1(__VLS_330, new __VLS_330({
    label: "预约用户",
}));
const __VLS_332 = __VLS_331({
    label: "预约用户",
}, ...__VLS_functionalComponentArgsRest(__VLS_331));
const { default: __VLS_335 } = __VLS_333.slots;
(__VLS_ctx.currentAppointment?.userName);
// @ts-ignore
[currentAppointment, videoLinkDialogVisible,];
var __VLS_333;
let __VLS_336;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_337 = __VLS_asFunctionalComponent1(__VLS_336, new __VLS_336({
    label: "咨询方式",
}));
const __VLS_338 = __VLS_337({
    label: "咨询方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_337));
const { default: __VLS_341 } = __VLS_339.slots;
(__VLS_ctx.getServiceTypeName(__VLS_ctx.currentAppointment?.serviceType));
// @ts-ignore
[getServiceTypeName, currentAppointment,];
var __VLS_339;
let __VLS_342;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_343 = __VLS_asFunctionalComponent1(__VLS_342, new __VLS_342({
    label: "视频平台",
    required: true,
}));
const __VLS_344 = __VLS_343({
    label: "视频平台",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_343));
const { default: __VLS_347 } = __VLS_345.slots;
let __VLS_348;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent1(__VLS_348, new __VLS_348({
    modelValue: (__VLS_ctx.videoForm.platform),
    placeholder: "选择视频会议平台",
}));
const __VLS_350 = __VLS_349({
    modelValue: (__VLS_ctx.videoForm.platform),
    placeholder: "选择视频会议平台",
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
const { default: __VLS_353 } = __VLS_351.slots;
let __VLS_354;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_355 = __VLS_asFunctionalComponent1(__VLS_354, new __VLS_354({
    label: "腾讯会议",
    value: "tencent",
}));
const __VLS_356 = __VLS_355({
    label: "腾讯会议",
    value: "tencent",
}, ...__VLS_functionalComponentArgsRest(__VLS_355));
let __VLS_359;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_360 = __VLS_asFunctionalComponent1(__VLS_359, new __VLS_359({
    label: "钉钉会议",
    value: "dingtalk",
}));
const __VLS_361 = __VLS_360({
    label: "钉钉会议",
    value: "dingtalk",
}, ...__VLS_functionalComponentArgsRest(__VLS_360));
let __VLS_364;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent1(__VLS_364, new __VLS_364({
    label: "微信视频",
    value: "wechat",
}));
const __VLS_366 = __VLS_365({
    label: "微信视频",
    value: "wechat",
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
let __VLS_369;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_370 = __VLS_asFunctionalComponent1(__VLS_369, new __VLS_369({
    label: "其他",
    value: "other",
}));
const __VLS_371 = __VLS_370({
    label: "其他",
    value: "other",
}, ...__VLS_functionalComponentArgsRest(__VLS_370));
// @ts-ignore
[videoForm,];
var __VLS_351;
// @ts-ignore
[];
var __VLS_345;
let __VLS_374;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_375 = __VLS_asFunctionalComponent1(__VLS_374, new __VLS_374({
    label: "会议链接",
    required: true,
}));
const __VLS_376 = __VLS_375({
    label: "会议链接",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_375));
const { default: __VLS_379 } = __VLS_377.slots;
let __VLS_380;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_381 = __VLS_asFunctionalComponent1(__VLS_380, new __VLS_380({
    modelValue: (__VLS_ctx.videoForm.link),
    placeholder: "请输入视频会议链接或会议号",
}));
const __VLS_382 = __VLS_381({
    modelValue: (__VLS_ctx.videoForm.link),
    placeholder: "请输入视频会议链接或会议号",
}, ...__VLS_functionalComponentArgsRest(__VLS_381));
// @ts-ignore
[videoForm,];
var __VLS_377;
let __VLS_385;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_386 = __VLS_asFunctionalComponent1(__VLS_385, new __VLS_385({
    label: "开始时间",
}));
const __VLS_387 = __VLS_386({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_386));
const { default: __VLS_390 } = __VLS_388.slots;
let __VLS_391;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_392 = __VLS_asFunctionalComponent1(__VLS_391, new __VLS_391({
    modelValue: (__VLS_ctx.videoForm.startTime),
    type: "datetime",
    placeholder: "选择咨询开始时间（可选）",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}));
const __VLS_393 = __VLS_392({
    modelValue: (__VLS_ctx.videoForm.startTime),
    type: "datetime",
    placeholder: "选择咨询开始时间（可选）",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_392));
// @ts-ignore
[videoForm,];
var __VLS_388;
// @ts-ignore
[];
var __VLS_327;
{
    const { footer: __VLS_396 } = __VLS_321.slots;
    let __VLS_397;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_398 = __VLS_asFunctionalComponent1(__VLS_397, new __VLS_397({
        ...{ 'onClick': {} },
    }));
    const __VLS_399 = __VLS_398({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_398));
    let __VLS_402;
    const __VLS_403 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.videoLinkDialogVisible = false;
                // @ts-ignore
                [videoLinkDialogVisible,];
            } });
    const { default: __VLS_404 } = __VLS_400.slots;
    // @ts-ignore
    [];
    var __VLS_400;
    var __VLS_401;
    let __VLS_405;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_406 = __VLS_asFunctionalComponent1(__VLS_405, new __VLS_405({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_407 = __VLS_406({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_406));
    let __VLS_410;
    const __VLS_411 = ({ click: {} },
        { onClick: (__VLS_ctx.submitVideoLink) });
    const { default: __VLS_412 } = __VLS_408.slots;
    // @ts-ignore
    [submitVideoLink,];
    var __VLS_408;
    var __VLS_409;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_321;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
