const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildBasePool = () => {
  const arr = [];
  for (let d = 11; d <= 19; d += 1) {
    for (let q = 1; q <= 9; q += 1) {
      arr.push({ dividend: d * q, divisor: d, ans: q, symbol: '÷' });
    }
  }
  return arr;
};

// 游戏模式定义
const GAME_MODES = {
  train: { name: '训练', title: '基础训练完成！', hintNote: '精确到整数', gen: () => shuffle(buildBasePool()) },
  speed: { name: '竞速', title: '竞速完成！', hintNote: '精确到整数', gen: () => shuffle(buildBasePool()).slice(0, 10) },
  first: {
    name: '首位(随机)',
    title: '商首位完成！',
    hintNote: '目标：输入商的第一位数字',
    gen: (n) => {
      const pool = [];
      for (let i = 0; i < n; i += 1) {
        const dr = 11 + Math.floor(Math.random() * 9);
        const dd = 100 + Math.floor(Math.random() * 900);
        const fd = parseInt(String(Math.floor(dd / dr))[0], 10);
        pool.push({ dividend: dd, divisor: dr, ans: fd, symbol: '÷' });
      }
      return pool;
    }
  },
  firstSpec: {
    name: '商首位专项',
    title: '商首位专项完成！',
    gen: (n, ex) => {
      const d = ex.divisor || 12;
      const pool = [];
      for (let i = 0; i < n; i += 1) {
        const dd = Math.floor(Math.random() * (999 - d + 1)) + d;
        const fq = Math.floor(dd / d);
        const fd = parseInt(String(fq)[0], 10);
        pool.push({ dividend: dd, divisor: d, ans: fd, symbol: '÷' });
      }
      return pool;
    }
  },
  plus: {
    name: '进位加',
    title: '一位数进位加完成！',
    hintNote: '只填个位尾数',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        let a;
        let b;
        let a1;
        let b1;
        do {
          a = Math.floor(Math.random() * 9) + 1;
          b = Math.floor(Math.random() * 9) + 1;
          a1 = a % 10;
          b1 = b % 10;
        } while (a + b < 10);
        p.push({ dividend: a, divisor: b, ans: (a + b) % 10, symbol: '+' });
      }
      return p;
    }
  },
  minus: {
    name: '退位减',
    title: '一位数退位减完成！',
    hintNote: '只填个位尾数',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        let a;
        let b;
        do {
          a = Math.floor(Math.random() * 9) + 1;
          b = Math.floor(Math.random() * 9) + 1;
        } while (a >= b);
        p.push({ dividend: a, divisor: b, ans: 10 + a - b, symbol: '-' });
      }
      return p;
    }
  },
  doublePlus: {
    name: '双进位加',
    title: '双进位加完成！',
    hintNote: '个位十位均需进位',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        let a;
        let b;
        let a1;
        let a2;
        let b1;
        let b2;
        do {
          a = Math.floor(Math.random() * 90) + 10;
          b = Math.floor(Math.random() * 90) + 10;
          a1 = Math.floor(a / 10);
          a2 = a % 10;
          b1 = Math.floor(b / 10);
          b2 = b % 10;
        } while (a2 + b2 < 10 || a1 + b1 < 10);
        p.push({ dividend: a, divisor: b, ans: a + b, symbol: '+' });
      }
      return p;
    }
  },
  doubleMinus: {
    name: '双退位减',
    title: '双退位减完成！',
    hintNote: '个位退，十位不退',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        let a;
        let b;
        let a1;
        let a2;
        let b1;
        let b2;
        do {
          a = Math.floor(Math.random() * 90) + 10;
          b = Math.floor(Math.random() * 90) + 10;
          a1 = Math.floor(a / 10);
          a2 = a % 10;
          b1 = Math.floor(b / 10);
          b2 = b % 10;
        } while (!(a2 < b2 && a1 - 1 >= b1));
        p.push({ dividend: a, divisor: b, ans: a - b, symbol: '-' });
      }
      return p;
    }
  },
  fourSum: {
    name: '四数相加',
    title: '四数相加完成！',
    hintNote: '计算准确和',
    isSmallFont: true,
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        const a = Math.floor(Math.random() * 90) + 10;
        const b = Math.floor(Math.random() * 90) + 10;
        const c = Math.floor(Math.random() * 90) + 10;
        const d = Math.floor(Math.random() * 90) + 10;
        p.push({ dividend: `${a}+${b}+${c}`, divisor: d, ans: a + b + c + d, symbol: '+' });
      }
      return p;
    }
  },
  triplePlus: {
    name: '三进位加',
    title: '三进位加完成！',
    hintNote: '个位十位百位均需进位',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        let a;
        let b;
        let a1;
        let a2;
        let a3;
        let b1;
        let b2;
        let b3;
        do {
          a = Math.floor(Math.random() * 900) + 100;
          b = Math.floor(Math.random() * 900) + 100;
          a1 = Math.floor(a / 100);
          a2 = Math.floor((a % 100) / 10);
          a3 = a % 10;
          b1 = Math.floor(b / 100);
          b2 = Math.floor((b % 100) / 10);
          b3 = b % 10;
        } while (a3 + b3 < 10 || a2 + b2 < 10 || a1 + b1 < 10);
        p.push({ dividend: a, divisor: b, ans: a + b, symbol: '+' });
      }
      return p;
    }
  },
  tripleMinus: {
    name: '三退位减',
    title: '三退位减完成！',
    hintNote: '个十退，百不退',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        let a;
        let b;
        let a1;
        let a2;
        let a3;
        let b1;
        let b2;
        let b3;
        do {
          a = Math.floor(Math.random() * 900) + 100;
          b = Math.floor(Math.random() * 900) + 100;
          a1 = Math.floor(a / 100);
          a2 = Math.floor((a % 100) / 10);
          a3 = a % 10;
          b1 = Math.floor(b / 100);
          b2 = Math.floor((b % 100) / 10);
          b3 = b % 10;
        } while (!(a3 < b3 && (a2 - 1) < b2 && (a1 - 1) >= b1));
        p.push({ dividend: a, divisor: b, ans: a - b, symbol: '-' });
      }
      return p;
    }
  },
  tripleAnyPlus: {
    name: '任意加',
    title: '任意三数加完成！',
    hintNote: '任意三位数加法',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        const a = Math.floor(Math.random() * 900) + 100;
        const b = Math.floor(Math.random() * 900) + 100;
        p.push({ dividend: a, divisor: b, ans: a + b, symbol: '+' });
      }
      return p;
    }
  },
  tripleAnyMinus: {
    name: '任意减',
    title: '任意三数减完成！',
    hintNote: '任意三位数减法',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        let a = Math.floor(Math.random() * 900) + 100;
        let b = Math.floor(Math.random() * 900) + 100;
        if (a < b) [a, b] = [b, a];
        p.push({ dividend: a, divisor: b, ans: a - b, symbol: '-' });
      }
      return p;
    }
  },
  tripleMix: {
    name: '加减混合',
    title: '三数加减混合完成！',
    hintNote: '三数加减混合 (结果为正)',
    isSmallFont: true,
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        let a;
        let b;
        let c;
        let op1;
        let op2;
        let ans;
        do {
          a = Math.floor(Math.random() * 900) + 100;
          b = Math.floor(Math.random() * 900) + 100;
          c = Math.floor(Math.random() * 900) + 100;
          op1 = Math.random() > 0.5 ? '+' : '-';
          op2 = Math.random() > 0.5 ? '+' : '-';
          const step1 = op1 === '+' ? a + b : a - b;
          ans = op2 === '+' ? step1 + c : step1 - c;
        } while (ans < 0);
        p.push({ dividend: `${a}${op1}${b}`, divisor: c, ans, symbol: op2 });
      }
      return p;
    }
  },
  tripleMult: {
    name: '三乘一',
    title: '三乘一完成！',
    hintNote: '计算准确积',
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        const a = Math.floor(Math.random() * 900) + 100;
        const b = Math.floor(Math.random() * 8) + 2;
        p.push({ dividend: a, divisor: b, ans: a * b, symbol: '×' });
      }
      return p;
    }
  },
  tripleDiv: {
    name: '三除一',
    title: '三除一完成！',
    hintNote: '若为小数，填相邻整数均对',
    check: (v, t) => {
      if (Number.isInteger(t)) {
        return { ok: v === t, display: t };
      }
      const f = Math.floor(t);
      const c = Math.ceil(t);
      return { ok: v === f || v === c, display: `${f}或${c} (${t.toFixed(2)})` };
    },
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        const a = Math.floor(Math.random() * 900) + 100;
        const b = Math.floor(Math.random() * 8) + 2;
        p.push({ dividend: a, divisor: b, ans: a / b, symbol: '÷' });
      }
      return p;
    }
  },
  divSpecA: {
    name: '反向放缩',
    title: '反向放缩完成！',
    hintNote: '除数111-199 (误差3%内)',
    check: (v, t) => {
      const r = Math.abs(v - t) / t;
      return { ok: r <= 0.03, display: Math.round(t) };
    },
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        const dr = Math.floor(Math.random() * (199 - 111 + 1)) + 111;
        const dd = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
        p.push({ dividend: dd, divisor: dr, ans: dd / dr, symbol: '÷' });
      }
      return p;
    }
  },
  divSpecB: {
    name: '平移法',
    title: '平移法完成！',
    hintNote: '商90-111 (误差3%内)',
    check: (v, t) => {
      const r = Math.abs(v - t) / t;
      return { ok: r <= 0.03, display: Math.round(t) };
    },
    gen: (n) => {
      const p = [];
      let c = 0;
      while (c < n) {
        const dr = Math.floor(Math.random() * 900) + 100;
        const tq = Math.floor(Math.random() * (111 - 90 + 1)) + 90;
        const dd = dr * tq + Math.floor(Math.random() * dr);
        if (dd >= 10000 && dd <= 99999) {
          p.push({ dividend: dd, divisor: dr, ans: dd / dr, symbol: '÷' });
          c += 1;
        }
      }
      return p;
    }
  },
  divSpecC: {
    name: '任意五除三',
    title: '任意五除三完成！',
    hintNote: '五位数除以三位数 (误差3%内)',
    check: (v, t) => {
      const r = Math.abs(v - t) / t;
      return { ok: r <= 0.03, display: Math.round(t) };
    },
    gen: (n) => {
      const p = [];
      for (let i = 0; i < n; i += 1) {
        const dr = Math.floor(Math.random() * 900) + 100;
        const dd = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
        p.push({ dividend: dd, divisor: dr, ans: dd / dr, symbol: '÷' });
      }
      return p;
    }
  }
};

const MODE_GROUPS = {
  basic: { label: '大九九/除法', modes: ['train', 'speed', 'first'] },
  divSelect: { label: '商首位专项', modes: [] },
  single: { label: '一位数专项 (仅填尾数)', modes: ['plus', 'minus'] },
  double: { label: '两位数专项 (完整答案)', modes: ['doublePlus', 'doubleMinus', 'fourSum'] },
  triple: {
    label: '三位数专项 (完整答案)',
    modes: ['triplePlus', 'tripleMinus', 'tripleAnyPlus', 'tripleAnyMinus', 'tripleMix', 'tripleMult', 'tripleDiv']
  },
  spec: { label: '五除三专项 (允许3%误差)', modes: ['divSpecA', 'divSpecB', 'divSpecC'] }
};

export { GAME_MODES, MODE_GROUPS };
