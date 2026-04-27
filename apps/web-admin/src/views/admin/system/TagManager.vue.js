/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getArticleTags, addArticleTag, updateArticleTag, deleteArticleTag } from '@/api/articleTag';
const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const tags = ref([]);
const form = reactive({
    id: undefined,
    name: '',
    code: '',
    sortOrder: 0,
    status: 1
});
const fetchTags = async () => {
    loading.value = true;
    try {
        const res = await getArticleTags();
        if (res.code === 200) {
            tags.value = res.data;
        }
    }
    catch (error) {
        ElMessage.error('获取标签列表失败');
    }
    finally {
        loading.value = false;
    }
};
const handleAdd = () => {
    isEdit.value = false;
    form.id = undefined;
    form.name = '';
    form.code = '';
    form.sortOrder = 0;
    form.status = 1;
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    isEdit.value = true;
    form.id = row.id;
    form.name = row.name;
    form.code = row.code;
    form.sortOrder = row.sortOrder;
    form.status = row.status;
    dialogVisible.value = true;
};
const handleSubmit = async () => {
    if (!form.name.trim()) {
        ElMessage.warning('请输入标签名称');
        return;
    }
    if (!form.code.trim()) {
        ElMessage.warning('请输入标签编码');
        return;
    }
    submitting.value = true;
    try {
        let res;
        if (isEdit.value) {
            if (form.id === undefined) {
                ElMessage.warning('标签ID无效');
                submitting.value = false;
                return;
            }
            res = await updateArticleTag({ id: form.id, name: form.name, code: form.code, sortOrder: form.sortOrder });
        }
        else {
            res = await addArticleTag({ name: form.name, code: form.code, sortOrder: form.sortOrder });
        }
        if (res.code === 200) {
            ElMessage.success(res.data);
            dialogVisible.value = false;
            fetchTags();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
    finally {
        submitting.value = false;
    }
};
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定要删除这个标签吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await deleteArticleTag(row.id);
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchTags();
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '删除失败');
        }
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tag-manager-container" },
});
/** @type {__VLS_StyleScopedClasses['tag-manager-container']} */ ;
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
        type: "primary",
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ click: {} },
        { onClick: (__VLS_ctx.handleAdd) });
    const { default: __VLS_14 } = __VLS_10.slots;
    // @ts-ignore
    [handleAdd,];
    var __VLS_10;
    var __VLS_11;
    // @ts-ignore
    [];
}
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    data: (__VLS_ctx.tags),
    border: true,
    stripe: true,
}));
const __VLS_17 = __VLS_16({
    data: (__VLS_ctx.tags),
    border: true,
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_20 } = __VLS_18.slots;
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_23 = __VLS_22({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    prop: "name",
    label: "标签名称",
    width: "150",
}));
const __VLS_28 = __VLS_27({
    prop: "name",
    label: "标签名称",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    prop: "code",
    label: "标签编码",
    width: "150",
}));
const __VLS_33 = __VLS_32({
    prop: "code",
    label: "标签编码",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
let __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    prop: "sortOrder",
    label: "排序",
    width: "100",
}));
const __VLS_38 = __VLS_37({
    prop: "sortOrder",
    label: "排序",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_43 = __VLS_42({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
const { default: __VLS_46 } = __VLS_44.slots;
{
    const { default: __VLS_47 } = __VLS_44.slots;
    const [{ row }] = __VLS_vSlot(__VLS_47);
    let __VLS_48;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        type: (row.status === 1 ? 'success' : 'danger'),
        size: "small",
    }));
    const __VLS_50 = __VLS_49({
        type: (row.status === 1 ? 'success' : 'danger'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const { default: __VLS_53 } = __VLS_51.slots;
    (row.status === 1 ? '启用' : '禁用');
    // @ts-ignore
    [tags, vLoading, loading,];
    var __VLS_51;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_44;
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    prop: "createTime",
    label: "创建时间",
    minWidth: "180",
}));
const __VLS_56 = __VLS_55({
    prop: "createTime",
    label: "创建时间",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
let __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    label: "操作",
    width: "200",
    fixed: "right",
}));
const __VLS_61 = __VLS_60({
    label: "操作",
    width: "200",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
const { default: __VLS_64 } = __VLS_62.slots;
{
    const { default: __VLS_65 } = __VLS_62.slots;
    const [{ row }] = __VLS_vSlot(__VLS_65);
    let __VLS_66;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_68 = __VLS_67({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    let __VLS_71;
    const __VLS_72 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_73 } = __VLS_69.slots;
    // @ts-ignore
    [];
    var __VLS_69;
    var __VLS_70;
    let __VLS_74;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_76 = __VLS_75({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_79;
    const __VLS_80 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(row);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_81 } = __VLS_77.slots;
    // @ts-ignore
    [];
    var __VLS_77;
    var __VLS_78;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_62;
// @ts-ignore
[];
var __VLS_18;
let __VLS_82;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑标签' : '添加标签'),
    width: "500px",
}));
const __VLS_84 = __VLS_83({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑标签' : '添加标签'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
const { default: __VLS_87 } = __VLS_85.slots;
let __VLS_88;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_90 = __VLS_89({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const { default: __VLS_93 } = __VLS_91.slots;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    label: "标签名称",
    required: true,
}));
const __VLS_96 = __VLS_95({
    label: "标签名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
const { default: __VLS_99 } = __VLS_97.slots;
let __VLS_100;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入标签名称",
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入标签名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
// @ts-ignore
[dialogVisible, isEdit, form, form,];
var __VLS_97;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    label: "标签编码",
    required: true,
}));
const __VLS_107 = __VLS_106({
    label: "标签编码",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
const { default: __VLS_110 } = __VLS_108.slots;
let __VLS_111;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
    modelValue: (__VLS_ctx.form.code),
    placeholder: "请输入标签编码，如：ADOLESCENCE",
}));
const __VLS_113 = __VLS_112({
    modelValue: (__VLS_ctx.form.code),
    placeholder: "请输入标签编码，如：ADOLESCENCE",
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
// @ts-ignore
[form,];
var __VLS_108;
let __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
    label: "排序",
}));
const __VLS_118 = __VLS_117({
    label: "排序",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
const { default: __VLS_121 } = __VLS_119.slots;
let __VLS_122;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
    modelValue: (__VLS_ctx.form.sortOrder),
    min: (0),
    max: (999),
}));
const __VLS_124 = __VLS_123({
    modelValue: (__VLS_ctx.form.sortOrder),
    min: (0),
    max: (999),
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
// @ts-ignore
[form,];
var __VLS_119;
let __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
    label: "状态",
}));
const __VLS_129 = __VLS_128({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
const { default: __VLS_132 } = __VLS_130.slots;
let __VLS_133;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
    modelValue: (__VLS_ctx.form.status),
}));
const __VLS_135 = __VLS_134({
    modelValue: (__VLS_ctx.form.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
const { default: __VLS_138 } = __VLS_136.slots;
let __VLS_139;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
    label: (1),
}));
const __VLS_141 = __VLS_140({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
const { default: __VLS_144 } = __VLS_142.slots;
// @ts-ignore
[form,];
var __VLS_142;
let __VLS_145;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
    label: (0),
}));
const __VLS_147 = __VLS_146({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
const { default: __VLS_150 } = __VLS_148.slots;
// @ts-ignore
[];
var __VLS_148;
// @ts-ignore
[];
var __VLS_136;
// @ts-ignore
[];
var __VLS_130;
// @ts-ignore
[];
var __VLS_91;
{
    const { footer: __VLS_151 } = __VLS_85.slots;
    let __VLS_152;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
        ...{ 'onClick': {} },
    }));
    const __VLS_154 = __VLS_153({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    let __VLS_157;
    const __VLS_158 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_159 } = __VLS_155.slots;
    // @ts-ignore
    [];
    var __VLS_155;
    var __VLS_156;
    let __VLS_160;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent1(__VLS_160, new __VLS_160({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_162 = __VLS_161({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    let __VLS_165;
    const __VLS_166 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSubmit) });
    const { default: __VLS_167 } = __VLS_163.slots;
    // @ts-ignore
    [submitting, handleSubmit,];
    var __VLS_163;
    var __VLS_164;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_85;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
