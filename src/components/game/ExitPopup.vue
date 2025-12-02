<template>
  <van-popup :show="show" :style="{
    padding: '32px 28px',
    borderRadius: '24px',
    background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
    maxWidth: '90%',
    width: '360px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }" :close-on-click-overlay="false">
    <div class="exit-popup">
      <div class="exit-icon"></div>
      <h3 class="exit-title">要退出游戏吗？</h3>
      <p class="exit-hint">你可以结束本局，或暂停后稍后继续</p>
      <div class="exit-buttons">
        <van-button type="primary" block size="large" class="exit-btn end" round @click="exitGame">
          结束本局并退出
        </van-button>
        <van-button type="default" block size="large" class="exit-btn pause" round @click="pauseAndExit">
          暂停并退出
        </van-button>
        <van-button type="default" block size="large" class="exit-btn cancel" round @click="cancel">
          继续游戏
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { Popup as VanPopup, Button as VanButton } from 'vant'

defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['exitGame', 'pauseAndExit', 'cancel'])

function exitGame() {
  emit('exitGame')
}

function pauseAndExit() {
  emit('pauseAndExit')
}

function cancel() {
  emit('cancel')
}
</script>

<style scoped>
.exit-popup {
  text-align: center;
}

.exit-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 95, 109, 0.6);
  position: relative;
  box-shadow: 0 0 20px rgba(255, 95, 109, 0.3);
}

.exit-icon::before,
.exit-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 28px;
  background: linear-gradient(180deg, #ff5f6d 0%, #ffc371 100%);
  transform-origin: center;
  border-radius: 999px;
}

.exit-icon::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.exit-icon::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.exit-title {
  font-size: 24px;
  margin: 0 0 12px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.8px;
}

.exit-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 28px;
  line-height: 1.5;
}

.exit-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exit-btn {
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.exit-btn.end {
  background: linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%);
  border: none;
  color: #000;
  box-shadow: 0 8px 24px rgba(255, 95, 109, 0.4);
}

.exit-btn.pause,
.exit-btn.cancel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
}
</style>