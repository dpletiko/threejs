import { ref, reactive, onMounted, onUnmounted, Ref } from "vue";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer, Camera, Object3D, Scene, Vector3 } from 'three'
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore
import lowPolyTruck from '../assets/low-poly_truck_car_drifter.glb'
import type { Game } from './useGame';
import useKeyboard from './useKeyboard'

export interface Player {
  readonly uuid: string;
  name: string;
  vehicle?: Vehicle;
  speed: Ref<number>;
  loaded: boolean;
  onLoaded: () => void;
  animate: (delta: number) => void;
}
type Vehicle = Object3D|null

interface PlayerProps {
  name?: string;
  scene: Scene;
  camera: Camera;
}

export default function usePlayer({name = 'Guest', scene, camera}: PlayerProps) {
  let mixer: AnimationMixer
  const { keyboard, useKeyDown, useKeyUp } = useKeyboard()


  const player: Player = {
    uuid: uuidv4().toString(),
    name: name,
    loaded: false,
    speed: ref(1),
    onLoaded: () => {
      player.loaded = true;

      player.vehicle!.rotation.order = "YXZ";
      // camera.rotation.y = 180;	// Camera looks towards the object holding the "stick"

      // player.vehicle!.add(camera)
      scene.add(player.vehicle!)

      // camera.lookAt(player.vehicle!.position)
    },
    animate: (delta) => {
      if(!mixer) return
      _animate(delta)
    }
  }

  const loadAsset = () => {
    const gltfLoader = new GLTFLoader()
    gltfLoader.load(lowPolyTruck, (gltf) => {
      const truck = gltf.scene
      truck.name = player.name
      truck.scale.set(.133, .133, .133)
      truck.position.y = 5.4

      // game.scene.add(truck)
      player.vehicle = truck

      mixer = new AnimationMixer(truck)
      for(let animationClip of gltf.animations) {
        console.log(animationClip)
        mixer.clipAction(animationClip).play();
      }

      player.onLoaded()
    }, (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    }, (err) => {
      console.log(err)
    })
  }

  loadAsset()
  
  useKeyDown([
    { key: 'w', fn: () => moveX(1) },
    { key: 'a', fn: () => rotateY(1) },
    { key: 's', fn: () => moveX(-1) },
    { key: 'd', fn: () => rotateY(-1) },
    { 
      key: 'shift', 
      fn: () => {
        if(player.speed.value !== 2) {
          player.speed.value = 2;
        }
      } 
    },
    { key: 'z', fn: () => {
      console.log(1)
      // const relativeCameraOffset = new Vector3(0, 600, 0);
      // const cameraOffset = relativeCameraOffset.applyMatrix4(player.vehicle!.matrixWorld);

      // camera.position.x = cameraOffset.x;
      // camera.position.y = cameraOffset.y;
      // camera.position.z = cameraOffset.z;

      // camera.lookAt(player.vehicle!.position);
    } },
  ])

  useKeyUp([
    { 
      key: 'shift', 
      fn: () => {
        if(player.speed.value !== 1) {
          player.speed.value = 1;
        }
      } 
    },
  ])

  const moveX = (offset: 1|-1) => {
    player.vehicle!.translateX(1.4 * player.speed.value * offset)
  }
  const rotateY = (offset: 1|-1) => {
    player.vehicle!.rotateY(.01 * player.speed.value * offset)
  }

  const deltaUp = (delta: number) => {
    player.vehicle!.translateX((200 * delta))
  }
  const deltaLeft = (delta: number) => {
    player.vehicle!.rotateY(.01)
  }
  const deltaDown = (delta: number) => {
    player.vehicle!.translateX(-(200 * delta))
  }
  const deltaRight = (delta: number) => {
    player.vehicle!.rotateY(-.01)
  }

  const _animate = (delta: number) => {
    mixer.update(delta);

    // const relativeCameraOffset = new Vector3(0, 1000, 0);
    // const cameraOffset = relativeCameraOffset.applyMatrix4(player.vehicle!.matrixWorld);

    // camera.position.x = cameraOffset.x;
    // camera.position.y = cameraOffset.y;
    // camera.position.z = cameraOffset.z;

    // camera.lookAt(player.vehicle!.position);

    // if(keyboard.query('w')) deltaUp(delta)
    // if(keyboard.query('a')) deltaLeft(delta)
    // if(keyboard.query('s')) deltaDown(delta)
    // if(keyboard.query('d')) deltaRight(delta)
  }

  return player
}