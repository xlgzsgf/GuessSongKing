<template>
  <van-popup :show="show" :style="{
    padding: '32px 28px',
    borderRadius: '24px',
    background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
    maxWidth: '90%',
    width: '360px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }" :close-on-click-overlay="false">
    <div class="skip-popup">
      <div class="skip-icon icon-skip-large"></div>
      <h3 class="skip-title">确定要跳过这首歌吗？</h3>
      <p class="skip-hint">跳过的题目不计入得分，下一题会随机换歌</p>
      <div class="skip-buttons">
        <van-button type="primary" block size="large" class="skip-popup-btn confirm" round @click="confirm">
          确认跳过
        </van-button>
        <van-button type="default" block size="large" class="skip-popup-btn cancel" round @click="cancel">
          再听听
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

const emit = defineEmits(['confirm', 'cancel'])

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
}
</script>

<style scoped>
.skip-popup {
  text-align: center;
}

.skip-icon.icon-skip-large {
  display: inline-block;
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  background-image: url(/static/icon/Right_Arrow.svg);
  background-repeat: no-repeat;
  background-size: contain;
  filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.45));
}

.skip-title {
  font-size: 24px;
  margin: 0 0 12px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.8px;
}

.skip-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 28px;
  line-height: 1.5;
}

.skip-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skip-popup-btn {
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border: none;
}

.skip-popup-btn.confirm {
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  color: #000;
  box-shadow: 0 8px 24px rgba(0, 245, 255, 0.4);
}

.skip-popup-btn.cancel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
}
</style>