<template>
  <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <!-- 个人简介 -->
    <section class="card p-5 sm:p-6">
      <div class="flex items-center gap-4">
        <img
          :src="profile.avatar"
          :alt="profile.name"
          class="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-brand-500/20 sm:h-16 sm:w-16"
        />
        <div class="min-w-0">
          <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">{{ profile.name }}</h1>
          <p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{{ profile.title }}</p>
        </div>
      </div>

      <!-- 简介段落 -->
      <div class="mt-5 space-y-3">
        <p
          v-for="(paragraph, index) in profile.bio"
          :key="index"
          class="text-sm leading-relaxed text-slate-600 dark:text-slate-400"
        >
          {{ paragraph }}
        </p>
      </div>

      <!-- 联系方式 -->
      <div class="mt-5 flex flex-wrap gap-3">
        <a
          v-for="contact in contacts"
          :key="contact.label"
          :href="contact.href"
          :target="contact.href.startsWith('mailto:') ? '_self' : '_blank'"
          rel="noopener noreferrer"
          class="contact-link"
        >
          <el-icon :size="14">
            <Message v-if="contact.href.startsWith('mailto:')" />
            <Link v-else />
          </el-icon>
          {{ contact.label }}
        </a>
      </div>
    </section>

    <!-- 技术栈 -->
    <section class="card mt-6 p-5 sm:p-6">
      <h2 class="text-base font-semibold sm:text-lg">技术栈</h2>
      <div class="mt-4 space-y-4">
        <div
          v-for="group in skillGroups"
          :key="group.category"
          class="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
        >
          <span class="shrink-0 text-sm text-slate-500 sm:w-16 dark:text-slate-400">
            {{ group.category }}
          </span>
          <div class="flex flex-wrap gap-2">
            <span v-for="item in group.items" :key="item" class="skill-chip">{{ item }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 学习经历 -->
    <section class="card mt-6 p-5 sm:p-6">
      <h2 class="text-base font-semibold sm:text-lg">学习经历</h2>
      <el-timeline class="mt-5">
        <el-timeline-item
          v-for="item in timeline"
          :key="item.date"
          :timestamp="item.date"
          placement="top"
          type="primary"
        >
          <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ item.title }}</p>
          <p class="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {{ item.desc }}
          </p>
        </el-timeline-item>
      </el-timeline>
    </section>
  </div>
</template>

<script setup>
import { Link, Message } from '@element-plus/icons-vue'
import { contacts, profile, skillGroups, timeline } from '@/data/profile.js'

/**
 * 关于我
 * 内容全部来自 data/profile.js，本文件只负责渲染
 */
</script>

<style scoped>
.contact-link {
  @apply inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs
         text-slate-600 transition hover:border-brand-400 hover:text-brand-600
         dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400;
}

.skill-chip {
  @apply inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600
         dark:bg-slate-800 dark:text-slate-300;
}
</style>
