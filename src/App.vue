<template>
  <div class="page">
    <MeshBackground />

    <ToastMessage 
      :show="toast.show.value" 
      :message="toast.message.value" 
    />

    <HomeView 
      v-if="viewState === 'home'"
      :mode-groups="modeGroups"
      :current-mode-key="gameState.currentModeKey.value"
      @set-mode="gameState.setMode"
      @to-select-divisor="viewState = 'selectDivisor'"
      @start-cubic="handleStartCubic"
      @start="handleStartGame"
      @open-history="handleOpenHistory"
    />

    <SelectDivisorView 
      v-if="viewState === 'selectDivisor'"
      :divisor-list="divisorList"
      @select="handleSelectDivisor"
      @back="viewState = 'home'"
    />

    <GameView 
      v-if="viewState === 'game'"
      :progress-text="gameState.progressText.value"
      :total-text="gameState.totalText.value"
      :q-text="gameState.qText.value"
      :hint-note="gameState.activeConfig.value.hintNote || gameState.activeConfig.value.hint || '精确到整数'"
      :input="gameState.input.value"
      :ui-hint="uiHint"
      :is-small-font="gameState.isSmallFont.value"
      :left-text="gameState.leftText.value"
      @digit="gameState.pressDigit"
      @clear="gameState.clearInput"
      @backspace="gameState.backspace"
      @left="handleSkipOrRestart"
      @confirm="handleConfirmAnswer"
      @back="handleGoHome"
    />

    <CubicView 
      v-if="viewState === 'cubic'"
      :colors="cubic.colors"
      :selected-color="cubic.selectedColor.value"
      :is-delete-mode="cubic.isDeleteMode.value"
      :is-slice-mode="cubic.isSliceMode.value"
      :slice-config="cubic.sliceConfig"
      @quit="handleQuitCubic"
      @switch-color="cubic.switchColor"
      @toggle-delete="cubic.toggleDeleteMode"
      @toggle-slice="cubic.toggleSliceMode"
      @clear="cubic.clearCubes"
      @set-view="cubic.setCameraView"
      @update-slice="Object.assign(cubic.sliceConfig, $event); cubic.updateSlicePlane()"
      @reset-slice="cubic.resetSlice"
    />

    <ResultView 
      v-if="viewState === 'result'"
      :title="resultTitle"
      :meta="resultMeta"
      :is-train-mode="gameState.currentModeKey.value === 'train'"
      :train-log="gameState.trainLog.value"
      :results="gameState.results.value"
      :is-history-review="isHistoryReview"
      @home="viewState = 'home'"
      @restart="handleStartGame"
      @back-to-history="handleOpenHistory"
    />

    <HistoryView 
      v-if="viewState === 'history'"
      :history-list="historyList"
      :show-chart="chart.showChart.value"
      :chart-tab="chart.chartTab.value"
      :available-modes="chart.availableModes.value"
      @init-chart="chart.initChart(historyList)"
      @switch-chart-tab="chart.switchChartTab($event, historyList)"
      @close-chart="chart.closeChart"
      @view-detail="handleViewHistoryDetail"
      @clear-oldest="handleClearOldest"
      @clear-all="handleClearAllHistory"
      @close="viewState = 'home'"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'

// --- 引入组件 ---
import MeshBackground from '@/components/MeshBackground.vue'
import ToastMessage from '@/components/ToastMessage.vue'
import HomeView from '@/views/HomeView.vue'
import SelectDivisorView from '@/views/SelectDivisorView.vue'
import GameView from '@/views/GameView.vue'
import CubicView from '@/views/CubicView.vue'
import ResultView from '@/views/ResultView.vue'
import HistoryView from '@/views/HistoryView.vue'

// --- 引入逻辑 (Composables) ---
import { useGameState } from '@/composables/useGameState'
import { useCubicMode } from '@/composables/useCubicMode'
import { useChart } from '@/composables/useChart'
import { useToast } from '@/composables/useToast'

// --- 引入配置与工具 ---
import { MODE_GROUPS, DIVISOR_LIST } from '@/config/gameModes'
import { getHistory, clearHistory, clearOldestRecords } from '@/utils/storage'

// ==========================================
// 状态初始化
// ==========================================

// 视图路由状态
const viewState = ref('home') // home, selectDivisor, game, cubic, result, history
const isHistoryReview = ref(false)
const historyList = ref([])
const modeGroups = MODE_GROUPS
const divisorList = DIVISOR_LIST
const uiHint = ref('Ready?') // 游戏界面的提示文字

// 结果页展示用的临时状态
const resultTitle = ref('')
const resultMeta = ref('')

// 实例化 Composables
const gameState = useGameState()
const cubic = useCubicMode()
const chart = useChart()
const toast = useToast()

// ==========================================
// 生命周期
// ==========================================
onMounted(() => {
  historyList.value = getHistory()
  window.addEventListener('resize', () => {
    if (chart.showChart.value) chart.resizeChart()
  })
})

// ==========================================
// 事件处理：游戏逻辑
// ==========================================

const handleStartGame = () => {
  const success = gameState.startGame()
  if (success) {
    viewState.value = 'game'
    uiHint.value = '请输入答案'
    isHistoryReview.value = false
  }
}

const handleSelectDivisor = (d) => {
  gameState.setMode('firstSpec')
  gameState.setDivisor(d)
  handleStartGame()
}

const handleGoHome = () => {
  gameState.stopTimer()
  viewState.value = 'home'
}

const handleSkipOrRestart = () => {
  if (gameState.currentModeKey.value !== 'train') {
    // 非训练模式，左键是“重开”
    handleStartGame()
    return
  }
  // 训练模式，左键是“跳过”
  const hasNext = gameState.skipQuestion()
  if (!hasNext) {
    handleFinishGame()
  } else {
    uiHint.value = '已跳过'
  }
}

const handleConfirmAnswer = () => {
  // 1. 检查答案
  const result = gameState.checkAnswer()
  if (!result) return // 输入为空或无效

  const mode = gameState.currentModeKey.value
  
  // 2. 训练模式逻辑
  if (mode === 'train') {
    if (result.correct) {
      gameState.recordTrainResult(result)
      uiHint.value = '正确'
      const hasNext = gameState.nextQuestion()
      if (!hasNext) handleFinishGame()
    } else {
      // 答错不跳转，记录错误并提示
      gameState.recordTrainResult(result) // 内部会计数
      uiHint.value = `错误！答案是：${result.realAnsDisplay}`
    }
    return
  }

  // 3. 竞速/其他模式逻辑
  gameState.recordNormalResult(result)
  const hasNext = gameState.nextQuestion()
  if (!hasNext) {
    handleFinishGame()
  }
}

const handleFinishGame = () => {
  // 结束并保存
  const { summary, newHistory, totalSec } = gameState.finishGame(historyList.value)
  
  // 更新状态
  historyList.value = newHistory
  resultTitle.value = gameState.activeConfig.value.title || '训练完成！'
  resultMeta.value = gameState.getResultMeta(totalSec)
  
  viewState.value = 'result'
}

// ==========================================
// 事件处理：3D 模式
// ==========================================

const handleStartCubic = () => {
  viewState.value = 'cubic'
  nextTick(() => {
    cubic.initThree('three-container')
  })
}

const handleQuitCubic = () => {
  cubic.cleanup()
  viewState.value = 'home'
}

// ==========================================
// 事件处理：历史与图表
// ==========================================

const handleOpenHistory = () => {
  viewState.value = 'history'
  if (chart.showChart.value) {
    nextTick(() => chart.renderChart(chart.chartTab.value, historyList.value))
  }
}

const handleViewHistoryDetail = (index) => {
  const record = historyList.value[index]
  if (!record) return

  // 恢复数据到 gameState 以供 ResultView 使用
  gameState.setMode(record.mode)
  if (record.mode === 'train') {
    gameState.trainLog.value = record.detail || []
    gameState.results.value = []
  } else {
    gameState.results.value = record.detail || []
    gameState.trainLog.value = []
  }

  resultTitle.value = record.modeName + ' 记录回顾'
  resultMeta.value = record.summary + ' | 用时: ' + record.duration
  isHistoryReview.value = true
  viewState.value = 'result'
}

const handleClearOldest = () => {
  if (confirm(`当前共有 ${historyList.value.length} 条记录。\n确定要清除【最早的 1000 条】数据吗？`)) {
    historyList.value = clearOldestRecords(historyList.value)
    toast.showToast('清理成功')
    if (chart.showChart.value) {
      chart.initChart(historyList.value)
    }
  }
}

const handleClearAllHistory = () => {
  if (confirm('【严重警告】\n确定要清空【所有】历史记录吗？\n此操作不可恢复！')) {
    clearHistory()
    historyList.value = []
    toast.showToast('所有记录已清空')
    chart.closeChart()
  }
}
</script>

<style scoped>
/* 页面容器 */
.page {
  height: 100vh;
  min-height: 100vh;
  background: radial-gradient(at 0% 0%, hsla(210,100%,94%,1) 0, transparent 50%), 
              radial-gradient(at 100% 0%, hsla(260,100%,94%,1) 0, transparent 50%), 
              radial-gradient(at 100% 100%, hsla(300,100%,94%,1) 0, transparent 50%), 
              radial-gradient(at 0% 100%, hsla(180,100%,94%,1) 0, transparent 50%);
  background-color: #f2f2f7;
  color: #1c1c1e;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 0 40px rgba(0,0,0,0.08);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
</style>