<template>
  <div class="mode-selector">
    <template v-for="(group, groupKey) in modeGroups" :key="groupKey">
      <div class="row-label" v-if="group.label">{{ group.label }}</div>
      
      <div v-if="group.hasCustomEntry" class="custom-entry">
        <button class="entry-btn" @click="$emit('selectDivisor')">
          进入除数选择模式
        </button>
      </div>
      
      <div class="mode-row" v-else>
        <button 
          v-for="modeKey in group.modes" 
          :key="modeKey"
          :class="['mode-btn', currentMode === modeKey ? 'active' : '']" 
          @click="$emit('select', modeKey)"
        >
          {{ getModeConfig(modeKey).name }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { getModeConfig } from '@/config/gameModes'

defineProps({
  modeGroups: Object,
  currentMode: String
})

defineEmits(['select', 'selectDivisor'])
</script>

<style scoped>
.row-label {
  font-size: 13px;
  font-weight: 700;
  color: #007aff;
  margin: 16px 0 10px 4px;
}

.row-label:first-child {
  margin-top: 0;
}

.mode-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.mode-btn {
  flex: 1 0 28%;
  min-width: 80px;
  padding: 14px 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.mode-btn:active {
  transform: scale(0.97);
}

.mode-btn.active {
  background: linear-gradient(135deg, #007aff 0%, #0066dd 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
}

.custom-entry {
  margin-bottom: 8px;
}

.entry-btn {
  width: 100%;
  height: 50px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #007aff;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.entry-btn:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.8);
}
</style>
