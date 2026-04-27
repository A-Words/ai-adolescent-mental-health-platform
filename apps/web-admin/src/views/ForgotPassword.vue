<template>
  <div class="forgot-wrapper">
    <!-- 左上角品牌标题 -->
    <div class="brand-title" @click="$router.push('/home')">
      <span v-for="(char, index) in brandChars" :key="index" :style="{ animationDelay: `${index * 150}ms` }">{{ char }}</span>
    </div>

    <el-card class="forgot-card">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div class="step-item" :class="{ active: step >= 1, done: step > 1 }">
          <div class="step-circle">{{ step > 1 ? '✓' : '1' }}</div>
          <span>验证身份</span>
        </div>
        <div class="step-line" :class="{ active: step > 1 }"></div>
        <div class="step-item" :class="{ active: step >= 2, done: step > 2 }">
          <div class="step-circle">{{ step > 2 ? '✓' : '2' }}</div>
          <span>重置密码</span>
        </div>
        <div class="step-line" :class="{ active: step > 2 }"></div>
        <div class="step-item" :class="{ active: step >= 3 }">
          <div class="step-circle">3</div>
          <span>完成</span>
        </div>
      </div>

      <!-- 步骤1：输入用户名+邮箱，发送验证码，验证 -->
      <div v-if="step === 1">
        <div class="card-header">
          <h2 class="page-title">找回密码</h2>
          <p class="page-subtitle">请输入您注册时的用户名和邮箱</p>
        </div>

        <el-form
            :model="form"
            :rules="rules"
            ref="formRef"
            label-position="top"
            class="forgot-form"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
                v-model="form.username"
                placeholder="请输入您的用户名"
                class="custom-input"
                :prefix-icon="UserIcon"
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <div class="email-row">
              <el-input
                  v-model="form.email"
                  placeholder="请输入绑定的邮箱"
                  class="custom-input"
                  :prefix-icon="EmailIcon"
              />
              <el-button
                  class="send-code-btn"
                  :disabled="countdown > 0"
                  @click="handleSendCode"
                  :loading="sending"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="验证码" prop="code">
            <el-input
                v-model="form.code"
                placeholder="请输入6位验证码"
                class="custom-input"
                :prefix-icon="KeyIcon"
                maxlength="6"
            />
          </el-form-item>

          <div class="form-hint">
            系统将验证用户名与邮箱是否匹配，匹配成功后发送验证码到您的邮箱。
          </div>

          <el-button
              type="primary"
              class="next-btn"
              @click="handleNext"
              :loading="loading"
          >
            验证并下一步
          </el-button>

          <div class="back-login">
            <span>想起密码了？</span>
            <el-link type="primary" underline="never" class="back-login-btn" @click="$router.push('/login')">
              返回登录
            </el-link>
          </div>
        </el-form>
      </div>

      <!-- 步骤2：设置新密码 -->
      <div v-if="step === 2">
        <div class="card-header">
          <h2 class="page-title">设置新密码</h2>
          <p class="page-subtitle">正在为账号「{{ form.username }}」重置密码</p>
        </div>

        <el-form
            :model="form"
            :rules="pwdRules"
            ref="pwdFormRef"
            label-position="top"
            class="forgot-form"
        >
          <el-form-item label="新密码" prop="newPassword">
            <el-input
                v-model="form.newPassword"
                type="password"
                placeholder="8-16位，含大小写字母+数字"
                class="custom-input"
                :prefix-icon="LockIcon"
                show-password
            />
            <div class="pwd-strength" :class="getPwdStrength()">
              <div class="pwd-strength-bar"></div>
              <span class="pwd-strength-text">{{ getPwdStrengthText() }}</span>
            </div>
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                class="custom-input"
                :prefix-icon="LockIcon"
                show-password
            />
          </el-form-item>

          <el-button
              type="primary"
              class="next-btn"
              @click="handleReset"
              :loading="loading"
          >
            确认重置
          </el-button>

          <div class="back-login">
            <span>想起密码了？</span>
            <el-link type="primary" underline="never" class="back-login-btn" @click="$router.push('/login')">
              返回登录
            </el-link>
          </div>
        </el-form>
      </div>

      <!-- 步骤3：完成 -->
      <div v-if="step === 3" class="success-step">
        <div class="success-icon-wrap">
          <div class="success-ring"></div>
          <div class="success-check">✓</div>
        </div>
        <h2 class="success-title">密码重置成功！</h2>
        <p class="success-desc">请使用新密码重新登录</p>
        <el-button
            type="primary"
            class="goto-login-btn"
            @click="$router.push('/login')"
        >
          前往登录
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { sendForgotCode, verifyForgotCode, resetPassword } from '../api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User as UserIcon, Lock as LockIcon, Message as EmailIcon, Key as KeyIcon } from '@element-plus/icons-vue'

const formRef = ref<FormInstance>()
const pwdFormRef = ref<FormInstance>()
const step = ref(1)
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const brandChars = ['心', '愈', '智', '联']

const form = reactive({
  username: '',
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
})

const pwdRules = reactive<FormRules>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/.test(value)) {
          callback(new Error('密码需为8-16位，且包含大小写字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const handleSendCode = async () => {
  if (!formRef.value) return
  // 先只校验用户名和邮箱格式，不校验验证码
  await formRef.value.validateField(['username', 'email'], async (errors) => {
    if (errors && Object.keys(errors).length > 0) return
    sending.value = true
    try {
      const res = await sendForgotCode({ username: form.username, email: form.email })
      if (res.code === 200) {
        ElMessage.success('验证码已发送到您的邮箱')
        countdown.value = 60
        if (countdownTimer) clearInterval(countdownTimer)
        countdownTimer = setInterval(() => {
          countdown.value--
          if (countdown.value <= 0 && countdownTimer) clearInterval(countdownTimer)
        }, 1000)
      } else {
        ElMessage.error(res.message || '验证码发送失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '验证码发送失败')
    } finally {
      sending.value = false
    }
  })
}

const handleNext = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await verifyForgotCode({
        username: form.username,
        email: form.email,
        code: form.code
      })
      if (res.code === 200) {
        step.value = 2
      } else {
        ElMessage.error(res.message || '验证失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '验证失败')
    } finally {
      loading.value = false
    }
  })
}

const handleReset = async () => {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await resetPassword({
        username: form.username,
        email: form.email,
        code: form.code,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      })
      if (res.code === 200) {
        step.value = 3
      } else {
        ElMessage.error(res.message || '密码重置失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '密码重置失败')
    } finally {
      loading.value = false
    }
  })
}

const getPwdStrength = () => {
  const pwd = form.newPassword
  if (!pwd) return 'empty'
  let score = 0
  if (/[a-z]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (score < 3) return 'weak'
  if (score < 5) return 'medium'
  return 'strong'
}

const getPwdStrengthText = () => {
  const s = getPwdStrength()
  if (s === 'weak') return '密码强度：弱'
  if (s === 'medium') return '密码强度：中等'
  if (s === 'strong') return '密码强度：强'
  return '密码强度'
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.forgot-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7f5;
  position: relative;
  overflow: hidden;
}

.forgot-wrapper::before,
.forgot-wrapper::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(61, 173, 111, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.forgot-wrapper::before { top: -100px; left: -100px; }
.forgot-wrapper::after { bottom: -100px; right: -100px; }

.brand-title {
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  gap: 10px;
  font-size: 50px;
  font-weight: 900;
  text-align: center;
  font-family: "Microsoft YaHei", sans-serif;
  letter-spacing: 6px;
  white-space: nowrap;
  cursor: pointer;
  z-index: 10;
}

.brand-title span {
  display: inline-block;
  opacity: 0;
  background: linear-gradient(to right, #3dad6f, #5bc4bf);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  padding: 5px 0;
  animation: jumpIn 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes jumpIn {
  0% { opacity: 0; transform: translateX(-300px) translateY(0) rotate(-12deg); }
  30% { opacity: 1; transform: translateX(-150px) translateY(-30px) rotate(10deg); }
  50% { transform: translateX(-50px) translateY(10px) rotate(-8deg); }
  70% { transform: translateX(0) translateY(-10px) rotate(4deg); }
  100% { opacity: 1; transform: translateX(0) translateY(0) rotate(0); }
}

.forgot-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06) !important;
  border: 1px solid #e8eee8 !important;
  background-color: #ffffff !important;
  border-radius: 16px !important;
  padding: 40px;
  position: relative;
  z-index: 5;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 36px;
  gap: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f7f5;
  border: 2px solid #e8eee8;
  color: #6b7b6b;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.step-item.active .step-circle {
  background: #3dad6f;
  border-color: #3dad6f;
  color: #ffffff;
}

.step-item.done .step-circle {
  background: #2d8a55;
  border-color: #2d8a55;
  color: #fff;
}

.step-item span {
  font-size: 12px;
  color: #9ead9e;
  transition: all 0.3s ease;
}

.step-item.active span {
  color: #3dad6f;
  font-weight: 500;
}

.step-item.done span {
  color: #2d8a55;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #f5f7f5;
  border-top: 2px solid #e8eee8;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step-line.active {
  background: linear-gradient(90deg, #3dad6f, #5bc4bf);
  border-top-color: #5bc4bf;
}

/* 页面标题 */
.card-header {
  text-align: center;
  margin-bottom: 28px;
}

.page-title {
  font-size: 26px;
  font-weight: bold;
  color: #1a2e1a;
  margin-bottom: 8px;
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: #1a2e1a;
  background-clip: unset;
}

.page-subtitle {
  color: #6b7b6b;
  font-size: 14px;
  margin-bottom: 0;
}

/* 表单 */
.forgot-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.forgot-form :deep(.el-form-item__label) {
  color: #1a2e1a !important;
  font-weight: 500;
  font-size: 14px;
  padding-bottom: 8px !important;
}

.custom-input :deep(.el-input__wrapper) {
  background-color: #f5f7f5 !important;
  border: 1px solid #e8eee8;
  border-radius: 9999px;
  box-shadow: none !important;
  padding: 12px 16px;
}

.custom-input :deep(.el-input__wrapper:hover) { border-color: #3dad6f; }
.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3dad6f;
  box-shadow: 0 0 0 3px rgba(61, 173, 111, 0.12) !important;
}

.custom-input :deep(.el-input__inner) {
  color: #1a2e1a !important;
  font-size: 14px;
}

.custom-input :deep(.el-input__inner::placeholder) { color: #9ead9e !important; opacity: 0.6; }
.custom-input :deep(.el-input__prefix) { color: #3dad6f; }

/* 邮箱+验证码按钮行 */
.email-row {
  display: flex;
  gap: 10px;
}

.email-row .custom-input { flex: 1; }

.send-code-btn {
  flex-shrink: 0;
  height: 42px;
  min-width: 110px;
  background: #3dad6f !important;
  border: none !important;
  border-radius: 9999px;
  color: #ffffff !important;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.send-code-btn:hover:not(:disabled) {
  background: #2d8a55 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.25);
}

.send-code-btn:disabled {
  background: #e8eee8 !important;
  color: #9ead9e !important;
  cursor: not-allowed;
}

/* 提示 */
.form-hint {
  font-size: 12px;
  color: #3dad6f;
  background: rgba(61, 173, 111, 0.06);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 20px;
  line-height: 1.5;
  opacity: 0.8;
}

/* 密码强度 */
.pwd-strength { margin-top: 8px; }

.pwd-strength-bar {
  height: 4px;
  background: rgba(61, 173, 111, 0.15);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.pwd-strength.weak .pwd-strength-bar::before {
  content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 30%;
  background: #ff4d4f; border-radius: 2px; transition: all 0.3s ease;
}

.pwd-strength.medium .pwd-strength-bar::before {
  content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 60%;
  background: #f5a623; border-radius: 2px; transition: all 0.3s ease;
}

.pwd-strength.strong .pwd-strength-bar::before {
  content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 100%;
  background: #3dad6f; border-radius: 2px; transition: all 0.3s ease;
}

.pwd-strength-text {
  font-size: 12px;
  color: #6b7b6b;
  margin-top: 4px;
  display: block;
}

/* 主按钮 */
.next-btn,
.goto-login-btn {
  width: 100%;
  height: 48px;
  background: #3dad6f !important;
  border: none !important;
  border-radius: 9999px;
  color: #ffffff !important;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.next-btn:hover,
.goto-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.25) !important;
  background: #2d8a55 !important;
}

.goto-login-btn {
  margin-top: 24px;
}

/* 返回登录 */
.back-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  color: #6b7b6b;
  font-size: 14px;
}

.back-login-btn {
  color: #3dad6f !important;
  font-weight: 500;
  padding: 0;
  height: auto;
}

.back-login-btn:hover {
  color: #2d8a55 !important;
  transform: translateX(2px);
}

/* 成功步骤 */
.success-step {
  text-align: center;
  padding: 20px 0;
}

.success-icon-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(61, 173, 111, 0.1);
  animation: ringPulse 2s infinite;
}

@keyframes ringPulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 0.2; }
  100% { transform: scale(1); opacity: 0.6; }
}

.success-check {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3dad6f, #5bc4bf);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: checkBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkBounce {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.success-title {
  font-size: 24px;
  font-weight: bold;
  color: #1a2e1a;
  margin-bottom: 12px;
}

.success-desc {
  color: #6b7b6b;
  font-size: 15px;
  margin-bottom: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .brand-title {
    top: 20px;
    left: 20px;
    font-size: 36px;
  }
  .forgot-card {
    width: 90%;
    margin: 20px;
    padding: 30px 20px;
  }
  .step-line { width: 40px; }
  .email-row { flex-direction: column; }
  .send-code-btn { width: 100%; }
}
</style>
