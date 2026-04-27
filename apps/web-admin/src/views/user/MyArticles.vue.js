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
/** @type {__VLS_StyleScopedClasses['article-item']} */ ;
/** @type {__VLS_StyleScopedClasses['article-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['stats']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-articles-container" },
});
/** @type {__VLS_StyleScopedClasses['my-articles-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { header: __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_7;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.$router.push('/publish-article');
                // @ts-ignore
                [$router,];
            } });
    const { default: __VLS_14 } = __VLS_10.slots;
    // @ts-ignore
    [];
    var __VLS_10;
    var __VLS_11;
    // @ts-ignore
    [];
}
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_17 = __VLS_16({
    ...{ 'onTabChange': {} },
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
const __VLS_21 = ({ tabChange: {} },
    { onTabChange: (__VLS_ctx.handleTabChange) });
const { default: __VLS_22 } = __VLS_18.slots;
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    label: "全部",
    name: "all",
}));
const __VLS_25 = __VLS_24({
    label: "全部",
    name: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    label: "待审核",
    name: "0",
}));
const __VLS_30 = __VLS_29({
    label: "待审核",
    name: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    label: "已发布",
    name: "1",
}));
const __VLS_35 = __VLS_34({
    label: "已发布",
    name: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    label: "已下架",
    name: "2",
}));
const __VLS_40 = __VLS_39({
    label: "已下架",
    name: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
// @ts-ignore
[activeTab, handleTabChange,];
var __VLS_18;
var __VLS_19;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "article-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.articles.length === 0) {
    let __VLS_43;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        description: "暂无文章",
    }));
    const __VLS_45 = __VLS_44({
        description: "暂无文章",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
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
    let __VLS_48;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        type: (__VLS_ctx.getStatusType(article.status)),
        size: "small",
    }));
    const __VLS_50 = __VLS_49({
        type: (__VLS_ctx.getStatusType(article.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const { default: __VLS_53 } = __VLS_51.slots;
    (__VLS_ctx.getStatusText(article.status));
    // @ts-ignore
    [vLoading, loading, loading, articles, articles, getStatusType, getStatusText,];
    var __VLS_51;
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
    let __VLS_54;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    const { default: __VLS_59 } = __VLS_57.slots;
    let __VLS_60;
    /** @ts-ignore @type {typeof __VLS_components.View} */
    View;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    // @ts-ignore
    [];
    var __VLS_57;
    (article.viewCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_65;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({}));
    const __VLS_67 = __VLS_66({}, ...__VLS_functionalComponentArgsRest(__VLS_66));
    const { default: __VLS_70 } = __VLS_68.slots;
    let __VLS_71;
    /** @ts-ignore @type {typeof __VLS_components.Pointer} */
    Pointer;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({}));
    const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
    // @ts-ignore
    [];
    var __VLS_68;
    (article.likeCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
    const { default: __VLS_81 } = __VLS_79.slots;
    let __VLS_82;
    /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
    ChatDotRound;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({}));
    const __VLS_84 = __VLS_83({}, ...__VLS_functionalComponentArgsRest(__VLS_83));
    // @ts-ignore
    [];
    var __VLS_79;
    (article.commentCount || 0);
    if (article.rejectReason && article.status === 2) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "reject-reason" },
        });
        /** @type {__VLS_StyleScopedClasses['reject-reason']} */ ;
        let __VLS_87;
        /** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert | typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
        elAlert;
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
            type: "warning",
            closable: (false),
        }));
        const __VLS_89 = __VLS_88({
            type: "warning",
            closable: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_88));
        const { default: __VLS_92 } = __VLS_90.slots;
        {
            const { title: __VLS_93 } = __VLS_90.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (article.rejectReason);
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_90;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['article-actions']} */ ;
    let __VLS_94;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_96 = __VLS_95({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    let __VLS_99;
    const __VLS_100 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewArticle(article.id);
                // @ts-ignore
                [viewArticle,];
            } });
    const { default: __VLS_101 } = __VLS_97.slots;
    // @ts-ignore
    [];
    var __VLS_97;
    var __VLS_98;
    if (article.status === 0) {
        let __VLS_102;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_104 = __VLS_103({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        let __VLS_107;
        const __VLS_108 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(article.status === 0))
                        return;
                    __VLS_ctx.withdrawArticle(article.id);
                    // @ts-ignore
                    [withdrawArticle,];
                } });
        const { default: __VLS_109 } = __VLS_105.slots;
        // @ts-ignore
        [];
        var __VLS_105;
        var __VLS_106;
    }
    if (article.status === 1) {
        let __VLS_110;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_112 = __VLS_111({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_111));
        let __VLS_115;
        const __VLS_116 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(article.status === 1))
                        return;
                    __VLS_ctx.deleteArticle(article.id);
                    // @ts-ignore
                    [deleteArticle,];
                } });
        const { default: __VLS_117 } = __VLS_113.slots;
        // @ts-ignore
        [];
        var __VLS_113;
        var __VLS_114;
    }
    // @ts-ignore
    [];
}
if (__VLS_ctx.total > 0) {
    let __VLS_118;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_120 = __VLS_119({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    let __VLS_123;
    const __VLS_124 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_121;
    var __VLS_122;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
