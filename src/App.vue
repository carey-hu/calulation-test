<template>
  <div class="app">
    <LiquidBackground />
    <ToastMessage :show="toast.show" :message="toast.message" />

    <HomeView 
      v-if="view === 'home'"
      :mode-groups="modeGroups"
      :current-mode-key="game.currentModeKey.value"
      @set-mode="game.setMode"
      @to-select-divisor="view = 'selectDivisor'"
      @start-cubic="startCubic"
      @start="startGame"
      @open-history="view = 'history'"
    />

    <SelectDivisorView 
      v-if="view === 'selectDivisor'"
      :divisor-list="divisorList"
      @select="selectDivisor"
      @back="view = 'home'"
    />

    <GameView 
      v-if="view === 'game'"
      :progress-text="game.progressText.value"
      :total-text="game.totalText.value"
      :q-text="game.qText.value"
      :hint-note="game.activeConfig.value.hintNote || '精确到整数'"
      :input="game.input.value"
      :ui-hint="uiHint"
      :is-small-font="game.isSmallFont.value"
      :left-text="game.leftText.value"
      @back="goHome"
      @digit="game.pressDigit"
      @clear="game.clearInput"
      @backspace="game.backspace"
      @left="handleLeft"
      @confirm="handleConfirm"
    />

    <CubicView 
      v-if="view === 'cubic'"
      :colors="cubic.colors"
      :selected-color="cubic.selectedColor.value"
      :is-delete-mode="cubic.isDeleteMode.value"
      :is-slice-mode="cubic.isSliceMode.value"
      :slice-config="cubic.sliceConfig"
      @quit="quitCubic"
      @switch-color="cubic.switchColor"
      @toggle-delete="cubic.toggleDeleteMode"
      @toggle-slice="cubic.toggleSliceMode"
      @clear="cubic.clearCubes"
      @set-view="cubic.setCameraView"
      @update-slice="updateSlice"
      @reset-slice="cubic.resetSlice"
    />

    <ResultView 
      v-if="view === 'result'"
      :title="game.activeConfig.value.title || '完成！'"
      :meta="resultMeta"
      :is-train-mode="game.currentModeKey.value === 'train'"
      :train-log="game.trainLog.value"
      :results="game.results.value"
      :is-history-review="isReview"
      @home="goHome"
      @restart="startGame"
      @back-to-history="backToHistory"
    />

    <HistoryView 
      v-if="view === 'history'"
      :history-list="historyList"
      :show-chart="chart.showChart.value"
      :chart-tab="chart.chartTab.value"
      :available-modes="chart.availableModes.value"
      @init-chart="initChart"
      @switch-chart-tab="switchTab"
      @close-chart="chart.closeChart"
      @view-detail="viewDetail"
      @clear-oldest="clearOldest"
      @clear-all="clearAll"
      @close="view = 'home'"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import LiquidBackground from '@/components/LiquidBackground.vue'
import ToastMessage from '@/components/ToastMessage.vue'
import HomeView from '@/views/HomeView.vue'
import SelectDivisorView from '@/views/SelectDivisorView.vue'
import GameView from '@/views/GameView.vue'
import CubicView from '@/views/CubicView.vue'
import ResultView from '@/views/ResultView.vue'
import HistoryView from '@/views/HistoryView.vue'
import { useGameState } from '@/composables/useGameState'
import { useToast } from '@/composables/useToast'
import { useCubicMode } from '@/composables/useCubicMode'
import { useChart } from '@/composables/useChart'
import { MODE_GROUPS, DIVISOR_LIST } from '@/config/gameModes'
import { getHistory, clearHistory, clearOldestRecords } from '@/utils/storage'

const view = ref('home')
const historyList = ref([])
const isReview = ref(false)
const uiHint = ref('请输入答案')
const totalSec = ref(0)

const modeGroups = MODE_GROUPS
const divisorList = DIVISOR_LIST

const game = useGameState()
const toast = useToast()
const cubic = useCubicMode()
const chart = useChart()

const resultMeta = computed(() => game.getResultMeta(totalSec.value))

onMounted(() => {
  historyList.value = getHistory()
  window.addEventListener('resize', chart.resizeChart)
})

onUnmounted(() => {
  game.stopTimer()
  cubic.cleanup()
  window.removeEventListener('resize', chart.resizeChart)
})

function startGame() {
  if (game.startGame()) {
    view.value = 'game'
    uiHint.value = '请输入答案'
    isReview.value = false
    nextTick(() => game.nextQuestion())
  }
}

function selectDivisor(d) {
  game.setMode('firstSpec')
  game.setDivisor(d)
  startGame()
}

function handleLeft() {
  if (game.currentModeKey.value !== 'train') {
    startGame()
  } else if (!game.skipQuestion()) {
    finishGame()
  }
}

function handleConfirm() {
  const result = game.checkAnswer()
  if (!result) return
  
  if (game.currentModeKey.value === 'train') {
    if (game.recordTrainResult(result)) {
      toast.showToast('正确')
      if (!game.nextQuestion()) finishGame()
    } else {
      uiHint.value = `错误(${result.realAnsDisplay})`
    }
  } else {
    game.recordNormalResult(result)
    toast.showToast(result.correct ? '正确' : `错误(${result.realAnsDisplay})`)
    if (!game.nextQuestion()) finishGame()
  }
}

function finishGame() {
  const result = game.finishGame(historyList.value)
  totalSec.value = result.totalSec
  historyList.value = result.newHistory
  view.value = 'result'
  isReview.value = false
}

function goHome() {
  game.stopTimer()
  view.value = 'home'
}

function startCubic() {
  view.value = 'cubic'
  nextTick(() => cubic.initThree())
}

function quitCubic() {
  cubic.cleanup()
  view.value = 'home'
}

function updateSlice(config) {
  Object.assign(cubic.sliceConfig, config)
  cubic.updateSlicePlane()
}

function viewDetail(i) {
  const record = historyList.value[i]
  if (!record) return
  game.setMode(record.mode)
  totalSec.value = parseFloat(record.duration)
  game.trainLog.value = record.mode === 'train' ? record.detail || [] : []
  game.results.value = record.mode !== 'train' ? record.detail || [] : []
  view.value = 'result'
  isReview.value = true
}

function backToHistory() {
  view.value = 'history'
  if (chart.showChart.value) {
    nextTick(() => chart.renderChart(chart.chartTab.value, historyList.value))
  }
}

function initChart() {
  chart.initChart(historyList.value)
  nextTick(() => chart.renderChart(chart.chartTab.value, historyList.value))
}

function switchTab(m) {
  chart.switchChartTab(m, historyList.value)
}

function clearOldest() {
  if (confirm(`清除最早的1000条记录？`)) {
    historyList.value = clearOldestRecords(historyList.value, 1000)
    toast.showToast('清理成功')
  }
}

function clearAll() {
  if (confirm('确定清空所有记录？')) {
    clearHistory()
    historyList.value = []
    toast.showToast('已清空')
  }
}
</script>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(100, 180, 255, 0.35) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 30%, rgba(200, 150, 255, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(255, 180, 200, 0.25) 0%, transparent 50%),
    linear-gradient(160deg, #e6f0fa 0%, #f0e8f6 50%, #faf0ec 100%);
}
</style>
