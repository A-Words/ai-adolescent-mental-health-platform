/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, reactive, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Calendar, Clock, VideoPlay, VideoCamera, ChatDotRound, Star, Location, InfoFilled, Warning } from '@element-plus/icons-vue';
import { getCurrentAppointments, getConsultationHistory, getFavoritePsychologists, getAllMyAppointments, cancelAppointment as apiCancelAppointment, rateAppointment, toggleFavorite, } from '@/api/psychologist';
const router = useRouter();
// 状态
const activeTab = ref('all');
const loadingAll = ref(false);
const loadingCurrent = ref(false);
const loadingHistory = ref(false);
const loadingFavorites = ref(false);
// 数据
const allAppointments = ref([]);
const currentAppointments = ref([]);
const consultationHistory = ref([]);
const favoritePsychologists = ref([]);
const chatAppointments = ref([]);
const activeChat = ref(null);
const chatMessages = ref([]);
const messageInput = ref('');
const messagesContainer = ref(null);
// 全部预约分页和筛选
const allPage = ref(1);
const allSize = ref(10);
const allTotal = ref(0);
const allStatusFilter = ref(undefined);
const historyPage = ref(1);
const historySize = ref(10);
const historyTotal = ref(0);
// 评价
const ratingDialogVisible = ref(false);
const ratingAppointment = ref(null);
const submittingRating = ref(false);
const ratingForm = reactive({
    rating: 5,
    comment: '',
    isAnonymous: 0
});
// 进入咨询弹窗
const consultationDialogVisible = ref(false);
const currentConsultation = ref(null);
// 取消预约对话框
const cancelDialogVisible = ref(false);
const cancelTarget = ref(null);
const cancelReason = ref('');
const cancelLoading = ref(false);
// 服务类型映射
const serviceTypeMap = {
    text: '图文咨询',
    video: '视频咨询',
    voice: '语音咨询',
    offline: '线下面询'
};
const getServiceTypeName = (type) => serviceTypeMap[type] || type;
// 时间段
const timeSlotMap = {
    MORNING: '上午',
    AFTERNOON: '下午',
    EVENING: '晚上',
    morning: '上午',
    afternoon: '下午',
    evening: '晚上'
};
const getTimeSlotName = (slot) => timeSlotMap[slot] || slot;
// 状态
const statusMap = {
    0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 7: '待进行', 8: '已评价'
};
const getStatusName = (status) => statusMap[status] || '未知';
const getStatusType = (status) => {
    const types = {
        0: 'warning', 1: 'success', 2: 'danger', 3: 'primary', 4: 'info', 5: 'info', 6: 'danger', 7: 'warning', 8: 'success'
    };
    return types[status] || 'info';
};
// 格式化
const formatDate = (dateStr) => {
    if (!dateStr)
        return '';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getFullYear()}年`;
};
// 获取全部预约
const fetchAllAppointments = async () => {
    loadingAll.value = true;
    try {
        const res = await getAllMyAppointments({
            page: allPage.value,
            size: allSize.value,
            status: allStatusFilter.value
        });
        if (res.code === 200) {
            allAppointments.value = res.data?.records || [];
            allTotal.value = res.data?.total || 0;
        }
    }
    catch (e) {
        console.error('获取全部预约失败', e);
    }
    finally {
        loadingAll.value = false;
    }
};
// 获取当前预约
const fetchCurrentAppointments = async () => {
    loadingCurrent.value = true;
    try {
        const res = await getCurrentAppointments();
        if (res.code === 200) {
            currentAppointments.value = res.data || [];
            // 所有进行中的预约都可以用于图文咨询
            chatAppointments.value = currentAppointments.value;
        }
    }
    catch (e) {
        console.error('获取当前预约失败', e);
    }
    finally {
        loadingCurrent.value = false;
    }
};
// 获取咨询历史（已完成、已评价的预约）
const fetchHistory = async () => {
    loadingHistory.value = true;
    try {
        const res = await getConsultationHistory();
        if (res.code === 200) {
            consultationHistory.value = res.data || [];
            historyTotal.value = res.data?.length || 0;
        }
    }
    catch (e) {
        console.error('获取咨询历史失败', e);
    }
    finally {
        loadingHistory.value = false;
    }
};
// 获取收藏的心理咨询师
const fetchFavorites = async () => {
    loadingFavorites.value = true;
    try {
        const res = await getFavoritePsychologists();
        if (res.code === 200) {
            favoritePsychologists.value = res.data || [];
        }
    }
    catch (e) {
        console.error('获取收藏失败', e);
    }
    finally {
        loadingFavorites.value = false;
    }
};
// 取消预约 - 打开取消对话框
const cancelAppointment = (item) => {
    cancelTarget.value = item;
    cancelReason.value = '';
    cancelDialogVisible.value = true;
};
// 确认取消预约
const confirmCancelAppointment = async () => {
    if (!cancelReason.value.trim()) {
        ElMessage.warning('请输入取消原因');
        return;
    }
    cancelLoading.value = true;
    try {
        const res = await apiCancelAppointment({ appointmentId: cancelTarget.value.id, cancelReason: cancelReason.value });
        if (res.code === 200) {
            ElMessage.success('取消成功');
            cancelDialogVisible.value = false;
            fetchCurrentAppointments();
            fetchAllAppointments();
        }
        else {
            ElMessage.error(res.message || '取消失败');
        }
    }
    catch (e) {
        ElMessage.error(e.message || '取消失败');
    }
    finally {
        cancelLoading.value = false;
    }
};
// 进入咨询 - 显示信息弹窗
const showConsultationInfo = (item) => {
    currentConsultation.value = item;
    consultationDialogVisible.value = true;
};
// 打开视频链接
const openVideoLink = () => {
    if (currentConsultation.value?.videoLink) {
        window.open(currentConsultation.value.videoLink, '_blank');
        consultationDialogVisible.value = false;
    }
};
// 打开聊天
const openChat = (item) => {
    router.push(`/user-chat/${item.id}`);
};
// 发送消息
const sendMessage = async () => {
    if (!messageInput.value.trim() || !activeChat.value)
        return;
    const content = messageInput.value;
    messageInput.value = '';
    try {
        // TODO: 实现发送消息功能
        chatMessages.value.push({
            id: Date.now(),
            content: content,
            isSelf: true,
            createTime: new Date().toISOString()
        });
        nextTick(() => scrollToBottom());
    }
    catch (e) {
        console.error('发送消息失败', e);
        messageInput.value = content;
    }
};
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};
// 评价
const showRatingDialog = (item) => {
    ratingAppointment.value = item;
    ratingForm.rating = 5;
    ratingForm.comment = '';
    ratingForm.isAnonymous = 0;
    ratingDialogVisible.value = true;
};
const submitRating = async () => {
    if (ratingForm.rating < 1) {
        ElMessage.warning('请选择评分');
        return;
    }
    submittingRating.value = true;
    try {
        const res = await rateAppointment({
            appointmentId: ratingAppointment.value.id,
            rating: ratingForm.rating,
            comment: ratingForm.comment,
            isAnonymous: ratingForm.isAnonymous
        });
        if (res.code === 200) {
            ElMessage.success('评价成功');
            ratingDialogVisible.value = false;
            fetchCurrentAppointments();
        }
        else {
            ElMessage.error(res.message || '评价失败');
        }
    }
    catch (e) {
        ElMessage.error(e.message || '评价失败');
    }
    finally {
        submittingRating.value = false;
    }
};
// 取消收藏
const unfavorite = async (item) => {
    try {
        const res = await toggleFavorite(item.psychologistId);
        if (res.code === 200) {
            ElMessage.success('取消收藏');
            fetchFavorites();
        }
    }
    catch (e) {
        ElMessage.error('操作失败');
    }
};
// 再次预约
const bookAgain = (item) => {
    router.push(`/consultation/psychologist/${item.psychologistId}`);
};
// 跳转
const goToFindPsychologist = () => {
    router.push('/consultation/psychologist');
};
const goToPsychologistDetail = (id) => {
    router.push(`/consultation/psychologist/${id}`);
};
onMounted(() => {
    fetchAllAppointments();
    fetchCurrentAppointments();
    fetchHistory();
    fetchFavorites();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-card']} */ ;
/** @type {__VLS_StyleScopedClasses['online-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-card']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-name']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['self']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['consultation-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-info']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-info']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['my-psychology-container']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-window']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-info']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-info']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-info']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-btn-danger']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select-dropdown__item']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select-dropdown__item']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select-dropdown__item']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select-dropdown']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select-dropdown__item']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-psychology-container" },
});
/** @type {__VLS_StyleScopedClasses['my-psychology-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars-background" },
});
/** @type {__VLS_StyleScopedClasses['stars-background']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars" },
});
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars2" },
});
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stars3" },
});
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "planet planet-1" },
});
/** @type {__VLS_StyleScopedClasses['planet']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "planet planet-2" },
});
/** @type {__VLS_StyleScopedClasses['planet']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "comet" },
});
/** @type {__VLS_StyleScopedClasses['comet']} */ ;
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
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "content-tabs cosmic-tabs" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "content-tabs cosmic-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['content-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-tabs']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "全部预约",
    name: "all",
}));
const __VLS_8 = __VLS_7({
    label: "全部预约",
    name: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-bar" },
});
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.allStatusFilter),
    placeholder: "筛选状态",
    clearable: true,
    size: "default",
    ...{ class: "cosmic-select" },
}));
const __VLS_14 = __VLS_13({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.allStatusFilter),
    placeholder: "筛选状态",
    clearable: true,
    size: "default",
    ...{ class: "cosmic-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_17;
const __VLS_18 = ({ change: {} },
    { onChange: (__VLS_ctx.fetchAllAppointments) });
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
const { default: __VLS_19 } = __VLS_15.slots;
{
    const { dropdown: __VLS_20 } = __VLS_15.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cosmic-select-dropdown" },
    });
    /** @type {__VLS_StyleScopedClasses['cosmic-select-dropdown']} */ ;
    let __VLS_21;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        label: "全部状态",
        value: (undefined),
    }));
    const __VLS_23 = __VLS_22({
        label: "全部状态",
        value: (undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        label: "待审核",
        value: (0),
    }));
    const __VLS_28 = __VLS_27({
        label: "待审核",
        value: (0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        label: "已确认",
        value: (1),
    }));
    const __VLS_33 = __VLS_32({
        label: "已确认",
        value: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        label: "已拒绝",
        value: (2),
    }));
    const __VLS_38 = __VLS_37({
        label: "已拒绝",
        value: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_41;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        label: "进行中",
        value: (3),
    }));
    const __VLS_43 = __VLS_42({
        label: "进行中",
        value: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_46;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        label: "已完成",
        value: (4),
    }));
    const __VLS_48 = __VLS_47({
        label: "已完成",
        value: (4),
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        label: "已取消",
        value: (5),
    }));
    const __VLS_53 = __VLS_52({
        label: "已取消",
        value: (5),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_56;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        label: "待进行",
        value: (7),
    }));
    const __VLS_58 = __VLS_57({
        label: "待进行",
        value: (7),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_61;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        label: "已评价",
        value: (8),
    }));
    const __VLS_63 = __VLS_62({
        label: "已评价",
        value: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    // @ts-ignore
    [activeTab, allStatusFilter, fetchAllAppointments,];
}
// @ts-ignore
[];
var __VLS_15;
var __VLS_16;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "appointment-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingAll) }, null, null);
/** @type {__VLS_StyleScopedClasses['appointment-list']} */ ;
if (__VLS_ctx.allAppointments.length === 0 && !__VLS_ctx.loadingAll) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-wrapper']} */ ;
    let __VLS_66;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
        description: "暂无预约记录",
    }));
    const __VLS_68 = __VLS_67({
        description: "暂无预约记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    const { default: __VLS_71 } = __VLS_69.slots;
    let __VLS_72;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_77;
    const __VLS_78 = ({ click: {} },
        { onClick: (__VLS_ctx.goToFindPsychologist) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_79 } = __VLS_75.slots;
    // @ts-ignore
    [vLoading, loadingAll, loadingAll, allAppointments, goToFindPsychologist,];
    var __VLS_75;
    var __VLS_76;
    // @ts-ignore
    [];
    var __VLS_69;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "appointment-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['appointment-grid']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.allAppointments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-card cosmic-card" },
            key: (item.id),
        });
        /** @type {__VLS_StyleScopedClasses['appointment-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psychologist-section" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-section']} */ ;
        let __VLS_80;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            size: (64),
            src: (item.psychologistHeadPath),
            ...{ class: "psychologist-avatar cosmic-avatar" },
        }));
        const __VLS_82 = __VLS_81({
            size: (64),
            src: (item.psychologistHeadPath),
            ...{ class: "psychologist-avatar cosmic-avatar" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        /** @type {__VLS_StyleScopedClasses['psychologist-avatar']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-avatar']} */ ;
        const { default: __VLS_85 } = __VLS_83.slots;
        let __VLS_86;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
            size: (32),
        }));
        const __VLS_88 = __VLS_87({
            size: (32),
        }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        const { default: __VLS_91 } = __VLS_89.slots;
        let __VLS_92;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({}));
        const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
        // @ts-ignore
        [allAppointments,];
        var __VLS_89;
        // @ts-ignore
        [];
        var __VLS_83;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psychologist-info" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "psychologist-name" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-name']} */ ;
        (item.psychologistName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-item" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
        let __VLS_97;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({}));
        const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
        const { default: __VLS_102 } = __VLS_100.slots;
        let __VLS_103;
        /** @ts-ignore @type {typeof __VLS_components.Calendar} */
        Calendar;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({}));
        const __VLS_105 = __VLS_104({}, ...__VLS_functionalComponentArgsRest(__VLS_104));
        // @ts-ignore
        [];
        var __VLS_100;
        (__VLS_ctx.formatDate(item.appointmentTime));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-item" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
        let __VLS_108;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({}));
        const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
        const { default: __VLS_113 } = __VLS_111.slots;
        let __VLS_114;
        /** @ts-ignore @type {typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({}));
        const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
        // @ts-ignore
        [formatDate,];
        var __VLS_111;
        (__VLS_ctx.getTimeSlotName(item.timeSlot));
        let __VLS_119;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
            ...{ class: "status-tag" },
            type: (__VLS_ctx.getStatusType(item.status)),
        }));
        const __VLS_121 = __VLS_120({
            ...{ class: "status-tag" },
            type: (__VLS_ctx.getStatusType(item.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_120));
        /** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
        const { default: __VLS_124 } = __VLS_122.slots;
        (__VLS_ctx.getStatusName(item.status));
        // @ts-ignore
        [getTimeSlotName, getStatusType, getStatusName,];
        var __VLS_122;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-details" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-details']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        (__VLS_ctx.getServiceTypeName(item.serviceType));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value price" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['price']} */ ;
        (item.price);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "action-buttons" },
        });
        /** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
        if (item.status === 1 || item.status === 7) {
            let __VLS_125;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
                ...{ 'onClick': {} },
                type: "primary",
                ...{ class: "cosmic-btn-primary cosmic-btn" },
            }));
            const __VLS_127 = __VLS_126({
                ...{ 'onClick': {} },
                type: "primary",
                ...{ class: "cosmic-btn-primary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            let __VLS_130;
            const __VLS_131 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.allAppointments.length === 0 && !__VLS_ctx.loadingAll))
                            return;
                        if (!(item.status === 1 || item.status === 7))
                            return;
                        __VLS_ctx.showConsultationInfo(item);
                        // @ts-ignore
                        [getServiceTypeName, showConsultationInfo,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_132 } = __VLS_128.slots;
            let __VLS_133;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({}));
            const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
            const { default: __VLS_138 } = __VLS_136.slots;
            let __VLS_139;
            /** @ts-ignore @type {typeof __VLS_components.VideoPlay} */
            VideoPlay;
            // @ts-ignore
            const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({}));
            const __VLS_141 = __VLS_140({}, ...__VLS_functionalComponentArgsRest(__VLS_140));
            // @ts-ignore
            [];
            var __VLS_136;
            // @ts-ignore
            [];
            var __VLS_128;
            var __VLS_129;
            let __VLS_144;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
                ...{ 'onClick': {} },
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }));
            const __VLS_146 = __VLS_145({
                ...{ 'onClick': {} },
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_145));
            let __VLS_149;
            const __VLS_150 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.allAppointments.length === 0 && !__VLS_ctx.loadingAll))
                            return;
                        if (!(item.status === 1 || item.status === 7))
                            return;
                        __VLS_ctx.openChat(item);
                        // @ts-ignore
                        [openChat,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_151 } = __VLS_147.slots;
            let __VLS_152;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({}));
            const __VLS_154 = __VLS_153({}, ...__VLS_functionalComponentArgsRest(__VLS_153));
            const { default: __VLS_157 } = __VLS_155.slots;
            let __VLS_158;
            /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
            ChatDotRound;
            // @ts-ignore
            const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({}));
            const __VLS_160 = __VLS_159({}, ...__VLS_functionalComponentArgsRest(__VLS_159));
            // @ts-ignore
            [];
            var __VLS_155;
            // @ts-ignore
            [];
            var __VLS_147;
            var __VLS_148;
            let __VLS_163;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
                ...{ 'onClick': {} },
                type: "danger",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }));
            const __VLS_165 = __VLS_164({
                ...{ 'onClick': {} },
                type: "danger",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_164));
            let __VLS_168;
            const __VLS_169 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.allAppointments.length === 0 && !__VLS_ctx.loadingAll))
                            return;
                        if (!(item.status === 1 || item.status === 7))
                            return;
                        __VLS_ctx.cancelAppointment(item);
                        // @ts-ignore
                        [cancelAppointment,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_170 } = __VLS_166.slots;
            // @ts-ignore
            [];
            var __VLS_166;
            var __VLS_167;
        }
        else if (item.status === 0) {
            let __VLS_171;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171({
                type: "warning",
            }));
            const __VLS_173 = __VLS_172({
                type: "warning",
            }, ...__VLS_functionalComponentArgsRest(__VLS_172));
            const { default: __VLS_176 } = __VLS_174.slots;
            // @ts-ignore
            [];
            var __VLS_174;
            let __VLS_177;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({
                ...{ 'onClick': {} },
                type: "danger",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }));
            const __VLS_179 = __VLS_178({
                ...{ 'onClick': {} },
                type: "danger",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_178));
            let __VLS_182;
            const __VLS_183 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.allAppointments.length === 0 && !__VLS_ctx.loadingAll))
                            return;
                        if (!!(item.status === 1 || item.status === 7))
                            return;
                        if (!(item.status === 0))
                            return;
                        __VLS_ctx.cancelAppointment(item);
                        // @ts-ignore
                        [cancelAppointment,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_184 } = __VLS_180.slots;
            // @ts-ignore
            [];
            var __VLS_180;
            var __VLS_181;
        }
        else if (item.status === 4 && !item.rating) {
            let __VLS_185;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
                ...{ 'onClick': {} },
                type: "warning",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }));
            const __VLS_187 = __VLS_186({
                ...{ 'onClick': {} },
                type: "warning",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_186));
            let __VLS_190;
            const __VLS_191 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.allAppointments.length === 0 && !__VLS_ctx.loadingAll))
                            return;
                        if (!!(item.status === 1 || item.status === 7))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!(item.status === 4 && !item.rating))
                            return;
                        __VLS_ctx.showRatingDialog(item);
                        // @ts-ignore
                        [showRatingDialog,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_192 } = __VLS_188.slots;
            let __VLS_193;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({}));
            const __VLS_195 = __VLS_194({}, ...__VLS_functionalComponentArgsRest(__VLS_194));
            const { default: __VLS_198 } = __VLS_196.slots;
            let __VLS_199;
            /** @ts-ignore @type {typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_200 = __VLS_asFunctionalComponent1(__VLS_199, new __VLS_199({}));
            const __VLS_201 = __VLS_200({}, ...__VLS_functionalComponentArgsRest(__VLS_200));
            // @ts-ignore
            [];
            var __VLS_196;
            // @ts-ignore
            [];
            var __VLS_188;
            var __VLS_189;
        }
        else if (item.status === 4 && item.rating) {
            let __VLS_204;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
                type: "success",
            }));
            const __VLS_206 = __VLS_205({
                type: "success",
            }, ...__VLS_functionalComponentArgsRest(__VLS_205));
            const { default: __VLS_209 } = __VLS_207.slots;
            // @ts-ignore
            [];
            var __VLS_207;
        }
        else if (item.status === 8) {
            let __VLS_210;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
                type: "success",
            }));
            const __VLS_212 = __VLS_211({
                type: "success",
            }, ...__VLS_functionalComponentArgsRest(__VLS_211));
            const { default: __VLS_215 } = __VLS_213.slots;
            // @ts-ignore
            [];
            var __VLS_213;
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.allTotal > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
    let __VLS_216;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.allPage),
        pageSize: (__VLS_ctx.allSize),
        total: (__VLS_ctx.allTotal),
        layout: "prev, pager, next",
        ...{ class: "cosmic-pagination" },
    }));
    const __VLS_218 = __VLS_217({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.allPage),
        pageSize: (__VLS_ctx.allSize),
        total: (__VLS_ctx.allTotal),
        layout: "prev, pager, next",
        ...{ class: "cosmic-pagination" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    let __VLS_221;
    const __VLS_222 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.fetchAllAppointments) });
    /** @type {__VLS_StyleScopedClasses['cosmic-pagination']} */ ;
    var __VLS_219;
    var __VLS_220;
}
// @ts-ignore
[fetchAllAppointments, allTotal, allTotal, allPage, allSize,];
var __VLS_9;
let __VLS_223;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_224 = __VLS_asFunctionalComponent1(__VLS_223, new __VLS_223({
    label: "当前预约",
    name: "current",
}));
const __VLS_225 = __VLS_224({
    label: "当前预约",
    name: "current",
}, ...__VLS_functionalComponentArgsRest(__VLS_224));
const { default: __VLS_228 } = __VLS_226.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "appointment-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingCurrent) }, null, null);
/** @type {__VLS_StyleScopedClasses['appointment-list']} */ ;
if (__VLS_ctx.currentAppointments.length === 0 && !__VLS_ctx.loadingCurrent) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-wrapper']} */ ;
    let __VLS_229;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent1(__VLS_229, new __VLS_229({
        description: "暂无进行中的预约",
    }));
    const __VLS_231 = __VLS_230({
        description: "暂无进行中的预约",
    }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    const { default: __VLS_234 } = __VLS_232.slots;
    let __VLS_235;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }));
    const __VLS_237 = __VLS_236({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    let __VLS_240;
    const __VLS_241 = ({ click: {} },
        { onClick: (__VLS_ctx.goToFindPsychologist) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_242 } = __VLS_238.slots;
    // @ts-ignore
    [vLoading, goToFindPsychologist, loadingCurrent, loadingCurrent, currentAppointments,];
    var __VLS_238;
    var __VLS_239;
    // @ts-ignore
    [];
    var __VLS_232;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "appointment-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['appointment-grid']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.currentAppointments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-card cosmic-card" },
            key: (item.id),
        });
        /** @type {__VLS_StyleScopedClasses['appointment-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psychologist-section" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-section']} */ ;
        let __VLS_243;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_244 = __VLS_asFunctionalComponent1(__VLS_243, new __VLS_243({
            size: (64),
            src: (item.psychologistHeadPath),
            ...{ class: "psychologist-avatar cosmic-avatar" },
        }));
        const __VLS_245 = __VLS_244({
            size: (64),
            src: (item.psychologistHeadPath),
            ...{ class: "psychologist-avatar cosmic-avatar" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_244));
        /** @type {__VLS_StyleScopedClasses['psychologist-avatar']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-avatar']} */ ;
        const { default: __VLS_248 } = __VLS_246.slots;
        let __VLS_249;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_250 = __VLS_asFunctionalComponent1(__VLS_249, new __VLS_249({
            size: (32),
        }));
        const __VLS_251 = __VLS_250({
            size: (32),
        }, ...__VLS_functionalComponentArgsRest(__VLS_250));
        const { default: __VLS_254 } = __VLS_252.slots;
        let __VLS_255;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255({}));
        const __VLS_257 = __VLS_256({}, ...__VLS_functionalComponentArgsRest(__VLS_256));
        // @ts-ignore
        [currentAppointments,];
        var __VLS_252;
        // @ts-ignore
        [];
        var __VLS_246;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psychologist-info" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "psychologist-name" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-name']} */ ;
        (item.psychologistName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-item" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
        let __VLS_260;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260({}));
        const __VLS_262 = __VLS_261({}, ...__VLS_functionalComponentArgsRest(__VLS_261));
        const { default: __VLS_265 } = __VLS_263.slots;
        let __VLS_266;
        /** @ts-ignore @type {typeof __VLS_components.Calendar} */
        Calendar;
        // @ts-ignore
        const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({}));
        const __VLS_268 = __VLS_267({}, ...__VLS_functionalComponentArgsRest(__VLS_267));
        // @ts-ignore
        [];
        var __VLS_263;
        (__VLS_ctx.formatDate(item.appointmentTime));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "meta-item" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
        let __VLS_271;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_272 = __VLS_asFunctionalComponent1(__VLS_271, new __VLS_271({}));
        const __VLS_273 = __VLS_272({}, ...__VLS_functionalComponentArgsRest(__VLS_272));
        const { default: __VLS_276 } = __VLS_274.slots;
        let __VLS_277;
        /** @ts-ignore @type {typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_278 = __VLS_asFunctionalComponent1(__VLS_277, new __VLS_277({}));
        const __VLS_279 = __VLS_278({}, ...__VLS_functionalComponentArgsRest(__VLS_278));
        // @ts-ignore
        [formatDate,];
        var __VLS_274;
        (__VLS_ctx.getTimeSlotName(item.timeSlot));
        let __VLS_282;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_283 = __VLS_asFunctionalComponent1(__VLS_282, new __VLS_282({
            ...{ class: "status-tag" },
            type: (__VLS_ctx.getStatusType(item.status)),
        }));
        const __VLS_284 = __VLS_283({
            ...{ class: "status-tag" },
            type: (__VLS_ctx.getStatusType(item.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_283));
        /** @type {__VLS_StyleScopedClasses['status-tag']} */ ;
        const { default: __VLS_287 } = __VLS_285.slots;
        (__VLS_ctx.getStatusName(item.status));
        // @ts-ignore
        [getTimeSlotName, getStatusType, getStatusName,];
        var __VLS_285;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "appointment-details" },
        });
        /** @type {__VLS_StyleScopedClasses['appointment-details']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        (__VLS_ctx.getServiceTypeName(item.serviceType));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value price" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['price']} */ ;
        (item.price);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "action-buttons" },
        });
        /** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
        if (item.status === 1 || item.status === 7) {
            let __VLS_288;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_289 = __VLS_asFunctionalComponent1(__VLS_288, new __VLS_288({
                ...{ 'onClick': {} },
                type: "primary",
                ...{ class: "cosmic-btn-primary cosmic-btn" },
            }));
            const __VLS_290 = __VLS_289({
                ...{ 'onClick': {} },
                type: "primary",
                ...{ class: "cosmic-btn-primary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_289));
            let __VLS_293;
            const __VLS_294 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.currentAppointments.length === 0 && !__VLS_ctx.loadingCurrent))
                            return;
                        if (!(item.status === 1 || item.status === 7))
                            return;
                        __VLS_ctx.showConsultationInfo(item);
                        // @ts-ignore
                        [getServiceTypeName, showConsultationInfo,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_295 } = __VLS_291.slots;
            let __VLS_296;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_297 = __VLS_asFunctionalComponent1(__VLS_296, new __VLS_296({}));
            const __VLS_298 = __VLS_297({}, ...__VLS_functionalComponentArgsRest(__VLS_297));
            const { default: __VLS_301 } = __VLS_299.slots;
            let __VLS_302;
            /** @ts-ignore @type {typeof __VLS_components.VideoPlay} */
            VideoPlay;
            // @ts-ignore
            const __VLS_303 = __VLS_asFunctionalComponent1(__VLS_302, new __VLS_302({}));
            const __VLS_304 = __VLS_303({}, ...__VLS_functionalComponentArgsRest(__VLS_303));
            // @ts-ignore
            [];
            var __VLS_299;
            // @ts-ignore
            [];
            var __VLS_291;
            var __VLS_292;
            let __VLS_307;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_308 = __VLS_asFunctionalComponent1(__VLS_307, new __VLS_307({
                ...{ 'onClick': {} },
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }));
            const __VLS_309 = __VLS_308({
                ...{ 'onClick': {} },
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_308));
            let __VLS_312;
            const __VLS_313 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.currentAppointments.length === 0 && !__VLS_ctx.loadingCurrent))
                            return;
                        if (!(item.status === 1 || item.status === 7))
                            return;
                        __VLS_ctx.openChat(item);
                        // @ts-ignore
                        [openChat,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_314 } = __VLS_310.slots;
            let __VLS_315;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_316 = __VLS_asFunctionalComponent1(__VLS_315, new __VLS_315({}));
            const __VLS_317 = __VLS_316({}, ...__VLS_functionalComponentArgsRest(__VLS_316));
            const { default: __VLS_320 } = __VLS_318.slots;
            let __VLS_321;
            /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
            ChatDotRound;
            // @ts-ignore
            const __VLS_322 = __VLS_asFunctionalComponent1(__VLS_321, new __VLS_321({}));
            const __VLS_323 = __VLS_322({}, ...__VLS_functionalComponentArgsRest(__VLS_322));
            // @ts-ignore
            [];
            var __VLS_318;
            // @ts-ignore
            [];
            var __VLS_310;
            var __VLS_311;
            let __VLS_326;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_327 = __VLS_asFunctionalComponent1(__VLS_326, new __VLS_326({
                ...{ 'onClick': {} },
                type: "danger",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }));
            const __VLS_328 = __VLS_327({
                ...{ 'onClick': {} },
                type: "danger",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_327));
            let __VLS_331;
            const __VLS_332 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.currentAppointments.length === 0 && !__VLS_ctx.loadingCurrent))
                            return;
                        if (!(item.status === 1 || item.status === 7))
                            return;
                        __VLS_ctx.cancelAppointment(item);
                        // @ts-ignore
                        [cancelAppointment,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_333 } = __VLS_329.slots;
            // @ts-ignore
            [];
            var __VLS_329;
            var __VLS_330;
        }
        else if (item.status === 0) {
            let __VLS_334;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_335 = __VLS_asFunctionalComponent1(__VLS_334, new __VLS_334({
                type: "warning",
            }));
            const __VLS_336 = __VLS_335({
                type: "warning",
            }, ...__VLS_functionalComponentArgsRest(__VLS_335));
            const { default: __VLS_339 } = __VLS_337.slots;
            // @ts-ignore
            [];
            var __VLS_337;
            let __VLS_340;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_341 = __VLS_asFunctionalComponent1(__VLS_340, new __VLS_340({
                ...{ 'onClick': {} },
                type: "danger",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }));
            const __VLS_342 = __VLS_341({
                ...{ 'onClick': {} },
                type: "danger",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_341));
            let __VLS_345;
            const __VLS_346 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.currentAppointments.length === 0 && !__VLS_ctx.loadingCurrent))
                            return;
                        if (!!(item.status === 1 || item.status === 7))
                            return;
                        if (!(item.status === 0))
                            return;
                        __VLS_ctx.cancelAppointment(item);
                        // @ts-ignore
                        [cancelAppointment,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_347 } = __VLS_343.slots;
            // @ts-ignore
            [];
            var __VLS_343;
            var __VLS_344;
        }
        else if (item.status === 4) {
            let __VLS_348;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_349 = __VLS_asFunctionalComponent1(__VLS_348, new __VLS_348({
                ...{ 'onClick': {} },
                type: "warning",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }));
            const __VLS_350 = __VLS_349({
                ...{ 'onClick': {} },
                type: "warning",
                ...{ class: "cosmic-btn-secondary cosmic-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_349));
            let __VLS_353;
            const __VLS_354 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.currentAppointments.length === 0 && !__VLS_ctx.loadingCurrent))
                            return;
                        if (!!(item.status === 1 || item.status === 7))
                            return;
                        if (!!(item.status === 0))
                            return;
                        if (!(item.status === 4))
                            return;
                        __VLS_ctx.showRatingDialog(item);
                        // @ts-ignore
                        [showRatingDialog,];
                    } });
            /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
            const { default: __VLS_355 } = __VLS_351.slots;
            let __VLS_356;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_357 = __VLS_asFunctionalComponent1(__VLS_356, new __VLS_356({}));
            const __VLS_358 = __VLS_357({}, ...__VLS_functionalComponentArgsRest(__VLS_357));
            const { default: __VLS_361 } = __VLS_359.slots;
            let __VLS_362;
            /** @ts-ignore @type {typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_363 = __VLS_asFunctionalComponent1(__VLS_362, new __VLS_362({}));
            const __VLS_364 = __VLS_363({}, ...__VLS_functionalComponentArgsRest(__VLS_363));
            // @ts-ignore
            [];
            var __VLS_359;
            // @ts-ignore
            [];
            var __VLS_351;
            var __VLS_352;
        }
        if (item.status === 1 && item.videoLink) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "video-link" },
            });
            /** @type {__VLS_StyleScopedClasses['video-link']} */ ;
            let __VLS_367;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_368 = __VLS_asFunctionalComponent1(__VLS_367, new __VLS_367({}));
            const __VLS_369 = __VLS_368({}, ...__VLS_functionalComponentArgsRest(__VLS_368));
            const { default: __VLS_372 } = __VLS_370.slots;
            let __VLS_373;
            /** @ts-ignore @type {typeof __VLS_components.VideoCamera} */
            VideoCamera;
            // @ts-ignore
            const __VLS_374 = __VLS_asFunctionalComponent1(__VLS_373, new __VLS_373({}));
            const __VLS_375 = __VLS_374({}, ...__VLS_functionalComponentArgsRest(__VLS_374));
            // @ts-ignore
            [];
            var __VLS_370;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            let __VLS_378;
            /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
            elLink;
            // @ts-ignore
            const __VLS_379 = __VLS_asFunctionalComponent1(__VLS_378, new __VLS_378({
                href: (item.videoLink),
                target: "_blank",
                type: "primary",
            }));
            const __VLS_380 = __VLS_379({
                href: (item.videoLink),
                target: "_blank",
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_379));
            const { default: __VLS_383 } = __VLS_381.slots;
            (item.videoLink);
            // @ts-ignore
            [];
            var __VLS_381;
        }
        if (item.status === 1 && item.serviceType === 'offline') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "offline-info" },
            });
            /** @type {__VLS_StyleScopedClasses['offline-info']} */ ;
            let __VLS_384;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_385 = __VLS_asFunctionalComponent1(__VLS_384, new __VLS_384({}));
            const __VLS_386 = __VLS_385({}, ...__VLS_functionalComponentArgsRest(__VLS_385));
            const { default: __VLS_389 } = __VLS_387.slots;
            let __VLS_390;
            /** @ts-ignore @type {typeof __VLS_components.Location} */
            Location;
            // @ts-ignore
            const __VLS_391 = __VLS_asFunctionalComponent1(__VLS_390, new __VLS_390({}));
            const __VLS_392 = __VLS_391({}, ...__VLS_functionalComponentArgsRest(__VLS_391));
            // @ts-ignore
            [];
            var __VLS_387;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (item.offlineAddress || '待定');
        }
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
var __VLS_226;
let __VLS_395;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_396 = __VLS_asFunctionalComponent1(__VLS_395, new __VLS_395({
    label: "咨询历史",
    name: "history",
}));
const __VLS_397 = __VLS_396({
    label: "咨询历史",
    name: "history",
}, ...__VLS_functionalComponentArgsRest(__VLS_396));
const { default: __VLS_400 } = __VLS_398.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "history-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingHistory) }, null, null);
/** @type {__VLS_StyleScopedClasses['history-list']} */ ;
if (__VLS_ctx.consultationHistory.length === 0 && !__VLS_ctx.loadingHistory) {
    let __VLS_401;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_402 = __VLS_asFunctionalComponent1(__VLS_401, new __VLS_401({
        description: "暂无咨询历史",
    }));
    const __VLS_403 = __VLS_402({
        description: "暂无咨询历史",
    }, ...__VLS_functionalComponentArgsRest(__VLS_402));
    const { default: __VLS_406 } = __VLS_404.slots;
    let __VLS_407;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_408 = __VLS_asFunctionalComponent1(__VLS_407, new __VLS_407({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }));
    const __VLS_409 = __VLS_408({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_408));
    let __VLS_412;
    const __VLS_413 = ({ click: {} },
        { onClick: (__VLS_ctx.goToFindPsychologist) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_414 } = __VLS_410.slots;
    // @ts-ignore
    [vLoading, goToFindPsychologist, loadingHistory, loadingHistory, consultationHistory,];
    var __VLS_410;
    var __VLS_411;
    // @ts-ignore
    [];
    var __VLS_404;
}
else {
    let __VLS_415;
    /** @ts-ignore @type {typeof __VLS_components.elTimeline | typeof __VLS_components.ElTimeline | typeof __VLS_components.elTimeline | typeof __VLS_components.ElTimeline} */
    elTimeline;
    // @ts-ignore
    const __VLS_416 = __VLS_asFunctionalComponent1(__VLS_415, new __VLS_415({}));
    const __VLS_417 = __VLS_416({}, ...__VLS_functionalComponentArgsRest(__VLS_416));
    const { default: __VLS_420 } = __VLS_418.slots;
    for (const [item] of __VLS_vFor((__VLS_ctx.consultationHistory))) {
        let __VLS_421;
        /** @ts-ignore @type {typeof __VLS_components.elTimelineItem | typeof __VLS_components.ElTimelineItem | typeof __VLS_components.elTimelineItem | typeof __VLS_components.ElTimelineItem} */
        elTimelineItem;
        // @ts-ignore
        const __VLS_422 = __VLS_asFunctionalComponent1(__VLS_421, new __VLS_421({
            key: (item.id),
            timestamp: (__VLS_ctx.formatDate(item.appointmentTime)),
            placement: "top",
            type: "primary",
        }));
        const __VLS_423 = __VLS_422({
            key: (item.id),
            timestamp: (__VLS_ctx.formatDate(item.appointmentTime)),
            placement: "top",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_422));
        const { default: __VLS_426 } = __VLS_424.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-card cosmic-card" },
        });
        /** @type {__VLS_StyleScopedClasses['history-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-header" },
        });
        /** @type {__VLS_StyleScopedClasses['history-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psychologist-mini" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-mini']} */ ;
        let __VLS_427;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_428 = __VLS_asFunctionalComponent1(__VLS_427, new __VLS_427({
            size: (48),
            src: (item.psychologistHeadPath),
        }));
        const __VLS_429 = __VLS_428({
            size: (48),
            src: (item.psychologistHeadPath),
        }, ...__VLS_functionalComponentArgsRest(__VLS_428));
        const { default: __VLS_432 } = __VLS_430.slots;
        let __VLS_433;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_434 = __VLS_asFunctionalComponent1(__VLS_433, new __VLS_433({}));
        const __VLS_435 = __VLS_434({}, ...__VLS_functionalComponentArgsRest(__VLS_434));
        const { default: __VLS_438 } = __VLS_436.slots;
        let __VLS_439;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_440 = __VLS_asFunctionalComponent1(__VLS_439, new __VLS_439({}));
        const __VLS_441 = __VLS_440({}, ...__VLS_functionalComponentArgsRest(__VLS_440));
        // @ts-ignore
        [formatDate, consultationHistory,];
        var __VLS_436;
        // @ts-ignore
        [];
        var __VLS_430;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "name" },
        });
        /** @type {__VLS_StyleScopedClasses['name']} */ ;
        (item.psychologistName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['history-meta']} */ ;
        let __VLS_444;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_445 = __VLS_asFunctionalComponent1(__VLS_444, new __VLS_444({
            size: "small",
            type: (__VLS_ctx.getStatusType(item.status)),
        }));
        const __VLS_446 = __VLS_445({
            size: "small",
            type: (__VLS_ctx.getStatusType(item.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_445));
        const { default: __VLS_449 } = __VLS_447.slots;
        (__VLS_ctx.getStatusName(item.status));
        // @ts-ignore
        [getStatusType, getStatusName,];
        var __VLS_447;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "service-type" },
        });
        /** @type {__VLS_StyleScopedClasses['service-type']} */ ;
        (__VLS_ctx.getServiceTypeName(item.serviceType));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-content" },
        });
        /** @type {__VLS_StyleScopedClasses['history-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "history-problem" },
        });
        /** @type {__VLS_StyleScopedClasses['history-problem']} */ ;
        (item.problems);
        if (item.rating) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "history-rating" },
            });
            /** @type {__VLS_StyleScopedClasses['history-rating']} */ ;
            let __VLS_450;
            /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
            elRate;
            // @ts-ignore
            const __VLS_451 = __VLS_asFunctionalComponent1(__VLS_450, new __VLS_450({
                modelValue: (item.rating),
                disabled: true,
                showScore: true,
            }));
            const __VLS_452 = __VLS_451({
                modelValue: (item.rating),
                disabled: true,
                showScore: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_451));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "rating-comment" },
            });
            /** @type {__VLS_StyleScopedClasses['rating-comment']} */ ;
            (item.ratingComment);
        }
        // @ts-ignore
        [getServiceTypeName,];
        var __VLS_424;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_418;
}
if (__VLS_ctx.historyTotal > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
    let __VLS_455;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_456 = __VLS_asFunctionalComponent1(__VLS_455, new __VLS_455({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.historyPage),
        pageSize: (__VLS_ctx.historySize),
        total: (__VLS_ctx.historyTotal),
        layout: "prev, pager, next",
        ...{ class: "cosmic-pagination" },
    }));
    const __VLS_457 = __VLS_456({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.historyPage),
        pageSize: (__VLS_ctx.historySize),
        total: (__VLS_ctx.historyTotal),
        layout: "prev, pager, next",
        ...{ class: "cosmic-pagination" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_456));
    let __VLS_460;
    const __VLS_461 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.fetchHistory) });
    /** @type {__VLS_StyleScopedClasses['cosmic-pagination']} */ ;
    var __VLS_458;
    var __VLS_459;
}
// @ts-ignore
[historyTotal, historyTotal, historyPage, historySize, fetchHistory,];
var __VLS_398;
let __VLS_462;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_463 = __VLS_asFunctionalComponent1(__VLS_462, new __VLS_462({
    label: "收藏的心理咨询师",
    name: "favorites",
}));
const __VLS_464 = __VLS_463({
    label: "收藏的心理咨询师",
    name: "favorites",
}, ...__VLS_functionalComponentArgsRest(__VLS_463));
const { default: __VLS_467 } = __VLS_465.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "favorites-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingFavorites) }, null, null);
/** @type {__VLS_StyleScopedClasses['favorites-list']} */ ;
if (__VLS_ctx.favoritePsychologists.length === 0 && !__VLS_ctx.loadingFavorites) {
    let __VLS_468;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_469 = __VLS_asFunctionalComponent1(__VLS_468, new __VLS_468({
        description: "暂无收藏的心理咨询师",
    }));
    const __VLS_470 = __VLS_469({
        description: "暂无收藏的心理咨询师",
    }, ...__VLS_functionalComponentArgsRest(__VLS_469));
    const { default: __VLS_473 } = __VLS_471.slots;
    let __VLS_474;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_475 = __VLS_asFunctionalComponent1(__VLS_474, new __VLS_474({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }));
    const __VLS_476 = __VLS_475({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_475));
    let __VLS_479;
    const __VLS_480 = ({ click: {} },
        { onClick: (__VLS_ctx.goToFindPsychologist) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_481 } = __VLS_477.slots;
    // @ts-ignore
    [vLoading, goToFindPsychologist, loadingFavorites, loadingFavorites, favoritePsychologists,];
    var __VLS_477;
    var __VLS_478;
    // @ts-ignore
    [];
    var __VLS_471;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "psychologist-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-grid']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.favoritePsychologists))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.favoritePsychologists.length === 0 && !__VLS_ctx.loadingFavorites))
                        return;
                    __VLS_ctx.goToPsychologistDetail(item.psychologistId);
                    // @ts-ignore
                    [favoritePsychologists, goToPsychologistDetail,];
                } },
            ...{ class: "psychologist-card cosmic-card" },
            key: (item.id),
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
        let __VLS_482;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_483 = __VLS_asFunctionalComponent1(__VLS_482, new __VLS_482({
            size: (72),
            src: (item.psychologistHead),
            ...{ class: "psychologist-avatar cosmic-avatar" },
        }));
        const __VLS_484 = __VLS_483({
            size: (72),
            src: (item.psychologistHead),
            ...{ class: "psychologist-avatar cosmic-avatar" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_483));
        /** @type {__VLS_StyleScopedClasses['psychologist-avatar']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-avatar']} */ ;
        const { default: __VLS_487 } = __VLS_485.slots;
        let __VLS_488;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_489 = __VLS_asFunctionalComponent1(__VLS_488, new __VLS_488({
            size: (36),
        }));
        const __VLS_490 = __VLS_489({
            size: (36),
        }, ...__VLS_functionalComponentArgsRest(__VLS_489));
        const { default: __VLS_493 } = __VLS_491.slots;
        let __VLS_494;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_495 = __VLS_asFunctionalComponent1(__VLS_494, new __VLS_494({}));
        const __VLS_496 = __VLS_495({}, ...__VLS_functionalComponentArgsRest(__VLS_495));
        // @ts-ignore
        [];
        var __VLS_491;
        // @ts-ignore
        [];
        var __VLS_485;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "online-indicator" },
            ...{ class: ({ online: item.onlineStatus === 1 }) },
        });
        /** @type {__VLS_StyleScopedClasses['online-indicator']} */ ;
        /** @type {__VLS_StyleScopedClasses['online']} */ ;
        (item.onlineStatus === 1 ? '在线' : '离线');
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "psychologist-name" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-name']} */ ;
        (item.psychologistName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psychologist-rating" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-rating']} */ ;
        let __VLS_499;
        /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
        elRate;
        // @ts-ignore
        const __VLS_500 = __VLS_asFunctionalComponent1(__VLS_499, new __VLS_499({
            modelValue: (item.ratingScore),
            disabled: true,
            showScore: true,
            size: "small",
        }));
        const __VLS_501 = __VLS_500({
            modelValue: (item.ratingScore),
            disabled: true,
            showScore: true,
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_500));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "psychologist-experience" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-experience']} */ ;
        (item.yearsExperience || 0);
        (item.consultationCount || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psychologist-tags" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-tags']} */ ;
        for (const [field] of __VLS_vFor((item.fields?.slice(0, 2)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (field.id),
                ...{ class: "mini-tag cosmic-tag" },
            });
            /** @type {__VLS_StyleScopedClasses['mini-tag']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-tag']} */ ;
            (field.name);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
        let __VLS_504;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_505 = __VLS_asFunctionalComponent1(__VLS_504, new __VLS_504({
            ...{ 'onClick': {} },
            ...{ class: "book-again-btn cosmic-btn-primary cosmic-btn" },
        }));
        const __VLS_506 = __VLS_505({
            ...{ 'onClick': {} },
            ...{ class: "book-again-btn cosmic-btn-primary cosmic-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_505));
        let __VLS_509;
        const __VLS_510 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.favoritePsychologists.length === 0 && !__VLS_ctx.loadingFavorites))
                        return;
                    __VLS_ctx.bookAgain(item);
                    // @ts-ignore
                    [bookAgain,];
                } });
        /** @type {__VLS_StyleScopedClasses['book-again-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        const { default: __VLS_511 } = __VLS_507.slots;
        // @ts-ignore
        [];
        var __VLS_507;
        var __VLS_508;
        let __VLS_512;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_513 = __VLS_asFunctionalComponent1(__VLS_512, new __VLS_512({
            ...{ 'onClick': {} },
            ...{ class: "unfavorite-btn cosmic-btn-secondary cosmic-btn" },
        }));
        const __VLS_514 = __VLS_513({
            ...{ 'onClick': {} },
            ...{ class: "unfavorite-btn cosmic-btn-secondary cosmic-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_513));
        let __VLS_517;
        const __VLS_518 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.favoritePsychologists.length === 0 && !__VLS_ctx.loadingFavorites))
                        return;
                    __VLS_ctx.unfavorite(item);
                    // @ts-ignore
                    [unfavorite,];
                } });
        /** @type {__VLS_StyleScopedClasses['unfavorite-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        const { default: __VLS_519 } = __VLS_515.slots;
        let __VLS_520;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_521 = __VLS_asFunctionalComponent1(__VLS_520, new __VLS_520({}));
        const __VLS_522 = __VLS_521({}, ...__VLS_functionalComponentArgsRest(__VLS_521));
        const { default: __VLS_525 } = __VLS_523.slots;
        let __VLS_526;
        /** @ts-ignore @type {typeof __VLS_components.Star} */
        Star;
        // @ts-ignore
        const __VLS_527 = __VLS_asFunctionalComponent1(__VLS_526, new __VLS_526({}));
        const __VLS_528 = __VLS_527({}, ...__VLS_functionalComponentArgsRest(__VLS_527));
        // @ts-ignore
        [];
        var __VLS_523;
        // @ts-ignore
        [];
        var __VLS_515;
        var __VLS_516;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
var __VLS_465;
let __VLS_531;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_532 = __VLS_asFunctionalComponent1(__VLS_531, new __VLS_531({
    label: "图文咨询",
    name: "chat",
}));
const __VLS_533 = __VLS_532({
    label: "图文咨询",
    name: "chat",
}, ...__VLS_functionalComponentArgsRest(__VLS_532));
const { default: __VLS_536 } = __VLS_534.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-list-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['chat-list-wrapper']} */ ;
if (__VLS_ctx.chatAppointments.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-chat" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-chat']} */ ;
    let __VLS_537;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_538 = __VLS_asFunctionalComponent1(__VLS_537, new __VLS_537({
        description: "暂无图文咨询",
    }));
    const __VLS_539 = __VLS_538({
        description: "暂无图文咨询",
    }, ...__VLS_functionalComponentArgsRest(__VLS_538));
    const { default: __VLS_542 } = __VLS_540.slots;
    let __VLS_543;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_544 = __VLS_asFunctionalComponent1(__VLS_543, new __VLS_543({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }));
    const __VLS_545 = __VLS_544({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_544));
    let __VLS_548;
    const __VLS_549 = ({ click: {} },
        { onClick: (__VLS_ctx.goToFindPsychologist) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_550 } = __VLS_546.slots;
    // @ts-ignore
    [goToFindPsychologist, chatAppointments,];
    var __VLS_546;
    var __VLS_547;
    // @ts-ignore
    [];
    var __VLS_540;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-list-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-list-grid']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.chatAppointments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "chat-card cosmic-card" },
            key: (item.id),
        });
        /** @type {__VLS_StyleScopedClasses['chat-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "chat-card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['chat-card-header']} */ ;
        let __VLS_551;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_552 = __VLS_asFunctionalComponent1(__VLS_551, new __VLS_551({
            size: (56),
            src: (item.psychologistHeadPath),
            ...{ class: "psy-avatar" },
        }));
        const __VLS_553 = __VLS_552({
            size: (56),
            src: (item.psychologistHeadPath),
            ...{ class: "psy-avatar" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_552));
        /** @type {__VLS_StyleScopedClasses['psy-avatar']} */ ;
        const { default: __VLS_556 } = __VLS_554.slots;
        let __VLS_557;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_558 = __VLS_asFunctionalComponent1(__VLS_557, new __VLS_557({
            size: (28),
        }));
        const __VLS_559 = __VLS_558({
            size: (28),
        }, ...__VLS_functionalComponentArgsRest(__VLS_558));
        const { default: __VLS_562 } = __VLS_560.slots;
        let __VLS_563;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_564 = __VLS_asFunctionalComponent1(__VLS_563, new __VLS_563({}));
        const __VLS_565 = __VLS_564({}, ...__VLS_functionalComponentArgsRest(__VLS_564));
        // @ts-ignore
        [chatAppointments,];
        var __VLS_560;
        // @ts-ignore
        [];
        var __VLS_554;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "psy-info" },
        });
        /** @type {__VLS_StyleScopedClasses['psy-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "psy-name" },
        });
        /** @type {__VLS_StyleScopedClasses['psy-name']} */ ;
        (item.psychologistName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "service-badge" },
        });
        /** @type {__VLS_StyleScopedClasses['service-badge']} */ ;
        (__VLS_ctx.getServiceTypeName(item.serviceType));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "chat-card-body" },
        });
        /** @type {__VLS_StyleScopedClasses['chat-card-body']} */ ;
        if (item.problems || item.userProblems) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "problem-preview" },
            });
            /** @type {__VLS_StyleScopedClasses['problem-preview']} */ ;
            ((item.problems || item.userProblems || '').substring(0, 50));
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "problem-preview" },
            });
            /** @type {__VLS_StyleScopedClasses['problem-preview']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "chat-card-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['chat-card-footer']} */ ;
        let __VLS_568;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_569 = __VLS_asFunctionalComponent1(__VLS_568, new __VLS_568({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "cosmic-btn-primary cosmic-btn start-chat-btn" },
        }));
        const __VLS_570 = __VLS_569({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "cosmic-btn-primary cosmic-btn start-chat-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_569));
        let __VLS_573;
        const __VLS_574 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.chatAppointments.length === 0))
                        return;
                    __VLS_ctx.openChat(item);
                    // @ts-ignore
                    [getServiceTypeName, openChat,];
                } });
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['start-chat-btn']} */ ;
        const { default: __VLS_575 } = __VLS_571.slots;
        let __VLS_576;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_577 = __VLS_asFunctionalComponent1(__VLS_576, new __VLS_576({}));
        const __VLS_578 = __VLS_577({}, ...__VLS_functionalComponentArgsRest(__VLS_577));
        const { default: __VLS_581 } = __VLS_579.slots;
        let __VLS_582;
        /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
        ChatDotRound;
        // @ts-ignore
        const __VLS_583 = __VLS_asFunctionalComponent1(__VLS_582, new __VLS_582({}));
        const __VLS_584 = __VLS_583({}, ...__VLS_functionalComponentArgsRest(__VLS_583));
        // @ts-ignore
        [];
        var __VLS_579;
        // @ts-ignore
        [];
        var __VLS_571;
        var __VLS_572;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
var __VLS_534;
// @ts-ignore
[];
var __VLS_3;
let __VLS_587;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_588 = __VLS_asFunctionalComponent1(__VLS_587, new __VLS_587({
    modelValue: (__VLS_ctx.ratingDialogVisible),
    title: "评价咨询",
    width: "500px",
    ...{ class: "cosmic-dialog" },
}));
const __VLS_589 = __VLS_588({
    modelValue: (__VLS_ctx.ratingDialogVisible),
    title: "评价咨询",
    width: "500px",
    ...{ class: "cosmic-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_588));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
const { default: __VLS_592 } = __VLS_590.slots;
if (__VLS_ctx.ratingAppointment) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rating-form" },
    });
    /** @type {__VLS_StyleScopedClasses['rating-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rating-psychologist" },
    });
    /** @type {__VLS_StyleScopedClasses['rating-psychologist']} */ ;
    let __VLS_593;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_594 = __VLS_asFunctionalComponent1(__VLS_593, new __VLS_593({
        size: (60),
        src: (__VLS_ctx.ratingAppointment.psychologistHeadPath),
    }));
    const __VLS_595 = __VLS_594({
        size: (60),
        src: (__VLS_ctx.ratingAppointment.psychologistHeadPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_594));
    const { default: __VLS_598 } = __VLS_596.slots;
    let __VLS_599;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_600 = __VLS_asFunctionalComponent1(__VLS_599, new __VLS_599({
        size: (30),
    }));
    const __VLS_601 = __VLS_600({
        size: (30),
    }, ...__VLS_functionalComponentArgsRest(__VLS_600));
    const { default: __VLS_604 } = __VLS_602.slots;
    let __VLS_605;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_606 = __VLS_asFunctionalComponent1(__VLS_605, new __VLS_605({}));
    const __VLS_607 = __VLS_606({}, ...__VLS_functionalComponentArgsRest(__VLS_606));
    // @ts-ignore
    [ratingDialogVisible, ratingAppointment, ratingAppointment,];
    var __VLS_602;
    // @ts-ignore
    [];
    var __VLS_596;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "psychologist-info" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    (__VLS_ctx.ratingAppointment.psychologistName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.formatDate(__VLS_ctx.ratingAppointment.appointmentTime));
    let __VLS_610;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_611 = __VLS_asFunctionalComponent1(__VLS_610, new __VLS_610({
        labelPosition: "top",
    }));
    const __VLS_612 = __VLS_611({
        labelPosition: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_611));
    const { default: __VLS_615 } = __VLS_613.slots;
    let __VLS_616;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_617 = __VLS_asFunctionalComponent1(__VLS_616, new __VLS_616({
        label: "评分",
    }));
    const __VLS_618 = __VLS_617({
        label: "评分",
    }, ...__VLS_functionalComponentArgsRest(__VLS_617));
    const { default: __VLS_621 } = __VLS_619.slots;
    let __VLS_622;
    /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate | typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
    elRate;
    // @ts-ignore
    const __VLS_623 = __VLS_asFunctionalComponent1(__VLS_622, new __VLS_622({
        modelValue: (__VLS_ctx.ratingForm.rating),
        showText: true,
    }));
    const __VLS_624 = __VLS_623({
        modelValue: (__VLS_ctx.ratingForm.rating),
        showText: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_623));
    const { default: __VLS_627 } = __VLS_625.slots;
    {
        const { 'text-choices': __VLS_628 } = __VLS_625.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        // @ts-ignore
        [formatDate, ratingAppointment, ratingAppointment, ratingForm,];
    }
    // @ts-ignore
    [];
    var __VLS_625;
    // @ts-ignore
    [];
    var __VLS_619;
    let __VLS_629;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_630 = __VLS_asFunctionalComponent1(__VLS_629, new __VLS_629({
        label: "评价内容",
    }));
    const __VLS_631 = __VLS_630({
        label: "评价内容",
    }, ...__VLS_functionalComponentArgsRest(__VLS_630));
    const { default: __VLS_634 } = __VLS_632.slots;
    let __VLS_635;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_636 = __VLS_asFunctionalComponent1(__VLS_635, new __VLS_635({
        modelValue: (__VLS_ctx.ratingForm.comment),
        type: "textarea",
        rows: (4),
        placeholder: "分享您的咨询体验...",
        ...{ class: "cosmic-textarea" },
    }));
    const __VLS_637 = __VLS_636({
        modelValue: (__VLS_ctx.ratingForm.comment),
        type: "textarea",
        rows: (4),
        placeholder: "分享您的咨询体验...",
        ...{ class: "cosmic-textarea" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_636));
    /** @type {__VLS_StyleScopedClasses['cosmic-textarea']} */ ;
    // @ts-ignore
    [ratingForm,];
    var __VLS_632;
    let __VLS_640;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_641 = __VLS_asFunctionalComponent1(__VLS_640, new __VLS_640({
        label: "匿名评价",
    }));
    const __VLS_642 = __VLS_641({
        label: "匿名评价",
    }, ...__VLS_functionalComponentArgsRest(__VLS_641));
    const { default: __VLS_645 } = __VLS_643.slots;
    let __VLS_646;
    /** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
    elSwitch;
    // @ts-ignore
    const __VLS_647 = __VLS_asFunctionalComponent1(__VLS_646, new __VLS_646({
        modelValue: (__VLS_ctx.ratingForm.isAnonymous),
        activeValue: (1),
        inactiveValue: (0),
    }));
    const __VLS_648 = __VLS_647({
        modelValue: (__VLS_ctx.ratingForm.isAnonymous),
        activeValue: (1),
        inactiveValue: (0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_647));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "anonymous-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['anonymous-hint']} */ ;
    // @ts-ignore
    [ratingForm,];
    var __VLS_643;
    // @ts-ignore
    [];
    var __VLS_613;
}
{
    const { footer: __VLS_651 } = __VLS_590.slots;
    let __VLS_652;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_653 = __VLS_asFunctionalComponent1(__VLS_652, new __VLS_652({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }));
    const __VLS_654 = __VLS_653({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_653));
    let __VLS_657;
    const __VLS_658 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.ratingDialogVisible = false;
                // @ts-ignore
                [ratingDialogVisible,];
            } });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_659 } = __VLS_655.slots;
    // @ts-ignore
    [];
    var __VLS_655;
    var __VLS_656;
    let __VLS_660;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_661 = __VLS_asFunctionalComponent1(__VLS_660, new __VLS_660({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        loading: (__VLS_ctx.submittingRating),
    }));
    const __VLS_662 = __VLS_661({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        loading: (__VLS_ctx.submittingRating),
    }, ...__VLS_functionalComponentArgsRest(__VLS_661));
    let __VLS_665;
    const __VLS_666 = ({ click: {} },
        { onClick: (__VLS_ctx.submitRating) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_667 } = __VLS_663.slots;
    // @ts-ignore
    [submittingRating, submitRating,];
    var __VLS_663;
    var __VLS_664;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_590;
let __VLS_668;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_669 = __VLS_asFunctionalComponent1(__VLS_668, new __VLS_668({
    modelValue: (__VLS_ctx.consultationDialogVisible),
    title: "进入咨询",
    width: "500px",
    ...{ class: "cosmic-dialog" },
}));
const __VLS_670 = __VLS_669({
    modelValue: (__VLS_ctx.consultationDialogVisible),
    title: "进入咨询",
    width: "500px",
    ...{ class: "cosmic-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_669));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
const { default: __VLS_673 } = __VLS_671.slots;
if (__VLS_ctx.currentConsultation) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "consultation-info" },
    });
    /** @type {__VLS_StyleScopedClasses['consultation-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "consultation-psychologist" },
    });
    /** @type {__VLS_StyleScopedClasses['consultation-psychologist']} */ ;
    let __VLS_674;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_675 = __VLS_asFunctionalComponent1(__VLS_674, new __VLS_674({
        size: (60),
        src: (__VLS_ctx.currentConsultation.psychologistHeadPath),
    }));
    const __VLS_676 = __VLS_675({
        size: (60),
        src: (__VLS_ctx.currentConsultation.psychologistHeadPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_675));
    const { default: __VLS_679 } = __VLS_677.slots;
    let __VLS_680;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_681 = __VLS_asFunctionalComponent1(__VLS_680, new __VLS_680({
        size: (30),
    }));
    const __VLS_682 = __VLS_681({
        size: (30),
    }, ...__VLS_functionalComponentArgsRest(__VLS_681));
    const { default: __VLS_685 } = __VLS_683.slots;
    let __VLS_686;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_687 = __VLS_asFunctionalComponent1(__VLS_686, new __VLS_686({}));
    const __VLS_688 = __VLS_687({}, ...__VLS_functionalComponentArgsRest(__VLS_687));
    // @ts-ignore
    [consultationDialogVisible, currentConsultation, currentConsultation,];
    var __VLS_683;
    // @ts-ignore
    [];
    var __VLS_677;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "psychologist-info" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    (__VLS_ctx.currentConsultation.psychologistName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.getServiceTypeName(__VLS_ctx.currentConsultation.serviceType));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "consultation-details" },
    });
    /** @type {__VLS_StyleScopedClasses['consultation-details']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-row" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-label" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "detail-value" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
    (__VLS_ctx.formatDate(__VLS_ctx.currentConsultation.appointmentTime));
    (__VLS_ctx.getTimeSlotName(__VLS_ctx.currentConsultation.timeSlot));
    if (__VLS_ctx.currentConsultation.startTime) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        (__VLS_ctx.currentConsultation.startTime);
    }
    if (__VLS_ctx.currentConsultation.endTime) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        (__VLS_ctx.currentConsultation.endTime);
    }
    if (__VLS_ctx.currentConsultation.videoLink) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value video-link-text" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['video-link-text']} */ ;
        (__VLS_ctx.currentConsultation.videoLink);
    }
    if (__VLS_ctx.currentConsultation.serviceType === 'offline' && __VLS_ctx.currentConsultation.offlineAddress) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-row" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-label" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "detail-value" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
        (__VLS_ctx.currentConsultation.offlineAddress);
    }
    if (__VLS_ctx.currentConsultation.videoLink) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "consultation-tip" },
        });
        /** @type {__VLS_StyleScopedClasses['consultation-tip']} */ ;
        let __VLS_691;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_692 = __VLS_asFunctionalComponent1(__VLS_691, new __VLS_691({}));
        const __VLS_693 = __VLS_692({}, ...__VLS_functionalComponentArgsRest(__VLS_692));
        const { default: __VLS_696 } = __VLS_694.slots;
        let __VLS_697;
        /** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
        InfoFilled;
        // @ts-ignore
        const __VLS_698 = __VLS_asFunctionalComponent1(__VLS_697, new __VLS_697({}));
        const __VLS_699 = __VLS_698({}, ...__VLS_functionalComponentArgsRest(__VLS_698));
        // @ts-ignore
        [formatDate, getTimeSlotName, getServiceTypeName, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation, currentConsultation,];
        var __VLS_694;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "consultation-tip warning" },
        });
        /** @type {__VLS_StyleScopedClasses['consultation-tip']} */ ;
        /** @type {__VLS_StyleScopedClasses['warning']} */ ;
        let __VLS_702;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_703 = __VLS_asFunctionalComponent1(__VLS_702, new __VLS_702({}));
        const __VLS_704 = __VLS_703({}, ...__VLS_functionalComponentArgsRest(__VLS_703));
        const { default: __VLS_707 } = __VLS_705.slots;
        let __VLS_708;
        /** @ts-ignore @type {typeof __VLS_components.Warning} */
        Warning;
        // @ts-ignore
        const __VLS_709 = __VLS_asFunctionalComponent1(__VLS_708, new __VLS_708({}));
        const __VLS_710 = __VLS_709({}, ...__VLS_functionalComponentArgsRest(__VLS_709));
        // @ts-ignore
        [];
        var __VLS_705;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
{
    const { footer: __VLS_713 } = __VLS_671.slots;
    let __VLS_714;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_715 = __VLS_asFunctionalComponent1(__VLS_714, new __VLS_714({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }));
    const __VLS_716 = __VLS_715({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_715));
    let __VLS_719;
    const __VLS_720 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.consultationDialogVisible = false;
                // @ts-ignore
                [consultationDialogVisible,];
            } });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_721 } = __VLS_717.slots;
    // @ts-ignore
    [];
    var __VLS_717;
    var __VLS_718;
    if (__VLS_ctx.currentConsultation?.videoLink) {
        let __VLS_722;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_723 = __VLS_asFunctionalComponent1(__VLS_722, new __VLS_722({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "cosmic-btn-primary cosmic-btn" },
        }));
        const __VLS_724 = __VLS_723({
            ...{ 'onClick': {} },
            type: "primary",
            ...{ class: "cosmic-btn-primary cosmic-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_723));
        let __VLS_727;
        const __VLS_728 = ({ click: {} },
            { onClick: (__VLS_ctx.openVideoLink) });
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        const { default: __VLS_729 } = __VLS_725.slots;
        let __VLS_730;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_731 = __VLS_asFunctionalComponent1(__VLS_730, new __VLS_730({}));
        const __VLS_732 = __VLS_731({}, ...__VLS_functionalComponentArgsRest(__VLS_731));
        const { default: __VLS_735 } = __VLS_733.slots;
        let __VLS_736;
        /** @ts-ignore @type {typeof __VLS_components.VideoPlay} */
        VideoPlay;
        // @ts-ignore
        const __VLS_737 = __VLS_asFunctionalComponent1(__VLS_736, new __VLS_736({}));
        const __VLS_738 = __VLS_737({}, ...__VLS_functionalComponentArgsRest(__VLS_737));
        // @ts-ignore
        [currentConsultation, openVideoLink,];
        var __VLS_733;
        // @ts-ignore
        [];
        var __VLS_725;
        var __VLS_726;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_671;
let __VLS_741;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_742 = __VLS_asFunctionalComponent1(__VLS_741, new __VLS_741({
    modelValue: (__VLS_ctx.cancelDialogVisible),
    title: "取消预约",
    width: "450px",
    ...{ class: "cosmic-dialog" },
}));
const __VLS_743 = __VLS_742({
    modelValue: (__VLS_ctx.cancelDialogVisible),
    title: "取消预约",
    width: "450px",
    ...{ class: "cosmic-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_742));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
const { default: __VLS_746 } = __VLS_744.slots;
if (__VLS_ctx.cancelTarget) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cancel-dialog-content" },
    });
    /** @type {__VLS_StyleScopedClasses['cancel-dialog-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cancel-header" },
    });
    /** @type {__VLS_StyleScopedClasses['cancel-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cancel-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['cancel-icon']} */ ;
    let __VLS_747;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_748 = __VLS_asFunctionalComponent1(__VLS_747, new __VLS_747({}));
    const __VLS_749 = __VLS_748({}, ...__VLS_functionalComponentArgsRest(__VLS_748));
    const { default: __VLS_752 } = __VLS_750.slots;
    let __VLS_753;
    /** @ts-ignore @type {typeof __VLS_components.Warning} */
    Warning;
    // @ts-ignore
    const __VLS_754 = __VLS_asFunctionalComponent1(__VLS_753, new __VLS_753({}));
    const __VLS_755 = __VLS_754({}, ...__VLS_functionalComponentArgsRest(__VLS_754));
    // @ts-ignore
    [cancelDialogVisible, cancelTarget,];
    var __VLS_750;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "cancel-subtitle" },
    });
    /** @type {__VLS_StyleScopedClasses['cancel-subtitle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cancel-info" },
    });
    /** @type {__VLS_StyleScopedClasses['cancel-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.cancelTarget.psychologistName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-row" },
    });
    /** @type {__VLS_StyleScopedClasses['info-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-label" },
    });
    /** @type {__VLS_StyleScopedClasses['info-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "info-value" },
    });
    /** @type {__VLS_StyleScopedClasses['info-value']} */ ;
    (__VLS_ctx.formatDate(__VLS_ctx.cancelTarget.appointmentTime));
    (__VLS_ctx.getTimeSlotName(__VLS_ctx.cancelTarget.timeSlot));
    let __VLS_758;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_759 = __VLS_asFunctionalComponent1(__VLS_758, new __VLS_758({
        labelPosition: "top",
    }));
    const __VLS_760 = __VLS_759({
        labelPosition: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_759));
    const { default: __VLS_763 } = __VLS_761.slots;
    let __VLS_764;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_765 = __VLS_asFunctionalComponent1(__VLS_764, new __VLS_764({
        label: "取消原因",
        required: true,
    }));
    const __VLS_766 = __VLS_765({
        label: "取消原因",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_765));
    const { default: __VLS_769 } = __VLS_767.slots;
    let __VLS_770;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_771 = __VLS_asFunctionalComponent1(__VLS_770, new __VLS_770({
        modelValue: (__VLS_ctx.cancelReason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入取消原因，以便心理师了解情况...",
        ...{ class: "cosmic-textarea" },
        maxlength: "200",
        showWordLimit: true,
    }));
    const __VLS_772 = __VLS_771({
        modelValue: (__VLS_ctx.cancelReason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入取消原因，以便心理师了解情况...",
        ...{ class: "cosmic-textarea" },
        maxlength: "200",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_771));
    /** @type {__VLS_StyleScopedClasses['cosmic-textarea']} */ ;
    // @ts-ignore
    [formatDate, getTimeSlotName, cancelTarget, cancelTarget, cancelTarget, cancelReason,];
    var __VLS_767;
    // @ts-ignore
    [];
    var __VLS_761;
}
{
    const { footer: __VLS_775 } = __VLS_744.slots;
    let __VLS_776;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_777 = __VLS_asFunctionalComponent1(__VLS_776, new __VLS_776({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }));
    const __VLS_778 = __VLS_777({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_777));
    let __VLS_781;
    const __VLS_782 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.cancelDialogVisible = false;
                // @ts-ignore
                [cancelDialogVisible,];
            } });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_783 } = __VLS_779.slots;
    // @ts-ignore
    [];
    var __VLS_779;
    var __VLS_780;
    let __VLS_784;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_785 = __VLS_asFunctionalComponent1(__VLS_784, new __VLS_784({
        ...{ 'onClick': {} },
        type: "danger",
        ...{ class: "cosmic-btn-danger cosmic-btn" },
        loading: (__VLS_ctx.cancelLoading),
    }));
    const __VLS_786 = __VLS_785({
        ...{ 'onClick': {} },
        type: "danger",
        ...{ class: "cosmic-btn-danger cosmic-btn" },
        loading: (__VLS_ctx.cancelLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_785));
    let __VLS_789;
    const __VLS_790 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmCancelAppointment) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-danger']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_791 } = __VLS_787.slots;
    // @ts-ignore
    [cancelLoading, confirmCancelAppointment,];
    var __VLS_787;
    var __VLS_788;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_744;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
