<template>
  <div class="dashboard-panels">
    <!-- AI 咨询室 Preview -->
    <div class="panel panel-ai">
      <div class="panel-header">
        <h3 class="panel-title">AI 咨询室 <span class="panel-subtitle">· 最新对话</span></h3>
      </div>
      <div class="panel-body">
        <div v-if="aiLoading" class="skeleton-block" />
        <div v-else-if="latestMessage" class="ai-chat-preview">
          <div class="chat-bubble">
            <p>{{ latestMessage }}</p>
          </div>
          <el-button text class="view-more-btn" @click="$router.push('/ai-consultation')">
            查看完整对话记录 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div v-else class="empty-hint">还没有 AI 会话记录</div>
        <div class="ai-input-row">
          <el-input
            v-model="quickInput"
            placeholder="把现在最困扰你的事写下来"
            class="ai-quick-input"
            @keyup.enter="goToAiChat"
          />
          <el-button type="primary" circle :icon="Promotion" size="small" @click="goToAiChat" />
        </div>
      </div>
    </div>

    <!-- Center Stack -->
    <div class="panel-stack">
      <!-- 近期预约 -->
      <div class="panel panel-sm">
        <div class="panel-header">
          <h3 class="panel-title">近期预约</h3>
          <el-button text size="small" @click="$router.push('/my-psychology')">查看全部 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <div class="panel-body">
          <div v-if="appointmentLoading" class="skeleton-block skeleton-sm" />
          <div v-else-if="nextAppointment" class="appointment-item-wrap">
            <div class="appointment-item">
              <el-avatar :size="40">{{ nextAppointment.doctorName?.charAt(0) || '医' }}</el-avatar>
              <div class="appointment-info">
                <p class="appointment-name">{{ nextAppointment.doctorName || '心理咨询师' }}</p>
                <p class="appointment-meta">
                  <span v-if="nextAppointment.serviceType" class="meta-tag">{{ nextAppointment.serviceType === 'online' ? '线上' : '线下' }}</span>
                  <span>{{ nextAppointment.appointmentTime || '暂无时间' }}</span>
                </p>
              </div>
              <el-tag size="small" :type="statusTagType(nextAppointment.status)">{{ nextAppointment.status || '已预约' }}</el-tag>
            </div>
            <div v-if="nextAppointment.description" class="appointment-desc">{{ nextAppointment.description.slice(0, 60) }}</div>
            <div class="appointment-actions">
              <el-button size="small" @click="$router.push('/my-psychology')">查看详情</el-button>
              <el-button v-if="canCancel(nextAppointment.status)" size="small" type="danger" plain @click="$emit('cancelAppointment', nextAppointment.id)">取消预约</el-button>
            </div>
          </div>
          <div v-else class="empty-hint">暂无近期预约</div>
        </div>
      </div>

      <!-- 心理评估记录 -->
      <div class="panel panel-sm">
        <div class="panel-header">
          <h3 class="panel-title">心理评估记录</h3>
          <el-button text size="small" @click="$router.push('/my-home/assessments')">查看全部 <el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <div class="panel-body">
          <div v-if="recordLoading" class="skeleton-block skeleton-sm" />
          <div v-else-if="latestRecord" class="record-item">
            <p class="record-title">{{ latestRecord.templateTitle }}</p>
            <div class="record-emotion-row">
              <span class="emotion-tag" :class="emotionClass(score)">{{ emotionLabel(score) }}</span>
              <span class="emotion-date">{{ latestRecord.record?.updateTime || '' }}</span>
            </div>
            <p class="record-analysis">{{ latestRecord.record?.resultAnalysis?.slice(0, 80) || '暂无分析' }}...</p>
          </div>
          <div v-else class="empty-hint">暂无测评记录</div>
        </div>
      </div>
    </div>

    <!-- 为你推荐 -->
    <div class="panel panel-recommend">
      <div class="panel-header">
        <h3 class="panel-title">为你推荐</h3>
      </div>
      <div class="panel-body">
        <div v-if="recLoading" class="skeleton-block" />
        <div v-else-if="recommendations?.length" class="rec-list">
          <div
            v-for="(item, idx) in recommendations"
            :key="idx"
            class="rec-item"
            :class="recColorClass(idx)"
            @click="goToItem(item)"
          >
            <div class="rec-thumb" :class="recThumbClass(idx)" />
            <div class="rec-info">
              <p class="rec-title">{{ item.title }}</p>
              <p class="rec-meta">{{ item.type }} · {{ item.author }}</p>
            </div>
          </div>
          <el-button text class="view-more-btn" @click="$router.push('/articles')">
            查看全部推荐内容 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div v-else class="empty-hint">暂无推荐内容</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Promotion } from '@element-plus/icons-vue'

const props = defineProps<{
  latestMessage?: string
  aiLoading?: boolean
  nextAppointment?: any
  appointmentLoading?: boolean
  latestRecord?: any
  recordLoading?: boolean
  recommendations?: any[]
  recLoading?: boolean
}>()

defineEmits<{
  cancelAppointment: [id: number]
}>()

const router = useRouter()
const quickInput = ref('')

function goToAiChat() {
  router.push('/ai-consultation')
}

function goToItem(item: any) {
  if (item.type === '文章') router.push(`/article/${item.id}`)
  else if (item.type === '课程') router.push('/courses')
  else if (item.type === '书籍') router.push(`/book/${item.id}`)
  else router.push('/articles')
}

function statusTagType(status: unknown): 'info' | 'primary' | 'success' | 'danger' | 'warning' {
  if (status == null) return 'info'
  const s = String(status).toLowerCase()
  if (s.includes('完成')) return 'success'
  if (s.includes('取消')) return 'danger'
  if (s.includes('过期') || s.includes('爽约')) return 'warning'
  if (s.includes('预约') || s.includes('待') || s.includes('确认')) return 'primary'
  return 'info'
}

function canCancel(status: unknown): boolean {
  if (status == null) return false
  const s = String(status).toLowerCase()
  return s.includes('预约') || s.includes('待')
}

const score = computed(() => {
  const s = props.latestRecord?.record?.resultScore
  if (s == null) return -1
  return Number(s)
})

function emotionLabel(score: number) {
  if (score < 0) return ''
  if (score <= 30) return '需要关注'
  if (score <= 60) return '轻微焦虑'
  if (score <= 80) return '稳定'
  return '状态良好'
}

function emotionClass(score: number) {
  if (score < 0) return ''
  if (score <= 30) return 'emotion-coral'
  if (score <= 60) return 'emotion-yellow'
  if (score <= 80) return 'emotion-green'
  return 'emotion-positive'
}

function recColorClass(idx: number) {
  return ['rec-coral', 'rec-green', 'rec-yellow'][idx % 3]
}

function recThumbClass(idx: number) {
  return ['thumb-coral', 'thumb-green', 'thumb-yellow'][idx % 3]
}
</script>

<style scoped>
.dashboard-panels {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .dashboard-panels {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1200px) {
  .dashboard-panels {
    grid-template-columns: 1.1fr 0.9fr;
  }
}

@media (min-width: 1600px) {
  .dashboard-panels {
    grid-template-columns: 440px 320px 1fr;
  }
}

.panel {
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
  display: flex;
  flex-direction: column;
}

.panel-ai {
  min-height: 390px;
}

.panel-sm {
  flex: 1;
}

.panel-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-recommend {
  min-height: 390px;
}

@media (min-width: 1200px) and (max-width: 1599px) {
  .panel-recommend {
    grid-column: 1 / -1;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0;
}

.panel-subtitle {
  font-weight: 400;
  font-size: 14px;
  color: #9ead9e;
}

.panel-body {
  padding: 16px 24px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Skeleton */
.skeleton-block {
  height: 112px;
  background: linear-gradient(90deg, #f0f2f0 25%, #e8eee8 50%, #f0f2f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-sm {
  height: 64px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* AI Chat Preview */
.ai-chat-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-bubble {
  background: #e8f5ee;
  border-radius: 12px 12px 12px 4px;
  padding: 14px 16px;
  flex: 1;
}

.chat-bubble p {
  margin: 0;
  font-size: 14px;
  color: #6b7b6b;
  line-height: 1.6;
}

.view-more-btn {
  align-self: flex-start;
  color: #6b7b6b !important;
  font-size: 13px;
}

.view-more-btn:hover {
  color: #3dad6f !important;
}

.ai-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
}

.ai-quick-input {
  flex: 1;
}

.ai-quick-input :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 8px !important;
  background: #f5f7f5 !important;
}

/* Appointment */
.appointment-item-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.appointment-info {
  flex: 1;
}

.appointment-name {
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 4px;
  font-size: 14px;
}

.appointment-meta {
  color: #9ead9e;
  margin: 0;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-tag {
  display: inline-block;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #e8f5ee;
  color: #3dad6f;
  font-weight: 500;
}

.appointment-desc {
  font-size: 12px;
  color: #9ead9e;
  line-height: 1.5;
}

.appointment-actions {
  display: flex;
  gap: 8px;
}

/* Record */
.record-title {
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 12px;
  font-size: 14px;
}

.record-emotion-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.emotion-tag {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 12px;
  border-radius: 20px;
}

.emotion-coral {
  background: #ffeee8;
  color: #f4836c;
}

.emotion-yellow {
  background: #fff8e1;
  color: #e6a23c;
}

.emotion-green {
  background: #e8f5ee;
  color: #3dad6f;
}

.emotion-positive {
  background: #e8f5ee;
  color: #67c23a;
}

.emotion-date {
  font-size: 12px;
  color: #c8d0c8;
}

.record-analysis {
  font-size: 13px;
  color: #6b7b6b;
  line-height: 1.6;
  margin: 0;
}

/* Recommendations */
.rec-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.rec-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.rec-item:hover {
  background: #f5f7f5;
}

.rec-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
}

.thumb-coral { background: #ffeee8; }
.thumb-green { background: #e8f5ee; }
.thumb-yellow { background: #fff8e1; }

.rec-info {
  flex: 1;
  min-width: 0;
}

.rec-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a2e1a;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rec-meta {
  font-size: 12px;
  color: #9ead9e;
  margin: 0;
}

/* Empty State */
.empty-hint {
  color: #9ead9e;
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
}
</style>
