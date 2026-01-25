<template>
  <div class="home">
    <div class="header">
      <h1 class="title">计算助手</h1>
      <p class="subtitle">专项练习：进位加、退位减、大九九除法</p>
    </div>

    <div class="card">
      <ModeSelector 
        :mode-groups="modeGroups"
        :current-mode="currentModeKey"
        @select="$emit('setMode', $event)"
        @select-divisor="$emit('toSelectDivisor')"
      />
      
      <div class="row-label">空间思维专项</div>
      <button class="cubic-btn" @click="$emit('startCubic')">
        <span>🧊</span>
        <span>立体拼合 / 积木训练</span>
      </button>

      <button class="primary-btn" @click="$emit('start')">开始练习</button>
      <button class="secondary-btn" @click="$emit('openHistory')">历史记录</button>
    </div>
  </div>
</template>

<script setup>
import ModeSelector from '@/components/ModeSelector.vue'

defineProps({
  modeGroups: Object,
  currentModeKey: String
})

defineEmits(['setMode', 'toSelectDivisor', 'startCubic', 'start', 'openHistory'])
</script>

<style scoped>
.home {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 16px 30px;
  padding-top: max(60px, env(safe-area-inset-top));
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
}

.subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 6px;
}

.card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 20px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.row-label {
  font-size: 13px;
  font-weight: 700;
  color: #007aff;
  margin: 16px 0 10px 4px;
}

.cubic-btn {
  width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 16px;
  background: rgba(175, 82, 222, 0.12);
  border: 1px solid rgba(175, 82, 222, 0.25);
  font-size: 16px;
  font-weight: 600;
  color: #af52de;
  margin-bottom: 20px;
  transition: all 0.2s ease;
}

.cubic-btn:active {
  transform: scale(0.98);
  background: rgba(175, 82, 222, 0.2);
}

.primary-btn {
  width: 100%;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, #34c759 0%, #28a745 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(52, 199, 89, 0.4);
  transition: all 0.2s ease;
}

.primary-btn:active {
  transform: scale(0.98);
}

.secondary-btn {
  width: 100%;
  height: 50px;
  margin-top: 12px;
  border-radius: 16px;
  background: rgba(175, 82, 222, 0.12);
  border: 1px solid rgba(175, 82, 222, 0.25);
  color: #af52de;
  font-size: 17px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.secondary-btn:active {
  transform: scale(0.98);
  background: rgba(175, 82, 222, 0.2);
}
</style>
