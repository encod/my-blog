<template>
  <!--
    标签组件
    - 传 to：渲染 router-link，可被右键新窗口打开
    - 不传 to：渲染 button，由父组件在 @click 里决定行为
  -->
  <component
    :is="tagComponent"
    v-bind="bindAttrs"
    class="tag"
    :class="[sizeClass, { 'tag-active': active }]"
    @click="handleClick"
  >
    <span>{{ label }}</span>
    <span v-if="count" class="tag-count">{{ count }}</span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  /** 标签名 */
  label: {
    type: String,
    required: true
  },
  /** 文章数，0 表示不显示 */
  count: {
    type: Number,
    default: 0
  },
  /** 是否处于选中状态 */
  active: {
    type: Boolean,
    default: false
  },
  /** 尺寸：sm 用于卡片，md 用于标签列表 */
  size: {
    type: String,
    default: 'md'
  },
  /** 跳转目标，传了就渲染成链接 */
  to: {
    type: [String, Object],
    default: null
  }
})

/**
 * 事件：click
 * 第一个参数是原生事件对象，这样父组件写 @click.stop 才能正确阻止冒泡
 * （例如卡片内的标签不能触发整卡的跳转）
 */
const emit = defineEmits(['click'])

const tagComponent = computed(() => (props.to ? RouterLink : 'button'))

const bindAttrs = computed(() => (props.to ? { to: props.to } : { type: 'button' }))

const sizeClass = computed(() => (props.size === 'sm' ? 'tag-sm' : 'tag-md'))

function handleClick(event) {
  emit('click', event, props.label)
}
</script>

<style scoped>
/* 移动端没有 hover，用 active:scale 补上按下反馈 */
.tag {
  @apply inline-flex items-center rounded-full border border-slate-200 text-slate-600
         transition duration-200 hover:border-brand-400 hover:text-brand-600 active:scale-95
         dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400;
}

/* 上下内边距留够，移动端才好点 */
.tag-sm {
  @apply px-2.5 py-1 text-[11px];
}

.tag-md {
  @apply px-3 py-1 text-xs;
}

.tag-active {
  @apply border-brand-500 bg-brand-50 text-brand-600
         dark:border-brand-500 dark:bg-brand-500/15 dark:text-brand-400;
}

.tag-count {
  @apply ml-1 text-[11px] opacity-60;
}
</style>
