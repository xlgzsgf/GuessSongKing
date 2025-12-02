<template>
  <div class="game-header">
    <div class="back-button" @click="handleBackClick">
      <span class="back-icon">←</span>
      <span class="back-text">退出</span>
    </div>
    <div class="stats-bar" v-if="gameStarted">
      <div class="stat-item">
        <span class="stat-label">答对</span>
        <span class="stat-value">{{ successNumber }}题</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">用时</span>
        <span class="stat-value">{{ formatTime(useTime) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  gameStarted: {
    type: Boolean,
    required: true
  },
  successNumber: {
    type: Number,
    required: true
  },
  useTime: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['back'])

function handleBackClick() {
  emit('back')
}

function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}秒`
  } else {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}分${secs}秒`
  }
}
</script>

<style scoped>
.game-header {
  position: relative;
  margin-bottom: 40px;
  padding-top: 25px;
}

.back-button {
  position: absolute;
  left: 20px;
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

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 24px 28px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  margin: 50px auto 0;
  max-width: 400px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  position: relative;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>