/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTemplate, submitAssessment } from '@/api/assessment';
import { getPatientContacts } from '@/api/user';
import { ElMessage } from 'element-plus';
const route = useRoute();
const router = useRouter();
const template = ref(null);
const questions = ref([]);
const loading = ref(false);
const answers = reactive({});
const submitting = ref(false);
const formRef = ref();
const patients = ref([]);
const selectedPatientId = ref();
const fetchPatients = async () => {
    try {
        const res = await getPatientContacts();
        if (res.code === 200) {
            patients.value = res.data;
            if (patients.value.length > 0) {
                selectedPatientId.value = patients.value[0].id;
            }
        }
    }
    catch (e) {
        ElMessage.error('加载就诊人失败');
    }
};
const fetchTemplate = async () => {
    const id = Number(route.params.id);
    loading.value = true;
    try {
        const res = await getTemplate(id);
        if (res.code === 200) {
            template.value = res.data;
            const json = typeof res.data.questionsJson === 'string'
                ? JSON.parse(res.data.questionsJson)
                : res.data.questionsJson;
            questions.value = json;
        }
        else {
            ElMessage.error(res.message || '加载量表失败');
        }
    }
    catch (error) {
        ElMessage.error('网络错误，请稍后再试');
    }
    finally {
        loading.value = false;
    }
};
const submit = async () => {
    if (!selectedPatientId.value) {
        ElMessage.warning('请选择测评对象');
        return;
    }
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            submitting.value = true;
            try {
                const res = await submitAssessment(template.value.id, selectedPatientId.value, answers);
                if (res.code === 200) {
                    ElMessage.success('提交成功');
                    router.push('/assessment-history');
                }
                else {
                    ElMessage.error(res.message);
                }
            }
            catch (error) {
                ElMessage.error('提交失败');
            }
            finally {
                submitting.value = false;
            }
        }
    });
};
onMounted(() => {
    fetchTemplate();
    fetchPatients();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.template) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "assessment-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['assessment-detail']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    (__VLS_ctx.template.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "description" },
    });
    /** @type {__VLS_StyleScopedClasses['description']} */ ;
    (__VLS_ctx.template.description);
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
    elCard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        shadow: "never",
        ...{ class: "patient-card" },
    }));
    const __VLS_2 = __VLS_1({
        shadow: "never",
        ...{ class: "patient-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['patient-card']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
    elRadioGroup;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        modelValue: (__VLS_ctx.selectedPatientId),
        ...{ class: "patient-radios" },
    }));
    const __VLS_8 = __VLS_7({
        modelValue: (__VLS_ctx.selectedPatientId),
        ...{ class: "patient-radios" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['patient-radios']} */ ;
    const { default: __VLS_11 } = __VLS_9.slots;
    for (const [p] of __VLS_vFor((__VLS_ctx.patients))) {
        let __VLS_12;
        /** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
        elRadio;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
            key: (p.id),
            label: (p.id),
            border: true,
        }));
        const __VLS_14 = __VLS_13({
            key: (p.id),
            label: (p.id),
            border: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        const { default: __VLS_17 } = __VLS_15.slots;
        (p.name);
        (p.relationship);
        // @ts-ignore
        [template, template, template, selectedPatientId, patients,];
        var __VLS_15;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_9;
    if (__VLS_ctx.patients.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-patient-tip" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-patient-tip']} */ ;
        let __VLS_18;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }));
        const __VLS_20 = __VLS_19({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        let __VLS_23;
        const __VLS_24 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.template))
                        return;
                    if (!(__VLS_ctx.patients.length === 0))
                        return;
                    __VLS_ctx.router.push('/user/patient');
                    // @ts-ignore
                    [patients, router,];
                } });
        const { default: __VLS_25 } = __VLS_21.slots;
        // @ts-ignore
        [];
        var __VLS_21;
        var __VLS_22;
    }
    else if (!__VLS_ctx.selectedPatientId) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "error-tip" },
        });
        /** @type {__VLS_StyleScopedClasses['error-tip']} */ ;
    }
    // @ts-ignore
    [selectedPatientId,];
    var __VLS_3;
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        ref: "formRef",
        model: (__VLS_ctx.answers),
        labelPosition: "top",
    }));
    const __VLS_28 = __VLS_27({
        ref: "formRef",
        model: (__VLS_ctx.answers),
        labelPosition: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    var __VLS_31 = {};
    const { default: __VLS_33 } = __VLS_29.slots;
    for (const [q, index] of __VLS_vFor((__VLS_ctx.questions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (index),
            ...{ class: "question-item" },
        });
        /** @type {__VLS_StyleScopedClasses['question-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (index + 1);
        (q.text);
        let __VLS_34;
        /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
        elFormItem;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
            prop: (`q${index}`),
            rules: ({ required: true, message: '请选择', trigger: 'change' }),
        }));
        const __VLS_36 = __VLS_35({
            prop: (`q${index}`),
            rules: ({ required: true, message: '请选择', trigger: 'change' }),
        }, ...__VLS_functionalComponentArgsRest(__VLS_35));
        const { default: __VLS_39 } = __VLS_37.slots;
        let __VLS_40;
        /** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
        elRadioGroup;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            modelValue: (__VLS_ctx.answers[`q${index}`]),
        }));
        const __VLS_42 = __VLS_41({
            modelValue: (__VLS_ctx.answers[`q${index}`]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        const { default: __VLS_45 } = __VLS_43.slots;
        for (const [opt] of __VLS_vFor((q.options))) {
            let __VLS_46;
            /** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
            elRadio;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
                key: (opt.value),
                label: (opt.value),
            }));
            const __VLS_48 = __VLS_47({
                key: (opt.value),
                label: (opt.value),
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
            const { default: __VLS_51 } = __VLS_49.slots;
            (opt.label);
            // @ts-ignore
            [answers, answers, questions,];
            var __VLS_49;
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_43;
        // @ts-ignore
        [];
        var __VLS_37;
        // @ts-ignore
        [];
    }
    let __VLS_52;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_57;
    const __VLS_58 = ({ click: {} },
        { onClick: (__VLS_ctx.submit) });
    const { default: __VLS_59 } = __VLS_55.slots;
    // @ts-ignore
    [submitting, submit,];
    var __VLS_55;
    var __VLS_56;
    // @ts-ignore
    [];
    var __VLS_29;
}
else {
    let __VLS_60;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
        description: "加载中...",
    }));
    const __VLS_62 = __VLS_61({
        description: "加载中...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    var __VLS_65 = {};
    var __VLS_63;
}
// @ts-ignore
var __VLS_32 = __VLS_31;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
