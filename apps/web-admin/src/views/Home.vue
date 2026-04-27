<template>
  <div class="home-page">
<!-- Greeting + Hero Banner -->
    <GreetingSection :nickname="userNickname" />

    <!-- Quick Action Shortcut Cards -->
    <ShortcutCards />

    <!-- Dashboard Panels -->
    <DashboardPanels
      :latest-message="latestAiMessage"
      :ai-loading="aiLoading"
      :next-appointment="nextAppointment"
      :appointment-loading="appointmentLoading"
      :latest-record="latestRecord"
      :record-loading="recordLoading"
      :recommendations="recommendations"
      :rec-loading="recLoading"
    />

    <!-- Care Plan -->
    <CarePlanCard />

    <!-- Mobile Feature Cards -->
    <div class="mobile-features">
      <div class="feature-grid">
        <div class="feature-card" @click="$router.push('/ai-consultation')">
          <div class="feature-icon">🤖</div>
          <h3>AI 树洞</h3>
          <p>24小时陪伴对话</p>
        </div>
        <div class="feature-card" @click="$router.push('/consultation')">
          <div class="feature-icon">👨‍⚕️</div>
          <h3>专业咨询</h3>
          <p>与专业咨询师对话</p>
        </div>
        <div class="feature-card" @click="$router.push('/assessments')">
          <div class="feature-icon">📊</div>
          <h3>心理小测试</h3>
          <p>了解你的心理状态</p>
        </div>
        <div class="feature-card" @click="$router.push('/articles')">
          <div class="feature-icon">📚</div>
          <h3>暖心短文</h3>
          <p>文章 · 课程 · 书单</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/api/user'
import { getUserRecords } from '@/api/assessment'
import { getMyAppointments } from '@/api/psychologistAppointment'
import { getArticles } from '@/api/content'
import GreetingSection from './home/components/GreetingSection.vue'
import ShortcutCards from './home/components/ShortcutCards.vue'
import DashboardPanels from './home/components/DashboardPanels.vue'
import CarePlanCard from './home/components/CarePlanCard.vue'

const userNickname = ref('欢迎回来')

const latestAiMessage = ref('')
const aiLoading = ref(false)

const nextAppointment = ref<any>(null)
const appointmentLoading = ref(false)

const latestRecord = ref<any>(null)
const recordLoading = ref(false)

const recommendations = ref<any[]>([])
const recLoading = ref(false)

onMounted(async () => {
  // Fetch user info
  try {
    const infoRes = await getUserInfo()
    if (infoRes.code === 200 && infoRes.data?.nickname) {
      userNickname.value = infoRes.data.nickname
    }
  } catch (e) { /* ignore */ }

  // Fetch appointments
  appointmentLoading.value = true
  try {
    const res = await getMyAppointments({ page: 1, size: 5 })
    if (res.code === 200) {
      const list = res.data?.records || res.data || []
      nextAppointment.value = list[0] || null
    }
  } catch (e) { /* ignore */ }
  finally { appointmentLoading.value = false }

  // Fetch assessment records
  recordLoading.value = true
  try {
    const res = await getUserRecords({ page: 1, size: 1 })
    if (res.code === 200 && res.data?.records?.length) {
      latestRecord.value = res.data.records[0]
    }
  } catch (e) { /* ignore */ }
  finally { recordLoading.value = false }

  // Fetch recommendations (articles)
  recLoading.value = true
  try {
    const res = await getArticles({ page: 1, size: 3 })
    if (res.code === 200 && res.data?.records) {
      recommendations.value = res.data.records.map((a: any) => ({
        ...a,
        type: '文章',
        author: a.tagName || '心理知识',
      }))
    }
  } catch (e) { /* ignore */ }
  finally { recLoading.value = false }
})


</script>

<style scoped>
.home-page {
  padding: 0 16px 32px;
  max-width: 1200px;
  margin: 30px auto;
}

@media (min-width: 768px) {
  .home-page {
    padding: 0 20px 32px;
  }
}

/* Mobile Feature Cards */
.mobile-features {
  display: none;
}

@media (max-width: 767px) {
  .mobile-features {
    display: block;
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  border: 1px solid #e8eee8;
  cursor: pointer;
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(61, 173, 111, 0.12);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.feature-card h3 {
  color: #1a2e1a;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
}

.feature-card p {
  color: #9ead9e;
  font-size: 12px;
  margin: 0;
}
</style>
