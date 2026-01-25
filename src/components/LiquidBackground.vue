<template>
  <div class="liquid-bg">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>
</template>

<style scoped>
.liquid-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  animation: float 15s infinite ease-in-out;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: rgba(100, 180, 255, 0.5);
  top: -80px;
  left: -60px;
}

.blob-2 {
  width: 250px;
  height: 250px;
  background: rgba(200, 150, 255, 0.4);
  top: 40%;
  right: -50px;
  animation-delay: -5s;
}

.blob-3 {
  width: 280px;
  height: 280px;
  background: rgba(255, 180, 200, 0.4);
  bottom: 5%;
  left: -40px;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -20px) scale(1.05); }
  66% { transform: translate(-15px, 15px) scale(0.95); }
}
</style>
