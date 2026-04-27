/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch, reactive } from 'vue';
import request from '@/api/user';
import { ElMessage } from 'element-plus';
const props = defineProps();
const emit = defineEmits(['update:modelValue']);
const visible = ref(false);
const activeDay = ref(1);
const generating = ref(false);
const generateRange = ref([]);
const weekDays = reactive([
    { value: 1, label: '周一', shifts: [], maxPatients: 20 },
    { value: 2, label: '周二', shifts: [], maxPatients: 20 },
    { value: 3, label: '周三', shifts: [], maxPatients: 20 },
    { value: 4, label: '周四', shifts: [], maxPatients: 20 },
    { value: 5, label: '周五', shifts: [], maxPatients: 20 },
    { value: 6, label: '周六', shifts: [], maxPatients: 20 },
    { value: 7, label: '周日', shifts: [], maxPatients: 20 },
]);
watch(() => props.modelValue, (val) => {
    visible.value = val;
    if (val && props.doctorId) {
        fetchConfig();
    }
});
const handleClose = () => {
    emit('update:modelValue', false);
};
const fetchConfig = async () => {
    try {
        const res = await request.get(`/consultation/admin/schedule-configs/${props.doctorId}`);
        if (res.code === 200) {
            // Reset
            weekDays.forEach(d => {
                d.shifts = [];
                d.maxPatients = 20;
            });
            // Fill
            res.data.forEach((c) => {
                const day = weekDays.find(d => d.value === c.dayOfWeek);
                if (day) {
                    day.shifts.push(c.workShift);
                    day.maxPatients = c.maxPatients;
                }
            });
        }
    }
    catch (e) { }
};
const saveConfig = async () => {
    const configs = [];
    weekDays.forEach(day => {
        day.shifts.forEach(shift => {
            configs.push({
                doctorId: props.doctorId,
                dayOfWeek: day.value,
                workShift: shift,
                maxPatients: day.maxPatients
            });
        });
    });
    if (configs.length === 0) {
        ElMessage.warning('请至少配置一个班次');
        return;
    }
    try {
        const res = await request.post('/consultation/admin/schedule-config', configs);
        if (res.code === 200) {
            ElMessage.success('配置保存成功');
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) { }
};
const handleGenerate = async () => {
    if (!generateRange.value || generateRange.value.length < 2) {
        ElMessage.warning('请选择生成日期范围');
        return;
    }
    generating.value = true;
    try {
        const res = await request.post('/consultation/admin/schedule/generate', null, {
            params: {
                doctorId: props.doctorId,
                startDate: generateRange.value[0],
                endDate: generateRange.value[1]
            }
        });
        if (res.code === 200) {
            ElMessage.success(res.data || '生成成功');
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
    }
    finally {
        generating.value = false;
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.visible),
    title: "排班设置",
    width: "600px",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.visible),
    title: "排班设置",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ close: {} },
    { onClose: (__VLS_ctx.handleClose) });
var __VLS_7 = {};
const { default: __VLS_8 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "config-container" },
});
/** @type {__VLS_StyleScopedClasses['config-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
let __VLS_9;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent1(__VLS_9, new __VLS_9({
    modelValue: (__VLS_ctx.activeDay),
}));
const __VLS_11 = __VLS_10({
    modelValue: (__VLS_ctx.activeDay),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
const { default: __VLS_14 } = __VLS_12.slots;
for (const [day] of __VLS_vFor((__VLS_ctx.weekDays))) {
    let __VLS_15;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        key: (day.value),
        label: (day.label),
        name: (day.value),
    }));
    const __VLS_17 = __VLS_16({
        key: (day.value),
        label: (day.label),
        name: (day.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    const { default: __VLS_20 } = __VLS_18.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "shift-selector" },
    });
    /** @type {__VLS_StyleScopedClasses['shift-selector']} */ ;
    let __VLS_21;
    /** @ts-ignore @type {typeof __VLS_components.elCheckboxGroup | typeof __VLS_components.ElCheckboxGroup | typeof __VLS_components.elCheckboxGroup | typeof __VLS_components.ElCheckboxGroup} */
    elCheckboxGroup;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        modelValue: (day.shifts),
    }));
    const __VLS_23 = __VLS_22({
        modelValue: (day.shifts),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    const { default: __VLS_26 } = __VLS_24.slots;
    let __VLS_27;
    /** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
    elCheckbox;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        label: (1),
    }));
    const __VLS_29 = __VLS_28({
        label: (1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    const { default: __VLS_32 } = __VLS_30.slots;
    // @ts-ignore
    [visible, handleClose, activeDay, weekDays,];
    var __VLS_30;
    let __VLS_33;
    /** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
    elCheckbox;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
        label: (2),
    }));
    const __VLS_35 = __VLS_34({
        label: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    const { default: __VLS_38 } = __VLS_36.slots;
    // @ts-ignore
    [];
    var __VLS_36;
    let __VLS_39;
    /** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
    elCheckbox;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
        label: (3),
    }));
    const __VLS_41 = __VLS_40({
        label: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    const { default: __VLS_44 } = __VLS_42.slots;
    // @ts-ignore
    [];
    var __VLS_42;
    // @ts-ignore
    [];
    var __VLS_24;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "max-patients" },
    });
    /** @type {__VLS_StyleScopedClasses['max-patients']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_45;
    /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
    elInputNumber;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
        modelValue: (day.maxPatients),
        min: (1),
        max: (100),
    }));
    const __VLS_47 = __VLS_46({
        modelValue: (day.maxPatients),
        min: (1),
        max: (100),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    // @ts-ignore
    [];
    var __VLS_18;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_12;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "generate-section" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['generate-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    modelValue: (__VLS_ctx.generateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    valueFormat: "YYYY-MM-DD",
}));
const __VLS_52 = __VLS_51({
    modelValue: (__VLS_ctx.generateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    valueFormat: "YYYY-MM-DD",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    ...{ 'onClick': {} },
    type: "success",
    loading: (__VLS_ctx.generating),
}));
const __VLS_57 = __VLS_56({
    ...{ 'onClick': {} },
    type: "success",
    loading: (__VLS_ctx.generating),
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
let __VLS_60;
const __VLS_61 = ({ click: {} },
    { onClick: (__VLS_ctx.handleGenerate) });
const { default: __VLS_62 } = __VLS_58.slots;
// @ts-ignore
[generateRange, generating, handleGenerate,];
var __VLS_58;
var __VLS_59;
{
    const { footer: __VLS_63 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_64;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_69;
    const __VLS_70 = ({ click: {} },
        { onClick: (__VLS_ctx.handleClose) });
    const { default: __VLS_71 } = __VLS_67.slots;
    // @ts-ignore
    [handleClose,];
    var __VLS_67;
    var __VLS_68;
    let __VLS_72;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_77;
    const __VLS_78 = ({ click: {} },
        { onClick: (__VLS_ctx.saveConfig) });
    const { default: __VLS_79 } = __VLS_75.slots;
    // @ts-ignore
    [saveConfig,];
    var __VLS_75;
    var __VLS_76;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    emits: {},
    __typeProps: {},
});
export default {};
