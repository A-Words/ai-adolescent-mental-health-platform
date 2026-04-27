<template>
  <div class="my-home-fans">
    <h2>我的粉丝</h2>
    
    <div class="user-list" v-loading="loading">
      <el-empty v-if="!loading && users.length === 0" description="还没有粉丝"></el-empty>
      
      <div v-for="item in users" :key="item.userId" class="user-item">
        <el-avatar :size="50" :src="item.headPath" @click.native="visitHome(item.userId)" class="clickable-avatar">
          <template #default>
            <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
          </template>
        </el-avatar>
        <div class="user-info">
          <div class="nickname" @click="visitHome(item.userId)">{{ item.nickname }}</div>
          <div class="signature" v-if="item.signature">{{ item.signature }}</div>
        </div>
        <div class="user-actions">
          <el-button size="small" @click="visitHome(item.userId)">访问主页</el-button>
          <el-button v-if="!item.isFollowing" size="small" type="primary" @click="handleFollow(item.userId)">回关</el-button>
        </div>
      </div>
    </div>
    
    <el-pagination
      v-if="total > 0"
      class="pagination"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    ></el-pagination>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyFollowers, followUser, type UserInfoVO } from '@/api/follow'

const router = useRouter()
const loading = ref(false)
const users = ref<UserInfoVO[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const fetchFollowers = async () => {
  loading.value = true
  try {
    const res = await getMyFollowers({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      users.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取粉丝列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  await fetchFollowers()
}

const visitHome = (userId: number) => {
  router.push(`/user-home/${userId}`)
}

const handleFollow = async (userId: number) => {
  try {
    const res = await followUser(userId)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchFollowers()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '关注失败')
  }
}

onMounted(() => {
  fetchFollowers()
})
</script>

<style scoped>
.my-home-fans h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #1a2e1a !important;
}

.user-list {
  margin-top: 15px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.user-item:last-child {
  border-bottom: none;
}

.clickable-avatar {
  cursor: pointer;
  transition: transform 0.2s;
}
.clickable-avatar:hover {
  transform: scale(1.1);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  cursor: pointer;
  color: #3dad6f !important;
}
.nickname:hover {
  text-decoration: underline;
}

.signature {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55) !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
