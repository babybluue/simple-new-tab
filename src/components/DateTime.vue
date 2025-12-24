<template>
  <div class="py-2">
    <h1 class="mb-20 text-2xl">
      {{ time }}
    </h1>
    <p class="text-2xl font-light tracking-wide text-white/90 md:text-[1.2rem] dark:text-[#213547]/90">
      {{ date }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'

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
