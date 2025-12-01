/**
 * 版本管理工具
 * 用于自动迭代版本并发布
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PACKAGE_FILE = path.join(__dirname, '../package.json')

// 获取仓库信息
function getRepoInfo() {
    try {
        const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
        // 处理SSH和HTTPS两种格式的URL
        if (remoteUrl.startsWith('git@')) {
            // git@github.com:user/repo.git -> user/repo
            return remoteUrl.replace('git@github.com:', '').replace('.git', '');
        } else if (remoteUrl.startsWith('https://')) {
            // https://github.com/user/repo.git -> user/repo
            return remoteUrl.replace('https://github.com/', '').replace('.git', '');
        }
        return 'unknown/repository';
    } catch (error) {
        return 'unknown/repository';
    }
}

// 发布新版本
async function publishNewVersion() {
    console.log('\n========== 发布新版本 ==========')
    
    // 检查是否有未提交的更改
    try {
        const statusOutput = execSync('git status --porcelain', { encoding: 'utf-8' });
        if (statusOutput.trim() !== '') {
            console.log('⚠️  检测到未提交的更改:');
            console.log(statusOutput);
            const readline = (await import('readline')).createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            const question = (query) => new Promise(resolve => readline.question(query, resolve));
            
            const shouldCommit = await question('是否要提交这些更改？(y/n): ');
            if (shouldCommit.toLowerCase() === 'y') {
                const commitMessage = await question('请输入提交信息: ');
                if (!commitMessage.trim()) {
                    console.log('❌ 提交信息不能为空');
                    readline.close();
                    return;
                }
                execSync(`git add .`, { stdio: 'inherit' });
                execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
                console.log('✅ 更改已提交');
            } else {
                console.log('❌ 请先提交更改再发布版本');
                readline.close();
                return;
            }
            readline.close();
        }
    } catch (error) {
        console.log('❌ Git状态检查失败:', error.message);
        return;
    }

    // 读取当前版本
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf-8'));
    const currentVersion = packageJson.version;
    console.log(`当前版本: v${currentVersion}`);

    const readline = (await import('readline')).createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise(resolve => readline.question(query, resolve));

    // 询问版本类型
    console.log('\n请选择版本更新类型:');
    console.log('1. 修订版本 (patch) - 例如: 1.0.0 -> 1.0.1');
    console.log('2. 次版本 (minor) - 例如: 1.0.1 -> 1.1.0');
    console.log('3. 主版本 (major) - 例如: 1.1.0 -> 2.0.0');
    console.log('4. 自定义版本');

    const versionChoice = await question('请选择 (1-4): ');
    
    let newVersion;
    const versionParts = currentVersion.split('.').map(Number);
    
    switch (versionChoice) {
        case '1':
            versionParts[2]++;
            newVersion = versionParts.join('.');
            break;
        case '2':
            versionParts[1]++;
            versionParts[2] = 0;
            newVersion = versionParts.join('.');
            break;
        case '3':
            versionParts[0]++;
            versionParts[1] = 0;
            versionParts[2] = 0;
            newVersion = versionParts.join('.');
            break;
        case '4':
            newVersion = await question('请输入新版本号 (格式: x.y.z): ');
            if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
                console.log('❌ 版本号格式不正确');
                readline.close();
                return;
            }
            break;
        default:
            console.log('❌ 无效选择');
            readline.close();
            return;
    }

    console.log(`新版本号: v${newVersion}`);
    
    // 确认更新
    const confirm = await question('\n确认发布新版本？(y/n): ');
    readline.close();
    
    if (confirm.toLowerCase() !== 'y') {
        console.log('已取消');
        return;
    }

    try {
        // 更新 package.json
        packageJson.version = newVersion;
        fs.writeFileSync(PACKAGE_FILE, JSON.stringify(packageJson, null, 2));
        console.log('✅ package.json 版本已更新');

        // 提交版本更新
        execSync(`git add ${PACKAGE_FILE}`, { stdio: 'inherit' });
        execSync(`git commit -m "Bump version to v${newVersion}"`, { stdio: 'inherit' });
        console.log('✅ 版本更新已提交');

        // 创建标签
        execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
        console.log(`✅ 标签 v${newVersion} 已创建`);

        // 推送更改和标签
        execSync('git push', { stdio: 'inherit' });
        execSync('git push --tags', { stdio: 'inherit' });
        console.log('✅ 更改和标签已推送至远程仓库');

        console.log(`\n🎉 版本 v${newVersion} 发布成功！`);
        console.log('下一步请在 GitHub 上创建 Release:');
        console.log(`   https://github.com/${getRepoInfo()}/releases/new?tag=v${newVersion}`);
    } catch (error) {
        console.log('❌ 发布过程中出现错误:', error.message);
    }
}

// 运行版本发布
publishNewVersion().catch(console.error);