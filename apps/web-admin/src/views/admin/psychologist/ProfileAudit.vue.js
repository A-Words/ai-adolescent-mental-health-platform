/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, User } from '@element-plus/icons-vue';
import { getProfileAuditList, getProfileAuditDetail, approveProfileAudit, rejectProfileAudit } from '@/api/psychologistAdmin';
const loading = ref(false);
const auditLoading = ref(false);
const statusFilter = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const auditList = ref([]);
const statsData = reactive({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
});
const detailDialogVisible = ref(false);
const auditDialogVisible = ref(false);
const proofDialogVisible = ref(false);
const currentAudit = ref(null);
const currentProofUrls = ref([]);
const auditAction = ref('approve');
const auditForm = reactive({
    remark: ''
});
// 获取列表数据
const fetchList = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value
        };
        if (statusFilter.value !== null) {
            params.status = statusFilter.value;
        }
        const res = await getProfileAuditList(params);
        if (res.code === 200) {
            auditList.value = res.data?.records || [];
            total.value = res.data?.total || 0;
            // 统计计算
            const list = res.data?.records || [];
            statsData.pendingCount = list.filter((a) => a.auditStatus === 0).length;
            statsData.approvedCount = list.filter((a) => a.auditStatus === 1).length;
            statsData.rejectedCount = list.filter((a) => a.auditStatus === 2).length;
        }
        else {
            ElMessage.error(res.message || '获取列表失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取列表失败');
    }
    finally {
        loading.value = false;
    }
};
// 获取状态类型
const getStatusType = (status) => {
    switch (status) {
        case 0: return 'warning';
        case 1: return 'success';
        case 2: return 'danger';
        default: return 'info';
    }
};
// 获取状态文本
const getStatusText = (status) => {
    switch (status) {
        case 0: return '待审核';
        case 1: return '已通过';
        case 2: return '已拒绝';
        default: return '未知';
    }
};
// 搜索
const handleSearch = () => {
    currentPage.value = 1;
    fetchList();
};
// 重置
const handleReset = () => {
    statusFilter.value = null;
    currentPage.value = 1;
    fetchList();
};
// 分页
const handleSizeChange = () => {
    currentPage.value = 1;
    fetchList();
};
const handleCurrentChange = () => {
    fetchList();
};
// 查看详情
const handleViewDetail = async (row) => {
    try {
        const res = await getProfileAuditDetail(row.id);
        if (res.code === 200) {
            currentAudit.value = res.data;
            detailDialogVisible.value = true;
        }
        else {
            ElMessage.error(res.message || '获取详情失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '获取详情失败');
    }
};
// 查看证明材料
const handleViewProof = (row) => {
    currentProofUrls.value = parseProofUrls(row.proofUrls);
    proofDialogVisible.value = true;
};
// 解析证明材料URLs
const parseProofUrls = (proofUrls) => {
    if (!proofUrls)
        return [];
    try {
        return JSON.parse(proofUrls);
    }
    catch {
        return proofUrls.split(',');
    }
};
// 审核通过
const handleApprove = (row) => {
    auditAction.value = 'approve';
    auditForm.remark = '';
    currentAudit.value = row;
    auditDialogVisible.value = true;
};
// 审核拒绝
const handleReject = (row) => {
    auditAction.value = 'reject';
    auditForm.remark = '';
    currentAudit.value = row;
    auditDialogVisible.value = true;
};
// 确认审核
const confirmAudit = async () => {
    if (auditAction.value === 'reject' && !auditForm.remark) {
        ElMessage.warning('请输入拒绝原因');
        return;
    }
    auditLoading.value = true;
    try {
        let res;
        if (auditAction.value === 'approve') {
            res = await approveProfileAudit(currentAudit.value.id, auditForm.remark);
        }
        else {
            res = await rejectProfileAudit(currentAudit.value.id, auditForm.remark);
        }
        if (res.code === 200) {
            ElMessage.success(auditAction.value === 'approve' ? '审核已通过' : '已拒绝');
            auditDialogVisible.value = false;
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
        auditLoading.value = false;
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
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['change-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['old']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['new']} */ ;
/** @type {__VLS_StyleScopedClasses['proof-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "profile-audit-page" },
});
/** @type {__VLS_StyleScopedClasses['profile-audit-page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "audit-stats" },
});
/** @type {__VLS_StyleScopedClasses['audit-stats']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item pending" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['pending']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "label" },
});
/** @type {__VLS_StyleScopedClasses['label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.statsData.pendingCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item approved" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['approved']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "label" },
});
/** @type {__VLS_StyleScopedClasses['label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.statsData.approvedCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item rejected" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['rejected']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "label" },
});
/** @type {__VLS_StyleScopedClasses['label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.statsData.rejectedCount);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "filter-toolbar" },
});
/** @type {__VLS_StyleScopedClasses['filter-toolbar']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "审核状态",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "审核状态",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: (__VLS_ctx.handleSearch) });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    label: "全部",
    value: (null),
}));
const __VLS_10 = __VLS_9({
    label: "全部",
    value: (null),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    label: "待审核",
    value: (0),
}));
const __VLS_15 = __VLS_14({
    label: "待审核",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "已通过",
    value: (1),
}));
const __VLS_20 = __VLS_19({
    label: "已通过",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    label: "已拒绝",
    value: (2),
}));
const __VLS_25 = __VLS_24({
    label: "已拒绝",
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
// @ts-ignore
[statsData, statsData, statsData, statusFilter, handleSearch,];
var __VLS_3;
var __VLS_4;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_33;
const __VLS_34 = ({ click: {} },
    { onClick: (__VLS_ctx.handleReset) });
const { default: __VLS_35 } = __VLS_31.slots;
let __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const { default: __VLS_41 } = __VLS_39.slots;
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.Refresh} */
Refresh;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({}));
const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
// @ts-ignore
[handleReset,];
var __VLS_39;
// @ts-ignore
[];
var __VLS_31;
var __VLS_32;
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    data: (__VLS_ctx.auditList),
    stripe: true,
}));
const __VLS_49 = __VLS_48({
    data: (__VLS_ctx.auditList),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_52 } = __VLS_50.slots;
let __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_55 = __VLS_54({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
let __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    label: "咨询师信息",
    minWidth: "180",
}));
const __VLS_60 = __VLS_59({
    label: "咨询师信息",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
const { default: __VLS_63 } = __VLS_61.slots;
{
    const { default: __VLS_64 } = __VLS_61.slots;
    const [scope] = __VLS_vSlot(__VLS_64);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "psychologist-info" },
    });
    /** @type {__VLS_StyleScopedClasses['psychologist-info']} */ ;
    let __VLS_65;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
        size: (36),
        src: (scope.row.userAvatar),
    }));
    const __VLS_67 = __VLS_66({
        size: (36),
        src: (scope.row.userAvatar),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    const { default: __VLS_70 } = __VLS_68.slots;
    let __VLS_71;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({}));
    const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
    const { default: __VLS_76 } = __VLS_74.slots;
    let __VLS_77;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({}));
    const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
    // @ts-ignore
    [auditList, vLoading, loading,];
    var __VLS_74;
    // @ts-ignore
    [];
    var __VLS_68;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['info-detail']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "name" },
    });
    /** @type {__VLS_StyleScopedClasses['name']} */ ;
    (scope.row.psychologistName || '-');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "username" },
    });
    /** @type {__VLS_StyleScopedClasses['username']} */ ;
    (scope.row.userNickname || '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_61;
let __VLS_82;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
    label: "变更字段",
    width: "120",
}));
const __VLS_84 = __VLS_83({
    label: "变更字段",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
const { default: __VLS_87 } = __VLS_85.slots;
{
    const { default: __VLS_88 } = __VLS_85.slots;
    const [scope] = __VLS_vSlot(__VLS_88);
    let __VLS_89;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
        type: "info",
        size: "small",
    }));
    const __VLS_91 = __VLS_90({
        type: "info",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    const { default: __VLS_94 } = __VLS_92.slots;
    (scope.row.fieldNameText || scope.row.fieldName);
    // @ts-ignore
    [];
    var __VLS_92;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_85;
let __VLS_95;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
    label: "变更内容",
    minWidth: "160",
}));
const __VLS_97 = __VLS_96({
    label: "变更内容",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
const { default: __VLS_100 } = __VLS_98.slots;
{
    const { default: __VLS_101 } = __VLS_98.slots;
    const [scope] = __VLS_vSlot(__VLS_101);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "change-content" },
    });
    /** @type {__VLS_StyleScopedClasses['change-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "change-item" },
    });
    /** @type {__VLS_StyleScopedClasses['change-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value old" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['old']} */ ;
    (scope.row.oldValue || '(空)');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "change-item" },
    });
    /** @type {__VLS_StyleScopedClasses['change-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value new" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['new']} */ ;
    (scope.row.newValue || '(空)');
    if (scope.row.reason) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "change-item" },
        });
        /** @type {__VLS_StyleScopedClasses['change-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "label" },
        });
        /** @type {__VLS_StyleScopedClasses['label']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "value reason" },
        });
        /** @type {__VLS_StyleScopedClasses['value']} */ ;
        /** @type {__VLS_StyleScopedClasses['reason']} */ ;
        (scope.row.reason);
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_98;
let __VLS_102;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
    label: "证明材料",
    width: "80",
}));
const __VLS_104 = __VLS_103({
    label: "证明材料",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
const { default: __VLS_107 } = __VLS_105.slots;
{
    const { default: __VLS_108 } = __VLS_105.slots;
    const [scope] = __VLS_vSlot(__VLS_108);
    if (scope.row.proofUrls) {
        let __VLS_109;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            link: true,
        }));
        const __VLS_111 = __VLS_110({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        let __VLS_114;
        const __VLS_115 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.proofUrls))
                        return;
                    __VLS_ctx.handleViewProof(scope.row);
                    // @ts-ignore
                    [handleViewProof,];
                } });
        const { default: __VLS_116 } = __VLS_112.slots;
        // @ts-ignore
        [];
        var __VLS_112;
        var __VLS_113;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "no-proof" },
        });
        /** @type {__VLS_StyleScopedClasses['no-proof']} */ ;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_105;
let __VLS_117;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
    label: "审核状态",
    width: "90",
}));
const __VLS_119 = __VLS_118({
    label: "审核状态",
    width: "90",
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
        type: (__VLS_ctx.getStatusType(scope.row.auditStatus)),
        size: "small",
    }));
    const __VLS_126 = __VLS_125({
        type: (__VLS_ctx.getStatusType(scope.row.auditStatus)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    const { default: __VLS_129 } = __VLS_127.slots;
    (scope.row.auditStatusText || __VLS_ctx.getStatusText(scope.row.auditStatus));
    // @ts-ignore
    [getStatusType, getStatusText,];
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
    label: "申请时间",
    width: "150",
}));
const __VLS_132 = __VLS_131({
    label: "申请时间",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
const { default: __VLS_135 } = __VLS_133.slots;
{
    const { default: __VLS_136 } = __VLS_133.slots;
    const [scope] = __VLS_vSlot(__VLS_136);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (scope.row.createTime || '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_133;
let __VLS_137;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
    label: "操作",
    width: "200",
    fixed: "right",
}));
const __VLS_139 = __VLS_138({
    label: "操作",
    width: "200",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
const { default: __VLS_142 } = __VLS_140.slots;
{
    const { default: __VLS_143 } = __VLS_140.slots;
    const [scope] = __VLS_vSlot(__VLS_143);
    if (scope.row.auditStatus === 0) {
        let __VLS_144;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_146 = __VLS_145({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        let __VLS_149;
        const __VLS_150 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.auditStatus === 0))
                        return;
                    __VLS_ctx.handleApprove(scope.row);
                    // @ts-ignore
                    [handleApprove,];
                } });
        const { default: __VLS_151 } = __VLS_147.slots;
        // @ts-ignore
        [];
        var __VLS_147;
        var __VLS_148;
        let __VLS_152;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_154 = __VLS_153({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        let __VLS_157;
        const __VLS_158 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.auditStatus === 0))
                        return;
                    __VLS_ctx.handleReject(scope.row);
                    // @ts-ignore
                    [handleReject,];
                } });
        const { default: __VLS_159 } = __VLS_155.slots;
        // @ts-ignore
        [];
        var __VLS_155;
        var __VLS_156;
    }
    let __VLS_160;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent1(__VLS_160, new __VLS_160({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_162 = __VLS_161({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    let __VLS_165;
    const __VLS_166 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleViewDetail(scope.row);
                // @ts-ignore
                [handleViewDetail,];
            } });
    const { default: __VLS_167 } = __VLS_163.slots;
    // @ts-ignore
    [];
    var __VLS_163;
    var __VLS_164;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_140;
// @ts-ignore
[];
var __VLS_50;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
let __VLS_168;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50]),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_170 = __VLS_169({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50]),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
let __VLS_173;
const __VLS_174 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.handleSizeChange) });
const __VLS_175 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.handleCurrentChange) });
var __VLS_171;
var __VLS_172;
let __VLS_176;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent1(__VLS_176, new __VLS_176({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "审核详情",
    width: "600px",
}));
const __VLS_178 = __VLS_177({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "审核详情",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const { default: __VLS_181 } = __VLS_179.slots;
if (__VLS_ctx.currentAudit) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
    let __VLS_182;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent1(__VLS_182, new __VLS_182({
        column: (2),
        border: true,
    }));
    const __VLS_184 = __VLS_183({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    const { default: __VLS_187 } = __VLS_185.slots;
    let __VLS_188;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent1(__VLS_188, new __VLS_188({
        label: "咨询师",
    }));
    const __VLS_190 = __VLS_189({
        label: "咨询师",
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    const { default: __VLS_193 } = __VLS_191.slots;
    (__VLS_ctx.currentAudit.psychologistName || '-');
    // @ts-ignore
    [currentPage, pageSize, total, handleSizeChange, handleCurrentChange, detailDialogVisible, currentAudit, currentAudit,];
    var __VLS_191;
    let __VLS_194;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent1(__VLS_194, new __VLS_194({
        label: "变更字段",
    }));
    const __VLS_196 = __VLS_195({
        label: "变更字段",
    }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    const { default: __VLS_199 } = __VLS_197.slots;
    (__VLS_ctx.currentAudit.fieldNameText || __VLS_ctx.currentAudit.fieldName);
    // @ts-ignore
    [currentAudit, currentAudit,];
    var __VLS_197;
    let __VLS_200;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
        label: "原值",
        span: (2),
    }));
    const __VLS_202 = __VLS_201({
        label: "原值",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    const { default: __VLS_205 } = __VLS_203.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value old" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['old']} */ ;
    (__VLS_ctx.currentAudit.oldValue || '(空)');
    // @ts-ignore
    [currentAudit,];
    var __VLS_203;
    let __VLS_206;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
        label: "新值",
        span: (2),
    }));
    const __VLS_208 = __VLS_207({
        label: "新值",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    const { default: __VLS_211 } = __VLS_209.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value new" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    /** @type {__VLS_StyleScopedClasses['new']} */ ;
    (__VLS_ctx.currentAudit.newValue || '(空)');
    // @ts-ignore
    [currentAudit,];
    var __VLS_209;
    let __VLS_212;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent1(__VLS_212, new __VLS_212({
        label: "申请理由",
        span: (2),
    }));
    const __VLS_214 = __VLS_213({
        label: "申请理由",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    const { default: __VLS_217 } = __VLS_215.slots;
    (__VLS_ctx.currentAudit.reason || '-');
    // @ts-ignore
    [currentAudit,];
    var __VLS_215;
    let __VLS_218;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218({
        label: "审核状态",
    }));
    const __VLS_220 = __VLS_219({
        label: "审核状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    const { default: __VLS_223 } = __VLS_221.slots;
    let __VLS_224;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent1(__VLS_224, new __VLS_224({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.currentAudit.auditStatus)),
        size: "small",
    }));
    const __VLS_226 = __VLS_225({
        type: (__VLS_ctx.getStatusType(__VLS_ctx.currentAudit.auditStatus)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    const { default: __VLS_229 } = __VLS_227.slots;
    (__VLS_ctx.currentAudit.auditStatusText || __VLS_ctx.getStatusText(__VLS_ctx.currentAudit.auditStatus));
    // @ts-ignore
    [getStatusType, getStatusText, currentAudit, currentAudit, currentAudit,];
    var __VLS_227;
    // @ts-ignore
    [];
    var __VLS_221;
    let __VLS_230;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent1(__VLS_230, new __VLS_230({
        label: "申请时间",
    }));
    const __VLS_232 = __VLS_231({
        label: "申请时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    const { default: __VLS_235 } = __VLS_233.slots;
    (__VLS_ctx.currentAudit.createTime || '-');
    // @ts-ignore
    [currentAudit,];
    var __VLS_233;
    let __VLS_236;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent1(__VLS_236, new __VLS_236({
        label: "审核时间",
        span: (2),
    }));
    const __VLS_238 = __VLS_237({
        label: "审核时间",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    const { default: __VLS_241 } = __VLS_239.slots;
    (__VLS_ctx.currentAudit.auditTime || '-');
    // @ts-ignore
    [currentAudit,];
    var __VLS_239;
    let __VLS_242;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_243 = __VLS_asFunctionalComponent1(__VLS_242, new __VLS_242({
        label: "审核备注",
        span: (2),
    }));
    const __VLS_244 = __VLS_243({
        label: "审核备注",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_243));
    const { default: __VLS_247 } = __VLS_245.slots;
    (__VLS_ctx.currentAudit.auditRemark || '-');
    // @ts-ignore
    [currentAudit,];
    var __VLS_245;
    // @ts-ignore
    [];
    var __VLS_185;
    if (__VLS_ctx.currentAudit.proofUrls) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "proof-section" },
        });
        /** @type {__VLS_StyleScopedClasses['proof-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "proof-images" },
        });
        /** @type {__VLS_StyleScopedClasses['proof-images']} */ ;
        for (const [url, index] of __VLS_vFor((__VLS_ctx.parseProofUrls(__VLS_ctx.currentAudit.proofUrls)))) {
            let __VLS_248;
            /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
            elImage;
            // @ts-ignore
            const __VLS_249 = __VLS_asFunctionalComponent1(__VLS_248, new __VLS_248({
                key: (index),
                src: (url),
                previewSrcList: (__VLS_ctx.parseProofUrls(__VLS_ctx.currentAudit.proofUrls)),
                fit: "contain",
                ...{ style: {} },
            }));
            const __VLS_250 = __VLS_249({
                key: (index),
                src: (url),
                previewSrcList: (__VLS_ctx.parseProofUrls(__VLS_ctx.currentAudit.proofUrls)),
                fit: "contain",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_249));
            // @ts-ignore
            [currentAudit, currentAudit, currentAudit, parseProofUrls, parseProofUrls,];
        }
    }
}
// @ts-ignore
[];
var __VLS_179;
let __VLS_253;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent1(__VLS_253, new __VLS_253({
    modelValue: (__VLS_ctx.auditDialogVisible),
    title: (__VLS_ctx.auditAction === 'approve' ? '通过审核' : '拒绝审核'),
    width: "500px",
}));
const __VLS_255 = __VLS_254({
    modelValue: (__VLS_ctx.auditDialogVisible),
    title: (__VLS_ctx.auditAction === 'approve' ? '通过审核' : '拒绝审核'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
const { default: __VLS_258 } = __VLS_256.slots;
let __VLS_259;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent1(__VLS_259, new __VLS_259({
    model: (__VLS_ctx.auditForm),
    labelWidth: "100px",
}));
const __VLS_261 = __VLS_260({
    model: (__VLS_ctx.auditForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
const { default: __VLS_264 } = __VLS_262.slots;
let __VLS_265;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_266 = __VLS_asFunctionalComponent1(__VLS_265, new __VLS_265({
    label: "审核备注",
}));
const __VLS_267 = __VLS_266({
    label: "审核备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_266));
const { default: __VLS_270 } = __VLS_268.slots;
let __VLS_271;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_272 = __VLS_asFunctionalComponent1(__VLS_271, new __VLS_271({
    modelValue: (__VLS_ctx.auditForm.remark),
    type: "textarea",
    rows: (3),
    placeholder: (__VLS_ctx.auditAction === 'approve' ? '可选：添加通过备注' : '请输入拒绝原因'),
}));
const __VLS_273 = __VLS_272({
    modelValue: (__VLS_ctx.auditForm.remark),
    type: "textarea",
    rows: (3),
    placeholder: (__VLS_ctx.auditAction === 'approve' ? '可选：添加通过备注' : '请输入拒绝原因'),
}, ...__VLS_functionalComponentArgsRest(__VLS_272));
// @ts-ignore
[auditDialogVisible, auditAction, auditAction, auditForm, auditForm,];
var __VLS_268;
// @ts-ignore
[];
var __VLS_262;
{
    const { footer: __VLS_276 } = __VLS_256.slots;
    let __VLS_277;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_278 = __VLS_asFunctionalComponent1(__VLS_277, new __VLS_277({
        ...{ 'onClick': {} },
    }));
    const __VLS_279 = __VLS_278({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_278));
    let __VLS_282;
    const __VLS_283 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.auditDialogVisible = false;
                // @ts-ignore
                [auditDialogVisible,];
            } });
    const { default: __VLS_284 } = __VLS_280.slots;
    // @ts-ignore
    [];
    var __VLS_280;
    var __VLS_281;
    let __VLS_285;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_286 = __VLS_asFunctionalComponent1(__VLS_285, new __VLS_285({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.auditAction === 'approve' ? 'primary' : 'danger'),
        loading: (__VLS_ctx.auditLoading),
    }));
    const __VLS_287 = __VLS_286({
        ...{ 'onClick': {} },
        type: (__VLS_ctx.auditAction === 'approve' ? 'primary' : 'danger'),
        loading: (__VLS_ctx.auditLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_286));
    let __VLS_290;
    const __VLS_291 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmAudit) });
    const { default: __VLS_292 } = __VLS_288.slots;
    (__VLS_ctx.auditAction === 'approve' ? '通过' : '拒绝');
    // @ts-ignore
    [auditAction, auditAction, auditLoading, confirmAudit,];
    var __VLS_288;
    var __VLS_289;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_256;
let __VLS_293;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_294 = __VLS_asFunctionalComponent1(__VLS_293, new __VLS_293({
    modelValue: (__VLS_ctx.proofDialogVisible),
    title: "证明材料",
    width: "800px",
}));
const __VLS_295 = __VLS_294({
    modelValue: (__VLS_ctx.proofDialogVisible),
    title: "证明材料",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_294));
const { default: __VLS_298 } = __VLS_296.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "proof-gallery" },
});
/** @type {__VLS_StyleScopedClasses['proof-gallery']} */ ;
for (const [url, index] of __VLS_vFor((__VLS_ctx.currentProofUrls))) {
    let __VLS_299;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_300 = __VLS_asFunctionalComponent1(__VLS_299, new __VLS_299({
        key: (index),
        src: (url),
        previewSrcList: (__VLS_ctx.currentProofUrls),
        fit: "contain",
        ...{ style: {} },
    }));
    const __VLS_301 = __VLS_300({
        key: (index),
        src: (url),
        previewSrcList: (__VLS_ctx.currentProofUrls),
        fit: "contain",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_300));
    // @ts-ignore
    [proofDialogVisible, currentProofUrls, currentProofUrls,];
}
// @ts-ignore
[];
var __VLS_296;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
