<template>
    <div class="guess-song">
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

        <div class="game-content">
            <van-form @submit="checkData">
                <van-field v-model="songName" name="songName" placeholder="请输入歌名" :disabled="!gameStarted"
                    :class="['song-input', { 'input-shake': isInputShaking }]" clearable />
                <van-button :type="gameStarted ? 'danger' : 'success'" block size="large" native-type="submit"
                    class="check-btn" round>
                    {{ gameStarted ? '确认答案' : '开始游戏' }}
                </van-button>
            </van-form>

            <div class="action-buttons">
                <div class="button-row">
                    <van-button type="warning" size="large" @click="replayMusic"
                        :disabled="!gameStarted || isCorrectEffectPlaying" class="action-btn replay-btn" round>
                        <span class="btn-icon icon-replay"></span>
                        重播
                    </van-button>

                    <van-button type="default" size="large" @click="pauseGame" :disabled="!gameStarted"
                        class="action-btn pause-btn" round>
                        <span class="btn-icon icon-pause"></span>
                        暂停
                    </van-button>
                </div>

                <div class="button-row">
                    <van-button type="default" size="large" @click="jumpNext" :disabled="!gameStarted"
                        class="action-btn skip-btn" round>
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

        <audio ref="audioRef" :src="currentMusic" autoplay hidden></audio>

        <!-- 跳过确认弹窗 -->
        <van-popup v-model:show="showSkipPopup"
            :style="{ padding: '32px 28px', borderRadius: '24px', background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)', maxWidth: '90%', width: '360px', border: '1px solid rgba(255, 255, 255, 0.1)' }"
            :close-on-click-overlay="false">
            <div class="skip-popup">
                <div class="skip-icon icon-skip-large"></div>
                <h3 class="skip-title">确定要跳过这首歌吗？</h3>
                <p class="skip-hint">跳过的题目不计入得分，下一题会随机换歌</p>
                <div class="skip-buttons">
                    <van-button type="primary" block size="large" class="skip-popup-btn confirm" round
                        @click="confirmSkip">
                        确认跳过
                    </van-button>
                    <van-button type="default" block size="large" class="skip-popup-btn cancel" round
                        @click="cancelSkip">
                        再听听
                    </van-button>
                </div>
            </div>
        </van-popup>

        <!-- 跳过结果弹窗 -->
        <van-popup v-model:show="showSkipResultPopup"
            :style="{ padding: '32px 28px', borderRadius: '24px', background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)', maxWidth: '90%', width: '360px', border: '1px solid rgba(255, 255, 255, 0.1)' }"
            :close-on-click-overlay="false">
            <div class="skip-result">
                <div class="skip-result-label">答案揭晓</div>
                <div class="skip-result-artist">{{ skippedArtistName || '未知歌手' }}</div>
                <div class="skip-result-song">《{{ skippedSongName || '未知歌曲' }}》</div>
                <van-button type="primary" block size="large" round class="skip-popup-btn confirm"
                    @click="handleSkipResultConfirm">
                    下一题
                </van-button>
            </div>
        </van-popup>

        <!-- 退出游戏弹窗 -->
        <van-popup v-model:show="showExitPopup"
            :style="{ padding: '32px 28px', borderRadius: '24px', background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)', maxWidth: '90%', width: '360px', border: '1px solid rgba(255, 255, 255, 0.1)' }"
            :close-on-click-overlay="false">
            <div class="exit-popup">
                <div class="exit-icon"></div>
                <h3 class="exit-title">要退出游戏吗？</h3>
                <p class="exit-hint">你可以结束本局，或暂停后稍后继续</p>
                <div class="exit-buttons">
                    <van-button type="primary" block size="large" class="exit-btn end" round @click="confirmExitGame">
                        结束本局并退出
                    </van-button>
                    <van-button type="default" block size="large" class="exit-btn pause" round @click="pauseAndExit">
                        暂停并退出
                    </van-button>
                    <van-button type="default" block size="large" class="exit-btn cancel" round
                        @click="showExitPopup = false">
                        继续游戏
                    </van-button>
                </div>
            </div>
        </van-popup>

        <!-- 暂停弹窗 -->
        <van-popup v-model:show="showPausePopup"
            :style="{ padding: '40px 30px', borderRadius: '24px', background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)', maxWidth: '90%', width: '360px', border: '1px solid rgba(255, 255, 255, 0.1)' }"
            :close-on-click-overlay="false">
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
                    <van-button type="primary" block size="large" @click="resumeGame" class="pause-btn resume-btn"
                        round>
                        继续游戏
                    </van-button>
                    <van-button type="default" block size="large" @click="showScoreFromPause"
                        class="pause-btn view-score-btn" round>
                        <span class="btn-icon icon-score-white"></span>
                        查看成绩
                    </van-button>
                    <van-button type="default" block size="large" @click="endGame" class="pause-btn end-btn" round>
                        结束游戏
                    </van-button>
                </div>
            </div>
        </van-popup>

        <!-- 成绩弹窗 -->
        <van-popup v-model:show="showScorePopup" position="bottom"
            :style="{ padding: '30px 20px 40px', borderRadius: '20px 20px 0 0', background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }"
            closeable close-icon-position="top-right" @close="onScorePopupClose">
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
                        <div class="stat-value">{{ totalQuestions > 0 ? Math.round((successNumber / totalQuestions) *
                            100) : 0 }}%</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">总用时</div>
                        <div class="stat-value">{{ formatTime(useTime) }}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">平均用时</div>
                        <div class="stat-value">{{ totalQuestions > 0 ? Math.round(useTime / totalQuestions) : 0 }}秒
                        </div>
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

const route = useRoute()
const router = useRouter()

const audioRef = ref(null)
const songName = ref('')
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

    correctEffectAudio = new Audio('/static/effect/correct-answer.mp3')
    correctEffectAudio.preload = 'auto'
    correctEffectEndedHandler = () => {
        isCorrectEffectPlaying.value = false
    }
    correctEffectAudio.addEventListener('ended', correctEffectEndedHandler)

    wrongEffectAudio = new Audio('/static/effect/wrong-answer.mp3')
    wrongEffectAudio.preload = 'auto'

    skipEffectAudio = new Audio('/static/effect/skip-question.mp3')
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
    const availableSongs = questionData.value.filter(song =>
        !answeredSongs.value.has(song.songId)
    )

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

function checkData() {
    if (!gameStarted.value) {
        // 开始游戏
        gameStarted.value = true
        loadRandomSong()
        startTimer()
        return
    }

    // 检查答案
    if (!songName.value) {
        showToast('请输入歌名')
        return
    }

    currentQuestionAttempts.value++ // 增加尝试次数
    totalQuestions.value++

    // 宽松匹配函数：转小写并清除特殊字符
    const normalizeString = (str) => {
        return str.toLowerCase().replace(/[\s\u3000\u00A0\u2000-\u200F\u2028-\u202F\u205F-\u206F\uFEFF\p{P}\p{S}]/gu, '')
    }

    if (normalizeString(songName.value) === normalizeString(currentSong.value)) {
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

        nextSong()
    } else {
        playWrongEffect()
        showToast({
            type: 'fail',
            message: '不对哦'
        })
        failNumber.value++
    }

    // 将歌曲添加到已回答列表（无论答对还是答错）
    if (currentSongData.value && currentSongData.value.songId) {
        answeredSongs.value.add(currentSongData.value.songId)
    }
}

function nextSong() {
    loadRandomSong()
    songName.value = ''
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

function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds}秒`
    } else {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}分${secs}秒`
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
    songName.value = ''
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

.banner {
    width: 100%;
    max-width: 100%;
    height: auto;
    display: block;
    border-radius: 0 0 24px 24px;
    overflow: hidden;
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
    animation: rotator 6s cubic-bezier(0.4, 0.1, 0.6, 0.9) paused;
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

.skip-popup,
.skip-result {
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

.skip-result-label {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.65);
    margin-bottom: 12px;
    letter-spacing: 0.5px;
}

.skip-result-song {
    font-size: 26px;
    font-weight: 700;
    color: #00f5ff;
    margin-bottom: 24px;
}

/* 跳过弹窗样式 */
.skip-popup {
    text-align: center;
}

.skip-icon {
    font-size: 48px;
    color: #00f5ff;
    margin-bottom: 20px;
    display: inline-block;
    width: 1em;
    height: 1em;
    background-size: contain;
    background-repeat: no-repeat;
}

.skip-icon.icon-skip-large {
    background-image: url(/static/icon/Right_Arrow.svg);
    filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.5));
}

.skip-title {
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 12px 0;
    letter-spacing: 1px;
}

.skip-hint {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 28px 0;
    letter-spacing: 0.5px;
    line-height: 1.5;
}

.skip-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.skip-popup-btn {
    height: 54px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.skip-popup-btn.confirm {
    background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
    border: none;
    color: #000;
    box-shadow: 0 8px 24px rgba(0, 245, 255, 0.4);
}

.skip-popup-btn.cancel {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.85);
}

/* 跳过结果显示弹窗 */
.skip-result {
    text-align: center;
    padding: 20px 0;
}

.skip-result-label {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 16px;
    font-weight: 500;
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

/* 暂停弹窗样式 */
.pause-content {
    text-align: center;
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

.score-qr img {
    width: 100%;
    height: auto;
    display: block;
}

.footer {
    margin-top: 28px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.6;
    letter-spacing: 0.5px;
}
</style>
