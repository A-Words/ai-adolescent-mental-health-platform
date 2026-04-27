/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import { xiaoaiApi } from '@/api/xiaoai';
// ========== 音色列表（支持中文+英语的音色） ==========
const VOICE_LIST = [
    { voice: 'Tina', name: '甜甜 Tina', desc: '温暖治愈系小姐姐', gender: 'female' },
    { voice: 'Liora Mira', name: '清欢 Liora', desc: '烟火人间的温柔', gender: 'female' },
    { voice: 'Sunnybobi', name: '知芝 Sunny', desc: '社恐邻家姑娘', gender: 'female' },
    { voice: 'Raymond', name: '林川 Raymond', desc: '爱吃外卖的宅男', gender: 'male' },
    { voice: 'Ethan', name: '晨煦 Ethan', desc: '阳光温暖活力少年', gender: 'male' },
    { voice: 'Theo Calm', name: '予安 Theo', desc: '静默处传递理解', gender: 'male' },
    { voice: 'Serena', name: '苏瑶 Serena', desc: '温柔小姐姐', gender: 'female' },
    { voice: 'Harvey', name: '厚 Harvey', desc: '岁月沉淀的大叔', gender: 'male' },
    { voice: 'Maia', name: '四月 Maia', desc: '知性与温柔碰撞', gender: 'female' },
    { voice: 'Evan', name: '江晨 Evan', desc: '年下奶狗男孩', gender: 'male' },
    { voice: 'Momo', name: '茉兔 Momo', desc: '撒娇搞怪小可爱', gender: 'female' },
    { voice: 'Angel', name: '安琪 Angel', desc: '台式甜美女孩', gender: 'female' },
    { voice: 'Mia', name: '舒然 Mia', desc: '温柔生活博主', gender: 'female' },
    { voice: 'Joyner', name: '阿逗 Joyner', desc: '搞笑接地气', gender: 'male' },
    { voice: 'Katerina', name: '卡捷琳娜', desc: '御姐韵律音色', gender: 'female' },
    { voice: 'Ryan', name: '甜茶 Ryan', desc: '戏感炸裂男孩', gender: 'male' },
    { voice: 'Jennifer', name: '詹妮弗', desc: '电影质感美语女声', gender: 'female' },
    { voice: 'Aiden', name: '艾登 Aiden', desc: '精通厨艺大男孩', gender: 'male' },
    { voice: 'Mione', name: '敏儿 Mione', desc: '成熟知性妹妹', gender: 'female' },
    { voice: 'Sohee', name: '素熙 Sohee', desc: '韩国开朗欧尼', gender: 'female' },
    { voice: 'Lenn', name: '莱恩 Lenn', desc: '理性叛逆德国青年', gender: 'male' },
    { voice: 'Andre', name: '安德雷 Andre', desc: '磁性沉稳男生', gender: 'male' },
    { voice: 'Roya', name: '萝雅 Roya', desc: '热爱运动女孩', gender: 'female' },
    { voice: 'Arda', name: '阿尔达 Arda', desc: '干净温润男生', gender: 'male' },
    { voice: 'Marina', name: '玛丽娜 Marina', desc: '多元文化女孩', gender: 'female' },
];
// ========== 1. 常量抽离（统一维护） ==========
const CONSTS = {
    WS_PATH: '/ws/omni-realtime',
    CHUNK_SIZE: 16 * 1024,
    AUDIO_SAMPLE_RATE: 16000,
    AUDIO_CHANNELS: 1,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024,
    RECORD_INTERVAL: 100,
    RECONNECT_LIMIT: 3,
    RECONNECT_DELAY: 2000,
    WAV_HEADER_LENGTH: 44 // WAV文件头固定长度
};
// ========== 视频配置（抽帧参数） ==========
const VIDEO_CONFIG = {
    FRAME_INTERVAL: 2000, // 抽帧间隔（毫秒）- 语音活跃时每2秒1帧
    MAX_FRAMES: 5, // 最大保留帧数
    WIDTH: 640, // 视频宽度
    HEIGHT: 480, // 视频高度
    QUALITY: 0.6, // JPEG 压缩质量 0-1
    VAD_THRESHOLD: 0.02 // 语音活跃阈值（振幅绝对值的平均）
};
// ========== 2. 状态整合（简化管理） ==========
const state = reactive({
    isConnected: false,
    isRecording: false,
    isMuted: false,
    recordDuration: 0, // 录音时长（秒）
    previewImage: '', // 图片预览Base64
    chatMessages: [], // 聊天消息列表
    isLoading: {
        connect: false,
        record: false,
        upload: false
    },
    // VAD模式：true = 服务端VAD（自动检测语音结束），false = 手动控制
    isVadMode: true,
    // 当前选出的音色索引
    currentVoiceIndex: 0,
    // 是否显示音色选择器
    showVoiceSelector: false,
    // ===== 视频模式相关状态 =====
    isVideoMode: false, // 是否开启视频模式
    videoStream: null, // 摄像头媒体流
    videoFrames: [], // 视频帧队列（Base64数组）
    videoPosition: { x: 20, y: 80 }, // 浮窗位置
    // ===== 时长相关状态 =====
    memberType: 0, // 会员类型：0-非会员, 1-VIP, 2-SVIP
    dailyLimit: 0, // 每日限制（秒）
    remainingSeconds: 0, // 剩余秒数
    totalUsedSeconds: 0, // 累计已用秒数
    lastConsumedSeconds: 0, // 上次已上报的秒数
    isTimeExpired: false, // 时长是否已耗尽
    todayMessagesLoaded: false, // 今日消息是否已加载
    // ===== 会话相关状态 =====
    currentSessionId: null, // 当前会话ID
    currentUserId: null // 当前用户ID
});
// 当前选中的音色
const currentVoice = computed(() => VOICE_LIST[state.currentVoiceIndex]);
// 选中指定音色
const selectVoice = (index) => {
    state.currentVoiceIndex = index;
    state.showVoiceSelector = false;
    addSystemMessage(`已切换音色：${currentVoice.value.name}`);
};
// 当前已发送的音频字节数（用于更新 WAV 头的文件大小）
let totalSentBytes = 0;
// 是否已发送 WAV 头
let wavHeaderSent = false;
const chatBoxRef = ref(null); // 聊天框DOM引用
const videoRef = ref(null); // 视频DOM引用
let ws = null;
// 录音相关变量（方案A：Web Audio API）
let audioContext = null; // Web Audio API 上下文
let mediaStreamSource = null; // 媒体流源节点
let scriptProcessor = null; // 音频处理节点（用于捕获原始PCM）
let pcmChunks = []; // PCM数据块数组
let recordTimer = null; // 录音时长计时器
let countdownTimer = null; // 时长倒计时
let usageReportTimer = null; // 时长上报计时器（每5秒）
let reconnectCount = 0; // 重连计数器
let videoFrameTimer = null; // 视频抽帧定时器（已废弃，改用活动检测）
let hasAudioSentSinceVideoStart = false; // 标记是否已发送过音频（发送图片前必须先发送音频）
let isAudioActive = false; // 当前是否语音活跃
let lastFrameTime = 0; // 上次抽帧时间戳
let pendingVideoFrame = null; // 待发送的视频帧（等待与下一段音频一起发送）
// ========== 视频帧发送相关变量 ==========
let currentConversationId = null; // 当前对话项ID（用于关联音频和视频）
let currentItemId = null; // 当前对话项的item_id
let audioEventId = null; // 当前音频片段的event_id
let videoFrameIndex = 0; // 视频帧索引（每个对话项内递增）
let isVideoReady = false; // 视频流是否已准备好
// ========== 3. 工具函数 ==========
/**
 * 生成唯一ID（用于消息key）
 */
const generateUniqueId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};
/**
 * 聊天框自动滚动到底部
 */
const scrollToBottom = () => {
    if (chatBoxRef.value) {
        chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
    }
};
// ========== 视频浮窗拖拽 ====================
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
const startDragVideo = (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - state.videoPosition.x;
    dragOffsetY = e.clientY - state.videoPosition.y;
    document.addEventListener('mousemove', onDragVideo);
    document.addEventListener('mouseup', stopDragVideo);
};
const onDragVideo = (e) => {
    if (!isDragging)
        return;
    state.videoPosition.x = e.clientX - dragOffsetX;
    state.videoPosition.y = e.clientY - dragOffsetY;
};
const stopDragVideo = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onDragVideo);
    document.removeEventListener('mouseup', stopDragVideo);
};
/**
 * 初始化AudioContext（兼容不同浏览器）
 */
const initAudioContext = () => {
    if (audioContext)
        return audioContext;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    try {
        audioContext = new AudioContextConstructor({ sampleRate: CONSTS.AUDIO_SAMPLE_RATE });
        return audioContext;
    }
    catch (e) {
        addSystemMessage('当前浏览器不支持音频播放功能');
        return null;
    }
};
/**
 * 添加系统消息（统一封装）
 */
const addSystemMessage = (content) => {
    state.chatMessages.push({
        id: generateUniqueId(),
        role: "系统",
        content,
        timestamp: new Date()
    });
    scrollToBottom();
};
// ========== 视频模式相关函数 ==========
/**
 * 切换视频模式开关
 */
const toggleVideoMode = async () => {
    if (state.isVideoMode) {
        await stopVideo();
    }
    else {
        // 先开启浮窗
        state.isVideoMode = true;
        // 再获取摄像头
        await startVideo();
    }
};
/**
 * 开启视频模式 - 获取摄像头权限
 */
const startVideo = async () => {
    try {
        addSystemMessage('正在请求摄像头权限...');
        // 获取摄像头媒体流
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: VIDEO_CONFIG.WIDTH,
                height: VIDEO_CONFIG.HEIGHT
            },
            audio: false
        });
        state.videoStream = stream;
        state.videoFrames = [];
        // 将流绑定到 video 元素（需要等待 nextTick 确保 videoRef 已挂载）
        await nextTick();
        if (videoRef.value) {
            videoRef.value.srcObject = stream;
        }
        addSystemMessage('✅ 视频模式已开启');
    }
    catch (error) {
        console.error('摄像头权限失败:', error);
        state.isVideoMode = false;
        if (error.name === 'NotAllowedError') {
            addSystemMessage('❌ 摄像头权限被拒绝，请在浏览器设置中允许访问摄像头');
        }
        else if (error.name === 'NotFoundError') {
            addSystemMessage('❌ 未找到摄像头设备');
        }
        else {
            addSystemMessage(`❌ 视频模式开启失败: ${error.message}`);
        }
    }
};
/**
 * 关闭视频模式 - 释放摄像头
 */
const stopVideo = async () => {
    if (state.videoStream) {
        state.videoStream.getTracks().forEach(track => track.stop());
        state.videoStream = null;
    }
    state.isVideoMode = false;
    state.videoFrames = [];
    addSystemMessage('📹 视频模式已关闭');
};
/**
 * 从视频流中捕获单帧图片
 * @returns {string|null} Base64编码的图片数据
 */
const captureFrame = () => {
    if (!videoRef.value || !state.videoStream) {
        console.warn('[视频帧] 视频流未就绪');
        return null;
    }
    const video = videoRef.value;
    // 检查视频是否已加载（有有效的画面）
    if (video.readyState < 2) {
        console.warn('[视频帧] 视频尚未加载完成，readyState:', video.readyState);
        return null;
    }
    // 检查视频是否有实际画面（宽高是否有效）
    if (!video.videoWidth || !video.videoHeight) {
        console.warn('[视频帧] 视频尺寸无效');
        return null;
    }
    // 创建 canvas 用于绘制帧
    const canvas = document.createElement('canvas');
    canvas.width = VIDEO_CONFIG.WIDTH;
    canvas.height = VIDEO_CONFIG.HEIGHT;
    const ctx = canvas.getContext('2d');
    // 绘制当前视频帧到 canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // 转换为 Base64 (JPEG格式压缩)
    const base64Image = canvas.toDataURL('image/jpeg', VIDEO_CONFIG.QUALITY);
    // 去掉 data:image/jpeg;base64, 前缀
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    // 检查是否捕获到有效数据
    if (base64Data.length < 1000) {
        console.warn('[视频帧] 捕获的帧数据过小，可能无效');
        return null;
    }
    return base64Data;
};
/**
 * 发送视频帧到 WebSocket（使用阿里云API正确格式）
 * @param {WebSocket} socket WebSocket连接
 * @param {string} base64Data Base64编码的图片数据
 * @param {number} index 帧索引
 */
const sendVideoFrame = async (socket, base64Data, index = 0) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !base64Data) {
        console.warn('[视频帧] WebSocket未就绪或数据为空');
        return;
    }
    socket.send(JSON.stringify({
        event_id: `evt_${Date.now()}_img_${index}`,
        type: "input_image_buffer.append",
        image: base64Data,
        index: index
    }));
};
/**
 * 开始定时抽帧（已废弃，改用音频活跃检测）
 * 保留函数但不再使用，抽帧逻辑整合到音频发送中
 */
const startVideoFrameCapture = () => {
    // 已废弃：抽帧逻辑已整合到音频发送中（onaudioprocess）
    console.log('[视频抽帧] 使用新版活跃检测模式');
};
/**
 * 停止定时抽帧（已废弃）
 */
const stopVideoFrameCapture = () => {
    // 已废弃：不再需要清理定时器
    console.log('[视频抽帧] 已停止');
};
/**
 * 关闭视频模式（用于浮窗关闭按钮）
 */
const closeVideoMode = () => {
    stopVideo();
};
/**
 * 获取连接状态文本
 */
const getConnectionStatus = computed(() => {
    if (state.isLoading.connect)
        return '连接中...';
    if (state.isConnected)
        return '已连接';
    return '未连接';
});
/**
 * 格式化时间
 */
const formatTime = (date) => {
    if (!date)
        return '';
    const d = new Date(date);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};
/**
 * 格式化剩余时长（MM:SS 格式）
 */
const formatRemainingTime = (seconds) => {
    if (seconds <= 0)
        return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
/**
 * 获取会员类型文本
 */
const getMemberTypeText = (type) => {
    switch (type) {
        case 2: return 'SVIP';
        case 1: return 'VIP';
        default: return '';
    }
};
/**
 * 加载用户时长信息
 */
const loadTimeInfo = async () => {
    console.log('[loadTimeInfo] 开始加载时长信息...');
    try {
        // 从 localStorage 获取用户信息
        const userInfoStr = localStorage.getItem('user');
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            state.currentUserId = userInfo.id;
            console.log('[loadTimeInfo] 当前用户ID:', state.currentUserId);
        }
        // 获取会员类型
        const memberRes = await xiaoaiApi.getMemberType();
        console.log('[loadTimeInfo] getMemberType 响应:', JSON.stringify(memberRes));
        if (memberRes?.data !== undefined) {
            state.memberType = memberRes.data;
        }
        // 获取每日限制
        const limitRes = await xiaoaiApi.getDailyLimit();
        console.log('[loadTimeInfo] getDailyLimit 响应:', JSON.stringify(limitRes));
        if (limitRes?.data !== undefined) {
            state.dailyLimit = limitRes.data;
        }
        // 获取剩余时长
        const remainRes = await xiaoaiApi.getRemainingTime();
        console.log('[loadTimeInfo] getRemainingTime 响应:', JSON.stringify(remainRes));
        if (remainRes?.data !== undefined) {
            state.remainingSeconds = remainRes.data;
        }
        console.log('[loadTimeInfo] 最终状态:', {
            memberType: state.memberType,
            dailyLimit: state.dailyLimit,
            remainingSeconds: state.remainingSeconds
        });
        // 重置时长相关状态
        state.totalUsedSeconds = 0;
        state.lastConsumedSeconds = 0;
        state.isTimeExpired = false;
    }
    catch (e) {
        console.error('[loadTimeInfo] 加载时长信息失败:', e);
        // 即使 API 失败，也设置默认值（免费用户有 300 秒）
        if (state.memberType === 0 && state.dailyLimit === 0) {
            state.dailyLimit = 300;
        }
        if (state.remainingSeconds === 0 && state.memberType === 0 && state.dailyLimit > 0) {
            state.remainingSeconds = state.dailyLimit;
        }
    }
};
/**
 * 加载今日历史消息
 */
const loadTodayMessages = async () => {
    try {
        const res = await xiaoaiApi.getTodayMessages();
        if (res.data && res.data.length > 0) {
            res.data.forEach(msg => {
                const role = msg.role === 'user' ? '用户' : (msg.role === 'assistant' ? 'AI' : msg.role);
                state.chatMessages.push({
                    id: generateUniqueId(),
                    role,
                    content: msg.content,
                    timestamp: msg.createTime ? new Date(msg.createTime) : new Date()
                });
            });
            addSystemMessage(`已加载今日历史消息（${res.data.length}条）`);
            state.todayMessagesLoaded = true;
        }
    }
    catch (e) {
        console.error('加载历史消息失败', e);
        addSystemMessage('加载历史消息失败');
    }
};
/**
 * 上报使用时长到后端（倒计时模式下，每5秒上报5秒）
 */
const reportUsage = async () => {
    if (!state.currentUserId) {
        console.log('[reportUsage] 无用户ID，跳过上报');
        return;
    }
    if (state.remainingSeconds <= 0) {
        console.log('[reportUsage] 时长已耗尽，跳过上报');
        return;
    }
    try {
        // 每次上报5秒（固定值，因为前端每秒倒计时）
        const reportSeconds = 5;
        // 后端累加使用秒数
        console.log(`[reportUsage] 上报使用时长: ${reportSeconds}s, 当前剩余: ${state.remainingSeconds}s`);
        await xiaoaiApi.reportUsageTime(reportSeconds);
    }
    catch (e) {
        console.error('[reportUsage] 上报失败:', e);
    }
};
/**
 * 时长耗尽处理
 */
const handleTimeExpired = async () => {
    if (state.isTimeExpired)
        return; // 防止重复触发
    state.isTimeExpired = true;
    // 强制上报5秒后再断开（即使 remainingSeconds 已经为0，也要确保后端记录完整）
    if (state.currentUserId) {
        try {
            await xiaoaiApi.reportUsageTime(5);
            console.log('[handleTimeExpired] 强制上报最后5秒');
        }
        catch (e) {
            console.error('[handleTimeExpired] 上报失败:', e);
        }
    }
    addSystemMessage('⏰ 今日免费时长已用完！');
    // 停止录音和连接
    if (state.isRecording) {
        stopRecord();
    }
    if (state.isConnected) {
        stopConversation();
    }
};
/**
 * 切换静音
 */
const toggleMute = () => {
    state.isMuted = !state.isMuted;
    addSystemMessage(state.isMuted ? '已开启静音' : '已关闭静音');
};
/**
 * 退出系统
 */
const exitSystem = () => {
    if (state.isConnected) {
        stopConversation();
    }
    state.chatMessages = [];
    addSystemMessage('已退出系统');
};
/**
 * 打开视频模式（暂未实现）
 */
const openVideoMode = () => {
    addSystemMessage('视频模式开发中...');
};
/**
 * ArrayBuffer 转 Base64 字符串（用于实时音频发送）
 * @param {ArrayBuffer} buffer - 原始 ArrayBuffer 数据
 * @returns {string} Base64 编码字符串
 */
const arrayBufferToBase64 = (buffer) => {
    const uint8Array = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return window.btoa(binary);
};
/**
 * 生成 WAV 文件头（用于阿里云 Omni Realtime API）
 * 阿里云要求 input_audio_format: "wav" 时发送的数据必须带 WAV 头
 * @param {number} sampleRate - 采样率（默认 16000）
 * @param {number} numChannels - 通道数（默认 1）
 * @param {number} bitsPerSample - 位深（默认 16）
 * @returns {Uint8Array} WAV 文件头（44字节）
 */
const generateWavHeader = (sampleRate, numChannels, bitsPerSample) => {
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 0, true); // Placeholder for file size
    writeString(view, 8, 'WAVE');
    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, 0, true); // Placeholder for data size
    return new Uint8Array(buffer);
};
const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};
/**
 * Int16Array PCM 数据转 WAV Base64（带文件头）
 * @param {Int16Array} pcmData - Int16Array PCM 数据
 * @param {number} sampleRate - 采样率（默认 16000）
 * @returns {string} 带 WAV 头的 Base64 字符串
 */
const pcmToWavBase64 = (pcmData, sampleRate = 16000) => {
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = pcmData.byteLength;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    // 创建完整缓冲区
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const uint8 = new Uint8Array(buffer);
    // 写入 WAV 头
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
    view.setUint16(32, numChannels * bitsPerSample / 8, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    // 写入 PCM 数据
    const pcmBytes = new Uint8Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
    uint8.set(pcmBytes, headerSize);
    // 转为 Base64
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    return window.btoa(binary);
};
/**
 * WebSocket重连逻辑
 */
const reconnectWebSocket = () => {
    if (reconnectCount >= CONSTS.RECONNECT_LIMIT) {
        addSystemMessage(`重连次数已达上限(${CONSTS.RECONNECT_LIMIT}次)，停止重连`);
        return;
    }
    reconnectCount++;
    addSystemMessage(`WebSocket断开，正在第${reconnectCount}次重连...`);
    setTimeout(() => startConversation(), CONSTS.RECONNECT_DELAY);
};
// ========== 4. 核心业务逻辑 ==========
/**
 * 发送原始音频数据到WebSocket（优化版：减少延迟）
 * @param {WebSocket} socket - ws实例
 * @param {string} base64Data - 完整Base64字符串
 */
const sendAudioData = async (socket, base64Data) => {
    // 空数据校验
    if (!base64Data) {
        console.error('Base64数据为空，取消发送');
        addSystemMessage("音频数据为空，发送失败");
        return;
    }
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket未连接，无法发送数据');
        addSystemMessage("WebSocket未连接，发送失败");
        return;
    }
    const totalLength = base64Data.length;
    addSystemMessage(`开始发送音频，总长度: ${totalLength} 字符`);
    // 分块发送音频数据（阿里云API格式：使用 audio 字段）
    // 优化：增大分块大小，减少消息数量，降低延迟
    const OPTIMAL_CHUNK_SIZE = 48 * 1024; // 48KB分块，减少网络往返
    const sendChunk = async (offset) => {
        if (offset >= totalLength)
            return;
        const end = Math.min(offset + OPTIMAL_CHUNK_SIZE, totalLength);
        const chunk = base64Data.substring(offset, end);
        // event_id 使用纯字母数字格式，避免阿里云解析问题
        const message = {
            event_id: `evt${Date.now()}p${offset}`,
            type: "input_audio_buffer.append",
            audio: chunk
        };
        socket.send(JSON.stringify(message));
        // 优化：减少延迟，但保持足够的吞吐量
        await new Promise(resolve => setTimeout(resolve, 5)); // 只等待5ms
        await sendChunk(end);
    };
    // 执行分块发送
    await sendChunk(0);
    // 提交音频缓冲区（阿里云API格式）
    const commitMessage = {
        event_id: `evt${Date.now()}commit`,
        type: "input_audio_buffer.commit"
    };
    socket.send(JSON.stringify(commitMessage));
    addSystemMessage("音频缓冲区已提交");
    // 手动模式下需要主动创建响应（阿里云API要求）
    const responseCreateMessage = {
        event_id: `evt${Date.now()}response`,
        type: "response.create"
    };
    socket.send(JSON.stringify(responseCreateMessage));
    addSystemMessage("已发送响应请求");
};
/**
 * 建立WebSocket连接（含重连机制）
 */
const startConversation = async () => {
    if (state.isLoading.connect)
        return;
    if (ws && ws.readyState === WebSocket.OPEN) {
        addSystemMessage("已经处于连接状态");
        return;
    }
    // 连接前先查询剩余时长
    try {
        const res = await xiaoaiApi.getRemainingTime();
        const remaining = res.data ?? 0;
        state.remainingSeconds = remaining;
        if (remaining <= 0) {
            state.isTimeExpired = true;
            addSystemMessage('⏰ 时长已耗尽，无法开始通话');
            return;
        }
    }
    catch (e) {
        console.error('查询剩余时长失败:', e);
        addSystemMessage('⚠️ 查询时长失败，将继续尝试连接');
    }
    state.isLoading.connect = true;
    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8080';
    const wsUrl = `${WS_BASE_URL}${CONSTS.WS_PATH}`;
    console.log('正在连接 WebSocket:', wsUrl);
    try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            state.isConnected = true;
            state.isTimeExpired = false; // 重置时长耗尽状态
            reconnectCount = 0; // 重连成功重置计数器
            addSystemMessage("连接成功，已初始化会话");
            state.isLoading.connect = false;
            // 发送用户初始化消息（后端需要 userId 来存储会话记录）
            if (state.currentUserId) {
                const initMsg = {
                    type: "session.init",
                    userId: state.currentUserId
                };
                ws.send(JSON.stringify(initMsg));
                console.log('[WebSocket] 已发送用户初始化信息, userId:', state.currentUserId);
            }
            // 启动时长倒计时（连接成功即开始计时）
            if (countdownTimer)
                clearInterval(countdownTimer);
            countdownTimer = setInterval(() => {
                if (state.remainingSeconds > 0) {
                    state.remainingSeconds -= 1;
                    if (state.remainingSeconds <= 0) {
                        handleTimeExpired();
                    }
                }
            }, 1000);
            // 启动时长上报计时器（每5秒）
            if (usageReportTimer)
                clearInterval(usageReportTimer);
            usageReportTimer = setInterval(async () => {
                if (state.remainingSeconds > 0) {
                    await reportUsage();
                }
            }, 5000);
            // 根据模式选择 VAD 配置
            // Manual模式: turn_detection: null - 客户端手动控制录音提交和响应创建
            // Server VAD模式: turn_detection: { type: "server_vad" } - 服务端自动检测语音结束并响应
            const turnDetection = state.isVadMode
                ? { type: "server_vad" }
                : { type: "server_vad" }; // 默认使用 VAD
            // 会话初始化配置
            const sessionUpdate = {
                event_id: `sess${Date.now()}`,
                type: "session.update",
                session: {
                    // 输出模态：文本+语音（完整模式）
                    modalities: ["text", "audio"],
                    // 输出音频的音色（使用当前选中的音色）
                    voice: currentVoice.value.voice,
                    // 输入音频格式：pcm 格式
                    input_audio_format: "pcm",
                    // 输出音频格式：pcm 格式
                    output_audio_format: "pcm",
                    // 启用输入音频转录（用于展示用户发送的消息）
                    input_audio_transcription: {
                        model: "gummy-realtime-v1"
                    },
                    // 系统提示词（使用热会话池时此处配置会被服务端覆盖）
                    instructions: "你的名字是【小爱倾听师】，你隶属于【智能青少年健康心理系统】，你的服务对象是青少年。你是一名专业的青少年心理倾听陪伴者，不是心理医生，不做任何心理疾病诊断、不开药方、不提供医疗治疗，只做情绪倾听、接纳与疏导，帮助青少年缓解不开心、孤独、委屈、低落、抑郁等负面情绪，让他们感受到被理解、被陪伴，重拾轻松愉悦的心情。",
                    // 语音活动检测模式
                    turn_detection: turnDetection
                }
            };
            // 发送模式信息
            const vadDesc = state.isVadMode ? "VAD自动检测" : "手动控制";
            addSystemMessage("当前模式: 文本+语音（" + vadDesc + "）");
            ws.send(JSON.stringify(sessionUpdate));
            // 发送完成后自动开始录音
            setTimeout(() => {
                if (state.remainingSeconds > 0) {
                    startRecord();
                }
            }, 500);
        };
        ws.onmessage = (event) => {
            console.log('[WebSocket] 收到原始消息:', event.data);
            try {
                const data = JSON.parse(event.data);
                console.log('[WebSocket] 解析后:', JSON.stringify(data));
                handleAliyunEvent(data);
            }
            catch (error) {
                console.error('解析消息失败:', error);
                addSystemMessage(`消息解析失败: ${error.message}`);
            }
        };
        ws.onclose = (event) => {
            state.isConnected = false;
            state.isLoading.connect = false;
            const reason = event.reason || '未知原因';
            const code = event.code;
            addSystemMessage(`连接已关闭 (代码: ${code}, 原因: ${reason})`);
            console.log('WebSocket 关闭:', code, reason);
            // 清理计时器
            if (recordTimer) {
                clearInterval(recordTimer);
                recordTimer = null;
            }
            if (countdownTimer) {
                clearInterval(countdownTimer);
                countdownTimer = null;
            }
            if (usageReportTimer) {
                clearInterval(usageReportTimer);
                usageReportTimer = null;
            }
            // 非主动关闭则触发重连
            if (event.code !== 1000) {
                reconnectWebSocket();
            }
        };
        ws.onerror = (error) => {
            console.error("WebSocket错误：", error);
            state.isLoading.connect = false;
            addSystemMessage("连接出错，请检查：1.后端服务是否启动 2.地址是否正确 3.网络连接是否正常");
        };
    }
    catch (error) {
        console.error('创建 WebSocket 连接失败:', error);
        state.isLoading.connect = false;
        addSystemMessage(`创建连接失败：${error.message}`);
    }
};
/**
 * 处理阿里云返回事件（拆分细化）
 */
const handleAudioTranscription = (data) => {
    console.log('[用户消息转录] 收到转录数据:', JSON.stringify(data));
    const transcript = data.transcript || '';
    console.log('[用户消息转录] transcript 内容:', transcript);
    if (!transcript) {
        console.warn('[用户消息转录] 转录内容为空，跳过添加消息');
        return;
    }
    const newMessage = {
        id: generateUniqueId(),
        role: "用户",
        content: transcript,
        timestamp: new Date()
    };
    console.log('[用户消息转录] 添加新消息:', newMessage);
    state.chatMessages.push(newMessage);
    console.log('[用户消息转录] 当前消息列表长度:', state.chatMessages.length);
    scrollToBottom();
};
/**
 * 处理 AI 音频转录增量（不再使用拼接，改用 response.audio_transcript.done 的完整文本）
 */
const handleTextDelta = (data) => {
    // 不再在这里拼接 AI 回复，改为等待 response.audio_transcript.done
    // 仅保留用于其他类型的 delta 事件
};
/**
 * 处理 AI 音频转录完成 - 使用完整文本
 */
const handleTranscriptDone = (data) => {
    const transcript = data.transcript || '';
    if (!transcript)
        return;
    // 更新最后一条 AI 消息或创建新消息
    const lastMsg = state.chatMessages[state.chatMessages.length - 1];
    if (lastMsg?.role === "AI") {
        lastMsg.content = transcript;
    }
    else {
        state.chatMessages.push({
            id: generateUniqueId(),
            role: "AI",
            content: transcript,
            timestamp: new Date()
        });
    }
    scrollToBottom();
};
const handleAudioDelta = (data) => {
    playAudio(data.delta); // 解码播放PCM音频
};
const handleResponseDone = () => {
    addSystemMessage("本轮响应完成");
    // 响应完成后，确保队列中的音频播放完毕
    // 注意：不需要等待队列清空，下一轮会先清空
};
const handleAliyunEvent = (data) => {
    // 打印所有接收到的消息，便于调试
    console.log('[事件处理] 收到阿里云事件:', data.type, JSON.stringify(data));
    switch (data.type) {
        // 用户音频转录完成
        case "conversation.item.input_audio_transcription.completed":
            console.log('[事件处理] 触发 handleAudioTranscription，transcript:', data.transcript);
            handleAudioTranscription(data);
            break;
        // 模型文本输出（流式）
        case "response.text.delta":
            handleTextDelta(data);
            break;
        // 模型音频转录增量 - 不再用于文本拼接
        case "response.audio_transcript.delta":
            // 仅用于调试，不再拼接
            break;
        // 模型音频转录完成 - 使用完整文本
        case "response.audio_transcript.done":
            handleTranscriptDone(data);
            break;
        // 模型音频输出（流式）
        case "response.audio.delta":
            handleAudioDelta(data);
            break;
        // 会话创建成功
        case "session.created":
            console.log('会话已创建，ID:', data.session?.id);
            break;
        // 会话更新成功
        case "session.updated":
            console.log('会话配置已更新');
            addSystemMessage('会话配置已更新');
            break;
        // 响应开始生成
        case "response.created":
            console.log('模型开始生成响应');
            // 新一轮响应开始，清空之前的音频队列
            clearAudioQueue();
            break;
        // 输入音频缓冲区已提交
        case "input_audio_buffer.committed":
            console.log('音频缓冲区已提交');
            addSystemMessage('📤 音频已提交，等待处理...');
            break;
        // ===== VAD 模式事件 =====
        // 语音开始检测（VAD 模式）
        case "input_audio_buffer.speech_started":
            console.log('检测到语音开始');
            addSystemMessage('🎤 检测到语音开始...');
            break;
        // 语音结束检测（VAD 模式）- 仅提示，不自动停止
        case "input_audio_buffer.speech_stopped":
            console.log('检测到语音结束');
            addSystemMessage('🎤 检测到语音结束（可继续说话或点击停止说话）');
            break;
        // ===== 响应完成 =====
        case "response.done":
            console.log('响应完成:', data.response);
            handleResponseDone();
            addSystemMessage('✅ 响应完成');
            break;
        // 会话初始化确认
        case "session.init.ack":
            console.log('会话初始化确认:', data);
            if (data.recordSessionId) {
                state.currentSessionId = data.recordSessionId;
                addSystemMessage(`📝 会话已记录 (ID: ${data.recordSessionId})`);
            }
            break;
        // 错误处理
        case "error":
            console.error('阿里云返回错误:', data.error);
            addSystemMessage(`错误: ${JSON.stringify(data.error)}`);
            break;
        default:
            // 对于未处理的事件，只在调试模式下打印
            if (data.type && !data.type.startsWith('session') && !data.type.startsWith('input')) {
                console.log('未处理的事件类型:', data.type);
            }
    }
};
/**
 * 3. 音频采集（麦克风）- 方案A：使用 Web Audio API 直接获取 PCM
 * 优点：避免 MediaRecorder 的格式转换问题，直接获取原始音频数据
 */
const startRecord = async () => {
    // 0. 检查时长限制
    if (state.remainingSeconds <= 0) {
        addSystemMessage('⏰ 时长已耗尽，无法继续通话');
        handleTimeExpired();
        return;
    }
    // 1. 检查连接状态 (必须使用 state.isConnected)
    if (!state.isConnected) {
        addSystemMessage("❌ 请先点击【开始对话】建立连接");
        return;
    }
    // 2. 检查浏览器支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        addSystemMessage("❌ 您的浏览器不支持录音功能，请使用 Chrome 或 Edge");
        return;
    }
    try {
        addSystemMessage("🎤 正在请求麦克风权限...");
        // 获取麦克风权限
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: CONSTS.AUDIO_SAMPLE_RATE,
                channelCount: CONSTS.AUDIO_CHANNELS,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        // 初始化或恢复 AudioContext
        if (!audioContext) {
            const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextConstructor({ sampleRate: CONSTS.AUDIO_SAMPLE_RATE });
        }
        // 创建媒体流源节点
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        // 创建音频处理节点（用于捕获原始 PCM 数据）
        // 缓冲区大小 4096 可以平衡延迟和性能
        scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        // 清空 PCM 数据块数组
        pcmChunks = [];
        // 监听音频数据（每次 buffer 满时触发）
        scriptProcessor.onaudioprocess = async (audioProcessingEvent) => {
            if (!state.isRecording)
                return;
            // 获取输入音频数据（Float32Array，每个样本范围 -1.0 到 1.0）
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            // 转换为 Int16Array（16位有符号整数，范围 -32768 到 32767）
            const int16Array = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                // 限制范围，防止溢出
                const sample = Math.max(-1, Math.min(1, inputData[i]));
                int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            }
            // 添加到 PCM 数据块数组（用于最终发送）
            pcmChunks.push(int16Array.buffer);
            // VAD 模式：实时发送音频数据，服务端自动检测语音结束
            if (state.isVadMode) {
                // 检测语音活跃度（计算音频振幅）
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += Math.abs(inputData[i]);
                }
                const avgAmplitude = sum / inputData.length;
                isAudioActive = avgAmplitude > VIDEO_CONFIG.VAD_THRESHOLD;
                // 发送音频（WAV 格式，带文件头）
                if (ws && ws.readyState === WebSocket.OPEN) {
                    // 第一次发送时附带 WAV 头
                    if (!wavHeaderSent) {
                        // 生成对话项ID（用于关联音频和视频）
                        currentConversationId = `conv_${Date.now()}`;
                        currentItemId = `item_${Date.now()}`;
                        audioEventId = `evt_${Date.now()}_audio`;
                        videoFrameIndex = 0;
                        // 1. 先创建对话项（阿里云API要求：先创建对话项，再发送内容）
                        ws.send(JSON.stringify({
                            event_id: `evt_${Date.now()}_create`,
                            type: "conversation.item.create",
                            item: {
                                id: currentItemId,
                                type: "message",
                                role: "user",
                                content: []
                            }
                        }));
                        // 2. 发送带 WAV 头的音频数据
                        const wavBase64 = pcmToWavBase64(int16Array, CONSTS.AUDIO_SAMPLE_RATE);
                        ws.send(JSON.stringify({
                            event_id: audioEventId,
                            type: "input_audio_buffer.append",
                            audio: wavBase64
                        }));
                        wavHeaderSent = true;
                        totalSentBytes = int16Array.byteLength;
                    }
                    else {
                        // 之后只发送 PCM 数据（阿里云会自动追加）
                        const base64Data = arrayBufferToBase64(int16Array.buffer);
                        ws.send(JSON.stringify({
                            event_id: `evt_${Date.now()}_audio`,
                            type: "input_audio_buffer.append",
                            audio: base64Data
                        }));
                        totalSentBytes += int16Array.byteLength;
                    }
                    // 语音活跃时，捕获视频帧并发送
                    if (isAudioActive && state.isVideoMode && state.videoStream && isVideoReady) {
                        const now = Date.now();
                        if (now - lastFrameTime >= VIDEO_CONFIG.FRAME_INTERVAL) {
                            const frameData = captureFrame();
                            if (frameData) {
                                // 发送视频帧（必须指定 event_id 和 index）
                                ws.send(JSON.stringify({
                                    event_id: `evt_${Date.now()}_img_${videoFrameIndex}`,
                                    type: "input_image_buffer.append",
                                    image: frameData,
                                    index: videoFrameIndex
                                }));
                                videoFrameIndex++;
                                lastFrameTime = now;
                                console.log(`[视频帧] 已发送第 ${videoFrameIndex} 帧，event_id: evt_${Date.now()}_img_${videoFrameIndex - 1}`);
                            }
                        }
                    }
                }
            }
        };
        // 连接节点：麦克风 → 处理器 → （不连接输出，静音录制）
        mediaStreamSource.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination); // 需要连接到 destination，否则录音无效
        // 更新状态
        state.isRecording = true;
        state.recordDuration = 0;
        // 启动录音时长计时器（用于显示 recordDuration）
        if (recordTimer)
            clearInterval(recordTimer);
        recordTimer = setInterval(() => {
            state.recordDuration += 0.1;
        }, 100);
        // 保存 stream 用于停止时释放
        scriptProcessor._stream = stream;
        // 重置音频发送标记
        hasAudioSentSinceVideoStart = false;
        lastFrameTime = 0; // 重置抽帧计时
        wavHeaderSent = false; // 重置WAV头标记
        totalSentBytes = 0; // 重置已发送字节数
        // 重置视频帧追踪变量
        currentConversationId = null;
        currentItemId = null;
        audioEventId = null;
        videoFrameIndex = 0;
        isVideoReady = !!state.videoStream; // 视频流就绪状态
        // 根据模式显示不同提示
        if (state.isVadMode) {
            addSystemMessage("🎤 开始说话，服务端VAD将自动检测语音结束...");
        }
        else {
            addSystemMessage("✅ 录音已开始，请说话...");
        }
        // 视频模式提示（抽帧已整合到音频发送中）
        if (state.isVideoMode && state.videoStream) {
            addSystemMessage("📹 视频帧采集中（活跃时每2秒1帧）...");
        }
    }
    catch (error) {
        console.error("录音启动失败:", error);
        let errorMsg = "❌ 录音启动失败";
        if (error.name === 'NotAllowedError') {
            errorMsg = "❌ 麦克风权限被拒绝，请在浏览器地址栏左侧允许麦克风权限";
        }
        else if (error.name === 'NotFoundError') {
            errorMsg = "❌ 未检测到麦克风设备";
        }
        else if (error.name === 'NotReadableError') {
            errorMsg = "❌ 麦克风被其他应用占用";
        }
        addSystemMessage(errorMsg);
    }
};
/**
 * 停止录音并发送（使用 Web Audio API 采集的原始 PCM）
 */
const stopRecord = () => {
    if (!scriptProcessor || !state.isRecording)
        return;
    // VAD 模式：停止录音即可，音频已经在实时发送
    if (state.isVadMode) {
        addSystemMessage("🛑 已停止录音，等待服务端处理...");
    }
    // 停止录音
    state.isRecording = false;
    clearInterval(recordTimer); // 停止录音时长计时器
    recordTimer = null;
    // 注意：倒计时和上报计时器由 stopConversation 统一清理
    // 断开并清理节点
    if (mediaStreamSource) {
        mediaStreamSource.disconnect();
        mediaStreamSource = null;
    }
    if (scriptProcessor) {
        scriptProcessor.disconnect();
        scriptProcessor.onaudioprocess = null;
        // 停止麦克风流
        if (scriptProcessor._stream) {
            scriptProcessor._stream.getTracks().forEach(track => track.stop());
        }
        scriptProcessor = null;
    }
    // 非 VAD 模式：合并并发送音频数据
    if (!state.isVadMode) {
        // 合并所有 PCM 数据块
        try {
            let totalLength = 0;
            pcmChunks.forEach(buffer => {
                totalLength += buffer.byteLength;
            });
            // 合并为单个 ArrayBuffer
            const mergedBuffer = new ArrayBuffer(totalLength);
            const mergedView = new Uint8Array(mergedBuffer);
            let offset = 0;
            pcmChunks.forEach(buffer => {
                const view = new Uint8Array(buffer);
                mergedView.set(view, offset);
                offset += buffer.byteLength;
            });
            // PCM 转 Base64
            const uint8Array = new Uint8Array(mergedBuffer);
            let binary = '';
            const len = uint8Array.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            const base64Audio = window.btoa(binary);
            // 计算录音时长（16kHz 单声道，每秒 16000 * 2 = 32000 字节）
            const durationSeconds = (len / 2 / CONSTS.AUDIO_SAMPLE_RATE).toFixed(1);
            addSystemMessage(`录音完成，时长: ${durationSeconds}秒，PCM数据: ${base64Audio.length} 字符`);
            // 发送音频数据（自动处理commit和response.create）
            sendAudioData(ws, base64Audio).then(() => {
                addSystemMessage("音频发送完毕");
            });
        }
        catch (error) {
            console.error('音频处理失败:', error);
            addSystemMessage(`音频处理出错: ${error.message}`);
        }
    }
    // 清空数据
    pcmChunks = [];
};
// ==================== 音频播放队列 ====================
/** 待播放的音频队列 */
let audioQueue = [];
/** 是否正在播放 */
let isPlayingAudio = false;
/**
 * 播放模型返回的音频（支持纯PCM数据，按顺序播放）
 * 阿里云返回的是24kHz采样的PCM数据
 */
const playAudio = (base64Audio) => {
    try {
        // 确保 AudioContext 已初始化
        if (!initAudioContext())
            return;
        // 解码Base64
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        // 将字节数据转换为Int16Array（16位采样）
        const pcmData = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
        // 预创建 AudioBuffer（不在这里播放，只是解码好）
        const sampleRate = 24000;
        const audioBuffer = audioContext.createBuffer(1, pcmData.length, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        // 转换为Float32Array
        for (let i = 0; i < pcmData.length; i++) {
            channelData[i] = pcmData[i] / 32768.0;
        }
        // 加入播放队列
        audioQueue.push(audioBuffer);
        console.log(`📥 音频入队: ${pcmData.length} 样本, 队列长度: ${audioQueue.length}, 时长: ${(pcmData.length / sampleRate).toFixed(2)}s`);
        // 启动播放（如果当前没有播放）
        playNextInQueue();
    }
    catch (err) {
        console.error('音频处理异常:', err);
    }
};
/**
 * 从队列中播放下一个音频（按顺序，避免声音叠加）
 */
const playNextInQueue = () => {
    // 如果队列为空或正在播放，直接返回
    if (audioQueue.length === 0 || isPlayingAudio) {
        return;
    }
    // 标记为正在播放
    isPlayingAudio = true;
    // 取出队列中的第一个音频
    const audioBuffer = audioQueue.shift();
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.length / sampleRate;
    console.log(`▶️ 开始播放: ${audioBuffer.length} 样本, 时长: ${duration.toFixed(2)}s, 剩余: ${audioQueue.length}`);
    // 创建 AudioBufferSourceNode 并播放
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    // 播放结束时触发下一个
    source.onended = () => {
        console.log(`🔊 播放结束, 剩余队列: ${audioQueue.length}`);
        isPlayingAudio = false;
        // 播放下一个
        if (audioQueue.length > 0) {
            playNextInQueue();
        }
    };
    // 开始播放
    source.start();
};
/**
 * 清空音频队列（在新对话开始时调用）
 */
const clearAudioQueue = () => {
    audioQueue = [];
    isPlayingAudio = false;
    console.log('🗑️ 音频队列已清空');
};
/**
 * 发送图片数据到WebSocket
 * @param {WebSocket} socket - ws实例
 * @param {string} base64Data - 完整Base64字符串
 */
const sendImageData = async (socket, base64Data) => {
    // 空数据校验
    if (!base64Data) {
        console.error('图片Base64数据为空，取消发送');
        addSystemMessage("图片数据为空，发送失败");
        return;
    }
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket未连接，无法发送数据');
        addSystemMessage("WebSocket未连接，发送失败");
        return;
    }
    const totalLength = base64Data.length;
    addSystemMessage(`开始发送图片，总长度: ${totalLength} 字符`);
    // 分块发送图片数据（阿里云API格式：使用 image 字段）
    const sendChunk = async (offset, chunkIndex) => {
        if (offset >= totalLength)
            return;
        const end = Math.min(offset + CONSTS.CHUNK_SIZE, totalLength);
        const chunk = base64Data.substring(offset, end);
        const message = {
            event_id: `event_${Date.now()}_${chunkIndex}`,
            type: "input_image_buffer.append",
            image: chunk, // 阿里云API正确字段名
            index: chunkIndex // 帧索引
        };
        socket.send(JSON.stringify(message));
        // 异步递归，释放事件循环
        await new Promise(resolve => setTimeout(resolve, 0));
        await sendChunk(end, chunkIndex + 1);
    };
    // 执行分块发送
    await sendChunk(0, 0);
    addSystemMessage("图片发送完毕");
};
const handleImageUpload = (e) => {
    if (!state.isConnected || state.isLoading.upload)
        return;
    const file = e.target.files[0];
    if (!file)
        return;
    state.isLoading.upload = true;
    // 图片大小提示
    if (file.size > CONSTS.MAX_IMAGE_SIZE) {
        addSystemMessage(`⚠️ 图片大小${(file.size / 1024 / 1024).toFixed(1)}MB，处理可能需要时间...`);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            // 图片预览
            state.previewImage = e.target.result;
            // 提取纯Base64（去掉dataURL前缀）
            const base64Image = e.target.result.split(",")[1];
            addSystemMessage(`图片读取完成，长度: ${base64Image.length} 字符`);
            // 异步发送图片
            sendImageData(ws, base64Image)
                .then(() => {
                addSystemMessage("图片发送完毕");
                state.isLoading.upload = false;
            })
                .catch((err) => {
                addSystemMessage(`图片发送失败: ${err.message}`);
                state.isLoading.upload = false;
            });
        }
        catch (err) {
            console.error('图片处理失败:', err);
            addSystemMessage(`图片处理失败: ${err.message}`);
            state.isLoading.upload = false;
        }
    };
    reader.onerror = (err) => {
        console.error('图片读取失败:', err);
        addSystemMessage(`图片读取失败: ${err.message}`);
        state.isLoading.upload = false;
    };
    reader.readAsDataURL(file);
};
/**
 * 结束对话（清理所有资源）
 */
const stopConversation = () => {
    // 关闭WebSocket
    if (ws) {
        ws.close(1000, "User stop");
        ws = null;
    }
    // 停止录音（方案A：Web Audio API）
    if (scriptProcessor && state.isRecording) {
        if (mediaStreamSource) {
            mediaStreamSource.disconnect();
            mediaStreamSource = null;
        }
        scriptProcessor.disconnect();
        if (scriptProcessor._stream) {
            scriptProcessor._stream.getTracks().forEach(track => track.stop());
        }
        scriptProcessor = null;
        pcmChunks = [];
        state.isRecording = false;
    }
    // 清理计时器
    if (recordTimer) {
        clearInterval(recordTimer);
        recordTimer = null;
    }
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    if (usageReportTimer) {
        clearInterval(usageReportTimer);
        usageReportTimer = null;
    }
    // 重置状态
    state.isConnected = false;
    state.previewImage = '';
    state.recordDuration = 0;
};
// ========== 5. 生命周期 & 监听 ==========
// 监听消息变化，自动滚动到底部
watch(() => state.chatMessages.length, () => {
    scrollToBottom();
});
// 组件挂载时初始化
onMounted(async () => {
    console.log('[XiaoaiListen] 组件已挂载');
    // 加载时长信息
    await loadTimeInfo();
    // 加载今日历史消息
    await loadTodayMessages();
    // 会员显示提示
    if (state.memberType > 0) {
        addSystemMessage(`欢迎回来！${getMemberTypeText(state.memberType)}会员尊享`);
    }
    // 进入界面后立即开始倒计时（连接成功后）
    // 注意：倒计时会在 startConversation 成功后由 ws.onopen 启动
});
// 组件卸载时清理所有资源
onUnmounted(() => {
    stopConversation();
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['time-value']} */ ;
/** @type {__VLS_StyleScopedClasses['time-value']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-exit']} */ ;
/** @type {__VLS_StyleScopedClasses['voice-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['voice-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['voice-modal-close']} */ ;
/** @type {__VLS_StyleScopedClasses['voice-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['voice-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['voice-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['voice-card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['voice-card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['status-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['message-ai']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['message-user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['message-user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['message-user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['message-system']} */ ;
/** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['message-system']} */ ;
/** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['message-system']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-call']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-call']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-call']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-call']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-end']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-speak']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-speak']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-speak']} */ ;
/** @type {__VLS_StyleScopedClasses['speaking-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['speaking-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['wave']} */ ;
/** @type {__VLS_StyleScopedClasses['speaking-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['wave']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-mute']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-video']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-mute']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-video']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-mute']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-video']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['image-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['video-float-close']} */ ;
/** @type {__VLS_StyleScopedClasses['video-no-signal']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "xiaoai-container" },
});
/** @type {__VLS_StyleScopedClasses['xiaoai-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "nav-header" },
});
/** @type {__VLS_StyleScopedClasses['nav-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "nav-title" },
});
/** @type {__VLS_StyleScopedClasses['nav-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "nav-icon" },
});
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.state.showVoiceSelector = true;
            // @ts-ignore
            [state,];
        } },
    ...{ class: "voice-btn" },
});
/** @type {__VLS_StyleScopedClasses['voice-btn']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "voice-icon" },
});
/** @type {__VLS_StyleScopedClasses['voice-icon']} */ ;
(__VLS_ctx.currentVoice.gender === 'female' ? '👩' : '👨');
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "voice-name" },
});
/** @type {__VLS_StyleScopedClasses['voice-name']} */ ;
(__VLS_ctx.currentVoice.name);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "voice-arrow" },
});
/** @type {__VLS_StyleScopedClasses['voice-arrow']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.state.showVoiceSelector) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.state.showVoiceSelector))
                    return;
                __VLS_ctx.state.showVoiceSelector = false;
                // @ts-ignore
                [state, state, currentVoice, currentVoice,];
            } },
        ...{ class: "voice-modal-overlay" },
    });
    /** @type {__VLS_StyleScopedClasses['voice-modal-overlay']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "voice-modal" },
    });
    /** @type {__VLS_StyleScopedClasses['voice-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "voice-modal-header" },
    });
    /** @type {__VLS_StyleScopedClasses['voice-modal-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.state.showVoiceSelector))
                    return;
                __VLS_ctx.state.showVoiceSelector = false;
                // @ts-ignore
                [state,];
            } },
        ...{ class: "voice-modal-close" },
    });
    /** @type {__VLS_StyleScopedClasses['voice-modal-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "voice-modal-body" },
    });
    /** @type {__VLS_StyleScopedClasses['voice-modal-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "voice-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['voice-grid']} */ ;
    for (const [voice, index] of __VLS_vFor((__VLS_ctx.VOICE_LIST))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.state.showVoiceSelector))
                        return;
                    __VLS_ctx.selectVoice(index);
                    // @ts-ignore
                    [VOICE_LIST, selectVoice,];
                } },
            key: (voice.voice),
            ...{ class: "voice-card-item" },
            ...{ class: ({ active: index === __VLS_ctx.state.currentVoiceIndex }) },
        });
        /** @type {__VLS_StyleScopedClasses['voice-card-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "voice-card-avatar" },
        });
        /** @type {__VLS_StyleScopedClasses['voice-card-avatar']} */ ;
        (voice.gender === 'female' ? '👩' : '👨');
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "voice-card-info" },
        });
        /** @type {__VLS_StyleScopedClasses['voice-card-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "voice-card-name" },
        });
        /** @type {__VLS_StyleScopedClasses['voice-card-name']} */ ;
        (voice.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "voice-card-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['voice-card-desc']} */ ;
        (voice.desc);
        if (index === __VLS_ctx.state.currentVoiceIndex) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "voice-card-check" },
            });
            /** @type {__VLS_StyleScopedClasses['voice-card-check']} */ ;
        }
        // @ts-ignore
        [state, state,];
    }
}
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "nav-right" },
});
/** @type {__VLS_StyleScopedClasses['nav-right']} */ ;
if (__VLS_ctx.state.dailyLimit > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "time-display" },
    });
    /** @type {__VLS_StyleScopedClasses['time-display']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "time-label" },
    });
    /** @type {__VLS_StyleScopedClasses['time-label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "time-value" },
        ...{ class: ({ warning: __VLS_ctx.state.remainingSeconds < 60, danger: __VLS_ctx.state.remainingSeconds < 10 }) },
    });
    /** @type {__VLS_StyleScopedClasses['time-value']} */ ;
    /** @type {__VLS_StyleScopedClasses['warning']} */ ;
    /** @type {__VLS_StyleScopedClasses['danger']} */ ;
    (__VLS_ctx.formatRemainingTime(__VLS_ctx.state.remainingSeconds));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "user-info" },
});
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "user-avatar" },
});
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "user-name" },
});
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.exitSystem) },
    ...{ class: "btn-exit" },
});
/** @type {__VLS_StyleScopedClasses['btn-exit']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "main-content" },
});
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "status-bar" },
});
/** @type {__VLS_StyleScopedClasses['status-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "status-item" },
    ...{ class: ({ active: __VLS_ctx.state.isConnected }) },
});
/** @type {__VLS_StyleScopedClasses['status-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "status-dot" },
});
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.getConnectionStatus);
if (__VLS_ctx.state.isRecording) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "status-item" },
    });
    /** @type {__VLS_StyleScopedClasses['status-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status-dot recording" },
    });
    /** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
    /** @type {__VLS_StyleScopedClasses['recording']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-container" },
    ref: "chatBoxRef",
});
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
if (__VLS_ctx.state.chatMessages.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-text" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
}
for (const [msg] of __VLS_vFor((__VLS_ctx.state.chatMessages))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (msg.id),
        ...{ class: "message-item" },
        ...{ class: ({ 'message-ai': msg.role === 'AI', 'message-user': msg.role === '用户', 'message-system': msg.role === '系统' }) },
    });
    /** @type {__VLS_StyleScopedClasses['message-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['message-ai']} */ ;
    /** @type {__VLS_StyleScopedClasses['message-user']} */ ;
    /** @type {__VLS_StyleScopedClasses['message-system']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
    (msg.role === 'AI' ? '🤖' : (msg.role === '用户' ? '👤' : '📢'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-content" },
    });
    /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-bubble" },
    });
    /** @type {__VLS_StyleScopedClasses['message-bubble']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-text" },
    });
    /** @type {__VLS_StyleScopedClasses['message-text']} */ ;
    (msg.content);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-time" },
    });
    /** @type {__VLS_StyleScopedClasses['message-time']} */ ;
    (__VLS_ctx.formatTime(msg.timestamp));
    // @ts-ignore
    [state, state, state, state, state, state, state, state, formatRemainingTime, exitSystem, getConnectionStatus, formatTime,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    ...{ class: "control-bar" },
});
/** @type {__VLS_StyleScopedClasses['control-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "control-row" },
});
/** @type {__VLS_StyleScopedClasses['control-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.state.isConnected ? __VLS_ctx.stopConversation() : __VLS_ctx.startConversation();
            // @ts-ignore
            [state, stopConversation, startConversation,];
        } },
    ...{ class: "btn-call" },
    ...{ class: ({ 'btn-end': __VLS_ctx.state.isConnected }) },
    disabled: (__VLS_ctx.state.isLoading.connect),
});
/** @type {__VLS_StyleScopedClasses['btn-call']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-end']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "btn-icon" },
});
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
(__VLS_ctx.state.isConnected ? '📞' : '🎤');
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "btn-text" },
});
/** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
(__VLS_ctx.state.isConnected ? '挂断通话' : '开始通话');
if (__VLS_ctx.state.isConnected) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "control-row" },
    });
    /** @type {__VLS_StyleScopedClasses['control-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.state.isConnected))
                    return;
                __VLS_ctx.state.isRecording ? __VLS_ctx.stopRecord() : __VLS_ctx.startRecord();
                // @ts-ignore
                [state, state, state, state, state, state, stopRecord, startRecord,];
            } },
        ...{ class: "btn-speak" },
        ...{ class: ({ 'btn-speaking': __VLS_ctx.state.isRecording }) },
        disabled: (!__VLS_ctx.state.isConnected || __VLS_ctx.state.isLoading.record),
    });
    /** @type {__VLS_StyleScopedClasses['btn-speak']} */ ;
    /** @type {__VLS_StyleScopedClasses['btn-speaking']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
    (__VLS_ctx.state.isRecording ? '🔇' : '🎙️');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-text" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
    (__VLS_ctx.state.isRecording ? '停止说话' : '开始说话');
    if (__VLS_ctx.state.isRecording) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "speaking-indicator" },
        });
        /** @type {__VLS_StyleScopedClasses['speaking-indicator']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "wave" },
        });
        /** @type {__VLS_StyleScopedClasses['wave']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "wave" },
        });
        /** @type {__VLS_StyleScopedClasses['wave']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "wave" },
        });
        /** @type {__VLS_StyleScopedClasses['wave']} */ ;
    }
}
if (__VLS_ctx.state.isConnected) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "control-row" },
    });
    /** @type {__VLS_StyleScopedClasses['control-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleMute) },
        ...{ class: "btn-mute" },
        ...{ class: ({ active: __VLS_ctx.state.isMuted }) },
    });
    /** @type {__VLS_StyleScopedClasses['btn-mute']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
    (__VLS_ctx.state.isMuted ? '🔇' : '🔊');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-text" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleVideoMode) },
        ...{ class: "btn-video" },
        ...{ class: ({ active: __VLS_ctx.state.isVideoMode }) },
    });
    /** @type {__VLS_StyleScopedClasses['btn-video']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
    (__VLS_ctx.state.isVideoMode ? '📹' : '📺');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-text" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
    (__VLS_ctx.state.isVideoMode ? '关闭视频' : '视频模式');
}
if (__VLS_ctx.state.isConnected) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "control-row" },
    });
    /** @type {__VLS_StyleScopedClasses['control-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "btn-upload" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-upload']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "btn-text" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ onChange: (__VLS_ctx.handleImageUpload) },
        type: "file",
        accept: "image/*",
        disabled: (!__VLS_ctx.state.isConnected || __VLS_ctx.state.isLoading.upload),
        hidden: true,
    });
    if (__VLS_ctx.state.previewImage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "image-preview" },
        });
        /** @type {__VLS_StyleScopedClasses['image-preview']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (__VLS_ctx.state.previewImage),
            alt: "图片预览",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.state.isConnected))
                        return;
                    if (!(__VLS_ctx.state.previewImage))
                        return;
                    __VLS_ctx.state.previewImage = '';
                    // @ts-ignore
                    [state, state, state, state, state, state, state, state, state, state, state, state, state, state, state, state, state, state, toggleMute, toggleVideoMode, handleImageUpload,];
                } },
            ...{ class: "btn-remove" },
        });
        /** @type {__VLS_StyleScopedClasses['btn-remove']} */ ;
    }
}
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    to: "body",
}));
const __VLS_8 = __VLS_7({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
if (__VLS_ctx.state.isVideoMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onMousedown: (__VLS_ctx.startDragVideo) },
        ...{ class: "video-float-window" },
        ...{ style: ({ left: __VLS_ctx.state.videoPosition.x + 'px', top: __VLS_ctx.state.videoPosition.y + 'px' }) },
    });
    /** @type {__VLS_StyleScopedClasses['video-float-window']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "video-float-header" },
    });
    /** @type {__VLS_StyleScopedClasses['video-float-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "video-float-title" },
    });
    /** @type {__VLS_StyleScopedClasses['video-float-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeVideoMode) },
        ...{ class: "video-float-close" },
    });
    /** @type {__VLS_StyleScopedClasses['video-float-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "video-float-body" },
    });
    /** @type {__VLS_StyleScopedClasses['video-float-body']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
        ref: "videoRef",
        ...{ class: "video-float-video" },
        autoplay: true,
        playsinline: true,
        muted: true,
    });
    /** @type {__VLS_StyleScopedClasses['video-float-video']} */ ;
    if (!__VLS_ctx.state.videoStream) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "video-no-signal" },
        });
        /** @type {__VLS_StyleScopedClasses['video-no-signal']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
// @ts-ignore
[state, state, state, state, startDragVideo, closeVideoMode,];
var __VLS_9;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
