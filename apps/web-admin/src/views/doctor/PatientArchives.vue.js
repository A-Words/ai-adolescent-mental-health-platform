/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { getDoctorAppointments } from '@/api/consultation';
import request from '@/api/user';
import { ElMessage } from 'element-plus';
const appointments = ref([]);
const loading = ref(false);
const statusFilter = ref(undefined);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// Detail view
const detailVisible = ref(false);
const appointmentDetail = ref(null);
const handleViewDetail = async (row) => {
    try {
        const res = await request.get(`/consultation/appointment/${row.id}/detail`);
        if (res.code === 200) {
            appointmentDetail.value = res.data;
            detailVisible.value = true;
        }
        else {
            ElMessage.error(res.message);
        }
    }
    catch (e) {
        ElMessage.error('获取详情失败');
    }
};
const fetchAppointments = async () => {
    loading.value = true;
    try {
        const res = await getDoctorAppointments({
            page: currentPage.value,
            size: pageSize.value,
            status: statusFilter.value
        });
        if (res.code === 200) {
            appointments.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        loading.value = false;
    }
};
const getStatusText = (status) => {
    const map = { 0: '待就诊', 1: '已完成', 2: '已取消', 3: '爽约' };
    return map[status] || '未知';
};
const getStatusType = (status) => {
    const map = { 0: 'primary', 1: 'success', 2: 'info', 3: 'danger' };
    return map[status] || 'info';
};
onMounted(() => {
    fetchAppointments();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "patient-archives" },
});
/** @type {__VLS_StyleScopedClasses['patient-archives']} */ ;
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
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态筛选",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: (__VLS_ctx.fetchAppointments) });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    label: "待就诊",
    value: (0),
}));
const __VLS_10 = __VLS_9({
    label: "待就诊",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    label: "已完成",
    value: (1),
}));
const __VLS_15 = __VLS_14({
    label: "已完成",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "已取消",
    value: (2),
}));
const __VLS_20 = __VLS_19({
    label: "已取消",
    value: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    label: "爽约",
    value: (3),
}));
const __VLS_25 = __VLS_24({
    label: "爽约",
    value: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
// @ts-ignore
[statusFilter, fetchAppointments,];
var __VLS_3;
var __VLS_4;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    data: (__VLS_ctx.appointments),
    ...{ style: {} },
}));
const __VLS_30 = __VLS_29({
    data: (__VLS_ctx.appointments),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_33 } = __VLS_31.slots;
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    prop: "patientName",
    label: "患者姓名",
}));
const __VLS_36 = __VLS_35({
    prop: "patientName",
    label: "患者姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    prop: "patientPhone",
    label: "联系电话",
}));
const __VLS_41 = __VLS_40({
    prop: "patientPhone",
    label: "联系电话",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    label: "预约时间",
}));
const __VLS_46 = __VLS_45({
    label: "预约时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const { default: __VLS_49 } = __VLS_47.slots;
{
    const { default: __VLS_50 } = __VLS_47.slots;
    const [scope] = __VLS_vSlot(__VLS_50);
    (scope.row.workDate);
    (scope.row.workShift === 1 ? '上午' : '下午');
    // @ts-ignore
    [appointments, vLoading, loading,];
}
// @ts-ignore
[];
var __VLS_47;
let __VLS_51;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    prop: "status",
    label: "状态",
}));
const __VLS_53 = __VLS_52({
    prop: "status",
    label: "状态",
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
    prop: "createTime",
    label: "创建时间",
}));
const __VLS_66 = __VLS_65({
    prop: "createTime",
    label: "创建时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_69;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    label: "操作",
    width: "120",
}));
const __VLS_71 = __VLS_70({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
const { default: __VLS_74 } = __VLS_72.slots;
{
    const { default: __VLS_75 } = __VLS_72.slots;
    const [scope] = __VLS_vSlot(__VLS_75);
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_81;
    const __VLS_82 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleViewDetail(scope.row);
                // @ts-ignore
                [handleViewDetail,];
            } });
    const { default: __VLS_83 } = __VLS_79.slots;
    // @ts-ignore
    [];
    var __VLS_79;
    var __VLS_80;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_72;
// @ts-ignore
[];
var __VLS_31;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_86 = __VLS_85({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_89;
const __VLS_90 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchAppointments) });
var __VLS_87;
var __VLS_88;
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    modelValue: (__VLS_ctx.detailVisible),
    title: "预约详情",
    width: "600px",
}));
const __VLS_93 = __VLS_92({
    modelValue: (__VLS_ctx.detailVisible),
    title: "预约详情",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
const { default: __VLS_96 } = __VLS_94.slots;
if (__VLS_ctx.appointmentDetail) {
    let __VLS_97;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
        column: (2),
        border: true,
    }));
    const __VLS_99 = __VLS_98({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    const { default: __VLS_102 } = __VLS_100.slots;
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        label: "患者姓名",
    }));
    const __VLS_105 = __VLS_104({
        label: "患者姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    const { default: __VLS_108 } = __VLS_106.slots;
    (__VLS_ctx.appointmentDetail.patientName);
    // @ts-ignore
    [fetchAppointments, currentPage, pageSize, total, detailVisible, appointmentDetail, appointmentDetail,];
    var __VLS_106;
    let __VLS_109;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
        label: "联系电话",
    }));
    const __VLS_111 = __VLS_110({
        label: "联系电话",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    const { default: __VLS_114 } = __VLS_112.slots;
    (__VLS_ctx.appointmentDetail.patientPhone);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_112;
    let __VLS_115;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
        label: "就诊日期",
    }));
    const __VLS_117 = __VLS_116({
        label: "就诊日期",
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    const { default: __VLS_120 } = __VLS_118.slots;
    (__VLS_ctx.appointmentDetail.workDate);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_118;
    let __VLS_121;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
        label: "班次",
    }));
    const __VLS_123 = __VLS_122({
        label: "班次",
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    const { default: __VLS_126 } = __VLS_124.slots;
    (__VLS_ctx.appointmentDetail.workShift === 1 ? '上午' : '下午');
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_124;
    let __VLS_127;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
        label: "挂号费",
    }));
    const __VLS_129 = __VLS_128({
        label: "挂号费",
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    const { default: __VLS_132 } = __VLS_130.slots;
    (__VLS_ctx.appointmentDetail.fee);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_130;
    let __VLS_133;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
        label: "状态",
    }));
    const __VLS_135 = __VLS_134({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    const { default: __VLS_138 } = __VLS_136.slots;
    (__VLS_ctx.getStatusText(__VLS_ctx.appointmentDetail.status));
    // @ts-ignore
    [getStatusText, appointmentDetail,];
    var __VLS_136;
    let __VLS_139;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
        label: "描述",
        span: (2),
    }));
    const __VLS_141 = __VLS_140({
        label: "描述",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    const { default: __VLS_144 } = __VLS_142.slots;
    (__VLS_ctx.appointmentDetail.description);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_142;
    // @ts-ignore
    [];
    var __VLS_100;
}
if (__VLS_ctx.appointmentDetail?.medicalRecord) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "medical-record-info" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['medical-record-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    let __VLS_145;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
        column: (1),
        border: true,
    }));
    const __VLS_147 = __VLS_146({
        column: (1),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    const { default: __VLS_150 } = __VLS_148.slots;
    let __VLS_151;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
        label: "科室",
    }));
    const __VLS_153 = __VLS_152({
        label: "科室",
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    const { default: __VLS_156 } = __VLS_154.slots;
    (__VLS_ctx.appointmentDetail.medicalRecord.department);
    // @ts-ignore
    [appointmentDetail, appointmentDetail,];
    var __VLS_154;
    let __VLS_157;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
        label: "诊断",
    }));
    const __VLS_159 = __VLS_158({
        label: "诊断",
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    const { default: __VLS_162 } = __VLS_160.slots;
    (__VLS_ctx.appointmentDetail.medicalRecord.symptoms);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_160;
    let __VLS_163;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
        label: "备注",
    }));
    const __VLS_165 = __VLS_164({
        label: "备注",
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    const { default: __VLS_168 } = __VLS_166.slots;
    (__VLS_ctx.appointmentDetail.medicalRecord.remarks);
    // @ts-ignore
    [appointmentDetail,];
    var __VLS_166;
    let __VLS_169;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
        label: "病历图片",
    }));
    const __VLS_171 = __VLS_170({
        label: "病历图片",
    }, ...__VLS_functionalComponentArgsRest(__VLS_170));
    const { default: __VLS_174 } = __VLS_172.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "image-list" },
    });
    /** @type {__VLS_StyleScopedClasses['image-list']} */ ;
    for (const [img] of __VLS_vFor((__VLS_ctx.appointmentDetail.medicalRecord.images))) {
        let __VLS_175;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
            key: (img),
            src: (img),
            previewSrcList: (__VLS_ctx.appointmentDetail.medicalRecord.images),
            ...{ style: {} },
            fit: "cover",
        }));
        const __VLS_177 = __VLS_176({
            key: (img),
            src: (img),
            previewSrcList: (__VLS_ctx.appointmentDetail.medicalRecord.images),
            ...{ style: {} },
            fit: "cover",
        }, ...__VLS_functionalComponentArgsRest(__VLS_176));
        // @ts-ignore
        [appointmentDetail, appointmentDetail,];
    }
    // @ts-ignore
    [];
    var __VLS_172;
    // @ts-ignore
    [];
    var __VLS_148;
}
{
    const { footer: __VLS_180 } = __VLS_94.slots;
    let __VLS_181;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
        ...{ 'onClick': {} },
    }));
    const __VLS_183 = __VLS_182({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    let __VLS_186;
    const __VLS_187 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
                // @ts-ignore
                [detailVisible,];
            } });
    const { default: __VLS_188 } = __VLS_184.slots;
    // @ts-ignore
    [];
    var __VLS_184;
    var __VLS_185;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_94;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
