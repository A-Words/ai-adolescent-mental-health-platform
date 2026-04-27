<template>
  <div class="psychologist-hub-container">
    <!-- 页面标题 -->
    <div class="hub-header">
      <h1 class="hub-title">心理咨询中心</h1>
      <p class="hub-subtitle">专业心理咨询师，为您排忧解难</p>
    </div>

    <!-- 入口卡片 -->
    <div class="entry-cards">
      <!-- 预约咨询心理师 -->
      <div class="entry-card clean-card" @click="goToPsychologist">
        <div class="card-glow"></div>
        <div class="card-icon">
          <span class="icon-emoji">🧠</span>
        </div>
        <div class="card-content">
          <h2 class="card-title">预约咨询心理师</h2>
          <p class="card-desc">与专业心理咨询师一对一交流，获取个性化心理支持</p>
          <div class="card-features">
            <span class="feature-tag clean-tag">
              <span class="tag-icon">✨</span> 智能匹配
            </span>
            <span class="feature-tag clean-tag">
              <span class="tag-icon">🎥</span> 视频咨询
            </span>
            <span class="feature-tag clean-tag">
              <span class="tag-icon">💬</span> 图文咨询
            </span>
          </div>
          <div class="card-action">
            <el-button type="primary" class="clean-btn-primary clean-btn">
              立即预约
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="card-decoration">
          <div class="floating-star star-1">⭐</div>
          <div class="floating-star star-2">🌟</div>
        </div>
      </div>

      <!-- 医院挂号 -->
      <div class="entry-card clean-card" @click="goToDoctor">
        <div class="card-glow gold"></div>
        <div class="card-icon gold">
          <span class="icon-emoji">🏥</span>
        </div>
        <div class="card-content">
          <h2 class="card-title">医院挂号</h2>
          <p class="card-desc">预约心理医生，到院就诊，获得专业诊疗服务</p>
          <div class="card-features">
            <span class="feature-tag clean-tag gold">
              <span class="tag-icon">📍</span> 附近医院
            </span>
            <span class="feature-tag clean-tag gold">
              <span class="tag-icon">👨‍⚕️</span> 专家号源
            </span>
            <span class="feature-tag clean-tag gold">
              <span class="tag-icon">📋</span> 病历管理
            </span>
          </div>
          <div class="card-action">
            <el-button class="clean-btn-secondary clean-btn">
              立即挂号
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="card-decoration">
          <div class="floating-star star-3">🌙</div>
          <div class="floating-star star-4">⭐</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

// 跳转到心理咨询师列表
const goToPsychologist = () => {
  router.push('/consultation/psychologist')
}

// 跳转到医院挂号
const goToDoctor = () => {
  router.push('/consultation/doctor')
}
</script>

<style scoped>
.psychologist-hub-container {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f7f5;
}

/* 页面标题 */
.hub-header {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
  z-index: 1;
}

.hub-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #3dad6f, #5bc4bf);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hub-subtitle {
  font-size: 18px;
  color: #6b7b6b;
  margin: 0;
}

/* 入口卡片 */
.entry-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;
}

.entry-card {
  position: relative;
  padding: 40px;
  cursor: pointer;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.entry-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 6px 24px rgba(61, 173, 111, 0.12);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(61, 173, 111, 0.06) 0%, transparent 60%);
  pointer-events: none;
  transition: opacity 0.3s;
}

.card-glow.gold {
  background: radial-gradient(circle at center, rgba(245, 166, 35, 0.08) 0%, transparent 60%);
}

.entry-card:hover .card-glow {
  opacity: 1.5;
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(61, 173, 111, 0.15) 0%, rgba(91, 196, 191, 0.1) 100%);
  border: 2px solid rgba(61, 173, 111, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 0 30px rgba(61, 173, 111, 0.1);
}

.card-icon.gold {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.15) 0%, rgba(244, 131, 108, 0.1) 100%);
  border-color: rgba(245, 166, 35, 0.2);
  box-shadow: 0 0 30px rgba(245, 166, 35, 0.1);
}

.icon-emoji {
  font-size: 40px;
}

.card-content {
  position: relative;
  z-index: 2;
}

.card-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a2e1a;
  margin: 0 0 12px;
}

.card-desc {
  font-size: 15px;
  color: #6b7b6b;
  margin: 0 0 20px;
  line-height: 1.6;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  background: #e8f5ee;
  color: #3dad6f;
  border-radius: 6px;
  font-weight: 500;
}

.feature-tag.gold {
  background: #fff8e1;
  color: #f5a623;
}

.tag-icon {
  font-size: 14px;
}

.card-action {
  display: flex;
}

.arrow-icon {
  margin-left: 8px;
  transition: transform 0.3s;
}

.entry-card:hover .arrow-icon {
  transform: translateX(4px);
}

/* Clean button styles */
.clean-btn-primary {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
  border-radius: 8px !important;
}

.clean-btn-primary:hover {
  background: #35a062 !important;
  border-color: #35a062 !important;
}

.clean-btn-secondary {
  background: #ffffff !important;
  border: 1px solid #3dad6f !important;
  color: #3dad6f !important;
  border-radius: 8px !important;
}

.clean-btn-secondary:hover {
  background: #3dad6f !important;
  color: #ffffff !important;
}

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-star {
  position: absolute;
  font-size: 20px;
  opacity: 0.6;
  animation: floatStar 6s infinite ease-in-out;
}

.star-1 { top: 20%; right: 15%; animation-delay: 0s; }
.star-2 { top: 60%; right: 25%; animation-delay: 1.5s; font-size: 16px; }
.star-3 { top: 15%; right: 20%; animation-delay: 0.5s; }
.star-4 { top: 55%; right: 10%; animation-delay: 2s; font-size: 18px; }

@keyframes floatStar {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-15px) rotate(180deg); opacity: 1; }
}


/* 响应式 */
@media (max-width: 992px) {
  .entry-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .psychologist-hub-container {
    padding: 24px 16px;
  }
  
  .hub-title {
    font-size: 32px;
  }
  
  .hub-subtitle {
    font-size: 15px;
  }
  
  .entry-card {
    padding: 28px;
  }
  
  .card-title {
    font-size: 22px;
  }
}
</style>
