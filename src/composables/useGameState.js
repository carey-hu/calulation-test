import { ref, computed } from 'vue'
import { GAME_MODES, getModeConfig } from '@/config/gameModes'
import { msToTimeStr, formatTime } from '@/utils/math'
import { addRecord } from '@/utils/storage'

export function useGameState() {
  const currentModeKey = ref('train')
  const selectedDivisor = ref(12)
  const pool = ref([])
  const idx = ref(0)
  const input = ref('')
  const results = ref([])
  const trainLog = ref([])
  const startTime = ref(0)
  const questionStart = ref(0)
  const totalMs = ref(0)
  const timerInterval = ref(null)
  const wrongCount = ref(0)
  const skipped = ref(false)

  const activeConfig = computed(() => getModeConfig(currentModeKey.value))
  const isSmallFont = computed(() => activeConfig.value.isSmallFont || false)
  const leftText = computed(() => currentModeKey.value === 'train' ? '跳过' : '重开')

  const currentQ = computed(() => pool.value[idx.value] || {})
  const qText = computed(() => {
    const q = currentQ.value
    if (!q.dividend) return ''
    return `${q.dividend}${q.symbol}${q.divisor}`
  })

  const progressText = computed(() => `${idx.value + 1}/${pool.value.length}`)
  const totalText = computed(() => msToTimeStr(totalMs.value))

  function setMode(key) {
    currentModeKey.value = key
  }

  function setDivisor(d) {
    selectedDivisor.value = d
  }

  function startGame() {
    const config = GAME_MODES[currentModeKey.value]
    if (!config) return false

    const count = currentModeKey.value === 'train' || currentModeKey.value === 'race' ? 81 : 10
    pool.value = config.gen(count, selectedDivisor.value)
    idx.value = 0
    input.value = ''
    results.value = []
    trainLog.value = []
    totalMs.value = 0
    startTime.value = Date.now()
    wrongCount.value = 0
    skipped.value = false

    timerInterval.value = setInterval(() => {
      totalMs.value = Date.now() - startTime.value
    }, 100)

    return true
  }

  function nextQuestion() {
    if (idx.value >= pool.value.length) return false
    input.value = ''
    questionStart.value = Date.now()
    wrongCount.value = 0
    skipped.value = false
    return true
  }

  function pressDigit(d) {
    if (input.value.length < 6) {
      input.value += d
    }
  }

  function clearInput() {
    input.value = ''
  }

  function backspace() {
    input.value = input.value.slice(0, -1)
  }

  function checkAnswer() {
    if (!input.value) return null
    const q = currentQ.value
    const userAns = parseFloat(input.value)
    const config = activeConfig.value

    let correct, realAnsDisplay
    if (config.check) {
      const result = config.check(userAns, q.ans)
      correct = result.ok
      realAnsDisplay = result.display
    } else {
      correct = userAns === q.ans
      realAnsDisplay = q.ans
    }

    return { correct, realAnsDisplay, userAns, q }
  }

  function recordTrainResult(checkResult) {
    if (checkResult.correct) {
      const usedMs = Date.now() - questionStart.value
      trainLog.value.push({
        q: qText.value,
        usedStr: (usedMs / 1000).toFixed(2) + 's',
        wrong: wrongCount.value,
        skipped: skipped.value
      })
      idx.value++
      return true
    } else {
      wrongCount.value++
      input.value = ''
      return false
    }
  }

  function recordNormalResult(checkResult) {
    const usedMs = Date.now() - questionStart.value
    results.value.push({
      q: qText.value,
      yourAns: checkResult.userAns,
      realAns: checkResult.realAnsDisplay,
      ok: checkResult.correct,
      usedStr: (usedMs / 1000).toFixed(2) + 's'
    })
    idx.value++
  }

  function skipQuestion() {
    skipped.value = true
    const usedMs = Date.now() - questionStart.value
    trainLog.value.push({
      q: qText.value,
      usedStr: (usedMs / 1000).toFixed(2) + 's',
      wrong: wrongCount.value,
      skipped: true
    })
    idx.value++
    return idx.value < pool.value.length
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  function finishGame(historyList) {
    stopTimer()
    const totalSec = totalMs.value / 1000

    let summary, detail
    if (currentModeKey.value === 'train') {
      const totalWrong = trainLog.value.reduce((s, t) => s + t.wrong, 0)
      summary = `错${totalWrong}`
      detail = trainLog.value
    } else {
      const correctCount = results.value.filter(r => r.ok).length
      summary = `${correctCount}/${results.value.length}`
      detail = results.value
    }

    const record = {
      ts: Date.now(),
      timeStr: formatTime(Date.now()),
      mode: currentModeKey.value,
      modeName: activeConfig.value.name,
      summary,
      duration: totalSec.toFixed(1) + 's',
      detail
    }

    const newHistory = addRecord(historyList, record)
    return { totalSec, newHistory }
  }

  function getResultMeta(totalSec) {
    if (currentModeKey.value === 'train') {
      const totalWrong = trainLog.value.reduce((s, t) => s + t.wrong, 0)
      return `共错 ${totalWrong} 次 · 总用时 ${totalSec.toFixed(1)}s`
    } else {
      const correctCount = results.value.filter(r => r.ok).length
      return `正确 ${correctCount}/${results.value.length} · 总用时 ${totalSec.toFixed(1)}s`
    }
  }

  return {
    currentModeKey,
    selectedDivisor,
    pool,
    idx,
    input,
    results,
    trainLog,
    activeConfig,
    isSmallFont,
    leftText,
    qText,
    progressText,
    totalText,
    setMode,
    setDivisor,
    startGame,
    nextQuestion,
    pressDigit,
    clearInput,
    backspace,
    checkAnswer,
    recordTrainResult,
    recordNormalResult,
    skipQuestion,
    stopTimer,
    finishGame,
    getResultMeta
  }
}
