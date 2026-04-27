/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Plus, Delete, Top, Bottom, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import request from '@/api/user';
const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const formRef = ref();
const saving = ref(false);
const form = reactive({
    title: '',
    description: '',
    type: 'TRADITIONAL',
    isPublic: 1,
    status: 1
});
// 题目列表
const questions = ref([]);
// 计分规则
const scoringRules = reactive({
    rules: []
});
// 生成唯一key，用于v-for
const generateKey = () => Math.random().toString(36).substring(2, 9);
const fetchTemplate = async () => {
    try {
        const res = await request.get(`/assessment/template/${route.params.id}`);
        if (res.code === 200) {
            Object.assign(form, res.data);
            // 解析 JSON
            if (res.data.questionsJson) {
                let qJson = typeof res.data.questionsJson === 'string' ? JSON.parse(res.data.questionsJson) : res.data.questionsJson;
                questions.value = qJson.map((q) => ({ ...q, _key: generateKey() }));
            }
            if (res.data.scoringRulesJson) {
                let rJson = typeof res.data.scoringRulesJson === 'string' ? JSON.parse(res.data.scoringRulesJson) : res.data.scoringRulesJson;
                if (rJson.rules)
                    scoringRules.rules = rJson.rules;
            }
        }
    }
    catch (e) {
        ElMessage.error('加载数据失败');
    }
};
// 题目操作
const addQuestion = () => {
    questions.value.push({
        _key: generateKey(),
        id: `q${Date.now()}`,
        text: '',
        options: [
            { label: '从不', value: 0 },
            { label: '偶尔', value: 1 },
            { label: '经常', value: 2 },
            { label: '总是', value: 3 }
        ]
    });
};
const removeQuestion = (index) => {
    questions.value.splice(index, 1);
};
const moveUp = (index) => {
    if (index > 0) {
        const temp = questions.value[index];
        questions.value[index] = questions.value[index - 1];
        questions.value[index - 1] = temp;
    }
};
const moveDown = (index) => {
    if (index < questions.value.length - 1) {
        const temp = questions.value[index];
        questions.value[index] = questions.value[index + 1];
        questions.value[index + 1] = temp;
    }
};
// 选项操作
const addOption = (question) => {
    question.options.push({ label: '', value: 0 });
};
const removeOption = (question, optIndex) => {
    question.options.splice(optIndex, 1);
};
// 规则操作
const addRule = () => {
    scoringRules.rules.push({ min: 0, max: 0, level: '', analysis: '' });
};
const removeRule = (index) => {
    scoringRules.rules.splice(index, 1);
};
const save = async (status) => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            if (questions.value.length === 0) {
                ElMessage.warning('请至少添加一道题目');
                return;
            }
            form.status = status;
            // 移除临时 _key
            const cleanQuestions = questions.value.map(q => {
                const { _key, ...rest } = q;
                return rest;
            });
            form.questionsJson = JSON.stringify(cleanQuestions);
            form.scoringRulesJson = JSON.stringify(scoringRules);
            saving.value = true;
            try {
                const res = await request.post('/assessment/template', form);
                if (res.code === 200) {
                    ElMessage.success(status === 1 ? '发布成功' : '草稿保存成功');
                    goBack();
                }
                else {
                    ElMessage.error(res.message);
                }
            }
            catch (e) {
                ElMessage.error('保存失败');
            }
            finally {
                saving.value = false;
            }
        }
    });
};
const goBack = () => {
    router.push('/admin/content/assessments');
};
onMounted(() => {
    if (isEdit.value) {
        fetchTemplate();
    }
    else {
        // 默认提供一题示例
        addQuestion();
        addRule();
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "assessment-editor" },
});
/** @type {__VLS_StyleScopedClasses['assessment-editor']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
(__VLS_ctx.isEdit ? '编辑量表' : '新增量表');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "info",
    loading: (__VLS_ctx.saving),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "info",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.save(0);
            // @ts-ignore
            [isEdit, saving, save,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.save(1);
            // @ts-ignore
            [saving, save,];
        } });
const { default: __VLS_15 } = __VLS_11.slots;
// @ts-ignore
[];
var __VLS_11;
var __VLS_12;
let __VLS_16;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_21;
const __VLS_22 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
const { default: __VLS_23 } = __VLS_19.slots;
// @ts-ignore
[goBack,];
var __VLS_19;
var __VLS_20;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
    ref: "formRef",
    ...{ class: "main-form" },
}));
const __VLS_26 = __VLS_25({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
    ref: "formRef",
    ...{ class: "main-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_29 = {};
/** @type {__VLS_StyleScopedClasses['main-form']} */ ;
const { default: __VLS_31 } = __VLS_27.slots;
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    shadow: "never",
    ...{ class: "section-card" },
}));
const __VLS_34 = __VLS_33({
    shadow: "never",
    ...{ class: "section-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
const { default: __VLS_37 } = __VLS_35.slots;
{
    const { header: __VLS_38 } = __VLS_35.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [form,];
}
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    label: "量表标题",
    prop: "title",
    rules: ({ required: true, message: '请输入标题' }),
}));
const __VLS_41 = __VLS_40({
    label: "量表标题",
    prop: "title",
    rules: ({ required: true, message: '请输入标题' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_44 } = __VLS_42.slots;
let __VLS_45;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "请输入测评量表名称",
}));
const __VLS_47 = __VLS_46({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "请输入测评量表名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
// @ts-ignore
[form,];
var __VLS_42;
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    label: "量表描述",
    prop: "description",
}));
const __VLS_52 = __VLS_51({
    label: "量表描述",
    prop: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const { default: __VLS_55 } = __VLS_53.slots;
let __VLS_56;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    type: "textarea",
    modelValue: (__VLS_ctx.form.description),
    rows: "3",
    placeholder: "量表简介与指导语",
}));
const __VLS_58 = __VLS_57({
    type: "textarea",
    modelValue: (__VLS_ctx.form.description),
    rows: "3",
    placeholder: "量表简介与指导语",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
// @ts-ignore
[form,];
var __VLS_53;
let __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    label: "可见性",
}));
const __VLS_63 = __VLS_62({
    label: "可见性",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const { default: __VLS_66 } = __VLS_64.slots;
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    modelValue: (__VLS_ctx.form.isPublic),
}));
const __VLS_69 = __VLS_68({
    modelValue: (__VLS_ctx.form.isPublic),
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_72 } = __VLS_70.slots;
let __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    label: (1),
}));
const __VLS_75 = __VLS_74({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
const { default: __VLS_78 } = __VLS_76.slots;
// @ts-ignore
[form,];
var __VLS_76;
let __VLS_79;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
    label: (0),
}));
const __VLS_81 = __VLS_80({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
const { default: __VLS_84 } = __VLS_82.slots;
// @ts-ignore
[];
var __VLS_82;
// @ts-ignore
[];
var __VLS_70;
// @ts-ignore
[];
var __VLS_64;
// @ts-ignore
[];
var __VLS_35;
let __VLS_85;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    shadow: "never",
    ...{ class: "section-card" },
}));
const __VLS_87 = __VLS_86({
    shadow: "never",
    ...{ class: "section-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
const { default: __VLS_90 } = __VLS_88.slots;
{
    const { header: __VLS_91 } = __VLS_88.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header-flex" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header-flex']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_92;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        plain: true,
    }));
    const __VLS_94 = __VLS_93({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    let __VLS_97;
    const __VLS_98 = ({ click: {} },
        { onClick: (__VLS_ctx.addQuestion) });
    const { default: __VLS_99 } = __VLS_95.slots;
    let __VLS_100;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({}));
    const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const { default: __VLS_105 } = __VLS_103.slots;
    let __VLS_106;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({}));
    const __VLS_108 = __VLS_107({}, ...__VLS_functionalComponentArgsRest(__VLS_107));
    // @ts-ignore
    [addQuestion,];
    var __VLS_103;
    // @ts-ignore
    [];
    var __VLS_95;
    var __VLS_96;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "questions-container" },
});
/** @type {__VLS_StyleScopedClasses['questions-container']} */ ;
for (const [q, index] of __VLS_vFor((__VLS_ctx.questions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (q._key),
        ...{ class: "question-card" },
    });
    /** @type {__VLS_StyleScopedClasses['question-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "q-header" },
    });
    /** @type {__VLS_StyleScopedClasses['q-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "q-index" },
    });
    /** @type {__VLS_StyleScopedClasses['q-index']} */ ;
    (index + 1);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "q-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['q-actions']} */ ;
    let __VLS_111;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
        ...{ 'onClick': {} },
        size: "small",
        circle: true,
        disabled: (index === 0),
    }));
    const __VLS_113 = __VLS_112({
        ...{ 'onClick': {} },
        size: "small",
        circle: true,
        disabled: (index === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    let __VLS_116;
    const __VLS_117 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.moveUp(index);
                // @ts-ignore
                [questions, moveUp,];
            } });
    const { default: __VLS_118 } = __VLS_114.slots;
    let __VLS_119;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({}));
    const __VLS_121 = __VLS_120({}, ...__VLS_functionalComponentArgsRest(__VLS_120));
    const { default: __VLS_124 } = __VLS_122.slots;
    let __VLS_125;
    /** @ts-ignore @type {typeof __VLS_components.Top} */
    Top;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({}));
    const __VLS_127 = __VLS_126({}, ...__VLS_functionalComponentArgsRest(__VLS_126));
    // @ts-ignore
    [];
    var __VLS_122;
    // @ts-ignore
    [];
    var __VLS_114;
    var __VLS_115;
    let __VLS_130;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
        ...{ 'onClick': {} },
        size: "small",
        circle: true,
        disabled: (index === __VLS_ctx.questions.length - 1),
    }));
    const __VLS_132 = __VLS_131({
        ...{ 'onClick': {} },
        size: "small",
        circle: true,
        disabled: (index === __VLS_ctx.questions.length - 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    let __VLS_135;
    const __VLS_136 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.moveDown(index);
                // @ts-ignore
                [questions, moveDown,];
            } });
    const { default: __VLS_137 } = __VLS_133.slots;
    let __VLS_138;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({}));
    const __VLS_140 = __VLS_139({}, ...__VLS_functionalComponentArgsRest(__VLS_139));
    const { default: __VLS_143 } = __VLS_141.slots;
    let __VLS_144;
    /** @ts-ignore @type {typeof __VLS_components.Bottom} */
    Bottom;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({}));
    const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    // @ts-ignore
    [];
    var __VLS_141;
    // @ts-ignore
    [];
    var __VLS_133;
    var __VLS_134;
    let __VLS_149;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        circle: true,
    }));
    const __VLS_151 = __VLS_150({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        circle: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    let __VLS_154;
    const __VLS_155 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.removeQuestion(index);
                // @ts-ignore
                [removeQuestion,];
            } });
    const { default: __VLS_156 } = __VLS_152.slots;
    let __VLS_157;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({}));
    const __VLS_159 = __VLS_158({}, ...__VLS_functionalComponentArgsRest(__VLS_158));
    const { default: __VLS_162 } = __VLS_160.slots;
    let __VLS_163;
    /** @ts-ignore @type {typeof __VLS_components.Delete} */
    Delete;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({}));
    const __VLS_165 = __VLS_164({}, ...__VLS_functionalComponentArgsRest(__VLS_164));
    // @ts-ignore
    [];
    var __VLS_160;
    // @ts-ignore
    [];
    var __VLS_152;
    var __VLS_153;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "q-body" },
    });
    /** @type {__VLS_StyleScopedClasses['q-body']} */ ;
    let __VLS_168;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
        label: "题干",
        labelWidth: "60px",
        prop: (`questions.${index}.text`),
    }));
    const __VLS_170 = __VLS_169({
        label: "题干",
        labelWidth: "60px",
        prop: (`questions.${index}.text`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    const { default: __VLS_173 } = __VLS_171.slots;
    let __VLS_174;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
        type: "textarea",
        modelValue: (q.text),
        rows: "2",
        placeholder: "请输入题目正文",
    }));
    const __VLS_176 = __VLS_175({
        type: "textarea",
        modelValue: (q.text),
        rows: "2",
        placeholder: "请输入题目正文",
    }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    // @ts-ignore
    [];
    var __VLS_171;
    let __VLS_179;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
        label: "选项配置",
        labelWidth: "60px",
    }));
    const __VLS_181 = __VLS_180({
        label: "选项配置",
        labelWidth: "60px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    const { default: __VLS_184 } = __VLS_182.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "options-list" },
    });
    /** @type {__VLS_StyleScopedClasses['options-list']} */ ;
    for (const [opt, optIndex] of __VLS_vFor((q.options))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (optIndex),
            ...{ class: "option-item" },
        });
        /** @type {__VLS_StyleScopedClasses['option-item']} */ ;
        let __VLS_185;
        /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
        elInput;
        // @ts-ignore
        const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
            modelValue: (opt.label),
            placeholder: "选项文案",
            ...{ style: {} },
        }));
        const __VLS_187 = __VLS_186({
            modelValue: (opt.label),
            placeholder: "选项文案",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "score-label" },
        });
        /** @type {__VLS_StyleScopedClasses['score-label']} */ ;
        let __VLS_190;
        /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
        elInputNumber;
        // @ts-ignore
        const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
            modelValue: (opt.value),
            min: (0),
            max: (100),
            ...{ style: {} },
        }));
        const __VLS_192 = __VLS_191({
            modelValue: (opt.value),
            min: (0),
            max: (100),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_191));
        let __VLS_195;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_196 = __VLS_asFunctionalComponent1(__VLS_195, new __VLS_195({
            ...{ 'onClick': {} },
            type: "danger",
            link: true,
            ...{ style: {} },
        }));
        const __VLS_197 = __VLS_196({
            ...{ 'onClick': {} },
            type: "danger",
            link: true,
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_196));
        let __VLS_200;
        const __VLS_201 = ({ click: {} },
            { onClick: (...[$event]) => {
                    __VLS_ctx.removeOption(q, Number(optIndex));
                    // @ts-ignore
                    [removeOption,];
                } });
        const { default: __VLS_202 } = __VLS_198.slots;
        let __VLS_203;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({}));
        const __VLS_205 = __VLS_204({}, ...__VLS_functionalComponentArgsRest(__VLS_204));
        const { default: __VLS_208 } = __VLS_206.slots;
        let __VLS_209;
        /** @ts-ignore @type {typeof __VLS_components.Close} */
        Close;
        // @ts-ignore
        const __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209({}));
        const __VLS_211 = __VLS_210({}, ...__VLS_functionalComponentArgsRest(__VLS_210));
        // @ts-ignore
        [];
        var __VLS_206;
        // @ts-ignore
        [];
        var __VLS_198;
        var __VLS_199;
        // @ts-ignore
        [];
    }
    let __VLS_214;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent1(__VLS_214, new __VLS_214({
        ...{ 'onClick': {} },
        size: "small",
        dashed: true,
    }));
    const __VLS_216 = __VLS_215({
        ...{ 'onClick': {} },
        size: "small",
        dashed: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    let __VLS_219;
    const __VLS_220 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.addOption(q);
                // @ts-ignore
                [addOption,];
            } });
    const { default: __VLS_221 } = __VLS_217.slots;
    // @ts-ignore
    [];
    var __VLS_217;
    var __VLS_218;
    // @ts-ignore
    [];
    var __VLS_182;
    // @ts-ignore
    [];
}
if (__VLS_ctx.questions.length === 0) {
    let __VLS_222;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
        description: "暂无题目，请点击上方按钮添加",
    }));
    const __VLS_224 = __VLS_223({
        description: "暂无题目，请点击上方按钮添加",
    }, ...__VLS_functionalComponentArgsRest(__VLS_223));
}
// @ts-ignore
[questions,];
var __VLS_88;
let __VLS_227;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
    shadow: "never",
    ...{ class: "section-card" },
}));
const __VLS_229 = __VLS_228({
    shadow: "never",
    ...{ class: "section-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
const { default: __VLS_232 } = __VLS_230.slots;
{
    const { header: __VLS_233 } = __VLS_230.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header-flex" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header-flex']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_234;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent1(__VLS_234, new __VLS_234({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        plain: true,
    }));
    const __VLS_236 = __VLS_235({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    let __VLS_239;
    const __VLS_240 = ({ click: {} },
        { onClick: (__VLS_ctx.addRule) });
    const { default: __VLS_241 } = __VLS_237.slots;
    let __VLS_242;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_243 = __VLS_asFunctionalComponent1(__VLS_242, new __VLS_242({}));
    const __VLS_244 = __VLS_243({}, ...__VLS_functionalComponentArgsRest(__VLS_243));
    const { default: __VLS_247 } = __VLS_245.slots;
    let __VLS_248;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent1(__VLS_248, new __VLS_248({}));
    const __VLS_250 = __VLS_249({}, ...__VLS_functionalComponentArgsRest(__VLS_249));
    // @ts-ignore
    [addRule,];
    var __VLS_245;
    // @ts-ignore
    [];
    var __VLS_237;
    var __VLS_238;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "rules-container" },
});
/** @type {__VLS_StyleScopedClasses['rules-container']} */ ;
for (const [rule, rIndex] of __VLS_vFor((__VLS_ctx.scoringRules.rules))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (rIndex),
        ...{ class: "rule-card" },
    });
    /** @type {__VLS_StyleScopedClasses['rule-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rule-header" },
    });
    /** @type {__VLS_StyleScopedClasses['rule-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (rIndex + 1);
    let __VLS_253;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_254 = __VLS_asFunctionalComponent1(__VLS_253, new __VLS_253({
        ...{ 'onClick': {} },
        type: "danger",
        link: true,
    }));
    const __VLS_255 = __VLS_254({
        ...{ 'onClick': {} },
        type: "danger",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_254));
    let __VLS_258;
    const __VLS_259 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.removeRule(rIndex);
                // @ts-ignore
                [scoringRules, removeRule,];
            } });
    const { default: __VLS_260 } = __VLS_256.slots;
    let __VLS_261;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({}));
    const __VLS_263 = __VLS_262({}, ...__VLS_functionalComponentArgsRest(__VLS_262));
    const { default: __VLS_266 } = __VLS_264.slots;
    let __VLS_267;
    /** @ts-ignore @type {typeof __VLS_components.Delete} */
    Delete;
    // @ts-ignore
    const __VLS_268 = __VLS_asFunctionalComponent1(__VLS_267, new __VLS_267({}));
    const __VLS_269 = __VLS_268({}, ...__VLS_functionalComponentArgsRest(__VLS_268));
    // @ts-ignore
    [];
    var __VLS_264;
    // @ts-ignore
    [];
    var __VLS_256;
    var __VLS_257;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "rule-body" },
    });
    /** @type {__VLS_StyleScopedClasses['rule-body']} */ ;
    let __VLS_272;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent1(__VLS_272, new __VLS_272({
        label: "分数范围",
        labelWidth: "80px",
    }));
    const __VLS_274 = __VLS_273({
        label: "分数范围",
        labelWidth: "80px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    const { default: __VLS_277 } = __VLS_275.slots;
    let __VLS_278;
    /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
    elInputNumber;
    // @ts-ignore
    const __VLS_279 = __VLS_asFunctionalComponent1(__VLS_278, new __VLS_278({
        modelValue: (rule.min),
        min: (0),
        placeholder: "最低分",
    }));
    const __VLS_280 = __VLS_279({
        modelValue: (rule.min),
        min: (0),
        placeholder: "最低分",
    }, ...__VLS_functionalComponentArgsRest(__VLS_279));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ style: {} },
    });
    let __VLS_283;
    /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
    elInputNumber;
    // @ts-ignore
    const __VLS_284 = __VLS_asFunctionalComponent1(__VLS_283, new __VLS_283({
        modelValue: (rule.max),
        min: (0),
        placeholder: "最高分",
    }));
    const __VLS_285 = __VLS_284({
        modelValue: (rule.max),
        min: (0),
        placeholder: "最高分",
    }, ...__VLS_functionalComponentArgsRest(__VLS_284));
    // @ts-ignore
    [];
    var __VLS_275;
    let __VLS_288;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent1(__VLS_288, new __VLS_288({
        label: "风险等级",
        labelWidth: "80px",
    }));
    const __VLS_290 = __VLS_289({
        label: "风险等级",
        labelWidth: "80px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    const { default: __VLS_293 } = __VLS_291.slots;
    let __VLS_294;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_295 = __VLS_asFunctionalComponent1(__VLS_294, new __VLS_294({
        modelValue: (rule.level),
        placeholder: "如：健康、轻度抑郁等",
    }));
    const __VLS_296 = __VLS_295({
        modelValue: (rule.level),
        placeholder: "如：健康、轻度抑郁等",
    }, ...__VLS_functionalComponentArgsRest(__VLS_295));
    // @ts-ignore
    [];
    var __VLS_291;
    let __VLS_299;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent1(__VLS_299, new __VLS_299({
        label: "分析建议",
        labelWidth: "80px",
    }));
    const __VLS_301 = __VLS_300({
        label: "分析建议",
        labelWidth: "80px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    const { default: __VLS_304 } = __VLS_302.slots;
    let __VLS_305;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_306 = __VLS_asFunctionalComponent1(__VLS_305, new __VLS_305({
        type: "textarea",
        modelValue: (rule.analysis),
        rows: "3",
        placeholder: "给用户的分析报告及建议",
    }));
    const __VLS_307 = __VLS_306({
        type: "textarea",
        modelValue: (rule.analysis),
        rows: "3",
        placeholder: "给用户的分析报告及建议",
    }, ...__VLS_functionalComponentArgsRest(__VLS_306));
    // @ts-ignore
    [];
    var __VLS_302;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_230;
// @ts-ignore
[];
var __VLS_27;
// @ts-ignore
var __VLS_30 = __VLS_29;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
