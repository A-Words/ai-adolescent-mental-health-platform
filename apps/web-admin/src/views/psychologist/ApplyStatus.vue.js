/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Check, CircleCheck, Document, Loading } from '@element-plus/icons-vue';
import { getApplyStatus } from '../../api/psychologistApply';
const router = useRouter();
const loading = ref(true);
const statusData = reactive({
    hasApply: false,
    isPsychologist: false,
    applyId: null,
    status: '',
    statusName: '',
    step: '',
    stepName: '',
    applyCount: 0,
    rejectReason: '',
    examDeadline: '',
    paperResult: null,
    reportResult: null,
    interviewResult: null,
    interviewTime: '',
    interviewLocation: ''
});
const progressSteps = [
    { name: '填写资料', desc: '提交基本信息' },
    { name: '资料审核', desc: '管理员审核' },
    { name: '笔试考核', desc: '1周期限' },
    { name: '案例报告', desc: '提交材料' },
    { name: '线下面谈', desc: '最终审核' },
    { name: '入驻成功', desc: '成为咨询师' }
];
const currentStepIndex = computed(() => {
    const status = statusData.status;
    switch (status) {
        case 'FILLING': return 0;
        case 'REVIEWING': return 1;
        case 'PAPER': return 2;
        case 'REPORT': return 3;
        case 'INTERVIEW': return 4;
        case 'APPROVED': return 5;
        case 'REJECTED': return statusData.step === 'BASIC' ? 0 : statusData.step === 'PAPER' ? 2 : statusData.step === 'REPORT' ? 3 : 4;
        default: return 0;
    }
});
const getStatusType = (status) => {
    switch (status) {
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'danger';
        case 'FILLING':
        case 'REVIEWING':
        case 'PAPER':
        case 'REPORT':
        case 'INTERVIEW': return 'warning';
        default: return 'info';
    }
};
const formatDate = (dateStr) => {
    if (!dateStr)
        return '';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
};
const fetchStatus = async () => {
    loading.value = true;
    try {
        const res = await getApplyStatus();
        if (res.code === 200) {
            const data = res.data;
            statusData.hasApply = data.hasApply || false;
            statusData.isPsychologist = data.isPsychologist || false;
            statusData.applyId = data.applyId || null;
            statusData.status = data.status || '';
            statusData.statusName = data.statusName || '';
            statusData.step = data.step || '';
            statusData.stepName = data.stepName || '';
            statusData.applyCount = data.applyCount || 0;
            statusData.rejectReason = data.rejectReason || '';
            statusData.examDeadline = data.examDeadline || '';
            statusData.paperResult = data.paperResult ?? null;
            statusData.reportResult = data.reportResult ?? null;
            statusData.interviewResult = data.interviewResult ?? null;
            statusData.interviewTime = data.interviewTime || '';
            statusData.interviewLocation = data.interviewLocation || '';
        }
    }
    catch (error) {
        console.error(error);
        ElMessage.error('获取申请状态失败');
    }
    finally {
        loading.value = false;
    }
};
const goHome = () => router.push('/home');
const goApply = () => router.push('/apply-psychologist');
const goBack = () => router.push('/apply-psychologist');
const continueApply = () => router.push('/apply-psychologist/form');
onMounted(() => {
    fetchStatus();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['success-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['success-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['success-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-step']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-step']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['step-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-step']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-line']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-step']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['result-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-line']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "apply-status-page" },
});
/** @type {__VLS_StyleScopedClasses['apply-status-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-effects" },
});
/** @type {__VLS_StyleScopedClasses['bg-effects']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-gradient" },
});
/** @type {__VLS_StyleScopedClasses['bg-gradient']} */ ;
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
    ...{ class: "status-container" },
});
/** @type {__VLS_StyleScopedClasses['status-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "status-card" },
});
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-header" },
});
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "card-title" },
});
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "card-desc" },
});
/** @type {__VLS_StyleScopedClasses['card-desc']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading-state" },
    });
    /** @type {__VLS_StyleScopedClasses['loading-state']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "is-loading" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "is-loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['is-loading']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.Loading} */
    Loading;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    // @ts-ignore
    [loading,];
    var __VLS_3;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.statusData.isPsychologist) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "success-state" },
    });
    /** @type {__VLS_StyleScopedClasses['success-state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "success-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['success-icon']} */ ;
    let __VLS_11;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        color: "#67C23A",
    }));
    const __VLS_13 = __VLS_12({
        color: "#67C23A",
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    const { default: __VLS_16 } = __VLS_14.slots;
    let __VLS_17;
    /** @ts-ignore @type {typeof __VLS_components.CircleCheck} */
    CircleCheck;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
    const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
    // @ts-ignore
    [statusData,];
    var __VLS_14;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    let __VLS_22;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_27;
    const __VLS_28 = ({ click: {} },
        { onClick: (__VLS_ctx.goHome) });
    const { default: __VLS_29 } = __VLS_25.slots;
    // @ts-ignore
    [goHome,];
    var __VLS_25;
    var __VLS_26;
}
else if (!__VLS_ctx.statusData.hasApply) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
    const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const { default: __VLS_35 } = __VLS_33.slots;
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.Document} */
    Document;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    // @ts-ignore
    [statusData,];
    var __VLS_33;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    let __VLS_41;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_43 = __VLS_42({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_46;
    const __VLS_47 = ({ click: {} },
        { onClick: (__VLS_ctx.goApply) });
    const { default: __VLS_48 } = __VLS_44.slots;
    // @ts-ignore
    [goApply,];
    var __VLS_44;
    var __VLS_45;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "status-content" },
    });
    /** @type {__VLS_StyleScopedClasses['status-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "progress-section" },
    });
    /** @type {__VLS_StyleScopedClasses['progress-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "progress-steps" },
    });
    /** @type {__VLS_StyleScopedClasses['progress-steps']} */ ;
    for (const [step, index] of __VLS_vFor((__VLS_ctx.progressSteps))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (index),
            ...{ class: "progress-step" },
            ...{ class: ({ active: __VLS_ctx.currentStepIndex >= index, current: __VLS_ctx.currentStepIndex === index }) },
        });
        /** @type {__VLS_StyleScopedClasses['progress-step']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        /** @type {__VLS_StyleScopedClasses['current']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-indicator" },
        });
        /** @type {__VLS_StyleScopedClasses['step-indicator']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-dot" },
        });
        /** @type {__VLS_StyleScopedClasses['step-dot']} */ ;
        if (__VLS_ctx.currentStepIndex > index) {
            let __VLS_49;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({}));
            const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
            const { default: __VLS_54 } = __VLS_52.slots;
            let __VLS_55;
            /** @ts-ignore @type {typeof __VLS_components.Check} */
            Check;
            // @ts-ignore
            const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({}));
            const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
            // @ts-ignore
            [progressSteps, currentStepIndex, currentStepIndex, currentStepIndex,];
            var __VLS_52;
        }
        else if (__VLS_ctx.currentStepIndex === index) {
            let __VLS_60;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
                ...{ class: "pulse" },
            }));
            const __VLS_62 = __VLS_61({
                ...{ class: "pulse" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            /** @type {__VLS_StyleScopedClasses['pulse']} */ ;
            const { default: __VLS_65 } = __VLS_63.slots;
            let __VLS_66;
            /** @ts-ignore @type {typeof __VLS_components.Loading} */
            Loading;
            // @ts-ignore
            const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({}));
            const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
            // @ts-ignore
            [currentStepIndex,];
            var __VLS_63;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (index + 1);
        }
        if (index < __VLS_ctx.progressSteps.length - 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "step-line" },
            });
            /** @type {__VLS_StyleScopedClasses['step-line']} */ ;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "step-content" },
        });
        /** @type {__VLS_StyleScopedClasses['step-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        (step.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (step.desc);
        // @ts-ignore
        [progressSteps,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-card" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-header" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    let __VLS_71;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.statusData.status)),
        size: "large",
    }));
    const __VLS_73 = __VLS_72({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.statusData.status)),
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    const { default: __VLS_76 } = __VLS_74.slots;
    (__VLS_ctx.statusData.statusName);
    // @ts-ignore
    [statusData, statusData, getStatusType,];
    var __VLS_74;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-body" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.statusData.applyId);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.statusData.stepName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.statusData.applyCount);
    if (__VLS_ctx.statusData.examDeadline && __VLS_ctx.statusData.paperResult === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-item warning" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['warning']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (__VLS_ctx.formatDate(__VLS_ctx.statusData.examDeadline));
    }
    if (__VLS_ctx.statusData.interviewTime) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-item" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (__VLS_ctx.formatDate(__VLS_ctx.statusData.interviewTime));
        if (__VLS_ctx.statusData.interviewLocation) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "detail-item" },
            });
            /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "label" },
            });
            /** @type {__VLS_StyleScopedClasses['label']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "value" },
            });
            /** @type {__VLS_StyleScopedClasses['value']} */ ;
            (__VLS_ctx.statusData.interviewLocation);
        }
    }
    if (__VLS_ctx.statusData.rejectReason) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-item danger" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['danger']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        (__VLS_ctx.statusData.rejectReason);
    }
    if (__VLS_ctx.statusData.paperResult !== undefined && __VLS_ctx.statusData.paperResult !== null) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "result-card" },
        });
        /** @type {__VLS_StyleScopedClasses['result-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "result-badge" },
            ...{ class: (__VLS_ctx.statusData.paperResult === 1 ? 'pass' : 'fail') },
        });
        /** @type {__VLS_StyleScopedClasses['result-badge']} */ ;
        (__VLS_ctx.statusData.paperResult === 1 ? '通过' : '未通过');
    }
    if (__VLS_ctx.statusData.reportResult !== undefined && __VLS_ctx.statusData.reportResult !== null) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "result-card" },
        });
        /** @type {__VLS_StyleScopedClasses['result-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "result-badge" },
            ...{ class: (__VLS_ctx.statusData.reportResult === 1 ? 'pass' : 'fail') },
        });
        /** @type {__VLS_StyleScopedClasses['result-badge']} */ ;
        (__VLS_ctx.statusData.reportResult === 1 ? '通过' : '未通过');
    }
    if (__VLS_ctx.statusData.interviewResult !== undefined && __VLS_ctx.statusData.interviewResult !== null) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "result-card" },
        });
        /** @type {__VLS_StyleScopedClasses['result-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "result-badge" },
            ...{ class: (__VLS_ctx.statusData.interviewResult === 1 ? 'pass' : 'fail') },
        });
        /** @type {__VLS_StyleScopedClasses['result-badge']} */ ;
        (__VLS_ctx.statusData.interviewResult === 1 ? '通过' : '未通过');
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "action-buttons" },
    });
    /** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
    let __VLS_77;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
        ...{ 'onClick': {} },
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_82;
    const __VLS_83 = ({ click: {} },
        { onClick: (__VLS_ctx.goBack) });
    const { default: __VLS_84 } = __VLS_80.slots;
    // @ts-ignore
    [statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, statusData, formatDate, formatDate, goBack,];
    var __VLS_80;
    var __VLS_81;
    if (__VLS_ctx.statusData.status === 'FILLING' || __VLS_ctx.statusData.status === 'REVIEWING') {
        let __VLS_85;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_87 = __VLS_86({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        let __VLS_90;
        const __VLS_91 = ({ click: {} },
            { onClick: (__VLS_ctx.continueApply) });
        const { default: __VLS_92 } = __VLS_88.slots;
        // @ts-ignore
        [statusData, statusData, continueApply,];
        var __VLS_88;
        var __VLS_89;
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
