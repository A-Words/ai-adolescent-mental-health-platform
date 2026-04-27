/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/api/user';
import { ElMessage, ElMessageBox } from 'element-plus';
const router = useRouter();
const templates = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const fetchTemplates = async () => {
    loading.value = true;
    try {
        const res = await request.get('/assessment/admin/templates', { params: { title: searchQuery.value } });
        if (res.code === 200) {
            templates.value = res.data.records;
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
    router.push('/admin/content/assessments/create');
};
const handleEdit = (row) => {
    router.push(`/admin/content/assessments/edit/${row.id}`);
};
const handleDelete = (id) => {
    ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/assessment/template/${id}`);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            fetchTemplates();
        }
    });
};
onMounted(() => {
    fetchTemplates();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "assessment-manager" },
});
/** @type {__VLS_StyleScopedClasses['assessment-manager']} */ ;
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
    placeholder: "搜索量表标题",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索量表标题",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.fetchTemplates) });
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
    { onClick: (__VLS_ctx.fetchTemplates) });
const { default: __VLS_22 } = __VLS_18.slots;
// @ts-ignore
[searchQuery, fetchTemplates, fetchTemplates,];
var __VLS_18;
var __VLS_19;
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    data: (__VLS_ctx.templates),
    ...{ style: {} },
}));
const __VLS_25 = __VLS_24({
    data: (__VLS_ctx.templates),
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
    prop: "type",
    label: "类型",
}));
const __VLS_41 = __VLS_40({
    prop: "type",
    label: "类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_44 } = __VLS_42.slots;
{
    const { default: __VLS_45 } = __VLS_42.slots;
    const [scope] = __VLS_vSlot(__VLS_45);
    if (scope.row.type === 'TRADITIONAL') {
        let __VLS_46;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({}));
        const __VLS_48 = __VLS_47({}, ...__VLS_functionalComponentArgsRest(__VLS_47));
        const { default: __VLS_51 } = __VLS_49.slots;
        // @ts-ignore
        [templates, vLoading, loading,];
        var __VLS_49;
    }
    else if (scope.row.type === 'QUICK') {
        let __VLS_52;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
            type: "warning",
        }));
        const __VLS_54 = __VLS_53({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        const { default: __VLS_57 } = __VLS_55.slots;
        // @ts-ignore
        [];
        var __VLS_55;
    }
    else {
        let __VLS_58;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            type: "success",
        }));
        const __VLS_60 = __VLS_59({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        const { default: __VLS_63 } = __VLS_61.slots;
        // @ts-ignore
        [];
        var __VLS_61;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_42;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    prop: "isPublic",
    label: "可见性",
}));
const __VLS_66 = __VLS_65({
    prop: "isPublic",
    label: "可见性",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
{
    const { default: __VLS_70 } = __VLS_67.slots;
    const [scope] = __VLS_vSlot(__VLS_70);
    let __VLS_71;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
        type: (scope.row.isPublic === 1 ? 'success' : 'warning'),
    }));
    const __VLS_73 = __VLS_72({
        type: (scope.row.isPublic === 1 ? 'success' : 'warning'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_72));
    const { default: __VLS_76 } = __VLS_74.slots;
    (scope.row.isPublic === 1 ? '公开' : '仅医生可见');
    // @ts-ignore
    [];
    var __VLS_74;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_67;
let __VLS_77;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
    prop: "status",
    label: "状态",
}));
const __VLS_79 = __VLS_78({
    prop: "status",
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
const { default: __VLS_82 } = __VLS_80.slots;
{
    const { default: __VLS_83 } = __VLS_80.slots;
    const [scope] = __VLS_vSlot(__VLS_83);
    let __VLS_84;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        type: (scope.row.status === 1 ? 'success' : 'info'),
    }));
    const __VLS_86 = __VLS_85({
        type: (scope.row.status === 1 ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const { default: __VLS_89 } = __VLS_87.slots;
    (scope.row.status === 1 ? '已发布' : '草稿');
    // @ts-ignore
    [];
    var __VLS_87;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_80;
let __VLS_90;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    label: "操作",
    width: "200",
}));
const __VLS_92 = __VLS_91({
    label: "操作",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
const { default: __VLS_95 } = __VLS_93.slots;
{
    const { default: __VLS_96 } = __VLS_93.slots;
    const [scope] = __VLS_vSlot(__VLS_96);
    let __VLS_97;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_99 = __VLS_98({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    let __VLS_102;
    const __VLS_103 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(scope.row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_104 } = __VLS_100.slots;
    // @ts-ignore
    [];
    var __VLS_100;
    var __VLS_101;
    let __VLS_105;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_107 = __VLS_106({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_110;
    const __VLS_111 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(scope.row.id);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_112 } = __VLS_108.slots;
    // @ts-ignore
    [];
    var __VLS_108;
    var __VLS_109;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_93;
// @ts-ignore
[];
var __VLS_26;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
