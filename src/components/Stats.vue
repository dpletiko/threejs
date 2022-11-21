<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import Stats from 'stats.js';

  const statsContainer = ref()
  const stats = reactive<Stats>(new Stats())
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

  // stats.dom.style.position = 'absolute';
  // stats.dom.style.bottom = '0px';
  // stats.dom.style.zIndex = '100';
  
  onMounted(() => {
    requestAnimationFrame(animate);
    statsContainer.value!.appendChild(stats.dom)
  })

  const animate = () => {
    stats.begin()

	  // monitored code goes here

    stats.end()
    requestAnimationFrame(animate)
  }
</script>

<template>
  <div ref="statsContainer"></div>
</template>
