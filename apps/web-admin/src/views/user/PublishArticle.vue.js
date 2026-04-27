/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { publishArticle, uploadArticleCover } from '@/api/userArticle';
import { getArticleTags } from '@/api/articleTag';
import request from '@/api/user';
const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const tags = ref([]);
const form = reactive({
    title: '',
    content: '',
    coverUrl: '',
    tagId: undefined
});
const coverFile = ref(null);
const coverPreview = ref('');
const fetchTags = async () => {
    try {
        const res = await getArticleTags();
        if (res.code === 200) {
            tags.value = res.data;
        }
    }
    catch (error) {
        ElMessage.error('获取标签失败');
    }
};
const beforeCoverUpload = (file) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        ElMessage.error('封面图片必须是 JPG 或 PNG 格式!');
        return false;
    }
    if (file.size / 1024 / 1024 > 3) {
        ElMessage.error('封面图片大小不能超过 3MB!');
        return false;
    }
    return true;
};
const handleCoverChange = (uploadFile) => {
    if (uploadFile.raw) {
        if (!beforeCoverUpload(uploadFile.raw))
            return;
        coverFile.value = uploadFile.raw;
        coverPreview.value = URL.createObjectURL(uploadFile.raw);
    }
};
const handleUploadImage = async (_event, file, callback) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await request.post('/common/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.code === 200) {
            callback(res.data);
        }
    }
    catch (error) {
        ElMessage.error('图片上传失败');
    }
};
const handleSubmit = async () => {
    if (!form.title.trim()) {
        ElMessage.warning('请输入文章标题');
        return;
    }
    if (!form.content.trim()) {
        ElMessage.warning('请输入文章内容');
        return;
    }
    if (!form.tagId) {
        ElMessage.warning('请选择文章标签');
        return;
    }
    submitting.value = true;
    try {
        // 先上传封面
        if (coverFile.value) {
            const res = await uploadArticleCover(coverFile.value);
            if (res.code === 200) {
                form.coverUrl = res.data;
            }
        }
        const res = await publishArticle(form);
        if (res.code === 200) {
            ElMessage.success(res.data);
            router.push('/my-articles');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '提交失败');
    }
    finally {
        submitting.value = false;
    }
};
onMounted(() => {
    fetchTags();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cover-uploader']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "publish-article-container" },
});
/** @type {__VLS_StyleScopedClasses['publish-article-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { header: __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_7;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        ...{ 'onClick': {} },
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/my-articles');
                // @ts-ignore
                [$router,];
            } });
    const { default: __VLS_14 } = __VLS_10.slots;
    // @ts-ignore
    [];
    var __VLS_10;
    var __VLS_11;
    // @ts-ignore
    [];
}
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_17 = __VLS_16({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_20 } = __VLS_18.slots;
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    label: "文章标题",
    required: true,
}));
const __VLS_23 = __VLS_22({
    label: "文章标题",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
const { default: __VLS_26 } = __VLS_24.slots;
let __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "请输入文章标题",
    maxlength: "100",
    showWordLimit: true,
}));
const __VLS_29 = __VLS_28({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "请输入文章标题",
    maxlength: "100",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
// @ts-ignore
[form, form, vLoading, loading,];
var __VLS_24;
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    label: "封面图片",
}));
const __VLS_34 = __VLS_33({
    label: "封面图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const { default: __VLS_37 } = __VLS_35.slots;
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    ...{ class: "cover-uploader" },
    action: "#",
    showFileList: (false),
    onChange: (__VLS_ctx.handleCoverChange),
    beforeUpload: (__VLS_ctx.beforeCoverUpload),
    autoUpload: (false),
}));
const __VLS_40 = __VLS_39({
    ...{ class: "cover-uploader" },
    action: "#",
    showFileList: (false),
    onChange: (__VLS_ctx.handleCoverChange),
    beforeUpload: (__VLS_ctx.beforeCoverUpload),
    autoUpload: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
/** @type {__VLS_StyleScopedClasses['cover-uploader']} */ ;
const { default: __VLS_43 } = __VLS_41.slots;
if (__VLS_ctx.coverPreview || __VLS_ctx.form.coverUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.coverPreview || __VLS_ctx.form.coverUrl),
        ...{ class: "cover" },
    });
    /** @type {__VLS_StyleScopedClasses['cover']} */ ;
}
else {
    let __VLS_44;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
        ...{ class: "cover-uploader-icon" },
    }));
    const __VLS_46 = __VLS_45({
        ...{ class: "cover-uploader-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    /** @type {__VLS_StyleScopedClasses['cover-uploader-icon']} */ ;
    const { default: __VLS_49 } = __VLS_47.slots;
    let __VLS_50;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({}));
    const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
    // @ts-ignore
    [form, form, handleCoverChange, beforeCoverUpload, coverPreview, coverPreview,];
    var __VLS_47;
}
// @ts-ignore
[];
var __VLS_41;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "upload-tip" },
});
/** @type {__VLS_StyleScopedClasses['upload-tip']} */ ;
// @ts-ignore
[];
var __VLS_35;
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    label: "文章标签",
    required: true,
}));
const __VLS_57 = __VLS_56({
    label: "文章标签",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
const { default: __VLS_60 } = __VLS_58.slots;
let __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    modelValue: (__VLS_ctx.form.tagId),
    placeholder: "请选择标签",
    ...{ style: {} },
}));
const __VLS_63 = __VLS_62({
    modelValue: (__VLS_ctx.form.tagId),
    placeholder: "请选择标签",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const { default: __VLS_66 } = __VLS_64.slots;
for (const [tag] of __VLS_vFor((__VLS_ctx.tags))) {
    let __VLS_67;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        key: (tag.id),
        label: (tag.name),
        value: (tag.id),
    }));
    const __VLS_69 = __VLS_68({
        key: (tag.id),
        label: (tag.name),
        value: (tag.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    // @ts-ignore
    [form, tags,];
}
// @ts-ignore
[];
var __VLS_64;
// @ts-ignore
[];
var __VLS_58;
let __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
    label: "文章内容",
    required: true,
}));
const __VLS_74 = __VLS_73({
    label: "文章内容",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const { default: __VLS_77 } = __VLS_75.slots;
let __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor | typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor} */
vMdEditor;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    ...{ 'onUploadImage': {} },
    modelValue: (__VLS_ctx.form.content),
    height: "400px",
    placeholder: "请输入文章内容...",
}));
const __VLS_80 = __VLS_79({
    ...{ 'onUploadImage': {} },
    modelValue: (__VLS_ctx.form.content),
    height: "400px",
    placeholder: "请输入文章内容...",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
let __VLS_83;
const __VLS_84 = ({ uploadImage: {} },
    { onUploadImage: (__VLS_ctx.handleUploadImage) });
var __VLS_81;
var __VLS_82;
// @ts-ignore
[form, handleUploadImage,];
var __VLS_75;
let __VLS_85;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({}));
const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
const { default: __VLS_90 } = __VLS_88.slots;
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}));
const __VLS_93 = __VLS_92({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
let __VLS_96;
const __VLS_97 = ({ click: {} },
    { onClick: (__VLS_ctx.handleSubmit) });
const { default: __VLS_98 } = __VLS_94.slots;
// @ts-ignore
[submitting, handleSubmit,];
var __VLS_94;
var __VLS_95;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    ...{ 'onClick': {} },
}));
const __VLS_101 = __VLS_100({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
let __VLS_104;
const __VLS_105 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/my-articles');
            // @ts-ignore
            [$router,];
        } });
const { default: __VLS_106 } = __VLS_102.slots;
// @ts-ignore
[];
var __VLS_102;
var __VLS_103;
// @ts-ignore
[];
var __VLS_88;
// @ts-ignore
[];
var __VLS_18;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
