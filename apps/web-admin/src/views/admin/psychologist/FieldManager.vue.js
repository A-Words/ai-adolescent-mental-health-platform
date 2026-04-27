/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import request from '@/utils/request';
const loading = ref(false);
const fieldList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const dialogType = ref('add');
const form = reactive({
    id: null,
    name: '',
    code: '',
    icon: '',
    description: '',
    sortOrder: 0,
    status: 1
});
const fetchList = async () => {
    loading.value = true;
    try {
        const res = await request({
            url: '/api/admin/psychologist/consultation-fields',
            method: 'get'
        });
        if (res.code === 200) {
            fieldList.value = res.data || [];
            total.value = fieldList.value.length;
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取列表失败');
    }
    finally {
        loading.value = false;
    }
};
const openDialog = (type, row) => {
    dialogType.value = type;
    if (type === 'add') {
        form.id = null;
        form.name = '';
        form.code = '';
        form.icon = '';
        form.description = '';
        form.sortOrder = 0;
        form.status = 1;
    }
    else {
        form.id = row.id;
        form.name = row.name;
        form.code = row.code;
        form.icon = row.icon || '';
        form.description = row.description || '';
        form.sortOrder = row.sortOrder || 0;
        form.status = row.status;
    }
    dialogVisible.value = true;
};
const saveField = async () => {
    if (!form.name || !form.code) {
        ElMessage.warning('请填写必填项');
        return;
    }
    loading.value = true;
    try {
        const res = await request({
            url: dialogType.value === 'add' ? '/api/admin/psychologist/consultation-field' : `/api/admin/psychologist/consultation-field/${form.id}`,
            method: dialogType.value === 'add' ? 'post' : 'put',
            data: form
        });
        if (res.code === 200) {
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功');
            dialogVisible.value = false;
            fetchList();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
    finally {
        loading.value = false;
    }
};
const deleteField = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该领域吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await request({
            url: `/api/admin/psychologist/consultation-field/${id}`,
            method: 'delete'
        });
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchList();
        }
        else {
            ElMessage.error(res.message || '删除失败');
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '删除失败');
        }
    }
};
onMounted(() => {
    fetchList();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "field-admin-page" },
});
/** @type {__VLS_StyleScopedClasses['field-admin-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.openDialog('add');
            // @ts-ignore
            [openDialog,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
// @ts-ignore
[];
var __VLS_11;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    data: (__VLS_ctx.fieldList),
    stripe: true,
}));
const __VLS_21 = __VLS_20({
    data: (__VLS_ctx.fieldList),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_24 } = __VLS_22.slots;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_27 = __VLS_26({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    prop: "name",
    label: "领域名称",
    minWidth: "150",
}));
const __VLS_32 = __VLS_31({
    prop: "name",
    label: "领域名称",
    minWidth: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    prop: "code",
    label: "领域代码",
    width: "150",
}));
const __VLS_37 = __VLS_36({
    prop: "code",
    label: "领域代码",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    prop: "icon",
    label: "图标",
    width: "100",
}));
const __VLS_42 = __VLS_41({
    prop: "icon",
    label: "图标",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_45 } = __VLS_43.slots;
{
    const { default: __VLS_46 } = __VLS_43.slots;
    const [scope] = __VLS_vSlot(__VLS_46);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (scope.row.icon || '-');
    // @ts-ignore
    [fieldList, vLoading, loading,];
}
// @ts-ignore
[];
var __VLS_43;
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    prop: "description",
    label: "描述",
    minWidth: "200",
}));
const __VLS_49 = __VLS_48({
    prop: "description",
    label: "描述",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
let __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    prop: "sortOrder",
    label: "排序",
    width: "80",
}));
const __VLS_54 = __VLS_53({
    prop: "sortOrder",
    label: "排序",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    label: "状态",
    width: "100",
}));
const __VLS_59 = __VLS_58({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
const { default: __VLS_62 } = __VLS_60.slots;
{
    const { default: __VLS_63 } = __VLS_60.slots;
    const [scope] = __VLS_vSlot(__VLS_63);
    let __VLS_64;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
        type: (scope.row.status === 1 ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_66 = __VLS_65({
        type: (scope.row.status === 1 ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const { default: __VLS_69 } = __VLS_67.slots;
    (scope.row.status === 1 ? '启用' : '禁用');
    // @ts-ignore
    [];
    var __VLS_67;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_60;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    label: "操作",
    width: "150",
    fixed: "right",
}));
const __VLS_72 = __VLS_71({
    label: "操作",
    width: "150",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
{
    const { default: __VLS_76 } = __VLS_73.slots;
    const [scope] = __VLS_vSlot(__VLS_76);
    let __VLS_77;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        link: true,
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_82;
    const __VLS_83 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.openDialog('edit', scope.row);
                // @ts-ignore
                [openDialog,];
            } });
    const { default: __VLS_84 } = __VLS_80.slots;
    // @ts-ignore
    [];
    var __VLS_80;
    var __VLS_81;
    let __VLS_85;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        link: true,
    }));
    const __VLS_87 = __VLS_86({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    let __VLS_90;
    const __VLS_91 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.deleteField(scope.row.id);
                // @ts-ignore
                [deleteField,];
            } });
    const { default: __VLS_92 } = __VLS_88.slots;
    // @ts-ignore
    [];
    var __VLS_88;
    var __VLS_89;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_73;
// @ts-ignore
[];
var __VLS_22;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
let __VLS_93;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50]),
    layout: "total, sizes, prev, pager, next",
}));
const __VLS_95 = __VLS_94({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50]),
    layout: "total, sizes, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
let __VLS_98;
const __VLS_99 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.fetchList) });
const __VLS_100 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchList) });
var __VLS_96;
var __VLS_97;
let __VLS_101;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogType === 'add' ? '新增领域' : '编辑领域'),
    width: "500px",
}));
const __VLS_103 = __VLS_102({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogType === 'add' ? '新增领域' : '编辑领域'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
const { default: __VLS_106 } = __VLS_104.slots;
let __VLS_107;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_109 = __VLS_108({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_108));
const { default: __VLS_112 } = __VLS_110.slots;
let __VLS_113;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    label: "领域名称",
    required: true,
}));
const __VLS_115 = __VLS_114({
    label: "领域名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
const { default: __VLS_118 } = __VLS_116.slots;
let __VLS_119;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入领域名称",
}));
const __VLS_121 = __VLS_120({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入领域名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
// @ts-ignore
[currentPage, pageSize, total, fetchList, fetchList, dialogVisible, dialogType, form, form,];
var __VLS_116;
let __VLS_124;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
    label: "领域代码",
    required: true,
}));
const __VLS_126 = __VLS_125({
    label: "领域代码",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
const { default: __VLS_129 } = __VLS_127.slots;
let __VLS_130;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
    modelValue: (__VLS_ctx.form.code),
    placeholder: "请输入领域代码",
}));
const __VLS_132 = __VLS_131({
    modelValue: (__VLS_ctx.form.code),
    placeholder: "请输入领域代码",
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
// @ts-ignore
[form,];
var __VLS_127;
let __VLS_135;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({
    label: "图标",
}));
const __VLS_137 = __VLS_136({
    label: "图标",
}, ...__VLS_functionalComponentArgsRest(__VLS_136));
const { default: __VLS_140 } = __VLS_138.slots;
let __VLS_141;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
    modelValue: (__VLS_ctx.form.icon),
    placeholder: "请输入图标",
}));
const __VLS_143 = __VLS_142({
    modelValue: (__VLS_ctx.form.icon),
    placeholder: "请输入图标",
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
// @ts-ignore
[form,];
var __VLS_138;
let __VLS_146;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146({
    label: "描述",
}));
const __VLS_148 = __VLS_147({
    label: "描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
const { default: __VLS_151 } = __VLS_149.slots;
let __VLS_152;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "请输入描述",
}));
const __VLS_154 = __VLS_153({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "请输入描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
// @ts-ignore
[form,];
var __VLS_149;
let __VLS_157;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
    label: "排序",
}));
const __VLS_159 = __VLS_158({
    label: "排序",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
const { default: __VLS_162 } = __VLS_160.slots;
let __VLS_163;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
    modelValue: (__VLS_ctx.form.sortOrder),
    min: (0),
}));
const __VLS_165 = __VLS_164({
    modelValue: (__VLS_ctx.form.sortOrder),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_164));
// @ts-ignore
[form,];
var __VLS_160;
let __VLS_168;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
    label: "状态",
}));
const __VLS_170 = __VLS_169({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
const { default: __VLS_173 } = __VLS_171.slots;
let __VLS_174;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
    modelValue: (__VLS_ctx.form.status),
}));
const __VLS_176 = __VLS_175({
    modelValue: (__VLS_ctx.form.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
const { default: __VLS_179 } = __VLS_177.slots;
let __VLS_180;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
    label: (1),
}));
const __VLS_182 = __VLS_181({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
const { default: __VLS_185 } = __VLS_183.slots;
// @ts-ignore
[form,];
var __VLS_183;
let __VLS_186;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({
    label: (0),
}));
const __VLS_188 = __VLS_187({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_187));
const { default: __VLS_191 } = __VLS_189.slots;
// @ts-ignore
[];
var __VLS_189;
// @ts-ignore
[];
var __VLS_177;
// @ts-ignore
[];
var __VLS_171;
// @ts-ignore
[];
var __VLS_110;
{
    const { footer: __VLS_192 } = __VLS_104.slots;
    let __VLS_193;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({
        ...{ 'onClick': {} },
    }));
    const __VLS_195 = __VLS_194({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_194));
    let __VLS_198;
    const __VLS_199 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_200 } = __VLS_196.slots;
    // @ts-ignore
    [];
    var __VLS_196;
    var __VLS_197;
    let __VLS_201;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_202 = __VLS_asFunctionalComponent1(__VLS_201, new __VLS_201({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_203 = __VLS_202({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_202));
    let __VLS_206;
    const __VLS_207 = ({ click: {} },
        { onClick: (__VLS_ctx.saveField) });
    const { default: __VLS_208 } = __VLS_204.slots;
    // @ts-ignore
    [loading, saveField,];
    var __VLS_204;
    var __VLS_205;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_104;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
