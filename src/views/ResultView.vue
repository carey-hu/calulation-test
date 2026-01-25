<template>
  <div class="page">
    <div class="header">
      <h1 class="title">{{ title }}</h1>
      <p class="subtitle">{{ meta }}</p>
    </div>
    
    <div class="card">
      <div class="scroll">
        <template v-if="isTrainMode">
          <div v-for="(item, i) in trainLog" :key="i" class="row">
            <span class="left">{{ i + 1 }}. {{ item.q }}</span>
            <span class="right">
              <span :class="parseFloat(item.usedStr) > 2 ? 'slow' : ''">{{ item.usedStr }}</span>
              <span> / 错{{ item.wrong }}{{ item.skipped ? '(跳)' : '' }}</span>
            </span>
          </div>
        </template>
        <template v-else>
          <div v-for="(item, i) in results" :key="i" class="row">
            <span class="left">{{ i + 1 }}. {{ item.q }} = {{ item.yourAns }}</span>
            <span class="right">
              <span class="time">{{ item.usedStr }}</span>
              <span>{{ item.ok ? '✅' : '❌' }}</span>
              <span v-if="!item.ok" class="wrong">({{ item.realAns }})</span>
            </span>
          </div>
        </template>
      </div>
      
      <div class="btns">
        <template v-if="isHistoryReview">
          <button class="primary-btn" @click="$emit('backToHistory')">返回列表</button>
        </template>
        <template v-else>
          <button class="primary-btn" @click="$emit('home')">返回主页</button>
          <button class="secondary-btn" @click="$emit('restart')">再来一局</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  meta: String,
  isTrainMode: Boolean,
  trainLog: Array,
  results: Array,
  isHistoryReview: Boolean
})

defineEmits(['home', 'restart', 'backToHistory'])
</script>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 16px 30px;
  padding-top: max(60px, env(safe-area-inset-top));
  height: 100vh;
  position: relative;
  z-index: 1;
}

.header {
  text-align: center;
  margin-bottom: 16px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
}

.subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 6px;
}

.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 14px;
}

.left {
  color: rgba(0, 0, 0, 0.75);
}

.right {
  display: flex;
  gap: 6px;
  color: rgba(0, 0, 0, 0.5);
}

.time { color: rgba(0, 0, 0, 0.4); }
.slow { color: #ff3b30; }
.wrong { color: #ff3b30; font-weight: 600; }

.btns {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.primary-btn {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #34c759 0%, #28a745 100%);
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.4);
}

.primary-btn:active { transform: scale(0.98); }

.secondary-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #007aff;
  font-size: 16px;
  font-weight: 600;
}

.secondary-btn:active { transform: scale(0.98); }
</style>
