/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { getMemeList, getMemeDetail, saveMeme, updateMeme, deleteMeme as deleteMemeApi } from '@/api/meme';
import { ElMessage, ElMessageBox } from 'element-plus';
const loading = ref(false);
const memeList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');
const fetchMemeList = async () => {
    loading.value = true;
    try {
        const res = await getMemeList({
            page: currentPage.value,
            size: pageSize.value,
            memeName: searchKeyword.value || undefined
        });
        if (res.code === 200) {
            memeList.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (e) {
        ElMessage.error('获取列表失败');
    }
    finally {
        loading.value = false;
    }
};
const handleSearch = () => {
    currentPage.value = 1;
    fetchMemeList();
};
const resetSearch = () => {
    searchKeyword.value = '';
    currentPage.value = 1;
    fetchMemeList();
};
// Detail
const detailVisible = ref(false);
const currentMeme = ref(null);
const viewDetail = async (row) => {
    try {
        const res = await getMemeDetail(row.id);
        if (res.code === 200) {
            currentMeme.value = res.data;
            detailVisible.value = true;
        }
        else {
            ElMessage.error(res.message || '获取详情失败');
        }
    }
    catch (e) {
        ElMessage.error('获取详情失败');
    }
};
// Add/Edit
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = ref({
    id: 0,
    meme: '',
    explain: ''
});
const submitting = ref(false);
const openAddDialog = () => {
    isEdit.value = false;
    form.value = {
        id: 0,
        meme: '',
        explain: ''
    };
    dialogVisible.value = true;
};
const openEditDialog = (row) => {
    isEdit.value = true;
    // 使用 Object.assign 确保响应式
    Object.assign(form.value, {
        id: row.id,
        meme: row.meme || '',
        explain: row.explain || ''
    });
    dialogVisible.value = true;
};
const submitForm = async () => {
    // 严格验证
    if (!form.value.meme || !form.value.meme.trim()) {
        ElMessage.warning('请填写梗名称');
        return;
    }
    if (!form.value.explain || !form.value.explain.trim()) {
        ElMessage.warning('请填写梗内容');
        return;
    }
    submitting.value = true;
    try {
        let res;
        if (isEdit.value) {
            console.log('更新热梗:', form.value);
            res = await updateMeme(form.value);
        }
        else {
            const saveData = {
                meme: form.value.meme.trim(),
                explain: form.value.explain.trim()
            };
            console.log('保存热梗:', saveData);
            res = await saveMeme(saveData);
        }
        if (res.code === 200) {
            ElMessage.success(isEdit.value ? '编辑成功' : '新增成功');
            dialogVisible.value = false;
            fetchMemeList();
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        console.error('请求错误:', e);
        ElMessage.error(e?.response?.data?.message || '操作失败');
    }
    finally {
        submitting.value = false;
    }
};
const deleteMeme = async (id) => {
    try {
        await ElMessageBox.confirm('确认要删除这个热梗吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await deleteMemeApi(id);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchMemeList();
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) { }
};
const formatContent = (content) => {
    if (!content)
        return '';
    return content.replace(/\\n/g, '\n');
};
onMounted(() => {
    fetchMemeList();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "complaint-manager" },
});
/** @type {__VLS_StyleScopedClasses['complaint-manager']} */ ;
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
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "search-box" },
    });
    /** @type {__VLS_StyleScopedClasses['search-box']} */ ;
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
        { onClick: (__VLS_ctx.openAddDialog) });
    const { default: __VLS_14 } = __VLS_10.slots;
    // @ts-ignore
    [openAddDialog,];
    var __VLS_10;
    var __VLS_11;
    let __VLS_15;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.searchKeyword),
        placeholder: "请输入梗名称搜索",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_17 = __VLS_16({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.searchKeyword),
        placeholder: "请输入梗名称搜索",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_20;
    const __VLS_21 = ({ keyup: {} },
        { onKeyup: (__VLS_ctx.handleSearch) });
    var __VLS_18;
    var __VLS_19;
    let __VLS_22;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_27;
    const __VLS_28 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSearch) });
    const { default: __VLS_29 } = __VLS_25.slots;
    // @ts-ignore
    [searchKeyword, handleSearch, handleSearch,];
    var __VLS_25;
    var __VLS_26;
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onClick': {} },
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ click: {} },
        { onClick: (__VLS_ctx.resetSearch) });
    const { default: __VLS_37 } = __VLS_33.slots;
    // @ts-ignore
    [resetSearch,];
    var __VLS_33;
    var __VLS_34;
    // @ts-ignore
    [];
}
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    data: (__VLS_ctx.memeList),
}));
const __VLS_40 = __VLS_39({
    data: (__VLS_ctx.memeList),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_43 } = __VLS_41.slots;
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_46 = __VLS_45({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    prop: "meme",
    label: "热梗",
    width: "150",
}));
const __VLS_51 = __VLS_50({
    prop: "meme",
    label: "热梗",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    prop: "explain",
    label: "热梗解释内容",
    minWidth: "300",
    showOverflowTooltip: true,
}));
const __VLS_56 = __VLS_55({
    prop: "explain",
    label: "热梗解释内容",
    minWidth: "300",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
const { default: __VLS_59 } = __VLS_57.slots;
{
    const { default: __VLS_60 } = __VLS_57.slots;
    const [scope] = __VLS_vSlot(__VLS_60);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "explain-content" },
    });
    /** @type {__VLS_StyleScopedClasses['explain-content']} */ ;
    (__VLS_ctx.formatContent(scope.row.explain));
    // @ts-ignore
    [memeList, vLoading, loading, formatContent,];
}
// @ts-ignore
[];
var __VLS_57;
let __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    label: "操作",
    width: "260",
    fixed: "right",
}));
const __VLS_63 = __VLS_62({
    label: "操作",
    width: "260",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const { default: __VLS_66 } = __VLS_64.slots;
{
    const { default: __VLS_67 } = __VLS_64.slots;
    const [scope] = __VLS_vSlot(__VLS_67);
    let __VLS_68;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_73;
    const __VLS_74 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewDetail(scope.row);
                // @ts-ignore
                [viewDetail,];
            } });
    const { default: __VLS_75 } = __VLS_71.slots;
    // @ts-ignore
    [];
    var __VLS_71;
    var __VLS_72;
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_81;
    const __VLS_82 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.openEditDialog(scope.row);
                // @ts-ignore
                [openEditDialog,];
            } });
    const { default: __VLS_83 } = __VLS_79.slots;
    // @ts-ignore
    [];
    var __VLS_79;
    var __VLS_80;
    let __VLS_84;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_89;
    const __VLS_90 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.deleteMeme(scope.row.id);
                // @ts-ignore
                [deleteMeme,];
            } });
    const { default: __VLS_91 } = __VLS_87.slots;
    // @ts-ignore
    [];
    var __VLS_87;
    var __VLS_88;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_64;
// @ts-ignore
[];
var __VLS_41;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_92;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_94 = __VLS_93({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_97;
const __VLS_98 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchMemeList) });
var __VLS_95;
var __VLS_96;
// @ts-ignore
[currentPage, pageSize, total, fetchMemeList,];
var __VLS_3;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    modelValue: (__VLS_ctx.detailVisible),
    title: "热梗详情",
    width: "500px",
}));
const __VLS_101 = __VLS_100({
    modelValue: (__VLS_ctx.detailVisible),
    title: "热梗详情",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
const { default: __VLS_104 } = __VLS_102.slots;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
elDescriptions;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    column: (1),
    border: true,
}));
const __VLS_107 = __VLS_106({
    column: (1),
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
const { default: __VLS_110 } = __VLS_108.slots;
let __VLS_111;
/** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
elDescriptionsItem;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
    label: "ID",
}));
const __VLS_113 = __VLS_112({
    label: "ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
const { default: __VLS_116 } = __VLS_114.slots;
(__VLS_ctx.currentMeme?.id);
// @ts-ignore
[detailVisible, currentMeme,];
var __VLS_114;
let __VLS_117;
/** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
elDescriptionsItem;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
    label: "梗名称",
}));
const __VLS_119 = __VLS_118({
    label: "梗名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
const { default: __VLS_122 } = __VLS_120.slots;
(__VLS_ctx.currentMeme?.meme);
// @ts-ignore
[currentMeme,];
var __VLS_120;
let __VLS_123;
/** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
elDescriptionsItem;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    label: "梗内容",
}));
const __VLS_125 = __VLS_124({
    label: "梗内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
const { default: __VLS_128 } = __VLS_126.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "explain-content detail-explain" },
});
/** @type {__VLS_StyleScopedClasses['explain-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-explain']} */ ;
(__VLS_ctx.formatContent(__VLS_ctx.currentMeme?.explain));
// @ts-ignore
[formatContent, currentMeme,];
var __VLS_126;
// @ts-ignore
[];
var __VLS_108;
{
    const { footer: __VLS_129 } = __VLS_102.slots;
    let __VLS_130;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
        ...{ 'onClick': {} },
    }));
    const __VLS_132 = __VLS_131({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    let __VLS_135;
    const __VLS_136 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
                // @ts-ignore
                [detailVisible,];
            } });
    const { default: __VLS_137 } = __VLS_133.slots;
    // @ts-ignore
    [];
    var __VLS_133;
    var __VLS_134;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_102;
let __VLS_138;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑热梗' : '新增热梗'),
    width: "500px",
}));
const __VLS_140 = __VLS_139({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑热梗' : '新增热梗'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
const { default: __VLS_143 } = __VLS_141.slots;
let __VLS_144;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
    model: (__VLS_ctx.form),
    labelWidth: "80px",
}));
const __VLS_146 = __VLS_145({
    model: (__VLS_ctx.form),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
const { default: __VLS_149 } = __VLS_147.slots;
let __VLS_150;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
    label: "梗名称",
}));
const __VLS_152 = __VLS_151({
    label: "梗名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
const { default: __VLS_155 } = __VLS_153.slots;
let __VLS_156;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
    modelValue: (__VLS_ctx.form.meme),
    placeholder: "请输入梗名称",
}));
const __VLS_158 = __VLS_157({
    modelValue: (__VLS_ctx.form.meme),
    placeholder: "请输入梗名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
// @ts-ignore
[dialogVisible, isEdit, form, form,];
var __VLS_153;
let __VLS_161;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    label: "梗内容",
}));
const __VLS_163 = __VLS_162({
    label: "梗内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
const { default: __VLS_166 } = __VLS_164.slots;
let __VLS_167;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({
    modelValue: (__VLS_ctx.form.explain),
    type: "textarea",
    rows: (4),
    placeholder: "请输入梗内容",
}));
const __VLS_169 = __VLS_168({
    modelValue: (__VLS_ctx.form.explain),
    type: "textarea",
    rows: (4),
    placeholder: "请输入梗内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_168));
// @ts-ignore
[form,];
var __VLS_164;
// @ts-ignore
[];
var __VLS_147;
{
    const { footer: __VLS_172 } = __VLS_141.slots;
    let __VLS_173;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
        ...{ 'onClick': {} },
    }));
    const __VLS_175 = __VLS_174({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    let __VLS_178;
    const __VLS_179 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_180 } = __VLS_176.slots;
    // @ts-ignore
    [];
    var __VLS_176;
    var __VLS_177;
    let __VLS_181;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_183 = __VLS_182({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    let __VLS_186;
    const __VLS_187 = ({ click: {} },
        { onClick: (__VLS_ctx.submitForm) });
    const { default: __VLS_188 } = __VLS_184.slots;
    // @ts-ignore
    [submitting, submitForm,];
    var __VLS_184;
    var __VLS_185;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_141;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
