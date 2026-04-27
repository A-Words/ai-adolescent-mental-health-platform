/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Check, ArrowDown } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';
import { checkApplyEligibility } from '../api/psychologistApply';
const router = useRouter();
const activeStep = ref(0);
const statRefs = reactive([]);
const stats = [
    { label: '服务用户', value: 5000, suffix: '+' },
    { label: '入驻专家', value: 200, suffix: '+' },
    { label: '好评率', value: 98, suffix: '%' },
    { label: '全天候支持', value: 24, suffix: 'h' }
];
const animateNumber = (el, target, suffix, duration = 800) => {
    const startTime = performance.now();
    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.round(easeProgress * target) + suffix;
        if (progress < 1)
            requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
};
const scrollToContent = () => {
    document.querySelector('.advantages-section')?.scrollIntoView({ behavior: 'smooth' });
};
onMounted(() => {
    setTimeout(() => {
        statRefs.forEach((el, i) => {
            const stat = stats[i];
            if (el && stat)
                animateNumber(el, stat.value, stat.suffix);
        });
    }, 500);
});
const advantages = [
    { title: '智能管理系统', desc: '先进的后台管理系统，轻松管理预约、咨询记录和用户数据', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>', bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: '稳定用户流量', desc: '平台日活用户持续增长，为咨询师带来稳定案源', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: '专业培训支持', desc: '定期开展专业培训与督导，持续提升咨询能力', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: '灵活工作安排', desc: '自主设定咨询时间，平衡工作与生活', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: '丰厚收益回报', desc: '具有竞争力的咨询费用分成，付出必有回报', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: '隐私安全保障', desc: '端到端加密保护，严格遵守心理咨询伦理规范', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', bgColor: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
];
const resources = [
    { title: '智能排班系统', desc: '灵活的预约管理，告别手动排期烦恼', icon: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', features: ['可视化日历排班', '自动提醒通知', '时段灵活设置', '多端同步管理'] },
    { title: '数据分析后台', desc: '全方位数据洞察，助力精准服务优化', icon: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', features: ['咨询量统计', '用户画像分析', '收益报表导出', '趋势预测'] },
    { title: '在线支付系统', desc: '安全便捷的收费体系，资金实时到账', icon: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>', features: ['多种支付方式', '自动对账结算', '提现秒到账', '费用透明清晰'] },
    { title: '培训学习中心', desc: '海量专业课程，持续提升咨询技能', icon: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', features: ['专业督导课程', '案例研讨分享', '行业最新资讯', '认证资格培训'] }
];
const promotionTags = ['专业认证', '严格审核', '隐私保护', '科学咨询', '持续督导', '学术支持'];
const requirements = [
    { title: '执业资格', desc: '持有执业所在地的法律许可的执业资格证书' },
    { title: '学历要求', desc: '具备全日制大专及以上的学历学位证书' },
    { title: '伦理培训', desc: '近三年接受心理咨询伦理培训时长不少于 9 小时' },
    { title: '系统培训', desc: '完成不少于 1 年（160 学时）的心理咨询流派系统培训' },
    { title: '咨询经验', desc: '付费咨询时长累计不少于 400 小时' },
    { title: '督导经历', desc: '接受个人督导时长累计不少于 60 小时' }
];
const processSteps = [
    { title: '填写基本资料', desc: '提交个人信息、资质证书等基本入驻材料', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
    { title: '完成笔试考核', desc: '参加平台组织的专业知识和伦理笔试', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
    { title: '提交案例报告', desc: '提交咨询案例报告及个人成长自我叙述', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' },
    { title: '参与入驻面谈', desc: '与平台专业团队进行入驻合作面谈沟通', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    { title: '成功入驻平台', desc: '审核通过后正式成为平台合作心理咨询师', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>' }
];
const goBack = () => router.push('/home');
const handleApply = async () => {
    const loading = ElLoading.service({
        lock: true,
        text: '正在检查申请资格...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        // 调用后端 API 检查申请资格
        const res = await checkApplyEligibility();
        loading.close();
        // 后端返回 code: 200
        if (res.code === 200) {
            const data = res.data;
            if (data.eligible) {
                // 有资格，跳转到资料填写页面
                router.push('/apply-psychologist/form');
            }
            else {
                // 无资格，显示原因
                if (data.isPsychologist) {
                    ElMessage.warning('您已经是心理咨询师，无需再次申请');
                }
                else if (data.hasApply) {
                    ElMessage.info('您有正在处理中的入驻申请，请等待处理完成');
                    router.push('/apply-psychologist/status');
                }
                else {
                    ElMessage.error(data.reason || '暂不符合入驻条件');
                }
            }
        }
        else {
            ElMessage.error(res.message || '检查资格失败，请稍后重试');
        }
    }
    catch (error) {
        loading.close();
        if (error.response?.status === 401) {
            ElMessage.warning('请先登录后再申请入驻');
            router.push('/login');
        }
        else {
            ElMessage.error('网络错误，请检查网络连接后重试');
        }
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cloud']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-1']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-1']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-3']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-3']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['advantage-card']} */ ;
/** @type {__VLS_StyleScopedClasses['advantage-card']} */ ;
/** @type {__VLS_StyleScopedClasses['advantage-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
/** @type {__VLS_StyleScopedClasses['promotion-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['promotion-content']} */ ;
/** @type {__VLS_StyleScopedClasses['promotion-content']} */ ;
/** @type {__VLS_StyleScopedClasses['promotion-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['requirement-card']} */ ;
/** @type {__VLS_StyleScopedClasses['req-content']} */ ;
/** @type {__VLS_StyleScopedClasses['req-content']} */ ;
/** @type {__VLS_StyleScopedClasses['process-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['process-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['step-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['process-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['step-active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['process-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['step-active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['action-content']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['return-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-section']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-section']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
/** @type {__VLS_StyleScopedClasses['advantages-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['promotion-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['promotion-decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['requirements-list']} */ ;
/** @type {__VLS_StyleScopedClasses['process-flow']} */ ;
/** @type {__VLS_StyleScopedClasses['step-connector']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['advantages-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['return-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['section-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['promotion-content']} */ ;
/** @type {__VLS_StyleScopedClasses['action-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "apply-psychologist-page" },
});
/** @type {__VLS_StyleScopedClasses['apply-psychologist-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-effects" },
});
/** @type {__VLS_StyleScopedClasses['bg-effects']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-gradient" },
});
/** @type {__VLS_StyleScopedClasses['bg-gradient']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cloud cloud-1" },
});
/** @type {__VLS_StyleScopedClasses['cloud']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cloud cloud-2" },
});
/** @type {__VLS_StyleScopedClasses['cloud']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cloud cloud-3" },
});
/** @type {__VLS_StyleScopedClasses['cloud']} */ ;
/** @type {__VLS_StyleScopedClasses['cloud-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-shape shape-1" },
});
/** @type {__VLS_StyleScopedClasses['floating-shape']} */ ;
/** @type {__VLS_StyleScopedClasses['shape-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-shape shape-2" },
});
/** @type {__VLS_StyleScopedClasses['floating-shape']} */ ;
/** @type {__VLS_StyleScopedClasses['shape-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "floating-shape shape-3" },
});
/** @type {__VLS_StyleScopedClasses['floating-shape']} */ ;
/** @type {__VLS_StyleScopedClasses['shape-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "light-ray ray-1" },
});
/** @type {__VLS_StyleScopedClasses['light-ray']} */ ;
/** @type {__VLS_StyleScopedClasses['ray-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "light-ray ray-2" },
});
/** @type {__VLS_StyleScopedClasses['light-ray']} */ ;
/** @type {__VLS_StyleScopedClasses['ray-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero-section" },
});
/** @type {__VLS_StyleScopedClasses['hero-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero-content" },
});
/** @type {__VLS_StyleScopedClasses['hero-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero-badge" },
});
/** @type {__VLS_StyleScopedClasses['hero-badge']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "badge-icon" },
});
/** @type {__VLS_StyleScopedClasses['badge-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "hero-title" },
});
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "hero-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero-stats" },
});
/** @type {__VLS_StyleScopedClasses['hero-stats']} */ ;
for (const [stat, index] of __VLS_vFor((__VLS_ctx.stats))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stat-item" },
        key: (index),
        ref: (el => __VLS_ctx.statRefs[index] = el),
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-number" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-label" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
    (stat.label);
    // @ts-ignore
    [stats, statRefs,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero-cta" },
});
/** @type {__VLS_StyleScopedClasses['hero-cta']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "hero-btn" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "hero-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.scrollToContent) });
/** @type {__VLS_StyleScopedClasses['hero-btn']} */ ;
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.ArrowDown} */
ArrowDown;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
// @ts-ignore
[scrollToContent,];
var __VLS_11;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hero-visual" },
});
/** @type {__VLS_StyleScopedClasses['hero-visual']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "visual-orb main-orb" },
});
/** @type {__VLS_StyleScopedClasses['visual-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['main-orb']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "visual-orb orb-2" },
});
/** @type {__VLS_StyleScopedClasses['visual-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "visual-orb orb-3" },
});
/** @type {__VLS_StyleScopedClasses['visual-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['orb-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "heart-icon" },
});
/** @type {__VLS_StyleScopedClasses['heart-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    viewBox: "0 0 24 24",
    width: "64",
    height: "64",
    fill: "rgba(64,158,255,0.8)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mini-card card-1" },
});
/** @type {__VLS_StyleScopedClasses['mini-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "card-icon" },
});
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mini-card card-2" },
});
/** @type {__VLS_StyleScopedClasses['mini-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "card-icon" },
});
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mini-card card-3" },
});
/** @type {__VLS_StyleScopedClasses['mini-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "card-icon" },
});
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-wrapper advantages-section" },
});
/** @type {__VLS_StyleScopedClasses['section-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['advantages-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-header" },
});
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-desc" },
});
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "advantages-grid" },
});
/** @type {__VLS_StyleScopedClasses['advantages-grid']} */ ;
for (const [adv, index] of __VLS_vFor((__VLS_ctx.advantages))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "advantage-card" },
        key: (index),
    });
    /** @type {__VLS_StyleScopedClasses['advantage-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "advantage-icon" },
        ...{ style: ({ background: adv.bgColor }) },
    });
    /** @type {__VLS_StyleScopedClasses['advantage-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (adv.icon) }, null, null);
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "advantage-title" },
    });
    /** @type {__VLS_StyleScopedClasses['advantage-title']} */ ;
    (adv.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "advantage-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['advantage-desc']} */ ;
    (adv.desc);
    // @ts-ignore
    [advantages,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-wrapper resource-section" },
});
/** @type {__VLS_StyleScopedClasses['section-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['resource-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-header" },
});
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-desc" },
});
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resource-grid" },
});
/** @type {__VLS_StyleScopedClasses['resource-grid']} */ ;
for (const [res, index] of __VLS_vFor((__VLS_ctx.resources))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resource-card" },
        key: (index),
    });
    /** @type {__VLS_StyleScopedClasses['resource-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resource-icon-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['resource-icon-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resource-icon" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (res.icon) }, null, null);
    /** @type {__VLS_StyleScopedClasses['resource-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (res.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (res.desc);
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({});
    for (const [item, i] of __VLS_vFor((res.features))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (i),
        });
        (item);
        // @ts-ignore
        [resources,];
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-wrapper promotion-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['section-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['promotion-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "promotion-banner" },
});
/** @type {__VLS_StyleScopedClasses['promotion-banner']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "promotion-decoration left-deco" },
});
/** @type {__VLS_StyleScopedClasses['promotion-decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['left-deco']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "deco-circle c1" },
});
/** @type {__VLS_StyleScopedClasses['deco-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['c1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "deco-circle c2" },
});
/** @type {__VLS_StyleScopedClasses['deco-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['c2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "deco-circle c3" },
});
/** @type {__VLS_StyleScopedClasses['deco-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['c3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "promotion-content" },
});
/** @type {__VLS_StyleScopedClasses['promotion-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "promotion-tags" },
});
/** @type {__VLS_StyleScopedClasses['promotion-tags']} */ ;
for (const [tag, i] of __VLS_vFor((__VLS_ctx.promotionTags))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "promotion-tag" },
        key: (i),
    });
    /** @type {__VLS_StyleScopedClasses['promotion-tag']} */ ;
    (tag);
    // @ts-ignore
    [promotionTags,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "promotion-decoration right-deco" },
});
/** @type {__VLS_StyleScopedClasses['promotion-decoration']} */ ;
/** @type {__VLS_StyleScopedClasses['right-deco']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "deco-circle c4" },
});
/** @type {__VLS_StyleScopedClasses['deco-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['c4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "deco-circle c5" },
});
/** @type {__VLS_StyleScopedClasses['deco-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['c5']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-wrapper requirements-section" },
});
/** @type {__VLS_StyleScopedClasses['section-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['requirements-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-header" },
});
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-desc" },
});
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "requirements-list" },
});
/** @type {__VLS_StyleScopedClasses['requirements-list']} */ ;
for (const [req, index] of __VLS_vFor((__VLS_ctx.requirements))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "requirement-card" },
        key: (index),
    });
    /** @type {__VLS_StyleScopedClasses['requirement-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "req-number" },
    });
    /** @type {__VLS_StyleScopedClasses['req-number']} */ ;
    (String(index + 1).padStart(2, '0'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "req-content" },
    });
    /** @type {__VLS_StyleScopedClasses['req-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (req.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (req.desc);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "req-check" },
    });
    /** @type {__VLS_StyleScopedClasses['req-check']} */ ;
    let __VLS_19;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
    const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const { default: __VLS_24 } = __VLS_22.slots;
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.Check} */
    Check;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
    const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
    // @ts-ignore
    [requirements,];
    var __VLS_22;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-wrapper process-section" },
});
/** @type {__VLS_StyleScopedClasses['section-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['process-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section-header" },
});
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-desc" },
});
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "process-flow" },
});
/** @type {__VLS_StyleScopedClasses['process-flow']} */ ;
for (const [step, index] of __VLS_vFor((__VLS_ctx.processSteps))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMouseenter: (...[$event]) => {
                __VLS_ctx.activeStep = index;
                // @ts-ignore
                [processSteps, activeStep,];
            } },
        key: (index),
        ...{ class: "process-step" },
        ...{ class: ({ 'step-active': __VLS_ctx.activeStep === index }) },
    });
    /** @type {__VLS_StyleScopedClasses['process-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['step-active']} */ ;
    if (index > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-connector" },
        });
        /** @type {__VLS_StyleScopedClasses['step-connector']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['step-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (step.icon) }, null, null);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-number" },
    });
    /** @type {__VLS_StyleScopedClasses['step-number']} */ ;
    (String(index + 1).padStart(2, '0'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-content" },
    });
    /** @type {__VLS_StyleScopedClasses['step-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    (step.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (step.desc);
    // @ts-ignore
    [activeStep,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "process-diagram" },
});
/** @type {__VLS_StyleScopedClasses['process-diagram']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    viewBox: "0 0 800 120",
    ...{ class: "flow-svg" },
});
/** @type {__VLS_StyleScopedClasses['flow-svg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.defs, __VLS_intrinsics.defs)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.linearGradient, __VLS_intrinsics.linearGradient)({
    id: "lineGradient",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "0%",
    'stop-color': "#409EFF",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.stop)({
    offset: "100%",
    'stop-color': "#36cfc9",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.filter, __VLS_intrinsics.filter)({
    id: "glow",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.feGaussianBlur)({
    stdDeviation: "3",
    result: "coloredBlur",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.feMerge, __VLS_intrinsics.feMerge)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.feMergeNode)({
    in: "coloredBlur",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.feMergeNode)({
    in: "SourceGraphic",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M 100 60 L 700 60",
    stroke: "url(#lineGradient)",
    'stroke-width': "3",
    fill: "none",
    'stroke-dasharray': "8,4",
    filter: "url(#glow)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "100",
    cy: "60",
    r: "12",
    fill: "#409EFF",
    filter: "url(#glow)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "100",
    y: "65",
    'text-anchor': "middle",
    fill: "white",
    'font-size': "12",
    'font-weight': "bold",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "220",
    cy: "60",
    r: "12",
    fill: "#409EFF",
    filter: "url(#glow)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "220",
    y: "65",
    'text-anchor': "middle",
    fill: "white",
    'font-size': "12",
    'font-weight': "bold",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "340",
    cy: "60",
    r: "12",
    fill: "#409EFF",
    filter: "url(#glow)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "340",
    y: "65",
    'text-anchor': "middle",
    fill: "white",
    'font-size': "12",
    'font-weight': "bold",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "460",
    cy: "60",
    r: "12",
    fill: "#409EFF",
    filter: "url(#glow)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "460",
    y: "65",
    'text-anchor': "middle",
    fill: "white",
    'font-size': "12",
    'font-weight': "bold",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "580",
    cy: "60",
    r: "12",
    fill: "#409EFF",
    filter: "url(#glow)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "580",
    y: "65",
    'text-anchor': "middle",
    fill: "white",
    'font-size': "12",
    'font-weight': "bold",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "700",
    cy: "60",
    r: "16",
    fill: "#67C23A",
    filter: "url(#glow)",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "700",
    y: "65",
    'text-anchor': "middle",
    fill: "white",
    'font-size': "14",
    'font-weight': "bold",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "100",
    y: "95",
    'text-anchor': "middle",
    fill: "#606266",
    'font-size': "11",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "220",
    y: "95",
    'text-anchor': "middle",
    fill: "#606266",
    'font-size': "11",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "340",
    y: "95",
    'text-anchor': "middle",
    fill: "#606266",
    'font-size': "11",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "460",
    y: "95",
    'text-anchor': "middle",
    fill: "#606266",
    'font-size': "11",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "580",
    y: "95",
    'text-anchor': "middle",
    fill: "#606266",
    'font-size': "11",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({
    x: "700",
    y: "95",
    'text-anchor': "middle",
    fill: "#67C23A",
    'font-size': "12",
    'font-weight': "bold",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-section" },
});
/** @type {__VLS_StyleScopedClasses['action-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-content" },
});
/** @type {__VLS_StyleScopedClasses['action-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-buttons" },
});
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "apply-btn" },
}));
const __VLS_32 = __VLS_31({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "apply-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_35;
const __VLS_36 = ({ click: {} },
    { onClick: (__VLS_ctx.handleApply) });
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
const { default: __VLS_37 } = __VLS_33.slots;
// @ts-ignore
[handleApply,];
var __VLS_33;
var __VLS_34;
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    ...{ 'onClick': {} },
    size: "large",
    ...{ class: "return-btn" },
}));
const __VLS_40 = __VLS_39({
    ...{ 'onClick': {} },
    size: "large",
    ...{ class: "return-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
let __VLS_43;
const __VLS_44 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
/** @type {__VLS_StyleScopedClasses['return-btn']} */ ;
const { default: __VLS_45 } = __VLS_41.slots;
// @ts-ignore
[goBack,];
var __VLS_41;
var __VLS_42;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
