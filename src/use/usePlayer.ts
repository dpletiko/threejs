import { ref, Ref } from "vue";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Matrix4, AnimationMixer, Camera, Clock, Object3D, Scene, Vector3, VectorKeyframeTrack, AnimationClip, InterpolateSmooth, LoopOnce, Quaternion, QuaternionKeyframeTrack } from 'three'
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore
import lowPolyTruck from '../assets/low-poly_truck_car_drifter.glb'
import useKeyboard from './useKeyboard'
import { clamp } from "three/src/math/MathUtils";

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
      
      // player.vehicle!.rotation.order = "YXZ";
      // camera.rotation.y = 180;	// Camera looks towards the object holding the "stick"

      // player.vehicle!.add(camera)
      scene.add(player.vehicle!)

      // camera.lookAt(player.vehicle!.position)

      // pointCameraBehindVehicle()

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

        // camera.userData
        // const relativeCameraOffset = new Vector3(0, 600, 0);
        // const cameraOffset = relativeCameraOffset.applyMatrix4(player.vehicle!.matrixWorld);

        // camera.position.x = cameraOffset.x;
        // camera.position.y = cameraOffset.y;
        // camera.position.z = cameraOffset.z;

        // camera.lookAt(player.vehicle!.position);
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

  const moveX = (offset: 1|-1) => {
    player.vehicle!.translateX(1.4 * player.speed.value * offset)
    camera.position.set(
      player.vehicle!.position.x - 100,
      // player.vehicle!.position.y,
      800,
      player.vehicle!.position.z,
    )

    camera.lookAt(player.vehicle!.position);
  }
  const rotateY = (offset: 1|-1) => {
    player.vehicle!.rotateY(.01 * player.speed.value * offset)
    // camera.position.set(
    //   player.vehicle!.position.x - 100,
    //   // player.vehicle!.position.y,
    //   800,
    //   player.vehicle!.position.z,
    // )

    camera.lookAt(player.vehicle!.position);
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

  const pointCameraBehindVehicle = () => {
    // Create an animation mixer on the rocket model
    camera.userData.mixer = new AnimationMixer(camera);
    // Create an animation from the cameras' current position to behind the rocket
    let track = new VectorKeyframeTrack('.position', [0, 2], [
        camera.position.x, // x 1
        camera.position.y, // y 1
        camera.position.z, // z 1
        player.vehicle!.position.x - 800, // x 2
        500, // y 2
        player.vehicle!.position.z, // z 2
    ], InterpolateSmooth);

    // Create a Quaternion rotation for the "forwards" position on the camera
    let identityRotation = new Quaternion().setFromAxisAngle(new Vector3(-1, 0, 0), .3);

    // Create an animation clip that begins with the cameras' current rotation, and ends on the camera being
    // rotated towards the game space
    let rotationClip = new QuaternionKeyframeTrack('.quaternion', [0, 2], [
        camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w,
        identityRotation.x, identityRotation.y, identityRotation.z, identityRotation.w
    ]);

    // Associate both KeyFrameTracks to an AnimationClip, so they both play at the same time
    const animationClip = new AnimationClip('animateIn', 4, [track, rotationClip]);
    const animationAction = camera.userData.mixer.clipAction(animationClip);
    animationAction.setLoop(LoopOnce, 1);
    animationAction.clampWhenFinished = true;

    camera.userData.clock = new Clock();
    camera.userData.mixer.addEventListener('finished', function () {
      // Make sure the camera is facing in the right direction
      camera.lookAt(new Vector3(0, -500, -1400));
      // Indicate that the rocket has begun moving
      // sceneConfiguration.rocketMoving = true;
    });

    // Play the animation
    camera.userData.mixer.clipAction(animationClip).play();
  }

  const _animate = (delta: number) => {
    mixer.update(delta);

    // const relativeCameraOffset = new Vector3(0, 1000, 0);
    // const cameraOffset = relativeCameraOffset.applyMatrix4(player.vehicle!.matrixWorld);

    // camera.position.x = cameraOffset.x;
    // camera.position.y = cameraOffset.y;
    // camera.position.z = cameraOffset.z;

    // camera.position.x = player.vehicle!.position.x - 1000
    // camera.position.y = player.vehicle!.position.y;
    // camera.position.z = player.vehicle!.position.z;



    if (player.loaded) {
      // camera.userData!.mixer!.update(camera.userData!.clock!.getDelta());
      // camera.lookAt(player.vehicle!.position);
    }

    // if(keyboard.query('w')) deltaUp(delta)w
    // if(keyboard.query('a')) deltaLeft(delta)
    // if(keyboard.query('s')) deltaDown(delta)
    // if(keyboard.query('d')) deltaRight(delta)
  }

  return player
}