<template>
  <div class="assessment-history">
    <div class="page-header">
      <h2>我的心理测评中心</h2>
      <p class="subtitle">查看您的历史测评记录</p>
    </div>

    <div class="content-container">
      <!-- 左侧就诊人列表 -->
      <el-card class="patient-list-card">
        <div class="card-title">就诊人</div>
        <el-menu :default-active="activePatientId" class="patient-menu" @select="handlePatientSelect">
          <el-menu-item index="">
            <el-icon><User /></el-icon>
            <span>全部记录</span>
          </el-menu-item>
          <el-menu-item v-for="p in patients" :key="p.id" :index="String(p.id)">
            <el-icon><UserFilled /></el-icon>
            <span>{{ p.name }} ({{ p.relationship }})</span>
          </el-menu-item>
        </el-menu>
      </el-card>

      <!-- 右侧测评记录 -->
      <el-card class="history-card">
        <div class="card-title">{{ currentPatientName }}的测评记录</div>
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
      </el-card>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="测评报告" width="600px" class="report-dialog">
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
import { ref, onMounted, computed } from 'vue'
import { getUserRecords, getRecordDetail } from '@/api/assessment'
import { getPatientContacts } from '@/api/user'
import { ElMessage } from 'element-plus'
import { Reading, User, UserFilled } from '@element-plus/icons-vue'

const records = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const patients = ref<any[]>([])
const activePatientId = ref('')

const detailVisible = ref(false)
const currentDetail = ref<any>(null)

const currentPatientName = computed(() => {
  if (!activePatientId.value) return '全部'
  const p = patients.value.find(item => String(item.id) === activePatientId.value)
  return p ? p.name : '未知'
})

const fetchPatients = async () => {
  try {
    const res = await getPatientContacts()
    if (res.code === 200) {
      patients.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const params: any = { page: currentPage.value, size: pageSize.value }
    if (activePatientId.value) {
      params.patientContactId = activePatientId.value
    }
    const res = await getUserRecords(params)
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

const handlePatientSelect = (index: string) => {
  activePatientId.value = index
  currentPage.value = 1
  fetchRecords()
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
  fetchPatients()
  fetchRecords()
})
</script>

<style scoped>
.assessment-history {
  padding: 24px 40px;
  min-height: calc(100vh - 60px);
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 28px 32px;
  background: #ffffff;
  border: 1px solid #e8eee8;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
}
.page-header h2 {
  font-size: 28px;
  color: #3dad6f;
  margin-bottom: 10px;
}
.subtitle {
  color: #6b7b6b;
  font-size: 15px;
}

.content-container {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Cards */
:deep(.patient-list-card.el-card),
:deep(.history-card.el-card) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06) !important;
  color: #1a2e1a !important;
}
:deep(.patient-list-card .el-card__body),
:deep(.history-card .el-card__body) {
  background: transparent !important;
  color: #1a2e1a !important;
}

.patient-list-card {
  width: 240px;
  flex-shrink: 0;
}
.history-card {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8eee8;
  color: #3dad6f !important;
}

/* Patient Menu */
:deep(.patient-menu.el-menu) {
  background: transparent !important;
  border-right: none !important;
}
:deep(.patient-menu .el-menu-item) {
  color: #6b7b6b !important;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
}
:deep(.patient-menu .el-menu-item:hover) {
  background: #e8f5ee !important;
  color: #3dad6f !important;
}
:deep(.patient-menu .el-menu-item.is-active) {
  background: #e8f5ee !important;
  color: #3dad6f !important;
  font-weight: 600;
}

/* Table */
:deep(.history-card .el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #f5f7f5;
  --el-table-row-hover-bg-color: #e8f5ee;
  --el-table-border-color: #e8eee8;
  background: transparent !important;
  color: #1a2e1a !important;
}
:deep(.history-card .el-table__inner-wrapper::before) {
  display: none;
}
:deep(.history-card .el-table th.el-table__cell) {
  background: #f5f7f5 !important;
  color: #3dad6f !important;
  font-weight: 700;
  border-bottom: 1px solid #e8eee8 !important;
}
:deep(.history-card .el-table td.el-table__cell) {
  background: transparent !important;
  color: #1a2e1a !important;
  border-bottom: 1px solid #e8eee8 !important;
}
:deep(.history-card .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #f5f7f5 !important;
}

:deep(.history-card .el-button--primary.is-link) {
  background: transparent !important;
  border: none !important;
  color: #3dad6f !important;
  font-weight: 600;
  padding: 0;
}
:deep(.history-card .el-button--primary.is-link:hover) {
  color: #2d8a55 !important;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Pagination */
:deep(.history-card .el-pagination) {
  justify-content: center;
}
:deep(.history-card .el-pagination button) {
  color: #6b7b6b !important;
}
:deep(.history-card .el-pagination .el-pager li) {
  color: #6b7b6b !important;
  border-radius: 6px;
}
:deep(.history-card .el-pager li.is-active) {
  background: #3dad6f !important;
  color: #fff !important;
}

/* Dialog */
:deep(.report-dialog.el-dialog) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(61,173,111,0.12) !important;
}
:deep(.report-dialog .el-dialog__header) {
  background: transparent !important;
  border-bottom: 1px solid #e8eee8;
  padding: 20px 24px 16px;
}
:deep(.report-dialog .el-dialog__title) {
  color: #1a2e1a !important;
  font-weight: 700;
  font-size: 17px;
}
:deep(.report-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: #9ead9e !important;
}
:deep(.report-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #3dad6f !important;
}
:deep(.report-dialog .el-dialog__body) {
  background: transparent !important;
  color: #1a2e1a !important;
  padding: 24px;
}
:deep(.report-dialog .el-dialog__footer) {
  background: transparent !important;
  border-top: 1px solid #e8eee8;
  padding: 16px 24px 20px;
}
:deep(.report-dialog .el-button--primary) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 8px !important;
}
:deep(.report-dialog .el-button--primary:hover) {
  background: #2d8a55 !important;
  border-color: #2d8a55 !important;
}

/* Report Content */
.report-content {
  padding: 0;
  color: #1a2e1a !important;
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
  color: #6b7b6b !important;
  font-size: 14px;
  background: #f5f7f5 !important;
  padding: 14px 18px;
  border-radius: 8px;
  border: 1px solid #e8eee8;
  margin-bottom: 20px;
}
.score {
  color: #3dad6f !important;
  font-size: 20px;
  font-weight: 700;
}
.analysis-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3dad6f !important;
  margin-bottom: 15px;
  font-size: 17px;
  font-weight: 600;
}
.analysis-text {
  line-height: 1.9;
  color: #1a2e1a !important;
  background: #f5f7f5 !important;
  padding: 16px 20px;
  border-radius: 8px;
  border-left: 3px solid #3dad6f !important;
}
</style>

<style>
.el-dialog.report-dialog {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(61,173,111,0.12) !important;
}
.el-dialog.report-dialog .el-dialog__header {
  background: transparent !important;
  border-bottom: 1px solid #e8eee8;
  padding: 20px 24px 16px;
}
.el-dialog.report-dialog .el-dialog__title {
  color: #1a2e1a !important;
  font-weight: 700;
  font-size: 17px;
}
.el-dialog.report-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #9ead9e !important;
}
.el-dialog.report-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #3dad6f !important;
}
.el-dialog.report-dialog .el-dialog__body {
  background: transparent !important;
  color: #1a2e1a !important;
  padding: 24px;
}
.el-dialog.report-dialog .el-dialog__footer {
  background: transparent !important;
  border-top: 1px solid #e8eee8;
  padding: 16px 24px 20px;
}
.el-dialog.report-dialog .el-button--primary {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 8px !important;
}
.el-dialog.report-dialog .el-button--primary:hover {
  background: #2d8a55 !important;
  border-color: #2d8a55 !important;
}
</style>
