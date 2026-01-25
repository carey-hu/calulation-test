import { ref, onUnmounted } from 'vue'

export function useToast() {
  const show = ref(false)
  const message = ref('')
  let timer = null

  function showToast(msg, duration = 800) {
    // 先清除之前的定时器
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    
    message.value = msg
    show.value = true
    
    timer = setTimeout(() => {
      show.value = false
      message.value = ''
    }, duration)
  }

  function hideToast() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    show.value = false
    message.value = ''
  }

  return { show, message, showToast, hideToast }
}
