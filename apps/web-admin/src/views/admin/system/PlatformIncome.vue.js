/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { View, InfoFilled, Refresh } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getPlatformIncomeStats, getPlatformIncomeTrend } from '@/api/admin/platformIncome.ts';
const router = useRouter();
// 日期范围
const dateRange = ref(null);
// 统计数据
const statsData = reactive({
    totalPlatformCommission: 0,
    monthCommission: 0,
    consultation: { totalFee: 0, platformCommission: 0, orderCount: 0 },
    member: { totalFee: 0, platformCommission: 0, orderCount: 0 }
});
// 当前选中模块
const activeModule = ref('consultation');
// 收入模块配置
const incomeModules = ref([
    {
        key: 'consultation',
        name: '心理咨询',
        icon: 'User',
        color: 'linear-gradient(135deg, #11998e, #38ef7d)',
        commission: 0,
        orderCount: 0
    },
    {
        key: 'member',
        name: '会员收入',
        icon: 'UserFilled',
        color: 'linear-gradient(135deg, #667eea, #764ba2)',
        commission: 0,
        orderCount: 0
    }
]);
// 图表
const trendChartRef = ref(null);
const pieChartRef = ref(null);
let trendChart = null;
let pieChart = null;
// 格式化数字
const formatNumber = (num) => {
    if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万';
    }
    return num.toFixed(2);
};
// 获取统计数据
const fetchStats = async () => {
    try {
        const params = {};
        if (dateRange.value) {
            params.startDate = dateRange.value[0];
            params.endDate = dateRange.value[1];
        }
        const res = await getPlatformIncomeStats(params);
        if (res.code === 200) {
            const data = res.data || {};
            statsData.totalPlatformCommission = data.totalPlatformCommission || 0;
            statsData.monthCommission = data.monthCommission || 0;
            const consult = data.consultation || {};
            statsData.consultation = {
                totalFee: consult.totalFee || 0,
                platformCommission: consult.platformCommission || 0,
                orderCount: consult.orderCount || 0
            };
            const member = data.member || {};
            statsData.member = {
                totalFee: member.totalFee || 0,
                platformCommission: member.platformCommission || 0,
                orderCount: member.orderCount || 0
            };
            // 更新模块数据
            const [consultationModule, memberModule] = incomeModules.value;
            if (consultationModule) {
                consultationModule.commission = consult.platformCommission || 0;
                consultationModule.orderCount = consult.orderCount || 0;
            }
            if (memberModule) {
                memberModule.commission = member.platformCommission || 0;
                memberModule.orderCount = member.orderCount || 0;
            }
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取统计数据失败');
    }
};
// 获取趋势数据
const fetchTrend = async () => {
    try {
        // 默认最近30天
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        const startStr = dateRange.value?.[0] || start.toISOString().slice(0, 10);
        const endStr = dateRange.value?.[1] || end.toISOString().slice(0, 10);
        const res = await getPlatformIncomeTrend({
            startDate: startStr,
            endDate: endStr,
            module: activeModule.value === 'consultation' ? 'CONSULTATION' : undefined
        });
        if (res.code === 200) {
            updateCharts(res.data);
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取趋势数据失败');
    }
};
// 更新图表
const updateCharts = (data) => {
    nextTick(() => {
        // 趋势图
        if (trendChart)
            trendChart.dispose();
        if (trendChartRef.value) {
            trendChart = echarts.init(trendChartRef.value);
            trendChart.setOption({
                tooltip: { trigger: 'axis' },
                legend: {
                    data: ['平台抽成', '咨询流水'],
                    textStyle: { color: '#666' }
                },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: data.dates || []
                },
                yAxis: {
                    type: 'value',
                    axisLabel: { formatter: '¥{value}' }
                },
                series: [
                    {
                        name: '平台抽成',
                        type: 'line',
                        smooth: true,
                        data: data.commissionData || [],
                        areaStyle: { color: 'rgba(64,158,255,0.1)' },
                        itemStyle: { color: '#409eff' }
                    },
                    {
                        name: '咨询流水',
                        type: 'line',
                        smooth: true,
                        data: data.consultationData || [],
                        areaStyle: { color: 'rgba(103,194,58,0.1)' },
                        itemStyle: { color: '#67c23a' }
                    }
                ]
            });
        }
        // 饼图
        if (pieChart)
            pieChart.dispose();
        if (pieChartRef.value) {
            pieChart = echarts.init(pieChartRef.value);
            const consultCommission = statsData.consultation.platformCommission || 0;
            const memberCommission = statsData.member.platformCommission || 0;
            pieChart.setOption({
                tooltip: { trigger: 'item', formatter: '¥{c} ({d}%)' },
                legend: { orient: 'vertical', left: 'left', textStyle: { color: '#666' } },
                series: [{
                        type: 'pie',
                        radius: ['40%', '70%'],
                        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
                        label: { show: true, formatter: '¥{c}' },
                        data: [
                            { value: consultCommission, name: '心理咨询', itemStyle: { color: '#38ef7d' } },
                            { value: memberCommission, name: '会员收入', itemStyle: { color: '#764ba2' } }
                        ]
                    }]
            });
        }
    });
};
// 切换模块
const switchModule = (key) => {
    activeModule.value = key;
    fetchStats();
    fetchTrend();
};
// 日期变化
const handleDateChange = () => {
    fetchStats();
    fetchTrend();
};
// 重置日期
const resetDate = () => {
    dateRange.value = null;
    fetchStats();
    fetchTrend();
};
// 跳转明细
const goToDetail = () => {
    router.push({ name: 'ConsultationIncomeDetail' });
};
// 抽成规则说明
const showCommissionRule = () => {
    ElMessage.info('评分0-1.5分：平台抽成60%  |  评分1.5-3分：平台抽成45%  |  评分3-4.5分：平台抽成30%  |  评分4.5-5分：平台抽成15%');
};
// 窗口调整
const handleResize = () => {
    trendChart?.resize();
    pieChart?.resize();
};
onMounted(() => {
    fetchStats();
    fetchTrend();
    window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    trendChart?.dispose();
    pieChart?.dispose();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['total-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "platform-income-page" },
});
/** @type {__VLS_StyleScopedClasses['platform-income-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-right" },
});
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    valueFormat: "YYYY-MM-DD",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: (__VLS_ctx.handleDateChange) });
var __VLS_3;
var __VLS_4;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_9 = __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = ({ click: {} },
    { onClick: (__VLS_ctx.resetDate) });
const { default: __VLS_14 } = __VLS_10.slots;
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({}));
const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_20 } = __VLS_18.slots;
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.Refresh} */
Refresh;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({}));
const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
// @ts-ignore
[dateRange, handleDateChange, resetDate,];
var __VLS_18;
// @ts-ignore
[];
var __VLS_10;
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "income-modules" },
});
/** @type {__VLS_StyleScopedClasses['income-modules']} */ ;
for (const [mod] of __VLS_vFor((__VLS_ctx.incomeModules))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.switchModule(mod.key);
                // @ts-ignore
                [incomeModules, switchModule,];
            } },
        key: (mod.key),
        ...{ class: "module-card" },
        ...{ class: ({ active: __VLS_ctx.activeModule === mod.key }) },
    });
    /** @type {__VLS_StyleScopedClasses['module-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "module-icon" },
        ...{ style: ({ background: mod.color }) },
    });
    /** @type {__VLS_StyleScopedClasses['module-icon']} */ ;
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
    const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const { default: __VLS_31 } = __VLS_29.slots;
    const __VLS_32 = (mod.icon);
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    // @ts-ignore
    [activeModule,];
    var __VLS_29;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "module-info" },
    });
    /** @type {__VLS_StyleScopedClasses['module-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "module-name" },
    });
    /** @type {__VLS_StyleScopedClasses['module-name']} */ ;
    (mod.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "module-amount" },
    });
    /** @type {__VLS_StyleScopedClasses['module-amount']} */ ;
    (__VLS_ctx.formatNumber(mod.commission));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "module-sub" },
    });
    /** @type {__VLS_StyleScopedClasses['module-sub']} */ ;
    (mod.orderCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "module-tag" },
    });
    /** @type {__VLS_StyleScopedClasses['module-tag']} */ ;
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        size: "small",
        type: (mod.key === 'consultation' ? 'success' : 'info'),
    }));
    const __VLS_39 = __VLS_38({
        size: "small",
        type: (mod.key === 'consultation' ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const { default: __VLS_42 } = __VLS_40.slots;
    (mod.key === 'consultation' ? '已上线' : '预留');
    // @ts-ignore
    [formatNumber,];
    var __VLS_40;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "module-card total-card" },
});
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['total-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "total-content" },
});
/** @type {__VLS_StyleScopedClasses['total-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "total-label" },
});
/** @type {__VLS_StyleScopedClasses['total-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "total-amount" },
});
/** @type {__VLS_StyleScopedClasses['total-amount']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.statsData.totalPlatformCommission || 0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "total-sub" },
});
/** @type {__VLS_StyleScopedClasses['total-sub']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.statsData.monthCommission || 0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "charts-section" },
});
/** @type {__VLS_StyleScopedClasses['charts-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-card trend-chart" },
});
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-header" },
});
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-legend" },
});
/** @type {__VLS_StyleScopedClasses['chart-legend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-body" },
});
/** @type {__VLS_StyleScopedClasses['chart-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "trendChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-card pie-chart" },
});
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pie-chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-header" },
});
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-body" },
});
/** @type {__VLS_StyleScopedClasses['chart-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "pieChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
if (__VLS_ctx.activeModule === 'consultation') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "quick-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['quick-actions']} */ ;
    let __VLS_43;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_48;
    const __VLS_49 = ({ click: {} },
        { onClick: (__VLS_ctx.goToDetail) });
    const { default: __VLS_50 } = __VLS_46.slots;
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({}));
    const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
    const { default: __VLS_56 } = __VLS_54.slots;
    let __VLS_57;
    /** @ts-ignore @type {typeof __VLS_components.View} */
    View;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({}));
    const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
    // @ts-ignore
    [activeModule, formatNumber, formatNumber, statsData, statsData, goToDetail,];
    var __VLS_54;
    // @ts-ignore
    [];
    var __VLS_46;
    var __VLS_47;
    let __VLS_62;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        ...{ 'onClick': {} },
        type: "info",
        plain: true,
    }));
    const __VLS_64 = __VLS_63({
        ...{ 'onClick': {} },
        type: "info",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    let __VLS_67;
    const __VLS_68 = ({ click: {} },
        { onClick: (__VLS_ctx.showCommissionRule) });
    const { default: __VLS_69 } = __VLS_65.slots;
    let __VLS_70;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({}));
    const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const { default: __VLS_75 } = __VLS_73.slots;
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.InfoFilled} */
    InfoFilled;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
    // @ts-ignore
    [showCommissionRule,];
    var __VLS_73;
    // @ts-ignore
    [];
    var __VLS_65;
    var __VLS_66;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
