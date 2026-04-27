/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import request from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import ScheduleConfigDialog from './ScheduleConfigDialog.vue';
const doctors = ref([]);
const departments = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const scheduleVisible = ref(false);
const currentDoctorId = ref(0);
const isEdit = ref(false);
const form = reactive({});
const searchQuery = ref('');
const statusFilter = ref(undefined);
const bindUsername = ref('');
const foundUser = ref(false);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const handleSchedule = (row) => {
    currentDoctorId.value = row.id;
    scheduleVisible.value = true;
};
const fetchDoctors = async () => {
    loading.value = true;
    try {
        const res = await request.get('/admin/hospital/doctors', {
            params: {
                page: page.value,
                size: size.value,
                name: searchQuery.value,
                status: statusFilter.value
            }
        });
        if (res.code === 200) {
            doctors.value = res.data.records;
            total.value = res.data.total || 0;
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
const fetchDepartments = async () => {
    try {
        const res = await request.get('/hospital/department/list', { params: { size: 100 } });
        if (res.code === 200) {
            departments.value = res.data.records;
        }
    }
    catch (e) { }
};
const getDepartmentName = (id) => {
    const dept = departments.value.find(d => d.id === id);
    return dept ? dept.name : '未分配';
};
const checkUser = async () => {
    if (!bindUsername.value)
        return;
    try {
        const res = await request.get('/admin/users', { params: { username: bindUsername.value } });
        if (res.code === 200 && res.data.records.length > 0) {
            const user = res.data.records[0];
            if (user.username === bindUsername.value) {
                await ElMessageBox.confirm(`找到用户：${user.nickname} (${user.username})，确认绑定吗？`, '确认', { type: 'info' });
                foundUser.value = true;
                // Fill form
                form.username = user.username;
                form.nickname = user.nickname;
                form.phone = user.phone;
                form.status = user.status;
                // Keep password empty as we don't change it for existing user unless needed, but API expects it if new.
                // For binding, we don't need password.
            }
        }
        else {
            ElMessage.warning('未找到用户');
        }
    }
    catch (e) { }
};
const handleAdd = () => {
    isEdit.value = false;
    foundUser.value = false;
    bindUsername.value = '';
    Object.keys(form).forEach(key => delete form[key]);
    form.status = 1;
    form.onlineConsultEnabled = 1;
    form.offlineConsultEnabled = 1;
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    isEdit.value = true;
    foundUser.value = false; // Editing existing doctor, treated as "found" user effectively but disabled inputs handle it
    Object.assign(form, row);
    dialogVisible.value = true;
};
const handleDelete = (id) => {
    ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/admin/hospital/doctor/${id}`);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchDoctors();
        }
    });
};
const handleToggleConsultation = async (row, type, value) => {
    const params = {};
    if (type === 'online') {
        params.onlineEnabled = value ? 1 : 0;
    }
    else {
        params.offlineEnabled = value ? 1 : 0;
    }
    try {
        const res = await request.put(`/admin/hospital/doctor/${row.id}/consultation-switch`, null, { params });
        if (res.code === 200) {
            ElMessage.success('咨询权限已更新');
            fetchDoctors();
        }
        else {
            ElMessage.error(res.message || '更新失败');
        }
    }
    catch (e) {
        ElMessage.error('更新失败');
    }
};
const submitForm = async () => {
    const res = await request.post('/admin/hospital/doctor', form);
    if (res.code === 200) {
        ElMessage.success('保存成功');
        dialogVisible.value = false;
        fetchDoctors();
    }
    else {
        ElMessage.error(res.message);
    }
};
onMounted(() => {
    fetchDepartments();
    fetchDoctors();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "doctor-list" },
});
/** @type {__VLS_StyleScopedClasses['doctor-list']} */ ;
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
    placeholder: "搜索医生姓名/用户名",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索医生姓名/用户名",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.fetchDoctors) });
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
[searchQuery, fetchDoctors, statusFilter,];
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
    { onClick: (__VLS_ctx.fetchDoctors) });
const { default: __VLS_38 } = __VLS_34.slots;
// @ts-ignore
[fetchDoctors,];
var __VLS_34;
var __VLS_35;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    data: (__VLS_ctx.doctors),
    ...{ style: {} },
}));
const __VLS_41 = __VLS_40({
    data: (__VLS_ctx.doctors),
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
    prop: "realName",
    label: "真实姓名",
}));
const __VLS_52 = __VLS_51({
    prop: "realName",
    label: "真实姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    prop: "username",
    label: "用户名",
}));
const __VLS_57 = __VLS_56({
    prop: "username",
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    prop: "specialty",
    label: "专长",
    minWidth: "120",
    showOverflowTooltip: true,
}));
const __VLS_62 = __VLS_61({
    prop: "specialty",
    label: "专长",
    minWidth: "120",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    prop: "title",
    label: "职称",
}));
const __VLS_67 = __VLS_66({
    prop: "title",
    label: "职称",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    prop: "departmentId",
    label: "所属科室",
}));
const __VLS_72 = __VLS_71({
    prop: "departmentId",
    label: "所属科室",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
{
    const { default: __VLS_76 } = __VLS_73.slots;
    const [scope] = __VLS_vSlot(__VLS_76);
    (__VLS_ctx.getDepartmentName(scope.row.departmentId));
    // @ts-ignore
    [doctors, vLoading, loading, getDepartmentName,];
}
// @ts-ignore
[];
var __VLS_73;
let __VLS_77;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
    prop: "consultationPrice",
    label: "咨询价格",
    width: "100",
}));
const __VLS_79 = __VLS_78({
    prop: "consultationPrice",
    label: "咨询价格",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
const { default: __VLS_82 } = __VLS_80.slots;
{
    const { default: __VLS_83 } = __VLS_80.slots;
    const [scope] = __VLS_vSlot(__VLS_83);
    (scope.row.consultationPrice ?? 0);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_80;
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    prop: "phone",
    label: "手机号",
}));
const __VLS_86 = __VLS_85({
    prop: "phone",
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_89;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
    label: "线上咨询",
    width: "120",
}));
const __VLS_91 = __VLS_90({
    label: "线上咨询",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
const { default: __VLS_94 } = __VLS_92.slots;
{
    const { default: __VLS_95 } = __VLS_92.slots;
    const [scope] = __VLS_vSlot(__VLS_95);
    let __VLS_96;
    /** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
    elSwitch;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
        ...{ 'onChange': {} },
        modelValue: (scope.row.onlineConsultEnabled === 1),
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onChange': {} },
        modelValue: (scope.row.onlineConsultEnabled === 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_101;
    const __VLS_102 = ({ change: {} },
        { onChange: ((val) => __VLS_ctx.handleToggleConsultation(scope.row, 'online', val)) });
    var __VLS_99;
    var __VLS_100;
    // @ts-ignore
    [handleToggleConsultation,];
}
// @ts-ignore
[];
var __VLS_92;
let __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    label: "线下咨询",
    width: "120",
}));
const __VLS_105 = __VLS_104({
    label: "线下咨询",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
const { default: __VLS_108 } = __VLS_106.slots;
{
    const { default: __VLS_109 } = __VLS_106.slots;
    const [scope] = __VLS_vSlot(__VLS_109);
    let __VLS_110;
    /** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
    elSwitch;
    // @ts-ignore
    const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
        ...{ 'onChange': {} },
        modelValue: (scope.row.offlineConsultEnabled === 1),
    }));
    const __VLS_112 = __VLS_111({
        ...{ 'onChange': {} },
        modelValue: (scope.row.offlineConsultEnabled === 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_111));
    let __VLS_115;
    const __VLS_116 = ({ change: {} },
        { onChange: ((val) => __VLS_ctx.handleToggleConsultation(scope.row, 'offline', val)) });
    var __VLS_113;
    var __VLS_114;
    // @ts-ignore
    [handleToggleConsultation,];
}
// @ts-ignore
[];
var __VLS_106;
let __VLS_117;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
    prop: "status",
    label: "状态",
}));
const __VLS_119 = __VLS_118({
    prop: "status",
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
const { default: __VLS_122 } = __VLS_120.slots;
{
    const { default: __VLS_123 } = __VLS_120.slots;
    const [scope] = __VLS_vSlot(__VLS_123);
    let __VLS_124;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
        type: (scope.row.status === 1 ? 'success' : 'danger'),
    }));
    const __VLS_126 = __VLS_125({
        type: (scope.row.status === 1 ? 'success' : 'danger'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    const { default: __VLS_129 } = __VLS_127.slots;
    (scope.row.status === 1 ? '正常' : '停用');
    // @ts-ignore
    [];
    var __VLS_127;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_120;
let __VLS_130;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
    label: "操作",
    width: "300",
}));
const __VLS_132 = __VLS_131({
    label: "操作",
    width: "300",
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
const { default: __VLS_135 } = __VLS_133.slots;
{
    const { default: __VLS_136 } = __VLS_133.slots;
    const [scope] = __VLS_vSlot(__VLS_136);
    let __VLS_137;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_139 = __VLS_138({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    let __VLS_142;
    const __VLS_143 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_144 } = __VLS_140.slots;
    // @ts-ignore
    [];
    var __VLS_140;
    var __VLS_141;
    let __VLS_145;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
        ...{ 'onClick': {} },
        size: "small",
        type: "success",
    }));
    const __VLS_147 = __VLS_146({
        ...{ 'onClick': {} },
        size: "small",
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    let __VLS_150;
    const __VLS_151 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleSchedule(scope.row);
                // @ts-ignore
                [handleSchedule,];
            } });
    const { default: __VLS_152 } = __VLS_148.slots;
    // @ts-ignore
    [];
    var __VLS_148;
    var __VLS_149;
    let __VLS_153;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_155 = __VLS_154({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_154));
    let __VLS_158;
    const __VLS_159 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row.id);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_160 } = __VLS_156.slots;
    // @ts-ignore
    [];
    var __VLS_156;
    var __VLS_157;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_133;
// @ts-ignore
[];
var __VLS_42;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ style: {} },
});
let __VLS_161;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.size),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_163 = __VLS_162({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.page),
    pageSize: (__VLS_ctx.size),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
let __VLS_166;
const __VLS_167 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchDoctors) });
var __VLS_164;
var __VLS_165;
const __VLS_168 = ScheduleConfigDialog;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
    modelValue: (__VLS_ctx.scheduleVisible),
    doctorId: (__VLS_ctx.currentDoctorId),
}));
const __VLS_170 = __VLS_169({
    modelValue: (__VLS_ctx.scheduleVisible),
    doctorId: (__VLS_ctx.currentDoctorId),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
let __VLS_173;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑医生' : '新增医生'),
}));
const __VLS_175 = __VLS_174({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.isEdit ? '编辑医生' : '新增医生'),
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
const { default: __VLS_178 } = __VLS_176.slots;
let __VLS_179;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_181 = __VLS_180({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
const { default: __VLS_184 } = __VLS_182.slots;
if (!__VLS_ctx.isEdit) {
    let __VLS_185;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
        label: "绑定现有用户",
    }));
    const __VLS_187 = __VLS_186({
        label: "绑定现有用户",
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    const { default: __VLS_190 } = __VLS_188.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ style: {} },
    });
    let __VLS_191;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
        modelValue: (__VLS_ctx.bindUsername),
        placeholder: "输入用户名查找",
        ...{ style: {} },
    }));
    const __VLS_193 = __VLS_192({
        modelValue: (__VLS_ctx.bindUsername),
        placeholder: "输入用户名查找",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    let __VLS_196;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_198 = __VLS_197({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    let __VLS_201;
    const __VLS_202 = ({ click: {} },
        { onClick: (__VLS_ctx.checkUser) });
    const { default: __VLS_203 } = __VLS_199.slots;
    // @ts-ignore
    [fetchDoctors, page, size, total, scheduleVisible, currentDoctorId, dialogVisible, isEdit, isEdit, form, bindUsername, checkUser,];
    var __VLS_199;
    var __VLS_200;
    // @ts-ignore
    [];
    var __VLS_188;
}
if (!__VLS_ctx.isEdit && !__VLS_ctx.foundUser) {
    let __VLS_204;
    /** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
    elDivider;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({}));
    const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
    const { default: __VLS_209 } = __VLS_207.slots;
    // @ts-ignore
    [isEdit, foundUser,];
    var __VLS_207;
}
if (__VLS_ctx.foundUser) {
    let __VLS_210;
    /** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
    elDivider;
    // @ts-ignore
    const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({}));
    const __VLS_212 = __VLS_211({}, ...__VLS_functionalComponentArgsRest(__VLS_211));
    const { default: __VLS_215 } = __VLS_213.slots;
    // @ts-ignore
    [foundUser,];
    var __VLS_213;
}
let __VLS_216;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
    label: "用户名",
}));
const __VLS_218 = __VLS_217({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
const { default: __VLS_221 } = __VLS_219.slots;
let __VLS_222;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
    modelValue: (__VLS_ctx.form.username),
    disabled: (__VLS_ctx.isEdit || __VLS_ctx.foundUser),
}));
const __VLS_224 = __VLS_223({
    modelValue: (__VLS_ctx.form.username),
    disabled: (__VLS_ctx.isEdit || __VLS_ctx.foundUser),
}, ...__VLS_functionalComponentArgsRest(__VLS_223));
// @ts-ignore
[isEdit, form, foundUser,];
var __VLS_219;
if (!__VLS_ctx.isEdit && !__VLS_ctx.foundUser) {
    let __VLS_227;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
        label: "密码",
    }));
    const __VLS_229 = __VLS_228({
        label: "密码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_228));
    const { default: __VLS_232 } = __VLS_230.slots;
    let __VLS_233;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent1(__VLS_233, new __VLS_233({
        modelValue: (__VLS_ctx.form.password),
        type: "password",
        showPassword: true,
    }));
    const __VLS_235 = __VLS_234({
        modelValue: (__VLS_ctx.form.password),
        type: "password",
        showPassword: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    // @ts-ignore
    [isEdit, form, foundUser,];
    var __VLS_230;
}
let __VLS_238;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_239 = __VLS_asFunctionalComponent1(__VLS_238, new __VLS_238({
    label: "真实姓名",
}));
const __VLS_240 = __VLS_239({
    label: "真实姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_239));
const { default: __VLS_243 } = __VLS_241.slots;
let __VLS_244;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent1(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.form.realName),
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.form.realName),
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
// @ts-ignore
[form,];
var __VLS_241;
let __VLS_249;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_250 = __VLS_asFunctionalComponent1(__VLS_249, new __VLS_249({
    label: "昵称",
}));
const __VLS_251 = __VLS_250({
    label: "昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_250));
const { default: __VLS_254 } = __VLS_252.slots;
let __VLS_255;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255({
    modelValue: (__VLS_ctx.form.nickname),
    disabled: (__VLS_ctx.foundUser),
}));
const __VLS_257 = __VLS_256({
    modelValue: (__VLS_ctx.form.nickname),
    disabled: (__VLS_ctx.foundUser),
}, ...__VLS_functionalComponentArgsRest(__VLS_256));
// @ts-ignore
[form, foundUser,];
var __VLS_252;
let __VLS_260;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260({
    label: "手机号",
}));
const __VLS_262 = __VLS_261({
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
const { default: __VLS_265 } = __VLS_263.slots;
let __VLS_266;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({
    modelValue: (__VLS_ctx.form.phone),
    disabled: (__VLS_ctx.foundUser),
}));
const __VLS_268 = __VLS_267({
    modelValue: (__VLS_ctx.form.phone),
    disabled: (__VLS_ctx.foundUser),
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
// @ts-ignore
[form, foundUser,];
var __VLS_263;
let __VLS_271;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent1(__VLS_271, new __VLS_271({
    label: "所属科室",
}));
const __VLS_273 = __VLS_272({
    label: "所属科室",
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
const { default: __VLS_276 } = __VLS_274.slots;
let __VLS_277;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_278 = __VLS_asFunctionalComponent1(__VLS_277, new __VLS_277({
    modelValue: (__VLS_ctx.form.departmentId),
    placeholder: "请选择科室",
    ...{ style: {} },
}));
const __VLS_279 = __VLS_278({
    modelValue: (__VLS_ctx.form.departmentId),
    placeholder: "请选择科室",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_278));
const { default: __VLS_282 } = __VLS_280.slots;
for (const [dept] of __VLS_vFor((__VLS_ctx.departments))) {
    let __VLS_283;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_284 = __VLS_asFunctionalComponent1(__VLS_283, new __VLS_283({
        key: (dept.id),
        label: (dept.name),
        value: (dept.id),
    }));
    const __VLS_285 = __VLS_284({
        key: (dept.id),
        label: (dept.name),
        value: (dept.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_284));
    // @ts-ignore
    [form, departments,];
}
// @ts-ignore
[];
var __VLS_280;
// @ts-ignore
[];
var __VLS_274;
let __VLS_288;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent1(__VLS_288, new __VLS_288({
    label: "职称",
}));
const __VLS_290 = __VLS_289({
    label: "职称",
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
const { default: __VLS_293 } = __VLS_291.slots;
let __VLS_294;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_295 = __VLS_asFunctionalComponent1(__VLS_294, new __VLS_294({
    modelValue: (__VLS_ctx.form.title),
}));
const __VLS_296 = __VLS_295({
    modelValue: (__VLS_ctx.form.title),
}, ...__VLS_functionalComponentArgsRest(__VLS_295));
// @ts-ignore
[form,];
var __VLS_291;
let __VLS_299;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_300 = __VLS_asFunctionalComponent1(__VLS_299, new __VLS_299({
    label: "专长",
}));
const __VLS_301 = __VLS_300({
    label: "专长",
}, ...__VLS_functionalComponentArgsRest(__VLS_300));
const { default: __VLS_304 } = __VLS_302.slots;
let __VLS_305;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_306 = __VLS_asFunctionalComponent1(__VLS_305, new __VLS_305({
    modelValue: (__VLS_ctx.form.specialty),
}));
const __VLS_307 = __VLS_306({
    modelValue: (__VLS_ctx.form.specialty),
}, ...__VLS_functionalComponentArgsRest(__VLS_306));
// @ts-ignore
[form,];
var __VLS_302;
let __VLS_310;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_311 = __VLS_asFunctionalComponent1(__VLS_310, new __VLS_310({
    label: "简介",
}));
const __VLS_312 = __VLS_311({
    label: "简介",
}, ...__VLS_functionalComponentArgsRest(__VLS_311));
const { default: __VLS_315 } = __VLS_313.slots;
let __VLS_316;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent1(__VLS_316, new __VLS_316({
    type: "textarea",
    modelValue: (__VLS_ctx.form.introduction),
}));
const __VLS_318 = __VLS_317({
    type: "textarea",
    modelValue: (__VLS_ctx.form.introduction),
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
// @ts-ignore
[form,];
var __VLS_313;
let __VLS_321;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_322 = __VLS_asFunctionalComponent1(__VLS_321, new __VLS_321({
    label: "咨询价格",
}));
const __VLS_323 = __VLS_322({
    label: "咨询价格",
}, ...__VLS_functionalComponentArgsRest(__VLS_322));
const { default: __VLS_326 } = __VLS_324.slots;
let __VLS_327;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber | typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_328 = __VLS_asFunctionalComponent1(__VLS_327, new __VLS_327({
    modelValue: (__VLS_ctx.form.consultationPrice),
    precision: (2),
    step: (10),
}));
const __VLS_329 = __VLS_328({
    modelValue: (__VLS_ctx.form.consultationPrice),
    precision: (2),
    step: (10),
}, ...__VLS_functionalComponentArgsRest(__VLS_328));
// @ts-ignore
[form,];
var __VLS_324;
let __VLS_332;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent1(__VLS_332, new __VLS_332({
    label: "状态",
}));
const __VLS_334 = __VLS_333({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
const { default: __VLS_337 } = __VLS_335.slots;
let __VLS_338;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_339 = __VLS_asFunctionalComponent1(__VLS_338, new __VLS_338({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}));
const __VLS_340 = __VLS_339({
    modelValue: (__VLS_ctx.form.status),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}, ...__VLS_functionalComponentArgsRest(__VLS_339));
// @ts-ignore
[form,];
var __VLS_335;
let __VLS_343;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_344 = __VLS_asFunctionalComponent1(__VLS_343, new __VLS_343({
    label: "线上咨询",
}));
const __VLS_345 = __VLS_344({
    label: "线上咨询",
}, ...__VLS_functionalComponentArgsRest(__VLS_344));
const { default: __VLS_348 } = __VLS_346.slots;
let __VLS_349;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_350 = __VLS_asFunctionalComponent1(__VLS_349, new __VLS_349({
    modelValue: (__VLS_ctx.form.onlineConsultEnabled),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}));
const __VLS_351 = __VLS_350({
    modelValue: (__VLS_ctx.form.onlineConsultEnabled),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}, ...__VLS_functionalComponentArgsRest(__VLS_350));
// @ts-ignore
[form,];
var __VLS_346;
let __VLS_354;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_355 = __VLS_asFunctionalComponent1(__VLS_354, new __VLS_354({
    label: "线下咨询",
}));
const __VLS_356 = __VLS_355({
    label: "线下咨询",
}, ...__VLS_functionalComponentArgsRest(__VLS_355));
const { default: __VLS_359 } = __VLS_357.slots;
let __VLS_360;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch | typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_361 = __VLS_asFunctionalComponent1(__VLS_360, new __VLS_360({
    modelValue: (__VLS_ctx.form.offlineConsultEnabled),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}));
const __VLS_362 = __VLS_361({
    modelValue: (__VLS_ctx.form.offlineConsultEnabled),
    activeValue: (1),
    inactiveValue: (0),
    activeText: "启用",
    inactiveText: "停用",
}, ...__VLS_functionalComponentArgsRest(__VLS_361));
// @ts-ignore
[form,];
var __VLS_357;
// @ts-ignore
[];
var __VLS_182;
{
    const { footer: __VLS_365 } = __VLS_176.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_366;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_367 = __VLS_asFunctionalComponent1(__VLS_366, new __VLS_366({
        ...{ 'onClick': {} },
    }));
    const __VLS_368 = __VLS_367({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_367));
    let __VLS_371;
    const __VLS_372 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_373 } = __VLS_369.slots;
    // @ts-ignore
    [];
    var __VLS_369;
    var __VLS_370;
    let __VLS_374;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_375 = __VLS_asFunctionalComponent1(__VLS_374, new __VLS_374({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_376 = __VLS_375({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_375));
    let __VLS_379;
    const __VLS_380 = ({ click: {} },
        { onClick: (__VLS_ctx.submitForm) });
    const { default: __VLS_381 } = __VLS_377.slots;
    // @ts-ignore
    [submitForm,];
    var __VLS_377;
    var __VLS_378;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_176;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
