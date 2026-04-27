/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, reactive, watch } from 'vue';
import request from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getCourseCategories, addCourseCategory, updateCourseCategory, deleteCourseCategory } from '@/api/courseCategory';
const courses = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({});
const searchQuery = ref('');
const filterType = ref('');
const categories = ref([]);
// 分类管理相关
const categoryDialogVisible = ref(false);
const categoryLoading = ref(false);
const categoryList = ref([]);
const categoryFormVisible = ref(false);
const categoryForm = reactive({
    name: '',
    code: '',
    sortOrder: 0,
    status: 1
});
const uploadHeaders = {
    'token': localStorage.getItem('token') || ''
};
const getCategoryName = (code) => {
    const cat = categories.value.find(c => c.code === code);
    return cat ? cat.name : code;
};
const fetchCategories = async () => {
    try {
        const res = await getCourseCategories();
        if (res.code === 200) {
            categories.value = res.data || [];
        }
    }
    catch (error) {
        console.error(error);
    }
};
const fetchCourses = async () => {
    loading.value = true;
    try {
        const res = await request.get('/content/admin/courses', {
            params: {
                title: searchQuery.value,
                type: filterType.value
            }
        });
        if (res.code === 200) {
            courses.value = res.data.records;
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
// 分类管理相关方法
const openCategoryDialog = async () => {
    categoryDialogVisible.value = true;
    await fetchCategoryList();
};
const fetchCategoryList = async () => {
    categoryLoading.value = true;
    try {
        const res = await getCourseCategories();
        if (res.code === 200) {
            categoryList.value = res.data || [];
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        categoryLoading.value = false;
    }
};
const openCategoryForm = () => {
    Object.keys(categoryForm).forEach(key => delete categoryForm[key]);
    categoryForm.sortOrder = 0;
    categoryForm.status = 1;
    categoryFormVisible.value = true;
};
const editCategory = (row) => {
    Object.assign(categoryForm, {
        id: row.id,
        name: row.name,
        code: row.code,
        sortOrder: row.sortOrder,
        status: row.status
    });
    categoryFormVisible.value = true;
};
const cancelCategoryForm = () => {
    categoryFormVisible.value = false;
    Object.keys(categoryForm).forEach(key => delete categoryForm[key]);
};
const saveCategory = async () => {
    if (!categoryForm.name || !categoryForm.name.trim()) {
        ElMessage.error('分类名称不能为空');
        return;
    }
    if (!categoryForm.code || !categoryForm.code.trim()) {
        ElMessage.error('分类编码不能为空');
        return;
    }
    try {
        let res;
        if (categoryForm.id) {
            res = await updateCourseCategory(categoryForm.id, categoryForm);
        }
        else {
            res = await addCourseCategory(categoryForm);
        }
        if (res.code === 200) {
            ElMessage.success('保存成功');
            cancelCategoryForm();
            await fetchCategoryList();
            await fetchCategories();
        }
        else {
            ElMessage.error(res.message || '保存失败');
        }
    }
    catch (error) {
        ElMessage.error('保存失败');
    }
};
const deleteCategory = (row) => {
    ElMessageBox.confirm('确定删除该分类吗？删除后，该分类下的课程将变为"未分类"状态。', '删除确认', { type: 'warning' })
        .then(async () => {
        try {
            const res = await deleteCourseCategory(row.id);
            if (res.code === 200) {
                ElMessage.success('删除成功');
                await fetchCategoryList();
                await fetchCategories();
            }
            else {
                ElMessage.error(res.message || '删除失败');
            }
        }
        catch (error) {
            ElMessage.error('删除失败');
        }
    })
        .catch(() => { });
};
const handleCoverSuccess = (response) => {
    if (response.code === 200) {
        form.coverUrl = response.data;
        form.coverType = 'self_hosted';
    }
    else {
        ElMessage.error(response.message || '上传失败');
    }
};
const beforeCoverUpload = (rawFile) => {
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('Avatar picture must be JPG or PNG format!');
        return false;
    }
    else if (rawFile.size / 1024 / 1024 > 5) {
        ElMessage.error('Picture size can not exceed 5MB!');
        return false;
    }
    return true;
};
const handleAdd = () => {
    isEdit.value = false;
    Object.keys(form).forEach(key => delete form[key]);
    form.status = 1;
    form.type = filterType.value || 'VIDEO';
    form.sourceType = 'third_party';
    form.coverType = 'third_party';
    dialogVisible.value = true;
};
const handleEdit = async (row) => {
    isEdit.value = true;
    try {
        const res = await request.get(`/content/admin/course/${row.id}`);
        if (res.code === 200) {
            Object.assign(form, res.data);
            dialogVisible.value = true;
        }
        else {
            ElMessage.error(res.message || '获取详情失败');
        }
    }
    catch (e) {
        ElMessage.error('获取详情失败');
    }
};
const handleDelete = (id) => {
    ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/content/course/${id}`);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchCourses();
        }
    });
};
watch(() => form.sourceType, (newVal) => {
    if (newVal === 'third_party') {
        form.coverType = 'third_party';
    }
});
const submitForm = async () => {
    const res = await request.post('/content/course', form);
    if (res.code === 200) {
        ElMessage.success('保存成功');
        dialogVisible.value = false;
        fetchCourses();
    }
    else {
        ElMessage.error(res.message || '保存失败');
    }
};
onMounted(() => {
    fetchCategories().then(() => {
        fetchCourses();
    });
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['el-upload']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "course-manager" },
});
/** @type {__VLS_StyleScopedClasses['course-manager']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
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
    { onClick: (__VLS_ctx.openCategoryDialog) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[openCategoryDialog,];
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
    { onClick: (__VLS_ctx.handleAdd) });
const { default: __VLS_15 } = __VLS_11.slots;
// @ts-ignore
[handleAdd,];
var __VLS_11;
var __VLS_12;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-bar" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
let __VLS_16;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filterType),
    placeholder: "选择分类",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_18 = __VLS_17({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filterType),
    placeholder: "选择分类",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_21;
const __VLS_22 = ({ change: {} },
    { onChange: (__VLS_ctx.fetchCourses) });
const { default: __VLS_23 } = __VLS_19.slots;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    label: "全部",
    value: "",
}));
const __VLS_26 = __VLS_25({
    label: "全部",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
for (const [cat] of __VLS_vFor((__VLS_ctx.categories))) {
    let __VLS_29;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        key: (cat.id),
        label: (cat.name),
        value: (cat.code),
    }));
    const __VLS_31 = __VLS_30({
        key: (cat.id),
        label: (cat.name),
        value: (cat.code),
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    // @ts-ignore
    [filterType, fetchCourses, categories,];
}
// @ts-ignore
[];
var __VLS_19;
var __VLS_20;
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索课程标题",
    ...{ style: {} },
}));
const __VLS_36 = __VLS_35({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索课程标题",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
let __VLS_39;
const __VLS_40 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.fetchCourses) });
var __VLS_37;
var __VLS_38;
let __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    ...{ 'onClick': {} },
}));
const __VLS_43 = __VLS_42({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
let __VLS_46;
const __VLS_47 = ({ click: {} },
    { onClick: (__VLS_ctx.fetchCourses) });
const { default: __VLS_48 } = __VLS_44.slots;
// @ts-ignore
[fetchCourses, fetchCourses, searchQuery,];
var __VLS_44;
var __VLS_45;
let __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    data: (__VLS_ctx.courses),
    ...{ style: {} },
}));
const __VLS_51 = __VLS_50({
    data: (__VLS_ctx.courses),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_54 } = __VLS_52.slots;
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_57 = __VLS_56({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    prop: "title",
    label: "标题",
}));
const __VLS_62 = __VLS_61({
    prop: "title",
    label: "标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    prop: "type",
    label: "分类",
}));
const __VLS_67 = __VLS_66({
    prop: "type",
    label: "分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
const { default: __VLS_70 } = __VLS_68.slots;
{
    const { default: __VLS_71 } = __VLS_68.slots;
    const [scope] = __VLS_vSlot(__VLS_71);
    (__VLS_ctx.getCategoryName(scope.row.type));
    // @ts-ignore
    [courses, vLoading, loading, getCategoryName,];
}
// @ts-ignore
[];
var __VLS_68;
let __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
    prop: "mediaUrl",
    label: "来源",
}));
const __VLS_74 = __VLS_73({
    prop: "mediaUrl",
    label: "来源",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const { default: __VLS_77 } = __VLS_75.slots;
{
    const { default: __VLS_78 } = __VLS_75.slots;
    const [scope] = __VLS_vSlot(__VLS_78);
    (scope.row.mediaUrl ? (scope.row.mediaUrl.startsWith('http') ? '第三方/OSS' : '本地') : '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_75;
let __VLS_79;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
    prop: "status",
    label: "状态",
}));
const __VLS_81 = __VLS_80({
    prop: "status",
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
const { default: __VLS_84 } = __VLS_82.slots;
{
    const { default: __VLS_85 } = __VLS_82.slots;
    const [scope] = __VLS_vSlot(__VLS_85);
    let __VLS_86;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
        type: (scope.row.status === 1 ? 'success' : 'info'),
    }));
    const __VLS_88 = __VLS_87({
        type: (scope.row.status === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_87));
    const { default: __VLS_91 } = __VLS_89.slots;
    (scope.row.status === 1 ? '上架' : '下架');
    // @ts-ignore
    [];
    var __VLS_89;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_82;
let __VLS_92;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
    label: "操作",
    width: "200",
}));
const __VLS_94 = __VLS_93({
    label: "操作",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
const { default: __VLS_97 } = __VLS_95.slots;
{
    const { default: __VLS_98 } = __VLS_95.slots;
    const [scope] = __VLS_vSlot(__VLS_98);
    let __VLS_99;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_101 = __VLS_100({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    let __VLS_104;
    const __VLS_105 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_106 } = __VLS_102.slots;
    // @ts-ignore
    [];
    var __VLS_102;
    var __VLS_103;
    let __VLS_107;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_109 = __VLS_108({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    let __VLS_112;
    const __VLS_113 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row.id);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_114 } = __VLS_110.slots;
    // @ts-ignore
    [];
    var __VLS_110;
    var __VLS_111;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_95;
// @ts-ignore
[];
var __VLS_52;
let __VLS_115;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑课程' : '新增课程'),
    width: "700px",
}));
const __VLS_117 = __VLS_116({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑课程' : '新增课程'),
    width: "700px",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
const { default: __VLS_120 } = __VLS_118.slots;
let __VLS_121;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_123 = __VLS_122({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
const { default: __VLS_126 } = __VLS_124.slots;
let __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
    label: "标题",
}));
const __VLS_129 = __VLS_128({
    label: "标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
const { default: __VLS_132 } = __VLS_130.slots;
let __VLS_133;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
    modelValue: (__VLS_ctx.form.title),
}));
const __VLS_135 = __VLS_134({
    modelValue: (__VLS_ctx.form.title),
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
// @ts-ignore
[dialogVisible, isEdit, form, form,];
var __VLS_130;
let __VLS_138;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
    label: "分类",
}));
const __VLS_140 = __VLS_139({
    label: "分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
const { default: __VLS_143 } = __VLS_141.slots;
let __VLS_144;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
    modelValue: (__VLS_ctx.form.type),
    placeholder: "请选择分类",
}));
const __VLS_146 = __VLS_145({
    modelValue: (__VLS_ctx.form.type),
    placeholder: "请选择分类",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
const { default: __VLS_149 } = __VLS_147.slots;
for (const [cat] of __VLS_vFor((__VLS_ctx.categories))) {
    let __VLS_150;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
        key: (cat.id),
        label: (cat.name),
        value: (cat.code),
    }));
    const __VLS_152 = __VLS_151({
        key: (cat.id),
        label: (cat.name),
        value: (cat.code),
    }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    // @ts-ignore
    [categories, form,];
}
// @ts-ignore
[];
var __VLS_147;
// @ts-ignore
[];
var __VLS_141;
let __VLS_155;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
    label: "简介",
}));
const __VLS_157 = __VLS_156({
    label: "简介",
}, ...__VLS_functionalComponentArgsRest(__VLS_156));
const { default: __VLS_160 } = __VLS_158.slots;
let __VLS_161;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    type: "textarea",
    modelValue: (__VLS_ctx.form.description),
}));
const __VLS_163 = __VLS_162({
    type: "textarea",
    modelValue: (__VLS_ctx.form.description),
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
// @ts-ignore
[form,];
var __VLS_158;
let __VLS_166;
/** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
elDivider;
// @ts-ignore
const __VLS_167 = __VLS_asFunctionalComponent1(__VLS_166, new __VLS_166({}));
const __VLS_168 = __VLS_167({}, ...__VLS_functionalComponentArgsRest(__VLS_167));
const { default: __VLS_171 } = __VLS_169.slots;
// @ts-ignore
[];
var __VLS_169;
let __VLS_172;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({
    label: "来源模式",
}));
const __VLS_174 = __VLS_173({
    label: "来源模式",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const { default: __VLS_177 } = __VLS_175.slots;
let __VLS_178;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent1(__VLS_178, new __VLS_178({
    modelValue: (__VLS_ctx.form.sourceType),
}));
const __VLS_180 = __VLS_179({
    modelValue: (__VLS_ctx.form.sourceType),
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
const { default: __VLS_183 } = __VLS_181.slots;
let __VLS_184;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184({
    label: "third_party",
}));
const __VLS_186 = __VLS_185({
    label: "third_party",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
const { default: __VLS_189 } = __VLS_187.slots;
// @ts-ignore
[form,];
var __VLS_187;
let __VLS_190;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
    label: "self_hosted",
}));
const __VLS_192 = __VLS_191({
    label: "self_hosted",
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
const { default: __VLS_195 } = __VLS_193.slots;
// @ts-ignore
[];
var __VLS_193;
// @ts-ignore
[];
var __VLS_181;
// @ts-ignore
[];
var __VLS_175;
if (__VLS_ctx.form.sourceType === 'third_party') {
    let __VLS_196;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
        label: "平台名称",
    }));
    const __VLS_198 = __VLS_197({
        label: "平台名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    const { default: __VLS_201 } = __VLS_199.slots;
    let __VLS_202;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
        modelValue: (__VLS_ctx.form.sourceName),
        placeholder: "如：B站、腾讯视频",
    }));
    const __VLS_204 = __VLS_203({
        modelValue: (__VLS_ctx.form.sourceName),
        placeholder: "如：B站、腾讯视频",
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    // @ts-ignore
    [form, form,];
    var __VLS_199;
    let __VLS_207;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_208 = __VLS_asFunctionalComponent1(__VLS_207, new __VLS_207({
        label: "视频链接",
    }));
    const __VLS_209 = __VLS_208({
        label: "视频链接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_208));
    const { default: __VLS_212 } = __VLS_210.slots;
    let __VLS_213;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_214 = __VLS_asFunctionalComponent1(__VLS_213, new __VLS_213({
        modelValue: (__VLS_ctx.form.sourceUrl),
        placeholder: "第三方视频播放页URL",
    }));
    const __VLS_215 = __VLS_214({
        modelValue: (__VLS_ctx.form.sourceUrl),
        placeholder: "第三方视频播放页URL",
    }, ...__VLS_functionalComponentArgsRest(__VLS_214));
    // @ts-ignore
    [form,];
    var __VLS_210;
    let __VLS_218;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218({
        label: "封面链接",
    }));
    const __VLS_220 = __VLS_219({
        label: "封面链接",
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    const { default: __VLS_223 } = __VLS_221.slots;
    let __VLS_224;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent1(__VLS_224, new __VLS_224({
        modelValue: (__VLS_ctx.form.coverUrl),
        placeholder: "第三方封面图URL",
    }));
    const __VLS_226 = __VLS_225({
        modelValue: (__VLS_ctx.form.coverUrl),
        placeholder: "第三方封面图URL",
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    // @ts-ignore
    [form,];
    var __VLS_221;
}
if (__VLS_ctx.form.sourceType === 'self_hosted') {
    let __VLS_229;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent1(__VLS_229, new __VLS_229({
        label: "存储源",
    }));
    const __VLS_231 = __VLS_230({
        label: "存储源",
    }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    const { default: __VLS_234 } = __VLS_232.slots;
    let __VLS_235;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({
        modelValue: (__VLS_ctx.form.storageProvider),
    }));
    const __VLS_237 = __VLS_236({
        modelValue: (__VLS_ctx.form.storageProvider),
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    const { default: __VLS_240 } = __VLS_238.slots;
    let __VLS_241;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent1(__VLS_241, new __VLS_241({
        label: "阿里云OSS",
        value: "oss",
    }));
    const __VLS_243 = __VLS_242({
        label: "阿里云OSS",
        value: "oss",
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    let __VLS_246;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_247 = __VLS_asFunctionalComponent1(__VLS_246, new __VLS_246({
        label: "本地存储",
        value: "local",
    }));
    const __VLS_248 = __VLS_247({
        label: "本地存储",
        value: "local",
    }, ...__VLS_functionalComponentArgsRest(__VLS_247));
    // @ts-ignore
    [form, form,];
    var __VLS_238;
    // @ts-ignore
    [];
    var __VLS_232;
    let __VLS_251;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_252 = __VLS_asFunctionalComponent1(__VLS_251, new __VLS_251({
        label: "资源地址",
    }));
    const __VLS_253 = __VLS_252({
        label: "资源地址",
    }, ...__VLS_functionalComponentArgsRest(__VLS_252));
    const { default: __VLS_256 } = __VLS_254.slots;
    let __VLS_257;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_258 = __VLS_asFunctionalComponent1(__VLS_257, new __VLS_257({
        modelValue: (__VLS_ctx.form.sourceUrl),
        placeholder: "视频/音频文件直链",
    }));
    const __VLS_259 = __VLS_258({
        modelValue: (__VLS_ctx.form.sourceUrl),
        placeholder: "视频/音频文件直链",
    }, ...__VLS_functionalComponentArgsRest(__VLS_258));
    // @ts-ignore
    [form,];
    var __VLS_254;
    let __VLS_262;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_263 = __VLS_asFunctionalComponent1(__VLS_262, new __VLS_262({
        label: "封面上传",
    }));
    const __VLS_264 = __VLS_263({
        label: "封面上传",
    }, ...__VLS_functionalComponentArgsRest(__VLS_263));
    const { default: __VLS_267 } = __VLS_265.slots;
    let __VLS_268;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_269 = __VLS_asFunctionalComponent1(__VLS_268, new __VLS_268({
        ...{ class: "avatar-uploader" },
        action: "/api/content/course/cover/upload",
        headers: (__VLS_ctx.uploadHeaders),
        showFileList: (false),
        onSuccess: (__VLS_ctx.handleCoverSuccess),
        beforeUpload: (__VLS_ctx.beforeCoverUpload),
    }));
    const __VLS_270 = __VLS_269({
        ...{ class: "avatar-uploader" },
        action: "/api/content/course/cover/upload",
        headers: (__VLS_ctx.uploadHeaders),
        showFileList: (false),
        onSuccess: (__VLS_ctx.handleCoverSuccess),
        beforeUpload: (__VLS_ctx.beforeCoverUpload),
    }, ...__VLS_functionalComponentArgsRest(__VLS_269));
    /** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
    const { default: __VLS_273 } = __VLS_271.slots;
    if (__VLS_ctx.form.coverUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.form.coverUrl),
            ...{ class: "avatar" },
        });
        /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
    }
    else {
        let __VLS_274;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_275 = __VLS_asFunctionalComponent1(__VLS_274, new __VLS_274({
            ...{ class: "avatar-uploader-icon" },
        }));
        const __VLS_276 = __VLS_275({
            ...{ class: "avatar-uploader-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_275));
        /** @type {__VLS_StyleScopedClasses['avatar-uploader-icon']} */ ;
        const { default: __VLS_279 } = __VLS_277.slots;
        let __VLS_280;
        /** @ts-ignore @type {typeof __VLS_components.Plus} */
        Plus;
        // @ts-ignore
        const __VLS_281 = __VLS_asFunctionalComponent1(__VLS_280, new __VLS_280({}));
        const __VLS_282 = __VLS_281({}, ...__VLS_functionalComponentArgsRest(__VLS_281));
        // @ts-ignore
        [form, form, uploadHeaders, handleCoverSuccess, beforeCoverUpload,];
        var __VLS_277;
    }
    // @ts-ignore
    [];
    var __VLS_271;
    // @ts-ignore
    [];
    var __VLS_265;
}
let __VLS_285;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_286 = __VLS_asFunctionalComponent1(__VLS_285, new __VLS_285({
    label: "状态",
}));
const __VLS_287 = __VLS_286({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_286));
const { default: __VLS_290 } = __VLS_288.slots;
let __VLS_291;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_292 = __VLS_asFunctionalComponent1(__VLS_291, new __VLS_291({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "上架",
    inactiveText: "下架",
}));
const __VLS_293 = __VLS_292({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "上架",
    inactiveText: "下架",
}, ...__VLS_functionalComponentArgsRest(__VLS_292));
// @ts-ignore
[form,];
var __VLS_288;
// @ts-ignore
[];
var __VLS_124;
{
    const { footer: __VLS_296 } = __VLS_118.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_297;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_298 = __VLS_asFunctionalComponent1(__VLS_297, new __VLS_297({
        ...{ 'onClick': {} },
    }));
    const __VLS_299 = __VLS_298({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_298));
    let __VLS_302;
    const __VLS_303 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_304 } = __VLS_300.slots;
    // @ts-ignore
    [];
    var __VLS_300;
    var __VLS_301;
    let __VLS_305;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_306 = __VLS_asFunctionalComponent1(__VLS_305, new __VLS_305({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_307 = __VLS_306({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_306));
    let __VLS_310;
    const __VLS_311 = ({ click: {} },
        { onClick: (__VLS_ctx.submitForm) });
    const { default: __VLS_312 } = __VLS_308.slots;
    // @ts-ignore
    [submitForm,];
    var __VLS_308;
    var __VLS_309;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_118;
let __VLS_313;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_314 = __VLS_asFunctionalComponent1(__VLS_313, new __VLS_313({
    modelValue: (__VLS_ctx.categoryDialogVisible),
    title: "课程分类管理",
    width: "600px",
}));
const __VLS_315 = __VLS_314({
    modelValue: (__VLS_ctx.categoryDialogVisible),
    title: "课程分类管理",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_314));
const { default: __VLS_318 } = __VLS_316.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "category-header" },
});
/** @type {__VLS_StyleScopedClasses['category-header']} */ ;
let __VLS_319;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_320 = __VLS_asFunctionalComponent1(__VLS_319, new __VLS_319({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_321 = __VLS_320({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_320));
let __VLS_324;
const __VLS_325 = ({ click: {} },
    { onClick: (__VLS_ctx.openCategoryForm) });
const { default: __VLS_326 } = __VLS_322.slots;
// @ts-ignore
[categoryDialogVisible, openCategoryForm,];
var __VLS_322;
var __VLS_323;
let __VLS_327;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_328 = __VLS_asFunctionalComponent1(__VLS_327, new __VLS_327({
    data: (__VLS_ctx.categoryList),
    ...{ style: {} },
}));
const __VLS_329 = __VLS_328({
    data: (__VLS_ctx.categoryList),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_328));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.categoryLoading) }, null, null);
const { default: __VLS_332 } = __VLS_330.slots;
let __VLS_333;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_334 = __VLS_asFunctionalComponent1(__VLS_333, new __VLS_333({
    prop: "name",
    label: "分类名称",
    width: "120",
}));
const __VLS_335 = __VLS_334({
    prop: "name",
    label: "分类名称",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_334));
let __VLS_338;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_339 = __VLS_asFunctionalComponent1(__VLS_338, new __VLS_338({
    prop: "code",
    label: "分类编码",
    width: "120",
}));
const __VLS_340 = __VLS_339({
    prop: "code",
    label: "分类编码",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_339));
let __VLS_343;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_344 = __VLS_asFunctionalComponent1(__VLS_343, new __VLS_343({
    prop: "sortOrder",
    label: "排序",
    width: "80",
}));
const __VLS_345 = __VLS_344({
    prop: "sortOrder",
    label: "排序",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_344));
let __VLS_348;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent1(__VLS_348, new __VLS_348({
    prop: "status",
    label: "状态",
}));
const __VLS_350 = __VLS_349({
    prop: "status",
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
const { default: __VLS_353 } = __VLS_351.slots;
{
    const { default: __VLS_354 } = __VLS_351.slots;
    const [scope] = __VLS_vSlot(__VLS_354);
    let __VLS_355;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_356 = __VLS_asFunctionalComponent1(__VLS_355, new __VLS_355({
        type: (scope.row.status === 1 ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_357 = __VLS_356({
        type: (scope.row.status === 1 ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_356));
    const { default: __VLS_360 } = __VLS_358.slots;
    (scope.row.status === 1 ? '启用' : '禁用');
    // @ts-ignore
    [vLoading, categoryList, categoryLoading,];
    var __VLS_358;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_351;
let __VLS_361;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_362 = __VLS_asFunctionalComponent1(__VLS_361, new __VLS_361({
    label: "操作",
    width: "180",
}));
const __VLS_363 = __VLS_362({
    label: "操作",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_362));
const { default: __VLS_366 } = __VLS_364.slots;
{
    const { default: __VLS_367 } = __VLS_364.slots;
    const [scope] = __VLS_vSlot(__VLS_367);
    let __VLS_368;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_369 = __VLS_asFunctionalComponent1(__VLS_368, new __VLS_368({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (scope.row.isSystem === 1),
    }));
    const __VLS_370 = __VLS_369({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (scope.row.isSystem === 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_369));
    let __VLS_373;
    const __VLS_374 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.editCategory(scope.row);
                // @ts-ignore
                [editCategory,];
            } });
    const { default: __VLS_375 } = __VLS_371.slots;
    // @ts-ignore
    [];
    var __VLS_371;
    var __VLS_372;
    let __VLS_376;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_377 = __VLS_asFunctionalComponent1(__VLS_376, new __VLS_376({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        disabled: (scope.row.isSystem === 1),
    }));
    const __VLS_378 = __VLS_377({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        disabled: (scope.row.isSystem === 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_377));
    let __VLS_381;
    const __VLS_382 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.deleteCategory(scope.row);
                // @ts-ignore
                [deleteCategory,];
            } });
    const { default: __VLS_383 } = __VLS_379.slots;
    // @ts-ignore
    [];
    var __VLS_379;
    var __VLS_380;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_364;
// @ts-ignore
[];
var __VLS_330;
if (__VLS_ctx.categoryFormVisible) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "category-form" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['category-form']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    (__VLS_ctx.categoryForm.id ? '编辑分类' : '新增分类');
    let __VLS_384;
    /** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
    elForm;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent1(__VLS_384, new __VLS_384({
        model: (__VLS_ctx.categoryForm),
        labelWidth: "80px",
        ...{ style: {} },
    }));
    const __VLS_386 = __VLS_385({
        model: (__VLS_ctx.categoryForm),
        labelWidth: "80px",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
    const { default: __VLS_389 } = __VLS_387.slots;
    let __VLS_390;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_391 = __VLS_asFunctionalComponent1(__VLS_390, new __VLS_390({
        label: "分类名称",
    }));
    const __VLS_392 = __VLS_391({
        label: "分类名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_391));
    const { default: __VLS_395 } = __VLS_393.slots;
    let __VLS_396;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_397 = __VLS_asFunctionalComponent1(__VLS_396, new __VLS_396({
        modelValue: (__VLS_ctx.categoryForm.name),
        placeholder: "请输入分类名称",
    }));
    const __VLS_398 = __VLS_397({
        modelValue: (__VLS_ctx.categoryForm.name),
        placeholder: "请输入分类名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_397));
    // @ts-ignore
    [categoryFormVisible, categoryForm, categoryForm, categoryForm,];
    var __VLS_393;
    let __VLS_401;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_402 = __VLS_asFunctionalComponent1(__VLS_401, new __VLS_401({
        label: "分类编码",
    }));
    const __VLS_403 = __VLS_402({
        label: "分类编码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_402));
    const { default: __VLS_406 } = __VLS_404.slots;
    let __VLS_407;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_408 = __VLS_asFunctionalComponent1(__VLS_407, new __VLS_407({
        modelValue: (__VLS_ctx.categoryForm.code),
        placeholder: "请输入分类编码（英文）",
        disabled: (!!__VLS_ctx.categoryForm.id),
    }));
    const __VLS_409 = __VLS_408({
        modelValue: (__VLS_ctx.categoryForm.code),
        placeholder: "请输入分类编码（英文）",
        disabled: (!!__VLS_ctx.categoryForm.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_408));
    // @ts-ignore
    [categoryForm, categoryForm,];
    var __VLS_404;
    let __VLS_412;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_413 = __VLS_asFunctionalComponent1(__VLS_412, new __VLS_412({
        label: "排序",
    }));
    const __VLS_414 = __VLS_413({
        label: "排序",
    }, ...__VLS_functionalComponentArgsRest(__VLS_413));
    const { default: __VLS_417 } = __VLS_415.slots;
    let __VLS_418;
    /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
    elInputNumber;
    // @ts-ignore
    const __VLS_419 = __VLS_asFunctionalComponent1(__VLS_418, new __VLS_418({
        modelValue: (__VLS_ctx.categoryForm.sortOrder),
        min: (0),
        max: (999),
    }));
    const __VLS_420 = __VLS_419({
        modelValue: (__VLS_ctx.categoryForm.sortOrder),
        min: (0),
        max: (999),
    }, ...__VLS_functionalComponentArgsRest(__VLS_419));
    // @ts-ignore
    [categoryForm,];
    var __VLS_415;
    let __VLS_423;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_424 = __VLS_asFunctionalComponent1(__VLS_423, new __VLS_423({
        label: "状态",
    }));
    const __VLS_425 = __VLS_424({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_424));
    const { default: __VLS_428 } = __VLS_426.slots;
    let __VLS_429;
    /** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
    elSwitch;
    // @ts-ignore
    const __VLS_430 = __VLS_asFunctionalComponent1(__VLS_429, new __VLS_429({
        modelValue: (__VLS_ctx.categoryForm.status),
        activeValue: (1),
        inactiveValue: (0),
        activeText: "启用",
        inactiveText: "禁用",
    }));
    const __VLS_431 = __VLS_430({
        modelValue: (__VLS_ctx.categoryForm.status),
        activeValue: (1),
        inactiveValue: (0),
        activeText: "启用",
        inactiveText: "禁用",
    }, ...__VLS_functionalComponentArgsRest(__VLS_430));
    // @ts-ignore
    [categoryForm,];
    var __VLS_426;
    let __VLS_434;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_435 = __VLS_asFunctionalComponent1(__VLS_434, new __VLS_434({}));
    const __VLS_436 = __VLS_435({}, ...__VLS_functionalComponentArgsRest(__VLS_435));
    const { default: __VLS_439 } = __VLS_437.slots;
    let __VLS_440;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_441 = __VLS_asFunctionalComponent1(__VLS_440, new __VLS_440({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_442 = __VLS_441({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_441));
    let __VLS_445;
    const __VLS_446 = ({ click: {} },
        { onClick: (__VLS_ctx.saveCategory) });
    const { default: __VLS_447 } = __VLS_443.slots;
    // @ts-ignore
    [saveCategory,];
    var __VLS_443;
    var __VLS_444;
    let __VLS_448;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_449 = __VLS_asFunctionalComponent1(__VLS_448, new __VLS_448({
        ...{ 'onClick': {} },
    }));
    const __VLS_450 = __VLS_449({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_449));
    let __VLS_453;
    const __VLS_454 = ({ click: {} },
        { onClick: (__VLS_ctx.cancelCategoryForm) });
    const { default: __VLS_455 } = __VLS_451.slots;
    // @ts-ignore
    [cancelCategoryForm,];
    var __VLS_451;
    var __VLS_452;
    // @ts-ignore
    [];
    var __VLS_437;
    // @ts-ignore
    [];
    var __VLS_387;
}
// @ts-ignore
[];
var __VLS_316;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
