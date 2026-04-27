/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { getPlatformFeedbacks, updatePlatformFeedbackStatus } from '@/api/feedback';
import { ElMessage } from 'element-plus';
const feedbacks = ref([]);
const loading = ref(false);
const statusFilter = ref(undefined);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const cancelForm = reactive({ id: 0, reason: '' });
const fetchFeedbacks = async () => {
    loading.value = true;
    try {
        const res = await getPlatformFeedbacks({
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
    const map = { 0: '已反馈', 1: '待解决', 2: '已解决', 3: '已取消' };
    return map[status] || '未知';
};
const getStatusType = (status) => {
    const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' };
    return map[status] || 'info';
};
const handleStatus = async (row, status) => {
    const res = await updatePlatformFeedbackStatus(row.id, { status });
    if (res.code === 200) {
        ElMessage.success('更新成功');
        fetchFeedbacks();
    }
    else {
        ElMessage.error(res.message || '更新失败');
    }
};
const handleCancel = (row) => {
    cancelForm.id = row.id;
    cancelForm.reason = '';
    dialogVisible.value = true;
};
const submitCancel = async () => {
    if (!cancelForm.reason) {
        ElMessage.warning('请输入取消理由');
        return;
    }
    const res = await updatePlatformFeedbackStatus(cancelForm.id, { status: 3, cancelReason: cancelForm.reason });
    if (res.code === 200) {
        ElMessage.success('取消成功');
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
    label: "待解决",
    value: (1),
}));
const __VLS_15 = __VLS_14({
    label: "待解决",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "已解决",
    value: (2),
}));
const __VLS_20 = __VLS_19({
    label: "已解决",
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    label: "已取消",
    value: (3),
}));
const __VLS_25 = __VLS_24({
    label: "已取消",
    value: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
// @ts-ignore
[statusFilter, fetchFeedbacks,];
var __VLS_3;
var __VLS_4;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    data: (__VLS_ctx.feedbacks),
    ...{ style: {} },
}));
const __VLS_30 = __VLS_29({
    data: (__VLS_ctx.feedbacks),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_33 } = __VLS_31.slots;
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    prop: "userId",
    label: "用户ID",
    width: "100",
}));
const __VLS_36 = __VLS_35({
    prop: "userId",
    label: "用户ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    prop: "content",
    label: "反馈内容",
}));
const __VLS_41 = __VLS_40({
    prop: "content",
    label: "反馈内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_46 = __VLS_45({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const { default: __VLS_49 } = __VLS_47.slots;
{
    const { default: __VLS_50 } = __VLS_47.slots;
    const [scope] = __VLS_vSlot(__VLS_50);
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        type: (__VLS_ctx.getStatusType(scope.row.status)),
    }));
    const __VLS_53 = __VLS_52({
        type: (__VLS_ctx.getStatusType(scope.row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    const { default: __VLS_56 } = __VLS_54.slots;
    (__VLS_ctx.getStatusText(scope.row.status));
    // @ts-ignore
    [feedbacks, vLoading, loading, getStatusType, getStatusText,];
    var __VLS_54;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_47;
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    prop: "cancelReason",
    label: "取消理由",
}));
const __VLS_59 = __VLS_58({
    prop: "cancelReason",
    label: "取消理由",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
let __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}));
const __VLS_64 = __VLS_63({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    label: "操作",
    width: "250",
}));
const __VLS_69 = __VLS_68({
    label: "操作",
    width: "250",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_72 } = __VLS_70.slots;
{
    const { default: __VLS_73 } = __VLS_70.slots;
    const [scope] = __VLS_vSlot(__VLS_73);
    if (scope.row.status === 0) {
        let __VLS_74;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }));
        const __VLS_76 = __VLS_75({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        let __VLS_79;
        const __VLS_80 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 0))
                        return;
                    __VLS_ctx.handleStatus(scope.row, 1);
                    // @ts-ignore
                    [handleStatus,];
                } });
        const { default: __VLS_81 } = __VLS_77.slots;
        // @ts-ignore
        [];
        var __VLS_77;
        var __VLS_78;
    }
    if (scope.row.status !== 2 && scope.row.status !== 3) {
        let __VLS_82;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }));
        const __VLS_84 = __VLS_83({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        let __VLS_87;
        const __VLS_88 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status !== 2 && scope.row.status !== 3))
                        return;
                    __VLS_ctx.handleStatus(scope.row, 2);
                    // @ts-ignore
                    [handleStatus,];
                } });
        const { default: __VLS_89 } = __VLS_85.slots;
        // @ts-ignore
        [];
        var __VLS_85;
        var __VLS_86;
    }
    if (scope.row.status !== 3) {
        let __VLS_90;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_92 = __VLS_91({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        let __VLS_95;
        const __VLS_96 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status !== 3))
                        return;
                    __VLS_ctx.handleCancel(scope.row);
                    // @ts-ignore
                    [handleCancel,];
                } });
        const { default: __VLS_97 } = __VLS_93.slots;
        // @ts-ignore
        [];
        var __VLS_93;
        var __VLS_94;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_70;
// @ts-ignore
[];
var __VLS_31;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_98;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_100 = __VLS_99({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
let __VLS_103;
const __VLS_104 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchFeedbacks) });
var __VLS_101;
var __VLS_102;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "取消反馈",
    width: "500px",
}));
const __VLS_107 = __VLS_106({
    modelValue: (__VLS_ctx.dialogVisible),
    title: "取消反馈",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_106));
const { default: __VLS_110 } = __VLS_108.slots;
let __VLS_111;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
    model: (__VLS_ctx.cancelForm),
}));
const __VLS_113 = __VLS_112({
    model: (__VLS_ctx.cancelForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
const { default: __VLS_116 } = __VLS_114.slots;
let __VLS_117;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
    label: "取消理由",
}));
const __VLS_119 = __VLS_118({
    label: "取消理由",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
const { default: __VLS_122 } = __VLS_120.slots;
let __VLS_123;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    type: "textarea",
    modelValue: (__VLS_ctx.cancelForm.reason),
    rows: (3),
}));
const __VLS_125 = __VLS_124({
    type: "textarea",
    modelValue: (__VLS_ctx.cancelForm.reason),
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
// @ts-ignore
[fetchFeedbacks, currentPage, pageSize, total, dialogVisible, cancelForm, cancelForm,];
var __VLS_120;
// @ts-ignore
[];
var __VLS_114;
{
    const { footer: __VLS_128 } = __VLS_108.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_129;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
        ...{ 'onClick': {} },
    }));
    const __VLS_131 = __VLS_130({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    let __VLS_134;
    const __VLS_135 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.dialogVisible = false;
                // @ts-ignore
                [dialogVisible,];
            } });
    const { default: __VLS_136 } = __VLS_132.slots;
    // @ts-ignore
    [];
    var __VLS_132;
    var __VLS_133;
    let __VLS_137;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_139 = __VLS_138({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    let __VLS_142;
    const __VLS_143 = ({ click: {} },
        { onClick: (__VLS_ctx.submitCancel) });
    const { default: __VLS_144 } = __VLS_140.slots;
    // @ts-ignore
    [submitCancel,];
    var __VLS_140;
    var __VLS_141;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_108;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
