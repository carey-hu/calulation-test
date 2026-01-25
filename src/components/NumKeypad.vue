<template>
  <div class="keypad">
    <div class="fn-row">
      <button class="fn-btn fn-green" @click="$emit('left')">{{ leftText }}</button>
      <button class="fn-btn fn-orange" @click="$emit('clear')">清空</button>
      <button class="fn-btn fn-red" @click="$emit('backspace')">退格</button>
    </div>
    
    <div class="num-grid">
      <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="num-btn" @click="$emit('digit', n)">{{ n }}</button>
      <button class="num-btn" @click="$emit('digit', 0)">0</button>
      <button class="num-btn confirm" @click="$emit('confirm')">确认</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  leftText: { type: String, default: '跳过' }
})

defineEmits(['digit', 'clear', 'backspace', 'left', 'confirm'])
</script>

<style scoped>
.keypad {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 28px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  margin-bottom: calc(12px + env(safe-area-inset-bottom));
}

.fn-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.fn-btn {
  flex: 1;
  height: 50px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  transition: all 0.15s ease;
}

.fn-btn:active {
  transform: scale(0.96);
  filter: brightness(0.9);
}

.fn-green {
  background: linear-gradient(135deg, #34c759 0%, #28a745 100%);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.4);
}

.fn-orange {
  background: linear-gradient(135deg, #ff9f0a 0%, #ff8c00 100%);
  box-shadow: 0 4px 12px rgba(255, 159, 10, 0.4);
}

.fn-red {
  background: linear-gradient(135deg, #ff453a 0%, #dc3545 100%);
  box-shadow: 0 4px 12px rgba(255, 69, 58, 0.4);
}

.num-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.num-btn {
  height: 68px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-size: 30px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;
}

.num-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.9);
}

.confirm {
  grid-column: 2 / 4;
  background: linear-gradient(135deg, #34c759 0%, #28a745 100%);
  color: #fff;
  font-size: 24px;
  border: none;
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.4);
}

.confirm:active {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
}
</style>
