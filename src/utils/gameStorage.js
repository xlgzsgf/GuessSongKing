/**
 * 游戏数据本地存储管理模块
 * 负责游戏记录的持久化存储和读取
 */

const STORAGE_KEY = 'guess_song_game_records'
const CURRENT_GAME_KEY = 'guess_song_current_game'
const MAX_RECORDS = 100 // 最多保存100条记录

/**
 * 获取所有游戏记录
 * @returns {Array} 游戏记录数组
 */
export function getGameRecords() {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch (error) {
        console.error('读取游戏记录失败:', error)
        return []
    }
}

/**
 * 保存单条游戏记录
 * @param {Object} record 游戏记录对象
 * @param {number} record.correct 答对题数
 * @param {number} record.wrong 答错题数
 * @param {number} record.skipped 跳过题数
 * @param {number} record.total 总题数
 * @param {number} record.firstTry 一次过次数
 * @param {number} record.accuracy 正确率
 * @param {number} record.totalTime 总用时
 * @param {number} record.avgTime 平均用时
 * @param {number} record.replays 重播次数
 * @param {string} [record.artistId] 歌手ID（可选）
 * @param {string} [record.artistName] 歌手名称（可选）
 * @returns {boolean} 是否保存成功
 */
export function saveGameRecord(record) {
    try {
        const records = getGameRecords()

        // 添加时间戳和唯一ID
        const newRecord = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...record
        }

        // 添加到数组开头
        records.unshift(newRecord)

        // 限制记录数量
        if (records.length > MAX_RECORDS) {
            records.splice(MAX_RECORDS)
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
        return true
    } catch (error) {
        console.error('保存游戏记录失败:', error)
        return false
    }
}

/**
 * 删除指定游戏记录
 * @param {number} id 记录ID
 * @returns {boolean} 是否删除成功
 */
export function deleteGameRecord(id) {
    try {
        const records = getGameRecords()
        const filteredRecords = records.filter(record => record.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords))
        return true
    } catch (error) {
        console.error('删除游戏记录失败:', error)
        return false
    }
}

/**
 * 清空所有游戏记录
 * @returns {boolean} 是否清空成功
 */
export function clearAllRecords() {
    try {
        localStorage.removeItem(STORAGE_KEY)
        return true
    } catch (error) {
        console.error('清空游戏记录失败:', error)
        return false
    }
}

/**
 * 获取游戏统计数据
 * @returns {Object} 统计数据对象
 */
export function getGameStats() {
    const records = getGameRecords()

    if (records.length === 0) {
        return {
            totalGames: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalSkipped: 0,
            totalFirstTry: 0,
            totalQuestions: 0,
            totalTime: 0,
            totalReplays: 0,
            avgAccuracy: 0,
            avgTimePerQuestion: 0,
            bestAccuracy: 0,
            bestScore: 0,
            bestFirstTry: 0
        }
    }

    const stats = records.reduce((acc, record) => {
        acc.totalCorrect += record.correct || 0
        acc.totalWrong += record.wrong || 0
        acc.totalSkipped += record.skipped || 0
        acc.totalFirstTry += record.firstTry || 0
        acc.totalQuestions += record.total || 0
        acc.totalTime += record.totalTime || 0
        acc.totalReplays += record.replays || 0
        return acc
    }, {
        totalGames: records.length,
        totalCorrect: 0,
        totalWrong: 0,
        totalSkipped: 0,
        totalFirstTry: 0,
        totalQuestions: 0,
        totalTime: 0,
        totalReplays: 0
    })

    // 计算平均值
    stats.avgAccuracy = stats.totalQuestions > 0
        ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
        : 0

    stats.avgTimePerQuestion = stats.totalQuestions > 0
        ? Math.round(stats.totalTime / stats.totalQuestions)
        : 0

    // 找出最佳记录
    stats.bestAccuracy = Math.max(...records.map(r => r.accuracy || 0))
    stats.bestScore = Math.max(...records.map(r => r.correct || 0))
    stats.bestFirstTry = Math.max(...records.map(r => r.firstTry || 0))

    return stats
}

/**
 * 获取最近N条游戏记录
 * @param {number} count 记录数量
 * @returns {Array} 游戏记录数组
 */
export function getRecentRecords(count = 10) {
    const records = getGameRecords()
    return records.slice(0, count)
}

/**
 * 格式化时间戳为可读日期
 * @param {string} timestamp ISO时间戳
 * @returns {string} 格式化后的日期字符串
 */
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // 小于1分钟
    if (diff < 60000) {
        return '刚刚'
    }

    // 小于1小时
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`
    }

    // 小于1天
    if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`
    }

    // 小于7天
    if (diff < 604800000) {
        return `${Math.floor(diff / 86400000)}天前`
    }

    // 超过7天，显示具体日期
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    // 如果是今年，不显示年份
    if (year === now.getFullYear()) {
        return `${month}-${day} ${hours}:${minutes}`
    }

    return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 导出游戏记录为JSON文件
 * @returns {string} JSON字符串
 */
export function exportRecords() {
    const records = getGameRecords()
    return JSON.stringify(records, null, 2)
}

/**
 * 从JSON导入游戏记录
 * @param {string} jsonString JSON字符串
 * @returns {boolean} 是否导入成功
 */
export function importRecords(jsonString) {
    try {
        const records = JSON.parse(jsonString)
        if (!Array.isArray(records)) {
            throw new Error('数据格式错误')
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
        return true
    } catch (error) {
        console.error('导入游戏记录失败:', error)
        return false
    }
}

/**
 * 保存当前游戏状态
 * @param {Object} gameState 游戏状态对象
 * @param {string} [artistId] 歌手ID（可选，用于区分不同歌手的游戏状态）
 * @returns {boolean} 是否保存成功
 */
export function saveCurrentGame(gameState, artistId = null) {
    try {
        const key = artistId ? `${CURRENT_GAME_KEY}_${artistId}` : CURRENT_GAME_KEY
        localStorage.setItem(key, JSON.stringify(gameState))
        return true
    } catch (error) {
        console.error('保存当前游戏状态失败:', error)
        return false
    }
}

/**
 * 获取当前游戏状态
 * @param {string} [artistId] 歌手ID（可选，用于获取特定歌手的游戏状态）
 * @returns {Object|null} 游戏状态对象，如果不存在则返回null
 */
export function getCurrentGame(artistId = null) {
    try {
        const key = artistId ? `${CURRENT_GAME_KEY}_${artistId}` : CURRENT_GAME_KEY
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : null
    } catch (error) {
        console.error('读取当前游戏状态失败:', error)
        return null
    }
}

/**
 * 清除当前游戏状态
 * @param {string} [artistId] 歌手ID（可选，用于清除特定歌手的游戏状态）
 * @returns {boolean} 是否清除成功
 */
export function clearCurrentGame(artistId = null) {
    try {
        const key = artistId ? `${CURRENT_GAME_KEY}_${artistId}` : CURRENT_GAME_KEY
        localStorage.removeItem(key)
        return true
    } catch (error) {
        console.error('清除当前游戏状态失败:', error)
        return false
    }
}
