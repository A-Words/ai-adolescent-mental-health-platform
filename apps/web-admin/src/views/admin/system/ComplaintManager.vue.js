/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { getComplaintList, auditComplaint, restrictDoctor } from '@/api/consultation';
import { ElMessage, ElMessageBox } from 'element-plus';
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isSuperAdmin = computed(() => user.role === 4);
const isAdmin = computed(() => user.role === 3 || user.role === 4);
const loading = ref(false);
const complaints = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const fetchComplaints = async () => {
    loading.value = true;
    try {
        const res = await getComplaintList({
            page: currentPage.value,
            size: pageSize.value,
            role: user.role
        });
        if (res.code === 200) {
            complaints.value = res.data.records;
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
const auditVisible = ref(false);
const auditForm = ref({
    id: 0,
    status: 1,
    auditRemark: ''
});
const submitting = ref(false);
const openAuditDialog = (row) => {
    auditForm.value.id = row.id;
    auditForm.value.status = 1;
    auditForm.value.auditRemark = '';
    auditVisible.value = true;
};
const submitAudit = async () => {
    submitting.value = true;
    try {
        const res = await auditComplaint(auditForm.value.id, auditForm.value.status, auditForm.value.auditRemark);
        if (res.code === 200) {
            ElMessage.success('审核完成');
            auditVisible.value = false;
            fetchComplaints();
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error('操作失败');
    }
    finally {
        submitting.value = false;
    }
};
const imageVisible = ref(false);
const currentImages = ref([]);
const viewImages = (images) => {
    currentImages.value = images;
    imageVisible.value = true;
};
const viewDetail = (_row) => {
    // Logic to view full complaint details and audit history
};
const handleRestrict = async (doctorId) => {
    try {
        await ElMessageBox.confirm('确认限制该医生的线上咨询权限吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await restrictDoctor(doctorId, false);
        if (res.code === 200) {
            ElMessage.success('已成功限制医生权限');
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) { }
};
onMounted(() => {
    fetchComplaints();
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
}
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    data: (__VLS_ctx.complaints),
}));
const __VLS_9 = __VLS_8({
    data: (__VLS_ctx.complaints),
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_12 } = __VLS_10.slots;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_15 = __VLS_14({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    prop: "userId",
    label: "投诉人ID",
    width: "100",
}));
const __VLS_20 = __VLS_19({
    prop: "userId",
    label: "投诉人ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    prop: "doctorId",
    label: "被投诉医生ID",
    width: "120",
}));
const __VLS_25 = __VLS_24({
    prop: "doctorId",
    label: "被投诉医生ID",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    prop: "content",
    label: "投诉内容",
    minWidth: "200",
    showOverflowTooltip: true,
}));
const __VLS_30 = __VLS_29({
    prop: "content",
    label: "投诉内容",
    minWidth: "200",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    label: "证明图片",
    width: "120",
}));
const __VLS_35 = __VLS_34({
    label: "证明图片",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const { default: __VLS_38 } = __VLS_36.slots;
{
    const { default: __VLS_39 } = __VLS_36.slots;
    const [scope] = __VLS_vSlot(__VLS_39);
    if (scope.row.proofImages?.length) {
        let __VLS_40;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_45;
        const __VLS_46 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.proofImages?.length))
                        return;
                    __VLS_ctx.viewImages(scope.row.proofImages);
                    // @ts-ignore
                    [complaints, vLoading, loading, viewImages,];
                } });
        const { default: __VLS_47 } = __VLS_43.slots;
        // @ts-ignore
        [];
        var __VLS_43;
        var __VLS_44;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_36;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_50 = __VLS_49({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const { default: __VLS_53 } = __VLS_51.slots;
{
    const { default: __VLS_54 } = __VLS_51.slots;
    const [scope] = __VLS_vSlot(__VLS_54);
    if (scope.row.status === 0) {
        let __VLS_55;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
            type: "warning",
        }));
        const __VLS_57 = __VLS_56({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_56));
        const { default: __VLS_60 } = __VLS_58.slots;
        // @ts-ignore
        [];
        var __VLS_58;
    }
    else if (scope.row.status === 1) {
        let __VLS_61;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
            type: "success",
        }));
        const __VLS_63 = __VLS_62({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_62));
        const { default: __VLS_66 } = __VLS_64.slots;
        // @ts-ignore
        [];
        var __VLS_64;
    }
    else {
        let __VLS_67;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
            type: "danger",
        }));
        const __VLS_69 = __VLS_68({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_68));
        const { default: __VLS_72 } = __VLS_70.slots;
        // @ts-ignore
        [];
        var __VLS_70;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_51;
let __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    prop: "createTime",
    label: "投诉时间",
    width: "160",
}));
const __VLS_75 = __VLS_74({
    prop: "createTime",
    label: "投诉时间",
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
let __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    label: "操作",
    width: "220",
    fixed: "right",
}));
const __VLS_80 = __VLS_79({
    label: "操作",
    width: "220",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
const { default: __VLS_83 } = __VLS_81.slots;
{
    const { default: __VLS_84 } = __VLS_81.slots;
    const [scope] = __VLS_vSlot(__VLS_84);
    if (scope.row.status === 0 && __VLS_ctx.isSuperAdmin) {
        let __VLS_85;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_87 = __VLS_86({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        let __VLS_90;
        const __VLS_91 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 0 && __VLS_ctx.isSuperAdmin))
                        return;
                    __VLS_ctx.openAuditDialog(scope.row);
                    // @ts-ignore
                    [isSuperAdmin, openAuditDialog,];
                } });
        const { default: __VLS_92 } = __VLS_88.slots;
        // @ts-ignore
        [];
        var __VLS_88;
        var __VLS_89;
    }
    let __VLS_93;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_95 = __VLS_94({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_94));
    let __VLS_98;
    const __VLS_99 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewDetail(scope.row);
                // @ts-ignore
                [viewDetail,];
            } });
    const { default: __VLS_100 } = __VLS_96.slots;
    // @ts-ignore
    [];
    var __VLS_96;
    var __VLS_97;
    if (__VLS_ctx.isAdmin) {
        let __VLS_101;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_103 = __VLS_102({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_102));
        let __VLS_106;
        const __VLS_107 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isAdmin))
                        return;
                    __VLS_ctx.handleRestrict(scope.row.doctorId);
                    // @ts-ignore
                    [isAdmin, handleRestrict,];
                } });
        const { default: __VLS_108 } = __VLS_104.slots;
        // @ts-ignore
        [];
        var __VLS_104;
        var __VLS_105;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_81;
// @ts-ignore
[];
var __VLS_10;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_109;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_111 = __VLS_110({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_114;
const __VLS_115 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchComplaints) });
var __VLS_112;
var __VLS_113;
// @ts-ignore
[currentPage, pageSize, total, fetchComplaints,];
var __VLS_3;
let __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.auditVisible),
    title: "投诉审核",
    width: "500px",
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.auditVisible),
    title: "投诉审核",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
const { default: __VLS_121 } = __VLS_119.slots;
let __VLS_122;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
    model: (__VLS_ctx.auditForm),
    labelWidth: "80px",
}));
const __VLS_124 = __VLS_123({
    model: (__VLS_ctx.auditForm),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
const { default: __VLS_127 } = __VLS_125.slots;
let __VLS_128;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
    label: "审核结果",
}));
const __VLS_130 = __VLS_129({
    label: "审核结果",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
const { default: __VLS_133 } = __VLS_131.slots;
let __VLS_134;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
    modelValue: (__VLS_ctx.auditForm.status),
}));
const __VLS_136 = __VLS_135({
    modelValue: (__VLS_ctx.auditForm.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_135));
const { default: __VLS_139 } = __VLS_137.slots;
let __VLS_140;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
    label: (1),
}));
const __VLS_142 = __VLS_141({
    label: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
const { default: __VLS_145 } = __VLS_143.slots;
// @ts-ignore
[auditVisible, auditForm, auditForm,];
var __VLS_143;
let __VLS_146;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146({
    label: (2),
}));
const __VLS_148 = __VLS_147({
    label: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
const { default: __VLS_151 } = __VLS_149.slots;
// @ts-ignore
[];
var __VLS_149;
// @ts-ignore
[];
var __VLS_137;
// @ts-ignore
[];
var __VLS_131;
let __VLS_152;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
    label: "审核备注",
}));
const __VLS_154 = __VLS_153({
    label: "审核备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
const { default: __VLS_157 } = __VLS_155.slots;
let __VLS_158;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
    type: "textarea",
    modelValue: (__VLS_ctx.auditForm.auditRemark),
    rows: (3),
    placeholder: "请输入审核备注...",
}));
const __VLS_160 = __VLS_159({
    type: "textarea",
    modelValue: (__VLS_ctx.auditForm.auditRemark),
    rows: (3),
    placeholder: "请输入审核备注...",
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
// @ts-ignore
[auditForm,];
var __VLS_155;
// @ts-ignore
[];
var __VLS_125;
{
    const { footer: __VLS_163 } = __VLS_119.slots;
    let __VLS_164;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
        ...{ 'onClick': {} },
    }));
    const __VLS_166 = __VLS_165({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    let __VLS_169;
    const __VLS_170 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.auditVisible = false;
                // @ts-ignore
                [auditVisible,];
            } });
    const { default: __VLS_171 } = __VLS_167.slots;
    // @ts-ignore
    [];
    var __VLS_167;
    var __VLS_168;
    let __VLS_172;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_174 = __VLS_173({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    let __VLS_177;
    const __VLS_178 = ({ click: {} },
        { onClick: (__VLS_ctx.submitAudit) });
    const { default: __VLS_179 } = __VLS_175.slots;
    // @ts-ignore
    [submitting, submitAudit,];
    var __VLS_175;
    var __VLS_176;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_119;
let __VLS_180;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
    modelValue: (__VLS_ctx.imageVisible),
    title: "证明图片",
    width: "600px",
}));
const __VLS_182 = __VLS_181({
    modelValue: (__VLS_ctx.imageVisible),
    title: "证明图片",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
const { default: __VLS_185 } = __VLS_183.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "image-list" },
});
/** @type {__VLS_StyleScopedClasses['image-list']} */ ;
for (const [img] of __VLS_vFor((__VLS_ctx.currentImages))) {
    let __VLS_186;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({
        key: (img),
        src: (img),
        previewSrcList: (__VLS_ctx.currentImages),
        ...{ style: {} },
        fit: "cover",
    }));
    const __VLS_188 = __VLS_187({
        key: (img),
        src: (img),
        previewSrcList: (__VLS_ctx.currentImages),
        ...{ style: {} },
        fit: "cover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    // @ts-ignore
    [imageVisible, currentImages, currentImages,];
}
// @ts-ignore
[];
var __VLS_183;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
