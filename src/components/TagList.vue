<template>
  <!-- 标签列表：侧边栏、移动端抽屉、标签页共用 -->
  <ul class="flex flex-wrap gap-2">
    <li v-for="tag in tags" :key="tag.name">
      <Tag
        :label="tag.name"
        :count="tag.count"
        :active="isActive(tag.name)"
        :to="toOf(tag.name)"
        @click="emit('select', tag.name)"
      />
    </li>
  </ul>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Tag from './Tag.vue'

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  /**
   * 是否允许再次点击已选中的标签来取消筛选
   * 标签页内开启；侧边栏、卡片等入口保持关闭
   */
  toggleable: {
    type: Boolean,
    default: false
  }
})

/** 通知父组件（抽屉场景下用于关闭抽屉） */
const emit = defineEmits(['select'])

const route = useRoute()

/** 当前是否处于该标签的筛选状态 */
function isActive(name) {
  return route.name === 'Tags' && route.query.tag === name
}

/**
 * 跳转目标交给 Tag 渲染成 router-link，
 * 好处是标签可以被右键「在新标签页打开」
 */
function toOf(name) {
  // 已选中且允许切换时，目标为不带 query 的标签页，即取消筛选
  if (props.toggleable && isActive(name)) {
    return { name: 'Tags' }
  }
  return { name: 'Tags', query: { tag: name } }
}
</script>
