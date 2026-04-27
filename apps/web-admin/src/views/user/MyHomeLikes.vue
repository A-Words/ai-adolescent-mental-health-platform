<template>
  <div class="my-home-likes">
    <h2>我的点赞</h2>

    <div class="content-list" v-loading="loading">
      <el-empty v-if="!loading && likes.length === 0" description="暂无点赞"></el-empty>

      <div v-for="item in likes" :key="item.articleId" class="article-item" @click="viewArticle(item)">
        <div class="article-cover" v-if="item.coverUrl">
          <img :src="item.coverUrl" alt="封面" />
        </div>
        <div class="article-info">
          <div class="article-title">{{ item.articleTitle }}</div>
          <div class="article-meta">
            <span class="author">{{ item.authorNickname }}</span>
            <span class="time">{{ item.createTime }}</span>
          </div>
        </div>
        <el-button size="small" type="info" @click.stop="cancelLike(item)">取消点赞</el-button>
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
import { ElMessage } from 'element-plus'
import { getMyLikes } from '@/api/userHome'
import { interactArticle } from '@/api/content'
import { interactUserArticle } from '@/api/userArticle'

const router = useRouter()
const loading = ref(false)
const likes = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const fetchLikes = async () => {
  loading.value = true
  try {
    const res = await getMyLikes({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      likes.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取点赞列表失败')
  } finally {
    loading.value = false
  }
}

const viewArticle = (item: any) => {
  // 根据来源决定跳转路径
  if (item.source === 'admin') {
    // 管理员文章（包括医生管理员和医院管理员发布的），跳转到 /article/{id}
    router.push(`/article/${item.articleId}`)
  } else {
    // 用户文章，跳转到 /user-article/{authorId}/{articleId}
    if (item.authorId) {
      router.push(`/user-article/${item.authorId}/${item.articleId}`)
    } else {
      ElMessage.error('无法访问该文章')
    }
  }
}

const cancelLike = async (item: any) => {
  try {
    let res
    if (item.source === 'admin') {
      // 管理员文章
      res = await interactArticle(item.articleId, 1) as any
    } else {
      // 用户文章
      res = await interactUserArticle(item.articleId, 1) as any
    }
    if (res.code === 200) {
      ElMessage.success('已取消点赞')
      fetchLikes()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchLikes()
}

onMounted(() => {
  fetchLikes()
})
</script>

<style scoped>
.my-home-likes h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #1a2e1a !important;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  cursor: pointer;
  transition: background 0.2s;
}
.article-item:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.article-cover {
  width: 80px;
  height: 60px;
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

.article-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1a2e1a !important;
}

.article-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55) !important;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
