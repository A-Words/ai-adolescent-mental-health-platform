/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Promotion, Picture, Loading, Close } from '@element-plus/icons-vue';
import { getConversations, getMessageHistory, sendMessage, sendImageMessage } from '@/api/psychologist';
import { getMyPsychologistProfile } from '@/api/psychologistAdminPage';
// 状态
const loadingList = ref(false);
const loadingMessages = ref(false);
const chatUsers = ref([]);
const activeUser = ref(null);
const messages = ref([]);
const messageInput = ref('');
const messagesContainer = ref(null);
const sending = ref(false);
const isConnected = ref(false);
const previewImage = ref('');
const previewFile = ref(null);
const currentUserId = ref(0);
const psychologistId = ref(0); // 心理咨询师ID
// SSE连接
let eventSource = null;
// 配置
const token = localStorage.getItem('token') || '';
const baseApiUrl = import.meta.env.VITE_API_BASE_URL || '';
const uploadUrl = baseApiUrl ? baseApiUrl + '/common/upload' : '/api/common/upload';
// 计算属性 - 图文咨询状态限制
const canSend = computed(() => {
    // 检查是否有消息内容
    if (!messageInput.value.trim() && !previewImage.value)
        return false;
    if (sending.value)
        return false;
    // 检查预约状态 - 不允许在已完成、已取消、已评价状态下发送消息
    // 允许的状态：0-待审核、1-已确认、3-进行中、7-待进行
    if (activeUser.value?.status !== undefined) {
        const allowedStatuses = [0, 1, 3, 7];
        if (!allowedStatuses.includes(activeUser.value.status)) {
            return false;
        }
    }
    return true;
});
// 初始化
onMounted(async () => {
    // 获取当前用户ID
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
    // 获取心理咨询师ID
    try {
        const profileRes = await getMyPsychologistProfile();
        if (profileRes.code === 200 && profileRes.data) {
            // 后端返回的数据结构是 { psychologistId, psychologist }
            psychologistId.value = profileRes.data.psychologistId;
            console.log('获取到psychologistId:', psychologistId.value);
            // 获取到ID后再获取对话列表
            fetchConversations();
        }
        else {
            console.error('获取咨询师信息失败: 未找到数据', profileRes);
        }
    }
    catch (e) {
        console.error('获取咨询师信息失败', e);
    }
});
// 组件卸载
onUnmounted(() => {
    disconnectSSE();
});
// 获取对话列表
const fetchConversations = async () => {
    loadingList.value = true;
    try {
        const res = await getConversations();
        if (res.code === 200 && res.data) {
            chatUsers.value = res.data.map((item) => ({
                appointmentId: item.appointmentId,
                userId: item.userId,
                userName: '用户', // 后续可从用户信息接口获取
                userHead: '', // 后续可从用户信息接口获取
                serviceType: item.serviceType,
                lastMessage: item.userProblems || '暂无消息',
                lastTime: item.createTime ? formatDate(item.createTime) : '',
                unreadCount: 0,
                status: item.status, // 预约状态
                appointmentInfo: `${item.serviceType} - ¥${item.fee || 0}`
            }));
        }
    }
    catch (e) {
        console.error('获取对话列表失败', e);
        ElMessage.error('获取对话列表失败');
    }
    finally {
        loadingList.value = false;
    }
};
// 选择用户
const selectUser = async (user) => {
    // 断开之前的SSE连接
    disconnectSSE();
    activeUser.value = user;
    user.unreadCount = 0;
    messages.value = [];
    // 加载消息历史
    await loadMessages();
    // 确保psychologistId已获取后再连接SSE
    if (!psychologistId.value) {
        console.warn('等待获取psychologistId...');
        // 等待一段时间后重试
        setTimeout(() => {
            if (psychologistId.value) {
                connectSSE();
            }
        }, 1000);
    }
    else {
        // 连接SSE
        connectSSE();
    }
};
// 加载消息历史
const loadMessages = async () => {
    if (!activeUser.value)
        return;
    loadingMessages.value = true;
    try {
        const res = await getMessageHistory(activeUser.value.appointmentId);
        if (res.code === 200 && res.data) {
            messages.value = res.data.map((msg) => ({
                ...msg,
                isSelf: msg.senderId === currentUserId.value
            }));
        }
    }
    catch (e) {
        console.error('加载消息失败', e);
        ElMessage.error('加载消息失败');
    }
    finally {
        loadingMessages.value = false;
        nextTick(() => scrollToBottom());
    }
};
// 连接SSE
const connectSSE = () => {
    // 检查必要参数
    if (!psychologistId.value) {
        console.warn('psychologistId 未获取，等待中...');
        return;
    }
    if (!activeUser.value) {
        console.warn('activeUser 未选择，等待中...');
        return;
    }
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    // 构建SSE URL - 使用 /api 前缀以便vite代理转发
    const psyId = psychologistId.value;
    const encodedToken = encodeURIComponent(token);
    const sseUrl = '/api/psychologist/message/stream/psychologist/' + psyId + '?token=' + encodedToken;
    console.log('连接SSE:', sseUrl);
    eventSource = new EventSource(sseUrl);
    // 连接打开时设置状态
    eventSource.onopen = () => {
        console.log('SSE连接已建立');
        isConnected.value = true;
    };
    // 使用 addEventListener 监听特定事件
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
            // 跳过连接确认消息
            if (messageData.type === 'connected') {
                isConnected.value = true;
                return;
            }
            // 只处理当前对话的消息
            if (messageData.appointmentId === activeUser.value?.appointmentId) {
                // 去重
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
            // 更新用户列表的最后消息
            const chatUser = chatUsers.value.find(u => u.appointmentId === messageData.appointmentId);
            if (chatUser && !messageData.isSelf) {
                chatUser.lastMessage = messageData.contentType === 1 ? '[图片]' : messageData.content;
                chatUser.unreadCount++;
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
            if (activeUser.value) {
                console.log('尝试重连SSE...');
                connectSSE();
            }
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
    if (!messageInput.value.trim() || sending.value || !activeUser.value)
        return;
    const content = messageInput.value.trim();
    messageInput.value = '';
    sending.value = true;
    try {
        const res = await sendMessage({
            appointmentId: activeUser.value.appointmentId,
            receiverId: activeUser.value.userId,
            content: content,
            contentType: 0
        });
        if (res.code === 200) {
            console.log('消息发送成功');
        }
    }
    catch (e) {
        console.error('发送消息失败', e);
        ElMessage.error('发送消息失败');
        messageInput.value = content;
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
    return false;
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
    if (!activeUser.value)
        return;
    sending.value = true;
    try {
        const res = await sendImageMessage({
            appointmentId: activeUser.value.appointmentId,
            receiverId: activeUser.value.userId,
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
const formatDate = (dateStr) => {
    if (!dateStr)
        return '';
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}/${day}`;
};
// 服务类型映射
const serviceTypeMap = {
    'TEXT': '图文咨询',
    'VIDEO': '视频咨询',
    'VOICE': '语音咨询',
    'OFFLINE': '线下面询'
};
const getServiceTypeName = (type) => serviceTypeMap[type] || type || '咨询';
const getServiceTypeTag = (type) => {
    const map = {
        'TEXT': '',
        'VIDEO': 'success',
        'VOICE': 'warning',
        'OFFLINE': 'info'
    };
    return map[type] || '';
};
// 滚动到底部
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};
// 获取输入框占位符 - 根据状态显示不同提示
const getInputPlaceholder = () => {
    if (activeUser.value?.status !== undefined) {
        const allowedStatuses = [0, 1, 3, 7];
        if (!allowedStatuses.includes(activeUser.value.status)) {
            return '当前状态不允许发送消息';
        }
    }
    return '输入消息...';
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['user-item']} */ ;
/** @type {__VLS_StyleScopedClasses['user-item']} */ ;
/** @type {__VLS_StyleScopedClasses['user-item']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['connection-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['connected']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-self']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['message-self']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "psychologist-chat-container" },
});
/** @type {__VLS_StyleScopedClasses['psychologist-chat-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-layout" },
});
/** @type {__VLS_StyleScopedClasses['chat-layout']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-list" },
});
/** @type {__VLS_StyleScopedClasses['user-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "list-header" },
});
/** @type {__VLS_StyleScopedClasses['list-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
if (__VLS_ctx.chatUsers.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "user-count" },
    });
    /** @type {__VLS_StyleScopedClasses['user-count']} */ ;
    (__VLS_ctx.chatUsers.length);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "list-content" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingList) }, null, null);
/** @type {__VLS_StyleScopedClasses['list-content']} */ ;
for (const [user] of __VLS_vFor((__VLS_ctx.chatUsers))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectUser(user);
                // @ts-ignore
                [chatUsers, chatUsers, chatUsers, vLoading, loadingList, selectUser,];
            } },
        key: (user.appointmentId),
        ...{ class: "user-item" },
        ...{ class: ({ active: __VLS_ctx.activeUser?.appointmentId === user.appointmentId, unread: user.unreadCount > 0 }) },
    });
    /** @type {__VLS_StyleScopedClasses['user-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    /** @type {__VLS_StyleScopedClasses['unread']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        size: (48),
        src: (user.userHead),
    }));
    const __VLS_2 = __VLS_1({
        size: (48),
        src: (user.userHead),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const { default: __VLS_5 } = __VLS_3.slots;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const { default: __VLS_11 } = __VLS_9.slots;
    let __VLS_12;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    // @ts-ignore
    [activeUser,];
    var __VLS_9;
    // @ts-ignore
    [];
    var __VLS_3;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['user-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "user-name" },
    });
    /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
    (user.userName || '匿名用户');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "last-msg" },
    });
    /** @type {__VLS_StyleScopedClasses['last-msg']} */ ;
    (user.lastMessage || '暂无消息');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['user-meta']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "last-time" },
    });
    /** @type {__VLS_StyleScopedClasses['last-time']} */ ;
    (user.lastTime || '');
    let __VLS_17;
    /** @ts-ignore @type {typeof __VLS_components.elBadge | typeof __VLS_components.ElBadge} */
    elBadge;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
        value: (user.unreadCount),
        hidden: (user.unreadCount === 0),
    }));
    const __VLS_19 = __VLS_18({
        value: (user.unreadCount),
        hidden: (user.unreadCount === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    // @ts-ignore
    [];
}
if (__VLS_ctx.chatUsers.length === 0 && !__VLS_ctx.loadingList) {
    let __VLS_22;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        description: "暂无咨询用户",
    }));
    const __VLS_24 = __VLS_23({
        description: "暂无咨询用户",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
}
if (__VLS_ctx.activeUser) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-window" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-window']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-header" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
    let __VLS_27;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
        size: (40),
        src: (__VLS_ctx.activeUser.userHead),
    }));
    const __VLS_29 = __VLS_28({
        size: (40),
        src: (__VLS_ctx.activeUser.userHead),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    const { default: __VLS_32 } = __VLS_30.slots;
    let __VLS_33;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({}));
    const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
    const { default: __VLS_38 } = __VLS_36.slots;
    let __VLS_39;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({}));
    const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
    // @ts-ignore
    [chatUsers, loadingList, activeUser, activeUser,];
    var __VLS_36;
    // @ts-ignore
    [];
    var __VLS_30;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-user-info" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-user-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "user-name" },
    });
    /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
    (__VLS_ctx.activeUser.userName || '用户');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "user-appointment" },
    });
    /** @type {__VLS_StyleScopedClasses['user-appointment']} */ ;
    let __VLS_44;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
        size: "small",
        type: (__VLS_ctx.getServiceTypeTag(__VLS_ctx.activeUser.serviceType)),
    }));
    const __VLS_46 = __VLS_45({
        size: "small",
        type: (__VLS_ctx.getServiceTypeTag(__VLS_ctx.activeUser.serviceType)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const { default: __VLS_49 } = __VLS_47.slots;
    (__VLS_ctx.getServiceTypeName(__VLS_ctx.activeUser.serviceType));
    // @ts-ignore
    [activeUser, activeUser, activeUser, getServiceTypeTag, getServiceTypeName,];
    var __VLS_47;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "connection-indicator" },
        ...{ class: ({ connected: __VLS_ctx.isConnected }) },
    });
    /** @type {__VLS_StyleScopedClasses['connection-indicator']} */ ;
    /** @type {__VLS_StyleScopedClasses['connected']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dot" },
    });
    /** @type {__VLS_StyleScopedClasses['dot']} */ ;
    (__VLS_ctx.isConnected ? '在线' : '连接中');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "messages-container" },
        ref: "messagesContainer",
    });
    /** @type {__VLS_StyleScopedClasses['messages-container']} */ ;
    if (__VLS_ctx.loadingMessages) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "loading-messages" },
        });
        /** @type {__VLS_StyleScopedClasses['loading-messages']} */ ;
        let __VLS_50;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
            ...{ class: "is-loading" },
        }));
        const __VLS_52 = __VLS_51({
            ...{ class: "is-loading" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        /** @type {__VLS_StyleScopedClasses['is-loading']} */ ;
        const { default: __VLS_55 } = __VLS_53.slots;
        let __VLS_56;
        /** @ts-ignore @type {typeof __VLS_components.Loading} */
        Loading;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
        const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
        // @ts-ignore
        [isConnected, isConnected, loadingMessages,];
        var __VLS_53;
    }
    else if (__VLS_ctx.messages.length === 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "empty-messages" },
        });
        /** @type {__VLS_StyleScopedClasses['empty-messages']} */ ;
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
            let __VLS_61;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
                size: (40),
                src: (msg.isSelf ? '' : __VLS_ctx.activeUser.userHead),
                ...{ class: "message-avatar" },
            }));
            const __VLS_63 = __VLS_62({
                size: (40),
                src: (msg.isSelf ? '' : __VLS_ctx.activeUser.userHead),
                ...{ class: "message-avatar" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_62));
            /** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
            const { default: __VLS_66 } = __VLS_64.slots;
            let __VLS_67;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({}));
            const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
            const { default: __VLS_72 } = __VLS_70.slots;
            let __VLS_73;
            /** @ts-ignore @type {typeof __VLS_components.User} */
            User;
            // @ts-ignore
            const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({}));
            const __VLS_75 = __VLS_74({}, ...__VLS_functionalComponentArgsRest(__VLS_74));
            // @ts-ignore
            [activeUser, messages, messages,];
            var __VLS_70;
            // @ts-ignore
            [];
            var __VLS_64;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "message-bubble-wrapper" },
            });
            /** @type {__VLS_StyleScopedClasses['message-bubble-wrapper']} */ ;
            if (msg.contentType === 0 || !msg.contentType) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "message-bubble" },
                });
                /** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                    ...{ class: "message-content" },
                });
                /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
                (msg.content);
            }
            else if (msg.contentType === 1) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "message-bubble image-bubble" },
                });
                /** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
                /** @type {__VLS_StyleScopedClasses['image-bubble']} */ ;
                let __VLS_78;
                /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
                elImage;
                // @ts-ignore
                const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
                    src: (msg.content),
                    previewSrcList: ([msg.content]),
                    fit: "cover",
                    ...{ class: "message-image" },
                }));
                const __VLS_80 = __VLS_79({
                    src: (msg.content),
                    previewSrcList: ([msg.content]),
                    fit: "cover",
                    ...{ class: "message-image" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_79));
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
    if (__VLS_ctx.previewImage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "image-preview-bar" },
        });
        /** @type {__VLS_StyleScopedClasses['image-preview-bar']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "preview-item" },
        });
        /** @type {__VLS_StyleScopedClasses['preview-item']} */ ;
        let __VLS_83;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
            src: (__VLS_ctx.previewImage),
            fit: "cover",
            ...{ class: "preview-img" },
        }));
        const __VLS_85 = __VLS_84({
            src: (__VLS_ctx.previewImage),
            fit: "cover",
            ...{ class: "preview-img" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        /** @type {__VLS_StyleScopedClasses['preview-img']} */ ;
        let __VLS_88;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({
            ...{ 'onClick': {} },
            ...{ class: "preview-close" },
        }));
        const __VLS_90 = __VLS_89({
            ...{ 'onClick': {} },
            ...{ class: "preview-close" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        let __VLS_93;
        const __VLS_94 = ({ click: {} },
            { onClick: (__VLS_ctx.removePreview) });
        /** @type {__VLS_StyleScopedClasses['preview-close']} */ ;
        const { default: __VLS_95 } = __VLS_91.slots;
        let __VLS_96;
        /** @ts-ignore @type {typeof __VLS_components.Close} */
        Close;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({}));
        const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
        // @ts-ignore
        [previewImage, previewImage, removePreview,];
        var __VLS_91;
        var __VLS_92;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-input" },
    });
    /** @type {__VLS_StyleScopedClasses['message-input']} */ ;
    let __VLS_101;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
        action: (__VLS_ctx.uploadUrl),
        headers: ({ Authorization: `Bearer ${__VLS_ctx.token}` }),
        showFileList: (false),
        beforeUpload: (__VLS_ctx.beforeImageUpload),
        onSuccess: (__VLS_ctx.handleImageSuccess),
        onError: (__VLS_ctx.handleImageError),
        accept: "image/*",
        disabled: (!__VLS_ctx.canSend),
    }));
    const __VLS_103 = __VLS_102({
        action: (__VLS_ctx.uploadUrl),
        headers: ({ Authorization: `Bearer ${__VLS_ctx.token}` }),
        showFileList: (false),
        beforeUpload: (__VLS_ctx.beforeImageUpload),
        onSuccess: (__VLS_ctx.handleImageSuccess),
        onError: (__VLS_ctx.handleImageError),
        accept: "image/*",
        disabled: (!__VLS_ctx.canSend),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    const { default: __VLS_106 } = __VLS_104.slots;
    let __VLS_107;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
        text: true,
        ...{ class: "upload-btn" },
        ...{ class: ({ disabled: !__VLS_ctx.canSend }) },
    }));
    const __VLS_109 = __VLS_108({
        text: true,
        ...{ class: "upload-btn" },
        ...{ class: ({ disabled: !__VLS_ctx.canSend }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    /** @type {__VLS_StyleScopedClasses['upload-btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['disabled']} */ ;
    const { default: __VLS_112 } = __VLS_110.slots;
    let __VLS_113;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({}));
    const __VLS_115 = __VLS_114({}, ...__VLS_functionalComponentArgsRest(__VLS_114));
    const { default: __VLS_118 } = __VLS_116.slots;
    let __VLS_119;
    /** @ts-ignore @type {typeof __VLS_components.Picture} */
    Picture;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({}));
    const __VLS_121 = __VLS_120({}, ...__VLS_functionalComponentArgsRest(__VLS_120));
    // @ts-ignore
    [uploadUrl, token, beforeImageUpload, handleImageSuccess, handleImageError, canSend, canSend,];
    var __VLS_116;
    // @ts-ignore
    [];
    var __VLS_110;
    // @ts-ignore
    [];
    var __VLS_104;
    let __VLS_124;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.messageInput),
        placeholder: (__VLS_ctx.getInputPlaceholder()),
        disabled: (!__VLS_ctx.canSend || __VLS_ctx.sending),
        ...{ class: "message-input-field" },
    }));
    const __VLS_126 = __VLS_125({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.messageInput),
        placeholder: (__VLS_ctx.getInputPlaceholder()),
        disabled: (!__VLS_ctx.canSend || __VLS_ctx.sending),
        ...{ class: "message-input-field" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    let __VLS_129;
    const __VLS_130 = ({ keyup: {} },
        { onKeyup: (__VLS_ctx.sendTextMessage) });
    /** @type {__VLS_StyleScopedClasses['message-input-field']} */ ;
    var __VLS_127;
    var __VLS_128;
    let __VLS_131;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.canSend || __VLS_ctx.sending),
        loading: (__VLS_ctx.sending),
        ...{ class: "send-btn" },
    }));
    const __VLS_133 = __VLS_132({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.canSend || __VLS_ctx.sending),
        loading: (__VLS_ctx.sending),
        ...{ class: "send-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    let __VLS_136;
    const __VLS_137 = ({ click: {} },
        { onClick: (__VLS_ctx.sendTextMessage) });
    /** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
    const { default: __VLS_138 } = __VLS_134.slots;
    if (!__VLS_ctx.sending) {
        let __VLS_139;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({}));
        const __VLS_141 = __VLS_140({}, ...__VLS_functionalComponentArgsRest(__VLS_140));
        const { default: __VLS_144 } = __VLS_142.slots;
        let __VLS_145;
        /** @ts-ignore @type {typeof __VLS_components.Promotion} */
        Promotion;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({}));
        const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
        // @ts-ignore
        [canSend, canSend, messageInput, getInputPlaceholder, sending, sending, sending, sending, sendTextMessage, sendTextMessage,];
        var __VLS_142;
    }
    (__VLS_ctx.sending ? '发送中' : '发送');
    // @ts-ignore
    [sending,];
    var __VLS_134;
    var __VLS_135;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-empty" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-empty']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "empty-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
