/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { offlineUserArticle, onlineUserArticle } from '@/api/userArticle';
const router = useRouter();
const articles = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const user = JSON.parse(localStorage.getItem('user') || '{}');
const getRoleName = (role) => {
    const roleMap = {
        1: '用户',
        2: '医生',
        3: '医院管理员',
        4: '超级管理员'
    };
    return roleMap[role] || '用户';
};
const getStatusName = (status) => {
    const statusMap = {
        0: '待审核',
        1: '已发布',
        2: '已下架'
    };
    return statusMap[status] || '未知';
};
const getStatusType = (status) => {
    const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'info'
    };
    return typeMap[status] || 'info';
};
const fetchArticles = async () => {
    loading.value = true;
    try {
        const res = await request.get('/content/admin/articles', {
            params: {
                title: searchQuery.value,
                role: user.role
            }
        });
        if (res.code === 200) {
            articles.value = res.data.records;
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
    router.push('/admin/content/articles/create');
};
const handleEdit = (row) => {
    router.push(`/admin/content/articles/edit/${row.id}`);
};
const handleOnline = async (row) => {
    try {
        const res = await onlineUserArticle(row.id);
        if (res.code === 200) {
            ElMessage.success(res.data || '上架成功');
            fetchArticles();
        }
        else {
            ElMessage.error(res.message || '上架失败');
        }
    }
    catch (error) {
        ElMessage.error('上架失败');
    }
};
// 重新上架已下架的文章
const handleRepublish = async (row) => {
    try {
        const res = await onlineUserArticle(row.id);
        if (res.code === 200) {
            ElMessage.success(res.data || '重新上架成功');
            fetchArticles();
        }
        else {
            ElMessage.error(res.message || '重新上架失败');
        }
    }
    catch (error) {
        ElMessage.error('重新上架失败');
    }
};
const handleOffline = async (row) => {
    try {
        const res = await offlineUserArticle(row.id);
        if (res.code === 200) {
            ElMessage.success(res.data || '下架成功');
            fetchArticles();
        }
        else {
            ElMessage.error(res.message || '下架失败');
        }
    }
    catch (error) {
        ElMessage.error('下架失败');
    }
};
const handleDelete = (row) => {
    ElMessageBox.confirm('确定删除这篇文章吗？此操作不可恢复。', '删除确认', { type: 'warning' }).then(async () => {
        if (row.source === 'admin') {
            // 管理员文章走管理员API
            const res = await request.delete(`/content/article/${row.id}`, { params: { role: user.role } });
            if (res.code === 200) {
                ElMessage.success('删除成功');
                fetchArticles();
            }
            else {
                ElMessage.error(res.message);
            }
        }
        else {
            // 用户文章走用户文章API
            const res = await request.delete(`/article/user/${row.id}`);
            if (res.code === 200) {
                ElMessage.success('删除成功');
                fetchArticles();
            }
            else {
                ElMessage.error(res.message);
            }
        }
    });
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "article-manager" },
});
/** @type {__VLS_StyleScopedClasses['article-manager']} */ ;
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
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索文章标题",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索文章标题",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.fetchArticles) });
var __VLS_11;
var __VLS_12;
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    ...{ 'onClick': {} },
}));
const __VLS_17 = __VLS_16({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
let __VLS_20;
const __VLS_21 = ({ click: {} },
    { onClick: (__VLS_ctx.fetchArticles) });
const { default: __VLS_22 } = __VLS_18.slots;
// @ts-ignore
[searchQuery, fetchArticles, fetchArticles,];
var __VLS_18;
var __VLS_19;
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    data: (__VLS_ctx.articles),
    ...{ style: {} },
}));
const __VLS_25 = __VLS_24({
    data: (__VLS_ctx.articles),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_28 } = __VLS_26.slots;
let __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_31 = __VLS_30({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    prop: "title",
    label: "标题",
}));
const __VLS_36 = __VLS_35({
    prop: "title",
    label: "标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    prop: "tagName",
    label: "类型",
}));
const __VLS_41 = __VLS_40({
    prop: "tagName",
    label: "类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_44 } = __VLS_42.slots;
{
    const { default: __VLS_45 } = __VLS_42.slots;
    const [scope] = __VLS_vSlot(__VLS_45);
    if (scope.row.tagName) {
        let __VLS_46;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
            size: "small",
            type: "info",
        }));
        const __VLS_48 = __VLS_47({
            size: "small",
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        const { default: __VLS_51 } = __VLS_49.slots;
        (scope.row.tagName);
        // @ts-ignore
        [articles, vLoading, loading,];
        var __VLS_49;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
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
    prop: "authorNickname",
    label: "作者",
}));
const __VLS_54 = __VLS_53({
    prop: "authorNickname",
    label: "作者",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const { default: __VLS_57 } = __VLS_55.slots;
{
    const { default: __VLS_58 } = __VLS_55.slots;
    const [scope] = __VLS_vSlot(__VLS_58);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (scope.row.authorNickname || '-');
    if (scope.row.authorRole) {
        let __VLS_59;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
            size: "small",
            type: "warning",
            ...{ style: {} },
        }));
        const __VLS_61 = __VLS_60({
            size: "small",
            type: "warning",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        const { default: __VLS_64 } = __VLS_62.slots;
        (__VLS_ctx.getRoleName(scope.row.authorRole));
        // @ts-ignore
        [getRoleName,];
        var __VLS_62;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_55;
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    prop: "status",
    label: "状态",
}));
const __VLS_67 = __VLS_66({
    prop: "status",
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
const { default: __VLS_70 } = __VLS_68.slots;
{
    const { default: __VLS_71 } = __VLS_68.slots;
    const [scope] = __VLS_vSlot(__VLS_71);
    let __VLS_72;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        type: (__VLS_ctx.getStatusType(scope.row.status)),
    }));
    const __VLS_74 = __VLS_73({
        type: (__VLS_ctx.getStatusType(scope.row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    const { default: __VLS_77 } = __VLS_75.slots;
    (__VLS_ctx.getStatusName(scope.row.status));
    // @ts-ignore
    [getStatusType, getStatusName,];
    var __VLS_75;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_68;
let __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    prop: "createTime",
    label: "创建时间",
}));
const __VLS_80 = __VLS_79({
    prop: "createTime",
    label: "创建时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
let __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
    label: "操作",
    width: "280",
}));
const __VLS_85 = __VLS_84({
    label: "操作",
    width: "280",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
const { default: __VLS_88 } = __VLS_86.slots;
{
    const { default: __VLS_89 } = __VLS_86.slots;
    const [scope] = __VLS_vSlot(__VLS_89);
    if (scope.row.source === 'admin' && scope.row.editable) {
        let __VLS_90;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
            ...{ 'onClick': {} },
            size: "small",
        }));
        const __VLS_92 = __VLS_91({
            ...{ 'onClick': {} },
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_91));
        let __VLS_95;
        const __VLS_96 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(scope.row.source === 'admin' && scope.row.editable))
                        return;
                    __VLS_ctx.handleEdit(scope.row);
                    // @ts-ignore
                    [handleEdit,];
                } });
        const { default: __VLS_97 } = __VLS_93.slots;
        // @ts-ignore
        [];
        var __VLS_93;
        var __VLS_94;
    }
    if (scope.row.source === 'user') {
        if (scope.row.status === 0) {
            let __VLS_98;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
                ...{ 'onClick': {} },
                size: "small",
                type: "success",
            }));
            const __VLS_100 = __VLS_99({
                ...{ 'onClick': {} },
                size: "small",
                type: "success",
            }, ...__VLS_functionalComponentArgsRest(__VLS_99));
            let __VLS_103;
            const __VLS_104 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(scope.row.source === 'user'))
                            return;
                        if (!(scope.row.status === 0))
                            return;
                        __VLS_ctx.handleOnline(scope.row);
                        // @ts-ignore
                        [handleOnline,];
                    } });
            const { default: __VLS_105 } = __VLS_101.slots;
            // @ts-ignore
            [];
            var __VLS_101;
            var __VLS_102;
        }
        if (scope.row.status === 0) {
            let __VLS_106;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
                ...{ 'onClick': {} },
                size: "small",
                type: "warning",
            }));
            const __VLS_108 = __VLS_107({
                ...{ 'onClick': {} },
                size: "small",
                type: "warning",
            }, ...__VLS_functionalComponentArgsRest(__VLS_107));
            let __VLS_111;
            const __VLS_112 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(scope.row.source === 'user'))
                            return;
                        if (!(scope.row.status === 0))
                            return;
                        __VLS_ctx.handleOffline(scope.row);
                        // @ts-ignore
                        [handleOffline,];
                    } });
            const { default: __VLS_113 } = __VLS_109.slots;
            // @ts-ignore
            [];
            var __VLS_109;
            var __VLS_110;
        }
        if (scope.row.status === 1) {
            let __VLS_114;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
                ...{ 'onClick': {} },
                size: "small",
                type: "warning",
            }));
            const __VLS_116 = __VLS_115({
                ...{ 'onClick': {} },
                size: "small",
                type: "warning",
            }, ...__VLS_functionalComponentArgsRest(__VLS_115));
            let __VLS_119;
            const __VLS_120 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(scope.row.source === 'user'))
                            return;
                        if (!(scope.row.status === 1))
                            return;
                        __VLS_ctx.handleOffline(scope.row);
                        // @ts-ignore
                        [handleOffline,];
                    } });
            const { default: __VLS_121 } = __VLS_117.slots;
            // @ts-ignore
            [];
            var __VLS_117;
            var __VLS_118;
        }
        if (scope.row.status === 2) {
            let __VLS_122;
            /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
            elButton;
            // @ts-ignore
            const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
                ...{ 'onClick': {} },
                size: "small",
                type: "success",
            }));
            const __VLS_124 = __VLS_123({
                ...{ 'onClick': {} },
                size: "small",
                type: "success",
            }, ...__VLS_functionalComponentArgsRest(__VLS_123));
            let __VLS_127;
            const __VLS_128 = ({ click: {} },
                { onClick: (...[$event]) => {
                        if (!(scope.row.source === 'user'))
                            return;
                        if (!(scope.row.status === 2))
                            return;
                        __VLS_ctx.handleRepublish(scope.row);
                        // @ts-ignore
                        [handleRepublish,];
                    } });
            const { default: __VLS_129 } = __VLS_125.slots;
            // @ts-ignore
            [];
            var __VLS_125;
            var __VLS_126;
        }
    }
    let __VLS_130;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_132 = __VLS_131({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_131));
    let __VLS_135;
    const __VLS_136 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_137 } = __VLS_133.slots;
    // @ts-ignore
    [];
    var __VLS_133;
    var __VLS_134;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_86;
// @ts-ignore
[];
var __VLS_26;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
