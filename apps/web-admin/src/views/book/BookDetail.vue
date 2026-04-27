<template>
  <div class="book-detail-page">
    <div class="book-detail-content" v-if="!loading">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-link type="info" underline="never" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回书籍列表
        </el-link>
      </div>

      <!-- 书籍主信息 -->
      <div class="book-main glass-card">
        <div class="book-header">
          <div class="cover-section">
            <el-image
              :src="book.coverUrl || '/default-book-cover.png'"
              :alt="book.title"
              fit="cover"
              class="main-cover"
              :preview-src-list="[]"
            >
              <template #error>
                <div class="cover-error">
                  <el-icon><Picture /></el-icon>
                  <span>暂无封面</span>
                </div>
              </template>
            </el-image>
          </div>
          
          <div class="info-section">
            <h1 class="book-title">{{ book.title }}</h1>
            
            <div class="book-meta">
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>浏览：{{ formatCount(book.viewCount || 0) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>评论：{{ formatCount(book.commentCount || 0) }}</span>
              </div>
              <div v-if="book.createTime" class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>发布时间：{{ formatTime(book.createTime) }}</span>
              </div>
            </div>
            
            <div class="book-description">
              <h3>书籍简介</h3>
              <p>{{ book.description || '暂无简介' }}</p>
            </div>
            
            <!-- 跳转按钮 -->
            <div class="action-buttons">
              <el-button
                v-if="book.address"
                type="primary"
                size="large"
                @click="handleReadOnline"
                class="read-btn"
              >
                <el-icon><Link /></el-icon>
                在线阅读
              </el-button>
              <el-button
                v-else
                type="info"
                size="large"
                disabled
                class="read-btn"
              >
                暂无在线阅读链接
              </el-button>
              
              <el-button
                type="success"
                size="large"
                @click="showCommentDialog = true"
                :disabled="!isLoggedIn"
                class="comment-btn"
              >
                <el-icon><Edit /></el-icon>
                发表评论
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section glass-card">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><ChatDotRound /></el-icon>
            读者评论
            <span class="comment-count">({{ totalComments }})</span>
          </h2>
        </div>
        
        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <el-avatar :size="40" :src="comment.userAvatar" class="user-avatar">
                {{ comment.userNickname?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-info">
                <div class="user-name">{{ comment.userNickname || '匿名用户' }}</div>
                <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
          </div>
        </div>
        
        <!-- 无评论 -->
        <div v-else class="no-comments">
          <el-empty description="暂无评论，快来发表第一条评论吧！">
            <el-button type="primary" @click="showCommentDialog = true" :disabled="!isLoggedIn">
              发表评论
            </el-button>
          </el-empty>
        </div>
        
        <!-- 评论分页 -->
        <div v-if="totalComments > 0" class="comment-pagination">
          <el-pagination
            v-model:current-page="commentPage"
            v-model:page-size="commentSize"
            :page-sizes="[5, 10, 20]"
            :total="totalComments"
            layout="total, sizes, prev, pager, next"
            @size-change="handleCommentSizeChange"
            @current-change="handleCommentPageChange"
          />
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else class="loading">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 发表评论对话框 -->
    <el-dialog
      v-model="showCommentDialog"
      title="发表评论"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="commentForm" :rules="commentRules" ref="commentFormRef">
        <el-form-item label="评论内容" prop="content">
          <el-input
            type="textarea"
            v-model="commentForm.content"
            :rows="4"
            placeholder="请输入您的评论..."
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCommentDialog = false">取消</el-button>
          <el-button type="primary" @click="submitComment" :loading="submitting">
            发表评论
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  View,
  ChatDotRound,
  Clock,
  Picture,
  Link,
  Edit
} from '@element-plus/icons-vue'
import {
  getBookDetail,
  getBookComments,
  type Book,
  type Comment,
  type CommentForm
} from '@/api/book'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const bookId = Number(route.params.id)

// 书籍详情
const book = ref<Book>({
  id: 0,
  title: '',
  coverUrl: '',
  description: '',
  address: '',
  viewCount: 0,
  commentCount: 0
})

// 评论相关
const comments = ref<Comment[]>([])
const commentPage = ref(1)
const commentSize = ref(10)
const totalComments = ref(0)
const showCommentDialog = ref(false)
const commentForm = ref<CommentForm>({
  bookId: bookId,
  content: ''
})
const commentFormRef = ref<FormInstance>()
const submitting = ref(false)

// 加载状态
const loading = ref(true)

// 用户登录状态
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token') && !!user.id
})

// 表单验证规则
const commentRules: FormRules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 5, message: '评论内容至少5个字符', trigger: 'blur' },
    { max: 500, message: '评论内容不能超过500个字符', trigger: 'blur' }
  ]
}

// 工具函数
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

const formatTime = (time: string) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 获取书籍详情
const fetchBookDetail = async () => {
  loading.value = true
  try {
    const res = await getBookDetail(bookId)
    if (res.code === 200) {
      book.value = res.data
    } else {
      ElMessage.error(res.message || '获取书籍详情失败')
      router.push('/books')
    }
  } catch (error) {
    console.error('获取书籍详情失败:', error)
    ElMessage.error('获取书籍详情失败，请稍后重试')
    router.push('/books')
  } finally {
    loading.value = false
  }
}

// 增加浏览数
const incrementViewCount = async () => {
  try {
    // 使用 get 方法模拟增加浏览数
    const response = await fetch(`http://localhost:8080/book/${bookId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.code === 200) {
        console.log('浏览数增加成功');
      }
    }
  } catch (error) {
    console.error('增加浏览数失败:', error)
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const res = await getBookComments(bookId, {
      page: commentPage.value,
      size: commentSize.value
    })
    if (res.code === 200) {
      comments.value = res.data.records || []
      totalComments.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取评论失败')
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败，请稍后重试')
  }
}

// 提交评论
const submitComment = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再发表评论')
    router.push('/login')
    return
  }

  if (!commentFormRef.value) return
  
  await commentFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/book/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentForm.value)
      })
      
      if (response.ok) {
        const res = await response.json()
        if (res.code === 200) {
          ElMessage.success('评论发表成功')
          showCommentDialog.value = false
          commentForm.value.content = ''
          
          // 刷新评论列表
          commentPage.value = 1
          await fetchComments()
          
          // 刷新书籍详情（更新评论数）
          await fetchBookDetail()
        } else {
          ElMessage.error(res.message || '评论发表失败')
        }
      } else {
        ElMessage.error('评论发表失败')
      }
    } catch (error) {
      console.error('提交评论失败:', error)
      ElMessage.error('评论发表失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 在线阅读处理
const handleReadOnline = async () => {
  if (!book.value.address) {
    ElMessage.warning('暂无在线阅读链接')
    return
  }

  // 先增加浏览数
  try {
    await incrementViewCount()
  } catch (error) {
    console.error('增加浏览数失败:', error)
  }

  // 补全协议头，避免浏览器将地址当作相对路径拼接
  let fullUrl = book.value.address.trim()
  if (!/^https?:\/\//i.test(fullUrl)) {
    fullUrl = 'https://' + fullUrl
  }

  window.open(fullUrl, '_blank')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 评论分页处理
const handleCommentSizeChange = (newSize: number) => {
  commentSize.value = newSize
  commentPage.value = 1
  fetchComments()
}

const handleCommentPageChange = (newPage: number) => {
  commentPage.value = newPage
  fetchComments()
}

onMounted(async () => {
  // 先增加浏览数
  await incrementViewCount()
  
  // 获取书籍详情
  await fetchBookDetail()
  
  // 获取评论列表
  await fetchComments()
})
</script>

<style scoped>
/* ==================== 页面整体布局 ==================== */
.book-detail-page {
  min-height: 100vh;
  position: relative;
  padding: 40px 20px;
  background: #f5f7f5;
}

/* ==================== 内容层 ==================== */
.book-detail-content {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

/* ==================== 卡片通用样式 ==================== */
.glass-card {
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
  transition: all 0.3s ease;
}

.book-main {
  background: #ffffff !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.glass-card:hover {
  border-color: rgba(61, 173, 111, 0.2);
  box-shadow: 0 4px 16px rgba(61, 173, 111, 0.1);
}

/* ==================== 返回按钮 ==================== */
.back-button {
  margin-bottom: 24px;
}

.back-btn {
  color: #6b7b6b;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f5f7f5;
  border: 1px solid #e8eee8;
  border-radius: 8px;
  padding: 8px 16px;
}

.back-btn:hover {
  color: #3dad6f;
  background: #ffffff;
  border-color: rgba(61, 173, 111, 0.3);
}

/* ==================== 书籍主信息卡片 ==================== */
.book-main {
  padding: 36px;
  margin-bottom: 28px;
}

.book-header {
  display: flex;
  gap: 36px;
  align-items: flex-start;
}

.cover-section {
  flex-shrink: 0;
  width: 126px;
  height: 176px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f7f5;
  border: 1px solid #e8eee8;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
  transition: all 0.3s ease;
}

.cover-section:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(61, 173, 111, 0.12);
}

.main-cover {
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.cover-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #9ead9e;
  font-size: 12px;
  gap: 8px;
}

/* ==================== 右侧信息区 ==================== */
.info-section {
  flex: 1;
  min-width: 0;
}

.book-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a2e1a;
  margin: 0 0 16px 0;
  line-height: 1.3;
  letter-spacing: 0.5px;
}

.book-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7b6b;
}

.meta-item .el-icon {
  font-size: 15px;
  color: #9ead9e;
}

.book-description {
  margin-bottom: 24px;
}

.book-description h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 10px 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.book-description p {
  font-size: 14px;
  color: #6b7b6b;
  line-height: 1.8;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.read-btn,
.comment-btn {
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.read-btn.el-button--primary {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(61, 173, 111, 0.2);
}

.read-btn.el-button--primary:hover {
  background: #35a062 !important;
  border-color: #35a062 !important;
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.3);
  transform: translateY(-1px);
}

.comment-btn.el-button--success {
  background: #ffffff !important;
  border-color: #3dad6f !important;
  color: #3dad6f !important;
  box-shadow: 0 2px 8px rgba(61, 173, 111, 0.1);
}

.comment-btn.el-button--success:hover {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.2);
  transform: translateY(-1px);
}

/* ==================== 评论区域 ==================== */
.comments-section {
  padding: 28px 32px;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8eee8;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0;
}

.section-title .el-icon {
  color: #3dad6f;
  font-size: 20px;
}

.comment-count {
  font-size: 14px;
  font-weight: 400;
  color: #9ead9e;
  margin-left: 4px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 18px 20px;
  background: #f5f7f5;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.comment-item:hover {
  background: #ffffff;
  border-color: rgba(61, 173, 111, 0.2);
  box-shadow: 0 2px 8px rgba(61, 173, 111, 0.06);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  border: 1px solid #e8eee8;
  box-shadow: 0 2px 8px rgba(61, 173, 111, 0.06);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a2e1a;
}

.comment-time {
  font-size: 12px;
  color: #9ead9e;
  margin-top: 2px;
}

.comment-content {
  font-size: 14px;
  color: #6b7b6b;
  line-height: 1.7;
  padding-left: 52px;
}

.no-comments {
  padding: 20px 0;
}

.no-comments :deep(.el-empty__description p) {
  color: #9ead9e !important;
  font-size: 14px;
}

.comment-pagination {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8eee8;
  display: flex;
  justify-content: center;
}

.comment-pagination :deep(.el-pagination) {
  --el-pagination-bg-color: #ffffff;
  --el-pagination-button-bg-color: #f5f7f5;
  --el-pagination-hover-color: #3dad6f;
  --el-pagination-text-color: #6b7b6b;
  --el-pagination-button-color: #6b7b6b;
}

/* ==================== 加载状态 ==================== */
.loading {
  padding: 40px;
  background: #f5f7f5;
}

.loading :deep(.el-skeleton__item) {
  background: linear-gradient(90deg,
    #e8eee8 25%,
    #f0f5f0 50%,
    #e8eee8 75%) !important;
  background-size: 200% 100% !important;
}

/* ==================== 对话框 ==================== */
:deep(.el-dialog) {
  background: #ffffff !important;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #e8eee8;
  padding: 20px 24px !important;
}

:deep(.el-dialog__title) {
  color: #1a2e1a !important;
  font-weight: 600;
}

:deep(.el-dialog__close) {
  color: #9ead9e !important;
}

:deep(.el-dialog__close:hover) {
  color: #3dad6f !important;
}

:deep(.el-dialog__body) {
  padding: 24px !important;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #e8eee8;
  padding: 16px 24px !important;
}

:deep(.el-form-item__label) {
  color: #1a2e1a !important;
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  background: #f5f7f5 !important;
  border-color: #e8eee8 !important;
  color: #1a2e1a !important;
  border-radius: 8px;
}

:deep(.el-textarea__inner:focus) {
  border-color: #3dad6f !important;
  box-shadow: 0 0 0 2px rgba(61, 173, 111, 0.1) !important;
}

:deep(.el-input__wrapper) {
  background: #f5f7f5 !important;
  border-color: #e8eee8 !important;
  border-radius: 8px;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #1a2e1a !important;
}

:deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
}

:deep(.el-button--primary) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
  border-radius: 8px !important;
}

:deep(.el-button--primary:hover) {
  background: #35a062 !important;
  border-color: #35a062 !important;
}

:deep(.el-button--default) {
  border-radius: 8px !important;
  background: #ffffff !important;
  border-color: #e8eee8 !important;
  color: #6b7b6b !important;
}

:deep(.el-button--default:hover) {
  background: #f5f7f5 !important;
  border-color: #3dad6f !important;
  color: #3dad6f !important;
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 768px) {
  .book-detail-page {
    padding: 20px 12px;
  }

  .book-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .cover-section {
    width: 126px;
    height: 176px;
  }

  .book-meta {
    justify-content: center;
  }

  .action-buttons {
    justify-content: center;
  }

  .book-title {
    font-size: 22px;
  }

  .book-description p {
    text-align: left;
  }

  .comment-content {
    padding-left: 0;
  }
}
</style>