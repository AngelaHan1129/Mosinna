<template>
  <div class="min-h-screen">
    <nav
      class="flex items-center justify-between bg-[hsla(282,18%,39%,0.7)] px-8 py-2 text-white"
    >
      <!-- Logo -->
      <router-link to="/" class="flex justify-center">
        <img src="/vision.png" alt="Logo" class="w-[120px]" />
      </router-link>

      <!-- Desktop Navigation -->
      <ul class="hidden md:flex md:gap-8">
        <li v-for="link in navLinks" :key="link.path">
          <router-link
            :to="link.path"
            class="border-b-2 border-white uppercase transition-colors hover:border-[#ffebb7] hover:text-[#ffebb7]"
            :class="{
              'border-[#ffebb7] text-[#ffebb7]': $route.path === link.path
            }"
          >
            {{ link.text }}
          </router-link>
        </li>
      </ul>

      <!-- Mobile Menu Button -->
      <button
        @click="toggleSidebar"
        class="text-3xl md:hidden"
        aria-label="Toggle menu"
      >
        &#9776;
      </button>

      <!-- Mobile Sidebar -->
      <Transition
        enter-active-class="transition-transform duration-300"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-300"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <ul
          v-if="isSidebarVisible"
          class="fixed right-0 top-0 z-50 flex h-full w-[150px] flex-col bg-[hsla(282,18%,39%,0.9)] p-2.5 shadow-[-2px_0_5px_rgba(0,0,0,0.5)]"
        >
          <li class="flex justify-end px-8 py-2.5">
            <button @click="toggleSidebar" class="text-3xl">&#x58;</button>
          </li>
          <li
            v-for="link in navLinks"
            :key="link.path"
            class="w-full p-2.5"
            @click="toggleSidebar"
          >
            <router-link
              :to="link.path"
              class="block w-full text-white no-underline"
            >
              {{ link.text }}
            </router-link>
          </li>
        </ul>
      </Transition>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isSidebarVisible = ref(false)

const navLinks = [
  { path: '/', text: '上傳影片' },
  { path: '/UserReport', text: '結果分析' },
  // { path: '/UserHistory', text: '歷史紀錄' }
]

const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value
}
</script>

<style>
@font-face {
  font-family: 'ttt';
  src: url(/assets/font-size/JasonHandwriting4.woff) format('woff');
}

* {
  margin: 0;
  padding: 0;
  font-family: 'ttt';
  letter-spacing: 3px;
}
</style>
