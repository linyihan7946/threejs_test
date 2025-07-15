import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GltfLoader } from './GltfLoader'
import Stats from 'stats.js'
import { SceneOptimizer } from './SceneOptimizer'

export class ThreejsUtils {
    private scene: THREE.Scene = new THREE.Scene()
    private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera()
    private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
    private controls!: OrbitControls
    private cube!: THREE.Mesh
    private sphere!: THREE.Mesh
    private stats!: Stats

    constructor(container: HTMLElement) {
        // 创建场景
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xf0f0f0)

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

        // 创建控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)

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
        const url = "./场景2.gltf";
        GltfLoader.Instance.loadGltf(url).then((gltf) => {
            const object = gltf.scene.clone(true);
            this.scene.add(object);

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

            const sceneOptimizer = SceneOptimizer.Instance;
            const optimizedScene = sceneOptimizer.optimizeScene(object);
            this.scene.remove(object);
            this.scene.add(optimizedScene);
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
}
