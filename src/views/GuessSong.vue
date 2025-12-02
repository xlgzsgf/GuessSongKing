<template>
  <div class="guess-song">
    <GameHeader 
      :game-started="gameStarted"
      :success-number="successNumber"
      :use-time="useTime"
      @back="handleBackClick"
    />

    <PlayerSection
      :is-playing="isPlaying"
      :game-started="gameStarted"
      :current-artist-avatar="currentArtistAvatar"
      :current-artist-name="currentArtistName"
      @toggle-play="togglePlay"
      @image-error="handleImageError"
    />

    <GameInput
      ref="gameInputRef"
      :game-started="gameStarted"
      :game-paused="gamePaused"
      :is-input-shaking="isInputShaking"
      :is-correct-effect-playing="isCorrectEffectPlaying"
      @submit="handleGameInput"
      @replay-music="replayMusic"
      @pause-game="pauseGame"
      @jump-next="jumpNext"
      @show-score="showScore"
    />

    <audio ref="audioRef" :src="currentMusic" autoplay hidden></audio>

    <!-- 弹窗组件 -->
    <SkipPopup 
      :show="showSkipPopup"
      @confirm="confirmSkip"
      @cancel="cancelSkip"
    />

    <SkipResultPopup
      :show="showSkipResultPopup"
      :song-name="skippedSongName"
      :artist-name="skippedArtistName"
      @next="handleSkipResultConfirm"
    />

    <ExitPopup
      :show="showExitPopup"
      @exit-game="confirmExitGame"
      @pause-and-exit="pauseAndExit"
      @cancel="showExitPopup = false"
    />

    <PausePopup
      :show="showPausePopup"
      :success-number="successNumber"
      :use-time="useTime"
      @resume="resumeGame"
      @view-score="showScoreFromPause"
      @end="endGame"
    />

    <ScorePopup
      :show="showScorePopup"
      :game-started="gameStarted"
      :success-number="successNumber"
      :fail-number="failNumber"
      :skip-number="skipNumber"
      :replay-count="replayCount"
      :first-try-success="firstTrySuccess"
      :total-questions="totalQuestions"
      :use-time="useTime"
      :history-stats="historyStats"
      @close="onScorePopupClose"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Button as VanButton,
  Form as VanForm,
  Field as VanField,
  Popup as VanPopup,
  showToast
} from 'vant'
import { saveGameRecord, getGameStats, getRecentRecords, saveCurrentGame, getCurrentGame, clearCurrentGame } from '../utils/gameStorage'
import { loadAllSongs, loadArtistSongs, loadArtistInfo, getRandomSong, getArtistAvatarUrl } from '../utils/questionLoader'

// 导入新创建的组件
import GameHeader from '../components/game/GameHeader.vue'
import PlayerSection from '../components/game/PlayerSection.vue'
import GameInput from '../components/game/GameInput.vue'
import SkipPopup from '../components/game/SkipPopup.vue'
import SkipResultPopup from '../components/game/SkipResultPopup.vue'
import ExitPopup from '../components/game/ExitPopup.vue'
import PausePopup from '../components/game/PausePopup.vue'
import ScorePopup from '../components/game/ScorePopup.vue'

const route = useRoute()
const router = useRouter()

const audioRef = ref(null)
const gameInputRef = ref(null)
const gameStarted = ref(false)
const gamePaused = ref(false)
const isPlaying = ref(false)
const currentMusic = ref('')
const currentSong = ref('')
const currentSongData = ref(null) // 当前歌曲完整数据
const successNumber = ref(0)
const failNumber = ref(0)
const skipNumber = ref(0)
const replayCount = ref(0)
const firstTrySuccess = ref(0) // 一次过次数
const totalQuestions = ref(0)
const useTime = ref(0)
const currentQuestionStartTime = ref(0)
const currentQuestionAttempts = ref(0) // 当前题目尝试次数
const timer = ref(null)
const showScorePopup = ref(false)
const showPausePopup = ref(false)
const showSkipPopup = ref(false)
const showSkipResultPopup = ref(false)
const showExitPopup = ref(false)
const questionData = ref([]) // 改为数组存储所有歌曲
const answeredSongs = ref(new Set()) // 存储已回答的歌曲ID
const historyStats = ref(null)
const skippedSongName = ref('')
const skippedArtistName = ref('')
const isInputShaking = ref(false)
const isCorrectEffectPlaying = ref(false)

let correctEffectAudio = null
let wrongEffectAudio = null
let skipEffectAudio = null
let correctEffectEndedHandler = null

function initEffectAudios() {
  if (typeof Audio === 'undefined') {
    return
  }

  correctEffectAudio = new Audio('/effect/correct-answer.mp3')
  correctEffectAudio.preload = 'auto'
  correctEffectEndedHandler = () => {
    isCorrectEffectPlaying.value = false
  }
  correctEffectAudio.addEventListener('ended', correctEffectEndedHandler)

  wrongEffectAudio = new Audio('/effect/wrong-answer.mp3')
  wrongEffectAudio.preload = 'auto'

  skipEffectAudio = new Audio('/effect/skip-question.mp3')
  skipEffectAudio.preload = 'auto'
}

function cleanupEffectAudios() {
  stopCorrectEffect()
  stopAudioInstance(wrongEffectAudio)
  stopSkipEffect()

  if (correctEffectAudio && correctEffectEndedHandler) {
    correctEffectAudio.removeEventListener('ended', correctEffectEndedHandler)
  }

  correctEffectAudio = null
  wrongEffectAudio = null
  skipEffectAudio = null
  correctEffectEndedHandler = null
}

function stopAudioInstance(audio) {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

function playCorrectEffect() {
  if (!correctEffectAudio) return
  stopAudioInstance(correctEffectAudio)
  isCorrectEffectPlaying.value = true
  correctEffectAudio.play().catch(() => {
    isCorrectEffectPlaying.value = false
  })
}

function stopCorrectEffect() {
  stopAudioInstance(correctEffectAudio)
  isCorrectEffectPlaying.value = false
}

function playWrongEffect() {
  triggerInputShake()
  if (!wrongEffectAudio) return
  stopAudioInstance(wrongEffectAudio)
  wrongEffectAudio.play().catch(() => {
    // ignore
  })
}

function playSkipEffect() {
  if (!skipEffectAudio) return
  stopAudioInstance(skipEffectAudio)
  skipEffectAudio.play().catch(() => {
    // ignore
  })
}

function stopSkipEffect() {
  stopAudioInstance(skipEffectAudio)
}

function triggerInputShake() {
  isInputShaking.value = false
  const activate = () => {
    isInputShaking.value = true
    setTimeout(() => {
      isInputShaking.value = false
    }, 500)
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(activate)
  } else {
    activate()
  }
}

// 曲库相关状态
const currentArtistId = ref(null)
const currentArtistName = ref(null)
const currentArtistAvatar = ref('')

watch(showSkipResultPopup, (visible) => {
  if (!visible) {
    stopSkipEffect()
  }
})

// 加载题目数据
async function loadQuestionData() {
  try {
    // 从路由参数获取曲库信息
    const artistId = route.query.artistId
    const artistName = route.query.artistName

    if (artistId) {
      // 加载指定曲库的歌曲
      currentArtistId.value = artistId
      currentArtistName.value = artistName

      // 加载曲库信息以获取头像
      const artistInfo = await loadArtistInfo(artistId)
      currentArtistAvatar.value = getArtistAvatarUrl(artistInfo.avatar)

      // 加载曲库的歌曲
      const songs = await loadArtistSongs(artistId)
      questionData.value = songs
      console.log(`成功加载曲库 ${artistName} 的 ${songs.length} 首歌曲`)
    } else {
      // 没有指定曲库，加载所有歌曲
      const songs = await loadAllSongs()
      questionData.value = songs
      console.log(`成功加载 ${songs.length} 首歌曲`)
    }
  } catch (error) {
    console.error('加载题目数据失败:', error)
    showToast('加载题目数据失败')
  }
}

function loadRandomSong() {
  if (!questionData.value || questionData.value.length === 0) {
    showToast('题目数据未加载')
    return
  }

  // 过滤掉已经回答过的歌曲
  const availableSongs = questionData.value.filter(song => !answeredSongs.value.has(song.songId))

  console.log(availableSongs.length)

  // 如果所有歌曲都已经回答过，则清除已回答列表，重新开始
  if (availableSongs.length === 0) {
    answeredSongs.value.clear()
    availableSongs.push(...questionData.value)
  }

  // 随机选择一首歌
  const song = getRandomSong(availableSongs)
  if (!song) {
    showToast('没有可用的歌曲')
    return
  }

  currentSongData.value = song
  currentSong.value = song.songName
  currentMusic.value = song.url
  currentQuestionStartTime.value = Date.now()
  currentQuestionAttempts.value = 0 // 重置当前题目尝试次数

  if (audioRef.value) {
    audioRef.value.src = currentMusic.value
    audioRef.value.load()
    audioRef.value.play()
    isPlaying.value = true
  }
}

function handleGameInput(value) {
  if (!gameStarted.value) {
    // 开始游戏
    gameStarted.value = true
    loadRandomSong()
    startTimer()
    return
  }

  // 检查答案
  if (!value) {
    showToast('请输入歌名')
    return
  }

  currentQuestionAttempts.value++ // 增加尝试次数
  totalQuestions.value++

  // 宽松匹配函数：转小写并清除特殊字符
  const normalizeString = (str) => {
    return str.toLowerCase().replace(/[\s\u3000\u00A0\u2000-\u200F\u2028-\u202F\u205F-\u206F\uFEFF\p{P}\p{S}]/gu, '')
  }

  if (normalizeString(value) === normalizeString(currentSong.value)) {
    // 答对了
    playCorrectEffect()
    showToast({
      type: 'success',
      message: currentQuestionAttempts.value === 1 ? '一次过！' : '答对啦'
    })
    successNumber.value++

    // 如果是第一次尝试就答对，记录一次过
    if (currentQuestionAttempts.value === 1) {
      firstTrySuccess.value++
    }

    if (currentSongData.value && currentSongData.value.songId) {
      answeredSongs.value.add(currentSongData.value.songId)
    }

    nextSong()
  } else {
    playWrongEffect()
    showToast({
      type: 'fail',
      message: '不对哦'
    })
    failNumber.value++
  }
}

function nextSong() {
  loadRandomSong()
  if (gameInputRef.value) {
    gameInputRef.value.songName = ''
  }
}

function replayMusic() {
  if (isCorrectEffectPlaying.value) {
    showToast('音效播放完才能重播哦')
    return
  }

  if (audioRef.value && currentMusic.value) {
    audioRef.value.currentTime = 0
    audioRef.value.play().catch(error => {
      console.error('播放失败:', error)
      showToast('播放失败，请重试')
    })
    isPlaying.value = true
    replayCount.value++
  }
}

function togglePlay() {
  if (!audioRef.value) return

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play()
    isPlaying.value = true
  }
}

// 图片加载错误处理
function handleImageError(e) {
  e.target.src = 'https://ss2.baidu.com/6ONYsjip0QIZ8tyhnq/it/u=1593598121,2602566230&fm=58&bpow=1000&bpoh=1777'
}

function startTimer() {
  timer.value = setInterval(() => {
    useTime.value++
    // 每秒自动保存游戏状态
    saveGameState()
  }, 1000)
}

// 保存当前游戏状态
function saveGameState() {
  if (!gameStarted.value) {
    return
  }

  const gameState = {
    gameStarted: gameStarted.value,
    successNumber: successNumber.value,
    failNumber: failNumber.value,
    skipNumber: skipNumber.value,
    replayCount: replayCount.value,
    firstTrySuccess: firstTrySuccess.value,
    totalQuestions: totalQuestions.value,
    useTime: useTime.value,
    answeredSongs: Array.from(answeredSongs.value), // 将Set转换为数组保存
    timestamp: Date.now()
  }

  // 传入歌手ID以区分不同歌手的游戏状态
  saveCurrentGame(gameState, currentArtistId.value)
}

// 恢复游戏状态
function restoreGameState() {
  // 传入歌手ID以获取特定歌手的游戏状态
  const savedState = getCurrentGame(currentArtistId.value)

  if (!savedState) {
    return false
  }

  // 检查保存的状态是否有效（不超过24小时）
  const now = Date.now()
  const timeDiff = now - (savedState.timestamp || 0)
  const maxAge = 24 * 60 * 60 * 1000 // 24小时

  if (timeDiff > maxAge) {
    // 状态过期，清除
    clearCurrentGame(currentArtistId.value)
    return false
  }

  // 恢复游戏数据
  gameStarted.value = savedState.gameStarted || false
  successNumber.value = savedState.successNumber || 0
  failNumber.value = savedState.failNumber || 0
  skipNumber.value = savedState.skipNumber || 0
  replayCount.value = savedState.replayCount || 0
  firstTrySuccess.value = savedState.firstTrySuccess || 0
  totalQuestions.value = savedState.totalQuestions || 0
  useTime.value = savedState.useTime || 0

  // 恢复已回答的歌曲列表
  if (savedState.answeredSongs) {
    answeredSongs.value = new Set(savedState.answeredSongs)
  }

  // 如果游戏正在进行，自动进入暂停状态
  if (gameStarted.value) {
    gamePaused.value = true
    isPlaying.value = false

    // 显示暂停弹窗，等待用户选择继续或结束
    showPausePopup.value = true

    showToast({
      type: 'success',
      message: '已恢复上次游戏进度'
    })
  }

  return true
}

function stopTimer() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

function getScoreStats() {
  const accuracy = totalQuestions.value > 0
    ? Math.round((successNumber.value / totalQuestions.value) * 100)
    : 0

  const avgTime = totalQuestions.value > 0
    ? Math.round(useTime.value / totalQuestions.value)
    : 0

  return {
    correct: successNumber.value,
    wrong: failNumber.value,
    skipped: skipNumber.value,
    total: totalQuestions.value,
    accuracy: accuracy,
    totalTime: useTime.value,
    avgTime: avgTime,
    replays: replayCount.value
  }
}

const scoreText = ref('0题  用时0秒')

function pauseGame() {
  if (!gameStarted.value || gamePaused.value) {
    return
  }

  gamePaused.value = true
  stopTimer()

  if (audioRef.value) {
    audioRef.value.pause()
    isPlaying.value = false
  }

  showPausePopup.value = true
}

function resumeGame() {
  if (!gameStarted.value || !gamePaused.value) {
    return
  }

  gamePaused.value = false
  showPausePopup.value = false

  // 恢复时换题
  nextSong()
  startTimer()
}

// 处理返回按钮点击
function handleBackClick() {
  if (!gameStarted.value) {
    // 如果游戏未开始，直接返回
    router.push('/library-select')
    return
  }

  // 游戏进行中，展示自定义退出弹窗
  showExitPopup.value = true
}

function confirmExitGame() {
  showExitPopup.value = false
  endGame()
  router.push('/library-select')
}

function pauseAndExit() {
  showExitPopup.value = false
  pauseGame()
  router.push('/library-select')
}

function endGame() {
  if (!gameStarted.value) {
    return
  }

  stopTimer()

  if (audioRef.value) {
    audioRef.value.pause()
    isPlaying.value = false
  }

  // 保存游戏记录到本地存储
  const gameRecord = {
    correct: successNumber.value,
    wrong: failNumber.value,
    skipped: skipNumber.value,
    total: totalQuestions.value,
    firstTry: firstTrySuccess.value,
    accuracy: totalQuestions.value > 0
      ? Math.round((successNumber.value / totalQuestions.value) * 100)
      : 0,
    totalTime: useTime.value,
    avgTime: totalQuestions.value > 0
      ? Math.round(useTime.value / totalQuestions.value)
      : 0,
    replays: replayCount.value,
    artistId: currentArtistId.value,
    artistName: currentArtistName.value
  }

  saveGameRecord(gameRecord)

  // 清除当前游戏状态（传入歌手ID）
  clearCurrentGame(currentArtistId.value)

  // 关闭所有弹窗
  showPausePopup.value = false
  showScorePopup.value = false

  // 重置游戏状态
  gameStarted.value = false
  gamePaused.value = false
  successNumber.value = 0
  failNumber.value = 0
  skipNumber.value = 0
  replayCount.value = 0
  firstTrySuccess.value = 0
  totalQuestions.value = 0
  useTime.value = 0
  if (gameInputRef.value) {
    gameInputRef.value.songName = ''
  }
  currentMusic.value = ''
  currentSong.value = ''
  answeredSongs.value.clear()

  // 显示提示信息
  showToast({
    type: 'success',
    message: '游戏已结束，记录已保存'
  })
}

function showScore() {
  // 只有在暂停或未开始游戏时才能查看成绩
  if (gameStarted.value && !gamePaused.value) {
    showToast('请先暂停游戏')
    return
  }

  // 加载历史统计数据
  historyStats.value = getGameStats()

  if (useTime.value < 60) {
    scoreText.value = `${successNumber.value}题  用时${useTime.value}秒`
  } else {
    const minutes = Math.floor(useTime.value / 60)
    const secs = useTime.value % 60
    scoreText.value = `${successNumber.value}题  用时${minutes}分${secs}秒`
  }
  showScorePopup.value = true
}

function showScoreFromPause() {
  // 从暂停弹窗打开成绩弹窗
  // 加载历史统计数据
  historyStats.value = getGameStats()

  if (useTime.value < 60) {
    scoreText.value = `${successNumber.value}题  用时${useTime.value}秒`
  } else {
    const minutes = Math.floor(useTime.value / 60)
    const secs = useTime.value % 60
    scoreText.value = `${successNumber.value}题  用时${minutes}分${secs}秒`
  }

  // 隐藏暂停弹窗，显示成绩弹窗
  showPausePopup.value = false
  showScorePopup.value = true
}

// 监听成绩弹窗关闭事件
function onScorePopupClose() {
  // 如果游戏处于暂停状态，关闭成绩弹窗后返回暂停弹窗
  if (gamePaused.value) {
    showPausePopup.value = true
  }
}

function jumpNext() {
  if (!gameStarted.value) {
    showToast('开始游戏后才能跳过哦')
    return
  }

  showSkipPopup.value = true
}

function cancelSkip() {
  showSkipPopup.value = false
}

function confirmSkip() {
  showSkipPopup.value = false
  skipNumber.value++
  totalQuestions.value++
  skippedSongName.value = currentSong.value || '未知歌曲'
  skippedArtistName.value = (currentSongData.value && currentSongData.value.artistName)
    || currentArtistName.value
    || '未知歌手'

  // 跳过的歌曲不需要添加到已回答列表，因为用户可能还想再听一遍

  showSkipResultPopup.value = true
  playSkipEffect()
}

function handleSkipResultConfirm() {
  stopSkipEffect()
  showSkipResultPopup.value = false
  nextSong()
}

onMounted(async () => {
  initEffectAudios()

  // 先加载题目数据
  await loadQuestionData()

  // 然后恢复游戏状态
  restoreGameState()

  if (audioRef.value) {
    audioRef.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
  }
})

onUnmounted(() => {
  stopTimer()
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value = null
  }
  cleanupEffectAudios()
})
</script>

<style scoped>
.guess-song {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%);
  padding: 0px 20px 40px;
  display: flex;
  flex-direction: column;
}
</style>