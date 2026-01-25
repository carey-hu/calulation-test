import { ref } from 'vue'
import * as echarts from 'echarts'

export function useChart() {
  const showChart = ref(false)
  const chartTab = ref('')
  const availableModes = ref([])
  let chartInstance = null

  function initChart(historyList) {
    const modes = [...new Set(historyList.map(h => h.modeName))]
    availableModes.value = modes
    chartTab.value = modes[0] || ''
    showChart.value = true
  }

  function renderChart(modeName, historyList) {
    const container = document.getElementById('accChart')
    if (!container) return

    if (!chartInstance) {
      chartInstance = echarts.init(container)
    }

    const data = historyList
      .filter(h => h.modeName === modeName)
      .slice(0, 30)
      .reverse()

    const xData = data.map((_, i) => i + 1)
    const accData = data.map(h => {
      if (h.mode === 'train') {
        const total = h.detail?.length || 1
        const wrong = h.detail?.reduce((s, t) => s + t.wrong, 0) || 0
        return Math.round((1 - wrong / (total + wrong)) * 100)
      } else {
        const correct = h.detail?.filter(r => r.ok).length || 0
        const total = h.detail?.length || 1
        return Math.round((correct / total) * 100)
      }
    })
    const timeData = data.map(h => parseFloat(h.duration))

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['正确率', '耗时'], top: 0 },
      grid: { left: 40, right: 40, top: 35, bottom: 25 },
      xAxis: { type: 'category', data: xData },
      yAxis: [
        { type: 'value', name: '%', min: 0, max: 100, position: 'left' },
        { type: 'value', name: 's', position: 'right' }
      ],
      series: [
        { name: '正确率', type: 'line', data: accData, smooth: true, yAxisIndex: 0 },
        { name: '耗时', type: 'bar', data: timeData, yAxisIndex: 1, itemStyle: { opacity: 0.5 } }
      ]
    }

    chartInstance.setOption(option)
  }

  function switchChartTab(modeName, historyList) {
    chartTab.value = modeName
    renderChart(modeName, historyList)
  }

  function closeChart() {
    showChart.value = false
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  }

  function resizeChart() {
    if (chartInstance) {
      chartInstance.resize()
    }
  }

  return {
    showChart,
    chartTab,
    availableModes,
    initChart,
    renderChart,
    switchChartTab,
    closeChart,
    resizeChart
  }
}
