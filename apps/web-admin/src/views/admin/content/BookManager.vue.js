/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBookAdminList, deleteBook, updateBook, getBookCommentList, deleteBookComment } from '@/api/adminBook';
import { ElMessage, ElMessageBox } from 'element-plus';
const router = useRouter();
const books = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// 评论相关
const commentDialogVisible = ref(false);
const commentLoading = ref(false);
const comments = ref([]);
const currentBookId = ref(null);
const currentBookTitle = ref('');
const commentPage = ref(1);
const commentSize = ref(10);
const commentTotal = ref(0);
const fetchBooks = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            size: pageSize.value
        };
        if (searchQuery.value) {
            params.keyword = searchQuery.value;
        }
        if (filterStatus.value !== '') {
            params.status = filterStatus.value;
        }
        const res = await getBookAdminList(params);
        if (res.code === 200) {
            books.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        loading.value = false;
    }
};
const handleAdd = () => {
    router.push('/admin/content/books/create');
};
const handleEdit = (row) => {
    router.push(`/admin/content/books/edit/${row.id}`);
};
const handleToggleStatus = async (row) => {
    const newStatus = row.status === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? '上架' : '下架';
    try {
        const res = await updateBook(row.id, { status: newStatus });
        if (res.code === 200) {
            ElMessage.success(`${actionText}成功`);
            fetchBooks();
        }
        else {
            ElMessage.error(res.message || `${actionText}失败`);
        }
    }
    catch (error) {
        ElMessage.error(`${actionText}失败`);
    }
};
const handleDelete = (row) => {
    ElMessageBox.confirm('确定删除这本书吗？删除后无法恢复。', '删除确认', { type: 'warning' }).then(async () => {
        try {
            const res = await deleteBook(row.id);
            if (res.code === 200) {
                ElMessage.success('删除成功');
                fetchBooks();
            }
            else {
                ElMessage.error(res.message || '删除失败');
            }
        }
        catch (error) {
            ElMessage.error('删除失败');
        }
    }).catch(() => { });
};
const handleViewComments = (row) => {
    currentBookId.value = row.id;
    currentBookTitle.value = row.title;
    commentDialogVisible.value = true;
    commentPage.value = 1;
    fetchComments();
};
const fetchComments = async () => {
    if (!currentBookId.value)
        return;
    commentLoading.value = true;
    try {
        const res = await getBookCommentList(currentBookId.value, {
            page: commentPage.value,
            size: commentSize.value
        });
        if (res.code === 200) {
            comments.value = res.data.records;
            commentTotal.value = res.data.total;
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        commentLoading.value = false;
    }
};
const handleDeleteComment = (row) => {
    ElMessageBox.confirm('确定删除这条评论吗？', '删除确认', { type: 'warning' }).then(async () => {
        try {
            const res = await deleteBookComment(row.id);
            if (res.code === 200) {
                ElMessage.success('删除成功');
                // 同步减少评论数
                const book = books.value.find(b => b.id === currentBookId.value);
                if (book && book.commentCount > 0) {
                    book.commentCount--;
                }
                fetchComments();
            }
            else {
                ElMessage.error(res.message || '删除失败');
            }
        }
        catch (error) {
            ElMessage.error('删除失败');
        }
    }).catch(() => { });
};
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "book-manager" },
});
/** @type {__VLS_StyleScopedClasses['book-manager']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.handleAdd) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[handleAdd,];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-bar" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filterStatus),
    placeholder: "选择状态",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_10 = __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filterStatus),
    placeholder: "选择状态",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ change: {} },
    { onChange: (__VLS_ctx.fetchBooks) });
const { default: __VLS_15 } = __VLS_11.slots;
let __VLS_16;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    label: "全部",
    value: "",
}));
const __VLS_18 = __VLS_17({
    label: "全部",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    label: "上架",
    value: (1),
}));
const __VLS_23 = __VLS_22({
    label: "上架",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    label: "下架",
    value: (0),
}));
const __VLS_28 = __VLS_27({
    label: "下架",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
// @ts-ignore
[filterStatus, fetchBooks,];
var __VLS_11;
var __VLS_12;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索书籍标题",
    ...{ style: {} },
}));
const __VLS_33 = __VLS_32({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索书籍标题",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
let __VLS_36;
const __VLS_37 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.fetchBooks) });
var __VLS_34;
var __VLS_35;
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    ...{ 'onClick': {} },
}));
const __VLS_40 = __VLS_39({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
let __VLS_43;
const __VLS_44 = ({ click: {} },
    { onClick: (__VLS_ctx.fetchBooks) });
const { default: __VLS_45 } = __VLS_41.slots;
// @ts-ignore
[fetchBooks, fetchBooks, searchQuery,];
var __VLS_41;
var __VLS_42;
let __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    data: (__VLS_ctx.books),
    ...{ style: {} },
}));
const __VLS_48 = __VLS_47({
    data: (__VLS_ctx.books),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_51 } = __VLS_49.slots;
let __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_54 = __VLS_53({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    label: "封面",
    width: "100",
}));
const __VLS_59 = __VLS_58({
    label: "封面",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
const { default: __VLS_62 } = __VLS_60.slots;
{
    const { default: __VLS_63 } = __VLS_60.slots;
    const [scope] = __VLS_vSlot(__VLS_63);
    if (scope.row.coverUrl) {
        let __VLS_64;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage | typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
            src: (scope.row.coverUrl),
            ...{ style: {} },
            fit: "cover",
            previewSrcList: ([scope.row.coverUrl]),
            previewTeleported: true,
        }));
        const __VLS_66 = __VLS_65({
            src: (scope.row.coverUrl),
            ...{ style: {} },
            fit: "cover",
            previewSrcList: ([scope.row.coverUrl]),
            previewTeleported: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [books, vLoading, loading,];
}
// @ts-ignore
[];
var __VLS_60;
let __VLS_69;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    prop: "title",
    label: "标题",
    minWidth: "200",
}));
const __VLS_71 = __VLS_70({
    prop: "title",
    label: "标题",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_74;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    prop: "description",
    label: "简介",
    minWidth: "200",
}));
const __VLS_76 = __VLS_75({
    prop: "description",
    label: "简介",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
const { default: __VLS_79 } = __VLS_77.slots;
{
    const { default: __VLS_80 } = __VLS_77.slots;
    const [scope] = __VLS_vSlot(__VLS_80);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "description-text" },
    });
    /** @type {__VLS_StyleScopedClasses['description-text']} */ ;
    (scope.row.description || '-');
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_77;
let __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
    prop: "viewCount",
    label: "浏览数",
    width: "100",
}));
const __VLS_83 = __VLS_82({
    prop: "viewCount",
    label: "浏览数",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
let __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
    prop: "commentCount",
    label: "评论数",
    width: "100",
}));
const __VLS_88 = __VLS_87({
    prop: "commentCount",
    label: "评论数",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    prop: "sortOrder",
    label: "排序",
    width: "80",
}));
const __VLS_93 = __VLS_92({
    prop: "sortOrder",
    label: "排序",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
let __VLS_96;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_98 = __VLS_97({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const { default: __VLS_101 } = __VLS_99.slots;
{
    const { default: __VLS_102 } = __VLS_99.slots;
    const [scope] = __VLS_vSlot(__VLS_102);
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        type: (scope.row.status === 1 ? 'success' : 'info'),
    }));
    const __VLS_105 = __VLS_104({
        type: (scope.row.status === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    const { default: __VLS_108 } = __VLS_106.slots;
    (scope.row.status === 1 ? '上架' : '下架');
    // @ts-ignore
    [];
    var __VLS_106;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_99;
let __VLS_109;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
    prop: "createTime",
    label: "创建时间",
    width: "180",
}));
const __VLS_111 = __VLS_110({
    prop: "createTime",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_114;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    label: "操作",
    width: "280",
    fixed: "right",
}));
const __VLS_116 = __VLS_115({
    label: "操作",
    width: "280",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
const { default: __VLS_119 } = __VLS_117.slots;
{
    const { default: __VLS_120 } = __VLS_117.slots;
    const [scope] = __VLS_vSlot(__VLS_120);
    let __VLS_121;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_123 = __VLS_122({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    let __VLS_126;
    const __VLS_127 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_128 } = __VLS_124.slots;
    // @ts-ignore
    [];
    var __VLS_124;
    var __VLS_125;
    let __VLS_129;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_131 = __VLS_130({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    let __VLS_134;
    const __VLS_135 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleViewComments(scope.row);
                // @ts-ignore
                [handleViewComments,];
            } });
    const { default: __VLS_136 } = __VLS_132.slots;
    // @ts-ignore
    [];
    var __VLS_132;
    var __VLS_133;
    if (scope.row.status === 1) {
        let __VLS_137;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }));
        const __VLS_139 = __VLS_138({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_138));
        let __VLS_142;
        const __VLS_143 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.status === 1))
                        return;
                    __VLS_ctx.handleToggleStatus(scope.row);
                    // @ts-ignore
                    [handleToggleStatus,];
                } });
        const { default: __VLS_144 } = __VLS_140.slots;
        // @ts-ignore
        [];
        var __VLS_140;
        var __VLS_141;
    }
    else {
        let __VLS_145;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }));
        const __VLS_147 = __VLS_146({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_146));
        let __VLS_150;
        const __VLS_151 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(scope.row.status === 1))
                        return;
                    __VLS_ctx.handleToggleStatus(scope.row);
                    // @ts-ignore
                    [handleToggleStatus,];
                } });
        const { default: __VLS_152 } = __VLS_148.slots;
        // @ts-ignore
        [];
        var __VLS_148;
        var __VLS_149;
    }
    let __VLS_153;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_155 = __VLS_154({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_154));
    let __VLS_158;
    const __VLS_159 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_160 } = __VLS_156.slots;
    // @ts-ignore
    [];
    var __VLS_156;
    var __VLS_157;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_117;
// @ts-ignore
[];
var __VLS_49;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_161;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}));
const __VLS_163 = __VLS_162({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
let __VLS_166;
const __VLS_167 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchBooks) });
var __VLS_164;
var __VLS_165;
let __VLS_168;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({
    modelValue: (__VLS_ctx.commentDialogVisible),
    title: "评论管理",
    width: "800px",
}));
const __VLS_170 = __VLS_169({
    modelValue: (__VLS_ctx.commentDialogVisible),
    title: "评论管理",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
const { default: __VLS_173 } = __VLS_171.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "comment-header" },
});
/** @type {__VLS_StyleScopedClasses['comment-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.currentBookTitle);
let __VLS_174;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
    data: (__VLS_ctx.comments),
    ...{ style: {} },
    maxHeight: "400",
}));
const __VLS_176 = __VLS_175({
    data: (__VLS_ctx.comments),
    ...{ style: {} },
    maxHeight: "400",
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.commentLoading) }, null, null);
const { default: __VLS_179 } = __VLS_177.slots;
let __VLS_180;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_182 = __VLS_181({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
let __VLS_185;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
    prop: "userNickname",
    label: "用户",
    width: "120",
}));
const __VLS_187 = __VLS_186({
    prop: "userNickname",
    label: "用户",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
const { default: __VLS_190 } = __VLS_188.slots;
{
    const { default: __VLS_191 } = __VLS_188.slots;
    const [scope] = __VLS_vSlot(__VLS_191);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    let __VLS_192;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent1(__VLS_192, new __VLS_192({
        size: (24),
        src: (scope.row.userAvatar),
    }));
    const __VLS_194 = __VLS_193({
        size: (24),
        src: (scope.row.userAvatar),
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    const { default: __VLS_197 } = __VLS_195.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    });
    // @ts-ignore
    [fetchBooks, vLoading, currentPage, pageSize, total, commentDialogVisible, currentBookTitle, comments, commentLoading,];
    var __VLS_195;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ style: {} },
    });
    (scope.row.userNickname);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_188;
let __VLS_198;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({
    prop: "content",
    label: "评论内容",
}));
const __VLS_200 = __VLS_199({
    prop: "content",
    label: "评论内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
let __VLS_203;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_204 = __VLS_asFunctionalComponent1(__VLS_203, new __VLS_203({
    prop: "createTime",
    label: "评论时间",
    width: "180",
}));
const __VLS_205 = __VLS_204({
    prop: "createTime",
    label: "评论时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_204));
let __VLS_208;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent1(__VLS_208, new __VLS_208({
    label: "操作",
    width: "100",
    fixed: "right",
}));
const __VLS_210 = __VLS_209({
    label: "操作",
    width: "100",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
const { default: __VLS_213 } = __VLS_211.slots;
{
    const { default: __VLS_214 } = __VLS_211.slots;
    const [scope] = __VLS_vSlot(__VLS_214);
    let __VLS_215;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_217 = __VLS_216({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    let __VLS_220;
    const __VLS_221 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDeleteComment(scope.row);
                // @ts-ignore
                [handleDeleteComment,];
            } });
    const { default: __VLS_222 } = __VLS_218.slots;
    // @ts-ignore
    [];
    var __VLS_218;
    var __VLS_219;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_211;
// @ts-ignore
[];
var __VLS_177;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_223;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_224 = __VLS_asFunctionalComponent1(__VLS_223, new __VLS_223({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.commentPage),
    pageSize: (__VLS_ctx.commentSize),
    total: (__VLS_ctx.commentTotal),
    layout: "total, prev, pager, next",
}));
const __VLS_225 = __VLS_224({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.commentPage),
    pageSize: (__VLS_ctx.commentSize),
    total: (__VLS_ctx.commentTotal),
    layout: "total, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_224));
let __VLS_228;
const __VLS_229 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.fetchComments) });
var __VLS_226;
var __VLS_227;
// @ts-ignore
[commentPage, commentSize, commentTotal, fetchComments,];
var __VLS_171;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
