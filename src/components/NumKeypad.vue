<template>
  <div class="keypad card glass-panel">
    <div class="fn-row">
      <button class="k-fn style-skip" @click="$emit('left')">{{ leftText }}</button>
      <button class="k-fn style-clear" @click="$emit('clear')">清空</button>
      <button class="k-fn style-del" @click="$emit('backspace')">退格</button>
    </div>
    
    <div class="grid">
      <button 
        v-for="num in [1,2,3,4,5,6,7,8,9]" 
        :key="num" 
        class="k glass-key" 
        @click="$emit('digit', num)"
      >
        {{ num }}
      </button>
      <button class="k wide glass-key" @click="$emit('digit', 0)">0</button>
      <button class="k confirm wide2 glass-key-confirm" @click="$emit('confirm')">确认</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  leftText: {
    type: String,
    default: '跳过'
  }
})

defineEmits(['digit', 'clear', 'backspace', 'left', 'confirm'])
</script>

<style scoped>
.keypad {
  border-radius: 24px;
  overflow: hidden;
  clip-path: inset(0 0 0 0 round 24px);
  padding: 10px;
  width: 100%;
}

.fn-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

/* === 自动判定逻辑：高度随屏幕高度变化 === */
.k-fn {
  flex: 1;
  /* 高度：最小 45px，理想 9vh（屏幕高度的9%），最大 65px */
  height: clamp(45px, 9vh, 65px); 
  line-height: 1; /* 防止文字垂直偏移 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: clamp(16px, 4vw, 20px); /* 字体也随宽度缩放 */
  font-weight: 900;
  margin: 0;
  color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.style-skip { background: #34c759; border-color: #248a3d; }
.style-clear { background: #ff9500; border-color: #e08600; }
.style-del { background: #ff3b30; border-color: #d63329; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.k {
  width: 100%;
  /* 数字键高度：最小 48px，理想 10vh，最大 70px */
  height: clamp(48px, 10vh, 70px); 
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  /* 字体大小：最小 24px，最大 30px */
  font-size: clamp(24px, 6vw, 30px); 
  font-weight: 900;
  margin: 0;
  color: #000;
}

.k.wide { grid-column: 1 / 2; }
.k.wide2 { grid-column: 2 / 4; }

.glass-key-confirm {
  background: #34c759;
  color: #fff;
  border: none;
  font-size: clamp(22px, 5vw, 28px);
  box-shadow: 0 4px 0 #248a3d;
  border-radius: 11px;
}

.glass-key-confirm:active {
  background: #28a745;
  box-shadow: none;
  transform: translateY(4px);
}
</style>
