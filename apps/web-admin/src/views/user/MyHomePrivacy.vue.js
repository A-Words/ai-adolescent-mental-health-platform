/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getPrivacySetting, updatePrivacySetting } from '@/api/userStats';
const loading = ref(false);
const saving = ref(false);
const form = reactive({
    allowViewArticles: 1,
    allowViewLikes: 1,
    allowViewCollections: 1,
    allowViewFollowings: 0,
    allowViewFans: 0
});
const fetchPrivacy = async () => {
    loading.value = true;
    try {
        const res = await getPrivacySetting();
        if (res.code === 200) {
            form.allowViewArticles = res.data.allowViewArticles ? 1 : 0;
            form.allowViewLikes = res.data.allowViewLikes ? 1 : 0;
            form.allowViewCollections = res.data.allowViewCollections ? 1 : 0;
            form.allowViewFollowings = res.data.allowViewFollowings ? 1 : 0;
            form.allowViewFans = res.data.allowViewFans ? 1 : 0;
        }
    }
    catch (error) {
        ElMessage.error('获取隐私设置失败');
    }
    finally {
        loading.value = false;
    }
};
const handleSave = async () => {
    saving.value = true;
    try {
        const res = await updatePrivacySetting(form);
        if (res.code === 200) {
            ElMessage.success(res.data);
        }
    }
    catch (error) {
        ElMessage.error(error.message || '保存失败');
    }
    finally {
        saving.value = false;
    }
};
onMounted(() => {
    fetchPrivacy();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-home-privacy" },
});
/** @type {__VLS_StyleScopedClasses['my-home-privacy']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    model: (__VLS_ctx.form),
    labelWidth: "200px",
}));
const __VLS_2 = __VLS_1({
    model: (__VLS_ctx.form),
    labelWidth: "200px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "允许他人查看我的文章",
}));
const __VLS_8 = __VLS_7({
    label: "允许他人查看我的文章",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.form.allowViewArticles),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.form.allowViewArticles),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
// @ts-ignore
[form, form, vLoading, loading,];
var __VLS_9;
let __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
    label: "允许他人查看我的点赞",
}));
const __VLS_19 = __VLS_18({
    label: "允许他人查看我的点赞",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const { default: __VLS_22 } = __VLS_20.slots;
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.form.allowViewLikes),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.form.allowViewLikes),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
// @ts-ignore
[form,];
var __VLS_20;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    label: "允许他人查看我的收藏",
}));
const __VLS_30 = __VLS_29({
    label: "允许他人查看我的收藏",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const { default: __VLS_33 } = __VLS_31.slots;
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.form.allowViewCollections),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.form.allowViewCollections),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
// @ts-ignore
[form,];
var __VLS_31;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    label: "允许他人查看我的关注列表",
}));
const __VLS_41 = __VLS_40({
    label: "允许他人查看我的关注列表",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_44 } = __VLS_42.slots;
let __VLS_45;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    modelValue: (__VLS_ctx.form.allowViewFollowings),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_47 = __VLS_46({
    modelValue: (__VLS_ctx.form.allowViewFollowings),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
// @ts-ignore
[form,];
var __VLS_42;
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    label: "允许他人查看我的粉丝列表",
}));
const __VLS_52 = __VLS_51({
    label: "允许他人查看我的粉丝列表",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const { default: __VLS_55 } = __VLS_53.slots;
let __VLS_56;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.form.allowViewFans),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.form.allowViewFans),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
// @ts-ignore
[form,];
var __VLS_53;
let __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({}));
const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const { default: __VLS_66 } = __VLS_64.slots;
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}));
const __VLS_69 = __VLS_68({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
let __VLS_72;
const __VLS_73 = ({ click: {} },
    { onClick: (__VLS_ctx.handleSave) });
const { default: __VLS_74 } = __VLS_70.slots;
// @ts-ignore
[saving, handleSave,];
var __VLS_70;
var __VLS_71;
// @ts-ignore
[];
var __VLS_64;
// @ts-ignore
[];
var __VLS_3;
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert | typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
elAlert;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    type: "info",
    closable: (false),
    ...{ style: {} },
}));
const __VLS_77 = __VLS_76({
    type: "info",
    closable: (false),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
const { default: __VLS_80 } = __VLS_78.slots;
{
    const { title: __VLS_81 } = __VLS_78.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        id: "privacy-font",
    });
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_78;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
