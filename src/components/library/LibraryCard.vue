<template>
  <div class="library-card" @click="selectLibrary">
    <div class="library-avatar-wrapper">
      <img
        :src="libraryAvatar"
        :alt="library.name"
        @error="handleImageError"
        class="library-avatar"
      />
      <div class="avatar-overlay"></div>
    </div>
    <div class="library-details">
      <div class="library-name-row">
        <h2 class="library-name">{{ library.name }}</h2>
        <span class="playing-badge" v-if="hasActiveGame">游戏中</span>
      </div>
      <p class="song-count">{{ library.songCount }} 首歌曲</p>

      <!-- 统计信息 -->
      <div class="library-stats" v-if="libraryStats">
        <div class="stat-item">
          <span class="stat-label">挑战</span>
          <span class="stat-value">{{ libraryStats.totalGames }}局</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">答对</span>
          <span class="stat-value">{{ libraryStats.totalCorrect }}题</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最佳</span>
          <span class="stat-value">{{ libraryStats.bestAccuracy }}%</span>
        </div>
      </div>
      <div class="no-stats" v-else>
        <span class="no-stats-text">暂无挑战记录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import logo from '/static/logo.png'

const props = defineProps({
  library: {
    type: Object,
    required: true
  },
  libraryStats: {
    type: Object,
    default: null
  },
  hasActiveGame: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'imageError'])

function selectLibrary() {
  emit('select', props.library)
}

function handleImageError(event) {
  emit('imageError', event)
}

// 获取曲库头像
const libraryAvatar = computed(() => {
  const library = props.library
  if (library.avatar) {
    // 如果是完整URL，直接返回
    if (library.avatar.startsWith('http://') || library.avatar.startsWith('https://')) {
      return library.avatar
    }
    // 否则当作相对路径处理
    return library.avatar
  }
  // 默认头像
  return logo
})
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
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
}
</style>