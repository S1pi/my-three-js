import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';

let camera, scene, renderer, cube, controls;

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(3, 3, 3);
  const material = new THREE.MeshPhongMaterial({color: 0x00ff00});
  cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  // model

  new HDRLoader()
    .setPath('textures/')
    .load('rogland_moonlit_night_1k.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      // model

      const loader = new GLTFLoader().setPath('/');

      loader.load(e'landscape/landscap.gltf', async function (gltf) {
        const model = gltf.scene;

        // wait until the model can be added to the scene without blocking due to shader compilation
        model.position.x = -20;
        await renderer.compileAsync(model, camera, scene);
        scene.add(model);
      });
    });

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
  scene.add(directionalLight);
  directionalLight.position.set(1, 1, 1);

  const light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);

  // controls

  controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window); // optional

  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 1;
  controls.maxDistance = 10;

  camera.position.set(4, 4, 4);
  camera.lookAt(axesHelper.position);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function animate() {
  renderer.render(scene, camera);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize, false);
renderer.setAnimationLoop(animate);
