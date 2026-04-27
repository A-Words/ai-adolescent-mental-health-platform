<template>
  <div class="search-page">
    <!-- 内容区域 -->
    <div class="search-content">
      <!-- 搜索头部卡片 -->
      <div class="search-card">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文章/课程/书籍..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
            @clear="clearSearch"
          >
            <template #prepend>
              <el-select v-model="searchType" style="width: 120px;">
                <el-option label="全部" value="all" />
                <el-option label="文章" value="article" />
                <el-option label="课程" value="course" />
                <el-option label="书籍" value="book" />
              </el-select>
            </template>
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
          <el-link type="info" underline="never" @click="showAdvancedSearch = !showAdvancedSearch" class="advanced-search-btn">
            {{ showAdvancedSearch ? '收起筛选' : '高级筛选' }}
            <el-icon>
              <ArrowDown v-if="!showAdvancedSearch" />
              <ArrowUp v-else />
            </el-icon>
          </el-link>
        </div>

        <!-- 高级搜索 -->
        <div v-if="showAdvancedSearch" class="advanced-search-panel">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="filter-item">
                <div class="filter-label">分类</div>
                <el-select
                  v-model="category"
                  placeholder="选择分类"
                  clearable
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="cat in categories"
                    :key="cat.value"
                    :label="cat.label"
                    :value="cat.value"
                  />
                </el-select>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="filter-item">
                <div class="filter-label">价格</div>
                <div class="price-range">
                  <el-select
                    v-model="priceType"
                    placeholder="价格类型"
                    clearable
                    style="width: 120px; margin-right: 10px"
                  >
                    <el-option label="全部" value="" />
                    <el-option label="免费" value="free" />
                    <el-option label="付费" value="paid" />
                  </el-select>
                  <template v-if="priceType === 'paid'">
                    <el-input-number
                      v-model="minPrice"
                      :min="0"
                      :max="10000"
                      :step="100"
                      placeholder="最低价"
                      style="width: 100px; margin-right: 5px"
                    />
                    <span>至</span>
                    <el-input-number
                      v-model="maxPrice"
                      :min="0"
                      :max="10000"
                      :step="100"
                      placeholder="最高价"
                      style="width: 100px; margin-left: 5px"
                    />
                  </template>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="filter-item">
                <div class="filter-label">排序</div>
                <el-select
                  v-model="sortBy"
                  placeholder="排序方式"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="相关性" value="relevance" />
                  <el-option label="最新发布" value="time" />
                  <el-option label="最热" value="popular" />
                </el-select>
              </div>
            </el-col>
          </el-row>
          <div class="filter-actions">
            <el-button @click="resetFilters">重置筛选</el-button>
            <el-button type="primary" @click="applyFilters">应用筛选</el-button>
          </div>
        </div>
      </div>

      <!-- 热门搜索 & 搜索历史 -->
      <div class="side-by-side-cards" v-if="!searchKeyword">
        <!-- 搜索历史 -->
        <div class="glass-card history-card" v-if="searchHistory.length > 0">
          <div class="card-header">
            <span class="card-title">
              <el-icon><Clock /></el-icon>
              搜索历史
            </span>
            <el-link type="info" underline="never" @click="clearHistory" size="small" class="clear-btn">
              清空历史
            </el-link>
          </div>
          <div class="history-tags">
            <el-tag
              v-for="(item, index) in searchHistory"
              :key="index"
              class="history-tag"
              @click="searchByHistory(item)"
              closable
              @close="removeHistoryItem(index)"
            >
              {{ item }}
            </el-tag>
          </div>
        </div>

        <!-- 热门搜索 -->
        <div class="glass-card hot-card" v-if="hotKeywords.length > 0">
          <div class="card-header">
            <span class="card-title hot-title">
              <el-icon><Star /></el-icon>
              热门搜索
            </span>
          </div>
          <div class="hot-tags">
            <el-tag
              v-for="(keyword, index) in hotKeywords"
              :key="index"
              class="hot-tag"
              :type="index < 3 ? 'danger' : 'info'"
              @click="searchByHotKeyword(keyword)"
            >
              <span v-if="index < 3" class="hot-rank">{{ index + 1 }}</span>
              {{ keyword }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 搜索状态 -->
      <div class="search-status" v-if="searchKeyword">
        <span class="keyword">搜索关键词："{{ searchKeyword }}"</span>
        <span class="result-count">找到 <strong>{{ total }}</strong> 个结果</span>
      </div>

      <!-- 搜索结果 -->
      <div class="results-card glass-card">
        <!-- 结果筛选栏 -->
        <div class="results-filter" v-if="results.length > 0">
          <el-radio-group v-model="listView" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="article">文章</el-radio-button>
            <el-radio-button label="course">课程</el-radio-button>
            <el-radio-button label="book">书籍</el-radio-button>
          </el-radio-group>
          <el-select
            v-model="pageSize"
            placeholder="每页显示"
            size="small"
            style="width: 120px; margin-left: 20px"
          >
            <el-option label="10条/页" :value="10" />
            <el-option label="20条/页" :value="20" />
            <el-option label="50条/页" :value="50" />
          </el-select>
        </div>

        <!-- 无结果 -->
        <div v-if="!loading && results.length === 0 && searchKeyword" class="no-results">
          <el-empty description="没有找到相关结果">
            <div class="no-result-suggestions">
              <p>建议：</p>
              <ul>
                <li>尝试使用其他关键词搜索</li>
                <li>检查输入的关键词是否正确</li>
                <li>尝试搜索更通用的词汇</li>
                <li>使用高级筛选缩小搜索范围</li>
              </ul>
            </div>
          </el-empty>
        </div>

        <!-- 结果列表 -->
        <div v-else-if="filteredResults.length > 0" class="result-items">
          <div
            v-for="item in filteredResults"
            :key="`${item.type}-${item.id}`"
            class="result-item"
            @click="goToDetail(item)"
          >
            <div class="item-type">
              <el-tag 
                :type="item.type === 'article' ? 'success' : item.type === 'course' ? 'primary' : 'warning'" 
                size="small"
              >
                {{ item.type === 'article' ? '文章' : item.type === 'course' ? '课程' : '书籍' }}
              </el-tag>
              <el-tag v-if="item.type === 'article' && item.articleType === 'user'" type="warning" size="small" class="user-article-tag">
                用户
              </el-tag>
            </div>
            <div class="item-content">
              <div class="item-header">
                <h3 class="item-title">{{ item.title }}</h3>
                <div class="item-meta">
                  <span v-if="item.author" class="item-author">
                    <el-icon><User /></el-icon>
                    {{ item.author }}
                  </span>
                  <span v-if="item.createTime" class="item-time">
                    <el-icon><Clock /></el-icon>
                    {{ formatTime(item.createTime) }}
                  </span>
                  <span v-if="item.viewCount !== undefined" class="item-views">
                    <el-icon><View /></el-icon>
                    {{ formatCount(item.viewCount) }}
                  </span>
                  <span v-if="item.likeCount !== undefined" class="item-likes">
                    <el-icon><Star /></el-icon>
                    {{ formatCount(item.likeCount) }}
                  </span>
                  <span v-if="item.type === 'book' && item.commentCount !== undefined" class="item-comments">
                    <el-icon><ChatDotRound /></el-icon>
                    {{ formatCount(item.commentCount) }}
                  </span>
                </div>
              </div>
              <p class="item-desc">{{ truncateText(item.description || '', 120) }}</p>
              <div class="item-footer">
                <div v-if="item.tags && item.tags.length > 0" class="item-tags">
                  <el-tag
                    v-for="tag in item.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    class="tag"
                  >
                    {{ tag }}
                  </el-tag>
                  <span v-if="item.tags.length > 3" class="more-tags">+{{ item.tags.length - 3 }}</span>
                </div>
                <div v-if="item.type === 'course' || item.type === 'book'" class="extra-info">
                  <template v-if="item.type === 'course'">
                    <el-tag v-if="item.isFree" type="success" size="small">免费</el-tag>
                    <el-tag v-else type="warning" size="small">￥{{ item.price }}</el-tag>
                    <span v-if="item.duration" class="duration">{{ item.duration }}分钟</span>
                  </template>
                  <template v-if="item.type === 'book'">
                    <el-tag v-if="item.address" type="success" size="small" class="read-link">
                      可在线阅读
                    </el-tag>
                  </template>
                </div>
              </div>
            </div>
            <div v-if="item.coverImage" class="item-cover">
              <el-image
                :src="item.coverImage"
                :alt="item.title"
                fit="cover"
                class="cover-image"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="loading">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, ArrowDown, ArrowUp, Clock, Star, User, View, Picture, ChatDotRound } from '@element-plus/icons-vue'
import { searchContent, getHotKeywords, getSearchHistory, clearSearchHistory, saveSearchHistory, type SearchResultItem, type SearchParams, type SearchResponse } from '@/api/search'
import { getBookList } from '@/api/book'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

// 搜索参数
const searchKeyword = ref('')
const searchType = ref('all')
const pageNum = ref(1)
const pageSize = ref(10)
const sortBy = ref<SearchParams['sortBy']>('relevance')
const category = ref('')
const priceType = ref('')
const minPrice = ref<number | undefined>()
const maxPrice = ref<number | undefined>()

// 高级搜索
const showAdvancedSearch = ref(false)

// 搜索结果
const results = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

// 搜索历史
const searchHistory = ref<string[]>([])

// 热门搜索
const hotKeywords = ref<string[]>([])

// 视图控制
const listView = ref('all')

// 分类选项
const categories = [
  { label: '情绪管理', value: 'emotion' },
  { label: '学习压力', value: 'study' },
  { label: '人际关系', value: 'relationship' },
  { label: '自我认知', value: 'self' },
  { label: '家庭关系', value: 'family' },
  { label: '职业规划', value: 'career' }
]

// 工具函数
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
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

// 过滤后的结果
const filteredResults = computed(() => {
  if (listView.value === 'all') {
    return results.value
  }
  return results.value.filter(item => item.type === listView.value)
})

// 初始化搜索
const initSearch = () => {
  const keyword = route.query.keyword as string
  if (keyword) {
    searchKeyword.value = keyword
    performSearch()
  }
  loadHotKeywords()
  loadSearchHistory()
}

// 执行搜索
const performSearch = async () => {
  if (!searchKeyword.value.trim()) {
    return
  }

  loading.value = true
  try {
    // 根据搜索类型决定调用哪些接口
    const searchPromises = []
    
    if (searchType.value === 'all' || searchType.value === 'article' || searchType.value === 'course') {
      const params: SearchParams = {
        keyword: searchKeyword.value.trim(),
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        sortBy: sortBy.value,
        category: category.value,
        tags: [],
        minPrice: priceType.value === 'paid' ? minPrice.value : undefined,
        maxPrice: priceType.value === 'paid' ? maxPrice.value : undefined,
        isFree: priceType.value === 'free' ? true : undefined
      }

      if (searchType.value !== 'all') {
        params.type = searchType.value as 'article' | 'course'
      }

      searchPromises.push(searchContent(params))
    }
    
    if (searchType.value === 'all' || searchType.value === 'book') {
      const bookParams = {
        keyword: searchKeyword.value.trim(),
        page: pageNum.value,
        size: pageSize.value
      }
      searchPromises.push(getBookList(bookParams))
    }
    
    const responses = await Promise.all(searchPromises)
    
    // 处理搜索结果
    const allResults: any[] = []
    let totalCount = 0
    
    responses.forEach((res: any, index) => {
      if (res.code === 200) {
        if (index === 0 && (searchType.value === 'all' || searchType.value === 'article' || searchType.value === 'course')) {
          // 处理文章和课程结果
          const searchRes = res as SearchResponse
          const items = searchRes.data?.data || []
          items.forEach((item: SearchResultItem) => {
            allResults.push({
              id: item.id,
              type: item.type,
              title: item.title,
              description: item.description,
              coverImage: item.coverImage,
              author: item.author,
              createTime: item.createTime,
              viewCount: item.viewCount,
              likeCount: item.likeCount,
              tags: item.tags,
              price: item.price,
              isFree: item.isFree,
              duration: item.duration,
              articleType: item.articleType,
              userId: item.userId
            })
          })
          totalCount += searchRes.data?.total || 0
        } else if (index === 1 || (searchType.value === 'book' && index === 0)) {
          // 处理书籍结果
          const bookData = res.data
          if (bookData.records && Array.isArray(bookData.records)) {
            bookData.records.forEach((book: any) => {
              allResults.push({
                id: book.id,
                type: 'book',
                title: book.title,
                description: book.description,
                coverImage: book.coverUrl,
                createTime: book.createTime,
                viewCount: book.viewCount,
                commentCount: book.commentCount,
                address: book.address,
                tags: book.tags || []
              })
            })
            totalCount += bookData.total || 0
          }
        }
      }
    })
    
    // 根据排序方式排序
    if (sortBy.value === 'time') {
      allResults.sort((a, b) => {
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      })
    } else if (sortBy.value === 'popular') {
      allResults.sort((a, b) => {
        const aViews = a.viewCount || 0
        const bViews = b.viewCount || 0
        return bViews - aViews
      })
    }
    
    results.value = allResults
    total.value = totalCount

    if (searchKeyword.value.trim()) {
      await saveSearchHistory(searchKeyword.value.trim())
      loadSearchHistory()
    }
  } catch (error) {
    console.error('搜索出错:', error)
    ElMessage.error('搜索失败，请稍后重试')
    results.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pageNum.value = 1
  updateUrlAndSearch()
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  results.value = []
  total.value = 0
  router.push('/search')
}

// 应用筛选
const applyFilters = () => {
  pageNum.value = 1
  updateUrlAndSearch()
}

// 重置筛选
const resetFilters = () => {
  searchType.value = 'all'
  category.value = ''
  priceType.value = ''
  minPrice.value = undefined
  maxPrice.value = undefined
  sortBy.value = 'relevance'
  showAdvancedSearch.value = false
  pageNum.value = 1
  updateUrlAndSearch()
}

// 更新URL并搜索
const updateUrlAndSearch = () => {
  const query: any = { keyword: searchKeyword.value }
  if (searchType.value !== 'all') query.type = searchType.value
  if (category.value) query.category = category.value
  if (sortBy.value !== 'relevance') query.sortBy = sortBy.value

  router.push({
    path: '/search',
    query
  })

  if (searchKeyword.value.trim()) {
    performSearch()
  }
}

// 加载热门关键词
const loadHotKeywords = async () => {
  try {
    const res = await getHotKeywords() as unknown as { code: number; message: string; data: string[] }
    if (res.code === 200) {
      hotKeywords.value = res.data || []
    }
  } catch (error) {
    console.error('加载热门关键词失败:', error)
  }
}

// 加载搜索历史
const loadSearchHistory = async () => {
  try {
    const res = await getSearchHistory() as unknown as { code: number; message: string; data: string[] }
    if (res.code === 200) {
      searchHistory.value = res.data || []
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 清空搜索历史
const clearHistory = async () => {
  try {
    await clearSearchHistory()
    searchHistory.value = []
    ElMessage.success('搜索历史已清空')
  } catch (error) {
    console.error('清空搜索历史失败:', error)
    ElMessage.error('清空历史失败')
  }
}

// 通过历史搜索
const searchByHistory = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 通过热门关键词搜索
const searchByHotKeyword = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 删除单个历史项
const removeHistoryItem = (index: number) => {
  searchHistory.value.splice(index, 1)
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
  performSearch()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  pageNum.value = page
  performSearch()
}

// 跳转到详情页
const goToDetail = (item: any) => {
  if (item.type === 'article') {
    // 根据 articleType 决定跳转路径
    if (item.articleType === 'user' && item.userId) {
      router.push(`/user-article/${item.userId}/${item.id}`)
    } else {
      router.push(`/article/${item.id}`)
    }
  } else if (item.type === 'course') {
    router.push(`/course/${item.id}`)
  } else if (item.type === 'book') {
    router.push(`/book/${item.id}`)
  }
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD')
}

// 监听路由变化
watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword !== searchKeyword.value) {
    searchKeyword.value = newKeyword as string || ''
    if (newKeyword) {
      performSearch()
    }
  }
})

onMounted(() => {
  initSearch()
})
</script>

<style scoped>
.search-page {
  position: relative;
  min-height: calc(100vh - 60px);
  overflow-x: hidden;
  background: #f5f7f5;
}

/* 内容区域 */
.search-content {
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
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
  padding: 24px;
}

/* 搜索卡片 */
.search-card {
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
  padding: 30px;
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 20px;
}

/* 输入框样式覆盖 */
:deep(.el-input-group__prepend) {
  background: #f5f7f5 !important;
  border-color: #e8eee8 !important;
  color: #1a2e1a !important;
}

:deep(.el-input-group__append) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
  padding: 0 20px;
}

:deep(.el-input__wrapper) {
  background: #ffffff !important;
  border-color: #e8eee8 !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #1a2e1a !important;
}

:deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
}

:deep(.el-select .el-input__wrapper) {
  background: #ffffff !important;
}

.advanced-search-btn {
  margin-top: 10px;
  color: #6b7b6b !important;
  font-size: 13px;
}

.advanced-search-btn:hover {
  color: #3dad6f !important;
}

/* 高级搜索面板 */
.advanced-search-panel {
  margin-top: 20px;
  padding: 20px;
  background: rgba(61, 173, 111, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(61, 173, 111, 0.08);
}

.filter-item {
  margin-bottom: 15px;
}

.filter-label {
  font-size: 13px;
  color: #6b7b6b;
  margin-bottom: 8px;
  font-weight: 500;
}

.price-range {
  display: flex;
  align-items: center;
}

.price-range span {
  margin: 0 10px;
  color: #6b7b6b;
  font-size: 13px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(61, 173, 111, 0.08);
}

/* 侧边并排布局 */
.side-by-side-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.history-card {
  flex: 1;
  min-width: 0;
}

.hot-card {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a2e1a;
  font-weight: 500;
  font-size: 15px;
}

.hot-title {
  color: #FFB347;
}

.clear-btn {
  color: #9ead9e !important;
  font-size: 12px;
}

.clear-btn:hover {
  color: #3dad6f !important;
}

/* 历史标签 */
.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.history-tag {
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(61, 173, 111, 0.08) !important;
  border-color: #e8eee8 !important;
  color: #6b7b6b !important;
}

.history-tag:hover {
  background: rgba(61, 173, 111, 0.2) !important;
  border-color: rgba(61, 173, 111, 0.5) !important;
  transform: translateY(-2px);
}

/* 热门标签 */
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.hot-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
}

.hot-rank {
  margin-right: 4px;
  font-weight: bold;
}

:deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.3) !important;
  border-color: rgba(245, 108, 108, 0.5) !important;
  color: #FF8C9A !important;
}

:deep(.el-tag--info) {
  background: rgba(61, 173, 111, 0.08) !important;
  border-color: #e8eee8 !important;
  color: #6b7b6b !important;
}

/* 搜索状态 */
.search-status {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
}

.search-status .keyword {
  font-size: 16px;
  color: #1a2e1a;
  font-weight: 500;
  margin-right: 20px;
}

.search-status .result-count {
  font-size: 14px;
  color: #6b7b6b;
  background: rgba(61, 173, 111, 0.08);
  padding: 4px 12px;
  border-radius: 20px;
}

.search-status .result-count strong {
  color: #3dad6f;
}

/* 结果卡片 */
.results-card {
  margin-bottom: 20px;
}

.results-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8eee8;
}

/* 单选按钮组样式 */
:deep(.el-radio-button__inner) {
  background: #f5f7f5 !important;
  border-color: #e8eee8 !important;
  color: #6b7b6b !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
}

:deep(.el-select .el-input__wrapper) {
  background: #ffffff !important;
  border-color: #e8eee8 !important;
  box-shadow: none !important;
}

/* 无结果 */
.no-results {
  text-align: center;
  padding: 60px 0;
}

.no-result-suggestions {
  margin-top: 20px;
  text-align: left;
  display: inline-block;
  background: #f5f7f5;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
}

.no-result-suggestions p {
  color: #6b7b6b !important;
  font-weight: 500;
  margin-bottom: 10px;
}

.no-result-suggestions ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
  color: #6b7b6b;
  line-height: 1.8;
}

.no-result-suggestions li {
  margin-bottom: 5px;
}

/* 空状态文字 */
:deep(.el-empty__description) {
  color: #9ead9e !important;
}

/* 结果项 */
.result-items {
  margin-top: 20px;
}

.result-item {
  display: flex;
  padding: 20px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e8eee8;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
  border-color: #3dad6f;
  background: #ffffff;
}

.item-type {
  margin-right: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  margin-bottom: 10px;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2e1a;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #9ead9e;
  font-size: 13px;
  flex-wrap: wrap;
}

.item-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-desc {
  color: #6b7b6b;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.item-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.item-tags .tag {
  background: rgba(61, 173, 111, 0.15) !important;
  border-color: rgba(61, 173, 111, 0.3) !important;
  color: #3dad6f !important;
}

.more-tags {
  color: #9ead9e;
  font-size: 12px;
  margin-left: 5px;
}

.extra-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.extra-info .duration {
  color: #6b7b6b;
  font-size: 13px;
}

.read-link {
  background: rgba(103, 194, 58, 0.2) !important;
  border-color: rgba(103, 194, 58, 0.4) !important;
  color: #A8E063 !important;
}

.user-article-tag {
  background: rgba(230, 162, 60, 0.2) !important;
  border-color: rgba(230, 162, 60, 0.4) !important;
  color: #FFB347 !important;
  margin-left: 4px;
}

:deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.2) !important;
  border-color: rgba(103, 194, 58, 0.4) !important;
  color: #A8E063 !important;
}

:deep(.el-tag--primary) {
  background: rgba(61, 173, 111, 0.2) !important;
  border-color: rgba(61, 173, 111, 0.4) !important;
  color: #3dad6f !important;
}

:deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.2) !important;
  border-color: rgba(230, 162, 60, 0.4) !important;
  color: #FFB347 !important;
}

.item-cover {
  width: 120px;
  height: 80px;
  margin-left: 20px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7f5;
  color: #9ead9e;
}

/* 加载中 */
.loading {
  padding: 40px 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(61, 173, 111, 0.08);
}

:deep(.el-pagination) {
  color: #6b7b6b !important;
}

:deep(.el-pagination button),
:deep(.el-pager li) {
  background: rgba(61, 173, 111, 0.08) !important;
  color: #6b7b6b !important;
}

:deep(.el-pager li.is-active) {
  background: rgba(61, 173, 111, 0.4) !important;
}

:deep(.el-pagination .el-pagination__total) {
  color: #9ead9e !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-content {
    padding: 15px 10px;
  }

  .side-by-side-cards {
    flex-direction: column;
  }

  .search-card,
  .glass-card {
    padding: 15px;
  }

  .result-item {
    flex-direction: column;
  }

  .item-cover {
    width: 100%;
    height: 150px;
    margin-left: 0;
    margin-top: 15px;
  }

  .item-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .advanced-search-panel .el-col {
    margin-bottom: 15px;
  }

  .price-range {
    flex-wrap: wrap;
  }

  .price-range span {
    margin: 10px 0;
    width: 100%;
    text-align: center;
  }
  
  .item-meta {
    gap: 10px;
  }
}
</style>