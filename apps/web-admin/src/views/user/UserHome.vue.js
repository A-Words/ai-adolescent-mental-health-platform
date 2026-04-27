/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { View, Pointer } from '@element-plus/icons-vue';
import { getUserHome, getUserArticles, getUserLikes } from '@/api/userHome';
import { followUser, unfollowUser } from '@/api/follow';
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const userInfo = ref(null);
const articles = ref([]);
const likes = ref([]);
const activeTab = ref('articles');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
const targetUserId = computed(() => Number(route.params.userId));
const isOwn = computed(() => currentUserId === targetUserId.value);
const canViewLikes = computed(() => {
    if (isOwn.value)
        return true;
    return userInfo.value?.privacy?.allowViewLikes !== false;
});
const canViewCollections = computed(() => {
    if (isOwn.value)
        return true;
    return userInfo.value?.privacy?.allowViewCollections !== false;
});
const canViewFollowings = computed(() => {
    if (isOwn.value)
        return true;
    return userInfo.value?.privacy?.allowViewFollowings !== false;
});
const canViewFans = computed(() => {
    if (isOwn.value)
        return true;
    return userInfo.value?.privacy?.allowViewFans !== false;
});
const fetchUserHome = async () => {
    try {
        const res = await getUserHome(targetUserId.value);
        if (res.code === 200) {
            userInfo.value = res.data;
        }
    }
    catch (error) {
        ElMessage.error('获取用户信息失败');
    }
};
const fetchArticles = async () => {
    loading.value = true;
    try {
        const res = await getUserArticles(targetUserId.value, { page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            articles.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        if (error.code !== 403) {
            ElMessage.error('获取文章列表失败');
        }
    }
    finally {
        loading.value = false;
    }
};
const fetchLikes = async () => {
    loading.value = true;
    try {
        const res = await getUserLikes(targetUserId.value, { page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            likes.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        if (error.code !== 403) {
            ElMessage.error('获取点赞列表失败');
        }
    }
    finally {
        loading.value = false;
    }
};
const handleFollow = async () => {
    try {
        const res = await followUser(targetUserId.value);
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchUserHome();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '关注失败');
    }
};
const handleUnfollow = async () => {
    try {
        const res = await unfollowUser(targetUserId.value);
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchUserHome();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '取消关注失败');
    }
};
const viewFollowings = () => {
    if (!canViewFollowings.value) {
        ElMessage.warning('该用户设置了隐私，不允许查看关注列表');
        return;
    }
    router.push({
        path: `/user-follow/${targetUserId.value}`,
        query: { nickname: userInfo.value?.nickname }
    });
};
const viewFollowers = () => {
    if (!canViewFans.value) {
        ElMessage.warning('该用户设置了隐私，不允许查看粉丝列表');
        return;
    }
    router.push({
        path: `/user-follow/${targetUserId.value}`,
        query: { tab: 'followers', nickname: userInfo.value?.nickname }
    });
};
const viewArticle = (id, userId, source) => {
    if (source === 'system') {
        router.push(`/article/${id}`);
    }
    else {
        router.push(`/user-article/${userId}/${id}`);
    }
};
const handlePageChange = async (page) => {
    currentPage.value = page;
    if (activeTab.value === 'articles') {
        await fetchArticles();
    }
    else if (activeTab.value === 'likes') {
        await fetchLikes();
    }
};
watch([() => route.params.userId, activeTab], () => {
    if (route.params.userId) {
        fetchUserHome();
        if (activeTab.value === 'articles') {
            fetchArticles();
        }
        else if (activeTab.value === 'likes') {
            fetchLikes();
        }
    }
}, { immediate: true });
onMounted(() => {
    fetchUserHome();
    fetchArticles();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['can-click']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['can-click']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-tabs__item']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['article-item']} */ ;
/** @type {__VLS_StyleScopedClasses['article-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['stats']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pager']} */ ;
/** @type {__VLS_StyleScopedClasses['is-active']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-home-container" },
});
/** @type {__VLS_StyleScopedClasses['user-home-container']} */ ;
if (__VLS_ctx.userInfo) {
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
    elCard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_5 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-header" },
    });
    /** @type {__VLS_StyleScopedClasses['user-header']} */ ;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        size: (80),
        src: (__VLS_ctx.userInfo.headPath),
    }));
    const __VLS_8 = __VLS_7({
        size: (80),
        src: (__VLS_ctx.userInfo.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const { default: __VLS_11 } = __VLS_9.slots;
    {
        const { default: __VLS_12 } = __VLS_9.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [userInfo, userInfo,];
    }
    // @ts-ignore
    [];
    var __VLS_9;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['user-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "nickname" },
    });
    /** @type {__VLS_StyleScopedClasses['nickname']} */ ;
    (__VLS_ctx.userInfo.nickname);
    if (__VLS_ctx.userInfo.signature) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "signature" },
        });
        /** @type {__VLS_StyleScopedClasses['signature']} */ ;
        (__VLS_ctx.userInfo.signature);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stats-row" },
    });
    /** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (__VLS_ctx.viewFollowings) },
        ...{ class: "stat-item" },
        ...{ class: ({ 'can-click': __VLS_ctx.canViewFollowings }) },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['can-click']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.userInfo.stats?.followCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (__VLS_ctx.viewFollowers) },
        ...{ class: "stat-item" },
        ...{ class: ({ 'can-click': __VLS_ctx.canViewFans }) },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['can-click']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.userInfo.stats?.fanCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.userInfo.stats?.articleCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.userInfo.stats?.likeCount || 0);
    if (!__VLS_ctx.isOwn) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['user-actions']} */ ;
        if (__VLS_ctx.userInfo.isFollowing) {
            let __VLS_13;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
                ...{ 'onClick': {} },
                type: "info",
            }));
            const __VLS_15 = __VLS_14({
                ...{ 'onClick': {} },
                type: "info",
            }, ...__VLS_functionalComponentArgsRest(__VLS_14));
            let __VLS_18;
            const __VLS_19 = ({ click: {} },
                { onClick: (__VLS_ctx.handleUnfollow) });
            const { default: __VLS_20 } = __VLS_16.slots;
            // @ts-ignore
            [userInfo, userInfo, userInfo, userInfo, userInfo, userInfo, userInfo, userInfo, viewFollowings, canViewFollowings, viewFollowers, canViewFans, isOwn, handleUnfollow,];
            var __VLS_16;
            var __VLS_17;
        }
        else {
            let __VLS_21;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
                ...{ 'onClick': {} },
                type: "primary",
            }));
            const __VLS_23 = __VLS_22({
                ...{ 'onClick': {} },
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_22));
            let __VLS_26;
            const __VLS_27 = ({ click: {} },
                { onClick: (__VLS_ctx.handleFollow) });
            const { default: __VLS_28 } = __VLS_24.slots;
            // @ts-ignore
            [handleFollow,];
            var __VLS_24;
            var __VLS_25;
        }
    }
    let __VLS_29;
    /** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
    elTabs;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        modelValue: (__VLS_ctx.activeTab),
        ...{ class: "content-tabs" },
    }));
    const __VLS_31 = __VLS_30({
        modelValue: (__VLS_ctx.activeTab),
        ...{ class: "content-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    /** @type {__VLS_StyleScopedClasses['content-tabs']} */ ;
    const { default: __VLS_34 } = __VLS_32.slots;
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        label: "文章",
        name: "articles",
    }));
    const __VLS_37 = __VLS_36({
        label: "文章",
        name: "articles",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    const { default: __VLS_40 } = __VLS_38.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "content-list" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
    /** @type {__VLS_StyleScopedClasses['content-list']} */ ;
    if (!__VLS_ctx.loading && __VLS_ctx.articles.length === 0) {
        let __VLS_41;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
            description: "暂无文章",
        }));
        const __VLS_43 = __VLS_42({
            description: "暂无文章",
        }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    }
    for (const [article] of __VLS_vFor((__VLS_ctx.articles))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.userInfo))
                        return;
                    __VLS_ctx.viewArticle(article.id, article.userId);
                    // @ts-ignore
                    [activeTab, vLoading, loading, loading, articles, articles, viewArticle,];
                } },
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
            ...{ class: "article-title" },
        });
        /** @type {__VLS_StyleScopedClasses['article-title']} */ ;
        (article.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "article-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['article-meta']} */ ;
        if (article.tagName) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "tag" },
            });
            /** @type {__VLS_StyleScopedClasses['tag']} */ ;
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
        let __VLS_46;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({}));
        const __VLS_48 = __VLS_47({}, ...__VLS_functionalComponentArgsRest(__VLS_47));
        const { default: __VLS_51 } = __VLS_49.slots;
        let __VLS_52;
        /** @ts-ignore @type {typeof __VLS_components.View} */
        View;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({}));
        const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
        // @ts-ignore
        [];
        var __VLS_49;
        (article.viewCount || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        let __VLS_57;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({}));
        const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
        const { default: __VLS_62 } = __VLS_60.slots;
        let __VLS_63;
        /** @ts-ignore @type {typeof __VLS_components.Pointer} */
        Pointer;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({}));
        const __VLS_65 = __VLS_64({}, ...__VLS_functionalComponentArgsRest(__VLS_64));
        // @ts-ignore
        [];
        var __VLS_60;
        (article.likeCount || 0);
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_38;
    if (__VLS_ctx.canViewLikes) {
        let __VLS_68;
        /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
        elTabPane;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
            label: "点赞",
            name: "likes",
        }));
        const __VLS_70 = __VLS_69({
            label: "点赞",
            name: "likes",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        const { default: __VLS_73 } = __VLS_71.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "content-list" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
        /** @type {__VLS_StyleScopedClasses['content-list']} */ ;
        if (!__VLS_ctx.loading && __VLS_ctx.likes.length === 0) {
            let __VLS_74;
            /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
            elEmpty;
            // @ts-ignore
            const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
                description: "暂无点赞",
            }));
            const __VLS_76 = __VLS_75({
                description: "暂无点赞",
            }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        }
        for (const [item] of __VLS_vFor((__VLS_ctx.likes))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.userInfo))
                            return;
                        if (!(__VLS_ctx.canViewLikes))
                            return;
                        __VLS_ctx.viewArticle(item.articleId, item.authorId || __VLS_ctx.targetUserId, item.source);
                        // @ts-ignore
                        [vLoading, loading, loading, viewArticle, canViewLikes, likes, likes, targetUserId,];
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
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_71;
    }
    if (__VLS_ctx.canViewCollections) {
        let __VLS_79;
        /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
        elTabPane;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            label: "收藏",
            name: "collections",
        }));
        const __VLS_81 = __VLS_80({
            label: "收藏",
            name: "collections",
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        const { default: __VLS_84 } = __VLS_82.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "content-list" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
        /** @type {__VLS_StyleScopedClasses['content-list']} */ ;
        let __VLS_85;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            description: "暂无收藏",
        }));
        const __VLS_87 = __VLS_86({
            description: "暂无收藏",
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        // @ts-ignore
        [vLoading, loading, canViewCollections,];
        var __VLS_82;
    }
    // @ts-ignore
    [];
    var __VLS_32;
    if (__VLS_ctx.total > 0) {
        let __VLS_90;
        /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
        elPagination;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            ...{ 'onCurrentChange': {} },
            ...{ class: "pagination" },
            currentPage: (__VLS_ctx.currentPage),
            pageSize: (__VLS_ctx.pageSize),
            total: (__VLS_ctx.total),
            layout: "prev, pager, next",
        }));
        const __VLS_92 = __VLS_91({
            ...{ 'onCurrentChange': {} },
            ...{ class: "pagination" },
            currentPage: (__VLS_ctx.currentPage),
            pageSize: (__VLS_ctx.pageSize),
            total: (__VLS_ctx.total),
            layout: "prev, pager, next",
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        let __VLS_95;
        const __VLS_96 = ({ currentChange: {} },
            { onCurrentChange: (__VLS_ctx.handlePageChange) });
        /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
        var __VLS_93;
        var __VLS_94;
    }
    // @ts-ignore
    [total, total, currentPage, pageSize, handlePageChange,];
    var __VLS_3;
}
else {
    let __VLS_97;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
        description: "加载中...",
    }));
    const __VLS_99 = __VLS_98({
        description: "加载中...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
