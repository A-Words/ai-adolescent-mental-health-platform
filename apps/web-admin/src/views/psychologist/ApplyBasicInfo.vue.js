/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { checkApplyEligibility, getApplyStatus, submitBasicInfo as apiSubmitBasicInfo, submitReport as apiSubmitReport } from '@/api/psychologistApply';
const router = useRouter();
const token = localStorage.getItem('token') || '';
const submitting = ref(false);
const currentStepIndex = ref(0);
const formStep = ref('basic');
const basicFormRef = ref();
const reportFormRef = ref();
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
const reportForm = reactive({
    qualificationUrls: [],
    supervisionProofUrls: [],
    experienceProofUrls: [],
    otherProofUrls: [],
    selfNarration: ''
});
const flowSteps = [
    { name: '填写基本资料', desc: '提交个人信息' },
    { name: '资料审核', desc: '管理员审核' },
    { name: '笔试考核', desc: '1周期限' },
    { name: '提交案例报告', desc: '准备材料' },
    { name: '线下面谈', desc: '最终考核' }
];
const basicRules = {
    realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    contactWechat: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
    caseHours: [{ required: true, message: '请选择咨询个案时长', trigger: 'change' }],
    supervisionHours: [{ required: true, message: '请选择个体督导时长', trigger: 'change' }],
    education: [{ required: true, message: '请输入学历及相关专业', trigger: 'blur' }]
};
const reportRules = {
    selfNarration: [{ required: true, message: '请输入个人自我叙述', trigger: 'blur' }]
};
const handleResumeSuccess = (response) => {
    if (response.code === 200) {
        basicForm.resumeUrl = response.data;
        ElMessage.success('简历上传成功');
    }
};
const handleQualificationSuccess = (response) => {
    if (response.code === 200) {
        reportForm.qualificationUrls.push(response.data);
        ElMessage.success('文件上传成功');
    }
};
const handleSupervisionSuccess = (response) => {
    if (response.code === 200) {
        reportForm.supervisionProofUrls.push(response.data);
        ElMessage.success('文件上传成功');
    }
};
const handleExperienceSuccess = (response) => {
    if (response.code === 200) {
        reportForm.experienceProofUrls.push(response.data);
        ElMessage.success('文件上传成功');
    }
};
const handleOtherSuccess = (response) => {
    if (response.code === 200) {
        reportForm.otherProofUrls.push(response.data);
        ElMessage.success('文件上传成功');
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
            ElMessage.success(res.data || '提交成功');
            // 刷新状态
            await fetchStatus();
        }
        else {
            ElMessage.error(res.message || '提交失败');
        }
    }
    catch (error) {
        ElMessage.error('提交失败');
    }
    finally {
        submitting.value = false;
    }
};
const submitReport = async () => {
    try {
        await reportFormRef.value.validate();
    }
    catch {
        return;
    }
    submitting.value = true;
    try {
        const res = await apiSubmitReport(reportForm);
        if (res.code === 200) {
            ElMessage.success(res.data || '提交成功');
            await fetchStatus();
        }
        else {
            ElMessage.error(res.message || '提交失败');
        }
    }
    catch (error) {
        ElMessage.error('提交失败');
    }
    finally {
        submitting.value = false;
    }
};
const goBack = () => {
    router.back();
};
const fetchStatus = async () => {
    try {
        const res = await getApplyStatus();
        if (res.code === 200) {
            const status = res.data;
            if (status.status === 'FILLING' || status.status === 'REVIEWING') {
                formStep.value = 'basic';
                currentStepIndex.value = 0;
            }
            else if (status.status === 'PAPER') {
                formStep.value = 'report';
                currentStepIndex.value = 2;
            }
            else if (status.status === 'REPORT') {
                formStep.value = 'report';
                currentStepIndex.value = 3;
            }
        }
    }
    catch (error) {
        console.error(error);
    }
};
onMounted(async () => {
    // 检查申请资格
    try {
        const res = await checkApplyEligibility();
        if (res.code === 200) {
            if (!res.data.eligible) {
                ElMessage.warning(res.data.reason);
            }
        }
    }
    catch (error) {
        console.error(error);
    }
    // 获取当前状态
    await fetchStatus();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['flow-step']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-steps']} */ ;
/** @type {__VLS_StyleScopedClasses['flow-step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-number']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "apply-container" },
});
/** @type {__VLS_StyleScopedClasses['apply-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "page-desc" },
});
/** @type {__VLS_StyleScopedClasses['page-desc']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flow-section" },
});
/** @type {__VLS_StyleScopedClasses['flow-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flow-steps" },
});
/** @type {__VLS_StyleScopedClasses['flow-steps']} */ ;
for (const [step, index] of __VLS_vFor((__VLS_ctx.flowSteps))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flow-step" },
        key: (index),
        ...{ class: ({ active: __VLS_ctx.currentStepIndex >= index, current: __VLS_ctx.currentStepIndex === index }) },
    });
    /** @type {__VLS_StyleScopedClasses['flow-step']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['current']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-number" },
    });
    /** @type {__VLS_StyleScopedClasses['step-number']} */ ;
    (index + 1);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-info" },
    });
    /** @type {__VLS_StyleScopedClasses['step-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-name" },
    });
    /** @type {__VLS_StyleScopedClasses['step-name']} */ ;
    (step.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "step-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['step-desc']} */ ;
    (step.desc);
    // @ts-ignore
    [flowSteps, currentStepIndex, currentStepIndex,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-section" },
});
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
if (__VLS_ctx.formStep === 'basic') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-card" },
    });
    /** @type {__VLS_StyleScopedClasses['form-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "card-title" },
    });
    /** @type {__VLS_StyleScopedClasses['card-title']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        model: (__VLS_ctx.basicForm),
        rules: (__VLS_ctx.basicRules),
        ref: "basicFormRef",
        labelPosition: "top",
        ...{ class: "apply-form" },
    }));
    const __VLS_2 = __VLS_1({
        model: (__VLS_ctx.basicForm),
        rules: (__VLS_ctx.basicRules),
        ref: "basicFormRef",
        labelPosition: "top",
        ...{ class: "apply-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_5 = {};
    /** @type {__VLS_StyleScopedClasses['apply-form']} */ ;
    const { default: __VLS_7 } = __VLS_3.slots;
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        label: "真实姓名",
        prop: "realName",
    }));
    const __VLS_10 = __VLS_9({
        label: "真实姓名",
        prop: "realName",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const { default: __VLS_13 } = __VLS_11.slots;
    let __VLS_14;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        modelValue: (__VLS_ctx.basicForm.realName),
        placeholder: "请输入真实姓名",
    }));
    const __VLS_16 = __VLS_15({
        modelValue: (__VLS_ctx.basicForm.realName),
        placeholder: "请输入真实姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    // @ts-ignore
    [formStep, basicForm, basicForm, basicRules,];
    var __VLS_11;
    let __VLS_19;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        label: "手机号码",
        prop: "phone",
    }));
    const __VLS_21 = __VLS_20({
        label: "手机号码",
        prop: "phone",
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    const { default: __VLS_24 } = __VLS_22.slots;
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        modelValue: (__VLS_ctx.basicForm.phone),
        placeholder: "请输入手机号码",
    }));
    const __VLS_27 = __VLS_26({
        modelValue: (__VLS_ctx.basicForm.phone),
        placeholder: "请输入手机号码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    // @ts-ignore
    [basicForm,];
    var __VLS_22;
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        label: "国家/地区",
        prop: "country",
    }));
    const __VLS_32 = __VLS_31({
        label: "国家/地区",
        prop: "country",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const { default: __VLS_35 } = __VLS_33.slots;
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        modelValue: (__VLS_ctx.basicForm.country),
        placeholder: "请输入国家/地区",
    }));
    const __VLS_38 = __VLS_37({
        modelValue: (__VLS_ctx.basicForm.country),
        placeholder: "请输入国家/地区",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    // @ts-ignore
    [basicForm,];
    var __VLS_33;
    let __VLS_41;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        label: "联系方式（微信/邮箱）",
        prop: "contactWechat",
    }));
    const __VLS_43 = __VLS_42({
        label: "联系方式（微信/邮箱）",
        prop: "contactWechat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    const { default: __VLS_46 } = __VLS_44.slots;
    let __VLS_47;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        modelValue: (__VLS_ctx.basicForm.contactWechat),
        placeholder: "请输入微信号或邮箱",
    }));
    const __VLS_49 = __VLS_48({
        modelValue: (__VLS_ctx.basicForm.contactWechat),
        placeholder: "请输入微信号或邮箱",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    // @ts-ignore
    [basicForm,];
    var __VLS_44;
    let __VLS_52;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        label: "咨询个案时长",
        prop: "caseHours",
    }));
    const __VLS_54 = __VLS_53({
        label: "咨询个案时长",
        prop: "caseHours",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const { default: __VLS_57 } = __VLS_55.slots;
    let __VLS_58;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        modelValue: (__VLS_ctx.basicForm.caseHours),
        placeholder: "请选择咨询个案时长",
        ...{ class: "full-width" },
    }));
    const __VLS_60 = __VLS_59({
        modelValue: (__VLS_ctx.basicForm.caseHours),
        placeholder: "请选择咨询个案时长",
        ...{ class: "full-width" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    /** @type {__VLS_StyleScopedClasses['full-width']} */ ;
    const { default: __VLS_63 } = __VLS_61.slots;
    let __VLS_64;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
        label: "少于500小时",
        value: "less_500",
    }));
    const __VLS_66 = __VLS_65({
        label: "少于500小时",
        value: "less_500",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_69;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
        label: "500-1000小时",
        value: "500_1000",
    }));
    const __VLS_71 = __VLS_70({
        label: "500-1000小时",
        value: "500_1000",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_74;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        label: "1000-3000小时",
        value: "1000_3000",
    }));
    const __VLS_76 = __VLS_75({
        label: "1000-3000小时",
        value: "1000_3000",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_79;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
        label: "3000小时以上",
        value: "more_3000",
    }));
    const __VLS_81 = __VLS_80({
        label: "3000小时以上",
        value: "more_3000",
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    // @ts-ignore
    [basicForm,];
    var __VLS_61;
    // @ts-ignore
    [];
    var __VLS_55;
    let __VLS_84;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        label: "个体督导时长",
        prop: "supervisionHours",
    }));
    const __VLS_86 = __VLS_85({
        label: "个体督导时长",
        prop: "supervisionHours",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const { default: __VLS_89 } = __VLS_87.slots;
    let __VLS_90;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        modelValue: (__VLS_ctx.basicForm.supervisionHours),
        placeholder: "请选择个体督导时长",
        ...{ class: "full-width" },
    }));
    const __VLS_92 = __VLS_91({
        modelValue: (__VLS_ctx.basicForm.supervisionHours),
        placeholder: "请选择个体督导时长",
        ...{ class: "full-width" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    /** @type {__VLS_StyleScopedClasses['full-width']} */ ;
    const { default: __VLS_95 } = __VLS_93.slots;
    let __VLS_96;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
        label: "少于80小时",
        value: "less_80",
    }));
    const __VLS_98 = __VLS_97({
        label: "少于80小时",
        value: "less_80",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_101;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
        label: "80-150小时",
        value: "80_150",
    }));
    const __VLS_103 = __VLS_102({
        label: "80-150小时",
        value: "80_150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    let __VLS_106;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
        label: "150小时以上",
        value: "more_150",
    }));
    const __VLS_108 = __VLS_107({
        label: "150小时以上",
        value: "more_150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    // @ts-ignore
    [basicForm,];
    var __VLS_93;
    // @ts-ignore
    [];
    var __VLS_87;
    let __VLS_111;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
        label: "咨询定价（元/小时）",
        prop: "consultationPrice",
    }));
    const __VLS_113 = __VLS_112({
        label: "咨询定价（元/小时）",
        prop: "consultationPrice",
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    const { default: __VLS_116 } = __VLS_114.slots;
    let __VLS_117;
    /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
    elInputNumber;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
        modelValue: (__VLS_ctx.basicForm.consultationPrice),
        min: (0),
        step: (50),
        ...{ class: "full-width" },
    }));
    const __VLS_119 = __VLS_118({
        modelValue: (__VLS_ctx.basicForm.consultationPrice),
        min: (0),
        step: (50),
        ...{ class: "full-width" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    /** @type {__VLS_StyleScopedClasses['full-width']} */ ;
    // @ts-ignore
    [basicForm,];
    var __VLS_114;
    let __VLS_122;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
        label: "学历及相关专业",
        prop: "education",
    }));
    const __VLS_124 = __VLS_123({
        label: "学历及相关专业",
        prop: "education",
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    const { default: __VLS_127 } = __VLS_125.slots;
    let __VLS_128;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
        modelValue: (__VLS_ctx.basicForm.education),
        placeholder: "请输入学历及相关专业",
    }));
    const __VLS_130 = __VLS_129({
        modelValue: (__VLS_ctx.basicForm.education),
        placeholder: "请输入学历及相关专业",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    // @ts-ignore
    [basicForm,];
    var __VLS_125;
    let __VLS_133;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
        label: "个人简历（PDF/Word/图片）",
        prop: "resumeUrl",
    }));
    const __VLS_135 = __VLS_134({
        label: "个人简历（PDF/Word/图片）",
        prop: "resumeUrl",
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    const { default: __VLS_138 } = __VLS_136.slots;
    let __VLS_139;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleResumeSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        limit: (1),
    }));
    const __VLS_141 = __VLS_140({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleResumeSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        limit: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    /** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
    const { default: __VLS_144 } = __VLS_142.slots;
    let __VLS_145;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
        type: "default",
        plain: true,
    }));
    const __VLS_147 = __VLS_146({
        type: "default",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    const { default: __VLS_150 } = __VLS_148.slots;
    // @ts-ignore
    [token, handleResumeSuccess, beforeUpload,];
    var __VLS_148;
    {
        const { tip: __VLS_151 } = __VLS_142.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "upload-tip" },
        });
        /** @type {__VLS_StyleScopedClasses['upload-tip']} */ ;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_142;
    if (__VLS_ctx.basicForm.resumeUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "uploaded-file" },
        });
        /** @type {__VLS_StyleScopedClasses['uploaded-file']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.basicForm.resumeUrl);
    }
    // @ts-ignore
    [basicForm, basicForm,];
    var __VLS_136;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    let __VLS_152;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_154 = __VLS_153({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    let __VLS_157;
    const __VLS_158 = ({ click: {} },
        { onClick: (__VLS_ctx.submitBasicInfo) });
    const { default: __VLS_159 } = __VLS_155.slots;
    // @ts-ignore
    [submitting, submitBasicInfo,];
    var __VLS_155;
    var __VLS_156;
    // @ts-ignore
    [];
    var __VLS_3;
}
if (__VLS_ctx.formStep === 'report') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-card" },
    });
    /** @type {__VLS_StyleScopedClasses['form-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "card-title" },
    });
    /** @type {__VLS_StyleScopedClasses['card-title']} */ ;
    let __VLS_160;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent1(__VLS_160, new __VLS_160({
        model: (__VLS_ctx.reportForm),
        rules: (__VLS_ctx.reportRules),
        ref: "reportFormRef",
        labelPosition: "top",
        ...{ class: "apply-form" },
    }));
    const __VLS_162 = __VLS_161({
        model: (__VLS_ctx.reportForm),
        rules: (__VLS_ctx.reportRules),
        ref: "reportFormRef",
        labelPosition: "top",
        ...{ class: "apply-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    var __VLS_165 = {};
    /** @type {__VLS_StyleScopedClasses['apply-form']} */ ;
    const { default: __VLS_167 } = __VLS_163.slots;
    let __VLS_168;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
        label: "专业资质材料附件",
    }));
    const __VLS_170 = __VLS_169({
        label: "专业资质材料附件",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    const { default: __VLS_173 } = __VLS_171.slots;
    let __VLS_174;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleQualificationSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        multiple: true,
    }));
    const __VLS_176 = __VLS_175({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleQualificationSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        multiple: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    /** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
    const { default: __VLS_179 } = __VLS_177.slots;
    let __VLS_180;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
        type: "default",
        plain: true,
    }));
    const __VLS_182 = __VLS_181({
        type: "default",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    const { default: __VLS_185 } = __VLS_183.slots;
    // @ts-ignore
    [formStep, token, beforeUpload, reportForm, reportRules, handleQualificationSuccess,];
    var __VLS_183;
    // @ts-ignore
    [];
    var __VLS_177;
    // @ts-ignore
    [];
    var __VLS_171;
    let __VLS_186;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({
        label: "督导证明附件",
    }));
    const __VLS_188 = __VLS_187({
        label: "督导证明附件",
    }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    const { default: __VLS_191 } = __VLS_189.slots;
    let __VLS_192;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleSupervisionSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        multiple: true,
    }));
    const __VLS_194 = __VLS_193({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleSupervisionSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        multiple: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    /** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
    const { default: __VLS_197 } = __VLS_195.slots;
    let __VLS_198;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({
        type: "default",
        plain: true,
    }));
    const __VLS_200 = __VLS_199({
        type: "default",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    const { default: __VLS_203 } = __VLS_201.slots;
    // @ts-ignore
    [token, beforeUpload, handleSupervisionSuccess,];
    var __VLS_201;
    // @ts-ignore
    [];
    var __VLS_195;
    // @ts-ignore
    [];
    var __VLS_189;
    let __VLS_204;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
        label: "个人体验证明（如有）",
    }));
    const __VLS_206 = __VLS_205({
        label: "个人体验证明（如有）",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    const { default: __VLS_209 } = __VLS_207.slots;
    let __VLS_210;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleExperienceSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        multiple: true,
    }));
    const __VLS_212 = __VLS_211({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleExperienceSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        multiple: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_211));
    /** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
    const { default: __VLS_215 } = __VLS_213.slots;
    let __VLS_216;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
        type: "default",
        plain: true,
    }));
    const __VLS_218 = __VLS_217({
        type: "default",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    const { default: __VLS_221 } = __VLS_219.slots;
    // @ts-ignore
    [token, beforeUpload, handleExperienceSuccess,];
    var __VLS_219;
    // @ts-ignore
    [];
    var __VLS_213;
    // @ts-ignore
    [];
    var __VLS_207;
    let __VLS_222;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
        label: "其他相关证明",
    }));
    const __VLS_224 = __VLS_223({
        label: "其他相关证明",
    }, ...__VLS_functionalComponentArgsRest(__VLS_223));
    const { default: __VLS_227 } = __VLS_225.slots;
    let __VLS_228;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent1(__VLS_228, new __VLS_228({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleOtherSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        multiple: true,
    }));
    const __VLS_230 = __VLS_229({
        ...{ class: "upload-area" },
        action: "/api/psychologist-apply/upload",
        headers: ({ token: __VLS_ctx.token }),
        onSuccess: (__VLS_ctx.handleOtherSuccess),
        beforeUpload: (__VLS_ctx.beforeUpload),
        accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
        multiple: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    /** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
    const { default: __VLS_233 } = __VLS_231.slots;
    let __VLS_234;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent1(__VLS_234, new __VLS_234({
        type: "default",
        plain: true,
    }));
    const __VLS_236 = __VLS_235({
        type: "default",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    const { default: __VLS_239 } = __VLS_237.slots;
    // @ts-ignore
    [token, beforeUpload, handleOtherSuccess,];
    var __VLS_237;
    // @ts-ignore
    [];
    var __VLS_231;
    // @ts-ignore
    [];
    var __VLS_225;
    let __VLS_240;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent1(__VLS_240, new __VLS_240({
        label: "个人自我叙述",
        prop: "selfNarration",
    }));
    const __VLS_242 = __VLS_241({
        label: "个人自我叙述",
        prop: "selfNarration",
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    const { default: __VLS_245 } = __VLS_243.slots;
    let __VLS_246;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent1(__VLS_246, new __VLS_246({
        type: "textarea",
        modelValue: (__VLS_ctx.reportForm.selfNarration),
        rows: (6),
        placeholder: "请简要叙述您的职业经历、咨询理念等",
    }));
    const __VLS_248 = __VLS_247({
        type: "textarea",
        modelValue: (__VLS_ctx.reportForm.selfNarration),
        rows: (6),
        placeholder: "请简要叙述您的职业经历、咨询理念等",
    }, ...__VLS_functionalComponentArgsRest(__VLS_247));
    // @ts-ignore
    [reportForm,];
    var __VLS_243;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    let __VLS_251;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_252 = __VLS_asFunctionalComponent1(__VLS_251, new __VLS_251({
        ...{ 'onClick': {} },
        size: "large",
    }));
    const __VLS_253 = __VLS_252({
        ...{ 'onClick': {} },
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_252));
    let __VLS_256;
    const __VLS_257 = ({ click: {} },
        { onClick: (__VLS_ctx.goBack) });
    const { default: __VLS_258 } = __VLS_254.slots;
    // @ts-ignore
    [goBack,];
    var __VLS_254;
    var __VLS_255;
    let __VLS_259;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_260 = __VLS_asFunctionalComponent1(__VLS_259, new __VLS_259({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_261 = __VLS_260({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_260));
    let __VLS_264;
    const __VLS_265 = ({ click: {} },
        { onClick: (__VLS_ctx.submitReport) });
    const { default: __VLS_266 } = __VLS_262.slots;
    // @ts-ignore
    [submitting, submitReport,];
    var __VLS_262;
    var __VLS_263;
    // @ts-ignore
    [];
    var __VLS_163;
}
// @ts-ignore
var __VLS_6 = __VLS_5, __VLS_166 = __VLS_165;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
