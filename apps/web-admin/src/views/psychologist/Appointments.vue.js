/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, ChatDotRound, VideoPlay, CircleCheck, VideoCamera, Close, Star, Wallet } from '@element-plus/icons-vue';
import { getMyAppointments, handleAppointment, startConsultation, completeConsultationApi, sendVideoLink, getAppointmentDetail } from '@/api/psychologistAdminPage';
const router = useRouter();
const loading = ref(false);
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const appointments = ref([]);
// 详情弹窗
const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref(null);
// 拒绝对话框
const rejectDialogVisible = ref(false);
const rejectReason = ref('');
const currentRejectItem = ref(null);
// 接受预约对话框
const confirmDialogVisible = ref(false);
const confirmVideoLink = ref('');
const confirmOfflineAddress = ref('');
// 开始咨询对话框
const startDialogVisible = ref(false);
const startTime = ref('');
const currentAppointment = ref(null);
// 视频链接/线下地址对话框
const videoLinkDialogVisible = ref(false);
const videoLink = ref('');
const offlineAddress = ref('');
const videoStartTime = ref('');
const videoEndTime = ref('');
const serviceTypeMap = {
    text: '图文咨询', video: '视频咨询', voice: '语音咨询', offline: '线下面询',
    TEXT: '图文咨询', VIDEO: '视频咨询', VOICE: '语音咨询', OFFLINE: '线下面询'
};
const statusMap = {
    0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 7: '待进行', 8: '已评价'
};
const getServiceTypeName = (type) => serviceTypeMap[type] || type;
const getStatusName = (status) => statusMap[status] || '未知';
const getStatusType = (status) => {
    const types = {
        0: 'warning', 1: 'info', 2: 'danger', 3: 'primary', 4: 'success', 5: 'info', 6: 'danger', 7: 'warning', 8: 'success'
    };
    return types[status] || 'info';
};
const handleTabChange = () => {
    currentPage.value = 1;
    fetchAppointments();
};
const formatDateTime = (dateStr) => {
    if (!dateStr)
        return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime()))
        return '-';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
// 格式化视频日期 - 从预约时间获取
const formatVideoDate = computed(() => {
    if (!currentAppointment.value?.appointmentTime)
        return '-';
    const d = new Date(currentAppointment.value.appointmentTime);
    if (isNaN(d.getTime()))
        return '-';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});
// 时段判断：9点-14点为上午，14点-19点为下午，19点后为晚上
const timeSlot = computed(() => {
    if (!currentAppointment.value?.appointmentTime)
        return '';
    const d = new Date(currentAppointment.value.appointmentTime);
    if (isNaN(d.getTime()))
        return '';
    const hour = d.getHours();
    if (hour >= 9 && hour < 14)
        return '上午';
    if (hour >= 14 && hour < 19)
        return '下午';
    return '晚上';
});
// 时间选择器校验方法 - 结束时间不能早于开始时间
const isEndTimeValid = (time) => {
    if (!videoStartTime.value || !time)
        return true;
    return time > videoStartTime.value;
};
const fetchAppointments = () => {
    loading.value = true;
    const params = { page: currentPage.value, size: pageSize.value };
    if (statusFilter.value !== 'all') {
        params.status = parseInt(statusFilter.value);
    }
    getMyAppointments(params).then((res) => {
        if (res.code === 200) {
            appointments.value = res.data?.records || [];
            total.value = res.data?.total || 0;
        }
        else {
            ElMessage.error(res.message || '获取预约列表失败');
        }
        loading.value = false;
    }).catch((err) => {
        console.error('获取预约列表失败:', err);
        loading.value = false;
    });
};
const showConfirmDialog = (item) => {
    currentAppointment.value = item;
    confirmVideoLink.value = '';
    confirmOfflineAddress.value = '';
    confirmDialogVisible.value = true;
};
const confirmAccept = async () => {
    try {
        // 接受预约后状态变为"已确认"
        // 线上咨询的视频链接由咨询师在"已确认"状态下通过"发送视频链接"功能发送
        const res = await handleAppointment(currentAppointment.value.id, true);
        if (res.code === 200) {
            ElMessage.success('已接受预约');
            confirmDialogVisible.value = false;
            fetchAppointments();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
const showRejectDialog = (item) => {
    currentRejectItem.value = item;
    rejectReason.value = '';
    rejectDialogVisible.value = true;
};
const confirmReject = async () => {
    if (!rejectReason.value.trim()) {
        ElMessage.warning('请输入拒绝原因');
        return;
    }
    try {
        const res = await handleAppointment(currentRejectItem.value.id, false, '', rejectReason.value);
        if (res.code === 200) {
            ElMessage.success('已拒绝');
            rejectDialogVisible.value = false;
            fetchAppointments();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
const openChat = (item) => {
    router.push(`/psychologist-admin/chat?appointmentId=${item.id}`);
};
const showStartDialog = (item) => {
    currentAppointment.value = item;
    startTime.value = '';
    startDialogVisible.value = true;
};
const confirmStartConsultation = async () => {
    try {
        const res = await startConsultation({
            appointmentId: currentAppointment.value.id,
            startTime: startTime.value || undefined
        });
        if (res.code === 200) {
            ElMessage.success('咨询已开始');
            startDialogVisible.value = false;
            fetchAppointments();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
const showVideoLinkDialog = (item) => {
    currentAppointment.value = item;
    videoLink.value = item.videoLink || '';
    offlineAddress.value = '';
    videoStartTime.value = '';
    videoEndTime.value = '';
    videoLinkDialogVisible.value = true;
};
const confirmSendVideoLink = async () => {
    try {
        const serviceType = currentAppointment.value?.serviceType;
        let videoLinkData = '';
        let offlineAddressData = '';
        // 根据服务类型决定传递什么参数
        if (serviceType === 'VIDEO' || serviceType === 'video' || serviceType === 'VOICE' || serviceType === 'voice') {
            if (!videoLink.value.trim()) {
                ElMessage.warning('请输入视频链接');
                return;
            }
            videoLinkData = videoLink.value;
        }
        else if (serviceType === 'OFFLINE' || serviceType === 'offline') {
            if (!offlineAddress.value.trim()) {
                ElMessage.warning('请输入线下地址');
                return;
            }
            offlineAddressData = offlineAddress.value;
        }
        else {
            videoLinkData = videoLink.value;
        }
        // 将 HH:mm 格式转换为 YYYY-MM-DDTHH:mm:ss 格式
        const appointmentDate = currentAppointment.value?.appointmentTime?.split('T')[0] || '';
        const startTimeFormatted = videoStartTime.value ? `${appointmentDate}T${videoStartTime.value}:00` : undefined;
        const endTimeFormatted = videoEndTime.value ? `${appointmentDate}T${videoEndTime.value}:00` : undefined;
        const res = await sendVideoLink({
            appointmentId: currentAppointment.value.id,
            videoLink: videoLinkData || undefined,
            offlineAddress: offlineAddressData || undefined,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted
        });
        if (res.code === 200) {
            ElMessage.success('已发送并进入待进行状态');
            videoLinkDialogVisible.value = false;
            fetchAppointments();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
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
            fetchAppointments();
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
const showDetailDialog = async (item) => {
    detailDialogVisible.value = true;
    detailLoading.value = true;
    detailData.value = null;
    try {
        const res = await getAppointmentDetail(item.id);
        if (res.code === 200) {
            detailData.value = res.data;
        }
        else {
            ElMessage.error(res.message || '获取详情失败');
        }
    }
    catch (e) {
        console.error('获取详情失败', e);
        ElMessage.error('获取详情失败');
    }
    finally {
        detailLoading.value = false;
    }
};
const formatUserBasicInfo = (value) => {
    if (!value)
        return '-';
    if (typeof value === 'object') {
        return value.problems || value.personalSituation || '-';
    }
    try {
        const parsed = JSON.parse(value);
        return parsed.problems || parsed.personalSituation || '-';
    }
    catch {
        return value || '-';
    }
};
onMounted(() => {
    fetchAppointments();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['accept-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['income-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-appointments-container" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-appointments-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ tabChange: {} },
    { onTabChange: (__VLS_ctx.handleTabChange) });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    label: "全部",
    name: "all",
}));
const __VLS_10 = __VLS_9({
    label: "全部",
    name: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    label: "待审核",
    name: "0",
}));
const __VLS_15 = __VLS_14({
    label: "待审核",
    name: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "已确认",
    name: "1",
}));
const __VLS_20 = __VLS_19({
    label: "已确认",
    name: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    label: "已拒绝",
    name: "2",
}));
const __VLS_25 = __VLS_24({
    label: "已拒绝",
    name: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    label: "进行中",
    name: "3",
}));
const __VLS_30 = __VLS_29({
    label: "进行中",
    name: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    label: "已完成",
    name: "4",
}));
const __VLS_35 = __VLS_34({
    label: "已完成",
    name: "4",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    label: "已取消",
    name: "5",
}));
const __VLS_40 = __VLS_39({
    label: "已取消",
    name: "5",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    label: "待进行",
    name: "7",
}));
const __VLS_45 = __VLS_44({
    label: "待进行",
    name: "7",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    label: "已评价",
    name: "8",
}));
const __VLS_50 = __VLS_49({
    label: "已评价",
    name: "8",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
// @ts-ignore
[statusFilter, handleTabChange,];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "appointments-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['appointments-list']} */ ;
if (__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading) {
    let __VLS_53;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        description: "暂无预约记录",
    }));
    const __VLS_55 = __VLS_54({
        description: "暂无预约记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "appointment-cards" },
    });
    /** @type {__VLS_StyleScopedClasses['appointment-cards']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.appointments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (item.id),
            ...{ class: "appointment-card" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-info" },
        });
        /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
        let __VLS_58;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            size: (48),
            src: (item.userHead),
        }));
        const __VLS_60 = __VLS_59({
            size: (48),
            src: (item.userHead),
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        const { default: __VLS_63 } = __VLS_61.slots;
        let __VLS_64;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({}));
        const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
        const { default: __VLS_69 } = __VLS_67.slots;
        let __VLS_70;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({}));
        const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
        // @ts-ignore
        [vLoading, loading, loading, appointments, appointments,];
        var __VLS_67;
        // @ts-ignore
        [];
        var __VLS_61;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-text" },
        });
        /** @type {__VLS_StyleScopedClasses['info-text']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "user-name" },
        });
        /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
        (item.userName || '匿名用户');
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "appointment-time" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-time']} */ ;
        (__VLS_ctx.formatDateTime(item.createTime));
        let __VLS_75;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
            type: (__VLS_ctx.getStatusType(item.status)),
        }));
        const __VLS_77 = __VLS_76({
            type: (__VLS_ctx.getStatusType(item.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        const { default: __VLS_80 } = __VLS_78.slots;
        (item.statusText || __VLS_ctx.getStatusName(item.status));
        // @ts-ignore
        [formatDateTime, getStatusType, getStatusName,];
        var __VLS_78;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-body" },
        });
        /** @type {__VLS_StyleScopedClasses['card-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-row" },
        });
        /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (__VLS_ctx.getServiceTypeName(item.serviceType));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-row" },
        });
        /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (__VLS_ctx.formatDateTime(item.appointmentTime));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-row" },
        });
        /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value price" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        /** @type {__VLS_StyleScopedClasses['price']} */ ;
        (item.fee ? `¥${item.fee}` : '-');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-row" },
        });
        /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value problem" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        /** @type {__VLS_StyleScopedClasses['problem']} */ ;
        (item.userBasicInfo?.problems || '-');
        if (item.rejectReason) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "info-row" },
            });
            /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "label" },
            });
            /** @type {__VLS_StyleScopedClasses['label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "value" },
            });
            /** @type {__VLS_StyleScopedClasses['value']} */ ;
            (item.rejectReason);
        }
        if (item.videoLink) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "info-row" },
            });
            /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "label" },
            });
            /** @type {__VLS_StyleScopedClasses['label']} */ ;
            let __VLS_81;
            /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
            elLink;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
                type: "primary",
                href: (item.videoLink),
                target: "_blank",
            }));
            const __VLS_83 = __VLS_82({
                type: "primary",
                href: (item.videoLink),
                target: "_blank",
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            const { default: __VLS_86 } = __VLS_84.slots;
            (item.videoLink);
            // @ts-ignore
            [formatDateTime, getServiceTypeName,];
            var __VLS_84;
        }
        if (item.startTime) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "info-row" },
            });
            /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "label" },
            });
            /** @type {__VLS_StyleScopedClasses['label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "value" },
            });
            /** @type {__VLS_StyleScopedClasses['value']} */ ;
            (__VLS_ctx.formatDateTime(item.startTime));
        }
        if (item.endTime) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "info-row" },
            });
            /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "label" },
            });
            /** @type {__VLS_StyleScopedClasses['label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "value" },
            });
            /** @type {__VLS_StyleScopedClasses['value']} */ ;
            (__VLS_ctx.formatDateTime(item.endTime));
        }
        if (item.ratingScore) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "info-row" },
            });
            /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "label" },
            });
            /** @type {__VLS_StyleScopedClasses['label']} */ ;
            let __VLS_87;
            /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
            elRate;
            // @ts-ignore
            const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
                modelValue: (item.ratingScore),
                disabled: true,
                showScore: true,
            }));
            const __VLS_89 = __VLS_88({
                modelValue: (item.ratingScore),
                disabled: true,
                showScore: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_88));
        }
        if (item.ratingContent) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "info-row" },
            });
            /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "label" },
            });
            /** @type {__VLS_StyleScopedClasses['label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "value" },
            });
            /** @type {__VLS_StyleScopedClasses['value']} */ ;
            (item.ratingContent);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
        if (item.status === 0) {
            let __VLS_92;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_94 = __VLS_93({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_93));
            let __VLS_97;
            const __VLS_98 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!(item.status === 0))
                            return;
                        __VLS_ctx.showConfirmDialog(item);
                        // @ts-ignore
                        [formatDateTime, formatDateTime, showConfirmDialog,];
                    } });
            const { default: __VLS_99 } = __VLS_95.slots;
            let __VLS_100;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({}));
            const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
            const { default: __VLS_105 } = __VLS_103.slots;
            let __VLS_106;
            /** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
            CircleCheck;
            // @ts-ignore
            const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({}));
            const __VLS_108 = __VLS_107({}, ...__VLS_functionalComponentArgsRest(__VLS_107));
            // @ts-ignore
            [];
            var __VLS_103;
            // @ts-ignore
            [];
            var __VLS_95;
            var __VLS_96;
            let __VLS_111;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
                ...{ 'onClick': {} },
                type: "danger",
                size: "small",
            }));
            const __VLS_113 = __VLS_112({
                ...{ 'onClick': {} },
                type: "danger",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_112));
            let __VLS_116;
            const __VLS_117 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!(item.status === 0))
                            return;
                        __VLS_ctx.showRejectDialog(item);
                        // @ts-ignore
                        [showRejectDialog,];
                    } });
            const { default: __VLS_118 } = __VLS_114.slots;
            let __VLS_119;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({}));
            const __VLS_121 = __VLS_120({}, ...__VLS_functionalComponentArgsRest(__VLS_120));
            const { default: __VLS_124 } = __VLS_122.slots;
            let __VLS_125;
            /** @ts-ignore @type {typeof __VLS_components.Close} */
            Close;
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({}));
            const __VLS_127 = __VLS_126({}, ...__VLS_functionalComponentArgsRest(__VLS_126));
            // @ts-ignore
            [];
            var __VLS_122;
            // @ts-ignore
            [];
            var __VLS_114;
            var __VLS_115;
        }
        else if (item.status === 1) {
            let __VLS_130;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
                ...{ 'onClick': {} },
                type: "success",
                size: "small",
            }));
            const __VLS_132 = __VLS_131({
                ...{ 'onClick': {} },
                type: "success",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_131));
            let __VLS_135;
            const __VLS_136 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!(item.status === 1))
                            return;
                        __VLS_ctx.showVideoLinkDialog(item);
                        // @ts-ignore
                        [showVideoLinkDialog,];
                    } });
            const { default: __VLS_137 } = __VLS_133.slots;
            let __VLS_138;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({}));
            const __VLS_140 = __VLS_139({}, ...__VLS_functionalComponentArgsRest(__VLS_139));
            const { default: __VLS_143 } = __VLS_141.slots;
            let __VLS_144;
            /** @ts-ignore @type {typeof __VLS_components.VideoCamera} */
            VideoCamera;
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({}));
            const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
            // @ts-ignore
            [];
            var __VLS_141;
            // @ts-ignore
            [];
            var __VLS_133;
            var __VLS_134;
            let __VLS_149;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_151 = __VLS_150({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_150));
            let __VLS_154;
            const __VLS_155 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!(item.status === 1))
                            return;
                        __VLS_ctx.openChat(item);
                        // @ts-ignore
                        [openChat,];
                    } });
            const { default: __VLS_156 } = __VLS_152.slots;
            let __VLS_157;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({}));
            const __VLS_159 = __VLS_158({}, ...__VLS_functionalComponentArgsRest(__VLS_158));
            const { default: __VLS_162 } = __VLS_160.slots;
            let __VLS_163;
            /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
            ChatDotRound;
            // @ts-ignore
            const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({}));
            const __VLS_165 = __VLS_164({}, ...__VLS_functionalComponentArgsRest(__VLS_164));
            // @ts-ignore
            [];
            var __VLS_160;
            // @ts-ignore
            [];
            var __VLS_152;
            var __VLS_153;
        }
        else if (item.status === 7) {
            let __VLS_168;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
                ...{ 'onClick': {} },
                type: "warning",
                size: "small",
            }));
            const __VLS_170 = __VLS_169({
                ...{ 'onClick': {} },
                type: "warning",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_169));
            let __VLS_173;
            const __VLS_174 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 1))
                            return;
                        if (!(item.status === 7))
                            return;
                        __VLS_ctx.showStartDialog(item);
                        // @ts-ignore
                        [showStartDialog,];
                    } });
            const { default: __VLS_175 } = __VLS_171.slots;
            let __VLS_176;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_177 = __VLS_asFunctionalComponent1(__VLS_176, new __VLS_176({}));
            const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
            const { default: __VLS_181 } = __VLS_179.slots;
            let __VLS_182;
            /** @ts-ignore @type {typeof __VLS_components.VideoPlay} */
            VideoPlay;
            // @ts-ignore
            const __VLS_183 = __VLS_asFunctionalComponent1(__VLS_182, new __VLS_182({}));
            const __VLS_184 = __VLS_183({}, ...__VLS_functionalComponentArgsRest(__VLS_183));
            // @ts-ignore
            [];
            var __VLS_179;
            // @ts-ignore
            [];
            var __VLS_171;
            var __VLS_172;
            let __VLS_187;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_189 = __VLS_188({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_188));
            let __VLS_192;
            const __VLS_193 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 1))
                            return;
                        if (!(item.status === 7))
                            return;
                        __VLS_ctx.openChat(item);
                        // @ts-ignore
                        [openChat,];
                    } });
            const { default: __VLS_194 } = __VLS_190.slots;
            let __VLS_195;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_196 = __VLS_asFunctionalComponent1(__VLS_195, new __VLS_195({}));
            const __VLS_197 = __VLS_196({}, ...__VLS_functionalComponentArgsRest(__VLS_196));
            const { default: __VLS_200 } = __VLS_198.slots;
            let __VLS_201;
            /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
            ChatDotRound;
            // @ts-ignore
            const __VLS_202 = __VLS_asFunctionalComponent1(__VLS_201, new __VLS_201({}));
            const __VLS_203 = __VLS_202({}, ...__VLS_functionalComponentArgsRest(__VLS_202));
            // @ts-ignore
            [];
            var __VLS_198;
            // @ts-ignore
            [];
            var __VLS_190;
            var __VLS_191;
        }
        else if (item.status === 3) {
            let __VLS_206;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
                ...{ 'onClick': {} },
                type: "success",
                size: "small",
            }));
            const __VLS_208 = __VLS_207({
                ...{ 'onClick': {} },
                type: "success",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_207));
            let __VLS_211;
            const __VLS_212 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 1))
                            return;
                        if (!!(item.status === 7))
                            return;
                        if (!(item.status === 3))
                            return;
                        __VLS_ctx.completeConsultation(item);
                        // @ts-ignore
                        [completeConsultation,];
                    } });
            const { default: __VLS_213 } = __VLS_209.slots;
            let __VLS_214;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_215 = __VLS_asFunctionalComponent1(__VLS_214, new __VLS_214({}));
            const __VLS_216 = __VLS_215({}, ...__VLS_functionalComponentArgsRest(__VLS_215));
            const { default: __VLS_219 } = __VLS_217.slots;
            let __VLS_220;
            /** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
            CircleCheck;
            // @ts-ignore
            const __VLS_221 = __VLS_asFunctionalComponent1(__VLS_220, new __VLS_220({}));
            const __VLS_222 = __VLS_221({}, ...__VLS_functionalComponentArgsRest(__VLS_221));
            // @ts-ignore
            [];
            var __VLS_217;
            // @ts-ignore
            [];
            var __VLS_209;
            var __VLS_210;
            let __VLS_225;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_226 = __VLS_asFunctionalComponent1(__VLS_225, new __VLS_225({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_227 = __VLS_226({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_226));
            let __VLS_230;
            const __VLS_231 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 1))
                            return;
                        if (!!(item.status === 7))
                            return;
                        if (!(item.status === 3))
                            return;
                        __VLS_ctx.openChat(item);
                        // @ts-ignore
                        [openChat,];
                    } });
            const { default: __VLS_232 } = __VLS_228.slots;
            let __VLS_233;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({}));
            const __VLS_235 = __VLS_234({}, ...__VLS_functionalComponentArgsRest(__VLS_234));
            const { default: __VLS_238 } = __VLS_236.slots;
            let __VLS_239;
            /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
            ChatDotRound;
            // @ts-ignore
            const __VLS_240 = __VLS_asFunctionalComponent1(__VLS_239, new __VLS_239({}));
            const __VLS_241 = __VLS_240({}, ...__VLS_functionalComponentArgsRest(__VLS_240));
            // @ts-ignore
            [];
            var __VLS_236;
            // @ts-ignore
            [];
            var __VLS_228;
            var __VLS_229;
        }
        else {
            let __VLS_244;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_245 = __VLS_asFunctionalComponent1(__VLS_244, new __VLS_244({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_246 = __VLS_245({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_245));
            let __VLS_249;
            const __VLS_250 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.appointments.length === 0 && !__VLS_ctx.loading))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!!(item.status === 1))
                            return;
                        if (!!(item.status === 7))
                            return;
                        if (!!(item.status === 3))
                            return;
                        __VLS_ctx.showDetailDialog(item);
                        // @ts-ignore
                        [showDetailDialog,];
                    } });
            const { default: __VLS_251 } = __VLS_247.slots;
            // @ts-ignore
            [];
            var __VLS_247;
            var __VLS_248;
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
    let __VLS_252;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent1(__VLS_252, new __VLS_252({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_254 = __VLS_253({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_253));
    let __VLS_257;
    const __VLS_258 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.fetchAppointments) });
    var __VLS_255;
    var __VLS_256;
}
let __VLS_259;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent1(__VLS_259, new __VLS_259({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "预约详情",
    width: "650px",
    ...{ class: "detail-dialog" },
}));
const __VLS_261 = __VLS_260({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "预约详情",
    width: "650px",
    ...{ class: "detail-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
/** @type {__VLS_StyleScopedClasses['detail-dialog']} */ ;
const { default: __VLS_264 } = __VLS_262.slots;
if (__VLS_ctx.detailLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-loading" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-loading']} */ ;
}
else if (__VLS_ctx.detailData) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.detailData.userName || '匿名用户');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.detailData.userPhone || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value order-no" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['order-no']} */ ;
    (__VLS_ctx.detailData.orderNo || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    let __VLS_265;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_266 = __VLS_asFunctionalComponent1(__VLS_265, new __VLS_265({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.detailData.status)),
    }));
    const __VLS_267 = __VLS_266({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.detailData.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_266));
    const { default: __VLS_270 } = __VLS_268.slots;
    (__VLS_ctx.detailData.statusText);
    // @ts-ignore
    [getStatusType, total, total, currentPage, pageSize, fetchAppointments, detailDialogVisible, detailLoading, detailData, detailData, detailData, detailData, detailData, detailData,];
    var __VLS_268;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.detailData.serviceTypeText);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.formatDateTime(__VLS_ctx.detailData.appointmentTime));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value price" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['price']} */ ;
    (__VLS_ctx.detailData.fee || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.detailData.payStatusText);
    if (__VLS_ctx.detailData.rejectReason) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item full-width" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['full-width']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value reject" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['reject']} */ ;
        (__VLS_ctx.detailData.rejectReason);
    }
    if (__VLS_ctx.detailData.videoLink) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item full-width" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['full-width']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        let __VLS_271;
        /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
        elLink;
        // @ts-ignore
        const __VLS_272 = __VLS_asFunctionalComponent1(__VLS_271, new __VLS_271({
            type: "primary",
            href: (__VLS_ctx.detailData.videoLink),
            target: "_blank",
        }));
        const __VLS_273 = __VLS_272({
            type: "primary",
            href: (__VLS_ctx.detailData.videoLink),
            target: "_blank",
        }, ...__VLS_functionalComponentArgsRest(__VLS_272));
        const { default: __VLS_276 } = __VLS_274.slots;
        (__VLS_ctx.detailData.videoLink);
        // @ts-ignore
        [formatDateTime, detailData, detailData, detailData, detailData, detailData, detailData, detailData, detailData, detailData,];
        var __VLS_274;
    }
    if (__VLS_ctx.detailData.offlineAddress) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item full-width" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['full-width']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        (__VLS_ctx.detailData.offlineAddress);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
    if (__VLS_ctx.detailData.startTime) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        (__VLS_ctx.formatDateTime(__VLS_ctx.detailData.startTime));
    }
    if (__VLS_ctx.detailData.endTime) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        (__VLS_ctx.formatDateTime(__VLS_ctx.detailData.endTime));
    }
    if (__VLS_ctx.detailData.completeTime) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        (__VLS_ctx.formatDateTime(__VLS_ctx.detailData.completeTime));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item full-width" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['full-width']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.formatUserBasicInfo(__VLS_ctx.detailData.userBasicInfo));
    if (__VLS_ctx.detailData.ratingScore) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-section" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "section-title" },
        });
        /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
        let __VLS_277;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_278 = __VLS_asFunctionalComponent1(__VLS_277, new __VLS_277({
            ...{ class: "title-icon" },
        }));
        const __VLS_279 = __VLS_278({
            ...{ class: "title-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_278));
        /** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
        const { default: __VLS_282 } = __VLS_280.slots;
        let __VLS_283;
        /** @ts-ignore @type {typeof __VLS_components.Star} */
        Star;
        // @ts-ignore
        const __VLS_284 = __VLS_asFunctionalComponent1(__VLS_283, new __VLS_283({}));
        const __VLS_285 = __VLS_284({}, ...__VLS_functionalComponentArgsRest(__VLS_284));
        // @ts-ignore
        [formatDateTime, formatDateTime, formatDateTime, detailData, detailData, detailData, detailData, detailData, detailData, detailData, detailData, detailData, detailData, formatUserBasicInfo,];
        var __VLS_280;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value rating" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['rating']} */ ;
        let __VLS_288;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_289 = __VLS_asFunctionalComponent1(__VLS_288, new __VLS_288({}));
        const __VLS_290 = __VLS_289({}, ...__VLS_functionalComponentArgsRest(__VLS_289));
        const { default: __VLS_293 } = __VLS_291.slots;
        let __VLS_294;
        /** @ts-ignore @type {typeof __VLS_components.Star} */
        Star;
        // @ts-ignore
        const __VLS_295 = __VLS_asFunctionalComponent1(__VLS_294, new __VLS_294({}));
        const __VLS_296 = __VLS_295({}, ...__VLS_functionalComponentArgsRest(__VLS_295));
        // @ts-ignore
        [];
        var __VLS_291;
        (__VLS_ctx.detailData.ratingScore);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        (__VLS_ctx.formatDateTime(__VLS_ctx.detailData.ratingTime));
        if (__VLS_ctx.detailData.ratingContent) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "info-item full-width" },
            });
            /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
            /** @type {__VLS_StyleScopedClasses['full-width']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "info-label" },
            });
            /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "info-value" },
            });
            /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
            (__VLS_ctx.detailData.ratingContent);
        }
    }
    if (__VLS_ctx.detailData.psychologistIncome) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-section income-section" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
        /** @type {__VLS_StyleScopedClasses['income-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "section-title" },
        });
        /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
        let __VLS_299;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_300 = __VLS_asFunctionalComponent1(__VLS_299, new __VLS_299({
            ...{ class: "title-icon" },
        }));
        const __VLS_301 = __VLS_300({
            ...{ class: "title-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_300));
        /** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
        const { default: __VLS_304 } = __VLS_302.slots;
        let __VLS_305;
        /** @ts-ignore @type {typeof __VLS_components.Wallet} */
        Wallet;
        // @ts-ignore
        const __VLS_306 = __VLS_asFunctionalComponent1(__VLS_305, new __VLS_305({}));
        const __VLS_307 = __VLS_306({}, ...__VLS_functionalComponentArgsRest(__VLS_306));
        // @ts-ignore
        [formatDateTime, detailData, detailData, detailData, detailData, detailData,];
        var __VLS_302;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-grid" },
        });
        /** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value price" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['price']} */ ;
        (__VLS_ctx.detailData.totalFee || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value commission" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['commission']} */ ;
        ((__VLS_ctx.detailData.commissionRate * 100).toFixed(0));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        (__VLS_ctx.detailData.commissionAmount?.toFixed(2) || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-label" },
        });
        /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "info-value income" },
        });
        /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['income']} */ ;
        (__VLS_ctx.detailData.psychologistIncome?.toFixed(2) || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "income-tip" },
        });
        /** @type {__VLS_StyleScopedClasses['income-tip']} */ ;
        let __VLS_310;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_311 = __VLS_asFunctionalComponent1(__VLS_310, new __VLS_310({}));
        const __VLS_312 = __VLS_311({}, ...__VLS_functionalComponentArgsRest(__VLS_311));
        const { default: __VLS_315 } = __VLS_313.slots;
        let __VLS_316;
        /** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
        InfoFilled;
        // @ts-ignore
        const __VLS_317 = __VLS_asFunctionalComponent1(__VLS_316, new __VLS_316({}));
        const __VLS_318 = __VLS_317({}, ...__VLS_functionalComponentArgsRest(__VLS_317));
        // @ts-ignore
        [detailData, detailData, detailData, detailData,];
        var __VLS_313;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.formatDateTime(__VLS_ctx.detailData.createTime));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-item" },
    });
    /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.formatDateTime(__VLS_ctx.detailData.updateTime));
}
// @ts-ignore
[formatDateTime, formatDateTime, detailData, detailData,];
var __VLS_262;
let __VLS_321;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_322 = __VLS_asFunctionalComponent1(__VLS_321, new __VLS_321({
    modelValue: (__VLS_ctx.rejectDialogVisible),
    title: "拒绝预约",
    width: "400px",
}));
const __VLS_323 = __VLS_322({
    modelValue: (__VLS_ctx.rejectDialogVisible),
    title: "拒绝预约",
    width: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_322));
const { default: __VLS_326 } = __VLS_324.slots;
let __VLS_327;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_328 = __VLS_asFunctionalComponent1(__VLS_327, new __VLS_327({}));
const __VLS_329 = __VLS_328({}, ...__VLS_functionalComponentArgsRest(__VLS_328));
const { default: __VLS_332 } = __VLS_330.slots;
let __VLS_333;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_334 = __VLS_asFunctionalComponent1(__VLS_333, new __VLS_333({
    label: "拒绝原因",
    required: true,
}));
const __VLS_335 = __VLS_334({
    label: "拒绝原因",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_334));
const { default: __VLS_338 } = __VLS_336.slots;
let __VLS_339;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_340 = __VLS_asFunctionalComponent1(__VLS_339, new __VLS_339({
    modelValue: (__VLS_ctx.rejectReason),
    type: "textarea",
    rows: (3),
    placeholder: "请输入拒绝原因",
}));
const __VLS_341 = __VLS_340({
    modelValue: (__VLS_ctx.rejectReason),
    type: "textarea",
    rows: (3),
    placeholder: "请输入拒绝原因",
}, ...__VLS_functionalComponentArgsRest(__VLS_340));
// @ts-ignore
[rejectDialogVisible, rejectReason,];
var __VLS_336;
// @ts-ignore
[];
var __VLS_330;
{
    const { footer: __VLS_344 } = __VLS_324.slots;
    let __VLS_345;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_346 = __VLS_asFunctionalComponent1(__VLS_345, new __VLS_345({
        ...{ 'onClick': {} },
    }));
    const __VLS_347 = __VLS_346({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_346));
    let __VLS_350;
    const __VLS_351 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.rejectDialogVisible = false;
                // @ts-ignore
                [rejectDialogVisible,];
            } });
    const { default: __VLS_352 } = __VLS_348.slots;
    // @ts-ignore
    [];
    var __VLS_348;
    var __VLS_349;
    let __VLS_353;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_354 = __VLS_asFunctionalComponent1(__VLS_353, new __VLS_353({
        ...{ 'onClick': {} },
        type: "danger",
    }));
    const __VLS_355 = __VLS_354({
        ...{ 'onClick': {} },
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_354));
    let __VLS_358;
    const __VLS_359 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmReject) });
    const { default: __VLS_360 } = __VLS_356.slots;
    // @ts-ignore
    [confirmReject,];
    var __VLS_356;
    var __VLS_357;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_324;
let __VLS_361;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_362 = __VLS_asFunctionalComponent1(__VLS_361, new __VLS_361({
    modelValue: (__VLS_ctx.confirmDialogVisible),
    title: "接受预约",
    width: "500px",
}));
const __VLS_363 = __VLS_362({
    modelValue: (__VLS_ctx.confirmDialogVisible),
    title: "接受预约",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_362));
const { default: __VLS_366 } = __VLS_364.slots;
let __VLS_367;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_368 = __VLS_asFunctionalComponent1(__VLS_367, new __VLS_367({
    labelWidth: "100px",
}));
const __VLS_369 = __VLS_368({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_368));
const { default: __VLS_372 } = __VLS_370.slots;
let __VLS_373;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_374 = __VLS_asFunctionalComponent1(__VLS_373, new __VLS_373({
    label: "咨询方式",
}));
const __VLS_375 = __VLS_374({
    label: "咨询方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_374));
const { default: __VLS_378 } = __VLS_376.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.getServiceTypeName(__VLS_ctx.currentAppointment?.serviceType));
// @ts-ignore
[getServiceTypeName, confirmDialogVisible, currentAppointment,];
var __VLS_376;
let __VLS_379;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_380 = __VLS_asFunctionalComponent1(__VLS_379, new __VLS_379({
    label: "预约时间",
}));
const __VLS_381 = __VLS_380({
    label: "预约时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_380));
const { default: __VLS_384 } = __VLS_382.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.formatDateTime(__VLS_ctx.currentAppointment?.appointmentTime));
// @ts-ignore
[formatDateTime, currentAppointment,];
var __VLS_382;
// @ts-ignore
[];
var __VLS_370;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "accept-tip" },
});
/** @type {__VLS_StyleScopedClasses['accept-tip']} */ ;
let __VLS_385;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_386 = __VLS_asFunctionalComponent1(__VLS_385, new __VLS_385({}));
const __VLS_387 = __VLS_386({}, ...__VLS_functionalComponentArgsRest(__VLS_386));
const { default: __VLS_390 } = __VLS_388.slots;
let __VLS_391;
/** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
InfoFilled;
// @ts-ignore
const __VLS_392 = __VLS_asFunctionalComponent1(__VLS_391, new __VLS_391({}));
const __VLS_393 = __VLS_392({}, ...__VLS_functionalComponentArgsRest(__VLS_392));
// @ts-ignore
[];
var __VLS_388;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
{
    const { footer: __VLS_396 } = __VLS_364.slots;
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
                __VLS_ctx.confirmDialogVisible = false;
                // @ts-ignore
                [confirmDialogVisible,];
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
        type: "success",
    }));
    const __VLS_407 = __VLS_406({
        ...{ 'onClick': {} },
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_406));
    let __VLS_410;
    const __VLS_411 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmAccept) });
    const { default: __VLS_412 } = __VLS_408.slots;
    // @ts-ignore
    [confirmAccept,];
    var __VLS_408;
    var __VLS_409;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_364;
let __VLS_413;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_414 = __VLS_asFunctionalComponent1(__VLS_413, new __VLS_413({
    modelValue: (__VLS_ctx.videoLinkDialogVisible),
    title: "发送视频链接/线下地址",
    width: "500px",
}));
const __VLS_415 = __VLS_414({
    modelValue: (__VLS_ctx.videoLinkDialogVisible),
    title: "发送视频链接/线下地址",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_414));
const { default: __VLS_418 } = __VLS_416.slots;
let __VLS_419;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_420 = __VLS_asFunctionalComponent1(__VLS_419, new __VLS_419({
    labelWidth: "100px",
}));
const __VLS_421 = __VLS_420({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_420));
const { default: __VLS_424 } = __VLS_422.slots;
let __VLS_425;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_426 = __VLS_asFunctionalComponent1(__VLS_425, new __VLS_425({
    label: "咨询方式",
}));
const __VLS_427 = __VLS_426({
    label: "咨询方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_426));
const { default: __VLS_430 } = __VLS_428.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.getServiceTypeName(__VLS_ctx.currentAppointment?.serviceType));
// @ts-ignore
[getServiceTypeName, currentAppointment, videoLinkDialogVisible,];
var __VLS_428;
if (__VLS_ctx.currentAppointment?.serviceType === 'VIDEO' || __VLS_ctx.currentAppointment?.serviceType === 'video' || __VLS_ctx.currentAppointment?.serviceType === 'VOICE' || __VLS_ctx.currentAppointment?.serviceType === 'voice') {
    let __VLS_431;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_432 = __VLS_asFunctionalComponent1(__VLS_431, new __VLS_431({
        label: "视频链接",
    }));
    const __VLS_433 = __VLS_432({
        label: "视频链接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_432));
    const { default: __VLS_436 } = __VLS_434.slots;
    let __VLS_437;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_438 = __VLS_asFunctionalComponent1(__VLS_437, new __VLS_437({
        modelValue: (__VLS_ctx.videoLink),
        placeholder: "请输入视频会议链接",
    }));
    const __VLS_439 = __VLS_438({
        modelValue: (__VLS_ctx.videoLink),
        placeholder: "请输入视频会议链接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_438));
    // @ts-ignore
    [currentAppointment, currentAppointment, currentAppointment, currentAppointment, videoLink,];
    var __VLS_434;
    let __VLS_442;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_443 = __VLS_asFunctionalComponent1(__VLS_442, new __VLS_442({
        label: "会议日期",
    }));
    const __VLS_444 = __VLS_443({
        label: "会议日期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_443));
    const { default: __VLS_447 } = __VLS_445.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatVideoDate);
    // @ts-ignore
    [formatVideoDate,];
    var __VLS_445;
    let __VLS_448;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_449 = __VLS_asFunctionalComponent1(__VLS_448, new __VLS_448({
        label: "时段",
    }));
    const __VLS_450 = __VLS_449({
        label: "时段",
    }, ...__VLS_functionalComponentArgsRest(__VLS_449));
    const { default: __VLS_453 } = __VLS_451.slots;
    let __VLS_454;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_455 = __VLS_asFunctionalComponent1(__VLS_454, new __VLS_454({
        type: "warning",
    }));
    const __VLS_456 = __VLS_455({
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_455));
    const { default: __VLS_459 } = __VLS_457.slots;
    (__VLS_ctx.timeSlot);
    // @ts-ignore
    [timeSlot,];
    var __VLS_457;
    // @ts-ignore
    [];
    var __VLS_451;
    let __VLS_460;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_461 = __VLS_asFunctionalComponent1(__VLS_460, new __VLS_460({
        label: "开始时间",
    }));
    const __VLS_462 = __VLS_461({
        label: "开始时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_461));
    const { default: __VLS_465 } = __VLS_463.slots;
    let __VLS_466;
    /** @ts-ignore @type {typeof __VLS_components.elTimePicker | typeof __VLS_components.ElTimePicker} */
    elTimePicker;
    // @ts-ignore
    const __VLS_467 = __VLS_asFunctionalComponent1(__VLS_466, new __VLS_466({
        modelValue: (__VLS_ctx.videoStartTime),
        placeholder: "选择开始时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }));
    const __VLS_468 = __VLS_467({
        modelValue: (__VLS_ctx.videoStartTime),
        placeholder: "选择开始时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_467));
    // @ts-ignore
    [videoStartTime,];
    var __VLS_463;
    let __VLS_471;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_472 = __VLS_asFunctionalComponent1(__VLS_471, new __VLS_471({
        label: "结束时间",
    }));
    const __VLS_473 = __VLS_472({
        label: "结束时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_472));
    const { default: __VLS_476 } = __VLS_474.slots;
    let __VLS_477;
    /** @ts-ignore @type {typeof __VLS_components.elTimePicker | typeof __VLS_components.ElTimePicker} */
    elTimePicker;
    // @ts-ignore
    const __VLS_478 = __VLS_asFunctionalComponent1(__VLS_477, new __VLS_477({
        modelValue: (__VLS_ctx.videoEndTime),
        placeholder: "选择结束时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }));
    const __VLS_479 = __VLS_478({
        modelValue: (__VLS_ctx.videoEndTime),
        placeholder: "选择结束时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_478));
    // @ts-ignore
    [videoEndTime,];
    var __VLS_474;
}
else if (__VLS_ctx.currentAppointment?.serviceType === 'OFFLINE' || __VLS_ctx.currentAppointment?.serviceType === 'offline' || __VLS_ctx.currentAppointment?.serviceType === 'OFFLINE') {
    let __VLS_482;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_483 = __VLS_asFunctionalComponent1(__VLS_482, new __VLS_482({
        label: "线下地址",
    }));
    const __VLS_484 = __VLS_483({
        label: "线下地址",
    }, ...__VLS_functionalComponentArgsRest(__VLS_483));
    const { default: __VLS_487 } = __VLS_485.slots;
    let __VLS_488;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_489 = __VLS_asFunctionalComponent1(__VLS_488, new __VLS_488({
        modelValue: (__VLS_ctx.offlineAddress),
        type: "textarea",
        rows: (2),
        placeholder: "请输入线下面询地址",
    }));
    const __VLS_490 = __VLS_489({
        modelValue: (__VLS_ctx.offlineAddress),
        type: "textarea",
        rows: (2),
        placeholder: "请输入线下面询地址",
    }, ...__VLS_functionalComponentArgsRest(__VLS_489));
    // @ts-ignore
    [currentAppointment, currentAppointment, currentAppointment, offlineAddress,];
    var __VLS_485;
    let __VLS_493;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_494 = __VLS_asFunctionalComponent1(__VLS_493, new __VLS_493({
        label: "会议日期",
    }));
    const __VLS_495 = __VLS_494({
        label: "会议日期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_494));
    const { default: __VLS_498 } = __VLS_496.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatVideoDate);
    // @ts-ignore
    [formatVideoDate,];
    var __VLS_496;
    let __VLS_499;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_500 = __VLS_asFunctionalComponent1(__VLS_499, new __VLS_499({
        label: "时段",
    }));
    const __VLS_501 = __VLS_500({
        label: "时段",
    }, ...__VLS_functionalComponentArgsRest(__VLS_500));
    const { default: __VLS_504 } = __VLS_502.slots;
    let __VLS_505;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_506 = __VLS_asFunctionalComponent1(__VLS_505, new __VLS_505({
        type: "warning",
    }));
    const __VLS_507 = __VLS_506({
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_506));
    const { default: __VLS_510 } = __VLS_508.slots;
    (__VLS_ctx.timeSlot);
    // @ts-ignore
    [timeSlot,];
    var __VLS_508;
    // @ts-ignore
    [];
    var __VLS_502;
    let __VLS_511;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_512 = __VLS_asFunctionalComponent1(__VLS_511, new __VLS_511({
        label: "开始时间",
    }));
    const __VLS_513 = __VLS_512({
        label: "开始时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_512));
    const { default: __VLS_516 } = __VLS_514.slots;
    let __VLS_517;
    /** @ts-ignore @type {typeof __VLS_components.elTimePicker | typeof __VLS_components.ElTimePicker} */
    elTimePicker;
    // @ts-ignore
    const __VLS_518 = __VLS_asFunctionalComponent1(__VLS_517, new __VLS_517({
        modelValue: (__VLS_ctx.videoStartTime),
        placeholder: "选择开始时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }));
    const __VLS_519 = __VLS_518({
        modelValue: (__VLS_ctx.videoStartTime),
        placeholder: "选择开始时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_518));
    // @ts-ignore
    [videoStartTime,];
    var __VLS_514;
    let __VLS_522;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_523 = __VLS_asFunctionalComponent1(__VLS_522, new __VLS_522({
        label: "结束时间",
    }));
    const __VLS_524 = __VLS_523({
        label: "结束时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_523));
    const { default: __VLS_527 } = __VLS_525.slots;
    let __VLS_528;
    /** @ts-ignore @type {typeof __VLS_components.elTimePicker | typeof __VLS_components.ElTimePicker} */
    elTimePicker;
    // @ts-ignore
    const __VLS_529 = __VLS_asFunctionalComponent1(__VLS_528, new __VLS_528({
        modelValue: (__VLS_ctx.videoEndTime),
        placeholder: "选择结束时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }));
    const __VLS_530 = __VLS_529({
        modelValue: (__VLS_ctx.videoEndTime),
        placeholder: "选择结束时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_529));
    // @ts-ignore
    [videoEndTime,];
    var __VLS_525;
}
else {
    let __VLS_533;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_534 = __VLS_asFunctionalComponent1(__VLS_533, new __VLS_533({
        label: "视频链接",
    }));
    const __VLS_535 = __VLS_534({
        label: "视频链接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_534));
    const { default: __VLS_538 } = __VLS_536.slots;
    let __VLS_539;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_540 = __VLS_asFunctionalComponent1(__VLS_539, new __VLS_539({
        modelValue: (__VLS_ctx.videoLink),
        placeholder: "请输入视频会议链接（可选）",
    }));
    const __VLS_541 = __VLS_540({
        modelValue: (__VLS_ctx.videoLink),
        placeholder: "请输入视频会议链接（可选）",
    }, ...__VLS_functionalComponentArgsRest(__VLS_540));
    // @ts-ignore
    [videoLink,];
    var __VLS_536;
    let __VLS_544;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_545 = __VLS_asFunctionalComponent1(__VLS_544, new __VLS_544({
        label: "会议日期",
    }));
    const __VLS_546 = __VLS_545({
        label: "会议日期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_545));
    const { default: __VLS_549 } = __VLS_547.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatVideoDate);
    // @ts-ignore
    [formatVideoDate,];
    var __VLS_547;
    let __VLS_550;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_551 = __VLS_asFunctionalComponent1(__VLS_550, new __VLS_550({
        label: "时段",
    }));
    const __VLS_552 = __VLS_551({
        label: "时段",
    }, ...__VLS_functionalComponentArgsRest(__VLS_551));
    const { default: __VLS_555 } = __VLS_553.slots;
    let __VLS_556;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_557 = __VLS_asFunctionalComponent1(__VLS_556, new __VLS_556({
        type: "warning",
    }));
    const __VLS_558 = __VLS_557({
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_557));
    const { default: __VLS_561 } = __VLS_559.slots;
    (__VLS_ctx.timeSlot);
    // @ts-ignore
    [timeSlot,];
    var __VLS_559;
    // @ts-ignore
    [];
    var __VLS_553;
    let __VLS_562;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_563 = __VLS_asFunctionalComponent1(__VLS_562, new __VLS_562({
        label: "开始时间",
    }));
    const __VLS_564 = __VLS_563({
        label: "开始时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_563));
    const { default: __VLS_567 } = __VLS_565.slots;
    let __VLS_568;
    /** @ts-ignore @type {typeof __VLS_components.elTimePicker | typeof __VLS_components.ElTimePicker} */
    elTimePicker;
    // @ts-ignore
    const __VLS_569 = __VLS_asFunctionalComponent1(__VLS_568, new __VLS_568({
        modelValue: (__VLS_ctx.videoStartTime),
        placeholder: "选择开始时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }));
    const __VLS_570 = __VLS_569({
        modelValue: (__VLS_ctx.videoStartTime),
        placeholder: "选择开始时间",
        format: "HH:mm",
        valueFormat: "HH:mm",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_569));
    // @ts-ignore
    [videoStartTime,];
    var __VLS_565;
}
// @ts-ignore
[];
var __VLS_422;
{
    const { footer: __VLS_573 } = __VLS_416.slots;
    let __VLS_574;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_575 = __VLS_asFunctionalComponent1(__VLS_574, new __VLS_574({
        ...{ 'onClick': {} },
    }));
    const __VLS_576 = __VLS_575({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_575));
    let __VLS_579;
    const __VLS_580 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.videoLinkDialogVisible = false;
                // @ts-ignore
                [videoLinkDialogVisible,];
            } });
    const { default: __VLS_581 } = __VLS_577.slots;
    // @ts-ignore
    [];
    var __VLS_577;
    var __VLS_578;
    let __VLS_582;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_583 = __VLS_asFunctionalComponent1(__VLS_582, new __VLS_582({
        ...{ 'onClick': {} },
        type: "success",
    }));
    const __VLS_584 = __VLS_583({
        ...{ 'onClick': {} },
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_583));
    let __VLS_587;
    const __VLS_588 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmSendVideoLink) });
    const { default: __VLS_589 } = __VLS_585.slots;
    // @ts-ignore
    [confirmSendVideoLink,];
    var __VLS_585;
    var __VLS_586;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_416;
let __VLS_590;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_591 = __VLS_asFunctionalComponent1(__VLS_590, new __VLS_590({
    modelValue: (__VLS_ctx.startDialogVisible),
    title: "开始咨询",
    width: "400px",
}));
const __VLS_592 = __VLS_591({
    modelValue: (__VLS_ctx.startDialogVisible),
    title: "开始咨询",
    width: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_591));
const { default: __VLS_595 } = __VLS_593.slots;
let __VLS_596;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_597 = __VLS_asFunctionalComponent1(__VLS_596, new __VLS_596({
    labelWidth: "100px",
}));
const __VLS_598 = __VLS_597({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_597));
const { default: __VLS_601 } = __VLS_599.slots;
let __VLS_602;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_603 = __VLS_asFunctionalComponent1(__VLS_602, new __VLS_602({
    label: "咨询开始时间",
}));
const __VLS_604 = __VLS_603({
    label: "咨询开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_603));
const { default: __VLS_607 } = __VLS_605.slots;
let __VLS_608;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_609 = __VLS_asFunctionalComponent1(__VLS_608, new __VLS_608({
    modelValue: (__VLS_ctx.startTime),
    type: "datetime",
    placeholder: "选择开始时间（可选）",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}));
const __VLS_610 = __VLS_609({
    modelValue: (__VLS_ctx.startTime),
    type: "datetime",
    placeholder: "选择开始时间（可选）",
    format: "YYYY-MM-DD HH:mm",
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_609));
// @ts-ignore
[startDialogVisible, startTime,];
var __VLS_605;
if (__VLS_ctx.currentAppointment?.videoLink) {
    let __VLS_613;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_614 = __VLS_asFunctionalComponent1(__VLS_613, new __VLS_613({
        label: "视频链接",
    }));
    const __VLS_615 = __VLS_614({
        label: "视频链接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_614));
    const { default: __VLS_618 } = __VLS_616.slots;
    let __VLS_619;
    /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
    elLink;
    // @ts-ignore
    const __VLS_620 = __VLS_asFunctionalComponent1(__VLS_619, new __VLS_619({
        type: "primary",
        href: (__VLS_ctx.currentAppointment?.videoLink),
        target: "_blank",
    }));
    const __VLS_621 = __VLS_620({
        type: "primary",
        href: (__VLS_ctx.currentAppointment?.videoLink),
        target: "_blank",
    }, ...__VLS_functionalComponentArgsRest(__VLS_620));
    const { default: __VLS_624 } = __VLS_622.slots;
    (__VLS_ctx.currentAppointment?.videoLink);
    // @ts-ignore
    [currentAppointment, currentAppointment, currentAppointment,];
    var __VLS_622;
    // @ts-ignore
    [];
    var __VLS_616;
}
// @ts-ignore
[];
var __VLS_599;
{
    const { footer: __VLS_625 } = __VLS_593.slots;
    let __VLS_626;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_627 = __VLS_asFunctionalComponent1(__VLS_626, new __VLS_626({
        ...{ 'onClick': {} },
    }));
    const __VLS_628 = __VLS_627({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_627));
    let __VLS_631;
    const __VLS_632 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.startDialogVisible = false;
                // @ts-ignore
                [startDialogVisible,];
            } });
    const { default: __VLS_633 } = __VLS_629.slots;
    // @ts-ignore
    [];
    var __VLS_629;
    var __VLS_630;
    let __VLS_634;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_635 = __VLS_asFunctionalComponent1(__VLS_634, new __VLS_634({
        ...{ 'onClick': {} },
        type: "success",
    }));
    const __VLS_636 = __VLS_635({
        ...{ 'onClick': {} },
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_635));
    let __VLS_639;
    const __VLS_640 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmStartConsultation) });
    const { default: __VLS_641 } = __VLS_637.slots;
    // @ts-ignore
    [confirmStartConsultation,];
    var __VLS_637;
    var __VLS_638;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_593;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
