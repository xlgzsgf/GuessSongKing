<template>
  <div class="player-section">
    <div class="wrap">
      <div class="avatar-pic" :class="{ avatar: isPlaying, pause: !isPlaying }">
        <img :src="currentArtistAvatar || 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=1593598121,2602566230&fm=58&bpow=1000&bpoh=1777'"
          :alt="currentArtistName || 'album cover'" @error="handleImageError">
      </div>
      <div class="play-control" @click="togglePlay" v-if="gameStarted">
        <span class="play-icon" v-if="!isPlaying"></span>
        <span class="pause-icon" v-else></span>
      </div>
    </div>
    <p class="player-hint" v-if="!gameStarted">点击"开始"按钮开始游戏</p>
    <p class="player-hint" v-else>{{ currentArtistName ? `正在播放 ${currentArtistName} 曲库的歌曲...` : '正在播放中...' }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  isPlaying: {
    type: Boolean,
    required: true
  },
  gameStarted: {
    type: Boolean,
    required: true
  },
  currentArtistAvatar: {
    type: String,
    default: ''
  },
  currentArtistName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['togglePlay', 'imageError'])

function togglePlay() {
  emit('togglePlay')
}

function handleImageError(e) {
  emit('imageError', e)
}
</script>

<style scoped>
.player-section {
  text-align: center;
  padding: 20px 20px 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wrap {
  width: 200px;
  height: 200px;
  position: relative;
  margin: 0 auto 24px;
  filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.3));
}

.avatar-pic {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  display: block;
  cursor: default;
  box-shadow: 0 0 0 12px rgba(0, 245, 255, 0.08),
    0 0 0 24px rgba(0, 245, 255, 0.04),
    0 16px 48px rgba(0, 0, 0, 0.6);
  border: 4px solid rgba(0, 245, 255, 0.25);
  position: relative;
}

.avatar-pic::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #00f5ff, #00d4ff, #0099ff);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.5;
}

.avatar-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-control {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid rgba(0, 245, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 245, 255, 0.4);
}

.play-control:hover {
  background: rgba(0, 245, 255, 0.2);
  border-color: rgba(0, 245, 255, 0.7);
  box-shadow: 0 12px 40px rgba(0, 245, 255, 0.6);
}

.play-control:active {
  transform: translate(-50%, -50%) scale(0.92);
}

.play-icon,
.pause-icon {
  color: #00f5ff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 10px rgba(0, 245, 255, 0.8));
  width: 50%;
  height: 50%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.play-icon {
  background-image: url(/static/icon/Play.svg);
  margin-left: 3px;
}

.pause-icon {
  background-image: url(/static/icon/Pause.svg);
  margin-left: 0;
}

.player-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
  margin-top: 16px;
  font-weight: 500;
  letter-spacing: 0.8px;
}

.avatar {
  animation: rotator 6s cubic-bezier(0.4, 0, 0.6, 0.9) paused;
  animation-play-state: running;
}

.pause {
  animation-play-state: paused;
}

@keyframes rotator {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0.4, 0.1, 0.6, 0.9);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>