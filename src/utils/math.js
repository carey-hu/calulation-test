export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildBasePool() {
  const pool = []
  for (let d = 2; d <= 9; d++) {
    for (let q = 2; q <= 9; q++) {
      pool.push({ dividend: d * q, divisor: d, ans: q, symbol: '÷' })
    }
  }
  for (let d = 11; d <= 19; d++) {
    for (let q = 2; q <= 9; q++) {
      pool.push({ dividend: d * q, divisor: d, ans: q, symbol: '÷' })
    }
  }
  return shuffle(pool)
}

export function msToTimeStr(ms) {
  const totalSec = ms / 1000
  const m = Math.floor(totalSec / 60)
  const s = (totalSec % 60).toFixed(1)
  return m > 0 ? `${m}:${s.padStart(4, '0')}` : s
}

export function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
