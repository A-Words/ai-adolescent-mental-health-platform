<template>
  <div class="my-home-articles">
    <div class="page-header">
      <h2>我的发布</h2>
      <el-button type="primary" @click="$router.push('/publish-article')">发布文章</el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="待审核" name="0"></el-tab-pane>
      <el-tab-pane label="已发布" name="1"></el-tab-pane>
      <el-tab-pane label="已下架" name="2"></el-tab-pane>
    </el-tabs>
    
    <div class="article-list" v-loading="loading">
      <el-empty v-if="!loading && articles.length === 0" description="暂无文章"></el-empty>
      
      <div v-for="article in articles" :key="article.id" class="article-item">
        <div class="article-cover" v-if="article.coverUrl">
          <img :src="article.coverUrl" alt="封面" />
        </div>
        <div class="article-info">
          <div class="article-header">
            <h3 class="article-title">{{ article.title }}</h3>
            <el-tag :type="getStatusType(article.status)" size="small">
              {{ getStatusText(article.status) }}
            </el-tag>
          </div>
          
          <div class="article-meta">
            <span class="tag-name" v-if="article.tagName">{{ article.tagName }}</span>
            <span class="time">{{ article.createTime }}</span>
            <span class="stats">
              <span><el-icon><View /></el-icon> {{ article.viewCount || 0 }}</span>
              <span><el-icon><Pointer /></el-icon> {{ article.likeCount || 0 }}</span>
              <span><el-icon><ChatDotRound /></el-icon> {{ article.commentCount || 0 }}</span>
            </span>
          </div>
          
          <div class="reject-reason" v-if="article.rejectReason && article.status === 2">
            <el-alert type="warning" :closable="false">
              <template #title>
                <span>下架原因：{{ article.rejectReason }}</span>
              </template>
            </el-alert>
          </div>
          
          <div class="article-actions">
            <el-button size="small" @click="viewArticle(article.id)">查看</el-button>
            <el-button size="small" v-if="article.status === 0" @click="withdrawArticle(article.id)">撤回</el-button>
            <el-button size="small" v-if="article.status === 1" type="danger" @click="deleteArticle(article.id)">删除</el-button>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Pointer, ChatDotRound } from '@element-plus/icons-vue'
import { getMyArticles, withdrawArticle as withdrawApi, deleteMyArticle as deleteApi, type UserArticleVO } from '@/api/userArticle'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('all')
const articles = ref<UserArticleVO[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getStatusText = (status: number) => {
  const map: Record<number, string> = { 0: '待审核', 1: '已发布', 2: '已下架' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await getMyArticles({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      let data = res.data.records
        if (activeTab.value !== 'all') {
          data = data.filter((a: UserArticleVO) => a.status === Number(activeTab.value))
        }
      articles.value = data
      total.value = activeTab.value === 'all' ? res.data.total : data.length
    }
  } catch (error) {
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  currentPage.value = 1
  fetchArticles()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchArticles()
}

const viewArticle = (id: number) => {
  router.push(`/user-article/${id}`)
}

const withdrawArticle = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要撤回这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await withdrawApi(id)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchArticles()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '撤回失败')
    }
  }
}

const deleteArticle = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteApi(id)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchArticles()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.my-home-articles {
  padding: 0 10px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1a2e1a !important;
}

.article-list {
  margin-top: 15px;
}

.article-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: background 0.2s;
}
.article-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}
.article-item:last-child {
  border-bottom: none;
}

.article-cover {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}
.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.article-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #1a2e1a !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55) !important;
  margin-bottom: 8px;
}

.tag-name {
  background: rgba(61, 173, 111, 0.2) !important;
  color: #3dad6f !important;
  padding: 1px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.reject-reason {
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.75) !important;
  font-size: 13px;
}

.stats {
  display: flex;
  gap: 10px;
}
.stats span {
  display: flex;
  align-items: center;
  gap: 3px;
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 13px;
}

.article-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
