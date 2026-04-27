/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useRouter } from 'vue-router';
import { ref, reactive, onMounted, computed } from 'vue';
import { Message, Phone, Clock, Location, Document, DocumentChecked, Medal, Stamp, Search } from '@element-plus/icons-vue';
import { submitPlatformFeedback } from '@/api/feedback';
import { getUnreadCount } from '@/api/message';
import { logout } from '@/api/user';
import { ElMessage } from 'element-plus';
import FloatingButtons from '@/components/FloatingButtons.vue';
import PlatformIntro from '@/components/PlatformIntro.vue'; // 导入平台简介组件
const router = useRouter();
const user = JSON.parse(localStorage.getItem('user') || '{}');
const username = user.nickname || '用户';
const role = user.role || 1;
const is_psychologist = user.isPsychologist || 0;
// 平台简介弹窗控制（全局 footer 入口 + 首次登录欢迎）
const platformIntroVisible = ref(false);
const platformIntroTitle = ref('平台简介');
// 检查是否已登录
const isLoggedIn = computed(() => {
    return !!localStorage.getItem('token') && !!user.id;
});
// 搜索关键词
const searchKeyword = ref('');
const unreadCount = ref(0);
const feedbackVisible = ref(false);
const feedbackForm = reactive({ content: '' });
// 二维码弹窗相关
const qrCodeDialogVisible = ref(false);
const qrCodeDialogTitle = ref('');
const currentQrCodeSrc = ref('');
// 显示平台简介
const showPlatformIntro = () => {
    platformIntroTitle.value = '平台简介';
    platformIntroVisible.value = true;
};
const handlePlatformIntroConfirm = () => {
    localStorage.setItem('hasSeenPlatformIntro', 'true');
    localStorage.removeItem('isFirstLogin');
    platformIntroTitle.value = '平台简介';
};
// 搜索处理
const handleSearch = () => {
    if (!searchKeyword.value.trim()) {
        ElMessage.warning('请输入搜索关键词');
        return;
    }
    router.push({
        path: '/search',
        query: { keyword: searchKeyword.value.trim() }
    });
};
// 清空搜索
const clearSearch = () => {
    searchKeyword.value = '';
};
const fetchUnreadCount = async () => {
    if (!isLoggedIn.value)
        return;
    try {
        const res = await getUnreadCount();
        if (res.code === 200) {
            unreadCount.value = res.data;
        }
    }
    catch (error) {
        console.error('获取未读消息数失败');
    }
};
const handleFeedback = () => {
    if (!isLoggedIn.value) {
        ElMessage.warning('请先登录后再提交反馈');
        router.push('/login');
        return;
    }
    feedbackForm.content = '';
    feedbackVisible.value = true;
};
const submitFeedback = async () => {
    if (!feedbackForm.content) {
        ElMessage.warning('请输入反馈内容');
        return;
    }
    const res = await submitPlatformFeedback(feedbackForm);
    if (res.code === 200) {
        ElMessage.success('提交成功，感谢您的反馈！');
        feedbackVisible.value = false;
    }
    else {
        ElMessage.error(res.message || '提交失败');
    }
};
// todo 显示二维码弹窗,后面转为动态
const showQrCodeDialog = (type) => {
    qrCodeDialogTitle.value = type;
    if (type === '微信小程序') {
        currentQrCodeSrc.value = '/image/2d_code/wechat-miniprogram-qrcode.png';
    }
    else {
        currentQrCodeSrc.value = '/image/2d_code/wechat-miniprogram-qrcode.png';
    }
    qrCodeDialogVisible.value = true;
};
const handleCommand = async (command) => {
    if (command === 'logout') {
        try {
            await logout();
        }
        catch (e) {
            // 忽略退出接口错误
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        ElMessage.success('已退出登录');
        router.push('/login');
    }
    else if (command === 'my-home') {
        router.push('/my-home');
    }
    else if (command === 'my-psychology') {
        router.push('/my-psychology');
    }
    else if (command === 'my-orders') {
        router.push('/my-orders');
    }
    else if (command === 'psychologist-admin') {
        router.push('/psychologist-admin/workbench');
    }
    else if (command === 'apply-psychologist') {
        router.push('/apply-psychologist');
    }
    else if (command === 'backend') {
        if (role === 4)
            router.push('/admin/dashboard');
        else if (role === 3)
            router.push('/hospital/dashboard');
        else if (role === 2)
            router.push('/doctor/dashboard');
        else if (is_psychologist === 1)
            router.push('/psychologist-admin/workbench');
    }
};
const goLogin = () => {
    router.push('/login');
};
const goRegister = () => {
    router.push('/register');
};
onMounted(() => {
    fetchUnreadCount();
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
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-menu-item']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-header']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--text']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-psychologist-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input-group__append']} */ ;
/** @type {__VLS_StyleScopedClasses['search-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input-group__append']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-container']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['el-link']} */ ;
/** @type {__VLS_StyleScopedClasses['qrcode-image']} */ ;
/** @type {__VLS_StyleScopedClasses['qrcode-item']} */ ;
/** @type {__VLS_StyleScopedClasses['copyright']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer | typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer} */
elContainer;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "layout-container" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "layout-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['layout-container']} */ ;
const { default: __VLS_6 } = __VLS_3.slots;
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
    ...{ class: "planet planet-1" },
});
/** @type {__VLS_StyleScopedClasses['planet']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-1']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "planet planet-2" },
});
/** @type {__VLS_StyleScopedClasses['planet']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "planet planet-3" },
});
/** @type {__VLS_StyleScopedClasses['planet']} */ ;
/** @type {__VLS_StyleScopedClasses['planet-3']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "comet" },
});
/** @type {__VLS_StyleScopedClasses['comet']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "content-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elHeader | typeof __VLS_components.ElHeader | typeof __VLS_components.elHeader | typeof __VLS_components.ElHeader} */
elHeader;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({}));
const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
const { default: __VLS_12 } = __VLS_10.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "logo" },
});
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ style: {} },
});
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    ...{ class: "id" },
    src: "/image/title/小可爱.png",
});
/** @type {__VLS_StyleScopedClasses['id']} */ ;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elMenu | typeof __VLS_components.ElMenu | typeof __VLS_components.elMenu | typeof __VLS_components.ElMenu} */
elMenu;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    mode: "horizontal",
    router: true,
    defaultActive: (__VLS_ctx.$route.path),
    ...{ style: {} },
}));
const __VLS_15 = __VLS_14({
    mode: "horizontal",
    router: true,
    defaultActive: (__VLS_ctx.$route.path),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
const { default: __VLS_18 } = __VLS_16.slots;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
elMenuItem;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    index: "/home",
}));
const __VLS_21 = __VLS_20({
    index: "/home",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
// @ts-ignore
[$route,];
var __VLS_22;
if ([1, 2, 3, 4].includes(__VLS_ctx.role)) {
    let __VLS_25;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
        index: "/articles",
    }));
    const __VLS_27 = __VLS_26({
        index: "/articles",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    const { default: __VLS_30 } = __VLS_28.slots;
    // @ts-ignore
    [role,];
    var __VLS_28;
    let __VLS_31;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        index: "/courses",
    }));
    const __VLS_33 = __VLS_32({
        index: "/courses",
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const { default: __VLS_36 } = __VLS_34.slots;
    // @ts-ignore
    [];
    var __VLS_34;
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        index: "/assessments",
    }));
    const __VLS_39 = __VLS_38({
        index: "/assessments",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const { default: __VLS_42 } = __VLS_40.slots;
    // @ts-ignore
    [];
    var __VLS_40;
    let __VLS_43;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        index: "/consultation",
    }));
    const __VLS_45 = __VLS_44({
        index: "/consultation",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    const { default: __VLS_48 } = __VLS_46.slots;
    // @ts-ignore
    [];
    var __VLS_46;
    let __VLS_49;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
        index: "/ai-consultation",
    }));
    const __VLS_51 = __VLS_50({
        index: "/ai-consultation",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const { default: __VLS_54 } = __VLS_52.slots;
    // @ts-ignore
    [];
    var __VLS_52;
    let __VLS_55;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        index: "/books",
    }));
    const __VLS_57 = __VLS_56({
        index: "/books",
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    const { default: __VLS_60 } = __VLS_58.slots;
    // @ts-ignore
    [];
    var __VLS_58;
    let __VLS_61;
    /** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
    elMenuItem;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        index: "/xiaoai-listen",
    }));
    const __VLS_63 = __VLS_62({
        index: "/xiaoai-listen",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const { default: __VLS_66 } = __VLS_64.slots;
    // @ts-ignore
    [];
    var __VLS_64;
}
// @ts-ignore
[];
var __VLS_16;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-container" },
});
/** @type {__VLS_StyleScopedClasses['search-container']} */ ;
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    ...{ 'onKeyup': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索文章/课程...",
    clearable: true,
    prefixIcon: (__VLS_ctx.Search),
    ...{ style: {} },
}));
const __VLS_69 = __VLS_68({
    ...{ 'onKeyup': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索文章/课程...",
    clearable: true,
    prefixIcon: (__VLS_ctx.Search),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
let __VLS_72;
const __VLS_73 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.handleSearch) });
const __VLS_74 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearSearch) });
const { default: __VLS_75 } = __VLS_70.slots;
{
    const { append: __VLS_76 } = __VLS_70.slots;
    let __VLS_77;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Search),
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onClick': {} },
        icon: (__VLS_ctx.Search),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_82;
    const __VLS_83 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSearch) });
    var __VLS_80;
    var __VLS_81;
    // @ts-ignore
    [searchKeyword, Search, Search, handleSearch, handleSearch, clearSearch,];
}
// @ts-ignore
[];
var __VLS_70;
var __VLS_71;
if (__VLS_ctx.isLoggedIn) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    let __VLS_84;
    /** @ts-ignore @type {typeof __VLS_components.elBadge | typeof __VLS_components.ElBadge | typeof __VLS_components.elBadge | typeof __VLS_components.ElBadge} */
    elBadge;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        value: (__VLS_ctx.unreadCount),
        hidden: (__VLS_ctx.unreadCount === 0),
        ...{ class: "message-badge" },
    }));
    const __VLS_86 = __VLS_85({
        value: (__VLS_ctx.unreadCount),
        hidden: (__VLS_ctx.unreadCount === 0),
        ...{ class: "message-badge" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    /** @type {__VLS_StyleScopedClasses['message-badge']} */ ;
    const { default: __VLS_89 } = __VLS_87.slots;
    let __VLS_90;
    /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
    elLink;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        ...{ 'onClick': {} },
        type: "info",
        underline: "never",
        ...{ style: {} },
    }));
    const __VLS_92 = __VLS_91({
        ...{ 'onClick': {} },
        type: "info",
        underline: "never",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    let __VLS_95;
    const __VLS_96 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(__VLS_ctx.isLoggedIn))
                    return;
                __VLS_ctx.$router.push('/my-messages');
                // @ts-ignore
                [isLoggedIn, unreadCount, unreadCount, $router,];
            } });
    const { default: __VLS_97 } = __VLS_93.slots;
    // @ts-ignore
    [];
    var __VLS_93;
    var __VLS_94;
    // @ts-ignore
    [];
    var __VLS_87;
    let __VLS_98;
    /** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
    elLink;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        ...{ 'onClick': {} },
        type: "info",
        underline: "never",
        ...{ style: {} },
    }));
    const __VLS_100 = __VLS_99({
        ...{ 'onClick': {} },
        type: "info",
        underline: "never",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    let __VLS_103;
    const __VLS_104 = ({ click: {} },
        { onClick: (__VLS_ctx.handleFeedback) });
    const { default: __VLS_105 } = __VLS_101.slots;
    // @ts-ignore
    [handleFeedback,];
    var __VLS_101;
    var __VLS_102;
    let __VLS_106;
    /** @ts-ignore @type {typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown | typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown} */
    elDropdown;
    // @ts-ignore
    const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
        ...{ 'onCommand': {} },
    }));
    const __VLS_108 = __VLS_107({
        ...{ 'onCommand': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_107));
    let __VLS_111;
    const __VLS_112 = ({ command: {} },
        { onCommand: (__VLS_ctx.handleCommand) });
    const { default: __VLS_113 } = __VLS_109.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "el-dropdown-link" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['el-dropdown-link']} */ ;
    let __VLS_114;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
        size: (32),
        src: (__VLS_ctx.user.headPath),
        ...{ style: {} },
    }));
    const __VLS_116 = __VLS_115({
        size: (32),
        src: (__VLS_ctx.user.headPath),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    const { default: __VLS_119 } = __VLS_117.slots;
    {
        const { default: __VLS_120 } = __VLS_117.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
        });
        // @ts-ignore
        [handleCommand, user,];
    }
    // @ts-ignore
    [];
    var __VLS_117;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.username);
    let __VLS_121;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
        ...{ class: "el-icon--right" },
    }));
    const __VLS_123 = __VLS_122({
        ...{ class: "el-icon--right" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_122));
    /** @type {__VLS_StyleScopedClasses['el-icon--right']} */ ;
    const { default: __VLS_126 } = __VLS_124.slots;
    let __VLS_127;
    /** @ts-ignore @type {typeof __VLS_components.arrowDown | typeof __VLS_components.ArrowDown} */
    arrowDown;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({}));
    const __VLS_129 = __VLS_128({}, ...__VLS_functionalComponentArgsRest(__VLS_128));
    // @ts-ignore
    [username,];
    var __VLS_124;
    {
        const { dropdown: __VLS_132 } = __VLS_109.slots;
        let __VLS_133;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu | typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu} */
        elDropdownMenu;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({}));
        const __VLS_135 = __VLS_134({}, ...__VLS_functionalComponentArgsRest(__VLS_134));
        const { default: __VLS_138 } = __VLS_136.slots;
        let __VLS_139;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
        elDropdownItem;
        // @ts-ignore
        const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
            command: "my-home",
        }));
        const __VLS_141 = __VLS_140({
            command: "my-home",
        }, ...__VLS_functionalComponentArgsRest(__VLS_140));
        const { default: __VLS_144 } = __VLS_142.slots;
        // @ts-ignore
        [];
        var __VLS_142;
        let __VLS_145;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
        elDropdownItem;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
            command: "my-psychology",
        }));
        const __VLS_147 = __VLS_146({
            command: "my-psychology",
        }, ...__VLS_functionalComponentArgsRest(__VLS_146));
        const { default: __VLS_150 } = __VLS_148.slots;
        // @ts-ignore
        [];
        var __VLS_148;
        let __VLS_151;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
        elDropdownItem;
        // @ts-ignore
        const __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
            command: "my-orders",
        }));
        const __VLS_153 = __VLS_152({
            command: "my-orders",
        }, ...__VLS_functionalComponentArgsRest(__VLS_152));
        const { default: __VLS_156 } = __VLS_154.slots;
        // @ts-ignore
        [];
        var __VLS_154;
        let __VLS_157;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
        elDropdownItem;
        // @ts-ignore
        const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
            command: "apply-psychologist",
        }));
        const __VLS_159 = __VLS_158({
            command: "apply-psychologist",
        }, ...__VLS_functionalComponentArgsRest(__VLS_158));
        const { default: __VLS_162 } = __VLS_160.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ style: {} },
        });
        // @ts-ignore
        [];
        var __VLS_160;
        if (__VLS_ctx.is_psychologist === 1) {
            let __VLS_163;
            /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
            elDropdownItem;
            // @ts-ignore
            const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
                command: "psychologist-admin",
            }));
            const __VLS_165 = __VLS_164({
                command: "psychologist-admin",
            }, ...__VLS_functionalComponentArgsRest(__VLS_164));
            const { default: __VLS_168 } = __VLS_166.slots;
            // @ts-ignore
            [is_psychologist,];
            var __VLS_166;
        }
        if (__VLS_ctx.role > 1) {
            let __VLS_169;
            /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
            elDropdownItem;
            // @ts-ignore
            const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
                command: "backend",
            }));
            const __VLS_171 = __VLS_170({
                command: "backend",
            }, ...__VLS_functionalComponentArgsRest(__VLS_170));
            const { default: __VLS_174 } = __VLS_172.slots;
            // @ts-ignore
            [role,];
            var __VLS_172;
        }
        let __VLS_175;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
        elDropdownItem;
        // @ts-ignore
        const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
            command: "logout",
            divided: true,
        }));
        const __VLS_177 = __VLS_176({
            command: "logout",
            divided: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_176));
        const { default: __VLS_180 } = __VLS_178.slots;
        // @ts-ignore
        [];
        var __VLS_178;
        // @ts-ignore
        [];
        var __VLS_136;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_109;
    var __VLS_110;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    let __VLS_181;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ style: {} },
    }));
    const __VLS_183 = __VLS_182({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    let __VLS_186;
    const __VLS_187 = ({ click: {} },
        { onClick: (__VLS_ctx.goLogin) });
    const { default: __VLS_188 } = __VLS_184.slots;
    // @ts-ignore
    [goLogin,];
    var __VLS_184;
    var __VLS_185;
    let __VLS_189;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_190 = __VLS_asFunctionalComponent1(__VLS_189, new __VLS_189({
        ...{ 'onClick': {} },
    }));
    const __VLS_191 = __VLS_190({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_190));
    let __VLS_194;
    const __VLS_195 = ({ click: {} },
        { onClick: (__VLS_ctx.goRegister) });
    const { default: __VLS_196 } = __VLS_192.slots;
    // @ts-ignore
    [goRegister,];
    var __VLS_192;
    var __VLS_193;
}
if (!__VLS_ctx.isLoggedIn) {
    let __VLS_197;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_198 = __VLS_asFunctionalComponent1(__VLS_197, new __VLS_197({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
        ...{ class: "apply-psychologist-btn" },
    }));
    const __VLS_199 = __VLS_198({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
        ...{ class: "apply-psychologist-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_198));
    let __VLS_202;
    const __VLS_203 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isLoggedIn))
                    return;
                __VLS_ctx.$router.push('/apply-psychologist');
                // @ts-ignore
                [isLoggedIn, $router,];
            } });
    /** @type {__VLS_StyleScopedClasses['apply-psychologist-btn']} */ ;
    const { default: __VLS_204 } = __VLS_200.slots;
    // @ts-ignore
    [];
    var __VLS_200;
    var __VLS_201;
}
// @ts-ignore
[];
var __VLS_10;
let __VLS_205;
/** @ts-ignore @type {typeof __VLS_components.elMain | typeof __VLS_components.ElMain | typeof __VLS_components.elMain | typeof __VLS_components.ElMain} */
elMain;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent1(__VLS_205, new __VLS_205({}));
const __VLS_207 = __VLS_206({}, ...__VLS_functionalComponentArgsRest(__VLS_206));
const { default: __VLS_210 } = __VLS_208.slots;
let __VLS_211;
/** @ts-ignore @type {typeof __VLS_components.routerView | typeof __VLS_components.RouterView} */
routerView;
// @ts-ignore
const __VLS_212 = __VLS_asFunctionalComponent1(__VLS_211, new __VLS_211({}));
const __VLS_213 = __VLS_212({}, ...__VLS_functionalComponentArgsRest(__VLS_212));
// @ts-ignore
[];
var __VLS_208;
let __VLS_216;
/** @ts-ignore @type {typeof __VLS_components.elFooter | typeof __VLS_components.ElFooter | typeof __VLS_components.elFooter | typeof __VLS_components.ElFooter} */
elFooter;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
    ...{ class: "footer-container" },
}));
const __VLS_218 = __VLS_217({
    ...{ class: "footer-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
/** @type {__VLS_StyleScopedClasses['footer-container']} */ ;
const { default: __VLS_221 } = __VLS_219.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "footer-content" },
});
/** @type {__VLS_StyleScopedClasses['footer-content']} */ ;
let __VLS_222;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
    gutter: (20),
    ...{ class: "footer-row" },
}));
const __VLS_224 = __VLS_223({
    gutter: (20),
    ...{ class: "footer-row" },
}, ...__VLS_functionalComponentArgsRest(__VLS_223));
/** @type {__VLS_StyleScopedClasses['footer-row']} */ ;
const { default: __VLS_227 } = __VLS_225.slots;
let __VLS_228;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent1(__VLS_228, new __VLS_228({
    xs: (24),
    sm: (8),
    md: (6),
    ...{ class: "footer-section" },
}));
const __VLS_230 = __VLS_229({
    xs: (24),
    sm: (8),
    md: (6),
    ...{ class: "footer-section" },
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
/** @type {__VLS_StyleScopedClasses['footer-section']} */ ;
const { default: __VLS_233 } = __VLS_231.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "footer-title" },
});
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
    ...{ class: "footer-list" },
});
/** @type {__VLS_StyleScopedClasses['footer-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_234;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_235 = __VLS_asFunctionalComponent1(__VLS_234, new __VLS_234({}));
const __VLS_236 = __VLS_235({}, ...__VLS_functionalComponentArgsRest(__VLS_235));
const { default: __VLS_239 } = __VLS_237.slots;
let __VLS_240;
/** @ts-ignore @type {typeof __VLS_components.Message} */
Message;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent1(__VLS_240, new __VLS_240({}));
const __VLS_242 = __VLS_241({}, ...__VLS_functionalComponentArgsRest(__VLS_241));
// @ts-ignore
[];
var __VLS_237;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_245;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent1(__VLS_245, new __VLS_245({}));
const __VLS_247 = __VLS_246({}, ...__VLS_functionalComponentArgsRest(__VLS_246));
const { default: __VLS_250 } = __VLS_248.slots;
let __VLS_251;
/** @ts-ignore @type {typeof __VLS_components.Phone} */
Phone;
// @ts-ignore
const __VLS_252 = __VLS_asFunctionalComponent1(__VLS_251, new __VLS_251({}));
const __VLS_253 = __VLS_252({}, ...__VLS_functionalComponentArgsRest(__VLS_252));
// @ts-ignore
[];
var __VLS_248;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_256;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent1(__VLS_256, new __VLS_256({}));
const __VLS_258 = __VLS_257({}, ...__VLS_functionalComponentArgsRest(__VLS_257));
const { default: __VLS_261 } = __VLS_259.slots;
let __VLS_262;
/** @ts-ignore @type {typeof __VLS_components.Clock} */
Clock;
// @ts-ignore
const __VLS_263 = __VLS_asFunctionalComponent1(__VLS_262, new __VLS_262({}));
const __VLS_264 = __VLS_263({}, ...__VLS_functionalComponentArgsRest(__VLS_263));
// @ts-ignore
[];
var __VLS_259;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_267;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent1(__VLS_267, new __VLS_267({}));
const __VLS_269 = __VLS_268({}, ...__VLS_functionalComponentArgsRest(__VLS_268));
const { default: __VLS_272 } = __VLS_270.slots;
let __VLS_273;
/** @ts-ignore @type {typeof __VLS_components.Location} */
Location;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent1(__VLS_273, new __VLS_273({}));
const __VLS_275 = __VLS_274({}, ...__VLS_functionalComponentArgsRest(__VLS_274));
// @ts-ignore
[];
var __VLS_270;
// @ts-ignore
[];
var __VLS_231;
let __VLS_278;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_279 = __VLS_asFunctionalComponent1(__VLS_278, new __VLS_278({
    xs: (24),
    sm: (8),
    md: (6),
    ...{ class: "footer-section" },
}));
const __VLS_280 = __VLS_279({
    xs: (24),
    sm: (8),
    md: (6),
    ...{ class: "footer-section" },
}, ...__VLS_functionalComponentArgsRest(__VLS_279));
/** @type {__VLS_StyleScopedClasses['footer-section']} */ ;
const { default: __VLS_283 } = __VLS_281.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "footer-title" },
});
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
    ...{ class: "footer-list" },
});
/** @type {__VLS_StyleScopedClasses['footer-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_284;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent1(__VLS_284, new __VLS_284({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}));
const __VLS_286 = __VLS_285({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
let __VLS_289;
const __VLS_290 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/privacy');
            // @ts-ignore
            [$router,];
        } });
const { default: __VLS_291 } = __VLS_287.slots;
// @ts-ignore
[];
var __VLS_287;
var __VLS_288;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_292;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent1(__VLS_292, new __VLS_292({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}));
const __VLS_294 = __VLS_293({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
let __VLS_297;
const __VLS_298 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/service-agreement');
            // @ts-ignore
            [$router,];
        } });
const { default: __VLS_299 } = __VLS_295.slots;
// @ts-ignore
[];
var __VLS_295;
var __VLS_296;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_300;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent1(__VLS_300, new __VLS_300({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}));
const __VLS_302 = __VLS_301({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
let __VLS_305;
const __VLS_306 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/disclaimer');
            // @ts-ignore
            [$router,];
        } });
const { default: __VLS_307 } = __VLS_303.slots;
// @ts-ignore
[];
var __VLS_303;
var __VLS_304;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_308;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent1(__VLS_308, new __VLS_308({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}));
const __VLS_310 = __VLS_309({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
let __VLS_313;
const __VLS_314 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/child-protection');
            // @ts-ignore
            [$router,];
        } });
const { default: __VLS_315 } = __VLS_311.slots;
// @ts-ignore
[];
var __VLS_311;
var __VLS_312;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_316;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent1(__VLS_316, new __VLS_316({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}));
const __VLS_318 = __VLS_317({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
let __VLS_321;
const __VLS_322 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/feedback');
            // @ts-ignore
            [$router,];
        } });
const { default: __VLS_323 } = __VLS_319.slots;
// @ts-ignore
[];
var __VLS_319;
var __VLS_320;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_324;
/** @ts-ignore @type {typeof __VLS_components.elLink | typeof __VLS_components.ElLink | typeof __VLS_components.elLink | typeof __VLS_components.ElLink} */
elLink;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent1(__VLS_324, new __VLS_324({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}));
const __VLS_326 = __VLS_325({
    ...{ 'onClick': {} },
    type: "info",
    underline: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
let __VLS_329;
const __VLS_330 = ({ click: {} },
    { onClick: (__VLS_ctx.showPlatformIntro) });
const { default: __VLS_331 } = __VLS_327.slots;
// @ts-ignore
[showPlatformIntro,];
var __VLS_327;
var __VLS_328;
// @ts-ignore
[];
var __VLS_281;
let __VLS_332;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent1(__VLS_332, new __VLS_332({
    xs: (24),
    sm: (8),
    md: (6),
    ...{ class: "footer-section" },
}));
const __VLS_334 = __VLS_333({
    xs: (24),
    sm: (8),
    md: (6),
    ...{ class: "footer-section" },
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
/** @type {__VLS_StyleScopedClasses['footer-section']} */ ;
const { default: __VLS_337 } = __VLS_335.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "footer-title" },
});
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
    ...{ class: "footer-list" },
});
/** @type {__VLS_StyleScopedClasses['footer-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_338;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_339 = __VLS_asFunctionalComponent1(__VLS_338, new __VLS_338({}));
const __VLS_340 = __VLS_339({}, ...__VLS_functionalComponentArgsRest(__VLS_339));
const { default: __VLS_343 } = __VLS_341.slots;
let __VLS_344;
/** @ts-ignore @type {typeof __VLS_components.Document} */
Document;
// @ts-ignore
const __VLS_345 = __VLS_asFunctionalComponent1(__VLS_344, new __VLS_344({}));
const __VLS_346 = __VLS_345({}, ...__VLS_functionalComponentArgsRest(__VLS_345));
// @ts-ignore
[];
var __VLS_341;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_349;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_350 = __VLS_asFunctionalComponent1(__VLS_349, new __VLS_349({}));
const __VLS_351 = __VLS_350({}, ...__VLS_functionalComponentArgsRest(__VLS_350));
const { default: __VLS_354 } = __VLS_352.slots;
let __VLS_355;
/** @ts-ignore @type {typeof __VLS_components.DocumentChecked} */
DocumentChecked;
// @ts-ignore
const __VLS_356 = __VLS_asFunctionalComponent1(__VLS_355, new __VLS_355({}));
const __VLS_357 = __VLS_356({}, ...__VLS_functionalComponentArgsRest(__VLS_356));
// @ts-ignore
[];
var __VLS_352;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_360;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_361 = __VLS_asFunctionalComponent1(__VLS_360, new __VLS_360({}));
const __VLS_362 = __VLS_361({}, ...__VLS_functionalComponentArgsRest(__VLS_361));
const { default: __VLS_365 } = __VLS_363.slots;
let __VLS_366;
/** @ts-ignore @type {typeof __VLS_components.Medal} */
Medal;
// @ts-ignore
const __VLS_367 = __VLS_asFunctionalComponent1(__VLS_366, new __VLS_366({}));
const __VLS_368 = __VLS_367({}, ...__VLS_functionalComponentArgsRest(__VLS_367));
// @ts-ignore
[];
var __VLS_363;
__VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({});
let __VLS_371;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_372 = __VLS_asFunctionalComponent1(__VLS_371, new __VLS_371({}));
const __VLS_373 = __VLS_372({}, ...__VLS_functionalComponentArgsRest(__VLS_372));
const { default: __VLS_376 } = __VLS_374.slots;
let __VLS_377;
/** @ts-ignore @type {typeof __VLS_components.Stamp} */
Stamp;
// @ts-ignore
const __VLS_378 = __VLS_asFunctionalComponent1(__VLS_377, new __VLS_377({}));
const __VLS_379 = __VLS_378({}, ...__VLS_functionalComponentArgsRest(__VLS_378));
// @ts-ignore
[];
var __VLS_374;
// @ts-ignore
[];
var __VLS_335;
let __VLS_382;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_383 = __VLS_asFunctionalComponent1(__VLS_382, new __VLS_382({
    xs: (24),
    sm: (24),
    md: (6),
    ...{ class: "footer-section qrcode-section" },
}));
const __VLS_384 = __VLS_383({
    xs: (24),
    sm: (24),
    md: (6),
    ...{ class: "footer-section qrcode-section" },
}, ...__VLS_functionalComponentArgsRest(__VLS_383));
/** @type {__VLS_StyleScopedClasses['footer-section']} */ ;
/** @type {__VLS_StyleScopedClasses['qrcode-section']} */ ;
const { default: __VLS_387 } = __VLS_385.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "footer-title" },
});
/** @type {__VLS_StyleScopedClasses['footer-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "qrcode-container" },
});
/** @type {__VLS_StyleScopedClasses['qrcode-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "qrcode-item" },
});
/** @type {__VLS_StyleScopedClasses['qrcode-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showQrCodeDialog('微信小程序');
            // @ts-ignore
            [showQrCodeDialog,];
        } },
    src: "/image/2d_code/wechat-miniprogram-qrcode.png",
    alt: "微信小程序",
    ...{ class: "qrcode-image" },
});
/** @type {__VLS_StyleScopedClasses['qrcode-image']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "qrcode-item" },
});
/** @type {__VLS_StyleScopedClasses['qrcode-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showQrCodeDialog('微信公众号');
            // @ts-ignore
            [showQrCodeDialog,];
        } },
    src: "/image/2d_code/wechat-miniprogram-qrcode.png",
    alt: "微信公众号",
    ...{ class: "qrcode-image" },
});
/** @type {__VLS_StyleScopedClasses['qrcode-image']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
// @ts-ignore
[];
var __VLS_385;
// @ts-ignore
[];
var __VLS_225;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "copyright" },
});
/** @type {__VLS_StyleScopedClasses['copyright']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
// @ts-ignore
[];
var __VLS_219;
let __VLS_388;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_389 = __VLS_asFunctionalComponent1(__VLS_388, new __VLS_388({
    modelValue: (__VLS_ctx.feedbackVisible),
    title: "我要反馈",
    width: "500px",
}));
const __VLS_390 = __VLS_389({
    modelValue: (__VLS_ctx.feedbackVisible),
    title: "我要反馈",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_389));
const { default: __VLS_393 } = __VLS_391.slots;
let __VLS_394;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_395 = __VLS_asFunctionalComponent1(__VLS_394, new __VLS_394({
    model: (__VLS_ctx.feedbackForm),
}));
const __VLS_396 = __VLS_395({
    model: (__VLS_ctx.feedbackForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_395));
const { default: __VLS_399 } = __VLS_397.slots;
let __VLS_400;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_401 = __VLS_asFunctionalComponent1(__VLS_400, new __VLS_400({
    label: "反馈内容",
}));
const __VLS_402 = __VLS_401({
    label: "反馈内容",
}, ...__VLS_functionalComponentArgsRest(__VLS_401));
const { default: __VLS_405 } = __VLS_403.slots;
let __VLS_406;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_407 = __VLS_asFunctionalComponent1(__VLS_406, new __VLS_406({
    type: "textarea",
    modelValue: (__VLS_ctx.feedbackForm.content),
    rows: (4),
    placeholder: "请输入您的宝贵意见...",
}));
const __VLS_408 = __VLS_407({
    type: "textarea",
    modelValue: (__VLS_ctx.feedbackForm.content),
    rows: (4),
    placeholder: "请输入您的宝贵意见...",
}, ...__VLS_functionalComponentArgsRest(__VLS_407));
// @ts-ignore
[feedbackVisible, feedbackForm, feedbackForm,];
var __VLS_403;
// @ts-ignore
[];
var __VLS_397;
{
    const { footer: __VLS_411 } = __VLS_391.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_412;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_413 = __VLS_asFunctionalComponent1(__VLS_412, new __VLS_412({
        ...{ 'onClick': {} },
    }));
    const __VLS_414 = __VLS_413({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_413));
    let __VLS_417;
    const __VLS_418 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.feedbackVisible = false;
                // @ts-ignore
                [feedbackVisible,];
            } });
    const { default: __VLS_419 } = __VLS_415.slots;
    // @ts-ignore
    [];
    var __VLS_415;
    var __VLS_416;
    let __VLS_420;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_421 = __VLS_asFunctionalComponent1(__VLS_420, new __VLS_420({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_422 = __VLS_421({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_421));
    let __VLS_425;
    const __VLS_426 = ({ click: {} },
        { onClick: (__VLS_ctx.submitFeedback) });
    const { default: __VLS_427 } = __VLS_423.slots;
    // @ts-ignore
    [submitFeedback,];
    var __VLS_423;
    var __VLS_424;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_391;
let __VLS_428;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_429 = __VLS_asFunctionalComponent1(__VLS_428, new __VLS_428({
    modelValue: (__VLS_ctx.qrCodeDialogVisible),
    title: (__VLS_ctx.qrCodeDialogTitle),
    width: "300px",
    alignCenter: true,
}));
const __VLS_430 = __VLS_429({
    modelValue: (__VLS_ctx.qrCodeDialogVisible),
    title: (__VLS_ctx.qrCodeDialogTitle),
    width: "300px",
    alignCenter: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_429));
const { default: __VLS_433 } = __VLS_431.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "qr-code-dialog-content" },
});
/** @type {__VLS_StyleScopedClasses['qr-code-dialog-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: (__VLS_ctx.currentQrCodeSrc),
    alt: "二维码",
    ...{ class: "qr-code-large" },
});
/** @type {__VLS_StyleScopedClasses['qr-code-large']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "qr-code-tip" },
});
/** @type {__VLS_StyleScopedClasses['qr-code-tip']} */ ;
(__VLS_ctx.qrCodeDialogTitle);
// @ts-ignore
[qrCodeDialogVisible, qrCodeDialogTitle, qrCodeDialogTitle, currentQrCodeSrc,];
var __VLS_431;
const __VLS_434 = PlatformIntro;
// @ts-ignore
const __VLS_435 = __VLS_asFunctionalComponent1(__VLS_434, new __VLS_434({
    ...{ 'onConfirm': {} },
    modelValue: (__VLS_ctx.platformIntroVisible),
    title: (__VLS_ctx.platformIntroTitle),
}));
const __VLS_436 = __VLS_435({
    ...{ 'onConfirm': {} },
    modelValue: (__VLS_ctx.platformIntroVisible),
    title: (__VLS_ctx.platformIntroTitle),
}, ...__VLS_functionalComponentArgsRest(__VLS_435));
let __VLS_439;
const __VLS_440 = ({ confirm: {} },
    { onConfirm: (__VLS_ctx.handlePlatformIntroConfirm) });
var __VLS_437;
var __VLS_438;
const __VLS_441 = FloatingButtons;
// @ts-ignore
const __VLS_442 = __VLS_asFunctionalComponent1(__VLS_441, new __VLS_441({}));
const __VLS_443 = __VLS_442({}, ...__VLS_functionalComponentArgsRest(__VLS_442));
// @ts-ignore
[platformIntroVisible, platformIntroTitle, handlePlatformIntroConfirm,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
