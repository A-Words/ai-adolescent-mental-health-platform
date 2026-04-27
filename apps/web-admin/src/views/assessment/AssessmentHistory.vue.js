/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { getUserRecords, getRecordDetail } from '@/api/assessment';
import { getPatientContacts } from '@/api/user';
import { ElMessage } from 'element-plus';
import { Reading, User, UserFilled } from '@element-plus/icons-vue';
const records = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const patients = ref([]);
const activePatientId = ref('');
const detailVisible = ref(false);
const currentDetail = ref(null);
const currentPatientName = computed(() => {
    if (!activePatientId.value)
        return '全部';
    const p = patients.value.find(item => String(item.id) === activePatientId.value);
    return p ? p.name : '未知';
});
const fetchPatients = async () => {
    try {
        const res = await getPatientContacts();
        if (res.code === 200) {
            patients.value = res.data;
        }
    }
    catch (e) {
        console.error(e);
    }
};
const fetchRecords = async () => {
    loading.value = true;
    try {
        const params = { page: currentPage.value, size: pageSize.value };
        if (activePatientId.value) {
            params.patientContactId = activePatientId.value;
        }
        const res = await getUserRecords(params);
        if (res.code === 200) {
            records.value = res.data.records;
            total.value = res.data.total;
        }
        else {
            ElMessage.error(res.message || '加载记录失败');
        }
    }
    catch (error) {
        ElMessage.error('网络错误，请稍后再试');
    }
    finally {
        loading.value = false;
    }
};
const handlePatientSelect = (index) => {
    activePatientId.value = index;
    currentPage.value = 1;
    fetchRecords();
};
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchRecords();
};
const viewDetail = async (id) => {
    try {
        const res = await getRecordDetail(id);
        if (res.code === 200) {
            currentDetail.value = res.data;
            detailVisible.value = true;
        }
        else {
            ElMessage.error(res.message || '加载详情失败');
        }
    }
    catch (error) {
        ElMessage.error('网络错误，请稍后再试');
    }
};
onMounted(() => {
    fetchPatients();
    fetchRecords();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['assessment-history']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-history']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-card']} */ ;
/** @type {__VLS_StyleScopedClasses['patient-list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-card__body']} */ ;
/** @type {__VLS_StyleScopedClasses['patient-list-card']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['patient-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['patient-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['patient-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['patient-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['patient-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table__cell']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table__cell']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['is-link']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pager']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__headerbtn']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__close']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-section']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "assessment-history" },
});
/** @type {__VLS_StyleScopedClasses['assessment-history']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "subtitle" },
});
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "content-container" },
});
/** @type {__VLS_StyleScopedClasses['content-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "patient-list-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "patient-list-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['patient-list-card']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-title" },
});
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elMenu | typeof __VLS_components.ElMenu | typeof __VLS_components.elMenu | typeof __VLS_components.ElMenu} */
elMenu;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ...{ 'onSelect': {} },
    defaultActive: (__VLS_ctx.activePatientId),
    ...{ class: "patient-menu" },
}));
const __VLS_8 = __VLS_7({
    ...{ 'onSelect': {} },
    defaultActive: (__VLS_ctx.activePatientId),
    ...{ class: "patient-menu" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_11;
const __VLS_12 = ({ select: {} },
    { onSelect: (__VLS_ctx.handlePatientSelect) });
/** @type {__VLS_StyleScopedClasses['patient-menu']} */ ;
const { default: __VLS_13 } = __VLS_9.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
elMenuItem;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    index: "",
}));
const __VLS_16 = __VLS_15({
    index: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const { default: __VLS_25 } = __VLS_23.slots;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.User} */
User;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
// @ts-ignore
[activePatientId, handlePatientSelect,];
var __VLS_23;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_17;
for (const [p] of __VLS_vFor((__VLS_ctx.patients))) {
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        key: (p.id),
        index: (String(p.id)),
    }));
    const __VLS_33 = __VLS_32({
        key: (p.id),
        index: (String(p.id)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const { default: __VLS_36 } = __VLS_34.slots;
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({}));
    const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const { default: __VLS_42 } = __VLS_40.slots;
    let __VLS_43;
    /** @ts-ignore @type {typeof __VLS_components.UserFilled} */
    UserFilled;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({}));
    const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
    // @ts-ignore
    [patients,];
    var __VLS_40;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (p.name);
    (p.relationship);
    // @ts-ignore
    [];
    var __VLS_34;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_9;
var __VLS_10;
// @ts-ignore
[];
var __VLS_3;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    ...{ class: "history-card" },
}));
const __VLS_50 = __VLS_49({
    ...{ class: "history-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
/** @type {__VLS_StyleScopedClasses['history-card']} */ ;
const { default: __VLS_53 } = __VLS_51.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-title" },
});
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
(__VLS_ctx.currentPatientName);
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    data: (__VLS_ctx.records),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_56 = __VLS_55({
    data: (__VLS_ctx.records),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_59 } = __VLS_57.slots;
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    prop: "templateTitle",
    label: "测评量表",
    minWidth: "200",
}));
const __VLS_62 = __VLS_61({
    prop: "templateTitle",
    label: "测评量表",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    prop: "record.createTime",
    label: "测评时间",
    width: "180",
}));
const __VLS_67 = __VLS_66({
    prop: "record.createTime",
    label: "测评时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    prop: "record.resultScore",
    label: "得分",
    width: "100",
}));
const __VLS_72 = __VLS_71({
    prop: "record.resultScore",
    label: "得分",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    label: "操作",
    width: "120",
    fixed: "right",
}));
const __VLS_77 = __VLS_76({
    label: "操作",
    width: "120",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
const { default: __VLS_80 } = __VLS_78.slots;
{
    const { default: __VLS_81 } = __VLS_78.slots;
    const [scope] = __VLS_vSlot(__VLS_81);
    let __VLS_82;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
    }));
    const __VLS_84 = __VLS_83({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    let __VLS_87;
    const __VLS_88 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewDetail(scope.row.record.id);
                // @ts-ignore
                [currentPatientName, records, vLoading, loading, viewDetail,];
            } });
    const { default: __VLS_89 } = __VLS_85.slots;
    // @ts-ignore
    [];
    var __VLS_85;
    var __VLS_86;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_78;
// @ts-ignore
[];
var __VLS_57;
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-container" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
    let __VLS_90;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_92 = __VLS_91({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    let __VLS_95;
    const __VLS_96 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    var __VLS_93;
    var __VLS_94;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
var __VLS_51;
let __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
    modelValue: (__VLS_ctx.detailVisible),
    title: "测评报告",
    width: "600px",
    ...{ class: "report-dialog" },
}));
const __VLS_99 = __VLS_98({
    modelValue: (__VLS_ctx.detailVisible),
    title: "测评报告",
    width: "600px",
    ...{ class: "report-dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
/** @type {__VLS_StyleScopedClasses['report-dialog']} */ ;
const { default: __VLS_102 } = __VLS_100.slots;
if (__VLS_ctx.currentDetail) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "report-content" },
    });
    /** @type {__VLS_StyleScopedClasses['report-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "report-title" },
    });
    /** @type {__VLS_StyleScopedClasses['report-title']} */ ;
    (__VLS_ctx.currentDetail.templateTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "report-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['report-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.currentDetail.record.createTime);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
        ...{ class: "score" },
    });
    /** @type {__VLS_StyleScopedClasses['score']} */ ;
    (__VLS_ctx.currentDetail.record.resultScore);
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
    elDivider;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        borderStyle: "dashed",
    }));
    const __VLS_105 = __VLS_104({
        borderStyle: "dashed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "analysis-section" },
    });
    /** @type {__VLS_StyleScopedClasses['analysis-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    let __VLS_108;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({}));
    const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
    const { default: __VLS_113 } = __VLS_111.slots;
    let __VLS_114;
    /** @ts-ignore @type {typeof __VLS_components.Reading} */
    Reading;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({}));
    const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
    // @ts-ignore
    [detailVisible, currentDetail, currentDetail, currentDetail, currentDetail,];
    var __VLS_111;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "analysis-text" },
    });
    /** @type {__VLS_StyleScopedClasses['analysis-text']} */ ;
    (__VLS_ctx.currentDetail.record.resultAnalysis);
}
{
    const { footer: __VLS_119 } = __VLS_100.slots;
    let __VLS_120;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_122 = __VLS_121({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_125;
    const __VLS_126 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
                // @ts-ignore
                [detailVisible, currentDetail,];
            } });
    const { default: __VLS_127 } = __VLS_123.slots;
    // @ts-ignore
    [];
    var __VLS_123;
    var __VLS_124;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_100;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
