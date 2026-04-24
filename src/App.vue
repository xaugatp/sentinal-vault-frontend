<template>
  <RouterView />
  <ToastContainer />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/common/ToastContainer.vue'
import { useThemeStore } from '@/stores/themeStore'

useThemeStore() // Initialize theme
</script>