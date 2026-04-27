/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Star, User, Clock, Medal, InfoFilled, Grid, List, Location } from '@element-plus/icons-vue';
import { getPsychologistList, getConsultationFields, toggleFavorite as apiToggleFavorite, getPsychologistSchedule, createAppointment } from '@/api/psychologist';
const router = useRouter();
// 状态
const loading = ref(false);
const psychologists = ref([]);
const consultationFields = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
// 筛选条件
const searchKeyword = ref('');
const selectedFields = ref([]);
const selectedServiceTypes = ref([]);
const selectedSex = ref(null);
const minPrice = ref(null);
const maxPrice = ref(null);
const minRating = ref(null);
const sortBy = ref('');
const viewMode = ref('grid');
// 预约相关
const bookingDialogVisible = ref(false);
const selectedPsychologist = ref(null);
const availableSchedules = ref([]);
const submitting = ref(false);
const bookingForm = reactive({
    serviceType: '',
    scheduleId: null,
    personalSituation: '',
    problems: ''
});
// 计算选中的价格
const selectedPrice = computed(() => {
    if (!selectedPsychologist.value || !bookingForm.serviceType)
        return 0;
    const service = selectedPsychologist.value.services?.find((s) => s.serviceType === bookingForm.serviceType);
    return service?.price || 0;
});
// 是否可以提交
const canSubmit = computed(() => {
    return bookingForm.serviceType && bookingForm.scheduleId && bookingForm.problems.trim();
});
// 咨询类型映射
const serviceTypeMap = {
    text: '图文咨询',
    video: '视频咨询',
    voice: '语音咨询',
    offline: '线下面询',
    TEXT: '图文咨询',
    VIDEO: '视频咨询',
    VOICE: '语音咨询',
    OFFLINE: '线下面询'
};
const getServiceTypeName = (type) => serviceTypeMap[type] || type;
// 获取显示用的服务列表（合并视频和语音为线上咨询）
const getDisplayServices = (services) => {
    if (!services || services.length === 0)
        return [];
    const result = [];
    const onlineService = services.find((s) => s.serviceType === 'video' || s.serviceType === 'VIDEO' || s.serviceType === 'voice' || s.serviceType === 'VOICE');
    const offlineService = services.find((s) => s.serviceType === 'offline' || s.serviceType === 'OFFLINE');
    if (onlineService) {
        result.push({
            serviceType: 'online',
            serviceName: '线上咨询',
            price: onlineService.price
        });
    }
    if (offlineService) {
        result.push({
            serviceType: 'offline',
            serviceName: '线下面询',
            price: offlineService.price
        });
    }
    return result;
};
// 时间段映射
const timeSlotMap = {
    MORNING: '上午',
    AFTERNOON: '下午',
    EVENING: '晚上',
    morning: '上午',
    afternoon: '下午',
    evening: '晚上'
};
const getTimeSlotName = (slot) => timeSlotMap[slot] || slot;
// 格式化日期
const formatDate = (date) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    return `${month}月${day}日 周${week}`;
};
// 防抖搜索
let searchTimer = null;
const debouncedSearch = () => {
    if (searchTimer)
        clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        currentPage.value = 1;
        handleSearch();
    }, 500);
};
// 搜索
const handleSearch = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value,
            keyword: searchKeyword.value || undefined,
            fieldIds: selectedFields.value.length > 0 ? selectedFields.value : undefined,
            serviceTypes: selectedServiceTypes.value.length > 0 ? selectedServiceTypes.value : undefined,
            sex: selectedSex.value,
            minPrice: minPrice.value,
            maxPrice: maxPrice.value,
            minRating: minRating.value,
            sortBy: sortBy.value || undefined,
            offlineRegion: searchKeyword.value || undefined,
            offlineAddress: searchKeyword.value || undefined
        };
        const res = await getPsychologistList(params);
        if (res.code === 200 && res.data) {
            let list = res.data.records || [];
            // 如果后端没有按地址搜索，前端过滤
            if (searchKeyword.value && res.data.records?.length > 0) {
                const keyword = searchKeyword.value.toLowerCase();
                list = list.filter((p) => p.realName?.toLowerCase().includes(keyword) ||
                    p.offlineRegion?.toLowerCase().includes(keyword) ||
                    p.offlineAddress?.toLowerCase().includes(keyword));
            }
            psychologists.value = list.map((p) => ({
                ...p,
                isFavorite: p.isFavorited || false,
                fields: p.fields || [],
                qualifications: p.qualifications || [],
                services: p.services || []
            }));
            total.value = list.length;
        }
    }
    catch (e) {
        console.error('搜索失败', e);
    }
    finally {
        loading.value = false;
    }
};
// 重置筛选
const resetFilters = () => {
    searchKeyword.value = '';
    selectedFields.value = [];
    selectedServiceTypes.value = [];
    selectedSex.value = null;
    minPrice.value = null;
    maxPrice.value = null;
    minRating.value = null;
    sortBy.value = '';
    currentPage.value = 1;
    handleSearch();
};
// 跳转详情
const goToDetail = (id) => {
    console.log('跳转心理咨询师详情，id:', id);
    if (!id) {
        ElMessage.error('无效的心理咨询师ID');
        return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
        ElMessage.warning('请先登录后再查看详情');
        router.push('/login');
        return;
    }
    router.push(`/consultation/psychologist/${id}`).catch(err => {
        console.error('路由跳转失败:', err);
        ElMessage.error('页面跳转失败，请稍后重试');
    });
};
// 切换收藏
const toggleFavorite = async (item) => {
    try {
        const res = await apiToggleFavorite(item.id);
        if (res.code === 200) {
            item.isFavorite = !item.isFavorite;
            ElMessage.success(item.isFavorite ? '收藏成功' : '取消收藏');
        }
    }
    catch (e) {
        ElMessage.error('操作失败');
    }
};
// 显示预约对话框
const showBookingDialog = async (item) => {
    selectedPsychologist.value = item;
    bookingForm.serviceType = item.services?.[0]?.serviceType || '';
    bookingForm.scheduleId = null;
    bookingForm.personalSituation = '';
    bookingForm.problems = '';
    // 获取可用排班
    try {
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const res = await getPsychologistSchedule(item.id, today.toISOString().slice(0, 10), nextMonth.toISOString().slice(0, 10));
        if (res.code === 200) {
            availableSchedules.value = res.data || [];
        }
    }
    catch (e) {
        console.error('获取排班失败', e);
    }
    bookingDialogVisible.value = true;
};
// 选择排班
const selectSchedule = (schedule) => {
    if (schedule.bookedCount >= schedule.maxAppointments) {
        ElMessage.warning('该时段已约满');
        return;
    }
    bookingForm.scheduleId = schedule.id;
};
// 确认预约
const confirmBooking = async () => {
    if (!bookingForm.serviceType || !bookingForm.scheduleId) {
        ElMessage.warning('请选择咨询方式和时间');
        return;
    }
    if (!bookingForm.problems.trim()) {
        ElMessage.warning('请填写主要问题');
        return;
    }
    submitting.value = true;
    try {
        const res = await createAppointment({
            psychologistId: selectedPsychologist.value.id,
            scheduleId: bookingForm.scheduleId,
            serviceType: bookingForm.serviceType,
            personalSituation: bookingForm.personalSituation,
            problems: bookingForm.problems
        });
        if (res.code === 200) {
            ElMessage.success('预约成功！');
            bookingDialogVisible.value = false;
            handleSearch();
        }
        else {
            ElMessage.error(res.message || '预约失败');
        }
    }
    catch (e) {
        ElMessage.error(e.message || '预约失败');
    }
    finally {
        submitting.value = false;
    }
};
// 获取咨询领域
const fetchConsultationFields = async () => {
    try {
        const res = await getConsultationFields();
        if (res.code === 200) {
            consultationFields.value = res.data || [];
        }
    }
    catch (e) {
        console.error('获取咨询领域失败', e);
    }
};
onMounted(() => {
    handleSearch();
    fetchConsultationFields();
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
/** @type {__VLS_StyleScopedClasses['search-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-row']} */ ;
/** @type {__VLS_StyleScopedClasses['view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-row']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-row']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__original-radio']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['online-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['sex-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['sex-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['offline-address']} */ ;
/** @type {__VLS_StyleScopedClasses['offline-address']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['list-avatar-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['rating-count']} */ ;
/** @type {__VLS_StyleScopedClasses['list-offline-address']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-type']} */ ;
/** @type {__VLS_StyleScopedClasses['service-item']} */ ;
/** @type {__VLS_StyleScopedClasses['service-amount']} */ ;
/** @type {__VLS_StyleScopedClasses['list-right']} */ ;
/** @type {__VLS_StyleScopedClasses['booking-psychologist-info']} */ ;
/** @type {__VLS_StyleScopedClasses['booking-psychologist-info']} */ ;
/** @type {__VLS_StyleScopedClasses['service-option']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-item']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-item']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-item']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['fee-row']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-list-container']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-row']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
/** @type {__VLS_StyleScopedClasses['price-range']} */ ;
/** @type {__VLS_StyleScopedClasses['price-input']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['list-left']} */ ;
/** @type {__VLS_StyleScopedClasses['list-content']} */ ;
/** @type {__VLS_StyleScopedClasses['list-right']} */ ;
/** @type {__VLS_StyleScopedClasses['services-list']} */ ;
/** @type {__VLS_StyleScopedClasses['view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['view-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['view-switch']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-list-container" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-list-container']} */ ;
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
    ...{ class: "page-title-text" },
});
/** @type {__VLS_StyleScopedClasses['page-title-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "page-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-toolbar cosmic-toolbar" },
});
/** @type {__VLS_StyleScopedClasses['filter-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-toolbar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-row" },
});
/** @type {__VLS_StyleScopedClasses['filter-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['search-wrapper']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索心理师姓名或地址...",
    clearable: true,
    ...{ class: "cosmic-input" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索心理师姓名或地址...",
    clearable: true,
    ...{ class: "cosmic-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ input: {} },
    { onInput: (__VLS_ctx.debouncedSearch) });
/** @type {__VLS_StyleScopedClasses['cosmic-input']} */ ;
const { default: __VLS_7 } = __VLS_3.slots;
{
    const { prefix: __VLS_8 } = __VLS_3.slots;
    let __VLS_9;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({}));
    const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const { default: __VLS_14 } = __VLS_12.slots;
    let __VLS_15;
    /** @ts-ignore @type {typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
    const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
    // @ts-ignore
    [searchKeyword, debouncedSearch,];
    var __VLS_12;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.selectedFields),
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    placeholder: "咨询领域",
    clearable: true,
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.selectedFields),
    multiple: true,
    collapseTags: true,
    collapseTagsTooltip: true,
    placeholder: "咨询领域",
    clearable: true,
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
const { default: __VLS_25 } = __VLS_23.slots;
for (const [field] of __VLS_vFor((__VLS_ctx.consultationFields))) {
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        key: (field.id),
        label: (field.name),
        value: (field.id),
    }));
    const __VLS_28 = __VLS_27({
        key: (field.id),
        label: (field.name),
        value: (field.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    // @ts-ignore
    [selectedFields, consultationFields,];
}
// @ts-ignore
[];
var __VLS_23;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    modelValue: (__VLS_ctx.selectedServiceTypes),
    multiple: true,
    collapseTags: true,
    placeholder: "咨询方式",
    clearable: true,
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.selectedServiceTypes),
    multiple: true,
    collapseTags: true,
    placeholder: "咨询方式",
    clearable: true,
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
const { default: __VLS_36 } = __VLS_34.slots;
let __VLS_37;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    label: "图文咨询",
    value: "text",
}));
const __VLS_39 = __VLS_38({
    label: "图文咨询",
    value: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    label: "视频咨询",
    value: "video",
}));
const __VLS_44 = __VLS_43({
    label: "视频咨询",
    value: "video",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    label: "语音咨询",
    value: "voice",
}));
const __VLS_49 = __VLS_48({
    label: "语音咨询",
    value: "voice",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
let __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    label: "线下面询",
    value: "offline",
}));
const __VLS_54 = __VLS_53({
    label: "线下面询",
    value: "offline",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
// @ts-ignore
[selectedServiceTypes,];
var __VLS_34;
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.selectedSex),
    placeholder: "性别",
    clearable: true,
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}));
const __VLS_59 = __VLS_58({
    modelValue: (__VLS_ctx.selectedSex),
    placeholder: "性别",
    clearable: true,
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
const { default: __VLS_62 } = __VLS_60.slots;
let __VLS_63;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
    label: "不限",
    value: (null),
}));
const __VLS_65 = __VLS_64({
    label: "不限",
    value: (null),
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_68;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
    label: "男咨询师",
    value: (1),
}));
const __VLS_70 = __VLS_69({
    label: "男咨询师",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    label: "女咨询师",
    value: (2),
}));
const __VLS_75 = __VLS_74({
    label: "女咨询师",
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
// @ts-ignore
[selectedSex,];
var __VLS_60;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "price-range" },
});
/** @type {__VLS_StyleScopedClasses['price-range']} */ ;
let __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    modelValue: (__VLS_ctx.minPrice),
    placeholder: "最低价",
    type: "number",
    ...{ class: "price-input cosmic-input" },
}));
const __VLS_80 = __VLS_79({
    modelValue: (__VLS_ctx.minPrice),
    placeholder: "最低价",
    type: "number",
    ...{ class: "price-input cosmic-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
/** @type {__VLS_StyleScopedClasses['price-input']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "price-separator" },
});
/** @type {__VLS_StyleScopedClasses['price-separator']} */ ;
let __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
    modelValue: (__VLS_ctx.maxPrice),
    placeholder: "最高价",
    type: "number",
    ...{ class: "price-input cosmic-input" },
}));
const __VLS_85 = __VLS_84({
    modelValue: (__VLS_ctx.maxPrice),
    placeholder: "最高价",
    type: "number",
    ...{ class: "price-input cosmic-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
/** @type {__VLS_StyleScopedClasses['price-input']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-input']} */ ;
let __VLS_88;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.minRating),
    placeholder: "最低评分",
    clearable: true,
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.minRating),
    placeholder: "最低评分",
    clearable: true,
    ...{ class: "cosmic-select" },
    popperClass: "cosmic-select-dropdown",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
/** @type {__VLS_StyleScopedClasses['cosmic-select']} */ ;
const { default: __VLS_93 } = __VLS_91.slots;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    label: "不限",
    value: (null),
}));
const __VLS_96 = __VLS_95({
    label: "不限",
    value: (null),
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    label: "4.5分以上",
    value: (4.5),
}));
const __VLS_101 = __VLS_100({
    label: "4.5分以上",
    value: (4.5),
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
let __VLS_104;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
    label: "4.0分以上",
    value: (4.0),
}));
const __VLS_106 = __VLS_105({
    label: "4.0分以上",
    value: (4.0),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
let __VLS_109;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
    label: "3.5分以上",
    value: (3.5),
}));
const __VLS_111 = __VLS_110({
    label: "3.5分以上",
    value: (3.5),
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_114;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    label: "3.0分以上",
    value: (3.0),
}));
const __VLS_116 = __VLS_115({
    label: "3.0分以上",
    value: (3.0),
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
// @ts-ignore
[minPrice, maxPrice, minRating,];
var __VLS_91;
let __VLS_119;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
    ...{ 'onClick': {} },
    ...{ class: "reset-btn cosmic-btn-secondary cosmic-btn" },
}));
const __VLS_121 = __VLS_120({
    ...{ 'onClick': {} },
    ...{ class: "reset-btn cosmic-btn-secondary cosmic-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
let __VLS_124;
const __VLS_125 = ({ click: {} },
    { onClick: (__VLS_ctx.resetFilters) });
/** @type {__VLS_StyleScopedClasses['reset-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
const { default: __VLS_126 } = __VLS_122.slots;
let __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({}));
const __VLS_129 = __VLS_128({}, ...__VLS_functionalComponentArgsRest(__VLS_128));
const { default: __VLS_132 } = __VLS_130.slots;
let __VLS_133;
/** @ts-ignore @type {typeof __VLS_components.Refresh} */
Refresh;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({}));
const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
// @ts-ignore
[resetFilters,];
var __VLS_130;
// @ts-ignore
[];
var __VLS_122;
var __VLS_123;
let __VLS_138;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
    modelValue: (__VLS_ctx.viewMode),
    ...{ class: "view-switch" },
}));
const __VLS_140 = __VLS_139({
    modelValue: (__VLS_ctx.viewMode),
    ...{ class: "view-switch" },
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
/** @type {__VLS_StyleScopedClasses['view-switch']} */ ;
const { default: __VLS_143 } = __VLS_141.slots;
let __VLS_144;
/** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
elRadioButton;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
    value: "grid",
}));
const __VLS_146 = __VLS_145({
    value: "grid",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
const { default: __VLS_149 } = __VLS_147.slots;
let __VLS_150;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({}));
const __VLS_152 = __VLS_151({}, ...__VLS_functionalComponentArgsRest(__VLS_151));
const { default: __VLS_155 } = __VLS_153.slots;
let __VLS_156;
/** @ts-ignore @type {typeof __VLS_components.Grid} */
Grid;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({}));
const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
// @ts-ignore
[viewMode,];
var __VLS_153;
// @ts-ignore
[];
var __VLS_147;
let __VLS_161;
/** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
elRadioButton;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    value: "list",
}));
const __VLS_163 = __VLS_162({
    value: "list",
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
const { default: __VLS_166 } = __VLS_164.slots;
let __VLS_167;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({}));
const __VLS_169 = __VLS_168({}, ...__VLS_functionalComponentArgsRest(__VLS_168));
const { default: __VLS_172 } = __VLS_170.slots;
let __VLS_173;
/** @ts-ignore @type {typeof __VLS_components.List} */
List;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({}));
const __VLS_175 = __VLS_174({}, ...__VLS_functionalComponentArgsRest(__VLS_174));
// @ts-ignore
[];
var __VLS_170;
// @ts-ignore
[];
var __VLS_164;
// @ts-ignore
[];
var __VLS_141;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sort-row" },
});
/** @type {__VLS_StyleScopedClasses['sort-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "sort-label" },
});
/** @type {__VLS_StyleScopedClasses['sort-label']} */ ;
let __VLS_178;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent1(__VLS_178, new __VLS_178({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sortBy),
    size: "small",
}));
const __VLS_180 = __VLS_179({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.sortBy),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
let __VLS_183;
const __VLS_184 = ({ change: {} },
    { onChange: (__VLS_ctx.handleSearch) });
const { default: __VLS_185 } = __VLS_181.slots;
let __VLS_186;
/** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
elRadioButton;
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({
    value: "",
}));
const __VLS_188 = __VLS_187({
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
const { default: __VLS_191 } = __VLS_189.slots;
// @ts-ignore
[sortBy, handleSearch,];
var __VLS_189;
let __VLS_192;
/** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
elRadioButton;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192({
    value: "rating",
}));
const __VLS_194 = __VLS_193({
    value: "rating",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
const { default: __VLS_197 } = __VLS_195.slots;
// @ts-ignore
[];
var __VLS_195;
let __VLS_198;
/** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
elRadioButton;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({
    value: "price",
}));
const __VLS_200 = __VLS_199({
    value: "price",
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
const { default: __VLS_203 } = __VLS_201.slots;
// @ts-ignore
[];
var __VLS_201;
let __VLS_204;
/** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
elRadioButton;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
    value: "experience",
}));
const __VLS_206 = __VLS_205({
    value: "experience",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
const { default: __VLS_209 } = __VLS_207.slots;
// @ts-ignore
[];
var __VLS_207;
let __VLS_210;
/** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
elRadioButton;
// @ts-ignore
const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
    value: "count",
}));
const __VLS_212 = __VLS_211({
    value: "count",
}, ...__VLS_functionalComponentArgsRest(__VLS_211));
const { default: __VLS_215 } = __VLS_213.slots;
// @ts-ignore
[];
var __VLS_213;
// @ts-ignore
[];
var __VLS_181;
var __VLS_182;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['psychologist-list']} */ ;
if (__VLS_ctx.psychologists.length === 0 && !__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-wrapper']} */ ;
    let __VLS_216;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
        description: "暂无符合条件的心理咨询师",
        ...{ class: "cosmic-empty" },
    }));
    const __VLS_218 = __VLS_217({
        description: "暂无符合条件的心理咨询师",
        ...{ class: "cosmic-empty" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    /** @type {__VLS_StyleScopedClasses['cosmic-empty']} */ ;
}
else if (__VLS_ctx.viewMode === 'grid') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "psychologist-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-grid']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.psychologists))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (item.id),
            ...{ class: "psychologist-card cosmic-card" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        if (item.isFavorite) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "favorite-badge" },
            });
            /** @type {__VLS_StyleScopedClasses['favorite-badge']} */ ;
            let __VLS_221;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({}));
            const __VLS_223 = __VLS_222({}, ...__VLS_functionalComponentArgsRest(__VLS_222));
            const { default: __VLS_226 } = __VLS_224.slots;
            let __VLS_227;
            /** @ts-ignore @type {typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({}));
            const __VLS_229 = __VLS_228({}, ...__VLS_functionalComponentArgsRest(__VLS_228));
            // @ts-ignore
            [viewMode, vLoading, loading, loading, psychologists, psychologists,];
            var __VLS_224;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.psychologists.length === 0 && !__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.viewMode === 'grid'))
                        return;
                    __VLS_ctx.goToDetail(item.id);
                    // @ts-ignore
                    [goToDetail,];
                } },
            ...{ class: "card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "avatar-section" },
        });
        /** @type {__VLS_StyleScopedClasses['avatar-section']} */ ;
        let __VLS_232;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_233 = __VLS_asFunctionalComponent1(__VLS_232, new __VLS_232({
            size: (80),
            src: (item.headPath),
            ...{ class: "psychologist-avatar cosmic-avatar" },
        }));
        const __VLS_234 = __VLS_233({
            size: (80),
            src: (item.headPath),
            ...{ class: "psychologist-avatar cosmic-avatar" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_233));
        /** @type {__VLS_StyleScopedClasses['psychologist-avatar']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-avatar']} */ ;
        const { default: __VLS_237 } = __VLS_235.slots;
        let __VLS_238;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_239 = __VLS_asFunctionalComponent1(__VLS_238, new __VLS_238({
            size: (40),
        }));
        const __VLS_240 = __VLS_239({
            size: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_239));
        const { default: __VLS_243 } = __VLS_241.slots;
        let __VLS_244;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_245 = __VLS_asFunctionalComponent1(__VLS_244, new __VLS_244({}));
        const __VLS_246 = __VLS_245({}, ...__VLS_functionalComponentArgsRest(__VLS_245));
        // @ts-ignore
        [];
        var __VLS_241;
        // @ts-ignore
        [];
        var __VLS_235;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "online-badge" },
            ...{ class: ({ online: item.onlineStatus === 1 }) },
        });
        /** @type {__VLS_StyleScopedClasses['online-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['online']} */ ;
        (item.onlineStatus === 1 ? '在线' : '离线');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.psychologists.length === 0 && !__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.viewMode === 'grid'))
                        return;
                    __VLS_ctx.goToDetail(item.id);
                    // @ts-ignore
                    [goToDetail,];
                } },
            ...{ class: "card-body" },
        });
        /** @type {__VLS_StyleScopedClasses['card-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "psychologist-name" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-name']} */ ;
        (item.realName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "sex-tag" },
            ...{ class: ({ male: item.sex === 1, female: item.sex === 2 }) },
        });
        /** @type {__VLS_StyleScopedClasses['sex-tag']} */ ;
        /** @type {__VLS_StyleScopedClasses['male']} */ ;
        /** @type {__VLS_StyleScopedClasses['female']} */ ;
        (item.sex === 1 ? '男' : item.sex === 2 ? '女' : '');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "rating-row" },
        });
        /** @type {__VLS_StyleScopedClasses['rating-row']} */ ;
        let __VLS_249;
        /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
        elRate;
        // @ts-ignore
        const __VLS_250 = __VLS_asFunctionalComponent1(__VLS_249, new __VLS_249({
            modelValue: (item.ratingScore),
            disabled: true,
            showScore: true,
            size: "small",
            ...{ class: "cosmic-rating" },
        }));
        const __VLS_251 = __VLS_250({
            modelValue: (item.ratingScore),
            disabled: true,
            showScore: true,
            size: "small",
            ...{ class: "cosmic-rating" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_250));
        /** @type {__VLS_StyleScopedClasses['cosmic-rating']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "rating-count" },
        });
        /** @type {__VLS_StyleScopedClasses['rating-count']} */ ;
        (item.ratingCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "experience-text" },
        });
        /** @type {__VLS_StyleScopedClasses['experience-text']} */ ;
        let __VLS_254;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_255 = __VLS_asFunctionalComponent1(__VLS_254, new __VLS_254({}));
        const __VLS_256 = __VLS_255({}, ...__VLS_functionalComponentArgsRest(__VLS_255));
        const { default: __VLS_259 } = __VLS_257.slots;
        let __VLS_260;
        /** @ts-ignore @type {typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260({}));
        const __VLS_262 = __VLS_261({}, ...__VLS_functionalComponentArgsRest(__VLS_261));
        // @ts-ignore
        [];
        var __VLS_257;
        (item.yearsExperience);
        (item.consultationCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "fields-row" },
        });
        /** @type {__VLS_StyleScopedClasses['fields-row']} */ ;
        for (const [field] of __VLS_vFor((item.fields?.slice(0, 3)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (field.id),
                ...{ class: "field-tag cosmic-tag" },
            });
            /** @type {__VLS_StyleScopedClasses['field-tag']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-tag']} */ ;
            (field.name);
            // @ts-ignore
            [];
        }
        if (item.fields?.length > 3) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "more-fields" },
            });
            /** @type {__VLS_StyleScopedClasses['more-fields']} */ ;
            (item.fields.length - 3);
        }
        if (item.offlineRegion || item.offlineAddress) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "offline-address" },
            });
            /** @type {__VLS_StyleScopedClasses['offline-address']} */ ;
            let __VLS_265;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_266 = __VLS_asFunctionalComponent1(__VLS_265, new __VLS_265({}));
            const __VLS_267 = __VLS_266({}, ...__VLS_functionalComponentArgsRest(__VLS_266));
            const { default: __VLS_270 } = __VLS_268.slots;
            let __VLS_271;
            /** @ts-ignore @type {typeof __VLS_components.Location} */
            Location;
            // @ts-ignore
            const __VLS_272 = __VLS_asFunctionalComponent1(__VLS_271, new __VLS_271({}));
            const __VLS_273 = __VLS_272({}, ...__VLS_functionalComponentArgsRest(__VLS_272));
            // @ts-ignore
            [];
            var __VLS_268;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (item.offlineRegion);
            (item.offlineAddress);
        }
        if (item.qualifications?.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "qualifications-row" },
            });
            /** @type {__VLS_StyleScopedClasses['qualifications-row']} */ ;
            for (const [q] of __VLS_vFor((item.qualifications?.slice(0, 2)))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (q.id),
                    ...{ class: "qualification-tag" },
                });
                /** @type {__VLS_StyleScopedClasses['qualification-tag']} */ ;
                let __VLS_276;
                /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
                elIcon;
                // @ts-ignore
                const __VLS_277 = __VLS_asFunctionalComponent1(__VLS_276, new __VLS_276({}));
                const __VLS_278 = __VLS_277({}, ...__VLS_functionalComponentArgsRest(__VLS_277));
                const { default: __VLS_281 } = __VLS_279.slots;
                let __VLS_282;
                /** @ts-ignore @type {typeof __VLS_components.Medal} */
                Medal;
                // @ts-ignore
                const __VLS_283 = __VLS_asFunctionalComponent1(__VLS_282, new __VLS_282({}));
                const __VLS_284 = __VLS_283({}, ...__VLS_functionalComponentArgsRest(__VLS_283));
                // @ts-ignore
                [];
                var __VLS_279;
                (q.name);
                // @ts-ignore
                [];
            }
        }
        if (item.introduction) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "introduction" },
            });
            /** @type {__VLS_StyleScopedClasses['introduction']} */ ;
            (item.introduction.length > 80 ? item.introduction.slice(0, 80) + '...' : item.introduction);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['card-footer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "services-preview" },
        });
        /** @type {__VLS_StyleScopedClasses['services-preview']} */ ;
        for (const [service] of __VLS_vFor((__VLS_ctx.getDisplayServices(item.services)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (service.serviceType),
                ...{ class: "service-price" },
            });
            /** @type {__VLS_StyleScopedClasses['service-price']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "service-type" },
            });
            /** @type {__VLS_StyleScopedClasses['service-type']} */ ;
            (service.serviceName);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "service-amount" },
            });
            /** @type {__VLS_StyleScopedClasses['service-amount']} */ ;
            (service.price);
            // @ts-ignore
            [getDisplayServices,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "action-buttons" },
        });
        /** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
        let __VLS_287;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_288 = __VLS_asFunctionalComponent1(__VLS_287, new __VLS_287({
            ...{ 'onClick': {} },
            ...{ class: "favorite-btn cosmic-btn-secondary cosmic-btn" },
        }));
        const __VLS_289 = __VLS_288({
            ...{ 'onClick': {} },
            ...{ class: "favorite-btn cosmic-btn-secondary cosmic-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_288));
        let __VLS_292;
        const __VLS_293 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.psychologists.length === 0 && !__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.viewMode === 'grid'))
                        return;
                    __VLS_ctx.toggleFavorite(item);
                    // @ts-ignore
                    [toggleFavorite,];
                } });
        /** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        const { default: __VLS_294 } = __VLS_290.slots;
        let __VLS_295;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_296 = __VLS_asFunctionalComponent1(__VLS_295, new __VLS_295({
            color: (item.isFavorite ? '#ffd700' : undefined),
        }));
        const __VLS_297 = __VLS_296({
            color: (item.isFavorite ? '#ffd700' : undefined),
        }, ...__VLS_functionalComponentArgsRest(__VLS_296));
        const { default: __VLS_300 } = __VLS_298.slots;
        if (item.isFavorite) {
            let __VLS_301;
            /** @ts-ignore @type {typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_302 = __VLS_asFunctionalComponent1(__VLS_301, new __VLS_301({}));
            const __VLS_303 = __VLS_302({}, ...__VLS_functionalComponentArgsRest(__VLS_302));
        }
        else {
            let __VLS_306;
            /** @ts-ignore @type {typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_307 = __VLS_asFunctionalComponent1(__VLS_306, new __VLS_306({}));
            const __VLS_308 = __VLS_307({}, ...__VLS_functionalComponentArgsRest(__VLS_307));
        }
        // @ts-ignore
        [];
        var __VLS_298;
        (item.isFavorite ? '已收藏' : '收藏');
        // @ts-ignore
        [];
        var __VLS_290;
        var __VLS_291;
        let __VLS_311;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_312 = __VLS_asFunctionalComponent1(__VLS_311, new __VLS_311({
            ...{ 'onClick': {} },
            ...{ class: "book-btn cosmic-btn-primary cosmic-btn" },
        }));
        const __VLS_313 = __VLS_312({
            ...{ 'onClick': {} },
            ...{ class: "book-btn cosmic-btn-primary cosmic-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_312));
        let __VLS_316;
        const __VLS_317 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.psychologists.length === 0 && !__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.viewMode === 'grid'))
                        return;
                    __VLS_ctx.goToDetail(item.id);
                    // @ts-ignore
                    [goToDetail,];
                } });
        /** @type {__VLS_StyleScopedClasses['book-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        const { default: __VLS_318 } = __VLS_314.slots;
        // @ts-ignore
        [];
        var __VLS_314;
        var __VLS_315;
        // @ts-ignore
        [];
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "psychologist-list-view" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-list-view']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.psychologists))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.psychologists.length === 0 && !__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.viewMode === 'grid'))
                        return;
                    __VLS_ctx.goToDetail(item.id);
                    // @ts-ignore
                    [psychologists, goToDetail,];
                } },
            key: (item.id),
            ...{ class: "list-card cosmic-card" },
        });
        /** @type {__VLS_StyleScopedClasses['list-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-left" },
        });
        /** @type {__VLS_StyleScopedClasses['list-left']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-avatar-wrapper" },
        });
        /** @type {__VLS_StyleScopedClasses['list-avatar-wrapper']} */ ;
        let __VLS_319;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_320 = __VLS_asFunctionalComponent1(__VLS_319, new __VLS_319({
            size: (80),
            src: (item.headPath),
            ...{ class: "cosmic-avatar" },
        }));
        const __VLS_321 = __VLS_320({
            size: (80),
            src: (item.headPath),
            ...{ class: "cosmic-avatar" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_320));
        /** @type {__VLS_StyleScopedClasses['cosmic-avatar']} */ ;
        const { default: __VLS_324 } = __VLS_322.slots;
        let __VLS_325;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_326 = __VLS_asFunctionalComponent1(__VLS_325, new __VLS_325({
            size: (40),
        }));
        const __VLS_327 = __VLS_326({
            size: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_326));
        const { default: __VLS_330 } = __VLS_328.slots;
        let __VLS_331;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_332 = __VLS_asFunctionalComponent1(__VLS_331, new __VLS_331({}));
        const __VLS_333 = __VLS_332({}, ...__VLS_functionalComponentArgsRest(__VLS_332));
        // @ts-ignore
        [];
        var __VLS_328;
        // @ts-ignore
        [];
        var __VLS_322;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "online-badge" },
            ...{ class: ({ online: item.onlineStatus === 1 }) },
        });
        /** @type {__VLS_StyleScopedClasses['online-badge']} */ ;
        /** @type {__VLS_StyleScopedClasses['online']} */ ;
        (item.onlineStatus === 1 ? '在线' : '离线');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "favorite-btn-wrapper" },
        });
        /** @type {__VLS_StyleScopedClasses['favorite-btn-wrapper']} */ ;
        let __VLS_336;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_337 = __VLS_asFunctionalComponent1(__VLS_336, new __VLS_336({
            ...{ 'onClick': {} },
            ...{ class: "favorite-btn cosmic-btn-secondary cosmic-btn" },
        }));
        const __VLS_338 = __VLS_337({
            ...{ 'onClick': {} },
            ...{ class: "favorite-btn cosmic-btn-secondary cosmic-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_337));
        let __VLS_341;
        const __VLS_342 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.psychologists.length === 0 && !__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.viewMode === 'grid'))
                        return;
                    __VLS_ctx.toggleFavorite(item);
                    // @ts-ignore
                    [toggleFavorite,];
                } });
        /** @type {__VLS_StyleScopedClasses['favorite-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        const { default: __VLS_343 } = __VLS_339.slots;
        let __VLS_344;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_345 = __VLS_asFunctionalComponent1(__VLS_344, new __VLS_344({
            color: (item.isFavorite ? '#ffd700' : undefined),
        }));
        const __VLS_346 = __VLS_345({
            color: (item.isFavorite ? '#ffd700' : undefined),
        }, ...__VLS_functionalComponentArgsRest(__VLS_345));
        const { default: __VLS_349 } = __VLS_347.slots;
        if (item.isFavorite) {
            let __VLS_350;
            /** @ts-ignore @type {typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_351 = __VLS_asFunctionalComponent1(__VLS_350, new __VLS_350({}));
            const __VLS_352 = __VLS_351({}, ...__VLS_functionalComponentArgsRest(__VLS_351));
        }
        else {
            let __VLS_355;
            /** @ts-ignore @type {typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_356 = __VLS_asFunctionalComponent1(__VLS_355, new __VLS_355({}));
            const __VLS_357 = __VLS_356({}, ...__VLS_functionalComponentArgsRest(__VLS_356));
        }
        // @ts-ignore
        [];
        var __VLS_347;
        // @ts-ignore
        [];
        var __VLS_339;
        var __VLS_340;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-content" },
        });
        /** @type {__VLS_StyleScopedClasses['list-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-main" },
        });
        /** @type {__VLS_StyleScopedClasses['list-main']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-header" },
        });
        /** @type {__VLS_StyleScopedClasses['list-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "psychologist-name" },
        });
        /** @type {__VLS_StyleScopedClasses['psychologist-name']} */ ;
        (item.realName);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "sex-tag" },
            ...{ class: ({ male: item.sex === 1, female: item.sex === 2 }) },
        });
        /** @type {__VLS_StyleScopedClasses['sex-tag']} */ ;
        /** @type {__VLS_StyleScopedClasses['male']} */ ;
        /** @type {__VLS_StyleScopedClasses['female']} */ ;
        (item.sex === 1 ? '男' : item.sex === 2 ? '女' : '');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-tags" },
        });
        /** @type {__VLS_StyleScopedClasses['list-tags']} */ ;
        for (const [q] of __VLS_vFor((item.qualifications?.slice(0, 3)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (q.id),
                ...{ class: "qualification-tag" },
            });
            /** @type {__VLS_StyleScopedClasses['qualification-tag']} */ ;
            let __VLS_360;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_361 = __VLS_asFunctionalComponent1(__VLS_360, new __VLS_360({}));
            const __VLS_362 = __VLS_361({}, ...__VLS_functionalComponentArgsRest(__VLS_361));
            const { default: __VLS_365 } = __VLS_363.slots;
            let __VLS_366;
            /** @ts-ignore @type {typeof __VLS_components.Medal} */
            Medal;
            // @ts-ignore
            const __VLS_367 = __VLS_asFunctionalComponent1(__VLS_366, new __VLS_366({}));
            const __VLS_368 = __VLS_367({}, ...__VLS_functionalComponentArgsRest(__VLS_367));
            // @ts-ignore
            [];
            var __VLS_363;
            (q.name);
            // @ts-ignore
            [];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-info" },
        });
        /** @type {__VLS_StyleScopedClasses['list-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        let __VLS_371;
        /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
        elRate;
        // @ts-ignore
        const __VLS_372 = __VLS_asFunctionalComponent1(__VLS_371, new __VLS_371({
            modelValue: (item.ratingScore),
            disabled: true,
            showScore: true,
            size: "small",
            ...{ class: "cosmic-rating" },
        }));
        const __VLS_373 = __VLS_372({
            modelValue: (item.ratingScore),
            disabled: true,
            showScore: true,
            size: "small",
            ...{ class: "cosmic-rating" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_372));
        /** @type {__VLS_StyleScopedClasses['cosmic-rating']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "rating-count" },
        });
        /** @type {__VLS_StyleScopedClasses['rating-count']} */ ;
        (item.ratingCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        let __VLS_376;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_377 = __VLS_asFunctionalComponent1(__VLS_376, new __VLS_376({}));
        const __VLS_378 = __VLS_377({}, ...__VLS_functionalComponentArgsRest(__VLS_377));
        const { default: __VLS_381 } = __VLS_379.slots;
        let __VLS_382;
        /** @ts-ignore @type {typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_383 = __VLS_asFunctionalComponent1(__VLS_382, new __VLS_382({}));
        const __VLS_384 = __VLS_383({}, ...__VLS_functionalComponentArgsRest(__VLS_383));
        // @ts-ignore
        [];
        var __VLS_379;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (item.yearsExperience);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "info-item" },
        });
        /** @type {__VLS_StyleScopedClasses['info-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (item.consultationCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-fields" },
        });
        /** @type {__VLS_StyleScopedClasses['list-fields']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-label" },
        });
        /** @type {__VLS_StyleScopedClasses['field-label']} */ ;
        for (const [field] of __VLS_vFor((item.fields?.slice(0, 5)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (field.id),
                ...{ class: "field-tag cosmic-tag" },
            });
            /** @type {__VLS_StyleScopedClasses['field-tag']} */ ;
            /** @type {__VLS_StyleScopedClasses['cosmic-tag']} */ ;
            (field.name);
            // @ts-ignore
            [];
        }
        if (item.fields?.length > 5) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "more-fields" },
            });
            /** @type {__VLS_StyleScopedClasses['more-fields']} */ ;
            (item.fields.length - 5);
        }
        if (item.offlineRegion || item.offlineAddress) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "list-offline-address" },
            });
            /** @type {__VLS_StyleScopedClasses['list-offline-address']} */ ;
            let __VLS_387;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_388 = __VLS_asFunctionalComponent1(__VLS_387, new __VLS_387({}));
            const __VLS_389 = __VLS_388({}, ...__VLS_functionalComponentArgsRest(__VLS_388));
            const { default: __VLS_392 } = __VLS_390.slots;
            let __VLS_393;
            /** @ts-ignore @type {typeof __VLS_components.Location} */
            Location;
            // @ts-ignore
            const __VLS_394 = __VLS_asFunctionalComponent1(__VLS_393, new __VLS_393({}));
            const __VLS_395 = __VLS_394({}, ...__VLS_functionalComponentArgsRest(__VLS_394));
            // @ts-ignore
            [];
            var __VLS_390;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (item.offlineRegion);
            (item.offlineAddress);
        }
        if (item.introduction) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "introduction" },
            });
            /** @type {__VLS_StyleScopedClasses['introduction']} */ ;
            (item.introduction.length > 150 ? item.introduction.slice(0, 150) + '...' : item.introduction);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "list-right" },
        });
        /** @type {__VLS_StyleScopedClasses['list-right']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "services-list" },
        });
        /** @type {__VLS_StyleScopedClasses['services-list']} */ ;
        for (const [service] of __VLS_vFor((__VLS_ctx.getDisplayServices(item.services)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (service.serviceType),
                ...{ class: "service-item" },
            });
            /** @type {__VLS_StyleScopedClasses['service-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "service-type" },
            });
            /** @type {__VLS_StyleScopedClasses['service-type']} */ ;
            (service.serviceName);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "service-amount" },
            });
            /** @type {__VLS_StyleScopedClasses['service-amount']} */ ;
            (service.price);
            // @ts-ignore
            [getDisplayServices,];
        }
        let __VLS_398;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_399 = __VLS_asFunctionalComponent1(__VLS_398, new __VLS_398({
            ...{ class: "book-btn cosmic-btn-primary cosmic-btn" },
        }));
        const __VLS_400 = __VLS_399({
            ...{ class: "book-btn cosmic-btn-primary cosmic-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_399));
        /** @type {__VLS_StyleScopedClasses['book-btn']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
        /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
        const { default: __VLS_403 } = __VLS_401.slots;
        // @ts-ignore
        [];
        var __VLS_401;
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
    let __VLS_404;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_405 = __VLS_asFunctionalComponent1(__VLS_404, new __VLS_404({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        pageSizes: (__VLS_ctx.viewMode === 'grid' ? [8, 12, 16, 24] : [10, 20, 50]),
        layout: "total, sizes, prev, pager, next, jumper",
        ...{ class: "cosmic-pagination" },
    }));
    const __VLS_406 = __VLS_405({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        pageSizes: (__VLS_ctx.viewMode === 'grid' ? [8, 12, 16, 24] : [10, 20, 50]),
        layout: "total, sizes, prev, pager, next, jumper",
        ...{ class: "cosmic-pagination" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_405));
    let __VLS_409;
    const __VLS_410 = ({ sizeChange: {} },
        { onSizeChange: (__VLS_ctx.handleSearch) });
    const __VLS_411 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handleSearch) });
    /** @type {__VLS_StyleScopedClasses['cosmic-pagination']} */ ;
    var __VLS_407;
    var __VLS_408;
}
let __VLS_412;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_413 = __VLS_asFunctionalComponent1(__VLS_412, new __VLS_412({
    modelValue: (__VLS_ctx.bookingDialogVisible),
    title: "预约咨询",
    width: "600px",
    ...{ class: "cosmic-dialog" },
    closeOnClickModal: (false),
}));
const __VLS_414 = __VLS_413({
    modelValue: (__VLS_ctx.bookingDialogVisible),
    title: "预约咨询",
    width: "600px",
    ...{ class: "cosmic-dialog" },
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_413));
/** @type {__VLS_StyleScopedClasses['cosmic-dialog']} */ ;
const { default: __VLS_417 } = __VLS_415.slots;
if (__VLS_ctx.selectedPsychologist) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "booking-content" },
    });
    /** @type {__VLS_StyleScopedClasses['booking-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "booking-psychologist-info" },
    });
    /** @type {__VLS_StyleScopedClasses['booking-psychologist-info']} */ ;
    let __VLS_418;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_419 = __VLS_asFunctionalComponent1(__VLS_418, new __VLS_418({
        size: (60),
        src: (__VLS_ctx.selectedPsychologist.headPath),
        ...{ class: "cosmic-avatar" },
    }));
    const __VLS_420 = __VLS_419({
        size: (60),
        src: (__VLS_ctx.selectedPsychologist.headPath),
        ...{ class: "cosmic-avatar" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_419));
    /** @type {__VLS_StyleScopedClasses['cosmic-avatar']} */ ;
    const { default: __VLS_423 } = __VLS_421.slots;
    let __VLS_424;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_425 = __VLS_asFunctionalComponent1(__VLS_424, new __VLS_424({
        size: (30),
    }));
    const __VLS_426 = __VLS_425({
        size: (30),
    }, ...__VLS_functionalComponentArgsRest(__VLS_425));
    const { default: __VLS_429 } = __VLS_427.slots;
    let __VLS_430;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_431 = __VLS_asFunctionalComponent1(__VLS_430, new __VLS_430({}));
    const __VLS_432 = __VLS_431({}, ...__VLS_functionalComponentArgsRest(__VLS_431));
    // @ts-ignore
    [viewMode, handleSearch, handleSearch, total, total, currentPage, pageSize, bookingDialogVisible, selectedPsychologist, selectedPsychologist,];
    var __VLS_427;
    // @ts-ignore
    [];
    var __VLS_421;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-text" },
    });
    /** @type {__VLS_StyleScopedClasses['info-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    (__VLS_ctx.selectedPsychologist.realName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.selectedPsychologist.yearsExperience);
    (__VLS_ctx.selectedPsychologist.consultationCount);
    let __VLS_435;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_436 = __VLS_asFunctionalComponent1(__VLS_435, new __VLS_435({
        labelWidth: "100px",
        ...{ class: "booking-form" },
    }));
    const __VLS_437 = __VLS_436({
        labelWidth: "100px",
        ...{ class: "booking-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_436));
    /** @type {__VLS_StyleScopedClasses['booking-form']} */ ;
    const { default: __VLS_440 } = __VLS_438.slots;
    let __VLS_441;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_442 = __VLS_asFunctionalComponent1(__VLS_441, new __VLS_441({
        label: "咨询方式",
    }));
    const __VLS_443 = __VLS_442({
        label: "咨询方式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_442));
    const { default: __VLS_446 } = __VLS_444.slots;
    let __VLS_447;
    /** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
    elRadioGroup;
    // @ts-ignore
    const __VLS_448 = __VLS_asFunctionalComponent1(__VLS_447, new __VLS_447({
        modelValue: (__VLS_ctx.bookingForm.serviceType),
        ...{ class: "service-type-group" },
    }));
    const __VLS_449 = __VLS_448({
        modelValue: (__VLS_ctx.bookingForm.serviceType),
        ...{ class: "service-type-group" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_448));
    /** @type {__VLS_StyleScopedClasses['service-type-group']} */ ;
    const { default: __VLS_452 } = __VLS_450.slots;
    for (const [service] of __VLS_vFor((__VLS_ctx.selectedPsychologist.services))) {
        let __VLS_453;
        /** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
        elRadio;
        // @ts-ignore
        const __VLS_454 = __VLS_asFunctionalComponent1(__VLS_453, new __VLS_453({
            key: (service.serviceType),
            value: (service.serviceType),
            ...{ class: "service-option" },
        }));
        const __VLS_455 = __VLS_454({
            key: (service.serviceType),
            value: (service.serviceType),
            ...{ class: "service-option" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_454));
        /** @type {__VLS_StyleScopedClasses['service-option']} */ ;
        const { default: __VLS_458 } = __VLS_456.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "option-label" },
        });
        /** @type {__VLS_StyleScopedClasses['option-label']} */ ;
        (__VLS_ctx.getServiceTypeName(service.serviceType));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "option-price" },
        });
        /** @type {__VLS_StyleScopedClasses['option-price']} */ ;
        (service.price);
        // @ts-ignore
        [selectedPsychologist, selectedPsychologist, selectedPsychologist, selectedPsychologist, bookingForm, getServiceTypeName,];
        var __VLS_456;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_450;
    // @ts-ignore
    [];
    var __VLS_444;
    let __VLS_459;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_460 = __VLS_asFunctionalComponent1(__VLS_459, new __VLS_459({
        label: "预约时间",
    }));
    const __VLS_461 = __VLS_460({
        label: "预约时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_460));
    const { default: __VLS_464 } = __VLS_462.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "schedule-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['schedule-grid']} */ ;
    for (const [schedule] of __VLS_vFor((__VLS_ctx.availableSchedules))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.selectedPsychologist))
                        return;
                    __VLS_ctx.selectSchedule(schedule);
                    // @ts-ignore
                    [availableSchedules, selectSchedule,];
                } },
            key: (schedule.id),
            ...{ class: "schedule-item" },
            ...{ class: ({
                    selected: __VLS_ctx.bookingForm.scheduleId === schedule.id,
                    disabled: schedule.bookedCount >= schedule.maxAppointments
                }) },
        });
        /** @type {__VLS_StyleScopedClasses['schedule-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['selected']} */ ;
        /** @type {__VLS_StyleScopedClasses['disabled']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "schedule-date" },
        });
        /** @type {__VLS_StyleScopedClasses['schedule-date']} */ ;
        (__VLS_ctx.formatDate(schedule.scheduleDate));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "schedule-slot" },
        });
        /** @type {__VLS_StyleScopedClasses['schedule-slot']} */ ;
        (__VLS_ctx.getTimeSlotName(schedule.timeSlot));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "schedule-status" },
        });
        /** @type {__VLS_StyleScopedClasses['schedule-status']} */ ;
        (schedule.bookedCount);
        (schedule.maxAppointments);
        // @ts-ignore
        [bookingForm, formatDate, getTimeSlotName,];
    }
    if (__VLS_ctx.availableSchedules.length === 0) {
        let __VLS_465;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_466 = __VLS_asFunctionalComponent1(__VLS_465, new __VLS_465({
            description: "暂无可用时间",
            imageSize: (60),
        }));
        const __VLS_467 = __VLS_466({
            description: "暂无可用时间",
            imageSize: (60),
        }, ...__VLS_functionalComponentArgsRest(__VLS_466));
    }
    // @ts-ignore
    [availableSchedules,];
    var __VLS_462;
    if (__VLS_ctx.bookingForm.serviceType === 'video' || __VLS_ctx.bookingForm.serviceType === 'text') {
        let __VLS_470;
        /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
        elFormItem;
        // @ts-ignore
        const __VLS_471 = __VLS_asFunctionalComponent1(__VLS_470, new __VLS_470({
            label: "个人情况",
        }));
        const __VLS_472 = __VLS_471({
            label: "个人情况",
        }, ...__VLS_functionalComponentArgsRest(__VLS_471));
        const { default: __VLS_475 } = __VLS_473.slots;
        let __VLS_476;
        /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
        elInput;
        // @ts-ignore
        const __VLS_477 = __VLS_asFunctionalComponent1(__VLS_476, new __VLS_476({
            modelValue: (__VLS_ctx.bookingForm.personalSituation),
            type: "textarea",
            rows: (3),
            placeholder: "简单描述您的个人情况...",
            ...{ class: "cosmic-textarea" },
        }));
        const __VLS_478 = __VLS_477({
            modelValue: (__VLS_ctx.bookingForm.personalSituation),
            type: "textarea",
            rows: (3),
            placeholder: "简单描述您的个人情况...",
            ...{ class: "cosmic-textarea" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_477));
        /** @type {__VLS_StyleScopedClasses['cosmic-textarea']} */ ;
        // @ts-ignore
        [bookingForm, bookingForm, bookingForm,];
        var __VLS_473;
    }
    let __VLS_481;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_482 = __VLS_asFunctionalComponent1(__VLS_481, new __VLS_481({
        label: "主要问题",
    }));
    const __VLS_483 = __VLS_482({
        label: "主要问题",
    }, ...__VLS_functionalComponentArgsRest(__VLS_482));
    const { default: __VLS_486 } = __VLS_484.slots;
    let __VLS_487;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_488 = __VLS_asFunctionalComponent1(__VLS_487, new __VLS_487({
        modelValue: (__VLS_ctx.bookingForm.problems),
        type: "textarea",
        rows: (4),
        placeholder: "请详细描述您想解决的问题...",
        ...{ class: "cosmic-textarea" },
    }));
    const __VLS_489 = __VLS_488({
        modelValue: (__VLS_ctx.bookingForm.problems),
        type: "textarea",
        rows: (4),
        placeholder: "请详细描述您想解决的问题...",
        ...{ class: "cosmic-textarea" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_488));
    /** @type {__VLS_StyleScopedClasses['cosmic-textarea']} */ ;
    // @ts-ignore
    [bookingForm,];
    var __VLS_484;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fee-preview" },
    });
    /** @type {__VLS_StyleScopedClasses['fee-preview']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fee-row" },
    });
    /** @type {__VLS_StyleScopedClasses['fee-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.getServiceTypeName(__VLS_ctx.bookingForm.serviceType));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fee-row total" },
    });
    /** @type {__VLS_StyleScopedClasses['fee-row']} */ ;
    /** @type {__VLS_StyleScopedClasses['total']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "total-price" },
    });
    /** @type {__VLS_StyleScopedClasses['total-price']} */ ;
    (__VLS_ctx.selectedPrice);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "fee-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['fee-tip']} */ ;
    let __VLS_492;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_493 = __VLS_asFunctionalComponent1(__VLS_492, new __VLS_492({}));
    const __VLS_494 = __VLS_493({}, ...__VLS_functionalComponentArgsRest(__VLS_493));
    const { default: __VLS_497 } = __VLS_495.slots;
    let __VLS_498;
    /** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
    InfoFilled;
    // @ts-ignore
    const __VLS_499 = __VLS_asFunctionalComponent1(__VLS_498, new __VLS_498({}));
    const __VLS_500 = __VLS_499({}, ...__VLS_functionalComponentArgsRest(__VLS_499));
    // @ts-ignore
    [bookingForm, getServiceTypeName, selectedPrice,];
    var __VLS_495;
    // @ts-ignore
    [];
    var __VLS_438;
}
{
    const { footer: __VLS_503 } = __VLS_415.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_504;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_505 = __VLS_asFunctionalComponent1(__VLS_504, new __VLS_504({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }));
    const __VLS_506 = __VLS_505({
        ...{ 'onClick': {} },
        ...{ class: "cosmic-btn-secondary cosmic-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_505));
    let __VLS_509;
    const __VLS_510 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.bookingDialogVisible = false;
                // @ts-ignore
                [bookingDialogVisible,];
            } });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-secondary']} */ ;
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
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        loading: (__VLS_ctx.submitting),
        disabled: (!__VLS_ctx.canSubmit),
    }));
    const __VLS_514 = __VLS_513({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "cosmic-btn-primary cosmic-btn" },
        loading: (__VLS_ctx.submitting),
        disabled: (!__VLS_ctx.canSubmit),
    }, ...__VLS_functionalComponentArgsRest(__VLS_513));
    let __VLS_517;
    const __VLS_518 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmBooking) });
    /** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
    /** @type {__VLS_StyleScopedClasses['cosmic-btn']} */ ;
    const { default: __VLS_519 } = __VLS_515.slots;
    (__VLS_ctx.selectedPrice);
    // @ts-ignore
    [selectedPrice, submitting, canSubmit, confirmBooking,];
    var __VLS_515;
    var __VLS_516;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_415;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
