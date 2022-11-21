import { reactive, onMounted, onUnmounted, computed, watch } from "vue";
import { WebGLRenderer, PerspectiveCamera, AmbientLight, AnimationMixer, Clock, DirectionalLight, DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, RepeatWrapping, Scene, TextureLoader, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// @ts-ignore
import lowPolyTruck from '../assets/low-poly_truck_car_drifter.glb'
import floorTexture from '../assets/wooden-plane.jpg'

import usePlayer, { Player } from "./usePlayer";
import useWindowSize from "./useWindowSize";
import { Renderer } from "three/src/Three";
import useKeyboard from "./useKeyboard";

/* import TrackballControls from 'three-trackballcontrols'
import {
  BloomEffect,
  EffectComposer,
  // GlitchPass,
  EffectPass,
  RenderPass
} from 'postprocessing' */


export interface Game {
  player: Player;
  scene: Scene;
  clock: Clock;
  renderer: Renderer;


  start: () => void;
}

export const CAMERA_POSITION_Y = 1000
const CAMERA_WIDTH = 150;

/*  const camera = new OrthographicCamera(
  cameraWidth / -2, // left
  cameraWidth / 2, // right
  cameraHeight.value / 2, // top
  cameraHeight.value / -2, // bottom
  0, // near plane
  1000 // far plane
) */

export default function useGame() {
  const {keyboard} = useKeyboard()

  const { width, height, aspectRatio } = useWindowSize()
  const cameraHeight = computed(() => CAMERA_WIDTH / aspectRatio.value)
  let mixer: AnimationMixer
  
  const renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(width.value, height.value)
  
  const scene = new Scene()

  // LOADERS
  const gltfLoader = new GLTFLoader()
  const textureLoader = new TextureLoader()
  
  const ambientLight = new AmbientLight(0xffffff, 0.6);
  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(200, 500, 300);

  // CAMERA
  const	camera = new PerspectiveCamera(50, aspectRatio.value, 0.1, 20000);
  camera.rotation.order = "YXZ";

  const game: Game = {
    scene,
    renderer,
    clock: new Clock(),
    
    player: usePlayer({scene, camera}),

    start: () => {
      animate()
    }
  }

  // CONTROLS
  const controls = new OrbitControls(camera, game.renderer.domElement);

  const init = () => {
    game.scene.add(ambientLight);
    game.scene.add(directionalLight); 

    // game.scene.add(camera);
    camera.position.set(0, CAMERA_POSITION_Y, 0);
    camera.lookAt(game.scene.position);
    
    loadGround()
   
    loadAssets();

    setupOrbitControls();
  }

  const setupOrbitControls = () => {
    controls.rotateSpeed = .166
    // How far you can zoom in and out ( OrthographicCamera only )
    // controls.minZoom = 1
    // controls.maxZoom = 3

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;

    // How far you can dolly in and out ( PerspectiveCamera only )
    controls.minDistance  = CAMERA_POSITION_Y * .4
    controls.maxDistance  = CAMERA_POSITION_Y * 1.33

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60
  }

  const loadAssets = () => {
    // gltfLoader.load(lowPolyTruck, (gltf) => {
    //   const truck = gltf.scene
    //   truck.name = `truck`
    //   console.log(truck)
    //   truck.scale.set(.133, .133, .133)
    //   truck.position.y = 5.4
    //   game.scene.add(truck)

    //   // game.player = truck

    //   mixer = new AnimationMixer(truck)
    //   for(let animationClip of gltf.animations) {
    //     console.log(animationClip)
    //     mixer.clipAction(animationClip).play();
    //   }
    // }, (xhr) => {
    //   console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    // }, (err) => {
    //   console.log(err)
    // })
  }

  const loadGround = () => {
    const groundTexture = textureLoader.load(floorTexture, (tx) => {
      console.log('loaded', tx, tx.image)
      tx.needsUpdate = true;
      // tx.offset.set(0, 0);
      // tx.repeat.set(2, 2);
    });
    groundTexture.wrapS = groundTexture.wrapT = RepeatWrapping;
    groundTexture.repeat.set(100, 100);
    groundTexture.anisotropy = 16;
    // groundTexture.encoding = sRGBEncoding;
    // groundTexture.repeat.set(1, 1);
  
    const floorGeometry = new PlaneGeometry(10000, 10000, 100, 100)
    const floorMaterial = new MeshBasicMaterial({ map: groundTexture, side: DoubleSide });
    const floorMesh = new Mesh(floorGeometry, floorMaterial);
    // if you want to use the plane as a floor, you have to rotate it.
    floorMesh.rotation.setFromVector3(new Vector3(Math.PI / 2, 0, Math.PI / 2));
    // floorMesh.receiveShadow = true;
    game.scene.add(floorMesh)
  }

  watch([width, height], () => {
    camera.aspect = aspectRatio.value
    camera.updateProjectionMatrix()
    game.renderer.setSize(width.value, height.value)
  })

  const animate = () => {
    requestAnimationFrame(animate)
    game.renderer.render(game.scene, camera)
    // console.log(controls.getDistance())
    update()
  }

  const update = () => {
    const delta = game.clock.getDelta(); // seconds.
	  const moveDistance = 200 * delta; // 200 pixels per second
	  const rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

    // if(mixer) mixer.update(delta);

    if(game.player.loaded) {
      // var player = scene.getObjectByName(game.player.name);
      // game.player.position.x -= moveDistance
      game.player.animate(delta)
    }

    keyboard.update()

    controls.update()
  }

  onMounted(() => {
    // animate()
  })

  // watch(game.player, (player) => {
    // if(player.loaded) game.scene.add(player.vehicle)
  // })

  init()

  return game
}
