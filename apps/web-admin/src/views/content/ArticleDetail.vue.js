/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleDetail, interactArticle, getArticleComments, addArticleComment, likeArticleComment } from '@/api/content';
import { ElMessage } from 'element-plus';
import { ArrowLeft, View, Pointer, Star, Share, ChatDotRound, Bottom, Menu, CaretTop } from '@element-plus/icons-vue';
const route = useRoute();
const router = useRouter();
const detail = ref(null);
const comments = ref([]);
const catalog = ref([]);
const showCatalog = ref(true);
const showComments = ref(false);
const newComment = ref('');
const replyingId = ref(null);
const replyContent = ref('');
const showEmojiPicker = ref(false);
const interacting = ref(false);
const user = JSON.parse(localStorage.getItem('user') || '{}');
const emojis = ['😊', '😂', '😍', '🤔', '👍', '🔥', '❤️', '👏', '🙌', '😢', '😡', '😎'];
const fetchDetail = async () => {
    const id = Number(route.params.id);
    try {
        const res = await getArticleDetail(id);
        if (res.code === 200) {
            detail.value = res.data;
            generateCatalog(res.data.article.content);
            fetchComments();
        }
    }
    catch (error) {
        ElMessage.error('加载失败');
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
const fetchComments = async () => {
    if (!detail.value)
        return;
    try {
        const res = await getArticleComments(detail.value.article.id);
        if (res.code === 200) {
            comments.value = res.data;
        }
    }
    catch (error) { }
};
const goBack = () => {
    router.push('/articles');
};
const handleInteract = async (type) => {
    if (!detail.value)
        return;
    if (interacting.value) {
        ElMessage.warning('操作太频繁，请稍后再试');
        return;
    }
    interacting.value = true;
    const article = detail.value.article;
    try {
        const res = await interactArticle(article.id, type);
        if (res.code === 200) {
            ElMessage.success(res.data);
            if (type === 1) {
                if (detail.value.liked) {
                    article.like_count = Math.max(0, (article.like_count || 1) - 1);
                    detail.value.liked = false;
                }
                else {
                    article.like_count = (article.like_count || 0) + 1;
                    detail.value.liked = true;
                    if (detail.value.disliked) {
                        article.dislike_count = Math.max(0, (article.dislike_count || 1) - 1);
                        detail.value.disliked = false;
                    }
                }
            }
            else if (type === 2) {
                if (detail.value.disliked) {
                    article.dislike_count = Math.max(0, (article.dislike_count || 1) - 1);
                    detail.value.disliked = false;
                }
                else {
                    article.dislike_count = (article.dislike_count || 0) + 1;
                    detail.value.disliked = true;
                    if (detail.value.liked) {
                        article.like_count = Math.max(0, (article.like_count || 1) - 1);
                        detail.value.liked = false;
                    }
                }
            }
            else if (type === 3) {
                if (detail.value.collected) {
                    article.collection_count = Math.max(0, (article.collection_count || 1) - 1);
                    detail.value.collected = false;
                }
                else {
                    article.collection_count = (article.collection_count || 0) + 1;
                    detail.value.collected = true;
                }
            }
        }
    }
    catch (error) {
        ElMessage.error('操作失败');
    }
    finally {
        interacting.value = false;
    }
};
const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        ElMessage.success('链接已复制到剪贴板');
    });
};
const submitComment = async () => {
    if (!newComment.value.trim() || !detail.value)
        return;
    if (interacting.value) {
        ElMessage.warning('操作太频繁，请稍后再试');
        return;
    }
    interacting.value = true;
    try {
        const res = await addArticleComment({
            articleId: detail.value.article.id,
            content: newComment.value,
            parentId: 0
        });
        if (res.code === 200) {
            ElMessage.success('评论成功');
            newComment.value = '';
            fetchComments();
            detail.value.article.comment_count = (detail.value.article.comment_count || 0) + 1;
        }
    }
    catch (error) {
        ElMessage.error('评论失败');
    }
    finally {
        interacting.value = false;
    }
};
const handleLikeComment = async (comment) => {
    if (interacting.value)
        return;
    interacting.value = true;
    try {
        const res = await likeArticleComment(comment.id);
        if (res.code === 200) {
            fetchComments();
        }
    }
    catch (error) {
    }
    finally {
        interacting.value = false;
    }
};
const handleReply = (comment) => {
    replyingId.value = comment.id;
    replyContent.value = '';
};
const submitReply = async (parent) => {
    if (!replyContent.value.trim() || !detail.value)
        return;
    if (interacting.value) {
        ElMessage.warning('操作太频繁，请稍后再试');
        return;
    }
    interacting.value = true;
    try {
        const res = await addArticleComment({
            articleId: detail.value.article.id,
            content: replyContent.value,
            parentId: parent.id,
            replyToUserId: parent.userId
        });
        if (res.code === 200) {
            ElMessage.success('回复成功');
            replyingId.value = null;
            replyContent.value = '';
            fetchComments();
            detail.value.article.comment_count = (detail.value.article.comment_count || 0) + 1;
        }
    }
    catch (error) {
        ElMessage.error('回复失败');
    }
    finally {
        interacting.value = false;
    }
};
const toggleEmoji = () => {
    showEmojiPicker.value = !showEmojiPicker.value;
};
const addEmoji = (emoji) => {
    newComment.value += emoji;
    showEmojiPicker.value = false;
};
const goToArticle = (id) => {
    router.push(`/article/${id}`);
};
const goToCourse = (id) => {
    router.push(`/course/${id}`);
};
const goToAssessment = (id) => {
    router.push(`/assessment/${id}`);
};
watch(() => route.params.id, () => {
    fetchDetail();
});
onMounted(() => {
    fetchDetail();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['catalog-item']} */ ;
/** @type {__VLS_StyleScopedClasses['back-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['back-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['el-link']} */ ;
/** @type {__VLS_StyleScopedClasses['article-card']} */ ;
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
/** @type {__VLS_StyleScopedClasses['emoji-picker']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-item']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['el-textarea__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
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
if (__VLS_ctx.detail) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-page-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['article-page-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stars-background" },
    });
    /** @type {__VLS_StyleScopedClasses['stars-background']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stars" },
    });
    /** @type {__VLS_StyleScopedClasses['stars']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stars2" },
    });
    /** @type {__VLS_StyleScopedClasses['stars2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "stars3" },
    });
    /** @type {__VLS_StyleScopedClasses['stars3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "planet-1" },
    });
    /** @type {__VLS_StyleScopedClasses['planet-1']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "planet-2" },
    });
    /** @type {__VLS_StyleScopedClasses['planet-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "planet-3" },
    });
    /** @type {__VLS_StyleScopedClasses['planet-3']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "comet" },
    });
    /** @type {__VLS_StyleScopedClasses['comet']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "left-sidebar" },
        ...{ class: ({ 'collapsed': !__VLS_ctx.showCatalog }) },
    });
    /** @type {__VLS_StyleScopedClasses['left-sidebar']} */ ;
    /** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                __VLS_ctx.showCatalog = !__VLS_ctx.showCatalog;
                // @ts-ignore
                [detail, showCatalog, showCatalog, showCatalog,];
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
                    if (!(__VLS_ctx.detail))
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
    (__VLS_ctx.detail.article.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "author-info-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['author-info-bar']} */ ;
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        size: (48),
        src: (__VLS_ctx.detail.authorAvatar),
    }));
    const __VLS_37 = __VLS_36({
        size: (48),
        src: (__VLS_ctx.detail.authorAvatar),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    const { default: __VLS_40 } = __VLS_38.slots;
    {
        const { default: __VLS_41 } = __VLS_38.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [detail, detail,];
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
    (__VLS_ctx.detail.authorName);
    if (__VLS_ctx.detail.authorRole === 4) {
        let __VLS_42;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            size: "small",
            type: "danger",
            effect: "dark",
            ...{ class: "official-tag" },
        }));
        const __VLS_44 = __VLS_43({
            size: "small",
            type: "danger",
            effect: "dark",
            ...{ class: "official-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        /** @type {__VLS_StyleScopedClasses['official-tag']} */ ;
        const { default: __VLS_47 } = __VLS_45.slots;
        // @ts-ignore
        [detail, detail,];
        var __VLS_45;
    }
    else if (__VLS_ctx.detail.authorRole === 3 && __VLS_ctx.detail.hospitalName) {
        let __VLS_48;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
            size: "small",
            type: "success",
            effect: "plain",
            ...{ class: "hospital-tag" },
        }));
        const __VLS_50 = __VLS_49({
            size: "small",
            type: "success",
            effect: "plain",
            ...{ class: "hospital-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        /** @type {__VLS_StyleScopedClasses['hospital-tag']} */ ;
        const { default: __VLS_53 } = __VLS_51.slots;
        (__VLS_ctx.detail.hospitalName);
        // @ts-ignore
        [detail, detail, detail,];
        var __VLS_51;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-meta-info" },
    });
    /** @type {__VLS_StyleScopedClasses['article-meta-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.detail.article.createTime);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "type-tag" },
    });
    /** @type {__VLS_StyleScopedClasses['type-tag']} */ ;
    (__VLS_ctx.detail.article.type === 'SCIENCE' ? '科普' : '案例');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "view-stats" },
    });
    /** @type {__VLS_StyleScopedClasses['view-stats']} */ ;
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
    [detail, detail,];
    var __VLS_57;
    (__VLS_ctx.detail.article.view_count || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-content" },
    });
    /** @type {__VLS_StyleScopedClasses['article-content']} */ ;
    let __VLS_65;
    /** @ts-ignore @type {typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor | typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor} */
    vMdEditor;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
        modelValue: (__VLS_ctx.detail.article.content),
        mode: "preview",
    }));
    const __VLS_67 = __VLS_66({
        modelValue: (__VLS_ctx.detail.article.content),
        mode: "preview",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed-interaction-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed-interaction-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bar-content" },
    });
    /** @type {__VLS_StyleScopedClasses['bar-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                __VLS_ctx.handleInteract(1);
                // @ts-ignore
                [detail, detail, handleInteract,];
            } },
        ...{ class: "action-item" },
        ...{ class: ({ 'active': __VLS_ctx.detail.liked }) },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    let __VLS_70;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({}));
    const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
    const { default: __VLS_75 } = __VLS_73.slots;
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.Pointer} */
    Pointer;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
    // @ts-ignore
    [detail,];
    var __VLS_73;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.detail.article.like_count || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                __VLS_ctx.handleInteract(2);
                // @ts-ignore
                [detail, handleInteract,];
            } },
        ...{ class: "action-item" },
        ...{ class: ({ 'active': __VLS_ctx.detail.disliked }) },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    let __VLS_81;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({}));
    const __VLS_83 = __VLS_82({}, ...__VLS_functionalComponentArgsRest(__VLS_82));
    const { default: __VLS_86 } = __VLS_84.slots;
    let __VLS_87;
    /** @ts-ignore @type {typeof __VLS_components.Bottom} */
    Bottom;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({}));
    const __VLS_89 = __VLS_88({}, ...__VLS_functionalComponentArgsRest(__VLS_88));
    // @ts-ignore
    [detail,];
    var __VLS_84;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.detail.article.dislike_count || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                __VLS_ctx.handleInteract(3);
                // @ts-ignore
                [detail, handleInteract,];
            } },
        ...{ class: "action-item" },
        ...{ class: ({ 'active': __VLS_ctx.detail.collected }) },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    let __VLS_92;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({}));
    const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
    const { default: __VLS_97 } = __VLS_95.slots;
    let __VLS_98;
    /** @ts-ignore @type {typeof __VLS_components.Star} */
    Star;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({}));
    const __VLS_100 = __VLS_99({}, ...__VLS_functionalComponentArgsRest(__VLS_99));
    // @ts-ignore
    [detail,];
    var __VLS_95;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.detail.article.collection_count || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.detail))
                    return;
                __VLS_ctx.showComments = true;
                // @ts-ignore
                [detail, showComments,];
            } },
        ...{ class: "action-item" },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({}));
    const __VLS_105 = __VLS_104({}, ...__VLS_functionalComponentArgsRest(__VLS_104));
    const { default: __VLS_108 } = __VLS_106.slots;
    let __VLS_109;
    /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
    ChatDotRound;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({}));
    const __VLS_111 = __VLS_110({}, ...__VLS_functionalComponentArgsRest(__VLS_110));
    // @ts-ignore
    [];
    var __VLS_106;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.detail.article.comment_count || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.copyLink) },
        ...{ class: "action-item" },
    });
    /** @type {__VLS_StyleScopedClasses['action-item']} */ ;
    let __VLS_114;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({}));
    const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
    const { default: __VLS_119 } = __VLS_117.slots;
    let __VLS_120;
    /** @ts-ignore @type {typeof __VLS_components.Share} */
    Share;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({}));
    const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
    // @ts-ignore
    [detail, copyLink,];
    var __VLS_117;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "floating-btns" },
    });
    /** @type {__VLS_StyleScopedClasses['floating-btns']} */ ;
    let __VLS_125;
    /** @ts-ignore @type {typeof __VLS_components.elBacktop | typeof __VLS_components.ElBacktop | typeof __VLS_components.elBacktop | typeof __VLS_components.ElBacktop} */
    elBacktop;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
        right: (40),
        bottom: (160),
        target: ".el-main",
    }));
    const __VLS_127 = __VLS_126({
        right: (40),
        bottom: (160),
        target: ".el-main",
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    const { default: __VLS_130 } = __VLS_128.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fab-container" },
    });
    /** @type {__VLS_StyleScopedClasses['fab-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fab-btn-inner" },
    });
    /** @type {__VLS_StyleScopedClasses['fab-btn-inner']} */ ;
    let __VLS_131;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
        ...{ class: "icon" },
    }));
    const __VLS_133 = __VLS_132({
        ...{ class: "icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    /** @type {__VLS_StyleScopedClasses['icon']} */ ;
    const { default: __VLS_136 } = __VLS_134.slots;
    let __VLS_137;
    /** @ts-ignore @type {typeof __VLS_components.CaretTop} */
    CaretTop;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({}));
    const __VLS_139 = __VLS_138({}, ...__VLS_functionalComponentArgsRest(__VLS_138));
    // @ts-ignore
    [];
    var __VLS_134;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "text" },
    });
    /** @type {__VLS_StyleScopedClasses['text']} */ ;
    // @ts-ignore
    [];
    var __VLS_128;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "right-sidebar" },
    });
    /** @type {__VLS_StyleScopedClasses['right-sidebar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sidebar-section" },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    for (const [item] of __VLS_vFor((__VLS_ctx.detail.recommendedArticles))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.detail))
                        return;
                    __VLS_ctx.goToArticle(item.id);
                    // @ts-ignore
                    [detail, goToArticle,];
                } },
            key: (item.id),
            ...{ class: "recommend-item" },
        });
        /** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
        (item.title);
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.detail.recommendedArticles || __VLS_ctx.detail.recommendedArticles.length === 0) {
        let __VLS_142;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
            description: "暂无推荐",
            imageSize: (40),
        }));
        const __VLS_144 = __VLS_143({
            description: "暂无推荐",
            imageSize: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sidebar-section" },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    for (const [item] of __VLS_vFor((__VLS_ctx.detail.recommendedCourses))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.detail))
                        return;
                    __VLS_ctx.goToCourse(item.id);
                    // @ts-ignore
                    [detail, detail, detail, goToCourse,];
                } },
            key: (item.id),
            ...{ class: "recommend-item" },
        });
        /** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
        (item.title);
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.detail.recommendedCourses || __VLS_ctx.detail.recommendedCourses.length === 0) {
        let __VLS_147;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
            description: "暂无课程",
            imageSize: (40),
        }));
        const __VLS_149 = __VLS_148({
            description: "暂无课程",
            imageSize: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "sidebar-section" },
    });
    /** @type {__VLS_StyleScopedClasses['sidebar-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    for (const [item] of __VLS_vFor((__VLS_ctx.detail.recommendedAssessments))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.detail))
                        return;
                    __VLS_ctx.goToAssessment(item.id);
                    // @ts-ignore
                    [detail, detail, detail, goToAssessment,];
                } },
            key: (item.id),
            ...{ class: "recommend-item" },
        });
        /** @type {__VLS_StyleScopedClasses['recommend-item']} */ ;
        (item.title);
        // @ts-ignore
        [];
    }
    if (!__VLS_ctx.detail.recommendedAssessments || __VLS_ctx.detail.recommendedAssessments.length === 0) {
        let __VLS_152;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
            description: "暂无测评",
            imageSize: (40),
        }));
        const __VLS_154 = __VLS_153({
            description: "暂无测评",
            imageSize: (40),
        }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    }
    let __VLS_157;
    /** @ts-ignore @type {typeof __VLS_components.elDrawer | typeof __VLS_components.ElDrawer | typeof __VLS_components.elDrawer | typeof __VLS_components.ElDrawer} */
    elDrawer;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
        modelValue: (__VLS_ctx.showComments),
        title: "全部评论",
        size: "450px",
        direction: "rtl",
    }));
    const __VLS_159 = __VLS_158({
        modelValue: (__VLS_ctx.showComments),
        title: "全部评论",
        size: "450px",
        direction: "rtl",
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    const { default: __VLS_162 } = __VLS_160.slots;
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
    let __VLS_163;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
        size: (32),
        src: (__VLS_ctx.user.headPath),
    }));
    const __VLS_165 = __VLS_164({
        size: (32),
        src: (__VLS_ctx.user.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    let __VLS_168;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
        modelValue: (__VLS_ctx.newComment),
        type: "textarea",
        rows: (3),
        placeholder: "欢迎发表评论...",
        maxlength: "1000",
        showWordLimit: true,
    }));
    const __VLS_170 = __VLS_169({
        modelValue: (__VLS_ctx.newComment),
        type: "textarea",
        rows: (3),
        placeholder: "欢迎发表评论...",
        maxlength: "1000",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['input-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.toggleEmoji) },
        ...{ class: "emoji-trigger" },
    });
    /** @type {__VLS_StyleScopedClasses['emoji-trigger']} */ ;
    let __VLS_173;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_175 = __VLS_174({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    let __VLS_178;
    const __VLS_179 = ({ click: {} },
        { onClick: (__VLS_ctx.submitComment) });
    const { default: __VLS_180 } = __VLS_176.slots;
    // @ts-ignore
    [detail, detail, showComments, user, newComment, toggleEmoji, submitComment,];
    var __VLS_176;
    var __VLS_177;
    if (__VLS_ctx.showEmojiPicker) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "emoji-picker" },
        });
        /** @type {__VLS_StyleScopedClasses['emoji-picker']} */ ;
        for (const [e] of __VLS_vFor((__VLS_ctx.emojis))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.detail))
                            return;
                        if (!(__VLS_ctx.showEmojiPicker))
                            return;
                        __VLS_ctx.addEmoji(e);
                        // @ts-ignore
                        [showEmojiPicker, emojis, addEmoji,];
                    } },
                key: (e),
            });
            (e);
            // @ts-ignore
            [];
        }
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "comment-list" },
    });
    /** @type {__VLS_StyleScopedClasses['comment-list']} */ ;
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
        let __VLS_181;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
            size: (32),
            src: (comment.headPath),
        }));
        const __VLS_183 = __VLS_182({
            size: (32),
            src: (comment.headPath),
        }, ...__VLS_functionalComponentArgsRest(__VLS_182));
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
        (comment.createTime);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "comment-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.detail))
                        return;
                    __VLS_ctx.handleLikeComment(comment);
                    // @ts-ignore
                    [comments, handleLikeComment,];
                } },
            ...{ class: ({ 'liked': comment.liked }) },
        });
        /** @type {__VLS_StyleScopedClasses['liked']} */ ;
        let __VLS_186;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_187 = __VLS_asFunctionalComponent1(__VLS_186, new __VLS_186({}));
        const __VLS_188 = __VLS_187({}, ...__VLS_functionalComponentArgsRest(__VLS_187));
        const { default: __VLS_191 } = __VLS_189.slots;
        let __VLS_192;
        /** @ts-ignore @type {typeof __VLS_components.Pointer} */
        Pointer;
        // @ts-ignore
        const __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192({}));
        const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
        // @ts-ignore
        [];
        var __VLS_189;
        (comment.likeCount);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.detail))
                        return;
                    __VLS_ctx.handleReply(comment);
                    // @ts-ignore
                    [handleReply,];
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
                (reply.createTime);
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "reply-content" },
                });
                /** @type {__VLS_StyleScopedClasses['reply-content']} */ ;
                (reply.content);
                // @ts-ignore
                [];
            }
        }
        if (__VLS_ctx.replyingId === comment.id) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "reply-input-box" },
            });
            /** @type {__VLS_StyleScopedClasses['reply-input-box']} */ ;
            let __VLS_197;
            /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
            elInput;
            // @ts-ignore
            const __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197({
                modelValue: (__VLS_ctx.replyContent),
                size: "small",
                placeholder: ('回复 @' + comment.nickname),
            }));
            const __VLS_199 = __VLS_198({
                modelValue: (__VLS_ctx.replyContent),
                size: "small",
                placeholder: ('回复 @' + comment.nickname),
            }, ...__VLS_functionalComponentArgsRest(__VLS_198));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "reply-buttons" },
            });
            /** @type {__VLS_StyleScopedClasses['reply-buttons']} */ ;
            let __VLS_202;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
                ...{ 'onClick': {} },
                size: "small",
            }));
            const __VLS_204 = __VLS_203({
                ...{ 'onClick': {} },
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_203));
            let __VLS_207;
            const __VLS_208 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.detail))
                            return;
                        if (!(__VLS_ctx.replyingId === comment.id))
                            return;
                        __VLS_ctx.replyingId = null;
                        // @ts-ignore
                        [replyingId, replyingId, replyContent,];
                    } });
            const { default: __VLS_209 } = __VLS_205.slots;
            // @ts-ignore
            [];
            var __VLS_205;
            var __VLS_206;
            let __VLS_210;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_212 = __VLS_211({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_211));
            let __VLS_215;
            const __VLS_216 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(__VLS_ctx.detail))
                            return;
                        if (!(__VLS_ctx.replyingId === comment.id))
                            return;
                        __VLS_ctx.submitReply(comment);
                        // @ts-ignore
                        [submitReply,];
                    } });
            const { default: __VLS_217 } = __VLS_213.slots;
            // @ts-ignore
            [];
            var __VLS_213;
            var __VLS_214;
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_160;
}
else {
    let __VLS_218;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218({
        description: "加载中...",
    }));
    const __VLS_220 = __VLS_219({
        description: "加载中...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    var __VLS_223 = {};
    var __VLS_221;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
