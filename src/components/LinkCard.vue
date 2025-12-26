<template>
  <article
    class="group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:gap-3 md:p-3.5"
    :style="resolvedStyle"
    @click="$emit('select')"
  >
    <figure
      class="bg-app-overlay border-app flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-md ring-2 md:h-11 md:w-11"
      style="--tw-ring-color: var(--app-border-color)"
      :aria-label="`${title} ${$t('common.icon')}`"
    >
      <img
        v-if="favicon"
        :src="favicon"
        :alt="`${title} ${$t('common.icon')}`"
        class="h-full w-full object-cover"
        @error="$emit('icon-error', $event)"
      />
      <div
        v-else
        class="text-app-secondary flex h-full w-full items-center justify-center text-lg font-bold md:text-base"
      >
        {{ fallbackChar }}
      </div>
    </figure>
    <div class="min-w-0 flex-1">
      <h4
        class="text-app mb-1.5 overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap md:mb-1 md:text-[13px]"
      >
        {{ title }}
      </h4>
      <p
        class="text-app-tertiary mb-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap md:mb-0.5 md:text-[11px]"
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
