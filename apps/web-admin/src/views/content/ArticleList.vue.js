/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getArticles } from '@/api/content';
import { getArticleTags } from '@/api/articleTag';
import { getAllPublishedArticles } from '@/api/userArticle';
import { ElMessage } from 'element-plus';
const router = useRouter();
const articleList = ref([]);
const allArticles = ref([]);
const loading = ref(false);
const activeType = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const tagTypes = ref([]);
const fetchTags = async () => {
    try {
        const res = await getArticleTags();
        if (res.code === 200) {
            tagTypes.value = res.data.filter((tag) => tag.status === 1);
        }
    }
    catch (error) {
        console.error('获取标签失败', error);
    }
};
const fetchArticles = async () => {
    loading.value = true;
    try {
        const results = [];
        // 获取管理员发布的文章（后端已返回 tagName）
        const adminRes = await getArticles({ page: 1, size: 1000 });
        if (adminRes.code === 200) {
            adminRes.data.records.forEach((article) => {
                article._source = 'admin';
                article._detailUrl = `/article/${article.id}`;
                // tagName 已由后端设置
                results.push(article);
            });
        }
        // 获取用户发布的文章
        const userRes = await getAllPublishedArticles({ page: 1, size: 1000 });
        if (userRes.code === 200) {
            userRes.data.records.forEach((article) => {
                article._source = 'user';
                article._detailUrl = `/user-article/${article.userId}/${article.id}`;
                results.push(article);
            });
        }
        // 按时间排序
        results.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
        // 保存所有文章
        allArticles.value = results;
        // 应用筛选
        applyFilter();
    }
    catch (error) {
        ElMessage.error('加载失败');
    }
    finally {
        loading.value = false;
    }
};
const applyFilter = () => {
    let filtered = allArticles.value;
    // 根据标签筛选 - 统一使用 tagName 进行匹配
    if (activeType.value !== 'all') {
        filtered = filtered.filter(article => {
            // 管理员文章和用户文章都使用 tagName 进行筛选
            return article.tagName === activeType.value;
        });
    }
    // 分页
    total.value = filtered.length;
    const start = (currentPage.value - 1) * pageSize.value;
    articleList.value = filtered.slice(start, start + pageSize.value);
};
const handleTabClick = (tab) => {
    activeType.value = tab.props.name;
    currentPage.value = 1;
    applyFilter();
};
const handleCurrentChange = (page) => {
    currentPage.value = page;
    applyFilter();
};
const goToDetail = (item) => {
    router.push(item._detailUrl);
};
onMounted(() => {
    fetchTags();
    fetchArticles();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-card']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-link']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pager']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
/** @type {__VLS_StyleScopedClasses['title-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "article-list" },
});
/** @type {__VLS_StyleScopedClasses['article-list']} */ ;
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
    name: "all",
}));
const __VLS_10 = __VLS_9({
    label: "全部",
    name: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
for (const [tag] of __VLS_vFor((__VLS_ctx.tagTypes))) {
    let __VLS_13;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        key: (tag.code),
        label: (tag.name),
        name: (tag.name),
    }));
    const __VLS_15 = __VLS_14({
        key: (tag.code),
        label: (tag.name),
        name: (tag.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    // @ts-ignore
    [activeType, handleTabClick, tagTypes,];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
if (!__VLS_ctx.loading && __VLS_ctx.articleList.length === 0) {
    let __VLS_18;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        description: "暂无文章",
    }));
    const __VLS_20 = __VLS_19({
        description: "暂无文章",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
}
for (const [item] of __VLS_vFor((__VLS_ctx.articleList))) {
    let __VLS_23;
    /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
    elCard;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        ...{ 'onClick': {} },
        key: (item.id),
        ...{ class: "article-card" },
        shadow: "hover",
    }));
    const __VLS_25 = __VLS_24({
        ...{ 'onClick': {} },
        key: (item.id),
        ...{ class: "article-card" },
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    let __VLS_28;
    const __VLS_29 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.goToDetail(item);
                // @ts-ignore
                [vLoading, loading, loading, articleList, articleList, goToDetail,];
            } });
    /** @type {__VLS_StyleScopedClasses['article-card']} */ ;
    const { default: __VLS_30 } = __VLS_26.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-content" },
    });
    /** @type {__VLS_StyleScopedClasses['card-content']} */ ;
    if (item.coverUrl) {
        let __VLS_31;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
            src: (item.coverUrl),
            fit: "cover",
            ...{ class: "cover-image" },
        }));
        const __VLS_33 = __VLS_32({
            src: (item.coverUrl),
            fit: "cover",
            ...{ class: "cover-image" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        /** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info" },
    });
    /** @type {__VLS_StyleScopedClasses['info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "title-row" },
    });
    /** @type {__VLS_StyleScopedClasses['title-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (item.title);
    if (item.tagName) {
        let __VLS_36;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
            size: "small",
            type: "info",
        }));
        const __VLS_38 = __VLS_37({
            size: "small",
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        const { default: __VLS_41 } = __VLS_39.slots;
        (item.tagName);
        // @ts-ignore
        [];
        var __VLS_39;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "desc" },
    });
    /** @type {__VLS_StyleScopedClasses['desc']} */ ;
    ((item.content || '').substring(0, 100));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "date" },
    });
    /** @type {__VLS_StyleScopedClasses['date']} */ ;
    (item.createTime);
    // @ts-ignore
    [];
    var __VLS_26;
    var __VLS_27;
    // @ts-ignore
    [];
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
        currentPage: (__VLS_ctx.currentPage),
    }));
    const __VLS_44 = __VLS_43({
        ...{ 'onCurrentChange': {} },
        background: true,
        layout: "prev, pager, next",
        total: (__VLS_ctx.total),
        pageSize: (__VLS_ctx.pageSize),
        currentPage: (__VLS_ctx.currentPage),
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_47;
    const __VLS_48 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handleCurrentChange) });
    var __VLS_45;
    var __VLS_46;
}
// @ts-ignore
[total, total, pageSize, currentPage, handleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
