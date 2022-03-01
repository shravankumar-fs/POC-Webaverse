import * as THREE from 'three';
import { EnvironmentManager } from './EnvironmentManager';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OBB } from 'three/examples/jsm/math/OBB';

let envManager = new EnvironmentManager();
let scene = envManager.scene;
let renderer = envManager.renderer;
let camera = envManager.camera;

let lights: THREE.PointLight[] = [];

for (let i = 0; i < 3; i++) {
  const light = new THREE.PointLight(0xffffff, 1);
  light.castShadow = true;
  light.shadow.bias = -0.003;
  light.shadow.mapSize.height = 512;
  light.shadow.mapSize.width = 512;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 2000;
  scene.add(light);
  lights.push(light);
}

lights[0].position.set(0, 180, 0);
lights[0].intensity = 2;
lights[1].intensity = 1.2;

// lights[0].decay = 1;
// scene.remove(lights[0]);
let lightx = 800,
  lighty = 800,
  lightz = 800;
lights[1].position.set(-lightx, lighty, 0);
lights[2].position.set(-lightx, lighty, 0);
// lights[3].position.set(0, lighty, lightz);
// lights[4].position.set(0, lighty, -lightz);

// let dLight1 = new THREE.SpotLight(0xffffff, 2);
// let dLight2 = new THREE.DirectionalLight(0xffffff);

// dLight1.position.set(200, 200, 0);
// let dLightTarget = new THREE.Object3D();
// dLightTarget.position.set(-200, 0, 0);
// // scene.add(dLightTarget)
// dLight1.target = dLightTarget;
// dLight1.target.updateMatrixWorld();
// camera.add(dLight1);
// scene.add(camera);

// scene.add(dLight1);
// scene.add(new THREE.DirectionalLightHelper(dLight1));

let controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = false;
controls.enablePan = false;

controls.minPolarAngle = Math.PI / 3;
controls.maxPolarAngle = Math.PI / 2.1;
controls.maxDistance = 220;
controls.minDistance = 10;
// scene.add(new THREE.AxesHelper(300));
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
let objects: THREE.Mesh[] = [];
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load(
  'resources/interior.glb',
  function (gltf) {
    // console.log(gltf.scene);

    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.receiveShadow = true;
        m.castShadow = true;
        objects.push(m);
        // if (objects.length == 2) {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.roughness = 2;
        mat.metalness = 0;

        mat.needsUpdate = true;
        // }
      }
      if ((child as THREE.Light).isLight) {
        const l = child as THREE.Light;
        l.castShadow = true;
        l.shadow.bias = -0.003;
        l.shadow.mapSize.width = 2048;
        l.shadow.mapSize.height = 2048;
      }
    });
    gltf.scene.children[0].scale.set(20, 20, 20);
    gltf.scene.children[0].updateMatrix();
    gltf.scene.children[0].receiveShadow = true;
    gltf.scene.children[0].castShadow = true;
    scene.add(gltf.scene.children[0]);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.log(error);
  }
);

let itemUpdated = false;
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', () => envManager.onWindowResize(), false);

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
});
let cubeCamera = new THREE.CubeCamera(1, 10000, cubeRenderTarget);
cubeCamera.position.set(0, 30, 0);
// scene.add(cubeCamera);
let geo = new THREE.SphereBufferGeometry(30, 100, 100);
let mat1 = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  envMap: cubeRenderTarget.texture,
});
geo.computeBoundingBox();
let sphereMesh = new THREE.Mesh(geo, mat1);
sphereMesh.castShadow = true;
sphereMesh.receiveShadow = true;

scene.add(sphereMesh);
sphereMesh.position.set(0, 150, 0);
let velocity = 1;
// scene.add(cubeCamera);
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  cubeCamera.position.y += 0.1;
  if (cubeCamera.position.y >= 100) {
    cubeCamera.position.y = 30;
  }
  // cubeCamera.position.x += 0.1;
  // if (cubeCamera.position.x >= 70) {
  //   cubeCamera.position.x = 0;
  // }
  let item = objects[3];

  if (item && !itemUpdated) {
    itemUpdated = true;
    const material = item.material as THREE.MeshStandardMaterial;
    material.opacity = 0.5;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.needsUpdate = true;

    const mat = objects[1].material as THREE.MeshStandardMaterial;
    // mat.onBeforeCompile(() => {}, renderer);
    mat.side = THREE.DoubleSide;
    mat.metalness = 100;
    mat.roughness = 0;
    mat.color = new THREE.Color(0xffffff);
    mat.envMap = cubeRenderTarget.texture;
    mat.envMapIntensity = 10;
    mat.needsUpdate = true;

    // objects[0].visible = false;
  }
  sphereMesh.position.y -= 0.98 * velocity;
  if (sphereMesh.position.y <= 14) {
    sphereMesh.position.y = 60;
    velocity = 0;
  }
  cubeCamera.update(renderer, scene);
  envManager.render();
}

animate();
