/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getDoctorOverview } from '@/api/stats';
import { User, Calendar, Money, Star, Clock, CircleCheck, Finished, Warning, Document } from '@element-plus/icons-vue';
const stats = reactive({});
const currentTime = ref('');
const currentDate = ref('');
const appointmentTrendChart = ref();
const appointmentStatusChart = ref();
const satisfactionChart = ref();
let chartInstances = [];
let timeInterval = null;
const formatNumber = (num) => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w';
    }
    return num.toLocaleString();
};
const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
};
const getStatusName = (status) => {
    const statusMap = { 0: '待就诊', 1: '已完成', 2: '已取消', 3: '爽约' };
    return statusMap[status] || '未知';
};
const calcGoodRate = () => {
    if (!stats.totalRatings || stats.totalRatings === 0)
        return 0;
    return ((stats.goodRatingCount || 0) / stats.totalRatings * 100).toFixed(0);
};
const getRatingCount = (rating) => {
    const data = stats.satisfactionDistribution || [];
    const item = data.find((d) => d.rating === rating);
    return item ? item.count : 0;
};
const calcRatingPercent = (rating) => {
    if (!stats.totalRatings || stats.totalRatings === 0)
        return 0;
    return (getRatingCount(rating) / stats.totalRatings * 100);
};
const initAppointmentTrendChart = () => {
    if (!appointmentTrendChart.value)
        return;
    const chart = echarts.init(appointmentTrendChart.value);
    const data = stats.appointmentTrend || [];
    const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.map((d) => d.day),
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399', rotate: 30 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399' },
            splitLine: { lineStyle: { color: '#E8E8E8' } }
        },
        series: [{
                name: '预约量',
                type: 'line',
                smooth: true,
                data: data.map((d) => d.count),
                lineStyle: { color: '#8B5CF6', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
                        { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
                    ])
                },
                itemStyle: { color: '#8B5CF6' }
            }]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initAppointmentStatusChart = () => {
    if (!appointmentStatusChart.value)
        return;
    const chart = echarts.init(appointmentStatusChart.value);
    const statusData = [
        { status: 0, count: stats.pendingAppointments || 0 },
        { status: 1, count: stats.completedAppointments || 0 },
        { status: 2, count: stats.cancelledAppointments || 0 },
        { status: 3, count: stats.noShowAppointments || 0 }
    ];
    const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        color: ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
        series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 8, borderColor: '#F5F7FA', borderWidth: 2 },
                label: { show: true, color: '#D1D5DB', formatter: '{b}\n{c}次' },
                data: statusData.map(d => ({ name: getStatusName(d.status), value: d.count }))
            }]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initSatisfactionChart = () => {
    if (!satisfactionChart.value)
        return;
    const chart = echarts.init(satisfactionChart.value);
    const data = stats.satisfactionDistribution || [];
    const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: ['1星', '2星', '3星', '4星', '5星'],
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399' }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399' },
            splitLine: { lineStyle: { color: '#E8E8E8' } }
        },
        series: [{
                name: '评价数',
                type: 'bar',
                data: [1, 2, 3, 4, 5].map(rating => {
                    const item = data.find((d) => d.rating === rating);
                    return item ? item.count : 0;
                }),
                itemStyle: {
                    color: (params) => {
                        const colors = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981'];
                        return colors[params.dataIndex];
                    },
                    borderRadius: [4, 4, 0, 0]
                }
            }]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initAllCharts = async () => {
    await nextTick();
    chartInstances.forEach(chart => chart.dispose());
    chartInstances = [];
    initAppointmentTrendChart();
    initAppointmentStatusChart();
    initSatisfactionChart();
};
const fetchData = async () => {
    try {
        const res = await getDoctorOverview();
        if (res.code === 200) {
            Object.assign(stats, res.data || {});
            await initAllCharts();
        }
    }
    catch (error) {
        console.error('获取统计数据失败:', error);
    }
};
const handleResize = () => {
    chartInstances.forEach(chart => chart.resize());
};
onMounted(() => {
    updateTime();
    timeInterval = setInterval(updateTime, 1000);
    fetchData();
    window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
    if (timeInterval)
        clearInterval(timeInterval);
    window.removeEventListener('resize', handleResize);
    chartInstances.forEach(chart => chart.dispose());
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['blue']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['purple']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['rating-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dashboard" },
});
/** @type {__VLS_StyleScopedClasses['dashboard']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dashboard-header" },
});
/** @type {__VLS_StyleScopedClasses['dashboard-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-left" },
});
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-time" },
});
/** @type {__VLS_StyleScopedClasses['header-time']} */ ;
(__VLS_ctx.currentTime);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-title" },
});
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
(__VLS_ctx.stats.doctorName || '医生');
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "subtitle" },
});
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
(__VLS_ctx.stats.hospitalName || '');
(__VLS_ctx.stats.departmentName || '');
(__VLS_ctx.stats.title || '');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-right" },
});
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "date-info" },
});
/** @type {__VLS_StyleScopedClasses['date-info']} */ ;
(__VLS_ctx.currentDate);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "today-overview" },
});
/** @type {__VLS_StyleScopedClasses['today-overview']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-item" },
});
/** @type {__VLS_StyleScopedClasses['overview-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-icon blue" },
});
/** @type {__VLS_StyleScopedClasses['overview-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['blue']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Calendar} */
Calendar;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
// @ts-ignore
[currentTime, stats, stats, stats, stats, currentDate,];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-content" },
});
/** @type {__VLS_StyleScopedClasses['overview-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-value" },
});
/** @type {__VLS_StyleScopedClasses['overview-value']} */ ;
(__VLS_ctx.stats.todayAppointments || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-label" },
});
/** @type {__VLS_StyleScopedClasses['overview-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-item" },
});
/** @type {__VLS_StyleScopedClasses['overview-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-icon green" },
});
/** @type {__VLS_StyleScopedClasses['overview-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const { default: __VLS_16 } = __VLS_14.slots;
let __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
CircleCheck;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
// @ts-ignore
[stats,];
var __VLS_14;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-content" },
});
/** @type {__VLS_StyleScopedClasses['overview-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-value" },
});
/** @type {__VLS_StyleScopedClasses['overview-value']} */ ;
(__VLS_ctx.stats.todayCompleted || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-label" },
});
/** @type {__VLS_StyleScopedClasses['overview-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-item" },
});
/** @type {__VLS_StyleScopedClasses['overview-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-icon purple" },
});
/** @type {__VLS_StyleScopedClasses['overview-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['purple']} */ ;
let __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({}));
const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
const { default: __VLS_27 } = __VLS_25.slots;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.Clock} */
Clock;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
// @ts-ignore
[stats,];
var __VLS_25;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-content" },
});
/** @type {__VLS_StyleScopedClasses['overview-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-value" },
});
/** @type {__VLS_StyleScopedClasses['overview-value']} */ ;
(__VLS_ctx.stats.tomorrowAppointments || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overview-label" },
});
/** @type {__VLS_StyleScopedClasses['overview-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-cards" },
});
/** @type {__VLS_StyleScopedClasses['stats-cards']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon blue" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['blue']} */ ;
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({}));
const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const { default: __VLS_38 } = __VLS_36.slots;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.User} */
User;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({}));
const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
// @ts-ignore
[stats,];
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.totalPatients || 0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-trend" },
});
/** @type {__VLS_StyleScopedClasses['stat-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-tag" },
});
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
(__VLS_ctx.stats.monthlyPatients || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon green" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({}));
const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const { default: __VLS_49 } = __VLS_47.slots;
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.Calendar} */
Calendar;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({}));
const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
// @ts-ignore
[stats, stats, formatNumber,];
var __VLS_47;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.totalAppointments || 0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-trend" },
});
/** @type {__VLS_StyleScopedClasses['stat-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-tag warning" },
});
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
(__VLS_ctx.stats.pendingAppointments || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon purple" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['purple']} */ ;
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({}));
const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
const { default: __VLS_60 } = __VLS_58.slots;
let __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.Finished} */
Finished;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({}));
const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
// @ts-ignore
[stats, stats, formatNumber,];
var __VLS_58;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.completedAppointments || 0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-trend" },
});
/** @type {__VLS_StyleScopedClasses['stat-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-tag success" },
});
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
(__VLS_ctx.calcGoodRate());
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon orange" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['orange']} */ ;
let __VLS_66;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({}));
const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
const { default: __VLS_71 } = __VLS_69.slots;
let __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.Warning} */
Warning;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
// @ts-ignore
[stats, formatNumber, calcGoodRate,];
var __VLS_69;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.stats.noShowAppointments || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-trend" },
});
/** @type {__VLS_StyleScopedClasses['stat-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-tag" },
});
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
(__VLS_ctx.stats.cancelledAppointments || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon cyan" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['cyan']} */ ;
let __VLS_77;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({}));
const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
const { default: __VLS_82 } = __VLS_80.slots;
let __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.Document} */
Document;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({}));
const __VLS_85 = __VLS_84({}, ...__VLS_functionalComponentArgsRest(__VLS_84));
// @ts-ignore
[stats, stats,];
var __VLS_80;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.totalMedicalRecords || 0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-trend" },
});
/** @type {__VLS_StyleScopedClasses['stat-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-tag" },
});
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
(__VLS_ctx.stats.monthlyAppointments || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon pink" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pink']} */ ;
let __VLS_88;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const { default: __VLS_93 } = __VLS_91.slots;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.Money} */
Money;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({}));
const __VLS_96 = __VLS_95({}, ...__VLS_functionalComponentArgsRest(__VLS_95));
// @ts-ignore
[stats, stats, formatNumber,];
var __VLS_91;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.totalRevenue || 0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-trend" },
});
/** @type {__VLS_StyleScopedClasses['stat-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-tag success" },
});
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
((__VLS_ctx.stats.scheduleUtilization || 0).toFixed(0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "charts-row" },
});
/** @type {__VLS_StyleScopedClasses['charts-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-card flex-2" },
});
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-2']} */ ;
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
    ref: "appointmentTrendChart",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-card flex-1" },
});
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
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
    ref: "appointmentStatusChart",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "charts-row" },
});
/** @type {__VLS_StyleScopedClasses['charts-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-card flex-1" },
});
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
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
    ref: "satisfactionChart",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-card flex-1" },
});
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-header" },
});
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-body rating-overview" },
});
/** @type {__VLS_StyleScopedClasses['chart-body']} */ ;
/** @type {__VLS_StyleScopedClasses['rating-overview']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-main" },
});
/** @type {__VLS_StyleScopedClasses['rating-main']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-score" },
});
/** @type {__VLS_StyleScopedClasses['rating-score']} */ ;
((__VLS_ctx.stats.averageRating || 0).toFixed(1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-stars" },
});
/** @type {__VLS_StyleScopedClasses['rating-stars']} */ ;
for (const [i] of __VLS_vFor((5))) {
    let __VLS_99;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        key: (i),
        ...{ class: ({ active: i <= Math.round(__VLS_ctx.stats.averageRating || 0) }) },
    }));
    const __VLS_101 = __VLS_100({
        key: (i),
        ...{ class: ({ active: i <= Math.round(__VLS_ctx.stats.averageRating || 0) }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    const { default: __VLS_104 } = __VLS_102.slots;
    let __VLS_105;
    /** @ts-ignore @type {typeof __VLS_components.Star} */
    Star;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({}));
    const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
    // @ts-ignore
    [stats, stats, stats, stats, formatNumber,];
    var __VLS_102;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-count" },
});
/** @type {__VLS_StyleScopedClasses['rating-count']} */ ;
(__VLS_ctx.stats.totalRatings || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-detail" },
});
/** @type {__VLS_StyleScopedClasses['rating-detail']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-item" },
});
/** @type {__VLS_StyleScopedClasses['rating-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-label" },
});
/** @type {__VLS_StyleScopedClasses['rating-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar" },
});
/** @type {__VLS_StyleScopedClasses['rating-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar-fill" },
    ...{ style: ({ width: __VLS_ctx.calcRatingPercent(5) + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['rating-bar-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-value" },
});
/** @type {__VLS_StyleScopedClasses['rating-value']} */ ;
(__VLS_ctx.getRatingCount(5));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-item" },
});
/** @type {__VLS_StyleScopedClasses['rating-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-label" },
});
/** @type {__VLS_StyleScopedClasses['rating-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar" },
});
/** @type {__VLS_StyleScopedClasses['rating-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar-fill" },
    ...{ style: ({ width: __VLS_ctx.calcRatingPercent(4) + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['rating-bar-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-value" },
});
/** @type {__VLS_StyleScopedClasses['rating-value']} */ ;
(__VLS_ctx.getRatingCount(4));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-item" },
});
/** @type {__VLS_StyleScopedClasses['rating-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-label" },
});
/** @type {__VLS_StyleScopedClasses['rating-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar" },
});
/** @type {__VLS_StyleScopedClasses['rating-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar-fill" },
    ...{ style: ({ width: __VLS_ctx.calcRatingPercent(3) + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['rating-bar-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-value" },
});
/** @type {__VLS_StyleScopedClasses['rating-value']} */ ;
(__VLS_ctx.getRatingCount(3));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-item" },
});
/** @type {__VLS_StyleScopedClasses['rating-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-label" },
});
/** @type {__VLS_StyleScopedClasses['rating-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar" },
});
/** @type {__VLS_StyleScopedClasses['rating-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar-fill" },
    ...{ style: ({ width: __VLS_ctx.calcRatingPercent(2) + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['rating-bar-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-value" },
});
/** @type {__VLS_StyleScopedClasses['rating-value']} */ ;
(__VLS_ctx.getRatingCount(2));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-item" },
});
/** @type {__VLS_StyleScopedClasses['rating-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-label" },
});
/** @type {__VLS_StyleScopedClasses['rating-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar" },
});
/** @type {__VLS_StyleScopedClasses['rating-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rating-bar-fill" },
    ...{ style: ({ width: __VLS_ctx.calcRatingPercent(1) + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['rating-bar-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "rating-value" },
});
/** @type {__VLS_StyleScopedClasses['rating-value']} */ ;
(__VLS_ctx.getRatingCount(1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-card flex-1" },
});
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-header" },
});
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-body schedule-overview" },
});
/** @type {__VLS_StyleScopedClasses['chart-body']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-overview']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-circle" },
});
/** @type {__VLS_StyleScopedClasses['schedule-circle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-value" },
});
/** @type {__VLS_StyleScopedClasses['schedule-value']} */ ;
((__VLS_ctx.stats.scheduleUtilization || 0).toFixed(0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-label" },
});
/** @type {__VLS_StyleScopedClasses['schedule-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-info" },
});
/** @type {__VLS_StyleScopedClasses['schedule-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-item" },
});
/** @type {__VLS_StyleScopedClasses['schedule-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "schedule-dot available" },
});
/** @type {__VLS_StyleScopedClasses['schedule-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['available']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "schedule-text" },
});
/** @type {__VLS_StyleScopedClasses['schedule-text']} */ ;
(__VLS_ctx.stats.availableSchedules || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "schedule-item" },
});
/** @type {__VLS_StyleScopedClasses['schedule-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "schedule-dot total" },
});
/** @type {__VLS_StyleScopedClasses['schedule-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "schedule-text" },
});
/** @type {__VLS_StyleScopedClasses['schedule-text']} */ ;
(__VLS_ctx.stats.totalSchedules || 0);
// @ts-ignore
[stats, stats, stats, stats, calcRatingPercent, calcRatingPercent, calcRatingPercent, calcRatingPercent, calcRatingPercent, getRatingCount, getRatingCount, getRatingCount, getRatingCount, getRatingCount,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
