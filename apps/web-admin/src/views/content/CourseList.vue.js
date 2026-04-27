/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { getCourses } from '@/api/content';
import { getEnabledCategories } from '@/api/courseCategory';
import { ElMessage } from 'element-plus';
const courseList = ref([]);
const loading = ref(false);
const activeType = ref('');
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const categories = ref([]);
const fetchCategories = async () => {
    try {
        const res = await getEnabledCategories();
        if (res.code === 200) {
            categories.value = res.data || [];
        }
    }
    catch (error) {
        console.error(error);
    }
};
const fetchCourses = async () => {
    loading.value = true;
    try {
        const res = await getCourses({ page: currentPage.value, size: pageSize.value, type: activeType.value || undefined });
        if (res.code === 200) {
            courseList.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        ElMessage.error('加载失败');
    }
    finally {
        loading.value = false;
    }
};
const handleTabClick = (tab) => {
    activeType.value = tab.props.name;
    currentPage.value = 1;
    fetchCourses();
};
const handleCurrentChange = (page) => {
    currentPage.value = page;
    fetchCourses();
};
const goToDetail = (course) => {
    if (course.mediaUrl && (course.mediaUrl.startsWith('http') || course.mediaUrl.startsWith('https'))) {
        window.open(course.mediaUrl, '_blank');
    }
    else {
        ElMessage.info('该课程暂不支持在线播放');
    }
};
onMounted(async () => {
    await fetchCategories();
    fetchCourses();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-card']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pager']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "course-list" },
});
/** @type {__VLS_StyleScopedClasses['course-list']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onTabClick': {} },
    modelValue: (__VLS_ctx.activeType),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onTabClick': {} },
    modelValue: (__VLS_ctx.activeType),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ tabClick: {} },
    { onTabClick: (__VLS_ctx.handleTabClick) });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    label: "全部",
    name: "",
}));
const __VLS_10 = __VLS_9({
    label: "全部",
    name: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
for (const [cat] of __VLS_vFor((__VLS_ctx.categories))) {
    let __VLS_13;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        key: (cat.code),
        label: (cat.name),
        name: (cat.code),
    }));
    const __VLS_15 = __VLS_14({
        key: (cat.code),
        label: (cat.name),
        name: (cat.code),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    // @ts-ignore
    [activeType, handleTabClick, categories,];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "course-grid" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['course-grid']} */ ;
for (const [course] of __VLS_vFor((__VLS_ctx.courseList))) {
    let __VLS_18;
    /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
    elCard;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ 'onClick': {} },
        key: (course.id),
        ...{ class: "course-card" },
        shadow: "hover",
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClick': {} },
        key: (course.id),
        ...{ class: "course-card" },
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.goToDetail(course);
                // @ts-ignore
                [vLoading, loading, courseList, goToDetail,];
            } });
    /** @type {__VLS_StyleScopedClasses['course-card']} */ ;
    const { default: __VLS_25 } = __VLS_21.slots;
    if (course.coverUrl) {
        let __VLS_26;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
            src: (course.coverUrl),
            fit: "cover",
            ...{ class: "cover-image" },
        }));
        const __VLS_28 = __VLS_27({
            src: (course.coverUrl),
            fit: "cover",
            ...{ class: "cover-image" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_27));
        /** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info" },
    });
    /** @type {__VLS_StyleScopedClasses['info']} */ ;
    if (course.sourceName) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "source-tag" },
        });
        /** @type {__VLS_StyleScopedClasses['source-tag']} */ ;
        let __VLS_31;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            size: "small",
            effect: "plain",
        }));
        const __VLS_33 = __VLS_32({
            size: "small",
            effect: "plain",
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        const { default: __VLS_36 } = __VLS_34.slots;
        (course.sourceName);
        // @ts-ignore
        [];
        var __VLS_34;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (course.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "desc" },
    });
    /** @type {__VLS_StyleScopedClasses['desc']} */ ;
    ((course.description || '').substring(0, 50));
    ((course.description || '').length > 50 ? '...' : '');
    // @ts-ignore
    [];
    var __VLS_21;
    var __VLS_22;
    // @ts-ignore
    [];
}
if (__VLS_ctx.courseList.length === 0 && !__VLS_ctx.loading) {
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        description: "暂无课程",
    }));
    const __VLS_39 = __VLS_38({
        description: "暂无课程",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
}
if (__VLS_ctx.total > 0) {
    let __VLS_42;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        ...{ 'onCurrentChange': {} },
        background: true,
        layout: "prev, pager, next",
        total: (__VLS_ctx.total),
        pageSize: (__VLS_ctx.pageSize),
    }));
    const __VLS_44 = __VLS_43({
        ...{ 'onCurrentChange': {} },
        background: true,
        layout: "prev, pager, next",
        total: (__VLS_ctx.total),
        pageSize: (__VLS_ctx.pageSize),
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_47;
    const __VLS_48 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handleCurrentChange) });
    var __VLS_45;
    var __VLS_46;
}
// @ts-ignore
[loading, courseList, total, total, pageSize, handleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
