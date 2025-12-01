<template>
    <div class="home">
        <div class="hero-section">
            <div class="brand-wrapper">
                <div class="logo-container">
                    <img src="/static/logo.png" alt="Logo" class="logo" />
                </div>

                <div class="title-container">
                    <img src="/static/title.png" alt="猜歌王" class="title-img" />
                </div>
            </div>
            <p class="subtitle">你是几级歌迷</p>

            <div class="features">
                <div class="feature-item">
                    <span class="feature-icon icon-music"></span>
                    <span class="feature-text">海量曲库</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon icon-bolt"></span>
                    <span class="feature-text">即时挑战</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon icon-trophy"></span>
                    <span class="feature-text">排行榜</span>
                </div>
            </div>

            <button class="start-btn" @click="startGame">
                <span class="btn-text">开始游戏</span>
                <span class="btn-arrow">→</span>
            </button>
        </div>

        <div class="footer">
            <p>猜歌王 @千诚</p>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function startGame() {
    router.push('/library-select')
}
</script>

<style scoped>
.home {
    min-height: 100vh;
    background: linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px 20px 30px;
}

.hero-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.brand-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.4));
    animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
    0%, 100% {
        filter: drop-shadow(0 0 20px rgba(0, 245, 255, 0.4));
    }
    50% {
        filter: drop-shadow(0 0 80px rgba(0, 245, 255, 0.8));
    }
}

.logo-container {
    width: 120px;
    height: 120px;
    margin-bottom: 10px;
    position: relative;
}

.logo-container::before {
    content: '';
    position: absolute;
    inset: -20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 245, 255, 0.2) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 0.5;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
}

.logo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
}

.title-container {
    margin: 0 0 16px 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.title-img {
    max-width: 280px;
    width: 50%;
    height: auto;
}

.subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 60px 0;
    font-weight: 500;
    letter-spacing: 1px;
}

.features {
    display: flex;
    gap: 32px;
    margin-bottom: 60px;
}

.feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.feature-icon {
    font-size: 32px;
    filter: drop-shadow(0 0 12px rgba(0, 245, 255, 0.4));
    display: inline-block;
    width: 1em;
    height: 1em;
    background-size: contain;
    background-repeat: no-repeat;
}

.feature-icon.icon-music {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E");
}

.feature-icon.icon-bolt {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'%3E%3C/polygon%3E%3C/svg%3E");
}

.feature-icon.icon-trophy {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'%3E%3C/path%3E%3Cpath d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'%3E%3C/path%3E%3Cpath d='M4 22h16'%3E%3C/path%3E%3Cpath d='M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 12 19.5 12 20v1'%3E%3C/path%3E%3Cpath d='M14 14.66V17c0 .55-.47.98-.97 1.21C11.96 18.75 12 19.5 12 20v1'%3E%3C/path%3E%3Cpath d='M18 2H6v7a6 6 0 0 0 12 0V2Z'%3E%3C/path%3E%3C/svg%3E");
}

.feature-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
    letter-spacing: 0.5px;
}

.start-btn {
    width: 100%;
    max-width: 320px;
    height: 60px;
    background: linear-gradient(135deg, #00f5ff 0%, #00d4ff 100%);
    border: none;
    border-radius: 30px;
    color: #000;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(0, 245, 255, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.start-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.start-btn:hover::before {
    opacity: 1;
}

.start-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 245, 255, 0.6);
}

.start-btn:active {
    transform: translateY(-2px) scale(0.98);
}

.btn-text,
.btn-arrow {
    position: relative;
    z-index: 1;
}

.btn-arrow {
    font-size: 24px;
    transition: transform 0.3s ease;
}

.start-btn:hover .btn-arrow {
    transform: translateX(4px);
}

.footer {
    text-align: center;
    padding-top: 20px;
}

.footer p {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
    letter-spacing: 0.3px;
}
</style>
