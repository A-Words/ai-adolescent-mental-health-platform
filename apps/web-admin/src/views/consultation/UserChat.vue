<template>
  <div class="user-chat-container">
    <!-- 返回按钮 -->
    <div class="back-header">
      <el-button link @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>

    <!-- 聊天主体 -->
    <div class="chat-main">
      <!-- 心理师信息 -->
      <div class="psychologist-info-bar">
        <el-avatar :size="48" :src="psychologistInfo.headPath" class="psy-avatar">
          <el-icon :size="24"><User /></el-icon>
        </el-avatar>
        <div class="psy-details">
          <h3 class="psy-name">{{ psychologistInfo.name || '心理咨询师' }}</h3>
          <p class="psy-title">{{ psychologistInfo.title || '专业心理咨询师' }}</p>
        </div>
        <div class="connection-status" :class="{ connected: isConnected }">
          <span class="status-dot"></span>
          {{ isConnected ? '在线' : '连接中...' }}
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="messages-area" ref="messagesArea">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-wrapper">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载消息中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="messages.length === 0" class="empty-messages">
          <div class="empty-icon">💬</div>
          <p>开始与心理咨询师对话吧</p>
          <p class="empty-hint">您可以描述您的困扰或问题</p>
        </div>

        <!-- 消息列表 -->
        <div v-else class="message-list">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-item"
            :class="{ 'message-self': msg.isSelf }"
          >
            <!-- 头像 -->
            <el-avatar :size="40" :src="msg.isSelf ? '' : psychologistInfo.headPath" class="message-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <!-- 消息内容 -->
            <div class="message-content-wrapper">
              <!-- 文本消息 -->
              <div v-if="msg.contentType === 0" class="message-bubble">
                <p class="message-text">{{ msg.content }}</p>
              </div>
              <!-- 图片消息 -->
              <div v-else-if="msg.contentType === 1" class="message-bubble image-bubble">
                <el-image
                  :src="msg.content"
                  :preview-src-list="[msg.content]"
                  fit="cover"
                  class="message-image"
                />
              </div>
              <!-- 系统消息 -->
              <div v-else-if="msg.contentType === 2" class="system-message">
                {{ msg.content }}
              </div>
              <span class="message-time">{{ formatTime(msg.createTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="load-more" @click="loadMore">
          <el-button link size="small">加载更多消息</el-button>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <!-- 图片预览 -->
        <div v-if="previewImage" class="image-preview-container">
          <div class="image-preview-item">
            <el-image :src="previewImage" fit="cover" class="preview-img" />
            <el-icon class="preview-remove" @click="removePreview"><Close /></el-icon>
          </div>
        </div>

        <div class="input-row">
          <!-- 图片上传 -->
          <el-upload
            :action="uploadUrl"
            :headers="{ Authorization: `Bearer ${token}` }"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :on-success="handleImageSuccess"
            :on-error="handleImageError"
            accept="image/*"
          >
            <el-button text class="upload-btn">
              <el-icon><Picture /></el-icon>
            </el-button>
          </el-upload>

          <!-- 文本输入 -->
          <el-input
            v-model="inputText"
            placeholder="输入消息..."
            class="message-input"
            @keyup.enter="sendTextMessage"
            :disabled="sending"
          />

          <!-- 发送按钮 -->
          <el-button
            type="primary"
            class="send-btn clean-btn-primary"
            @click="sendTextMessage"
            :disabled="!canSend || sending"
            :loading="sending"
          >
            <el-icon v-if="!sending"><Promotion /></el-icon>
            {{ sending ? '发送中' : '发送' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, ArrowLeft, Picture, Promotion, Loading, Close } from '@element-plus/icons-vue'
import { getMessageHistory, sendMessage, sendImageMessage } from '@/api/psychologist'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

// 状态
const appointmentId = ref<number>(0)
const psychologistInfo = ref<any>({
  id: 0,
  name: '',
  headPath: '',
  title: '专业心理咨询师'
})
const messages = ref<any[]>([])
const inputText = ref('')
const previewImage = ref('')
const previewFile = ref<File | null>(null)
const loading = ref(false)
const sending = ref(false)
const isConnected = ref(false)
const hasMore = ref(false)
const currentUserId = ref<number>(0)
const receiverId = ref<number>(0)

// DOM refs
const messagesArea = ref<HTMLElement | null>(null)

// SSE连接
let eventSource: EventSource | null = null

// 配置
const token = localStorage.getItem('token') || ''
const baseApiUrl = import.meta.env.VITE_API_BASE_URL || ''
const uploadUrl = baseApiUrl ? baseApiUrl + '/common/upload' : '/api/common/upload'

// 计算属性
const canSend = computed(() => {
  return (inputText.value.trim() || previewImage.value) && !sending.value
})

// 初始化
onMounted(() => {
  // 获取预约ID
  appointmentId.value = Number(route.params.appointmentId)
  
  // 获取当前用户信息
  const userInfo = localStorage.getItem('user')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      currentUserId.value = user.id
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }

  if (appointmentId.value) {
    loadMessages()
    connectSSE()
  }
})

// 组件卸载
onUnmounted(() => {
  disconnectSSE()
})

// 加载消息历史
const loadMessages = async () => {
  if (!appointmentId.value) return
  
  loading.value = true
  try {
    const res: any = await getMessageHistory(appointmentId.value)
    if (res.code === 200 && res.data) {
      // 转换消息格式
      messages.value = res.data.map((msg: any) => ({
        ...msg,
        isSelf: msg.senderId === currentUserId.value
      }))
      
      // 设置对方信息（从消息中获取）
      if (messages.value.length > 0) {
        const otherMsg = messages.value.find(m => !m.isSelf)
        if (otherMsg) {
          receiverId.value = otherMsg.senderId
        } else {
          // 如果没有对方消息，使用预约中的咨询师ID
          const selfMsg = messages.value.find(m => m.isSelf)
          if (selfMsg) {
            receiverId.value = selfMsg.receiverId
          }
        }
      }
      
      // 设置心理师信息
      setPsychologistInfo()
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
    }
  } catch (e) {
    console.error('加载消息失败', e)
    ElMessage.error('加载消息失败')
  } finally {
    loading.value = false
  }
}

// 设置心理师信息（从预约详情获取）
const setPsychologistInfo = async () => {
  try {
    // 尝试从API获取预约详情
    const res: any = await request({
      url: `/api/psychologist/appointment/${appointmentId.value}/detail`,
      method: 'get'
    })
    if (res.code === 200 && res.data) {
      psychologistInfo.value = {
        id: res.data.psychologistId,
        name: res.data.psychologistName || '心理咨询师',
        headPath: res.data.psychologistHeadPath || '',
        title: '专业心理咨询师'
      }
      receiverId.value = res.data.psychologistId
    }
  } catch (e) {
    console.error('获取预约详情失败', e)
  }
}

// 加载更多消息
const loadMore = () => {
  // TODO: 实现分页加载
  ElMessage.info('暂无更多消息')
}

// 连接SSE
const connectSSE = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  // 构建SSE URL - 使用 /api 前缀以便vite代理转发
  const apptId = appointmentId.value
  const encodedToken = encodeURIComponent(token)
  const sseUrl = '/api/psychologist/message/stream/' + apptId + '?token=' + encodedToken

  console.log('连接SSE:', sseUrl)

  eventSource = new EventSource(sseUrl)

  // 连接打开时设置状态
  eventSource.onopen = () => {
    console.log('SSE连接已建立')
    isConnected.value = true
  }

  // 使用 addEventListener 监听特定事件（更可靠）
  eventSource.addEventListener('connected', (event: MessageEvent) => {
    console.log('SSE连接确认:', event.data)
    isConnected.value = true
  })

  // 处理所有消息
  eventSource.onmessage = (event: MessageEvent) => {
    try {
      const eventData = event.data
      if (!eventData || eventData === '') {
        return
      }
      const messageData = JSON.parse(String(eventData))
      console.log('收到SSE消息:', messageData)

      // 跳过连接确认消息（type=connected）
      if (messageData.type === 'connected') {
        isConnected.value = true
        return
      }

      // 添加新消息（去重）
      if (messageData.id) {
        const exists = messages.value.some(m => m.id === messageData.id)
        if (!exists) {
          const newMsg = {
            ...messageData,
            isSelf: messageData.senderId === currentUserId.value
          }
          messages.value.push(newMsg)
          nextTick(() => scrollToBottom())
        }
      }
    } catch (e) {
      console.error('解析SSE消息失败', e)
    }
  }

  eventSource.onerror = (error: Event) => {
    console.error('SSE连接错误', error)
    isConnected.value = false

    // 清理连接
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }

    // 尝试重连
    setTimeout(() => {
      console.log('尝试重连SSE...')
      connectSSE()
    }, 3000)
  }
}

// 断开SSE
const disconnectSSE = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
    isConnected.value = false
  }
}

// 发送文本消息
const sendTextMessage = async () => {
  if (!inputText.value.trim() || sending.value) return
  if (!receiverId.value) {
    ElMessage.warning('无法确定接收者')
    return
  }

  const content = inputText.value.trim()
  inputText.value = ''
  sending.value = true

  try {
    const res: any = await sendMessage({
      appointmentId: appointmentId.value,
      receiverId: receiverId.value,
      content: content,
      contentType: 0
    })
    
    if (res.code === 200) {
      // 消息已通过SSE推送，这里不需要手动添加
      console.log('消息发送成功')
    }
  } catch (e: any) {
    console.error('发送消息失败', e)
    ElMessage.error('发送消息失败')
    inputText.value = content // 恢复输入
  } finally {
    sending.value = false
  }
}

// 图片上传相关
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  previewFile.value = file

  return false // 阻止自动上传
}

const handleImageSuccess = async (res: any) => {
  if (res.code === 200 && res.data) {
    await sendPicMessage(res.data)
  }
}

const handleImageError = () => {
  ElMessage.error('图片上传失败')
  removePreview()
}

// 发送图片消息
const sendPicMessage = async (imageUrl: string) => {
  if (!receiverId.value) {
    ElMessage.warning('无法确定接收者')
    return
  }

  sending.value = true
  try {
    const res: any = await sendImageMessage({
      appointmentId: appointmentId.value,
      receiverId: receiverId.value,
      imageUrl: imageUrl
    })
    
    if (res.code === 200) {
      removePreview()
      console.log('图片消息发送成功')
    }
  } catch (e) {
    console.error('发送图片失败', e)
    ElMessage.error('发送图片失败')
  } finally {
    sending.value = false
  }
}

// 移除预览
const removePreview = () => {
  previewImage.value = ''
  previewFile.value = null
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const d = new Date(time)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesArea.value) {
    messagesArea.value.scrollTop = messagesArea.value.scrollHeight
  }
}

// 返回
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.user-chat-container {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f7f5;
}

/* 返回按钮 */
.back-header {
  position: relative;
  z-index: 10;
  padding: 16px 20px;
}

.back-btn {
  color: #6b7b6b;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-btn:hover {
  color: #3dad6f;
}

/* 聊天主体 */
.chat-main {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px 20px;
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  overflow: hidden;
}

/* 心理师信息栏 */
.psychologist-info-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f5f7f5;
  border-bottom: 1px solid #e8eee8;
}

.psy-avatar {
  border: 2px solid #e8eee8;
}

.psy-details {
  flex: 1;
}

.psy-name {
  color: #1a2e1a;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
}

.psy-title {
  color: #6b7b6b;
  font-size: 13px;
  margin: 0;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #ffeee8;
  border-radius: 20px;
  font-size: 12px;
  color: #f4836c;
}

.connection-status.connected {
  background: #e8f5ee;
  color: #3dad6f;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.connection-status.connected .status-dot {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 消息区域 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: #f5f7f5;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #e8eee8;
  border-radius: 3px;
}

/* 加载状态 */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7b6b;
  gap: 12px;
}

/* 空状态 */
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6b7b6b;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-messages p {
  margin: 8px 0;
  font-size: 16px;
}

.empty-hint {
  font-size: 13px !important;
  color: #9ead9e;
}

/* 消息列表 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 80%;
  margin-bottom: 16px;
}

.message-avatar {
  flex-shrink: 0;
}

/* 对方消息：头像在左，消息在右 */
.message-item {
  flex-direction: row;
}

/* 自己消息：头像在右，消息在左 */
.message-self {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-bubble {
  max-width: 100%;
  padding: 12px 16px;
  background: #f5f7f5;
  border: 1px solid #e8eee8;
  border-radius: 16px;
  border-top-left-radius: 4px;
}

.message-self .message-bubble {
  background: #e8f5ee;
  border-color: rgba(61, 173, 111, 0.15);
  border-top-left-radius: 16px;
  border-top-right-radius: 4px;
}

.message-text {
  color: #1a2e1a;
  margin: 0;
  line-height: 1.5;
  word-break: break-word;
}

.message-time {
  font-size: 11px;
  color: #9ead9e;
}

.image-bubble {
  padding: 8px;
  background: transparent !important;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
}

.system-message {
  padding: 8px 16px;
  background: #fff8e1;
  border-radius: 8px;
  color: #f5a623;
  font-size: 13px;
  text-align: center;
  margin: 0 auto;
}

.self-avatar {
  background: #e8f5ee;
  border: 1px solid #e8eee8;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 12px;
  color: #9ead9e;
}

/* 输入区域 */
.input-area {
  padding: 16px 20px;
  background: #f5f7f5;
  border-top: 1px solid #e8eee8;
}

/* 图片预览 */
.image-preview-container {
  margin-bottom: 12px;
}

.image-preview-item {
  position: relative;
  display: inline-block;
}

.preview-img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
}

.preview-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: rgba(239, 68, 68, 0.9);
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 输入行 */
.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-btn {
  color: #9ead9e;
  font-size: 20px;
}

.upload-btn:hover {
  color: #3dad6f;
}

.message-input {
  flex: 1;
}

.message-input :deep(.el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #e8eee8;
  box-shadow: none;
}

.message-input :deep(.el-input__inner) {
  color: #1a2e1a;
}

.message-input :deep(.el-input__inner::placeholder) {
  color: #9ead9e;
}

/* clean-btn-primary styled via design-tokens.css (el-button--primary) */
.send-btn {
  padding: 10px 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .user-chat-container {
    height: calc(100vh - 60px);
  }

  .chat-main {
    border-radius: 16px;
    margin: 0 10px;
  }

  .message-item {
    max-width: 90%;
  }
}
</style>
