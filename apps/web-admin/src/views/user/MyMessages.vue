<template>
  <div class="my-messages-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的消息</span>
          <el-button size="small" @click="handleMarkAllRead" :disabled="unreadCount === 0" type="primary">全部已读</el-button>
        </div>
      </template>

      <div class="message-list" v-loading="loading">
        <el-empty v-if="!loading && messages.length === 0" description="暂无消息"></el-empty>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="{ unread: msg.isRead === 0, 'follow-msg': msg.sourceType === 1 }"
          @click="handleReadAndNavigate(msg)"
        >
          <div class="message-icon" :class="getIconClass(msg.sourceType)">
            <el-avatar v-if="msg.fromUserAvatar" :size="40" :src="msg.fromUserAvatar">
              <template #default>
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
              </template>
            </el-avatar>
            <el-icon v-else-if="msg.sourceType === 1"><User /></el-icon>
            <el-icon v-else-if="msg.sourceType === 2 || msg.sourceType === 3"><Star /></el-icon>
            <el-icon v-else-if="msg.sourceType === 4"><ChatDotRound /></el-icon>
            <el-icon v-else-if="msg.type === 2"><Document /></el-icon>
            <el-icon v-else><Bell /></el-icon>
          </div>
          <div class="message-content">
            <div class="message-title">
              {{ msg.title }}
              <el-tag v-if="msg.sourceType === 1" size="small" type="primary">关注</el-tag>
              <el-tag v-else-if="msg.sourceType === 2" size="small" type="danger">文章点赞</el-tag>
              <el-tag v-else-if="msg.sourceType === 3" size="small" type="danger">评论点赞</el-tag>
              <el-tag v-else-if="msg.sourceType === 4" size="small" type="success">回复</el-tag>
            </div>
            <div class="message-body">{{ msg.content }}</div>
            <div class="message-time">{{ msg.createTime }}</div>
          </div>
          <div class="message-status" v-if="msg.isRead === 0">
            <el-badge is-dot></el-badge>
          </div>
        </div>
      </div>

      <el-pagination
        v-if="total > 0"
        class="pagination"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Bell, Document, User, Star, ChatDotRound } from '@element-plus/icons-vue'
import { getMessages, markMessageRead, markAllMessagesRead, getUnreadCount, type SysMessage } from '@/api/message'

const router = useRouter()
const loading = ref(false)
const messages = ref<SysMessage[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const unreadCount = ref(0)

const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await getMessages({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      messages.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取消息列表失败')
  } finally {
    loading.value = false
  }
}

const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    if (res.code === 200) {
      unreadCount.value = res.data
    }
  } catch (error) {
    console.error('获取未读数失败')
  }
}

const getIconClass = (sourceType: number) => {
  switch (sourceType) {
    case 1: return 'icon-follow'
    case 2: return 'icon-like'
    case 3: return 'icon-like'
    case 4: return 'icon-reply'
    default: return ''
  }
}

const handleReadAndNavigate = async (msg: SysMessage) => {
  // 先标记已读
  if (msg.isRead === 0) {
    try {
      await markMessageRead(msg.id)
      msg.isRead = 1
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记失败')
    }
  }

  // 根据消息类型跳转
  if (msg.sourceType === 1 && msg.fromUserId) {
    // 关注通知 -> 跳转到用户主页
    router.push(`/user-home/${msg.fromUserId}`)
  } else if (msg.sourceId && (msg.sourceType === 2 || msg.sourceType === 3 || msg.sourceType === 4)) {
    // 文章点赞/评论点赞/评论回复 -> 根据 extraType 跳转到对应文章
    if (msg.extraType === 1) {
      // 用户文章 -> /user-article/{authorId}/{articleId}
      router.push(`/user-article/${msg.articleAuthorId}/${msg.sourceId}`)
    } else {
      // 官方文章 -> /article/{articleId}
      router.push(`/article/${msg.sourceId}`)
    }
  }
}

const handleMarkAllRead = async () => {
  try {
    const res = await markAllMessagesRead()
    if (res.code === 200) {
      ElMessage.success(res.data)
      messages.value.forEach(m => m.isRead = 1)
      unreadCount.value = 0
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchMessages()
}

onMounted(() => {
  fetchMessages()
  fetchUnreadCount()
})
</script>

<style scoped>
.my-messages-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  color: #1a2e1a;
}

/* 卡片 */
.my-messages-container :deep(.el-card) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  color: #1a2e1a !important;
}
.my-messages-container :deep(.el-card__body) {
  color: #1a2e1a !important;
}
.my-messages-container :deep(.el-card__header) {
  border-bottom-color: #e8eee8 !important;
  color: #1a2e1a !important;
}

/* 所有文本白色 */
.my-messages-container :deep(h1),
.my-messages-container :deep(h2),
.my-messages-container :deep(h3),
.my-messages-container :deep(h4),
.my-messages-container :deep(h5),
.my-messages-container :deep(h6),
.my-messages-container :deep(p),
.my-messages-container :deep(span) {
  color: #1a2e1a !important;
}

/* 消息列表项 */
.message-list {
  margin-top: 15px;
}
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid rgba(61, 173, 111, 0.06) !important;
  cursor: pointer;
  transition: background 0.2s;
}
.message-item:hover {
  background: rgba(61, 173, 111, 0.06) !important;
}
.message-item.unread {
  background: rgba(61, 173, 111, 0.08) !important;
}
.message-item.follow-msg {
  border-left: 3px solid rgba(61, 173, 111, 0.6) !important;
}

/* 消息图标 - 渐变色语义 */
.message-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.message-icon.icon-follow {
  background: linear-gradient(135deg, rgba(64,158,255,0.4), rgba(91,196,191,0.4)) !important;
  color: #3dad6f !important;
}
.message-icon.icon-like {
  background: linear-gradient(135deg, rgba(245,108,108,0.4), rgba(230,82,82,0.4)) !important;
  color: #FF8C9A !important;
}
.message-icon.icon-reply {
  background: linear-gradient(135deg, rgba(103,194,58,0.4), rgba(93,175,52,0.4)) !important;
  color: #A8E063 !important;
}
.message-icon.icon-comment {
  background: rgba(230, 162, 60, 0.25) !important;
  color: #FFB347 !important;
}
.message-icon.icon-system {
  background: rgba(144, 147, 153, 0.25) !important;
  color: #B0B8C1 !important;
}

/* 消息内容 */
.message-content {
  flex: 1;
  min-width: 0;
}
.message-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a2e1a !important;
}
.message-body {
  font-size: 14px;
  color: #6b7b6b !important;
  margin-bottom: 8px;
  line-height: 1.5;
}
.message-time {
  font-size: 12px;
  color: #9ead9e !important;
}
.message-status {
  flex-shrink: 0;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  justify-content: center;
}
.my-messages-container :deep(.el-pagination) {
  color: #1a2e1a !important;
}
.my-messages-container :deep(.el-pagination button),
.my-messages-container :deep(.el-pager li) {
  background: rgba(61, 173, 111, 0.06) !important;
  color: #1a2e1a !important;
}
.my-messages-container :deep(.el-pager li.is-active) {
  background: rgba(61, 173, 111, 0.4) !important;
}
</style>
