import { ref, Ref } from "vue";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer, Camera, Clock, Object3D, Scene, Vector3, VectorKeyframeTrack, AnimationClip, InterpolateSmooth, LoopOnce, Quaternion, QuaternionKeyframeTrack, Group } from 'three'
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore
import lowPolyTruck from '../assets/low-poly_truck_car_drifter.glb'
// @ts-ignore
import cloudPunkHova from '../assets/cloud_punk_hova.glb'
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
  const gltfLoader = new GLTFLoader()
  
  const { keyboard, useKeyDown, useKeyUp } = useKeyboard()

  const container = new Group();
  // container.position.z = 30
  scene.add(container);

  const xAxis = new Vector3(10, 0, 0);
  const tempCameraVector = new Vector3();
  const tempModelVector = new Vector3();
  
  camera.position.set( 0, 150, 250 );
  
  const cameraOrigin = new Vector3(0, 1.5, 0);
  camera.lookAt(cameraOrigin);
  container.add(camera);
  console.log(container.position)

  const player: Player = {
    uuid: uuidv4().toString(),
    name: name,
    loaded: false,
    speed: ref(1),
    onLoaded: () => {
      container.add(player.vehicle!)

      player.loaded = true;
    },
    animate: (delta) => {
      if(!mixer) return
      _animate(delta)
    }
  }

  const loadAsset = () => {
    gltfLoader.load(cloudPunkHova, (gltf) => {
      const model = gltf.scene
      model.name = player.name

      // model.position.y = 5.4
      // model.scale.set(.133, .133, .133)

      model.scale.set(25, 25, 25)
      model.position.set(-575, -200, 1180)
      model.rotateY(90 * Math.PI / 180)

      player.vehicle = model

      mixer = new AnimationMixer(model)
      for(let animationClip of gltf.animations) {
        // console.log(animationClip)
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
  
  useKeyDown({
    w: [ () => moveX(1) ],
    a: [ () => rotateY(1) ],
    s: [ () => moveX(-1) ],
    d: [ () => rotateY(-1) ],
    shift: [ 
      () => {
        if(player.speed.value !== 2) {
          player.speed.value = 2;
        }
      } 
    ],
    z: [ 
      () => {
        console.log(123321)
      }
    ],
  })

  useKeyUp({
    shift: [ 
      () => {
        if(player.speed.value !== 1) {
          player.speed.value = 1;
        }
      } 
    ],
  })

  const pointCamera = (offset: number) => {
    // Get the X-Z plane in which camera is looking to move the player
    camera.getWorldDirection(tempCameraVector);
    const cameraDirection = tempCameraVector.setY(0).normalize();
    
    // Get the X-Z plane in which player is looking to compare with camera
    player.vehicle!.getWorldDirection(tempModelVector);
    const playerDirection = tempModelVector.setY(0).normalize();

    // Get the angle to x-axis. z component is used to compare if the angle is clockwise or anticlockwise since angleTo returns a positive value
    const cameraAngle = cameraDirection.angleTo(xAxis) * (cameraDirection.z > 0 ? 1 : -1);
    const playerAngle = playerDirection.angleTo(xAxis) * (playerDirection.z > 0 ? 1 : -1);
    
    // Get the angle to rotate the player to face the camera. Clockwise positive
    const angleToRotate = playerAngle - cameraAngle;
    
    // Get the shortest angle from clockwise angle to ensure the player always rotates the shortest angle
    let sanitisedAngle = angleToRotate;
    if(angleToRotate > Math.PI) {
      sanitisedAngle = angleToRotate - 2 * Math.PI
    }
    if(angleToRotate < -Math.PI) {
      sanitisedAngle = angleToRotate + 2 * Math.PI
    }

    console.log(sanitisedAngle)

    // Rotate the model by a tiny value towards the camera direction
    // player.vehicle!.translateX(
    //   Math.max(-0.05, Math.min(sanitisedAngle, 0.05))
    // );
    // container.position.add(cameraDirection.multiplyScalar(0.04));
    // container.position.add(cameraDirection.multiplyScalar(offset));
    camera.lookAt(container.position.clone().add(cameraOrigin));
  }

  const moveX = (offset: 1|-1) => {
    // player.vehicle!.translateX(1.4 * player.speed.value * offset)
    container!.translateZ(1.4 * player.speed.value * -offset)
    pointCamera(offset)
  }
  const rotateY = (offset: 1|-1) => {
    // player.vehicle!.rotateY(.01 * player.speed.value * offset)
    container!.rotateY(.01 * player.speed.value * offset)
    pointCamera(offset)
  }

  const _animate = (delta: number) => {
    mixer.update(delta);

    if(!player.loaded) return;


    
    // camera.lookAt(player.vehicle!.position)
  }

  return player
}