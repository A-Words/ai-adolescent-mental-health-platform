<template>
  <div class="apply-psychologist-page">
    <!-- 背景动效层 -->
    <div class="bg-effects">
      <div class="bg-gradient"></div>
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="light-ray ray-1"></div>
      <div class="light-ray ray-2"></div>
    </div>

    <!-- 顶部 Hero 区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </span>
          专业平台 · 值得信赖
        </div>
        <h1 class="hero-title">成为我们的心理咨询师</h1>
        <p class="hero-subtitle">加入心愈智联平台，与专业团队并肩，为青少年心理健康事业贡献力量</p>
        <div class="hero-stats">
          <div class="stat-item" v-for="(stat, index) in stats" :key="index" :ref="el => statRefs[index] = el as HTMLElement">
            <span class="stat-number">0</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
        <div class="hero-cta">
          <el-button type="primary" size="large" class="hero-btn" @click="scrollToContent">
            了解更多
            <el-icon><ArrowDown /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-orb main-orb"></div>
        <div class="visual-orb orb-2"></div>
        <div class="visual-orb orb-3"></div>
        <div class="heart-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="rgba(61,173,111,0.8)">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div class="mini-card card-1"><span class="card-icon">🌱</span><span>专业督导</span></div>
        <div class="mini-card card-2"><span class="card-icon">☀️</span><span>温暖关怀</span></div>
        <div class="mini-card card-3"><span class="card-icon">💚</span><span>隐私保护</span></div>
      </div>
    </div>

    <!-- 平台优势区域 -->
    <div class="section-wrapper advantages-section">
      <div class="section-header">
        <h2 class="section-title">为什么选择心愈智联</h2>
        <p class="section-desc">专业、安全、高效的在线心理咨询平台</p>
      </div>
      <div class="advantages-grid">
        <div class="advantage-card" v-for="(adv, index) in advantages" :key="index">
          <div class="advantage-icon" :style="{ background: adv.bgColor }">
            <span v-html="adv.icon"></span>
          </div>
          <h3 class="advantage-title">{{ adv.title }}</h3>
          <p class="advantage-desc">{{ adv.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 强大后台资源 -->
    <div class="section-wrapper resource-section">
      <div class="section-header">
        <h2 class="section-title">强大的后台资源支持</h2>
        <p class="section-desc">我们为您提供全方位的技术与运营支持</p>
      </div>
      <div class="resource-grid">
        <div class="resource-card" v-for="(res, index) in resources" :key="index">
          <div class="resource-icon-wrapper">
            <div class="resource-icon" v-html="res.icon"></div>
          </div>
          <h3>{{ res.title }}</h3>
          <p>{{ res.desc }}</p>
          <ul>
            <li v-for="(item, i) in res.features" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 宣传展示 -->
    <div class="section-wrapper promotion-wrapper">
      <div class="promotion-banner">
        <div class="promotion-decoration left-deco">
          <div class="deco-circle c1"></div>
          <div class="deco-circle c2"></div>
          <div class="deco-circle c3"></div>
        </div>
        <div class="promotion-content">
          <h2>专业团队 · 值得信赖</h2>
          <p>心愈智联汇聚了国内外顶尖心理专家，为用户提供科学、专业、温暖的心理咨询服务</p>
          <div class="promotion-tags">
            <span class="promotion-tag" v-for="(tag, i) in promotionTags" :key="i">{{ tag }}</span>
          </div>
        </div>
        <div class="promotion-decoration right-deco">
          <div class="deco-circle c4"></div>
          <div class="deco-circle c5"></div>
        </div>
      </div>
    </div>

    <!-- 入驻要求 -->
    <div class="section-wrapper requirements-section">
      <div class="section-header">
        <h2 class="section-title">入驻要求</h2>
        <p class="section-desc">我们期待志同道合的专业伙伴加入</p>
      </div>
      <div class="requirements-list">
        <div class="requirement-card" v-for="(req, index) in requirements" :key="index">
          <div class="req-number">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="req-content">
            <h3>{{ req.title }}</h3>
            <p>{{ req.desc }}</p>
          </div>
          <div class="req-check"><el-icon><Check /></el-icon></div>
        </div>
      </div>
    </div>

    <!-- 入驻流程 -->
    <div class="section-wrapper process-section">
      <div class="section-header">
        <h2 class="section-title">入驻指南</h2>
        <p class="section-desc">轻松五步，成为心愈智联合作心理咨询师</p>
      </div>
      <div class="process-flow">
        <div
          v-for="(step, index) in processSteps"
          :key="index"
          class="process-step"
          :class="{ 'step-active': activeStep === index }"
          @mouseenter="activeStep = index"
        >
          <div class="step-connector" v-if="index > 0"></div>
          <div class="step-icon"><span v-html="step.icon"></span></div>
          <div class="step-number">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="step-content">
            <h4>{{ step.title }}</h4>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
      <div class="process-diagram">
        <svg viewBox="0 0 800 120" class="flow-svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3dad6f"/>
              <stop offset="100%" stop-color="#5bc4bf"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path d="M 100 60 L 700 60" stroke="url(#lineGradient)" stroke-width="3" fill="none" stroke-dasharray="8,4" filter="url(#glow)"/>
          <circle cx="100" cy="60" r="12" fill="#3dad6f" filter="url(#glow)"/><text x="100" y="65" text-anchor="middle" fill="white" font-size="12" font-weight="bold">1</text>
          <circle cx="220" cy="60" r="12" fill="#3dad6f" filter="url(#glow)"/><text x="220" y="65" text-anchor="middle" fill="white" font-size="12" font-weight="bold">2</text>
          <circle cx="340" cy="60" r="12" fill="#3dad6f" filter="url(#glow)"/><text x="340" y="65" text-anchor="middle" fill="white" font-size="12" font-weight="bold">3</text>
          <circle cx="460" cy="60" r="12" fill="#3dad6f" filter="url(#glow)"/><text x="460" y="65" text-anchor="middle" fill="white" font-size="12" font-weight="bold">4</text>
          <circle cx="580" cy="60" r="12" fill="#3dad6f" filter="url(#glow)"/><text x="580" y="65" text-anchor="middle" fill="white" font-size="12" font-weight="bold">5</text>
          <circle cx="700" cy="60" r="16" fill="#67C23A" filter="url(#glow)"/><text x="700" y="65" text-anchor="middle" fill="white" font-size="14" font-weight="bold">✓</text>
          <text x="100" y="95" text-anchor="middle" fill="#606266" font-size="11">填写资料</text>
          <text x="220" y="95" text-anchor="middle" fill="#606266" font-size="11">完成笔试</text>
          <text x="340" y="95" text-anchor="middle" fill="#606266" font-size="11">提交材料</text>
          <text x="460" y="95" text-anchor="middle" fill="#606266" font-size="11">入驻面谈</text>
          <text x="580" y="95" text-anchor="middle" fill="#606266" font-size="11">等待审核</text>
          <text x="700" y="95" text-anchor="middle" fill="#67C23A" font-size="12" font-weight="bold">成功入驻</text>
        </svg>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="action-section">
      <div class="action-content">
        <h2>准备好加入我们了吗？</h2>
        <p>立即申请，成为心愈智联心理咨询师，开启专业之旅</p>
        <div class="action-buttons">
          <el-button type="primary" size="large" class="apply-btn" @click="handleApply">申请入驻</el-button>
          <el-button size="large" class="return-btn" @click="goBack">返回首页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import { checkApplyEligibility } from '../api/psychologistApply'

const router = useRouter()
const activeStep = ref(0)
const statRefs = reactive<(HTMLElement | null)[]>([])

const stats = [
  { label: '服务用户', value: 5000, suffix: '+' },
  { label: '入驻专家', value: 200, suffix: '+' },
  { label: '好评率', value: 98, suffix: '%' },
  { label: '全天候支持', value: 24, suffix: 'h' }
]

const animateNumber = (el: HTMLElement, target: number, suffix: string, duration: number = 800) => {
  const startTime = performance.now()
  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    el.textContent = Math.round(easeProgress * target) + suffix
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

const scrollToContent = () => {
  document.querySelector('.advantages-section')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  setTimeout(() => {
    statRefs.forEach((el, i) => {
      const stat = stats[i]
      if (el && stat) animateNumber(el, stat.value, stat.suffix)
    })
  }, 500)
})

const advantages = [
  { title: '智能管理系统', desc: '先进的后台管理系统，轻松管理预约、咨询记录和用户数据', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>', bgColor: 'linear-gradient(135deg, #5bc4bf 0%, #764ba2 100%)' },
  { title: '稳定用户流量', desc: '平台日活用户持续增长，为咨询师带来稳定案源', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { title: '专业培训支持', desc: '定期开展专业培训与督导，持续提升咨询能力', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { title: '灵活工作安排', desc: '自主设定咨询时间，平衡工作与生活', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { title: '丰厚收益回报', desc: '具有竞争力的咨询费用分成，付出必有回报', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { title: '隐私安全保障', desc: '端到端加密保护，严格遵守心理咨询伦理规范', icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', bgColor: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
]

const resources = [
  { title: '智能排班系统', desc: '灵活的预约管理，告别手动排期烦恼', icon: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', features: ['可视化日历排班', '自动提醒通知', '时段灵活设置', '多端同步管理'] },
  { title: '数据分析后台', desc: '全方位数据洞察，助力精准服务优化', icon: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', features: ['咨询量统计', '用户画像分析', '收益报表导出', '趋势预测'] },
  { title: '在线支付系统', desc: '安全便捷的收费体系，资金实时到账', icon: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>', features: ['多种支付方式', '自动对账结算', '提现秒到账', '费用透明清晰'] },
  { title: '培训学习中心', desc: '海量专业课程，持续提升咨询技能', icon: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', features: ['专业督导课程', '案例研讨分享', '行业最新资讯', '认证资格培训'] }
]

const promotionTags = ['专业认证', '严格审核', '隐私保护', '科学咨询', '持续督导', '学术支持']

const requirements = [
  { title: '执业资格', desc: '持有执业所在地的法律许可的执业资格证书' },
  { title: '学历要求', desc: '具备全日制大专及以上的学历学位证书' },
  { title: '伦理培训', desc: '近三年接受心理咨询伦理培训时长不少于 9 小时' },
  { title: '系统培训', desc: '完成不少于 1 年（160 学时）的心理咨询流派系统培训' },
  { title: '咨询经验', desc: '付费咨询时长累计不少于 400 小时' },
  { title: '督导经历', desc: '接受个人督导时长累计不少于 60 小时' }
]

const processSteps = [
  { title: '填写基本资料', desc: '提交个人信息、资质证书等基本入驻材料', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { title: '完成笔试考核', desc: '参加平台组织的专业知识和伦理笔试', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
  { title: '提交案例报告', desc: '提交咨询案例报告及个人成长自我叙述', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' },
  { title: '参与入驻面谈', desc: '与平台专业团队进行入驻合作面谈沟通', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { title: '成功入驻平台', desc: '审核通过后正式成为平台合作心理咨询师', icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>' }
]

const goBack = () => router.push('/home')

const handleApply = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在检查申请资格...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    // 调用后端 API 检查申请资格
    const res = await checkApplyEligibility() as any
    loading.close()

    // 后端返回 code: 200
    if (res.code === 200) {
      const data = res.data
      if (data.eligible) {
        // 有资格，跳转到资料填写页面
        router.push('/apply-psychologist/form')
      } else {
        // 无资格，显示原因
        if (data.isPsychologist) {
          ElMessage.warning('您已经是心理咨询师，无需再次申请')
        } else if (data.hasApply) {
          ElMessage.info('您有正在处理中的入驻申请，请等待处理完成')
          router.push('/apply-psychologist/status')
        } else {
          ElMessage.error(data.reason || '暂不符合入驻条件')
        }
      }
    } else {
      ElMessage.error(res.message || '检查资格失败，请稍后重试')
    }
  } catch (error: any) {
    loading.close()
    if (error.response?.status === 401) {
      ElMessage.warning('请先登录后再申请入驻')
      router.push('/login')
    } else {
      ElMessage.error('网络错误，请检查网络连接后重试')
    }
  }
}
</script>

<style scoped>
.apply-psychologist-page { min-height: 100vh; background: #f0f7ff; position: relative; overflow-x: hidden; }

/* ===================== 背景 ===================== */
.bg-effects { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden; }

.bg-gradient {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(61,173,111,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(91,196,191,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(102,126,234,0.04) 0%, transparent 60%);
}

.cloud { position: absolute; background: white; border-radius: 100px; box-shadow: 0 8px 32px rgba(61,173,111,0.08); animation: cloudDrift linear infinite; }
.cloud::before, .cloud::after { content: ''; position: absolute; background: white; border-radius: 50%; }
.cloud-1 { width: 160px; height: 50px; top: 12%; left: -160px; animation-duration: 40s; }
.cloud-1::before { width: 70px; height: 70px; top: -35px; left: 25px; }
.cloud-1::after { width: 50px; height: 50px; top: -22px; left: 70px; }
.cloud-2 { width: 120px; height: 38px; top: 25%; left: -120px; animation-duration: 55s; animation-delay: -20s; opacity: 0.7; }
.cloud-2::before { width: 55px; height: 55px; top: -28px; left: 18px; }
.cloud-2::after { width: 40px; height: 40px; top: -18px; left: 55px; }
.cloud-3 { width: 100px; height: 32px; top: 8%; left: -100px; animation-duration: 70s; animation-delay: -35s; opacity: 0.5; }
.cloud-3::before { width: 45px; height: 45px; top: -22px; left: 15px; }
.cloud-3::after { width: 35px; height: 35px; top: -15px; left: 45px; }
@keyframes cloudDrift { from { transform: translateX(0); } to { transform: translateX(calc(100vw + 200px)); } }

.floating-shape { position: absolute; border-radius: 50%; animation: floatShape ease-in-out infinite; }
.shape-1 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(61,173,111,0.06) 0%, transparent 70%); top: 5%; right: 5%; animation-duration: 12s; }
.shape-2 { width: 200px; height: 200px; background: radial-gradient(circle, rgba(91,196,191,0.05) 0%, transparent 70%); bottom: 20%; left: 3%; animation-duration: 15s; animation-delay: -5s; }
.shape-3 { width: 250px; height: 250px; background: radial-gradient(circle, rgba(102,126,234,0.05) 0%, transparent 70%); top: 45%; right: 8%; animation-duration: 18s; animation-delay: -10s; }
@keyframes floatShape { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(20px, -15px); } 66% { transform: translate(-15px, 10px); } }

.light-ray { position: absolute; background: linear-gradient(to bottom, rgba(255,255,255,0.6), transparent); border-radius: 100px; animation: rayShimmer ease-in-out infinite; }
.ray-1 { width: 3px; height: 300px; top: 0; left: 15%; transform: rotate(15deg); animation-duration: 8s; opacity: 0.5; }
.ray-2 { width: 2px; height: 250px; top: 0; right: 20%; transform: rotate(-10deg); animation-duration: 10s; animation-delay: -4s; opacity: 0.4; }
@keyframes rayShimmer { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }

/* ===================== Hero ===================== */
.hero-section { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; gap: 80px; padding: 80px 60px; z-index: 1; max-width: 1400px; margin: 0 auto; }
.hero-content { flex: 1; max-width: 560px; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; background: rgba(255,255,255,0.9); border: 1px solid rgba(61,173,111,0.15); border-radius: 50px; font-size: 14px; color: #3dad6f; margin-bottom: 32px; box-shadow: 0 4px 20px rgba(61,173,111,0.08); animation: fadeDown 0.8s ease-out; }
.badge-icon { display: flex; align-items: center; }
.hero-title { font-size: 52px; font-weight: 800; color: #1a1a2e; margin: 0 0 24px; line-height: 1.2; animation: fadeDown 0.8s ease-out 0.1s both; }
.hero-subtitle { font-size: 18px; color: #606266; max-width: 500px; margin: 0 0 48px; line-height: 1.8; animation: fadeDown 0.8s ease-out 0.2s both; }
.hero-stats { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 40px; animation: fadeUp 0.8s ease-out 0.3s both; }
.stat-item { text-align: center; padding: 20px 28px; background: white; border-radius: 20px; box-shadow: 0 4px 24px rgba(61,173,111,0.08); border: 1px solid rgba(61,173,111,0.08); transition: all 0.3s; min-width: 120px; }
.stat-item:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(61,173,111,0.12); }
.stat-number { display: block; font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #3dad6f, #5bc4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.stat-label { display: block; font-size: 13px; color: #909399; margin-top: 6px; }
.hero-cta { animation: fadeUp 0.8s ease-out 0.4s both; }
.hero-btn { padding: 14px 36px !important; font-size: 16px !important; border-radius: 50px !important; background: linear-gradient(135deg, #3dad6f, #5bc4bf) !important; border: none !important; font-weight: 600 !important; box-shadow: 0 8px 30px rgba(61,173,111,0.25) !important; display: inline-flex !important; align-items: center !important; gap: 8px !important; transition: all 0.3s !important; }
.hero-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 40px rgba(61,173,111,0.35) !important; }

.hero-visual { flex: 1; max-width: 480px; height: 480px; position: relative; display: flex; align-items: center; justify-content: center; animation: fadeIn 1s ease-out 0.5s both; }
.visual-orb { position: absolute; border-radius: 50%; animation: orbFloat ease-in-out infinite; }
.main-orb { width: 280px; height: 280px; background: radial-gradient(circle at 30% 30%, rgba(61,173,111,0.2), rgba(91,196,191,0.15), rgba(102,126,234,0.1)); box-shadow: 0 20px 80px rgba(61,173,111,0.15); animation-duration: 6s; }
.orb-2 { width: 180px; height: 180px; background: radial-gradient(circle, rgba(91,196,191,0.15), transparent); top: 10%; right: 5%; animation-duration: 8s; animation-delay: -3s; }
.orb-3 { width: 120px; height: 120px; background: radial-gradient(circle, rgba(102,126,234,0.12), transparent); bottom: 15%; left: 10%; animation-duration: 10s; animation-delay: -6s; }
@keyframes orbFloat { 0%, 100% { transform: translate(0,0); } 33% { transform: translate(15px,-20px) scale(1.03); } 66% { transform: translate(-10px,15px) scale(0.97); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.heart-icon { position: relative; z-index: 10; animation: heartBeat 3s ease-in-out infinite; filter: drop-shadow(0 10px 30px rgba(61,173,111,0.2)); }
@keyframes heartBeat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.15); } 30% { transform: scale(1); } 45% { transform: scale(1.1); } 60% { transform: scale(1); } }
.mini-card { position: absolute; background: white; border-radius: 16px; padding: 12px 18px; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #303133; box-shadow: 0 8px 30px rgba(0,0,0,0.08); animation: cardFloat ease-in-out infinite; z-index: 20; }
.card-1 { top: 15%; right: 0; animation-duration: 5s; }
.card-2 { bottom: 25%; left: 0; animation-duration: 6s; animation-delay: -2s; }
.card-3 { bottom: 5%; right: 15%; animation-duration: 7s; animation-delay: -4s; }
.card-icon { font-size: 18px; }
@keyframes cardFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

/* ===================== 通用 ===================== */
.section-wrapper { max-width: 1200px; margin: 0 auto; padding: 100px 20px; position: relative; z-index: 1; }
.section-header { text-align: center; margin-bottom: 60px; }
.section-title { font-size: 40px; font-weight: 700; color: #1a1a2e; margin: 0 0 16px; }
.section-desc { font-size: 16px; color: #909399; margin: 0; }

/* ===================== 平台优势 ===================== */
.advantages-section { background: linear-gradient(180deg, transparent 0%, rgba(61,173,111,0.03) 50%, transparent 100%); }
.advantages-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.advantage-card { background: white; border-radius: 24px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.04); transition: all 0.4s ease; position: relative; overflow: hidden; }
.advantage-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #3dad6f, #5bc4bf); transform: scaleX(0); transition: transform 0.4s ease; }
.advantage-card:hover::after { transform: scaleX(1); }
.advantage-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 20px 60px rgba(61,173,111,0.12); border-color: rgba(61,173,111,0.15); }
.advantage-icon { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #fff; margin-bottom: 24px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.advantage-title { font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; }
.advantage-desc { font-size: 15px; color: #909399; line-height: 1.7; margin: 0; }

/* ===================== 资源 ===================== */
.resource-section { background: white; max-width: 100%; padding: 100px 0; }
.resource-section > .section-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.resource-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.resource-card { background: linear-gradient(135deg, #f8faff 0%, #fff 100%); border: 1px solid rgba(61,173,111,0.08); border-radius: 24px; padding: 36px 24px; text-align: center; transition: all 0.4s ease; }
.resource-card:hover { border-color: rgba(61,173,111,0.3); transform: translateY(-8px); box-shadow: 0 16px 50px rgba(61,173,111,0.1); }
.resource-icon-wrapper { width: 80px; height: 80px; margin: 0 auto 24px; background: linear-gradient(135deg, rgba(61,173,111,0.1), rgba(91,196,191,0.08)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #3dad6f; }
.resource-card h3 { font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
.resource-card > p { font-size: 14px; color: #909399; margin: 0 0 20px; }
.resource-card ul { list-style: none; padding: 0; margin: 0; text-align: left; }
.resource-card li { font-size: 14px; color: #606266; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.04); display: flex; align-items: center; gap: 8px; }
.resource-card li::before { content: '✓'; color: #67C23A; font-weight: bold; font-size: 12px; }
.resource-card li:last-child { border-bottom: none; }

/* ===================== 宣传 ===================== */
.promotion-wrapper { padding-top: 0; }
.promotion-banner { background: linear-gradient(135deg, #3dad6f 0%, #5bc4bf 50%, #5bc4bf 100%); border-radius: 32px; padding: 60px 80px; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; box-shadow: 0 20px 80px rgba(61,173,111,0.2); }
.promotion-banner::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
.promotion-decoration { position: absolute; display: flex; gap: 16px; align-items: center; }
.left-deco { left: 40px; top: 50%; transform: translateY(-50%); }
.right-deco { right: 40px; top: 50%; transform: translateY(-50%); }
.deco-circle { border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); animation: decoExpand ease-out infinite; }
.c1, .c4 { width: 60px; height: 60px; animation-duration: 4s; }
.c2, .c5 { width: 40px; height: 40px; animation-duration: 4s; animation-delay: -1.5s; }
.c3 { width: 25px; height: 25px; animation-duration: 4s; animation-delay: -3s; }
@keyframes decoExpand { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.3); opacity: 0; } }
.promotion-content { position: relative; z-index: 10; max-width: 500px; }
.promotion-content h2 { font-size: 36px; color: #fff; margin: 0 0 16px; font-weight: 700; }
.promotion-content p { font-size: 16px; color: rgba(255,255,255,0.9); line-height: 1.8; margin: 0 0 28px; }
.promotion-tags { display: flex; flex-wrap: wrap; gap: 10px; }
.promotion-tag { padding: 8px 18px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 50px; color: #fff; font-size: 14px; font-weight: 500; transition: all 0.3s; }
.promotion-tag:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }

/* ===================== 入驻要求 ===================== */
.requirements-section { background: linear-gradient(180deg, transparent 0%, rgba(91,196,191,0.02) 50%, transparent 100%); }
.requirements-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.requirement-card { background: white; border-radius: 20px; padding: 32px; display: flex; align-items: flex-start; gap: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.04); transition: all 0.4s ease; }
.requirement-card:hover { border-color: rgba(61,173,111,0.2); box-shadow: 0 12px 40px rgba(61,173,111,0.08); transform: translateX(8px); }
.req-number { width: 52px; height: 52px; background: linear-gradient(135deg, #3dad6f, #5bc4bf); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 800; flex-shrink: 0; box-shadow: 0 6px 20px rgba(61,173,111,0.25); }
.req-content { flex: 1; }
.req-content h3 { font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
.req-content p { font-size: 14px; color: #909399; line-height: 1.6; margin: 0; }
.req-check { width: 32px; height: 32px; background: linear-gradient(135deg, #67C23A, #95de64); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; flex-shrink: 0; margin-top: 4px; }

/* ===================== 流程 ===================== */
.process-section { background: white; max-width: 100%; padding: 100px 0; }
.process-section > .section-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.process-flow { display: flex; justify-content: space-between; position: relative; margin-bottom: 60px; padding: 0 40px; }
.process-step { flex: 1; text-align: center; position: relative; z-index: 2; cursor: pointer; }
.step-connector { position: absolute; top: 40px; left: -50%; right: 50%; height: 3px; background: linear-gradient(90deg, rgba(0,0,0,0.06), rgba(61,173,111,0.3)); z-index: -1; transition: background 0.3s; }
.process-step:hover .step-connector, .step-active .step-connector { background: linear-gradient(90deg, #3dad6f, #5bc4bf); }
.step-icon { width: 80px; height: 80px; margin: 0 auto 16px; background: white; border: 3px solid rgba(0,0,0,0.06); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #909399; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: all 0.4s ease; }
.process-step:hover .step-icon, .step-active .step-icon { border-color: #3dad6f; background: linear-gradient(135deg, #3dad6f, #5bc4bf); color: #fff; box-shadow: 0 10px 35px rgba(61,173,111,0.3); transform: scale(1.12) translateY(-4px); }
.step-number { font-size: 14px; font-weight: 700; color: #c0c4cc; margin-bottom: 10px; transition: color 0.3s; }
.process-step:hover .step-number, .step-active .step-number { color: #3dad6f; }
.step-content h4 { font-size: 17px; font-weight: 700; color: #303133; margin: 0 0 6px; }
.step-content p { font-size: 13px; color: #909399; margin: 0; max-width: 160px; margin: 0 auto; line-height: 1.5; }
.process-diagram { background: linear-gradient(135deg, #f8faff 0%, #fff 100%); border: 1px solid rgba(61,173,111,0.08); border-radius: 24px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); }
.flow-svg { width: 100%; height: auto; }

/* ===================== 底部 ===================== */
.action-section { padding: 100px 20px; text-align: center; position: relative; z-index: 1; background: linear-gradient(180deg, transparent 0%, rgba(61,173,111,0.03) 100%); }
.action-content h2 { font-size: 40px; font-weight: 800; color: #1a1a2e; margin: 0 0 16px; }
.action-content p { font-size: 16px; color: #909399; margin: 0 0 48px; }
.action-buttons { display: flex; justify-content: center; gap: 20px; }
.apply-btn { padding: 16px 56px !important; font-size: 16px !important; border-radius: 50px !important; background: linear-gradient(135deg, #3dad6f, #5bc4bf) !important; border: none !important; font-weight: 700 !important; box-shadow: 0 10px 35px rgba(61,173,111,0.3) !important; transition: all 0.3s !important; }
.apply-btn:hover { transform: translateY(-4px) !important; box-shadow: 0 16px 50px rgba(61,173,111,0.4) !important; }
.return-btn { padding: 16px 56px !important; font-size: 16px !important; border-radius: 50px !important; border: 2px solid rgba(0,0,0,0.1) !important; color: #606266 !important; background: white !important; font-weight: 600 !important; transition: all 0.3s !important; }
.return-btn:hover { border-color: #3dad6f !important; color: #3dad6f !important; transform: translateY(-4px) !important; box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important; }

@keyframes fadeDown { from { opacity: 0; transform: translateY(-24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

/* ===================== 响应式 ===================== */
@media (max-width: 1200px) {
  .hero-section { gap: 40px; padding: 60px 40px; }
  .hero-visual { max-width: 380px; height: 380px; }
  .hero-title { font-size: 42px; }
  .resource-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 1024px) {
  .hero-section { flex-direction: column; text-align: center; }
  .hero-content { max-width: 100%; }
  .hero-subtitle { margin: 0 auto 48px; }
  .hero-stats { justify-content: center; }
  .hero-visual { max-width: 300px; height: 300px; }
  .advantages-grid { grid-template-columns: repeat(2, 1fr); }
  .promotion-banner { flex-direction: column; text-align: center; padding: 48px 32px; }
  .promotion-decoration { display: none; }
  .requirements-list { grid-template-columns: 1fr; }
  .process-flow { flex-direction: column; gap: 40px; padding: 0; }
  .step-connector { display: none; }
}
@media (max-width: 768px) {
  .hero-title { font-size: 32px; }
  .hero-stats { gap: 12px; }
  .stat-item { padding: 16px 20px; min-width: 100px; }
  .stat-number { font-size: 28px; }
  .advantages-grid { grid-template-columns: 1fr; }
  .resource-grid { grid-template-columns: 1fr; }
  .section-title { font-size: 28px; }
  .action-buttons { flex-direction: column; align-items: center; }
  .apply-btn, .return-btn { width: 100%; max-width: 280px; }
  .section-wrapper { padding: 60px 16px; }
  .promotion-content h2 { font-size: 28px; }
  .action-content h2 { font-size: 30px; }
}
</style>
