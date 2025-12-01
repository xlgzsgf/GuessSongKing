<template>
  <div class="library-select">
    <div class="header-section">
      <div class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        <span class="back-text">返回</span>
      </div>
      <div style="width: 30%;text-align: center;margin: 10px auto">
        <img style="width: 100%;max-width:200px" src="/static/logo.png" alt="猜歌王" class="logo">
      </div>
      <h1 class="page-title">选择曲库</h1>
      <p class="page-subtitle">开启专属音乐挑战</p>
    </div>

    <div class="content-section">
      <div class="library-grid" v-if="!loading && libraries.length > 0">
        <div
          v-for="library in libraries"
          :key="library.id"
          class="library-card"
          @click="selectLibrary(library)"
        >
          <div class="library-avatar-wrapper">
            <img
              :src="getLibraryAvatar(library)"
              :alt="library.name"
              @error="handleImageError"
              class="library-avatar"
            />
            <div class="avatar-overlay"></div>
          </div>
          <div class="library-details">
            <div class="library-name-row">
              <h2 class="library-name">{{ library.name }}</h2>
              <span class="playing-badge" v-if="hasActiveGame(library.id)">游戏中</span>
            </div>
            <p class="song-count">{{ library.songCount }} 首歌曲</p>

            <!-- 统计信息 -->
            <div class="library-stats" v-if="getLibraryStats(library.id)">
              <div class="stat-item">
                <span class="stat-label">挑战</span>
                <span class="stat-value">{{ getLibraryStats(library.id).totalGames }}局</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">答对</span>
                <span class="stat-value">{{ getLibraryStats(library.id).totalCorrect }}题</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最佳</span>
                <span class="stat-value">{{ getLibraryStats(library.id).bestAccuracy }}%</span>
              </div>
            </div>
            <div class="no-stats" v-else>
              <span class="no-stats-text">暂无挑战记录</span>
            </div>
          </div>
        </div>
      </div>

      <div class="loading-state" v-if="loading">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>

      <div class="empty-state" v-if="!loading && libraries.length === 0">
        <p class="empty-text">暂无曲库数据</p>
      </div>
    </div>

    <div class="footer">
      <p>猜歌王 @千诚</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getGameRecords, getCurrentGame } from '../utils/gameStorage'

const router = useRouter()
const libraries = ref([])
const loading = ref(true)
const libraryStats = ref({})

// 加载题库索引
const loadQuestionIndex = async () => {
  try {
    loading.value = true
    const response = await fetch('/Question/index.json')
    if (!response.ok) {
      throw new Error('加载题库索引失败')
    }
    const data = await response.json()
    libraries.value = data.artists || []
  } catch (error) {
    console.error('加载题库索引失败:', error)
    libraries.value = []
  } finally {
    loading.value = false
  }
}

// 加载曲库统计数据
const loadLibraryStats = () => {
  const records = getGameRecords()
  const stats = {}

  // 统计每个曲库的游戏数据
  records.forEach(record => {
    const libraryId = record.artistId
    if (!libraryId) return

    if (!stats[libraryId]) {
      stats[libraryId] = {
        totalGames: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        bestAccuracy: 0
      }
    }

    stats[libraryId].totalGames++
    stats[libraryId].totalCorrect += record.correct || 0
    stats[libraryId].totalQuestions += record.total || 0

    // 更新最佳正确率
    const accuracy = record.accuracy || 0
    if (accuracy > stats[libraryId].bestAccuracy) {
      stats[libraryId].bestAccuracy = accuracy
    }
  })

  libraryStats.value = stats
}

// 检查曲库是否有活跃的游戏
const hasActiveGame = (libraryId) => {
  const savedGame = getCurrentGame(libraryId)
  return savedGame && savedGame.gameStarted
}

// 获取曲库统计信息
const getLibraryStats = (libraryId) => {
  return libraryStats.value[libraryId] || null
}

// 获取曲库头像
const getLibraryAvatar = (library) => {
  if (library.avatar) {
    // 如果是完整URL，直接返回
    if (library.avatar.startsWith('http://') || library.avatar.startsWith('https://')) {
      return library.avatar
    }
    // 否则当作相对路径处理
    return library.avatar
  }
  // 默认头像
  return '/static/logo.png'
}

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.src = '/static/logo.png'
}

// 选择曲库
const selectLibrary = (library) => {
  router.push({
    name: 'GuessSong',
    query: {
      artistId: library.id,
      artistName: library.name
    }
  })
}

// 返回首页
const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadQuestionIndex()
  loadLibraryStats()
})

// 监听曲库列表变化，当曲库数据加载完成后检查游戏状态
watch(libraries, () => {
  // 不需要额外的操作，因为 hasActiveGame 函数会在渲染时调用
})
</script>

<style scoped>
.library-select {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%);
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  padding-top: 0 ! important;
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  padding-top: 45px;
}

.back-button {
  position: absolute;
  left: 0;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.back-button:hover {
  color: #00f5ff;
  background: rgba(0, 245, 255, 0.1);
  border-color: rgba(0, 245, 255, 0.3);
}

.back-button:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 18px;
}

.back-text {
  font-size: 14px;
  font-weight: 500;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin: 0 0 12px 0;
  text-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
}

/* 内容区域 */
.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.library-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.library-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.library-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 245, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 245, 255, 0.2);
}

.library-card:hover::before {
  opacity: 1;
}

.library-card:active {
  transform: translateY(-2px) scale(0.98);
}

.library-avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.library-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(0, 245, 255, 0.3);
  transition: all 0.3s ease;
}

.library-card:hover .library-avatar {
  border-color: #00f5ff;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, transparent 60%, rgba(0, 245, 255, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.library-card:hover .avatar-overlay {
  opacity: 1;
}

.library-details {
  text-align: center;
  position: relative;
  z-index: 1;
}

.library-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.library-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin: 0;
  letter-spacing: 0.5px;
}

.playing-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  color: #000;
  font-size: 11px;
  font-weight: bold;
  border-radius: 12px;
  letter-spacing: 0.5px;
  animation: pulse-badge 2s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(0, 245, 255, 0.4);
}

@keyframes pulse-badge {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(0, 245, 255, 0.4);
  }
  50% {
    box-shadow: 0 2px 12px rgba(0, 245, 255, 0.8);
  }
}

.song-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px 0;
  font-weight: 500;
}

/* 统计信息 */
.library-stats {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  color: #00f5ff;
  font-weight: bold;
}

.no-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.no-stats-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 245, 255, 0.2);
  border-top-color: #00f5ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  margin: 0;
}

/* 底部 */
.footer {
  text-align: center;
  padding-top: 20px;
  margin-top: auto;
}

.footer p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  letter-spacing: 0.3px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .library-select {
    padding: 20px 15px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .library-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .library-card {
    padding: 20px;
  }

  .library-avatar-wrapper {
    width: 100px;
    height: 100px;
  }

  .library-name {
    font-size: 18px;
  }

  .song-count {
    font-size: 13px;
  }

  .back-button {
    padding: 6px 10px;
  }

  .back-icon {
    font-size: 18px;
  }

  .back-text {
    font-size: 13px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .library-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .library-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>