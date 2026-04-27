/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { getUserRecords, getRecordDetail } from '@/api/assessment';
import { ElMessage } from 'element-plus';
import { Reading } from '@element-plus/icons-vue';
const records = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const detailVisible = ref(false);
const currentDetail = ref(null);
const fetchRecords = async () => {
    loading.value = true;
    try {
        const res = await getUserRecords({ page: currentPage.value, size: pageSize.value });
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
    fetchRecords();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-home-assessments" },
});
/** @type {__VLS_StyleScopedClasses['my-home-assessments']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "subtitle" },
});
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    data: (__VLS_ctx.records),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    data: (__VLS_ctx.records),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    prop: "templateTitle",
    label: "测评量表",
    minWidth: "200",
}));
const __VLS_8 = __VLS_7({
    prop: "templateTitle",
    label: "测评量表",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    prop: "record.createTime",
    label: "测评时间",
    width: "180",
}));
const __VLS_13 = __VLS_12({
    prop: "record.createTime",
    label: "测评时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_16;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    prop: "record.resultScore",
    label: "得分",
    width: "100",
}));
const __VLS_18 = __VLS_17({
    prop: "record.resultScore",
    label: "得分",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    label: "操作",
    width: "120",
    fixed: "right",
}));
const __VLS_23 = __VLS_22({
    label: "操作",
    width: "120",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
const { default: __VLS_26 } = __VLS_24.slots;
{
    const { default: __VLS_27 } = __VLS_24.slots;
    const [scope] = __VLS_vSlot(__VLS_27);
    let __VLS_28;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_33;
    const __VLS_34 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewDetail(scope.row.record.id);
                // @ts-ignore
                [records, vLoading, loading, viewDetail,];
            } });
    const { default: __VLS_35 } = __VLS_31.slots;
    // @ts-ignore
    [];
    var __VLS_31;
    var __VLS_32;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_24;
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-container" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_41;
    const __VLS_42 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    var __VLS_39;
    var __VLS_40;
}
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.detailVisible),
    title: "测评报告",
    width: "600px",
    customClass: "report-dialog",
}));
const __VLS_45 = __VLS_44({
    modelValue: (__VLS_ctx.detailVisible),
    title: "测评报告",
    width: "600px",
    customClass: "report-dialog",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
const { default: __VLS_48 } = __VLS_46.slots;
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
    let __VLS_49;
    /** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
    elDivider;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        borderStyle: "dashed",
    }));
    const __VLS_51 = __VLS_50({
        borderStyle: "dashed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "analysis-section" },
    });
    /** @type {__VLS_StyleScopedClasses['analysis-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    let __VLS_54;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    const { default: __VLS_59 } = __VLS_57.slots;
    let __VLS_60;
    /** @ts-ignore @type {typeof __VLS_components.Reading} */
    Reading;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    // @ts-ignore
    [total, total, currentPage, pageSize, handlePageChange, detailVisible, currentDetail, currentDetail, currentDetail, currentDetail,];
    var __VLS_57;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "analysis-text" },
    });
    /** @type {__VLS_StyleScopedClasses['analysis-text']} */ ;
    (__VLS_ctx.currentDetail.record.resultAnalysis);
}
{
    const { footer: __VLS_65 } = __VLS_46.slots;
    let __VLS_66;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_68 = __VLS_67({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    let __VLS_71;
    const __VLS_72 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
                // @ts-ignore
                [detailVisible, currentDetail,];
            } });
    const { default: __VLS_73 } = __VLS_69.slots;
    // @ts-ignore
    [];
    var __VLS_69;
    var __VLS_70;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_46;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
