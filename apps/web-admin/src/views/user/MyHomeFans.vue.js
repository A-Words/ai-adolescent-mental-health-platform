/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getMyFollowers, followUser } from '@/api/follow';
const router = useRouter();
const loading = ref(false);
const users = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const fetchFollowers = async () => {
    loading.value = true;
    try {
        const res = await getMyFollowers({ page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            users.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        ElMessage.error('获取粉丝列表失败');
    }
    finally {
        loading.value = false;
    }
};
const handlePageChange = async (page) => {
    currentPage.value = page;
    await fetchFollowers();
};
const visitHome = (userId) => {
    router.push(`/user-home/${userId}`);
};
const handleFollow = async (userId) => {
    try {
        const res = await followUser(userId);
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchFollowers();
        }
    }
    catch (error) {
        ElMessage.error(error.message || '关注失败');
    }
};
onMounted(() => {
    fetchFollowers();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['user-item']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['nickname']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-home-fans" },
});
/** @type {__VLS_StyleScopedClasses['my-home-fans']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.users.length === 0) {
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        description: "还没有粉丝",
    }));
    const __VLS_2 = __VLS_1({
        description: "还没有粉丝",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
for (const [item] of __VLS_vFor((__VLS_ctx.users))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (item.userId),
        ...{ class: "user-item" },
    });
    /** @type {__VLS_StyleScopedClasses['user-item']} */ ;
    let __VLS_5;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        size: (50),
        src: (item.headPath),
        ...{ class: "clickable-avatar" },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        size: (50),
        src: (item.headPath),
        ...{ class: "clickable-avatar" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(item.userId);
                // @ts-ignore
                [vLoading, loading, loading, users, users, visitHome,];
            } });
    /** @type {__VLS_StyleScopedClasses['clickable-avatar']} */ ;
    const { default: __VLS_12 } = __VLS_8.slots;
    {
        const { default: __VLS_13 } = __VLS_8.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_8;
    var __VLS_9;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.visitHome(item.userId);
                // @ts-ignore
                [visitHome,];
            } },
        ...{ class: "nickname" },
    });
    /** @type {__VLS_StyleScopedClasses['nickname']} */ ;
    (item.nickname);
    if (item.signature) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "signature" },
        });
        /** @type {__VLS_StyleScopedClasses['signature']} */ ;
        (item.signature);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['user-actions']} */ ;
    let __VLS_14;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_19;
    const __VLS_20 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(item.userId);
                // @ts-ignore
                [visitHome,];
            } });
    const { default: __VLS_21 } = __VLS_17.slots;
    // @ts-ignore
    [];
    var __VLS_17;
    var __VLS_18;
    if (!item.isFollowing) {
        let __VLS_22;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_24 = __VLS_23({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        let __VLS_27;
        const __VLS_28 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!item.isFollowing))
                        return;
                    __VLS_ctx.handleFollow(item.userId);
                    // @ts-ignore
                    [handleFollow,];
                } });
        const { default: __VLS_29 } = __VLS_25.slots;
        // @ts-ignore
        [];
        var __VLS_25;
        var __VLS_26;
    }
    // @ts-ignore
    [];
}
if (__VLS_ctx.total > 0) {
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_33;
    var __VLS_34;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
