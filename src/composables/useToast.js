import { ref } from 'vue'

export function useToast() {
  const show = ref(false)
  const message = ref('')
  let timer = null

  function showToast(msg, duration = 1000) {
    message.value = msg
    show.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      show.value = false
    }, duration)
  }

  return { show, message, showToast }
}
