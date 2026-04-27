<template>
  <div class="register-wrapper">
    <!-- 左上角品牌标题 -->
    <div class="brand-title" @click="backHome">
      <span v-for="(char, index) in brandChars" :key="index" :style="{ animationDelay: `${index * 150}ms` }">{{ char }}</span>
    </div>

    <el-card class="register-card">
      <div class="card-header">
        <h2 class="register-title">欢迎加入！</h2>
        <p class="register-subtitle">创建您的账户，开始平衡之旅</p>
      </div>

      <el-form
          :model="registerForm"
          :rules="rules"
          ref="registerFormRef"
          label-width="100px"
          class="register-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="registerForm.username"
              placeholder="4-16位字母、数字、_、-"
              class="custom-input"
              :prefix-icon="User"
          >
            <template #suffix>
              <span v-if="registerForm.username.length > 0" class="character-count">
                {{ registerForm.username.length }}/16
              </span>
            </template>
          </el-input>
          <div class="input-hint">字母、数字、下划线或减号组合</div>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
              type="password"
              v-model="registerForm.password"
              placeholder="8-16位，含大小写字母+数字"
              class="custom-input"
              :prefix-icon="Lock"
              show-password
          >
            <template #suffix>
              <span v-if="registerForm.password.length > 0" class="character-count">
                {{ registerForm.password.length }}/16
              </span>
            </template>
          </el-input>
          <div class="password-strength" :class="getPasswordStrength()">
            <div class="strength-bar"></div>
            <div class="strength-text">{{ getPasswordStrengthText() }}</div>
          </div>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              class="custom-input"
              :prefix-icon="Message"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="邮箱验证" prop="code">
          <div class="code-input-row">
            <el-input
                v-model="registerForm.code"
                placeholder="请输入6位验证码"
                class="custom-input code-input"
                :prefix-icon="Key"
                maxlength="6"
            >
            </el-input>
            <el-button
                class="send-code-btn"
                :disabled="countdown > 0"
                @click="handleSendCode"
                :loading="sendingCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
              v-model="registerForm.phone"
              placeholder="选填，可用于找回密码"
              class="custom-input"
              :prefix-icon="Phone"
          >
            <template #prefix>
              <span class="phone-prefix">+86</span>
            </template>
          </el-input>
          <div class="input-hint optional">选填，可用于找回密码</div>
        </el-form-item>

        <div class="form-actions">
          <el-button
              type="primary"
              @click="handleRegister"
              class="register-btn"
              :loading="loading"
          >
            <span v-if="!loading">立即注册</span>
            <span v-else>注册中...</span>
          </el-button>
          <div class="login-link">
            <span>已有账户？</span>
            <el-link
                type="primary"
                underline="never"
                @click="$router.push('/login')"
                class="login-btn"
            >
              去登录
            </el-link>
          </div>
        </div>

        <div class="agreement">
          <el-checkbox v-model="agreed">
            我已阅读并同意
            <el-button
                type="text"
                class="agreement-link"
                @click="showPrivacyPolicy = true"
            >
              《隐私政策》
            </el-button>
          </el-checkbox>
        </div>

      </el-form>
    </el-card>

    <!-- 隐私政策弹窗 -->
    <el-dialog
        v-model="showPrivacyPolicy"
        title="隐私政策"
        width="80%"
        class="privacy-dialog"
    >
      <div class="privacy-content">
        <h3>一、适用范围</h3>
        <p>本隐私安全须知仅用于心愈智联已注明的产品和服务，http://122.51.12.200/网站、服务和产品若未显示本争吵内容或链接，或各自有专属隐私政策，则本隐私政策不适用。</p>

        <h3>二、内容收集范围</h3>
        <p>（1）基本个人信息：用户名、昵称、头像、性别、手机号码、电子邮箱、出生日期等。</p>
        <p>（2）设备信息：设备型号、设备标识、系统版本等。</p>
        <p>（3）其它：位置信息、相册、麦克风、摄像头、存储权限等。</p>

        <h3>三、如何收集及使用信息</h3>
        <p>（1）您向我们提供信息：当您在线注册心愈智联产品账户时，您需要提供电子邮件地址或手机号等，以便我们识别您的身份或与您联络。</p>
        <p>（2）在您使用服务过程中收集的信息</p>
        <p>为了提供并优化您需要的服务，我们会收集您使用服务的相关信息。</p>
        <p>（3）Cookie</p>
        <p>为使您获得更轻松的访问体验，您访问本产品相关网站或使用本产品提供的服务时，我们可能会通过小型数据文件识别您的身份。</p>

        <h3>四、存储和保护您的个人数据</h3>
        <p>本产品将合法收集和存储您的个人数据，采取合理的预防措施，以保护您的个人信息不会遭受未经授权的浏览、披露、滥用、变更、破坏以及损失。</p>

        <h3>五、第三方SDK</h3>
        <p>为保障本产品相关功能的实现与优化，我们会接入由第三方公司开发的软件工具包（SDK）。</p>

        <h3>六、本隐私安全须知的更新</h3>
        <p>本产品可能会不定期修改、更新本隐私政策，本产品会提供显著的通知，尽可能通过可行的渠道和方法，将变更通知您。</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="showPrivacyPolicy = false">我已阅读</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { sendEmailCode, registerByEmail } from '../api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Phone, Message, Key } from '@element-plus/icons-vue'

const router = useRouter()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const agreed = ref(false)
const showPrivacyPolicy = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

// 品牌标题字符
const brandChars = ref(['心', '愈', '智', '联'])

// 返回首页
const backHome = () => {
  router.push('/home')
}

const registerForm = reactive({
  username: '',
  password: '',
  email: '',
  code: '',
  phone: ''
})

let countdownTimer: ReturnType<typeof setInterval> | null = null

// 发送验证码
const handleSendCode = async () => {
  // 先校验邮箱格式
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailReg.test(registerForm.email)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }

  sendingCode.value = true
  try {
    const res = await sendEmailCode({ email: registerForm.email, scene: 'register' })
    if (res.code === 200) {
      ElMessage.success('验证码已发送到您的邮箱')
      // 开始倒计时
      countdown.value = 60
      if (countdownTimer) clearInterval(countdownTimer)
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          if (countdownTimer) clearInterval(countdownTimer)
        }
      }, 1000)
    } else {
      ElMessage.error(res.message || '验证码发送失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '验证码发送失败')
  } finally {
    sendingCode.value = false
  }
}

const validateUsername = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'))
    return
  }
  const reg = /^[a-zA-Z0-9_-]{4,16}$/
  if (!reg.test(value)) {
    callback(new Error('用户名需为4-16位字母、数字、下划线或减号'))
  } else {
    callback()
  }
}

const validatePassword = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }
  const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/
  if (!reg.test(value)) {
    callback(new Error('密码需为8-16位，且包含大小写字母和数字'))
  } else {
    callback()
  }
}

const validateEmail = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
    return
  }
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

const validateCode = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入验证码'))
    return
  }
  if (value.length !== 6) {
    callback(new Error('验证码为6位数字'))
  } else {
    callback()
  }
}

const validatePhone = (_rule: any, value: any, callback: any) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^1[3-9]\d{9}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  username: [
    { validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ],
  code: [
    { validator: validateCode, trigger: 'blur' }
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ]
})

const getPasswordStrength = () => {
  if (!registerForm.password) return 'empty'
  const hasLower = /[a-z]/.test(registerForm.password)
  const hasUpper = /[A-Z]/.test(registerForm.password)
  const hasNumber = /\d/.test(registerForm.password)
  const length = registerForm.password.length

  let score = 0
  if (hasLower) score++
  if (hasUpper) score++
  if (hasNumber) score++
  if (length >= 8) score++
  if (length >= 12) score++

  if (score < 3) return 'weak'
  if (score < 5) return 'medium'
  return 'strong'
}

const getPasswordStrengthText = () => {
  const strength = getPasswordStrength()
  switch (strength) {
    case 'weak': return '密码强度：弱'
    case 'medium': return '密码强度：中等'
    case 'strong': return '密码强度：强'
    default: return '密码强度'
  }
}

const handleRegister = async () => {
  if (!agreed.value) {
    ElMessage.warning('请先同意隐私政策')
    return
  }

  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await registerByEmail({
          email: registerForm.email,
          code: registerForm.code,
          username: registerForm.username,
          password: registerForm.password,
          phone: registerForm.phone || undefined
        })
        if (res.code === 200) {
          ElMessage.success({
            message: '注册成功，欢迎加入！',
            customClass: 'success-message'
          })
          if (countdownTimer) clearInterval(countdownTimer)
          setTimeout(() => {
            router.push('/login')
          }, 1500)
        } else {
          ElMessage.error({
            message: res.message || '注册失败',
            customClass: 'error-message'
          })
        }
      } catch (error: any) {
        ElMessage.error({
          message: error.message || '注册失败，请稍后重试',
          customClass: 'error-message'
        })
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7f5;
  position: relative;
  overflow: hidden;
}

.register-wrapper::before,
.register-wrapper::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(61, 173, 111, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.register-wrapper::before {
  top: -100px;
  left: -100px;
}

.register-wrapper::after {
  bottom: -100px;
  right: -100px;
}

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
  overflow: visible;
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

.register-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06) !important;
  border: 1px solid #e8eee8 !important;
  background-color: #ffffff !important;
  border-radius: 16px !important;
  padding: 40px;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1a2e1a;
  text-align: center;
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: #1a2e1a;
  background-clip: unset;
}

.register-subtitle {
  color: #6b7b6b;
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.register-form :deep(.el-form-item__label) {
  color: #1a2e1a !important;
  font-weight: 500;
  font-size: 14px;
  padding-right: 20px;
}

.custom-input :deep(.el-input__wrapper) {
  background-color: #f5f7f5 !important;
  border: 1px solid #e8eee8;
  border-radius: 9999px;
  box-shadow: none !important;
  padding: 12px 16px;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #3dad6f;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3dad6f;
  box-shadow: 0 0 0 3px rgba(61, 173, 111, 0.12) !important;
}

.custom-input :deep(.el-input__inner) {
  color: #1a2e1a !important;
  font-size: 14px;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: #9ead9e !important;
  opacity: 0.6;
}

.custom-input :deep(.el-input__prefix) {
  color: #3dad6f;
}

/* 验证码输入行 */
.code-input-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  flex-shrink: 0;
  height: 42px;
  min-width: 120px;
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

.phone-prefix {
  color: #3dad6f;
  font-size: 14px;
  margin-right: 8px;
}

.input-hint {
  font-size: 12px;
  color: #6b7b6b;
  margin-top: 6px;
  margin-left: 0;
}

.input-hint.optional {
  color: #3dad6f;
  opacity: 0.7;
}

.character-count {
  font-size: 12px;
  color: #6b7b6b;
  opacity: 0.6;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: rgba(61, 173, 111, 0.15);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.strength-strength.weak .strength-bar::before {
  content: '';
  position: absolute;
  left: 0; top: 0; height: 100%; width: 30%;
  background: #ff4d4f; border-radius: 2px;
}

.strength-strength.medium .strength-bar::before {
  content: '';
  position: absolute;
  left: 0; top: 0; height: 100%; width: 60%;
  background: #f5a623; border-radius: 2px;
}

.strength-strength.strong .strength-bar::before {
  content: '';
  position: absolute;
  left: 0; top: 0; height: 100%; width: 100%;
  background: #3dad6f; border-radius: 2px;
}

.strength-text {
  font-size: 12px;
  color: #6b7b6b;
  margin-top: 4px;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.register-btn {
  width: 100%;
  height: 48px;
  background: #3dad6f !important;
  border: none !important;
  border-radius: 9999px;
  color: #ffffff !important;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.25) !important;
  background: #2d8a55 !important;
}

.login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7b6b;
  font-size: 14px;
}

.login-link .login-btn {
  color: #3dad6f !important;
  font-weight: 500;
  padding: 0;
  height: auto;
}

.login-link .login-btn:hover {
  color: #2d8a55 !important;
  transform: translateX(2px);
}

.agreement {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e8eee8;
  text-align: center;
}

.agreement :deep(.el-checkbox__label) {
  color: #6b7b6b;
  font-size: 13px;
}

.agreement :deep(.el-checkbox__inner) {
  border-color: #e8eee8;
  background-color: #ffffff;
}

.agreement :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #3dad6f;
  border-color: #3dad6f;
}

.agreement-link {
  color: #3dad6f !important;
  font-size: 13px !important;
  padding: 0 2px !important;
}

.agreement-link:hover {
  color: #2d8a55 !important;
  text-decoration: underline;
}

/* 隐私政策弹窗样式 */
:deep(.privacy-dialog .el-dialog) {
  border-radius: 16px;
  border: 1px solid #e8eee8;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.10);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
:deep(.privacy-dialog) {
  background: #ffffff !important;
}

:deep(.privacy-dialog .el-dialog__header) {
  border-bottom: 1px solid #e8eee8;
  padding: 20px 24px;
  margin-right: 0;
  flex-shrink: 0;
}

:deep(.privacy-dialog .el-dialog__title) {
  color: #1a2e1a;
  font-size: 18px;
  font-weight: 600;
}

:deep(.privacy-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: #6b7b6b;
  font-size: 20px;
}

:deep(.privacy-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #3dad6f;
}

:deep(.privacy-dialog .el-dialog__body) {
  padding: 24px;
  height: 400px;
  overflow-y: auto;
  color: #6b7b6b;
  flex: 1;
  background-color: #ffffff !important;
}

.privacy-content h3 {
  color: #1a2e1a;
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px 0;
}

.privacy-content h3:first-child {
  margin-top: 0;
}

.privacy-content p {
  margin-bottom: 10px;
  text-align: justify;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.privacy-dialog .el-dialog__footer) {
  border-top: 1px solid #e8eee8;
  padding: 16px 24px;
  text-align: center;
}

:deep(.privacy-dialog .el-dialog__footer .el-button) {
  width: 120px;
  background: #3dad6f !important;
  border: none !important;
  border-radius: 9999px;
  color: #ffffff !important;
  font-weight: 500;
}

:deep(.privacy-dialog .el-dialog__footer .el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.25);
}

:deep(.success-message) {
  background: #3dad6f !important;
  border: none !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.3) !important;
}

:deep(.error-message) {
  background: rgba(231, 76, 60, 0.9) !important;
  border: none !important;
  border-radius: 8px !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3) !important;
}

@media (max-width: 768px) {
  .brand-title {
    top: 20px;
    left: 20px;
    font-size: 36px;
  }
  .register-card {
    width: 90%;
    margin: 20px;
    padding: 30px 20px;
  }
  .register-title {
    font-size: 24px;
  }
  .code-input-row {
    flex-direction: column;
  }
  .send-code-btn {
    width: 100%;
  }

}
</style>
