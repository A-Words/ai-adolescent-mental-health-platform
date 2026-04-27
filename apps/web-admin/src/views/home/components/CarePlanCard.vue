<template>
  <div class="care-plan-card">
    <div class="plan-header">
      <div class="plan-plant">
        <div class="plant-pot" />
        <div class="plant-stem" />
        <div class="plant-leaf leaf-1" />
        <div class="plant-leaf leaf-2" />
        <div class="plant-leaf leaf-3" />
      </div>
      <div class="plan-title-area">
        <h3 class="plan-title">你的照护计划</h3>
        <p class="plan-desc">持续关注心理健康，一步步建立自我照顾的能力</p>
      </div>
    </div>
    <div class="plan-items">
      <div
        v-for="item in planItems"
        :key="item.title"
        class="plan-item"
        :class="`plan-tone-${item.tone}`"
        @click="$router.push(item.to)"
      >
        <div class="plan-item-icon">
          <el-icon :size="20"><component :is="item.icon" /></el-icon>
        </div>
        <div class="plan-item-body">
          <p class="plan-item-title">{{ item.title }}</p>
          <el-tag size="small" :type="item.status === '进行中' ? 'success' : 'info'">{{ item.status }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Calendar, DocumentChecked, Reading } from '@element-plus/icons-vue'

const planItems = [
  { title: '继续 AI 对话', status: '进行中', tone: 'green', to: '/ai-consultation', icon: Star },
  { title: '预约专业咨询', status: '待开始', tone: 'purple', to: '/consultation', icon: Calendar },
  { title: '完成一次测评', status: '待开始', tone: 'yellow', to: '/assessments', icon: DocumentChecked },
  { title: '阅读支持内容', status: '进行中', tone: 'coral', to: '/articles', icon: Reading },
]
</script>

<style scoped>
.care-plan-card {
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
  padding: 24px;
  margin-bottom: 32px;
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.plan-plant {
  position: relative;
  width: 48px;
  height: 64px;
  flex-shrink: 0;
}

.plant-pot {
  position: absolute;
  bottom: 0;
  left: 8px;
  width: 32px;
  height: 20px;
  background: rgba(61, 173, 111, 0.2);
  border-radius: 2px 2px 8px 8px;
}

.plant-stem {
  position: absolute;
  bottom: 20px;
  left: 23px;
  width: 2px;
  height: 32px;
  background: rgba(61, 173, 111, 0.5);
}

.plant-leaf {
  position: absolute;
  border-radius: 50%;
  background: rgba(61, 173, 111, 0.3);
}

.leaf-1 {
  bottom: 36px;
  left: 14px;
  width: 16px;
  height: 16px;
}

.leaf-2 {
  bottom: 40px;
  right: 12px;
  width: 20px;
  height: 20px;
  background: rgba(61, 173, 111, 0.35);
}

.leaf-3 {
  bottom: 48px;
  left: 18px;
  width: 18px;
  height: 18px;
  background: rgba(61, 173, 111, 0.25);
}

.plan-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 6px;
}

.plan-desc {
  font-size: 14px;
  color: #9ead9e;
  margin: 0;
}

.plan-items {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 768px) {
  .plan-items {
    grid-template-columns: repeat(4, 1fr);
  }
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.plan-item:hover {
  transform: translateY(-1px);
}

.plan-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-item-body {
  flex: 1;
}

.plan-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a2e1a;
  margin: 0 0 6px;
}

/* Tone variants */
.plan-tone-green { background: #e8f5ee; }
.plan-tone-green .plan-item-icon { color: #3dad6f; }

.plan-tone-purple { background: #ede9ff; }
.plan-tone-purple .plan-item-icon { color: #8b5cf6; }

.plan-tone-yellow { background: #fff8e1; }
.plan-tone-yellow .plan-item-icon { color: #f5a623; }

.plan-tone-coral { background: #ffeee8; }
.plan-tone-coral .plan-item-icon { color: #f4836c; }
</style>
