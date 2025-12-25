<template>
  <article
    class="group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:gap-3 md:p-3.5"
    :style="resolvedStyle"
    @click="$emit('select')"
  >
    <figure
      class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 shadow-md ring-2 ring-white/10 md:h-11 md:w-11 dark:bg-white/15 dark:ring-white/20"
      :aria-label="`${title} 图标`"
    >
      <img
        v-if="favicon"
        :src="favicon"
        :alt="`${title} 图标`"
        class="h-full w-full object-cover"
        @error="$emit('icon-error', $event)"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center text-lg font-bold text-white/90 md:text-base dark:text-[#213547]/90"
      >
        {{ fallbackChar }}
      </div>
    </figure>
    <div class="min-w-0 flex-1">
      <h4
        class="mb-1.5 overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-white/95 md:mb-1 md:text-[13px] dark:text-[#213547]/95"
      >
        {{ title }}
      </h4>
      <p
        class="mb-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap text-white/65 md:mb-0.5 md:text-[11px] dark:text-[#213547]/65"
      >
        {{ subtitle }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="absolute top-3 right-3 flex gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100 md:top-2.5 md:right-2.5"
    >
      <slot name="actions" />
    </div>
  </article>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  title: string
  subtitle: string
  favicon?: string
  fallbackChar: string
  cardStyle?: Record<string, string>
}>()

defineEmits<{
  select: []
  'icon-error': [event: Event]
}>()

const resolvedStyle = computed(() => props.cardStyle || {})
</script>
