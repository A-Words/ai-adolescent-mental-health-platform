/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPendingArticles, auditArticle, offlineArticle } from '@/api/userArticle';
const router = useRouter();
const loading = ref(false);
const articles = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const detailVisible = ref(false);
const currentArticle = ref(null);
const rejectVisible = ref(false);
const rejectForm = reactive({ reason: '', articleId: null });
const fetchArticles = async () => {
    loading.value = true;
    try {
        const res = await getPendingArticles({ page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            articles.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        ElMessage.error('获取待审核文章失败');
    }
    finally {
        loading.value = false;
    }
};
const viewDetail = (row) => {
    currentArticle.value = row;
    detailVisible.value = true;
};
const handleAudit = async (row, action) => {
    if (!row)
        return;
    try {
        await ElMessageBox.confirm(action === 1 ? '确定通过这篇文章吗？' : '确定拒绝这篇文章吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
        const res = await auditArticle(row.id, { action, reason: '' });
        if (res.code === 200) {
            ElMessage.success(res.data);
            detailVisible.value = false;
            fetchArticles();
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '操作失败');
        }
    }
};
const handleReject = (row) => {
    if (!row)
        return;
    rejectForm.articleId = row.id;
    rejectForm.reason = '';
    rejectVisible.value = true;
};
const confirmReject = async () => {
    if (!rejectForm.reason.trim()) {
        ElMessage.warning('请输入拒绝原因');
        return;
    }
    try {
        const res = await auditArticle(rejectForm.articleId, { action: 2, reason: rejectForm.reason });
        if (res.code === 200) {
            ElMessage.success(res.data);
            rejectVisible.value = false;
            detailVisible.value = false;
            fetchArticles();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '操作失败');
    }
};
const goToUserHome = (userId) => {
    router.push(`/user-home/${userId}`);
};
const handleOffline = async (row) => {
    if (!row)
        return;
    try {
        await ElMessageBox.confirm('确定要下架这篇文章吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
        const res = await offlineArticle(row.id, '管理员下架');
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchArticles();
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '操作失败');
        }
    }
};
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchArticles();
};
onMounted(() => {
    fetchArticles();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['user-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['article-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['article-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['article-detail']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "article-audit-container" },
});
/** @type {__VLS_StyleScopedClasses['article-audit-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { header: __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    data: (__VLS_ctx.articles),
    border: true,
    stripe: true,
}));
const __VLS_9 = __VLS_8({
    data: (__VLS_ctx.articles),
    border: true,
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_12 } = __VLS_10.slots;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_15 = __VLS_14({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    prop: "title",
    label: "文章标题",
    minWidth: "200",
}));
const __VLS_20 = __VLS_19({
    prop: "title",
    label: "文章标题",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
{
    const { default: __VLS_24 } = __VLS_21.slots;
    const [{ row }] = __VLS_vSlot(__VLS_24);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-title-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['article-title-cell']} */ ;
    if (row.coverUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (row.coverUrl),
            ...{ class: "cover-thumb" },
        });
        /** @type {__VLS_StyleScopedClasses['cover-thumb']} */ ;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "title-text" },
    });
    /** @type {__VLS_StyleScopedClasses['title-text']} */ ;
    (row.title);
    // @ts-ignore
    [articles, vLoading, loading,];
}
// @ts-ignore
[];
var __VLS_21;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    label: "发布者",
    width: "150",
}));
const __VLS_27 = __VLS_26({
    label: "发布者",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
{
    const { default: __VLS_31 } = __VLS_28.slots;
    const [{ row }] = __VLS_vSlot(__VLS_31);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-cell" },
    });
    /** @type {__VLS_StyleScopedClasses['user-cell']} */ ;
    let __VLS_32;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        size: (32),
        src: (row.userAvatar),
    }));
    const __VLS_34 = __VLS_33({
        size: (32),
        src: (row.userAvatar),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const { default: __VLS_37 } = __VLS_35.slots;
    {
        const { default: __VLS_38 } = __VLS_35.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_35;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.goToUserHome(row.userId);
                // @ts-ignore
                [goToUserHome,];
            } },
        ...{ class: "nickname" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['nickname']} */ ;
    (row.userNickname);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_28;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    prop: "tagName",
    label: "标签",
    width: "100",
}));
const __VLS_41 = __VLS_40({
    prop: "tagName",
    label: "标签",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_44 } = __VLS_42.slots;
{
    const { default: __VLS_45 } = __VLS_42.slots;
    const [{ row }] = __VLS_vSlot(__VLS_45);
    if (row.tagName) {
        let __VLS_46;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            size: "small",
        }));
        const __VLS_48 = __VLS_47({
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        const { default: __VLS_51 } = __VLS_49.slots;
        (row.tagName);
        // @ts-ignore
        [];
        var __VLS_49;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_42;
let __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}));
const __VLS_54 = __VLS_53({
    prop: "createTime",
    label: "提交时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    label: "操作",
    width: "280",
    fixed: "right",
}));
const __VLS_59 = __VLS_58({
    label: "操作",
    width: "280",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
const { default: __VLS_62 } = __VLS_60.slots;
{
    const { default: __VLS_63 } = __VLS_60.slots;
    const [{ row }] = __VLS_vSlot(__VLS_63);
    let __VLS_64;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_69;
    const __VLS_70 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewDetail(row);
                // @ts-ignore
                [viewDetail,];
            } });
    const { default: __VLS_71 } = __VLS_67.slots;
    // @ts-ignore
    [];
    var __VLS_67;
    var __VLS_68;
    let __VLS_72;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        size: "small",
        type: "success",
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        size: "small",
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_77;
    const __VLS_78 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleAudit(row, 1);
                // @ts-ignore
                [handleAudit,];
            } });
    const { default: __VLS_79 } = __VLS_75.slots;
    // @ts-ignore
    [];
    var __VLS_75;
    var __VLS_76;
    let __VLS_80;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_85;
    const __VLS_86 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleReject(row);
                // @ts-ignore
                [handleReject,];
            } });
    const { default: __VLS_87 } = __VLS_83.slots;
    // @ts-ignore
    [];
    var __VLS_83;
    var __VLS_84;
    let __VLS_88;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
        ...{ 'onClick': {} },
        size: "small",
        type: "warning",
    }));
    const __VLS_90 = __VLS_89({
        ...{ 'onClick': {} },
        size: "small",
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    let __VLS_93;
    const __VLS_94 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleOffline(row);
                // @ts-ignore
                [handleOffline,];
            } });
    const { default: __VLS_95 } = __VLS_91.slots;
    // @ts-ignore
    [];
    var __VLS_91;
    var __VLS_92;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_60;
// @ts-ignore
[];
var __VLS_10;
if (__VLS_ctx.total > 0) {
    let __VLS_96;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_98 = __VLS_97({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    let __VLS_101;
    const __VLS_102 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_99;
    var __VLS_100;
}
let __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    modelValue: (__VLS_ctx.detailVisible),
    title: "文章详情",
    width: "800px",
}));
const __VLS_105 = __VLS_104({
    modelValue: (__VLS_ctx.detailVisible),
    title: "文章详情",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
const { default: __VLS_108 } = __VLS_106.slots;
if (__VLS_ctx.currentArticle) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "article-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['article-detail']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
    (__VLS_ctx.currentArticle.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "meta" },
    });
    /** @type {__VLS_StyleScopedClasses['meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.currentArticle.userNickname);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.currentArticle.tagName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.currentArticle.createTime);
    if (__VLS_ctx.currentArticle.coverUrl) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "cover" },
        });
        /** @type {__VLS_StyleScopedClasses['cover']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.currentArticle.coverUrl),
            alt: "封面",
        });
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "content" },
    });
    /** @type {__VLS_StyleScopedClasses['content']} */ ;
    let __VLS_109;
    /** @ts-ignore @type {typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor | typeof __VLS_components.vMdEditor | typeof __VLS_components.VMdEditor} */
    vMdEditor;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
        modelValue: (__VLS_ctx.currentArticle.content),
        mode: "preview",
    }));
    const __VLS_111 = __VLS_110({
        modelValue: (__VLS_ctx.currentArticle.content),
        mode: "preview",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
}
{
    const { footer: __VLS_114 } = __VLS_106.slots;
    let __VLS_115;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
        ...{ 'onClick': {} },
    }));
    const __VLS_117 = __VLS_116({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    let __VLS_120;
    const __VLS_121 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.detailVisible = false;
                // @ts-ignore
                [total, total, currentPage, pageSize, handlePageChange, detailVisible, detailVisible, currentArticle, currentArticle, currentArticle, currentArticle, currentArticle, currentArticle, currentArticle, currentArticle,];
            } });
    const { default: __VLS_122 } = __VLS_118.slots;
    // @ts-ignore
    [];
    var __VLS_118;
    var __VLS_119;
    let __VLS_123;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
        ...{ 'onClick': {} },
        type: "success",
    }));
    const __VLS_125 = __VLS_124({
        ...{ 'onClick': {} },
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_124));
    let __VLS_128;
    const __VLS_129 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleAudit(__VLS_ctx.currentArticle, 1);
                // @ts-ignore
                [handleAudit, currentArticle,];
            } });
    const { default: __VLS_130 } = __VLS_126.slots;
    // @ts-ignore
    [];
    var __VLS_126;
    var __VLS_127;
    let __VLS_131;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
        ...{ 'onClick': {} },
        type: "danger",
    }));
    const __VLS_133 = __VLS_132({
        ...{ 'onClick': {} },
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    let __VLS_136;
    const __VLS_137 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleReject(__VLS_ctx.currentArticle);
                // @ts-ignore
                [handleReject, currentArticle,];
            } });
    const { default: __VLS_138 } = __VLS_134.slots;
    // @ts-ignore
    [];
    var __VLS_134;
    var __VLS_135;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_106;
let __VLS_139;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
    modelValue: (__VLS_ctx.rejectVisible),
    title: "拒绝原因",
    width: "500px",
}));
const __VLS_141 = __VLS_140({
    modelValue: (__VLS_ctx.rejectVisible),
    title: "拒绝原因",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
const { default: __VLS_144 } = __VLS_142.slots;
let __VLS_145;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
    model: (__VLS_ctx.rejectForm),
    labelWidth: "100px",
}));
const __VLS_147 = __VLS_146({
    model: (__VLS_ctx.rejectForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
const { default: __VLS_150 } = __VLS_148.slots;
let __VLS_151;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
    label: "拒绝原因",
    required: true,
}));
const __VLS_153 = __VLS_152({
    label: "拒绝原因",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_152));
const { default: __VLS_156 } = __VLS_154.slots;
let __VLS_157;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
    modelValue: (__VLS_ctx.rejectForm.reason),
    type: "textarea",
    rows: (4),
    placeholder: "请输入拒绝原因，以便作者了解问题",
}));
const __VLS_159 = __VLS_158({
    modelValue: (__VLS_ctx.rejectForm.reason),
    type: "textarea",
    rows: (4),
    placeholder: "请输入拒绝原因，以便作者了解问题",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
// @ts-ignore
[rejectVisible, rejectForm, rejectForm,];
var __VLS_154;
// @ts-ignore
[];
var __VLS_148;
{
    const { footer: __VLS_162 } = __VLS_142.slots;
    let __VLS_163;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
        ...{ 'onClick': {} },
    }));
    const __VLS_165 = __VLS_164({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_164));
    let __VLS_168;
    const __VLS_169 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.rejectVisible = false;
                // @ts-ignore
                [rejectVisible,];
            } });
    const { default: __VLS_170 } = __VLS_166.slots;
    // @ts-ignore
    [];
    var __VLS_166;
    var __VLS_167;
    let __VLS_171;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent1(__VLS_171, new __VLS_171({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_173 = __VLS_172({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    let __VLS_176;
    const __VLS_177 = ({ click: {} },
        { onClick: (__VLS_ctx.confirmReject) });
    const { default: __VLS_178 } = __VLS_174.slots;
    // @ts-ignore
    [confirmReject,];
    var __VLS_174;
    var __VLS_175;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_142;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
