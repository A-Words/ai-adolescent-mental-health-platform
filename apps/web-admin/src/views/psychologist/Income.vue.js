/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Wallet, Coin, Clock, Star } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getMyIncomeStats, getMyIncomeList, getMyBalance, applyWithdraw, getIncomeTrend } from '@/api/psychologistAdminPage';
const chartRef = ref(null);
const chartInstance = ref(null);
const loading = ref(false);
const chartLoading = ref(false);
const submitting = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const incomeRecords = ref([]);
const trendDays = ref(7);
const trendData = ref([]);
const trendTabs = [
    { label: '近7天', value: 7 },
    { label: '近15天', value: 15 },
    { label: '近30天', value: 30 }
];
const statsData = reactive({
    totalIncome: 0,
    totalWithdraw: 0,
    availableBalance: 0,
    frozenAmount: 0,
    monthIncome: 0,
    pendingBalance: 0,
    totalOrders: 0,
    averageRating: 0
});
const withdrawDialogVisible = ref(false);
const withdrawFormRef = ref();
const withdrawForm = reactive({
    amount: 100,
    withdrawType: 'alipay'
});
const withdrawRules = {
    amount: [
        { required: true, message: '请输入提现金额', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value < 10) {
                    callback(new Error('最低提现10元'));
                }
                else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    withdrawType: [
        { required: true, message: '请选择收款方式', trigger: 'change' }
    ]
};
// 获取收入统计数据
const fetchStats = async () => {
    try {
        const res = await getMyIncomeStats();
        if (res.code === 200 && res.data) {
            const data = res.data;
            statsData.totalIncome = data.totalIncome || 0;
            statsData.totalWithdraw = data.totalWithdraw || 0;
            statsData.availableBalance = data.availableBalance || 0;
            statsData.monthIncome = data.monthIncome || 0;
            statsData.pendingBalance = data.pendingBalance || 0;
            statsData.totalOrders = data.totalOrders || 0;
            statsData.averageRating = data.averageRating || 0;
        }
    }
    catch (e) {
        console.error('获取收入统计失败', e);
    }
};
// 获取余额信息
const fetchBalance = async () => {
    try {
        const res = await getMyBalance();
        if (res.code === 200 && res.data) {
            const data = res.data;
            statsData.availableBalance = data.balance || 0;
            statsData.frozenAmount = data.frozenAmount || 0;
        }
    }
    catch (e) {
        console.error('获取余额失败', e);
    }
};
// 获取收入记录
const fetchIncomeRecords = () => {
    loading.value = true;
    getMyIncomeList({ page: currentPage.value, size: pageSize.value }).then((res) => {
        if (res.code === 200) {
            incomeRecords.value = res.data?.records || [];
            total.value = res.data?.total || 0;
        }
        else {
            ElMessage.error(res.message || '获取收入记录失败');
        }
        loading.value = false;
    }).catch(() => {
        loading.value = false;
    });
};
// 获取收入趋势
const fetchTrend = () => {
    chartLoading.value = true;
    getIncomeTrend({ days: trendDays.value }).then((res) => {
        if (res.code === 200) {
            trendData.value = res.data || [];
            nextTick(() => {
                initChart();
            });
        }
        chartLoading.value = false;
    }).catch(() => {
        chartLoading.value = false;
    });
};
// 切换趋势时间范围
const changeTrendDays = (days) => {
    trendDays.value = days;
    fetchTrend();
};
// 格式化日期时间
const formatDateTime = (dateStr) => {
    if (!dateStr)
        return '-';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
// 初始化图表
const initChart = () => {
    if (!chartRef.value)
        return;
    if (chartInstance.value) {
        chartInstance.value.dispose();
    }
    chartInstance.value = echarts.init(chartRef.value);
    const dates = trendData.value.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const incomes = trendData.value.map(item => item.income || 0);
    const counts = trendData.value.map(item => item.count || 0);
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e4e7ed',
            borderWidth: 1,
            textStyle: { color: '#303133' },
            formatter: (params) => {
                let result = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`;
                params.forEach((item) => {
                    result += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color};"></span>
            <span>${item.seriesName}: <strong>${item.value}${item.seriesIndex === 0 ? '元' : '单'}</strong></span>
          </div>`;
                });
                return result;
            }
        },
        legend: {
            data: ['日收入', '日订单数'],
            bottom: 0,
            textStyle: { color: '#606266' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: '#dcdfe6' } },
            axisLabel: { color: '#606266' }
        },
        yAxis: [
            {
                type: 'value',
                name: '收入(元)',
                axisLine: { show: true, lineStyle: { color: '#409EFF' } },
                axisLabel: { color: '#606266', formatter: '{value}' },
                splitLine: { lineStyle: { color: '#ebeef5' } }
            },
            {
                type: 'value',
                name: '订单数',
                axisLine: { show: true, lineStyle: { color: '#67C23A' } },
                axisLabel: { color: '#606266', formatter: '{value}' },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: '日收入',
                type: 'bar',
                data: incomes,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#409EFF' },
                        { offset: 1, color: '#79BBFF' }
                    ]),
                    borderRadius: [4, 4, 0, 0]
                },
                barWidth: '40%'
            },
            {
                name: '日订单数',
                type: 'line',
                yAxisIndex: 1,
                data: counts,
                smooth: true,
                lineStyle: { color: '#67C23A', width: 2 },
                itemStyle: { color: '#67C23A' },
                symbol: 'circle',
                symbolSize: 6
            }
        ]
    };
    chartInstance.value.setOption(option);
};
// 窗口调整时重绘图表
const handleResize = () => {
    chartInstance.value?.resize();
};
// 显示提现对话框
const showWithdrawDialog = () => {
    withdrawForm.amount = Math.min(100, statsData.availableBalance);
    withdrawDialogVisible.value = true;
};
// 提交提现
const submitWithdraw = async () => {
    if (!withdrawFormRef.value)
        return;
    await withdrawFormRef.value.validate(async (valid) => {
        if (valid) {
            if (withdrawForm.amount < 10) {
                ElMessage.warning('提现金额不能少于10元');
                return;
            }
            submitting.value = true;
            try {
                const res = await applyWithdraw(withdrawForm.amount);
                if (res.code === 200) {
                    ElMessage.success('提现申请已提交');
                    withdrawDialogVisible.value = false;
                    fetchStats();
                    fetchBalance();
                }
                else {
                    ElMessage.error(res.message || '提现申请失败');
                }
            }
            catch (e) {
                ElMessage.error(e.message || '提现申请失败');
            }
            finally {
                submitting.value = false;
            }
        }
    });
};
onMounted(() => {
    fetchStats();
    fetchBalance();
    fetchIncomeRecords();
    fetchTrend();
    nextTick(() => {
        window.addEventListener('resize', handleResize);
    });
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    chartInstance.value?.dispose();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['withdraw-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['withdraw-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['withdraw-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['income-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['income-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['month-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['psychologist-income-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-income-container" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-income-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "income-stats" },
});
/** @type {__VLS_StyleScopedClasses['income-stats']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card highlight" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon gold" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['gold']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    size: "32",
}));
const __VLS_2 = __VLS_1({
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Wallet} */
Wallet;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statsData.availableBalance);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "withdraw-btn" },
    disabled: (__VLS_ctx.statsData.availableBalance <= 0),
}));
const __VLS_13 = __VLS_12({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "withdraw-btn" },
    disabled: (__VLS_ctx.statsData.availableBalance <= 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_16;
const __VLS_17 = ({ click: {} },
    { onClick: (__VLS_ctx.showWithdrawDialog) });
/** @type {__VLS_StyleScopedClasses['withdraw-btn']} */ ;
const { default: __VLS_18 } = __VLS_14.slots;
// @ts-ignore
[statsData, statsData, showWithdrawDialog,];
var __VLS_14;
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon blue" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['blue']} */ ;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    size: "32",
}));
const __VLS_21 = __VLS_20({
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.Coin} */
Coin;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
// @ts-ignore
[];
var __VLS_22;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statsData.totalIncome || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon orange" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['orange']} */ ;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    size: "32",
}));
const __VLS_32 = __VLS_31({
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const { default: __VLS_35 } = __VLS_33.slots;
let __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.Clock} */
Clock;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
// @ts-ignore
[statsData,];
var __VLS_33;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statsData.pendingBalance || 0);
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
let __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    size: "32",
}));
const __VLS_43 = __VLS_42({
    size: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
const { default: __VLS_46 } = __VLS_44.slots;
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.Star} */
Star;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({}));
const __VLS_49 = __VLS_48({}, ...__VLS_functionalComponentArgsRest(__VLS_48));
// @ts-ignore
[statsData,];
var __VLS_44;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statsData.averageRating || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "month-overview" },
});
/** @type {__VLS_StyleScopedClasses['month-overview']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "month-stat" },
});
/** @type {__VLS_StyleScopedClasses['month-stat']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "month-label" },
});
/** @type {__VLS_StyleScopedClasses['month-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "month-value" },
});
/** @type {__VLS_StyleScopedClasses['month-value']} */ ;
(__VLS_ctx.statsData.monthIncome || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "month-stat" },
});
/** @type {__VLS_StyleScopedClasses['month-stat']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "month-label" },
});
/** @type {__VLS_StyleScopedClasses['month-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "month-value" },
});
/** @type {__VLS_StyleScopedClasses['month-value']} */ ;
(__VLS_ctx.statsData.totalOrders || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "month-stat" },
});
/** @type {__VLS_StyleScopedClasses['month-stat']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "month-label" },
});
/** @type {__VLS_StyleScopedClasses['month-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "month-value" },
});
/** @type {__VLS_StyleScopedClasses['month-value']} */ ;
(__VLS_ctx.statsData.totalWithdraw || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "income-chart-section" },
});
/** @type {__VLS_StyleScopedClasses['income-chart-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-header" },
});
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "trend-tabs" },
});
/** @type {__VLS_StyleScopedClasses['trend-tabs']} */ ;
for (const [item] of __VLS_vFor((__VLS_ctx.trendTabs))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.changeTrendDays(item.value);
                // @ts-ignore
                [statsData, statsData, statsData, statsData, trendTabs, changeTrendDays,];
            } },
        key: (item.value),
        ...{ class: (['trend-tab', { active: __VLS_ctx.trendDays === item.value }]) },
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['trend-tab']} */ ;
    (item.label);
    // @ts-ignore
    [trendDays,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "chartRef",
    ...{ class: "chart" },
});
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
if (__VLS_ctx.trendData.length === 0 && !__VLS_ctx.chartLoading) {
    let __VLS_52;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        description: "暂无收入数据",
        imageSize: (60),
    }));
    const __VLS_54 = __VLS_53({
        description: "暂无收入数据",
        imageSize: (60),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "income-records" },
});
/** @type {__VLS_StyleScopedClasses['income-records']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-header" },
});
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    data: (__VLS_ctx.incomeRecords),
    stripe: true,
}));
const __VLS_59 = __VLS_58({
    data: (__VLS_ctx.incomeRecords),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_62 } = __VLS_60.slots;
let __VLS_63;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
    prop: "createTime",
    label: "时间",
    width: "180",
}));
const __VLS_65 = __VLS_64({
    prop: "createTime",
    label: "时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
const { default: __VLS_68 } = __VLS_66.slots;
{
    const { default: __VLS_69 } = __VLS_66.slots;
    const [{ row }] = __VLS_vSlot(__VLS_69);
    (__VLS_ctx.formatDateTime(row.createTime));
    // @ts-ignore
    [trendData, chartLoading, incomeRecords, vLoading, loading, formatDateTime,];
}
// @ts-ignore
[];
var __VLS_66;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    prop: "orderFee",
    label: "订单金额",
    width: "120",
}));
const __VLS_72 = __VLS_71({
    prop: "orderFee",
    label: "订单金额",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
{
    const { default: __VLS_76 } = __VLS_73.slots;
    const [{ row }] = __VLS_vSlot(__VLS_76);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "amount" },
    });
    /** @type {__VLS_StyleScopedClasses['amount']} */ ;
    (row.orderFee);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_73;
let __VLS_77;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
    prop: "commissionAmount",
    label: "平台抽成",
    width: "120",
}));
const __VLS_79 = __VLS_78({
    prop: "commissionAmount",
    label: "平台抽成",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
const { default: __VLS_82 } = __VLS_80.slots;
{
    const { default: __VLS_83 } = __VLS_80.slots;
    const [{ row }] = __VLS_vSlot(__VLS_83);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "fee" },
    });
    /** @type {__VLS_StyleScopedClasses['fee']} */ ;
    (row.commissionAmount);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_80;
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    prop: "incomeAmount",
    label: "我的收入",
    width: "120",
}));
const __VLS_86 = __VLS_85({
    prop: "incomeAmount",
    label: "我的收入",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const { default: __VLS_89 } = __VLS_87.slots;
{
    const { default: __VLS_90 } = __VLS_87.slots;
    const [{ row }] = __VLS_vSlot(__VLS_90);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "income" },
    });
    /** @type {__VLS_StyleScopedClasses['income']} */ ;
    (row.incomeAmount);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_87;
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    prop: "commissionRate",
    label: "抽成比例",
    width: "100",
}));
const __VLS_93 = __VLS_92({
    prop: "commissionRate",
    label: "抽成比例",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
const { default: __VLS_96 } = __VLS_94.slots;
{
    const { default: __VLS_97 } = __VLS_94.slots;
    const [{ row }] = __VLS_vSlot(__VLS_97);
    (((row.commissionRate || 0) * 100).toFixed(0));
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_94;
let __VLS_98;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
    prop: "ratingScore",
    label: "用户评分",
    width: "100",
}));
const __VLS_100 = __VLS_99({
    prop: "ratingScore",
    label: "用户评分",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
const { default: __VLS_103 } = __VLS_101.slots;
{
    const { default: __VLS_104 } = __VLS_101.slots;
    const [{ row }] = __VLS_vSlot(__VLS_104);
    if (row.ratingScore) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (row.ratingScore);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "gray" },
        });
        /** @type {__VLS_StyleScopedClasses['gray']} */ ;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_101;
// @ts-ignore
[];
var __VLS_60;
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
    let __VLS_105;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next, jumper",
    }));
    const __VLS_107 = __VLS_106({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next, jumper",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_110;
    const __VLS_111 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.fetchIncomeRecords) });
    var __VLS_108;
    var __VLS_109;
}
let __VLS_112;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.withdrawDialogVisible),
    title: "申请提现",
    width: "500px",
    ...{ class: "withdraw-dialog" },
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.withdrawDialogVisible),
    title: "申请提现",
    width: "500px",
    ...{ class: "withdraw-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
/** @type {__VLS_StyleScopedClasses['withdraw-dialog']} */ ;
const { default: __VLS_117 } = __VLS_115.slots;
let __VLS_118;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
    model: (__VLS_ctx.withdrawForm),
    rules: (__VLS_ctx.withdrawRules),
    ref: "withdrawFormRef",
    labelWidth: "100px",
}));
const __VLS_120 = __VLS_119({
    model: (__VLS_ctx.withdrawForm),
    rules: (__VLS_ctx.withdrawRules),
    ref: "withdrawFormRef",
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
var __VLS_123 = {};
const { default: __VLS_125 } = __VLS_121.slots;
let __VLS_126;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
    label: "可提现金额",
}));
const __VLS_128 = __VLS_127({
    label: "可提现金额",
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
const { default: __VLS_131 } = __VLS_129.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "available-amount" },
});
/** @type {__VLS_StyleScopedClasses['available-amount']} */ ;
(__VLS_ctx.statsData.availableBalance);
// @ts-ignore
[statsData, total, total, currentPage, pageSize, fetchIncomeRecords, withdrawDialogVisible, withdrawForm, withdrawRules,];
var __VLS_129;
let __VLS_132;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
    label: "提现金额",
    prop: "amount",
}));
const __VLS_134 = __VLS_133({
    label: "提现金额",
    prop: "amount",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
const { default: __VLS_137 } = __VLS_135.slots;
let __VLS_138;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
    modelValue: (__VLS_ctx.withdrawForm.amount),
    min: (10),
    max: (__VLS_ctx.statsData.availableBalance),
    step: (10),
    precision: (0),
    ...{ style: {} },
}));
const __VLS_140 = __VLS_139({
    modelValue: (__VLS_ctx.withdrawForm.amount),
    min: (10),
    max: (__VLS_ctx.statsData.availableBalance),
    step: (10),
    precision: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "withdraw-tip" },
});
/** @type {__VLS_StyleScopedClasses['withdraw-tip']} */ ;
// @ts-ignore
[statsData, withdrawForm,];
var __VLS_135;
let __VLS_143;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    label: "收款方式",
    prop: "withdrawType",
}));
const __VLS_145 = __VLS_144({
    label: "收款方式",
    prop: "withdrawType",
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
const { default: __VLS_148 } = __VLS_146.slots;
let __VLS_149;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
    modelValue: (__VLS_ctx.withdrawForm.withdrawType),
}));
const __VLS_151 = __VLS_150({
    modelValue: (__VLS_ctx.withdrawForm.withdrawType),
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
const { default: __VLS_154 } = __VLS_152.slots;
let __VLS_155;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
    label: "alipay",
}));
const __VLS_157 = __VLS_156({
    label: "alipay",
}, ...__VLS_functionalComponentArgsRest(__VLS_156));
const { default: __VLS_160 } = __VLS_158.slots;
// @ts-ignore
[withdrawForm,];
var __VLS_158;
let __VLS_161;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    label: "wechat",
}));
const __VLS_163 = __VLS_162({
    label: "wechat",
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
const { default: __VLS_166 } = __VLS_164.slots;
// @ts-ignore
[];
var __VLS_164;
let __VLS_167;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({
    label: "bank",
}));
const __VLS_169 = __VLS_168({
    label: "bank",
}, ...__VLS_functionalComponentArgsRest(__VLS_168));
const { default: __VLS_172 } = __VLS_170.slots;
// @ts-ignore
[];
var __VLS_170;
// @ts-ignore
[];
var __VLS_152;
// @ts-ignore
[];
var __VLS_146;
// @ts-ignore
[];
var __VLS_121;
{
    const { footer: __VLS_173 } = __VLS_115.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_174;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
        ...{ 'onClick': {} },
    }));
    const __VLS_176 = __VLS_175({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    let __VLS_179;
    const __VLS_180 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.withdrawDialogVisible = false;
                // @ts-ignore
                [withdrawDialogVisible,];
            } });
    const { default: __VLS_181 } = __VLS_177.slots;
    // @ts-ignore
    [];
    var __VLS_177;
    var __VLS_178;
    let __VLS_182;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent1(__VLS_182, new __VLS_182({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_184 = __VLS_183({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    let __VLS_187;
    const __VLS_188 = ({ click: {} },
        { onClick: (__VLS_ctx.submitWithdraw) });
    const { default: __VLS_189 } = __VLS_185.slots;
    // @ts-ignore
    [submitting, submitWithdraw,];
    var __VLS_185;
    var __VLS_186;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_115;
// @ts-ignore
var __VLS_124 = __VLS_123;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
