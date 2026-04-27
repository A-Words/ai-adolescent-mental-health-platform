<template>
  <div class="my-home-follow">
    <h2>我的关注</h2>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="我的关注" name="followings">
        <div class="user-list" v-loading="loading">
          <el-empty v-if="!loading && followings.length === 0" description="还没有关注任何人"></el-empty>
          
          <div v-for="user in followings" :key="user.userId" class="user-item">
            <el-avatar :size="50" :src="user.headPath">
              <template #default>
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
              </template>
            </el-avatar>
            <div class="user-info">
              <div class="nickname">{{ user.nickname }}</div>
              <div class="signature" v-if="user.signature">{{ user.signature }}</div>
            </div>
            <div class="user-actions">
              <el-button size="small" @click="visitHome(user.userId)">访问主页</el-button>
              <el-button size="small" type="danger" @click="handleUnfollow(user.userId)">取消关注</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="我的粉丝" name="followers">
        <div class="user-list" v-loading="loading">
          <el-empty v-if="!loading && followers.length === 0" description="还没有粉丝"></el-empty>
          
          <div v-for="user in followers" :key="user.userId" class="user-item">
            <el-avatar :size="50" :src="user.headPath">
              <template #default>
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
              </template>
            </el-avatar>
            <div class="user-info">
              <div class="nickname">{{ user.nickname }}</div>
              <div class="signature" v-if="user.signature">{{ user.signature }}</div>
            </div>
            <div class="user-actions">
              <el-button size="small" @click="visitHome(user.userId)">访问主页</el-button>
              <el-button v-if="!user.isFollowing" size="small" type="primary" @click="handleFollow(user.userId)">回关</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyFollowings, getMyFollowers, followUser, unfollowUser, type UserInfoVO } from '@/api/follow'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('followings')
const followings = ref<UserInfoVO[]>([])
const followers = ref<UserInfoVO[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const fetchFollowings = async () => {
  loading.value = true
  try {
    const res = await getMyFollowings({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      followings.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取关注列表失败')
  } finally {
    loading.value = false
  }
}

const fetchFollowers = async () => {
  loading.value = true
  try {
    const res = await getMyFollowers({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      followers.value = res.data.records
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
  if (activeTab.value === 'followings') {
    await fetchFollowings()
  } else {
    await fetchFollowers()
  }
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

const handleUnfollow = async (userId: number) => {
  try {
    await ElMessageBox.confirm('确定要取消关注吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await unfollowUser(userId)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchFollowings()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消关注失败')
    }
  }
}

onMounted(() => {
  fetchFollowings()
})
</script>

<style scoped>
.my-home-follow h2 {
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

.user-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #1a2e1a !important;
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
