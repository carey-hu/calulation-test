<template>
  <div class="page">
    <div class="header">
      <h1 class="title">历史记录</h1>
      <p class="subtitle">仅保留最近5000条训练数据</p>
    </div>
    
    <div class="card">
      <div v-if="showChart" class="chart-box">
        <div class="tabs">
          <button v-for="m in availableModes" :key="m" :class="['tab', chartTab === m ? 'active' : '']" @click="$emit('switchChartTab', m)">{{ m }}</button>
        </div>
        <div id="accChart" class="chart"></div>
        <button class="close-btn" @click="$emit('closeChart')">收起图表</button>
      </div>
      <div v-else class="chart-trigger">
        <button class="chart-btn" @click="$emit('initChart')">📊 按模块分析趋势</button>
      </div>

      <div class="list-header">
        <span>时间 / 模式</span>
        <span>成绩 / 耗时</span>
      </div>
      
      <div class="scroll">
        <div v-if="historyList.length === 0" class="empty">暂无记录，快去练习吧！</div>
        <div v-else>
          <div v-for="(item, i) in historyList" :key="item.ts" class="row" @click="$emit('viewDetail', i)">
            <div class="row-left">
              <span class="time">{{ item.timeStr }}</span>
              <span class="mode">{{ item.modeName }}</span>
            </div>
            <div class="row-right">
              <span class="summary">{{ item.summary }}</span>
              <span class="duration">{{ item.duration }} ›</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="btns">
        <button v-if="historyList.length > 1000" class="warn-btn" @click="$emit('clearOldest')">🗑️ 清理最早的 1000 条</button>
        <div class="btn-row">
          <button class="danger-btn" @click="$emit('clearAll')">清空全部</button>
          <button class="primary-btn" @click="$emit('close')">返回主页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  historyList: Array,
  showChart: Boolean,
  chartTab: String,
  availableModes: Array
})

defineEmits(['initChart', 'switchChartTab', 'closeChart', 'viewDetail', 'clearOldest', 'clearAll', 'close'])
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

.chart-box {
  padding: 16px;
  margin: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
}

.tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.tabs::-webkit-scrollbar { display: none; }

.tab {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
}

.tab.active {
  background: #fff;
  color: rgba(0, 0, 0, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.chart { width: 100%; height: 180px; }

.close-btn {
  width: 100%;
  height: 32px;
  margin-top: 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
}

.chart-trigger { padding: 12px 16px; }

.chart-btn {
  width: 100%;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #007aff;
  font-size: 16px;
  font-weight: 600;
}

.chart-btn:active { transform: scale(0.98); }

.list-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.35);
}

.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.empty {
  text-align: center;
  padding: 40px;
  color: rgba(0, 0, 0, 0.35);
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.row:active {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 10px;
  margin: 0 -8px;
  padding-left: 8px;
  padding-right: 8px;
}

.row-left, .row-right {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.row-right { align-items: flex-end; }

.time { font-size: 12px; color: rgba(0, 0, 0, 0.4); }
.mode { font-size: 15px; font-weight: 600; color: rgba(0, 0, 0, 0.8); }
.summary { font-size: 16px; font-weight: 700; color: #007aff; }
.duration { font-size: 12px; color: rgba(0, 0, 0, 0.4); }

.btns {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-row { display: flex; gap: 10px; }

.warn-btn {
  width: 100%;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  font-size: 15px;
  font-weight: 600;
}

.danger-btn {
  flex: 1;
  height: 50px;
  border-radius: 14px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  font-size: 16px;
  font-weight: 600;
}

.primary-btn {
  flex: 1;
  height: 50px;
  border-radius: 14px;
  background: linear-gradient(135deg, #34c759 0%, #28a745 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.35);
}

.primary-btn:active, .danger-btn:active, .warn-btn:active { transform: scale(0.98); }
</style>
