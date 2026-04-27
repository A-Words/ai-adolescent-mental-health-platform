/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, ArrowRight, Lock, Loading } from '@element-plus/icons-vue';
import { getMySchedules, getScheduleSlotDetail, updateScheduleStatus, updateSchedule, deleteOldSchedules } from '@/api/psychologistAdminPage';
// ---- 状态 ----
const currentWeekStart = ref('');
const weekDays = ref([]);
// ---- 初始化本周7天数据（仅在翻页/首次加载时调用）----
function initWeekDays() {
    const days = [];
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const start = new Date(currentWeekStart.value);
    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateStr = formatDateStr(date);
        days.push({
            date: dateStr,
            dayName: dayNames[date.getDay()],
            dateStr: `${date.getMonth() + 1}月${date.getDate()}日`,
            slots: [
                { type: 'morning', status: 1, bookedCount: 0, maxAppointments: 5, scheduleId: null },
                { type: 'afternoon', status: 1, bookedCount: 0, maxAppointments: 5, scheduleId: null },
                { type: 'evening', status: 1, bookedCount: 0, maxAppointments: 5, scheduleId: null }
            ]
        });
    }
    weekDays.value = days;
}
// ---- 周标签 ----
const currentWeekLabel = computed(() => {
    const start = new Date(currentWeekStart.value);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
});
// ---- 工具函数 ----
function formatDate(d) {
    return d.toISOString().slice(0, 10);
}
function formatDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function isToday(dateStr) {
    return dateStr === formatDate(new Date());
}
// 过去及当天不可修改
function isLocked(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return target <= today;
}
function isDetailLocked(dateStr) {
    return isLocked(dateStr);
}
function getSlotName(type) {
    const names = {
        morning: '上午',
        afternoon: '下午',
        evening: '晚上'
    };
    return names[type] || type;
}
function getServiceTypeName(type) {
    const names = {
        VIDEO: '视频咨询',
        VOICE: '语音通话',
        TEXT: '文字聊天',
        OFFLINE: '线下咨询'
    };
    return names[type] || type || '--';
}
function getStatusName(status) {
    const names = {
        0: '待审核',
        1: '已确认',
        2: '已拒绝',
        3: '进行中',
        4: '已完成',
        5: '已取消',
        6: '已爽约'
    };
    return names[status] ?? '--';
}
function formatDateTime(dt) {
    if (!dt)
        return '--';
    return dt.replace('T', ' ').substring(0, 16);
}
// ---- 删除历史排班 ----
function openDeleteDialog() {
    // 默认选择昨天
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    deleteBeforeDate.value = formatDateStr(yesterday);
    deleteDialogVisible.value = true;
}
async function confirmDeleteOld() {
    if (!deleteBeforeDate.value) {
        ElMessage.warning('请选择日期');
        return;
    }
    try {
        const res = await deleteOldSchedules(deleteBeforeDate.value);
        if (res.code === 200) {
            const count = res.data ?? 0;
            ElMessage.success(`已删除 ${count} 条历史排班`);
            deleteDialogVisible.value = false;
            // 刷新当前排班
            initWeekDays();
            await fetchSchedules();
        }
        else {
            ElMessage.error(res.message || '删除失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '删除失败');
    }
}
// ---- 编辑最大预约人数 ----
function startEditMax() {
    localMaxAppointments.value = currentSlotDetail.value?.maxAppointments ?? 5;
    editingMax.value = true;
}
function cancelEditMax() {
    editingMax.value = false;
}
async function confirmSaveMax() {
    if (!currentSlotDetail.value?.scheduleId)
        return;
    savingMax.value = true;
    try {
        const res = await updateSchedule(currentSlotDetail.value.scheduleId, localMaxAppointments.value);
        if (res.code === 200) {
            ElMessage.success('保存成功');
            editingMax.value = false;
            // 更新本地状态
            currentSlotDetail.value.maxAppointments = localMaxAppointments.value;
            // 同步更新 weekDays 中的值
            const day = weekDays.value.find(d => d.date === currentDetailDate.value);
            if (day) {
                const slot = day.slots.find((s) => s.type === currentDetailSlot.value.type);
                if (slot)
                    slot.maxAppointments = localMaxAppointments.value;
            }
        }
        else {
            ElMessage.error(res.message || '保存失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '保存失败');
    }
    finally {
        savingMax.value = false;
    }
}
// ---- 详情弹窗状态 ----
const detailDialogVisible = ref(false);
const detailDialogTitle = ref('');
const currentSlotDetail = ref(null);
const currentDetailDate = ref('');
const currentDetailSlot = ref(null);
const detailLocked = ref(false);
const editingMax = ref(false);
const localMaxAppointments = ref(5);
const savingMax = ref(false);
// ---- 删除历史排班弹窗 ----
const deleteDialogVisible = ref(false);
const deleteBeforeDate = ref('');
// ---- 点击时段：查看详情 ----
async function handleSlotClick(date, slot) {
    currentDetailDate.value = date;
    currentDetailSlot.value = slot;
    detailLocked.value = isDetailLocked(date);
    detailDialogTitle.value = `${date} ${getSlotName(slot.type)} 时段详情`;
    detailDialogVisible.value = true;
    currentSlotDetail.value = null;
    try {
        const res = await getScheduleSlotDetail(date, slot.type.toUpperCase());
        if (res.code === 200) {
            currentSlotDetail.value = res.data;
        }
        else {
            currentSlotDetail.value = { notFound: true };
            ElMessage.error(res.message || '加载失败');
        }
    }
    catch (error) {
        currentSlotDetail.value = { notFound: true };
        ElMessage.error(error.message || '加载失败');
    }
}
// ---- 切换休息/可预约状态 ----
async function handleToggleStatus() {
    if (!currentSlotDetail.value || currentSlotDetail.value.notFound)
        return;
    if (detailLocked.value) {
        ElMessage.warning('近7天内的排班不可修改');
        return;
    }
    const newStatus = currentSlotDetail.value.status === 1 ? 0 : 1;
    const actionText = newStatus === 0 ? '休息' : '可预约';
    try {
        await ElMessageBox.confirm(`确定将该时段设置为【${actionText}】状态吗？`, '确认操作', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    }
    catch {
        return;
    }
    try {
        const res = await updateScheduleStatus(currentSlotDetail.value.scheduleId, newStatus);
        if (res.code === 200) {
            ElMessage.success(`已设置为${actionText}`);
            // 更新本地状态
            currentSlotDetail.value.status = newStatus;
            // 更新weekDays中的状态
            const day = weekDays.value.find(d => d.date === currentDetailDate.value);
            if (day) {
                const localSlot = day.slots.find((s) => s.type === currentDetailSlot.value.type);
                if (localSlot)
                    localSlot.status = newStatus;
            }
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
}
// ---- 获取排班数据 ----
async function fetchSchedules() {
    const startDate = formatDateStr(new Date(currentWeekStart.value));
    const endDateObj = new Date(currentWeekStart.value);
    endDateObj.setDate(endDateObj.getDate() + 6);
    const endDate = formatDateStr(endDateObj);
    try {
        const res = await getMySchedules(startDate, endDate);
        if (res.code === 200 && res.data) {
            const schedules = res.data;
            schedules.forEach((schedule) => {
                const day = weekDays.value.find(d => d.date === schedule.date);
                if (day && schedule.slots) {
                    schedule.slots.forEach((serverSlot) => {
                        const localSlot = day.slots.find((s) => {
                            const typeMap = {
                                MORNING: 'morning',
                                AFTERNOON: 'afternoon',
                                EVENING: 'evening'
                            };
                            return s.type === typeMap[serverSlot.timeSlot];
                        });
                        if (localSlot) {
                            localSlot.status = serverSlot.status;
                            localSlot.bookedCount = serverSlot.bookedCount ?? 0;
                            localSlot.maxAppointments = serverSlot.maxAppointments ?? 5;
                            localSlot.scheduleId = serverSlot.id;
                        }
                    });
                }
            });
        }
    }
    catch (error) {
        console.error('获取排班失败:', error);
    }
}
// ---- 翻页 ----
// 导航限制：仅允许查看距今2个月内的排班
function prevWeek() {
    const today = new Date();
    const newDate = new Date(currentWeekStart.value);
    newDate.setDate(newDate.getDate() - 7);
    // 不得早于2个月前
    const limitDate = new Date(today);
    limitDate.setMonth(today.getMonth() - 2);
    limitDate.setDate(1);
    if (newDate < limitDate) {
        ElMessage.warning('仅支持查看近两个月的排班');
        return;
    }
    currentWeekStart.value = formatDateStr(newDate);
    initWeekDays();
    fetchSchedules();
}
function nextWeek() {
    const today = new Date();
    const newDate = new Date(currentWeekStart.value);
    newDate.setDate(newDate.getDate() + 7);
    // 不得晚于2个月后
    const limitDate = new Date(today);
    limitDate.setMonth(today.getMonth() + 2);
    limitDate.setDate(1);
    if (newDate > limitDate) {
        ElMessage.warning('仅支持查看近两个月的排班');
        return;
    }
    currentWeekStart.value = formatDateStr(newDate);
    initWeekDays();
    fetchSchedules();
}
onMounted(async () => {
    // 修正起始日期为本周一
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    currentWeekStart.value = formatDateStr(monday);
    // 先初始化本周7天的静态结构
    initWeekDays();
    // 再从后端拉取真实排班数据并覆盖
    await fetchSchedules();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['rest']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['today']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['rest']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['locked']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-schedule-container" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-schedule-container']} */ ;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-controls" },
});
/** @type {__VLS_StyleScopedClasses['schedule-controls']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButtonGroup | typeof __VLS_components.ElButtonGroup | typeof __VLS_components.elButtonGroup | typeof __VLS_components.ElButtonGroup} */
elButtonGroup;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ...{ 'onClick': {} },
}));
const __VLS_8 = __VLS_7({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_11;
const __VLS_12 = ({ click: {} },
    { onClick: (__VLS_ctx.prevWeek) });
const { default: __VLS_13 } = __VLS_9.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.ArrowLeft} */
ArrowLeft;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
// @ts-ignore
[prevWeek,];
var __VLS_17;
// @ts-ignore
[];
var __VLS_9;
var __VLS_10;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
(__VLS_ctx.currentWeekLabel);
// @ts-ignore
[currentWeekLabel,];
var __VLS_28;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    ...{ 'onClick': {} },
}));
const __VLS_33 = __VLS_32({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
let __VLS_36;
const __VLS_37 = ({ click: {} },
    { onClick: (__VLS_ctx.nextWeek) });
const { default: __VLS_38 } = __VLS_34.slots;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({}));
const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_44 } = __VLS_42.slots;
let __VLS_45;
/** @ts-ignore @type {typeof __VLS_components.ArrowRight} */
ArrowRight;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
// @ts-ignore
[nextWeek,];
var __VLS_42;
// @ts-ignore
[];
var __VLS_34;
var __VLS_35;
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "control-right" },
});
/** @type {__VLS_StyleScopedClasses['control-right']} */ ;
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
elTag;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    type: "warning",
    effect: "plain",
}));
const __VLS_52 = __VLS_51({
    type: "warning",
    effect: "plain",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const { default: __VLS_55 } = __VLS_53.slots;
let __VLS_56;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
const { default: __VLS_61 } = __VLS_59.slots;
let __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.Lock} */
Lock;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({}));
const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
// @ts-ignore
[];
var __VLS_59;
// @ts-ignore
[];
var __VLS_53;
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    ...{ 'onClick': {} },
    size: "small",
}));
const __VLS_69 = __VLS_68({
    ...{ 'onClick': {} },
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
let __VLS_72;
const __VLS_73 = ({ click: {} },
    { onClick: (__VLS_ctx.openDeleteDialog) });
const { default: __VLS_74 } = __VLS_70.slots;
// @ts-ignore
[openDeleteDialog,];
var __VLS_70;
var __VLS_71;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-grid" },
});
/** @type {__VLS_StyleScopedClasses['schedule-grid']} */ ;
for (const [day, index] of __VLS_vFor((__VLS_ctx.weekDays))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: "day-column" },
    });
    /** @type {__VLS_StyleScopedClasses['day-column']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "day-header" },
        ...{ class: ({ today: __VLS_ctx.isToday(day.date) }) },
    });
    /** @type {__VLS_StyleScopedClasses['day-header']} */ ;
    /** @type {__VLS_StyleScopedClasses['today']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "day-name" },
    });
    /** @type {__VLS_StyleScopedClasses['day-name']} */ ;
    (day.dayName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "day-date" },
    });
    /** @type {__VLS_StyleScopedClasses['day-date']} */ ;
    (day.dateStr);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "time-slots" },
    });
    /** @type {__VLS_StyleScopedClasses['time-slots']} */ ;
    for (const [slot] of __VLS_vFor((day.slots))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleSlotClick(day.date, slot);
                    // @ts-ignore
                    [weekDays, isToday, handleSlotClick,];
                } },
            key: (slot.type),
            ...{ class: "slot-item" },
            ...{ class: ({
                    available: slot.status === 1,
                    rest: slot.status === 0,
                    locked: __VLS_ctx.isLocked(day.date),
                    today: __VLS_ctx.isToday(day.date)
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['slot-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['available']} */ ;
        /** @type {__VLS_StyleScopedClasses['rest']} */ ;
        /** @type {__VLS_StyleScopedClasses['locked']} */ ;
        /** @type {__VLS_StyleScopedClasses['today']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "slot-name" },
        });
        /** @type {__VLS_StyleScopedClasses['slot-name']} */ ;
        (__VLS_ctx.getSlotName(slot.type));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "slot-status" },
        });
        /** @type {__VLS_StyleScopedClasses['slot-status']} */ ;
        (slot.status === 1 ? '可预约' : '休息');
        if (slot.status === 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "slot-count" },
            });
            /** @type {__VLS_StyleScopedClasses['slot-count']} */ ;
            (slot.bookedCount || 0);
            (slot.maxAppointments || 5);
        }
        // @ts-ignore
        [isToday, isLocked, getSlotName,];
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "legend" },
});
/** @type {__VLS_StyleScopedClasses['legend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "legend-item" },
});
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot available" },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "legend-item" },
});
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot rest" },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['rest']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "legend-item locked" },
});
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['locked']} */ ;
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({}));
const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
const { default: __VLS_80 } = __VLS_78.slots;
let __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.Lock} */
Lock;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({}));
const __VLS_83 = __VLS_82({}, ...__VLS_functionalComponentArgsRest(__VLS_82));
// @ts-ignore
[];
var __VLS_78;
let __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: (__VLS_ctx.detailDialogTitle),
    width: "700px",
    destroyOnClose: true,
}));
const __VLS_88 = __VLS_87({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: (__VLS_ctx.detailDialogTitle),
    width: "700px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
const { default: __VLS_91 } = __VLS_89.slots;
if (!__VLS_ctx.currentSlotDetail) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-loading" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-loading']} */ ;
    let __VLS_92;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
        ...{ class: "is-loading" },
    }));
    const __VLS_94 = __VLS_93({
        ...{ class: "is-loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    /** @type {__VLS_StyleScopedClasses['is-loading']} */ ;
    const { default: __VLS_97 } = __VLS_95.slots;
    let __VLS_98;
    /** @ts-ignore @type {typeof __VLS_components.Loading} */
    Loading;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({}));
    const __VLS_100 = __VLS_99({}, ...__VLS_functionalComponentArgsRest(__VLS_99));
    // @ts-ignore
    [detailDialogVisible, detailDialogTitle, currentSlotDetail,];
    var __VLS_95;
}
else if (__VLS_ctx.currentSlotDetail.notFound) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-empty" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-empty']} */ ;
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        description: "该时段暂无排班记录",
    }));
    const __VLS_105 = __VLS_104({
        description: "该时段暂无排班记录",
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "slot-detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['slot-detail-content']} */ ;
    let __VLS_108;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
        column: (2),
        border: true,
    }));
    const __VLS_110 = __VLS_109({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    const { default: __VLS_113 } = __VLS_111.slots;
    let __VLS_114;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
        label: "日期",
    }));
    const __VLS_116 = __VLS_115({
        label: "日期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    const { default: __VLS_119 } = __VLS_117.slots;
    (__VLS_ctx.currentSlotDetail.scheduleDate);
    // @ts-ignore
    [currentSlotDetail, currentSlotDetail,];
    var __VLS_117;
    let __VLS_120;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
        label: "时段",
    }));
    const __VLS_122 = __VLS_121({
        label: "时段",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    const { default: __VLS_125 } = __VLS_123.slots;
    (__VLS_ctx.getSlotName(__VLS_ctx.currentSlotDetail.timeSlot));
    // @ts-ignore
    [getSlotName, currentSlotDetail,];
    var __VLS_123;
    let __VLS_126;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
        label: "开始时间",
    }));
    const __VLS_128 = __VLS_127({
        label: "开始时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_127));
    const { default: __VLS_131 } = __VLS_129.slots;
    (__VLS_ctx.currentSlotDetail.startTime || '--');
    // @ts-ignore
    [currentSlotDetail,];
    var __VLS_129;
    let __VLS_132;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
        label: "结束时间",
    }));
    const __VLS_134 = __VLS_133({
        label: "结束时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    const { default: __VLS_137 } = __VLS_135.slots;
    (__VLS_ctx.currentSlotDetail.endTime || '--');
    // @ts-ignore
    [currentSlotDetail,];
    var __VLS_135;
    let __VLS_138;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
        label: "当前状态",
    }));
    const __VLS_140 = __VLS_139({
        label: "当前状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    const { default: __VLS_143 } = __VLS_141.slots;
    let __VLS_144;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
        type: (__VLS_ctx.currentSlotDetail.status === 1 ? 'success' : 'info'),
    }));
    const __VLS_146 = __VLS_145({
        type: (__VLS_ctx.currentSlotDetail.status === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    const { default: __VLS_149 } = __VLS_147.slots;
    (__VLS_ctx.currentSlotDetail.status === 1 ? '可预约' : '休息');
    // @ts-ignore
    [currentSlotDetail, currentSlotDetail,];
    var __VLS_147;
    // @ts-ignore
    [];
    var __VLS_141;
    let __VLS_150;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
        label: "预约情况",
    }));
    const __VLS_152 = __VLS_151({
        label: "预约情况",
    }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    const { default: __VLS_155 } = __VLS_153.slots;
    (__VLS_ctx.currentSlotDetail.bookedCount || 0);
    (__VLS_ctx.editingMax ? __VLS_ctx.localMaxAppointments : __VLS_ctx.currentSlotDetail.maxAppointments || 5);
    if (!__VLS_ctx.detailLocked && !__VLS_ctx.editingMax) {
        let __VLS_156;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            size: "small",
            ...{ style: {} },
        }));
        const __VLS_158 = __VLS_157({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            size: "small",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_157));
        let __VLS_161;
        const __VLS_162 = ({ click: {} },
            { onClick: (__VLS_ctx.startEditMax) });
        const { default: __VLS_163 } = __VLS_159.slots;
        // @ts-ignore
        [currentSlotDetail, currentSlotDetail, editingMax, editingMax, localMaxAppointments, detailLocked, startEditMax,];
        var __VLS_159;
        var __VLS_160;
    }
    if (__VLS_ctx.editingMax) {
        let __VLS_164;
        /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
        elInputNumber;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
            modelValue: (__VLS_ctx.localMaxAppointments),
            min: (0),
            max: (5),
            size: "small",
            ...{ style: {} },
            controlsPosition: "right",
        }));
        const __VLS_166 = __VLS_165({
            modelValue: (__VLS_ctx.localMaxAppointments),
            min: (0),
            max: (5),
            size: "small",
            ...{ style: {} },
            controlsPosition: "right",
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    }
    if (__VLS_ctx.editingMax) {
        let __VLS_169;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            ...{ style: {} },
            loading: (__VLS_ctx.savingMax),
        }));
        const __VLS_171 = __VLS_170({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
            ...{ style: {} },
            loading: (__VLS_ctx.savingMax),
        }, ...__VLS_functionalComponentArgsRest(__VLS_170));
        let __VLS_174;
        const __VLS_175 = ({ click: {} },
            { onClick: (__VLS_ctx.confirmSaveMax) });
        const { default: __VLS_176 } = __VLS_172.slots;
        // @ts-ignore
        [editingMax, editingMax, localMaxAppointments, savingMax, confirmSaveMax,];
        var __VLS_172;
        var __VLS_173;
    }
    if (__VLS_ctx.editingMax) {
        let __VLS_177;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({
            ...{ 'onClick': {} },
            size: "small",
            ...{ style: {} },
        }));
        const __VLS_179 = __VLS_178({
            ...{ 'onClick': {} },
            size: "small",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_178));
        let __VLS_182;
        const __VLS_183 = ({ click: {} },
            { onClick: (__VLS_ctx.cancelEditMax) });
        const { default: __VLS_184 } = __VLS_180.slots;
        // @ts-ignore
        [editingMax, cancelEditMax,];
        var __VLS_180;
        var __VLS_181;
    }
    // @ts-ignore
    [];
    var __VLS_153;
    // @ts-ignore
    [];
    var __VLS_111;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "appointment-section" },
    });
    /** @type {__VLS_StyleScopedClasses['appointment-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "appointment-count" },
    });
    /** @type {__VLS_StyleScopedClasses['appointment-count']} */ ;
    (__VLS_ctx.currentSlotDetail.appointments?.length || 0);
    if (__VLS_ctx.currentSlotDetail.appointments && __VLS_ctx.currentSlotDetail.appointments.length > 0) {
        let __VLS_185;
        /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
        elTable;
        // @ts-ignore
        const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
            data: (__VLS_ctx.currentSlotDetail.appointments),
            border: true,
            stripe: true,
            size: "small",
            ...{ style: {} },
        }));
        const __VLS_187 = __VLS_186({
            data: (__VLS_ctx.currentSlotDetail.appointments),
            border: true,
            stripe: true,
            size: "small",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        const { default: __VLS_190 } = __VLS_188.slots;
        let __VLS_191;
        /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
        elTableColumn;
        // @ts-ignore
        const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
            prop: "orderNo",
            label: "订单号",
            minWidth: "150",
        }));
        const __VLS_193 = __VLS_192({
            prop: "orderNo",
            label: "订单号",
            minWidth: "150",
        }, ...__VLS_functionalComponentArgsRest(__VLS_192));
        let __VLS_196;
        /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
        elTableColumn;
        // @ts-ignore
        const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
            prop: "appointmentTime",
            label: "预约时间",
            minWidth: "160",
        }));
        const __VLS_198 = __VLS_197({
            prop: "appointmentTime",
            label: "预约时间",
            minWidth: "160",
        }, ...__VLS_functionalComponentArgsRest(__VLS_197));
        const { default: __VLS_201 } = __VLS_199.slots;
        {
            const { default: __VLS_202 } = __VLS_199.slots;
            const [{ row }] = __VLS_vSlot(__VLS_202);
            (__VLS_ctx.formatDateTime(row.appointmentTime));
            // @ts-ignore
            [currentSlotDetail, currentSlotDetail, currentSlotDetail, currentSlotDetail, formatDateTime,];
        }
        // @ts-ignore
        [];
        var __VLS_199;
        let __VLS_203;
        /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
        elTableColumn;
        // @ts-ignore
        const __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({
            prop: "serviceType",
            label: "服务类型",
            width: "100",
        }));
        const __VLS_205 = __VLS_204({
            prop: "serviceType",
            label: "服务类型",
            width: "100",
        }, ...__VLS_functionalComponentArgsRest(__VLS_204));
        const { default: __VLS_208 } = __VLS_206.slots;
        {
            const { default: __VLS_209 } = __VLS_206.slots;
            const [{ row }] = __VLS_vSlot(__VLS_209);
            (__VLS_ctx.getServiceTypeName(row.serviceType));
            // @ts-ignore
            [getServiceTypeName,];
        }
        // @ts-ignore
        [];
        var __VLS_206;
        let __VLS_210;
        /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
        elTableColumn;
        // @ts-ignore
        const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
            prop: "status",
            label: "状态",
            width: "90",
        }));
        const __VLS_212 = __VLS_211({
            prop: "status",
            label: "状态",
            width: "90",
        }, ...__VLS_functionalComponentArgsRest(__VLS_211));
        const { default: __VLS_215 } = __VLS_213.slots;
        {
            const { default: __VLS_216 } = __VLS_213.slots;
            const [{ row }] = __VLS_vSlot(__VLS_216);
            (__VLS_ctx.getStatusName(row.status));
            // @ts-ignore
            [getStatusName,];
        }
        // @ts-ignore
        [];
        var __VLS_213;
        let __VLS_217;
        /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
        elTableColumn;
        // @ts-ignore
        const __VLS_218 = __VLS_asFunctionalComponent1(__VLS_217, new __VLS_217({
            prop: "userProblems",
            label: "预约问题",
            minWidth: "120",
            showOverflowTooltip: true,
        }));
        const __VLS_219 = __VLS_218({
            prop: "userProblems",
            label: "预约问题",
            minWidth: "120",
            showOverflowTooltip: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_218));
        // @ts-ignore
        [];
        var __VLS_188;
    }
    else {
        let __VLS_222;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
            description: "暂无预约记录",
            imageSize: (60),
        }));
        const __VLS_224 = __VLS_223({
            description: "暂无预约记录",
            imageSize: (60),
        }, ...__VLS_functionalComponentArgsRest(__VLS_223));
    }
}
{
    const { footer: __VLS_227 } = __VLS_89.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-footer']} */ ;
    if (!__VLS_ctx.detailLocked) {
        if (__VLS_ctx.currentSlotDetail && !__VLS_ctx.currentSlotDetail.notFound) {
            let __VLS_228;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_229 = __VLS_asFunctionalComponent1(__VLS_228, new __VLS_228({
                ...{ 'onClick': {} },
                type: (__VLS_ctx.currentSlotDetail.status === 1 ? 'warning' : 'success'),
            }));
            const __VLS_230 = __VLS_229({
                ...{ 'onClick': {} },
                type: (__VLS_ctx.currentSlotDetail.status === 1 ? 'warning' : 'success'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_229));
            let __VLS_233;
            const __VLS_234 = ({ click: {} },
                { onClick: (__VLS_ctx.handleToggleStatus) });
            const { default: __VLS_235 } = __VLS_231.slots;
            (__VLS_ctx.currentSlotDetail.status === 1 ? '设为休息' : '设为可预约');
            // @ts-ignore
            [currentSlotDetail, currentSlotDetail, currentSlotDetail, currentSlotDetail, detailLocked, handleToggleStatus,];
            var __VLS_231;
            var __VLS_232;
        }
    }
    else {
        let __VLS_236;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_237 = __VLS_asFunctionalComponent1(__VLS_236, new __VLS_236({
            type: "warning",
        }));
        const __VLS_238 = __VLS_237({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_237));
        const { default: __VLS_241 } = __VLS_239.slots;
        let __VLS_242;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_243 = __VLS_asFunctionalComponent1(__VLS_242, new __VLS_242({}));
        const __VLS_244 = __VLS_243({}, ...__VLS_functionalComponentArgsRest(__VLS_243));
        const { default: __VLS_247 } = __VLS_245.slots;
        let __VLS_248;
        /** @ts-ignore @type {typeof __VLS_components.Lock} */
        Lock;
        // @ts-ignore
        const __VLS_249 = __VLS_asFunctionalComponent1(__VLS_248, new __VLS_248({}));
        const __VLS_250 = __VLS_249({}, ...__VLS_functionalComponentArgsRest(__VLS_249));
        // @ts-ignore
        [];
        var __VLS_245;
        // @ts-ignore
        [];
        var __VLS_239;
    }
    let __VLS_253;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent1(__VLS_253, new __VLS_253({
        ...{ 'onClick': {} },
    }));
    const __VLS_255 = __VLS_254({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    let __VLS_258;
    const __VLS_259 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailDialogVisible = false;
                // @ts-ignore
                [detailDialogVisible,];
            } });
    const { default: __VLS_260 } = __VLS_256.slots;
    // @ts-ignore
    [];
    var __VLS_256;
    var __VLS_257;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_89;
let __VLS_261;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({
    modelValue: (__VLS_ctx.deleteDialogVisible),
    title: "删除历史排班",
    width: "420px",
}));
const __VLS_263 = __VLS_262({
    modelValue: (__VLS_ctx.deleteDialogVisible),
    title: "删除历史排班",
    width: "420px",
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
const { default: __VLS_266 } = __VLS_264.slots;
let __VLS_267;
/** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert | typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
elAlert;
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent1(__VLS_267, new __VLS_267({
    type: "warning",
    closable: (false),
    showIcon: true,
    ...{ style: {} },
}));
const __VLS_269 = __VLS_268({
    type: "warning",
    closable: (false),
    showIcon: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
const { default: __VLS_272 } = __VLS_270.slots;
// @ts-ignore
[deleteDialogVisible,];
var __VLS_270;
let __VLS_273;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent1(__VLS_273, new __VLS_273({}));
const __VLS_275 = __VLS_274({}, ...__VLS_functionalComponentArgsRest(__VLS_274));
const { default: __VLS_278 } = __VLS_276.slots;
let __VLS_279;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_280 = __VLS_asFunctionalComponent1(__VLS_279, new __VLS_279({
    label: "删除此日期之前",
}));
const __VLS_281 = __VLS_280({
    label: "删除此日期之前",
}, ...__VLS_functionalComponentArgsRest(__VLS_280));
const { default: __VLS_284 } = __VLS_282.slots;
let __VLS_285;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_286 = __VLS_asFunctionalComponent1(__VLS_285, new __VLS_285({
    modelValue: (__VLS_ctx.deleteBeforeDate),
    type: "date",
    placeholder: "选择日期",
    valueFormat: "YYYY-MM-DD",
    clearable: (false),
    ...{ style: {} },
}));
const __VLS_287 = __VLS_286({
    modelValue: (__VLS_ctx.deleteBeforeDate),
    type: "date",
    placeholder: "选择日期",
    valueFormat: "YYYY-MM-DD",
    clearable: (false),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_286));
// @ts-ignore
[deleteBeforeDate,];
var __VLS_282;
// @ts-ignore
[];
var __VLS_276;
{
    const { footer: __VLS_290 } = __VLS_264.slots;
    let __VLS_291;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_292 = __VLS_asFunctionalComponent1(__VLS_291, new __VLS_291({
        ...{ 'onClick': {} },
    }));
    const __VLS_293 = __VLS_292({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_292));
    let __VLS_296;
    const __VLS_297 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.deleteDialogVisible = false;
                // @ts-ignore
                [deleteDialogVisible,];
            } });
    const { default: __VLS_298 } = __VLS_294.slots;
    // @ts-ignore
    [];
    var __VLS_294;
    var __VLS_295;
    let __VLS_299;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent1(__VLS_299, new __VLS_299({
        ...{ 'onClick': {} },
        type: "danger",
    }));
    const __VLS_301 = __VLS_300({
        ...{ 'onClick': {} },
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    let __VLS_304;
    const __VLS_305 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmDeleteOld) });
    const { default: __VLS_306 } = __VLS_302.slots;
    // @ts-ignore
    [confirmDeleteOld,];
    var __VLS_302;
    var __VLS_303;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_264;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
