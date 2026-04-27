<template>
  <div class="my-home-assessments">
    <div class="page-header">
      <h2>我的测评记录</h2>
      <p class="subtitle">查看您的历史测评记录</p>
    </div>

    <el-table :data="records" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="templateTitle" label="测评量表" min-width="200"></el-table-column>
      <el-table-column prop="record.createTime" label="测评时间" width="180"></el-table-column>
      <el-table-column prop="record.resultScore" label="得分" width="100"></el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="viewDetail(scope.row.record.id)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="测评报告" width="600px" custom-class="report-dialog">
      <div v-if="currentDetail" class="report-content">
        <h3 class="report-title">{{ currentDetail.templateTitle }}</h3>
        <div class="report-meta">
          <span>测评时间：{{ currentDetail.record.createTime }}</span>
          <span>总得分：<strong class="score">{{ currentDetail.record.resultScore }}</strong></span>
        </div>
        <el-divider border-style="dashed" />
        <div class="analysis-section">
          <h4><el-icon><Reading /></el-icon> 结果分析</h4>
          <p class="analysis-text">{{ currentDetail.record.resultAnalysis }}</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserRecords, getRecordDetail } from '@/api/assessment'
import { ElMessage } from 'element-plus'
import { Reading } from '@element-plus/icons-vue'

const records = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailVisible = ref(false)
const currentDetail = ref<any>(null)

const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await getUserRecords({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      records.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载记录失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后再试')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchRecords()
}

const viewDetail = async (id: number) => {
  try {
    const res = await getRecordDetail(id)
    if (res.code === 200) {
      currentDetail.value = res.data
      detailVisible.value = true
    } else {
      ElMessage.error(res.message || '加载详情失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后再试')
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.my-home-assessments {
  padding: 0 10px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1a2e1a !important;
}

.subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.55) !important;
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.report-content {
  padding: 10px 20px;
}

.report-title {
  text-align: center;
  font-size: 22px;
  color: #1a2e1a !important;
  margin-bottom: 20px;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.75) !important;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.06) !important;
  padding: 12px 15px;
  border-radius: 6px;
}

.score {
  color: #FF8C9A !important;
  font-size: 18px;
  font-weight: bold;
}

.analysis-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3dad6f !important;
  margin-bottom: 15px;
  font-size: 18px;
}

.analysis-text {
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9) !important;
  background: rgba(61, 173, 111, 0.08) !important;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid rgba(61, 173, 111, 0.5) !important;
}
</style>
