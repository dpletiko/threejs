<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import Stats from './Stats.vue';
  import useGame from '../use/useGame'

  const game = useGame()

  const canvas = ref<HTMLCanvasElement>()


  // const car = createCar()
  // scene.add(car)


  onMounted(() => {
    console.log(game, game.renderer)
    canvas.value!.appendChild(game.renderer.domElement)

    game.start()
  })
</script>

<template>
  <Stats />
  <div ref="canvas"></div>
</template>
