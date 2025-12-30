<template>
  <!-- icon-only: 纯图标（卡片背景跟随主色；保留轻量 hover overlay 和边框层） -->
  <div v-if="iconOnly" class="group inline-flex w-[96px] flex-col items-center md:w-[88px]">
    <button
      type="button"
      class="relative inline-flex h-[96px] w-[96px] cursor-pointer items-center justify-center rounded-[28px] border-0 p-0 transition-transform duration-200 outline-none hover:scale-[1.04] focus-visible:ring-(--app-focus-ring) md:h-[88px] md:w-[88px]"
      :style="iconOnlyButtonStyle"
      :aria-label="title"
      @click="$emit('select')"
    >
      <!-- subtle hover surface (not a white block) -->
      <span
        aria-hidden="true"
        class="bg-app-overlay absolute inset-0 rounded-[28px] opacity-[0.12] backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-[0.22]"
      />
      <!-- border layer: keep border fully visible (don't apply opacity) -->
      <span
        aria-hidden="true"
        class="absolute inset-0 rounded-[28px] border transition-all duration-200 group-hover:shadow-(--app-shadow-xs) group-hover:ring-2"
        :style="iconOnlyBorderStyle"
      />
      <!-- hover/focus tooltip -->
      <div
        class="pointer-events-none absolute -top-2 left-1/2 z-10 w-max max-w-[180px] -translate-x-1/2 -translate-y-2 opacity-0 transition-all duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <div
          class="bg-app-overlay border-app text-app truncate rounded-lg border px-2 py-1 text-[11px] font-medium shadow-(--app-shadow-md) backdrop-blur-xl"
          :style="iconOnlyBorderStyle"
        >
          {{ title }}
        </div>
      </div>
      <img
        v-if="iconSrc"
        :src="iconSrc"
        :alt="`${title} ${t('common.icon')}`"
        class="bg-app-overlay relative h-[64px] w-[64px] rounded-2xl object-contain p-1.5 transition-transform duration-200 group-hover:scale-[1.02] md:h-[56px] md:w-[56px]"
        @error="handleIconError"
      />
      <div
        v-else
        class="bg-app-overlay text-app-secondary relative flex h-[64px] w-[64px] items-center justify-center rounded-2xl text-2xl font-bold shadow-(--app-shadow-xs) md:h-[56px] md:w-[56px]"
      >
        {{ fallbackChar }}
      </div>
    </button>

    <!-- reserve space to avoid covering icon / overlapping neighbors -->
    <div class="mt-2 flex h-6 items-center justify-center">
      <div
        v-if="$slots.actions"
        class="pointer-events-none flex gap-1 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>

  <!-- default card -->
  <article
    v-else
    class="group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 shadow-(--app-shadow-xs) backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-(--app-shadow-md) md:gap-3 md:p-3.5"
    :style="resolvedStyle"
    @click="$emit('select')"
  >
    <figure
      class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl md:h-11 md:w-11"
      :aria-label="`${title} ${t('common.icon')}`"
    >
      <img
        v-if="iconSrc"
        :src="iconSrc"
        :alt="`${title} ${t('common.icon')}`"
        class="bg-app-overlay h-full w-full rounded-xl object-contain p-1.5"
        @error="handleIconError"
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
import { computed, ref, watch } from 'vue'

import { useI18n } from '@/i18n/composable'

const { t } = useI18n()

const props = defineProps<{
  title: string
  subtitle: string
  /** 本地内置 logo（优先展示） */
  logo?: string
  favicon?: string
  fallbackChar: string
  cardStyle?: Record<string, string>
  iconOnly?: boolean
}>()

const emit = defineEmits<{
  select: []
  'icon-error': [event: Event]
}>()

const iconSrc = ref<string | undefined>(props.logo || props.favicon)
watch(
  () => [props.logo, props.favicon],
  () => {
    iconSrc.value = props.logo || props.favicon
  }
)

const resolvedStyle = computed(() => (props.iconOnly ? {} : props.cardStyle || {}))

const iconOnlyButtonStyle = computed<Record<string, string>>(() => {
  // icon-only 模式：背景跟随用户主色（来自 buildPrimarySurfaceStyle / primaryColor）
  const background = props.cardStyle?.background || 'var(--primary-surface, var(--primary-color))'
  return { background }
})

const iconOnlyBorderStyle = computed<Record<string, string>>(() => {
  const borderColor = props.cardStyle?.borderColor || 'var(--app-border-color)'
  return {
    borderColor,
    '--tw-ring-color': borderColor,
  }
})

const handleIconError = (e: Event) => {
  // 若本地 logo 加载失败且存在 favicon，则回退到 favicon；否则抛给外部继续处理
  if (props.logo && props.favicon && iconSrc.value !== props.favicon) {
    iconSrc.value = props.favicon
    return
  }
  emit('icon-error', e)
}
</script>
