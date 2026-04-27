<template>
  <div class="floating-buttons">
    <!-- 返回顶部按钮 -->
    <transition name="fade">
      <div v-if="showBackToTop" class="float-btn back-to-top" @click="scrollToTop" title="返回顶部">
        <el-icon :size="20"><Top /></el-icon>
      </div>
    </transition>

    <!-- 线上AI咨询悬浮按钮（仅在非AI咨询页面显示） -->
    <transition name="fade">
      <div v-if="!isAiConsultationPage" class="float-btn consultation-btn" @click="goToAiConsultation" title="线上AI咨询">
        <el-icon :size="24"><ChatLineSquare /></el-icon>
        <span class="btn-text">AI咨询</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Top, ChatLineSquare } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const showBackToTop = ref(false)

const isAiConsultationPage = computed(() => {
  return route.path === '/ai-consultation'
})

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const goToAiConsultation = () => {
  router.push('/ai-consultation')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.floating-buttons {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.float-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3dad6f, #5bc4bf);
  color: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.35);
  transition: all 0.3s ease;
}

.float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(61, 173, 111, 0.5);
}

.back-to-top {
  background: linear-gradient(135deg, #9ead9e, #6b7b6b);
  box-shadow: 0 4px 12px rgba(107, 123, 107, 0.35);
}

.back-to-top:hover {
  box-shadow: 0 6px 16px rgba(107, 123, 107, 0.5);
}

.consultation-btn {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  font-size: 12px;
  flex-direction: column;
}

.btn-text {
  font-size: 12px;
  margin-top: 2px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
