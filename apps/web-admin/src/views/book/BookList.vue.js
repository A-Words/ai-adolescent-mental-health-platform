/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search, View, ChatDotRound, Picture } from '@element-plus/icons-vue';
import { getBookList } from '@/api/book';
import { ElMessage } from 'element-plus';
const router = useRouter();
// 搜索参数
const searchKeyword = ref('');
const page = ref(1);
const size = ref(12);
const total = ref(0);
// 书籍数据
const books = ref([]);
const loading = ref(false);
// 工具函数
const truncateText = (text, maxLength) => {
    if (!text)
        return '暂无简介';
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength) + '...';
};
const formatCount = (count) => {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + 'w';
    }
    else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
};
// 获取书籍列表
const fetchBooks = async () => {
    loading.value = true;
    try {
        const params = {
            page: page.value,
            size: size.value
        };
        if (searchKeyword.value.trim()) {
            params.keyword = searchKeyword.value.trim();
        }
        const res = await getBookList(params);
        if (res.code === 200) {
            books.value = res.data.records || [];
            total.value = res.data.total || 0;
        }
        else {
            ElMessage.error(res.message || '获取书籍列表失败');
            books.value = [];
            total.value = 0;
        }
    }
    catch (error) {
        console.error('获取书籍列表失败:', error);
        ElMessage.error('获取书籍列表失败，请稍后重试');
        books.value = [];
        total.value = 0;
    }
    finally {
        loading.value = false;
    }
};
// 搜索处理
const handleSearch = () => {
    page.value = 1;
    fetchBooks();
};
// 清空搜索
const clearSearch = () => {
    searchKeyword.value = '';
    page.value = 1;
    fetchBooks();
};
// 刷新
const refresh = () => {
    fetchBooks();
};
// 分页处理
const handleSizeChange = (newSize) => {
    size.value = newSize;
    page.value = 1;
    fetchBooks();
};
const handleCurrentChange = (newPage) => {
    page.value = newPage;
    fetchBooks();
};
// 跳转到书籍
const goToBook = (book) => {
    router.push(`/book/${book.id}`);
};
// 监听路由参数
watch(() => router.currentRoute.value.query, (newQuery) => {
    if (newQuery.keyword) {
        searchKeyword.value = newQuery.keyword;
    }
    fetchBooks();
});
onMounted(() => {
    fetchBooks();
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
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['book-card']} */ ;
/** @type {__VLS_StyleScopedClasses['book-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
/** @type {__VLS_StyleScopedClasses['cover-error']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pager']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['book-content']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['book-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['book-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['book-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "book-list-page" },
});
/** @type {__VLS_StyleScopedClasses['book-list-page']} */ ;
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
    ...{ class: "book-content" },
});
/** @type {__VLS_StyleScopedClasses['book-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "book-header glass-card" },
});
/** @type {__VLS_StyleScopedClasses['book-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-content" },
});
/** @type {__VLS_StyleScopedClasses['header-content']} */ ;
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
    placeholder: "搜索书籍标题...",
    size: "large",
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索书籍标题...",
    size: "large",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.handleSearch) });
const __VLS_7 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearSearch) });
const { default: __VLS_8 } = __VLS_3.slots;
{
    const { prepend: __VLS_9 } = __VLS_3.slots;
    let __VLS_10;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
    const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const { default: __VLS_15 } = __VLS_13.slots;
    let __VLS_16;
    /** @ts-ignore @type {typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
    // @ts-ignore
    [searchKeyword, handleSearch, clearSearch,];
    var __VLS_13;
    // @ts-ignore
    [];
}
{
    const { append: __VLS_21 } = __VLS_3.slots;
    let __VLS_22;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_27;
    const __VLS_28 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSearch) });
    const { default: __VLS_29 } = __VLS_25.slots;
    // @ts-ignore
    [handleSearch,];
    var __VLS_25;
    var __VLS_26;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "book-list-container" },
});
/** @type {__VLS_StyleScopedClasses['book-list-container']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading" },
    });
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elSkeleton | typeof __VLS_components.ElSkeleton} */
    elSkeleton;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        rows: (6),
        animated: true,
    }));
    const __VLS_32 = __VLS_31({
        rows: (6),
        animated: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
}
else if (__VLS_ctx.books.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "no-data" },
    });
    /** @type {__VLS_StyleScopedClasses['no-data']} */ ;
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        description: "暂无书籍数据",
    }));
    const __VLS_37 = __VLS_36({
        description: "暂无书籍数据",
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    const { default: __VLS_40 } = __VLS_38.slots;
    let __VLS_41;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_43 = __VLS_42({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_46;
    const __VLS_47 = ({ click: {} },
        { onClick: (__VLS_ctx.refresh) });
    const { default: __VLS_48 } = __VLS_44.slots;
    // @ts-ignore
    [loading, books, refresh,];
    var __VLS_44;
    var __VLS_45;
    // @ts-ignore
    [];
    var __VLS_38;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "book-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['book-grid']} */ ;
    for (const [book] of __VLS_vFor((__VLS_ctx.books))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.books.length === 0))
                        return;
                    __VLS_ctx.goToBook(book);
                    // @ts-ignore
                    [books, goToBook,];
                } },
            key: (book.id),
            ...{ class: "book-card glass-card" },
        });
        /** @type {__VLS_StyleScopedClasses['book-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "book-cover" },
        });
        /** @type {__VLS_StyleScopedClasses['book-cover']} */ ;
        let __VLS_49;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
            src: (book.coverUrl || '/default-book-cover.png'),
            alt: (book.title),
            fit: "cover",
            ...{ class: "cover-image" },
            previewSrcList: ([book.coverUrl]),
        }));
        const __VLS_51 = __VLS_50({
            src: (book.coverUrl || '/default-book-cover.png'),
            alt: (book.title),
            fit: "cover",
            ...{ class: "cover-image" },
            previewSrcList: ([book.coverUrl]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        /** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
        const { default: __VLS_54 } = __VLS_52.slots;
        {
            const { error: __VLS_55 } = __VLS_52.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "cover-error" },
            });
            /** @type {__VLS_StyleScopedClasses['cover-error']} */ ;
            let __VLS_56;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
            const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
            const { default: __VLS_61 } = __VLS_59.slots;
            let __VLS_62;
            /** @ts-ignore @type {typeof __VLS_components.Picture} */
            Picture;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({}));
            const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
            // @ts-ignore
            [];
            var __VLS_59;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_52;
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
            ...{ class: "book-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['book-desc']} */ ;
        (__VLS_ctx.truncateText(book.description, 80));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "book-stats" },
        });
        /** @type {__VLS_StyleScopedClasses['book-stats']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-item" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
        let __VLS_67;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({}));
        const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
        const { default: __VLS_72 } = __VLS_70.slots;
        let __VLS_73;
        /** @ts-ignore @type {typeof __VLS_components.View} */
        View;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({}));
        const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
        // @ts-ignore
        [truncateText,];
        var __VLS_70;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatCount(book.viewCount || 0));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "stat-item" },
        });
        /** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
        let __VLS_78;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({}));
        const __VLS_80 = __VLS_79({}, ...__VLS_functionalComponentArgsRest(__VLS_79));
        const { default: __VLS_83 } = __VLS_81.slots;
        let __VLS_84;
        /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
        ChatDotRound;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({}));
        const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
        // @ts-ignore
        [formatCount,];
        var __VLS_81;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatCount(book.commentCount || 0));
        if (book.address) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "external-link-tag" },
            });
            /** @type {__VLS_StyleScopedClasses['external-link-tag']} */ ;
            let __VLS_89;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
                type: "success",
                size: "small",
            }));
            const __VLS_91 = __VLS_90({
                type: "success",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_90));
            const { default: __VLS_94 } = __VLS_92.slots;
            // @ts-ignore
            [formatCount,];
            var __VLS_92;
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    let __VLS_95;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.page),
        pageSize: (__VLS_ctx.size),
        pageSizes: ([10, 20, 30, 50]),
        total: (__VLS_ctx.total),
        layout: "total, sizes, prev, pager, next, jumper",
    }));
    const __VLS_97 = __VLS_96({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.page),
        pageSize: (__VLS_ctx.size),
        pageSizes: ([10, 20, 30, 50]),
        total: (__VLS_ctx.total),
        layout: "total, sizes, prev, pager, next, jumper",
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    let __VLS_100;
    const __VLS_101 = ({ sizeChange: {} },
        { onSizeChange: (__VLS_ctx.handleSizeChange) });
    const __VLS_102 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handleCurrentChange) });
    var __VLS_98;
    var __VLS_99;
}
// @ts-ignore
[total, total, page, size, handleSizeChange, handleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
