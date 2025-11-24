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
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Load HDR environment and models

  new HDRLoader()
    .setPath('textures/')
    .load('qwantani_night_puresky_8k.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      // model

      const loader = new GLTFLoader().setPath('/');

      // Load landscape
      loader.load('landscape/Landscape-grass.glb', async function (gltf) {
        const model = gltf.scene;
        model.position.x = 0;
        await renderer.compileAsync(model, camera, scene);
        scene.add(model);
      });

      // Load trees
      const treeLoader = new GLTFLoader().setPath('models/tree/');
      treeLoader.load('scene.gltf', async function (gltf) {
        const treeModel = gltf.scene;

        // Add first tree
        treeModel.position.set(-15, 1, 10);
        treeModel.scale.set(0.05, 0.05, 0.05);
        await renderer.compileAsync(treeModel, camera, scene);
        scene.add(treeModel);

        // Add second tree
        const treeModel2 = treeModel.clone();
        treeModel2.position.set(-5, 0.5, 5);
        treeModel2.scale.set(0.06, 0.06, 0.06);
        await renderer.compileAsync(treeModel2, camera, scene);
        scene.add(treeModel2);

        // Add third tree
        const treeModel3 = treeModel.clone();
        treeModel3.position.set(7, 0.5, 4);
        treeModel3.scale.set(0.04, 0.04, 0.04);
        await renderer.compileAsync(treeModel3, camera, scene);
        scene.add(treeModel3);

        // Left Small tree top of hill
        const treeModel4 = treeModel.clone();
        treeModel4.position.set(2, 10, 15);
        treeModel4.scale.set(0.03, 0.03, 0.03);
        await renderer.compileAsync(treeModel4, camera, scene);
        scene.add(treeModel4);

        // Right Small tree top of hill
        const treeModel5 = treeModel.clone();
        treeModel5.position.set(8, 9, 14.5);
        treeModel5.scale.set(0.03, 0.03, 0.03);
        await renderer.compileAsync(treeModel5, camera, scene);
        scene.add(treeModel5);
      });

      // Load teddy
      const teddyLoader = new GLTFLoader().setPath('models/teddy/');
      teddyLoader.load('scene.gltf', async function (gltf) {
        const teddyModel = gltf.scene;
        teddyModel.position.set(2.4, 0.5, -4.2);
        teddyModel.scale.set(0.02, 0.02, 0.02);
        await renderer.compileAsync(teddyModel, camera, scene);
        scene.add(teddyModel);
      });
    });

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
  scene.add(directionalLight);
  directionalLight.position.set(1, 1, 1);

  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  // Orbit controls

  controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 50;

  camera.position.set(0, 5, 10);
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
