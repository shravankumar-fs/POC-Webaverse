import * as THREE from 'three';
import { EnvironmentManager } from './EnvironmentManager';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GUI } from 'dat.gui';

let envManager = new EnvironmentManager();
let scene = envManager.scene;
let renderer = envManager.renderer;
let camera = envManager.camera;

let lights: THREE.PointLight[] = [];

for (let i = 0; i < 2; i++) {
  const light = new THREE.PointLight(0xdffff0, 4);
  light.castShadow = true;
  light.shadow.bias = -0.003;
  light.shadow.mapSize.height = 2048;
  light.shadow.mapSize.width = 2048;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 2000;
  scene.add(light);
  lights.push(light);
}

let lightx = 1000,
  lighty = 800,
  lightz = 800;
lights[0].intensity = 1.5;
lights[0].position.set(0, 180, 0);
// lights[1].position.set(-lightx, lighty / 4, 0);
lights[1].position.set(lightx, lighty / 2, 0);
// lights[0].intensity = 2;
// lights[1].intensity = 2;

let spotLights: THREE.SpotLight[] = [];
for (let i = 0; i < 2; i++) {
  const light = new THREE.SpotLight(i % 2 ? 0xffff10 : 0x10ffff, 3, 1000, 1, 0);
  light.castShadow = true;
  light.shadow.bias = -0.003;
  light.shadow.mapSize.height = 2048;
  light.shadow.mapSize.width = 2048;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 2000;
  // scene.add(light);
  spotLights.push(light);

  let spotTarget = new THREE.Object3D();
  spotTarget.position.set(0, 0, 0);
  scene.add(spotTarget);
  light.target = spotTarget;
}

spotLights[0].position.set(0, 200, 400);
spotLights[1].position.set(0, 200, -400);

let lightToggle = {
  lightsOn: true,
  addWindows: false,
};
const gui = new GUI();
gui
  .add(lightToggle, 'lightsOn')
  .name('Its morning')
  .onChange(() => toggleLights());
gui
  .add(lightToggle, 'addWindows')
  .name('Close windows')
  .onChange(() => toggleWindows());
gui.open();

function toggleLights(): void {
  if (lightToggle.lightsOn) {
    lights.forEach((item) => scene.add(item));
    spotLights.forEach((item) => scene.remove(scene.getObjectById(item.id)!));
  } else {
    lights.forEach((item) => scene.remove(scene.getObjectById(item.id)!));
    spotLights.forEach((item) => scene.add(item));
  }
}
function toggleWindows() {
  if (objects[3]) {
    objects[3].visible = !objects[3].visible;
  }
}

// lights[0].decay = 1;
// scene.remove(lights[0]);

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

let velocity = 1;
// scene.add(cubeCamera);
let init = 200;
let dir = -1;
let theta = 0;
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
    item.visible = false;

    const mat = objects[1].material as THREE.MeshStandardMaterial;
    // mat.onBeforeCompile(() => {}, renderer);
    // mat.onBeforeCompile = function (shader) {
    //   //these parameters are for the cubeCamera texture
    //   shader.uniforms.cubeMapSize = { value: new THREE.Vector3(100, 100, 100) };
    //   shader.uniforms.cubeMapPos = { value: new THREE.Vector3(0, 100, 0) };

    //   //replace shader chunks with box projection chunks
    //   shader.vertexShader =
    //     'varying vec3 vWorldPosition;\n' + shader.vertexShader;

    //   shader.vertexShader = shader.vertexShader.replace(
    //     '#include <worldpos_vertex>',
    //     worldposReplace
    //   );

    //   shader.fragmentShader = shader.fragmentShader.replace(
    //     '#include <envmap_physical_pars_fragment>',
    //     envmapPhysicalParsReplace
    //   );
    // };
    mat.side = THREE.DoubleSide;
    mat.metalness = 10;
    mat.roughness = 0;
    mat.color = new THREE.Color(0xffffff);
    mat.envMap = cubeRenderTarget.texture;
    mat.envMapIntensity = 10;
    mat.needsUpdate = true;
    scene.add(sphereMesh);
    sphereMesh.position.set(0, init, 0);
    // objects[0].visible = false;
  }
  if (objects[3]) {
    sphereMesh.position.y += 9.8 * velocity * dir;
    if (sphereMesh.position.y <= 17) {
      init = (init * 2) / 3;
      dir = 0.1;
      sphereMesh.position.y = init;
      if (init < 60) {
        sphereMesh.position.y = 60;
        velocity = 0;
      }
    } else if (sphereMesh.position.y >= init) {
      dir = -1;
    }
  }
  spotLights[0].target.position.z += Math.cos(theta) * 10;
  spotLights[1].target.position.z += Math.cos(theta) * 10;
  theta += 0.01;

  cubeCamera.update(renderer, scene);
  envManager.render();
}
animate();
