/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import request from '@/utils/request';
const loading = ref(false);
const qualificationList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const dialogType = ref('add');
const form = reactive({
    id: null,
    name: '',
    code: '',
    description: '',
    sortOrder: 0,
    status: 1
});
const fetchList = async () => {
    loading.value = true;
    try {
        const res = await request({
            url: '/api/admin/psychologist/qualifications',
            method: 'get'
        });
        if (res.code === 200) {
            qualificationList.value = res.data || [];
            total.value = qualificationList.value.length;
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
        form.description = '';
        form.sortOrder = 0;
        form.status = 1;
    }
    else {
        form.id = row.id;
        form.name = row.name;
        form.code = row.code;
        form.description = row.description || '';
        form.sortOrder = row.sortOrder || 0;
        form.status = row.status;
    }
    dialogVisible.value = true;
};
const saveQualification = async () => {
    if (!form.name || !form.code) {
        ElMessage.warning('请填写必填项');
        return;
    }
    loading.value = true;
    try {
        const res = await request({
            url: dialogType.value === 'add' ? '/api/admin/psychologist/qualification' : `/api/admin/psychologist/qualification/${form.id}`,
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
const deleteQualification = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该资质吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await request({
            url: `/api/admin/psychologist/qualification/${id}`,
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
    ...{ class: "qualification-admin-page" },
});
/** @type {__VLS_StyleScopedClasses['qualification-admin-page']} */ ;
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
    data: (__VLS_ctx.qualificationList),
    stripe: true,
}));
const __VLS_21 = __VLS_20({
    data: (__VLS_ctx.qualificationList),
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
    label: "资质名称",
    minWidth: "200",
}));
const __VLS_32 = __VLS_31({
    prop: "name",
    label: "资质名称",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    prop: "code",
    label: "资质代码",
    width: "150",
}));
const __VLS_37 = __VLS_36({
    prop: "code",
    label: "资质代码",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    prop: "description",
    label: "描述",
    minWidth: "250",
}));
const __VLS_42 = __VLS_41({
    prop: "description",
    label: "描述",
    minWidth: "250",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_45;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    prop: "sortOrder",
    label: "排序",
    width: "80",
}));
const __VLS_47 = __VLS_46({
    prop: "sortOrder",
    label: "排序",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    label: "状态",
    width: "100",
}));
const __VLS_52 = __VLS_51({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const { default: __VLS_55 } = __VLS_53.slots;
{
    const { default: __VLS_56 } = __VLS_53.slots;
    const [scope] = __VLS_vSlot(__VLS_56);
    let __VLS_57;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        type: (scope.row.status === 1 ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_59 = __VLS_58({
        type: (scope.row.status === 1 ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const { default: __VLS_62 } = __VLS_60.slots;
    (scope.row.status === 1 ? '启用' : '禁用');
    // @ts-ignore
    [qualificationList, vLoading, loading,];
    var __VLS_60;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_53;
let __VLS_63;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
    label: "操作",
    width: "150",
    fixed: "right",
}));
const __VLS_65 = __VLS_64({
    label: "操作",
    width: "150",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
const { default: __VLS_68 } = __VLS_66.slots;
{
    const { default: __VLS_69 } = __VLS_66.slots;
    const [scope] = __VLS_vSlot(__VLS_69);
    let __VLS_70;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        link: true,
    }));
    const __VLS_72 = __VLS_71({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    let __VLS_75;
    const __VLS_76 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.openDialog('edit', scope.row);
                // @ts-ignore
                [openDialog,];
            } });
    const { default: __VLS_77 } = __VLS_73.slots;
    // @ts-ignore
    [];
    var __VLS_73;
    var __VLS_74;
    let __VLS_78;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        link: true,
    }));
    const __VLS_80 = __VLS_79({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    let __VLS_83;
    const __VLS_84 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.deleteQualification(scope.row.id);
                // @ts-ignore
                [deleteQualification,];
            } });
    const { default: __VLS_85 } = __VLS_81.slots;
    // @ts-ignore
    [];
    var __VLS_81;
    var __VLS_82;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_66;
// @ts-ignore
[];
var __VLS_22;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
let __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50]),
    layout: "total, sizes, prev, pager, next",
}));
const __VLS_88 = __VLS_87({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50]),
    layout: "total, sizes, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
let __VLS_91;
const __VLS_92 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.fetchList) });
const __VLS_93 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchList) });
var __VLS_89;
var __VLS_90;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogType === 'add' ? '新增资质' : '编辑资质'),
    width: "500px",
}));
const __VLS_96 = __VLS_95({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogType === 'add' ? '新增资质' : '编辑资质'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
const { default: __VLS_99 } = __VLS_97.slots;
let __VLS_100;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_102 = __VLS_101({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
const { default: __VLS_105 } = __VLS_103.slots;
let __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
    label: "资质名称",
    required: true,
}));
const __VLS_108 = __VLS_107({
    label: "资质名称",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
const { default: __VLS_111 } = __VLS_109.slots;
let __VLS_112;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入资质名称",
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入资质名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
// @ts-ignore
[currentPage, pageSize, total, fetchList, fetchList, dialogVisible, dialogType, form, form,];
var __VLS_109;
let __VLS_117;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
    label: "资质代码",
    required: true,
}));
const __VLS_119 = __VLS_118({
    label: "资质代码",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
const { default: __VLS_122 } = __VLS_120.slots;
let __VLS_123;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    modelValue: (__VLS_ctx.form.code),
    placeholder: "请输入资质代码",
}));
const __VLS_125 = __VLS_124({
    modelValue: (__VLS_ctx.form.code),
    placeholder: "请输入资质代码",
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
// @ts-ignore
[form,];
var __VLS_120;
let __VLS_128;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
    label: "描述",
}));
const __VLS_130 = __VLS_129({
    label: "描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
const { default: __VLS_133 } = __VLS_131.slots;
let __VLS_134;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "请输入描述",
}));
const __VLS_136 = __VLS_135({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "请输入描述",
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
// @ts-ignore
[form,];
var __VLS_131;
let __VLS_139;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
    label: "排序",
}));
const __VLS_141 = __VLS_140({
    label: "排序",
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
const { default: __VLS_144 } = __VLS_142.slots;
let __VLS_145;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
    modelValue: (__VLS_ctx.form.sortOrder),
    min: (0),
}));
const __VLS_147 = __VLS_146({
    modelValue: (__VLS_ctx.form.sortOrder),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
// @ts-ignore
[form,];
var __VLS_142;
let __VLS_150;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
    label: "状态",
}));
const __VLS_152 = __VLS_151({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
const { default: __VLS_155 } = __VLS_153.slots;
let __VLS_156;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.form.status),
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.form.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
const { default: __VLS_161 } = __VLS_159.slots;
let __VLS_162;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({
    label: (1),
}));
const __VLS_164 = __VLS_163({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
const { default: __VLS_167 } = __VLS_165.slots;
// @ts-ignore
[form,];
var __VLS_165;
let __VLS_168;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
    label: (0),
}));
const __VLS_170 = __VLS_169({
    label: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
const { default: __VLS_173 } = __VLS_171.slots;
// @ts-ignore
[];
var __VLS_171;
// @ts-ignore
[];
var __VLS_159;
// @ts-ignore
[];
var __VLS_153;
// @ts-ignore
[];
var __VLS_103;
{
    const { footer: __VLS_174 } = __VLS_97.slots;
    let __VLS_175;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
        ...{ 'onClick': {} },
    }));
    const __VLS_177 = __VLS_176({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    let __VLS_180;
    const __VLS_181 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_182 } = __VLS_178.slots;
    // @ts-ignore
    [];
    var __VLS_178;
    var __VLS_179;
    let __VLS_183;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent1(__VLS_183, new __VLS_183({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_185 = __VLS_184({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    let __VLS_188;
    const __VLS_189 = ({ click: {} },
        { onClick: (__VLS_ctx.saveQualification) });
    const { default: __VLS_190 } = __VLS_186.slots;
    // @ts-ignore
    [loading, saveQualification,];
    var __VLS_186;
    var __VLS_187;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_97;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
