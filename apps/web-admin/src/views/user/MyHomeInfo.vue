<template>
  <div class="profile-edit">
    <h2>个人信息中心</h2>

    <!-- 模式切换按钮 -->
    <div class="mode-toggle" v-if="!isEditing">
      <el-button type="primary" @click="enterEdit">编辑信息</el-button>
    </div>

    <!-- ==================== 查看模式 ==================== -->
    <div v-if="!isEditing" class="view-mode">
      <div class="info-card">
        <!-- 头像 -->
        <div class="info-row avatar-row">
          <div class="info-label">头像</div>
          <div class="info-value">
            <el-avatar :size="80" :src="form.headPath">
              <template #default>
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
              </template>
            </el-avatar>
          </div>
        </div>

        <!-- 用户名 -->
        <div class="info-row">
          <div class="info-label">用户名</div>
          <div class="info-value">{{ form.username || '-' }}</div>
        </div>

        <!-- 昵称 -->
        <div class="info-row">
          <div class="info-label">昵称</div>
          <div class="info-value">{{ form.nickname || '-' }}</div>
        </div>

        <!-- 性别 -->
        <div class="info-row">
          <div class="info-label">性别</div>
          <div class="info-value">{{ formatSex(form.sex) }}</div>
        </div>

        <!-- 生日 -->
        <div class="info-row">
          <div class="info-label">生日</div>
          <div class="info-value">{{ form.birthday || '-' }}</div>
        </div>

        <!-- 手机号 -->
        <div class="info-row">
          <div class="info-label">手机号</div>
          <div class="info-value">{{ form.phone || '-' }}</div>
        </div>

        <!-- 邮箱 -->
        <div class="info-row">
          <div class="info-label">邮箱</div>
          <div class="info-value email-value">
            <span>{{ form.email || '-' }}</span>
            <el-tag v-if="form.email" :type="form.emailVerified === 1 ? 'success' : 'warning'" size="small">
              {{ form.emailVerified === 1 ? '已验证' : '未验证' }}
            </el-tag>
          </div>
        </div>

        <!-- 个性签名 -->
        <div class="info-row">
          <div class="info-label">个性签名</div>
          <div class="info-value signature-value">{{ form.signature || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- ==================== 编辑模式 ==================== -->
    <div v-else class="edit-mode">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="profile-form"
      >
        <!-- 头像 -->
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :on-change="handleAvatarChange"
              :before-upload="beforeUpload"
              :auto-upload="false"
            >
              <el-avatar :size="80" :src="avatarPreview || form.headPath">
                <template #default>
                  <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                </template>
              </el-avatar>
              <el-button type="primary" size="small" style="margin-left: 15px;">更换头像</el-button>
            </el-upload>
          </div>
        </el-form-item>

        <!-- 用户名（禁止编辑） -->
        <el-form-item label="用户名">
          <el-input :model-value="form.username" disabled placeholder="用户名不可修改"></el-input>
        </el-form-item>

        <!-- 昵称 -->
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :label="0">保密</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 生日 -->
        <el-form-item label="生日">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="选择生日"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>

        <!-- 邮箱（点击按钮弹出窗口） -->
        <el-form-item label="邮箱">
          <div class="email-display-row">
            <span class="email-current-display">{{ form.email || '未设置' }}</span>
            <el-tag v-if="form.email" :type="form.emailVerified === 1 ? 'success' : 'warning'" size="small">
              {{ form.emailVerified === 1 ? '已验证' : '未验证' }}
            </el-tag>
            <el-button type="primary" plain size="small" @click="showEmailDialog">
              更改邮箱
            </el-button>
          </div>
        </el-form-item>

        <!-- 个性签名 -->
        <el-form-item label="个性签名" prop="signature">
          <el-input
            v-model="form.signature"
            type="textarea"
            :rows="3"
            placeholder="请输入个性签名"
            maxlength="100"
            show-word-limit
          ></el-input>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button type="primary" @click="submitForm" :loading="loading">保存修改</el-button>
          <el-button @click="cancelEdit" type="danger">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- ==================== 更改邮箱弹窗 ==================== -->
    <el-dialog
        v-model="emailDialogVisible"
        title="更改邮箱"
        width="440px"
        :close-on-click-modal="false"
        class="email-change-dialog"
    >
      <div class="email-dialog-content">
        <p class="email-dialog-tip">
          当前邮箱：<strong>{{ form.email || '未设置' }}</strong>
        </p>

        <!-- 次数提示 -->
        <div class="email-quota-hint">
          <span class="quota-icon">i</span>
          每月可修改
          <strong>2</strong> 次邮箱，本月已使用
          <strong>{{ emailChangeUsed }}</strong> 次，剩余
          <strong>{{ emailChangeRemaining }}</strong> 次
        </div>

        <el-alert
            v-if="emailChangeRemaining <= 0"
            title="本月修改次数已用完"
            type="warning"
            :description="'每月最多修改2次，请于下月再试'"
            :closable="false"
            show-icon
            style="margin-bottom: 16px;"
        />

        <el-form
            v-if="emailChangeRemaining > 0"
            :model="emailForm"
            :rules="emailRules"
            ref="emailFormRef"
            label-position="top"
        >
          <el-form-item label="新邮箱地址" prop="email">
            <el-input
                v-model="emailForm.email"
                placeholder="请输入新的邮箱地址"
                :prefix-icon="MessageIcon"
            />
          </el-form-item>

          <el-form-item label="邮箱验证码" prop="code">
            <div class="code-row">
              <el-input
                  v-model="emailForm.code"
                  placeholder="请输入6位验证码"
                  :prefix-icon="KeyIcon"
                  maxlength="6"
                  class="code-input"
              />
              <el-button
                  class="send-code-btn"
                  :disabled="emailCountdown > 0 || emailSending"
                  @click="handleSendEmailCode"
                  :loading="emailSending"
              >
                {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <div v-if="emailCodeError" class="dialog-error">{{ emailCodeError }}</div>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="emailDialogVisible = false" type="default">取消</el-button>
        <el-button
            v-if="emailChangeRemaining > 0"
            type="primary"
            @click="handleEmailDialogConfirm"
            :loading="emailConfirming"
        >
          确认更换
        </el-button>
        <el-button
            v-else
            type="info"
            disabled
        >
          本月次数已用完
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { getUserInfo, updateUserInfo, getEmailChangeInfo, sendChangeEmailCode } from '@/api/user'
import { Message as MessageIcon, Key as KeyIcon } from '@element-plus/icons-vue'

const formRef = ref<FormInstance>()
const emailFormRef = ref<FormInstance>()
const loading = ref(false)
const avatarPreview = ref('')
const avatarFile = ref<File | null>(null)
const isEditing = ref(false)

// 缓存编辑前的数据
let originalForm: any = {}

// 邮箱修改弹窗相关
const emailDialogVisible = ref(false)
const emailForm = reactive({ email: '', code: '' })
const emailCountdown = ref(0)
const emailSending = ref(false)
const emailConfirming = ref(false)
const emailCodeError = ref('')
const emailChangeRemaining = ref(2)
const emailChangeUsed = ref(0)
let emailCountdownTimer: ReturnType<typeof setInterval> | null = null
let emailCodeTimer: ReturnType<typeof setInterval> | null = null

const form = reactive({
  id: undefined as number | undefined,
  username: '',
  nickname: '',
  sex: 0 as number,
  birthday: '',
  phone: '',
  email: '',
  signature: '',
  headPath: '',
  emailVerified: 0 as number
})

const rules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' }
  ]
}

const emailRules: FormRules = {
  email: [
    { required: true, message: '请输入新邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位', trigger: 'blur' }
  ]
}

const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo() as any
    if (res.code === 200) {
      Object.assign(form, res.data)
    }
  } catch {
    ElMessage.error('获取用户信息失败')
  }
}

const fetchEmailChangeInfo = async () => {
  try {
    const res = await getEmailChangeInfo() as any
    if (res.code === 200) {
      emailChangeRemaining.value = res.data.remainingCount ?? 2
      emailChangeUsed.value = (res.data.maxCount ?? 2) - emailChangeRemaining.value
    }
  } catch {
    // 忽略，默认为2次
    emailChangeRemaining.value = 2
  }
}

const formatSex = (sex: number) => {
  if (sex === 0) return '保密'
  if (sex === 1) return '男'
  if (sex === 2) return '女'
  return '-'
}

// 进入编辑模式
const enterEdit = async () => {
  originalForm = JSON.parse(JSON.stringify(form))
  isEditing.value = true
  avatarPreview.value = ''
  avatarFile.value = null
  await fetchEmailChangeInfo()
}

// 打开更改邮箱弹窗
const showEmailDialog = async () => {
  emailForm.email = ''
  emailForm.code = ''
  emailCodeError.value = ''
  emailCountdown.value = 0
  emailSending.value = false
  emailConfirming.value = false
  if (emailCountdownTimer) clearInterval(emailCountdownTimer)
  await fetchEmailChangeInfo()
  emailDialogVisible.value = true
}

// 确认更换邮箱（弹窗内直接更换）
const handleEmailDialogConfirm = async () => {
  if (!emailFormRef.value) return

  await emailFormRef.value.validate(async (valid) => {
    if (!valid) return

    if (!emailForm.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailForm.email)) {
      ElMessage.error('请输入正确的新邮箱地址')
      return
    }
    if (emailForm.email.toLowerCase() === (form.email || '').toLowerCase()) {
      ElMessage.error('新邮箱不能与当前邮箱相同')
      return
    }
    if (!emailForm.code || emailForm.code.length !== 6) {
      emailCodeError.value = '请输入6位验证码'
      return
    }
    emailCodeError.value = ''

    emailConfirming.value = true
    try {
      const res = await updateUserInfo({
        newEmail: emailForm.email,
        emailCode: emailForm.code
      }) as any
      if (res.code === 200) {
        ElMessage.success('邮箱更换成功')
        Object.assign(form, res.data)
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          email: res.data.email,
          emailVerified: res.data.emailVerified
        }))
        emailDialogVisible.value = false
        await fetchEmailChangeInfo()
      } else {
        emailCodeError.value = res.message
      }
    } catch (error: any) {
      emailCodeError.value = error.message || '更换失败'
    } finally {
      emailConfirming.value = false
    }
  })
}

// 取消编辑
const cancelEdit = () => {
  Object.assign(form, originalForm)
  isEditing.value = false
  avatarPreview.value = ''
  avatarFile.value = null
  emailDialogVisible.value = false
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/')
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

const handleAvatarChange: UploadProps['onChange'] = (uploadFile) => {
  if (uploadFile.raw) {
    if (!beforeUpload(uploadFile.raw)) return
    avatarFile.value = uploadFile.raw
    avatarPreview.value = URL.createObjectURL(uploadFile.raw)
  }
}

const uploadAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'avatar')
  const { default: request } = await import('@/api/user')
  return request.post('/common/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 发送邮箱验证码
const handleSendEmailCode = async () => {
  if (!emailForm.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailForm.email)) {
    ElMessage.error('请输入正确的新邮箱地址')
    return
  }
  if (emailForm.email.toLowerCase() === (form.email || '').toLowerCase()) {
    ElMessage.error('新邮箱不能与当前邮箱相同')
    return
  }

  emailSending.value = true
  try {
    const res = await sendChangeEmailCode({ email: emailForm.email }) as any
    if (res.code === 200) {
      ElMessage.success(res.message || '验证码已发送到您的邮箱')
      emailCountdown.value = 60
      if (emailCodeTimer) clearInterval(emailCodeTimer)
      emailCodeTimer = setInterval(() => {
        emailCountdown.value--
        if (emailCountdown.value <= 0 && emailCodeTimer) clearInterval(emailCodeTimer)
      }, 1000)
    } else {
      ElMessage.error(res.message || '验证码发送失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '验证码发送失败')
  } finally {
    emailSending.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 校验：换了新邮箱但没填验证码
    const emailChanged = emailForm.email && emailForm.email !== form.email
    if (emailChanged && (!emailForm.code || emailForm.code.length !== 6)) {
      emailCodeError.value = '修改邮箱必须填写验证码'
      return
    }
    emailCodeError.value = ''

    loading.value = true
    try {
      // 上传新头像
      if (avatarFile.value) {
        const res = await uploadAvatar(avatarFile.value) as any
        if (res.code === 200) {
          form.headPath = res.data
        } else {
          throw new Error(res.message || '头像上传失败')
        }
      }

      const payload: any = { ...form }
      if (emailChanged) {
        payload.emailCode = emailForm.code
        payload.newEmail = emailForm.email
      }

      const res = await updateUserInfo(payload) as any
      if (res.code === 200) {
        ElMessage.success('保存成功')
        Object.assign(form, res.data)
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          nickname: res.data.nickname,
          headPath: res.data.headPath
        }))
        isEditing.value = false
        emailForm.email = ''
        emailForm.code = ''
        avatarFile.value = null
        avatarPreview.value = ''
        await fetchEmailChangeInfo()
      } else {
        ElMessage.error(res.message || '保存失败')
        // 如果是邮箱验证码错误，提示
        if (res.message?.includes('验证码')) {
          emailCodeError.value = res.message
        }
      }
    } catch (error: any) {
      ElMessage.error(error.message || '保存失败')
      if (error.message?.includes('验证码')) {
        emailCodeError.value = error.message
      }
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  fetchUserInfo()
})

onUnmounted(() => {
  if (emailCodeTimer) clearInterval(emailCodeTimer)
})
</script>

<style scoped>
.profile-edit {
  max-width: 700px;
  color: #1a2e1a;
}

h2 {
  margin-bottom: 24px;
  color: #1a2e1a !important;
  font-size: 20px;
}

.mode-toggle {
  margin-bottom: 20px;
}
.mode-toggle :deep(.el-button--primary) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
}
.mode-toggle :deep(.el-button--primary:hover) {
  background: #2d8d5f !important;
}

/* 查看模式 */
.info-card {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(61,173,111,0.06);
  overflow: hidden;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  border-bottom: 1px solid #e8eee8 !important;
  min-height: 56px;
}
.info-row:last-child {
  border-bottom: none;
}
.avatar-row {
  align-items: center;
}

.info-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 14px;
  color: #6b7b6b !important;
  line-height: 40px;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #1a2e1a !important;
  line-height: 40px;
  word-break: break-all;
}

.email-value {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.signature-value {
  line-height: 1.6;
  white-space: pre-wrap;
  color: #6b7b6b !important;
}

/* 标签 */
.info-value :deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.25) !important;
  border: none !important;
  color: #A8E063 !important;
}
.info-value :deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.25) !important;
  border: none !important;
  color: #FFB347 !important;
}

/* 编辑模式 */
.profile-form :deep(.el-form-item) {
  margin-bottom: 20px;
}
.profile-form :deep(.el-form-item__label) {
  color: #6b7b6b !important;
  font-weight: 500;
}
.profile-form :deep(.el-input__wrapper) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  box-shadow: none !important;
}
.profile-form :deep(.el-input__inner) {
  color: #1a2e1a !important;
}
.profile-form :deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
}
.profile-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background: #f5f7f5 !important;
}
.profile-form :deep(.el-input.is-disabled .el-input__inner) {
  color: #9ead9e !important;
}
.profile-form :deep(.el-radio__label) {
  color: #1a2e1a !important;
}
.profile-form :deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
}
.profile-form :deep(.el-textarea__inner) {
  background: #ffffff !important;
  border: 1px solid #e8eee8 !important;
  color: #1a2e1a !important;
  box-shadow: none !important;
}
.profile-form :deep(.el-textarea__inner::placeholder) {
  color: #9ead9e !important;
}
.profile-form :deep(.el-upload__trigger) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
}

.avatar-upload {
  display: flex;
  align-items: center;
}

.email-current {
  font-size: 14px;
  color: #6b7b6b !important;
  margin-bottom: 12px;
}

.email-change-area {
  border: 1px dashed #e8eee8 !important;
  border-radius: 8px;
  padding: 16px;
  background: #f5f7f5 !important;
}

.new-email-input {
  margin-bottom: 12px;
}

.email-change-hint {
  font-size: 12px;
  color: #6b7b6b !important;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #9ead9e !important;
  color: #ffffff !important;
  font-size: 11px;
  font-style: normal;
  flex-shrink: 0;
}

.email-code-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.email-code-input {
  flex: 1;
}

.send-code-btn {
  flex-shrink: 0;
  background: #3dad6f !important;
  border: 1px solid #3dad6f !important;
  color: #ffffff !important;
  white-space: nowrap;
  height: 32px;
}
.send-code-btn:disabled {
  background: #e8eee8 !important;
  border-color: #e8eee8 !important;
  color: #9ead9e !important;
  cursor: not-allowed;
}

.code-error {
  font-size: 12px;
  color: #f56c6c !important;
  margin-top: 4px;
}

.form-actions {
  margin-top: 32px;
}
.form-actions :deep(.el-form-item__content) {
  justify-content: center;
}
.form-actions :deep(.el-button--primary) {
  background: #3dad6f !important;
  border-color: #3dad6f !important;
  color: #ffffff !important;
}
.form-actions :deep(.el-button--default) {
  background: #ffffff !important;
  border-color: #e8eee8 !important;
  color: #1a2e1a !important;
}
.form-actions :deep(.el-button--primary:hover) {
  background: #2d8d5f !important;
}
</style>
