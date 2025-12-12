// Three.js Viikko 3 - VR with object grabbing

import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {VRButton} from 'three/addons/webxr/VRButton.js';
import {XRControllerModelFactory} from 'three/addons/webxr/XRControllerModelFactory.js';

let camera, scene, renderer, controls;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

const intersected = [];
let grabbablesGroup;

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

init();

function init() {
  scene = new THREE.Scene();

  // Only grabbable objects go here
  grabbablesGroup = new THREE.Group();
  scene.add(grabbablesGroup);

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

  initVR();

  // Helpers/lights
  scene.add(new THREE.AxesHelper(5));

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // Orbit controls (desktop preview)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1;
  controls.maxDistance = 50;

  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  // Environment + models
  new HDRLoader()
    .setPath('textures/')
    .load('qwantani_night_puresky_8k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;

      const landscapeLoader = new GLTFLoader().setPath('landscape/');
      landscapeLoader.load('Landscape-grass.glb', async (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        await renderer.compileAsync(model, camera, scene);
        scene.add(model);
      });

      const treeLoader = new GLTFLoader().setPath('models/tree/');
      treeLoader.load('scene.gltf', async (gltf) => {
        const base = gltf.scene;

        const addTree = async (pos, scale) => {
          const t = base.clone(true);
          t.position.copy(pos);
          t.scale.setScalar(scale);
          await renderer.compileAsync(t, camera, scene);
          scene.add(t);
        };

        await addTree(new THREE.Vector3(-15, 1, 10), 0.05);
        await addTree(new THREE.Vector3(-5, 0.5, 5), 0.06);
        await addTree(new THREE.Vector3(7, 0.5, 4), 0.04);
        await addTree(new THREE.Vector3(2, 10, 15), 0.03);
        await addTree(new THREE.Vector3(8, 9, 14.5), 0.03);
      });

      const teddyLoader = new GLTFLoader().setPath('models/teddy/');
      teddyLoader.load('scene.gltf', async (gltf) => {
        const teddy = gltf.scene;
        teddy.position.set(1, 0.5, -4.2);
        teddy.scale.set(0.02, 0.02, 0.02);

        await renderer.compileAsync(teddy, camera, scene);

        // ✅ IMPORTANT: add ONLY to grabbablesGroup (NOT scene)
        grabbablesGroup.add(teddy);

        console.log('Teddy added to grabbablesGroup', teddy);
      });
    });

  // ✅ Debug grabbable cube (keep until teddy works)
  const test = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.25, 0.25),
    new THREE.MeshStandardMaterial({color: 0xffffff}),
  );
  test.position.set(0, 1.2, -1.2);
  grabbablesGroup.add(test);

  window.addEventListener('resize', resize, false);
  renderer.setAnimationLoop(animate);
}

function initVR() {
  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelectStart);
  controller1.addEventListener('selectend', onSelectEnd);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelectStart);
  controller2.addEventListener('selectend', onSelectEnd);
  scene.add(controller2);

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1),
  );
  scene.add(controllerGrip1);

  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2),
  );
  scene.add(controllerGrip2);

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);

  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
  line.name = 'rayLine';
  line.scale.z = 6;

  controller1.add(line.clone());
  controller2.add(line.clone());
}

function setEmissiveSafe(object, channel, value) {
  object.traverse?.((child) => {
    const mat = child.material;
    if (!mat) return;
    const mats = Array.isArray(mat) ? mat : [mat];
    for (const m of mats) {
      if (m && m.emissive) m.emissive[channel] = value;
    }
  });
}

// ✅ Manual XR ray (works regardless of Three version)
function getIntersections(controller) {
  tempMatrix.identity().extractRotation(controller.matrixWorld);

  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  return raycaster.intersectObjects(grabbablesGroup.children, true);
}

function findRootInGroup(object, group) {
  let obj = object;
  while (obj && obj !== group) {
    if (obj.parent === group) return obj;
    obj = obj.parent;
  }
  return null;
}

function onSelectStart(event) {
  const controller = event.target;

  console.log('selectstart fired');

  const intersections = getIntersections(controller);
  console.log('hits:', intersections.length, intersections[0]?.object?.name);

  if (intersections.length === 0) return;

  const hit = intersections[0].object;
  const root = findRootInGroup(hit, grabbablesGroup);
  if (!root) return;

  setEmissiveSafe(root, 'b', 1);
  controller.attach(root);
  controller.userData.selected = root;
}

function onSelectEnd(event) {
  const controller = event.target;
  const selected = controller.userData.selected;

  if (!selected) return;

  setEmissiveSafe(selected, 'b', 0);
  grabbablesGroup.attach(selected);
  controller.userData.selected = undefined;
}

function intersectObjects(controller) {
  if (controller.userData.selected !== undefined) return;

  const line = controller.getObjectByName('rayLine');
  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const hit = intersections[0].object;
    const root = findRootInGroup(hit, grabbablesGroup);
    if (!root) return;

    setEmissiveSafe(root, 'r', 1);
    intersected.push(root);

    if (line) line.scale.z = intersections[0].distance;
  } else {
    if (line) line.scale.z = 6;
  }
}

function cleanIntersected() {
  while (intersected.length) {
    const object = intersected.pop();
    setEmissiveSafe(object, 'r', 0);
  }
}

function animate() {
  if (!renderer.xr.isPresenting) controls.update();

  cleanIntersected();
  if (controller1) intersectObjects(controller1);
  if (controller2) intersectObjects(controller2);

  renderer.render(scene, camera);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// window.addEventListener('resize', resize, false);
// renderer.setAnimationLoop(animate);
