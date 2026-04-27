<template>
  <div class="login-wrapper">
    <!-- 隐私政策弹窗 -->
    <el-dialog v-model="privacyDialogVisible" title="用户隐私安全须知" width="80%" :before-close="handlePrivacyDialogClose" class="login-privacy-dialog">
      <div class="privacy-content">
        <div class="privacy-section">
          <h3>一、适用范围</h3>
          <p>本隐私安全须知用于心愈智联已注明的产品和服务，网站、服务和产品若未显示本争吵内容或链接，或各自有专属隐私政策，则本隐私政策不适用。</p>
        </div>
        <div class="privacy-section">
          <h3>二、内容收集范围</h3>
          <ul>
            <li><strong>（1）基本个人信息：</strong>用户名、昵称、头像、性别、手机号码、电子邮箱、出生日期等。</li>
            <li><strong>（2）设备信息：</strong>设备型号、设备标识、系统版本等。</li>
            <li><strong>（3）其它：</strong>位置信息、相册、麦克风、摄像头、存储权限等。</li>
          </ul>
        </div>
        <div class="privacy-section">
          <h3>三、如何收集及使用信息</h3>
          <div class="subsection">
            <h4>（1）您向我们提供信息：</h4>
            <p>当您在线注册心愈智联产品账户时，您需要提供电子邮件地址或手机号等，以便我们识别您的身份或与您联络，我们会利用一些有效方法，确认您的个人资料的正确性与有效性。</p>
          </div>
          <div class="subsection">
            <h4>（2）在您使用服务过程中收集的信息</h4>
            <p>为了提供并优化您需要的服务，我们会收集您使用服务的相关信息。</p>
          </div>
          <div class="subsection">
            <h4>（3）Cookie</h4>
            <p>为使您获得更轻松的访问体验，您访问本产品相关网站或使用本产品提供的服务时，我们可能会通过小型数据文件识别您的身份。</p>
          </div>
        </div>
        <div class="privacy-section">
          <h3>四、存储和保护您的个人数据</h3>
          <div class="subsection">
            <h4>（1）数据保护措施</h4>
            <p>本产品将合法收集和存储您的个人数据，采取合理的预防措施，以保护您的个人信息不会遭受未经授权的浏览、披露、滥用、变更、破坏以及损失。</p>
          </div>
          <div class="subsection">
            <h4>（2）信息储存</h4>
            <p>我们将在为您提供服务的所必要的期限保留您的信息。</p>
          </div>
          <div class="subsection">
            <h4>（3）信息删除</h4>
            <p>我们不会超期储存您的信息，当您选择退出、终止服务，注销账户或是不再向您提供服务时，将对您的信息进行删除处理。</p>
          </div>
        </div>
        <div class="privacy-section">
          <h3>五、第三方SDK</h3>
          <p>为保障本产品相关功能的实现与优化，我们会接入由第三方公司开发的软件工具包（SDK）及服务。这些第三方服务方可能会收集、使用您的相关信息：</p>
          <div class="subsection">
            <h4>（1）存储相关类</h4>
            <p><strong>阿里云OSS对象存储</strong> - 用于该网站图片和视频等的存储</p>
          </div>
          <div class="subsection">
            <h4>（2）AI服务相关类</h4>
            <p><strong>阿里云通义千问大模型</strong> - 用于与用户之间沟通相关心理健康的问题</p>
          </div>
        </div>
        <div class="privacy-section">
          <h3>六、本隐私安全须知的更新</h3>
          <div class="subsection">
            <h4>（1）政策更新</h4>
            <p>本产品可能会不定期修改、更新本隐私政策。</p>
          </div>
          <div class="subsection">
            <h4>（2）权利保障</h4>
            <p>未经您明确同意，我们不会削减您按照本《软件隐私安全须知》所应享有的权利。</p>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="privacyDialogReadOnly" type="primary" @click="() => { agreedToPrivacy = true; privacyDialogVisible = false; privacyDialogReadOnly = false; }" class="close-privacy-btn">
            我已阅读并同意（点击后将允许登录）
          </el-button>
          <el-button v-else @click="privacyDialogVisible = false" class="close-privacy-btn-secondary">
            我已阅读
          </el-button>
        </span>
      </template>
    </el-dialog>

    <div class="canvas-side">
      <!-- Canvas 流星雨画布 -->
      <canvas ref="meteorCanvas" class="meteor-canvas"></canvas>
      <div class="bg-text-container">
        <div class="bg-text text-line-1">听见你</div>
        <div class="bg-text text-line-2">陪伴你</div>
      </div>
      <LoginCharacters :is-peeking="isPeeking" :is-back-turned="isBackTurned" :is-error="isError" class="login-chars" />
      <div class="stars-container">
        <div class="star star-1"></div>
        <div class="star star-2"></div>
        <div class="star star-3"></div>
        <div class="star star-4"></div>
        <div class="star star-5"></div>
      </div>
    </div>

    <div class="form-side">
      <el-card class="login-card">
        <div class="brand-title">
          <span v-for="(char, index) in brandChars" :key="index" :style="{ animationDelay: `${index * 150}ms` }" @click="backHome">{{ char }}</span>
        </div>
        <h2>欢迎回来！</h2>
        <p class="subtitle">请输入您的账号信息</p>

        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <div class="login-tab" :class="{ active: loginTab === 'account' }" @click="switchTab('account')">
            账号登录
          </div>
          <div class="login-tab" :class="{ active: loginTab === 'email' }" @click="switchTab('email')">
            邮箱登录
          </div>
        </div>

        <!-- 账号登录 -->
        <el-form v-show="loginTab === 'account'" :model="accountForm" :rules="accountRules" ref="accountFormRef" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="accountForm.username" placeholder="请输入用户名" @focus="handlePasswordFocus" @blur="handlePasswordBlur" class="custom-input">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="accountForm.password" :type="passwordType" placeholder="请输入密码" @focus="handlePasswordFocus" @blur="handlePasswordBlur" class="custom-input">
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
              <template #suffix>
                <el-icon class="cursor-pointer" @click="togglePasswordVisibility">
                  <View v-if="passwordType === 'text'" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <div class="form-actions">
            <el-checkbox v-model="rememberMe" class="remember-checkbox">30天免登录</el-checkbox>
            <el-link type="info" underline="never" class="forgot-link" @click="$router.push('/forgot-password')">忘记密码？</el-link>
          </div>
        </el-form>

        <!-- 邮箱登录 -->
        <el-form v-show="loginTab === 'email'" :model="emailForm" :rules="emailRules" ref="emailFormRef" label-position="top">
          <!-- 登录方式切换：验证码 or 密码 -->
          <div class="email-login-mode-switch">
            <span class="mode-btn" :class="{ active: emailLoginMode === 'code' }" @click="emailLoginMode = 'code'">
              验证码登录
            </span>
            <span class="mode-divider">|</span>
            <span class="mode-btn" :class="{ active: emailLoginMode === 'password' }" @click="emailLoginMode = 'password'">
              密码登录
            </span>
          </div>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="emailForm.email" placeholder="请输入邮箱地址" class="custom-input" @focus="handlePasswordFocus" @blur="handlePasswordBlur">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 验证码登录 -->
          <template v-if="emailLoginMode === 'code'">
            <el-form-item label="验证码" prop="code">
              <div class="code-input-row">
                <el-input v-model="emailForm.code" placeholder="请输入6位验证码" class="custom-input code-input" maxlength="6" @focus="handlePasswordFocus" @blur="handlePasswordBlur">
                  <template #prefix>
                    <el-icon><Key /></el-icon>
                  </template>
                </el-input>
                <el-button class="send-code-btn" :disabled="codeCountdown > 0" @click="handleSendCode" :loading="sendingCode">
                  {{ codeCountdown > 0 ? `${codeCountdown}秒后重发` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </template>

          <!-- 密码登录 -->
          <template v-else>
            <el-form-item label="密码" prop="password">
              <el-input v-model="emailForm.password" :type="emailPasswordType" placeholder="请输入密码" class="custom-input" @focus="handlePasswordFocus" @blur="handlePasswordBlur">
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
                <template #suffix>
                  <el-icon class="cursor-pointer" @click="toggleEmailPasswordVisibility">
                    <View v-if="emailPasswordType === 'text'" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
          </template>

          <div class="form-actions">
            <el-checkbox v-model="rememberMe" class="remember-checkbox">30天免登录</el-checkbox>
            <el-link type="info" underline="never" class="forgot-link" @click="$router.push('/forgot-password')">忘记密码？</el-link>
          </div>
        </el-form>

        <div class="privacy-agreement">
          <el-checkbox v-model="agreedToPrivacy" class="privacy-checkbox">
            同意我们的<el-link type="primary" @click="showPrivacyDialog" class="privacy-link">隐私政策</el-link>
          </el-checkbox>
        </div>

        <!-- 登录按钮 -->
        <el-button type="primary" class="full-width-btn login-btn" @click="handleLogin" :loading="loading">
          {{ loginTab === 'account' ? '登 录' : '登 录' }}
        </el-button>

        <div class="register-link">
          还没有账号？
          <el-link type="primary" @click="$router.push('/register')" class="register-link-btn">去注册</el-link>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { login, loginByEmailCode, loginByEmailPassword, sendEmailCode } from '../api/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { View, Hide, User, Lock, Message, Key } from '@element-plus/icons-vue'
import LoginCharacters from '../components/LoginCharacters.vue'

const router = useRouter()
const accountFormRef = ref<FormInstance>()
const emailFormRef = ref<FormInstance>()
const loading = ref(false)
const meteorCanvas = ref<HTMLCanvasElement>()

// 登录方式 tab
const loginTab = ref<'account' | 'email'>('account')
const emailLoginMode = ref<'code' | 'password'>('code')

// Animation states
const isPeeking = ref(false)
const isBackTurned = ref(false)
const isError = ref(false)
const passwordType = ref('password')
const emailPasswordType = ref('password')
const rememberMe = ref(false)
const brandChars = ref(['心', '愈', '智', '联'])

// 隐私政策相关状态
const privacyDialogVisible = ref(false)
const agreedToPrivacy = ref(false)
const privacyDialogReadOnly = ref(false)

// 邮箱登录相关
const sendingCode = ref(false)
const codeCountdown = ref(0)
let codeCountdownTimer: ReturnType<typeof setInterval> | null = null

// 流星雨相关
let context: CanvasRenderingContext2D | null = null
let animationFrameId: number | null = null
const rainCount = 25
let rains: MeteorRain[] = []

// ========== 流星雨类 ==========
class MeteorRain {
  x: number = -1
  y: number = -1
  length: number = -1
  angle: number = 30
  width: number = -1
  height: number = -1
  speed: number = 1
  offset_x: number = -1
  offset_y: number = -1
  alpha: number = 1
  color1: string = ""
  color2: string = ""

  init() {
    this.getPos()
    this.alpha = 1
    this.getRandomColor()
    const x = Math.random() * 80 + 150
    this.length = Math.ceil(x)
    const speed = Math.random() + 0.5
    this.speed = speed
    const cos = Math.cos((this.angle * 3.14) / 180)
    const sin = Math.sin((this.angle * 3.14) / 180)
    this.width = this.length * cos
    this.height = this.length * sin
    this.offset_x = this.speed * cos
    this.offset_y = this.speed * sin
  }

  getRandomColor() {
    this.color1 = "rgba(255, 255, 255, 0.9)"
    this.color2 = "rgba(255, 255, 255, 0)"
  }

  countPos() {
    this.x = this.x - this.offset_x
    this.y = this.y + this.offset_y
  }

  getPos() {
    this.x = Math.random() * (meteorCanvas.value?.width || window.innerWidth)
    this.y = -Math.random() * 100
  }

  draw() {
    if (!context) return
    context.save()
    context.beginPath()
    context.lineWidth = 1.5
    context.globalAlpha = this.alpha
    const line = context.createLinearGradient(this.x, this.y, this.x + this.width, this.y - this.height)
    line.addColorStop(0, "rgba(255, 255, 255, 1)")
    line.addColorStop(0.2, this.color1)
    line.addColorStop(0.5, "rgba(255, 255, 255, 0.6)")
    line.addColorStop(0.8, "rgba(255, 255, 255, 0.3)")
    line.addColorStop(1, this.color2)
    context.strokeStyle = line
    context.moveTo(this.x, this.y)
    context.lineTo(this.x + this.width, this.y - this.height)
    context.closePath()
    context.stroke()
    context.restore()
  }

  move() {
    if (!context) return
    const x = this.x + this.width - this.offset_x
    const y = this.y - this.height
    context.clearRect(x - 5, y - 5, this.offset_x + 10, this.offset_y + 10)
    this.countPos()
    this.alpha -= 0.002
    this.draw()
  }
}

const initCanvas = () => {
  if (!meteorCanvas.value) return
  const canvas = meteorCanvas.value
  const parent = canvas.parentElement
  if (parent) {
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight
  }
  context = canvas.getContext('2d')
  rains = []
  for (let i = 0; i < rainCount; i++) {
    const rain = new MeteorRain()
    rain.init()
    rains.push(rain)
  }
}

const playRains = () => {
  if (!context || !meteorCanvas.value) return
  for (let n = 0; n < rainCount; n++) {
    const rain = rains[n]
    if (!rain) continue
    rain.move()
    if (rain.y > meteorCanvas.value.height) {
      context.clearRect(rain.x, rain.y - rain.height, rain.width, rain.height)
      const newRain = new MeteorRain()
      newRain.init()
      rains[n] = newRain
    }
  }
  animationFrameId = requestAnimationFrame(playRains)
}

const startMeteorShower = () => {
  if (!meteorCanvas.value) return
  initCanvas()
  if (rains.length === 0) {
    for (let i = 0; i < rainCount; i++) {
      const rain = new MeteorRain()
      rain.init()
      rains.push(rain)
    }
  }
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  playRains()
}

const handleResize = () => {
  if (meteorCanvas.value) {
    const parent = meteorCanvas.value.parentElement
    if (parent) {
      meteorCanvas.value.width = parent.clientWidth
      meteorCanvas.value.height = parent.clientHeight
    }
  }
}

onMounted(() => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  nextTick(() => {
    if (meteorCanvas.value) {
      startMeteorShower()
      window.addEventListener('resize', handleResize)
    }
  })
  window.addEventListener('keydown', handleKeydown)
})

const backHome = () => {
  router.push('/home')
}

const getRedirectPath = (role: number) => {
  const pathMap: Record<number, string> = {
    2: '/doctor/dashboard',
    3: '/hospital/dashboard',
    4: '/admin/dashboard'
  }
  return pathMap[role] || '/home'
}

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  if (codeCountdownTimer) clearInterval(codeCountdownTimer)
})

// ========== 表单数据 ==========
const accountForm = reactive({
  username: '',
  password: ''
})

const emailForm = reactive({
  email: '',
  code: '',
  password: ''
})

const accountRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const emailRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

// ========== 方法 ==========
const switchTab = (tab: 'account' | 'email') => {
  loginTab.value = tab
}

const handlePasswordFocus = () => {
  isPeeking.value = true
}

const handlePasswordBlur = () => {
  isPeeking.value = false
}

const togglePasswordVisibility = () => {
  if (passwordType.value === 'password') {
    passwordType.value = 'text'
    isBackTurned.value = true
  } else {
    passwordType.value = 'password'
    isBackTurned.value = false
  }
}

const toggleEmailPasswordVisibility = () => {
  if (emailPasswordType.value === 'password') {
    emailPasswordType.value = 'text'
  } else {
    emailPasswordType.value = 'password'
  }
}

// 发送邮箱验证码
const handleSendCode = async () => {
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailReg.test(emailForm.email)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }
  sendingCode.value = true
  try {
    const res = await sendEmailCode({ email: emailForm.email, scene: 'login' })
    if (res.code === 200) {
      ElMessage.success('验证码已发送到您的邮箱')
      codeCountdown.value = 60
      if (codeCountdownTimer) clearInterval(codeCountdownTimer)
      codeCountdownTimer = setInterval(() => {
        codeCountdown.value--
        if (codeCountdown.value <= 0) {
          if (codeCountdownTimer) clearInterval(codeCountdownTimer)
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

// 回车登录处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    if (privacyDialogVisible.value) {
      if (privacyDialogReadOnly.value) {
        agreedToPrivacy.value = true
        privacyDialogVisible.value = false
        privacyDialogReadOnly.value = false
      }
      return
    }
    if (!agreedToPrivacy.value) {
      privacyDialogReadOnly.value = true
      privacyDialogVisible.value = true
      return
    }
    handleLogin()
  }
}

const showPrivacyDialog = () => {
  privacyDialogReadOnly.value = false
  privacyDialogVisible.value = true
}

const handlePrivacyDialogClose = (done: () => void) => {
  if (privacyDialogReadOnly.value) {
    agreedToPrivacy.value = true
    privacyDialogReadOnly.value = false
  }
  done()
}

// ==================== 登录 ====================
const handleLogin = async () => {
  if (!agreedToPrivacy.value) {
    ElMessage.warning('请勾选同意隐私政策')
    return
  }
  if (loginTab.value === 'account') {
    await handleAccountLogin()
  } else {
    await handleEmailLogin()
  }
}

const handleAccountLogin = async () => {
  if (!accountFormRef.value) return
  await accountFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(accountForm, rememberMe.value)
        if (res.code === 200) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('user', JSON.stringify(res.data.userInfo))
          
          // 设置首次登录标记
          if (!localStorage.getItem('hasSeenPlatformIntro')) {
            localStorage.setItem('isFirstLogin', 'true')
          }
          
          ElMessage.success('登录成功')
          router.push(getRedirectPath(res.data.userInfo.role))
        } else {
          ElMessage.error(res.message)
          triggerErrorAnimation()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败')
        triggerErrorAnimation()
      } finally {
        loading.value = false
      }
    } else {
      triggerErrorAnimation()
    }
  })
}

const handleEmailLogin = async () => {
  if (!emailFormRef.value) return
  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        let res
        if (emailLoginMode.value === 'code') {
          // 验证码登录
          res = await loginByEmailCode({
            email: emailForm.email,
            code: emailForm.code
          })
        } else {
          // 密码登录
          res = await loginByEmailPassword({
            email: emailForm.email,
            password: emailForm.password,
            remember: rememberMe.value
          })
        }
        if (res.code === 200) {
          localStorage.setItem('token', res.data.token)
          localStorage.setItem('user', JSON.stringify(res.data.userInfo))
          
          // 设置首次登录标记
          if (!localStorage.getItem('hasSeenPlatformIntro')) {
            localStorage.setItem('isFirstLogin', 'true')
          }
          
          ElMessage.success('登录成功')
          if (codeCountdownTimer) clearInterval(codeCountdownTimer)
          router.push(getRedirectPath(res.data.userInfo.role))
        } else {
          ElMessage.error(res.message)
          triggerErrorAnimation()
        }
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败')
        triggerErrorAnimation()
      } finally {
        loading.value = false
      }
    } else {
      triggerErrorAnimation()
    }
  })
}

const triggerErrorAnimation = () => {
  isError.value = true
  setTimeout(() => {
    isError.value = false
  }, 1500)
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f5f7f5;
}

.canvas-side {
  flex: 1;
  background: linear-gradient(135deg, #a8d8c8, #8bb8a8);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.meteor-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  background-color: #ffffff;
  border-radius: 50%;
  animation: twinkle 3s infinite ease-in-out;
}

.star-1 {
  width: 4px;
  height: 4px;
  top: 15%;
  left: 20%;
  animation-delay: 0s;
}

.star-2 {
  width: 6px;
  height: 6px;
  top: 25%;
  right: 30%;
  animation-delay: 0.5s;
}

.star-3 {
  width: 3px;
  height: 3px;
  bottom: 30%;
  left: 15%;
  animation-delay: 1s;
}

.star-4 {
  width: 5px;
  height: 5px;
  bottom: 20%;
  right: 25%;
  animation-delay: 1.5s;
}

.star-5 {
  width: 4px;
  height: 4px;
  top: 40%;
  left: 50%;
  animation-delay: 2s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.bg-text-container {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 0;
  pointer-events: none;
}

.bg-text {
  font-family: "YouYuan", "Microsoft YaHei", "Nunito", sans-serif;
  font-size: 8rem;
  font-weight: 800;
  letter-spacing: 0.5rem;
  line-height: 1.5;
  white-space: nowrap;
  opacity: 0;
  background: linear-gradient(45deg, #3dad6f, #5bc4bf);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.text-line-1 {
  margin-bottom: 1rem;
  margin-right: 50%;
  animation: fadeInUp 1s ease-out 0.2s forwards;
}

.text-line-2 {
  margin-top: 1rem;
  margin-left: 30%;
  animation: fadeInUp 1s ease-out 1.2s forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px) scale(0.9); }
  to { opacity: 0.5; transform: translateY(0) scale(1); }
}

.login-chars {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  background-color: transparent !important;
}

.brand-title {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 70px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 30px;
  margin-top: 60px;
  font-family: "Microsoft YaHei", sans-serif;
  letter-spacing: 8px;
  white-space: nowrap;
  overflow: visible;
  cursor: pointer;
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

.form-side {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #f5f7f5;
  max-width: 600px;
}

.login-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06) !important;
  border: 1px solid #e8eee8 !important;
  background-color: #ffffff !important;
  border-radius: 16px !important;
  padding: 40px;
}

.login-card h2 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1a2e1a;
  text-align: center;
}

.subtitle {
  color: #6b7b6b;
  text-align: center;
  margin-bottom: 20px;
}

/* 登录 tab 切换 */
.login-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  background-color: #e8f5ee;
  border-radius: 9999px;
  padding: 4px;
  border: none;
}

.login-tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 9999px;
  color: #6b7b6b;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-tab.active {
  background: #3dad6f;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(61, 173, 111, 0.25);
}

.login-tab:not(.active):hover {
  color: #3dad6f;
}

/* 邮箱登录方式切换 */
.email-login-mode-switch {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.mode-btn {
  color: #6b7b6b;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 9999px;
}

.mode-btn.active {
  color: #3dad6f;
  font-weight: 600;
}

.mode-btn:not(.active):hover {
  color: #3dad6f;
}

.mode-divider {
  color: #e8eee8;
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

/* 自定义输入框样式 */
.custom-input :deep(.el-input__wrapper) {
  background-color: #f5f7f5 !important;
  border: 1px solid #e8eee8;
  border-radius: 9999px;
  box-shadow: none !important;
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
}

.custom-input :deep(.el-input__prefix) {
  color: #3dad6f;
}

:deep(.el-form-item__label) {
  color: #1a2e1a !important;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-checkbox :deep(.el-checkbox__label) {
  color: #6b7b6b !important;
}

.remember-checkbox :deep(.el-checkbox__inner) {
  border-color: #e8eee8;
  background-color: #ffffff;
}

.remember-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #3dad6f;
  border-color: #3dad6f;
}

.forgot-link {
  color: #6b7b6b !important;
}

.forgot-link:hover {
  color: #3dad6f !important;
}

.privacy-agreement {
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f5f7f5;
  border-radius: 12px;
  border: 1px solid #e8eee8;
}

.privacy-checkbox :deep(.el-checkbox__label) {
  color: #6b7b6b !important;
  font-size: 14px;
}

.privacy-checkbox :deep(.el-checkbox__inner) {
  border-color: #e8eee8;
  background-color: #ffffff;
}

.privacy-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #3dad6f;
  border-color: #3dad6f;
}

.privacy-link {
  margin-left: 4px;
  color: #3dad6f !important;
}

.privacy-link:hover {
  color: #2d8a55 !important;
  text-decoration: underline !important;
}

.full-width-btn {
  width: 100%;
  height: 44px;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 600;
  border: none;
}

.login-btn {
  background: #3dad6f !important;
  color: #ffffff !important;
  border: none !important;
  transition: all 0.2s ease !important;
}

.login-btn:hover {
  background: #2d8a55 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(61, 173, 111, 0.25) !important;
}

.login-btn:active {
  transform: translateY(0);
}

.register-link {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7b6b;
}

.register-link-btn {
  color: #3dad6f !important;
  font-weight: 500;
}

.register-link-btn:hover {
  color: #2d8a55 !important;
  text-decoration: underline !important;
}

.cursor-pointer {
  cursor: pointer;
  color: #3dad6f;
}

/* 隐私政策弹窗样式 */
.privacy-dialog :deep(.el-dialog) {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e8eee8;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.privacy-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #e8eee8;
  padding: 20px 24px;
  margin-right: 0;
  flex-shrink: 0;
}

.privacy-dialog :deep(.el-dialog__title) {
  color: #1a2e1a;
  font-weight: 600;
  font-size: 20px;
}

.privacy-dialog :deep(.el-dialog__headerbtn) {
  top: 20px;
}

.privacy-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #6b7b6b;
  font-size: 20px;
}

.privacy-dialog :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #3dad6f;
}

.privacy-dialog :deep(.el-dialog__body) {
  padding: 24px;
  color: #6b7b6b;
  height: 400px;
  overflow-y: auto;
  flex: 1;
}

.privacy-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #e8eee8;
  padding: 16px 24px;
  flex-shrink: 0;
}

.close-privacy-btn {
  background-color: #3dad6f !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 500;
}

.close-privacy-btn:hover {
  background-color: #2d8a55 !important;
}

.close-privacy-btn-secondary {
  background-color: transparent !important;
  color: #6b7b6b !important;
  border: 1px solid #e8eee8 !important;
}

.close-privacy-btn-secondary:hover {
  background-color: #f5f7f5 !important;
  color: #3dad6f !important;
}

.privacy-content {
  font-size: 14px;
  line-height: 1.6;
}

.privacy-section {
  margin-bottom: 24px;
}

.privacy-section h3 {
  color: #1a2e1a;
  margin-bottom: 12px;
  font-size: 16px;
  padding-left: 8px;
  border-left: 3px solid #3dad6f;
}

.privacy-section p {
  margin-bottom: 12px;
  text-align: justify;
}

.privacy-section ul {
  padding-left: 20px;
  margin-bottom: 12px;
}

.privacy-section li {
  margin-bottom: 8px;
}

.privacy-section strong {
  color: #3dad6f;
}

.subsection {
  margin-bottom: 16px;
}

.subsection h4 {
  color: #6b7b6b;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.privacy-dialog :deep(.el-dialog__body::-webkit-scrollbar) {
  width: 6px;
}

.privacy-dialog :deep(.el-dialog__body::-webkit-scrollbar-track) {
  background: #f5f7f5;
  border-radius: 3px;
}

.privacy-dialog :deep(.el-dialog__body::-webkit-scrollbar-thumb) {
  background: #e8eee8;
  border-radius: 3px;
}

.privacy-dialog :deep(.el-dialog__body::-webkit-scrollbar-thumb:hover) {
  background: #d0d8d0;
}
</style>

<style lang="css">
.login-privacy-dialog.el-dialog {
  background-color: #ffffff !important;
  border-radius: 16px;
  border: 1px solid #e8eee8;
  max-height: 90vh !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}

.login-privacy-dialog .el-dialog__header {
  border-bottom: 1px solid #e8eee8;
  padding: 20px 24px;
  margin-right: 0;
  flex-shrink: 0;
}

.login-privacy-dialog .el-dialog__body {
  padding: 24px !important;
  color: #6b7b6b !important;
  height: 400px !important;
  max-height: 400px !important;
  overflow-y: auto !important;
  flex: 1 !important;
  min-height: 0 !important;
}

.login-privacy-dialog .el-dialog__footer {
  border-top: 1px solid #e8eee8;
  padding: 16px 24px;
  flex-shrink: 0;
}

.login-privacy-dialog .el-dialog__body::-webkit-scrollbar {
  width: 6px;
}

.login-privacy-dialog .el-dialog__body::-webkit-scrollbar-track {
  background: #f5f7f5;
  border-radius: 3px;
}

.login-privacy-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background: #e8eee8;
  border-radius: 3px;
}

.login-privacy-dialog .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background: #d0d8d0;
}

.login-privacy-dialog .close-privacy-btn {
  background-color: #3dad6f !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 500;
}

.login-privacy-dialog .close-privacy-btn:hover {
  background-color: #2d8a55 !important;
}

.login-privacy-dialog .close-privacy-btn-secondary {
  background-color: transparent !important;
  color: #6b7b6b !important;
  border: 1px solid #e8eee8 !important;
}

.login-privacy-dialog .close-privacy-btn-secondary:hover {
  background-color: #f5f7f5 !important;
  color: #3dad6f !important;
}

.login-privacy-dialog .el-dialog__title {
  color: #1a2e1a !important;
}
</style>