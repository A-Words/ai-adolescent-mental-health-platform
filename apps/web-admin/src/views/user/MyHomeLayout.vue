<template>
  <div class="my-home-layout">
    <div class="my-home-container">
      <!-- 左侧菜单 -->
      <aside class="sidebar">
        <div class="user-info-header">
          <el-avatar :size="64" :src="user.headPath">
            <template #default>
              <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
            </template>
          </el-avatar>
          <div class="user-name">{{ user.nickname }}</div>
          <!-- 统计数据 -->
          <div class="user-stats">
            <div class="stat-item" @click="router.push('/my-home/followings')">
              <span class="stat-value">{{ stats.followCount || 0 }}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat-divider">|</div>
            <div class="stat-item" @click="router.push('/my-home/fans')">
              <span class="stat-value">{{ stats.fanCount || 0 }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat-divider">|</div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.likeCount || 0 }}</span>
              <span class="stat-label">获赞</span>
            </div>
          </div>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/my-home/info">
            <el-icon><User /></el-icon>
            <span>个人信息中心</span>
          </el-menu-item>
          <el-menu-item index="/my-home/articles">
            <el-icon><Document /></el-icon>
            <span>我的发布</span>
          </el-menu-item>
          <el-menu-item index="/my-home/privacy">
            <el-icon><Lock /></el-icon>
            <span>隐私设置</span>
          </el-menu-item>
          <el-menu-item index="/my-home/favorites">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
          <el-menu-item index="/my-home/likes">
            <el-icon><Pointer /></el-icon>
            <span>我的点赞</span>
          </el-menu-item>
          <el-menu-item index="/my-home/assessments">
            <el-icon><List /></el-icon>
            <span>我的测评记录</span>
          </el-menu-item>
          <el-menu-item index="/my-home/feedback">
            <el-icon><ChatDotRound /></el-icon>
            <span>我的反馈</span>
          </el-menu-item>
          <el-menu-item index="/my-home/patients">
            <el-icon><FolderOpened /></el-icon>
            <span>就诊人病历管理</span>
          </el-menu-item>
          <el-menu-item index="/my-psychology">
            <el-icon><ChatDotSquare /></el-icon>
            <span>我的心理咨询</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 右侧内容 -->
      <main class="content">
        <router-view />
      </main>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Document, Star, Lock, List, ChatDotRound, FolderOpened, Pointer, ChatDotSquare } from '@element-plus/icons-vue'
import { getMyStats } from '@/api/userStats'
const route = useRoute()
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const stats = ref<any>({
  followCount: 0,
  fanCount: 0,
  likeCount: 0
})

const activeMenu = computed(() => route.path)

const fetchStats = async () => {
  try {
    const res = await getMyStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.my-home-layout {
  min-height: calc(100vh - 60px);
  color: #1a2e1a;
}

.my-home-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
  overflow: hidden;
}

.user-info-header {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #e8eee8 !important;
}

.user-name {
  margin-top: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #1a2e1a !important;
}

.user-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  gap: 5px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.stat-item:hover {
  background-color: rgba(61, 173, 111, 0.06) !important;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #1a2e1a !important;
}

.stat-label {
  font-size: 12px;
  color: #6b7b6b !important;
  margin-top: 2px;
}

.stat-divider {
  color: #e8eee8 !important;
  font-size: 14px;
}

.sidebar-menu {
  border-right: none !important;
  background: transparent !important;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  color: #1a2e1a !important;
  background: transparent !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: rgba(61, 173, 111, 0.1) !important;
  color: #3dad6f !important;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(61, 173, 111, 0.06) !important;
  color: #3dad6f !important;
}

.sidebar-menu :deep(.el-icon) {
  color: inherit;
}

.content {
  flex: 1;
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
  padding: 20px;
  min-height: calc(100vh - 100px);
  color: #1a2e1a;
}

/* === 全局覆盖：所有子页面 h 标题、段落、文本 → 白色 === */
.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4),
.content :deep(h5),
.content :deep(h6),
.content :deep(p),
.content :deep(span),
.content :deep(.el-text) {
  color: #1a2e1a !important;
}

/* Element Plus 通用组件 */
.content :deep(.el-tag) {
  border: none !important;
  font-weight: 600;
}
.content :deep(.el-tag--primary) {
  background: rgba(61, 173, 111, 0.15) !important;
  color: #3dad6f !important;
}
.content :deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.15) !important;
  color: #67c23a !important;
}
.content :deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.15) !important;
  color: #e6a23c !important;
}
.content :deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.15) !important;
  color: #f56c6c !important;
}
.content :deep(.el-tag--info) {
  background: rgba(144, 147, 153, 0.15) !important;
  color: #909399 !important;
}

/* 分页 */
.content :deep(.el-pagination) {
  color: #1a2e1a !important;
}
.content :deep(.el-pagination button),
.content :deep(.el-pager li) {
  background: #f5f7f5 !important;
  color: #1a2e1a !important;
}
.content :deep(.el-pager li.is-active) {
  background: #3dad6f !important;
  color: #ffffff !important;
}
.content :deep(.el-pagination .el-pagination__total) {
  color: #9ead9e !important;
}

/* 按钮 */
.content :deep(.el-button--primary) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
}
.content :deep(.el-button--primary:hover) {
  background: #2d8d5f !important;
  border-color: #2d8d5f !important;
}
.content :deep(.el-button--default) {
  background: #ffffff !important;
  border-color: #e8eee8 !important;
  color: #1a2e1a !important;
}
.content :deep(.el-button--default:hover) {
  background: #f5f7f5 !important;
}
.content :deep(.el-button--text) {
  color: #3dad6f !important;
}

/* 输入框 */
.content :deep(.el-input__wrapper) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  box-shadow: none !important;
}
.content :deep(.el-input__inner) {
  color: #1a2e1a !important;
}
.content :deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
}

/* 表格 */
.content :deep(.el-table) {
  background: transparent !important;
  color: #1a2e1a !important;
}
.content :deep(.el-table tr) {
  background: transparent !important;
  color: #1a2e1a !important;
}
.content :deep(.el-table th.el-table__cell) {
  background: #f5f7f5 !important;
  color: #6b7b6b !important;
  border-color: #e8eee8 !important;
}
.content :deep(.el-table td.el-table__cell) {
  border-color: #e8eee8 !important;
}
.content :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(61, 173, 111, 0.02) !important;
}
.content :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: rgba(61, 173, 111, 0.04) !important;
}
.content :deep(.el-table__empty-block) {
  background: transparent !important;
}
.content :deep(.el-table__empty-text) {
  color: #9ead9e !important;
}

/* 对话框 */
.content :deep(.el-dialog) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
}
.content :deep(.el-dialog__title) {
  color: #1a2e1a !important;
}
.content :deep(.el-dialog__body) {
  color: #1a2e1a !important;
}
.content :deep(.el-dialog__footer) {
  border-top-color: #e8eee8 !important;
}

/* 空状态 */
.content :deep(.el-empty__description) {
  color: #9ead9e !important;
}

/* 加载遮罩 */
.content :deep(.el-loading-mask) {
  background: rgba(245, 247, 245, 0.7) !important;
}

/* 链接 */
.content :deep(.el-link) {
  color: #3dad6f !important;
}
.content :deep(.el-link:hover) {
  color: #2d8d5f !important;
}
</style>
