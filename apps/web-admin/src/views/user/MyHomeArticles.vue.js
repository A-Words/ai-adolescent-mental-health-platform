/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { View, Pointer, ChatDotRound } from '@element-plus/icons-vue';
import { getMyArticles, withdrawArticle as withdrawApi, deleteMyArticle as deleteApi } from '@/api/userArticle';
const router = useRouter();
const loading = ref(false);
const activeTab = ref('all');
const articles = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const getStatusText = (status) => {
    const map = { 0: '待审核', 1: '已发布', 2: '已下架' };
    return map[status] || '未知';
};
const getStatusType = (status) => {
    const map = { 0: 'warning', 1: 'success', 2: 'danger' };
    return map[status] || 'info';
};
const fetchArticles = async () => {
    loading.value = true;
    try {
        const res = await getMyArticles({ page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            let data = res.data.records;
            if (activeTab.value !== 'all') {
                data = data.filter((a) => a.status === Number(activeTab.value));
            }
            articles.value = data;
            total.value = activeTab.value === 'all' ? res.data.total : data.length;
        }
    }
    catch (error) {
        ElMessage.error('获取文章列表失败');
    }
    finally {
        loading.value = false;
    }
};
const handleTabChange = () => {
    currentPage.value = 1;
    fetchArticles();
};
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchArticles();
};
const viewArticle = (id) => {
    router.push(`/user-article/${id}`);
};
const withdrawArticle = async (id) => {
    try {
        await ElMessageBox.confirm('确定要撤回这篇文章吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await withdrawApi(id);
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchArticles();
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '撤回失败');
        }
    }
};
const deleteArticle = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await deleteApi(id);
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchArticles();
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '删除失败');
        }
    }
};
onMounted(() => {
    fetchArticles();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['article-item']} */ ;
/** @type {__VLS_StyleScopedClasses['article-item']} */ ;
/** @type {__VLS_StyleScopedClasses['article-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['stats']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-home-articles" },
});
/** @type {__VLS_StyleScopedClasses['my-home-articles']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/publish-article');
            // @ts-ignore
            [$router,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ tabChange: {} },
    { onTabChange: (__VLS_ctx.handleTabChange) });
const { default: __VLS_15 } = __VLS_11.slots;
let __VLS_16;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    label: "全部",
    name: "all",
}));
const __VLS_18 = __VLS_17({
    label: "全部",
    name: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    label: "待审核",
    name: "0",
}));
const __VLS_23 = __VLS_22({
    label: "待审核",
    name: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    label: "已发布",
    name: "1",
}));
const __VLS_28 = __VLS_27({
    label: "已发布",
    name: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    label: "已下架",
    name: "2",
}));
const __VLS_33 = __VLS_32({
    label: "已下架",
    name: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
// @ts-ignore
[activeTab, handleTabChange,];
var __VLS_11;
var __VLS_12;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "article-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.articles.length === 0) {
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        description: "暂无文章",
    }));
    const __VLS_38 = __VLS_37({
        description: "暂无文章",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
for (const [article] of __VLS_vFor((__VLS_ctx.articles))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (article.id),
        ...{ class: "article-item" },
    });
    /** @type {__VLS_StyleScopedClasses['article-item']} */ ;
    if (article.coverUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "article-cover" },
        });
        /** @type {__VLS_StyleScopedClasses['article-cover']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (article.coverUrl),
            alt: "封面",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-info" },
    });
    /** @type {__VLS_StyleScopedClasses['article-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-header" },
    });
    /** @type {__VLS_StyleScopedClasses['article-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "article-title" },
    });
    /** @type {__VLS_StyleScopedClasses['article-title']} */ ;
    (article.title);
    let __VLS_41;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        type: (__VLS_ctx.getStatusType(article.status)),
        size: "small",
    }));
    const __VLS_43 = __VLS_42({
        type: (__VLS_ctx.getStatusType(article.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    const { default: __VLS_46 } = __VLS_44.slots;
    (__VLS_ctx.getStatusText(article.status));
    // @ts-ignore
    [vLoading, loading, loading, articles, articles, getStatusType, getStatusText,];
    var __VLS_44;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['article-meta']} */ ;
    if (article.tagName) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "tag-name" },
        });
        /** @type {__VLS_StyleScopedClasses['tag-name']} */ ;
        (article.tagName);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "time" },
    });
    /** @type {__VLS_StyleScopedClasses['time']} */ ;
    (article.createTime);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stats" },
    });
    /** @type {__VLS_StyleScopedClasses['stats']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_47;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({}));
    const __VLS_49 = __VLS_48({}, ...__VLS_functionalComponentArgsRest(__VLS_48));
    const { default: __VLS_52 } = __VLS_50.slots;
    let __VLS_53;
    /** @ts-ignore @type {typeof __VLS_components.View} */
    View;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({}));
    const __VLS_55 = __VLS_54({}, ...__VLS_functionalComponentArgsRest(__VLS_54));
    // @ts-ignore
    [];
    var __VLS_50;
    (article.viewCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_58;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({}));
    const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
    const { default: __VLS_63 } = __VLS_61.slots;
    let __VLS_64;
    /** @ts-ignore @type {typeof __VLS_components.Pointer} */
    Pointer;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({}));
    const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
    // @ts-ignore
    [];
    var __VLS_61;
    (article.likeCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_69;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({}));
    const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
    const { default: __VLS_74 } = __VLS_72.slots;
    let __VLS_75;
    /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
    ChatDotRound;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({}));
    const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
    // @ts-ignore
    [];
    var __VLS_72;
    (article.commentCount || 0);
    if (article.rejectReason && article.status === 2) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "reject-reason" },
        });
        /** @type {__VLS_StyleScopedClasses['reject-reason']} */ ;
        let __VLS_80;
        /** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert | typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
        elAlert;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
            type: "warning",
            closable: (false),
        }));
        const __VLS_82 = __VLS_81({
            type: "warning",
            closable: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        const { default: __VLS_85 } = __VLS_83.slots;
        {
            const { title: __VLS_86 } = __VLS_83.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (article.rejectReason);
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_83;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['article-actions']} */ ;
    let __VLS_87;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_89 = __VLS_88({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    let __VLS_92;
    const __VLS_93 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewArticle(article.id);
                // @ts-ignore
                [viewArticle,];
            } });
    const { default: __VLS_94 } = __VLS_90.slots;
    // @ts-ignore
    [];
    var __VLS_90;
    var __VLS_91;
    if (article.status === 0) {
        let __VLS_95;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_97 = __VLS_96({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        let __VLS_100;
        const __VLS_101 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(article.status === 0))
                        return;
                    __VLS_ctx.withdrawArticle(article.id);
                    // @ts-ignore
                    [withdrawArticle,];
                } });
        const { default: __VLS_102 } = __VLS_98.slots;
        // @ts-ignore
        [];
        var __VLS_98;
        var __VLS_99;
    }
    if (article.status === 1) {
        let __VLS_103;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_105 = __VLS_104({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_104));
        let __VLS_108;
        const __VLS_109 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(article.status === 1))
                        return;
                    __VLS_ctx.deleteArticle(article.id);
                    // @ts-ignore
                    [deleteArticle,];
                } });
        const { default: __VLS_110 } = __VLS_106.slots;
        // @ts-ignore
        [];
        var __VLS_106;
        var __VLS_107;
    }
    // @ts-ignore
    [];
}
if (__VLS_ctx.total > 0) {
    let __VLS_111;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_113 = __VLS_112({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    let __VLS_116;
    const __VLS_117 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_114;
    var __VLS_115;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
