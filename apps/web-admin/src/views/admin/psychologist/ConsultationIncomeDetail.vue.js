/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Search, Refresh, User } from '@element-plus/icons-vue';
import { getConsultationIncomeList } from '@/api/admin/platformIncome';
import { getAdminPsychologistList } from '@/api/psychologistAdmin';
const router = useRouter();
// 咨询师选项
const psychologistOptions = ref([]);
// 表格数据
const loading = ref(false);
const tableData = ref([]);
// 摘要统计
const summary = reactive({
    totalCount: 0,
    totalFee: 0,
    totalCommission: 0,
    avgRating: '-'
});
// 筛选条件
const filters = reactive({
    psychologistId: null,
    ratingRange: null,
    dateRange: null
});
// 分页
const pagination = reactive({
    page: 1,
    size: 10,
    total: 0
});
// 格式化金额
const formatMoney = (val) => {
    if (!val)
        return '0.00';
    if (val >= 10000)
        return (val / 10000).toFixed(2) + '万';
    return val.toFixed(2);
};
// 格式化评分
const formatRate = (rate) => {
    if (!rate)
        return '-';
    return (rate * 100).toFixed(0) + '%';
};
// 格式化日期时间
const formatDateTime = (dt) => {
    if (!dt)
        return '-';
    return dt.replace('T', ' ').substring(0, 19);
};
// 获取抽成标签颜色
const getCommissionTagType = (rate) => {
    if (!rate)
        return 'info';
    if (rate >= 0.45)
        return 'danger';
    if (rate >= 0.30)
        return 'warning';
    return 'success';
};
// 获取咨询师列表
const fetchPsychologists = async () => {
    try {
        const res = await getAdminPsychologistList({ page: 1, size: 999 });
        if (res.code === 200) {
            psychologistOptions.value = res.data?.list || [];
        }
    }
    catch (e) {
        console.error('获取咨询师列表失败', e);
    }
};
// 获取列表数据
const fetchList = async () => {
    loading.value = true;
    try {
        const params = {
            page: pagination.page,
            size: pagination.size
        };
        if (filters.psychologistId) {
            params.psychologistId = filters.psychologistId;
        }
        // 评分范围转换
        if (filters.ratingRange) {
            const map = {
                1: [0, 1.5],
                2: [1.5, 3],
                3: [3, 4.5],
                4: [4.5, 5]
            };
            const [min, max] = map[filters.ratingRange] || [null, null];
            if (min !== null)
                params.minRating = min;
            if (max !== null)
                params.maxRating = max;
        }
        if (filters.dateRange) {
            params.startDate = filters.dateRange[0];
            params.endDate = filters.dateRange[1];
        }
        const res = await getConsultationIncomeList(params);
        if (res.code === 200) {
            const data = res.data;
            tableData.value = data?.list || [];
            pagination.total = data?.total || 0;
            // 计算摘要统计
            calcSummary(data?.list || []);
        }
        else {
            ElMessage.error(res.message || '获取数据失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取数据失败');
    }
    finally {
        loading.value = false;
    }
};
// 计算摘要
const calcSummary = (list) => {
    summary.totalCount = pagination.total;
    summary.totalFee = list.reduce((sum, item) => sum + (item.orderFee || 0), 0);
    summary.totalCommission = list.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
    const rated = list.filter((item) => item.ratingScore);
    if (rated.length > 0) {
        const avg = rated.reduce((sum, item) => sum + item.ratingScore, 0) / rated.length;
        summary.avgRating = avg.toFixed(2);
    }
    else {
        summary.avgRating = '-';
    }
};
// 筛选变化
const handleFilterChange = () => {
    pagination.page = 1;
    fetchList();
};
// 重置筛选
const resetFilters = () => {
    filters.psychologistId = null;
    filters.ratingRange = null;
    filters.dateRange = null;
    handleFilterChange();
};
// 分页变化
const handleSizeChange = () => {
    pagination.page = 1;
    fetchList();
};
const handlePageChange = () => {
    fetchList();
};
onMounted(() => {
    fetchPsychologists();
    fetchList();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-cell']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "consultation-income-page" },
});
/** @type {__VLS_StyleScopedClasses['consultation-income-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-left" },
});
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.router.back();
            // @ts-ignore
            [router,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.ArrowLeft} */
ArrowLeft;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
// @ts-ignore
[];
var __VLS_11;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-cards" },
});
/** @type {__VLS_StyleScopedClasses['summary-cards']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-card" },
});
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-label" },
});
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-value" },
});
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
(__VLS_ctx.summary.totalCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-card" },
});
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-label" },
});
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-value" },
});
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
(__VLS_ctx.formatMoney(__VLS_ctx.summary.totalFee));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-card highlight" },
});
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-label" },
});
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-value" },
});
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
(__VLS_ctx.formatMoney(__VLS_ctx.summary.totalCommission));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-card" },
});
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-label" },
});
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "summary-value" },
});
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
(__VLS_ctx.summary.avgRating);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-section" },
});
/** @type {__VLS_StyleScopedClasses['filter-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-row" },
});
/** @type {__VLS_StyleScopedClasses['filter-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-item" },
});
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.psychologistId),
    placeholder: "全部咨询师",
    clearable: true,
    filterable: true,
    ...{ style: {} },
}));
const __VLS_21 = __VLS_20({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.psychologistId),
    placeholder: "全部咨询师",
    clearable: true,
    filterable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_24;
const __VLS_25 = ({ change: {} },
    { onChange: (__VLS_ctx.handleFilterChange) });
const { default: __VLS_26 } = __VLS_22.slots;
for (const [p] of __VLS_vFor((__VLS_ctx.psychologistOptions))) {
    let __VLS_27;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        key: (p.id),
        label: (p.realName),
        value: (p.id),
    }));
    const __VLS_29 = __VLS_28({
        key: (p.id),
        label: (p.realName),
        value: (p.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    // @ts-ignore
    [summary, summary, summary, summary, formatMoney, formatMoney, filters, handleFilterChange, psychologistOptions,];
}
// @ts-ignore
[];
var __VLS_22;
var __VLS_23;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-item" },
});
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.ratingRange),
    placeholder: "全部评分",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.ratingRange),
    placeholder: "全部评分",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_37;
const __VLS_38 = ({ change: {} },
    { onChange: (__VLS_ctx.handleFilterChange) });
const { default: __VLS_39 } = __VLS_35.slots;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    label: "0 - 1.5 分（高抽成60%）",
    value: (1),
}));
const __VLS_42 = __VLS_41({
    label: "0 - 1.5 分（高抽成60%）",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_45;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    label: "1.5 - 3 分（抽成45%）",
    value: (2),
}));
const __VLS_47 = __VLS_46({
    label: "1.5 - 3 分（抽成45%）",
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    label: "3 - 4.5 分（抽成30%）",
    value: (3),
}));
const __VLS_52 = __VLS_51({
    label: "3 - 4.5 分（抽成30%）",
    value: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    label: "4.5 - 5 分（低抽成15%）",
    value: (4),
}));
const __VLS_57 = __VLS_56({
    label: "4.5 - 5 分（低抽成15%）",
    value: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
// @ts-ignore
[filters, handleFilterChange,];
var __VLS_35;
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-item" },
});
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({});
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.dateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始",
    endPlaceholder: "结束",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}));
const __VLS_62 = __VLS_61({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.dateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始",
    endPlaceholder: "结束",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_65;
const __VLS_66 = ({ change: {} },
    { onChange: (__VLS_ctx.handleFilterChange) });
var __VLS_63;
var __VLS_64;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-item" },
});
/** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_69 = __VLS_68({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
let __VLS_72;
const __VLS_73 = ({ click: {} },
    { onClick: (__VLS_ctx.handleFilterChange) });
const { default: __VLS_74 } = __VLS_70.slots;
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({}));
const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
const { default: __VLS_80 } = __VLS_78.slots;
let __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.Search} */
Search;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({}));
const __VLS_83 = __VLS_82({}, ...__VLS_functionalComponentArgsRest(__VLS_82));
// @ts-ignore
[filters, handleFilterChange, handleFilterChange,];
var __VLS_78;
// @ts-ignore
[];
var __VLS_70;
var __VLS_71;
let __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
    ...{ 'onClick': {} },
}));
const __VLS_88 = __VLS_87({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
let __VLS_91;
const __VLS_92 = ({ click: {} },
    { onClick: (__VLS_ctx.resetFilters) });
const { default: __VLS_93 } = __VLS_89.slots;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({}));
const __VLS_96 = __VLS_95({}, ...__VLS_functionalComponentArgsRest(__VLS_95));
const { default: __VLS_99 } = __VLS_97.slots;
let __VLS_100;
/** @ts-ignore @type {typeof __VLS_components.Refresh} */
Refresh;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({}));
const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
// @ts-ignore
[resetFilters,];
var __VLS_97;
// @ts-ignore
[];
var __VLS_89;
var __VLS_90;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    data: (__VLS_ctx.tableData),
    stripe: true,
    border: true,
}));
const __VLS_107 = __VLS_106({
    data: (__VLS_ctx.tableData),
    stripe: true,
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_110 } = __VLS_108.slots;
let __VLS_111;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_113 = __VLS_112({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
let __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
    label: "咨询师",
    minWidth: "140",
}));
const __VLS_118 = __VLS_117({
    label: "咨询师",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
const { default: __VLS_121 } = __VLS_119.slots;
{
    const { default: __VLS_122 } = __VLS_119.slots;
    const [scope] = __VLS_vSlot(__VLS_122);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "psychologist-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-cell']} */ ;
    let __VLS_123;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
        size: (32),
        src: (scope.row.psychologistAvatar),
    }));
    const __VLS_125 = __VLS_124({
        size: (32),
        src: (scope.row.psychologistAvatar),
    }, ...__VLS_functionalComponentArgsRest(__VLS_124));
    const { default: __VLS_128 } = __VLS_126.slots;
    let __VLS_129;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({}));
    const __VLS_131 = __VLS_130({}, ...__VLS_functionalComponentArgsRest(__VLS_130));
    const { default: __VLS_134 } = __VLS_132.slots;
    let __VLS_135;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({}));
    const __VLS_137 = __VLS_136({}, ...__VLS_functionalComponentArgsRest(__VLS_136));
    // @ts-ignore
    [tableData, vLoading, loading,];
    var __VLS_132;
    // @ts-ignore
    [];
    var __VLS_126;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "name" },
    });
    /** @type {__VLS_StyleScopedClasses['name']} */ ;
    (scope.row.psychologistName || '未知');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_119;
let __VLS_140;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
    prop: "orderId",
    label: "订单ID",
    width: "120",
}));
const __VLS_142 = __VLS_141({
    prop: "orderId",
    label: "订单ID",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
const { default: __VLS_145 } = __VLS_143.slots;
{
    const { default: __VLS_146 } = __VLS_143.slots;
    const [scope] = __VLS_vSlot(__VLS_146);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "order-id" },
    });
    /** @type {__VLS_StyleScopedClasses['order-id']} */ ;
    (scope.row.orderId);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_143;
let __VLS_147;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
    label: "订单金额",
    width: "120",
}));
const __VLS_149 = __VLS_148({
    label: "订单金额",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_148));
const { default: __VLS_152 } = __VLS_150.slots;
{
    const { default: __VLS_153 } = __VLS_150.slots;
    const [scope] = __VLS_vSlot(__VLS_153);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "amount" },
    });
    /** @type {__VLS_StyleScopedClasses['amount']} */ ;
    (scope.row.orderFee || 0);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_150;
let __VLS_154;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
    label: "评分",
    width: "100",
}));
const __VLS_156 = __VLS_155({
    label: "评分",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
const { default: __VLS_159 } = __VLS_157.slots;
{
    const { default: __VLS_160 } = __VLS_157.slots;
    const [scope] = __VLS_vSlot(__VLS_160);
    let __VLS_161;
    /** @ts-ignore @type {typeof __VLS_components.elRate | typeof __VLS_components.ElRate} */
    elRate;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
        modelValue: (scope.row.ratingScore),
        disabled: true,
        colors: (['#99A9BF', '#F7BA2A', '#FF9900']),
        max: (5),
        ...{ style: {} },
    }));
    const __VLS_163 = __VLS_162({
        modelValue: (scope.row.ratingScore),
        disabled: true,
        colors: (['#99A9BF', '#F7BA2A', '#FF9900']),
        max: (5),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ style: {} },
    });
    (scope.row.ratingScore ? scope.row.ratingScore.toFixed(1) : '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_157;
let __VLS_166;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent1(__VLS_166, new __VLS_166({
    label: "抽成比例",
    width: "110",
}));
const __VLS_168 = __VLS_167({
    label: "抽成比例",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_167));
const { default: __VLS_171 } = __VLS_169.slots;
{
    const { default: __VLS_172 } = __VLS_169.slots;
    const [scope] = __VLS_vSlot(__VLS_172);
    let __VLS_173;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
        type: (__VLS_ctx.getCommissionTagType(scope.row.commissionRate)),
        size: "small",
    }));
    const __VLS_175 = __VLS_174({
        type: (__VLS_ctx.getCommissionTagType(scope.row.commissionRate)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    const { default: __VLS_178 } = __VLS_176.slots;
    (__VLS_ctx.formatRate(scope.row.commissionRate));
    // @ts-ignore
    [getCommissionTagType, formatRate,];
    var __VLS_176;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_169;
let __VLS_179;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
    label: "抽成金额",
    width: "120",
}));
const __VLS_181 = __VLS_180({
    label: "抽成金额",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
const { default: __VLS_184 } = __VLS_182.slots;
{
    const { default: __VLS_185 } = __VLS_182.slots;
    const [scope] = __VLS_vSlot(__VLS_185);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "commission" },
    });
    /** @type {__VLS_StyleScopedClasses['commission']} */ ;
    (scope.row.commissionAmount || 0);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_182;
let __VLS_186;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({
    prop: "createTime",
    label: "生成时间",
    minWidth: "160",
}));
const __VLS_188 = __VLS_187({
    prop: "createTime",
    label: "生成时间",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
const { default: __VLS_191 } = __VLS_189.slots;
{
    const { default: __VLS_192 } = __VLS_189.slots;
    const [scope] = __VLS_vSlot(__VLS_192);
    (__VLS_ctx.formatDateTime(scope.row.createTime));
    // @ts-ignore
    [formatDateTime,];
}
// @ts-ignore
[];
var __VLS_189;
// @ts-ignore
[];
var __VLS_108;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
let __VLS_193;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.pagination.page),
    pageSize: (__VLS_ctx.pagination.size),
    total: (__VLS_ctx.pagination.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_195 = __VLS_194({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.pagination.page),
    pageSize: (__VLS_ctx.pagination.size),
    total: (__VLS_ctx.pagination.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
let __VLS_198;
const __VLS_199 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.handleSizeChange) });
const __VLS_200 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.handlePageChange) });
var __VLS_196;
var __VLS_197;
// @ts-ignore
[pagination, pagination, pagination, handleSizeChange, handlePageChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
