/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getMyCollections } from '@/api/userHome';
import { interactArticle } from '@/api/content';
import { interactUserArticle } from '@/api/userArticle';
const router = useRouter();
const loading = ref(false);
const favorites = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const fetchFavorites = async () => {
    loading.value = true;
    try {
        const res = await getMyCollections({ page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            favorites.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        ElMessage.error('获取收藏列表失败');
    }
    finally {
        loading.value = false;
    }
};
const viewArticle = (item) => {
    // 根据来源决定跳转路径
    if (item.source === 'admin') {
        // 管理员文章（包括医生管理员和医院管理员发布的），跳转到 /article/{id}
        router.push(`/article/${item.articleId}`);
    }
    else {
        // 用户文章，跳转到 /user-article/{authorId}/{articleId}
        if (item.authorId) {
            router.push(`/user-article/${item.authorId}/${item.articleId}`);
        }
        else {
            ElMessage.error('无法访问该文章');
        }
    }
};
const cancelCollect = async (item) => {
    try {
        let res;
        if (item.source === 'admin') {
            // 管理员文章
            res = await interactArticle(item.articleId, 3);
        }
        else {
            // 用户文章
            res = await interactUserArticle(item.articleId, 3);
        }
        if (res.code === 200) {
            ElMessage.success('已取消收藏');
            fetchFavorites();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchFavorites();
};
onMounted(() => {
    fetchFavorites();
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-home-favorites" },
});
/** @type {__VLS_StyleScopedClasses['my-home-favorites']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "content-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['content-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.favorites.length === 0) {
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        description: "暂无收藏",
    }));
    const __VLS_2 = __VLS_1({
        description: "暂无收藏",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
for (const [item] of __VLS_vFor((__VLS_ctx.favorites))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.viewArticle(item);
                // @ts-ignore
                [vLoading, loading, loading, favorites, favorites, viewArticle,];
            } },
        key: (item.articleId),
        ...{ class: "article-item" },
    });
    /** @type {__VLS_StyleScopedClasses['article-item']} */ ;
    if (item.coverUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "article-cover" },
        });
        /** @type {__VLS_StyleScopedClasses['article-cover']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (item.coverUrl),
            alt: "封面",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-info" },
    });
    /** @type {__VLS_StyleScopedClasses['article-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-title" },
    });
    /** @type {__VLS_StyleScopedClasses['article-title']} */ ;
    (item.articleTitle);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['article-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "author" },
    });
    /** @type {__VLS_StyleScopedClasses['author']} */ ;
    (item.authorNickname);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "time" },
    });
    /** @type {__VLS_StyleScopedClasses['time']} */ ;
    (item.createTime);
    let __VLS_5;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.cancelCollect(item);
                // @ts-ignore
                [cancelCollect,];
            } });
    const { default: __VLS_12 } = __VLS_8.slots;
    // @ts-ignore
    [];
    var __VLS_8;
    var __VLS_9;
    // @ts-ignore
    [];
}
if (__VLS_ctx.total > 0) {
    let __VLS_13;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_18;
    const __VLS_19 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_16;
    var __VLS_17;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
