import { onMounted, computed, watch } from "vue";
import { OrthographicCamera } from 'three'
import useWindowSize from "./useWindowSize";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";

export const CAMERA_WIDTH = 150;
export const CAMERA_POSITION_Y = 1000

export default function useOrthographicCamera({ positionY = CAMERA_POSITION_Y, cameraWidth = CAMERA_WIDTH	 }: { positionY?: number, cameraWidth?: number }) : OrthographicCamera {
  const { width, height, aspectRatio } = useWindowSize()
  const cameraHeight = computed(() => cameraWidth / aspectRatio.value)
  
  // CAMERA
  // const camera = new OrthographicCamera(
  //   CAMERA_WIDTH / -2, // left
  //   CAMERA_WIDTH / 2, // right
  //   cameraHeight.value / 2, // top
  //   cameraHeight.value / -2, // bottom
  //   0, // near plane
  //   1000 // far plane
  // )
  
  const camera = new OrthographicCamera(
    (-aspectRatio.value * height.value) / 2,
    (aspectRatio.value * height.value) / 2,
    height.value / 2,
    -height.value / 2,
    -1000,
    10000
  )
  
  // TODO: ON CAMERA POS CHANGE -> CONTROLS.UPDATE()

  camera.position.set(0, 10, 0);
  // camera.lookAt(game.scene.position);

  watch([width, height], () => {
    camera.updateProjectionMatrix()
  })


  onMounted(() => {

  })

  return camera
}
