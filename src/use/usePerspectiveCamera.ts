import { onMounted, watch } from "vue";
import { PerspectiveCamera } from 'three'
import useWindowSize from "./useWindowSize";

export const CAMERA_POSITION_Y = 1000

export default function usePerspectiveCamera({ positionY = CAMERA_POSITION_Y }: { positionY?: number }) : PerspectiveCamera {
  const { width, height, aspectRatio } = useWindowSize()
  
  // CAMERA
  const	camera = new PerspectiveCamera(75, aspectRatio.value, 0.1, 20000);
  // camera.position.set(0, positionY, 0);
  // camera.lookAt(game.scene.position);

  watch([width, height], () => {
    camera.aspect = aspectRatio.value
    camera.updateProjectionMatrix()
  })


  onMounted(() => {

  })

  return camera
}
