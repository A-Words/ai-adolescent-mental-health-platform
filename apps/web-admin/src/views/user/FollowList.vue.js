/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMyFollowings, getMyFollowers, followUser, unfollowUser } from '@/api/follow';
const router = useRouter();
const loading = ref(false);
const activeTab = ref('followings');
const followings = ref([]);
const followers = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const fetchFollowings = async () => {
    loading.value = true;
    try {
        const res = await getMyFollowings({ page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            followings.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        ElMessage.error('获取关注列表失败');
    }
    finally {
        loading.value = false;
    }
};
const fetchFollowers = async () => {
    loading.value = true;
    try {
        const res = await getMyFollowers({ page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            followers.value = res.data.records;
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
    if (activeTab.value === 'followings') {
        await fetchFollowings();
    }
    else {
        await fetchFollowers();
    }
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
const handleUnfollow = async (userId) => {
    try {
        await ElMessageBox.confirm('确定要取消关注吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const res = await unfollowUser(userId);
        if (res.code === 200) {
            ElMessage.success(res.data);
            fetchFollowings();
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '取消关注失败');
        }
    }
};
onMounted(() => {
    fetchFollowings();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['user-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "follow-list-container" },
});
/** @type {__VLS_StyleScopedClasses['follow-list-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_8 = __VLS_7({
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    label: "我的关注",
    name: "followings",
}));
const __VLS_14 = __VLS_13({
    label: "我的关注",
    name: "followings",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.followings.length === 0) {
    let __VLS_18;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        description: "还没有关注任何人",
    }));
    const __VLS_20 = __VLS_19({
        description: "还没有关注任何人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
}
for (const [user] of __VLS_vFor((__VLS_ctx.followings))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (user.userId),
        ...{ class: "user-item" },
    });
    /** @type {__VLS_StyleScopedClasses['user-item']} */ ;
    let __VLS_23;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
        size: (50),
        src: (user.headPath),
    }));
    const __VLS_25 = __VLS_24({
        size: (50),
        src: (user.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    const { default: __VLS_28 } = __VLS_26.slots;
    {
        const { default: __VLS_29 } = __VLS_26.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [activeTab, vLoading, loading, loading, followings, followings,];
    }
    // @ts-ignore
    [];
    var __VLS_26;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "nickname" },
    });
    /** @type {__VLS_StyleScopedClasses['nickname']} */ ;
    (user.nickname);
    if (user.signature) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "signature" },
        });
        /** @type {__VLS_StyleScopedClasses['signature']} */ ;
        (user.signature);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['user-actions']} */ ;
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [visitHome,];
            } });
    const { default: __VLS_37 } = __VLS_33.slots;
    // @ts-ignore
    [];
    var __VLS_33;
    var __VLS_34;
    let __VLS_38;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_40 = __VLS_39({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    let __VLS_43;
    const __VLS_44 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleUnfollow(user.userId);
                // @ts-ignore
                [handleUnfollow,];
            } });
    const { default: __VLS_45 } = __VLS_41.slots;
    // @ts-ignore
    [];
    var __VLS_41;
    var __VLS_42;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_15;
let __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    label: "我的粉丝",
    name: "followers",
}));
const __VLS_48 = __VLS_47({
    label: "我的粉丝",
    name: "followers",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
const { default: __VLS_51 } = __VLS_49.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.followers.length === 0) {
    let __VLS_52;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        description: "还没有粉丝",
    }));
    const __VLS_54 = __VLS_53({
        description: "还没有粉丝",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
}
for (const [user] of __VLS_vFor((__VLS_ctx.followers))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (user.userId),
        ...{ class: "user-item" },
    });
    /** @type {__VLS_StyleScopedClasses['user-item']} */ ;
    let __VLS_57;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        size: (50),
        src: (user.headPath),
    }));
    const __VLS_59 = __VLS_58({
        size: (50),
        src: (user.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const { default: __VLS_62 } = __VLS_60.slots;
    {
        const { default: __VLS_63 } = __VLS_60.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [vLoading, loading, loading, followers, followers,];
    }
    // @ts-ignore
    [];
    var __VLS_60;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "nickname" },
    });
    /** @type {__VLS_StyleScopedClasses['nickname']} */ ;
    (user.nickname);
    if (user.signature) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "signature" },
        });
        /** @type {__VLS_StyleScopedClasses['signature']} */ ;
        (user.signature);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['user-actions']} */ ;
    let __VLS_64;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_69;
    const __VLS_70 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [visitHome,];
            } });
    const { default: __VLS_71 } = __VLS_67.slots;
    // @ts-ignore
    [];
    var __VLS_67;
    var __VLS_68;
    if (!user.isFollowing) {
        let __VLS_72;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_74 = __VLS_73({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        let __VLS_77;
        const __VLS_78 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!user.isFollowing))
                        return;
                    __VLS_ctx.handleFollow(user.userId);
                    // @ts-ignore
                    [handleFollow,];
                } });
        const { default: __VLS_79 } = __VLS_75.slots;
        // @ts-ignore
        [];
        var __VLS_75;
        var __VLS_76;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_49;
// @ts-ignore
[];
var __VLS_9;
if (__VLS_ctx.total > 0) {
    let __VLS_80;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_85;
    const __VLS_86 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_83;
    var __VLS_84;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
