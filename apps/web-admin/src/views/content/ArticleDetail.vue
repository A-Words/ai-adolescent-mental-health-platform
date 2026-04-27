<template>
  <div class="article-page-wrapper" v-if="detail">
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
        <h1>{{ detail.article.title }}</h1>

        <!-- 作者信息展示 -->
        <div class="author-info-bar">
          <el-avatar :size="48" :src="detail.authorAvatar">
            <template #default>
              <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
            </template>
          </el-avatar>
          <div class="author-meta">
            <div class="author-top">
              <span class="author-nickname">{{ detail.authorName }}</span>
              <el-tag v-if="detail.authorRole === 4" size="small" type="danger" effect="dark" class="official-tag">官方</el-tag>
              <el-tag v-else-if="detail.authorRole === 3 && detail.hospitalName" size="small" type="success" effect="plain" class="hospital-tag">{{ detail.hospitalName }}</el-tag>
            </div>
            <div class="article-meta-info">
              <span>发布时间：{{ detail.article.createTime }}</span>
              <span class="type-tag">{{ detail.article.type === 'SCIENCE' ? '科普' : '案例' }}</span>
              <span class="view-stats"><el-icon><View /></el-icon> {{ detail.article.view_count || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="article-content">
          <v-md-editor :model-value="detail.article.content" mode="preview"></v-md-editor>
        </div>
      </div>

      <!-- 底部互动栏 -->
      <div class="fixed-interaction-bar">
        <div class="bar-content">
          <div class="action-item" :class="{ 'active': detail.liked }" @click="handleInteract(1)">
            <el-icon><Pointer /></el-icon>
            <span>{{ detail.article.like_count || 0 }} 点赞</span>
          </div>
          <div class="action-item" :class="{ 'active': detail.disliked }" @click="handleInteract(2)">
            <el-icon><Bottom /></el-icon>
            <span>{{ detail.article.dislike_count || 0 }} 踩</span>
          </div>
          <div class="action-item" :class="{ 'active': detail.collected }" @click="handleInteract(3)">
            <el-icon><Star /></el-icon>
            <span>{{ detail.article.collection_count || 0 }} 收藏</span>
          </div>
          <div class="action-item" @click="showComments = true">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ detail.article.comment_count || 0 }} 评论</span>
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
      <el-backtop :right="40" :bottom="160" target=".el-main">
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
        <div v-for="item in detail.recommendedArticles" :key="item.id" class="recommend-item" @click="goToArticle(item.id)">
          {{ item.title }}
        </div>
        <el-empty v-if="!detail.recommendedArticles || detail.recommendedArticles.length === 0" description="暂无推荐" :image-size="40"></el-empty>
      </div>
      <div class="sidebar-section">
        <h3>热门课程</h3>
        <div v-for="item in detail.recommendedCourses" :key="item.id" class="recommend-item" @click="goToCourse(item.id)">
          {{ item.title }}
        </div>
        <el-empty v-if="!detail.recommendedCourses || detail.recommendedCourses.length === 0" description="暂无课程" :image-size="40"></el-empty>
      </div>
      <div class="sidebar-section">
        <h3>心理测评</h3>
        <div v-for="item in detail.recommendedAssessments" :key="item.id" class="recommend-item" @click="goToAssessment(item.id)">
          {{ item.title }}
        </div>
        <el-empty v-if="!detail.recommendedAssessments || detail.recommendedAssessments.length === 0" description="暂无测评" :image-size="40"></el-empty>
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
            <div class="emoji-trigger" @click="toggleEmoji">😊</div>
            <el-button type="primary" size="small" @click="submitComment">评论</el-button>
          </div>
          <div v-if="showEmojiPicker" class="emoji-picker">
            <span v-for="e in emojis" :key="e" @click="addEmoji(e)">{{ e }}</span>
          </div>
        </div>

        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-user">
              <el-avatar :size="32" :src="comment.headPath"></el-avatar>
              <div class="user-info">
                <span class="nickname">{{ comment.nickname }}</span>
                <span class="time">{{ comment.createTime }}</span>
              </div>
              <div class="comment-actions">
                <span :class="{ 'liked': comment.liked }" @click="handleLikeComment(comment)">
                  <el-icon><Pointer /></el-icon> {{ comment.likeCount }}
                </span>
                <span @click="handleReply(comment)">回复</span>
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
                  <span class="time">{{ reply.createTime }}</span>
                </div>
                <div class="reply-content">{{ reply.content }}</div>
              </div>
            </div>

            <!-- 回复框 -->
            <div v-if="replyingId === comment.id" class="reply-input-box">
              <el-input v-model="replyContent" size="small" :placeholder="'回复 @' + comment.nickname"></el-input>
              <div class="reply-buttons">
                <el-button size="small" @click="replyingId = null">取消</el-button>
                <el-button type="primary" size="small" @click="submitReply(comment)">确定</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
  <el-empty v-else description="加载中..."></el-empty>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getArticleDetail,
  interactArticle,
  getArticleComments,
  addArticleComment,
  likeArticleComment,
  type ArticleDetailVO,
  type ArticleCommentVO
} from '@/api/content'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, View, Pointer, Star, Share,
  ChatDotRound, Bottom, Menu, CaretTop
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const detail = ref<ArticleDetailVO | null>(null)
const comments = ref<ArticleCommentVO[]>([])
const catalog = ref<{ id: string, text: string, level: number }[]>([])
const showCatalog = ref(true)
const showComments = ref(false)
const newComment = ref('')
const replyingId = ref<number | null>(null)
const replyContent = ref('')
const showEmojiPicker = ref(false)
const interacting = ref(false)
const user = JSON.parse(localStorage.getItem('user') || '{}')
const emojis = ['😊', '😂', '😍', '🤔', '👍', '🔥', '❤️', '👏', '🙌', '😢', '😡', '😎']

const fetchDetail = async () => {
  const id = Number(route.params.id)
  try {
    const res = await getArticleDetail(id)
    if (res.code === 200) {
      detail.value = res.data
      generateCatalog(res.data.article.content)
      fetchComments()
    }
  } catch (error) {
    ElMessage.error('加载失败')
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

const fetchComments = async () => {
  if (!detail.value) return
  try {
    const res = await getArticleComments(detail.value.article.id)
    if (res.code === 200) {
      comments.value = res.data
    }
  } catch (error) {}
}

const goBack = () => {
  router.push('/articles')
}

const handleInteract = async (type: number) => {
  if (!detail.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }

  interacting.value = true
  const article = detail.value.article
  try {
    const res = await interactArticle(article.id, type)
    if (res.code === 200) {
      ElMessage.success(res.data)
      if (type === 1) {
        if (detail.value.liked) {
          article.like_count = Math.max(0, (article.like_count || 1) - 1)
          detail.value.liked = false
        } else {
          article.like_count = (article.like_count || 0) + 1
          detail.value.liked = true
          if (detail.value.disliked) {
            article.dislike_count = Math.max(0, (article.dislike_count || 1) - 1)
            detail.value.disliked = false
          }
        }
      } else if (type === 2) {
        if (detail.value.disliked) {
          article.dislike_count = Math.max(0, (article.dislike_count || 1) - 1)
          detail.value.disliked = false
        } else {
          article.dislike_count = (article.dislike_count || 0) + 1
          detail.value.disliked = true
          if (detail.value.liked) {
            article.like_count = Math.max(0, (article.like_count || 1) - 1)
            detail.value.liked = false
          }
        }
      } else if (type === 3) {
        if (detail.value.collected) {
          article.collection_count = Math.max(0, (article.collection_count || 1) - 1)
          detail.value.collected = false
        } else {
          article.collection_count = (article.collection_count || 0) + 1
          detail.value.collected = true
        }
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    interacting.value = false
  }
}

const copyLink = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

const submitComment = async () => {
  if (!newComment.value.trim() || !detail.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }

  interacting.value = true
  try {
    const res = await addArticleComment({
      articleId: detail.value.article.id,
      content: newComment.value,
      parentId: 0
    })
    if (res.code === 200) {
      ElMessage.success('评论成功')
      newComment.value = ''
      fetchComments()
      detail.value.article.comment_count = (detail.value.article.comment_count || 0) + 1
    }
  } catch (error) {
    ElMessage.error('评论失败')
  } finally {
    interacting.value = false
  }
}

const handleLikeComment = async (comment: ArticleCommentVO) => {
  if (interacting.value) return
  interacting.value = true
  try {
    const res = await likeArticleComment(comment.id)
    if (res.code === 200) {
      fetchComments()
    }
  } catch (error) {
  } finally {
    interacting.value = false
  }
}

const handleReply = (comment: ArticleCommentVO) => {
  replyingId.value = comment.id
  replyContent.value = ''
}

const submitReply = async (parent: ArticleCommentVO) => {
  if (!replyContent.value.trim() || !detail.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }

  interacting.value = true
  try {
    const res = await addArticleComment({
      articleId: detail.value.article.id,
      content: replyContent.value,
      parentId: parent.id,
      replyToUserId: parent.userId
    })
    if (res.code === 200) {
      ElMessage.success('回复成功')
      replyingId.value = null
      replyContent.value = ''
      fetchComments()
      detail.value.article.comment_count = (detail.value.article.comment_count || 0) + 1
    }
  } catch (error) {
    ElMessage.error('回复失败')
  } finally {
    interacting.value = false
  }
}

const toggleEmoji = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const addEmoji = (emoji: string) => {
  newComment.value += emoji
  showEmojiPicker.value = false
}

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

const goToCourse = (id: number) => {
  router.push(`/course/${id}`)
}

const goToAssessment = (id: number) => {
  router.push(`/assessment/${id}`)
}

watch(() => route.params.id, () => {
  fetchDetail()
})

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
/* ==================== 页面容器 ==================== */
.article-page-wrapper {
  position: relative;
  display: flex;
  min-height: 100vh;
  padding: 20px;
  gap: 20px;
  padding-bottom: 80px;
  color: #1a2e1a;
  background: #f5f7f5;
}

/* ==================== 左侧目录栏 ==================== */
.left-sidebar {
  width: 260px;
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s;
  height: calc(100vh - 120px);
  position: sticky;
  top: 20px;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
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
  color: #1a2e1a;
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
  color: #6b7b6b;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.catalog-item:hover {
  background-color: rgba(61,173,111,0.08);
  color: #3dad6f !important;
}
.catalog-item.level-1 { font-weight: bold; color: #1a2e1a !important; }
.catalog-item.level-2 { padding-left: 20px; font-size: 13px; }
.catalog-item.level-3 { padding-left: 30px; font-size: 12px; }

/* ==================== 主内容区 ==================== */
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

/* ==================== 文章卡片 ==================== */
.article-card {
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  border: 1px solid #e8eee8;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
  color: #1a2e1a;
}
.article-card h1 {
  margin-top: 0;
  font-size: 28px;
  line-height: 1.4;
  margin-bottom: 20px;
  color: #1a2e1a;
}

/* 作者信息栏 */
.author-info-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f5f7f5;
  border-radius: 12px;
  margin-bottom: 25px;
  border: 1px solid #e8eee8;
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
  color: #1a2e1a;
}
.official-tag {
  font-weight: bold;
  letter-spacing: 1px;
}
.hospital-tag {
  font-weight: 500;
  border-radius: 4px;
}
.article-meta-info {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #6b7b6b;
  align-items: center;
}
.type-tag {
  background: rgba(61,173,111,0.12);
  color: #3dad6f;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.view-stats {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 文章内容 */
.article-content {
  line-height: 1.8;
  font-size: 16px;
  color: #1a2e1a;
}

/* ==================== 底部互动栏 ==================== */
.fixed-interaction-bar {
  position: sticky;
  bottom: 0;
  width: 100%;
  height: 60px;
  background: #ffffff;
  border: 1px solid #e8eee8;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  margin-top: 20px;
  border-radius: 12px;
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
  color: #6b7b6b;
  transition: all 0.2s;
  font-size: 12px;
  padding: 5px 15px;
  border-radius: 8px;
}
.action-item:hover {
  background: rgba(61,173,111,0.08);
  color: #3dad6f;
}
.action-item.active {
  color: #3dad6f;
}
.action-item.active .el-icon {
  color: #3dad6f;
}

/* ==================== 悬浮按钮组 ==================== */
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
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
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
  color: #3dad6f;
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
  background: rgba(61,173,111,0.12);
  border-color: #3dad6f;
}
.fab-container:hover .icon {
  opacity: 1;
  transform: translateX(-20px);
  color: #1a2e1a;
}
.fab-container:hover .text {
  opacity: 1;
  transform: translateX(15px);
  color: #1a2e1a;
}
:deep(.el-backtop) {
  position: static !important;
  width: auto !important;
  height: auto !important;
  background-color: transparent !important;
  box-shadow: none !important;
  display: block !important;
}

/* ==================== 右侧推荐栏 ==================== */
.right-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}
.sidebar-section {
  background: #ffffff;
  border: 1px solid #e8eee8;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
}
.sidebar-section h3 {
  margin-top: 0;
  font-size: 16px;
  border-left: 3px solid #3dad6f;
  padding-left: 10px;
  margin-bottom: 15px;
  color: #1a2e1a;
}
.recommend-item {
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  color: #6b7b6b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}
.recommend-item:hover {
  color: #3dad6f;
}

/* ==================== 评论区 ==================== */
.comment-section {
  padding: 0 20px;
  color: #1a2e1a;
}
.comment-input-box {
  margin-bottom: 30px;
  position: relative;
}
.input-with-avatar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.input-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 44px;
}
.emoji-trigger {
  font-size: 20px;
  cursor: pointer;
}
.emoji-picker {
  position: absolute;
  top: 100%;
  left: 44px;
  background: #ffffff;
  border: 1px solid #e8eee8;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  z-index: 100;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
}
.emoji-picker span {
  cursor: pointer;
  font-size: 18px;
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.comment-item {
  border-bottom: 1px solid #e8eee8;
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
  color: #1a2e1a;
}
.time {
  font-size: 12px;
  color: #9ead9e;
}
.comment-actions {
  font-size: 12px;
  color: #6b7b6b;
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
  color: #3dad6f;
}
.comment-content {
  padding-left: 42px;
  font-size: 14px;
  line-height: 1.5;
  color: #1a2e1a;
}
.replies-list {
  margin-top: 10px;
  margin-left: 42px;
  background: #f5f7f5;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e8eee8;
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
  color: #6b7b6b;
}
.reply-content {
  font-size: 13px;
  padding-left: 0;
}
.reply-input-box {
  margin-top: 10px;
  margin-left: 42px;
}
.reply-buttons {
  margin-top: 5px;
  text-align: right;
}

/* ==================== Element Plus 适配 ==================== */
/* 输入框 */
:deep(.el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #e8eee8;
  box-shadow: none !important;
}
:deep(.el-input__inner) {
  color: #1a2e1a !important;
}
:deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
}
:deep(.el-textarea__inner) {
  background: #ffffff;
  border: 1px solid #e8eee8;
  color: #1a2e1a !important;
  box-shadow: none !important;
}
:deep(.el-textarea__inner::placeholder) {
  color: #9ead9e !important;
}

/* 按钮 */
:deep(.el-button--primary) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
}
:deep(.el-button--primary:hover) {
  background: rgba(61,173,111,0.85) !important;
  border-color: rgba(61,173,111,0.85) !important;
}

/* 标签 */
:deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.12) !important;
  border-color: rgba(245, 108, 108, 0.3) !important;
  color: #f56c6c !important;
}
:deep(.el-tag--success) {
  background: rgba(61,173,111,0.12) !important;
  border-color: rgba(61,173,111,0.3) !important;
  color: #3dad6f !important;
}
:deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.12) !important;
  border-color: rgba(230, 162, 60, 0.3) !important;
  color: #e6a23c !important;
}

/* 抽屉 */
:deep(.el-drawer) {
  background: #ffffff !important;
}
:deep(.el-drawer__header) {
  color: #1a2e1a !important;
  border-bottom: 1px solid #e8eee8 !important;
}
:deep(.el-drawer__body) {
  background: #ffffff !important;
}

/* 空状态 */
:deep(.el-empty__description) {
  color: #9ead9e !important;
}

/* 头像 */
:deep(.el-avatar) {
  background: #f5f7f5 !important;
  border: 1px solid #e8eee8 !important;
}

/* Markdown：覆盖 v-md-editor 样式 */
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
  color: rgba(61,173,111,0.75) !important;
}
.article-content :deep(.github-markdown-body code:not(pre code)) {
  background: #f5f7f5 !important;
  color: #3dad6f !important;
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
  background: #e8eee8 !important;
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
  color: #d73a49 !important;
}
.article-content :deep(.github-markdown-body .hljs-number),
.article-content :deep(.github-markdown-body .hljs-literal),
.article-content :deep(.github-markdown-body .hljs-string),
.article-content :deep(.github-markdown-body .hljs-doctag) {
  color: #3dad6f !important;
}
.article-content :deep(.github-markdown-body .hljs-title),
.article-content :deep(.github-markdown-body .hljs-section) {
  color: #6f42c1 !important;
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
  background: rgba(61,173,111,0.08) !important;
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
</style>
