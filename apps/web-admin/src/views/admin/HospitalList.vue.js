/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import request from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
const hospitals = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({});
const searchQuery = ref('');
const statusFilter = ref(undefined);
const uploadHeaders = {
    'token': localStorage.getItem('token') || ''
};
const handleAvatarSuccess = (response) => {
    if (response.code === 200) {
        form.picture = response.data;
    }
    else {
        ElMessage.error(response.message || '上传失败');
    }
};
const beforeAvatarUpload = (rawFile) => {
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('Picture must be JPG or PNG format!');
        return false;
    }
    else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('Picture size can not exceed 2MB!');
        return false;
    }
    return true;
};
const fetchHospitals = async () => {
    loading.value = true;
    try {
        const res = await request.get('/admin/hospitals', {
            params: {
                name: searchQuery.value,
                status: statusFilter.value
            }
        });
        if (res.code === 200) {
            hospitals.value = res.data.records;
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
const handleCheckUser = async () => {
    if (!form.adminUserId)
        return;
    try {
        const res = await request.get(`/admin/user/${form.adminUserId}`);
        if (res.code === 200) {
            const user = res.data;
            await ElMessageBox.confirm(`确认绑定该用户为医院管理员吗？\n用户名: ${user.username}\n昵称: ${user.nickname}\n电话: ${user.phone}`, '确认绑定', { type: 'info', confirmButtonText: '确认', cancelButtonText: '取消' });
            ElMessage.success('校验通过，保存后将生效');
        }
        else {
            ElMessage.error(res.message || '用户不存在');
            form.adminUserId = '';
        }
    }
    catch (e) {
        if (e !== 'cancel') {
            ElMessage.error('查询失败或用户不存在');
        }
        // If cancel, keep the ID or clear? Usually keep allows retry, but user might want to clear.
        // Let's not clear on cancel to allow user to see what they typed.
        // But if query failed, clear.
        if (e !== 'cancel')
            form.adminUserId = '';
    }
};
const handleAdd = () => {
    isEdit.value = false;
    Object.keys(form).forEach(key => delete form[key]);
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    isEdit.value = true;
    Object.assign(form, row);
    dialogVisible.value = true;
};
const handleDelete = (id) => {
    ElMessageBox.confirm('确定删除吗？', '提示', {
        type: 'warning'
    }).then(async () => {
        const res = await request.delete(`/admin/hospital/${id}`);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchHospitals();
        }
    });
};
const submitForm = async () => {
    if (form.adminUserId === '') {
        form.adminUserId = null;
    }
    const res = await request.post('/admin/hospital', form);
    if (res.code === 200) {
        ElMessage.success('操作成功');
        dialogVisible.value = false;
        fetchHospitals();
    }
    else {
        ElMessage.error(res.message);
    }
};
onMounted(() => {
    fetchHospitals();
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
    ...{ class: "hospital-list" },
});
/** @type {__VLS_StyleScopedClasses['hospital-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
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
    { onClick: (__VLS_ctx.handleAdd) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[handleAdd,];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-bar" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索医院名称",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索医院名称",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.fetchHospitals) });
var __VLS_11;
var __VLS_12;
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_20 } = __VLS_18.slots;
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    label: "正常",
    value: (1),
}));
const __VLS_23 = __VLS_22({
    label: "正常",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    label: "停用",
    value: (0),
}));
const __VLS_28 = __VLS_27({
    label: "停用",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
// @ts-ignore
[searchQuery, fetchHospitals, statusFilter,];
var __VLS_18;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    ...{ 'onClick': {} },
}));
const __VLS_33 = __VLS_32({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
let __VLS_36;
const __VLS_37 = ({ click: {} },
    { onClick: (__VLS_ctx.fetchHospitals) });
const { default: __VLS_38 } = __VLS_34.slots;
// @ts-ignore
[fetchHospitals,];
var __VLS_34;
var __VLS_35;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    data: (__VLS_ctx.hospitals),
    ...{ style: {} },
}));
const __VLS_41 = __VLS_40({
    data: (__VLS_ctx.hospitals),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_44 } = __VLS_42.slots;
let __VLS_45;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_47 = __VLS_46({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    prop: "name",
    label: "医院名称",
}));
const __VLS_52 = __VLS_51({
    prop: "name",
    label: "医院名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    prop: "code",
    label: "编码",
}));
const __VLS_57 = __VLS_56({
    prop: "code",
    label: "编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    prop: "contactPhone",
    label: "联系电话",
}));
const __VLS_62 = __VLS_61({
    prop: "contactPhone",
    label: "联系电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    prop: "address",
    label: "地址",
}));
const __VLS_67 = __VLS_66({
    prop: "address",
    label: "地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    prop: "status",
    label: "状态",
}));
const __VLS_72 = __VLS_71({
    prop: "status",
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
{
    const { default: __VLS_76 } = __VLS_73.slots;
    const [scope] = __VLS_vSlot(__VLS_76);
    let __VLS_77;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
        type: (scope.row.status === 1 ? 'success' : 'danger'),
    }));
    const __VLS_79 = __VLS_78({
        type: (scope.row.status === 1 ? 'success' : 'danger'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    const { default: __VLS_82 } = __VLS_80.slots;
    (scope.row.status === 1 ? '正常' : '停用');
    // @ts-ignore
    [hospitals, vLoading, loading,];
    var __VLS_80;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_73;
let __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
    label: "操作",
    width: "200",
}));
const __VLS_85 = __VLS_84({
    label: "操作",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
const { default: __VLS_88 } = __VLS_86.slots;
{
    const { default: __VLS_89 } = __VLS_86.slots;
    const [scope] = __VLS_vSlot(__VLS_89);
    let __VLS_90;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_92 = __VLS_91({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    let __VLS_95;
    const __VLS_96 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_97 } = __VLS_93.slots;
    // @ts-ignore
    [];
    var __VLS_93;
    var __VLS_94;
    let __VLS_98;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_100 = __VLS_99({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    let __VLS_103;
    const __VLS_104 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row.id);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_105 } = __VLS_101.slots;
    // @ts-ignore
    [];
    var __VLS_101;
    var __VLS_102;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_86;
// @ts-ignore
[];
var __VLS_42;
let __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑医院' : '新增医院'),
}));
const __VLS_108 = __VLS_107({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑医院' : '新增医院'),
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
const { default: __VLS_111 } = __VLS_109.slots;
let __VLS_112;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_114 = __VLS_113({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
const { default: __VLS_117 } = __VLS_115.slots;
let __VLS_118;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
    label: "医院名称",
}));
const __VLS_120 = __VLS_119({
    label: "医院名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
const { default: __VLS_123 } = __VLS_121.slots;
let __VLS_124;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
    modelValue: (__VLS_ctx.form.name),
}));
const __VLS_126 = __VLS_125({
    modelValue: (__VLS_ctx.form.name),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
// @ts-ignore
[dialogVisible, isEdit, form, form,];
var __VLS_121;
let __VLS_129;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
    label: "封面图",
}));
const __VLS_131 = __VLS_130({
    label: "封面图",
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
const { default: __VLS_134 } = __VLS_132.slots;
let __VLS_135;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({
    ...{ class: "avatar-uploader" },
    action: "/api/common/upload",
    headers: (__VLS_ctx.uploadHeaders),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccess),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
}));
const __VLS_137 = __VLS_136({
    ...{ class: "avatar-uploader" },
    action: "/api/common/upload",
    headers: (__VLS_ctx.uploadHeaders),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccess),
    beforeUpload: (__VLS_ctx.beforeAvatarUpload),
}, ...__VLS_functionalComponentArgsRest(__VLS_136));
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
const { default: __VLS_140 } = __VLS_138.slots;
if (__VLS_ctx.form.picture) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.form.picture),
        ...{ class: "avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
}
else {
    let __VLS_141;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
        ...{ class: "avatar-uploader-icon" },
    }));
    const __VLS_143 = __VLS_142({
        ...{ class: "avatar-uploader-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
    /** @type {__VLS_StyleScopedClasses['avatar-uploader-icon']} */ ;
    const { default: __VLS_146 } = __VLS_144.slots;
    let __VLS_147;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({}));
    const __VLS_149 = __VLS_148({}, ...__VLS_functionalComponentArgsRest(__VLS_148));
    // @ts-ignore
    [form, form, uploadHeaders, handleAvatarSuccess, beforeAvatarUpload,];
    var __VLS_144;
}
// @ts-ignore
[];
var __VLS_138;
// @ts-ignore
[];
var __VLS_132;
let __VLS_152;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
    label: "编码",
}));
const __VLS_154 = __VLS_153({
    label: "编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
const { default: __VLS_157 } = __VLS_155.slots;
let __VLS_158;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
    modelValue: (__VLS_ctx.form.code),
}));
const __VLS_160 = __VLS_159({
    modelValue: (__VLS_ctx.form.code),
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
// @ts-ignore
[form,];
var __VLS_155;
let __VLS_163;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
    label: "联系电话",
}));
const __VLS_165 = __VLS_164({
    label: "联系电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_164));
const { default: __VLS_168 } = __VLS_166.slots;
let __VLS_169;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
    modelValue: (__VLS_ctx.form.contactPhone),
}));
const __VLS_171 = __VLS_170({
    modelValue: (__VLS_ctx.form.contactPhone),
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
// @ts-ignore
[form,];
var __VLS_166;
let __VLS_174;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
    label: "地址",
}));
const __VLS_176 = __VLS_175({
    label: "地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
const { default: __VLS_179 } = __VLS_177.slots;
let __VLS_180;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
    modelValue: (__VLS_ctx.form.address),
}));
const __VLS_182 = __VLS_181({
    modelValue: (__VLS_ctx.form.address),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
// @ts-ignore
[form,];
var __VLS_177;
let __VLS_185;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
    label: "简介",
}));
const __VLS_187 = __VLS_186({
    label: "简介",
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
const { default: __VLS_190 } = __VLS_188.slots;
let __VLS_191;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
    type: "textarea",
    modelValue: (__VLS_ctx.form.introduction),
}));
const __VLS_193 = __VLS_192({
    type: "textarea",
    modelValue: (__VLS_ctx.form.introduction),
}, ...__VLS_functionalComponentArgsRest(__VLS_192));
// @ts-ignore
[form,];
var __VLS_188;
let __VLS_196;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
    label: "状态",
}));
const __VLS_198 = __VLS_197({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
const { default: __VLS_201 } = __VLS_199.slots;
let __VLS_202;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}));
const __VLS_204 = __VLS_203({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}, ...__VLS_functionalComponentArgsRest(__VLS_203));
// @ts-ignore
[form,];
var __VLS_199;
let __VLS_207;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent1(__VLS_207, new __VLS_207({
    label: "管理员ID",
}));
const __VLS_209 = __VLS_208({
    label: "管理员ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
const { default: __VLS_212 } = __VLS_210.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
let __VLS_213;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent1(__VLS_213, new __VLS_213({
    modelValue: (__VLS_ctx.form.adminUserId),
    placeholder: "请输入管理员用户ID",
    ...{ style: {} },
}));
const __VLS_215 = __VLS_214({
    modelValue: (__VLS_ctx.form.adminUserId),
    placeholder: "请输入管理员用户ID",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
let __VLS_218;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.form.adminUserId),
}));
const __VLS_220 = __VLS_219({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.form.adminUserId),
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
let __VLS_223;
const __VLS_224 = ({ click: {} },
    { onClick: (__VLS_ctx.handleCheckUser) });
const { default: __VLS_225 } = __VLS_221.slots;
// @ts-ignore
[form, form, handleCheckUser,];
var __VLS_221;
var __VLS_222;
// @ts-ignore
[];
var __VLS_210;
// @ts-ignore
[];
var __VLS_115;
{
    const { footer: __VLS_226 } = __VLS_109.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_227;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
        ...{ 'onClick': {} },
    }));
    const __VLS_229 = __VLS_228({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_228));
    let __VLS_232;
    const __VLS_233 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_234 } = __VLS_230.slots;
    // @ts-ignore
    [];
    var __VLS_230;
    var __VLS_231;
    let __VLS_235;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_237 = __VLS_236({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_236));
    let __VLS_240;
    const __VLS_241 = ({ click: {} },
        { onClick: (__VLS_ctx.submitForm) });
    const { default: __VLS_242 } = __VLS_238.slots;
    // @ts-ignore
    [submitForm,];
    var __VLS_238;
    var __VLS_239;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_109;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
