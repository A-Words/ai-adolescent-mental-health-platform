/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, nextTick } from 'vue';
import request from '@/api/user'; // Use existing request instance
import { ElMessage } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
const inputMessage = ref('');
const sessions = ref([]);
const currentSessionId = ref(null);
const messages = ref([]);
const loadingSessions = ref(false);
const streaming = ref(false);
const currentStreamContent = ref('');
const enableThinking = ref(false);
const userAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';
const aiAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
const chatWindow = ref(null);
// Load sessions
const loadSessions = async () => {
    loadingSessions.value = true;
    try {
        const res = await request.get('/ai/sessions');
        if (res.code === 200) {
            sessions.value = res.data;
            if (sessions.value.length > 0 && !currentSessionId.value) {
                selectSession(sessions.value[0].id);
            }
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        loadingSessions.value = false;
    }
};
const createNewSession = async () => {
    try {
        const res = await request.post('/ai/session');
        if (res.code === 200) {
            const newSession = res.data;
            sessions.value.unshift(newSession);
            selectSession(newSession.id);
        }
    }
    catch (e) {
        ElMessage.error('创建会话失败');
    }
};
const deleteSession = async (id) => {
    try {
        const res = await request.delete(`/ai/session/${id}`);
        if (res.code === 200) {
            ElMessage.success('删除成功');
            sessions.value = sessions.value.filter(s => s.id !== id);
            if (currentSessionId.value === id) {
                currentSessionId.value = null;
                messages.value = [];
                if (sessions.value.length > 0) {
                    selectSession(sessions.value[0].id);
                }
            }
        }
    }
    catch (e) {
        ElMessage.error('删除失败');
    }
};
const selectSession = async (id) => {
    currentSessionId.value = id;
    messages.value = [];
    try {
        const res = await request.get(`/ai/session/${id}/messages`);
        if (res.code === 200) {
            messages.value = res.data;
            scrollToBottom();
        }
    }
    catch (e) {
        console.error(e);
    }
};
const handleEnter = (e) => {
    if (e.shiftKey)
        return; // Allow new line
    sendMessage();
};
const sendMessage = async () => {
    if (!inputMessage.value.trim() || streaming.value)
        return;
    const text = inputMessage.value;
    inputMessage.value = '';
    // Optimistic update
    messages.value.push({ role: 'user', content: text });
    scrollToBottom();
    streaming.value = true;
    currentStreamContent.value = '';
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token || ''
            },
            body: JSON.stringify({
                message: text,
                sessionId: currentSessionId.value,
                enableThinking: enableThinking.value
            })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const reader = response.body?.getReader();
        if (!reader)
            throw new Error('No reader');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (value) {
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim().startsWith('data:')) {
                        const data = line.trim().substring(5);
                        currentStreamContent.value += data;
                        scrollToBottom();
                    }
                }
            }
            if (done)
                break;
        }
        // Finished
        messages.value.push({ role: 'assistant', content: currentStreamContent.value });
        currentStreamContent.value = '';
        // Reload sessions to update title/time or if new session created
        if (!currentSessionId.value) {
            loadSessions(); // Reload to get new session
        }
    }
    catch (e) {
        ElMessage.error('发送失败');
        messages.value.push({ role: 'system', content: '发送失败，请重试' });
    }
    finally {
        streaming.value = false;
    }
};
const scrollToBottom = () => {
    nextTick(() => {
        if (chatWindow.value) {
            chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
        }
    });
};
onMounted(() => {
    loadSessions();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['session-item']} */ ;
/** @type {__VLS_StyleScopedClasses['session-item']} */ ;
/** @type {__VLS_StyleScopedClasses['user-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['user-message']} */ ;
/** @type {__VLS_StyleScopedClasses['text-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['text-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-textarea__inner']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "ai-consultation-container" },
});
/** @type {__VLS_StyleScopedClasses['ai-consultation-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar" },
});
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-header" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    icon: "Plus",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    icon: "Plus",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.createNewSession) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[createNewSession,];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "session-list" },
});
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingSessions) }, null, null);
/** @type {__VLS_StyleScopedClasses['session-list']} */ ;
for (const [session] of __VLS_vFor((__VLS_ctx.sessions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectSession(session.id);
                // @ts-ignore
                [vLoading, loadingSessions, sessions, selectSession,];
            } },
        key: (session.id),
        ...{ class: (['session-item', __VLS_ctx.currentSessionId === session.id ? 'active' : '']) },
    });
    /** @type {__VLS_StyleScopedClasses['session-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "session-title" },
    });
    /** @type {__VLS_StyleScopedClasses['session-title']} */ ;
    (session.title);
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.elPopconfirm | typeof __VLS_components.ElPopconfirm | typeof __VLS_components.elPopconfirm | typeof __VLS_components.ElPopconfirm} */
    elPopconfirm;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        ...{ 'onConfirm': {} },
        title: "确定删除该会话吗？",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onConfirm': {} },
        title: "确定删除该会话吗？",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_13;
    const __VLS_14 = ({ confirm: {} },
        { onConfirm: (...[$event]) => {
                __VLS_ctx.deleteSession(session.id);
                // @ts-ignore
                [currentSessionId, deleteSession,];
            } });
    const { default: __VLS_15 } = __VLS_11.slots;
    {
        const { reference: __VLS_16 } = __VLS_11.slots;
        let __VLS_17;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
            ...{ 'onClick': {} },
            type: "danger",
            link: true,
            size: "small",
        }));
        const __VLS_19 = __VLS_18({
            ...{ 'onClick': {} },
            type: "danger",
            link: true,
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_18));
        let __VLS_22;
        const __VLS_23 = ({ click: {} },
            { onClick: () => { } });
        const { default: __VLS_24 } = __VLS_20.slots;
        let __VLS_25;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
        const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
        const { default: __VLS_30 } = __VLS_28.slots;
        let __VLS_31;
        /** @ts-ignore @type {typeof __VLS_components.Delete} */
        Delete;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
        const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
        // @ts-ignore
        [];
        var __VLS_28;
        // @ts-ignore
        [];
        var __VLS_20;
        var __VLS_21;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_11;
    var __VLS_12;
    // @ts-ignore
    [];
}
if (__VLS_ctx.sessions.length === 0) {
    let __VLS_36;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
        description: "暂无历史会话",
        imageSize: (60),
    }));
    const __VLS_38 = __VLS_37({
        description: "暂无历史会话",
        imageSize: (60),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-area" },
});
/** @type {__VLS_StyleScopedClasses['chat-area']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-header" },
});
/** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-left" },
});
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "title" },
});
/** @type {__VLS_StyleScopedClasses['title']} */ ;
let __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
elTag;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    size: "small",
    type: "success",
}));
const __VLS_43 = __VLS_42({
    size: "small",
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
const { default: __VLS_46 } = __VLS_44.slots;
// @ts-ignore
[sessions,];
var __VLS_44;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-window" },
    ref: "chatWindow",
});
/** @type {__VLS_StyleScopedClasses['chat-window']} */ ;
if (__VLS_ctx.messages.length === 0 && !__VLS_ctx.loadingSessions) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "welcome-screen" },
    });
    /** @type {__VLS_StyleScopedClasses['welcome-screen']} */ ;
    let __VLS_47;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty | typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        description: "开始一次新的心理咨询吧",
    }));
    const __VLS_49 = __VLS_48({
        description: "开始一次新的心理咨询吧",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
}
for (const [msg, index] of __VLS_vFor((__VLS_ctx.messages))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: (['message', msg.role === 'user' ? 'user-message' : 'ai-message']) },
    });
    /** @type {__VLS_StyleScopedClasses['message']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-content" },
    });
    /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
    let __VLS_52;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
        size: (36),
        src: (msg.role === 'user' ? __VLS_ctx.userAvatar : __VLS_ctx.aiAvatar),
        ...{ class: "avatar" },
    }));
    const __VLS_54 = __VLS_53({
        size: (36),
        src: (msg.role === 'user' ? __VLS_ctx.userAvatar : __VLS_ctx.aiAvatar),
        ...{ class: "avatar" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-bubble" },
    });
    /** @type {__VLS_StyleScopedClasses['text-bubble']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-content" },
    });
    /** @type {__VLS_StyleScopedClasses['text-content']} */ ;
    (msg.content);
    // @ts-ignore
    [loadingSessions, messages, messages, userAvatar, aiAvatar,];
}
if (__VLS_ctx.streaming) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message ai-message" },
    });
    /** @type {__VLS_StyleScopedClasses['message']} */ ;
    /** @type {__VLS_StyleScopedClasses['ai-message']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-content" },
    });
    /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
    let __VLS_57;
    /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
    elAvatar;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
        size: (36),
        src: (__VLS_ctx.aiAvatar),
        ...{ class: "avatar" },
    }));
    const __VLS_59 = __VLS_58({
        size: (36),
        src: (__VLS_ctx.aiAvatar),
        ...{ class: "avatar" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-bubble" },
    });
    /** @type {__VLS_StyleScopedClasses['text-bubble']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-content" },
    });
    /** @type {__VLS_StyleScopedClasses['text-content']} */ ;
    (__VLS_ctx.currentStreamContent);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "cursor" },
    });
    /** @type {__VLS_StyleScopedClasses['cursor']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "input-area" },
});
/** @type {__VLS_StyleScopedClasses['input-area']} */ ;
let __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.inputMessage),
    placeholder: "请输入您的问题... (Shift+Enter 换行)",
    type: "textarea",
    rows: (4),
    disabled: (__VLS_ctx.streaming),
    resize: "none",
}));
const __VLS_64 = __VLS_63({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.inputMessage),
    placeholder: "请输入您的问题... (Shift+Enter 换行)",
    type: "textarea",
    rows: (4),
    disabled: (__VLS_ctx.streaming),
    resize: "none",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_67;
const __VLS_68 = ({ keydown: {} },
    { onKeydown: (__VLS_ctx.handleEnter) });
var __VLS_65;
var __VLS_66;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "input-actions" },
});
/** @type {__VLS_StyleScopedClasses['input-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "tip" },
});
/** @type {__VLS_StyleScopedClasses['tip']} */ ;
let __VLS_69;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.streaming),
    disabled: (!__VLS_ctx.inputMessage.trim()),
}));
const __VLS_71 = __VLS_70({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.streaming),
    disabled: (!__VLS_ctx.inputMessage.trim()),
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_74;
const __VLS_75 = ({ click: {} },
    { onClick: (__VLS_ctx.sendMessage) });
const { default: __VLS_76 } = __VLS_72.slots;
// @ts-ignore
[aiAvatar, streaming, streaming, streaming, currentStreamContent, inputMessage, inputMessage, handleEnter, sendMessage,];
var __VLS_72;
var __VLS_73;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
