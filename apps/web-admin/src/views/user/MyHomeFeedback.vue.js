/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, watch } from 'vue';
import { getMyPlatformFeedback, getMyConsultationFeedback } from '@/api/feedback';
const activeTab = ref('platform');
const platformFeedbacks = ref([]);
const consultationFeedbacks = ref([]);
const loadingPlatform = ref(false);
const loadingConsultation = ref(false);
const fetchPlatform = async () => {
    loadingPlatform.value = true;
    try {
        const res = await getMyPlatformFeedback({ page: 1, size: 100 });
        if (res.code === 200) {
            platformFeedbacks.value = res.data.records;
        }
    }
    finally {
        loadingPlatform.value = false;
    }
};
const fetchConsultation = async () => {
    loadingConsultation.value = true;
    try {
        const res = await getMyConsultationFeedback({ page: 1, size: 100 });
        if (res.code === 200) {
            consultationFeedbacks.value = res.data.records;
        }
    }
    finally {
        loadingConsultation.value = false;
    }
};
const getPlatformStatusText = (status) => {
    const map = { 0: '已反馈', 1: '待解决', 2: '已解决', 3: '已取消' };
    return map[status] || '未知';
};
const getPlatformStatusType = (status) => {
    const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' };
    return map[status] || 'info';
};
const getConsultationStatusText = (status) => {
    const map = { 0: '已反馈', 1: '已接收', 2: '已拒收' };
    return map[status] || '未知';
};
const getConsultationStatusType = (status) => {
    const map = { 0: 'info', 1: 'success', 2: 'danger' };
    return map[status] || 'info';
};
watch(activeTab, (val) => {
    if (val === 'platform')
        fetchPlatform();
    else
        fetchConsultation();
});
onMounted(() => {
    fetchPlatform();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-home-feedback" },
});
/** @type {__VLS_StyleScopedClasses['my-home-feedback']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "平台反馈",
    name: "platform",
}));
const __VLS_8 = __VLS_7({
    label: "平台反馈",
    name: "platform",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    data: (__VLS_ctx.platformFeedbacks),
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    data: (__VLS_ctx.platformFeedbacks),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingPlatform) }, null, null);
const { default: __VLS_17 } = __VLS_15.slots;
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    prop: "content",
    label: "反馈内容",
}));
const __VLS_20 = __VLS_19({
    prop: "content",
    label: "反馈内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_25 = __VLS_24({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
const { default: __VLS_28 } = __VLS_26.slots;
{
    const { default: __VLS_29 } = __VLS_26.slots;
    const [scope] = __VLS_vSlot(__VLS_29);
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        type: (__VLS_ctx.getPlatformStatusType(scope.row.status)),
    }));
    const __VLS_32 = __VLS_31({
        type: (__VLS_ctx.getPlatformStatusType(scope.row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    const { default: __VLS_35 } = __VLS_33.slots;
    (__VLS_ctx.getPlatformStatusText(scope.row.status));
    // @ts-ignore
    [activeTab, platformFeedbacks, vLoading, loadingPlatform, getPlatformStatusType, getPlatformStatusText,];
    var __VLS_33;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_26;
let __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    prop: "cancelReason",
    label: "取消理由",
    width: "200",
}));
const __VLS_38 = __VLS_37({
    prop: "cancelReason",
    label: "取消理由",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const { default: __VLS_41 } = __VLS_39.slots;
{
    const { default: __VLS_42 } = __VLS_39.slots;
    const [scope] = __VLS_vSlot(__VLS_42);
    (scope.row.status === 3 ? scope.row.cancelReason : '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_39;
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}));
const __VLS_45 = __VLS_44({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
// @ts-ignore
[];
var __VLS_15;
// @ts-ignore
[];
var __VLS_9;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    label: "咨询反馈",
    name: "consultation",
}));
const __VLS_50 = __VLS_49({
    label: "咨询反馈",
    name: "consultation",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const { default: __VLS_53 } = __VLS_51.slots;
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    data: (__VLS_ctx.consultationFeedbacks),
    ...{ style: {} },
}));
const __VLS_56 = __VLS_55({
    data: (__VLS_ctx.consultationFeedbacks),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingConsultation) }, null, null);
const { default: __VLS_59 } = __VLS_57.slots;
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    prop: "content",
    label: "反馈内容",
}));
const __VLS_62 = __VLS_61({
    prop: "content",
    label: "反馈内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    prop: "rating",
    label: "评分",
    width: "80",
}));
const __VLS_67 = __VLS_66({
    prop: "rating",
    label: "评分",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_72 = __VLS_71({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
{
    const { default: __VLS_76 } = __VLS_73.slots;
    const [scope] = __VLS_vSlot(__VLS_76);
    let __VLS_77;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
        type: (__VLS_ctx.getConsultationStatusType(scope.row.status)),
    }));
    const __VLS_79 = __VLS_78({
        type: (__VLS_ctx.getConsultationStatusType(scope.row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    const { default: __VLS_82 } = __VLS_80.slots;
    (__VLS_ctx.getConsultationStatusText(scope.row.status));
    // @ts-ignore
    [vLoading, consultationFeedbacks, loadingConsultation, getConsultationStatusType, getConsultationStatusText,];
    var __VLS_80;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_73;
let __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
    label: "回复/理由",
}));
const __VLS_85 = __VLS_84({
    label: "回复/理由",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
const { default: __VLS_88 } = __VLS_86.slots;
{
    const { default: __VLS_89 } = __VLS_86.slots;
    const [scope] = __VLS_vSlot(__VLS_89);
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
var __VLS_86;
let __VLS_90;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}));
const __VLS_92 = __VLS_91({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
// @ts-ignore
[];
var __VLS_57;
// @ts-ignore
[];
var __VLS_51;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
