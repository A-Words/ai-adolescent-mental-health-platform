<template>
  <div class="user-article-page-wrapper" v-if="article">
    <!-- 左侧目录导航 -->
    <div class="left-sidebar" :class="{ 'collapsed': !showCatalog }">
      <div class="sidebar-toggle" @click="showCatalog = !showCatalog">
        <el-icon><Menu /></el-icon>
        <span>目录</span>
      </div>
      <div class="catalog-content" v-show="showCatalog">
        <div 
          v-for="title in catalog" 
          :key="title.id" 
          :class="['catalog-item', `level-${title.level}`]"
          @click="scrollToAnchor(title.id)"
        >
          {{ title.text }}
        </div>
        <el-empty v-if="catalog.length === 0" description="无目录" :image-size="40"></el-empty>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content-container">
      <div class="back-bar">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回文章列表
        </el-button>
      </div>

      <div class="article-card">
        <h1>{{ article.title }}</h1>

        <!-- 作者信息栏 -->
        <div class="author-info-bar" @click="goToAuthorHome">
          <el-avatar :size="48" :src="article.userAvatar">
            <template #default>
              <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
            </template>
          </el-avatar>
          <div class="author-meta">
            <div class="author-top">
              <span class="author-nickname">{{ article.userNickname }}</span>
              <el-tag v-if="!isOwn" size="small" type="primary" @click.stop="handleFollow">
                {{ isFollowing ? '已关注' : '关注' }}
              </el-tag>
            </div>
            <div class="article-meta-info">
              <span>发布时间：{{ article.createTime }}</span>
              <span v-if="article.tagName" class="tag-name">{{ article.tagName }}</span>
            </div>
          </div>
        </div>

        <!-- 封面图 -->
        <div v-if="article.coverUrl" class="cover-image">
          <img :src="article.coverUrl" alt="封面" />
        </div>

        <!-- 文章内容 -->
        <div class="article-content">
          <v-md-editor :model-value="article.content || ''" mode="preview" @click="handleContentClick"></v-md-editor>
        </div>
      </div>

      <!-- 底部互动栏（固定在视窗底部） -->
      <div class="fixed-interaction-bar">
        <div class="bar-content">
          <div class="action-item" :class="{ 'active': article.liked }" @click="handleLike">
            <el-icon><Pointer /></el-icon>
            <span>{{ article.likeCount || 0 }} 点赞</span>
          </div>
          <div class="action-item" :class="{ 'active': article.disliked }" @click="handleDislike">
            <el-icon><Bottom /></el-icon>
            <span>{{ article.dislikeCount || 0 }} 踩</span>
          </div>
          <div class="action-item" :class="{ 'active': article.collected }" @click="handleCollect">
            <el-icon><Star /></el-icon>
            <span>{{ article.collectionCount || 0 }} 收藏</span>
          </div>
          <div class="action-item" @click="openComments">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ article.commentCount || 0 }} 评论</span>
          </div>
          <div class="action-item" @click="copyLink">
            <el-icon><Share /></el-icon>
            <span>分享</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮按钮组（仅保留返回顶部） -->
    <div class="floating-btns">
      <el-backtop :right="40" :bottom="160">
        <div class="fab-container">
          <div class="fab-btn-inner">
            <el-icon class="icon"><CaretTop /></el-icon>
            <span class="text">返回顶部</span>
          </div>
        </div>
      </el-backtop>
    </div>

    <!-- 右侧推荐栏 -->
    <div class="right-sidebar">
      <div class="sidebar-section">
        <h3>推荐文章</h3>
        <div v-for="item in recommendedArticles" :key="item.id" class="recommend-item" @click="goToArticle(item)">
          {{ item.title }}
        </div>
        <el-empty v-if="recommendedArticles.length === 0" description="暂无推荐" :image-size="40"></el-empty>
      </div>
      <div class="sidebar-section">
        <h3>热门课程</h3>
        <div v-for="item in recommendedCourses" :key="item.id" class="recommend-item" @click="goToCourse(item)">
          {{ item.title }}
        </div>
        <el-empty v-if="recommendedCourses.length === 0" description="暂无课程" :image-size="40"></el-empty>
      </div>
      <div class="sidebar-section">
        <h3>心理测评</h3>
        <div v-for="item in recommendedAssessments" :key="item.id" class="recommend-item" @click="goToAssessment(item)">
          {{ item.title }}
        </div>
        <el-empty v-if="recommendedAssessments.length === 0" description="暂无测评" :image-size="40"></el-empty>
      </div>
    </div>

    <!-- 评论区 -->
    <el-drawer v-model="showComments" title="全部评论" size="450px" direction="rtl">
      <div class="comment-section">
        <div class="comment-input-box">
          <div class="input-with-avatar">
            <el-avatar :size="32" :src="user.headPath"></el-avatar>
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="欢迎发表评论..."
              maxlength="1000"
              show-word-limit
            ></el-input>
          </div>
          <div class="input-footer">
            <el-button type="primary" size="small" @click="submitComment">评论</el-button>
          </div>
        </div>
        <div class="comment-list">
          <el-empty v-if="comments.length === 0" description="暂无评论" :image-size="60"></el-empty>
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-user">
              <el-avatar :size="32" :src="comment.headPath"></el-avatar>
              <div class="user-info">
                <span class="nickname">{{ comment.nickname }}</span>
                <span class="time">{{ formatTime(comment.createTime) }}</span>
              </div>
              <div class="comment-actions">
                <span :class="{ 'liked': comment.isLiked }" @click="handleLikeComment(comment)">
                  <el-icon><Pointer /></el-icon> {{ comment.likeCount || 0 }}
                </span>
                <span @click="replyToComment(comment)">回复</span>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            
            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-header">
                  <span class="nickname">{{ reply.nickname }}</span>
                  <span class="reply-text">回复</span>
                  <span class="nickname">@{{ reply.replyToNickname }}</span>
                  <span class="time">{{ formatTime(reply.createTime) }}</span>
                </div>
                <div class="reply-content">{{ reply.content }}</div>
              </div>
            </div>

            <!-- 回复框 -->
            <div v-if="replyingTo === comment.id" class="reply-input-box">
              <el-input v-model="replyContent" size="small" :placeholder="'回复 @' + comment.nickname"></el-input>
              <div class="reply-buttons">
                <el-button size="small" @click="replyingTo = null; replyContent = ''">取消</el-button>
                <el-button type="primary" size="small" @click="submitReply(comment)">确定</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
  <el-empty v-else-if="loading" description="加载中..."></el-empty>
  <el-empty v-else description="文章不存在或已被下架"></el-empty>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Pointer, Bottom, Star, Share, ChatDotRound, Menu, CaretTop } from '@element-plus/icons-vue'
import { getUserArticleDetailByUser, interactUserArticle, getUserArticleComments, addUserArticleComment, likeUserArticleComment } from '@/api/userArticle'
import { followUser, unfollowUser } from '@/api/follow'
import type { UserArticleVO, UserArticleCommentVO } from '@/api/userArticle'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const article = ref<UserArticleVO | null>(null)
const showComments = ref(false)
const newComment = ref('')
const comments = ref<UserArticleCommentVO[]>([])
const isFollowing = ref(false)
const showCatalog = ref(true)
const catalog = ref<{ id: string, text: string, level: number }[]>([])
const interacting = ref(false)
const replyingTo = ref<number | null>(null)
const replyContent = ref('')

// 推荐数据
const recommendedArticles = ref<any[]>([])
const recommendedCourses = ref<any[]>([])
const recommendedAssessments = ref<any[]>([])

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const user = currentUser
const isOwn = computed(() => {
  return article.value?.userId === currentUser.id
})

const fetchArticle = async () => {
  loading.value = true
  try {
    const userIdStr = route.params.userId
    const articleIdStr = route.params.articleId

    if (!userIdStr || !articleIdStr) {
      ElMessage.error('缺少必要参数')
      return
    }

    const userId = Number(userIdStr)
    const articleId = Number(articleIdStr)

    if (isNaN(userId) || isNaN(articleId)) {
      ElMessage.error('无效的参数格式')
      return
    }

    const res = await getUserArticleDetailByUser(userId, articleId)
    if (res.code === 200) {
      article.value = res.data
      generateCatalog(res.data.content || '')
      // 设置推荐数据
      if (res.data.recommendedArticles) {
        recommendedArticles.value = res.data.recommendedArticles
      }
      if (res.data.recommendedCourses) {
        recommendedCourses.value = res.data.recommendedCourses
      }
      if (res.data.recommendedAssessments) {
        recommendedAssessments.value = res.data.recommendedAssessments
      }
    } else {
      ElMessage.error(res.message || '文章加载失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const generateCatalog = (content: string) => {
  if (!content) {
    catalog.value = []
    return
  }
  
  const lines = content.split('\n')
  const titles: { id: string, text: string, level: number }[] = []
  let inCodeBlock = false
  
  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      return
    }
    
    if (!inCodeBlock) {
      const match = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/)
      if (match) {
        const level = match[1]?.length ?? 0
        const text = match[2]?.trim() ?? ''
        const id = text.toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
          .replace(/\s+/g, '-')
        titles.push({ id, text, level })
      }
    }
  })
  catalog.value = titles
}

const scrollToAnchor = (id: string) => {
  let anchor = document.getElementById(id)
  
  if (!anchor) {
    const headers = document.querySelectorAll('.v-md-editor-preview h1, .v-md-editor-preview h2, .v-md-editor-preview h3, .v-md-editor-preview h4, .v-md-editor-preview h5, .v-md-editor-preview h6')
    for (const h of Array.from(headers)) {
      const headerText = h.textContent?.trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-')
      if (headerText === id) {
        anchor = h as HTMLElement
        break
      }
    }
  }

  if (anchor) {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleContentClick = () => {
  // 内容点击处理
}

const goBack = () => {
  router.back()
}

const goToAuthorHome = () => {
  if (article.value?.userId) {
    router.push(`/user-home/${article.value.userId}`)
  }
}

const handleFollow = async () => {
  if (!article.value?.userId) return
  try {
    if (isFollowing.value) {
      await unfollowUser(article.value.userId)
      isFollowing.value = false
      ElMessage.success('已取消关注')
    } else {
      await followUser(article.value.userId)
      isFollowing.value = true
      ElMessage.success('关注成功')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleInteract = async (type: number) => {
  if (!article.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }
  
  interacting.value = true
  try {
    const res = await interactUserArticle(article.value.id, type) as any
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchArticle()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    interacting.value = false
  }
}

const handleLike = () => handleInteract(1)
const handleDislike = () => handleInteract(2)
const handleCollect = () => handleInteract(3)

const copyLink = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

// 获取评论列表
const fetchComments = async () => {
  if (!article.value) return
  try {
    const res = await getUserArticleComments(article.value.id)
    if (res.code === 200) {
      comments.value = res.data || []
    }
  } catch (error) {
    console.error('获取评论失败', error)
  }
}

// 发表评论
const submitComment = async () => {
  if (!newComment.value.trim() || !article.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }
  
  interacting.value = true
  try {
    const res = await addUserArticleComment({
      articleId: article.value.id,
      content: newComment.value,
      parentId: 0
    })
    if (res.code === 200) {
      ElMessage.success('评论成功')
      newComment.value = ''
      fetchComments()
      fetchArticle()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '评论失败')
  } finally {
    interacting.value = false
  }
}

// 评论点赞
const handleLikeComment = async (comment: UserArticleCommentVO) => {
  if (interacting.value) return
  interacting.value = true
  try {
    const res = await likeUserArticleComment(comment.id)
    if (res.code === 200) {
      fetchComments()
    }
  } catch (error) {
    console.error('评论点赞失败', error)
  } finally {
    interacting.value = false
  }
}

// 回复评论
const replyToComment = (comment: UserArticleCommentVO) => {
  replyingTo.value = comment.id
  replyContent.value = ''
}

// 提交回复
const submitReply = async (parentComment: UserArticleCommentVO) => {
  if (!replyContent.value.trim() || !article.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }
  
  interacting.value = true
  try {
    const res = await addUserArticleComment({
      articleId: article.value.id,
      content: replyContent.value,
      parentId: parentComment.id,
      replyToUserId: parentComment.userId
    })
    if (res.code === 200) {
      ElMessage.success('回复成功')
      replyingTo.value = null
      replyContent.value = ''
      fetchComments()
      fetchArticle()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '回复失败')
  } finally {
    interacting.value = false
  }
}

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 打开评论时获取评论列表
const openComments = () => {
  showComments.value = true
  fetchComments()
}

const goToArticle = (item: any) => {
  if (item.userId) {
    router.push(`/user-article/${item.userId}/${item.id}`)
  } else {
    router.push(`/article/${item.id}`)
  }
}

const goToCourse = (item: any) => {
  router.push(`/course/${item.id}`)
}

const goToAssessment = (item: any) => {
  router.push(`/assessment/${item.id}`)
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.user-article-page-wrapper {
  display: flex;
  padding: 20px;
  gap: 20px;
  padding-bottom: 80px;
  background: #f5f7f5;
  color: #1a2e1a;
}

/* ========== Left Sidebar ========== */
.left-sidebar {
  width: 260px;
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s;
  height: calc(100vh - 120px);
  position: sticky;
  top: 20px;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
}
.left-sidebar.collapsed {
  width: 50px;
  padding: 10px;
  overflow: hidden;
}
.sidebar-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 15px;
  color: #6b7b6b !important;
  font-weight: bold;
}
.catalog-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.catalog-item {
  cursor: pointer;
  font-size: 14px;
  color: #6b7b6b !important;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.catalog-item:hover {
  background-color: #f5f7f5 !important;
  color: #3dad6f !important;
}
.catalog-item.level-1 { font-weight: bold; color: #1a2e1a !important; }
.catalog-item.level-2 { padding-left: 20px; font-size: 13px; }
.catalog-item.level-3 { padding-left: 30px; font-size: 12px; }

/* ========== Main Content ========== */
.main-content-container {
  flex: 1;
  min-width: 0;
}
.back-bar {
  margin-bottom: 15px;
}
.back-bar :deep(.el-link) {
  color: #6b7b6b !important;
}
.back-bar :deep(.el-link:hover) {
  color: #3dad6f !important;
}

/* ========== Article Card ========== */
.article-card {
  background: #ffffff !important;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #e8eee8 !important;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
  color: #1a2e1a !important;
}
.article-card h1 {
  margin-top: 0;
  font-size: 28px;
  line-height: 1.4;
  margin-bottom: 20px;
  color: #1a2e1a !important;
}

/* ========== Author Info ========== */
.author-info-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f5f7f5 !important;
  border-radius: 8px;
  margin-bottom: 25px;
  cursor: pointer;
  border: 1px solid #e8eee8 !important;
}
.author-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.author-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.author-nickname {
  font-size: 18px;
  font-weight: bold;
  color: #1a2e1a !important;
}
.article-meta-info {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #9ead9e !important;
}

/* Tag */
.tag-name {
  background: rgba(61, 173, 111, 0.1) !important;
  color: #3dad6f !important;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

/* ========== Article Content ========== */
.cover-image {
  margin-bottom: 25px;
}
.cover-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}
.article-content {
  line-height: 1.8;
  font-size: 16px;
  color: #1a2e1a !important;
}

/* v-md-editor */
.article-content :deep(.v-md-editor) {
  background: transparent !important;
  box-shadow: none !important;
}
.article-content :deep(.v-md-editor__preview-wrapper) {
  background: transparent !important;
}
.article-content :deep(.v-md-editor-preview) {
  background: transparent !important;
  color: #1a2e1a !important;
}
.article-content :deep(.github-markdown-body) {
  background: transparent !important;
  color: #1a2e1a !important;
}
.article-content :deep(.github-markdown-body p),
.article-content :deep(.github-markdown-body li),
.article-content :deep(.github-markdown-body td),
.article-content :deep(.github-markdown-body th),
.article-content :deep(.github-markdown-body dd),
.article-content :deep(.github-markdown-body dt) {
  color: #1a2e1a !important;
}
.article-content :deep(.github-markdown-body h1),
.article-content :deep(.github-markdown-body h2),
.article-content :deep(.github-markdown-body h3),
.article-content :deep(.github-markdown-body h4),
.article-content :deep(.github-markdown-body h5) {
  color: #1a2e1a !important;
  border-bottom-color: #e8eee8 !important;
}
.article-content :deep(.github-markdown-body h6) {
  color: #6b7b6b !important;
}
.article-content :deep(.github-markdown-body a) {
  color: #3dad6f !important;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.article-content :deep(.github-markdown-body a:hover) {
  color: #35a062 !important;
}
.article-content :deep(.github-markdown-body code:not(pre code)) {
  background: #f5f7f5 !important;
  color: #1a2e1a !important;
  border: 1px solid #e8eee8;
  border-radius: 4px;
}
.article-content :deep(.github-markdown-body pre) {
  background: #f5f7f5 !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 8px;
}
.article-content :deep(.github-markdown-body pre code),
.article-content :deep(.github-markdown-body pre tt) {
  color: #1a2e1a !important;
  background: transparent !important;
}
.article-content :deep(.github-markdown-body div[class*='v-md-pre-wrapper-']) {
  background: #f5f7f5 !important;
  border-radius: 8px;
  border: 1px solid #e8eee8;
}
.article-content :deep(.github-markdown-body div[class*='v-md-pre-wrapper-'].line-numbers-mode::after) {
  background: #ffffff !important;
  border-right-color: #e8eee8 !important;
}
.article-content :deep(.github-markdown-body .hljs) {
  background: transparent !important;
  color: #1a2e1a !important;
}
.article-content :deep(.github-markdown-body .hljs-comment),
.article-content :deep(.github-markdown-body .hljs-quote) {
  color: #9ead9e !important;
}
.article-content :deep(.github-markdown-body .hljs-keyword),
.article-content :deep(.github-markdown-body .hljs-selector-tag),
.article-content :deep(.github-markdown-body .hljs-subst) {
  color: #dc2626 !important;
}
.article-content :deep(.github-markdown-body .hljs-number),
.article-content :deep(.github-markdown-body .hljs-literal),
.article-content :deep(.github-markdown-body .hljs-string),
.article-content :deep(.github-markdown-body .hljs-doctag) {
  color: #3dad6f !important;
}
.article-content :deep(.github-markdown-body .hljs-title),
.article-content :deep(.github-markdown-body .hljs-section) {
  color: #7c3aed !important;
}
.article-content :deep(.github-markdown-body blockquote) {
  background: #f5f7f5 !important;
  border-left-color: #3dad6f !important;
  color: #6b7b6b !important;
}
.article-content :deep(.github-markdown-body hr) {
  background-color: #e8eee8 !important;
}
.article-content :deep(.github-markdown-body table) {
  border-color: #e8eee8 !important;
}
.article-content :deep(.github-markdown-body table th),
.article-content :deep(.github-markdown-body table td) {
  border-color: #e8eee8 !important;
}
.article-content :deep(.github-markdown-body table tr) {
  background: #ffffff !important;
  border-color: #e8eee8 !important;
}
.article-content :deep(.github-markdown-body table tr:nth-child(2n)) {
  background: #f5f7f5 !important;
}
.article-content :deep(.github-markdown-body table th) {
  background: #f5f7f5 !important;
  color: #1a2e1a !important;
}
.article-content :deep(.github-markdown-body img) {
  background: transparent !important;
}
.article-content :deep(.github-markdown-body kbd) {
  background: #f5f7f5 !important;
  color: #1a2e1a !important;
  border-color: #e8eee8 !important;
  box-shadow: none !important;
}

/* ========== Fixed Interaction Bar ========== */
.fixed-interaction-bar {
  position: sticky;
  bottom: 0;
  width: 100%;
  height: 60px;
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px;
  box-shadow: 0 -2px 12px rgba(61, 173, 111, 0.06);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  margin-top: 20px;
}
.bar-content {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: space-around;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  color: #6b7b6b !important;
  transition: all 0.2s;
  font-size: 12px;
  padding: 5px 15px;
  border-radius: 20px;
}
.action-item:hover {
  background: #f5f7f5 !important;
  color: #3dad6f !important;
}
.action-item.active {
  color: #3dad6f !important;
}

/* ========== Floating Buttons ========== */
.floating-btns {
  position: fixed;
  right: 40px;
  bottom: 160px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1001;
}
.fab-container {
  width: 48px;
  height: 48px;
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.fab-btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}
.fab-btn-inner .icon {
  font-size: 20px;
  color: #3dad6f !important;
  transition: all 0.3s;
}
.fab-btn-inner .text {
  position: absolute;
  font-size: 12px;
  color: #1a2e1a;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s;
  white-space: nowrap;
  font-weight: bold;
}
.fab-container:hover {
  width: 100px;
  border-radius: 24px;
  background: #3dad6f !important;
  border-color: #3dad6f !important;
}
.fab-container:hover .icon {
  opacity: 1;
  transform: translateX(-20px);
  color: #ffffff !important;
}
.fab-container:hover .text {
  opacity: 1;
  transform: translateX(15px);
  color: #ffffff !important;
}
:deep(.el-backtop) {
  position: static !important;
  width: auto !important;
  height: auto !important;
  background-color: transparent !important;
  box-shadow: none !important;
  display: block !important;
}

/* ========== Right Sidebar ========== */
.right-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}
.sidebar-section {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
}
.sidebar-section h3 {
  margin-top: 0;
  font-size: 16px;
  border-left: 3px solid #3dad6f !important;
  padding-left: 10px;
  margin-bottom: 15px;
  color: #1a2e1a !important;
}
.recommend-item {
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  color: #6b7b6b !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}
.recommend-item:hover {
  color: #3dad6f !important;
}

/* ========== Comments ========== */
.comment-section {
  padding: 0 20px;
  color: #1a2e1a;
}
.comment-input-box {
  margin-bottom: 30px;
}
.input-with-avatar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.input-footer {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.comment-item {
  border-bottom: 1px solid #e8eee8 !important;
  padding-bottom: 15px;
}
.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.nickname {
  font-weight: bold;
  font-size: 14px;
  color: #1a2e1a !important;
}
.time {
  font-size: 12px;
  color: #9ead9e !important;
}
.comment-content {
  padding-left: 42px;
  font-size: 14px;
  line-height: 1.5;
  color: #6b7b6b !important;
}
.comment-actions {
  font-size: 12px;
  color: #9ead9e !important;
  display: flex;
  gap: 15px;
}
.comment-actions span {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.comment-actions span.liked {
  color: #3dad6f !important;
}
.replies-list {
  margin-top: 10px;
  margin-left: 42px;
  background: #f5f7f5 !important;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e8eee8 !important;
}
.reply-item {
  margin-bottom: 8px;
}
.reply-item:last-child {
  margin-bottom: 0;
}
.reply-header {
  font-size: 12px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.reply-text {
  color: #6b7b6b !important;
}
.reply-content {
  font-size: 13px;
  padding-left: 0;
  color: #6b7b6b;
}
.reply-input-box {
  margin-top: 10px;
  margin-left: 42px;
}
.reply-buttons {
  margin-top: 5px;
  text-align: right;
}

/* ========== Input Overrides ========== */
:deep(.el-input__wrapper) {
  background: #f5f7f5 !important;
  border: 1px solid #e8eee8 !important;
  box-shadow: none !important;
  border-radius: 8px;
}
:deep(.el-input__inner) {
  color: #1a2e1a !important;
}
:deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
}
:deep(.el-textarea__inner) {
  background: #f5f7f5 !important;
  border: 1px solid #e8eee8 !important;
  color: #1a2e1a !important;
  box-shadow: none !important;
  border-radius: 8px;
}
:deep(.el-textarea__inner::placeholder) {
  color: #9ead9e !important;
}
</style>
