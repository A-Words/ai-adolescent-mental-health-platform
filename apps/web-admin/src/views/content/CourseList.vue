<template>
  <div class="course-list">
    <el-tabs v-model="activeType" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name=""></el-tab-pane>
      <el-tab-pane v-for="cat in categories" :key="cat.code" :label="cat.name" :name="cat.code"></el-tab-pane>
    </el-tabs>

    <div v-loading="loading" class="course-grid">
      <el-card v-for="course in courseList" :key="course.id" class="course-card" shadow="hover" @click="goToDetail(course)">
        <el-image v-if="course.coverUrl" :src="course.coverUrl" fit="cover" class="cover-image"></el-image>
        <div class="info">
          <div class="source-tag" v-if="course.sourceName">
              <el-tag size="small" effect="plain">{{ course.sourceName }}</el-tag>
          </div>
          <h3>{{ course.title }}</h3>
          <p class="desc">{{ (course.description || '').substring(0, 50) }}{{ (course.description || '').length > 50 ? '...' : '' }}</p>
        </div>
      </el-card>
      <el-empty v-if="courseList.length === 0 && !loading" description="暂无课程"></el-empty>
    </div>

    <el-pagination
      v-if="total > 0"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCourses, type Course } from '@/api/content'
import { getEnabledCategories } from '@/api/courseCategory'
import { ElMessage } from 'element-plus'

const courseList = ref<Course[]>([])
const loading = ref(false)
const activeType = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const categories = ref<any[]>([])

const fetchCategories = async () => {
  try {
    const res = await getEnabledCategories() as any
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchCourses = async () => {
  loading.value = true
  try {
    const res = await getCourses({ page: currentPage.value, size: pageSize.value, type: activeType.value || undefined })
    if (res.code === 200) {
      courseList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleTabClick = (tab: any) => {
  activeType.value = tab.props.name
  currentPage.value = 1
  fetchCourses()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchCourses()
}

const goToDetail = (course: Course) => {
  if (course.mediaUrl && (course.mediaUrl.startsWith('http') || course.mediaUrl.startsWith('https'))) {
    window.open(course.mediaUrl, '_blank')
  } else {
    ElMessage.info('该课程暂不支持在线播放')
  }
}

onMounted(async () => {
  await fetchCategories()
  fetchCourses()
})
</script>

<style scoped>
.course-list {
  padding: 20px;
  color: #1a2e1a;
}

.course-list :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
}
.course-list :deep(.el-tabs__item.is-active) {
  font-weight: 700;
  font-size: 16px;
}
.course-list :deep(.el-tabs__active-bar) {
  background-color: #3dad6f !important;
  height: 3px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.course-card {
  cursor: pointer;
}
.cover-image {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
}
.info {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}
.info h3 {
  margin: 0 0 6px 0;
  color: #1a2e1a;
  font-size: 15px;
}
.source-tag {
  margin-bottom: 5px;
}
.desc {
  color: #6b7b6b;
  font-size: 12px;
  margin: 0;
}
</style>
