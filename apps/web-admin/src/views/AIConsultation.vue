<template>
  <div class="ai-consultation-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <span>历史会话</span>
        <el-button type="primary" size="small" icon="Plus" @click="createNewSession">新建会话</el-button>
      </div>
      <div class="session-list" v-loading="loadingSessions">
        <div 
          v-for="session in sessions" 
          :key="session.id" 
          :class="['session-item', currentSessionId === session.id ? 'active' : '']"
          @click="selectSession(session.id)"
        >
          <span class="session-title">{{ session.title }}</span>
          <el-popconfirm title="确定删除该会话吗？" @confirm="deleteSession(session.id)">
            <template #reference>
              <el-button type="danger" link size="small" @click.stop><el-icon><Delete /></el-icon></el-button>
            </template>
          </el-popconfirm>
        </div>
        <el-empty v-if="sessions.length === 0" description="暂无历史会话" :image-size="60"></el-empty>
      </div>
    </div>
    
    <div class="chat-area">
      <div class="chat-header">
        <div class="header-left">
          <span class="title">小爱咨询师</span>
          <el-tag size="small" type="success">Qwen-Max</el-tag>
        </div>
        <!-- <div class="thinking-switch">
          <span class="label">深度思考</span>
          <el-switch v-model="enableThinking" active-text="开启" inactive-text="关闭" />
        </div> -->
      </div>
      
      <div class="chat-window" ref="chatWindow">
        <div v-if="messages.length === 0 && !loadingSessions" class="welcome-screen">
          <el-empty description="开始一次新的心理咨询吧"></el-empty>
        </div>
        
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role === 'user' ? 'user-message' : 'ai-message']">
          <div class="message-content">
            <el-avatar :size="36" :src="msg.role === 'user' ? userAvatar : aiAvatar" class="avatar"></el-avatar>
            <div class="text-bubble">
               <div class="text-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="streaming" class="message ai-message">
           <div class="message-content">
             <el-avatar :size="36" :src="aiAvatar" class="avatar"></el-avatar>
             <div class="text-bubble">
                <div class="text-content">{{ currentStreamContent }}<span class="cursor">|</span></div>
             </div>
           </div>
        </div>
      </div>
      
      <div class="input-area">
        <el-input
          v-model="inputMessage"
          placeholder="请输入您的问题... (Shift+Enter 换行)"
          @keydown.enter.prevent="handleEnter"
          type="textarea"
          :rows="4"
          :disabled="streaming"
          resize="none"
        ></el-input>
        <div class="input-actions">
           <span class="tip">AI 内容仅供参考，不作为医疗诊断依据</span>
           <el-button type="primary" @click="sendMessage" :loading="streaming" :disabled="!inputMessage.trim()">发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import request from '@/api/user' // Use existing request instance
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

const inputMessage = ref('')
const sessions = ref<any[]>([])
const currentSessionId = ref<number | null>(null)
const messages = ref<any[]>([])
const loadingSessions = ref(false)
const streaming = ref(false)
const currentStreamContent = ref('')
const enableThinking = ref(false)

const userAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const aiAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const chatWindow = ref<HTMLElement | null>(null)

// Load sessions
const loadSessions = async () => {
  loadingSessions.value = true
  try {
    const res = await request.get('/ai/sessions') as any
    if (res.code === 200) {
      sessions.value = res.data
      if (sessions.value.length > 0 && !currentSessionId.value) {
        selectSession(sessions.value[0].id)
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingSessions.value = false
  }
}

const createNewSession = async () => {
  try {
    const res = await request.post('/ai/session') as any
    if (res.code === 200) {
      const newSession = res.data
      sessions.value.unshift(newSession)
      selectSession(newSession.id)
    }
  } catch (e) {
    ElMessage.error('创建会话失败')
  }
}

const deleteSession = async (id: number) => {
  try {
    const res = await request.delete(`/ai/session/${id}`) as any
    if (res.code === 200) {
      ElMessage.success('删除成功')
      sessions.value = sessions.value.filter(s => s.id !== id)
      if (currentSessionId.value === id) {
        currentSessionId.value = null
        messages.value = []
        if (sessions.value.length > 0) {
          selectSession(sessions.value[0].id)
        }
      }
    }
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

const selectSession = async (id: number) => {
  currentSessionId.value = id
  messages.value = []
  try {
    const res = await request.get(`/ai/session/${id}/messages`) as any
    if (res.code === 200) {
      messages.value = res.data
      scrollToBottom()
    }
  } catch (e) {
    console.error(e)
  }
}

const handleEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) return // Allow new line
  sendMessage()
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || streaming.value) return
  
  const text = inputMessage.value
  inputMessage.value = ''
  
  // Optimistic update
  messages.value.push({ role: 'user', content: text })
  scrollToBottom()
  
  streaming.value = true
  currentStreamContent.value = ''
  
  try {
    const token = localStorage.getItem('token')
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
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader')

    const decoder = new TextDecoder()
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (value) {
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
              if (line.trim().startsWith('data:')) {
                  const data = line.trim().substring(5)
                  currentStreamContent.value += data
                  scrollToBottom()
              }
          }
      }
      
      if (done) break
    }
    
    // Finished
    messages.value.push({ role: 'assistant', content: currentStreamContent.value })
    currentStreamContent.value = ''
    
    // Reload sessions to update title/time or if new session created
    if (!currentSessionId.value) {
        loadSessions() // Reload to get new session
    }

  } catch (e) {
    ElMessage.error('发送失败')
    messages.value.push({ role: 'system', content: '发送失败，请重试' })
  } finally {
    streaming.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight
    }
  })
}

onMounted(() => {
  loadSessions()
})
</script>

<style scoped>
.ai-consultation-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  color: #1a2e1a;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e8eee8 !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #1a2e1a !important;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.session-item {
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  transition: background 0.2s;
  color: #6b7b6b !important;
}
.session-item:hover {
  background: rgba(61, 173, 111, 0.06) !important;
  color: #1a2e1a !important;
}
.session-item.active {
  background: rgba(61, 173, 111, 0.12) !important;
  color: #3dad6f !important;
}
.session-title {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  color: inherit;
}

/* 聊天主区 */
.chat-area {
  flex: 1;
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e8eee8 !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #1a2e1a !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title {
  font-size: 16px;
  font-weight: bold;
  color: #1a2e1a !important;
}
.thinking-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #6b7b6b !important;
}

/* 聊天消息窗口 */
.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7f5 !important;
  color: #1a2e1a;
}

.message {
  margin-bottom: 20px;
  display: flex;
  color: #1a2e1a;
}
.user-message {
  justify-content: flex-end;
}

.message-content {
  display: flex;
  gap: 12px;
  max-width: 80%;
  color: #1a2e1a;
}
.user-message .message-content {
  flex-direction: row-reverse;
}

/* 气泡 */
.text-bubble {
  background: #f0f4f0 !important;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: #1a2e1a !important;
  border: 1px solid #e8eee8;
}
.user-message .text-bubble {
  background: rgba(61, 173, 111, 0.12) !important;
  border-color: rgba(61, 173, 111, 0.2);
  color: #1a2e1a !important;
}
.ai-message .text-bubble {
  background: #f0f4f0 !important;
  border-color: #e8eee8;
  color: #1a2e1a !important;
}

/* 输入区 */
.input-area {
  padding: 20px;
  border-top: 1px solid #e8eee8 !important;
  background: #fafcfa !important;
  border-radius: 0 0 8px 8px;
}
.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.tip {
  font-size: 12px;
  color: #9ead9e !important;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: #1a2e1a;
  animation: blink 1s infinite;
  vertical-align: middle;
  margin-left: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Element Plus 输入框适配 */
.ai-consultation-container :deep(.el-input__wrapper) {
  background: #f5f7f5 !important;
  border: 1px solid #e8eee8 !important;
  box-shadow: none !important;
}
.ai-consultation-container :deep(.el-input__inner) {
  color: #1a2e1a !important;
}
.ai-consultation-container :deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
}
.ai-consultation-container :deep(.el-button--primary) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
}
.ai-consultation-container :deep(.el-button--primary:hover) {
  background: #2d8a55 !important;
}
.ai-consultation-container :deep(.el-switch) {
  --el-switch-off-color: rgba(0, 0, 0, 0.1);
}

/* el-textarea 与空状态 */
.ai-consultation-container :deep(.el-textarea__inner) {
  background: #f5f7f5 !important;
  border: 1px solid #e8eee8 !important;
  color: #1a2e1a !important;
  box-shadow: none !important;
}
.ai-consultation-container :deep(.el-textarea__inner::placeholder) {
  color: #9ead9e !important;
}
.ai-consultation-container :deep(.el-empty) {
  background: transparent !important;
}
.ai-consultation-container :deep(.el-empty__description) {
  color: #6b7b6b !important;
}
.ai-consultation-container :deep(.el-tag--success) {
  background: rgba(61, 173, 111, 0.12) !important;
  border: none !important;
  color: #3dad6f !important;
}
.ai-consultation-container :deep(.el-button--danger.is-link) {
  color: #f56c6c !important;
}
.ai-consultation-container :deep(.el-loading-mask) {
  background: rgba(255, 255, 255, 0.5) !important;
}
</style>
