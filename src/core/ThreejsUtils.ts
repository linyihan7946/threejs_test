import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GltfLoader } from './GltfLoader'
import Stats from 'stats.js'
import { SceneOptimizer } from './SceneOptimizer'
// 高斯喷溅
import { Viewer } from '@mkkellogg/gaussian-splats-3d'

export class ThreejsUtils {
    private scene: THREE.Scene = new THREE.Scene()
    private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera()
    private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
    private controls!: OrbitControls
    private cube!: THREE.Mesh
    private sphere!: THREE.Mesh
    private stats!: Stats
    private isDragging: boolean = false
    private sourceTopObject = new THREE.Object3D();
    private optimizedTopObject = new THREE.Object3D();
    // 在 ThreejsUtils 构造函数中
    private viewer!: Viewer;

    private isUseOptimized = false;

    constructor(container: HTMLElement) {
        // 创建场景
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xf0f0f0)
        this.scene.add(this.sourceTopObject);
        this.scene.remove(this.optimizedTopObject);

        // 获取窗口尺寸
        const width = window.innerWidth
        const height = window.innerHeight

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(60, width / height, 10, 1.0E6)
        this.camera.position.z = 5

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(width, height)
        this.renderer.setPixelRatio(window.devicePixelRatio)

        // 设置 canvas 样式为全屏
        this.renderer.domElement.style.position = 'fixed'
        this.renderer.domElement.style.top = '0'
        this.renderer.domElement.style.left = '0'
        this.renderer.domElement.style.width = '100vw'
        this.renderer.domElement.style.height = '100vh'
        this.renderer.domElement.style.zIndex = '1'

        container.appendChild(this.renderer.domElement)

        this.viewer = new Viewer({
          cameraUp: [0, -1, -0.54],
          initialCameraPosition: [-3.15634, -0.16946, -0.51552],
          initialCameraLookAt: [1.52976, 2.27776, 1.65898],
          sphericalHarmonicsDegree: 2,
          threeScene: this.scene,
          threeCamera: this.camera,
          threeRenderer: this.renderer,
        });

        // 创建控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

        // 添加拖动事件监听
        this.setupControlsEvents()

        // 初始化帧率显示
        this.initStats(container)

        // 创建几何体
        this.createMeshes()

        // 添加光源
        this.addLights()

        // 监听窗口大小变化
        window.addEventListener('resize', this.onWindowResize.bind(this))

        // 开始动画循环
        this.animate()
    }

    private setupControlsEvents(): void {
        // 监听控制器开始事件
        this.controls.addEventListener('start', () => {
            this.isDragging = true
            if (this.isUseOptimized) {
              if (this.sourceTopObject.parent) {
                this.sourceTopObject.parent.remove(this.sourceTopObject);
              }
              this.scene.add(this.optimizedTopObject);
            }
            console.log('视图拖动开始')
        })

        // 监听控制器结束事件
        this.controls.addEventListener('end', () => {
            this.isDragging = false
            if (this.isUseOptimized) {
              if (this.optimizedTopObject.parent) {
                this.optimizedTopObject.parent.remove(this.optimizedTopObject);
              }
              this.scene.add(this.sourceTopObject);
            }
            console.log('视图拖动结束')
        })
    }

    // 获取拖动状态的公共方法
    public getIsDragging(): boolean {
        return this.isDragging
    }

    private initStats(container: HTMLElement): void {
        this.stats = new Stats()
        this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom

        // 设置样式
        this.stats.dom.style.position = 'fixed'
        this.stats.dom.style.top = '0'
        this.stats.dom.style.left = '0'
        this.stats.dom.style.zIndex = '100'

        container.appendChild(this.stats.dom)
    }

    /**
     * @Date: 2022-04-29 10:36:24
     * @description: 完全释放Object3D所有的geometry、texture、material
     * @return {*}
     * @author: LinYiHan
     */
    private disposeObject3D(obj: THREE.Object3D, delSelf = false): void {
      if (!obj || obj.traverse === undefined) {
          return;
      }
      // const cssObjectList: CSS2DObject[] = [];
      // 释放内存
      obj.traverse(child => {
          const c = child as THREE.Mesh | THREE.Line;
          if (!c) {
              return;
          }
          // if (child instanceof CSS2DObject) {
          //     cssObjectList.push(child);
          //     return;
          // }
          if (c.geometry) {
              if (c.geometry.dispose) {
                  c.geometry.dispose();
              }
          }
          if (c.material) {
              let materialList: THREE.Material[] = [];
              if (c.material instanceof Array) {
                  materialList = materialList.concat(c.material);
              } else {
                  materialList.push(c.material);
              }

              materialList.forEach((m: THREE.Material) => {
                  if (!m) {
                      return;
                  }
                  const keyList: string[] = [
                      "map",
                      "lightMap",
                      "aoMap",
                      "aoMapIntensity",
                      "emissiveMap",
                      "bumpMap",
                      "normalMap",
                      "displacementMap",
                      "roughnessMap",
                      "metalnessMap",
                      "alphaMap",
                      "envMap",
                  ];
                  keyList.forEach(key => {
                      const material = m as unknown as Record<string, unknown>;
                      if (material[key] && typeof material[key] === 'object' && material[key] !== null && 'dispose' in (material[key] as object)) {
                          (material[key] as { dispose: () => void }).dispose();
                      }
                  });
                  if (m.dispose) {
                      m.dispose();
                  }
              });
          }
      });

      // cssObjectList.reverse().forEach(o => {
      //     o.remove();
      // });

      // 移除子物体
      for (let i: number = obj.children.length - 1; i >= 0; i--) {
          const c = obj.children[i];
          obj.remove(c);
      }
      obj.children.length = 0;

      // 从父物体删除自身
      if (delSelf && obj.parent) {
          obj.parent.remove(obj);
      }
    }

    private createMeshes(): void {
      // const url = "./37room3.ply";
      // const url = "./MT20250416-100556_ID611_OK.ply";// 37楼茶水间（显示不出来）
      // const url = "./room.ply";// 效果不行
      // const url = "./chair.ply";// 有鬼影
      // const url = "./garden_high.ksplat";
      // const url = "https://linyihan-1312729243.cos.ap-guangzhou.myqcloud.com/garden_high.ksplat";
      // this.loadGaussianSplatting(url);


      this.addGltf();
    }





    private addGltf(): void {
      const url = "./场景2-无压缩.glb";
      GltfLoader.Instance.loadGltf(url).then((gltf) => {
          const object = gltf.scene.clone(true);

          const box = new THREE.Box3().setFromObject(object)
          const size = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())
          const moveMatrix = new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z)
          object.applyMatrix4(moveMatrix)
          box.setFromObject(object); box.getCenter(center); box.getSize(size);

          const maxDimension = Math.max(size.x, size.y, size.z)
          const target = new THREE.Vector3(center.x, center.y, center.z);
          const position = target.clone().add(new THREE.Vector3(maxDimension/2, maxDimension/2, -maxDimension/2));
          this.camera.position.copy(position)
          this.camera.up.set(0, 1, 0)
          this.camera.lookAt(target)

          if (this.isUseOptimized) {
            const sceneOptimizer = SceneOptimizer.Instance;
            const newObject = sceneOptimizer.splitMultiMaterialMeshes(object);// 不会破面
            this.disposeObject3D(this.sourceTopObject, false);
            this.sourceTopObject.add(newObject);

            this.disposeObject3D(this.optimizedTopObject, true);
            const optimizedScene = sceneOptimizer.optimizeScene(newObject);
            this.optimizedTopObject.add(optimizedScene);
          } else {
            this.scene.add(object);
          }
      })
    }

    private addLights(): void {
        // // 添加环境光
        // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        // this.scene.add(ambientLight)

        // // 添加方向光
        // const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        // directionalLight.position.set(5, 5, 5)
        // this.scene.add(directionalLight)


        const light = new THREE.HemisphereLight(0xffffff, 0x000000, Math.PI);
        light.position.set(0, 1, 0);// 方向是从左到右，有点从前到后
        this.scene.add(light);
    }

    private onWindowResize(): void {
        const width = window.innerWidth
        const height = window.innerHeight

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
        this.renderer.setPixelRatio(window.devicePixelRatio)
    }

    private animate = (): void => {
        requestAnimationFrame(this.animate)

        // 开始帧率统计
        this.stats.begin()

        // 旋转物体
        // this.cube.rotation.x += 0.01
        // this.cube.rotation.y += 0.01
        // this.sphere.rotation.y += 0.01

        this.controls.update()
        this.renderer.render(this.scene, this.camera)

        // 结束帧率统计
        this.stats.end()
    }

    public resize(width: number, height: number): void {
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
    }

    public dispose(): void {
        window.removeEventListener('resize', this.onWindowResize.bind(this))
        this.renderer.dispose()
    }

    // 添加加载方法
    public loadGaussianSplatting(url: string): void {
      this.viewer.addSplatScene(url, {
        progressiveLoad: false
      }).then(() => {
        this.viewer.start()
      })
    }
}
