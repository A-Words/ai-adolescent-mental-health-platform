<template>
  <div class="book-list-page">
    <div class="book-content">
      <!-- 头部搜索和筛选 -->
      <div class="book-header glass-card">
        <div class="header-content">
          <h1 class="page-title">心理书籍/期刊</h1>
          <p class="page-subtitle">探索青少年心理健康领域的专业书籍与期刊</p>
          
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索书籍标题..."
              size="large"
              clearable
              @keyup.enter="handleSearch"
              @clear="clearSearch"
            >
              <template #prepend>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 书籍列表 -->
      <div class="book-list-container">
        <!-- 加载中 -->
        <div v-if="loading" class="loading">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 无数据 -->
        <div v-else-if="books.length === 0" class="no-data">
          <el-empty description="暂无书籍数据">
            <el-button type="primary" @click="refresh">刷新</el-button>
          </el-empty>
        </div>

        <!-- 书籍网格 -->
        <div v-else class="book-grid">
          <div
            v-for="book in books"
            :key="book.id"
            class="book-card glass-card"
            @click="goToBook(book)"
          >
            <div class="book-cover">
              <el-image
                :src="book.coverUrl || '/default-book-cover.png'"
                :alt="book.title"
                fit="cover"
                class="cover-image"
                :preview-src-list="[book.coverUrl]"
              >
                <template #error>
                  <div class="cover-error">
                    <el-icon><Picture /></el-icon>
                    <span>暂无封面</span>
                  </div>
                </template>
              </el-image>
            </div>
            
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-desc">{{ truncateText(book.description, 80) }}</p>
              
              <div class="book-stats">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ formatCount(book.viewCount || 0) }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>{{ formatCount(book.commentCount || 0) }}</span>
                </div>
              </div>
              
              <div v-if="book.address" class="external-link-tag">
                <el-tag type="success" size="small">可在线阅读</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="size"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, View, ChatDotRound, Picture } from '@element-plus/icons-vue'
import { getBookList, type Book, type BookListParams } from '@/api/book'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 搜索参数
const searchKeyword = ref('')
const page = ref(1)
const size = ref(12)
const total = ref(0)

// 书籍数据
const books = ref<Book[]>([])
const loading = ref(false)

// 工具函数
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '暂无简介'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 获取书籍列表
const fetchBooks = async () => {
  loading.value = true
  try {
    const params: BookListParams = {
      page: page.value,
      size: size.value
    }
    
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    
    const res = await getBookList(params)
    if (res.code === 200) {
      books.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取书籍列表失败')
      books.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取书籍列表失败:', error)
    ElMessage.error('获取书籍列表失败，请稍后重试')
    books.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  page.value = 1
  fetchBooks()
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  page.value = 1
  fetchBooks()
}

// 刷新
const refresh = () => {
  fetchBooks()
}

// 分页处理
const handleSizeChange = (newSize: number) => {
  size.value = newSize
  page.value = 1
  fetchBooks()
}

const handleCurrentChange = (newPage: number) => {
  page.value = newPage
  fetchBooks()
}

// 跳转到书籍
const goToBook = (book: Book) => {
  router.push(`/book/${book.id}`)
}

// 监听路由参数
watch(() => router.currentRoute.value.query, (newQuery) => {
  if (newQuery.keyword) {
    searchKeyword.value = newQuery.keyword as string
  }
  fetchBooks()
})

onMounted(() => {
  fetchBooks()
})
</script>

<style scoped>
.book-list-page {
  min-height: calc(100vh - 60px);
  background: #f5f7f5;
}

.book-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 卡片 */
.glass-card {
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 16px;
  padding: 24px;
}

.book-header {
  margin-bottom: 30px;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  background: linear-gradient(to right, #3dad6f, #5bc4bf);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7b6b;
  margin-bottom: 30px;
  line-height: 1.6;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
  background-color: #f5f7f5 !important;
  border-color: #e8eee8 !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #1a2e1a !important;
}

:deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
}

:deep(.el-input-group__prepend) {
  background: #f5f7f5 !important;
  border-color: #e8eee8 !important;
  color: #6b7b6b !important;
}

:deep(.el-input-group__append) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #fff !important;
}

/* 书籍网格 */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.book-card {
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(61, 173, 111, 0.12);
  border-color: #3dad6f;
  background: #ffffff;
}

.book-cover {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #f5f7f5;
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

.cover-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ead9e;
  background: #f5f7f5;
}

.cover-error .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a2e1a;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.book-desc {
  flex: 1;
  color: #6b7b6b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.book-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9ead9e;
  font-size: 0.85rem;
}

.stat-item .el-icon {
  font-size: 1rem;
}

.external-link-tag {
  align-self: flex-start;
}

/* 加载中 */
.loading {
  padding: 60px 0;
}

/* 无数据 */
.no-data {
  text-align: center;
  padding: 60px 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  padding-top: 40px;
  border-top: 1px solid #e8eee8;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .book-content {
    padding: 15px 10px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .book-cover {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .book-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
}
</style>