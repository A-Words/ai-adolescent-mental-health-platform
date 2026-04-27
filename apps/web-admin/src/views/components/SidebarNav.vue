<template>
  <div class="sidebar-nav" :class="{ compact }">
    <router-link v-if="compact" to="/home" class="compact-brand" title="心愈智联首页">
      <img src="/image/title/小可爱.png" alt="logo" class="compact-brand-img" />
    </router-link>

    <div v-else class="brand-section" @click="$router.push('/home')">
      <img src="/image/title/小可爱.png" alt="logo" class="brand-img" />
      <span class="brand-text">心愈智联</span>
    </div>

    <nav class="nav-primary">
      <!-- Flat items -->
      <router-link
        v-for="item in flatItems"
        :key="item.path"
        :to="item.path"
        :title="compact ? item.label : ''"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="$emit('navigate')"
      >
        <el-icon :size="20"><component :is="item.icon" /></el-icon>
        <span v-if="!compact" class="nav-label">{{ item.label }}</span>
      </router-link>

      <!-- Grouped items -->
      <div v-for="group in menuGroups" :key="group.key" class="nav-group">
        <div
          class="nav-item"
          :class="{ active: isGroupActive(group) }"
          :title="compact ? group.label : ''"
          @click="toggleGroup(group.key)"
        >
          <span v-if="openGroups.has(group.key) && !compact" class="active-bar" />
          <el-icon :size="20"><component :is="group.icon" /></el-icon>
          <span v-if="!compact" class="nav-label">{{ group.label }}</span>
          <el-icon v-if="!compact" class="expand-icon" :size="14">
            <component :is="openGroups.has(group.key) ? ArrowDown : ArrowRight" />
          </el-icon>
        </div>
        <div v-show="openGroups.has(group.key) || compact" class="nav-sub">
          <router-link
            v-for="child in group.children"
            :key="child.path"
            :to="child.path"
            class="nav-item nav-sub-item"
            :class="{ active: route.path.startsWith(child.path) }"
            :title="compact ? child.label : ''"
            @click="$emit('navigate')"
          >
            <el-icon :size="16"><component :is="child.icon" /></el-icon>
            <span v-if="!compact" class="nav-label">{{ child.label }}</span>
          </router-link>
        </div>
      </div>

      <!-- Flat items after groups -->
      <router-link
        v-for="item in flatBottomItems"
        :key="item.path"
        :to="item.path"
        :title="compact ? item.label : ''"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="$emit('navigate')"
      >
        <el-icon :size="20"><component :is="item.icon" /></el-icon>
        <span v-if="!compact" class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <nav v-if="!compact" class="nav-secondary">
      <router-link
        v-for="item in personalItems"
        :key="item.path"
        :to="item.path"
        class="nav-item secondary"
        @click="$emit('navigate')"
      >
        <el-icon :size="18"><component :is="item.icon" /></el-icon>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.path === '/my-messages' && (unreadCount || 0) > 0" class="unread-dot" />
      </router-link>

      <!-- 咨询师管理 -->
      <router-link
        v-if="isPsychologist"
        to="/psychologist-admin/workbench"
        class="nav-item secondary"
        @click="$emit('navigate')"
      >
        <el-icon :size="18"><Briefcase /></el-icon>
        <span class="nav-label">咨询师管理</span>
      </router-link>

      <!-- 进入后台 -->
      <router-link
        v-if="hasAdminAccess"
        :to="adminBackendPath"
        class="nav-item secondary"
        @click="$emit('navigate')"
      >
        <el-icon :size="18"><Setting /></el-icon>
        <span class="nav-label">进入后台</span>
      </router-link>
    </nav>

    <div v-if="!compact" class="user-profile-section">
      <div class="user-profile-row" @click="$router.push('/my-home/info')">
        <el-avatar :size="40" :src="user.headPath">
          <template #default>
            <el-icon :size="24"><User /></el-icon>
          </template>
        </el-avatar>
        <div class="user-profile-info">
          <span class="user-profile-name">{{ user.nickname || '用户' }}</span>
          <span class="user-profile-email">{{ user.email || '' }}</span>
        </div>
      </div>
      <el-button class="logout-btn" size="small" text @click="handleLogout">
        <el-icon :size="14"><SwitchButton /></el-icon>
        <span>退出登录</span>
      </el-button>
    </div>

    <div v-if="!compact" class="motivation-card">
      <p class="motivation-title">今天也要照顾好自己</p>
      <p class="motivation-sub">记得给自己一点鼓励哦</p>
      <el-button class="motivation-btn" size="small" @click="$router.push('/assessments')">记录心情</el-button>
      <div class="motivation-leaf">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <path d="M28 4C28 4 8 16 8 32c0 11.046 8.954 20 20 20s20-8.954 20-20C48 16 28 4 28 4z" fill="rgba(61,173,111,0.15)"/>
          <path d="M28 14c-2 4-6 10-6 18 0 3.314 2.686 6 6 6s6-2.686 6-6c0-8-4-14-6-18z" fill="rgba(61,173,111,0.35)"/>
          <line x1="28" y1="14" x2="28" y2="38" stroke="rgba(61,173,111,0.35)" stroke-width="1.5"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled, ChatDotRound, Reading, DocumentChecked,
  Headset, Service, VideoPlay, Collection,
  Bell, User, ArrowDown, ArrowRight,
  Briefcase, Setting, Notebook, SwitchButton,
} from '@element-plus/icons-vue'
import { logout } from '@/api/user'
import { ElMessage } from 'element-plus'

defineProps<{
  compact?: boolean
  unreadCount?: number
}>()

defineEmits<{
  navigate: []
}>()

const route = useRoute()

interface MenuChild {
  path: string
  label: string
  icon: any
}

interface MenuGroup {
  key: string
  label: string
  icon: any
  children: MenuChild[]
}

const flatItems = [
  { path: '/home', label: '首页', icon: HomeFilled },
]

const menuGroups: MenuGroup[] = [
  {
    key: 'consultation',
    label: '咨询与倾诉',
    icon: ChatDotRound,
    children: [
      { path: '/consultation', label: '专业心理咨询', icon: ChatDotRound },
      { path: '/ai-consultation', label: 'AI 树洞', icon: Service },
      { path: '/xiaoai-listen', label: '小爱倾听', icon: Headset },
    ],
  },
  {
    key: 'content',
    label: '内容馆',
    icon: Reading,
    children: [
      { path: '/articles', label: '暖心小短文', icon: Reading },
      { path: '/courses', label: '心理小课堂', icon: VideoPlay },
      { path: '/books', label: '暖心书单', icon: Collection },
    ],
  },
]

const flatBottomItems = [
  { path: '/assessments', label: '心理小测试', icon: DocumentChecked },
]

const personalItems = [
  { path: '/my-messages', label: '消息中心', icon: Bell },
  { path: '/my-orders', label: '订单管理', icon: Notebook },
]

const openGroups = reactive(new Set<string>(['consultation']))

function toggleGroup(key: string) {
  if (openGroups.has(key)) {
    openGroups.delete(key)
  } else {
    openGroups.add(key)
  }
}

function isActive(path: string) {
  if (path === '/home') return route.path === '/home'
  return route.path.startsWith(path)
}

function isGroupActive(group: MenuGroup) {
  return group.children.some(child => route.path.startsWith(child.path))
}

// Role-based computed
const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
})

const isPsychologist = computed(() => {
  return user.value.isPsychologist === 1 || user.value.isPsychologist === true
})

const hasAdminAccess = computed(() => {
  return user.value.role >= 2
})

const adminBackendPath = computed(() => {
  switch (user.value.role) {
    case 4: return '/admin/dashboard'
    case 3: return '/hospital/dashboard'
    case 2: return '/doctor/dashboard'
    default: return '/admin/dashboard'
  }
})

const router = useRouter()

async function handleLogout() {
  try { await logout() } catch (e) { /* ignore */ }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.sidebar-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 28px 12px;
}

.sidebar-nav.compact {
  padding: 20px 8px;
  align-items: center;
}

.compact-brand {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.compact-brand-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 24px;
  cursor: pointer;
  user-select: none;
}

.brand-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  color: #3dad6f;
  letter-spacing: 1px;
}

.nav-primary {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  color: #6b7b6b;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.15s;
  cursor: pointer;
}

.compact .nav-item {
  justify-content: center;
  padding: 0;
  min-height: 40px;
}

.nav-item:hover {
  background: rgba(61, 173, 111, 0.08);
  color: #3dad6f;
}

.nav-item.active {
  background: #e8f5ee;
  color: #3dad6f;
  font-weight: 600;
}

.active-bar {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 999px;
  background: #3dad6f;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Group items */
.nav-group {
  display: flex;
  flex-direction: column;
}

.nav-sub {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.nav-sub-item {
  min-height: 38px;
  font-size: 13px;
  color: #9ead9e;
}

.nav-sub-item:hover {
  color: #3dad6f;
}

.nav-sub-item.active {
  color: #3dad6f;
  background: #e8f5ee;
  font-weight: 600;
}

.expand-icon {
  margin-left: auto;
  transition: transform 0.2s;
}

/* Secondary nav */
.nav-secondary {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid #e8eee8;
}

.nav-item.secondary {
  color: #9ead9e;
  font-size: 13px;
  min-height: 40px;
}

.nav-item.secondary:hover {
  color: #3dad6f;
}

.unread-dot {
  margin-left: auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e74c3c;
}

/* User profile section */
.user-profile-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8eee8;
}

.user-profile-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.15s;
}

.user-profile-row:hover {
  background: rgba(61, 173, 111, 0.06);
}

.user-profile-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.user-profile-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a2e1a;
  line-height: 1.3;
}

.user-profile-email {
  font-size: 11px;
  color: #9ead9e;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  justify-content: center;
  width: 100%;
  font-size: 12px !important;
  color: #9ead9e !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  transition: all 0.15s;
}

.logout-btn:hover {
  color: #e74c3c !important;
  background: rgba(231, 76, 60, 0.06) !important;
}

.motivation-card {
  position: relative;
  margin-top: auto;
  padding: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(61, 173, 111, 0.06) 0%, rgba(91, 196, 191, 0.06) 100%);
  overflow: hidden;
  min-height: 130px;
}

.motivation-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 6px;
}

.motivation-sub {
  font-size: 12px;
  color: #9ead9e;
  margin: 0 0 12px;
  line-height: 1.5;
}

.motivation-btn {
  --el-button-bg-color: #ffffff !important;
  --el-button-border-color: #e8eee8 !important;
  --el-button-text-color: #3dad6f !important;
  --el-button-hover-bg-color: #e8f5ee !important;
  font-size: 12px !important;
  height: 32px !important;
  border-radius: 8px !important;
}

.motivation-leaf {
  position: absolute;
  bottom: 8px;
  right: 12px;
  opacity: 0.7;
}
</style>
