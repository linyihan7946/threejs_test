<template>
  <div ref="container" class="three-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ThreejsUtils } from '../core/ThreejsUtils'

const container = ref<HTMLElement | null>(null)
let threejsUtils: ThreejsUtils | null = null

onMounted(() => {
  if (container.value) {
    threejsUtils = new ThreejsUtils(container.value)
    threejsUtils.init()
  }
})

onBeforeUnmount(() => {
  threejsUtils?.dispose()
})
</script>

<style scoped>
.three-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 0;
}
</style>
