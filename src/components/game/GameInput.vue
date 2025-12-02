<template>
  <div class="game-content">
    <van-form @submit="onSubmit">
      <van-field v-model="songName" name="songName" placeholder="请输入歌名" :disabled="!gameStarted"
        :class="['song-input', { 'input-shake': isInputShaking }]" clearable />
      <van-button :type="gameStarted ? 'danger' : 'success'" block size="large" native-type="submit" class="check-btn"
        round>
        {{ gameStarted ? '确认答案' : '开始游戏' }}
      </van-button>
    </van-form>

    <div class="action-buttons">
      <div class="button-row">
        <van-button type="warning" size="large" @click="replayMusic" :disabled="!gameStarted || isCorrectEffectPlaying"
          class="action-btn replay-btn" round>
          <span class="btn-icon icon-replay"></span>
          重播
        </van-button>

        <van-button type="default" size="large" @click="pauseGame" :disabled="!gameStarted" class="action-btn pause-btn"
          round>
          <span class="btn-icon icon-pause"></span>
          暂停
        </van-button>
      </div>

      <div class="button-row">
        <van-button type="default" size="large" @click="jumpNext" :disabled="!gameStarted" class="action-btn skip-btn"
          round>
          <span class="btn-icon icon-skip"></span>
          跳过
        </van-button>

        <van-button type="primary" size="large" @click="showScore" :disabled="gameStarted && !gamePaused"
          class="action-btn score-btn" round>
          <span class="btn-icon icon-score"></span>
          成绩
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Form as VanForm, Field as VanField, Button as VanButton } from 'vant'

const songName = ref('')

const props = defineProps({
  gameStarted: {
    type: Boolean,
    required: true
  },
  gamePaused: {
    type: Boolean,
    required: true
  },
  isInputShaking: {
    type: Boolean,
    required: true
  },
  isCorrectEffectPlaying: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([
  'submit',
  'replayMusic',
  'pauseGame',
  'jumpNext',
  'showScore'
])

function onSubmit() {
  emit('submit', songName.value)
}

function replayMusic() {
  emit('replayMusic')
}

function pauseGame() {
  emit('pauseGame')
}

function jumpNext() {
  emit('jumpNext')
}

function showScore() {
  emit('showScore')
}

watch(() => props.gameStarted, (newVal) => {
  if (!newVal) {
    songName.value = ''
  }
})

defineExpose({
  songName
})
</script>

<style scoped>
.game-content {
  padding: 0 20px;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.song-input {
  margin-bottom: 20px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.song-input.input-shake {
  animation: input-shake 0.45s ease;
}

@keyframes input-shake {
  0% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-6px);
  }

  40% {
    transform: translateX(6px);
  }

  60% {
    transform: translateX(-4px);
  }

  80% {
    transform: translateX(4px);
  }

  100% {
    transform: translateX(0);
  }
}

.song-input:focus-within {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 245, 255, 0.4);
  box-shadow: 0 4px 32px rgba(0, 245, 255, 0.2);
}

.song-input :deep(.van-field__control) {
  color: #fff;
  font-size: 17px;
  font-weight: 500;
  padding: 16px 0;
}

.song-input :deep(.van-field__control::placeholder) {
  color: rgba(255, 255, 255, 0.35);
}

.song-input :deep(.van-cell) {
  background: transparent;
  padding: 0 20px;
}

.check-btn {
  margin-top: 16px;
  height: 60px;
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 245, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 1px;
  color: #000;
}

.check-btn:hover {
  box-shadow: 0 12px 40px rgba(0, 245, 255, 0.6);
  transform: translateY(-2px);
}

.check-btn:active {
  transform: translateY(0) scale(0.98);
}

.btn-icon {
  margin-right: 8px;
  font-size: 17px;
  display: inline-block;
  width: 1em;
  height: 1em;
  background-size: contain;
  background-repeat: no-repeat;
  vertical-align: middle;
}

.btn-icon.icon-replay {
  background-image: url(/static/icon/Replay.svg)
}

.btn-icon.icon-pause {
  background-image: url(/static/icon/Pause_White.svg);
}

.btn-icon.icon-skip {
  background-image: url(/static/icon/Right_Arrow.svg);
}

.btn-icon.icon-score {
  background-image: url(/static/icon/Star.svg);
}

.btn-icon.icon-score-white {
  background-image: url(/static/icon/Star.svg);
}

.action-buttons {
  margin-top: 32px;
}

.action-btn {
  margin-top: 16px;
  height: 54px;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
}

.action-btn:active {
  transform: translateY(0) scale(0.98);
}

.action-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
  transform: none !important;
}

.button-row {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.skip-btn,
.score-btn {
  flex: 1;
}
</style>