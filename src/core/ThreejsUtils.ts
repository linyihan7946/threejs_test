import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GltfLoader } from './GltfLoader'
import Stats from 'stats.js'
import { SceneOptimizer } from './SceneOptimizer'
import { MeshGenerator } from './MeshGenerator'
import { LightGenerator } from './LightGenerator'
import { PathTracerManager } from './PathTracerManager'
import { GeometryManager } from './GeometryManager'
import { MaterialManager } from './MaterialManager'
import { RGBELoader } from 'three/examples/jsm/Addons.js'
// 高斯喷溅
// import { Viewer } from '@mkkellogg/gaussian-splats-3d'

export class ThreejsUtils {
    private scene: THREE.Scene = new THREE.Scene()
    private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera()
    private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
    private controls!: OrbitControls
    private stats!: Stats
    private isDragging: boolean = false
    private sourceTopObject = new THREE.Object3D();
    private optimizedTopObject = new THREE.Object3D();
    // 在 ThreejsUtils 构造函数中
    // private viewer!: Viewer;

    private isUseOptimized = false;
    private isUsePathTracerManager = true;
    private pathTracerManager!: PathTracerManager;
    private cameraStationaryTime: number = 0;
    private cameraStationaryThreshold: number = 500;
    private lastCameraPosition: THREE.Vector3 = new THREE.Vector3();
    private lastCameraQuaternion: THREE.Quaternion = new THREE.Quaternion();

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
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;


        // 设置 canvas 样式为全屏
        this.renderer.domElement.style.position = 'fixed'
        this.renderer.domElement.style.top = '0'
        this.renderer.domElement.style.left = '0'
        this.renderer.domElement.style.width = '100vw'
        this.renderer.domElement.style.height = '100vh'
        this.renderer.domElement.style.zIndex = '1'

        container.appendChild(this.renderer.domElement)

        // this.viewer = new Viewer({
        //   cameraUp: [0, -1, -0.54],
        //   initialCameraPosition: [-3.15634, -0.16946, -0.51552],
        //   initialCameraLookAt: [1.52976, 2.27776, 1.65898],
        //   sphericalHarmonicsDegree: 2,
        //   threeScene: this.scene,
        //   threeCamera: this.camera,
        //   threeRenderer: this.renderer,
        // });

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

        // 初始化光线追踪管理器
        this.initPathTracer()

        // 添加环境贴图
        this.addEnvironmentMap()

        // 监听窗口大小变化
        window.addEventListener('resize', this.onWindowResize.bind(this))

        // 开始动画循环
        this.animate()
    }

    private setupControlsEvents(): void {
        // 监听控制器开始事件
        this.controls.addEventListener('start', () => {
            this.isDragging = true
            if (this.isUsePathTracerManager && this.pathTracerManager) {
              this.pathTracerManager.disable()
            }
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
            if (this.isUsePathTracerManager && this.pathTracerManager) {
              this.pathTracerManager.enable()
              this.pathTracerManager.setCamera(this.camera);
            }
            this.cameraStationaryTime = 0
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

    private createMeshes(): void {
      // const url = "./37room3.ply";
      // const url = "./MT20250416-100556_ID611_OK.ply";// 37楼茶水间（显示不出来）
      // const url = "./room.ply";// 效果不行
      // const url = "./chair.ply";// 有鬼影
      // const url = "./garden_high.ksplat";
      // const url = "https://linyihan-1312729243.cos.ap-guangzhou.myqcloud.com/garden_high.ksplat";
      // this.loadGaussianSplatting(url);
      // this.addGltf();

      // 创建地面
      const groundGeometry = GeometryManager.createPlaneGeometry({ width: 10000, height: 10000 })
      const groundMaterial = MaterialManager.createStandardMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 1.0
      })
      const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)
      this.scene.add(groundMesh)

      // // 创建box
      // const boxMesh = MeshGenerator.createBox(1000, 0xff0000)
      // this.scene.add(boxMesh)
      // const matrix = new THREE.Matrix4().makeTranslation(0, 0, 1000)
      // boxMesh.applyMatrix4(matrix)

      // 创建球体
      const sphereGeometry = GeometryManager.createSphereGeometry({ radius: 500 })
      const sphereMaterial = MaterialManager.createPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        transmission: 1,
        thickness: 0.5,
        ior: 1.5,
        // transparent: true,
        // opacity: 0.2,
      })
      const matrix = new THREE.Matrix4().makeTranslation(0, 0, 1000)
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphereMesh.applyMatrix4(matrix)
      this.scene.add(sphereMesh)

      // 移动相机
      const position = new THREE.Vector3(0, -1500, 500);
      this.camera.position.copy(position)
      this.camera.up.set(0, 1, 0)
      this.camera.lookAt(new THREE.Vector3(0, 0, 0))
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
            MeshGenerator.disposeObject3D(this.sourceTopObject, false);
            this.sourceTopObject.add(newObject);

            MeshGenerator.disposeObject3D(this.optimizedTopObject, true);
            const optimizedScene = sceneOptimizer.optimizeScene(newObject);
            this.optimizedTopObject.add(optimizedScene);
          } else {
            this.scene.add(object);
          }
      })
    }

    private addLights(): void {
        // 添加环境光
        const ambientLight = LightGenerator.createAmbientLight(0xffffff, 0.3)
        this.scene.add(ambientLight)

        // 添加矩形光
        const rectAreaLight = LightGenerator.createRectAreaLight(
          0xffffff,
          100,
          1000,
          1000,
          new THREE.Vector3(5000, 5000, 5000),
          new THREE.Vector3(0, 0, 0)
        )
        this.scene.add(rectAreaLight)

        // // 添加点光源
        // const pointLight = LightGenerator.createPointLight(0xffffff, 2, 5000, 1, new THREE.Vector3(2000, 2000, 2000))
        // this.scene.add(pointLight)

        // // 添加方向光
        // const directionalLight = LightGenerator.createDirectionalLight(0xffffff, 1, new THREE.Vector3(0, 0, 5000), new THREE.Vector3(0, 0, 0))
        // this.scene.add(directionalLight)

        // const light = LightGenerator.createHemisphereLight(0xffffff, 0x000000, Math.PI, new THREE.Vector3(0, 1, 0))
        // this.scene.add(light)
    }

    private initPathTracer(): void {
      if (!this.isUsePathTracerManager) {
        return;
      }
      this.pathTracerManager = new PathTracerManager(this.renderer, this.scene, this.camera)
      this.pathTracerManager.setConfig({
          bounces: 3,
          renderScale: 1.0,
          tiles: new THREE.Vector2(2, 2)
      })
      this.lastCameraPosition.copy(this.camera.position)
      this.lastCameraQuaternion.copy(this.camera.quaternion)
    }

    private addEnvironmentMap(): void {
      // 创建一个简单的立方体纹理作为环境贴图
      new RGBELoader().load("./brown_photostudio_02_4k.hdr", (texture) => {
        // 将环境贴图应用到场景
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = texture;
        this.scene.environmentIntensity = 0.1
        if (this.isUsePathTracerManager && this.pathTracerManager) {
          this.pathTracerManager.setEnvironment(texture);
        }
      });
    }

    private onWindowResize(): void {
        const width = window.innerWidth
        const height = window.innerHeight

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
        this.renderer.setPixelRatio(window.devicePixelRatio)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private animate = (currentTime: number = 0): void => {
        requestAnimationFrame(this.animate)

        // 开始帧率统计
        this.stats.begin()

        this.controls.update()

        // 光线追踪
        if (this.isUsePathTracerManager && this.pathTracerManager && this.pathTracerManager.isEnabled()) {
          this.pathTracerManager.update()
        } else {
          this.renderer.render(this.scene, this.camera)
        }

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const url1 = url;
      // this.viewer.addSplatScene(url, {
      //   progressiveLoad: false
      // }).then(() => {
      //   this.viewer.start()
      // })
    }
}
