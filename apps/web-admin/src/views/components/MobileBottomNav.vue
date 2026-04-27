<template>
  <nav class="bottom-nav">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="bottom-tab"
      :class="{ active: isActive(tab.path) }"
    >
      <el-icon :size="20"><component :is="tab.icon" /></el-icon>
      <span class="tab-label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { HomeFilled, Service, DocumentChecked, ChatDotRound, User } from '@element-plus/icons-vue'

const route = useRoute()

const tabs = [
  { path: '/home', label: '首页', icon: HomeFilled },
  { path: '/ai-consultation', label: 'AI树洞', icon: Service },
  { path: '/assessments', label: '小测试', icon: DocumentChecked },
  { path: '/consultation', label: '咨询', icon: ChatDotRound },
  { path: '/my-home/info', label: '我的', icon: User },
]

function isActive(path: string) {
  if (path === '/home') return route.path === '/home'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.bottom-nav {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid #e8eee8;
  padding: 4px 8px;
  padding-bottom: env(safe-area-inset-bottom, 4px);
  backdrop-filter: blur(10px);
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}

.bottom-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 48px;
  border-radius: 8px;
  color: #9ead9e;
  text-decoration: none;
  transition: all 0.15s;
}

.bottom-tab.active {
  color: #3dad6f;
  background: #e8f5ee;
}

.tab-label {
  font-size: 11px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
