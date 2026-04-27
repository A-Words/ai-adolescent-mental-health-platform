<template>
  <router-link :to="to" class="shortcut-card" :class="toneClass">
    <div class="card-icon" :class="iconToneClass">
      <slot name="icon">
        <el-icon :size="24"><component :is="icon" /></el-icon>
      </slot>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-desc">{{ description }}</p>
    </div>
    <div class="card-tone-bar" :class="barToneClass" />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

const props = defineProps<{
  to: string
  title: string
  description: string
  icon?: Component
  tone?: 'green' | 'yellow' | 'purple' | 'coral'
}>()

const toneClass = computed(() => props.tone ? `tone-${props.tone}` : '')
const iconToneClass = computed(() => props.tone ? `icon-tone-${props.tone}` : '')
const barToneClass = computed(() => props.tone ? `bar-tone-${props.tone}` : '')
</script>

<style scoped>
.shortcut-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
}

.shortcut-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(61, 173, 111, 0.12);
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3dad6f;
}

.card-body {
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 4px;
}

.card-desc {
  font-size: 13px;
  color: #9ead9e;
  margin: 0;
  line-height: 1.4;
}

.card-tone-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 0 0 12px 12px;
}

/* Tone: green */
.tone-green .card-icon { background: #e8f5ee; color: #3dad6f; }
.tone-green .card-tone-bar { background: #3dad6f; }
.tone-green:hover { border-color: #3dad6f; }

/* Tone: yellow */
.tone-yellow .card-icon { background: #fff8e1; color: #f5a623; }
.tone-yellow .card-tone-bar { background: #f5a623; }
.tone-yellow:hover { border-color: #f5a623; }

/* Tone: purple */
.tone-purple .card-icon { background: #ede9ff; color: #8b5cf6; }
.tone-purple .card-tone-bar { background: #8b5cf6; }
.tone-purple:hover { border-color: #8b5cf6; }

/* Tone: coral */
.tone-coral .card-icon { background: #ffeee8; color: #f4836c; }
.tone-coral .card-tone-bar { background: #f4836c; }
.tone-coral:hover { border-color: #f4836c; }
</style>
