<template>
  <Teleport to="body">
    <div v-if="show" class="toast-wrap">
      <div class="toast-content">{{ message }}</div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: Boolean,
  message: String
})
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
  pointer-events: none;
}

.toast-content {
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #fff;
  padding: 14px 28px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
}
</style>
