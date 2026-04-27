<template>
  <header class="topbar">
    <div class="topbar-left">
      <el-button class="menu-toggle" :icon="Expand" text @click="$emit('toggleMobileMenu')" />
      <div class="search-box">
        <el-icon :size="16" class="search-icon"><Search /></el-icon>
        <input
          ref="searchInputRef"
          v-model="keyword"
          type="text"
          class="search-input"
          placeholder="搜索文章、课程等"
          @keyup.enter="doSearch"
        />
      </div>
    </div>

    <div class="topbar-right">
      <template v-if="isLoggedIn">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notif-badge">
          <el-button class="icon-btn" :icon="Bell" text @click="$router.push('/my-messages')" />
        </el-badge>
        <el-dropdown trigger="click" @command="$emit('command', $event)">
          <span class="user-trigger">
            <el-avatar :size="32" :src="userAvatar" class="user-avatar">
              <template #default>
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              </template>
            </el-avatar>
            <span class="username">{{ username }}</span>
            <el-icon :size="16" class="chevron"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="my-home">个人主页</el-dropdown-item>
              <el-dropdown-item command="my-psychology">我的心理咨询</el-dropdown-item>
              <el-dropdown-item command="my-orders">订单管理</el-dropdown-item>
              <el-dropdown-item command="apply-psychologist">
                <span style="color: #f5a623">申请心理咨询师</span>
              </el-dropdown-item>
              <el-dropdown-item v-if="isPsychologist === 1" command="psychologist-admin">咨询师管理</el-dropdown-item>
              <el-dropdown-item v-if="role > 1" command="backend">进入后台</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>

      <template v-else>
        <el-button size="small" @click="$emit('goLogin')">登录</el-button>
        <el-button size="small" type="primary" @click="$emit('goRegister')">注册</el-button>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Bell, Expand, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  isLoggedIn: boolean
  username: string
  userAvatar: string
  unreadCount: number
  role: number
  isPsychologist: number
}>()

defineEmits<{
  toggleMobileMenu: []
  command: [cmd: string]
  goLogin: []
  goRegister: []
}>()

const router = useRouter()
const keyword = ref('')

function doSearch() {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  router.push({ path: '/search', query: { keyword: keyword.value.trim() } })
}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 20px;
  background: #ffffff;
  border-bottom: 1px solid #e8eee8;
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.menu-toggle {
  display: flex !important;
  color: #6b7b6b !important;
}

@media (min-width: 1024px) {
  .menu-toggle {
    display: none !important;
  }
}

.search-box {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ead9e;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 36px;
  border: 1px solid #e8eee8;
  border-radius: 8px;
  font-size: 14px;
  color: #1a2e1a;
  background: #f5f7f5;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input::placeholder {
  color: #9ead9e;
}

.search-input:focus {
  border-color: #3dad6f;
  box-shadow: 0 0 0 3px rgba(61, 173, 111, 0.12);
}

.icon-btn {
  color: #6b7b6b !important;
}

.icon-btn:hover {
  color: #3dad6f !important;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 8px;
  transition: background 0.15s;
}

.user-trigger:hover {
  background: #e8f5ee;
}

.user-avatar {
  flex-shrink: 0;
}

.username {
  font-size: 14px;
  color: #1a2e1a;
  font-weight: 500;
  display: none;
}

@media (min-width: 768px) {
  .username {
    display: inline;
  }
}

.chevron {
  color: #9ead9e;
  display: none;
}

@media (min-width: 768px) {
  .chevron {
    display: inline;
  }
}

.notif-badge {
  display: flex;
  align-items: center;
}
</style>
