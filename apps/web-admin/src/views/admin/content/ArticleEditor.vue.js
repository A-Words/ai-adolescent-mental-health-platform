/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '@/api/user';
import { getArticleTags } from '@/api/articleTag';
import { ElMessage } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const articleTags = ref([]);
const form = reactive({
    title: '',
    type: '',
    coverUrl: '',
    content: '',
    status: 1
});
const pendingImages = ref(new Map());
const pendingCover = ref(null);
const toolbar = {
    color: {
        title: '字体颜色',
        icon: 'v-md-icon-font',
        text: 'A',
        menus: [
            {
                name: 'red',
                text: '红色',
                action(editor) {
                    editor.insert((selected) => {
                        const prefix = '<span style="color: red">';
                        const suffix = '</span>';
                        const content = selected || '红色文本';
                        return {
                            text: `${prefix}${content}${suffix}`,
                            selected: content,
                        };
                    });
                },
            },
            {
                name: 'blue',
                text: '蓝色',
                action(editor) {
                    editor.insert((selected) => {
                        const prefix = '<span style="color: blue">';
                        const suffix = '</span>';
                        const content = selected || '蓝色文本';
                        return {
                            text: `${prefix}${content}${suffix}`,
                            selected: content,
                        };
                    });
                },
            },
            {
                name: 'green',
                text: '绿色',
                action(editor) {
                    editor.insert((selected) => {
                        const prefix = '<span style="color: green">';
                        const suffix = '</span>';
                        const content = selected || '绿色文本';
                        return {
                            text: `${prefix}${content}${suffix}`,
                            selected: content,
                        };
                    });
                },
            },
            {
                name: 'orange',
                text: '橙色',
                action(editor) {
                    editor.insert((selected) => {
                        const prefix = '<span style="color: orange">';
                        const suffix = '</span>';
                        const content = selected || '橙色文本';
                        return {
                            text: `${prefix}${content}${suffix}`,
                            selected: content,
                        };
                    });
                },
            },
        ],
    },
};
const isEdit = computed(() => !!route.params.id);
const fetchArticle = async (id) => {
    loading.value = true;
    try {
        // Assuming we have an API to get article detail by ID for admin or public
        // Reusing the public detail API or creating a new one? 
        // The public API /content/article/{id} should work.
        const res = await request.get(`/content/article/${id}`);
        if (res.code === 200) {
            Object.assign(form, res.data);
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (error) {
        ElMessage.error('加载文章失败');
    }
    finally {
        loading.value = false;
    }
};
const goBack = () => {
    router.push('/admin/content/articles');
};
const user = JSON.parse(localStorage.getItem('user') || '{}');
// Markdown Upload
const handleMdUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            form.content = e.target.result;
        }
    };
    reader.readAsText(file.raw);
};
const handleCoverUpload = (file) => {
    if (!file.raw)
        return;
    const isImage = file.raw.type.startsWith('image/');
    if (!isImage) {
        ElMessage.error('请上传图片文件');
        return;
    }
    if (file.size / 1024 / 1024 > 2) {
        ElMessage.error('图片大小不能超过 2MB');
        return;
    }
    pendingCover.value = file.raw;
    form.coverUrl = URL.createObjectURL(file.raw);
};
// Editor Image Upload (Defer)
const handleEditorUploadImage = (_event, insertImage, files) => {
    files.forEach(file => {
        const url = URL.createObjectURL(file);
        pendingImages.value.set(url, file);
        insertImage({
            url: url,
            desc: file.name,
            width: 'auto',
            height: 'auto',
        });
    });
};
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'article');
    return request.post('/common/upload', formData);
};
const submitForm = async () => {
    if (!form.title || !form.content) {
        ElMessage.warning('标题和内容不能为空');
        return;
    }
    const loadingInstance = ElMessage({
        message: '正在保存...',
        type: 'info',
        duration: 0
    });
    try {
        // 1. Upload Cover if pending
        if (pendingCover.value) {
            const res = await uploadFile(pendingCover.value);
            if (res.code === 200) {
                form.coverUrl = res.data;
            }
            else {
                throw new Error(`封面图上传失败: ${res.message}`);
            }
        }
        let newContent = form.content;
        const imageEntries = Array.from(pendingImages.value.entries());
        // Find used blob URLs in content
        // We must handle image upload errors gracefully and not block saving if no images changed or upload fails
        // But currently if upload fails, we throw. That's fine.
        // Fix: Blob URL detection regex or logic.
        // .includes(blobUrl) might be risky if urls are similar (unlikely for UUIDs).
        // Also, v-md-editor might encode/decode URLs.
        // Let's use a robust replacement.
        for (const [blobUrl, file] of imageEntries) {
            if (newContent.includes(blobUrl)) {
                // Upload
                const res = await uploadFile(file);
                if (res.code === 200) {
                    const ossUrl = res.data;
                    // Replace all occurrences
                    newContent = newContent.split(blobUrl).join(ossUrl);
                }
                else {
                    throw new Error(`图片 ${file.name} 上传失败: ${res.message}`);
                }
            }
        }
        form.content = newContent;
        let res;
        if (form.id) {
            res = await request.put('/content/article', form, { params: { role: user.role } });
        }
        else {
            res = await request.post('/content/article', form, { params: { role: user.role } });
        }
        if (res.code === 200) {
            ElMessage.success('保存成功');
            pendingImages.value.clear();
            goBack();
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error(e.message || '保存失败');
    }
    finally {
        loadingInstance.close();
    }
};
onMounted(async () => {
    // 获取文章标签列表
    try {
        const res = await getArticleTags();
        if (res.code === 200) {
            articleTags.value = res.data.filter((tag) => tag.status === 1);
            // 设置默认类型为第一个标签
            if (articleTags.value.length > 0 && !form.type) {
                form.type = articleTags.value[0].code;
            }
        }
    }
    catch (error) {
        console.error('获取标签失败', error);
    }
    if (route.params.id) {
        fetchArticle(Number(route.params.id));
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "article-editor" },
});
/** @type {__VLS_StyleScopedClasses['article-editor']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
(__VLS_ctx.isEdit ? '编辑文章' : '新增文章');
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
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    model: (__VLS_ctx.form),
    labelWidth: "80px",
}));
const __VLS_10 = __VLS_9({
    model: (__VLS_ctx.form),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_13 } = __VLS_11.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    label: "标题",
    required: true,
}));
const __VLS_16 = __VLS_15({
    label: "标题",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "请输入文章标题",
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "请输入文章标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
// @ts-ignore
[form, form, vLoading, loading,];
var __VLS_17;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    label: "类型",
    required: true,
}));
const __VLS_27 = __VLS_26({
    label: "类型",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    modelValue: (__VLS_ctx.form.type),
    placeholder: "请选择文章类型",
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.form.type),
    placeholder: "请选择文章类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
const { default: __VLS_36 } = __VLS_34.slots;
for (const [tag] of __VLS_vFor((__VLS_ctx.articleTags))) {
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        key: (tag.code),
        label: (tag.name),
        value: (tag.code),
    }));
    const __VLS_39 = __VLS_38({
        key: (tag.code),
        label: (tag.name),
        value: (tag.code),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    // @ts-ignore
    [form, articleTags,];
}
// @ts-ignore
[];
var __VLS_34;
// @ts-ignore
[];
var __VLS_28;
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    label: "封面图",
}));
const __VLS_44 = __VLS_43({
    label: "封面图",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
const { default: __VLS_47 } = __VLS_45.slots;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.form.coverUrl),
    placeholder: "输入图片URL",
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.form.coverUrl),
    placeholder: "输入图片URL",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const { default: __VLS_53 } = __VLS_51.slots;
{
    const { append: __VLS_54 } = __VLS_51.slots;
    let __VLS_55;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        action: "#",
        autoUpload: (false),
        showFileList: (false),
        onChange: (__VLS_ctx.handleCoverUpload),
        accept: "image/*",
    }));
    const __VLS_57 = __VLS_56({
        action: "#",
        autoUpload: (false),
        showFileList: (false),
        onChange: (__VLS_ctx.handleCoverUpload),
        accept: "image/*",
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const { default: __VLS_60 } = __VLS_58.slots;
    let __VLS_61;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        icon: (__VLS_ctx.Upload),
    }));
    const __VLS_63 = __VLS_62({
        icon: (__VLS_ctx.Upload),
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const { default: __VLS_66 } = __VLS_64.slots;
    // @ts-ignore
    [form, handleCoverUpload, Upload,];
    var __VLS_64;
    // @ts-ignore
    [];
    var __VLS_58;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_51;
if (__VLS_ctx.form.coverUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cover-preview" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['cover-preview']} */ ;
    let __VLS_67;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        src: (__VLS_ctx.form.coverUrl),
        ...{ style: {} },
    }));
    const __VLS_69 = __VLS_68({
        src: (__VLS_ctx.form.coverUrl),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
}
// @ts-ignore
[form, form,];
var __VLS_45;
let __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
    label: "内容",
    required: true,
}));
const __VLS_74 = __VLS_73({
    label: "内容",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const { default: __VLS_77 } = __VLS_75.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "editor-container" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['editor-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "toolbar" },
});
/** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
let __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    action: "#",
    autoUpload: (false),
    showFileList: (false),
    onChange: (__VLS_ctx.handleMdUpload),
    accept: ".md",
}));
const __VLS_80 = __VLS_79({
    action: "#",
    autoUpload: (false),
    showFileList: (false),
    onChange: (__VLS_ctx.handleMdUpload),
    accept: ".md",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
const { default: __VLS_83 } = __VLS_81.slots;
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    size: "small",
    type: "warning",
}));
const __VLS_86 = __VLS_85({
    size: "small",
    type: "warning",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const { default: __VLS_89 } = __VLS_87.slots;
// @ts-ignore
[handleMdUpload,];
var __VLS_87;
// @ts-ignore
[];
var __VLS_81;
let __VLS_90;
/** @ts-ignore @type {typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor | typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor} */
vMdEditor;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    ...{ 'onUploadImage': {} },
    modelValue: (__VLS_ctx.form.content),
    height: "calc(100vh - 350px)",
    disabledMenus: ([]),
    includeLevel: ([1, 2, 3, 4, 5, 6]),
    placeholder: "请输入文章内容",
    leftToolbar: "undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code | align color",
    toolbar: (__VLS_ctx.toolbar),
}));
const __VLS_92 = __VLS_91({
    ...{ 'onUploadImage': {} },
    modelValue: (__VLS_ctx.form.content),
    height: "calc(100vh - 350px)",
    disabledMenus: ([]),
    includeLevel: ([1, 2, 3, 4, 5, 6]),
    placeholder: "请输入文章内容",
    leftToolbar: "undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code | align color",
    toolbar: (__VLS_ctx.toolbar),
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
let __VLS_95;
const __VLS_96 = ({ uploadImage: {} },
    { onUploadImage: (__VLS_ctx.handleEditorUploadImage) });
var __VLS_93;
var __VLS_94;
// @ts-ignore
[form, toolbar, handleEditorUploadImage,];
var __VLS_75;
let __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
    label: "状态",
}));
const __VLS_99 = __VLS_98({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
const { default: __VLS_102 } = __VLS_100.slots;
let __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "发布",
    inactiveText: "草稿",
}));
const __VLS_105 = __VLS_104({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "发布",
    inactiveText: "草稿",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
// @ts-ignore
[form,];
var __VLS_100;
let __VLS_108;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({}));
const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
const { default: __VLS_113 } = __VLS_111.slots;
let __VLS_114;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_116 = __VLS_115({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
let __VLS_119;
const __VLS_120 = ({ click: {} },
    { onClick: (__VLS_ctx.submitForm) });
const { default: __VLS_121 } = __VLS_117.slots;
// @ts-ignore
[submitForm,];
var __VLS_117;
var __VLS_118;
let __VLS_122;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
    ...{ 'onClick': {} },
}));
const __VLS_124 = __VLS_123({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
let __VLS_127;
const __VLS_128 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
const { default: __VLS_129 } = __VLS_125.slots;
// @ts-ignore
[goBack,];
var __VLS_125;
var __VLS_126;
// @ts-ignore
[];
var __VLS_111;
// @ts-ignore
[];
var __VLS_11;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
