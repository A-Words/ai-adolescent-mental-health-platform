/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Check, Upload, Document, ArrowRight } from '@element-plus/icons-vue';
import { submitBasicInfo as apiSubmitBasicInfo } from '../../api/psychologistApply';
const router = useRouter();
const token = localStorage.getItem('token') || '';
const submitting = ref(false);
const currentStepIndex = ref(0);
const basicFormRef = ref();
const basicForm = reactive({
    realName: '',
    phone: '',
    country: '中国',
    contactWechat: '',
    caseHours: '',
    supervisionHours: '',
    consultationPrice: 0,
    resumeUrl: '',
    education: ''
});
const flowSteps = [
    { name: '填写基本资料', desc: '提交个人信息' },
    { name: '管理员审核', desc: '1-3个工作日' },
    { name: '笔试考核', desc: '1周期限' },
    { name: '提交案例报告', desc: '准备材料' },
    { name: '线下面谈', desc: '最终考核' },
    { name: '入驻成功', desc: '成为咨询师' }
];
const basicRules = {
    realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    contactWechat: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
    caseHours: [{ required: true, message: '请选择咨询个案时长', trigger: 'change' }],
    supervisionHours: [{ required: true, message: '请选择个体督导时长', trigger: 'change' }],
    education: [{ required: true, message: '请输入学历及相关专业', trigger: 'blur' }]
};
const jumpToStep = (index) => {
    if (index <= currentStepIndex.value) {
        currentStepIndex.value = index;
    }
};
const getFileName = (url) => {
    if (!url)
        return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
};
const handleResumeSuccess = (response) => {
    if (response.code === 200 || response.code === 0) {
        basicForm.resumeUrl = response.data || response.url;
        ElMessage.success('简历上传成功');
    }
    else {
        ElMessage.error(response.msg || '上传失败');
    }
};
const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
        ElMessage.error('文件大小不能超过 10MB');
        return false;
    }
    return true;
};
const submitBasicInfo = async () => {
    try {
        await basicFormRef.value.validate();
    }
    catch {
        return;
    }
    submitting.value = true;
    try {
        const res = await apiSubmitBasicInfo(basicForm);
        if (res.code === 200) {
            ElMessage.success('基本资料提交成功，等待管理员审核');
            router.push('/apply-psychologist/status');
        }
        else {
            ElMessage.error(res.message || '提交失败');
        }
    }
    catch (error) {
        ElMessage.error(error.response?.data?.message || '提交失败');
    }
    finally {
        submitting.value = false;
    }
};
const goBack = () => {
    router.push('/apply-psychologist');
};
onMounted(async () => {
    currentStepIndex.value = 0;
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['flow-step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-line']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['step-content']} */ ;
/** @type {__VLS_StyleScopedClasses['form-container']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-container']} */ ;
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "apply-form-page" },
});
/** @type {__VLS_StyleScopedClasses['apply-form-page']} */ ;
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
    ...{ class: "form-container" },
});
/** @type {__VLS_StyleScopedClasses['form-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flow-sidebar" },
});
/** @type {__VLS_StyleScopedClasses['flow-sidebar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flow-card" },
});
/** @type {__VLS_StyleScopedClasses['flow-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "flow-title" },
});
/** @type {__VLS_StyleScopedClasses['flow-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flow-steps" },
});
/** @type {__VLS_StyleScopedClasses['flow-steps']} */ ;
for (const [step, index] of __VLS_vFor((__VLS_ctx.flowSteps))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.jumpToStep(index);
                // @ts-ignore
                [flowSteps, jumpToStep,];
            } },
        key: (index),
        ...{ class: "flow-step-item" },
        ...{ class: ({ active: __VLS_ctx.currentStepIndex >= index, current: __VLS_ctx.currentStepIndex === index, clickable: index === __VLS_ctx.currentStepIndex }) },
    });
    /** @type {__VLS_StyleScopedClasses['flow-step-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['current']} */ ;
    /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-indicator" },
    });
    /** @type {__VLS_StyleScopedClasses['step-indicator']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-dot" },
    });
    /** @type {__VLS_StyleScopedClasses['step-dot']} */ ;
    if (__VLS_ctx.currentStepIndex > index) {
        let __VLS_0;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
        const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
        const { default: __VLS_5 } = __VLS_3.slots;
        let __VLS_6;
        /** @ts-ignore @type {typeof __VLS_components.Check} */
        Check;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
        const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
        // @ts-ignore
        [currentStepIndex, currentStepIndex, currentStepIndex, currentStepIndex,];
        var __VLS_3;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (index + 1);
    }
    if (index < __VLS_ctx.flowSteps.length - 1) {
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
    [flowSteps,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-main" },
});
/** @type {__VLS_StyleScopedClasses['form-main']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-card" },
});
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "step-panel" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.currentStepIndex === 0) }, null, null);
/** @type {__VLS_StyleScopedClasses['step-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "panel-title" },
});
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "panel-desc" },
});
/** @type {__VLS_StyleScopedClasses['panel-desc']} */ ;
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    model: (__VLS_ctx.basicForm),
    rules: (__VLS_ctx.basicRules),
    ref: "basicFormRef",
    labelPosition: "top",
    ...{ class: "apply-form" },
}));
const __VLS_13 = __VLS_12({
    model: (__VLS_ctx.basicForm),
    rules: (__VLS_ctx.basicRules),
    ref: "basicFormRef",
    labelPosition: "top",
    ...{ class: "apply-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
var __VLS_16 = {};
/** @type {__VLS_StyleScopedClasses['apply-form']} */ ;
const { default: __VLS_18 } = __VLS_14.slots;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    gutter: (24),
}));
const __VLS_21 = __VLS_20({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    span: (12),
}));
const __VLS_27 = __VLS_26({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    label: "真实姓名",
    prop: "realName",
}));
const __VLS_33 = __VLS_32({
    label: "真实姓名",
    prop: "realName",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
const { default: __VLS_36 } = __VLS_34.slots;
let __VLS_37;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    modelValue: (__VLS_ctx.basicForm.realName),
    placeholder: "请输入真实姓名",
}));
const __VLS_39 = __VLS_38({
    modelValue: (__VLS_ctx.basicForm.realName),
    placeholder: "请输入真实姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
// @ts-ignore
[currentStepIndex, basicForm, basicForm, basicRules,];
var __VLS_34;
// @ts-ignore
[];
var __VLS_28;
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    span: (12),
}));
const __VLS_44 = __VLS_43({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
const { default: __VLS_47 } = __VLS_45.slots;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    label: "手机号码",
    prop: "phone",
}));
const __VLS_50 = __VLS_49({
    label: "手机号码",
    prop: "phone",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const { default: __VLS_53 } = __VLS_51.slots;
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    modelValue: (__VLS_ctx.basicForm.phone),
    placeholder: "请输入手机号码",
}));
const __VLS_56 = __VLS_55({
    modelValue: (__VLS_ctx.basicForm.phone),
    placeholder: "请输入手机号码",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
// @ts-ignore
[basicForm,];
var __VLS_51;
// @ts-ignore
[];
var __VLS_45;
// @ts-ignore
[];
var __VLS_22;
let __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    label: "国家/地区",
    prop: "country",
}));
const __VLS_61 = __VLS_60({
    label: "国家/地区",
    prop: "country",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
const { default: __VLS_64 } = __VLS_62.slots;
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    modelValue: (__VLS_ctx.basicForm.country),
    placeholder: "请输入国家/地区",
}));
const __VLS_67 = __VLS_66({
    modelValue: (__VLS_ctx.basicForm.country),
    placeholder: "请输入国家/地区",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
// @ts-ignore
[basicForm,];
var __VLS_62;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    label: "联系方式（微信/邮箱）",
    prop: "contactWechat",
}));
const __VLS_72 = __VLS_71({
    label: "联系方式（微信/邮箱）",
    prop: "contactWechat",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.basicForm.contactWechat),
    placeholder: "请输入微信号或邮箱",
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.basicForm.contactWechat),
    placeholder: "请输入微信号或邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
// @ts-ignore
[basicForm,];
var __VLS_73;
let __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
    gutter: (24),
}));
const __VLS_83 = __VLS_82({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
const { default: __VLS_86 } = __VLS_84.slots;
let __VLS_87;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
    span: (12),
}));
const __VLS_89 = __VLS_88({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
const { default: __VLS_92 } = __VLS_90.slots;
let __VLS_93;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
    label: "咨询个案时长",
    prop: "caseHours",
}));
const __VLS_95 = __VLS_94({
    label: "咨询个案时长",
    prop: "caseHours",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
const { default: __VLS_98 } = __VLS_96.slots;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    modelValue: (__VLS_ctx.basicForm.caseHours),
    placeholder: "请选择咨询个案时长",
    ...{ class: "full-width" },
}));
const __VLS_101 = __VLS_100({
    modelValue: (__VLS_ctx.basicForm.caseHours),
    placeholder: "请选择咨询个案时长",
    ...{ class: "full-width" },
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
const { default: __VLS_104 } = __VLS_102.slots;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    label: "少于500小时",
    value: "less_500",
}));
const __VLS_107 = __VLS_106({
    label: "少于500小时",
    value: "less_500",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
let __VLS_110;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
    label: "500-1000小时",
    value: "500_1000",
}));
const __VLS_112 = __VLS_111({
    label: "500-1000小时",
    value: "500_1000",
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
let __VLS_115;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
    label: "1000-3000小时",
    value: "1000_3000",
}));
const __VLS_117 = __VLS_116({
    label: "1000-3000小时",
    value: "1000_3000",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
let __VLS_120;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
    label: "3000小时以上",
    value: "more_3000",
}));
const __VLS_122 = __VLS_121({
    label: "3000小时以上",
    value: "more_3000",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
// @ts-ignore
[basicForm,];
var __VLS_102;
// @ts-ignore
[];
var __VLS_96;
// @ts-ignore
[];
var __VLS_90;
let __VLS_125;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
    span: (12),
}));
const __VLS_127 = __VLS_126({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
const { default: __VLS_130 } = __VLS_128.slots;
let __VLS_131;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
    label: "个体督导时长",
    prop: "supervisionHours",
}));
const __VLS_133 = __VLS_132({
    label: "个体督导时长",
    prop: "supervisionHours",
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
const { default: __VLS_136 } = __VLS_134.slots;
let __VLS_137;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
    modelValue: (__VLS_ctx.basicForm.supervisionHours),
    placeholder: "请选择个体督导时长",
    ...{ class: "full-width" },
}));
const __VLS_139 = __VLS_138({
    modelValue: (__VLS_ctx.basicForm.supervisionHours),
    placeholder: "请选择个体督导时长",
    ...{ class: "full-width" },
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
const { default: __VLS_142 } = __VLS_140.slots;
let __VLS_143;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    label: "少于80小时",
    value: "less_80",
}));
const __VLS_145 = __VLS_144({
    label: "少于80小时",
    value: "less_80",
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
let __VLS_148;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
    label: "80-150小时",
    value: "80_150",
}));
const __VLS_150 = __VLS_149({
    label: "80-150小时",
    value: "80_150",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
let __VLS_153;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({
    label: "150小时以上",
    value: "more_150",
}));
const __VLS_155 = __VLS_154({
    label: "150小时以上",
    value: "more_150",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
// @ts-ignore
[basicForm,];
var __VLS_140;
// @ts-ignore
[];
var __VLS_134;
// @ts-ignore
[];
var __VLS_128;
// @ts-ignore
[];
var __VLS_84;
let __VLS_158;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
    gutter: (24),
}));
const __VLS_160 = __VLS_159({
    gutter: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
const { default: __VLS_163 } = __VLS_161.slots;
let __VLS_164;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
    span: (12),
}));
const __VLS_166 = __VLS_165({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
const { default: __VLS_169 } = __VLS_167.slots;
let __VLS_170;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent1(__VLS_170, new __VLS_170({
    label: "咨询定价（元/小时）",
    prop: "consultationPrice",
}));
const __VLS_172 = __VLS_171({
    label: "咨询定价（元/小时）",
    prop: "consultationPrice",
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
const { default: __VLS_175 } = __VLS_173.slots;
let __VLS_176;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent1(__VLS_176, new __VLS_176({
    modelValue: (__VLS_ctx.basicForm.consultationPrice),
    min: (0),
    step: (50),
    ...{ class: "full-width" },
}));
const __VLS_178 = __VLS_177({
    modelValue: (__VLS_ctx.basicForm.consultationPrice),
    min: (0),
    step: (50),
    ...{ class: "full-width" },
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
// @ts-ignore
[basicForm,];
var __VLS_173;
// @ts-ignore
[];
var __VLS_167;
let __VLS_181;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
    span: (12),
}));
const __VLS_183 = __VLS_182({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
const { default: __VLS_186 } = __VLS_184.slots;
let __VLS_187;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187({
    label: "学历及相关专业",
    prop: "education",
}));
const __VLS_189 = __VLS_188({
    label: "学历及相关专业",
    prop: "education",
}, ...__VLS_functionalComponentArgsRest(__VLS_188));
const { default: __VLS_192 } = __VLS_190.slots;
let __VLS_193;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({
    modelValue: (__VLS_ctx.basicForm.education),
    placeholder: "如：心理学硕士",
}));
const __VLS_195 = __VLS_194({
    modelValue: (__VLS_ctx.basicForm.education),
    placeholder: "如：心理学硕士",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
// @ts-ignore
[basicForm,];
var __VLS_190;
// @ts-ignore
[];
var __VLS_184;
// @ts-ignore
[];
var __VLS_161;
let __VLS_198;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({
    label: "个人简历",
    prop: "resumeUrl",
}));
const __VLS_200 = __VLS_199({
    label: "个人简历",
    prop: "resumeUrl",
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
const { default: __VLS_203 } = __VLS_201.slots;
let __VLS_204;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
    ...{ class: "upload-area" },
    action: "/api/psychologist-apply/upload",
    headers: ({ token: __VLS_ctx.token }),
    onSuccess: (__VLS_ctx.handleResumeSuccess),
    beforeUpload: (__VLS_ctx.beforeUpload),
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    limit: (1),
}));
const __VLS_206 = __VLS_205({
    ...{ class: "upload-area" },
    action: "/api/psychologist-apply/upload",
    headers: ({ token: __VLS_ctx.token }),
    onSuccess: (__VLS_ctx.handleResumeSuccess),
    beforeUpload: (__VLS_ctx.beforeUpload),
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    limit: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
const { default: __VLS_209 } = __VLS_207.slots;
let __VLS_210;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
    type: "primary",
    plain: true,
}));
const __VLS_212 = __VLS_211({
    type: "primary",
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_211));
const { default: __VLS_215 } = __VLS_213.slots;
let __VLS_216;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({}));
const __VLS_218 = __VLS_217({}, ...__VLS_functionalComponentArgsRest(__VLS_217));
const { default: __VLS_221 } = __VLS_219.slots;
let __VLS_222;
/** @ts-ignore @type {typeof __VLS_components.Upload} */
Upload;
// @ts-ignore
const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({}));
const __VLS_224 = __VLS_223({}, ...__VLS_functionalComponentArgsRest(__VLS_223));
// @ts-ignore
[token, handleResumeSuccess, beforeUpload,];
var __VLS_219;
// @ts-ignore
[];
var __VLS_213;
{
    const { tip: __VLS_227 } = __VLS_207.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "upload-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['upload-tip']} */ ;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_207;
if (__VLS_ctx.basicForm.resumeUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "uploaded-file" },
    });
    /** @type {__VLS_StyleScopedClasses['uploaded-file']} */ ;
    let __VLS_228;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent1(__VLS_228, new __VLS_228({
        color: "#67C23A",
    }));
    const __VLS_230 = __VLS_229({
        color: "#67C23A",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    const { default: __VLS_233 } = __VLS_231.slots;
    let __VLS_234;
    /** @ts-ignore @type {typeof __VLS_components.Document} */
    Document;
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent1(__VLS_234, new __VLS_234({}));
    const __VLS_236 = __VLS_235({}, ...__VLS_functionalComponentArgsRest(__VLS_235));
    // @ts-ignore
    [basicForm,];
    var __VLS_231;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.getFileName(__VLS_ctx.basicForm.resumeUrl));
    let __VLS_239;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_240 = __VLS_asFunctionalComponent1(__VLS_239, new __VLS_239({
        ...{ 'onClick': {} },
        type: "danger",
        link: true,
    }));
    const __VLS_241 = __VLS_240({
        ...{ 'onClick': {} },
        type: "danger",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_240));
    let __VLS_244;
    const __VLS_245 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.basicForm.resumeUrl))
                    return;
                __VLS_ctx.basicForm.resumeUrl = '';
                // @ts-ignore
                [basicForm, basicForm, getFileName,];
            } });
    const { default: __VLS_246 } = __VLS_242.slots;
    // @ts-ignore
    [];
    var __VLS_242;
    var __VLS_243;
}
// @ts-ignore
[];
var __VLS_201;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-actions" },
});
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
let __VLS_247;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_248 = __VLS_asFunctionalComponent1(__VLS_247, new __VLS_247({
    ...{ 'onClick': {} },
}));
const __VLS_249 = __VLS_248({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_248));
let __VLS_252;
const __VLS_253 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
const { default: __VLS_254 } = __VLS_250.slots;
// @ts-ignore
[goBack,];
var __VLS_250;
var __VLS_251;
let __VLS_255;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}));
const __VLS_257 = __VLS_256({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
let __VLS_260;
const __VLS_261 = ({ click: {} },
    { onClick: (__VLS_ctx.submitBasicInfo) });
const { default: __VLS_262 } = __VLS_258.slots;
let __VLS_263;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_264 = __VLS_asFunctionalComponent1(__VLS_263, new __VLS_263({}));
const __VLS_265 = __VLS_264({}, ...__VLS_functionalComponentArgsRest(__VLS_264));
const { default: __VLS_268 } = __VLS_266.slots;
let __VLS_269;
/** @ts-ignore @type {typeof __VLS_components.ArrowRight} */
ArrowRight;
// @ts-ignore
const __VLS_270 = __VLS_asFunctionalComponent1(__VLS_269, new __VLS_269({}));
const __VLS_271 = __VLS_270({}, ...__VLS_functionalComponentArgsRest(__VLS_270));
// @ts-ignore
[submitting, submitBasicInfo,];
var __VLS_266;
// @ts-ignore
[];
var __VLS_258;
var __VLS_259;
// @ts-ignore
[];
var __VLS_14;
// @ts-ignore
var __VLS_17 = __VLS_16;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
