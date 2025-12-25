<template>
  <div class="pt-2 text-center">
    <h1 class="mb-2 text-5xl">
      {{ time }}
    </h1>
    <p class="text-2xl font-light tracking-wide md:text-[1.2rem]" style="color: var(--app-text-color-secondary);">
      {{ date }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const time = ref('')
const date = ref('')

const updateTime = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  date.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 1000)
})
</script>
