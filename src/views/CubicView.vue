<template>
  <div class="cubic-page">
    <div id="three-container"></div>

    <div class="ui-layer">
      <div class="toolbar">
        <button class="tool-btn back" @click="$emit('quit')">← BACK</button>
        <div class="divider"></div>
        
        <div class="colors">
          <div 
            v-for="c in colors" 
            :key="c" 
            :class="['color-dot', selectedColor === c && !isDeleteMode ? 'active' : '']"
            :style="{ backgroundColor: c, borderColor: c === '#ffffff' ? '#ccc' : c }"
            @click="$emit('switchColor', c)"
          ></div>
        </div>

        <div class="divider"></div>

        <button :class="['tool-btn', isDeleteMode ? 'active' : '']" @click="$emit('toggleDelete')">🗑️</button>
        <button :class="['tool-btn', isSliceMode ? 'active' : '']" @click="$emit('toggleSlice')">🔪</button>
        <button class="tool-btn" @click="$emit('clear')">🔄</button>
      </div>

      <div class="view-bar">
        <button v-for="v in views" :key="v.key" :class="['view-btn', localView === v.key ? 'active' : '']" @click="handleView(v.key)">{{ v.label }}</button>
      </div>

      <div v-if="isSliceMode" class="slice-panel">
        <div class="slice-row">
          <span>位置</span>
          <input type="range" min="-10" max="15" step="0.5" :value="sliceConfig.constant" @input="updateSlice('constant', $event)">
        </div>
        <div class="slice-row">
          <span>X轴</span>
          <input type="range" min="-1" max="1" step="0.1" :value="sliceConfig.x" @input="updateSlice('x', $event)">
        </div>
        <div class="slice-row">
          <span>Y轴</span>
          <input type="range" min="-1" max="1" step="0.1" :value="sliceConfig.y" @input="updateSlice('y', $event)">
        </div>
        <div class="slice-row">
          <span>Z轴</span>
          <input type="range" min="-1" max="1" step="0.1" :value="sliceConfig.z" @input="updateSlice('z', $event)">
        </div>
        <button class="reset-btn" @click="$emit('resetSlice')">重置切面</button>
      </div>

      <div v-else class="tip">点击地面放置，点击方块叠加</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  colors: Array,
  selectedColor: String,
  isDeleteMode: Boolean,
  isSliceMode: Boolean,
  sliceConfig: Object
})

const emit = defineEmits(['quit', 'switchColor', 'toggleDelete', 'toggleSlice', 'clear', 'setView', 'updateSlice', 'resetSlice'])

const views = [
  { key: 'front', label: '正' },
  { key: 'back', label: '后' },
  { key: 'left', label: '左' },
  { key: 'right', label: '右' },
  { key: 'top', label: '俯' },
  { key: 'iso', label: '轴' }
]

const localView = ref('iso')

function handleView(key) {
  localView.value = key
  emit('setView', key)
}

function updateSlice(key, event) {
  const newConfig = { ...props.sliceConfig }
  newConfig[key] = parseFloat(event.target.value)
  emit('updateSlice', newConfig)
}
</script>

<style scoped>
.cubic-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

#three-container {
  width: 100%;
  height: 100%;
  background: #f5f5f7;
}

.ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  padding-top: max(54px, calc(env(safe-area-inset-top) + 10px));
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.ui-layer > * { pointer-events: auto; }

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tool-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 14px;
  font-weight: 600;
  color: #333;
  transition: all 0.15s;
}

.tool-btn.back {
  color: #af52de;
  font-size: 13px;
}

.tool-btn.active {
  background: #007aff;
  color: #fff;
}

.tool-btn:active { transform: scale(0.95); }

.divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
}

.colors {
  display: flex;
  gap: 8px;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.2s;
}

.color-dot:active { transform: scale(0.9); }

.color-dot.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.4);
}

.view-bar {
  display: flex;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.view-btn {
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: all 0.15s;
}

.view-btn.active {
  background: #007aff;
  color: #fff;
}

.view-btn:active { transform: scale(0.95); }

.slice-panel {
  padding: 14px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 280px;
}

.slice-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.slice-row span { width: 40px; text-align: right; }

.slice-row input {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.slice-row input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007aff;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.reset-btn {
  width: 100%;
  height: 32px;
  margin-top: 6px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 13px;
  font-weight: 600;
  color: #666;
}

.tip {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 13px;
  color: #fff;
}
</style>
