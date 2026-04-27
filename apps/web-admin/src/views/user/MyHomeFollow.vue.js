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
    ...{ class: "my-home-follow" },
});
/** @type {__VLS_StyleScopedClasses['my-home-follow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "我的关注",
    name: "followings",
}));
const __VLS_8 = __VLS_7({
    label: "我的关注",
    name: "followings",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.followings.length === 0) {
    let __VLS_12;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        description: "还没有关注任何人",
    }));
    const __VLS_14 = __VLS_13({
        description: "还没有关注任何人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
}
for (const [user] of __VLS_vFor((__VLS_ctx.followings))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (user.userId),
        ...{ class: "user-item" },
    });
    /** @type {__VLS_StyleScopedClasses['user-item']} */ ;
    let __VLS_17;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        size: (50),
        src: (user.headPath),
    }));
    const __VLS_19 = __VLS_18({
        size: (50),
        src: (user.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    const { default: __VLS_22 } = __VLS_20.slots;
    {
        const { default: __VLS_23 } = __VLS_20.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [activeTab, vLoading, loading, loading, followings, followings,];
    }
    // @ts-ignore
    [];
    var __VLS_20;
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
    let __VLS_24;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_29;
    const __VLS_30 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [visitHome,];
            } });
    const { default: __VLS_31 } = __VLS_27.slots;
    // @ts-ignore
    [];
    var __VLS_27;
    var __VLS_28;
    let __VLS_32;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_37;
    const __VLS_38 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleUnfollow(user.userId);
                // @ts-ignore
                [handleUnfollow,];
            } });
    const { default: __VLS_39 } = __VLS_35.slots;
    // @ts-ignore
    [];
    var __VLS_35;
    var __VLS_36;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_9;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    label: "我的粉丝",
    name: "followers",
}));
const __VLS_42 = __VLS_41({
    label: "我的粉丝",
    name: "followers",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_45 } = __VLS_43.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.followers.length === 0) {
    let __VLS_46;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
        description: "还没有粉丝",
    }));
    const __VLS_48 = __VLS_47({
        description: "还没有粉丝",
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
}
for (const [user] of __VLS_vFor((__VLS_ctx.followers))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (user.userId),
        ...{ class: "user-item" },
    });
    /** @type {__VLS_StyleScopedClasses['user-item']} */ ;
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        size: (50),
        src: (user.headPath),
    }));
    const __VLS_53 = __VLS_52({
        size: (50),
        src: (user.headPath),
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    const { default: __VLS_56 } = __VLS_54.slots;
    {
        const { default: __VLS_57 } = __VLS_54.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [vLoading, loading, loading, followers, followers,];
    }
    // @ts-ignore
    [];
    var __VLS_54;
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
    let __VLS_58;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_60 = __VLS_59({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    let __VLS_63;
    const __VLS_64 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [visitHome,];
            } });
    const { default: __VLS_65 } = __VLS_61.slots;
    // @ts-ignore
    [];
    var __VLS_61;
    var __VLS_62;
    if (!user.isFollowing) {
        let __VLS_66;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_68 = __VLS_67({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_67));
        let __VLS_71;
        const __VLS_72 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!user.isFollowing))
                        return;
                    __VLS_ctx.handleFollow(user.userId);
                    // @ts-ignore
                    [handleFollow,];
                } });
        const { default: __VLS_73 } = __VLS_69.slots;
        // @ts-ignore
        [];
        var __VLS_69;
        var __VLS_70;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_43;
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.total > 0) {
    let __VLS_74;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_76 = __VLS_75({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_79;
    const __VLS_80 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_77;
    var __VLS_78;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
