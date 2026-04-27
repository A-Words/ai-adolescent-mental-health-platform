/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { getConsultationFeedbacks, processConsultationFeedback } from '@/api/feedback';
import { ElMessage } from 'element-plus';
const feedbacks = ref([]);
const loading = ref(false);
const statusFilter = ref(undefined);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const processType = ref(1); // 1-Accept, 2-Reject
const processForm = reactive({ id: 0, content: '' });
const fetchFeedbacks = async () => {
    loading.value = true;
    try {
        const res = await getConsultationFeedbacks({
            page: currentPage.value,
            size: pageSize.value,
            status: statusFilter.value
        });
        if (res.code === 200) {
            feedbacks.value = res.data.records;
            total.value = res.data.total;
        }
    }
    finally {
        loading.value = false;
    }
};
const getStatusText = (status) => {
    const map = { 0: '已反馈', 1: '已接收', 2: '已拒收' };
    return map[status] || '未知';
};
const getStatusType = (status) => {
    const map = { 0: 'info', 1: 'success', 2: 'danger' };
    return map[status] || 'info';
};
const handleProcess = (row, type) => {
    processType.value = type;
    processForm.id = row.id;
    processForm.content = '';
    dialogVisible.value = true;
};
const submitProcess = async () => {
    if (!processForm.content) {
        ElMessage.warning(processType.value === 1 ? '请输入回复内容' : '请输入拒收理由');
        return;
    }
    const data = { status: processType.value };
    if (processType.value === 1)
        data.replyContent = processForm.content;
    else
        data.rejectReason = processForm.content;
    const res = await processConsultationFeedback(processForm.id, data);
    if (res.code === 200) {
        ElMessage.success('处理成功');
        dialogVisible.value = false;
        fetchFeedbacks();
    }
    else {
        ElMessage.error(res.message || '操作失败');
    }
};
onMounted(() => {
    fetchFeedbacks();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feedback-manager" },
});
/** @type {__VLS_StyleScopedClasses['feedback-manager']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态筛选",
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态筛选",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: (__VLS_ctx.fetchFeedbacks) });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    label: "已反馈",
    value: (0),
}));
const __VLS_10 = __VLS_9({
    label: "已反馈",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    label: "已接收",
    value: (1),
}));
const __VLS_15 = __VLS_14({
    label: "已接收",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "已拒收",
    value: (2),
}));
const __VLS_20 = __VLS_19({
    label: "已拒收",
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
// @ts-ignore
[statusFilter, fetchFeedbacks,];
var __VLS_3;
var __VLS_4;
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    data: (__VLS_ctx.feedbacks),
    ...{ style: {} },
}));
const __VLS_25 = __VLS_24({
    data: (__VLS_ctx.feedbacks),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_28 } = __VLS_26.slots;
let __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    prop: "userId",
    label: "用户ID",
    width: "100",
}));
const __VLS_31 = __VLS_30({
    prop: "userId",
    label: "用户ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    prop: "doctorName",
    label: "相关医生",
}));
const __VLS_36 = __VLS_35({
    prop: "doctorName",
    label: "相关医生",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
const { default: __VLS_39 } = __VLS_37.slots;
{
    const { default: __VLS_40 } = __VLS_37.slots;
    const [scope] = __VLS_vSlot(__VLS_40);
    (scope.row.doctorId);
    // @ts-ignore
    [feedbacks, vLoading, loading,];
}
// @ts-ignore
[];
var __VLS_37;
let __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    prop: "content",
    label: "反馈内容",
}));
const __VLS_43 = __VLS_42({
    prop: "content",
    label: "反馈内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
let __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    prop: "rating",
    label: "评分",
    width: "80",
}));
const __VLS_48 = __VLS_47({
    prop: "rating",
    label: "评分",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
let __VLS_51;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_53 = __VLS_52({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
const { default: __VLS_56 } = __VLS_54.slots;
{
    const { default: __VLS_57 } = __VLS_54.slots;
    const [scope] = __VLS_vSlot(__VLS_57);
    let __VLS_58;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        type: (__VLS_ctx.getStatusType(scope.row.status)),
    }));
    const __VLS_60 = __VLS_59({
        type: (__VLS_ctx.getStatusType(scope.row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const { default: __VLS_63 } = __VLS_61.slots;
    (__VLS_ctx.getStatusText(scope.row.status));
    // @ts-ignore
    [getStatusType, getStatusText,];
    var __VLS_61;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_54;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    label: "回复/理由",
}));
const __VLS_66 = __VLS_65({
    label: "回复/理由",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
{
    const { default: __VLS_70 } = __VLS_67.slots;
    const [scope] = __VLS_vSlot(__VLS_70);
    if (scope.row.status === 1) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (scope.row.replyContent);
    }
    else if (scope.row.status === 2) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        (scope.row.rejectReason);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_67;
let __VLS_71;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}));
const __VLS_73 = __VLS_72({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    label: "操作",
    width: "200",
}));
const __VLS_78 = __VLS_77({
    label: "操作",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const { default: __VLS_81 } = __VLS_79.slots;
{
    const { default: __VLS_82 } = __VLS_79.slots;
    const [scope] = __VLS_vSlot(__VLS_82);
    if (scope.row.status === 0) {
        let __VLS_83;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_85 = __VLS_84({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        let __VLS_88;
        const __VLS_89 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 0))
                        return;
                    __VLS_ctx.handleProcess(scope.row, 1);
                    // @ts-ignore
                    [handleProcess,];
                } });
        const { default: __VLS_90 } = __VLS_86.slots;
        // @ts-ignore
        [];
        var __VLS_86;
        var __VLS_87;
    }
    if (scope.row.status === 0) {
        let __VLS_91;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_93 = __VLS_92({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_92));
        let __VLS_96;
        const __VLS_97 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 0))
                        return;
                    __VLS_ctx.handleProcess(scope.row, 2);
                    // @ts-ignore
                    [handleProcess,];
                } });
        const { default: __VLS_98 } = __VLS_94.slots;
        // @ts-ignore
        [];
        var __VLS_94;
        var __VLS_95;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_79;
// @ts-ignore
[];
var __VLS_26;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_101 = __VLS_100({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
let __VLS_104;
const __VLS_105 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchFeedbacks) });
var __VLS_102;
var __VLS_103;
let __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.processType === 1 ? '接收反馈' : '拒收反馈'),
    width: "500px",
}));
const __VLS_108 = __VLS_107({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.processType === 1 ? '接收反馈' : '拒收反馈'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
const { default: __VLS_111 } = __VLS_109.slots;
let __VLS_112;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
    model: (__VLS_ctx.processForm),
}));
const __VLS_114 = __VLS_113({
    model: (__VLS_ctx.processForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
const { default: __VLS_117 } = __VLS_115.slots;
let __VLS_118;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
    label: (__VLS_ctx.processType === 1 ? '回复内容' : '拒收理由'),
}));
const __VLS_120 = __VLS_119({
    label: (__VLS_ctx.processType === 1 ? '回复内容' : '拒收理由'),
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
const { default: __VLS_123 } = __VLS_121.slots;
let __VLS_124;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
    type: "textarea",
    modelValue: (__VLS_ctx.processForm.content),
    rows: (3),
}));
const __VLS_126 = __VLS_125({
    type: "textarea",
    modelValue: (__VLS_ctx.processForm.content),
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
// @ts-ignore
[fetchFeedbacks, currentPage, pageSize, total, dialogVisible, processType, processType, processForm, processForm,];
var __VLS_121;
// @ts-ignore
[];
var __VLS_115;
{
    const { footer: __VLS_129 } = __VLS_109.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
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
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_137 } = __VLS_133.slots;
    // @ts-ignore
    [];
    var __VLS_133;
    var __VLS_134;
    let __VLS_138;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_140 = __VLS_139({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    let __VLS_143;
    const __VLS_144 = ({ click: {} },
        { onClick: (__VLS_ctx.submitProcess) });
    const { default: __VLS_145 } = __VLS_141.slots;
    // @ts-ignore
    [submitProcess,];
    var __VLS_141;
    var __VLS_142;
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
