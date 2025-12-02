<template>
  <div class="library-select">
    <LibraryHeader @back="goBack" />
    
    <LibraryContent 
      :libraries="libraries"
      :loading="loading"
      :library-stats="libraryStats"
      :get-current-game="getCurrentGame"
      @select-library="selectLibrary"
      @image-error="handleImageError"
    />
    
    <LibraryFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getGameRecords, getCurrentGame } from '../utils/gameStorage'

// 导入新创建的组件
import LibraryHeader from '../components/library/LibraryHeader.vue'
import LibraryContent from '../components/library/LibraryContent.vue'
import LibraryFooter from '../components/library/LibraryFooter.vue'

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
</style>
