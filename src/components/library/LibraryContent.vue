<template>
  <div class="content-section">
    <div class="library-grid" v-if="!loading && libraries.length > 0">
      <LibraryCard
        v-for="library in libraries"
        :key="library.id"
        :library="library"
        :library-stats="getLibraryStats(library.id)"
        :has-active-game="hasActiveGame(library.id)"
        @select="selectLibrary"
        @image-error="handleImageError"
      />
    </div>

    <div class="loading-state" v-if="loading">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <div class="empty-state" v-if="!loading && libraries.length === 0">
      <p class="empty-text">暂无曲库数据</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LibraryCard from './LibraryCard.vue'

const props = defineProps({
  libraries: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  },
  libraryStats: {
    type: Object,
    required: true
  },
  getCurrentGame: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['selectLibrary', 'imageError'])

// 检查曲库是否有活跃的游戏
const hasActiveGame = (libraryId) => {
  const savedGame = props.getCurrentGame(libraryId)
  return savedGame && savedGame.gameStarted
}

// 获取曲库统计信息
const getLibraryStats = (libraryId) => {
  return props.libraryStats[libraryId] || null
}

function selectLibrary(library) {
  emit('selectLibrary', library)
}

function handleImageError(event) {
  emit('imageError', event)
}
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
  .library-grid {
    grid-template-columns: 1fr;
    gap: 16px;
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