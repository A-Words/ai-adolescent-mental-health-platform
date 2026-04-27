/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, ArrowLeft, Picture, Promotion, Loading, Close } from '@element-plus/icons-vue';
import { getMessageHistory, sendMessage, sendImageMessage } from '@/api/psychologist';
import request from '@/utils/request';
const router = useRouter();
const route = useRoute();
// 状态
const appointmentId = ref(0);
const psychologistInfo = ref({
    id: 0,
    name: '',
    headPath: '',
    title: '专业心理咨询师'
});
const messages = ref([]);
const inputText = ref('');
const previewImage = ref('');
const previewFile = ref(null);
const loading = ref(false);
const sending = ref(false);
const isConnected = ref(false);
const hasMore = ref(false);
const currentUserId = ref(0);
const receiverId = ref(0);
// DOM refs
const messagesArea = ref(null);
// SSE连接
let eventSource = null;
// 配置
const token = localStorage.getItem('token') || '';
const baseApiUrl = import.meta.env.VITE_API_BASE_URL || '';
const uploadUrl = baseApiUrl ? baseApiUrl + '/common/upload' : '/api/common/upload';
// 计算属性
const canSend = computed(() => {
    return (inputText.value.trim() || previewImage.value) && !sending.value;
});
// 初始化
onMounted(() => {
    // 获取预约ID
    appointmentId.value = Number(route.params.appointmentId);
    // 获取当前用户信息
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            currentUserId.value = user.id;
        }
        catch (e) {
            console.error('解析用户信息失败', e);
        }
    }
    if (appointmentId.value) {
        loadMessages();
        connectSSE();
    }
});
// 组件卸载
onUnmounted(() => {
    disconnectSSE();
});
// 加载消息历史
const loadMessages = async () => {
    if (!appointmentId.value)
        return;
    loading.value = true;
    try {
        const res = await getMessageHistory(appointmentId.value);
        if (res.code === 200 && res.data) {
            // 转换消息格式
            messages.value = res.data.map((msg) => ({
                ...msg,
                isSelf: msg.senderId === currentUserId.value
            }));
            // 设置对方信息（从消息中获取）
            if (messages.value.length > 0) {
                const otherMsg = messages.value.find(m => !m.isSelf);
                if (otherMsg) {
                    receiverId.value = otherMsg.senderId;
                }
                else {
                    // 如果没有对方消息，使用预约中的咨询师ID
                    const selfMsg = messages.value.find(m => m.isSelf);
                    if (selfMsg) {
                        receiverId.value = selfMsg.receiverId;
                    }
                }
            }
            // 设置心理师信息
            setPsychologistInfo();
            // 滚动到底部
            await nextTick();
            scrollToBottom();
        }
    }
    catch (e) {
        console.error('加载消息失败', e);
        ElMessage.error('加载消息失败');
    }
    finally {
        loading.value = false;
    }
};
// 设置心理师信息（从预约详情获取）
const setPsychologistInfo = async () => {
    try {
        // 尝试从API获取预约详情
        const res = await request({
            url: `/api/psychologist/appointment/${appointmentId.value}/detail`,
            method: 'get'
        });
        if (res.code === 200 && res.data) {
            psychologistInfo.value = {
                id: res.data.psychologistId,
                name: res.data.psychologistName || '心理咨询师',
                headPath: res.data.psychologistHeadPath || '',
                title: '专业心理咨询师'
            };
            receiverId.value = res.data.psychologistId;
        }
    }
    catch (e) {
        console.error('获取预约详情失败', e);
    }
};
// 加载更多消息
const loadMore = () => {
    // TODO: 实现分页加载
    ElMessage.info('暂无更多消息');
};
// 连接SSE
const connectSSE = () => {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    // 构建SSE URL - 使用 /api 前缀以便vite代理转发
    const apptId = appointmentId.value;
    const encodedToken = encodeURIComponent(token);
    const sseUrl = '/api/psychologist/message/stream/' + apptId + '?token=' + encodedToken;
    console.log('连接SSE:', sseUrl);
    eventSource = new EventSource(sseUrl);
    // 连接打开时设置状态
    eventSource.onopen = () => {
        console.log('SSE连接已建立');
        isConnected.value = true;
    };
    // 使用 addEventListener 监听特定事件（更可靠）
    eventSource.addEventListener('connected', (event) => {
        console.log('SSE连接确认:', event.data);
        isConnected.value = true;
    });
    // 处理所有消息
    eventSource.onmessage = (event) => {
        try {
            const eventData = event.data;
            if (!eventData || eventData === '') {
                return;
            }
            const messageData = JSON.parse(String(eventData));
            console.log('收到SSE消息:', messageData);
            // 跳过连接确认消息（type=connected）
            if (messageData.type === 'connected') {
                isConnected.value = true;
                return;
            }
            // 添加新消息（去重）
            if (messageData.id) {
                const exists = messages.value.some(m => m.id === messageData.id);
                if (!exists) {
                    const newMsg = {
                        ...messageData,
                        isSelf: messageData.senderId === currentUserId.value
                    };
                    messages.value.push(newMsg);
                    nextTick(() => scrollToBottom());
                }
            }
        }
        catch (e) {
            console.error('解析SSE消息失败', e);
        }
    };
    eventSource.onerror = (error) => {
        console.error('SSE连接错误', error);
        isConnected.value = false;
        // 清理连接
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
        // 尝试重连
        setTimeout(() => {
            console.log('尝试重连SSE...');
            connectSSE();
        }, 3000);
    };
};
// 断开SSE
const disconnectSSE = () => {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
        isConnected.value = false;
    }
};
// 发送文本消息
const sendTextMessage = async () => {
    if (!inputText.value.trim() || sending.value)
        return;
    if (!receiverId.value) {
        ElMessage.warning('无法确定接收者');
        return;
    }
    const content = inputText.value.trim();
    inputText.value = '';
    sending.value = true;
    try {
        const res = await sendMessage({
            appointmentId: appointmentId.value,
            receiverId: receiverId.value,
            content: content,
            contentType: 0
        });
        if (res.code === 200) {
            // 消息已通过SSE推送，这里不需要手动添加
            console.log('消息发送成功');
        }
    }
    catch (e) {
        console.error('发送消息失败', e);
        ElMessage.error('发送消息失败');
        inputText.value = content; // 恢复输入
    }
    finally {
        sending.value = false;
    }
};
// 图片上传相关
const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
    }
    if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB!');
        return false;
    }
    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.value = e.target?.result;
    };
    reader.readAsDataURL(file);
    previewFile.value = file;
    return false; // 阻止自动上传
};
const handleImageSuccess = async (res) => {
    if (res.code === 200 && res.data) {
        await sendPicMessage(res.data);
    }
};
const handleImageError = () => {
    ElMessage.error('图片上传失败');
    removePreview();
};
// 发送图片消息
const sendPicMessage = async (imageUrl) => {
    if (!receiverId.value) {
        ElMessage.warning('无法确定接收者');
        return;
    }
    sending.value = true;
    try {
        const res = await sendImageMessage({
            appointmentId: appointmentId.value,
            receiverId: receiverId.value,
            imageUrl: imageUrl
        });
        if (res.code === 200) {
            removePreview();
            console.log('图片消息发送成功');
        }
    }
    catch (e) {
        console.error('发送图片失败', e);
        ElMessage.error('发送图片失败');
    }
    finally {
        sending.value = false;
    }
};
// 移除预览
const removePreview = () => {
    previewImage.value = '';
    previewFile.value = null;
};
// 格式化时间
const formatTime = (time) => {
    if (!time)
        return '';
    const d = new Date(time);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};
// 滚动到底部
const scrollToBottom = () => {
    if (messagesArea.value) {
        messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
};
// 返回
const goBack = () => {
    router.back();
};
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
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-status']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-status']} */ ;
/** @type {__VLS_StyleScopedClasses['connected']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-self']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input']} */ ;
/** @type {__VLS_StyleScopedClasses['message-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['user-chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-main']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-chat-container" },
});
/** @type {__VLS_StyleScopedClasses['user-chat-container']} */ ;
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
    ...{ class: "back-header" },
});
/** @type {__VLS_StyleScopedClasses['back-header']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    link: true,
    ...{ class: "back-btn" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    link: true,
    ...{ class: "back-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.goBack) });
/** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.ArrowLeft} */
ArrowLeft;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
// @ts-ignore
[goBack,];
var __VLS_11;
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-main" },
});
/** @type {__VLS_StyleScopedClasses['chat-main']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-info-bar" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-info-bar']} */ ;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
elAvatar;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    size: (48),
    src: (__VLS_ctx.psychologistInfo.headPath),
    ...{ class: "psy-avatar" },
}));
const __VLS_21 = __VLS_20({
    size: (48),
    src: (__VLS_ctx.psychologistInfo.headPath),
    ...{ class: "psy-avatar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
/** @type {__VLS_StyleScopedClasses['psy-avatar']} */ ;
const { default: __VLS_24 } = __VLS_22.slots;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    size: (24),
}));
const __VLS_27 = __VLS_26({
    size: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.User} */
User;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
// @ts-ignore
[psychologistInfo,];
var __VLS_28;
// @ts-ignore
[];
var __VLS_22;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psy-details" },
});
/** @type {__VLS_StyleScopedClasses['psy-details']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "psy-name" },
});
/** @type {__VLS_StyleScopedClasses['psy-name']} */ ;
(__VLS_ctx.psychologistInfo.name || '心理咨询师');
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "psy-title" },
});
/** @type {__VLS_StyleScopedClasses['psy-title']} */ ;
(__VLS_ctx.psychologistInfo.title || '专业心理咨询师');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "connection-status" },
    ...{ class: ({ connected: __VLS_ctx.isConnected }) },
});
/** @type {__VLS_StyleScopedClasses['connection-status']} */ ;
/** @type {__VLS_StyleScopedClasses['connected']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "status-dot" },
});
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
(__VLS_ctx.isConnected ? '在线' : '连接中...');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "messages-area" },
    ref: "messagesArea",
});
/** @type {__VLS_StyleScopedClasses['messages-area']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['loading-wrapper']} */ ;
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        ...{ class: "is-loading" },
    }));
    const __VLS_38 = __VLS_37({
        ...{ class: "is-loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    /** @type {__VLS_StyleScopedClasses['is-loading']} */ ;
    const { default: __VLS_41 } = __VLS_39.slots;
    let __VLS_42;
    /** @ts-ignore @type {typeof __VLS_components.Loading} */
    Loading;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({}));
    const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
    // @ts-ignore
    [psychologistInfo, psychologistInfo, isConnected, isConnected, loading,];
    var __VLS_39;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.messages.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-messages" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-messages']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "empty-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-hint']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-list" },
    });
    /** @type {__VLS_StyleScopedClasses['message-list']} */ ;
    for (const [msg] of __VLS_vFor((__VLS_ctx.messages))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (msg.id),
            ...{ class: "message-item" },
            ...{ class: ({ 'message-self': msg.isSelf }) },
        });
        /** @type {__VLS_StyleScopedClasses['message-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['message-self']} */ ;
        let __VLS_47;
        /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
        elAvatar;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
            size: (40),
            src: (msg.isSelf ? '' : __VLS_ctx.psychologistInfo.headPath),
            ...{ class: "message-avatar" },
        }));
        const __VLS_49 = __VLS_48({
            size: (40),
            src: (msg.isSelf ? '' : __VLS_ctx.psychologistInfo.headPath),
            ...{ class: "message-avatar" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        /** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
        const { default: __VLS_52 } = __VLS_50.slots;
        let __VLS_53;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({}));
        const __VLS_55 = __VLS_54({}, ...__VLS_functionalComponentArgsRest(__VLS_54));
        const { default: __VLS_58 } = __VLS_56.slots;
        let __VLS_59;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({}));
        const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
        // @ts-ignore
        [psychologistInfo, messages, messages,];
        var __VLS_56;
        // @ts-ignore
        [];
        var __VLS_50;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "message-content-wrapper" },
        });
        /** @type {__VLS_StyleScopedClasses['message-content-wrapper']} */ ;
        if (msg.contentType === 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "message-bubble" },
            });
            /** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "message-text" },
            });
            /** @type {__VLS_StyleScopedClasses['message-text']} */ ;
            (msg.content);
        }
        else if (msg.contentType === 1) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "message-bubble image-bubble" },
            });
            /** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
            /** @type {__VLS_StyleScopedClasses['image-bubble']} */ ;
            let __VLS_64;
            /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
            elImage;
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
                src: (msg.content),
                previewSrcList: ([msg.content]),
                fit: "cover",
                ...{ class: "message-image" },
            }));
            const __VLS_66 = __VLS_65({
                src: (msg.content),
                previewSrcList: ([msg.content]),
                fit: "cover",
                ...{ class: "message-image" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_65));
            /** @type {__VLS_StyleScopedClasses['message-image']} */ ;
        }
        else if (msg.contentType === 2) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "system-message" },
            });
            /** @type {__VLS_StyleScopedClasses['system-message']} */ ;
            (msg.content);
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "message-time" },
        });
        /** @type {__VLS_StyleScopedClasses['message-time']} */ ;
        (__VLS_ctx.formatTime(msg.createTime));
        // @ts-ignore
        [formatTime,];
    }
}
if (__VLS_ctx.hasMore) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.loadMore) },
        ...{ class: "load-more" },
    });
    /** @type {__VLS_StyleScopedClasses['load-more']} */ ;
    let __VLS_69;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
        link: true,
        size: "small",
    }));
    const __VLS_71 = __VLS_70({
        link: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    const { default: __VLS_74 } = __VLS_72.slots;
    // @ts-ignore
    [hasMore, loadMore,];
    var __VLS_72;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "input-area" },
});
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
if (__VLS_ctx.previewImage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "image-preview-container" },
    });
    /** @type {__VLS_StyleScopedClasses['image-preview-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "image-preview-item" },
    });
    /** @type {__VLS_StyleScopedClasses['image-preview-item']} */ ;
    let __VLS_75;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
        src: (__VLS_ctx.previewImage),
        fit: "cover",
        ...{ class: "preview-img" },
    }));
    const __VLS_77 = __VLS_76({
        src: (__VLS_ctx.previewImage),
        fit: "cover",
        ...{ class: "preview-img" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    /** @type {__VLS_StyleScopedClasses['preview-img']} */ ;
    let __VLS_80;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        ...{ class: "preview-remove" },
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        ...{ class: "preview-remove" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_85;
    const __VLS_86 = ({ click: {} },
        { onClick: (__VLS_ctx.removePreview) });
    /** @type {__VLS_StyleScopedClasses['preview-remove']} */ ;
    const { default: __VLS_87 } = __VLS_83.slots;
    let __VLS_88;
    /** @ts-ignore @type {typeof __VLS_components.Close} */
    Close;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({}));
    const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
    // @ts-ignore
    [previewImage, previewImage, removePreview,];
    var __VLS_83;
    var __VLS_84;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "input-row" },
});
/** @type {__VLS_StyleScopedClasses['input-row']} */ ;
let __VLS_93;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
    action: (__VLS_ctx.uploadUrl),
    headers: ({ Authorization: `Bearer ${__VLS_ctx.token}` }),
    showFileList: (false),
    beforeUpload: (__VLS_ctx.beforeImageUpload),
    onSuccess: (__VLS_ctx.handleImageSuccess),
    onError: (__VLS_ctx.handleImageError),
    accept: "image/*",
}));
const __VLS_95 = __VLS_94({
    action: (__VLS_ctx.uploadUrl),
    headers: ({ Authorization: `Bearer ${__VLS_ctx.token}` }),
    showFileList: (false),
    beforeUpload: (__VLS_ctx.beforeImageUpload),
    onSuccess: (__VLS_ctx.handleImageSuccess),
    onError: (__VLS_ctx.handleImageError),
    accept: "image/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
const { default: __VLS_98 } = __VLS_96.slots;
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    text: true,
    ...{ class: "upload-btn" },
}));
const __VLS_101 = __VLS_100({
    text: true,
    ...{ class: "upload-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
/** @type {__VLS_StyleScopedClasses['upload-btn']} */ ;
const { default: __VLS_104 } = __VLS_102.slots;
let __VLS_105;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({}));
const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
const { default: __VLS_110 } = __VLS_108.slots;
let __VLS_111;
/** @ts-ignore @type {typeof __VLS_components.Picture} */
Picture;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({}));
const __VLS_113 = __VLS_112({}, ...__VLS_functionalComponentArgsRest(__VLS_112));
// @ts-ignore
[uploadUrl, token, beforeImageUpload, handleImageSuccess, handleImageError,];
var __VLS_108;
// @ts-ignore
[];
var __VLS_102;
// @ts-ignore
[];
var __VLS_96;
let __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.inputText),
    placeholder: "输入消息...",
    ...{ class: "message-input" },
    disabled: (__VLS_ctx.sending),
}));
const __VLS_118 = __VLS_117({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.inputText),
    placeholder: "输入消息...",
    ...{ class: "message-input" },
    disabled: (__VLS_ctx.sending),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
let __VLS_121;
const __VLS_122 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.sendTextMessage) });
/** @type {__VLS_StyleScopedClasses['message-input']} */ ;
var __VLS_119;
var __VLS_120;
let __VLS_123;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "send-btn cosmic-btn-primary" },
    disabled: (!__VLS_ctx.canSend || __VLS_ctx.sending),
    loading: (__VLS_ctx.sending),
}));
const __VLS_125 = __VLS_124({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "send-btn cosmic-btn-primary" },
    disabled: (!__VLS_ctx.canSend || __VLS_ctx.sending),
    loading: (__VLS_ctx.sending),
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
let __VLS_128;
const __VLS_129 = ({ click: {} },
    { onClick: (__VLS_ctx.sendTextMessage) });
/** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cosmic-btn-primary']} */ ;
const { default: __VLS_130 } = __VLS_126.slots;
if (!__VLS_ctx.sending) {
    let __VLS_131;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({}));
    const __VLS_133 = __VLS_132({}, ...__VLS_functionalComponentArgsRest(__VLS_132));
    const { default: __VLS_136 } = __VLS_134.slots;
    let __VLS_137;
    /** @ts-ignore @type {typeof __VLS_components.Promotion} */
    Promotion;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({}));
    const __VLS_139 = __VLS_138({}, ...__VLS_functionalComponentArgsRest(__VLS_138));
    // @ts-ignore
    [inputText, sending, sending, sending, sending, sendTextMessage, sendTextMessage, canSend,];
    var __VLS_134;
}
(__VLS_ctx.sending ? '发送中' : '发送');
// @ts-ignore
[sending,];
var __VLS_126;
var __VLS_127;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
