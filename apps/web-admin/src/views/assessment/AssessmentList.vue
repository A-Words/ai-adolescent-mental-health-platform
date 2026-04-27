<template>
  <div class="assessment-list">
    <div class="page-header">
      <h2>心理测评中心</h2>
      <p class="subtitle">探索自我，拥抱健康心灵</p>
      <el-button type="primary" plain round style="margin-top: 15px;" @click="router.push('/assessment-history')">
        查看我的测评记录 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
      </el-button>
    </div>
    
    <el-row :gutter="24">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in assessments" :key="item.id">
        <el-card class="assessment-card" shadow="hover" @click="startAssessment(item.id)">
          <div class="card-image" :style="{ background: item.color }">
             <el-icon :size="48" color="#fff"><component :is="item.icon" /></el-icon>
          </div>
          <div class="card-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <div class="card-footer">
                <el-tag size="small" type="success" round>专业量表</el-tag>
                <span class="start-btn">开始测评 <el-icon><ArrowRight /></el-icon></span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { ArrowRight, Sunny, Moon, Star, Reading } from '@element-plus/icons-vue'
import { getPublicTemplates } from '@/api/assessment'
import { ElMessage } from 'element-plus'

const router = useRouter()
const assessments = ref<any[]>([])
const loading = ref(false)

// 默认渐变色方案
const colorSchemes = [
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
    'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)'
]

const icons = [Sunny, Moon, Star, Reading]

const fetchAssessments = async () => {
    loading.value = true
    try {
        const res = await getPublicTemplates()
        if (res.code === 200) {
            assessments.value = res.data.map((item: any, index: number) => ({
                ...item,
                color: colorSchemes[index % colorSchemes.length],
                icon: icons[index % icons.length]
            }))
        } else {
            ElMessage.error(res.message || '加载失败')
        }
    } catch (error) {
        ElMessage.error('网络错误，请稍后再试')
    } finally {
        loading.value = false
    }
}

const startAssessment = (id: number) => {
  router.push(`/assessment/${id}`)
}

onMounted(() => {
    fetchAssessments()
})
</script>

<style scoped>
.assessment-list {
  padding: 20px 40px;
  min-height: calc(100vh - 60px);
  color: #1a2e1a;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}
.page-header h2 {
  font-size: 28px;
  color: #1a2e1a !important;
  margin-bottom: 10px;
}
.subtitle {
  color: #6b7b6b !important;
  font-size: 16px;
}

/* 卡片 */
.assessment-list :deep(.el-card) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  color: #1a2e1a !important;
}
.assessment-list :deep(.el-card__body) {
  padding: 0 !important;
  color: #1a2e1a !important;
}
.assessment-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}
.assessment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}
.assessment-list :deep(.el-col) {
  background: transparent;
}

.card-image {
  height: 140px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-content {
  padding: 20px;
}
.card-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #1a2e1a !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-content p {
  font-size: 13px;
  color: #6b7b6b !important;
  line-height: 1.5;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 15px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 标签 */
.assessment-list :deep(.el-tag) {
  border: none !important;
  font-weight: 600;
}
.assessment-list :deep(.el-tag--primary) {
  background: rgba(61, 173, 111, 0.12) !important;
  color: #3dad6f !important;
}
.assessment-list :deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.25) !important;
  color: #3dad6f !important;
}
.assessment-list :deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.25) !important;
  color: #FFB347 !important;
}
.assessment-list :deep(.el-tag--info) {
  background: rgba(201, 91, 155, 0.25) !important;
  color: #FF99CC !important;
}

.start-btn {
  font-size: 13px;
  color: #3dad6f !important;
  display: flex;
  align-items: center;
  gap: 4px;
}

.assessment-list :deep(.el-button.is-plain) {
  background: rgba(61, 173, 111, 0.06) !important;
  border-color: rgba(61, 173, 111, 0.3) !important;
  color: #3dad6f !important;
}
.assessment-list :deep(.el-button.is-plain:hover) {
  background: rgba(61, 173, 111, 0.12) !important;
  color: #1a2e1a !important;
}
</style>
