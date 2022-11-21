import { computed, onMounted, onUnmounted, ref } from "vue";

export default function useWindowResize() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  const aspectRatio = computed(() => width.value / height.value)

  function resize() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  onMounted(() => {
    resize()
    window.addEventListener("resize", resize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", resize);
  });

  return { width, height, aspectRatio };
}
