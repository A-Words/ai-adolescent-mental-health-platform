<template>
  <div class="greeting-section">
    <div class="greeting-left">
      <h1 class="greeting-title">
        你好，{{ nickname }}
        <span class="sprout-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 6c-2 5-6 10-6 16 0 3.314 2.686 6 6 6s6-2.686 6-6c0-6-4-11-6-16z" fill="#3dad6f" opacity="0.7"/>
            <path d="M16 6c0 0-8 8-8 18 0 1.5 1 2.5 2 2.5s2-1 2-2.5C12 16 16 6 16 6z" fill="#5bc4bf" opacity="0.5"/>
          </svg>
        </span>
      </h1>
      <div class="greeting-meta">
        <span>今天是 {{ today }}</span>
        <span class="meta-divider" />
        <span>关注自己，从一个小行动开始</span>
      </div>
    </div>
    <div class="greeting-right">
      <div class="hero-banner">
        <Transition name="quote-fade" mode="out-in">
          <div class="hero-text" :key="currentQuoteKey">
            <p>{{ quoteLine1 }}</p>
            <p>{{ quoteLine2 }}</p>
            <span v-if="currentAuthor" class="hero-quote-author">—— {{ currentAuthor }}</span>
            <span class="hero-bar" />
          </div>
        </Transition>
        <div class="hero-decoration">
          <img src="/image/title/小可爱.png" alt="" class="hero-plant-left" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { getQuotes } from '@/api/quote'

const props = defineProps<{
  nickname?: string
}>()

const today = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())
})

const quotes = ref<{ content: string; author: string }[]>([])
const currentIndex = ref(-1)
const currentQuoteKey = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const currentQuote = computed(() => {
  if (currentIndex.value < 0 || quotes.value.length === 0) return null
  return quotes.value[currentIndex.value]
})

const quoteLine1 = computed(() => {
  if (!currentQuote.value) return '每一次关注自己，'
  const content = currentQuote.value.content
  if (content.length <= 15) return content
  return content.slice(0, 15)
})

const quoteLine2 = computed(() => {
  if (!currentQuote.value) return '都是成长的开始。'
  const content = currentQuote.value.content
  if (content.length <= 15) return ''
  if (content.length <= 30) return content.slice(15)
  return content.slice(15, 30) + (content.length > 30 ? '…' : '')
})

const currentAuthor = computed(() => {
  return currentQuote.value?.author || ''
})

function nextQuote() {
  if (quotes.value.length <= 1) return
  let next: number
  do {
    next = Math.floor(Math.random() * quotes.value.length)
  } while (next === currentIndex.value && quotes.value.length > 1)
  currentIndex.value = next
  currentQuoteKey.value++
}

onMounted(async () => {
  try {
    const res = await getQuotes() as any
    if (res.code === 200 && res.data) {
      const data = Array.isArray(res.data) ? res.data
        : res.data.records || res.data.list || [res.data]
      quotes.value = data
      if (data.length > 0) {
        currentIndex.value = Math.floor(Math.random() * data.length)
        currentQuoteKey.value = 1
        if (data.length > 1) {
          timer = setInterval(nextQuote, 10000)
        }
      }
    }
  } catch (e) { /* ignore */ }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.greeting-section {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
}

@media (min-width: 1024px) {
  .greeting-section {
    grid-template-columns: 1fr 560px;
    align-items: center;
  }
}

.greeting-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a2e1a;
  line-height: 1.25;
  margin: 0 0 20px;
}

@media (min-width: 768px) {
  .greeting-title {
    font-size: 36px;
  }
}

.sprout-icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
}

.greeting-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #6b7b6b;
}

.meta-divider {
  display: block;
  width: 1px;
  height: 20px;
  background: #e8eee8;
}

.hero-banner {
  display: none;
  position: relative;
  height: 112px;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(61, 173, 111, 0.06) 0%, rgba(91, 196, 191, 0.08) 100%);
}

@media (min-width: 1024px) {
  .hero-banner {
    display: block;
  }
}

.hero-text {
  position: absolute;
  left: 32px;
  top: 16px;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.6;
  color: #3dad6f;
}

.hero-text p {
  margin: 0;
}

.hero-quote-author {
  display: block;
  font-size: 13px;
  color: #5bc4bf;
  font-style: italic;
  margin-top: 4px;
}

.hero-bar {
  display: block;
  margin-top: 12px;
  width: 32px;
  height: 4px;
  border-radius: 999px;
  background: #3dad6f;
}

.hero-decoration {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 100%;
  width: 288px;
  border-radius: 0 10px 10px 0;
}

.hero-plant-left {
  position: absolute;
  bottom: -10px;
  right: 100px;
  width: 60px;
  height: 80px;
  object-fit: contain;
  opacity: 0.6;
}

.hero-plant-right {
  position: absolute;
  bottom: -15px;
  right: 20px;
  width: 70px;
  height: 90px;
  object-fit: contain;
  opacity: 0.5;
}

/* Quote transition */
.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
