/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getBookAdminDetail, addBook, updateBook } from '@/api/adminBook';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
const router = useRouter();
const route = useRoute();
const formRef = ref();
const submitting = ref(false);
const isEdit = computed(() => !!route.params.id);
const form = reactive({
    id: undefined,
    title: '',
    coverUrl: '',
    description: '',
    address: '',
    sortOrder: 0,
    status: 1
});
const rules = {
    title: [
        { required: true, message: '请输入书籍标题', trigger: 'blur' }
    ]
};
const uploadHeaders = {
    'token': localStorage.getItem('token') || ''
};
const handleCoverSuccess = (response) => {
    if (response.code === 200) {
        form.coverUrl = response.data;
        ElMessage.success('封面上传成功');
    }
    else {
        ElMessage.error(response.message || '封面上传失败');
    }
};
const beforeCoverUpload = (rawFile) => {
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('封面图片必须是 JPG 或 PNG 格式');
        return false;
    }
    else if (rawFile.size / 1024 / 1024 > 5) {
        ElMessage.error('封面图片大小不能超过 5MB');
        return false;
    }
    return true;
};
const fetchBookDetail = async (id) => {
    try {
        const res = await getBookAdminDetail(id);
        if (res.code === 200) {
            Object.assign(form, res.data);
        }
        else {
            ElMessage.error(res.message || '获取书籍详情失败');
        }
    }
    catch (error) {
        ElMessage.error('获取书籍详情失败');
    }
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
    }
    catch (error) {
        return;
    }
    submitting.value = true;
    try {
        const submitData = {
            title: form.title,
            coverUrl: form.coverUrl,
            description: form.description,
            address: form.address,
            sortOrder: form.sortOrder,
            status: form.status
        };
        let res;
        if (isEdit.value && form.id) {
            res = await updateBook(form.id, submitData);
        }
        else {
            res = await addBook(submitData);
        }
        if (res.code === 200) {
            ElMessage.success('保存成功');
            goBack();
        }
        else {
            ElMessage.error(res.message || '保存失败');
        }
    }
    catch (error) {
        ElMessage.error('保存失败');
    }
    finally {
        submitting.value = false;
    }
};
const goBack = () => {
    router.push('/admin/content/books');
};
onMounted(() => {
    const bookId = route.params.id;
    if (bookId) {
        fetchBookDetail(Number(bookId));
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-placeholder']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "book-editor" },
});
/** @type {__VLS_StyleScopedClasses['book-editor']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
(__VLS_ctx.isEdit ? '编辑书籍' : '新增书籍');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[isEdit, goBack,];
var __VLS_3;
var __VLS_4;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ click: {} },
    { onClick: (__VLS_ctx.handleSubmit) });
const { default: __VLS_15 } = __VLS_11.slots;
// @ts-ignore
[handleSubmit,];
var __VLS_11;
var __VLS_12;
let __VLS_16;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    ...{ class: "form-card" },
}));
const __VLS_18 = __VLS_17({
    ...{ class: "form-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
/** @type {__VLS_StyleScopedClasses['form-card']} */ ;
const { default: __VLS_21 } = __VLS_19.slots;
let __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
    model: (__VLS_ctx.form),
    labelWidth: "120px",
    rules: (__VLS_ctx.rules),
    ref: "formRef",
}));
const __VLS_24 = __VLS_23({
    model: (__VLS_ctx.form),
    labelWidth: "120px",
    rules: (__VLS_ctx.rules),
    ref: "formRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
var __VLS_27 = {};
const { default: __VLS_29 } = __VLS_25.slots;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    label: "书籍标题",
    prop: "title",
}));
const __VLS_32 = __VLS_31({
    label: "书籍标题",
    prop: "title",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const { default: __VLS_35 } = __VLS_33.slots;
let __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "请输入书籍标题",
    maxlength: "200",
    showWordLimit: true,
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "请输入书籍标题",
    maxlength: "200",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
// @ts-ignore
[form, form, rules,];
var __VLS_33;
let __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    label: "封面图片",
    prop: "coverUrl",
}));
const __VLS_43 = __VLS_42({
    label: "封面图片",
    prop: "coverUrl",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
const { default: __VLS_46 } = __VLS_44.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cover-upload" },
});
/** @type {__VLS_StyleScopedClasses['cover-upload']} */ ;
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    ...{ class: "avatar-uploader" },
    action: "/api/content/course/cover/upload",
    headers: (__VLS_ctx.uploadHeaders),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleCoverSuccess),
    beforeUpload: (__VLS_ctx.beforeCoverUpload),
}));
const __VLS_49 = __VLS_48({
    ...{ class: "avatar-uploader" },
    action: "/api/content/course/cover/upload",
    headers: (__VLS_ctx.uploadHeaders),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleCoverSuccess),
    beforeUpload: (__VLS_ctx.beforeCoverUpload),
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
const { default: __VLS_52 } = __VLS_50.slots;
if (__VLS_ctx.form.coverUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.form.coverUrl),
        ...{ class: "cover-preview" },
    });
    /** @type {__VLS_StyleScopedClasses['cover-preview']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cover-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['cover-placeholder']} */ ;
    let __VLS_53;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        ...{ class: "upload-icon" },
    }));
    const __VLS_55 = __VLS_54({
        ...{ class: "upload-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    /** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
    const { default: __VLS_58 } = __VLS_56.slots;
    let __VLS_59;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({}));
    const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
    // @ts-ignore
    [form, form, uploadHeaders, handleCoverSuccess, beforeCoverUpload,];
    var __VLS_56;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
[];
var __VLS_50;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cover-tip" },
});
/** @type {__VLS_StyleScopedClasses['cover-tip']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
// @ts-ignore
[];
var __VLS_44;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    label: "书籍简介",
    prop: "description",
}));
const __VLS_66 = __VLS_65({
    label: "书籍简介",
    prop: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (4),
    placeholder: "请输入书籍简介",
    maxlength: "500",
    showWordLimit: true,
}));
const __VLS_72 = __VLS_71({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (4),
    placeholder: "请输入书籍简介",
    maxlength: "500",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
// @ts-ignore
[form,];
var __VLS_67;
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    label: "跳转地址",
    prop: "address",
}));
const __VLS_77 = __VLS_76({
    label: "跳转地址",
    prop: "address",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
const { default: __VLS_80 } = __VLS_78.slots;
let __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
    modelValue: (__VLS_ctx.form.address),
    placeholder: "请输入跳转地址（外部链接）",
}));
const __VLS_83 = __VLS_82({
    modelValue: (__VLS_ctx.form.address),
    placeholder: "请输入跳转地址（外部链接）",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
const { default: __VLS_86 } = __VLS_84.slots;
{
    const { prepend: __VLS_87 } = __VLS_84.slots;
    // @ts-ignore
    [form,];
}
// @ts-ignore
[];
var __VLS_84;
// @ts-ignore
[];
var __VLS_78;
let __VLS_88;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
    label: "排序权重",
    prop: "sortOrder",
}));
const __VLS_90 = __VLS_89({
    label: "排序权重",
    prop: "sortOrder",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const { default: __VLS_93 } = __VLS_91.slots;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    modelValue: (__VLS_ctx.form.sortOrder),
    min: (0),
    max: (9999),
    step: (1),
}));
const __VLS_96 = __VLS_95({
    modelValue: (__VLS_ctx.form.sortOrder),
    min: (0),
    max: (9999),
    step: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "sort-tip" },
});
/** @type {__VLS_StyleScopedClasses['sort-tip']} */ ;
// @ts-ignore
[form,];
var __VLS_91;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    label: "状态",
    prop: "status",
}));
const __VLS_101 = __VLS_100({
    label: "状态",
    prop: "status",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
const { default: __VLS_104 } = __VLS_102.slots;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "上架",
    inactiveText: "下架",
}));
const __VLS_107 = __VLS_106({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "上架",
    inactiveText: "下架",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
// @ts-ignore
[form,];
var __VLS_102;
let __VLS_110;
/** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
elDivider;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({}));
const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
let __VLS_115;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({}));
const __VLS_117 = __VLS_116({}, ...__VLS_functionalComponentArgsRest(__VLS_116));
const { default: __VLS_120 } = __VLS_118.slots;
let __VLS_121;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}));
const __VLS_123 = __VLS_122({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
let __VLS_126;
const __VLS_127 = ({ click: {} },
    { onClick: (__VLS_ctx.handleSubmit) });
const { default: __VLS_128 } = __VLS_124.slots;
// @ts-ignore
[handleSubmit, submitting,];
var __VLS_124;
var __VLS_125;
let __VLS_129;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
    ...{ 'onClick': {} },
}));
const __VLS_131 = __VLS_130({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
let __VLS_134;
const __VLS_135 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
const { default: __VLS_136 } = __VLS_132.slots;
// @ts-ignore
[goBack,];
var __VLS_132;
var __VLS_133;
// @ts-ignore
[];
var __VLS_118;
// @ts-ignore
[];
var __VLS_25;
// @ts-ignore
[];
var __VLS_19;
// @ts-ignore
var __VLS_28 = __VLS_27;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
