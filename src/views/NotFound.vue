<template>
  <!-- 404 兜底页：匹配不到任何路由时展示 -->
  <div class="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p class="text-6xl font-bold text-brand-500">404</p>
    <h1 class="mt-4 text-xl font-semibold">页面走丢了</h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
      你访问的地址不存在，可能已删除或链接有误
    </p>
    <router-link to="/" class="mt-6">
      <el-button type="primary" round>返回首页</el-button>
    </router-link>
  </div>
</template>

<script setup></script>
