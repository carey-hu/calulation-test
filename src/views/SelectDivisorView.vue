<template>
  <div class="page">
    <div class="header">
      <h1 class="title">选择除数</h1>
      <p class="subtitle">点击下方数字开始练习商首位</p>
    </div>
    
    <div class="card">
      <div class="grid">
        <button v-for="d in divisorList" :key="d" class="num-btn" @click="$emit('select', d)">{{ d }}</button>
      </div>
      
      <button class="back-btn" @click="$emit('back')">返回主页</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ divisorList: Array })
defineEmits(['select', 'back'])
</script>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 16px 30px;
  padding-top: max(60px, env(safe-area-inset-top));
  overflow-y: auto;
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
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.num-btn {
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-size: 22px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.8);
  transition: all 0.15s ease;
}

.num-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.9);
}

.back-btn {
  width: 100%;
  height: 50px;
  margin-top: 20px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #007aff;
  font-size: 17px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.back-btn:active {
  transform: scale(0.98);
}
</style>
