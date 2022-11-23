import { onMounted, onUnmounted, reactive } from "vue";

interface PointerState {
  pointerDown: boolean;
  onPointerMove?: (e: PointerEvent) => void;
  reset: Function;
  update: Function;
}

const pointer = reactive<PointerState>({
  pointerDown: false,
  onPointerMove: (e: PointerEvent) => undefined,
  reset: function() {
    this.pointerDown = false
    this.onPointerMove = () => {}
  },
  update: function() {

  },
})

export default function usePointer<PointerState>() {
  const _onPointerUp = (e: PointerEvent) => {
    pointer.pointerDown = false
  }

  const _onPointerMove = (e: PointerEvent) => {
    if(!pointer.pointerDown) return
    pointer.onPointerMove?.(e)
  }

  const _onPointerDown = (e: PointerEvent) => {
    pointer.pointerDown = true
  }

  onMounted(() => {
    document.addEventListener("pointerup", _onPointerUp, false);
    document.addEventListener("pointermove", _onPointerMove, false);
    document.addEventListener("pointerdown", _onPointerDown, false);
  })
  onUnmounted(() => {
    document.removeEventListener("pointerup", _onPointerUp, false);
    document.removeEventListener("pointermove", _onPointerMove, false);
    document.removeEventListener("pointerdown", _onPointerDown, false);

    pointer.reset()
  })

  const usePointerMove = (cb: (e: PointerEvent) => void) => {
    pointer.onPointerMove = cb
  }

  return {pointer, usePointer, usePointerMove}
}
