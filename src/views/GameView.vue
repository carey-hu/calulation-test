<template>
  <div class="game">
    <div class="topbar">
      <button class="back-btn" @click="$emit('back')">返回</button>
      <div class="stats">
        <span class="pill">{{ progressText }}</span>
        <span class="pill">⏱ {{ totalText }}</span>
      </div>
    </div>
    
    <div class="main">
      <div class="q-card">
        <div :class="['q-text', isSmallFont ? 'small' : '']">{{ qText }}</div>
        <div class="q-hint">{{ hintNote }}</div>
        <div class="ans-box">答案：{{ input || '—' }}</div>
        <div class="ui-hint">{{ uiHint }}</div>
      </div>
    </div>
    
    <NumKeypad 
      :left-text="leftText"
      @digit="$emit('digit', $event)"
      @clear="$emit('clear')"
      @backspace="$emit('backspace')"
      @left="$emit('left')"
      @confirm="$emit('confirm')"
    />
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
.game {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  position: relative;
  z-index: 1;
}

.topbar {
  padding-top: max(50px, env(safe-area-inset-top));
  padding-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.8);
}

.back-btn:active {
  transform: scale(0.96);
}

.stats {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pill {
  background: rgba(255, 255, 255, 0.6);
  padding: 8px 14px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0;
}

.q-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 30px 20px;
  text-align: center;
}

.q-text {
  font-size: 54px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
}

.q-text.small {
  font-size: 42px;
}

.q-hint {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.ans-box {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-size: 36px;
  font-weight: 700;
  color: #007aff;
}

.ui-hint {
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.4);
  font-size: 14px;
}
</style>
