import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, controls;

init();

function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e); // Dark space background

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(4, 2.5, 4);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Add axes helper (required)
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Create Grogu (Baby Yoda)
  createGrogu();

  // Create ground
  createGround();

  // Add lights (required: different lights)
  addLights();

  // Orbit controls (required)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 2;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI / 1.5; // Limit camera from going too low

  camera.lookAt(new THREE.Vector3(0, 1.2, 0));
}

// Create Grogu (Baby Yoda) using different geometries
function createGrogu() {
  // Grogu's iconic green skin color
  const skinMaterial = new THREE.MeshPhongMaterial({
    color: 0x8fbc8f,
    shininess: 30,
  });

  const darkSkinMaterial = new THREE.MeshPhongMaterial({
    color: 0x6b8e6b,
    shininess: 20,
  });

  // GEOMETRY 1: SphereGeometry - Head and Body

  // Head (large round head)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 32, 32),
    skinMaterial,
  );
  head.position.y = 1.5;
  head.scale.y = 0.9; // Slightly flatten
  head.castShadow = true;
  head.receiveShadow = true;
  scene.add(head);

  // Body (smaller, rounder)
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 32, 32),
    new THREE.MeshPhongMaterial({
      color: 0x8b7355, // Brown robe color
      shininess: 10,
    }),
  );
  body.position.y = 0.6;
  body.scale.y = 1.2;
  body.castShadow = true;
  body.receiveShadow = true;
  scene.add(body);

  // GEOMETRY 2: ConeGeometry - Ears (the iconic big ears!)
  const earMaterial = new THREE.MeshPhongMaterial({
    color: 0x8fbc8f,
    shininess: 20,
  });

  // Left ear - pointing to the LEFT (outward)
  const leftEar = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.5, 16),
    earMaterial,
  );
  leftEar.position.set(-0.65, 1.7, 0);
  leftEar.rotation.z = Math.PI / 2; // Point LEFT (tip outward)
  leftEar.rotation.y = -Math.PI / 6; // Slight angle back
  leftEar.scale.set(1.2, 1, 0.5); // Make it flatter
  leftEar.castShadow = true;
  scene.add(leftEar);

  // Right ear - pointing to the RIGHT (outward)
  const rightEar = new THREE.Mesh(
    new THREE.ConeGeometry(0.15, 0.5, 16),
    earMaterial,
  );
  rightEar.position.set(0.65, 1.7, 0);
  rightEar.rotation.z = -Math.PI / 2; // Point RIGHT (tip outward)
  rightEar.rotation.y = Math.PI / 6; // Slight angle back
  rightEar.scale.set(1.2, 1, 0.5); // Make it flatter
  rightEar.castShadow = true;
  scene.add(rightEar);

  // Inner ears (darker) - LEFT
  const innerEarLeft = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.3, 16),
    darkSkinMaterial,
  );
  innerEarLeft.position.set(-0.7, 1.7, 0);
  innerEarLeft.rotation.z = Math.PI / 2; // Point LEFT (tip outward)
  innerEarLeft.rotation.y = -Math.PI / 6; // Match outer ear angle
  innerEarLeft.scale.set(1.2, 1, 0.4);
  scene.add(innerEarLeft);

  // Inner ears (darker) - RIGHT
  const innerEarRight = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.3, 16),
    darkSkinMaterial,
  );
  innerEarRight.position.set(0.7, 1.7, 0);
  innerEarRight.rotation.z = -Math.PI / 2; // Point RIGHT (tip outward)
  innerEarRight.rotation.y = Math.PI / 6; // Match outer ear angle
  innerEarRight.scale.set(1.2, 1, 0.4);
  scene.add(innerEarRight);

  // Eyes (large, round, cute)
  const eyeWhiteMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 100,
  });
  const eyeBlackMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.2,
  });

  // Left eye white
  const leftEyeWhite = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    eyeWhiteMaterial,
  );
  leftEyeWhite.position.set(-0.2, 1.6, 0.5);
  leftEyeWhite.scale.z = 0.5;
  scene.add(leftEyeWhite);

  // Right eye white
  const rightEyeWhite = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    eyeWhiteMaterial,
  );
  rightEyeWhite.position.set(0.2, 1.6, 0.5);
  rightEyeWhite.scale.z = 0.5;
  scene.add(rightEyeWhite);

  // Left pupil
  const leftPupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    eyeBlackMaterial,
  );
  leftPupil.position.set(-0.2, 1.6, 0.62);
  scene.add(leftPupil);

  // Right pupil
  const rightPupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    eyeBlackMaterial,
  );
  rightPupil.position.set(0.2, 1.6, 0.62);
  scene.add(rightPupil);

  // Tiny nose (small sphere)
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 16),
    darkSkinMaterial,
  );
  nose.position.set(0, 1.45, 0.58);
  scene.add(nose);

  // Mouth (small curved line made with tiny spheres)
  const mouthMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.8,
  });

  for (let i = 0; i < 5; i++) {
    const mouthPart = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 8, 8),
      mouthMaterial,
    );
    const angle = (i - 2) * 0.15;
    mouthPart.position.set(angle * 0.3, 1.3, 0.57);
    scene.add(mouthPart);
  }

  // GEOMETRY 3: CylinderGeometry - Arms and Collar

  // Collar/Neck
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 0.15, 32),
    new THREE.MeshPhongMaterial({
      color: 0x6b5442,
      shininess: 5,
    }),
  );
  collar.position.y = 1.05;
  collar.castShadow = true;
  scene.add(collar);

  // Left arm
  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.4, 16),
    new THREE.MeshPhongMaterial({
      color: 0x8b7355,
      shininess: 10,
    }),
  );
  leftArm.position.set(-0.4, 0.7, 0);
  leftArm.rotation.z = Math.PI / 4;
  leftArm.castShadow = true;
  scene.add(leftArm);

  // Right arm
  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.4, 16),
    new THREE.MeshPhongMaterial({
      color: 0x8b7355,
      shininess: 10,
    }),
  );
  rightArm.position.set(0.4, 0.7, 0);
  rightArm.rotation.z = -Math.PI / 4;
  rightArm.castShadow = true;
  scene.add(rightArm);

  // Hands (small green spheres)
  const leftHand = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    skinMaterial,
  );
  leftHand.position.set(-0.55, 0.5, 0);
  leftHand.castShadow = true;
  scene.add(leftHand);

  const rightHand = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    skinMaterial,
  );
  rightHand.position.set(0.55, 0.5, 0);
  rightHand.castShadow = true;
  scene.add(rightHand);

  // BONUS: BoxGeometry - Base/Platform (like a Mandalorian ship floor)
  const platformMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    metalness: 0.7,
    roughness: 0.3,
  });
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.1, 1.5),
    platformMaterial,
  );
  platform.position.y = 0.05;
  platform.castShadow = true;
  platform.receiveShadow = true;
  scene.add(platform);

  // Platform details (smaller boxes)
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (Math.abs(i) + Math.abs(j) > 1.5) {
        const detail = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.05, 0.15),
          new THREE.MeshStandardMaterial({
            color: 0x6a6a6a,
            metalness: 0.5,
            roughness: 0.5,
          }),
        );
        detail.position.set(i * 0.5, 0.08, j * 0.5);
        scene.add(detail);
      }
    }
  }
}

// Create ground plane (spaceship floor style)
function createGround() {
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a3e,
    roughness: 0.7,
    metalness: 0.3,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Add grid lines for spaceship floor effect
  const gridHelper = new THREE.GridHelper(20, 20, 0x4a4a6a, 0x3a3a5a);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);
}

// Add different types of lights (required)
function addLights() {
  // 1. Ambient light - soft overall illumination (spaceship ambient)
  const ambientLight = new THREE.AmbientLight(0xb0c4de, 0.5);
  scene.add(ambientLight);

  // 2. Directional light - main light source
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(3, 5, 4);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -5;
  directionalLight.shadow.camera.right = 5;
  directionalLight.shadow.camera.top = 5;
  directionalLight.shadow.camera.bottom = -5;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // 3. Point light - dramatic green accent (Force glow!)
  const pointLight1 = new THREE.PointLight(0x7fff7f, 0.6, 10);
  pointLight1.position.set(-2, 1.5, 2);
  scene.add(pointLight1);

  // 4. Point light - blue accent (spaceship console)
  const pointLight2 = new THREE.PointLight(0x4169e1, 0.4, 8);
  pointLight2.position.set(2, 1, -2);
  scene.add(pointLight2);

  // Optional: Add helpers to visualize the lights
  const pointLightHelper1 = new THREE.PointLightHelper(pointLight1, 0.15);
  scene.add(pointLightHelper1);

  const pointLightHelper2 = new THREE.PointLightHelper(pointLight2, 0.15);
  scene.add(pointLightHelper2);
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
