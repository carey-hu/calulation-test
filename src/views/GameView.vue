<template>
  <div class="wrap game-root">
    <div class="topbar safe-top">
      <button class="btn-back glass-btn" @click="$emit('back')">返回</button>
      <div class="top-stats">
        <div class="stat glass-pill">{{ progressText }}</div>
        <div class="stat glass-pill timer">⏱ {{ totalText }}</div>
      </div>
    </div>
    
    <div class="game-body">
      <div class="game-main">
        <div class="card q-card glass-panel">
          <div :class="['q-text', isSmallFont ? 'q-text-small' : '']">{{ qText }}</div>
          <div class="q-note">{{ hintNote }}</div>
          <div class="ans-box glass-input">答案：{{ input || '—' }}</div>
          <div class="hint">{{ uiHint }}</div>
        </div>
      </div>
      
      <div class="keypad-container">
        <NumKeypad 
          :left-text="leftText"
          @digit="$emit('digit', $event)"
          @clear="$emit('clear')"
          @backspace="$emit('backspace')"
          @left="$emit('left')"
          @confirm="$emit('confirm')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import NumKeypad from '@/components/NumKeypad.vue'

defineProps({
  progressText: String,
  totalText: String,
  qText: String,
  hintNote: String,
  input: String,
  uiHint: String,
  isSmallFont: Boolean,
  leftText: String
})

defineEmits(['back', 'digit', 'clear', 'backspace', 'left', 'confirm'])
</script>

<style scoped>
.wrap {
  padding: 10px 16px 10px; /* 减小上下内边距，给小屏留空间 */
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.game-root {
  height: 100vh; /* 强制占满屏幕 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止滚动 */
}

.topbar {
  flex-shrink: 0; /* 顶部栏不许压缩 */
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.safe-top {
  padding-top: max(44px, env(safe-area-inset-top));
}

/* === 新增：核心布局逻辑 === */
.game-body {
  flex: 1;
  display: flex;
  flex-direction: column; /* 竖屏默认垂直排列 */
  gap: 10px;
  min-height: 0; /* 允许子元素压缩 */
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
}

.game-main {
  flex: 1; /* 题目区占据剩余空间 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.keypad-container {
  flex-shrink: 0; /* 键盘区根据内容自适应 */
}

/* === 横屏适配逻辑 === */
@media (orientation: landscape) {
  .game-body {
    flex-direction: row; /* 变为左右布局 */
    align-items: center;
    gap: 20px;
    padding-bottom: 10px;
  }
  
  .game-main {
    height: 100%;
  }

  .keypad-container {
    width: 45%; /* 键盘占右侧约一半宽度 */
    max-width: 350px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

/* === 样式微调 === */
.btn-back {
  width: 70px;
  height: 40px;
  line-height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 700;
  font-size: 15px;
  color: #1c1c1e;
  backdrop-filter: blur(10px);
}

.top-stats {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
  color: #333;
}

.card {
  padding: 16px;
}

.q-card {
  text-align: center;
  padding: 2vh 16px; /* 上下内边距随屏幕高度变化 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  max-height: 400px; /* 限制最大高度 */
}

/* === 自动判定逻辑：使用 clamp 动态调整字体 === */
.q-text {
  /* 最小 40px，理想 12vw(视口宽度的12%)，最大 64px */
  font-size: clamp(40px, 12vw, 64px); 
  font-weight: 800;
  margin: 0;
  color: #1c1c1e;
  letter-spacing: -2px;
  line-height: 1.2;
}

.q-text-small {
  font-size: clamp(32px, 8vw, 52px) !important;
  letter-spacing: -1px !important;
  white-space: nowrap;
}

.q-note {
  margin-top: 8px;
  font-size: clamp(12px, 4vw, 16px);
  color: #8e8e93;
  font-weight: 500;
}

.ans-box {
  margin-top: auto; /* 将答案框推到底部 */
  margin-bottom: auto;
  padding: 10px;
  border-radius: 16px;
  font-size: clamp(32px, 8vw, 44px);
  font-weight: 800;
  min-height: 44px;
  color: #007aff;
}

.hint {
  margin-top: 10px;
  color: #8e8e93;
  font-size: 14px;
  font-weight: 600;
}
</style>
