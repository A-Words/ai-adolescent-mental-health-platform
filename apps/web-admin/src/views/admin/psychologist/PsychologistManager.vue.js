/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getAdminApplyList, getApprovedPsychologists, reviewApply, markPaperResult, markReportResult, markInterviewResult } from '@/api/psychologistApply';
const activeTab = ref('apply-list');
const loading = ref(false);
const applyList = ref([]);
const psychologistList = ref([]);
const statusFilter = ref('');
// 详情对话框
const detailDialogVisible = ref(false);
const currentApply = ref(null);
// 审核对话框
const reviewDialogVisible = ref(false);
const reviewForm = reactive({
    approved: true,
    reason: ''
});
// 笔试对话框
const paperDialogVisible = ref(false);
const paperForm = reactive({
    passed: true,
    reason: ''
});
// 报告对话框
const reportDialogVisible = ref(false);
const reportForm = reactive({
    passed: true,
    reason: ''
});
// 面谈对话框
const interviewDialogVisible = ref(false);
const interviewForm = reactive({
    approved: true,
    interviewTime: null,
    interviewLocation: '',
    reason: ''
});
const submitting = ref(false);
const getStatusType = (status) => {
    switch (status) {
        case 'FILLING': return 'info';
        case 'REVIEWING': return 'warning';
        case 'PAPER': return 'warning';
        case 'REPORT': return 'warning';
        case 'INTERVIEW': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'danger';
        default: return 'info';
    }
};
const fetchApplyList = async () => {
    loading.value = true;
    try {
        const res = await getAdminApplyList(statusFilter.value || undefined);
        if (res.code === 200) {
            applyList.value = res.data || [];
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
const fetchPsychologistList = async () => {
    loading.value = true;
    try {
        const res = await getApprovedPsychologists();
        if (res.code === 200) {
            psychologistList.value = res.data || [];
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
const handleTabChange = () => {
    if (activeTab.value === 'apply-list') {
        fetchApplyList();
    }
    else {
        fetchPsychologistList();
    }
};
const viewDetail = (row) => {
    currentApply.value = row;
    detailDialogVisible.value = true;
};
// 审核
const showReviewDialog = (row) => {
    currentApply.value = row;
    reviewForm.approved = true;
    reviewForm.reason = '';
    reviewDialogVisible.value = true;
};
const submitReview = async () => {
    if (!currentApply.value)
        return;
    submitting.value = true;
    try {
        const res = await reviewApply(currentApply.value.id, reviewForm.approved, reviewForm.reason);
        if (res.code === 200) {
            ElMessage.success(res.data || '操作成功');
            reviewDialogVisible.value = false;
            fetchApplyList();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error('操作失败');
    }
    finally {
        submitting.value = false;
    }
};
// 笔试结果
const showPaperDialog = (row) => {
    currentApply.value = row;
    paperForm.passed = true;
    paperForm.reason = '';
    paperDialogVisible.value = true;
};
const submitPaperResult = async () => {
    if (!currentApply.value)
        return;
    submitting.value = true;
    try {
        const res = await markPaperResult(currentApply.value.id, paperForm.passed, paperForm.reason);
        if (res.code === 200) {
            ElMessage.success(res.data || '操作成功');
            paperDialogVisible.value = false;
            fetchApplyList();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error('操作失败');
    }
    finally {
        submitting.value = false;
    }
};
// 案例报告结果
const showReportDialog = (row) => {
    currentApply.value = row;
    reportForm.passed = true;
    reportForm.reason = '';
    reportDialogVisible.value = true;
};
const submitReportResult = async () => {
    if (!currentApply.value)
        return;
    submitting.value = true;
    try {
        const res = await markReportResult(currentApply.value.id, reportForm.passed, reportForm.reason);
        if (res.code === 200) {
            ElMessage.success(res.data || '操作成功');
            reportDialogVisible.value = false;
            fetchApplyList();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error('操作失败');
    }
    finally {
        submitting.value = false;
    }
};
// 面谈结果
const showInterviewDialog = (row) => {
    currentApply.value = row;
    interviewForm.approved = true;
    interviewForm.interviewTime = null;
    interviewForm.interviewLocation = '';
    interviewForm.reason = '';
    interviewDialogVisible.value = true;
};
const submitInterviewResult = async () => {
    if (!currentApply.value)
        return;
    submitting.value = true;
    try {
        const res = await markInterviewResult(currentApply.value.id, interviewForm.approved, interviewForm.interviewTime ? interviewForm.interviewTime.toISOString() : undefined, interviewForm.interviewLocation || undefined, interviewForm.reason || undefined);
        if (res.code === 200) {
            ElMessage.success(res.data || '操作成功');
            interviewDialogVisible.value = false;
            fetchApplyList();
        }
        else {
            ElMessage.error(res.message || '操作失败');
        }
    }
    catch (error) {
        ElMessage.error('操作失败');
    }
    finally {
        submitting.value = false;
    }
};
onMounted(() => {
    fetchApplyList();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-detail']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-manager" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-manager']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ tabChange: {} },
    { onTabChange: (__VLS_ctx.handleTabChange) });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    label: "入驻申请列表",
    name: "apply-list",
}));
const __VLS_10 = __VLS_9({
    label: "入驻申请列表",
    name: "apply-list",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-bar" },
});
/** @type {__VLS_StyleScopedClasses['filter-bar']} */ ;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "筛选状态",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_16 = __VLS_15({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "筛选状态",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
let __VLS_19;
const __VLS_20 = ({ change: {} },
    { onChange: (__VLS_ctx.fetchApplyList) });
const { default: __VLS_21 } = __VLS_17.slots;
let __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
    label: "全部",
    value: "",
}));
const __VLS_24 = __VLS_23({
    label: "全部",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
let __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    label: "填写资料中",
    value: "FILLING",
}));
const __VLS_29 = __VLS_28({
    label: "填写资料中",
    value: "FILLING",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    label: "管理员审核中",
    value: "REVIEWING",
}));
const __VLS_34 = __VLS_33({
    label: "管理员审核中",
    value: "REVIEWING",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_37;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    label: "笔试考核阶段",
    value: "PAPER",
}));
const __VLS_39 = __VLS_38({
    label: "笔试考核阶段",
    value: "PAPER",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    label: "案例报告阶段",
    value: "REPORT",
}));
const __VLS_44 = __VLS_43({
    label: "案例报告阶段",
    value: "REPORT",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    label: "线下面谈阶段",
    value: "INTERVIEW",
}));
const __VLS_49 = __VLS_48({
    label: "线下面谈阶段",
    value: "INTERVIEW",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
let __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    label: "入驻成功",
    value: "APPROVED",
}));
const __VLS_54 = __VLS_53({
    label: "入驻成功",
    value: "APPROVED",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    label: "入驻失败",
    value: "REJECTED",
}));
const __VLS_59 = __VLS_58({
    label: "入驻失败",
    value: "REJECTED",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
// @ts-ignore
[activeTab, handleTabChange, statusFilter, fetchApplyList,];
var __VLS_17;
var __VLS_18;
let __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    data: (__VLS_ctx.applyList),
    ...{ style: {} },
}));
const __VLS_64 = __VLS_63({
    data: (__VLS_ctx.applyList),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_67 } = __VLS_65.slots;
let __VLS_68;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_70 = __VLS_69({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    prop: "userNickname",
    label: "申请人",
    width: "120",
}));
const __VLS_75 = __VLS_74({
    prop: "userNickname",
    label: "申请人",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
const { default: __VLS_78 } = __VLS_76.slots;
{
    const { default: __VLS_79 } = __VLS_76.slots;
    const [scope] = __VLS_vSlot(__VLS_79);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    if (scope.row.userAvatar) {
        let __VLS_80;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            src: (scope.row.userAvatar),
            size: "small",
        }));
        const __VLS_82 = __VLS_81({
            src: (scope.row.userAvatar),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (scope.row.userNickname || '用户' + scope.row.userId);
    // @ts-ignore
    [applyList, vLoading, loading,];
}
// @ts-ignore
[];
var __VLS_76;
let __VLS_85;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    prop: "realName",
    label: "姓名",
    width: "100",
}));
const __VLS_87 = __VLS_86({
    prop: "realName",
    label: "姓名",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
let __VLS_90;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    prop: "phone",
    label: "手机号",
    width: "120",
}));
const __VLS_92 = __VLS_91({
    prop: "phone",
    label: "手机号",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
let __VLS_95;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
    prop: "education",
    label: "学历专业",
    width: "150",
}));
const __VLS_97 = __VLS_96({
    prop: "education",
    label: "学历专业",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
let __VLS_100;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
    prop: "statusName",
    label: "状态",
    width: "120",
}));
const __VLS_102 = __VLS_101({
    prop: "statusName",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
const { default: __VLS_105 } = __VLS_103.slots;
{
    const { default: __VLS_106 } = __VLS_103.slots;
    const [scope] = __VLS_vSlot(__VLS_106);
    let __VLS_107;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
        type: (__VLS_ctx.getStatusType(scope.row.status)),
    }));
    const __VLS_109 = __VLS_108({
        type: (__VLS_ctx.getStatusType(scope.row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    const { default: __VLS_112 } = __VLS_110.slots;
    (scope.row.statusName);
    // @ts-ignore
    [getStatusType,];
    var __VLS_110;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_103;
let __VLS_113;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    prop: "paperResultName",
    label: "笔试结果",
    width: "100",
}));
const __VLS_115 = __VLS_114({
    prop: "paperResultName",
    label: "笔试结果",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
const { default: __VLS_118 } = __VLS_116.slots;
{
    const { default: __VLS_119 } = __VLS_116.slots;
    const [scope] = __VLS_vSlot(__VLS_119);
    if (scope.row.paperResult !== null && scope.row.paperResult !== undefined) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (scope.row.paperResultName);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_116;
let __VLS_120;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
    prop: "reportResultName",
    label: "报告结果",
    width: "100",
}));
const __VLS_122 = __VLS_121({
    prop: "reportResultName",
    label: "报告结果",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
const { default: __VLS_125 } = __VLS_123.slots;
{
    const { default: __VLS_126 } = __VLS_123.slots;
    const [scope] = __VLS_vSlot(__VLS_126);
    if (scope.row.reportResult !== null && scope.row.reportResult !== undefined) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (scope.row.reportResultName);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_123;
let __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
    prop: "createTime",
    label: "申请时间",
    width: "160",
}));
const __VLS_129 = __VLS_128({
    prop: "createTime",
    label: "申请时间",
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
let __VLS_132;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
    label: "操作",
    width: "200",
    fixed: "right",
}));
const __VLS_134 = __VLS_133({
    label: "操作",
    width: "200",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
const { default: __VLS_137 } = __VLS_135.slots;
{
    const { default: __VLS_138 } = __VLS_135.slots;
    const [scope] = __VLS_vSlot(__VLS_138);
    let __VLS_139;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_141 = __VLS_140({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    let __VLS_144;
    const __VLS_145 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewDetail(scope.row);
                // @ts-ignore
                [viewDetail,];
            } });
    const { default: __VLS_146 } = __VLS_142.slots;
    // @ts-ignore
    [];
    var __VLS_142;
    var __VLS_143;
    if (scope.row.status === 'REVIEWING') {
        let __VLS_147;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_149 = __VLS_148({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_148));
        let __VLS_152;
        const __VLS_153 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 'REVIEWING'))
                        return;
                    __VLS_ctx.showReviewDialog(scope.row);
                    // @ts-ignore
                    [showReviewDialog,];
                } });
        const { default: __VLS_154 } = __VLS_150.slots;
        // @ts-ignore
        [];
        var __VLS_150;
        var __VLS_151;
    }
    if (scope.row.status === 'PAPER') {
        let __VLS_155;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }));
        const __VLS_157 = __VLS_156({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_156));
        let __VLS_160;
        const __VLS_161 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 'PAPER'))
                        return;
                    __VLS_ctx.showPaperDialog(scope.row);
                    // @ts-ignore
                    [showPaperDialog,];
                } });
        const { default: __VLS_162 } = __VLS_158.slots;
        // @ts-ignore
        [];
        var __VLS_158;
        var __VLS_159;
    }
    if (scope.row.status === 'REPORT') {
        let __VLS_163;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }));
        const __VLS_165 = __VLS_164({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_164));
        let __VLS_168;
        const __VLS_169 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 'REPORT'))
                        return;
                    __VLS_ctx.showReportDialog(scope.row);
                    // @ts-ignore
                    [showReportDialog,];
                } });
        const { default: __VLS_170 } = __VLS_166.slots;
        // @ts-ignore
        [];
        var __VLS_166;
        var __VLS_167;
    }
    if (scope.row.status === 'INTERVIEW') {
        let __VLS_171;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }));
        const __VLS_173 = __VLS_172({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_172));
        let __VLS_176;
        const __VLS_177 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 'INTERVIEW'))
                        return;
                    __VLS_ctx.showInterviewDialog(scope.row);
                    // @ts-ignore
                    [showInterviewDialog,];
                } });
        const { default: __VLS_178 } = __VLS_174.slots;
        // @ts-ignore
        [];
        var __VLS_174;
        var __VLS_175;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_135;
// @ts-ignore
[];
var __VLS_65;
// @ts-ignore
[];
var __VLS_11;
let __VLS_179;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_180 = __VLS_asFunctionalComponent1(__VLS_179, new __VLS_179({
    label: "已入驻咨询师",
    name: "psychologist-list",
}));
const __VLS_181 = __VLS_180({
    label: "已入驻咨询师",
    name: "psychologist-list",
}, ...__VLS_functionalComponentArgsRest(__VLS_180));
const { default: __VLS_184 } = __VLS_182.slots;
let __VLS_185;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
    data: (__VLS_ctx.psychologistList),
    ...{ style: {} },
}));
const __VLS_187 = __VLS_186({
    data: (__VLS_ctx.psychologistList),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_190 } = __VLS_188.slots;
let __VLS_191;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_193 = __VLS_192({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_192));
let __VLS_196;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
    prop: "userNickname",
    label: "咨询师",
    width: "150",
}));
const __VLS_198 = __VLS_197({
    prop: "userNickname",
    label: "咨询师",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
const { default: __VLS_201 } = __VLS_199.slots;
{
    const { default: __VLS_202 } = __VLS_199.slots;
    const [scope] = __VLS_vSlot(__VLS_202);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    if (scope.row.userAvatar) {
        let __VLS_203;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({
            src: (scope.row.userAvatar),
            size: "small",
        }));
        const __VLS_205 = __VLS_204({
            src: (scope.row.userAvatar),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (scope.row.userNickname || '咨询师' + scope.row.userId);
    // @ts-ignore
    [vLoading, loading, psychologistList,];
}
// @ts-ignore
[];
var __VLS_199;
let __VLS_208;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent1(__VLS_208, new __VLS_208({
    prop: "realName",
    label: "真实姓名",
    width: "100",
}));
const __VLS_210 = __VLS_209({
    prop: "realName",
    label: "真实姓名",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
let __VLS_213;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent1(__VLS_213, new __VLS_213({
    prop: "phone",
    label: "手机号",
    width: "120",
}));
const __VLS_215 = __VLS_214({
    prop: "phone",
    label: "手机号",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
let __VLS_218;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218({
    prop: "consultationPrice",
    label: "咨询定价",
    width: "100",
}));
const __VLS_220 = __VLS_219({
    prop: "consultationPrice",
    label: "咨询定价",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_219));
const { default: __VLS_223 } = __VLS_221.slots;
{
    const { default: __VLS_224 } = __VLS_221.slots;
    const [scope] = __VLS_vSlot(__VLS_224);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (scope.row.consultationPrice);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_221;
let __VLS_225;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent1(__VLS_225, new __VLS_225({
    prop: "updateTime",
    label: "入驻时间",
    width: "160",
}));
const __VLS_227 = __VLS_226({
    prop: "updateTime",
    label: "入驻时间",
    width: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_226));
let __VLS_230;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_231 = __VLS_asFunctionalComponent1(__VLS_230, new __VLS_230({
    label: "操作",
    width: "120",
}));
const __VLS_232 = __VLS_231({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_231));
const { default: __VLS_235 } = __VLS_233.slots;
{
    const { default: __VLS_236 } = __VLS_233.slots;
    const [scope] = __VLS_vSlot(__VLS_236);
    let __VLS_237;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_238 = __VLS_asFunctionalComponent1(__VLS_237, new __VLS_237({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_239 = __VLS_238({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_238));
    let __VLS_242;
    const __VLS_243 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewDetail(scope.row);
                // @ts-ignore
                [viewDetail,];
            } });
    const { default: __VLS_244 } = __VLS_240.slots;
    // @ts-ignore
    [];
    var __VLS_240;
    var __VLS_241;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_233;
// @ts-ignore
[];
var __VLS_188;
// @ts-ignore
[];
var __VLS_182;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_245;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent1(__VLS_245, new __VLS_245({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "申请详情",
    width: "700px",
}));
const __VLS_247 = __VLS_246({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "申请详情",
    width: "700px",
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
const { default: __VLS_250 } = __VLS_248.slots;
if (__VLS_ctx.currentApply) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "apply-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['apply-detail']} */ ;
    let __VLS_251;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_252 = __VLS_asFunctionalComponent1(__VLS_251, new __VLS_251({
        column: (2),
        border: true,
    }));
    const __VLS_253 = __VLS_252({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_252));
    const { default: __VLS_256 } = __VLS_254.slots;
    let __VLS_257;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_258 = __VLS_asFunctionalComponent1(__VLS_257, new __VLS_257({
        label: "申请人",
    }));
    const __VLS_259 = __VLS_258({
        label: "申请人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_258));
    const { default: __VLS_262 } = __VLS_260.slots;
    (__VLS_ctx.currentApply.userNickname || '用户' + __VLS_ctx.currentApply.userId);
    // @ts-ignore
    [detailDialogVisible, currentApply, currentApply, currentApply,];
    var __VLS_260;
    let __VLS_263;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_264 = __VLS_asFunctionalComponent1(__VLS_263, new __VLS_263({
        label: "申请状态",
    }));
    const __VLS_265 = __VLS_264({
        label: "申请状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_264));
    const { default: __VLS_268 } = __VLS_266.slots;
    let __VLS_269;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_270 = __VLS_asFunctionalComponent1(__VLS_269, new __VLS_269({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.currentApply.status)),
    }));
    const __VLS_271 = __VLS_270({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.currentApply.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_270));
    const { default: __VLS_274 } = __VLS_272.slots;
    (__VLS_ctx.currentApply.statusName);
    // @ts-ignore
    [getStatusType, currentApply, currentApply,];
    var __VLS_272;
    // @ts-ignore
    [];
    var __VLS_266;
    let __VLS_275;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_276 = __VLS_asFunctionalComponent1(__VLS_275, new __VLS_275({
        label: "真实姓名",
    }));
    const __VLS_277 = __VLS_276({
        label: "真实姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_276));
    const { default: __VLS_280 } = __VLS_278.slots;
    (__VLS_ctx.currentApply.realName || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_278;
    let __VLS_281;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_282 = __VLS_asFunctionalComponent1(__VLS_281, new __VLS_281({
        label: "手机号",
    }));
    const __VLS_283 = __VLS_282({
        label: "手机号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_282));
    const { default: __VLS_286 } = __VLS_284.slots;
    (__VLS_ctx.currentApply.phone || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_284;
    let __VLS_287;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_288 = __VLS_asFunctionalComponent1(__VLS_287, new __VLS_287({
        label: "国家/地区",
    }));
    const __VLS_289 = __VLS_288({
        label: "国家/地区",
    }, ...__VLS_functionalComponentArgsRest(__VLS_288));
    const { default: __VLS_292 } = __VLS_290.slots;
    (__VLS_ctx.currentApply.country || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_290;
    let __VLS_293;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_294 = __VLS_asFunctionalComponent1(__VLS_293, new __VLS_293({
        label: "联系方式",
    }));
    const __VLS_295 = __VLS_294({
        label: "联系方式",
    }, ...__VLS_functionalComponentArgsRest(__VLS_294));
    const { default: __VLS_298 } = __VLS_296.slots;
    (__VLS_ctx.currentApply.contactWechat || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_296;
    let __VLS_299;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent1(__VLS_299, new __VLS_299({
        label: "咨询个案时长",
    }));
    const __VLS_301 = __VLS_300({
        label: "咨询个案时长",
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    const { default: __VLS_304 } = __VLS_302.slots;
    (__VLS_ctx.currentApply.caseHoursName || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_302;
    let __VLS_305;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_306 = __VLS_asFunctionalComponent1(__VLS_305, new __VLS_305({
        label: "个体督导时长",
    }));
    const __VLS_307 = __VLS_306({
        label: "个体督导时长",
    }, ...__VLS_functionalComponentArgsRest(__VLS_306));
    const { default: __VLS_310 } = __VLS_308.slots;
    (__VLS_ctx.currentApply.supervisionHoursName || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_308;
    let __VLS_311;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_312 = __VLS_asFunctionalComponent1(__VLS_311, new __VLS_311({
        label: "咨询定价",
    }));
    const __VLS_313 = __VLS_312({
        label: "咨询定价",
    }, ...__VLS_functionalComponentArgsRest(__VLS_312));
    const { default: __VLS_316 } = __VLS_314.slots;
    (__VLS_ctx.currentApply.consultationPrice || 0);
    // @ts-ignore
    [currentApply,];
    var __VLS_314;
    let __VLS_317;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_318 = __VLS_asFunctionalComponent1(__VLS_317, new __VLS_317({
        label: "学历及相关专业",
    }));
    const __VLS_319 = __VLS_318({
        label: "学历及相关专业",
    }, ...__VLS_functionalComponentArgsRest(__VLS_318));
    const { default: __VLS_322 } = __VLS_320.slots;
    (__VLS_ctx.currentApply.education || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_320;
    let __VLS_323;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_324 = __VLS_asFunctionalComponent1(__VLS_323, new __VLS_323({
        label: "个人简历",
        span: (2),
    }));
    const __VLS_325 = __VLS_324({
        label: "个人简历",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_324));
    const { default: __VLS_328 } = __VLS_326.slots;
    if (__VLS_ctx.currentApply.resumeUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (__VLS_ctx.currentApply.resumeUrl),
            target: "_blank",
        });
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [currentApply, currentApply,];
    var __VLS_326;
    // @ts-ignore
    [];
    var __VLS_254;
    let __VLS_329;
    /** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
    elDivider;
    // @ts-ignore
    const __VLS_330 = __VLS_asFunctionalComponent1(__VLS_329, new __VLS_329({}));
    const __VLS_331 = __VLS_330({}, ...__VLS_functionalComponentArgsRest(__VLS_330));
    const { default: __VLS_334 } = __VLS_332.slots;
    // @ts-ignore
    [];
    var __VLS_332;
    let __VLS_335;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_336 = __VLS_asFunctionalComponent1(__VLS_335, new __VLS_335({
        column: (2),
        border: true,
    }));
    const __VLS_337 = __VLS_336({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_336));
    const { default: __VLS_340 } = __VLS_338.slots;
    let __VLS_341;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_342 = __VLS_asFunctionalComponent1(__VLS_341, new __VLS_341({
        label: "笔试结果",
    }));
    const __VLS_343 = __VLS_342({
        label: "笔试结果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_342));
    const { default: __VLS_346 } = __VLS_344.slots;
    (__VLS_ctx.currentApply.paperResultName || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_344;
    let __VLS_347;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_348 = __VLS_asFunctionalComponent1(__VLS_347, new __VLS_347({
        label: "笔试截止时间",
    }));
    const __VLS_349 = __VLS_348({
        label: "笔试截止时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_348));
    const { default: __VLS_352 } = __VLS_350.slots;
    (__VLS_ctx.currentApply.examDeadline || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_350;
    let __VLS_353;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_354 = __VLS_asFunctionalComponent1(__VLS_353, new __VLS_353({
        label: "案例报告结果",
    }));
    const __VLS_355 = __VLS_354({
        label: "案例报告结果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_354));
    const { default: __VLS_358 } = __VLS_356.slots;
    (__VLS_ctx.currentApply.reportResultName || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_356;
    let __VLS_359;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_360 = __VLS_asFunctionalComponent1(__VLS_359, new __VLS_359({
        label: "面谈时间",
    }));
    const __VLS_361 = __VLS_360({
        label: "面谈时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_360));
    const { default: __VLS_364 } = __VLS_362.slots;
    (__VLS_ctx.currentApply.interviewTime || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_362;
    let __VLS_365;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_366 = __VLS_asFunctionalComponent1(__VLS_365, new __VLS_365({
        label: "面谈地点",
        span: (2),
    }));
    const __VLS_367 = __VLS_366({
        label: "面谈地点",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_366));
    const { default: __VLS_370 } = __VLS_368.slots;
    (__VLS_ctx.currentApply.interviewLocation || '-');
    // @ts-ignore
    [currentApply,];
    var __VLS_368;
    // @ts-ignore
    [];
    var __VLS_338;
    if (__VLS_ctx.currentApply.selfNarration) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ style: {} },
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (__VLS_ctx.currentApply.selfNarration);
    }
    if (__VLS_ctx.currentApply.rejectReason) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ style: {} },
        });
        let __VLS_371;
        /** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert | typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
        elAlert;
        // @ts-ignore
        const __VLS_372 = __VLS_asFunctionalComponent1(__VLS_371, new __VLS_371({
            type: "warning",
            closable: (false),
        }));
        const __VLS_373 = __VLS_372({
            type: "warning",
            closable: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_372));
        const { default: __VLS_376 } = __VLS_374.slots;
        (__VLS_ctx.currentApply.rejectReason);
        // @ts-ignore
        [currentApply, currentApply, currentApply, currentApply,];
        var __VLS_374;
    }
}
{
    const { footer: __VLS_377 } = __VLS_248.slots;
    let __VLS_378;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_379 = __VLS_asFunctionalComponent1(__VLS_378, new __VLS_378({
        ...{ 'onClick': {} },
    }));
    const __VLS_380 = __VLS_379({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_379));
    let __VLS_383;
    const __VLS_384 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailDialogVisible = false;
                // @ts-ignore
                [detailDialogVisible,];
            } });
    const { default: __VLS_385 } = __VLS_381.slots;
    // @ts-ignore
    [];
    var __VLS_381;
    var __VLS_382;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_248;
let __VLS_386;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_387 = __VLS_asFunctionalComponent1(__VLS_386, new __VLS_386({
    modelValue: (__VLS_ctx.reviewDialogVisible),
    title: "审核基本资料",
    width: "500px",
}));
const __VLS_388 = __VLS_387({
    modelValue: (__VLS_ctx.reviewDialogVisible),
    title: "审核基本资料",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_387));
const { default: __VLS_391 } = __VLS_389.slots;
let __VLS_392;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_393 = __VLS_asFunctionalComponent1(__VLS_392, new __VLS_392({
    model: (__VLS_ctx.reviewForm),
    labelWidth: "100px",
}));
const __VLS_394 = __VLS_393({
    model: (__VLS_ctx.reviewForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_393));
const { default: __VLS_397 } = __VLS_395.slots;
let __VLS_398;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_399 = __VLS_asFunctionalComponent1(__VLS_398, new __VLS_398({
    label: "审核结果",
}));
const __VLS_400 = __VLS_399({
    label: "审核结果",
}, ...__VLS_functionalComponentArgsRest(__VLS_399));
const { default: __VLS_403 } = __VLS_401.slots;
let __VLS_404;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_405 = __VLS_asFunctionalComponent1(__VLS_404, new __VLS_404({
    modelValue: (__VLS_ctx.reviewForm.approved),
}));
const __VLS_406 = __VLS_405({
    modelValue: (__VLS_ctx.reviewForm.approved),
}, ...__VLS_functionalComponentArgsRest(__VLS_405));
const { default: __VLS_409 } = __VLS_407.slots;
let __VLS_410;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_411 = __VLS_asFunctionalComponent1(__VLS_410, new __VLS_410({
    label: (true),
}));
const __VLS_412 = __VLS_411({
    label: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_411));
const { default: __VLS_415 } = __VLS_413.slots;
// @ts-ignore
[reviewDialogVisible, reviewForm, reviewForm,];
var __VLS_413;
let __VLS_416;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_417 = __VLS_asFunctionalComponent1(__VLS_416, new __VLS_416({
    label: (false),
}));
const __VLS_418 = __VLS_417({
    label: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_417));
const { default: __VLS_421 } = __VLS_419.slots;
// @ts-ignore
[];
var __VLS_419;
// @ts-ignore
[];
var __VLS_407;
// @ts-ignore
[];
var __VLS_401;
if (!__VLS_ctx.reviewForm.approved) {
    let __VLS_422;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_423 = __VLS_asFunctionalComponent1(__VLS_422, new __VLS_422({
        label: "拒绝原因",
    }));
    const __VLS_424 = __VLS_423({
        label: "拒绝原因",
    }, ...__VLS_functionalComponentArgsRest(__VLS_423));
    const { default: __VLS_427 } = __VLS_425.slots;
    let __VLS_428;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_429 = __VLS_asFunctionalComponent1(__VLS_428, new __VLS_428({
        modelValue: (__VLS_ctx.reviewForm.reason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入拒绝原因",
    }));
    const __VLS_430 = __VLS_429({
        modelValue: (__VLS_ctx.reviewForm.reason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入拒绝原因",
    }, ...__VLS_functionalComponentArgsRest(__VLS_429));
    // @ts-ignore
    [reviewForm, reviewForm,];
    var __VLS_425;
}
// @ts-ignore
[];
var __VLS_395;
{
    const { footer: __VLS_433 } = __VLS_389.slots;
    let __VLS_434;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_435 = __VLS_asFunctionalComponent1(__VLS_434, new __VLS_434({
        ...{ 'onClick': {} },
    }));
    const __VLS_436 = __VLS_435({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_435));
    let __VLS_439;
    const __VLS_440 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.reviewDialogVisible = false;
                // @ts-ignore
                [reviewDialogVisible,];
            } });
    const { default: __VLS_441 } = __VLS_437.slots;
    // @ts-ignore
    [];
    var __VLS_437;
    var __VLS_438;
    let __VLS_442;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_443 = __VLS_asFunctionalComponent1(__VLS_442, new __VLS_442({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_444 = __VLS_443({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_443));
    let __VLS_447;
    const __VLS_448 = ({ click: {} },
        { onClick: (__VLS_ctx.submitReview) });
    const { default: __VLS_449 } = __VLS_445.slots;
    // @ts-ignore
    [submitting, submitReview,];
    var __VLS_445;
    var __VLS_446;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_389;
let __VLS_450;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_451 = __VLS_asFunctionalComponent1(__VLS_450, new __VLS_450({
    modelValue: (__VLS_ctx.paperDialogVisible),
    title: "标记笔试结果",
    width: "500px",
}));
const __VLS_452 = __VLS_451({
    modelValue: (__VLS_ctx.paperDialogVisible),
    title: "标记笔试结果",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_451));
const { default: __VLS_455 } = __VLS_453.slots;
let __VLS_456;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_457 = __VLS_asFunctionalComponent1(__VLS_456, new __VLS_456({
    model: (__VLS_ctx.paperForm),
    labelWidth: "100px",
}));
const __VLS_458 = __VLS_457({
    model: (__VLS_ctx.paperForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_457));
const { default: __VLS_461 } = __VLS_459.slots;
let __VLS_462;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_463 = __VLS_asFunctionalComponent1(__VLS_462, new __VLS_462({
    label: "笔试结果",
}));
const __VLS_464 = __VLS_463({
    label: "笔试结果",
}, ...__VLS_functionalComponentArgsRest(__VLS_463));
const { default: __VLS_467 } = __VLS_465.slots;
let __VLS_468;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_469 = __VLS_asFunctionalComponent1(__VLS_468, new __VLS_468({
    modelValue: (__VLS_ctx.paperForm.passed),
}));
const __VLS_470 = __VLS_469({
    modelValue: (__VLS_ctx.paperForm.passed),
}, ...__VLS_functionalComponentArgsRest(__VLS_469));
const { default: __VLS_473 } = __VLS_471.slots;
let __VLS_474;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_475 = __VLS_asFunctionalComponent1(__VLS_474, new __VLS_474({
    label: (true),
}));
const __VLS_476 = __VLS_475({
    label: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_475));
const { default: __VLS_479 } = __VLS_477.slots;
// @ts-ignore
[paperDialogVisible, paperForm, paperForm,];
var __VLS_477;
let __VLS_480;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_481 = __VLS_asFunctionalComponent1(__VLS_480, new __VLS_480({
    label: (false),
}));
const __VLS_482 = __VLS_481({
    label: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_481));
const { default: __VLS_485 } = __VLS_483.slots;
// @ts-ignore
[];
var __VLS_483;
// @ts-ignore
[];
var __VLS_471;
// @ts-ignore
[];
var __VLS_465;
if (!__VLS_ctx.paperForm.passed) {
    let __VLS_486;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_487 = __VLS_asFunctionalComponent1(__VLS_486, new __VLS_486({
        label: "失败原因",
    }));
    const __VLS_488 = __VLS_487({
        label: "失败原因",
    }, ...__VLS_functionalComponentArgsRest(__VLS_487));
    const { default: __VLS_491 } = __VLS_489.slots;
    let __VLS_492;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_493 = __VLS_asFunctionalComponent1(__VLS_492, new __VLS_492({
        modelValue: (__VLS_ctx.paperForm.reason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入失败原因",
    }));
    const __VLS_494 = __VLS_493({
        modelValue: (__VLS_ctx.paperForm.reason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入失败原因",
    }, ...__VLS_functionalComponentArgsRest(__VLS_493));
    // @ts-ignore
    [paperForm, paperForm,];
    var __VLS_489;
}
// @ts-ignore
[];
var __VLS_459;
{
    const { footer: __VLS_497 } = __VLS_453.slots;
    let __VLS_498;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_499 = __VLS_asFunctionalComponent1(__VLS_498, new __VLS_498({
        ...{ 'onClick': {} },
    }));
    const __VLS_500 = __VLS_499({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_499));
    let __VLS_503;
    const __VLS_504 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.paperDialogVisible = false;
                // @ts-ignore
                [paperDialogVisible,];
            } });
    const { default: __VLS_505 } = __VLS_501.slots;
    // @ts-ignore
    [];
    var __VLS_501;
    var __VLS_502;
    let __VLS_506;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_507 = __VLS_asFunctionalComponent1(__VLS_506, new __VLS_506({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_508 = __VLS_507({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_507));
    let __VLS_511;
    const __VLS_512 = ({ click: {} },
        { onClick: (__VLS_ctx.submitPaperResult) });
    const { default: __VLS_513 } = __VLS_509.slots;
    // @ts-ignore
    [submitting, submitPaperResult,];
    var __VLS_509;
    var __VLS_510;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_453;
let __VLS_514;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_515 = __VLS_asFunctionalComponent1(__VLS_514, new __VLS_514({
    modelValue: (__VLS_ctx.reportDialogVisible),
    title: "标记案例报告结果",
    width: "500px",
}));
const __VLS_516 = __VLS_515({
    modelValue: (__VLS_ctx.reportDialogVisible),
    title: "标记案例报告结果",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_515));
const { default: __VLS_519 } = __VLS_517.slots;
let __VLS_520;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_521 = __VLS_asFunctionalComponent1(__VLS_520, new __VLS_520({
    model: (__VLS_ctx.reportForm),
    labelWidth: "100px",
}));
const __VLS_522 = __VLS_521({
    model: (__VLS_ctx.reportForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_521));
const { default: __VLS_525 } = __VLS_523.slots;
let __VLS_526;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_527 = __VLS_asFunctionalComponent1(__VLS_526, new __VLS_526({
    label: "报告结果",
}));
const __VLS_528 = __VLS_527({
    label: "报告结果",
}, ...__VLS_functionalComponentArgsRest(__VLS_527));
const { default: __VLS_531 } = __VLS_529.slots;
let __VLS_532;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_533 = __VLS_asFunctionalComponent1(__VLS_532, new __VLS_532({
    modelValue: (__VLS_ctx.reportForm.passed),
}));
const __VLS_534 = __VLS_533({
    modelValue: (__VLS_ctx.reportForm.passed),
}, ...__VLS_functionalComponentArgsRest(__VLS_533));
const { default: __VLS_537 } = __VLS_535.slots;
let __VLS_538;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_539 = __VLS_asFunctionalComponent1(__VLS_538, new __VLS_538({
    label: (true),
}));
const __VLS_540 = __VLS_539({
    label: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_539));
const { default: __VLS_543 } = __VLS_541.slots;
// @ts-ignore
[reportDialogVisible, reportForm, reportForm,];
var __VLS_541;
let __VLS_544;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_545 = __VLS_asFunctionalComponent1(__VLS_544, new __VLS_544({
    label: (false),
}));
const __VLS_546 = __VLS_545({
    label: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_545));
const { default: __VLS_549 } = __VLS_547.slots;
// @ts-ignore
[];
var __VLS_547;
// @ts-ignore
[];
var __VLS_535;
// @ts-ignore
[];
var __VLS_529;
if (!__VLS_ctx.reportForm.passed) {
    let __VLS_550;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_551 = __VLS_asFunctionalComponent1(__VLS_550, new __VLS_550({
        label: "失败原因",
    }));
    const __VLS_552 = __VLS_551({
        label: "失败原因",
    }, ...__VLS_functionalComponentArgsRest(__VLS_551));
    const { default: __VLS_555 } = __VLS_553.slots;
    let __VLS_556;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_557 = __VLS_asFunctionalComponent1(__VLS_556, new __VLS_556({
        modelValue: (__VLS_ctx.reportForm.reason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入失败原因",
    }));
    const __VLS_558 = __VLS_557({
        modelValue: (__VLS_ctx.reportForm.reason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入失败原因",
    }, ...__VLS_functionalComponentArgsRest(__VLS_557));
    // @ts-ignore
    [reportForm, reportForm,];
    var __VLS_553;
}
// @ts-ignore
[];
var __VLS_523;
{
    const { footer: __VLS_561 } = __VLS_517.slots;
    let __VLS_562;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_563 = __VLS_asFunctionalComponent1(__VLS_562, new __VLS_562({
        ...{ 'onClick': {} },
    }));
    const __VLS_564 = __VLS_563({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_563));
    let __VLS_567;
    const __VLS_568 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.reportDialogVisible = false;
                // @ts-ignore
                [reportDialogVisible,];
            } });
    const { default: __VLS_569 } = __VLS_565.slots;
    // @ts-ignore
    [];
    var __VLS_565;
    var __VLS_566;
    let __VLS_570;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_571 = __VLS_asFunctionalComponent1(__VLS_570, new __VLS_570({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_572 = __VLS_571({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_571));
    let __VLS_575;
    const __VLS_576 = ({ click: {} },
        { onClick: (__VLS_ctx.submitReportResult) });
    const { default: __VLS_577 } = __VLS_573.slots;
    // @ts-ignore
    [submitting, submitReportResult,];
    var __VLS_573;
    var __VLS_574;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_517;
let __VLS_578;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_579 = __VLS_asFunctionalComponent1(__VLS_578, new __VLS_578({
    modelValue: (__VLS_ctx.interviewDialogVisible),
    title: "标记面谈结果",
    width: "500px",
}));
const __VLS_580 = __VLS_579({
    modelValue: (__VLS_ctx.interviewDialogVisible),
    title: "标记面谈结果",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_579));
const { default: __VLS_583 } = __VLS_581.slots;
let __VLS_584;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_585 = __VLS_asFunctionalComponent1(__VLS_584, new __VLS_584({
    model: (__VLS_ctx.interviewForm),
    labelWidth: "100px",
}));
const __VLS_586 = __VLS_585({
    model: (__VLS_ctx.interviewForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_585));
const { default: __VLS_589 } = __VLS_587.slots;
let __VLS_590;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_591 = __VLS_asFunctionalComponent1(__VLS_590, new __VLS_590({
    label: "面谈结果",
}));
const __VLS_592 = __VLS_591({
    label: "面谈结果",
}, ...__VLS_functionalComponentArgsRest(__VLS_591));
const { default: __VLS_595 } = __VLS_593.slots;
let __VLS_596;
/** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
elRadioGroup;
// @ts-ignore
const __VLS_597 = __VLS_asFunctionalComponent1(__VLS_596, new __VLS_596({
    modelValue: (__VLS_ctx.interviewForm.approved),
}));
const __VLS_598 = __VLS_597({
    modelValue: (__VLS_ctx.interviewForm.approved),
}, ...__VLS_functionalComponentArgsRest(__VLS_597));
const { default: __VLS_601 } = __VLS_599.slots;
let __VLS_602;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_603 = __VLS_asFunctionalComponent1(__VLS_602, new __VLS_602({
    label: (true),
}));
const __VLS_604 = __VLS_603({
    label: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_603));
const { default: __VLS_607 } = __VLS_605.slots;
// @ts-ignore
[interviewDialogVisible, interviewForm, interviewForm,];
var __VLS_605;
let __VLS_608;
/** @ts-ignore @type {typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio | typeof __VLS_components.elRadio | typeof __VLS_components.ElRadio} */
elRadio;
// @ts-ignore
const __VLS_609 = __VLS_asFunctionalComponent1(__VLS_608, new __VLS_608({
    label: (false),
}));
const __VLS_610 = __VLS_609({
    label: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_609));
const { default: __VLS_613 } = __VLS_611.slots;
// @ts-ignore
[];
var __VLS_611;
// @ts-ignore
[];
var __VLS_599;
// @ts-ignore
[];
var __VLS_593;
let __VLS_614;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_615 = __VLS_asFunctionalComponent1(__VLS_614, new __VLS_614({
    label: "面谈时间",
}));
const __VLS_616 = __VLS_615({
    label: "面谈时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_615));
const { default: __VLS_619 } = __VLS_617.slots;
let __VLS_620;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_621 = __VLS_asFunctionalComponent1(__VLS_620, new __VLS_620({
    modelValue: (__VLS_ctx.interviewForm.interviewTime),
    type: "datetime",
    placeholder: "选择面谈时间",
}));
const __VLS_622 = __VLS_621({
    modelValue: (__VLS_ctx.interviewForm.interviewTime),
    type: "datetime",
    placeholder: "选择面谈时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_621));
// @ts-ignore
[interviewForm,];
var __VLS_617;
let __VLS_625;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_626 = __VLS_asFunctionalComponent1(__VLS_625, new __VLS_625({
    label: "面谈地点",
}));
const __VLS_627 = __VLS_626({
    label: "面谈地点",
}, ...__VLS_functionalComponentArgsRest(__VLS_626));
const { default: __VLS_630 } = __VLS_628.slots;
let __VLS_631;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_632 = __VLS_asFunctionalComponent1(__VLS_631, new __VLS_631({
    modelValue: (__VLS_ctx.interviewForm.interviewLocation),
    placeholder: "请输入面谈地点",
}));
const __VLS_633 = __VLS_632({
    modelValue: (__VLS_ctx.interviewForm.interviewLocation),
    placeholder: "请输入面谈地点",
}, ...__VLS_functionalComponentArgsRest(__VLS_632));
// @ts-ignore
[interviewForm,];
var __VLS_628;
if (!__VLS_ctx.interviewForm.approved) {
    let __VLS_636;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_637 = __VLS_asFunctionalComponent1(__VLS_636, new __VLS_636({
        label: "失败原因",
    }));
    const __VLS_638 = __VLS_637({
        label: "失败原因",
    }, ...__VLS_functionalComponentArgsRest(__VLS_637));
    const { default: __VLS_641 } = __VLS_639.slots;
    let __VLS_642;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_643 = __VLS_asFunctionalComponent1(__VLS_642, new __VLS_642({
        modelValue: (__VLS_ctx.interviewForm.reason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入失败原因",
    }));
    const __VLS_644 = __VLS_643({
        modelValue: (__VLS_ctx.interviewForm.reason),
        type: "textarea",
        rows: (3),
        placeholder: "请输入失败原因",
    }, ...__VLS_functionalComponentArgsRest(__VLS_643));
    // @ts-ignore
    [interviewForm, interviewForm,];
    var __VLS_639;
}
// @ts-ignore
[];
var __VLS_587;
{
    const { footer: __VLS_647 } = __VLS_581.slots;
    let __VLS_648;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_649 = __VLS_asFunctionalComponent1(__VLS_648, new __VLS_648({
        ...{ 'onClick': {} },
    }));
    const __VLS_650 = __VLS_649({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_649));
    let __VLS_653;
    const __VLS_654 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.interviewDialogVisible = false;
                // @ts-ignore
                [interviewDialogVisible,];
            } });
    const { default: __VLS_655 } = __VLS_651.slots;
    // @ts-ignore
    [];
    var __VLS_651;
    var __VLS_652;
    let __VLS_656;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_657 = __VLS_asFunctionalComponent1(__VLS_656, new __VLS_656({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_658 = __VLS_657({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_657));
    let __VLS_661;
    const __VLS_662 = ({ click: {} },
        { onClick: (__VLS_ctx.submitInterviewResult) });
    const { default: __VLS_663 } = __VLS_659.slots;
    // @ts-ignore
    [submitting, submitInterviewResult,];
    var __VLS_659;
    var __VLS_660;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_581;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
