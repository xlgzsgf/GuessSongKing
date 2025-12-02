<template>
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
</template>

<script setup>
const emit = defineEmits(['back'])

function goBack() {
  emit('back')
}
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 14px;
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
</style>