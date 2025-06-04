<template>
  <div ref="container" class="three-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ThreejsUtils } from '../core/ThreejsUtils'

const container = ref<HTMLElement | null>(null)
let threejsUtils: ThreejsUtils | null = null

const handleResize = () => {
  if (!container.value || !threejsUtils) return
  threejsUtils.resize(container.value.clientWidth, container.value.clientHeight)
}

onMounted(() => {
  if (container.value) {
    threejsUtils = new ThreejsUtils(container.value)
    window.addEventListener('resize', handleResize)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  threejsUtils?.dispose()
})
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
