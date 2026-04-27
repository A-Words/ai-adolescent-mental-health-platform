/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, ArrowDown, ArrowUp, Clock, Star, User, View, Picture, ChatDotRound } from '@element-plus/icons-vue';
import { searchContent, getHotKeywords, getSearchHistory, clearSearchHistory, saveSearchHistory } from '@/api/search';
import { getBookList } from '@/api/book';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
const route = useRoute();
const router = useRouter();
// 搜索参数
const searchKeyword = ref('');
const searchType = ref('all');
const pageNum = ref(1);
const pageSize = ref(10);
const sortBy = ref('relevance');
const category = ref('');
const priceType = ref('');
const minPrice = ref();
const maxPrice = ref();
// 高级搜索
const showAdvancedSearch = ref(false);
// 搜索结果
const results = ref([]);
const total = ref(0);
const loading = ref(false);
// 搜索历史
const searchHistory = ref([]);
// 热门搜索
const hotKeywords = ref([]);
// 视图控制
const listView = ref('all');
// 分类选项
const categories = [
    { label: '情绪管理', value: 'emotion' },
    { label: '学习压力', value: 'study' },
    { label: '人际关系', value: 'relationship' },
    { label: '自我认知', value: 'self' },
    { label: '家庭关系', value: 'family' },
    { label: '职业规划', value: 'career' }
];
// 工具函数
const truncateText = (text, maxLength) => {
    if (!text)
        return '';
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
// 过滤后的结果
const filteredResults = computed(() => {
    if (listView.value === 'all') {
        return results.value;
    }
    return results.value.filter(item => item.type === listView.value);
});
// 初始化搜索
const initSearch = () => {
    const keyword = route.query.keyword;
    if (keyword) {
        searchKeyword.value = keyword;
        performSearch();
    }
    loadHotKeywords();
    loadSearchHistory();
};
// 执行搜索
const performSearch = async () => {
    if (!searchKeyword.value.trim()) {
        return;
    }
    loading.value = true;
    try {
        // 根据搜索类型决定调用哪些接口
        const searchPromises = [];
        if (searchType.value === 'all' || searchType.value === 'article' || searchType.value === 'course') {
            const params = {
                keyword: searchKeyword.value.trim(),
                pageNum: pageNum.value,
                pageSize: pageSize.value,
                sortBy: sortBy.value,
                category: category.value,
                tags: [],
                minPrice: priceType.value === 'paid' ? minPrice.value : undefined,
                maxPrice: priceType.value === 'paid' ? maxPrice.value : undefined,
                isFree: priceType.value === 'free' ? true : undefined
            };
            if (searchType.value !== 'all') {
                params.type = searchType.value;
            }
            searchPromises.push(searchContent(params));
        }
        if (searchType.value === 'all' || searchType.value === 'book') {
            const bookParams = {
                keyword: searchKeyword.value.trim(),
                page: pageNum.value,
                size: pageSize.value
            };
            searchPromises.push(getBookList(bookParams));
        }
        const responses = await Promise.all(searchPromises);
        // 处理搜索结果
        const allResults = [];
        let totalCount = 0;
        responses.forEach((res, index) => {
            if (res.code === 200) {
                if (index === 0 && (searchType.value === 'all' || searchType.value === 'article' || searchType.value === 'course')) {
                    // 处理文章和课程结果
                    const searchRes = res;
                    const items = searchRes.data?.data || [];
                    items.forEach((item) => {
                        allResults.push({
                            id: item.id,
                            type: item.type,
                            title: item.title,
                            description: item.description,
                            coverImage: item.coverImage,
                            author: item.author,
                            createTime: item.createTime,
                            viewCount: item.viewCount,
                            likeCount: item.likeCount,
                            tags: item.tags,
                            price: item.price,
                            isFree: item.isFree,
                            duration: item.duration,
                            articleType: item.articleType,
                            userId: item.userId
                        });
                    });
                    totalCount += searchRes.data?.total || 0;
                }
                else if (index === 1 || (searchType.value === 'book' && index === 0)) {
                    // 处理书籍结果
                    const bookData = res.data;
                    if (bookData.records && Array.isArray(bookData.records)) {
                        bookData.records.forEach((book) => {
                            allResults.push({
                                id: book.id,
                                type: 'book',
                                title: book.title,
                                description: book.description,
                                coverImage: book.coverUrl,
                                createTime: book.createTime,
                                viewCount: book.viewCount,
                                commentCount: book.commentCount,
                                address: book.address,
                                tags: book.tags || []
                            });
                        });
                        totalCount += bookData.total || 0;
                    }
                }
            }
        });
        // 根据排序方式排序
        if (sortBy.value === 'time') {
            allResults.sort((a, b) => {
                return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
            });
        }
        else if (sortBy.value === 'popular') {
            allResults.sort((a, b) => {
                const aViews = a.viewCount || 0;
                const bViews = b.viewCount || 0;
                return bViews - aViews;
            });
        }
        results.value = allResults;
        total.value = totalCount;
        if (searchKeyword.value.trim()) {
            await saveSearchHistory(searchKeyword.value.trim());
            loadSearchHistory();
        }
    }
    catch (error) {
        console.error('搜索出错:', error);
        ElMessage.error('搜索失败，请稍后重试');
        results.value = [];
        total.value = 0;
    }
    finally {
        loading.value = false;
    }
};
// 搜索处理
const handleSearch = () => {
    pageNum.value = 1;
    updateUrlAndSearch();
};
// 清除搜索
const clearSearch = () => {
    searchKeyword.value = '';
    results.value = [];
    total.value = 0;
    router.push('/search');
};
// 应用筛选
const applyFilters = () => {
    pageNum.value = 1;
    updateUrlAndSearch();
};
// 重置筛选
const resetFilters = () => {
    searchType.value = 'all';
    category.value = '';
    priceType.value = '';
    minPrice.value = undefined;
    maxPrice.value = undefined;
    sortBy.value = 'relevance';
    showAdvancedSearch.value = false;
    pageNum.value = 1;
    updateUrlAndSearch();
};
// 更新URL并搜索
const updateUrlAndSearch = () => {
    const query = { keyword: searchKeyword.value };
    if (searchType.value !== 'all')
        query.type = searchType.value;
    if (category.value)
        query.category = category.value;
    if (sortBy.value !== 'relevance')
        query.sortBy = sortBy.value;
    router.push({
        path: '/search',
        query
    });
    if (searchKeyword.value.trim()) {
        performSearch();
    }
};
// 加载热门关键词
const loadHotKeywords = async () => {
    try {
        const res = await getHotKeywords();
        if (res.code === 200) {
            hotKeywords.value = res.data || [];
        }
    }
    catch (error) {
        console.error('加载热门关键词失败:', error);
    }
};
// 加载搜索历史
const loadSearchHistory = async () => {
    try {
        const res = await getSearchHistory();
        if (res.code === 200) {
            searchHistory.value = res.data || [];
        }
    }
    catch (error) {
        console.error('加载搜索历史失败:', error);
    }
};
// 清空搜索历史
const clearHistory = async () => {
    try {
        await clearSearchHistory();
        searchHistory.value = [];
        ElMessage.success('搜索历史已清空');
    }
    catch (error) {
        console.error('清空搜索历史失败:', error);
        ElMessage.error('清空历史失败');
    }
};
// 通过历史搜索
const searchByHistory = (keyword) => {
    searchKeyword.value = keyword;
    handleSearch();
};
// 通过热门关键词搜索
const searchByHotKeyword = (keyword) => {
    searchKeyword.value = keyword;
    handleSearch();
};
// 删除单个历史项
const removeHistoryItem = (index) => {
    searchHistory.value.splice(index, 1);
};
// 分页大小变化
const handleSizeChange = (size) => {
    pageSize.value = size;
    pageNum.value = 1;
    performSearch();
};
// 页码变化
const handleCurrentChange = (page) => {
    pageNum.value = page;
    performSearch();
};
// 跳转到详情页
const goToDetail = (item) => {
    if (item.type === 'article') {
        // 根据 articleType 决定跳转路径
        if (item.articleType === 'user' && item.userId) {
            router.push(`/user-article/${item.userId}/${item.id}`);
        }
        else {
            router.push(`/article/${item.id}`);
        }
    }
    else if (item.type === 'course') {
        router.push(`/course/${item.id}`);
    }
    else if (item.type === 'book') {
        router.push(`/book/${item.id}`);
    }
};
// 格式化时间
const formatTime = (time) => {
    if (!time)
        return '';
    return dayjs(time).format('YYYY-MM-DD');
};
// 监听路由变化
watch(() => route.query.keyword, (newKeyword) => {
    if (newKeyword !== searchKeyword.value) {
        searchKeyword.value = newKeyword || '';
        if (newKeyword) {
            performSearch();
        }
    }
});
onMounted(() => {
    initSearch();
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
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['advanced-search-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['price-range']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['history-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hot-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['search-status']} */ ;
/** @type {__VLS_StyleScopedClasses['search-status']} */ ;
/** @type {__VLS_StyleScopedClasses['search-status']} */ ;
/** @type {__VLS_StyleScopedClasses['result-count']} */ ;
/** @type {__VLS_StyleScopedClasses['el-radio-button__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['el-select']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['no-result-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['no-result-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['no-result-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['item-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['extra-info']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pager']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['search-content']} */ ;
/** @type {__VLS_StyleScopedClasses['side-by-side-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['item-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['advanced-search-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['price-range']} */ ;
/** @type {__VLS_StyleScopedClasses['price-range']} */ ;
/** @type {__VLS_StyleScopedClasses['item-meta']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-page" },
});
/** @type {__VLS_StyleScopedClasses['search-page']} */ ;
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
    ...{ class: "search-content" },
});
/** @type {__VLS_StyleScopedClasses['search-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-card" },
});
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
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
    placeholder: "搜索文章/课程/书籍...",
    size: "large",
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索文章/课程/书籍...",
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
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        modelValue: (__VLS_ctx.searchType),
        ...{ style: {} },
    }));
    const __VLS_12 = __VLS_11({
        modelValue: (__VLS_ctx.searchType),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const { default: __VLS_15 } = __VLS_13.slots;
    let __VLS_16;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        label: "全部",
        value: "all",
    }));
    const __VLS_18 = __VLS_17({
        label: "全部",
        value: "all",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_21;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        label: "文章",
        value: "article",
    }));
    const __VLS_23 = __VLS_22({
        label: "文章",
        value: "article",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        label: "课程",
        value: "course",
    }));
    const __VLS_28 = __VLS_27({
        label: "课程",
        value: "course",
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        label: "书籍",
        value: "book",
    }));
    const __VLS_33 = __VLS_32({
        label: "书籍",
        value: "book",
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    // @ts-ignore
    [searchKeyword, handleSearch, clearSearch, searchType,];
    var __VLS_13;
    // @ts-ignore
    [];
}
{
    const { append: __VLS_36 } = __VLS_3.slots;
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Search),
    }));
    const __VLS_39 = __VLS_38({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Search),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    let __VLS_42;
    const __VLS_43 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSearch) });
    var __VLS_40;
    var __VLS_41;
    // @ts-ignore
    [handleSearch, Search,];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
    ...{ class: "advanced-search-btn" },
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
    ...{ class: "advanced-search-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_49;
const __VLS_50 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.showAdvancedSearch = !__VLS_ctx.showAdvancedSearch;
            // @ts-ignore
            [showAdvancedSearch, showAdvancedSearch,];
        } });
/** @type {__VLS_StyleScopedClasses['advanced-search-btn']} */ ;
const { default: __VLS_51 } = __VLS_47.slots;
(__VLS_ctx.showAdvancedSearch ? '收起筛选' : '高级筛选');
let __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({}));
const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const { default: __VLS_57 } = __VLS_55.slots;
if (!__VLS_ctx.showAdvancedSearch) {
    let __VLS_58;
    /** @ts-ignore @type {typeof __VLS_components.ArrowDown} */
    ArrowDown;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({}));
    const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
}
else {
    let __VLS_63;
    /** @ts-ignore @type {typeof __VLS_components.ArrowUp} */
    ArrowUp;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({}));
    const __VLS_65 = __VLS_64({}, ...__VLS_functionalComponentArgsRest(__VLS_64));
}
// @ts-ignore
[showAdvancedSearch, showAdvancedSearch,];
var __VLS_55;
// @ts-ignore
[];
var __VLS_47;
var __VLS_48;
if (__VLS_ctx.showAdvancedSearch) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "advanced-search-panel" },
    });
    /** @type {__VLS_StyleScopedClasses['advanced-search-panel']} */ ;
    let __VLS_68;
    /** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
    elRow;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        gutter: (20),
    }));
    const __VLS_70 = __VLS_69({
        gutter: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    const { default: __VLS_73 } = __VLS_71.slots;
    let __VLS_74;
    /** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
    elCol;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        span: (8),
    }));
    const __VLS_76 = __VLS_75({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    const { default: __VLS_79 } = __VLS_77.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filter-item" },
    });
    /** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filter-label" },
    });
    /** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
    let __VLS_80;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        modelValue: (__VLS_ctx.category),
        placeholder: "选择分类",
        clearable: true,
        filterable: true,
        ...{ style: {} },
    }));
    const __VLS_82 = __VLS_81({
        modelValue: (__VLS_ctx.category),
        placeholder: "选择分类",
        clearable: true,
        filterable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    const { default: __VLS_85 } = __VLS_83.slots;
    for (const [cat] of __VLS_vFor((__VLS_ctx.categories))) {
        let __VLS_86;
        /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
        elOption;
        // @ts-ignore
        const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
            key: (cat.value),
            label: (cat.label),
            value: (cat.value),
        }));
        const __VLS_88 = __VLS_87({
            key: (cat.value),
            label: (cat.label),
            value: (cat.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_87));
        // @ts-ignore
        [showAdvancedSearch, category, categories,];
    }
    // @ts-ignore
    [];
    var __VLS_83;
    // @ts-ignore
    [];
    var __VLS_77;
    let __VLS_91;
    /** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
    elCol;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
        span: (8),
    }));
    const __VLS_93 = __VLS_92({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    const { default: __VLS_96 } = __VLS_94.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filter-item" },
    });
    /** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filter-label" },
    });
    /** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "price-range" },
    });
    /** @type {__VLS_StyleScopedClasses['price-range']} */ ;
    let __VLS_97;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
        modelValue: (__VLS_ctx.priceType),
        placeholder: "价格类型",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_99 = __VLS_98({
        modelValue: (__VLS_ctx.priceType),
        placeholder: "价格类型",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    const { default: __VLS_102 } = __VLS_100.slots;
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        label: "全部",
        value: "",
    }));
    const __VLS_105 = __VLS_104({
        label: "全部",
        value: "",
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    let __VLS_108;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
        label: "免费",
        value: "free",
    }));
    const __VLS_110 = __VLS_109({
        label: "免费",
        value: "free",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    let __VLS_113;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
        label: "付费",
        value: "paid",
    }));
    const __VLS_115 = __VLS_114({
        label: "付费",
        value: "paid",
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    // @ts-ignore
    [priceType,];
    var __VLS_100;
    if (__VLS_ctx.priceType === 'paid') {
        let __VLS_118;
        /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
        elInputNumber;
        // @ts-ignore
        const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
            modelValue: (__VLS_ctx.minPrice),
            min: (0),
            max: (10000),
            step: (100),
            placeholder: "最低价",
            ...{ style: {} },
        }));
        const __VLS_120 = __VLS_119({
            modelValue: (__VLS_ctx.minPrice),
            min: (0),
            max: (10000),
            step: (100),
            placeholder: "最低价",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_119));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        let __VLS_123;
        /** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
        elInputNumber;
        // @ts-ignore
        const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
            modelValue: (__VLS_ctx.maxPrice),
            min: (0),
            max: (10000),
            step: (100),
            placeholder: "最高价",
            ...{ style: {} },
        }));
        const __VLS_125 = __VLS_124({
            modelValue: (__VLS_ctx.maxPrice),
            min: (0),
            max: (10000),
            step: (100),
            placeholder: "最高价",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_124));
    }
    // @ts-ignore
    [priceType, minPrice, maxPrice,];
    var __VLS_94;
    let __VLS_128;
    /** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
    elCol;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
        span: (8),
    }));
    const __VLS_130 = __VLS_129({
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const { default: __VLS_133 } = __VLS_131.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filter-item" },
    });
    /** @type {__VLS_StyleScopedClasses['filter-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filter-label" },
    });
    /** @type {__VLS_StyleScopedClasses['filter-label']} */ ;
    let __VLS_134;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent1(__VLS_134, new __VLS_134({
        modelValue: (__VLS_ctx.sortBy),
        placeholder: "排序方式",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_136 = __VLS_135({
        modelValue: (__VLS_ctx.sortBy),
        placeholder: "排序方式",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    const { default: __VLS_139 } = __VLS_137.slots;
    let __VLS_140;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
        label: "相关性",
        value: "relevance",
    }));
    const __VLS_142 = __VLS_141({
        label: "相关性",
        value: "relevance",
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    let __VLS_145;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
        label: "最新发布",
        value: "time",
    }));
    const __VLS_147 = __VLS_146({
        label: "最新发布",
        value: "time",
    }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    let __VLS_150;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
        label: "最热",
        value: "popular",
    }));
    const __VLS_152 = __VLS_151({
        label: "最热",
        value: "popular",
    }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    // @ts-ignore
    [sortBy,];
    var __VLS_137;
    // @ts-ignore
    [];
    var __VLS_131;
    // @ts-ignore
    [];
    var __VLS_71;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filter-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
    let __VLS_155;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
        ...{ 'onClick': {} },
    }));
    const __VLS_157 = __VLS_156({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    let __VLS_160;
    const __VLS_161 = ({ click: {} },
        { onClick: (__VLS_ctx.resetFilters) });
    const { default: __VLS_162 } = __VLS_158.slots;
    // @ts-ignore
    [resetFilters,];
    var __VLS_158;
    var __VLS_159;
    let __VLS_163;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_165 = __VLS_164({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    let __VLS_168;
    const __VLS_169 = ({ click: {} },
        { onClick: (__VLS_ctx.applyFilters) });
    const { default: __VLS_170 } = __VLS_166.slots;
    // @ts-ignore
    [applyFilters,];
    var __VLS_166;
    var __VLS_167;
}
if (!__VLS_ctx.searchKeyword) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "side-by-side-cards" },
    });
    /** @type {__VLS_StyleScopedClasses['side-by-side-cards']} */ ;
    if (__VLS_ctx.searchHistory.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "glass-card history-card" },
        });
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['history-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-title" },
        });
        /** @type {__VLS_StyleScopedClasses['card-title']} */ ;
        let __VLS_171;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171({}));
        const __VLS_173 = __VLS_172({}, ...__VLS_functionalComponentArgsRest(__VLS_172));
        const { default: __VLS_176 } = __VLS_174.slots;
        let __VLS_177;
        /** @ts-ignore @type {typeof __VLS_components.Clock} */
        Clock;
        // @ts-ignore
        const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({}));
        const __VLS_179 = __VLS_178({}, ...__VLS_functionalComponentArgsRest(__VLS_178));
        // @ts-ignore
        [searchKeyword, searchHistory,];
        var __VLS_174;
        let __VLS_182;
        /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
        elLink;
        // @ts-ignore
        const __VLS_183 = __VLS_asFunctionalComponent1(__VLS_182, new __VLS_182({
            ...{ 'onClick': {} },
            type: "info",
            underline: "never",
            size: "small",
            ...{ class: "clear-btn" },
        }));
        const __VLS_184 = __VLS_183({
            ...{ 'onClick': {} },
            type: "info",
            underline: "never",
            size: "small",
            ...{ class: "clear-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_183));
        let __VLS_187;
        const __VLS_188 = ({ click: {} },
            { onClick: (__VLS_ctx.clearHistory) });
        /** @type {__VLS_StyleScopedClasses['clear-btn']} */ ;
        const { default: __VLS_189 } = __VLS_185.slots;
        // @ts-ignore
        [clearHistory,];
        var __VLS_185;
        var __VLS_186;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "history-tags" },
        });
        /** @type {__VLS_StyleScopedClasses['history-tags']} */ ;
        for (const [item, index] of __VLS_vFor((__VLS_ctx.searchHistory))) {
            let __VLS_190;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
                ...{ 'onClick': {} },
                ...{ 'onClose': {} },
                key: (index),
                ...{ class: "history-tag" },
                closable: true,
            }));
            const __VLS_192 = __VLS_191({
                ...{ 'onClick': {} },
                ...{ 'onClose': {} },
                key: (index),
                ...{ class: "history-tag" },
                closable: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_191));
            let __VLS_195;
            const __VLS_196 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.searchKeyword))
                            return;
                        if (!(__VLS_ctx.searchHistory.length > 0))
                            return;
                        __VLS_ctx.searchByHistory(item);
                        // @ts-ignore
                        [searchHistory, searchByHistory,];
                    } });
            const __VLS_197 = ({ close: {} },
                { onClose: (...[$event]) => {
                        if (!(!__VLS_ctx.searchKeyword))
                            return;
                        if (!(__VLS_ctx.searchHistory.length > 0))
                            return;
                        __VLS_ctx.removeHistoryItem(index);
                        // @ts-ignore
                        [removeHistoryItem,];
                    } });
            /** @type {__VLS_StyleScopedClasses['history-tag']} */ ;
            const { default: __VLS_198 } = __VLS_193.slots;
            (item);
            // @ts-ignore
            [];
            var __VLS_193;
            var __VLS_194;
            // @ts-ignore
            [];
        }
    }
    if (__VLS_ctx.hotKeywords.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "glass-card hot-card" },
        });
        /** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
        /** @type {__VLS_StyleScopedClasses['hot-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "card-title hot-title" },
        });
        /** @type {__VLS_StyleScopedClasses['card-title']} */ ;
        /** @type {__VLS_StyleScopedClasses['hot-title']} */ ;
        let __VLS_199;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_200 = __VLS_asFunctionalComponent1(__VLS_199, new __VLS_199({}));
        const __VLS_201 = __VLS_200({}, ...__VLS_functionalComponentArgsRest(__VLS_200));
        const { default: __VLS_204 } = __VLS_202.slots;
        let __VLS_205;
        /** @ts-ignore @type {typeof __VLS_components.Star} */
        Star;
        // @ts-ignore
        const __VLS_206 = __VLS_asFunctionalComponent1(__VLS_205, new __VLS_205({}));
        const __VLS_207 = __VLS_206({}, ...__VLS_functionalComponentArgsRest(__VLS_206));
        // @ts-ignore
        [hotKeywords,];
        var __VLS_202;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "hot-tags" },
        });
        /** @type {__VLS_StyleScopedClasses['hot-tags']} */ ;
        for (const [keyword, index] of __VLS_vFor((__VLS_ctx.hotKeywords))) {
            let __VLS_210;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({
                ...{ 'onClick': {} },
                key: (index),
                ...{ class: "hot-tag" },
                type: (index < 3 ? 'danger' : 'info'),
            }));
            const __VLS_212 = __VLS_211({
                ...{ 'onClick': {} },
                key: (index),
                ...{ class: "hot-tag" },
                type: (index < 3 ? 'danger' : 'info'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_211));
            let __VLS_215;
            const __VLS_216 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(!__VLS_ctx.searchKeyword))
                            return;
                        if (!(__VLS_ctx.hotKeywords.length > 0))
                            return;
                        __VLS_ctx.searchByHotKeyword(keyword);
                        // @ts-ignore
                        [hotKeywords, searchByHotKeyword,];
                    } });
            /** @type {__VLS_StyleScopedClasses['hot-tag']} */ ;
            const { default: __VLS_217 } = __VLS_213.slots;
            if (index < 3) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "hot-rank" },
                });
                /** @type {__VLS_StyleScopedClasses['hot-rank']} */ ;
                (index + 1);
            }
            (keyword);
            // @ts-ignore
            [];
            var __VLS_213;
            var __VLS_214;
            // @ts-ignore
            [];
        }
    }
}
if (__VLS_ctx.searchKeyword) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "search-status" },
    });
    /** @type {__VLS_StyleScopedClasses['search-status']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "keyword" },
    });
    /** @type {__VLS_StyleScopedClasses['keyword']} */ ;
    (__VLS_ctx.searchKeyword);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "result-count" },
    });
    /** @type {__VLS_StyleScopedClasses['result-count']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    (__VLS_ctx.total);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "results-card glass-card" },
});
/** @type {__VLS_StyleScopedClasses['results-card']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-card']} */ ;
if (__VLS_ctx.results.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "results-filter" },
    });
    /** @type {__VLS_StyleScopedClasses['results-filter']} */ ;
    let __VLS_218;
    /** @ts-ignore @type {typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup} */
    elRadioGroup;
    // @ts-ignore
    const __VLS_219 = __VLS_asFunctionalComponent1(__VLS_218, new __VLS_218({
        modelValue: (__VLS_ctx.listView),
        size: "small",
    }));
    const __VLS_220 = __VLS_219({
        modelValue: (__VLS_ctx.listView),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_219));
    const { default: __VLS_223 } = __VLS_221.slots;
    let __VLS_224;
    /** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
    elRadioButton;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent1(__VLS_224, new __VLS_224({
        label: "all",
    }));
    const __VLS_226 = __VLS_225({
        label: "all",
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    const { default: __VLS_229 } = __VLS_227.slots;
    // @ts-ignore
    [searchKeyword, searchKeyword, total, results, listView,];
    var __VLS_227;
    let __VLS_230;
    /** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
    elRadioButton;
    // @ts-ignore
    const __VLS_231 = __VLS_asFunctionalComponent1(__VLS_230, new __VLS_230({
        label: "article",
    }));
    const __VLS_232 = __VLS_231({
        label: "article",
    }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    const { default: __VLS_235 } = __VLS_233.slots;
    // @ts-ignore
    [];
    var __VLS_233;
    let __VLS_236;
    /** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
    elRadioButton;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent1(__VLS_236, new __VLS_236({
        label: "course",
    }));
    const __VLS_238 = __VLS_237({
        label: "course",
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    const { default: __VLS_241 } = __VLS_239.slots;
    // @ts-ignore
    [];
    var __VLS_239;
    let __VLS_242;
    /** @ts-ignore @type {typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton} */
    elRadioButton;
    // @ts-ignore
    const __VLS_243 = __VLS_asFunctionalComponent1(__VLS_242, new __VLS_242({
        label: "book",
    }));
    const __VLS_244 = __VLS_243({
        label: "book",
    }, ...__VLS_functionalComponentArgsRest(__VLS_243));
    const { default: __VLS_247 } = __VLS_245.slots;
    // @ts-ignore
    [];
    var __VLS_245;
    // @ts-ignore
    [];
    var __VLS_221;
    let __VLS_248;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent1(__VLS_248, new __VLS_248({
        modelValue: (__VLS_ctx.pageSize),
        placeholder: "每页显示",
        size: "small",
        ...{ style: {} },
    }));
    const __VLS_250 = __VLS_249({
        modelValue: (__VLS_ctx.pageSize),
        placeholder: "每页显示",
        size: "small",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    const { default: __VLS_253 } = __VLS_251.slots;
    let __VLS_254;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_255 = __VLS_asFunctionalComponent1(__VLS_254, new __VLS_254({
        label: "10条/页",
        value: (10),
    }));
    const __VLS_256 = __VLS_255({
        label: "10条/页",
        value: (10),
    }, ...__VLS_functionalComponentArgsRest(__VLS_255));
    let __VLS_259;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_260 = __VLS_asFunctionalComponent1(__VLS_259, new __VLS_259({
        label: "20条/页",
        value: (20),
    }));
    const __VLS_261 = __VLS_260({
        label: "20条/页",
        value: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_260));
    let __VLS_264;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_265 = __VLS_asFunctionalComponent1(__VLS_264, new __VLS_264({
        label: "50条/页",
        value: (50),
    }));
    const __VLS_266 = __VLS_265({
        label: "50条/页",
        value: (50),
    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
    // @ts-ignore
    [pageSize,];
    var __VLS_251;
}
if (!__VLS_ctx.loading && __VLS_ctx.results.length === 0 && __VLS_ctx.searchKeyword) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "no-results" },
    });
    /** @type {__VLS_StyleScopedClasses['no-results']} */ ;
    let __VLS_269;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_270 = __VLS_asFunctionalComponent1(__VLS_269, new __VLS_269({
        description: "没有找到相关结果",
    }));
    const __VLS_271 = __VLS_270({
        description: "没有找到相关结果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_270));
    const { default: __VLS_274 } = __VLS_272.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "no-result-suggestions" },
    });
    /** @type {__VLS_StyleScopedClasses['no-result-suggestions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
    // @ts-ignore
    [searchKeyword, results, loading,];
    var __VLS_272;
}
else if (__VLS_ctx.filteredResults.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-items" },
    });
    /** @type {__VLS_StyleScopedClasses['result-items']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.filteredResults))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.loading && __VLS_ctx.results.length === 0 && __VLS_ctx.searchKeyword))
                        return;
                    if (!(__VLS_ctx.filteredResults.length > 0))
                        return;
                    __VLS_ctx.goToDetail(item);
                    // @ts-ignore
                    [filteredResults, filteredResults, goToDetail,];
                } },
            key: (`${item.type}-${item.id}`),
            ...{ class: "result-item" },
        });
        /** @type {__VLS_StyleScopedClasses['result-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "item-type" },
        });
        /** @type {__VLS_StyleScopedClasses['item-type']} */ ;
        let __VLS_275;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_276 = __VLS_asFunctionalComponent1(__VLS_275, new __VLS_275({
            type: (item.type === 'article' ? 'success' : item.type === 'course' ? 'primary' : 'warning'),
            size: "small",
        }));
        const __VLS_277 = __VLS_276({
            type: (item.type === 'article' ? 'success' : item.type === 'course' ? 'primary' : 'warning'),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_276));
        const { default: __VLS_280 } = __VLS_278.slots;
        (item.type === 'article' ? '文章' : item.type === 'course' ? '课程' : '书籍');
        // @ts-ignore
        [];
        var __VLS_278;
        if (item.type === 'article' && item.articleType === 'user') {
            let __VLS_281;
            /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
            elTag;
            // @ts-ignore
            const __VLS_282 = __VLS_asFunctionalComponent1(__VLS_281, new __VLS_281({
                type: "warning",
                size: "small",
                ...{ class: "user-article-tag" },
            }));
            const __VLS_283 = __VLS_282({
                type: "warning",
                size: "small",
                ...{ class: "user-article-tag" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_282));
            /** @type {__VLS_StyleScopedClasses['user-article-tag']} */ ;
            const { default: __VLS_286 } = __VLS_284.slots;
            // @ts-ignore
            [];
            var __VLS_284;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "item-content" },
        });
        /** @type {__VLS_StyleScopedClasses['item-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "item-header" },
        });
        /** @type {__VLS_StyleScopedClasses['item-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
            ...{ class: "item-title" },
        });
        /** @type {__VLS_StyleScopedClasses['item-title']} */ ;
        (item.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "item-meta" },
        });
        /** @type {__VLS_StyleScopedClasses['item-meta']} */ ;
        if (item.author) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "item-author" },
            });
            /** @type {__VLS_StyleScopedClasses['item-author']} */ ;
            let __VLS_287;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_288 = __VLS_asFunctionalComponent1(__VLS_287, new __VLS_287({}));
            const __VLS_289 = __VLS_288({}, ...__VLS_functionalComponentArgsRest(__VLS_288));
            const { default: __VLS_292 } = __VLS_290.slots;
            let __VLS_293;
            /** @ts-ignore @type {typeof __VLS_components.User} */
            User;
            // @ts-ignore
            const __VLS_294 = __VLS_asFunctionalComponent1(__VLS_293, new __VLS_293({}));
            const __VLS_295 = __VLS_294({}, ...__VLS_functionalComponentArgsRest(__VLS_294));
            // @ts-ignore
            [];
            var __VLS_290;
            (item.author);
        }
        if (item.createTime) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "item-time" },
            });
            /** @type {__VLS_StyleScopedClasses['item-time']} */ ;
            let __VLS_298;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_299 = __VLS_asFunctionalComponent1(__VLS_298, new __VLS_298({}));
            const __VLS_300 = __VLS_299({}, ...__VLS_functionalComponentArgsRest(__VLS_299));
            const { default: __VLS_303 } = __VLS_301.slots;
            let __VLS_304;
            /** @ts-ignore @type {typeof __VLS_components.Clock} */
            Clock;
            // @ts-ignore
            const __VLS_305 = __VLS_asFunctionalComponent1(__VLS_304, new __VLS_304({}));
            const __VLS_306 = __VLS_305({}, ...__VLS_functionalComponentArgsRest(__VLS_305));
            // @ts-ignore
            [];
            var __VLS_301;
            (__VLS_ctx.formatTime(item.createTime));
        }
        if (item.viewCount !== undefined) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "item-views" },
            });
            /** @type {__VLS_StyleScopedClasses['item-views']} */ ;
            let __VLS_309;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_310 = __VLS_asFunctionalComponent1(__VLS_309, new __VLS_309({}));
            const __VLS_311 = __VLS_310({}, ...__VLS_functionalComponentArgsRest(__VLS_310));
            const { default: __VLS_314 } = __VLS_312.slots;
            let __VLS_315;
            /** @ts-ignore @type {typeof __VLS_components.View} */
            View;
            // @ts-ignore
            const __VLS_316 = __VLS_asFunctionalComponent1(__VLS_315, new __VLS_315({}));
            const __VLS_317 = __VLS_316({}, ...__VLS_functionalComponentArgsRest(__VLS_316));
            // @ts-ignore
            [formatTime,];
            var __VLS_312;
            (__VLS_ctx.formatCount(item.viewCount));
        }
        if (item.likeCount !== undefined) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "item-likes" },
            });
            /** @type {__VLS_StyleScopedClasses['item-likes']} */ ;
            let __VLS_320;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_321 = __VLS_asFunctionalComponent1(__VLS_320, new __VLS_320({}));
            const __VLS_322 = __VLS_321({}, ...__VLS_functionalComponentArgsRest(__VLS_321));
            const { default: __VLS_325 } = __VLS_323.slots;
            let __VLS_326;
            /** @ts-ignore @type {typeof __VLS_components.Star} */
            Star;
            // @ts-ignore
            const __VLS_327 = __VLS_asFunctionalComponent1(__VLS_326, new __VLS_326({}));
            const __VLS_328 = __VLS_327({}, ...__VLS_functionalComponentArgsRest(__VLS_327));
            // @ts-ignore
            [formatCount,];
            var __VLS_323;
            (__VLS_ctx.formatCount(item.likeCount));
        }
        if (item.type === 'book' && item.commentCount !== undefined) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "item-comments" },
            });
            /** @type {__VLS_StyleScopedClasses['item-comments']} */ ;
            let __VLS_331;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_332 = __VLS_asFunctionalComponent1(__VLS_331, new __VLS_331({}));
            const __VLS_333 = __VLS_332({}, ...__VLS_functionalComponentArgsRest(__VLS_332));
            const { default: __VLS_336 } = __VLS_334.slots;
            let __VLS_337;
            /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
            ChatDotRound;
            // @ts-ignore
            const __VLS_338 = __VLS_asFunctionalComponent1(__VLS_337, new __VLS_337({}));
            const __VLS_339 = __VLS_338({}, ...__VLS_functionalComponentArgsRest(__VLS_338));
            // @ts-ignore
            [formatCount,];
            var __VLS_334;
            (__VLS_ctx.formatCount(item.commentCount));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "item-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['item-desc']} */ ;
        (__VLS_ctx.truncateText(item.description || '', 120));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "item-footer" },
        });
        /** @type {__VLS_StyleScopedClasses['item-footer']} */ ;
        if (item.tags && item.tags.length > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "item-tags" },
            });
            /** @type {__VLS_StyleScopedClasses['item-tags']} */ ;
            for (const [tag] of __VLS_vFor((item.tags.slice(0, 3)))) {
                let __VLS_342;
                /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
                elTag;
                // @ts-ignore
                const __VLS_343 = __VLS_asFunctionalComponent1(__VLS_342, new __VLS_342({
                    key: (tag),
                    size: "small",
                    ...{ class: "tag" },
                }));
                const __VLS_344 = __VLS_343({
                    key: (tag),
                    size: "small",
                    ...{ class: "tag" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_343));
                /** @type {__VLS_StyleScopedClasses['tag']} */ ;
                const { default: __VLS_347 } = __VLS_345.slots;
                (tag);
                // @ts-ignore
                [formatCount, truncateText,];
                var __VLS_345;
                // @ts-ignore
                [];
            }
            if (item.tags.length > 3) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "more-tags" },
                });
                /** @type {__VLS_StyleScopedClasses['more-tags']} */ ;
                (item.tags.length - 3);
            }
        }
        if (item.type === 'course' || item.type === 'book') {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "extra-info" },
            });
            /** @type {__VLS_StyleScopedClasses['extra-info']} */ ;
            if (item.type === 'course') {
                if (item.isFree) {
                    let __VLS_348;
                    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
                    elTag;
                    // @ts-ignore
                    const __VLS_349 = __VLS_asFunctionalComponent1(__VLS_348, new __VLS_348({
                        type: "success",
                        size: "small",
                    }));
                    const __VLS_350 = __VLS_349({
                        type: "success",
                        size: "small",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_349));
                    const { default: __VLS_353 } = __VLS_351.slots;
                    // @ts-ignore
                    [];
                    var __VLS_351;
                }
                else {
                    let __VLS_354;
                    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
                    elTag;
                    // @ts-ignore
                    const __VLS_355 = __VLS_asFunctionalComponent1(__VLS_354, new __VLS_354({
                        type: "warning",
                        size: "small",
                    }));
                    const __VLS_356 = __VLS_355({
                        type: "warning",
                        size: "small",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_355));
                    const { default: __VLS_359 } = __VLS_357.slots;
                    (item.price);
                    // @ts-ignore
                    [];
                    var __VLS_357;
                }
                if (item.duration) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                        ...{ class: "duration" },
                    });
                    /** @type {__VLS_StyleScopedClasses['duration']} */ ;
                    (item.duration);
                }
            }
            if (item.type === 'book') {
                if (item.address) {
                    let __VLS_360;
                    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
                    elTag;
                    // @ts-ignore
                    const __VLS_361 = __VLS_asFunctionalComponent1(__VLS_360, new __VLS_360({
                        type: "success",
                        size: "small",
                        ...{ class: "read-link" },
                    }));
                    const __VLS_362 = __VLS_361({
                        type: "success",
                        size: "small",
                        ...{ class: "read-link" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_361));
                    /** @type {__VLS_StyleScopedClasses['read-link']} */ ;
                    const { default: __VLS_365 } = __VLS_363.slots;
                    // @ts-ignore
                    [];
                    var __VLS_363;
                }
            }
        }
        if (item.coverImage) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "item-cover" },
            });
            /** @type {__VLS_StyleScopedClasses['item-cover']} */ ;
            let __VLS_366;
            /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
            elImage;
            // @ts-ignore
            const __VLS_367 = __VLS_asFunctionalComponent1(__VLS_366, new __VLS_366({
                src: (item.coverImage),
                alt: (item.title),
                fit: "cover",
                ...{ class: "cover-image" },
            }));
            const __VLS_368 = __VLS_367({
                src: (item.coverImage),
                alt: (item.title),
                fit: "cover",
                ...{ class: "cover-image" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_367));
            /** @type {__VLS_StyleScopedClasses['cover-image']} */ ;
            const { default: __VLS_371 } = __VLS_369.slots;
            {
                const { error: __VLS_372 } = __VLS_369.slots;
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "image-error" },
                });
                /** @type {__VLS_StyleScopedClasses['image-error']} */ ;
                let __VLS_373;
                /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
                elIcon;
                // @ts-ignore
                const __VLS_374 = __VLS_asFunctionalComponent1(__VLS_373, new __VLS_373({}));
                const __VLS_375 = __VLS_374({}, ...__VLS_functionalComponentArgsRest(__VLS_374));
                const { default: __VLS_378 } = __VLS_376.slots;
                let __VLS_379;
                /** @ts-ignore @type {typeof __VLS_components.Picture} */
                Picture;
                // @ts-ignore
                const __VLS_380 = __VLS_asFunctionalComponent1(__VLS_379, new __VLS_379({}));
                const __VLS_381 = __VLS_380({}, ...__VLS_functionalComponentArgsRest(__VLS_380));
                // @ts-ignore
                [];
                var __VLS_376;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_369;
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading" },
    });
    /** @type {__VLS_StyleScopedClasses['loading']} */ ;
    let __VLS_384;
    /** @ts-ignore @type {typeof __VLS_components.elSkeleton | typeof __VLS_components.ElSkeleton} */
    elSkeleton;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent1(__VLS_384, new __VLS_384({
        rows: (5),
        animated: true,
    }));
    const __VLS_386 = __VLS_385({
        rows: (5),
        animated: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
}
if (__VLS_ctx.total > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "pagination" },
    });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    let __VLS_389;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_390 = __VLS_asFunctionalComponent1(__VLS_389, new __VLS_389({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageNum),
        pageSize: (__VLS_ctx.pageSize),
        pageSizes: ([10, 20, 50]),
        total: (__VLS_ctx.total),
        layout: "total, sizes, prev, pager, next, jumper",
    }));
    const __VLS_391 = __VLS_390({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.pageNum),
        pageSize: (__VLS_ctx.pageSize),
        pageSizes: ([10, 20, 50]),
        total: (__VLS_ctx.total),
        layout: "total, sizes, prev, pager, next, jumper",
    }, ...__VLS_functionalComponentArgsRest(__VLS_390));
    let __VLS_394;
    const __VLS_395 = ({ sizeChange: {} },
        { onSizeChange: (__VLS_ctx.handleSizeChange) });
    const __VLS_396 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handleCurrentChange) });
    var __VLS_392;
    var __VLS_393;
}
// @ts-ignore
[total, total, pageSize, loading, pageNum, handleSizeChange, handleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
