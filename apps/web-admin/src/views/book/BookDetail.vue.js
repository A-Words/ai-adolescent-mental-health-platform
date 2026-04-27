/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, View, ChatDotRound, Clock, Picture, Link, Edit } from '@element-plus/icons-vue';
import { getBookDetail, getBookComments } from '@/api/book';
import dayjs from 'dayjs';
const route = useRoute();
const router = useRouter();
const bookId = Number(route.params.id);
// 书籍详情
const book = ref({
    id: 0,
    title: '',
    coverUrl: '',
    description: '',
    address: '',
    viewCount: 0,
    commentCount: 0
});
// 评论相关
const comments = ref([]);
const commentPage = ref(1);
const commentSize = ref(10);
const totalComments = ref(0);
const showCommentDialog = ref(false);
const commentForm = ref({
    bookId: bookId,
    content: ''
});
const commentFormRef = ref();
const submitting = ref(false);
// 加载状态
const loading = ref(true);
// 用户登录状态
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isLoggedIn = computed(() => {
    return !!localStorage.getItem('token') && !!user.id;
});
// 表单验证规则
const commentRules = {
    content: [
        { required: true, message: '请输入评论内容', trigger: 'blur' },
        { min: 5, message: '评论内容至少5个字符', trigger: 'blur' },
        { max: 500, message: '评论内容不能超过500个字符', trigger: 'blur' }
    ]
};
// 工具函数
const formatCount = (count) => {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + 'w';
    }
    else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
};
const formatTime = (time) => {
    if (!time)
        return '';
    return dayjs(time).format('YYYY-MM-DD HH:mm');
};
// 获取书籍详情
const fetchBookDetail = async () => {
    loading.value = true;
    try {
        const res = await getBookDetail(bookId);
        if (res.code === 200) {
            book.value = res.data;
        }
        else {
            ElMessage.error(res.message || '获取书籍详情失败');
            router.push('/books');
        }
    }
    catch (error) {
        console.error('获取书籍详情失败:', error);
        ElMessage.error('获取书籍详情失败，请稍后重试');
        router.push('/books');
    }
    finally {
        loading.value = false;
    }
};
// 增加浏览数
const incrementViewCount = async () => {
    try {
        // 使用 get 方法模拟增加浏览数
        const response = await fetch(`http://localhost:8080/book/${bookId}/view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (data.code === 200) {
                console.log('浏览数增加成功');
            }
        }
    }
    catch (error) {
        console.error('增加浏览数失败:', error);
    }
};
// 获取评论列表
const fetchComments = async () => {
    try {
        const res = await getBookComments(bookId, {
            page: commentPage.value,
            size: commentSize.value
        });
        if (res.code === 200) {
            comments.value = res.data.records || [];
            totalComments.value = res.data.total || 0;
        }
        else {
            ElMessage.error(res.message || '获取评论失败');
        }
    }
    catch (error) {
        console.error('获取评论失败:', error);
        ElMessage.error('获取评论失败，请稍后重试');
    }
};
// 提交评论
const submitComment = async () => {
    if (!isLoggedIn.value) {
        ElMessage.warning('请先登录后再发表评论');
        router.push('/login');
        return;
    }
    if (!commentFormRef.value)
        return;
    await commentFormRef.value.validate(async (valid) => {
        if (!valid)
            return;
        submitting.value = true;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/book/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(commentForm.value)
            });
            if (response.ok) {
                const res = await response.json();
                if (res.code === 200) {
                    ElMessage.success('评论发表成功');
                    showCommentDialog.value = false;
                    commentForm.value.content = '';
                    // 刷新评论列表
                    commentPage.value = 1;
                    await fetchComments();
                    // 刷新书籍详情（更新评论数）
                    await fetchBookDetail();
                }
                else {
                    ElMessage.error(res.message || '评论发表失败');
                }
            }
            else {
                ElMessage.error('评论发表失败');
            }
        }
        catch (error) {
            console.error('提交评论失败:', error);
            ElMessage.error('评论发表失败，请稍后重试');
        }
        finally {
            submitting.value = false;
        }
    });
};
// 在线阅读处理
const handleReadOnline = async () => {
    if (!book.value.address) {
        ElMessage.warning('暂无在线阅读链接');
        return;
    }
    // 先增加浏览数
    try {
        await incrementViewCount();
    }
    catch (error) {
        console.error('增加浏览数失败:', error);
    }
    // 补全协议头，避免浏览器将地址当作相对路径拼接
    let fullUrl = book.value.address.trim();
    if (!/^https?:\/\//i.test(fullUrl)) {
        fullUrl = 'https://' + fullUrl;
    }
    window.open(fullUrl, '_blank');
};
// 返回上一页
const goBack = () => {
    router.back();
};
// 评论分页处理
const handleCommentSizeChange = (newSize) => {
    commentSize.value = newSize;
    commentPage.value = 1;
    fetchComments();
};
const handleCommentPageChange = (newPage) => {
    commentPage.value = newPage;
    fetchComments();
};
onMounted(async () => {
    // 先增加浏览数
    await incrementViewCount();
    // 获取书籍详情
    await fetchBookDetail();
    // 获取评论列表
    await fetchComments();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stars']} */ ;
/** @type {__VLS_StyleScopedClasses['stars2']} */ ;
/** @type {__VLS_StyleScopedClasses['stars3']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['book-main']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-section']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['book-description']} */ ;
/** @type {__VLS_StyleScopedClasses['book-description']} */ ;
/** @type {__VLS_StyleScopedClasses['read-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['read-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-item']} */ ;
/** @type {__VLS_StyleScopedClasses['no-comments']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['el-dialog__close']} */ ;
/** @type {__VLS_StyleScopedClasses['el-textarea__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
/** @type {__VLS_StyleScopedClasses['book-detail-page']} */ ;
/** @type {__VLS_StyleScopedClasses['book-header']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-section']} */ ;
/** @type {__VLS_StyleScopedClasses['book-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['book-title']} */ ;
/** @type {__VLS_StyleScopedClasses['book-description']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "book-detail-page" },
});
/** @type {__VLS_StyleScopedClasses['book-detail-page']} */ ;
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
if (!__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['book-detail-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "back-button" },
    });
    /** @type {__VLS_StyleScopedClasses['back-button']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
    elLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "info",
        underline: "never",
        ...{ class: "back-btn" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "info",
        underline: "never",
        ...{ class: "back-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (__VLS_ctx.goBack) });
    /** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
    const { default: __VLS_7 } = __VLS_3.slots;
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const { default: __VLS_13 } = __VLS_11.slots;
    let __VLS_14;
    /** @ts-ignore @type {typeof __VLS_components.ArrowLeft} */
    ArrowLeft;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
    const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
    // @ts-ignore
    [loading, goBack,];
    var __VLS_11;
    // @ts-ignore
    [];
    var __VLS_3;
    var __VLS_4;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-main glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['book-main']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-header" },
    });
    /** @type {__VLS_StyleScopedClasses['book-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "cover-section" },
    });
    /** @type {__VLS_StyleScopedClasses['cover-section']} */ ;
    let __VLS_19;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        src: (__VLS_ctx.book.coverUrl || '/default-book-cover.png'),
        alt: (__VLS_ctx.book.title),
        fit: "cover",
        ...{ class: "main-cover" },
        previewSrcList: ([]),
    }));
    const __VLS_21 = __VLS_20({
        src: (__VLS_ctx.book.coverUrl || '/default-book-cover.png'),
        alt: (__VLS_ctx.book.title),
        fit: "cover",
        ...{ class: "main-cover" },
        previewSrcList: ([]),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    /** @type {__VLS_StyleScopedClasses['main-cover']} */ ;
    const { default: __VLS_24 } = __VLS_22.slots;
    {
        const { error: __VLS_25 } = __VLS_22.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cover-error" },
        });
        /** @type {__VLS_StyleScopedClasses['cover-error']} */ ;
        let __VLS_26;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
        const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
        const { default: __VLS_31 } = __VLS_29.slots;
        let __VLS_32;
        /** @ts-ignore @type {typeof __VLS_components.Picture} */
        Picture;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
        // @ts-ignore
        [book, book,];
        var __VLS_29;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_22;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "info-section" },
    });
    /** @type {__VLS_StyleScopedClasses['info-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
        ...{ class: "book-title" },
    });
    /** @type {__VLS_StyleScopedClasses['book-title']} */ ;
    (__VLS_ctx.book.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['book-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "meta-item" },
    });
    /** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({}));
    const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const { default: __VLS_42 } = __VLS_40.slots;
    let __VLS_43;
    /** @ts-ignore @type {typeof __VLS_components.View} */
    View;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({}));
    const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
    // @ts-ignore
    [book,];
    var __VLS_40;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatCount(__VLS_ctx.book.viewCount || 0));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "meta-item" },
    });
    /** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
    let __VLS_48;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({}));
    const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const { default: __VLS_53 } = __VLS_51.slots;
    let __VLS_54;
    /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
    ChatDotRound;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    // @ts-ignore
    [book, formatCount,];
    var __VLS_51;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.formatCount(__VLS_ctx.book.commentCount || 0));
    if (__VLS_ctx.book.createTime) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "meta-item" },
        });
        /** @type {__VLS_StyleScopedClasses['meta-item']} */ ;
        let __VLS_59;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({}));
        const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
        const { default: __VLS_64 } = __VLS_62.slots;
        let __VLS_65;
        /** @ts-ignore @type {typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({}));
        const __VLS_67 = __VLS_66({}, ...__VLS_functionalComponentArgsRest(__VLS_66));
        // @ts-ignore
        [book, book, formatCount,];
        var __VLS_62;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatTime(__VLS_ctx.book.createTime));
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-description" },
    });
    /** @type {__VLS_StyleScopedClasses['book-description']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    (__VLS_ctx.book.description || '暂无简介');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "action-buttons" },
    });
    /** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
    if (__VLS_ctx.book.address) {
        let __VLS_70;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
            ...{ class: "read-btn" },
        }));
        const __VLS_72 = __VLS_71({
            ...{ 'onClick': {} },
            type: "primary",
            size: "large",
            ...{ class: "read-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_71));
        let __VLS_75;
        const __VLS_76 = ({ click: {} },
            { onClick: (__VLS_ctx.handleReadOnline) });
        /** @type {__VLS_StyleScopedClasses['read-btn']} */ ;
        const { default: __VLS_77 } = __VLS_73.slots;
        let __VLS_78;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({}));
        const __VLS_80 = __VLS_79({}, ...__VLS_functionalComponentArgsRest(__VLS_79));
        const { default: __VLS_83 } = __VLS_81.slots;
        let __VLS_84;
        /** @ts-ignore @type {typeof __VLS_components.Link} */
        Link;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({}));
        const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
        // @ts-ignore
        [book, book, book, formatTime, handleReadOnline,];
        var __VLS_81;
        // @ts-ignore
        [];
        var __VLS_73;
        var __VLS_74;
    }
    else {
        let __VLS_89;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
            type: "info",
            size: "large",
            disabled: true,
            ...{ class: "read-btn" },
        }));
        const __VLS_91 = __VLS_90({
            type: "info",
            size: "large",
            disabled: true,
            ...{ class: "read-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_90));
        /** @type {__VLS_StyleScopedClasses['read-btn']} */ ;
        const { default: __VLS_94 } = __VLS_92.slots;
        // @ts-ignore
        [];
        var __VLS_92;
    }
    let __VLS_95;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
        ...{ 'onClick': {} },
        type: "success",
        size: "large",
        disabled: (!__VLS_ctx.isLoggedIn),
        ...{ class: "comment-btn" },
    }));
    const __VLS_97 = __VLS_96({
        ...{ 'onClick': {} },
        type: "success",
        size: "large",
        disabled: (!__VLS_ctx.isLoggedIn),
        ...{ class: "comment-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    let __VLS_100;
    const __VLS_101 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.loading))
                    return;
                __VLS_ctx.showCommentDialog = true;
                // @ts-ignore
                [isLoggedIn, showCommentDialog,];
            } });
    /** @type {__VLS_StyleScopedClasses['comment-btn']} */ ;
    const { default: __VLS_102 } = __VLS_98.slots;
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({}));
    const __VLS_105 = __VLS_104({}, ...__VLS_functionalComponentArgsRest(__VLS_104));
    const { default: __VLS_108 } = __VLS_106.slots;
    let __VLS_109;
    /** @ts-ignore @type {typeof __VLS_components.Edit} */
    Edit;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({}));
    const __VLS_111 = __VLS_110({}, ...__VLS_functionalComponentArgsRest(__VLS_110));
    // @ts-ignore
    [];
    var __VLS_106;
    // @ts-ignore
    [];
    var __VLS_98;
    var __VLS_99;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "comments-section glass-card" },
    });
    /** @type {__VLS_StyleScopedClasses['comments-section']} */ ;
    /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    let __VLS_114;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({}));
    const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
    const { default: __VLS_119 } = __VLS_117.slots;
    let __VLS_120;
    /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
    ChatDotRound;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({}));
    const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
    // @ts-ignore
    [];
    var __VLS_117;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "comment-count" },
    });
    /** @type {__VLS_StyleScopedClasses['comment-count']} */ ;
    (__VLS_ctx.totalComments);
    if (__VLS_ctx.comments.length > 0) {
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
                ...{ class: "comment-header" },
            });
            /** @type {__VLS_StyleScopedClasses['comment-header']} */ ;
            let __VLS_125;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
                size: (40),
                src: (comment.userAvatar),
                ...{ class: "user-avatar" },
            }));
            const __VLS_127 = __VLS_126({
                size: (40),
                src: (comment.userAvatar),
                ...{ class: "user-avatar" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_126));
            /** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
            const { default: __VLS_130 } = __VLS_128.slots;
            (comment.userNickname?.charAt(0) || 'U');
            // @ts-ignore
            [totalComments, comments, comments,];
            var __VLS_128;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "user-info" },
            });
            /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "user-name" },
            });
            /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
            (comment.userNickname || '匿名用户');
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "comment-time" },
            });
            /** @type {__VLS_StyleScopedClasses['comment-time']} */ ;
            (__VLS_ctx.formatTime(comment.createTime));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "comment-content" },
            });
            /** @type {__VLS_StyleScopedClasses['comment-content']} */ ;
            (comment.content);
            // @ts-ignore
            [formatTime,];
        }
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "no-comments" },
        });
        /** @type {__VLS_StyleScopedClasses['no-comments']} */ ;
        let __VLS_131;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
            description: "暂无评论，快来发表第一条评论吧！",
        }));
        const __VLS_133 = __VLS_132({
            description: "暂无评论，快来发表第一条评论吧！",
        }, ...__VLS_functionalComponentArgsRest(__VLS_132));
        const { default: __VLS_136 } = __VLS_134.slots;
        let __VLS_137;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
            ...{ 'onClick': {} },
            type: "primary",
            disabled: (!__VLS_ctx.isLoggedIn),
        }));
        const __VLS_139 = __VLS_138({
            ...{ 'onClick': {} },
            type: "primary",
            disabled: (!__VLS_ctx.isLoggedIn),
        }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        let __VLS_142;
        const __VLS_143 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.comments.length > 0))
                        return;
                    __VLS_ctx.showCommentDialog = true;
                    // @ts-ignore
                    [isLoggedIn, showCommentDialog,];
                } });
        const { default: __VLS_144 } = __VLS_140.slots;
        // @ts-ignore
        [];
        var __VLS_140;
        var __VLS_141;
        // @ts-ignore
        [];
        var __VLS_134;
    }
    if (__VLS_ctx.totalComments > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "comment-pagination" },
        });
        /** @type {__VLS_StyleScopedClasses['comment-pagination']} */ ;
        let __VLS_145;
        /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
        elPagination;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
            ...{ 'onSizeChange': {} },
            ...{ 'onCurrentChange': {} },
            currentPage: (__VLS_ctx.commentPage),
            pageSize: (__VLS_ctx.commentSize),
            pageSizes: ([5, 10, 20]),
            total: (__VLS_ctx.totalComments),
            layout: "total, sizes, prev, pager, next",
        }));
        const __VLS_147 = __VLS_146({
            ...{ 'onSizeChange': {} },
            ...{ 'onCurrentChange': {} },
            currentPage: (__VLS_ctx.commentPage),
            pageSize: (__VLS_ctx.commentSize),
            pageSizes: ([5, 10, 20]),
            total: (__VLS_ctx.totalComments),
            layout: "total, sizes, prev, pager, next",
        }, ...__VLS_functionalComponentArgsRest(__VLS_146));
        let __VLS_150;
        const __VLS_151 = ({ sizeChange: {} },
            { onSizeChange: (__VLS_ctx.handleCommentSizeChange) });
        const __VLS_152 = ({ currentChange: {} },
            { onCurrentChange: (__VLS_ctx.handleCommentPageChange) });
        var __VLS_148;
        var __VLS_149;
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading" },
    });
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
    let __VLS_153;
    /** @ts-ignore @type {typeof __VLS_components.elSkeleton | typeof __VLS_components.ElSkeleton} */
    elSkeleton;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({
        rows: (8),
        animated: true,
    }));
    const __VLS_155 = __VLS_154({
        rows: (8),
        animated: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_154));
}
let __VLS_158;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({
    modelValue: (__VLS_ctx.showCommentDialog),
    title: "发表评论",
    width: "500px",
    closeOnClickModal: (false),
}));
const __VLS_160 = __VLS_159({
    modelValue: (__VLS_ctx.showCommentDialog),
    title: "发表评论",
    width: "500px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
const { default: __VLS_163 } = __VLS_161.slots;
let __VLS_164;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
    model: (__VLS_ctx.commentForm),
    rules: (__VLS_ctx.commentRules),
    ref: "commentFormRef",
}));
const __VLS_166 = __VLS_165({
    model: (__VLS_ctx.commentForm),
    rules: (__VLS_ctx.commentRules),
    ref: "commentFormRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
var __VLS_169 = {};
const { default: __VLS_171 } = __VLS_167.slots;
let __VLS_172;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent1(__VLS_172, new __VLS_172({
    label: "评论内容",
    prop: "content",
}));
const __VLS_174 = __VLS_173({
    label: "评论内容",
    prop: "content",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const { default: __VLS_177 } = __VLS_175.slots;
let __VLS_178;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_179 = __VLS_asFunctionalComponent1(__VLS_178, new __VLS_178({
    type: "textarea",
    modelValue: (__VLS_ctx.commentForm.content),
    rows: (4),
    placeholder: "请输入您的评论...",
    maxlength: "500",
    showWordLimit: true,
}));
const __VLS_180 = __VLS_179({
    type: "textarea",
    modelValue: (__VLS_ctx.commentForm.content),
    rows: (4),
    placeholder: "请输入您的评论...",
    maxlength: "500",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_179));
// @ts-ignore
[showCommentDialog, totalComments, totalComments, commentPage, commentSize, handleCommentSizeChange, handleCommentPageChange, commentForm, commentForm, commentRules,];
var __VLS_175;
// @ts-ignore
[];
var __VLS_167;
{
    const { footer: __VLS_183 } = __VLS_161.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_184;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent1(__VLS_184, new __VLS_184({
        ...{ 'onClick': {} },
    }));
    const __VLS_186 = __VLS_185({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    let __VLS_189;
    const __VLS_190 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.showCommentDialog = false;
                // @ts-ignore
                [showCommentDialog,];
            } });
    const { default: __VLS_191 } = __VLS_187.slots;
    // @ts-ignore
    [];
    var __VLS_187;
    var __VLS_188;
    let __VLS_192;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_194 = __VLS_193({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    let __VLS_197;
    const __VLS_198 = ({ click: {} },
        { onClick: (__VLS_ctx.submitComment) });
    const { default: __VLS_199 } = __VLS_195.slots;
    // @ts-ignore
    [submitting, submitComment,];
    var __VLS_195;
    var __VLS_196;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_161;
// @ts-ignore
var __VLS_170 = __VLS_169;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
