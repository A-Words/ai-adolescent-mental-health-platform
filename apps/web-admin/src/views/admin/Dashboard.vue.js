/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { getAdminOverview } from '@/api/stats';
import { User, UserFilled, Calendar, Reading, ChatDotRound, Money } from '@element-plus/icons-vue';
const stats = reactive({});
const currentTime = ref('');
const currentDate = ref('');
const userTrendChart = ref();
const appointmentStatusChart = ref();
const hospitalAppointmentChart = ref();
const satisfactionChart = ref();
const departmentChart = ref();
const contentTrendChart = ref();
const userRoleChart = ref();
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
const getRoleName = (role) => {
    const roleMap = { 0: '游客', 1: '普通用户', 2: '医生', 3: '医院管理员', 4: '超级管理员' };
    return roleMap[role] || '未知';
};
const getStatusName = (status) => {
    const statusMap = { 0: '待就诊', 1: '已完成', 2: '已取消', 3: '爽约' };
    return statusMap[status] || '未知';
};
const initUserTrendChart = () => {
    if (!userTrendChart.value)
        return;
    const chart = echarts.init(userTrendChart.value);
    const data = (stats.userTrend || []).reverse();
    const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.map((d) => d.month),
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
                name: '用户数',
                type: 'line',
                smooth: true,
                data: data.map((d) => d.count),
                lineStyle: { color: '#3B82F6', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                        { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                    ])
                },
                itemStyle: { color: '#3B82F6' }
            }]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initAppointmentStatusChart = () => {
    if (!appointmentStatusChart.value)
        return;
    const chart = echarts.init(appointmentStatusChart.value);
    const data = stats.appointmentByStatus || [];
    const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        color: ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
        series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 8, borderColor: '#0F172A', borderWidth: 2 },
                label: { show: true, color: '#606266', formatter: '{b}\n{c}次' },
                data: data.map((d) => ({ name: getStatusName(d.status), value: d.count }))
            }]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initHospitalAppointmentChart = () => {
    if (!hospitalAppointmentChart.value)
        return;
    const chart = echarts.init(hospitalAppointmentChart.value);
    const data = stats.appointmentByHospital || [];
    const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.map((d) => d.hospitalName || '未知'),
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399', rotate: 15 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399' },
            splitLine: { lineStyle: { color: '#E8E8E8' } }
        },
        series: [{
                name: '预约量',
                type: 'bar',
                data: data.map((d) => d.count),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#6366F1' },
                        { offset: 1, color: '#8B5CF6' }
                    ]),
                    borderRadius: [4, 4, 0, 0]
                }
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
const initDepartmentChart = () => {
    if (!departmentChart.value)
        return;
    const chart = echarts.init(departmentChart.value);
    const data = (stats.departmentAppointments || []).sort((a, b) => b.count - a.count);
    const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399' },
            splitLine: { lineStyle: { color: '#E8E8E8' } }
        },
        yAxis: {
            type: 'category',
            data: data.map((d) => d.departmentName || '未知').reverse(),
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399' }
        },
        series: [{
                name: '预约量',
                type: 'bar',
                data: data.map((d) => d.count).reverse(),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: '#06B6D4' },
                        { offset: 1, color: '#3B82F6' }
                    ]),
                    borderRadius: [0, 4, 4, 0]
                }
            }]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initContentTrendChart = () => {
    if (!contentTrendChart.value)
        return;
    const chart = echarts.init(contentTrendChart.value);
    const articleData = (stats.articleTrend || []).reverse();
    const assessmentData = (stats.assessmentTrend || []).reverse();
    const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['文章', '测评'], textStyle: { color: '#606266' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: articleData.map((d) => d.month),
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399' }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#CCCCCC' } },
            axisLabel: { color: '#909399' },
            splitLine: { lineStyle: { color: '#E8E8E8' } }
        },
        series: [
            {
                name: '文章',
                type: 'line',
                smooth: true,
                data: articleData.map((d) => d.count),
                lineStyle: { color: '#10B981', width: 2 },
                itemStyle: { color: '#10B981' }
            },
            {
                name: '测评',
                type: 'line',
                smooth: true,
                data: assessmentData.map((d) => d.count),
                lineStyle: { color: '#F59E0B', width: 2 },
                itemStyle: { color: '#F59E0B' }
            }
        ]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initUserRoleChart = () => {
    if (!userRoleChart.value)
        return;
    const chart = echarts.init(userRoleChart.value);
    const data = stats.userRoleDistribution || [];
    const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        color: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
        series: [{
                type: 'pie',
                radius: ['35%', '65%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 8, borderColor: '#0F172A', borderWidth: 2 },
                label: { show: true, color: '#606266', formatter: '{b}\n{c}人' },
                data: data.map((d) => ({ name: getRoleName(d.role), value: d.count }))
            }]
    };
    chart.setOption(option);
    chartInstances.push(chart);
};
const initAllCharts = async () => {
    await nextTick();
    chartInstances.forEach(chart => chart.dispose());
    chartInstances = [];
    initUserTrendChart();
    initAppointmentStatusChart();
    initHospitalAppointmentChart();
    initSatisfactionChart();
    initDepartmentChart();
    initContentTrendChart();
    initUserRoleChart();
};
const fetchData = async () => {
    try {
        const res = await getAdminOverview();
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
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-header']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-num']} */ ;
/** @type {__VLS_StyleScopedClasses['article-num']} */ ;
/** @type {__VLS_StyleScopedClasses['top3']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dashboard" },
});
/** @type {__VLS_StyleScopedClasses['dashboard']} */ ;
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
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.User} */
User;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.totalUsers || 0));
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
(__VLS_ctx.stats.monthlyNewUsers || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon green" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['green']} */ ;
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({}));
const __VLS_13 = __VLS_12({}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const { default: __VLS_16 } = __VLS_14.slots;
let __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.Calendar} */
Calendar;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
// @ts-ignore
[formatNumber, stats, stats,];
var __VLS_14;
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
let __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({}));
const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
const { default: __VLS_27 } = __VLS_25.slots;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.UserFilled} */
UserFilled;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
// @ts-ignore
[formatNumber, stats, stats,];
var __VLS_25;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.totalDoctors || 0));
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
(__VLS_ctx.stats.totalHospitals || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon orange" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['orange']} */ ;
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({}));
const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const { default: __VLS_38 } = __VLS_36.slots;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.Reading} */
Reading;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({}));
const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
// @ts-ignore
[formatNumber, stats, stats,];
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.totalArticles || 0));
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
(__VLS_ctx.stats.totalCourses || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon cyan" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['cyan']} */ ;
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({}));
const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const { default: __VLS_49 } = __VLS_47.slots;
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
ChatDotRound;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({}));
const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
// @ts-ignore
[formatNumber, stats, stats,];
var __VLS_47;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-content" },
});
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formatNumber(__VLS_ctx.stats.totalAssessments || 0));
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
(__VLS_ctx.stats.totalAiConsultations || 0);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon pink" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pink']} */ ;
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({}));
const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
const { default: __VLS_60 } = __VLS_58.slots;
let __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.Money} */
Money;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({}));
const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
// @ts-ignore
[formatNumber, stats, stats,];
var __VLS_58;
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
    ref: "userTrendChart",
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
    ref: "hospitalAppointmentChart",
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
    ...{ class: "chart-body" },
});
/** @type {__VLS_StyleScopedClasses['chart-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "departmentChart",
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
    ...{ class: "ranking-list" },
});
/** @type {__VLS_StyleScopedClasses['ranking-list']} */ ;
for (const [item, index] of __VLS_vFor((__VLS_ctx.stats.doctorRanking || []).slice(0, 10))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: "ranking-item" },
    });
    /** @type {__VLS_StyleScopedClasses['ranking-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ranking-num" },
        ...{ class: ({ top3: Number(index) < 3 }) },
    });
    /** @type {__VLS_StyleScopedClasses['ranking-num']} */ ;
    /** @type {__VLS_StyleScopedClasses['top3']} */ ;
    (Number(index) + 1);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ranking-name" },
    });
    /** @type {__VLS_StyleScopedClasses['ranking-name']} */ ;
    (item.realName || item.doctorName || '未知医生');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "ranking-value" },
    });
    /** @type {__VLS_StyleScopedClasses['ranking-value']} */ ;
    (item.count || 0);
    // @ts-ignore
    [formatNumber, stats, stats,];
}
if (!__VLS_ctx.stats.doctorRanking || __VLS_ctx.stats.doctorRanking.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-data" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-data']} */ ;
}
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
    ...{ class: "article-list" },
});
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
for (const [item, index] of __VLS_vFor((__VLS_ctx.stats.articleRanking || []).slice(0, 5))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: "article-item" },
    });
    /** @type {__VLS_StyleScopedClasses['article-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "article-num" },
        ...{ class: ({ top3: Number(index) < 3 }) },
    });
    /** @type {__VLS_StyleScopedClasses['article-num']} */ ;
    /** @type {__VLS_StyleScopedClasses['top3']} */ ;
    (Number(index) + 1);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "article-title" },
    });
    /** @type {__VLS_StyleScopedClasses['article-title']} */ ;
    (item.title || '未知文章');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "article-views" },
    });
    /** @type {__VLS_StyleScopedClasses['article-views']} */ ;
    (item.viewCount || 0);
    // @ts-ignore
    [stats, stats, stats,];
}
if (!__VLS_ctx.stats.articleRanking || __VLS_ctx.stats.articleRanking.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-data" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-data']} */ ;
}
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
    ref: "contentTrendChart",
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
    ref: "userRoleChart",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
// @ts-ignore
[stats, stats,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
