<template>
  <div class="app-layout">
    <!-- Compact Sidebar (lg only) -->
    <aside class="sidebar sidebar-compact">
      <SidebarNav compact :unread-count="unreadCount" @navigate="mobileMenuVisible = false" />
    </aside>

    <!-- Full Sidebar (xl only) -->
    <aside class="sidebar sidebar-full">
      <SidebarNav :unread-count="unreadCount" @navigate="mobileMenuVisible = false" />
    </aside>

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- Responsive Content Header (visible when full sidebar is hidden, < 1280px) -->
      <header class="content-header">
        <button class="hamburger-btn" @click="mobileMenuVisible = !mobileMenuVisible">
          <el-icon :size="22"><Menu /></el-icon>
        </button>
        <span class="content-header-brand">心愈智联</span>
        <div class="content-header-spacer" />
        <div class="content-header-user" @click="$router.push('/my-home/info')">
          <el-avatar :size="32" :src="user.headPath">
            <template #default>
              <el-icon :size="18"><User /></el-icon>
            </template>
          </el-avatar>
        </div>
      </header>

      <!-- Tablet Secondary Nav (horizontal pills, 768-1023) -->
      <nav class="secondary-nav-tablet">
        <router-link
          v-for="item in tabletNavItems"
          :key="item.path"
          :to="item.path"
          class="pill-link"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon :size="16"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <main class="main-content">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <el-row :gutter="20" class="footer-row">
            <el-col :xs="24" :sm="8" :md="6" class="footer-section">
              <h3 class="footer-title">联系我们</h3>
              <ul class="footer-list">
                <li><el-icon><Message /></el-icon>客服邮箱：support@aiyouthmental.com</li>
                <li><el-icon><Phone /></el-icon>客服热线：400-1234-5678</li>
                <li><el-icon><Clock /></el-icon>服务时间：周一至周日 9:00-21:00</li>
                <li><el-icon><Location /></el-icon>公司地址：北京市海淀区心理健康路88号</li>
              </ul>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6" class="footer-section">
              <h3 class="footer-title">法律声明</h3>
              <ul class="footer-list">
                <li><el-link type="primary" underline="never" @click="$router.push('/privacy')">隐私保护协议</el-link></li>
                <li><el-link type="primary" underline="never" @click="$router.push('/service-agreement')">用户服务协议</el-link></li>
                <li><el-link type="primary" underline="never" @click="$router.push('/disclaimer')">免责声明</el-link></li>
                <li><el-link type="primary" underline="never" @click="$router.push('/child-protection')">未成年人保护指引</el-link></li>
                <li><el-link type="primary" underline="never" @click="$router.push('/feedback')">意见反馈</el-link></li>
                <li><el-link type="primary" underline="never" @click="showPlatformIntro">平台简介</el-link></li>
              </ul>
            </el-col>
            <el-col :xs="24" :sm="8" :md="6" class="footer-section">
              <h3 class="footer-title">备案信息</h3>
              <ul class="footer-list">
                <li><el-icon><Document /></el-icon>京ICP备 202500001号-1</li>
                <li><el-icon><DocumentChecked /></el-icon>京公网安备 11010802030001号</li>
                <li><el-icon><Medal /></el-icon>互联网信息服务许可证</li>
                <li><el-icon><Stamp /></el-icon>心理健康服务备案号：XLJK2025001</li>
              </ul>
            </el-col>
            <el-col :xs="24" :sm="24" :md="6" class="footer-section qrcode-section">
              <h3 class="footer-title">关注我们</h3>
              <div class="qrcode-container">
                <div class="qrcode-item">
                  <img src="/image/2d_code/wechat-miniprogram-qrcode.png" alt="微信小程序" class="qrcode-image" @click="showQrCodeDialog('微信小程序')" />
                  <p>微信小程序</p>
                </div>
                <div class="qrcode-item">
                  <img src="/image/2d_code/wechat-miniprogram-qrcode.png" alt="微信公众号" class="qrcode-image" @click="showQrCodeDialog('微信公众号')" />
                  <p>微信公众号</p>
                </div>
              </div>
            </el-col>
          </el-row>
          <div class="copyright">
            <p>&copy; 2025 AI青少年心理健康平台 版权所有 | 青少年心理健康服务专线：12355</p>
            <p>本平台所有内容，包括文字、图片、音频、视频等，除特别注明外，均为AI青少年心理健康平台版权所有，未经授权禁止转载。</p>
            <p>本平台致力于为青少年提供专业、安全、可靠的心理健康服务，如有紧急情况，请立即联系当地心理援助热线或前往专业医疗机构。</p>
          </div>
        </div>
      </footer>
    </div>

    <!-- Mobile Bottom Nav -->
    <MobileBottomNav />

    <!-- Mobile Sheet Menu -->
    <MobileSheet v-model="mobileMenuVisible" :unread-count="unreadCount" />

    <!-- Feedback Dialog -->
    <el-dialog v-model="feedbackVisible" title="我要反馈" width="500px">
      <el-form :model="feedbackForm">
        <el-form-item label="反馈内容">
          <el-input type="textarea" v-model="feedbackForm.content" :rows="4" placeholder="请输入您的宝贵意见..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交</el-button>
      </template>
    </el-dialog>

    <!-- QR Code Dialog -->
    <el-dialog v-model="qrCodeDialogVisible" :title="qrCodeDialogTitle" width="300px" align-center>
      <div class="qr-code-dialog-content">
        <img :src="currentQrCodeSrc" alt="二维码" class="qr-code-large" />
        <p class="qr-code-tip">使用微信扫描二维码{{ qrCodeDialogTitle }}</p>
      </div>
    </el-dialog>

    <!-- Platform Intro -->
    <PlatformIntro v-model="platformIntroVisible" :title="platformIntroTitle" @confirm="handlePlatformIntroConfirm" />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Message, Phone, Clock, Location, Document, DocumentChecked, Medal, Stamp,
  HomeFilled, Reading, VideoPlay, ChatDotRound, Service, Collection, Headset,
  Menu, User,
} from '@element-plus/icons-vue'
import { submitPlatformFeedback } from '@/api/feedback'
import { getUnreadCount } from '@/api/message'
import { ElMessage } from 'element-plus'
import PlatformIntro from '@/components/PlatformIntro.vue'
import SidebarNav from './components/SidebarNav.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
import MobileSheet from './components/MobileSheet.vue'

const router = useRouter()
const route = useRoute()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const mobileMenuVisible = ref(false)
const platformIntroVisible = ref(false)
const platformIntroTitle = ref('平台简介')
const unreadCount = ref(0)
const feedbackVisible = ref(false)
const feedbackForm = reactive({ content: '' })
const qrCodeDialogVisible = ref(false)
const qrCodeDialogTitle = ref('')
const currentQrCodeSrc = ref('')

const isLoggedIn = computed(() => !!localStorage.getItem('token') && !!user.id)

const tabletNavItems = [
  { path: '/home', label: '首页', icon: HomeFilled },
  { path: '/ai-consultation', label: 'AI树洞', icon: Service },
  { path: '/consultation', label: '专业咨询', icon: ChatDotRound },
  { path: '/assessments', label: '小测试', icon: DocumentChecked },
  { path: '/articles', label: '暖心短文', icon: Reading },
  { path: '/courses', label: '小课堂', icon: VideoPlay },
  { path: '/books', label: '暖心书单', icon: Collection },
  { path: '/xiaoai-listen', label: '小爱倾听', icon: Headset },
]

function isActive(path: string) {
  if (path === '/home') return route.path === '/home'
  return route.path.startsWith(path)
}

function showPlatformIntro() {
  platformIntroTitle.value = '平台简介'
  platformIntroVisible.value = true
}

function handlePlatformIntroConfirm() {
  localStorage.setItem('hasSeenPlatformIntro', 'true')
  localStorage.removeItem('isFirstLogin')
  platformIntroTitle.value = '平台简介'
}

function fetchUnreadCount() {
  if (!isLoggedIn.value) return
  getUnreadCount().then(res => {
    if (res.code === 200) unreadCount.value = res.data
  }).catch(() => {})
}

function submitFeedback() {
  if (!feedbackForm.content) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  submitPlatformFeedback(feedbackForm).then((res: any) => {
    if (res.code === 200) {
      ElMessage.success('提交成功，感谢您的反馈！')
      feedbackVisible.value = false
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  })
}

function showQrCodeDialog(type: string) {
  qrCodeDialogTitle.value = type
  currentQrCodeSrc.value = '/image/2d_code/wechat-miniprogram-qrcode.png'
  qrCodeDialogVisible.value = true
}

onMounted(() => { fetchUnreadCount() })
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7f5;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

/* ==================== Sidebars ==================== */
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  background: #ffffff;
  border-right: 1px solid #e8eee8;
  display: none;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(61, 173, 111, 0.06);
}

.sidebar-compact {
  width: 72px;
}

.sidebar-full {
  width: 272px;
}

@media (min-width: 1024px) {
  .sidebar-compact { display: flex; }
}

@media (min-width: 1280px) {
  .sidebar-compact { display: none; }
  .sidebar-full { display: flex; }
}

/* ==================== Main Wrapper ==================== */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

@media (min-width: 1024px) {
  .main-wrapper { padding-left: 72px; }
}

@media (min-width: 1280px) {
  .main-wrapper { padding-left: 272px; }
}

/* ==================== Content Header (mobile/tablet, < 1280px) ==================== */
.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #e8eee8;
  position: sticky;
  top: 0;
  z-index: 30;
}

@media (min-width: 1280px) {
  .content-header { display: none; }
}

.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1a2e1a;
  cursor: pointer;
  transition: background 0.15s;
}

@media (min-width: 768px) {
  .hamburger-btn { display: none; }
}

.hamburger-btn:hover {
  background: #e8f5ee;
  color: #3dad6f;
}

.content-header-brand {
  font-size: 16px;
  font-weight: 700;
  color: #3dad6f;
  letter-spacing: 1px;
}

.content-header-spacer {
  flex: 1;
}

.content-header-user {
  cursor: pointer;
  border-radius: 50%;
  transition: box-shadow 0.15s;
  flex-shrink: 0;
}

.content-header-user:hover {
  box-shadow: 0 0 0 3px rgba(61, 173, 111, 0.2);
}

/* ==================== Tablet Secondary Nav ==================== */
.secondary-nav-tablet {
  display: none;
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  border-bottom: 1px solid #e8eee8;
  padding: 8px 16px;
  overflow-x: auto;
  gap: 8px;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .secondary-nav-tablet { display: flex; }
}

.pill-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  color: #6b7b6b;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}

.pill-link:hover {
  color: #3dad6f;
  background: #e8f5ee;
}

.pill-link.active {
  color: #3dad6f;
  background: #e8f5ee;
  font-weight: 600;
}

/* ==================== Main Content ==================== */
.main-content {
  flex: 1;
  padding-bottom: 80px;
}

@media (min-width: 768px) {
  .main-content { padding-bottom: 0; }
}

/* ==================== Footer ==================== */
.app-footer {
  background: #ffffff;
  border-top: 1px solid #e8eee8;
  color: #6b7b6b;
  padding: 40px 20px 20px;
  flex-shrink: 0;
  padding-bottom: 100px;
}

@media (min-width: 768px) {
  .app-footer { padding-bottom: 20px; }
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-row {
  margin-bottom: 30px;
}

.footer-section {
  margin-bottom: 30px;
}

.footer-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #3dad6f;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8f5ee;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list li {
  margin-bottom: 12px;
  color: #6b7b6b;
  font-size: 14px;
  display: flex;
  align-items: center;
  line-height: 1.5;
}

.footer-list li .el-icon {
  margin-right: 8px;
  color: #3dad6f;
  font-size: 16px;
}

.footer-list :deep(.el-link) {
  color: #6b7b6b;
  font-size: 14px;
}

.footer-list :deep(.el-link:hover) {
  color: #3dad6f;
}

.qrcode-section {
  text-align: center;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.qrcode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s;
  margin-bottom: 8px;
}

.qrcode-image:hover {
  transform: scale(1.05);
}

.qrcode-item p {
  font-size: 14px;
  color: #6b7b6b;
  margin: 0;
}

.qr-code-dialog-content {
  text-align: center;
}

.qr-code-large {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 12px;
}

.qr-code-tip {
  color: #6b7b6b;
  font-size: 14px;
}

.copyright {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #e8eee8;
  color: #9ead9e;
  font-size: 13px;
  line-height: 1.6;
}

.copyright p {
  margin: 5px 0;
}
</style>
