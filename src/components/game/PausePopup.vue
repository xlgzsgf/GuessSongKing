<template>
  <van-popup :show="show" :style="{
    padding: '40px 30px',
    borderRadius: '24px',
    background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
    maxWidth: '90%',
    width: '360px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }" :close-on-click-overlay="false">
    <div class="pause-content">
      <div class="pause-icon icon-pause-large"></div>
      <h3 class="pause-title">游戏已暂停</h3>
      <p class="pause-hint">恢复后将换一首新歌曲</p>

      <div class="pause-stats">
        <div class="pause-stat-item">
          <span class="pause-stat-label">已答对</span>
          <span class="pause-stat-value">{{ successNumber }}题</span>
        </div>
        <div class="pause-stat-item">
          <span class="pause-stat-label">已用时</span>
          <span class="pause-stat-value">{{ formatTime(useTime) }}</span>
        </div>
      </div>

      <div class="pause-buttons">
        <van-button type="primary" block size="large" @click="resume" class="pause-btn resume-btn" round>
          继续游戏
        </van-button>
        <van-button type="default" block size="large" @click="viewScore" class="pause-btn view-score-btn" round>
          <span class="btn-icon icon-score-white"></span>
          查看成绩
        </van-button>
        <van-button type="default" block size="large" @click="end" class="pause-btn end-btn" round>
          结束游戏
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { Popup as VanPopup, Button as VanButton } from 'vant'

const props = defineProps({
  show: {
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

const emit = defineEmits(['resume', 'viewScore', 'end'])

function resume() {
  emit('resume')
}

function viewScore() {
  emit('viewScore')
}

function end() {
  emit('end')
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
.pause-content {
  text-align: center;
}

.pause-icon.icon-pause-large {
  font-size: 64px;
  color: #00f5ff;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.5));
  display: inline-block;
  width: 1em;
  height: 1em;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url(/static/icon/Pause.svg);
}

.pause-title {
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px 0;
  letter-spacing: 1px;
}

.pause-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 28px 0;
  letter-spacing: 0.5px;
}

.pause-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.pause-stat-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pause-stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.pause-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #00f5ff;
}

.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pause-btn {
  height: 54px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.resume-btn {
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  border: none;
  color: #000;
  box-shadow: 0 8px 24px rgba(0, 245, 255, 0.4);
}

.end-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
}

.btn-icon.icon-score-white {
  background-image: url(/static/icon/Star.svg);
  margin-right: 8px;
  font-size: 17px;
  display: inline-block;
  width: 1em;
  height: 1em;
  background-size: contain;
  background-repeat: no-repeat;
  vertical-align: middle;
}
</style>