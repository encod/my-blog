<template>
  <!-- 页面骨架：Header + 路由内容 + Footer，容器宽度交给各页面自己控制 -->
  <div class="flex min-h-screen flex-col">
    <AppHeader />

    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppFooter />

    <el-backtop :right="20" :bottom="24" />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

/**
 * 应用根组件
 * 说明：不再统一包一层 container—首页要放 Hero 和标签侧栏、详情页要放目录，
 * 各页面自带宽度的差异较大，交给页面自己控制更灵活
 */
</script>
