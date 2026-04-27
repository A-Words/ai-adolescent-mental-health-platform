<template>
  <div class="user-home-container">
    <el-card v-if="userInfo">
      <!-- 用户信息头部 -->
      <div class="user-header">
        <el-avatar :size="80" :src="userInfo.headPath">
          <template #default>
            <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
          </template>
        </el-avatar>
        <div class="user-meta">
          <div class="nickname">{{ userInfo.nickname }}</div>
          <div class="signature" v-if="userInfo.signature">{{ userInfo.signature }}</div>
          <div class="stats-row">
            <span class="stat-item" :class="{ 'can-click': canViewFollowings }" @click="viewFollowings">
              <strong>{{ userInfo.stats?.followCount || 0 }}</strong> 关注
            </span>
            <span class="stat-item" :class="{ 'can-click': canViewFans }" @click="viewFollowers">
              <strong>{{ userInfo.stats?.fanCount || 0 }}</strong> 粉丝
            </span>
            <span class="stat-item">
              <strong>{{ userInfo.stats?.articleCount || 0 }}</strong> 文章
            </span>
            <span class="stat-item">
              <strong>{{ userInfo.stats?.likeCount || 0 }}</strong> 获赞
            </span>
          </div>
        </div>
        <div class="user-actions" v-if="!isOwn">
          <el-button v-if="userInfo.isFollowing" type="info" @click="handleUnfollow">已关注</el-button>
          <el-button v-else type="primary" @click="handleFollow">关注</el-button>
        </div>
      </div>
      
      <!-- 内容标签页 -->
      <el-tabs v-model="activeTab" class="content-tabs">
        <el-tab-pane label="文章" name="articles">
          <div class="content-list" v-loading="loading">
            <el-empty v-if="!loading && articles.length === 0" description="暂无文章"></el-empty>
            
            <div v-for="article in articles" :key="article.id" class="article-item" @click="viewArticle(article.id, article.userId)">
              <div class="article-cover" v-if="article.coverUrl">
                <img :src="article.coverUrl" alt="封面" />
              </div>
              <div class="article-info">
                <div class="article-title">{{ article.title }}</div>
                <div class="article-meta">
                  <span class="tag" v-if="article.tagName">{{ article.tagName }}</span>
                  <span class="time">{{ article.createTime }}</span>
                  <span class="stats">
                    <span><el-icon><View /></el-icon> {{ article.viewCount || 0 }}</span>
                    <span><el-icon><Pointer /></el-icon> {{ article.likeCount || 0 }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane v-if="canViewLikes" label="点赞" name="likes">
          <div class="content-list" v-loading="loading">
            <el-empty v-if="!loading && likes.length === 0" description="暂无点赞"></el-empty>
            
            <div v-for="item in likes" :key="item.articleId" class="article-item" @click="viewArticle(item.articleId, item.authorId || targetUserId, item.source)">
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
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane v-if="canViewCollections" label="收藏" name="collections">
          <div class="content-list" v-loading="loading">
            <el-empty description="暂无收藏"></el-empty>
          </div>
        </el-tab-pane>
      </el-tabs>
      
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
    
    <el-empty v-else description="加载中..."></el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Pointer } from '@element-plus/icons-vue'
import { getUserHome, getUserArticles, getUserLikes, type UserHomeVO, type ArticleInteractionVO } from '@/api/userHome'
import { type UserArticleVO } from '@/api/userArticle'
import { followUser, unfollowUser } from '@/api/follow'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const userInfo = ref<UserHomeVO | null>(null)
const articles = ref<UserArticleVO[]>([])
const likes = ref<ArticleInteractionVO[]>([])
const activeTab = ref('articles')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
const targetUserId = computed(() => Number(route.params.userId))
const isOwn = computed(() => currentUserId === targetUserId.value)

const canViewLikes = computed(() => {
  if (isOwn.value) return true
  return userInfo.value?.privacy?.allowViewLikes !== false
})

const canViewCollections = computed(() => {
  if (isOwn.value) return true
  return userInfo.value?.privacy?.allowViewCollections !== false
})

const canViewFollowings = computed(() => {
  if (isOwn.value) return true
  return userInfo.value?.privacy?.allowViewFollowings !== false
})

const canViewFans = computed(() => {
  if (isOwn.value) return true
  return userInfo.value?.privacy?.allowViewFans !== false
})

const fetchUserHome = async () => {
  try {
    const res = await getUserHome(targetUserId.value)
    if (res.code === 200) {
      userInfo.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await getUserArticles(targetUserId.value, { page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      articles.value = res.data.records
      total.value = res.data.total
    }
  } catch (error: any) {
    if (error.code !== 403) {
      ElMessage.error('获取文章列表失败')
    }
  } finally {
    loading.value = false
  }
}

const fetchLikes = async () => {
  loading.value = true
  try {
    const res = await getUserLikes(targetUserId.value, { page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      likes.value = res.data.records
      total.value = res.data.total
    }
  } catch (error: any) {
    if (error.code !== 403) {
      ElMessage.error('获取点赞列表失败')
    }
  } finally {
    loading.value = false
  }
}

const handleFollow = async () => {
  try {
    const res = await followUser(targetUserId.value)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchUserHome()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '关注失败')
  }
}

const handleUnfollow = async () => {
  try {
    const res = await unfollowUser(targetUserId.value)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchUserHome()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '取消关注失败')
  }
}

const viewFollowings = () => {
  if (!canViewFollowings.value) {
    ElMessage.warning('该用户设置了隐私，不允许查看关注列表')
    return
  }
  router.push({
    path: `/user-follow/${targetUserId.value}`,
    query: { nickname: userInfo.value?.nickname }
  })
}

const viewFollowers = () => {
  if (!canViewFans.value) {
    ElMessage.warning('该用户设置了隐私，不允许查看粉丝列表')
    return
  }
  router.push({
    path: `/user-follow/${targetUserId.value}`,
    query: { tab: 'followers', nickname: userInfo.value?.nickname }
  })
}

const viewArticle = (id: number, userId: number, source?: string) => {
  if (source === 'system') {
    router.push(`/article/${id}`)
  } else {
    router.push(`/user-article/${userId}/${id}`)
  }
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  if (activeTab.value === 'articles') {
    await fetchArticles()
  } else if (activeTab.value === 'likes') {
    await fetchLikes()
  }
}

watch([() => route.params.userId, activeTab], () => {
  if (route.params.userId) {
    fetchUserHome()
    if (activeTab.value === 'articles') {
      fetchArticles()
    } else if (activeTab.value === 'likes') {
      fetchLikes()
    }
  }
}, { immediate: true })

onMounted(() => {
  fetchUserHome()
  fetchArticles()
})
</script>

<style scoped>
.user-home-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  color: #1a2e1a;
}

/* el-card 半透明玻璃态 */
.user-home-container :deep(.el-card) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  color: #1a2e1a !important;
}
.user-home-container :deep(.el-card__body) {
  background: transparent !important;
  color: #1a2e1a !important;
}

/* el-empty 半透明 */
.user-home-container :deep(.el-empty__description) {
  color: #6b7b6b !important;
}
.user-home-container :deep(.el-empty__image svg) {
  fill: #9ead9e !important;
}

/* 用户头部 */
.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8eee8 !important;
  margin-bottom: 20px;
}
.user-meta {
  flex: 1;
}
.nickname {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1a2e1a !important;
}
.signature {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65) !important;
  margin-bottom: 15px;
}
.stats-row {
  display: flex;
  gap: 20px;
}
.stat-item {
  font-size: 14px;
  color: #6b7b6b !important;
  cursor: pointer;
}
.stat-item.can-click {
  cursor: pointer;
}
.stat-item:not(.can-click) {
  cursor: not-allowed;
  opacity: 0.7;
}
.stat-item:hover {
  color: #7EC8FF !important;
}
.stat-item:not(.can-click):hover {
  color: #6b7b6b !important;
}
.stat-item strong {
  font-size: 16px;
  margin-right: 3px;
  color: #FFE9A7 !important;
}

/* 内容标签页 */
.content-tabs {
  margin-top: 20px;
}
.user-home-container :deep(.el-tabs__header) {
  background: transparent;
}
.user-home-container :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
.user-home-container :deep(.el-tabs__item) {
  color: #6b7b6b !important;
  font-size: 15px;
}
.user-home-container :deep(.el-tabs__item:hover) {
  color: #1a2e1a !important;
}
.user-home-container :deep(.el-tabs__item.is-active) {
  color: #1a2e1a !important;
  font-weight: 700;
}
.user-home-container :deep(.el-tabs__active-bar) {
  background-color: #FFE9A7 !important;
  height: 3px;
}

/* 文章列表 */
.content-list {
  margin-top: 15px;
}
.article-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid rgba(61, 173, 111, 0.06) !important;
  cursor: pointer;
  transition: background 0.2s;
}
.article-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}
.article-cover {
  width: 100px;
  height: 70px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(61, 173, 111, 0.06);
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
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 标签语义色 */
.tag {
  background: rgba(61, 173, 111, 0.2) !important;
  color: #7EC8FF !important;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
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
}

/* 作者名 */
.author {
  color: #B8D4FF !important;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  justify-content: center;
}
.user-home-container :deep(.el-pagination) {
  color: #1a2e1a !important;
}
.user-home-container :deep(.el-pagination button),
.user-home-container :deep(.el-pager li) {
  background: rgba(61, 173, 111, 0.06) !important;
  color: #1a2e1a !important;
}
.user-home-container :deep(.el-pager li.is-active) {
  background: rgba(61, 173, 111, 0.4) !important;
}

/* el-button 半透明适配 */
.user-home-container :deep(.el-button--primary) {
  background: rgba(61, 173, 111, 0.6) !important;
  border-color: rgba(61, 173, 111, 0.6) !important;
  color: #1a2e1a !important;
}
.user-home-container :deep(.el-button--primary:hover) {
  background: rgba(61, 173, 111, 0.8) !important;
  border-color: rgba(61, 173, 111, 0.8) !important;
}
.user-home-container :deep(.el-button--info) {
  background: rgba(144, 147, 153, 0.4) !important;
  border-color: rgba(144, 147, 153, 0.4) !important;
  color: rgba(255, 255, 255, 0.85) !important;
}
.user-home-container :deep(.el-button--info:hover) {
  background: rgba(144, 147, 153, 0.6) !important;
  border-color: rgba(144, 147, 153, 0.6) !important;
}
</style>
