<template>
  <div class="consultation-container">
    <el-tabs v-model="activeTab" class="consultation-tabs">
      <el-tab-pane label="找医生/预约挂号" name="offline">
        <!-- Step 1: Select Hospital -->
        <div v-if="step === 1" class="step-container">
            <div class="search-filter clean-toolbar">
                <div class="filter-options clean-filter-row">
                    <el-select v-model="searchQuery.minRating" placeholder="评分" clearable popper-class="clean-select-dropdown" @change="handleSearch" class="clean-select">
                        <el-option label="不限" :value="undefined"></el-option>
                        <el-option label="4.5分以上" :value="4.5"></el-option>
                        <el-option label="4.0分以上" :value="4.0"></el-option>
                    </el-select>
                    <el-select v-model="searchQuery.maxPrice" placeholder="价格" clearable popper-class="clean-select-dropdown" @change="handleSearch" class="clean-select">
                        <el-option label="不限" :value="undefined"></el-option>
                        <el-option label="50元以下" :value="50"></el-option>
                        <el-option label="100元以下" :value="100"></el-option>
                        <el-option label="200元以下" :value="200"></el-option>
                    </el-select>
                </div>
                <el-input 
                    v-model="searchQuery.name" 
                    placeholder="按医生姓名搜索..." 
                    class="search-input clean-search-input"
                    clearable
                    @input="debouncedSearch"
                >
                    <template #append>
                        <el-button class="clean-search-btn" @click="handleSearch">搜索</el-button>
                    </template>
                </el-input>
            </div>

            <div v-if="isSearching" class="doctor-list">
                <h3>搜索结果</h3>
                <el-row :gutter="20">
                    <el-col :span="24" v-for="doc in searchResults" :key="doc.id">
                        <el-card shadow="hover" class="doctor-item-card">
                            <div class="doctor-item">
                                <el-avatar :size="64" :src="doc.headPath || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
                                <div class="doc-info">
                                    <h4>{{ doc.realName }} <el-tag size="small">{{ doc.title }}</el-tag></h4>
                                    <p>{{ doc.specialty }}</p>
                                    <p class="hospital">{{ doc.hospitalName }}</p>
                                    <div class="rating">
                                        <el-rate v-model="doc.ratingScore" disabled show-score text-color="#ff9900" />
                                    </div>
                                    <p class="price">¥ {{ doc.consultationPrice }}</p>
                                </div>
                                <div class="doc-action">
                                    <el-button type="primary" @click="handleBook(doc)">立即预约</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
                <el-empty v-if="!searchResults.length" description="未搜索到匹配医生"></el-empty>
            </div>

            <div v-else>
                <h3>热门医院</h3>
                <el-row :gutter="20">
                    <el-col :span="6" v-for="h in hospitals" :key="h.id">
                    <el-card shadow="hover" class="hospital-card" @click="selectHospital(h)">
                        <img :src="h.picture || 'https://via.placeholder.com/300x200?text=Hospital'" class="hospital-img" />
                        <div class="hospital-info">
                            <h4>{{ h.name }}</h4>
                            <p class="address"><el-icon><Location /></el-icon> {{ h.address || '暂无地址' }}</p>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
        </div>

        <!-- Step 2: Select Department -->
        <div v-if="step === 2" class="step-container clean-step">
            <el-page-header class="clean-page-header" @back="step = 1" content="选择科室" />
            <div class="dept-list">
                <el-button 
                    v-for="d in departments" 
                    :key="d.id" 
                    class="dept-btn clean-dept-btn" 
                    :type="selectedDepartment?.id === d.id ? 'primary' : 'default'"
                    @click="selectDepartment(d)"
                >
                    {{ d.name }}
                </el-button>
            </div>
            <el-empty v-if="!departments.length" description="该医院暂无科室信息"></el-empty>
        </div>

        <!-- Step 3: Select Date & Doctor -->
        <div v-if="step === 3" class="step-container clean-step">
            <el-page-header class="clean-page-header" @back="step = 2" :content="`${selectedHospital?.name} - ${selectedDepartment?.name}`" />
            
            <div class="date-selector clean-date-selector">
                <el-radio-group v-model="selectedDate" class="clean-date-group" @change="fetchAvailableDoctors">
                    <el-radio-button v-for="date in next7Days" :key="date.value" :label="date.value">
                        <div class="date-cell">
                            <span>{{ date.label }}</span>
                            <span class="date-num">{{ date.dateStr }}</span>
                        </div>
                    </el-radio-button>
                </el-radio-group>
            </div>

            <div v-loading="loadingDoctors" class="doctor-list">
                <el-empty v-if="!doctors.length" description="该日期暂无医生排班"></el-empty>
                <el-row :gutter="20" v-else>
                    <el-col :span="24" v-for="doc in doctors" :key="doc.id">
                        <el-card shadow="hover" class="doctor-item-card">
                            <div class="doctor-item">
                                <el-avatar :size="64" :src="doc.headPath || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
                                <div class="doc-info">
                                    <h4>{{ doc.realName }} <el-tag size="small">{{ doc.title }}</el-tag></h4>
                                    <p>{{ doc.specialty }}</p>
                                    <p class="price">¥ {{ doc.consultationPrice }}</p>
                                </div>
                                <div class="doc-action">
                                    <el-button type="primary" @click="handleBook(doc)">预约挂号</el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>
        <!-- Step 4: Fill Description -->
        <div v-if="step === 4" class="step-container">
            <el-page-header @back="step = 3" content="填写病情描述" />
            <div class="form-container" style="margin-top: 20px; max-width: 600px;">
                <el-form label-width="100px">
                    <el-form-item label="病情描述">
                        <el-input 
                            v-model="description" 
                            type="textarea" 
                            :rows="5" 
                            placeholder="请详细描述您的症状、持续时间、既往病史等，以便医生更好地为您服务。"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitBooking">提交预约</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <!-- Step 5: Payment -->
        <div v-if="step === 5" class="step-container">
            <el-result icon="success" title="预约提交成功" sub-title="请支付挂号费以完成预约">
                <template #extra>
                    <p>需支付：<span style="color: red; font-size: 20px;">¥ {{ currentDoctor?.consultationPrice }}</span></p>
                    <div style="margin-top: 20px;">
                        <el-button type="primary" @click="handlePayment" :loading="payLoading">立即支付</el-button>
                        <el-button @click="goToMyAppointments">稍后支付</el-button>
                    </div>
                </template>
            </el-result>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="线上医生咨询" name="online">
         <div class="chat-container">
            <div class="chat-list" v-if="!currentChat">
                <el-empty description="暂无咨询会话" v-if="chatList.length === 0">
                    <el-button type="primary" @click="startNewConsultation">发起新咨询</el-button>
                </el-empty>
                <div v-else>
                    <el-card v-for="chat in chatList" :key="chat.id" class="chat-item" @click="openChat(chat)">
                        <div class="chat-summary">
                            <el-avatar :src="chat.doctorAvatar"></el-avatar>
                            <div class="info">
                                <h4>{{ chat.doctorName }}</h4>
                                <p>{{ chat.lastMessage }}</p>
                            </div>
                            <span class="time">{{ chat.time }}</span>
                        </div>
                    </el-card>
                </div>
            </div>

            <div class="chat-room" v-else>
                <div class="chat-header">
                    <el-button icon="ArrowLeft" circle @click="currentChat = null"></el-button>
                    <span>{{ currentChat.doctorName }}</span>
                </div>
                <div class="messages" ref="messageBox">
                    <div v-for="msg in currentChat.messages" :key="msg.id" class="message-row" :class="{ 'self': msg.isSelf }">
                        <el-avatar v-if="!msg.isSelf" :src="currentChat.doctorAvatar"></el-avatar>
                        <div class="message-content">
                            <div v-if="msg.type === 'text'" class="text-msg">{{ msg.content }}</div>
                            <div v-if="msg.type === 'image'" class="image-msg">
                                <el-image :src="msg.content" :preview-src-list="[msg.content]" style="max-width: 200px; border-radius: 4px;"></el-image>
                            </div>
                            <div v-if="msg.type === 'assessment'" class="assessment-card">
                                <h4>{{ msg.content.title }}</h4>
                                <p>{{ msg.content.desc }}</p>
                                <el-button type="primary" size="small" @click="takeAssessment(msg.content.id)">开始测评</el-button>
                            </div>
                        </div>
                        <el-avatar v-if="msg.isSelf" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
                    </div>
                </div>
                <div class="input-area">
                    <el-input v-model="chatInput" placeholder="请输入消息..." @keyup.enter="sendMessage"></el-input>
                    <el-button type="primary" @click="sendMessage">发送</el-button>
                </div>
            </div>
         </div>
      </el-tab-pane>

      <el-tab-pane label="我的咨询/预约" name="history">
        <div class="history-list clean-history-panel">
             <el-table :data="myAppointments" class="clean-appointments-table" style="width: 100%">
                 <el-table-column prop="doctorName" label="医生"></el-table-column>
                 <el-table-column prop="hospitalName" label="医院"></el-table-column>
                 <el-table-column prop="date" label="时间"></el-table-column>
                 <el-table-column prop="type" label="类型">
                     <template #default="scope">
                         {{ scope.row.type === 'offline' ? '线下挂号' : '线上咨询' }}
                     </template>
                 </el-table-column>
                 <el-table-column prop="status" label="状态">
                     <template #default="scope">
                         <el-tag type="warning" v-if="scope.row.status === 4">待支付</el-tag>
                         <el-tag type="primary" v-else-if="scope.row.status === 0">待就诊</el-tag>
                         <el-tag type="success" v-else-if="scope.row.status === 1">已完成</el-tag>
                         <el-tag type="info" v-else-if="scope.row.status === 2">已取消</el-tag>
                         <el-tag type="danger" v-else>爽约</el-tag>
                     </template>
                 </el-table-column>
                 <el-table-column label="操作" width="250">
                     <template #default="scope">
                         <el-button 
                             size="small" 
                             @click="handleViewDetail(scope.row)"
                         >
                             查看详情
                         </el-button>
                         <el-button 
                             v-if="scope.row.status === 4" 
                             size="small" 
                             type="success" 
                             @click="payAppointment(scope.row)"
                         >
                             支付费用
                         </el-button>
                         <el-button 
                             v-if="scope.row.status === 4 || scope.row.status === 0" 
                             size="small" 
                             type="danger" 
                             @click="cancelAppointment(scope.row)"
                         >
                             {{ scope.row.status === 0 ? '退号/退费' : '取消预约' }}
                         </el-button>
                         <el-button 
                             v-if="scope.row.status === 1 && !scope.row.hasFeedback" 
                             size="small" 
                             type="primary" 
                             @click="openFeedbackDialog(scope.row)"
                         >
                             评价/反馈
                         </el-button>
                         <el-tag type="info" v-else-if="scope.row.hasFeedback">已评价</el-tag>
                         
                         <el-button 
                             v-if="scope.row.status === 1 || scope.row.status === 3" 
                             size="small" 
                             type="warning" 
                             @click="openComplaintDialog(scope.row)"
                         >
                             投诉
                         </el-button>
                     </template>
                 </el-table-column>
             </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="预约详情" width="600px" class="clean-dialog">
        <el-descriptions :column="1" border v-if="appointmentDetail">
            <el-descriptions-item label="医院">{{ appointmentDetail.hospitalName }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ appointmentDetail.hospitalAddress || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="医生">{{ appointmentDetail.doctorName }} ({{ appointmentDetail.doctorTitle || '医生' }})</el-descriptions-item>
            <el-descriptions-item label="就诊时间">{{ formatWorkDate(appointmentDetail) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
                <el-tag type="warning" v-if="appointmentDetail.status === 4">待支付</el-tag>
                <el-tag type="primary" v-else-if="appointmentDetail.status === 0">待就诊</el-tag>
                <el-tag type="success" v-else-if="appointmentDetail.status === 1">已完成</el-tag>
                <el-tag type="info" v-else-if="appointmentDetail.status === 2">已取消</el-tag>
                <el-tag type="danger" v-else>爽约</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="挂号费">¥ {{ appointmentDetail.fee }}</el-descriptions-item>
            <el-descriptions-item label="支付时间" v-if="appointmentDetail.payTime">{{ formatTime(appointmentDetail.payTime) }}</el-descriptions-item>
            <el-descriptions-item label="病情描述">{{ appointmentDetail.description }}</el-descriptions-item>
            
            <el-descriptions-item label="我的评价" v-if="appointmentDetail.feedbackContent">
                <el-rate v-model="appointmentDetail.feedbackRating" disabled show-score text-color="#ff9900" />
                <div style="margin-top: 5px;">{{ appointmentDetail.feedbackContent }}</div>
                <div v-if="appointmentDetail.feedbackReply" style="margin-top: 10px; background: #f5f7fa; padding: 10px; border-radius: 4px;">
                    <span style="font-weight: bold; color: #409EFF;">医生回复：</span>{{ appointmentDetail.feedbackReply }}
                </div>
            </el-descriptions-item>
        </el-descriptions>
        <template #footer>
            <el-button @click="detailVisible = false">关闭</el-button>
        </template>
    </el-dialog>

    <!-- Booking Dialog -->
    <el-dialog v-model="bookingVisible" title="确认预约信息" width="450px" class="clean-dialog">
        <el-form label-width="80px">
            <el-form-item label="医生">
                <span>{{ currentDoctor?.realName }} ({{ currentDoctor?.title }})</span>
            </el-form-item>
            <el-form-item label="就诊人" required>
                <el-select v-model="selectedPatientId" placeholder="请选择就诊人" style="width: 100%" class="clean-select" popper-class="clean-select-dropdown">
                    <el-option v-for="p in patients" :key="p.id" :label="p.name" :value="p.id"></el-option>
                </el-select>
                <el-link type="primary" underline="never" @click="router.push('/patient-records')" style="font-size: 12px; margin-top: 5px;">管理就诊人</el-link>
            </el-form-item>
            <el-form-item label="日期">
                <span>{{ selectedDate }}</span>
            </el-form-item>
            <el-form-item label="病情描述" required>
                <el-input type="textarea" v-model="description" :rows="3" placeholder="请简单描述您的症状..."></el-input>
            </el-form-item>
            <el-form-item label="预约类型" required>
                <el-radio-group v-model="bookingType">
                    <el-radio :label="0">线下就诊</el-radio>
                    <el-radio :label="1" :disabled="currentDoctor?.isOnlineConsultEnabled === 0">线上咨询</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="bookingVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmBooking">确定</el-button>
        </template>
    </el-dialog>

    <!-- Feedback Dialog -->
    <el-dialog v-model="consultationFeedbackVisible" title="咨询反馈" width="500px" class="clean-dialog">
        <el-form :model="cfForm">
            <el-form-item label="评分">
                <el-rate v-model="cfForm.rating"></el-rate>
            </el-form-item>
            <el-form-item label="反馈内容">
                <el-input type="textarea" v-model="cfForm.content" :rows="4" placeholder="请评价医生的服务..."></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="consultationFeedbackVisible = false">取消</el-button>
            <el-button type="primary" @click="submitConsultationFeedbackForm">提交</el-button>
        </template>
    </el-dialog>

    <!-- Complaint Dialog -->
    <el-dialog v-model="complaintVisible" title="投诉医生" width="500px" class="clean-dialog">
        <el-form :model="complaintForm" label-width="80px">
            <el-form-item label="投诉内容" required>
                <el-input type="textarea" v-model="complaintForm.content" :rows="4" placeholder="请详细描述医生在咨询中的不合理行为..."></el-input>
            </el-form-item>
            <el-form-item label="上传证明">
                <el-upload
                    action="/api/common/upload"
                    :headers="uploadHeaders"
                    list-type="picture-card"
                    :on-success="handleUploadSuccess"
                    :on-remove="handleRemove"
                >
                    <el-icon><Plus /></el-icon>
                </el-upload>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="complaintVisible = false">取消</el-button>
            <el-button type="primary" @click="submitComplaintForm">提交投诉</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, reactive, onUnmounted, watch } from 'vue'
import request from '@/api/user'
import { searchDoctors, sendMessage as apiSendMessage, getMessageHistory, submitComplaint } from '@/api/consultation'
import { submitConsultationFeedback } from '@/api/feedback'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
 
const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 500) => {
    let timer: ReturnType<typeof setTimeout> | null = null
    return (...args: Parameters<T>) => {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => fn(...args), delay)
    }
}

const user = JSON.parse(localStorage.getItem('user') || '{}')
const userId = computed(() => user.id)
const router = useRouter()

const uploadHeaders = computed(() => {
    return {
        token: localStorage.getItem('token') || ''
    }
})

const isSearching = ref(false)
const searchQuery = reactive({
    name: '',
    minRating: undefined,
    maxPrice: undefined,
})
const searchResults = ref<any[]>([])

const handleSearch = async () => {
    if (!searchQuery.name && !searchQuery.minRating && !searchQuery.maxPrice) {
        isSearching.value = false
        return
    }
    isSearching.value = true
    try {
        const res = await searchDoctors(searchQuery) as any
        if (res.code === 200) {
            searchResults.value = res.data
        }
    } catch (e) {
        ElMessage.error('搜索失败')
    }
}

const debouncedSearch = debounce(handleSearch, 500)
const myAppointments = ref<any[]>([])

const fetchMyAppointments = async () => {
    try {
        const res = await request.get('/consultation/appointments/my') as any
        if (res.code === 200) {
            myAppointments.value = res.data.records.map((a: any) => ({
                id: a.id,
                doctorId: a.doctorId,
                doctorName: a.doctorName,
                hospitalName: a.hospitalName !== null ? a.hospitalName : '暂无数据',
                date: a.workDate + (a.workShift === 1 ? ' 上午' : a.workShift === 2 ? ' 下午' : ' 晚班'),
                type: a.type === 1 ? 'online' : 'offline',
                status: a.status,
                payStatus: a.payStatus,
                fee: a.fee,
                hasFeedback: false // Can be enhanced later
            }))

            chatList.value = res.data.records
                .filter((a: any) => a.type === 1 && [0, 1].includes(a.status))
                .map((a: any) => ({
                    id: a.id,
                    appointmentId: a.id,
                    doctorName: a.doctorName,
                    doctorAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
                    lastMessage: '点击查看咨询',
                    time: a.workDate,
                    messages: []
                }))
        }
    } catch (e) {}
}

const cancelAppointment = async (row: any) => {
    try {
        const res = await request.post(`/consultation/appointment/${row.id}/cancel`) as any
        if (res.code === 200) {
            ElMessage.success(res.data || '取消成功')
            fetchMyAppointments()
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
        ElMessage.error('操作失败')
    }
}

const payAppointment = async (row: any) => {
    try {
        const res = await request.post(`/consultation/appointment/${row.id}/pay`) as any
        if (res.code === 200) {
            ElMessage.success('支付成功')
            fetchMyAppointments()
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
        ElMessage.error('支付失败')
    }
}

const activeTab = ref('offline')
watch(activeTab, (val) => {
    if (val === 'history' || val === 'online') {
        fetchMyAppointments()
    }
})
const step = ref(1)
const hospitals = ref<any[]>([])
const departments = ref<any[]>([])
const doctors = ref<any[]>([])

const chatList = ref<any[]>([])
const currentChat = ref<any>(null)
const chatInput = ref('')
const messageBox = ref<any>(null)
let sse: EventSource | null = null

// Removed mock myAppointments

const detailVisible = ref(false)
const appointmentDetail = ref<any>(null)

const handleViewDetail = async (row: any) => {
    try {
        const res = await request.get(`/consultation/appointment/${row.id}/detail`) as any
        if (res.code === 200) {
            appointmentDetail.value = res.data
            detailVisible.value = true
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
        ElMessage.error('获取详情失败')
    }
}

const formatWorkDate = (detail: any) => {
    if (!detail.workDate) return ''
    const shift = detail.workShift === 1 ? ' 上午' : detail.workShift === 2 ? ' 下午' : ' 晚班'
    return detail.workDate + shift
}

const formatTime = (time: string) => {
    return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : ''
}

const consultationFeedbackVisible = ref(false)
const cfForm = reactive({ appointmentId: undefined, doctorId: undefined, rating: 5, content: '' })

const openFeedbackDialog = (row: any) => {
    cfForm.appointmentId = row.id
    cfForm.doctorId = row.doctorId
    cfForm.rating = 5
    cfForm.content = ''
    consultationFeedbackVisible.value = true
}

const submitConsultationFeedbackForm = async () => {
    if (!cfForm.content) {
        ElMessage.warning('请输入反馈内容')
        return
    }
    const res = await submitConsultationFeedback(cfForm) as any
    if (res.code === 200) {
        ElMessage.success('评价成功')
        consultationFeedbackVisible.value = false
        // Update local status
        const item = myAppointments.value.find(i => i.id === cfForm.appointmentId)
        if (item) item.hasFeedback = true
    } else {
        ElMessage.error(res.message || '评价失败')
    }
}

const complaintVisible = ref(false)
const complaintForm = reactive({
    appointmentId: undefined,
    content: '',
    proofImages: [] as string[]
})

const openComplaintDialog = (row: any) => {
    complaintForm.appointmentId = row.id
    complaintForm.content = ''
    complaintForm.proofImages = []
    complaintVisible.value = true
}

const handleUploadSuccess = (res: any) => {
    if (res.code === 200) {
        complaintForm.proofImages.push(res.data)
    }
}

const handleRemove = (file: any) => {
    const url = file.response?.data
    if (url) {
        const index = complaintForm.proofImages.indexOf(url)
        if (index > -1) {
            complaintForm.proofImages.splice(index, 1)
        }
    }
}

const submitComplaintForm = async () => {
    if (!complaintForm.content) {
        ElMessage.warning('请填写投诉内容')
        return
    }
    if (!complaintForm.appointmentId) {
        ElMessage.warning('预约ID不存在')
        return
    }
    try {
        const res = await submitComplaint({
            appointmentId: complaintForm.appointmentId as number,
            content: complaintForm.content,
            proofImages: complaintForm.proofImages
        }) as any
        if (res.code === 200) {
            ElMessage.success('投诉提交成功，请等待审核')
            complaintVisible.value = false
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
        ElMessage.error('提交失败')
    }
}


const startNewConsultation = () => {
    activeTab.value = 'offline'
    step.value = 1
}

const openChat = async (chat: any) => {
    currentChat.value = chat
    try {
        const res = await getMessageHistory(chat.appointmentId)
        if (res.code === 200) {
            currentChat.value.messages = res.data.map((m: any) => ({
                id: m.id,
                content: m.content,
                type: m.type === 0 ? 'text' : m.type === 1 ? 'image' : m.type === 2 ? 'assessment' : 'prescription',
                isSelf: m.senderId === userId.value
            }))
            scrollToBottom()
            setupSse(chat.appointmentId)
        }
    } catch (e) {
        ElMessage.error('获取聊天历史失败')
    }
}

const setupSse = (appointmentId: number) => {
    if (sse) { sse.close() }
    const token = localStorage.getItem('token') || ''
    sse = new EventSource(`/api/consultation/message/stream/${appointmentId}?token=${encodeURIComponent(token)}`)
    sse.onmessage = (e) => {
        try {
            const m = JSON.parse(e.data)
            if (m.senderId === userId.value) return
            currentChat.value?.messages.push({
                id: m.id,
                content: m.content,
                type: m.type === 0 ? 'text' : 'image',
                isSelf: false
            })
            scrollToBottom()
        } catch {}
    }
}

const sendMessage = async () => {
    if (!chatInput.value) return
    try {
        const res = await apiSendMessage({
            appointmentId: currentChat.value.appointmentId,
            content: chatInput.value,
            type: 0 // Text
        })
        if (res.code === 200) {
            currentChat.value.messages.push({
                id: Date.now(),
                type: 'text',
                content: chatInput.value,
                isSelf: true
            })
            chatInput.value = ''
            scrollToBottom()
        }
    } catch (e) {
        ElMessage.error('发送失败')
    }
}

const takeAssessment = (id: number) => {
    router.push(`/assessment/${id}`)
}

const scrollToBottom = () => {
    nextTick(() => {
        if (messageBox.value) {
            messageBox.value.scrollTop = messageBox.value.scrollHeight
        }
    })
}

const selectedHospital = ref<any>(null)
const selectedDepartment = ref<any>(null)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

const bookingVisible = ref(false)
const currentDoctor = ref<any>(null)
const bookingLoading = ref(false)
const loadingDoctors = ref(false)

const next7Days = computed(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
        const d = dayjs().add(i, 'day')
        days.push({
            value: d.format('YYYY-MM-DD'),
            label: i === 0 ? '今天' : i === 1 ? '明天' : d.format('dddd'), // You might need locale config for 'dddd' to be Chinese
            dateStr: d.format('MM-DD')
        })
    }
    return days
})

const fetchHospitals = async () => {
    try {
        const res = await request.get('/common/hospitals') as any
        if (res.code === 200) {
            hospitals.value = res.data
        }
    } catch (e) {}
}

const selectHospital = async (h: any) => {
    selectedHospital.value = h
    step.value = 2
    // Fetch departments
    try {
        const res = await request.get('/common/departments', { params: { hospitalId: h.id } }) as any
        if (res.code === 200) {
            departments.value = res.data
        }
    } catch (e) {}
}

const selectDepartment = (d: any) => {
    selectedDepartment.value = d
    step.value = 3
    fetchAvailableDoctors()
}

const fetchAvailableDoctors = async () => {
    if (!selectedDepartment.value) return
    loadingDoctors.value = true
    try {
        // Need to implement this endpoint in ConsultationController
        const res = await request.get('/consultation/doctors/available', { 
            params: { 
                departmentId: selectedDepartment.value.id,
                date: selectedDate.value
            } 
        }) as any
        if (res.code === 200) {
            doctors.value = res.data
        }
    } catch (e) {
        console.error(e)
    } finally {
        loadingDoctors.value = false
    }
}

const description = ref('')
const bookingType = ref(0)
const currentAppointmentId = ref<string>('')
const payLoading = ref(false)
const selectedPatientId = ref<number | null>(null)
const patients = ref<any[]>([])

const fetchPatients = async () => {
    try {
        const res = await request.get('/patient/list') as any
        if (res.code === 200) {
            patients.value = res.data
            if (patients.value.length === 0) {
                ElMessageBox.confirm('您还没有添加就诊人信息，请先前往病历管理添加就诊人。', '提示', {
                    confirmButtonText: '前往添加',
                    cancelButtonText: '取消',
                    type: 'info'
                }).then(() => {
                    router.push('/patient-records')
                })
            }
        }
    } catch (e) {}
}

const handleBook = (doc: any) => {
    currentDoctor.value = doc
    fetchPatients()
    bookingVisible.value = true
}

const confirmBooking = () => {
    bookingVisible.value = false
    step.value = 4
}

const submitBooking = async () => {
    if (!selectedPatientId.value) {
        ElMessage.warning('请选择就诊人')
        return
    }
    if (!description.value) {
        ElMessage.warning('请填写病情描述')
        return
    }
    bookingLoading.value = true
    try {
        // Need scheduleId. 
        // Logic: Fetch schedules for doctor/date, pick first available. 
        // ideally user picks specific time slot if supported, but let's stick to "Day/Shift" -> Schedule
        const schedRes = await request.get('/consultation/schedules', {
            params: {
                doctorId: currentDoctor.value.id,
                startDate: selectedDate.value,
                endDate: selectedDate.value
            }
        }) as any
        
        if (schedRes.code === 200 && schedRes.data.length > 0) {
            const schedule = schedRes.data[0] 
            
            const res = await request.post('/consultation/appointment', {
                scheduleId: schedule.id,
                patientContactId: selectedPatientId.value,
                description: description.value,
                type: bookingType.value
            }) as any
            
            if (res.code === 200) {
                ElMessage.success('预约成功，请前往支付')
                currentAppointmentId.value = res.data // Backend returns ID string
                step.value = 5
            } else {
                ElMessage.error(res.message)
            }
        } else {
             ElMessage.error('该医生今日已无号源')
        }
    } catch (e) {
        console.error(e)
        ElMessage.error('预约失败')
    } finally {
        bookingLoading.value = false
    }
}

const handlePayment = async () => {
    payLoading.value = true
    try {
        const res = await request.post(`/consultation/appointment/${currentAppointmentId.value}/pay`) as any
        if (res.code === 200) {
            ElMessage.success('支付成功')
            // Redirect to My Appointments or Success Page
            // For now, reload or reset
            step.value = 1
            activeTab.value = 'history' // Switch to history tab (My Appointments)
            // Ideally trigger refresh of history
            // But 'history' tab uses myAppointments mock in original code, need to update it to fetch real data
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
        ElMessage.error('支付失败')
    } finally {
        payLoading.value = false
    }
}

const goToMyAppointments = () => {
    activeTab.value = 'history'
    // refresh logic needed
}

onMounted(() => {
    fetchHospitals()
    fetchMyAppointments()
})

onUnmounted(() => {
    if (sse) sse.close()
})
</script>

<style scoped>
.consultation-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    color: #1a2e1a;
}

/* Tabs */
.consultation-container :deep(.el-tabs__header) {
  background: transparent;
}
.consultation-container :deep(.el-tabs__nav-wrap::after) {
  background-color: #e8eee8 !important;
}
.consultation-container :deep(.el-tabs__item) {
  color: #6b7b6b !important;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s;
}
.consultation-container :deep(.el-tabs__item:hover) {
  color: #3dad6f !important;
}
.consultation-container :deep(.el-tabs__item.is-active) {
  color: #3dad6f !important;
  font-weight: 700;
  font-size: 16px;
}
.consultation-container :deep(.el-tabs__active-bar) {
  background-color: #3dad6f !important;
  height: 3px;
}

/* Headings */
.consultation-container :deep(h1),
.consultation-container :deep(h2),
.consultation-container :deep(h3),
.consultation-container :deep(h4),
.consultation-container :deep(h5),
.consultation-container :deep(h6),
.consultation-container :deep(p),
.consultation-container :deep(span) {
  color: #1a2e1a !important;
}

/* Card */
.consultation-container :deep(.el-card) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  color: #1a2e1a !important;
  transition: background 0.3s, border-color 0.3s, transform 0.2s;
}
.consultation-container :deep(.el-card:hover) {
  background: #f5f7f5 !important;
  border-color: rgba(61, 173, 111, 0.3) !important;
  transform: translateY(-2px);
}
.consultation-container :deep(.el-card__body) {
  color: #1a2e1a !important;
}

/* Tags */
.consultation-container :deep(.el-tag) {
  border: none !important;
  font-weight: 600;
}
.consultation-container :deep(.el-tag--primary) {
  background: rgba(61, 173, 111, 0.12) !important;
  color: #3dad6f !important;
}
.consultation-container :deep(.el-tag--success) {
  background: rgba(61, 173, 111, 0.12) !important;
  color: #3dad6f !important;
}
.consultation-container :deep(.el-tag--warning) {
  background: rgba(240, 160, 32, 0.12) !important;
  color: #d97706 !important;
}
.consultation-container :deep(.el-tag--danger) {
  background: rgba(220, 38, 38, 0.1) !important;
  color: #dc2626 !important;
}
.consultation-container :deep(.el-tag--info) {
  background: rgba(107, 123, 107, 0.1) !important;
  color: #6b7b6b !important;
}

/* Links */
.consultation-container :deep(.el-link) {
  color: #6b7b6b !important;
}
.consultation-container :deep(.el-link:hover) {
  color: #3dad6f !important;
}

/* Pagination */
.consultation-container :deep(.el-pagination) {
  color: #6b7b6b !important;
}
.consultation-container :deep(.el-pagination button),
.consultation-container :deep(.el-pager li) {
  background: #ffffff !important;
  color: #6b7b6b !important;
}
.consultation-container :deep(.el-pager li.is-active) {
  background: #3dad6f !important;
  color: #ffffff !important;
}

/* ========== Step container ========== */
.step-container {
    padding: 20px 0;
}
.hospital-card {
    cursor: pointer;
    margin-bottom: 20px;
    transition: transform 0.2s;
}
.hospital-card:hover {
    transform: translateY(-5px);
}
.hospital-img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 4px;
}
.hospital-info {
    padding-top: 10px;
}
.hospital-info h4 {
    margin: 0 0 5px;
    font-size: 16px;
    color: #1a2e1a !important;
}
.address {
    font-size: 12px;
    color: #6b7b6b !important;
    display: flex;
    align-items: center;
    gap: 4px;
}
.dept-list {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 24px;
}
.dept-btn {
    min-width: 120px;
    width: auto;
}
.date-selector {
    margin: 20px 0;
    overflow-x: auto;
}
.date-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.2;
}
.date-num {
    font-size: 12px;
}
.doctor-item-card {
    margin-bottom: 15px;
}
.doctor-item {
    display: flex;
    align-items: center;
    gap: 20px;
}
.doc-info {
    flex: 1;
}
.doc-info h4 {
    margin: 0 0 5px;
    color: #1a2e1a !important;
}
.price {
    color: #dc2626 !important;
    font-weight: bold;
}
.confirm-info p {
    margin-bottom: 10px;
    color: #6b7b6b !important;
}

/* Chat */
.chat-container {
    height: 600px;
    border: 1px solid #e8eee8 !important;
    border-radius: 12px;
    display: flex;
    background: #ffffff !important;
}
.chat-list {
    width: 300px;
    border-right: 1px solid #e8eee8 !important;
    padding: 10px;
    overflow-y: auto;
}
.chat-item {
    cursor: pointer;
    margin-bottom: 10px;
}
.chat-summary {
    display: flex;
    gap: 10px;
}
.chat-summary .info {
    flex: 1;
    overflow: hidden;
}
.chat-summary h4 {
    margin: 0;
    font-size: 14px;
    color: #1a2e1a !important;
}
.chat-summary p {
    margin: 5px 0 0;
    font-size: 12px;
    color: #6b7b6b !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.chat-summary .time {
    font-size: 12px;
    color: #9ead9e !important;
}
.chat-room {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.chat-header {
    padding: 10px 20px;
    border-bottom: 1px solid #e8eee8 !important;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
    color: #1a2e1a !important;
}
.messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f5f7f5 !important;
}
.message-row {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}
.message-row.self {
    flex-direction: row-reverse;
}
.message-content {
    max-width: 60%;
}
.text-msg {
    background: #f5f7f5 !important;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #e8eee8;
    color: #1a2e1a !important;
}
.self .text-msg {
    background: rgba(61, 173, 111, 0.08) !important;
    border-color: rgba(61, 173, 111, 0.15);
}
.assessment-card {
    background: #f5f7f5 !important;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e8eee8;
    color: #1a2e1a !important;
}
.input-area {
    padding: 10px 20px;
    border-top: 1px solid #e8eee8 !important;
    display: flex;
    gap: 10px;
}

/* ========== Search Toolbar ========== */
.clean-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    margin-bottom: 24px;
    padding: 18px 22px;
    background: #ffffff;
    border: 1px solid #e8eee8;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
}
.clean-filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
}
.clean-select {
    width: 150px;
}
.search-input {
    min-width: 220px;
    max-width: 320px;
}
.consultation-container :deep(.clean-toolbar .el-input__wrapper) {
    background: #f5f7f5 !important;
    box-shadow: 0 0 0 1px #e8eee8 inset !important;
    border-radius: 8px !important;
}
.consultation-container :deep(.clean-toolbar .el-input__inner) {
    color: #1a2e1a !important;
}
.consultation-container :deep(.clean-toolbar .el-input__inner::placeholder) {
    color: #9ead9e !important;
}
.consultation-container :deep(.clean-toolbar .el-input-group__append) {
    background: #3dad6f !important;
    border: none !important;
    box-shadow: none !important;
}
.consultation-container :deep(.clean-search-btn) {
    color: #ffffff !important;
    font-weight: 600;
    border: none !important;
    background: transparent !important;
}
.consultation-container :deep(.clean-search-btn:hover) {
    color: #ffffff !important;
}
.consultation-container :deep(.clean-toolbar .clean-select.el-select .el-select__wrapper) {
    background: #f5f7f5 !important;
    box-shadow: 0 0 0 1px #e8eee8 inset !important;
    border-radius: 8px !important;
    min-height: 38px !important;
}
.consultation-container :deep(.clean-toolbar .clean-select.el-select .el-select__placeholder) {
    color: #9ead9e !important;
}
.consultation-container :deep(.clean-toolbar .clean-select.el-select .el-select__selected-item) {
    color: #1a2e1a !important;
}
.consultation-container :deep(.clean-toolbar .clean-select.el-select .el-select__caret) {
    color: #3dad6f !important;
}
.consultation-container :deep(.clean-toolbar .clean-select.el-select .el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 1px #3dad6f inset !important;
}

/* ========== Page Header ========== */
.consultation-container :deep(.clean-page-header.el-page-header) {
    background: transparent;
    padding: 4px 0 8px;
}
.consultation-container :deep(.clean-page-header .el-page-header__left) {
    color: #1a2e1a !important;
}
.consultation-container :deep(.clean-page-header .el-page-header__title) {
    color: #1a2e1a !important;
    font-size: 17px;
    font-weight: 600;
}
.consultation-container :deep(.clean-page-header .el-page-header__content) {
    color: #1a2e1a !important;
    font-size: 17px;
    font-weight: 600;
}
.consultation-container :deep(.clean-page-header .el-page-header__back) {
    color: #6b7b6b !important;
}
.consultation-container :deep(.clean-page-header .el-page-header__icon) {
    color: #3dad6f !important;
}

/* ========== Department Buttons ========== */
.consultation-container :deep(.clean-dept-btn.el-button) {
    min-height: 48px;
    border-radius: 8px !important;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.consultation-container :deep(.clean-dept-btn.el-button--default) {
    background: #ffffff !important;
    border: 1px solid #e8eee8 !important;
    color: #1a2e1a !important;
    box-shadow: 0 2px 8px rgba(61, 173, 111, 0.04);
}
.consultation-container :deep(.clean-dept-btn.el-button--default:hover) {
    background: rgba(61, 173, 111, 0.06) !important;
    border-color: #3dad6f !important;
    color: #3dad6f !important;
    transform: translateY(-2px);
}
.consultation-container :deep(.clean-dept-btn.el-button--primary) {
    background: #3dad6f !important;
    border: 1px solid #3dad6f !important;
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(61, 173, 111, 0.2);
}
.consultation-container :deep(.clean-dept-btn.el-button--primary:hover) {
    background: #35a062 !important;
    border-color: #35a062 !important;
    color: #ffffff !important;
}

/* ========== Date Selector ========== */
.clean-date-selector {
    padding: 16px 18px;
    margin: 20px 0;
    background: #ffffff;
    border: 1px solid #e8eee8;
    border-radius: 12px;
    overflow-x: auto;
}
.consultation-container :deep(.clean-date-group.el-radio-group) {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 10px;
}
.consultation-container :deep(.clean-date-selector .el-radio-button__inner) {
    background: #f5f7f5 !important;
    border: 1px solid #e8eee8 !important;
    color: #6b7b6b !important;
    box-shadow: none !important;
    border-radius: 8px !important;
    padding: 10px 18px !important;
    min-width: 88px;
}
.consultation-container :deep(.clean-date-selector .el-radio-button__inner span) {
    color: inherit !important;
}
.consultation-container :deep(.clean-date-selector .date-cell span) {
    color: inherit !important;
}
.consultation-container :deep(.clean-date-selector .date-num) {
    color: #3dad6f !important;
    font-weight: 600;
    margin-top: 4px;
}
.consultation-container :deep(.clean-date-selector .el-radio-button:first-child .el-radio-button__inner) {
    border-radius: 8px !important;
}
.consultation-container :deep(.clean-date-selector .el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 8px !important;
}
.consultation-container :deep(.clean-date-selector .el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: #3dad6f !important;
    border-color: #3dad6f !important;
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(61, 173, 111, 0.2) !important;
}
.consultation-container :deep(.clean-date-selector .el-radio-button.is-active .el-radio-button__inner) {
    background: #3dad6f !important;
    border-color: #3dad6f !important;
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(61, 173, 111, 0.2) !important;
}
.consultation-container :deep(.clean-date-selector .el-radio-button.is-active .date-num) {
    color: #ffffff !important;
}

/* ========== Empty State ========== */
.consultation-container :deep(.el-empty__description) {
    color: #6b7b6b !important;
}
.consultation-container :deep(.el-empty__image) {
    opacity: 0.55;
}

/* ========== History Panel / Table ========== */
.clean-history-panel {
    padding: 8px 4px 20px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e8eee8;
}
.consultation-container :deep(.clean-appointments-table.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: #ffffff;
    --el-table-header-bg-color: #f5f7f5;
    --el-table-row-hover-bg-color: rgba(61, 173, 111, 0.04);
    --el-table-border-color: #e8eee8;
    background: transparent !important;
    color: #1a2e1a !important;
}
.consultation-container :deep(.clean-appointments-table .el-table__inner-wrapper::before) {
    display: none;
}
.consultation-container :deep(.clean-appointments-table th.el-table__cell) {
    background: #f5f7f5 !important;
    color: #1a2e1a !important;
    font-weight: 600;
    border-bottom: 1px solid #e8eee8 !important;
}
.consultation-container :deep(.clean-appointments-table td.el-table__cell) {
    background: transparent !important;
    color: #6b7b6b !important;
    border-bottom: 1px solid #e8eee8 !important;
}
.consultation-container :deep(.clean-appointments-table .el-button) {
    margin: 2px 4px 2px 0;
    border-radius: 8px !important;
    font-weight: 500;
    transition: all 0.2s;
}
.consultation-container :deep(.clean-appointments-table .el-button--small) {
    padding: 8px 14px;
    font-size: 13px;
}

/* Form */
.consultation-container :deep(.el-form-item__label) {
    color: #1a2e1a !important;
}
.consultation-container :deep(.el-textarea__inner),
.consultation-container :deep(.el-input__wrapper) {
    background: #f5f7f5 !important;
    box-shadow: 0 0 0 1px #e8eee8 inset !important;
}
.consultation-container :deep(.el-textarea__inner) {
    color: #1a2e1a !important;
}
.consultation-container :deep(.el-result__title) {
    color: #1a2e1a !important;
}
.consultation-container :deep(.el-result__subtitle) {
    color: #6b7b6b !important;
}

/* Doctor list search results heading */
.doctor-list h3 {
    color: #1a2e1a !important;
}
</style>

<style>
/* ========== Select Dropdown (popper) ========== */
.el-popper.el-select__popper.clean-select-dropdown {
    background: #ffffff !important;
    border: 1px solid #e8eee8 !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}
.el-popper.el-select__popper.clean-select-dropdown .el-select-dropdown {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}
.el-popper.el-select__popper.clean-select-dropdown .el-scrollbar__wrap {
    background: transparent !important;
}
.el-popper.el-select__popper.clean-select-dropdown .el-select-dropdown__item {
    color: #1a2e1a !important;
    font-weight: 500;
    margin: 2px 6px;
    border-radius: 8px;
}
.el-popper.el-select__popper.clean-select-dropdown .el-select-dropdown__item:hover,
.el-popper.el-select__popper.clean-select-dropdown .el-select-dropdown__item.hover {
    background: rgba(61, 173, 111, 0.08) !important;
    color: #3dad6f !important;
}
.el-popper.el-select__popper.clean-select-dropdown .el-select-dropdown__item.is-selected {
    color: #3dad6f !important;
    font-weight: 700;
    background: rgba(61, 173, 111, 0.06) !important;
}
.el-popper.el-select__popper.clean-select-dropdown .el-select-dropdown__item.is-hovering {
    background: rgba(61, 173, 111, 0.08) !important;
}
.el-popper.el-select__popper.clean-select-dropdown .el-select-dropdown__empty {
    color: #9ead9e !important;
    padding: 12px;
}

.el-select-dropdown.clean-select-dropdown {
    background: #ffffff !important;
    border: 1px solid #e8eee8 !important;
    border-radius: 12px !important;
}
.el-select-dropdown.clean-select-dropdown .el-select-dropdown__item {
    color: #1a2e1a !important;
    font-weight: 500;
}
.el-select-dropdown.clean-select-dropdown .el-select-dropdown__item:hover,
.el-select-dropdown.clean-select-dropdown .el-select-dropdown__item.hover {
    background: rgba(61, 173, 111, 0.08) !important;
    color: #3dad6f !important;
}
.el-select-dropdown.clean-select-dropdown .el-select-dropdown__item.is-selected {
    color: #3dad6f !important;
    background: rgba(61, 173, 111, 0.06) !important;
}

/* ========== Dialog ========== */
.el-dialog.clean-dialog {
    background: #ffffff !important;
    border: 1px solid #e8eee8 !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1) !important;
}
.el-dialog.clean-dialog .el-dialog__header {
    background: transparent;
    border-bottom: 1px solid #e8eee8;
    padding: 20px 24px 16px;
}
.el-dialog.clean-dialog .el-dialog__title {
    color: #1a2e1a !important;
    font-size: 17px;
    font-weight: 700;
}
.el-dialog.clean-dialog .el-dialog__headerbtn .el-dialog__close {
    color: #6b7b6b !important;
    font-size: 18px;
}
.el-dialog.clean-dialog .el-dialog__headerbtn:hover .el-dialog__close {
    color: #3dad6f !important;
}
.el-dialog.clean-dialog .el-dialog__body {
    background: transparent !important;
    color: #1a2e1a !important;
    padding: 24px;
}
.el-dialog.clean-dialog .el-dialog__footer {
    background: transparent !important;
    border-top: 1px solid #e8eee8;
    padding: 16px 24px 20px;
}

.el-dialog.clean-dialog .el-form-item__label {
    color: #1a2e1a !important;
    font-weight: 500;
}
.el-dialog.clean-dialog .el-input__wrapper,
.el-dialog.clean-dialog .el-textarea__inner {
    background: #f5f7f5 !important;
    box-shadow: 0 0 0 1px #e8eee8 inset !important;
    border-radius: 8px !important;
}
.el-dialog.clean-dialog .el-input__inner,
.el-dialog.clean-dialog .el-textarea__inner {
    color: #1a2e1a !important;
}
.el-dialog.clean-dialog .el-input__inner::placeholder,
.el-dialog.clean-dialog .el-textarea__inner::placeholder {
    color: #9ead9e !important;
}

.el-dialog.clean-dialog .el-select .el-select__wrapper {
    background: #f5f7f5 !important;
    box-shadow: 0 0 0 1px #e8eee8 inset !important;
}
.el-dialog.clean-dialog .el-select .el-select__placeholder {
    color: #9ead9e !important;
}
.el-dialog.clean-dialog .el-select .el-select__selected-item,
.el-dialog.clean-dialog .el-select .el-select__tags-text {
    color: #1a2e1a !important;
}
.el-dialog.clean-dialog .el-select .el-select__caret {
    color: #3dad6f !important;
}

.el-dialog.clean-dialog .el-radio__label {
    color: #1a2e1a !important;
}
.el-dialog.clean-dialog .el-radio-button__inner {
    background: #f5f7f5 !important;
    border-color: #e8eee8 !important;
    color: #6b7b6b !important;
}
.el-dialog.clean-dialog .el-radio-button.is-active .el-radio-button__inner {
    background: #3dad6f !important;
    border-color: #3dad6f !important;
    color: #ffffff !important;
    box-shadow: 0 2px 8px rgba(61, 173, 111, 0.2) !important;
}

/* Descriptions */
.el-dialog.clean-dialog .el-descriptions {
    --el-descriptions-item-bordered-label-background: #f5f7f5;
    --el-text-color-primary: #1a2e1a;
    color: #1a2e1a !important;
}
.el-dialog.clean-dialog .el-descriptions__body {
    background: transparent !important;
}
.el-dialog.clean-dialog .el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell {
    border-color: #e8eee8 !important;
}
.el-dialog.clean-dialog .el-descriptions__label.is-bordered-label {
    background: #f5f7f5 !important;
    color: #1a2e1a !important;
    font-weight: 600;
}
.el-dialog.clean-dialog .el-descriptions__content.is-bordered-content {
    background: #ffffff !important;
    color: #1a2e1a !important;
    font-weight: 500;
}
.el-dialog.clean-dialog .el-descriptions__content.is-bordered-content * {
    color: inherit;
}
.el-dialog.clean-dialog .el-descriptions__content .el-tag {
    border: none !important;
    font-weight: 600;
}

.el-dialog.clean-dialog .el-rate__text {
    color: #3dad6f !important;
}
.el-dialog.clean-dialog .el-rate {
    --el-rate-icon-font-size: 24px;
}

.el-dialog.clean-dialog .el-button {
    border-radius: 8px !important;
    font-weight: 600;
}
.el-dialog.clean-dialog .el-button--primary {
    background: #3dad6f !important;
    border-color: #3dad6f !important;
    color: #ffffff !important;
}
.el-dialog.clean-dialog .el-button--primary:hover {
    background: #35a062 !important;
    border-color: #35a062 !important;
}
.el-dialog.clean-dialog .el-button--default {
    background: #ffffff !important;
    border: 1px solid #e8eee8 !important;
    color: #6b7b6b !important;
}
.el-dialog.clean-dialog .el-button--default:hover {
    background: #f5f7f5 !important;
    border-color: #3dad6f !important;
    color: #3dad6f !important;
}

.el-dialog.clean-dialog .el-upload--picture-card {
    background: #f5f7f5 !important;
    border: 1px dashed #e8eee8 !important;
    border-radius: 8px !important;
}
.el-dialog.clean-dialog .el-upload-list__item {
    border-radius: 8px !important;
}
</style>
