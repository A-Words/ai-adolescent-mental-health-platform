<template>
  <div class="shortcut-cards">
    <ShortcutCard
      v-for="card in cards"
      :key="card.to"
      :to="card.to"
      :title="card.title"
      :description="card.description"
      :tone="card.tone"
    >
      <template #icon>
        <el-icon :size="24"><component :is="card.icon" /></el-icon>
      </template>
    </ShortcutCard>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound, Calendar, DocumentChecked, Reading, Notebook } from '@element-plus/icons-vue'
import ShortcutCard from '@/views/components/ShortcutCard.vue'

const cards = [
  { to: '/ai-consultation', title: 'AI 树洞', description: '24 小时陪伴对话', icon: ChatDotRound, tone: 'green' as const },
  { to: '/consultation', title: '专业心理咨询', description: '与专业咨询师对话', icon: Calendar, tone: 'yellow' as const },
  { to: '/assessments', title: '心理小测试', description: '了解你的心理状态', icon: DocumentChecked, tone: 'green' as const },
  { to: '/articles', title: '暖心小短文', description: '文章 · 课程 · 练习', icon: Reading, tone: 'purple' as const },
  { to: '/my-home', title: '我的照护计划', description: '定制成长方案', icon: Notebook, tone: 'coral' as const },
]
</script>

<style scoped>
.shortcut-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .shortcut-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1200px) {
  .shortcut-cards {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
