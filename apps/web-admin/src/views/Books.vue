<template>
  <div class="books-container">
    <!-- 页面标题和搜索 -->
    <div class="books-header">
      <h1 class="page-title">心理书籍/期刊</h1>
      <p class="page-subtitle">精选心理健康相关书籍，助您更好地理解自我</p>
      
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索书籍名称..."
          clearable
          :prefix-icon="Search"
          @keyup.enter="loadBooks"
          @clear="clearSearch"
          style="width: 300px;"
        >
          <template #append>
            <el-button :icon="Search" @click="loadBooks" />
          </template>
        </el-input>
      </div>
    </div>

    <!-- 书籍列表 -->
    <div class="books-list">
      <el-row :gutter="20">
        <el-col 
          v-for="book in books" 
          :key="book.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
          class="book-col"
        >
          <el-card class="book-card" shadow="hover" @click="handleBookClick(book)">
            <div class="book-cover">
              <img 
                :src="book.coverUrl || '/image/default-book-cover.jpg'" 
                :alt="book.title"
                class="cover-image"
                @error="handleImageError"
              />
              <div class="book-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ book.viewCount || 0 }}
                </span>
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ book.commentCount || 0 }}
                </span>
              </div>
            </div>
            
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-description">{{ truncateDescription(book.description) }}</p>
              
              <div class="book-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click.stop="handleBookClick(book)"
                  class="read-btn"
                >
                  阅读书籍
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click.stop="showComments(book)"
                  class="comment-btn"
                >
                  查看评论
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="books.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无书籍数据" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[8, 12, 16, 20]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 评论弹窗 -->
    <el-dialog 
      v-model="commentDialogVisible" 
      :title="`《${currentBook?.title}》的评论`" 
      width="600px"
    >
      <div class="comment-dialog-content">
        <!-- 发表评论 -->
        <div class="comment-form" v-if="isLoggedIn">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下您的评论..."
            maxlength="500"
            show-word-limit
          />
          <div class="form-actions">
            <el-button type="primary" @click="submitComment" :loading="submittingComment">
              发表评论
            </el-button>
          </div>
        </div>
        <div v-else class="login-tip">
          <el-alert type="info" show-icon>
            请先登录后发表评论
            <template #action>
              <el-button type="primary" size="small" @click="goLogin">立即登录</el-button>
            </template>
          </el-alert>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div v-if="comments.length === 0" class="no-comments">
            <el-empty description="暂无评论" />
          </div>
          
          <div v-else>
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <el-avatar :size="32" :src="comment.userAvatar" class="comment-avatar">
                  <template #default>
                    <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                  </template>
                </el-avatar>
                <div class="comment-user">
                  <span class="user-name">{{ comment.userNickname }}</span>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
            </div>
            
            <!-- 评论分页 -->
            <div class="comment-pagination" v-if="commentTotal > 10">
              <el-pagination
                v-model:current-page="commentPage"
                v-model:page-size="commentPageSize"
                :total="commentTotal"
                layout="prev, pager, next"
                small
                @current-change="loadComments"
              />
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, View, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  getBookList, 
  addBookView, 
  submitBookComment, 
  getBookComments 
} from '@/api/book'

const router = useRouter()

// 用户登录状态
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token') && !!user.id
})

// 书籍列表相关
const books = ref<any[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 评论相关
const commentDialogVisible = ref(false)
const currentBook = ref<any>(null)
const comments = ref<any[]>([])
const newComment = ref('')
const submittingComment = ref(false)
const commentPage = ref(1)
const commentPageSize = ref(10)
const commentTotal = ref(0)

// 加载书籍列表
const loadBooks = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value.trim()
    }
    
    const res = await getBookList(params)
    if (res.code === 200) {
      books.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch (error) {
    console.error('加载书籍列表失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理书籍点击（跳转并增加浏览数）
const handleBookClick = async (book: any) => {
  if (!book.address) {
    ElMessage.warning('该书籍暂无链接')
    return
  }
  
  try {
    // 先调用增加浏览数接口
    await addBookView(book.id)
    
    // 然后跳转到外部链接
    window.open(book.address, '_blank')
    
    // 更新本地浏览数（可选）
    const index = books.value.findIndex(b => b.id === book.id)
    if (index !== -1) {
      books.value[index].viewCount = (books.value[index].viewCount || 0) + 1
    }
  } catch (error) {
    console.error('增加浏览数失败:', error)
    // 即使接口失败也允许跳转
    window.open(book.address, '_blank')
  }
}

// 显示评论弹窗
const showComments = async (book: any) => {
  currentBook.value = book
  commentDialogVisible.value = true
  commentPage.value = 1
  await loadComments()
}

// 加载评论
const loadComments = async () => {
  if (!currentBook.value) return
  
  try {
    const params = {
      page: commentPage.value,
      size: commentPageSize.value
    }
    
    const res = await getBookComments(currentBook.value.id, params)
    if (res.code === 200) {
      comments.value = res.data.records
      commentTotal.value = res.data.total
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
  }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  if (!currentBook.value) return
  
  submittingComment.value = true
  try {
    const params = {
      bookId: currentBook.value.id,
      content: newComment.value.trim()
    }
    
    const res = await submitBookComment(params)
    if (res.code === 200) {
      ElMessage.success('评论成功')
      newComment.value = ''
      
      // 刷新评论列表
      commentPage.value = 1
      await loadComments()
      
      // 更新书籍的评论数
      const index = books.value.findIndex(b => b.id === currentBook.value.id)
      if (index !== -1) {
        books.value[index].commentCount = (books.value[index].commentCount || 0) + 1
      }
    } else {
      ElMessage.error(res.message || '评论失败')
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    submittingComment.value = false
  }
}

// 工具函数
const truncateDescription = (text: string, length = 80) => {
  if (!text) return '暂无简介'
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString()
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/image/default-book-cover.jpg'
}

const clearSearch = () => {
  searchKeyword.value = ''
  loadBooks()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadBooks()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadBooks()
}

const goLogin = () => {
  router.push('/login')
}

onMounted(() => {
  loadBooks()
})
</script>

<style scoped>
.books-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.books-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8eee8;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(to right, #3dad6f, #5bc4bf);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #6b7b6b;
  font-size: 16px;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.search-box :deep(.el-input-group__append) {
  background-color: #3dad6f;
  color: white;
  border: none;
}

.search-box :deep(.el-input-group__append:hover) {
  background-color: #5dd48a;
}

.books-list {
  margin-bottom: 30px;
}

.book-col {
  margin-bottom: 24px;
}

.book-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
  border: 1px solid #e8eee8;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 24px rgba(61, 173, 111, 0.12);
  border-color: rgba(61, 173, 111, 0.2);
}

.book-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 16px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .cover-image {
  transform: scale(1.05);
}

.book-stats {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 10px;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item .el-icon {
  font-size: 14px;
}

.book-info {
  padding: 0 8px;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2e1a;
  margin-bottom: 8px;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2; /* 添加标准属性 */
  -webkit-box-orient: vertical; /* 保持原有 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.book-description {
  color: #6b7b6b;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3; /* 添加标准属性 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.read-btn {
  background: linear-gradient(135deg, #3dad6f, #5bc4bf);
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 500;
}

.comment-btn {
  color: #9ead9e;
}

.comment-btn:hover {
  color: #3dad6f;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.pagination-container :deep(.el-pagination) {
  --el-pagination-bg-color: #ffffff;
  --el-pagination-button-bg-color: #f5f7f5;
  --el-pagination-hover-color: #3dad6f;
}

/* 评论弹窗样式 */
.comment-dialog-content {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.comment-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7f5;
  border-radius: 8px;
}

.form-actions {
  margin-top: 15px;
  text-align: right;
}

.login-tip {
  margin-bottom: 30px;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  padding: 16px;
  margin-bottom: 16px;
  background: #f5f7f5;
  border-radius: 8px;
  border-left: 3px solid #3dad6f;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.comment-avatar {
  margin-right: 12px;
}

.comment-user {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #1a2e1a;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.comment-content {
  color: #6b7b6b;
  font-size: 14px;
  line-height: 1.6;
}

.no-comments {
  padding: 40px 0;
  text-align: center;
}

.comment-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>