/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import request from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
const users = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({});
const searchQuery = ref('');
const statusFilter = ref(undefined);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const fetchUsers = async () => {
    loading.value = true;
    try {
        const res = await request.get('/admin/users', {
            params: {
                page: page.value,
                size: size.value,
                username: searchQuery.value,
                status: statusFilter.value
            }
        });
        if (res.code === 200) {
            users.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
const handlePageChange = (val) => {
    page.value = val;
    fetchUsers();
};
const handleAdd = () => {
    isEdit.value = false;
    Object.keys(form).forEach(key => delete form[key]);
    form.role = 1; // default
    form.status = 1; // default
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    isEdit.value = true;
    Object.assign(form, row);
    form.password = ''; // Don't show password hash
    dialogVisible.value = true;
};
const handleDelete = (id) => {
    ElMessageBox.confirm('确定删除吗？', '提示', {
        type: 'warning'
    }).then(async () => {
        const res = await request.delete(`/admin/user/${id}`);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchUsers();
        }
    });
};
const submitForm = async () => {
    const res = await request.post('/admin/user', form);
    if (res.code === 200) {
        ElMessage.success('操作成功');
        dialogVisible.value = false;
        fetchUsers();
    }
    else {
        ElMessage.error(res.message);
    }
};
onMounted(() => {
    fetchUsers();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
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
    placeholder: "搜索用户名",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索用户名",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.fetchUsers) });
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
[searchQuery, fetchUsers, statusFilter,];
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
    { onClick: (__VLS_ctx.fetchUsers) });
const { default: __VLS_38 } = __VLS_34.slots;
// @ts-ignore
[fetchUsers,];
var __VLS_34;
var __VLS_35;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    data: (__VLS_ctx.users),
    ...{ style: {} },
}));
const __VLS_41 = __VLS_40({
    data: (__VLS_ctx.users),
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
    prop: "username",
    label: "用户名",
}));
const __VLS_52 = __VLS_51({
    prop: "username",
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    prop: "nickname",
    label: "昵称",
}));
const __VLS_57 = __VLS_56({
    prop: "nickname",
    label: "昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    prop: "role",
    label: "角色",
}));
const __VLS_62 = __VLS_61({
    prop: "role",
    label: "角色",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const { default: __VLS_65 } = __VLS_63.slots;
{
    const { default: __VLS_66 } = __VLS_63.slots;
    const [scope] = __VLS_vSlot(__VLS_66);
    if (scope.row.role === 1) {
        let __VLS_67;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({}));
        const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
        const { default: __VLS_72 } = __VLS_70.slots;
        // @ts-ignore
        [users, vLoading, loading,];
        var __VLS_70;
    }
    else if (scope.row.role === 2) {
        let __VLS_73;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
            type: "success",
        }));
        const __VLS_75 = __VLS_74({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        const { default: __VLS_78 } = __VLS_76.slots;
        // @ts-ignore
        [];
        var __VLS_76;
    }
    else if (scope.row.role === 3) {
        let __VLS_79;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            type: "warning",
        }));
        const __VLS_81 = __VLS_80({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        const { default: __VLS_84 } = __VLS_82.slots;
        // @ts-ignore
        [];
        var __VLS_82;
    }
    else if (scope.row.role === 4) {
        let __VLS_85;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            type: "danger",
        }));
        const __VLS_87 = __VLS_86({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        const { default: __VLS_90 } = __VLS_88.slots;
        // @ts-ignore
        [];
        var __VLS_88;
    }
    else {
        let __VLS_91;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
            type: "info",
        }));
        const __VLS_93 = __VLS_92({
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_92));
        const { default: __VLS_96 } = __VLS_94.slots;
        // @ts-ignore
        [];
        var __VLS_94;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_63;
let __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
    prop: "phone",
    label: "手机号",
}));
const __VLS_99 = __VLS_98({
    prop: "phone",
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
let __VLS_102;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
    prop: "status",
    label: "状态",
}));
const __VLS_104 = __VLS_103({
    prop: "status",
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
const { default: __VLS_107 } = __VLS_105.slots;
{
    const { default: __VLS_108 } = __VLS_105.slots;
    const [scope] = __VLS_vSlot(__VLS_108);
    let __VLS_109;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
        type: (scope.row.status === 1 ? 'success' : 'danger'),
    }));
    const __VLS_111 = __VLS_110({
        type: (scope.row.status === 1 ? 'success' : 'danger'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    const { default: __VLS_114 } = __VLS_112.slots;
    (scope.row.status === 1 ? '正常' : '停用');
    // @ts-ignore
    [];
    var __VLS_112;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_105;
let __VLS_115;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
    prop: "createTime",
    label: "创建时间",
    width: "180",
}));
const __VLS_117 = __VLS_116({
    prop: "createTime",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
let __VLS_120;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
    label: "操作",
    width: "200",
}));
const __VLS_122 = __VLS_121({
    label: "操作",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
const { default: __VLS_125 } = __VLS_123.slots;
{
    const { default: __VLS_126 } = __VLS_123.slots;
    const [scope] = __VLS_vSlot(__VLS_126);
    let __VLS_127;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_129 = __VLS_128({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    let __VLS_132;
    const __VLS_133 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_134 } = __VLS_130.slots;
    // @ts-ignore
    [];
    var __VLS_130;
    var __VLS_131;
    let __VLS_135;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_137 = __VLS_136({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_136));
    let __VLS_140;
    const __VLS_141 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row.id);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_142 } = __VLS_138.slots;
    // @ts-ignore
    [];
    var __VLS_138;
    var __VLS_139;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_123;
// @ts-ignore
[];
var __VLS_42;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
let __VLS_143;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "prev, pager, next",
    total: (__VLS_ctx.total),
    pageSize: (__VLS_ctx.size),
    currentPage: (__VLS_ctx.page),
}));
const __VLS_145 = __VLS_144({
    ...{ 'onCurrentChange': {} },
    background: true,
    layout: "prev, pager, next",
    total: (__VLS_ctx.total),
    pageSize: (__VLS_ctx.size),
    currentPage: (__VLS_ctx.page),
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
let __VLS_148;
const __VLS_149 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.handlePageChange) });
var __VLS_146;
var __VLS_147;
let __VLS_150;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑用户' : '新增用户'),
}));
const __VLS_152 = __VLS_151({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑用户' : '新增用户'),
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
const { default: __VLS_155 } = __VLS_153.slots;
let __VLS_156;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_158 = __VLS_157({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
const { default: __VLS_161 } = __VLS_159.slots;
let __VLS_162;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({
    label: "用户名",
}));
const __VLS_164 = __VLS_163({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
const { default: __VLS_167 } = __VLS_165.slots;
let __VLS_168;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
    modelValue: (__VLS_ctx.form.username),
    disabled: (__VLS_ctx.isEdit),
}));
const __VLS_170 = __VLS_169({
    modelValue: (__VLS_ctx.form.username),
    disabled: (__VLS_ctx.isEdit),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
// @ts-ignore
[total, size, page, handlePageChange, dialogVisible, isEdit, isEdit, form, form,];
var __VLS_165;
let __VLS_173;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
    label: "密码",
}));
const __VLS_175 = __VLS_174({
    label: "密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
const { default: __VLS_178 } = __VLS_176.slots;
let __VLS_179;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    placeholder: "不修改请留空",
    showPassword: true,
}));
const __VLS_181 = __VLS_180({
    modelValue: (__VLS_ctx.form.password),
    type: "password",
    placeholder: "不修改请留空",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
// @ts-ignore
[form,];
var __VLS_176;
let __VLS_184;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184({
    label: "昵称",
}));
const __VLS_186 = __VLS_185({
    label: "昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
const { default: __VLS_189 } = __VLS_187.slots;
let __VLS_190;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
    modelValue: (__VLS_ctx.form.nickname),
}));
const __VLS_192 = __VLS_191({
    modelValue: (__VLS_ctx.form.nickname),
}, ...__VLS_functionalComponentArgsRest(__VLS_191));
// @ts-ignore
[form,];
var __VLS_187;
let __VLS_195;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_196 = __VLS_asFunctionalComponent1(__VLS_195, new __VLS_195({
    label: "角色",
}));
const __VLS_197 = __VLS_196({
    label: "角色",
}, ...__VLS_functionalComponentArgsRest(__VLS_196));
const { default: __VLS_200 } = __VLS_198.slots;
let __VLS_201;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent1(__VLS_201, new __VLS_201({
    modelValue: (__VLS_ctx.form.role),
    placeholder: "请选择角色",
}));
const __VLS_203 = __VLS_202({
    modelValue: (__VLS_ctx.form.role),
    placeholder: "请选择角色",
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
const { default: __VLS_206 } = __VLS_204.slots;
let __VLS_207;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_208 = __VLS_asFunctionalComponent1(__VLS_207, new __VLS_207({
    label: "普通用户",
    value: (1),
}));
const __VLS_209 = __VLS_208({
    label: "普通用户",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_208));
let __VLS_212;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent1(__VLS_212, new __VLS_212({
    label: "医生",
    value: (2),
}));
const __VLS_214 = __VLS_213({
    label: "医生",
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
let __VLS_217;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_218 = __VLS_asFunctionalComponent1(__VLS_217, new __VLS_217({
    label: "医院管理员",
    value: (3),
}));
const __VLS_219 = __VLS_218({
    label: "医院管理员",
    value: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_218));
let __VLS_222;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
    label: "超级管理员",
    value: (4),
}));
const __VLS_224 = __VLS_223({
    label: "超级管理员",
    value: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_223));
// @ts-ignore
[form,];
var __VLS_204;
// @ts-ignore
[];
var __VLS_198;
let __VLS_227;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
    label: "手机号",
}));
const __VLS_229 = __VLS_228({
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
const { default: __VLS_232 } = __VLS_230.slots;
let __VLS_233;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({
    modelValue: (__VLS_ctx.form.phone),
}));
const __VLS_235 = __VLS_234({
    modelValue: (__VLS_ctx.form.phone),
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
// @ts-ignore
[form,];
var __VLS_230;
let __VLS_238;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_239 = __VLS_asFunctionalComponent1(__VLS_238, new __VLS_238({
    label: "状态",
}));
const __VLS_240 = __VLS_239({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_239));
const { default: __VLS_243 } = __VLS_241.slots;
let __VLS_244;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent1(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
// @ts-ignore
[form,];
var __VLS_241;
// @ts-ignore
[];
var __VLS_159;
{
    const { footer: __VLS_249 } = __VLS_153.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_250;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent1(__VLS_250, new __VLS_250({
        ...{ 'onClick': {} },
    }));
    const __VLS_252 = __VLS_251({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_251));
    let __VLS_255;
    const __VLS_256 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_257 } = __VLS_253.slots;
    // @ts-ignore
    [];
    var __VLS_253;
    var __VLS_254;
    let __VLS_258;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_259 = __VLS_asFunctionalComponent1(__VLS_258, new __VLS_258({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_260 = __VLS_259({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_259));
    let __VLS_263;
    const __VLS_264 = ({ click: {} },
        { onClick: (__VLS_ctx.submitForm) });
    const { default: __VLS_265 } = __VLS_261.slots;
    // @ts-ignore
    [submitForm,];
    var __VLS_261;
    var __VLS_262;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_153;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
