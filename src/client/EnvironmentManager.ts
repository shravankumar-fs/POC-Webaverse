import * as THREE from 'three';
import { BoxBufferGeometry, MeshBasicMaterial } from 'three';

export class EnvironmentManager {
  private _scene!: THREE.Scene;
  private _camera!: THREE.PerspectiveCamera;
  private _renderer!: THREE.WebGLRenderer;

  constructor() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
  }

  public get scene() {
    return this._scene;
  }

  public get camera() {
    return this._camera;
  }
  public get renderer() {
    return this._renderer;
  }

  initScene() {
    this._scene = new THREE.Scene();
    let urls = [
      'resources/background/posx.jpg',
      'resources/background/negx.jpg',
      'resources/background/posy.jpg',
      'resources/background/negy.jpg',
      'resources/background/posz.jpg',
      'resources/background/negz.jpg',
    ];
    let materialArray = urls.map((url) => {
      return new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(url),
        side: THREE.DoubleSide,
      });
    });
    let boxgeo = new THREE.BoxBufferGeometry(2000, 2000, 2000);
    let box = new THREE.Mesh(boxgeo, materialArray);
    box.position.y = 300;
    this._scene.add(box);
  }

  initCamera() {
    this._camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this._camera.position.set(0, 100, 100);
  }

  initRenderer() {
    this._renderer = new THREE.WebGL1Renderer({ alpha: true, antialias: true });
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.physicallyCorrectLights = true;
  }

  onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }
}
