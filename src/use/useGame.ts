import { reactive, onMounted, onUnmounted, computed, watch } from "vue";
import { WebGLRenderer, PerspectiveCamera, AmbientLight, AnimationMixer, Clock, DirectionalLight, DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, RepeatWrapping, Scene, TextureLoader, Vector3, VectorKeyframeTrack, AnimationClip, InterpolateSmooth, LoopOnce, Quaternion, QuaternionKeyframeTrack, Renderer, OrthographicCamera, AxesHelper, PlaneHelper, Plane, GridHelper, MathUtils } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// @ts-ignore
import lowPolyTruck from '../assets/low-poly_truck_car_drifter.glb'
import floorTexture from '../assets/wooden-plane.jpg'

import usePlayer, { Player } from "./usePlayer";
import useWindowSize from "./useWindowSize";
import useKeyboard from "./useKeyboard";
import useOrthographicCamera from "./useOrthographicCamera";
import usePerspectiveCamera from "./usePerspectiveCamera";
import { Sky } from 'three/examples/jsm/objects/Sky';
// @ts-ignore
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

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

export default function useGame() {
  const {keyboard} = useKeyboard()

  const { width, height, aspectRatio } = useWindowSize()
  let mixer: AnimationMixer
  
  const renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(width.value, height.value)
  
  const scene = new Scene()

  // const sky = new Sky();
  // sky.scale.setScalar(450000);

  const axesHelper = new AxesHelper(5);
  const gridHelper = new GridHelper(200, 10, 0xffffff, 0xffffff);

  // LOADERS
  const textureLoader = new TextureLoader()
  
  const ambientLight = new AmbientLight(0xffffff, 0.6);
  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(200, 500, 300);

  // CAMERA
  // const	camera = useOrthographicCamera({})
  const	camera = usePerspectiveCamera({})

  const game: Game = {
    scene,
    renderer,
    clock: new Clock(),
    
    player: usePlayer({scene, camera}),

    start: () => {
      animate()
    }
  }

  const init = () => {
    game.scene.add(axesHelper);
    game.scene.add(gridHelper); 

    // game.scene.add(sky);
    game.scene.add(ambientLight);
    game.scene.add(directionalLight); 

    // camera.lookAt(game.scene.position);
    
    loadGround()

    initSky()
   
    // setupOrbitControls();
  }

  const setupOrbitControls = () => {
    // CONTROLS
    const controls = new OrbitControls(camera, game.renderer.domElement);

    controls.rotateSpeed = .166
    // How far you can zoom in and out ( OrthographicCamera only )
    if(camera instanceof OrthographicCamera) {
      controls.minZoom = 1
      controls.maxZoom = 3
    }

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;

    // How far you can dolly in and out ( PerspectiveCamera only )
    if(camera instanceof PerspectiveCamera) {
      // controls.minDistance  = (camera as PerspectiveCamera).position.y * .4
      controls.minDistance  = 1000 * .4
      // controls.maxDistance  = (camera as PerspectiveCamera).position.y * 1.33
      controls.maxDistance  = 1000 * 1.33
    }

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60
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
    floorMesh.receiveShadow = true;
    game.scene.add(floorMesh)
  }

  watch([width, height], () => {
    game.renderer.setSize(width.value, height.value)
  })

  const animate = () => {
    requestAnimationFrame(animate)
    // console.log(controls.getDistance())
    update()
    game.renderer.render(game.scene, camera)
  }

  const update = () => {
    const delta = game.clock.getDelta(); // seconds.
    // if(mixer) mixer.update(delta);

    keyboard.update()
   
    if(game.player.loaded) {
      // var player = scene.getObjectByName(game.player.name);
      // game.player.position.x -= moveDistance
      game.player.animate(delta)
      // camera.lookAt(game.player.vehicle!.position);
    }

    // controls.update()
  }

  onMounted(() => {
    // animate()
  })

  // watch(game.player, (player) => {
    // if(player.loaded) game.scene.add(player.vehicle)
  // })

  const initSky = () => {

    // Add Sky
    const sky = new Sky();
    sky.scale.setScalar( 450000 );
    game.scene.add( sky );

    const sun = new Vector3();

    /// GUI
    const effectController = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: .002,
      mieDirectionalG: .7,
      elevation: .3,
      azimuth: 180,
      exposure: renderer.toneMappingExposure
    };

    function guiChanged() {
      const uniforms = sky.material.uniforms;
      uniforms[ 'turbidity' ].value = effectController.turbidity;
      uniforms[ 'rayleigh' ].value = effectController.rayleigh;
      uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
      uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

      const phi = MathUtils.degToRad( 90 - effectController.elevation );
      const theta = MathUtils.degToRad( effectController.azimuth );

      sun.setFromSphericalCoords( 1, phi, theta );

      uniforms[ 'sunPosition' ].value.copy( sun );

      renderer.toneMappingExposure = effectController.exposure;
      renderer.render( scene, camera );
    }

    // const gui = new GUI();

    // gui.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
    // gui.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
    // gui.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
    // gui.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
    // gui.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
    // gui.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
    // gui.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );

    guiChanged();

  }

  
  init()

  return game
}
