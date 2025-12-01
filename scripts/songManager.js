/**
 * 交互式歌手/歌曲录入工具
 * 用于向题库中添加新的歌手和歌曲
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import ffmpeg from 'fluent-ffmpeg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const QUESTION_DIR = path.join(__dirname, '../public/Question')
const INDEX_FILE = path.join(QUESTION_DIR, 'index.json')
const AUDIO_DURATION = 6 // 截取音频时长（秒）

// 创建 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// 截取音频前N秒
function trimAudio(inputPath, outputPath, duration = AUDIO_DURATION) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(0)
            .setDuration(duration)
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run()
    })
}

// 从文件名中提取歌曲名（删除括号及其内容）
function extractSongName(filename) {
    // 删除括号及其内容，支持各种括号类型: (), [], {}, （）, 【】
    // 同时处理中英文空格
    let cleanName = filename.replace(/[\(\[\{\（\【][^\)\]\}\）\】]*[\)\]\}\）\】]/g, '');
    // 删除可能残留的空格
    cleanName = cleanName.replace(/\s+/g, ' ').trim();
    return cleanName;
}

// 从文件名中提取纯净的歌曲名（去除歌手部分）
function extractPureSongName(filename) {
    // 先删除括号内容
    const cleanFilename = extractSongName(filename);
    // 匹配格式如 "薛之谦 - 演员" 或 "薛之谦、韩红 - 小尖尖"
    const match = cleanFilename.match(/^[^-]+\s*-\s*(.+)$/)
    if (match) {
        // 提取歌曲名部分并去除多余空格
        return match[1].trim();
    }
    // 如果没有匹配到格式，则返回原文件名
    return cleanFilename;
}

// 从文件名中提取歌手信息
function extractArtistsFromFile(filename) {
    // 先删除括号内容
    const cleanFilename = extractSongName(filename)
    // 匹配格式如 "薛之谦 - 演员" 或 "薛之谦、韩红 - 小尖尖"
    const match = cleanFilename.match(/^([^-]+)\s*-/)
    if (match) {
        // 提取歌手部分并去除多余空格
        const artistsStr = match[1].trim()
        // 如果包含顿号或者中文逗号，分割成多个歌手
        if (artistsStr.includes('、') || artistsStr.includes('，') || artistsStr.includes(',')) {
            return artistsStr.split(/[、，,]/).map(artist => artist.trim())
        }
        // 单一歌手
        return [artistsStr]
    }
    // 无法提取歌手信息
    return null
}

// 封装 question 为 Promise
function question(query) {
    return new Promise(resolve => rl.question(query, resolve))
}

// 格式化 ID（补零到3位）
function formatId(num) {
    return String(num).padStart(3, '0')
}

// 加载题库索引
function loadIndex() {
    if (!fs.existsSync(INDEX_FILE)) {
        return {
            version: '2.0',
            lastUpdate: new Date().toISOString(),
            artists: []
        }
    }
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'))
}

// 保存题库索引
function saveIndex(index) {
    index.lastUpdate = new Date().toISOString()
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8')
}

// 加载歌手信息
function loadArtistInfo(artistId) {
    const infoFile = path.join(QUESTION_DIR, artistId, 'info.json')
    if (!fs.existsSync(infoFile)) {
        return null
    }
    return JSON.parse(fs.readFileSync(infoFile, 'utf-8'))
}

// 保存歌手信息
function saveArtistInfo(artistId, info) {
    const artistDir = path.join(QUESTION_DIR, artistId)
    if (!fs.existsSync(artistDir)) {
        fs.mkdirSync(artistDir, { recursive: true })
    }
    const infoFile = path.join(artistDir, 'info.json')
    fs.writeFileSync(infoFile, JSON.stringify(info, null, 2), 'utf-8')
}

// 显示所有歌手
function displayArtists(index) {
    console.log('\n========== 现有歌手列表 ==========')
    if (index.artists.length === 0) {
        console.log('暂无歌手')
    } else {
        index.artists.forEach(artist => {
            console.log(`[${artist.id}] ${artist.name} (${artist.songCount}首歌曲)`)
        })
    }
    console.log('==================================\n')
}

// 显示歌手的歌曲列表
function displaySongs(artistInfo) {
    console.log(`\n========== ${artistInfo.artistName} 的歌曲列表 ==========`)
    if (artistInfo.songs.length === 0) {
        console.log('暂无歌曲')
    } else {
        artistInfo.songs.forEach(song => {
            console.log(`[${song.id}] ${song.name}`)
        })
    }
    console.log('==================================\n')
}

// 添加新歌手
async function addNewArtist(index) {
    console.log('\n========== 添加新歌手 ==========')

    const artistName = await question('请输入歌手名称: ')
    if (!artistName.trim()) {
        console.log('❌ 歌手名称不能为空')
        return false
    }

    // 生成新的歌手 ID
    const newId = formatId(index.artists.length + 1)

    // 创建歌手信息
    const artistInfo = {
        artistId: newId,
        artistName: artistName.trim(),
        songCount: 0,
        songs: [],
        // 添加默认歌手字段，表示该歌手的所有歌曲
        defaultArtist: artistName.trim()
    }

    // 保存歌手信息
    saveArtistInfo(newId, artistInfo)

    // 更新索引
    index.artists.push({
        id: newId,
        name: artistName.trim(),
        songCount: 0
    })
    saveIndex(index)

    console.log(`✅ 成功添加歌手: [${newId}] ${artistName}`)
    console.log(`📁 歌手目录: Question/${newId}/`)
    console.log(`💡 提示: 请将该歌手的 mp3 文件放入 Question/${newId}/ 目录中`)

    return true
}

// 批量导入歌曲（从文件名自动提取歌名并重命名）
async function batchImportSongs(index, artistId) {
    const artistInfo = loadArtistInfo(artistId)
    if (!artistInfo) {
        console.log('❌ 歌手信息不存在')
        return false
    }

    console.log(`\n========== 批量导入 ${artistInfo.artistName} 的歌曲 ==========`)

    const artistDir = path.join(QUESTION_DIR, artistId)

    // 扫描目录中的 mp3 文件（排除已经是数字ID命名的文件）
    const allFiles = fs.readdirSync(artistDir)
        .filter(file => file.endsWith('.mp3'))

    // 分离已命名（数字ID）和未命名（歌名）的文件
    const numberedFiles = allFiles.filter(file => /^\d{3}\.mp3$/.test(file))
    const namedFiles = allFiles.filter(file => !/^\d{3}\.mp3$/.test(file))

    console.log(`\n📊 文件统计:`)
    console.log(`  已规范命名: ${numberedFiles.length} 个`)
    console.log(`  待处理文件: ${namedFiles.length} 个`)

    if (namedFiles.length === 0) {
        console.log('\n⚠️  没有需要处理的文件')
        console.log(`💡 提示: 请将以歌名命名的 mp3 文件放入 Question/${artistId}/ 目录`)
        console.log('   例如: 晴天.mp3, 七里香.mp3, 稻香.mp3')
        return false
    }

    // 去重检查
    const existingSongMap = new Map(artistInfo.songs.map(s => [s.name.toLowerCase().trim(), s]))
    const newSongMap = new Map() // 存储清理后的歌曲名到原始文件的映射
    const validFiles = []
    const duplicateFiles = []

    console.log(`\n🔍 检查重复歌曲...`)

    for (const file of namedFiles) {
        // 清理文件名（删除括号内容）
        const cleanSongName = extractSongName(file.replace('.mp3', '').trim())
        const cleanSongNameLower = cleanSongName.toLowerCase()

        // 检查是否与已有歌曲重复
        if (existingSongMap.has(cleanSongNameLower)) {
            duplicateFiles.push({ file, songName: cleanSongName, reason: '已存在于数据库' })
            continue
        }

        // 检查是否与本次导入的其他歌曲重复
        if (newSongMap.has(cleanSongNameLower)) {
            const existingFile = newSongMap.get(cleanSongNameLower)

            // 优先选择无括号的版本
            const hasBrackets = (file.includes('(') || file.includes('[') || file.includes('{') ||
                               file.includes('（') || file.includes('【'))
            const existingHasBrackets = (existingFile.file.includes('(') || existingFile.file.includes('[') ||
                                        existingFile.file.includes('{') || existingFile.file.includes('（') ||
                                        existingFile.file.includes('【'))

            if (hasBrackets && !existingHasBrackets) {
                // 新文件有括号，已有文件无括号，保留已有文件，标记新文件为重复
                duplicateFiles.push({ file, songName: cleanSongName, reason: '与本次导入的其他歌曲重复' })
                continue
            } else if (!hasBrackets && existingHasBrackets) {
                // 新文件无括号，已有文件有括号，替换已有文件
                const index = validFiles.findIndex(f => f.file === existingFile.file)
                if (index !== -1) {
                    validFiles.splice(index, 1)
                }
                duplicateFiles.push({ file: existingFile.file, songName: cleanSongName, reason: '与本次导入的其他歌曲重复' })
                // 更新映射
                newSongMap.set(cleanSongNameLower, { file, songName: cleanSongName })
                validFiles.push({ file, songName: cleanSongName })
                continue
            } else {
                // 两者都有或都无括号，保留第一个
                duplicateFiles.push({ file, songName: cleanSongName, reason: '与本次导入的其他歌曲重复' })
                continue
            }
        }

        newSongMap.set(cleanSongNameLower, { file, songName: cleanSongName })
        validFiles.push({ file, songName: cleanSongName })
    }

    // 显示去重结果
    if (duplicateFiles.length > 0) {
        console.log(`\n⚠️  发现 ${duplicateFiles.length} 个重复歌曲（将跳过）:`)
        duplicateFiles.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.file} (${item.songName}) - ${item.reason}`)
        })
    }

    if (validFiles.length === 0) {
        console.log('\n⚠️  没有可导入的歌曲（全部重复）')
        return false
    }

    console.log(`\n📁 待导入的文件 (${validFiles.length} 首):`)
    validFiles.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.file} → 歌名: ${item.songName}`)
    })

    const confirm = await question(`\n确认批量导入这 ${validFiles.length} 首歌曲? (y/n): `)

    if (confirm.toLowerCase() !== 'y') {
        console.log('已取消')
        return false
    }

    // 获取下一个可用的歌曲ID
    let nextId = 1
    if (artistInfo.songs.length > 0) {
        const maxId = Math.max(...artistInfo.songs.map(s => parseInt(s.id)))
        nextId = maxId + 1
    }

    console.log(`\n开始处理...`)
    let successCount = 0
    let failCount = 0
    let skippedCount = 0

    for (const item of validFiles) {
        const { file, songName } = item
        const oldPath = path.join(artistDir, file)
        const newId = formatId(nextId)
        const newFileName = `${newId}.mp3`
        const newPath = path.join(artistDir, newFileName)
        const tempPath = path.join(artistDir, `temp_${newId}.mp3`)

        try {
            // 检查新文件名是否已存在
            if (fs.existsSync(newPath)) {
                console.log(`  ⚠️  ${file} → ${newFileName} (文件已存在，跳过)`)
                skippedCount++
                continue
            }

            // 截取音频前6秒
            console.log(`  🎵 ${file} → 截取前${AUDIO_DURATION}秒...`)
            await trimAudio(oldPath, tempPath, AUDIO_DURATION)

            // 删除原文件
            fs.unlinkSync(oldPath)

            // 重命名临时文件为最终文件名
            fs.renameSync(tempPath, newPath)

            // 从文件名中提取歌手信息
            const artistFromFilename = extractArtistsFromFile(songName)

            // 清理歌曲名（删除括号内容并提取纯净歌曲名）
            const cleanSongName = extractSongName(songName)
            const pureSongName = extractPureSongName(songName)

            // 添加到歌曲列表
            const songObj = {
                id: newId,
                name: pureSongName
            }

            // 如果能从文件名提取到歌手信息，则添加歌手字段
            if (artistFromFilename) {
                songObj.artists = artistFromFilename
            }

            artistInfo.songs.push(songObj)

            console.log(`  ✅ ${file} → ${newFileName} (${songName})`)
            successCount++
            nextId++
        } catch (error) {
            console.log(`  ❌ ${file} 处理失败: ${error.message}`)
            // 清理临时文件
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath)
            }
            failCount++
        }
    }

    // 清理重复的文件
    if (duplicateFiles.length > 0) {
        console.log(`\n🗑️  清理重复文件...`)
        for (const item of duplicateFiles) {
            try {
                const filePath = path.join(artistDir, item.file)
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                    console.log(`  ✅ 已删除: ${item.file}`)
                }
            } catch (error) {
                console.log(`  ⚠️  删除失败: ${item.file} - ${error.message}`)
            }
        }
    }

    if (successCount > 0) {
        // 按 ID 排序
        artistInfo.songs.sort((a, b) => a.id.localeCompare(b.id))

        // 更新歌曲数量
        artistInfo.songCount = artistInfo.songs.length

        // 保存歌手信息
        saveArtistInfo(artistId, artistInfo)

        // 更新索引中的歌曲数量
        const artist = index.artists.find(a => a.id === artistId)
        if (artist) {
            artist.songCount = artistInfo.songCount
            saveIndex(index)
        }

        console.log(`\n✅ 批量导入完成!`)
        console.log(`   成功: ${successCount} 首`)
        if (duplicateFiles.length > 0) {
            console.log(`   重复: ${duplicateFiles.length} 首 (已清理)`)
        }
        if (skippedCount > 0) {
            console.log(`   跳过: ${skippedCount} 首`)
        }
        if (failCount > 0) {
            console.log(`   失败: ${failCount} 首`)
        }
    } else {
        console.log('\n❌ 没有成功导入任何歌曲')
        if (duplicateFiles.length > 0) {
            console.log(`   ${duplicateFiles.length} 首重复歌曲已清理`)
        }
    }

    return true
}

// 为歌手添加歌曲（手动输入模式）
async function addSongsToArtist(index, artistId) {
    const artistInfo = loadArtistInfo(artistId)
    if (!artistInfo) {
        console.log('❌ 歌手信息不存在')
        return false
    }

    console.log(`\n========== 为 ${artistInfo.artistName} 添加歌曲 ==========`)
    displaySongs(artistInfo)

    const artistDir = path.join(QUESTION_DIR, artistId)

    // 扫描目录中的 mp3 文件
    const mp3Files = fs.readdirSync(artistDir)
        .filter(file => file.endsWith('.mp3') && /^\d{3}\.mp3$/.test(file))
        .map(file => file.replace('.mp3', ''))

    console.log(`\n📁 目录中的 mp3 文件:`)
    if (mp3Files.length === 0) {
        console.log('  暂无 mp3 文件')
        console.log(`\n💡 提示: 请先将 mp3 文件放入 Question/${artistId}/ 目录中`)
        console.log('  文件命名格式: 001.mp3, 002.mp3, ...')
        return false
    } else {
        mp3Files.forEach(file => {
            const existing = artistInfo.songs.find(s => s.id === file)
            if (existing) {
                console.log(`  ${file}.mp3 ✅ (已录入: ${existing.name})`)
            } else {
                console.log(`  ${file}.mp3 ⚠️  (未录入)`)
            }
        })
    }

    console.log('\n请为未录入的歌曲输入歌名 (输入 q 退出):')

    let addedCount = 0
    for (const fileId of mp3Files) {
        const existing = artistInfo.songs.find(s => s.id === fileId)
        if (existing) {
            continue // 跳过已录入的歌曲
        }

        const songName = await question(`  [${fileId}.mp3] 歌名: `)

        if (songName.toLowerCase() === 'q') {
            break
        }

        if (!songName.trim()) {
            console.log('    ⚠️  歌名为空，跳过')
            continue
        }

        // 清理歌曲名（删除括号内容并提取纯净歌曲名）
        const cleanSongName = extractSongName(songName.trim())
        const pureSongName = extractPureSongName(songName.trim())

        // 从文件名中提取歌手信息
        const artistFromFilename = extractArtistsFromFile(songName.trim())

        // 添加歌曲
        const songObj = {
            id: fileId,
            name: pureSongName
        }

        // 如果能从文件名提取到歌手信息，则添加歌手字段
        if (artistFromFilename) {
            songObj.artists = artistFromFilename
        }

        artistInfo.songs.push(songObj)
        addedCount++
        console.log(`    ✅ 已添加`)
    }

    if (addedCount > 0) {
        // 按 ID 排序
        artistInfo.songs.sort((a, b) => a.id.localeCompare(b.id))

        // 更新歌曲数量
        artistInfo.songCount = artistInfo.songs.length

        // 保存歌手信息
        saveArtistInfo(artistId, artistInfo)

        // 更新索引中的歌曲数量
        const artist = index.artists.find(a => a.id === artistId)
        if (artist) {
            artist.songCount = artistInfo.songCount
            saveIndex(index)
        }

        console.log(`\n✅ 成功添加 ${addedCount} 首歌曲`)
    } else {
        console.log('\n⚠️  未添加任何歌曲')
    }

    return true
}

// 删除歌曲
async function deleteSong(index, artistId) {
    const artistInfo = loadArtistInfo(artistId)
    if (!artistInfo) {
        console.log('❌ 歌手信息不存在')
        return false
    }

    console.log(`\n========== 删除 ${artistInfo.artistName} 的歌曲 ==========`)
    displaySongs(artistInfo)

    if (artistInfo.songs.length === 0) {
        console.log('暂无歌曲可删除')
        return false
    }

    const songId = await question('请输入要删除的歌曲 ID (输入 q 取消): ')

    if (songId.toLowerCase() === 'q') {
        return false
    }

    const songIndex = artistInfo.songs.findIndex(s => s.id === songId)
    if (songIndex === -1) {
        console.log('❌ 歌曲不存在')
        return false
    }

    const song = artistInfo.songs[songIndex]
    const confirm = await question(`确认删除 [${song.id}] ${song.name}? (y/n): `)

    if (confirm.toLowerCase() !== 'y') {
        console.log('已取消')
        return false
    }

    // 删除歌曲记录
    artistInfo.songs.splice(songIndex, 1)
    artistInfo.songCount = artistInfo.songs.length

    // 保存歌手信息
    saveArtistInfo(artistId, artistInfo)

    // 更新索引
    const artist = index.artists.find(a => a.id === artistId)
    if (artist) {
        artist.songCount = artistInfo.songCount
        saveIndex(index)
    }

    console.log(`✅ 已删除歌曲: [${song.id}] ${song.name}`)
    console.log(`⚠️  注意: mp3 文件未删除，请手动删除 Question/${artistId}/${song.id}.mp3`)

    return true
}

// 设置歌手头像
async function setArtistAvatar(index) {
    const artistId = await question('请输入歌手 ID: ')

    // 验证歌手是否存在
    const artist = index.artists.find(a => a.id === artistId)
    if (!artist) {
        console.log('❌ 歌手不存在')
        return false
    }

    const artistInfo = loadArtistInfo(artistId)
    if (!artistInfo) {
        console.log('❌ 无法加载歌手信息')
        return false
    }

    console.log(`\n当前歌手: ${artistInfo.artistName}`)
    console.log(`当前头像: ${artistInfo.avatar || '未设置'}`)
    console.log('\n请将头像文件放置在以下目录中:')
    console.log(`  ${path.join(QUESTION_DIR, artistId)}/`)
    console.log('\n支持的文件格式: jpg, jpeg, png, gif, webp')

    const avatarFileName = await question('\n请输入头像文件名 (例如: avatar.jpg): ')

    if (!avatarFileName.trim()) {
        console.log('❌ 文件名不能为空')
        return false
    }

    // 验证文件是否存在
    const avatarPath = path.join(QUESTION_DIR, artistId, avatarFileName)
    if (!fs.existsSync(avatarPath)) {
        console.log(`❌ 文件不存在: ${avatarPath}`)
        console.log('请先将头像文件复制到歌手目录中')
        return false
    }

    // 验证文件格式
    const ext = path.extname(avatarFileName).toLowerCase()
    const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    if (!validExts.includes(ext)) {
        console.log(`❌ 不支持的文件格式: ${ext}`)
        console.log(`支持的格式: ${validExts.join(', ')}`)
        return false
    }

    // 更新歌手信息
    artistInfo.avatar = avatarFileName
    saveArtistInfo(artistId, artistInfo)

    // 更新索引中的头像信息
    artist.avatar = avatarFileName
    saveIndex(index)

    console.log(`✅ 已设置歌手 ${artistInfo.artistName} 的头像: ${avatarFileName}`)
    return true
}

// 主菜单
async function mainMenu() {
    const index = loadIndex()

    while (true) {
        console.log('\n========== 猜歌王题库管理工具 ==========')
        console.log('1. 查看所有歌手')
        console.log('2. 添加新歌手')
        console.log('3. 批量导入歌曲 (推荐)')
        console.log('4. 手动添加歌曲')
        console.log('5. 删除歌曲')
        console.log('6. 查看歌手详情')
        console.log('7. 设置歌手头像')
        console.log('0. 退出')
        console.log('========================================')

        const choice = await question('请选择操作: ')

        switch (choice) {
            case '1':
                displayArtists(index)
                break

            case '2':
                await addNewArtist(index)
                break

            case '3': {
                displayArtists(index)
                if (index.artists.length === 0) {
                    console.log('请先添加歌手')
                    break
                }
                const artistId = await question('请输入歌手 ID: ')
                const artist = index.artists.find(a => a.id === artistId)
                if (!artist) {
                    console.log('❌ 歌手不存在')
                } else {
                    await batchImportSongs(index, artistId)
                }
                break
            }

            case '4': {
                displayArtists(index)
                if (index.artists.length === 0) {
                    console.log('请先添加歌手')
                    break
                }
                const artistId = await question('请输入歌手 ID: ')
                const artist = index.artists.find(a => a.id === artistId)
                if (!artist) {
                    console.log('❌ 歌手不存在')
                } else {
                    await addSongsToArtist(index, artistId)
                }
                break
            }

            case '5': {
                displayArtists(index)
                if (index.artists.length === 0) {
                    console.log('请先添加歌手')
                    break
                }
                const artistId = await question('请输入歌手 ID: ')
                const artist = index.artists.find(a => a.id === artistId)
                if (!artist) {
                    console.log('❌ 歌手不存在')
                } else {
                    await deleteSong(index, artistId)
                }
                break
            }

            case '6': {
                displayArtists(index)
                if (index.artists.length === 0) {
                    console.log('请先添加歌手')
                    break
                }
                const artistId = await question('请输入歌手 ID: ')
                const artistInfo = loadArtistInfo(artistId)
                if (!artistInfo) {
                    console.log('❌ 歌手不存在')
                } else {
                    displaySongs(artistInfo)
                }
                break
            }

            case '7': {
                displayArtists(index)
                if (index.artists.length === 0) {
                    console.log('请先添加歌手')
                    break
                }
                await setArtistAvatar(index)
                break
            }

            case '0':
                console.log('\n👋 再见！')
                rl.close()
                return

            default:
                console.log('❌ 无效的选择')
        }
    }
}

// 启动程序
console.log('🎵 猜歌王题库管理工具 v1.0')
console.log('📁 题库目录:', QUESTION_DIR)
mainMenu().catch(error => {
    console.error('❌ 发生错误:', error)
    rl.close()
})
