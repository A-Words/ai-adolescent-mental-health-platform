<template>
  <div class="my-home-patients">
    <div class="page-header">
      <h2>就诊人病历管理</h2>
      <el-button type="primary" @click="handleAddPatient">添加就诊人</el-button>
    </div>

    <el-tabs v-model="activePatientId" @tab-click="handleTabClick">
      <el-tab-pane v-for="patient in patients" :key="patient.id" :label="patient.name" :name="String(patient.id)">
        <div class="patient-info-bar">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="姓名">{{ patient.name }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ calculateAge(patient.birthday) }}岁</el-descriptions-item>
            <el-descriptions-item label="性别">{{ patient.sex === 1 ? '男' : '女' }}</el-descriptions-item>
            <el-descriptions-item label="关系">{{ patient.relationship }}</el-descriptions-item>
            <el-descriptions-item label="操作">
              <el-button size="small" @click="handleEditPatient(patient)">修改</el-button>
              <el-button size="small" type="danger" @click="handleDeletePatient(patient.id)">删除</el-button>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="records-section">
          <div class="section-header">
            <h3>就诊经历</h3>
            <el-button type="success" size="small" @click="handleAddRecord">新增就诊经历</el-button>
          </div>
          
          <el-table :data="records" style="width: 100%" v-loading="loadingRecords">
            <el-table-column prop="visitDate" label="就诊日期" width="120"></el-table-column>
            <el-table-column prop="department" label="科室" width="120"></el-table-column>
            <el-table-column prop="hospital" label="医院" width="180"></el-table-column>
            <el-table-column prop="symptoms" label="病症" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="handleViewRecord(scope.row)">详情</el-button>
                <el-button size="small" type="danger" @click="handleDeleteRecord(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-empty v-if="patients.length === 0" description="暂无就诊人信息，请添加"></el-empty>

    <!-- Patient Dialog -->
    <el-dialog v-model="patientDialogVisible" :title="patientForm.id ? '修改就诊人' : '添加就诊人'" width="400px">
      <el-form :model="patientForm" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="patientForm.name"></el-input>
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="patientForm.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" required>
          <el-date-picker v-model="patientForm.birthday" type="date" value-format="YYYY-MM-DD" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="关系" required>
          <el-select v-model="patientForm.relationship" placeholder="请选择关系" style="width: 100%">
            <el-option label="本人" value="本人"></el-option>
            <el-option label="父母" value="父母"></el-option>
            <el-option label="子女" value="子女"></el-option>
            <el-option label="亲戚" value="亲戚"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="patientDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPatient">确定</el-button>
      </template>
    </el-dialog>

    <!-- Record Dialog -->
    <el-dialog v-model="recordDialogVisible" :title="recordForm.id ? '病历详情' : '新增就诊经历'" width="600px">
      <el-form :model="recordForm" label-width="100px" :disabled="isViewOnly">
        <el-form-item label="就诊日期" required>
          <el-date-picker v-model="recordForm.visitDate" type="date" value-format="YYYY-MM-DD" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="就诊科室" required>
          <el-input v-model="recordForm.department"></el-input>
        </el-form-item>
        <el-form-item label="就诊医院">
          <el-input v-model="recordForm.hospital"></el-input>
        </el-form-item>
        <el-form-item label="病症" required>
          <el-input type="textarea" v-model="recordForm.symptoms" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="病历单图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :on-remove="handleRemoveImage"
            :on-change="handleChange"
            :file-list="fileList"
            :auto-upload="false"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="recordForm.remarks" :rows="2"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">{{ isViewOnly ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!isViewOnly" type="primary" @click="submitRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import request from '@/api/user'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const patients = ref<any[]>([])
const activePatientId = ref('')
const records = ref<any[]>([])
const loadingRecords = ref(false)

const calculateAge = (birthday: string) => {
  if (!birthday) return 0
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const fetchPatients = async () => {
  try {
    const res = await request.get('/patient/list') as any
    if (res.code === 200) {
      patients.value = res.data
      if (patients.value.length > 0 && !activePatientId.value) {
        activePatientId.value = String(patients.value[0].id)
        fetchRecords(activePatientId.value)
      }
    }
  } catch (e) {}
}

const fetchRecords = async (patientId: string) => {
  loadingRecords.value = true
  try {
    const res = await request.get(`/medical-record/list/${patientId}`) as any
    if (res.code === 200) {
      records.value = res.data
    }
  } catch (e) {} finally {
    loadingRecords.value = false
  }
}

const handleTabClick = (tab: any) => {
  fetchRecords(tab.paneName)
}

// Patient Dialog Logic
const patientDialogVisible = ref(false)
const patientForm = reactive<any>({
  id: null,
  name: '',
  sex: 1,
  birthday: '',
  relationship: ''
})

const handleAddPatient = () => {
  Object.assign(patientForm, { id: null, name: '', sex: 1, birthday: '', relationship: '' })
  patientDialogVisible.value = true
}

const handleEditPatient = (patient: any) => {
  Object.assign(patientForm, patient)
  patientDialogVisible.value = true
}

const submitPatient = async () => {
  if (!patientForm.name || !patientForm.birthday || !patientForm.relationship) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const url = patientForm.id ? '/patient/update' : '/patient/add'
  const method = patientForm.id ? 'put' : 'post'
  try {
    const res = await request[method](url, patientForm) as any
    if (res.code === 200) {
      ElMessage.success('保存成功')
      patientDialogVisible.value = false
      fetchPatients()
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {}
}

const handleDeletePatient = (id: number) => {
  ElMessageBox.confirm('确定要删除该就诊人吗？其相关的病历也将无法通过该入口查看。', '警告', { type: 'warning' }).then(async () => {
    const res = await request.delete(`/patient/${id}`) as any
    if (res.code === 200) {
      ElMessage.success('删除成功')
      activePatientId.value = ''
      fetchPatients()
    }
  })
}

// Record Dialog Logic
const recordDialogVisible = ref(false)
const isViewOnly = ref(false)
const fileList = ref<any[]>([])
const recordForm = reactive<any>({
  id: null,
  patientContactId: null,
  visitDate: '',
  department: '',
  hospital: '',
  symptoms: '',
  remarks: '',
  images: []
})

const handleAddRecord = () => {
  isViewOnly.value = false
  fileList.value = []
  Object.assign(recordForm, {
    id: null,
    patientContactId: Number(activePatientId.value),
    visitDate: new Date().toISOString().split('T')[0],
    department: '',
    hospital: '',
    symptoms: '',
    remarks: '',
    images: []
  })
  recordDialogVisible.value = true
}

const handleViewRecord = (record: any) => {
  isViewOnly.value = true
  Object.assign(recordForm, {
    ...record,
    images: record.images ? [...record.images] : []
  })
  
  fileList.value = record.images ? record.images.map((url: string) => ({ 
    name: url.substring(url.lastIndexOf('/') + 1),
    url: url 
  })) : []
  
  recordDialogVisible.value = true
}

const handleUploadError = (error: any) => {
  let message = '上传失败'
  try {
    const response = JSON.parse(error.message)
    message = response.message || message
  } catch (e) {
    if (error.message && error.message.includes('400')) {
       message = '文件上传异常,文件不能超过3MB'
    }
  }
  ElMessage.error(message)
}

const beforeUpload = (file: any) => {
  const isLt3M = file.size / 1024 / 1024 < 3
  if (!isLt3M) {
    ElMessage.error('上传图片大小不能超过 3MB!')
    return false
  }
  fileList.value.push(file)
  return false
}

const handleRemoveImage = (file: any) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
  if (file.url && !file.raw) {
      const urlIndex = recordForm.images.indexOf(file.url)
      if (urlIndex > -1) {
          recordForm.images.splice(urlIndex, 1)
      }
  }
}

const handleChange = (uploadFile: any, uploadFiles: any[]) => {
  fileList.value = uploadFiles
  if (uploadFile.size / 1024 / 1024 > 3) {
    ElMessage.error('上传图片大小不能超过 3MB!')
    const idx = fileList.value.indexOf(uploadFile)
    if (idx > -1) fileList.value.splice(idx, 1)
  }
}

const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'medical-record')
    
    return request.post('/common/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

const submitRecord = async () => {
  if (!recordForm.visitDate || !recordForm.department || !recordForm.symptoms) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  const pendingFiles = fileList.value.filter((f: any) => f.raw)
  const newImageUrls: string[] = []
  
  if (pendingFiles.length > 0) {
      const loading = ElLoading.service({
          text: '正在上传图片...'
      })
      try {
          for (const file of pendingFiles) {
              const res = await uploadFile(file.raw) as any
              if (res.code === 200) {
                  newImageUrls.push(res.data)
              } else {
                  throw new Error(res.message || '上传失败')
              }
          }
          loading.close()
      } catch (e: any) {
          loading.close()
          ElMessage.error(e.message || '图片上传失败')
          return
      }
  }
  
  const finalImages = [...recordForm.images, ...newImageUrls]
  
  const url = recordForm.id ? '/medical-record/update' : '/medical-record/add'
  const method = recordForm.id ? 'put' : 'post'
  try {
    const res = await request[method](url, {
      record: {
        id: recordForm.id,
        patientContactId: recordForm.patientContactId,
        visitDate: recordForm.visitDate,
        department: recordForm.department,
        hospital: recordForm.hospital,
        symptoms: recordForm.symptoms,
        remarks: recordForm.remarks
      },
      images: finalImages
    }) as any
    if (res.code === 200) {
      ElMessage.success('保存成功')
      recordDialogVisible.value = false
      fetchRecords(activePatientId.value)
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {}
}

const handleDeleteRecord = (id: number) => {
  ElMessageBox.confirm('确定要删除该病历记录吗？', '提示', { type: 'warning' }).then(async () => {
    const res = await request.delete(`/medical-record/${id}`) as any
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchRecords(activePatientId.value)
    }
  })
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.my-home-patients {
  padding: 0 10px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1a2e1a !important;
}

.patient-info-bar {
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8) !important;
}

.records-section {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a2e1a !important;
}
</style>
