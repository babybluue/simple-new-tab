<template>
  <!-- icon-only: 纯图标（无卡片背景/边框、无白底容器） -->
  <button
    v-if="iconOnly"
    type="button"
    class="group relative inline-flex h-[96px] w-[96px] cursor-pointer items-center justify-center rounded-[28px] border-0 bg-transparent p-0 transition-transform duration-200 outline-none hover:scale-[1.04] focus-visible:ring-(--app-focus-ring) md:h-[88px] md:w-[88px]"
    :aria-label="title"
    @click="$emit('select')"
  >
    <!-- subtle hover surface (not a white block) -->
    <span
      aria-hidden="true"
      class="bg-app-overlay border-app absolute inset-0 rounded-[28px] border opacity-[0.12] backdrop-blur-sm transition-all duration-200 group-hover:opacity-[0.26] group-hover:shadow-(--app-shadow-xs)"
    />
    <img
      v-if="favicon"
      :src="favicon"
      :alt="`${title} ${t('common.icon')}`"
      class="border-app relative h-[64px] w-[64px] rounded-2xl border object-contain shadow-(--app-shadow-xs) transition-transform duration-200 group-hover:scale-[1.02] md:h-[56px] md:w-[56px]"
      @error="$emit('icon-error', $event)"
    />
    <div
      v-else
      class="border-app text-app-secondary relative flex h-[64px] w-[64px] items-center justify-center rounded-2xl border text-2xl font-bold shadow-(--app-shadow-xs) md:h-[56px] md:w-[56px]"
    >
      {{ fallbackChar }}
    </div>
    <div
      v-if="$slots.actions"
      class="absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
    >
      <slot name="actions" />
    </div>
  </button>

  <!-- default card -->
  <article
    v-else
    class="group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 shadow-(--app-shadow-xs) backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-(--app-shadow-md) md:gap-3 md:p-3.5"
    :style="resolvedStyle"
    @click="$emit('select')"
  >
    <figure
      class="bg-app-overlay border-app flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-(--app-shadow-xs) ring-2 md:h-11 md:w-11"
      style="--tw-ring-color: var(--app-border-color)"
      :aria-label="`${title} ${t('common.icon')}`"
    >
      <img
        v-if="favicon"
        :src="favicon"
        :alt="`${title} ${t('common.icon')}`"
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

import { useI18n } from '@/i18n/composable'

const { t } = useI18n()

const props = defineProps<{
  title: string
  subtitle: string
  favicon?: string
  fallbackChar: string
  cardStyle?: Record<string, string>
  iconOnly?: boolean
}>()

defineEmits<{
  select: []
  'icon-error': [event: Event]
}>()

const resolvedStyle = computed(() => (props.iconOnly ? {} : props.cardStyle || {}))
</script>
