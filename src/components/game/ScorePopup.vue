<template>
  <van-popup :show="show" position="bottom" :style="{
    padding: '30px 20px 40px',
    borderRadius: '20px 20px 0 0',
    background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }" closeable close-icon-position="top-right" @close="onClose">
    <div class="score-content">
      <div class="score-header">
        <h3 class="score-title">{{ gameStarted ? '本局成绩' : '历史统计' }}</h3>
      </div>

      <!-- 本局成绩 -->
      <div v-if="gameStarted" class="score-main">
        <div class="score-highlight">
          <div class="highlight-label">答对题数</div>
          <div class="highlight-value">{{ successNumber }}</div>
        </div>
      </div>

      <div v-if="gameStarted" class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">一次过</div>
          <div class="stat-value highlight">{{ firstTrySuccess }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">答错</div>
          <div class="stat-value">{{ failNumber }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">跳过</div>
          <div class="stat-value">{{ skipNumber }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">总题数</div>
          <div class="stat-value">{{ totalQuestions }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">正确率</div>
          <div class="stat-value">{{ totalQuestions > 0 ? Math.round((successNumber / totalQuestions) * 100) : 0 }}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">总用时</div>
          <div class="stat-value">{{ formatTime(useTime) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">平均用时</div>
          <div class="stat-value">{{ totalQuestions > 0 ? Math.round(useTime / totalQuestions) : 0 }}秒</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">重播次数</div>
          <div class="stat-value">{{ replayCount }}</div>
        </div>
      </div>

      <!-- 历史统计 -->
      <div v-if="historyStats && historyStats.totalGames > 0" class="history-section">
        <div class="section-divider" v-if="gameStarted"></div>
        <h4 class="section-title">历史统计</h4>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">总游戏数</div>
            <div class="stat-value">{{ historyStats.totalGames }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">总一次过</div>
            <div class="stat-value highlight">{{ historyStats.totalFirstTry }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">总答对</div>
            <div class="stat-value">{{ historyStats.totalCorrect }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">总答错</div>
            <div class="stat-value">{{ historyStats.totalWrong }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">总跳过</div>
            <div class="stat-value">{{ historyStats.totalSkipped }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均正确率</div>
            <div class="stat-value">{{ historyStats.avgAccuracy }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">最佳正确率</div>
            <div class="stat-value">{{ historyStats.bestAccuracy }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">最高分</div>
            <div class="stat-value">{{ historyStats.bestScore }}题</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">最多一次过</div>
            <div class="stat-value highlight">{{ historyStats.bestFirstTry }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均用时</div>
            <div class="stat-value">{{ historyStats.avgTimePerQuestion }}秒</div>
          </div>
        </div>
      </div>

      <!-- 无历史记录提示 -->
      <div v-if="!historyStats || historyStats.totalGames === 0" class="no-history">
        <p>暂无历史记录</p>
        <p class="no-history-hint">完成一局游戏后即可查看统计</p>
      </div>

      <p class="footer">猜歌王 @千诚</p>
    </div>
  </van-popup>
</template>

<script setup>
import { Popup as VanPopup } from 'vant'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  gameStarted: {
    type: Boolean,
    required: true
  },
  successNumber: {
    type: Number,
    required: true
  },
  failNumber: {
    type: Number,
    required: true
  },
  skipNumber: {
    type: Number,
    required: true
  },
  replayCount: {
    type: Number,
    required: true
  },
  firstTrySuccess: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  useTime: {
    type: Number,
    required: true
  },
  historyStats: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

function onClose() {
  emit('close')
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
.score-content {
  text-align: center;
  padding: 10px 0;
}

.score-header {
  margin-bottom: 28px;
}

.score-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 1px;
  filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.3));
}

.score-main {
  margin-bottom: 24px;
}

.score-highlight {
  background: rgba(0, 245, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 245, 255, 0.3);
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 245, 255, 0.3);
}

.highlight-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.highlight-value {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 12px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 245, 255, 0.3);
  transform: translateY(-2px);
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #00f5ff;
  letter-spacing: 0.5px;
}

.stat-value.highlight {
  background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 22px;
  filter: drop-shadow(0 0 8px rgba(0, 245, 255, 0.4));
}

/* 历史统计样式 */
.history-section {
  margin-top: 32px;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
  text-align: left;
  letter-spacing: 0.5px;
}

.no-history {
  text-align: center;
  padding: 40px 20px;
}

.no-history p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px 0;
}

.no-history-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}

.footer {
  margin-top: 28px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.6;
  letter-spacing: 0.5px;
}
</style>