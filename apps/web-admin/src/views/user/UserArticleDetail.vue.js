/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Pointer, Bottom, Star, Share, ChatDotRound, Menu, CaretTop } from '@element-plus/icons-vue';
import { getUserArticleDetailByUser, interactUserArticle, getUserArticleComments, addUserArticleComment, likeUserArticleComment } from '@/api/userArticle';
import { followUser, unfollowUser } from '@/api/follow';
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const article = ref(null);
const showComments = ref(false);
const newComment = ref('');
const comments = ref([]);
const isFollowing = ref(false);
const showCatalog = ref(true);
const catalog = ref([]);
const interacting = ref(false);
const replyingTo = ref(null);
const replyContent = ref('');
// 推荐数据
const recommendedArticles = ref([]);
const recommendedCourses = ref([]);
const recommendedAssessments = ref([]);
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const user = currentUser;
const isOwn = computed(() => {
    return article.value?.userId === currentUser.id;
});
const fetchArticle = async () => {
    loading.value = true;
    try {
        const userIdStr = route.params.userId;
        const articleIdStr = route.params.articleId;
        if (!userIdStr || !articleIdStr) {
            ElMessage.error('缺少必要参数');
            return;
        }
        const userId = Number(userIdStr);
        const articleId = Number(articleIdStr);
        if (isNaN(userId) || isNaN(articleId)) {
            ElMessage.error('无效的参数格式');
            return;
        }
        const res = await getUserArticleDetailByUser(userId, articleId);
        if (res.code === 200) {
            article.value = res.data;
            generateCatalog(res.data.content || '');
            // 设置推荐数据
            if (res.data.recommendedArticles) {
                recommendedArticles.value = res.data.recommendedArticles;
            }
            if (res.data.recommendedCourses) {
                recommendedCourses.value = res.data.recommendedCourses;
            }
            if (res.data.recommendedAssessments) {
                recommendedAssessments.value = res.data.recommendedAssessments;
            }
        }
        else {
            ElMessage.error(res.message || '文章加载失败');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
};
const generateCatalog = (content) => {
    if (!content) {
        catalog.value = [];
        return;
    }
    const lines = content.split('\n');
    const titles = [];
    let inCodeBlock = false;
    lines.forEach((line) => {
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            return;
        }
        if (!inCodeBlock) {
            const match = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
            if (match) {
                const level = match[1]?.length ?? 0;
                const text = match[2]?.trim() ?? '';
                const id = text.toLowerCase()
                    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
                    .replace(/\s+/g, '-');
                titles.push({ id, text, level });
            }
        }
    });
    catalog.value = titles;
};
const scrollToAnchor = (id) => {
    let anchor = document.getElementById(id);
    if (!anchor) {
        const headers = document.querySelectorAll('.v-md-editor-preview h1, .v-md-editor-preview h2, .v-md-editor-preview h3, .v-md-editor-preview h4, .v-md-editor-preview h5, .v-md-editor-preview h6');
        for (const h of Array.from(headers)) {
            const headerText = h.textContent?.trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-');
            if (headerText === id) {
                anchor = h;
                break;
            }
        }
    }
    if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
const handleContentClick = () => {
    // 内容点击处理
};
const goBack = () => {
    router.back();
};
const goToAuthorHome = () => {
    if (article.value?.userId) {
        router.push(`/user-home/${article.value.userId}`);
    }
};
const handleFollow = async () => {
    if (!article.value?.userId)
        return;
    try {
        if (isFollowing.value) {
            await unfollowUser(article.value.userId);
            isFollowing.value = false;
            ElMessage.success('已取消关注');
        }
        else {
            await followUser(article.value.userId);
            isFollowing.value = true;
            ElMessage.success('关注成功');
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
const handleInteract = async (type) => {
    if (!article.value)
        return;
    if (interacting.value) {
        ElMessage.warning('操作太频繁，请稍后再试');
        return;
    }
    interacting.value = true;
    try {
        const res = await interactUserArticle(article.value.id, type);
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchArticle();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
    finally {
        interacting.value = false;
    }
};
const handleLike = () => handleInteract(1);
const handleDislike = () => handleInteract(2);
const handleCollect = () => handleInteract(3);
const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        ElMessage.success('链接已复制到剪贴板');
    });
};
// 获取评论列表
const fetchComments = async () => {
    if (!article.value)
        return;
    try {
        const res = await getUserArticleComments(article.value.id);
        if (res.code === 200) {
            comments.value = res.data || [];
        }
    }
    catch (error) {
        console.error('获取评论失败', error);
    }
};
// 发表评论
const submitComment = async () => {
    if (!newComment.value.trim() || !article.value)
        return;
    if (interacting.value) {
        ElMessage.warning('操作太频繁，请稍后再试');
        return;
    }
    interacting.value = true;
    try {
        const res = await addUserArticleComment({
            articleId: article.value.id,
            content: newComment.value,
            parentId: 0
        });
        if (res.code === 200) {
            ElMessage.success('评论成功');
            newComment.value = '';
            fetchComments();
            fetchArticle();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '评论失败');
    }
    finally {
        interacting.value = false;
    }
};
// 评论点赞
const handleLikeComment = async (comment) => {
    if (interacting.value)
        return;
    interacting.value = true;
    try {
        const res = await likeUserArticleComment(comment.id);
        if (res.code === 200) {
            fetchComments();
        }
    }
    catch (error) {
        console.error('评论点赞失败', error);
    }
    finally {
        interacting.value = false;
    }
};
// 回复评论
const replyToComment = (comment) => {
    replyingTo.value = comment.id;
    replyContent.value = '';
};
// 提交回复
const submitReply = async (parentComment) => {
    if (!replyContent.value.trim() || !article.value)
        return;
    if (interacting.value) {
        ElMessage.warning('操作太频繁，请稍后再试');
        return;
    }
    interacting.value = true;
    try {
        const res = await addUserArticleComment({
            articleId: article.value.id,
            content: replyContent.value,
            parentId: parentComment.id,
            replyToUserId: parentComment.userId
        });
        if (res.code === 200) {
            ElMessage.success('回复成功');
            replyingTo.value = null;
            replyContent.value = '';
            fetchComments();
            fetchArticle();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '回复失败');
    }
    finally {
        interacting.value = false;
    }
};
// 格式化时间
const formatTime = (time) => {
    if (!time)
        return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days}天前`;
    if (hours > 0)
        return `${hours}小时前`;
    if (minutes > 0)
        return `${minutes}分钟前`;
    return '刚刚';
};
// 打开评论时获取评论列表
const openComments = () => {
    showComments.value = true;
    fetchComments();
};
const goToArticle = (item) => {
    if (item.userId) {
        router.push(`/user-article/${item.userId}/${item.id}`);
    }
    else {
        router.push(`/article/${item.id}`);
    }
};
const goToCourse = (item) => {
    router.push(`/course/${item.id}`);
};
const goToAssessment = (item) => {
    router.push(`/assessment/${item.id}`);
};
onMounted(() => {
    fetchArticle();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['back-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['back-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['el-link']} */ ;
/** @type {__VLS_StyleScopedClasses['article-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['article-content']} */ ;
/** @type {__VLS_StyleScopedClasses['github-markdown-body']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['fab-btn-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['fab-btn-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['fab-container']} */ ;
/** @type {__VLS_StyleScopedClasses['fab-container']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['fab-container']} */ ;
/** @type {__VLS_StyleScopedClasses['text']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
/** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-item']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['el-textarea__inner']} */ ;
if (__VLS_ctx.article) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-article-page-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['user-article-page-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "left-sidebar" },
        ...{ class: ({ 'collapsed': !__VLS_ctx.showCatalog }) },
    });
    /** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.article))
                    return;
                __VLS_ctx.showCatalog = !__VLS_ctx.showCatalog;
                // @ts-ignore
                [article, showCatalog, showCatalog, showCatalog,];
            } },
        ...{ class: "sidebar-toggle" },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar-toggle']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_5 } = __VLS_3.slots;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.Menu} */
    Menu;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    // @ts-ignore
    [];
    var __VLS_3;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "catalog-content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.showCatalog) }, null, null);
    /** @type {__VLS_StyleScopedClasses['catalog-content']} */ ;
    for (const [title] of __VLS_vFor((__VLS_ctx.catalog))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.article))
                        return;
                    __VLS_ctx.scrollToAnchor(title.id);
                    // @ts-ignore
                    [showCatalog, catalog, scrollToAnchor,];
                } },
            key: (title.id),
            ...{ class: (['catalog-item', `level-${title.level}`]) },
        });
        /** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
        (title.text);
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.catalog.length === 0) {
        let __VLS_11;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
            description: "无目录",
            imageSize: (40),
        }));
        const __VLS_13 = __VLS_12({
            description: "无目录",
            imageSize: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "main-content-container" },
    });
    /** @type {__VLS_StyleScopedClasses['main-content-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "back-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['back-bar']} */ ;
    let __VLS_16;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        link: true,
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_21;
    const __VLS_22 = ({ click: {} },
        { onClick: (__VLS_ctx.goBack) });
    const { default: __VLS_23 } = __VLS_19.slots;
    let __VLS_24;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const { default: __VLS_29 } = __VLS_27.slots;
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.ArrowLeft} */
    ArrowLeft;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
    const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
    // @ts-ignore
    [catalog, goBack,];
    var __VLS_27;
    // @ts-ignore
    [];
    var __VLS_19;
    var __VLS_20;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-card" },
    });
    /** @type {__VLS_StyleScopedClasses['article-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
    (__VLS_ctx.article.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.goToAuthorHome) },
        ...{ class: "author-info-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['author-info-bar']} */ ;
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        size: (48),
        src: (__VLS_ctx.article.userAvatar),
    }));
    const __VLS_37 = __VLS_36({
        size: (48),
        src: (__VLS_ctx.article.userAvatar),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    const { default: __VLS_40 } = __VLS_38.slots;
    {
        const { default: __VLS_41 } = __VLS_38.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [article, article, goToAuthorHome,];
    }
    // @ts-ignore
    [];
    var __VLS_38;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "author-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['author-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "author-top" },
    });
    /** @type {__VLS_StyleScopedClasses['author-top']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "author-nickname" },
    });
    /** @type {__VLS_StyleScopedClasses['author-nickname']} */ ;
    (__VLS_ctx.article.userNickname);
    if (!__VLS_ctx.isOwn) {
        let __VLS_42;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_44 = __VLS_43({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        let __VLS_47;
        const __VLS_48 = ({ click: {} },
            { onClick: (__VLS_ctx.handleFollow) });
        const { default: __VLS_49 } = __VLS_45.slots;
        (__VLS_ctx.isFollowing ? '已关注' : '关注');
        // @ts-ignore
        [article, isOwn, handleFollow, isFollowing,];
        var __VLS_45;
        var __VLS_46;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-meta-info" },
    });
    /** @type {__VLS_StyleScopedClasses['article-meta-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.article.createTime);
    if (__VLS_ctx.article.tagName) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "tag-name" },
        });
        /** @type {__VLS_StyleScopedClasses['tag-name']} */ ;
        (__VLS_ctx.article.tagName);
    }
    if (__VLS_ctx.article.coverUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cover-image" },
        });
        /** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.article.coverUrl),
            alt: "封面",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-content" },
    });
    /** @type {__VLS_StyleScopedClasses['article-content']} */ ;
    let __VLS_50;
    /** @ts-ignore @type {typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor | typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor} */
    vMdEditor;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        ...{ 'onClick': {} },
        modelValue: (__VLS_ctx.article.content || ''),
        mode: "preview",
    }));
    const __VLS_52 = __VLS_51({
        ...{ 'onClick': {} },
        modelValue: (__VLS_ctx.article.content || ''),
        mode: "preview",
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    let __VLS_55;
    const __VLS_56 = ({ click: {} },
        { onClick: (__VLS_ctx.handleContentClick) });
    var __VLS_53;
    var __VLS_54;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed-interaction-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed-interaction-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-content" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.handleLike) },
        ...{ class: "action-item" },
        ...{ class: ({ 'active': __VLS_ctx.article.liked }) },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
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
    [article, article, article, article, article, article, article, handleContentClick, handleLike,];
    var __VLS_60;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.article.likeCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.handleDislike) },
        ...{ class: "action-item" },
        ...{ class: ({ 'active': __VLS_ctx.article.disliked }) },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    let __VLS_68;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
    const { default: __VLS_73 } = __VLS_71.slots;
    let __VLS_74;
    /** @ts-ignore @type {typeof __VLS_components.Bottom} */
    Bottom;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({}));
    const __VLS_76 = __VLS_75({}, ...__VLS_functionalComponentArgsRest(__VLS_75));
    // @ts-ignore
    [article, article, handleDislike,];
    var __VLS_71;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.article.dislikeCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.handleCollect) },
        ...{ class: "action-item" },
        ...{ class: ({ 'active': __VLS_ctx.article.collected }) },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    let __VLS_79;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({}));
    const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
    const { default: __VLS_84 } = __VLS_82.slots;
    let __VLS_85;
    /** @ts-ignore @type {typeof __VLS_components.Star} */
    Star;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({}));
    const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
    // @ts-ignore
    [article, article, handleCollect,];
    var __VLS_82;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.article.collectionCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.openComments) },
        ...{ class: "action-item" },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    let __VLS_90;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({}));
    const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const { default: __VLS_95 } = __VLS_93.slots;
    let __VLS_96;
    /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
    ChatDotRound;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({}));
    const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
    // @ts-ignore
    [article, openComments,];
    var __VLS_93;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.article.commentCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.copyLink) },
        ...{ class: "action-item" },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    let __VLS_101;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({}));
    const __VLS_103 = __VLS_102({}, ...__VLS_functionalComponentArgsRest(__VLS_102));
    const { default: __VLS_106 } = __VLS_104.slots;
    let __VLS_107;
    /** @ts-ignore @type {typeof __VLS_components.Share} */
    Share;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({}));
    const __VLS_109 = __VLS_108({}, ...__VLS_functionalComponentArgsRest(__VLS_108));
    // @ts-ignore
    [article, copyLink,];
    var __VLS_104;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "floating-btns" },
    });
    /** @type {__VLS_StyleScopedClasses['floating-btns']} */ ;
    let __VLS_112;
    /** @ts-ignore @type {typeof __VLS_components.elBacktop | typeof __VLS_components.ElBacktop | typeof __VLS_components.elBacktop | typeof __VLS_components.ElBacktop} */
    elBacktop;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
        right: (40),
        bottom: (160),
        target: ".el-main",
    }));
    const __VLS_114 = __VLS_113({
        right: (40),
        bottom: (160),
        target: ".el-main",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const { default: __VLS_117 } = __VLS_115.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fab-container" },
    });
    /** @type {__VLS_StyleScopedClasses['fab-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fab-btn-inner" },
    });
    /** @type {__VLS_StyleScopedClasses['fab-btn-inner']} */ ;
    let __VLS_118;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
        ...{ class: "icon" },
    }));
    const __VLS_120 = __VLS_119({
        ...{ class: "icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    /** @type {__VLS_StyleScopedClasses['icon']} */ ;
    const { default: __VLS_123 } = __VLS_121.slots;
    let __VLS_124;
    /** @ts-ignore @type {typeof __VLS_components.CaretTop} */
    CaretTop;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({}));
    const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
    // @ts-ignore
    [];
    var __VLS_121;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text" },
    });
    /** @type {__VLS_StyleScopedClasses['text']} */ ;
    // @ts-ignore
    [];
    var __VLS_115;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "right-sidebar" },
    });
    /** @type {__VLS_StyleScopedClasses['right-sidebar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sidebar-section" },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    for (const [item] of __VLS_vFor((__VLS_ctx.recommendedArticles))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.article))
                        return;
                    __VLS_ctx.goToArticle(item);
                    // @ts-ignore
                    [recommendedArticles, goToArticle,];
                } },
            key: (item.id),
            ...{ class: "recommend-item" },
        });
        /** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
        (item.title);
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.recommendedArticles.length === 0) {
        let __VLS_129;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
            description: "暂无推荐",
            imageSize: (40),
        }));
        const __VLS_131 = __VLS_130({
            description: "暂无推荐",
            imageSize: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sidebar-section" },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    for (const [item] of __VLS_vFor((__VLS_ctx.recommendedCourses))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.article))
                        return;
                    __VLS_ctx.goToCourse(item);
                    // @ts-ignore
                    [recommendedArticles, recommendedCourses, goToCourse,];
                } },
            key: (item.id),
            ...{ class: "recommend-item" },
        });
        /** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
        (item.title);
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.recommendedCourses.length === 0) {
        let __VLS_134;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
            description: "暂无课程",
            imageSize: (40),
        }));
        const __VLS_136 = __VLS_135({
            description: "暂无课程",
            imageSize: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sidebar-section" },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    for (const [item] of __VLS_vFor((__VLS_ctx.recommendedAssessments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.article))
                        return;
                    __VLS_ctx.goToAssessment(item);
                    // @ts-ignore
                    [recommendedCourses, recommendedAssessments, goToAssessment,];
                } },
            key: (item.id),
            ...{ class: "recommend-item" },
        });
        /** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
        (item.title);
        // @ts-ignore
        [];
    }
    if (__VLS_ctx.recommendedAssessments.length === 0) {
        let __VLS_139;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
            description: "暂无测评",
            imageSize: (40),
        }));
        const __VLS_141 = __VLS_140({
            description: "暂无测评",
            imageSize: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    }
    let __VLS_144;
    /** @ts-ignore @type {typeof __VLS_components.elDrawer | typeof __VLS_components.ElDrawer | typeof __VLS_components.elDrawer | typeof __VLS_components.ElDrawer} */
    elDrawer;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
        modelValue: (__VLS_ctx.showComments),
        title: "全部评论",
        size: "450px",
        direction: "rtl",
    }));
    const __VLS_146 = __VLS_145({
        modelValue: (__VLS_ctx.showComments),
        title: "全部评论",
        size: "450px",
        direction: "rtl",
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    const { default: __VLS_149 } = __VLS_147.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "comment-section" },
    });
    /** @type {__VLS_StyleScopedClasses['comment-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "comment-input-box" },
    });
    /** @type {__VLS_StyleScopedClasses['comment-input-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-with-avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['input-with-avatar']} */ ;
    let __VLS_150;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
        size: (32),
        src: (__VLS_ctx.user.headPath),
    }));
    const __VLS_152 = __VLS_151({
        size: (32),
        src: (__VLS_ctx.user.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    let __VLS_155;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
        modelValue: (__VLS_ctx.newComment),
        type: "textarea",
        rows: (3),
        placeholder: "欢迎发表评论...",
        maxlength: "1000",
        showWordLimit: true,
    }));
    const __VLS_157 = __VLS_156({
        modelValue: (__VLS_ctx.newComment),
        type: "textarea",
        rows: (3),
        placeholder: "欢迎发表评论...",
        maxlength: "1000",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['input-footer']} */ ;
    let __VLS_160;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent1(__VLS_160, new __VLS_160({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_162 = __VLS_161({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    let __VLS_165;
    const __VLS_166 = ({ click: {} },
        { onClick: (__VLS_ctx.submitComment) });
    const { default: __VLS_167 } = __VLS_163.slots;
    // @ts-ignore
    [recommendedAssessments, showComments, user, newComment, submitComment,];
    var __VLS_163;
    var __VLS_164;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "comment-list" },
    });
    /** @type {__VLS_StyleScopedClasses['comment-list']} */ ;
    if (__VLS_ctx.comments.length === 0) {
        let __VLS_168;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
            description: "暂无评论",
            imageSize: (60),
        }));
        const __VLS_170 = __VLS_169({
            description: "暂无评论",
            imageSize: (60),
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    }
    for (const [comment] of __VLS_vFor((__VLS_ctx.comments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (comment.id),
            ...{ class: "comment-item" },
        });
        /** @type {__VLS_StyleScopedClasses['comment-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "comment-user" },
        });
        /** @type {__VLS_StyleScopedClasses['comment-user']} */ ;
        let __VLS_173;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
            size: (32),
            src: (comment.headPath),
        }));
        const __VLS_175 = __VLS_174({
            size: (32),
            src: (comment.headPath),
        }, ...__VLS_functionalComponentArgsRest(__VLS_174));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "user-info" },
        });
        /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "nickname" },
        });
        /** @type {__VLS_StyleScopedClasses['nickname']} */ ;
        (comment.nickname);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "time" },
        });
        /** @type {__VLS_StyleScopedClasses['time']} */ ;
        (__VLS_ctx.formatTime(comment.createTime));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "comment-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.article))
                        return;
                    __VLS_ctx.handleLikeComment(comment);
                    // @ts-ignore
                    [comments, comments, formatTime, handleLikeComment,];
                } },
            ...{ class: ({ 'liked': comment.isLiked }) },
        });
        /** @type {__VLS_StyleScopedClasses['liked']} */ ;
        let __VLS_178;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_179 = __VLS_asFunctionalComponent1(__VLS_178, new __VLS_178({}));
        const __VLS_180 = __VLS_179({}, ...__VLS_functionalComponentArgsRest(__VLS_179));
        const { default: __VLS_183 } = __VLS_181.slots;
        let __VLS_184;
        /** @ts-ignore @type {typeof __VLS_components.Pointer} */
        Pointer;
        // @ts-ignore
        const __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184({}));
        const __VLS_186 = __VLS_185({}, ...__VLS_functionalComponentArgsRest(__VLS_185));
        // @ts-ignore
        [];
        var __VLS_181;
        (comment.likeCount || 0);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.article))
                        return;
                    __VLS_ctx.replyToComment(comment);
                    // @ts-ignore
                    [replyToComment,];
                } },
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "comment-content" },
        });
        /** @type {__VLS_StyleScopedClasses['comment-content']} */ ;
        (comment.content);
        if (comment.replies && comment.replies.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "replies-list" },
            });
            /** @type {__VLS_StyleScopedClasses['replies-list']} */ ;
            for (const [reply] of __VLS_vFor((comment.replies))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    key: (reply.id),
                    ...{ class: "reply-item" },
                });
                /** @type {__VLS_StyleScopedClasses['reply-item']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "reply-header" },
                });
                /** @type {__VLS_StyleScopedClasses['reply-header']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "nickname" },
                });
                /** @type {__VLS_StyleScopedClasses['nickname']} */ ;
                (reply.nickname);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "reply-text" },
                });
                /** @type {__VLS_StyleScopedClasses['reply-text']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "nickname" },
                });
                /** @type {__VLS_StyleScopedClasses['nickname']} */ ;
                (reply.replyToNickname);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "time" },
                });
                /** @type {__VLS_StyleScopedClasses['time']} */ ;
                (__VLS_ctx.formatTime(reply.createTime));
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "reply-content" },
                });
                /** @type {__VLS_StyleScopedClasses['reply-content']} */ ;
                (reply.content);
                // @ts-ignore
                [formatTime,];
            }
        }
        if (__VLS_ctx.replyingTo === comment.id) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "reply-input-box" },
            });
            /** @type {__VLS_StyleScopedClasses['reply-input-box']} */ ;
            let __VLS_189;
            /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
            elInput;
            // @ts-ignore
            const __VLS_190 = __VLS_asFunctionalComponent1(__VLS_189, new __VLS_189({
                modelValue: (__VLS_ctx.replyContent),
                size: "small",
                placeholder: ('回复 @' + comment.nickname),
            }));
            const __VLS_191 = __VLS_190({
                modelValue: (__VLS_ctx.replyContent),
                size: "small",
                placeholder: ('回复 @' + comment.nickname),
            }, ...__VLS_functionalComponentArgsRest(__VLS_190));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "reply-buttons" },
            });
            /** @type {__VLS_StyleScopedClasses['reply-buttons']} */ ;
            let __VLS_194;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_195 = __VLS_asFunctionalComponent1(__VLS_194, new __VLS_194({
                ...{ 'onClick': {} },
                size: "small",
            }));
            const __VLS_196 = __VLS_195({
                ...{ 'onClick': {} },
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_195));
            let __VLS_199;
            const __VLS_200 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.article))
                            return;
                        if (!(__VLS_ctx.replyingTo === comment.id))
                            return;
                        __VLS_ctx.replyingTo = null;
                        __VLS_ctx.replyContent = '';
                        // @ts-ignore
                        [replyingTo, replyingTo, replyContent, replyContent,];
                    } });
            const { default: __VLS_201 } = __VLS_197.slots;
            // @ts-ignore
            [];
            var __VLS_197;
            var __VLS_198;
            let __VLS_202;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_204 = __VLS_203({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_203));
            let __VLS_207;
            const __VLS_208 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.article))
                            return;
                        if (!(__VLS_ctx.replyingTo === comment.id))
                            return;
                        __VLS_ctx.submitReply(comment);
                        // @ts-ignore
                        [submitReply,];
                    } });
            const { default: __VLS_209 } = __VLS_205.slots;
            // @ts-ignore
            [];
            var __VLS_205;
            var __VLS_206;
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_147;
}
else if (__VLS_ctx.loading) {
    let __VLS_210;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
        description: "加载中...",
    }));
    const __VLS_212 = __VLS_211({
        description: "加载中...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_211));
    var __VLS_215 = {};
    var __VLS_213;
}
else {
    let __VLS_216;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
        description: "文章不存在或已被下架",
    }));
    const __VLS_218 = __VLS_217({
        description: "文章不存在或已被下架",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    var __VLS_221 = {};
    var __VLS_219;
}
// @ts-ignore
[loading,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
