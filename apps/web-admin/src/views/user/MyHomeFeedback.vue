<template>
  <div class="my-home-feedback">
    <h2>我的反馈</h2>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="平台反馈" name="platform">
        <el-table :data="platformFeedbacks" v-loading="loadingPlatform" style="width: 100%">
          <el-table-column prop="content" label="反馈内容"></el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getPlatformStatusType(scope.row.status)">
                {{ getPlatformStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cancelReason" label="取消理由" width="200">
             <template #default="scope">
               {{ scope.row.status === 3 ? scope.row.cancelReason : '-' }}
             </template>
          </el-table-column>
          <el-table-column prop="createTime" label="提交时间" width="180"></el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="咨询反馈" name="consultation">
        <el-table :data="consultationFeedbacks" v-loading="loadingConsultation" style="width: 100%">
          <el-table-column prop="content" label="反馈内容"></el-table-column>
          <el-table-column prop="rating" label="评分" width="80"></el-table-column>
          <el-table-column prop="status" label="状态" width="120">
             <template #default="scope">
               <el-tag :type="getConsultationStatusType(scope.row.status)">
                 {{ getConsultationStatusText(scope.row.status) }}
               </el-tag>
             </template>
          </el-table-column>
          <el-table-column label="回复/理由">
             <template #default="scope">
               <div v-if="scope.row.status === 1">回复: {{ scope.row.replyContent }}</div>
               <div v-else-if="scope.row.status === 2">拒收理由: {{ scope.row.rejectReason }}</div>
               <div v-else>-</div>
             </template>
          </el-table-column>
          <el-table-column prop="createTime" label="提交时间" width="180"></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getMyPlatformFeedback, getMyConsultationFeedback } from '@/api/feedback'

const activeTab = ref('platform')
const platformFeedbacks = ref([])
const consultationFeedbacks = ref([])
const loadingPlatform = ref(false)
const loadingConsultation = ref(false)

const fetchPlatform = async () => {
  loadingPlatform.value = true
  try {
    const res = await getMyPlatformFeedback({ page: 1, size: 100 }) as any
    if (res.code === 200) {
      platformFeedbacks.value = res.data.records
    }
  } finally {
    loadingPlatform.value = false
  }
}

const fetchConsultation = async () => {
  loadingConsultation.value = true
  try {
    const res = await getMyConsultationFeedback({ page: 1, size: 100 }) as any
    if (res.code === 200) {
      consultationFeedbacks.value = res.data.records
    }
  } finally {
    loadingConsultation.value = false
  }
}

const getPlatformStatusText = (status: number) => {
  const map: any = { 0: '已反馈', 1: '待解决', 2: '已解决', 3: '已取消' }
  return map[status] || '未知'
}

const getPlatformStatusType = (status: number) => {
  const map: any = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const getConsultationStatusText = (status: number) => {
  const map: any = { 0: '已反馈', 1: '已接收', 2: '已拒收' }
  return map[status] || '未知'
}

const getConsultationStatusType = (status: number) => {
  const map: any = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

watch(activeTab, (val) => {
  if (val === 'platform') fetchPlatform()
  else fetchConsultation()
})

onMounted(() => {
  fetchPlatform()
})
</script>

<style scoped>
.my-home-feedback h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #1a2e1a !important;
}
</style>
