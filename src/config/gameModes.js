import { shuffle, buildBasePool, randomInt } from '@/utils/math'

export const DIVISOR_LIST = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19]

export const GAME_MODES = {
  train: {
    name: '训练',
    title: '训练完成！',
    hintNote: '每题限时3秒，可跳过',
    gen: () => buildBasePool()
  },
  race: {
    name: '竞速',
    title: '竞速完成！',
    hintNote: '限时81题',
    gen: () => buildBasePool()
  },
  first: {
    name: '首位(随机)',
    title: '首位练习完成！',
    hintNote: '仅填商的首位数字',
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const d = DIVISOR_LIST[randomInt(0, DIVISOR_LIST.length - 1)]
        const q = randomInt(11, 99)
        const dd = d * q
        pool.push({ dividend: dd, divisor: d, ans: Math.floor(q / 10), symbol: '÷' })
      }
      return pool
    }
  },
  firstSpec: {
    name: '首位(指定)',
    title: '首位练习完成！',
    hintNote: '仅填商的首位数字',
    gen: (n, divisor) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const q = randomInt(11, 99)
        const dd = divisor * q
        pool.push({ dividend: dd, divisor, ans: Math.floor(q / 10), symbol: '÷' })
      }
      return pool
    }
  },
  plus: {
    name: '进位加',
    title: '进位加完成！',
    hintNote: '仅填个位数字',
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(1, 9), b = randomInt(1, 9)
        if (a + b >= 10) pool.push({ dividend: a, divisor: b, ans: (a + b) % 10, symbol: '+' })
        else i--
      }
      return pool
    }
  },
  minus: {
    name: '退位减',
    title: '退位减完成！',
    hintNote: '仅填个位数字',
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(0, 9), b = randomInt(1, 9)
        if (a < b) pool.push({ dividend: `1${a}`, divisor: b, ans: 10 + a - b, symbol: '-' })
        else i--
      }
      return pool
    }
  },
  doublePlus: {
    name: '双进位加',
    title: '双进位加完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(10, 99), b = randomInt(10, 99)
        pool.push({ dividend: a, divisor: b, ans: a + b, symbol: '+' })
      }
      return pool
    }
  },
  doubleMinus: {
    name: '双退位减',
    title: '双退位减完成！',
    hintNote: '个位退，十位不退',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(21, 99), b = randomInt(10, a - 10)
        const a1 = a % 10, a10 = Math.floor(a / 10)
        const b1 = b % 10, b10 = Math.floor(b / 10)
        if (a1 < b1 && a10 > b10) {
          pool.push({ dividend: a, divisor: b, ans: a - b, symbol: '-' })
        } else { i-- }
      }
      return pool
    }
  },
  fourAdd: {
    name: '四数相加',
    title: '四数相加完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const nums = [randomInt(10, 30), randomInt(10, 30), randomInt(10, 30), randomInt(10, 30)]
        const sum = nums.reduce((a, b) => a + b, 0)
        pool.push({ dividend: nums.slice(0, 2).join('+'), divisor: nums.slice(2).join('+'), ans: sum, symbol: '+' })
      }
      return pool
    }
  },
  triplePlus: {
    name: '三进位加',
    title: '三进位加完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(100, 500), b = randomInt(100, 500)
        pool.push({ dividend: a, divisor: b, ans: a + b, symbol: '+' })
      }
      return pool
    }
  },
  tripleMinus: {
    name: '三退位减',
    title: '三退位减完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(200, 999), b = randomInt(100, a - 50)
        pool.push({ dividend: a, divisor: b, ans: a - b, symbol: '-' })
      }
      return pool
    }
  },
  anyPlus: {
    name: '任意加',
    title: '任意加完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(100, 999), b = randomInt(100, 999)
        pool.push({ dividend: a, divisor: b, ans: a + b, symbol: '+' })
      }
      return pool
    }
  },
  anyMinus: {
    name: '任意减',
    title: '任意减完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(200, 999), b = randomInt(100, a - 1)
        pool.push({ dividend: a, divisor: b, ans: a - b, symbol: '-' })
      }
      return pool
    }
  },
  mixedPlusMinus: {
    name: '加减混合',
    title: '加减混合完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        if (Math.random() > 0.5) {
          const a = randomInt(100, 500), b = randomInt(100, 500)
          pool.push({ dividend: a, divisor: b, ans: a + b, symbol: '+' })
        } else {
          const a = randomInt(200, 999), b = randomInt(100, a - 1)
          pool.push({ dividend: a, divisor: b, ans: a - b, symbol: '-' })
        }
      }
      return pool
    }
  },
  mul3x1: {
    name: '三乘一',
    title: '三乘一完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(100, 999), b = randomInt(2, 9)
        pool.push({ dividend: a, divisor: b, ans: a * b, symbol: '×' })
      }
      return pool
    }
  },
  div3x1: {
    name: '三除一',
    title: '三除一完成！',
    hintNote: '完整答案',
    isSmallFont: true,
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const b = randomInt(2, 9), q = randomInt(11, 111)
        const a = b * q
        pool.push({ dividend: a, divisor: b, ans: q, symbol: '÷' })
      }
      return pool
    }
  },
  reverseScale: {
    name: '反向放缩',
    title: '反向放缩完成！',
    hintNote: '允许3%误差',
    isSmallFont: true,
    check: (userAns, realAns) => {
      const err = Math.abs(userAns - realAns) / realAns
      return { ok: err <= 0.03, display: Math.round(realAns) }
    },
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(100, 999)
        const scale = [0.2, 0.25, 0.5, 2, 4, 5][randomInt(0, 5)]
        pool.push({ dividend: a, divisor: scale, ans: a * scale, symbol: '×' })
      }
      return pool
    }
  },
  translate: {
    name: '平移法',
    title: '平移法完成！',
    hintNote: '允许3%误差',
    isSmallFont: true,
    check: (userAns, realAns) => {
      const err = Math.abs(userAns - realAns) / realAns
      return { ok: err <= 0.03, display: Math.round(realAns) }
    },
    gen: (n) => {
      const pool = []
      for (let i = 0; i < n; i++) {
        const a = randomInt(100, 500), b = randomInt(100, 500)
        const op = Math.random() > 0.5 ? '+' : '-'
        const ans = op === '+' ? a + b : a - b
        pool.push({ dividend: a, divisor: b, ans, symbol: op })
      }
      return pool
    }
  }
}

export const MODE_GROUPS = {
  division: { label: '大九九/除法', modes: ['train', 'race', 'first'] },
  firstSpec: { label: '商首位专项', hasCustomEntry: true },
  single: { label: '一位数专项 (仅填尾数)', modes: ['plus', 'minus'] },
  double: { label: '两位数专项 (完整答案)', modes: ['doublePlus', 'doubleMinus', 'fourAdd'] },
  triple: { label: '三位数专项 (完整答案)', modes: ['triplePlus', 'tripleMinus', 'anyPlus', 'anyMinus', 'mixedPlusMinus', 'mul3x1', 'div3x1'] },
  advanced: { label: '五除三专项 (允许3%误差)', modes: ['reverseScale', 'translate'] }
}

export function getModeConfig(modeKey) {
  return GAME_MODES[modeKey] || { name: modeKey }
}
