/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { getUserFollowings, getUserFollowers, followUser, unfollowUser } from '@/api/follow';
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const activeTab = ref(route.query.tab === 'followers' ? 'followers' : 'followings');
const users = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
const targetUserId = computed(() => Number(route.params.userId));
const targetNickname = computed(() => route.query.nickname || '该用户');
const isOwnPage = (userId) => currentUserId === userId;
const fetchFollowings = async () => {
    loading.value = true;
    try {
        const res = await getUserFollowings(targetUserId.value, { page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            users.value = res.data.records;
            total.value = res.data.total;
        }
        else if (res.code === 403) {
            users.value = [];
            total.value = 0;
            ElMessage.warning(res.message || '该用户设置了隐私，不允许查看关注列表');
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
        const res = await getUserFollowers(targetUserId.value, { page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            users.value = res.data.records;
            total.value = res.data.total;
        }
        else if (res.code === 403) {
            users.value = [];
            total.value = 0;
            ElMessage.warning(res.message || '该用户设置了隐私，不允许查看粉丝列表');
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
const goBack = () => {
    router.back();
};
watch([activeTab, () => route.params.userId], () => {
    currentPage.value = 1;
    if (activeTab.value === 'followings') {
        fetchFollowings();
    }
    else {
        fetchFollowers();
    }
}, { immediate: true });
onMounted(() => {
    if (activeTab.value === 'followings') {
        fetchFollowings();
    }
    else {
        fetchFollowers();
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['user-item']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['nickname']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-follow-list-container" },
});
/** @type {__VLS_StyleScopedClasses['user-follow-list-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_8 = __VLS_7({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_11;
const __VLS_12 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
const { default: __VLS_13 } = __VLS_9.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.ArrowLeft} */
ArrowLeft;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
// @ts-ignore
[goBack,];
var __VLS_17;
// @ts-ignore
[];
var __VLS_9;
var __VLS_10;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
(__VLS_ctx.targetNickname);
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_27 = __VLS_26({
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    label: "关注",
    name: "followings",
}));
const __VLS_33 = __VLS_32({
    label: "关注",
    name: "followings",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
const { default: __VLS_36 } = __VLS_34.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.users.length === 0) {
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        description: "还没有关注任何人",
    }));
    const __VLS_39 = __VLS_38({
        description: "还没有关注任何人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
}
for (const [user] of __VLS_vFor((__VLS_ctx.users))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (user.userId),
        ...{ class: "user-item" },
    });
    /** @type {__VLS_StyleScopedClasses['user-item']} */ ;
    let __VLS_42;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        ...{ 'onClick': {} },
        size: (50),
        src: (user.headPath),
        ...{ class: "clickable-avatar" },
    }));
    const __VLS_44 = __VLS_43({
        ...{ 'onClick': {} },
        size: (50),
        src: (user.headPath),
        ...{ class: "clickable-avatar" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_47;
    const __VLS_48 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [targetNickname, activeTab, vLoading, loading, loading, users, users, visitHome,];
            } });
    /** @type {__VLS_StyleScopedClasses['clickable-avatar']} */ ;
    const { default: __VLS_49 } = __VLS_45.slots;
    {
        const { default: __VLS_50 } = __VLS_45.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_45;
    var __VLS_46;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [visitHome,];
            } },
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
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_56;
    const __VLS_57 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [visitHome,];
            } });
    const { default: __VLS_58 } = __VLS_54.slots;
    // @ts-ignore
    [];
    var __VLS_54;
    var __VLS_55;
    if (!__VLS_ctx.isOwnPage(user.userId)) {
        let __VLS_59;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_61 = __VLS_60({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        let __VLS_64;
        const __VLS_65 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.isOwnPage(user.userId)))
                        return;
                    __VLS_ctx.handleUnfollow(user.userId);
                    // @ts-ignore
                    [isOwnPage, handleUnfollow,];
                } });
        const { default: __VLS_66 } = __VLS_62.slots;
        // @ts-ignore
        [];
        var __VLS_62;
        var __VLS_63;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_34;
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    label: "粉丝",
    name: "followers",
}));
const __VLS_69 = __VLS_68({
    label: "粉丝",
    name: "followers",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_72 } = __VLS_70.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.users.length === 0) {
    let __VLS_73;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
        description: "还没有粉丝",
    }));
    const __VLS_75 = __VLS_74({
        description: "还没有粉丝",
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
}
for (const [user] of __VLS_vFor((__VLS_ctx.users))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (user.userId),
        ...{ class: "user-item" },
    });
    /** @type {__VLS_StyleScopedClasses['user-item']} */ ;
    let __VLS_78;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
        ...{ 'onClick': {} },
        size: (50),
        src: (user.headPath),
        ...{ class: "clickable-avatar" },
    }));
    const __VLS_80 = __VLS_79({
        ...{ 'onClick': {} },
        size: (50),
        src: (user.headPath),
        ...{ class: "clickable-avatar" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    let __VLS_83;
    const __VLS_84 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [vLoading, loading, loading, users, users, visitHome,];
            } });
    /** @type {__VLS_StyleScopedClasses['clickable-avatar']} */ ;
    const { default: __VLS_85 } = __VLS_81.slots;
    {
        const { default: __VLS_86 } = __VLS_81.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_81;
    var __VLS_82;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [visitHome,];
            } },
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
    let __VLS_87;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_89 = __VLS_88({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    let __VLS_92;
    const __VLS_93 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.visitHome(user.userId);
                // @ts-ignore
                [visitHome,];
            } });
    const { default: __VLS_94 } = __VLS_90.slots;
    // @ts-ignore
    [];
    var __VLS_90;
    var __VLS_91;
    if (!__VLS_ctx.isOwnPage(user.userId) && !user.isFollowing) {
        let __VLS_95;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }));
        const __VLS_97 = __VLS_96({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        let __VLS_100;
        const __VLS_101 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!__VLS_ctx.isOwnPage(user.userId) && !user.isFollowing))
                        return;
                    __VLS_ctx.handleFollow(user.userId);
                    // @ts-ignore
                    [isOwnPage, handleFollow,];
                } });
        const { default: __VLS_102 } = __VLS_98.slots;
        // @ts-ignore
        [];
        var __VLS_98;
        var __VLS_99;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_70;
// @ts-ignore
[];
var __VLS_28;
if (__VLS_ctx.total > 0) {
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_105 = __VLS_104({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    let __VLS_108;
    const __VLS_109 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_106;
    var __VLS_107;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
