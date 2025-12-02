<template>
  <van-popup :show="show" :style="{
    padding: '32px 28px',
    borderRadius: '24px',
    background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
    maxWidth: '90%',
    width: '360px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }" :close-on-click-overlay="false">
    <div class="skip-result">
      <div class="skip-result-label">答案揭晓</div>
      <div class="skip-result-artist">{{ artistName || '未知歌手' }}</div>
      <div class="skip-result-song">《{{ songName || '未知歌曲' }}》</div>
      <van-button type="primary" block size="large" round class="skip-popup-btn confirm" @click="next">
        下一题
      </van-button>
    </div>
  </van-popup>
</template>

<script setup>
import { Popup as VanPopup, Button as VanButton } from 'vant'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  songName: {
    type: String,
    default: ''
  },
  artistName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['next'])

function next() {
  emit('next')
}
</script>

<style scoped>
.skip-result {
  text-align: center;
}

.skip-result-label {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.skip-result-artist {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.skip-result-song {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 32px;
  padding: 0 20px;
}
</style>