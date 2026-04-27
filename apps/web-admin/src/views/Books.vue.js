/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, View, ChatDotRound } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getBookList, addBookView, submitBookComment, getBookComments } from '@/api/book';
const router = useRouter();
// 用户登录状态
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isLoggedIn = computed(() => {
    return !!localStorage.getItem('token') && !!user.id;
});
// 书籍列表相关
const books = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
// 评论相关
const commentDialogVisible = ref(false);
const currentBook = ref(null);
const comments = ref([]);
const newComment = ref('');
const submittingComment = ref(false);
const commentPage = ref(1);
const commentPageSize = ref(10);
const commentTotal = ref(0);
// 加载书籍列表
const loadBooks = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value,
            keyword: searchKeyword.value.trim()
        };
        const res = await getBookList(params);
        if (res.code === 200) {
            books.value = res.data.records;
            total.value = res.data.total;
        }
        else {
            ElMessage.error(res.message || '加载失败');
        }
    }
    catch (error) {
        console.error('加载书籍列表失败:', error);
        ElMessage.error('网络错误，请稍后重试');
    }
    finally {
        loading.value = false;
    }
};
// 处理书籍点击（跳转并增加浏览数）
const handleBookClick = async (book) => {
    if (!book.address) {
        ElMessage.warning('该书籍暂无链接');
        return;
    }
    try {
        // 先调用增加浏览数接口
        await addBookView(book.id);
        // 然后跳转到外部链接
        window.open(book.address, '_blank');
        // 更新本地浏览数（可选）
        const index = books.value.findIndex(b => b.id === book.id);
        if (index !== -1) {
            books.value[index].viewCount = (books.value[index].viewCount || 0) + 1;
        }
    }
    catch (error) {
        console.error('增加浏览数失败:', error);
        // 即使接口失败也允许跳转
        window.open(book.address, '_blank');
    }
};
// 显示评论弹窗
const showComments = async (book) => {
    currentBook.value = book;
    commentDialogVisible.value = true;
    commentPage.value = 1;
    await loadComments();
};
// 加载评论
const loadComments = async () => {
    if (!currentBook.value)
        return;
    try {
        const params = {
            page: commentPage.value,
            size: commentPageSize.value
        };
        const res = await getBookComments(currentBook.value.id, params);
        if (res.code === 200) {
            comments.value = res.data.records;
            commentTotal.value = res.data.total;
        }
    }
    catch (error) {
        console.error('加载评论失败:', error);
        ElMessage.error('加载评论失败');
    }
};
// 提交评论
const submitComment = async () => {
    if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容');
        return;
    }
    if (!currentBook.value)
        return;
    submittingComment.value = true;
    try {
        const params = {
            bookId: currentBook.value.id,
            content: newComment.value.trim()
        };
        const res = await submitBookComment(params);
        if (res.code === 200) {
            ElMessage.success('评论成功');
            newComment.value = '';
            // 刷新评论列表
            commentPage.value = 1;
            await loadComments();
            // 更新书籍的评论数
            const index = books.value.findIndex(b => b.id === currentBook.value.id);
            if (index !== -1) {
                books.value[index].commentCount = (books.value[index].commentCount || 0) + 1;
            }
        }
        else {
            ElMessage.error(res.message || '评论失败');
        }
    }
    catch (error) {
        console.error('提交评论失败:', error);
        ElMessage.error('网络错误，请稍后重试');
    }
    finally {
        submittingComment.value = false;
    }
};
// 工具函数
const truncateDescription = (text, length = 80) => {
    if (!text)
        return '暂无简介';
    return text.length > length ? text.substring(0, length) + '...' : text;
};
const formatTime = (time) => {
    if (!time)
        return '';
    return new Date(time).toLocaleDateString();
};
const handleImageError = (e) => {
    const img = e.target;
    img.src = '/image/default-book-cover.jpg';
};
const clearSearch = () => {
    searchKeyword.value = '';
    loadBooks();
};
const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
    loadBooks();
};
const handleCurrentChange = (page) => {
    currentPage.value = page;
    loadBooks();
};
const goLogin = () => {
    router.push('/login');
};
onMounted(() => {
    loadBooks();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input-group__append']} */ ;
/** @type {__VLS_StyleScopedClasses['book-card']} */ ;
/** @type {__VLS_StyleScopedClasses['book-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "books-container" },
});
/** @type {__VLS_StyleScopedClasses['books-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "books-header" },
});
/** @type {__VLS_StyleScopedClasses['books-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "page-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-box" },
});
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onKeyup': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索书籍名称...",
    clearable: true,
    prefixIcon: (__VLS_ctx.Search),
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索书籍名称...",
    clearable: true,
    prefixIcon: (__VLS_ctx.Search),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.loadBooks) });
const __VLS_7 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearSearch) });
const { default: __VLS_8 } = __VLS_3.slots;
{
    const { append: __VLS_9 } = __VLS_3.slots;
    let __VLS_10;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Search),
    }));
    const __VLS_12 = __VLS_11({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Search),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    let __VLS_15;
    const __VLS_16 = ({ click: {} },
        { onClick: (__VLS_ctx.loadBooks) });
    var __VLS_13;
    var __VLS_14;
    // @ts-ignore
    [searchKeyword, Search, Search, loadBooks, loadBooks, clearSearch,];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "books-list" },
});
/** @type {__VLS_StyleScopedClasses['books-list']} */ ;
let __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
    gutter: (20),
}));
const __VLS_19 = __VLS_18({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const { default: __VLS_22 } = __VLS_20.slots;
for (const [book] of __VLS_vFor((__VLS_ctx.books))) {
    let __VLS_23;
    /** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
    elCol;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        key: (book.id),
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        ...{ class: "book-col" },
    }));
    const __VLS_25 = __VLS_24({
        key: (book.id),
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
        ...{ class: "book-col" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    /** @type {__VLS_StyleScopedClasses['book-col']} */ ;
    const { default: __VLS_28 } = __VLS_26.slots;
    let __VLS_29;
    /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
    elCard;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
        ...{ 'onClick': {} },
        ...{ class: "book-card" },
        shadow: "hover",
    }));
    const __VLS_31 = __VLS_30({
        ...{ 'onClick': {} },
        ...{ class: "book-card" },
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    let __VLS_34;
    const __VLS_35 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleBookClick(book);
                // @ts-ignore
                [books, handleBookClick,];
            } });
    /** @type {__VLS_StyleScopedClasses['book-card']} */ ;
    const { default: __VLS_36 } = __VLS_32.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-cover" },
    });
    /** @type {__VLS_StyleScopedClasses['book-cover']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        ...{ onError: (__VLS_ctx.handleImageError) },
        src: (book.coverUrl || '/image/default-book-cover.jpg'),
        alt: (book.title),
        ...{ class: "cover-image" },
    });
    /** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-stats" },
    });
    /** @type {__VLS_StyleScopedClasses['book-stats']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
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
    [handleImageError,];
    var __VLS_40;
    (book.viewCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "stat-item" },
    });
    /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
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
    [];
    var __VLS_51;
    (book.commentCount || 0);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-info" },
    });
    /** @type {__VLS_StyleScopedClasses['book-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "book-title" },
    });
    /** @type {__VLS_StyleScopedClasses['book-title']} */ ;
    (book.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "book-description" },
    });
    /** @type {__VLS_StyleScopedClasses['book-description']} */ ;
    (__VLS_ctx.truncateDescription(book.description));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['book-actions']} */ ;
    let __VLS_59;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        ...{ class: "read-btn" },
    }));
    const __VLS_61 = __VLS_60({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        ...{ class: "read-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    let __VLS_64;
    const __VLS_65 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleBookClick(book);
                // @ts-ignore
                [handleBookClick, truncateDescription,];
            } });
    /** @type {__VLS_StyleScopedClasses['read-btn']} */ ;
    const { default: __VLS_66 } = __VLS_62.slots;
    // @ts-ignore
    [];
    var __VLS_62;
    var __VLS_63;
    let __VLS_67;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        ...{ class: "comment-btn" },
    }));
    const __VLS_69 = __VLS_68({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        ...{ class: "comment-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_72;
    const __VLS_73 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.showComments(book);
                // @ts-ignore
                [showComments,];
            } });
    /** @type {__VLS_StyleScopedClasses['comment-btn']} */ ;
    const { default: __VLS_74 } = __VLS_70.slots;
    // @ts-ignore
    [];
    var __VLS_70;
    var __VLS_71;
    // @ts-ignore
    [];
    var __VLS_32;
    var __VLS_33;
    // @ts-ignore
    [];
    var __VLS_26;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_20;
if (__VLS_ctx.books.length === 0 && !__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    let __VLS_75;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
        description: "暂无书籍数据",
    }));
    const __VLS_77 = __VLS_76({
        description: "暂无书籍数据",
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
}
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination-container" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
    let __VLS_80;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        pageSizes: ([8, 12, 16, 20]),
        total: (__VLS_ctx.total),
        layout: "total, sizes, prev, pager, next, jumper",
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        pageSizes: ([8, 12, 16, 20]),
        total: (__VLS_ctx.total),
        layout: "total, sizes, prev, pager, next, jumper",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_85;
    const __VLS_86 = ({ sizeChange: {} },
        { onSizeChange: (__VLS_ctx.handleSizeChange) });
    const __VLS_87 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handleCurrentChange) });
    var __VLS_83;
    var __VLS_84;
}
let __VLS_88;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.commentDialogVisible),
    title: (`《${__VLS_ctx.currentBook?.title}》的评论`),
    width: "600px",
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.commentDialogVisible),
    title: (`《${__VLS_ctx.currentBook?.title}》的评论`),
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const { default: __VLS_93 } = __VLS_91.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "comment-dialog-content" },
});
/** @type {__VLS_StyleScopedClasses['comment-dialog-content']} */ ;
if (__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "comment-form" },
    });
    /** @type {__VLS_StyleScopedClasses['comment-form']} */ ;
    let __VLS_94;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
        modelValue: (__VLS_ctx.newComment),
        type: "textarea",
        rows: (3),
        placeholder: "写下您的评论...",
        maxlength: "500",
        showWordLimit: true,
    }));
    const __VLS_96 = __VLS_95({
        modelValue: (__VLS_ctx.newComment),
        type: "textarea",
        rows: (3),
        placeholder: "写下您的评论...",
        maxlength: "500",
        showWordLimit: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "form-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
    let __VLS_99;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submittingComment),
    }));
    const __VLS_101 = __VLS_100({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submittingComment),
    }, ...__VLS_functionalComponentArgsRest(__VLS_100));
    let __VLS_104;
    const __VLS_105 = ({ click: {} },
        { onClick: (__VLS_ctx.submitComment) });
    const { default: __VLS_106 } = __VLS_102.slots;
    // @ts-ignore
    [books, loading, total, total, currentPage, pageSize, handleSizeChange, handleCurrentChange, commentDialogVisible, currentBook, isLoggedIn, newComment, submittingComment, submitComment,];
    var __VLS_102;
    var __VLS_103;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "login-tip" },
    });
    /** @type {__VLS_StyleScopedClasses['login-tip']} */ ;
    let __VLS_107;
    /** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert | typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
    elAlert;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
        type: "info",
        showIcon: true,
    }));
    const __VLS_109 = __VLS_108({
        type: "info",
        showIcon: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    const { default: __VLS_112 } = __VLS_110.slots;
    {
        const { action: __VLS_113 } = __VLS_110.slots;
        let __VLS_114;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
        }));
        const __VLS_116 = __VLS_115({
            ...{ 'onClick': {} },
            type: "primary",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_115));
        let __VLS_119;
        const __VLS_120 = ({ click: {} },
            { onClick: (__VLS_ctx.goLogin) });
        const { default: __VLS_121 } = __VLS_117.slots;
        // @ts-ignore
        [goLogin,];
        var __VLS_117;
        var __VLS_118;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_110;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "comment-list" },
});
/** @type {__VLS_StyleScopedClasses['comment-list']} */ ;
if (__VLS_ctx.comments.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "no-comments" },
    });
    /** @type {__VLS_StyleScopedClasses['no-comments']} */ ;
    let __VLS_122;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
        description: "暂无评论",
    }));
    const __VLS_124 = __VLS_123({
        description: "暂无评论",
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
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
        let __VLS_127;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
            size: (32),
            src: (comment.userAvatar),
            ...{ class: "comment-avatar" },
        }));
        const __VLS_129 = __VLS_128({
            size: (32),
            src: (comment.userAvatar),
            ...{ class: "comment-avatar" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_128));
        /** @type {__VLS_StyleScopedClasses['comment-avatar']} */ ;
        const { default: __VLS_132 } = __VLS_130.slots;
        {
            const { default: __VLS_133 } = __VLS_130.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
            });
            // @ts-ignore
            [comments, comments,];
        }
        // @ts-ignore
        [];
        var __VLS_130;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "comment-user" },
        });
        /** @type {__VLS_StyleScopedClasses['comment-user']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "user-name" },
        });
        /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
        (comment.userNickname);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
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
    if (__VLS_ctx.commentTotal > 10) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "comment-pagination" },
        });
        /** @type {__VLS_StyleScopedClasses['comment-pagination']} */ ;
        let __VLS_134;
        /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
        elPagination;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
            ...{ 'onCurrentChange': {} },
            currentPage: (__VLS_ctx.commentPage),
            pageSize: (__VLS_ctx.commentPageSize),
            total: (__VLS_ctx.commentTotal),
            layout: "prev, pager, next",
            small: true,
        }));
        const __VLS_136 = __VLS_135({
            ...{ 'onCurrentChange': {} },
            currentPage: (__VLS_ctx.commentPage),
            pageSize: (__VLS_ctx.commentPageSize),
            total: (__VLS_ctx.commentTotal),
            layout: "prev, pager, next",
            small: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_135));
        let __VLS_139;
        const __VLS_140 = ({ currentChange: {} },
            { onCurrentChange: (__VLS_ctx.loadComments) });
        var __VLS_137;
        var __VLS_138;
    }
}
// @ts-ignore
[commentTotal, commentTotal, commentPage, commentPageSize, loadComments,];
var __VLS_91;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
