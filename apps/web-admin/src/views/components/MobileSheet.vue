<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="sheet-overlay" @click.self="close">
        <div class="sheet-panel">
          <div class="sheet-header">
            <h3>心愈智联</h3>
            <p class="sheet-desc">选择今天想进入的空间</p>
          </div>
          <div class="sheet-body">
            <SidebarNav :unread-count="unreadCount" :compact="false" @navigate="close" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import SidebarNav from './SidebarNav.vue'

const props = defineProps<{
  modelValue: boolean
  unreadCount?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
}

.sheet-panel {
  width: 320px;
  max-width: 85vw;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sheet-header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid #e8eee8;
}

.sheet-header h3 {
  margin: 0;
  font-size: 18px;
  color: #3dad6f;
  font-weight: 700;
}

.sheet-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9ead9e;
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 0.25s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet-panel {
  transform: translateX(-100%);
}

.sheet-leave-to .sheet-panel {
  transform: translateX(-100%);
}
</style>
