/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Bell, Document, User, Star, ChatDotRound } from '@element-plus/icons-vue';
import { getMessages, markMessageRead, markAllMessagesRead, getUnreadCount } from '@/api/message';
const router = useRouter();
const loading = ref(false);
const messages = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const unreadCount = ref(0);
const fetchMessages = async () => {
    loading.value = true;
    try {
        const res = await getMessages({ page: currentPage.value, size: pageSize.value });
        if (res.code === 200) {
            messages.value = res.data.records;
            total.value = res.data.total;
        }
    }
    catch (error) {
        ElMessage.error('获取消息列表失败');
    }
    finally {
        loading.value = false;
    }
};
const fetchUnreadCount = async () => {
    try {
        const res = await getUnreadCount();
        if (res.code === 200) {
            unreadCount.value = res.data;
        }
    }
    catch (error) {
        console.error('获取未读数失败');
    }
};
const getIconClass = (sourceType) => {
    switch (sourceType) {
        case 1: return 'icon-follow';
        case 2: return 'icon-like';
        case 3: return 'icon-like';
        case 4: return 'icon-reply';
        default: return '';
    }
};
const handleReadAndNavigate = async (msg) => {
    // 先标记已读
    if (msg.isRead === 0) {
        try {
            await markMessageRead(msg.id);
            msg.isRead = 1;
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
        catch (error) {
            console.error('标记失败');
        }
    }
    // 根据消息类型跳转
    if (msg.sourceType === 1 && msg.fromUserId) {
        // 关注通知 -> 跳转到用户主页
        router.push(`/user-home/${msg.fromUserId}`);
    }
    else if (msg.sourceId && (msg.sourceType === 2 || msg.sourceType === 3 || msg.sourceType === 4)) {
        // 文章点赞/评论点赞/评论回复 -> 根据 extraType 跳转到对应文章
        if (msg.extraType === 1) {
            // 用户文章 -> /user-article/{authorId}/{articleId}
            router.push(`/user-article/${msg.articleAuthorId}/${msg.sourceId}`);
        }
        else {
            // 官方文章 -> /article/{articleId}
            router.push(`/article/${msg.sourceId}`);
        }
    }
};
const handleMarkAllRead = async () => {
    try {
        const res = await markAllMessagesRead();
        if (res.code === 200) {
            ElMessage.success(res.data);
            messages.value.forEach(m => m.isRead = 1);
            unreadCount.value = 0;
        }
    }
    catch (error) {
        ElMessage.error('操作失败');
    }
};
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchMessages();
};
onMounted(() => {
    fetchMessages();
    fetchUnreadCount();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-pager']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "my-messages-container" },
});
/** @type {__VLS_StyleScopedClasses['my-messages-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
{
    const { header: __VLS_6 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_7;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (__VLS_ctx.unreadCount === 0),
        type: "primary",
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (__VLS_ctx.unreadCount === 0),
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_12;
    const __VLS_13 = ({ click: {} },
        { onClick: (__VLS_ctx.handleMarkAllRead) });
    const { default: __VLS_14 } = __VLS_10.slots;
    // @ts-ignore
    [unreadCount, handleMarkAllRead,];
    var __VLS_10;
    var __VLS_11;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "message-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
/** @type {__VLS_StyleScopedClasses['message-list']} */ ;
if (!__VLS_ctx.loading && __VLS_ctx.messages.length === 0) {
    let __VLS_15;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        description: "暂无消息",
    }));
    const __VLS_17 = __VLS_16({
        description: "暂无消息",
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
}
for (const [msg] of __VLS_vFor((__VLS_ctx.messages))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleReadAndNavigate(msg);
                // @ts-ignore
                [vLoading, loading, loading, messages, messages, handleReadAndNavigate,];
            } },
        key: (msg.id),
        ...{ class: "message-item" },
        ...{ class: ({ unread: msg.isRead === 0, 'follow-msg': msg.sourceType === 1 }) },
    });
    /** @type {__VLS_StyleScopedClasses['message-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['unread']} */ ;
    /** @type {__VLS_StyleScopedClasses['follow-msg']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-icon" },
        ...{ class: (__VLS_ctx.getIconClass(msg.sourceType)) },
    });
    /** @type {__VLS_StyleScopedClasses['message-icon']} */ ;
    if (msg.fromUserAvatar) {
        let __VLS_20;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
            size: (40),
            src: (msg.fromUserAvatar),
        }));
        const __VLS_22 = __VLS_21({
            size: (40),
            src: (msg.fromUserAvatar),
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        const { default: __VLS_25 } = __VLS_23.slots;
        {
            const { default: __VLS_26 } = __VLS_23.slots;
            __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
                src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
            });
            // @ts-ignore
            [getIconClass,];
        }
        // @ts-ignore
        [];
        var __VLS_23;
    }
    else if (msg.sourceType === 1) {
        let __VLS_27;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({}));
        const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
        const { default: __VLS_32 } = __VLS_30.slots;
        let __VLS_33;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({}));
        const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
        // @ts-ignore
        [];
        var __VLS_30;
    }
    else if (msg.sourceType === 2 || msg.sourceType === 3) {
        let __VLS_38;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({}));
        const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
        const { default: __VLS_43 } = __VLS_41.slots;
        let __VLS_44;
        /** @ts-ignore @type {typeof __VLS_components.Star} */
        Star;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({}));
        const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
        // @ts-ignore
        [];
        var __VLS_41;
    }
    else if (msg.sourceType === 4) {
        let __VLS_49;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({}));
        const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
        const { default: __VLS_54 } = __VLS_52.slots;
        let __VLS_55;
        /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
        ChatDotRound;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({}));
        const __VLS_57 = __VLS_56({}, ...__VLS_functionalComponentArgsRest(__VLS_56));
        // @ts-ignore
        [];
        var __VLS_52;
    }
    else if (msg.type === 2) {
        let __VLS_60;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({}));
        const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
        const { default: __VLS_65 } = __VLS_63.slots;
        let __VLS_66;
        /** @ts-ignore @type {typeof __VLS_components.Document} */
        Document;
        // @ts-ignore
        const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({}));
        const __VLS_68 = __VLS_67({}, ...__VLS_functionalComponentArgsRest(__VLS_67));
        // @ts-ignore
        [];
        var __VLS_63;
    }
    else {
        let __VLS_71;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({}));
        const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
        const { default: __VLS_76 } = __VLS_74.slots;
        let __VLS_77;
        /** @ts-ignore @type {typeof __VLS_components.Bell} */
        Bell;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({}));
        const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
        // @ts-ignore
        [];
        var __VLS_74;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-content" },
    });
    /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-title" },
    });
    /** @type {__VLS_StyleScopedClasses['message-title']} */ ;
    (msg.title);
    if (msg.sourceType === 1) {
        let __VLS_82;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
            size: "small",
            type: "primary",
        }));
        const __VLS_84 = __VLS_83({
            size: "small",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_83));
        const { default: __VLS_87 } = __VLS_85.slots;
        // @ts-ignore
        [];
        var __VLS_85;
    }
    else if (msg.sourceType === 2) {
        let __VLS_88;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
            size: "small",
            type: "danger",
        }));
        const __VLS_90 = __VLS_89({
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        const { default: __VLS_93 } = __VLS_91.slots;
        // @ts-ignore
        [];
        var __VLS_91;
    }
    else if (msg.sourceType === 3) {
        let __VLS_94;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
            size: "small",
            type: "danger",
        }));
        const __VLS_96 = __VLS_95({
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_95));
        const { default: __VLS_99 } = __VLS_97.slots;
        // @ts-ignore
        [];
        var __VLS_97;
    }
    else if (msg.sourceType === 4) {
        let __VLS_100;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
            size: "small",
            type: "success",
        }));
        const __VLS_102 = __VLS_101({
            size: "small",
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        const { default: __VLS_105 } = __VLS_103.slots;
        // @ts-ignore
        [];
        var __VLS_103;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-body" },
    });
    /** @type {__VLS_StyleScopedClasses['message-body']} */ ;
    (msg.content);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-time" },
    });
    /** @type {__VLS_StyleScopedClasses['message-time']} */ ;
    (msg.createTime);
    if (msg.isRead === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "message-status" },
        });
        /** @type {__VLS_StyleScopedClasses['message-status']} */ ;
        let __VLS_106;
        /** @ts-ignore @type {typeof __VLS_components.elBadge | typeof __VLS_components.ElBadge | typeof __VLS_components.elBadge | typeof __VLS_components.ElBadge} */
        elBadge;
        // @ts-ignore
        const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
            isDot: true,
        }));
        const __VLS_108 = __VLS_107({
            isDot: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    }
    // @ts-ignore
    [];
}
if (__VLS_ctx.total > 0) {
    let __VLS_111;
    /** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
    elPagination;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }));
    const __VLS_113 = __VLS_112({
        ...{ 'onCurrentChange': {} },
        ...{ class: "pagination" },
        currentPage: (__VLS_ctx.currentPage),
        pageSize: (__VLS_ctx.pageSize),
        total: (__VLS_ctx.total),
        layout: "prev, pager, next",
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    let __VLS_116;
    const __VLS_117 = ({ currentChange: {} },
        { onCurrentChange: (__VLS_ctx.handlePageChange) });
    /** @type {__VLS_StyleScopedClasses['pagination']} */ ;
    var __VLS_114;
    var __VLS_115;
}
// @ts-ignore
[total, total, currentPage, pageSize, handlePageChange,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
