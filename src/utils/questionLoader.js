/**
 * 题库加载工具模块
 * 负责加载和管理新的题库结构
 */

/**
 * 加载题库索引
 * @returns {Promise<Object>} 题库索引数据
 */
export async function loadQuestionIndex() {
    try {
        const response = await fetch('/Question/index.json')
        if (!response.ok) {
            throw new Error('加载题库索引失败')
        }
        return await response.json()
    } catch (error) {
        console.error('加载题库索引失败:', error)
        throw error
    }
}

/**
 * 加载指定歌手的歌曲信息
 * @param {string} artistId 歌手ID
 * @returns {Promise<Object>} 歌手信息和歌曲列表
 */
export async function loadArtistInfo(artistId) {
    try {
        const response = await fetch(`/Question/${artistId}/info.json`)
        if (!response.ok) {
            throw new Error(`加载歌手信息失败: ${artistId}`)
        }
        return await response.json()
    } catch (error) {
        console.error('加载歌手信息失败:', error)
        throw error
    }
}

/**
 * 获取歌曲音频URL
 * @param {string} artistId 歌手ID
 * @param {string} songId 歌曲ID
 * @returns {string} 音频文件URL
 */
export function getSongUrl(artistId, songId) {
    return `/Question/${artistId}/${songId}.mp3`
}

/**
 * 获取歌手头像URL
 * @param {string} avatarUrl 头像URL（可以是完整URL或相对路径）
 * @returns {string} 头像文件URL
 */
export function getArtistAvatarUrl(avatarUrl) {
    if (!avatarUrl) {
        return '/static/logo.png'
    }
    // 如果是完整的URL（http/https开头），直接返回
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        return avatarUrl
    }
    // 否则当作相对路径处理
    return avatarUrl
}

/**
 * 加载所有歌手的歌曲数据
 * @returns {Promise<Array>} 所有歌曲数据数组
 */
export async function loadAllSongs() {
    try {
        // 1. 加载题库索引
        const index = await loadQuestionIndex()

        if (!index.artists || index.artists.length === 0) {
            throw new Error('题库索引为空')
        }

        // 2. 加载所有歌手的歌曲信息
        const allSongs = []

        for (const artist of index.artists) {
            try {
                const artistInfo = await loadArtistInfo(artist.id)

                // 将歌曲信息转换为游戏需要的格式
                artistInfo.songs.forEach(song => {
                    // 使用歌曲中定义的歌手信息，如果没有则使用默认歌手
                    const songArtists = song.artists || [artistInfo.defaultArtist || artist.name]
                    
                    allSongs.push({
                        artistId: artist.id,
                        artistName: songArtists.join('、'),
                        songId: song.id,
                        songName: song.name,
                        url: getSongUrl(artist.id, song.id)
                    })
                })
            } catch (error) {
                console.warn(`跳过歌手 ${artist.name}:`, error.message)
            }
        }

        return allSongs
    } catch (error) {
        console.error('加载所有歌曲失败:', error)
        throw error
    }
}

/**
 * 加载指定歌手的歌曲数据
 * @param {string} artistId 歌手ID
 * @returns {Promise<Array>} 歌曲数据数组
 */
export async function loadArtistSongs(artistId) {
    try {
        const artistInfo = await loadArtistInfo(artistId)

        return artistInfo.songs.map(song => {
            // 使用歌曲中定义的歌手信息，如果没有则使用默认歌手
            const songArtists = song.artists || [artistInfo.defaultArtist || artistInfo.artistName]
            
            return {
                artistId: artistInfo.artistId,
                artistName: songArtists.join('、'),
                songId: song.id,
                songName: song.name,
                url: getSongUrl(artistInfo.artistId, song.id)
            }
        })
    } catch (error) {
        console.error(`加载歌手 ${artistId} 的歌曲失败:`, error)
        throw error
    }
}

/**
 * 随机获取一首歌曲
 * @param {Array} songs 歌曲数组
 * @returns {Object} 随机选中的歌曲
 */
export function getRandomSong(songs) {
    if (!songs || songs.length === 0) {
        return null
    }
    const randomIndex = Math.floor(Math.random() * songs.length)
    return songs[randomIndex]
}
