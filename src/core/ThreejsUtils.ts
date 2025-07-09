import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export class ThreejsUtils {
    private scene: THREE.Scene = new THREE.Scene()
    private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera()
    private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
    private controls!: OrbitControls
    private cube!: THREE.Mesh
    private sphere!: THREE.Mesh

    constructor(container: HTMLElement) {
        // 创建场景
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xf0f0f0)

        // 获取窗口尺寸
        const width = window.innerWidth
        const height = window.innerHeight

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
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
        this.controls.enableDamping = true

        // 创建几何体
        this.createMeshes()

        // 添加光源
        this.addLights()

        // 监听窗口大小变化
        window.addEventListener('resize', this.onWindowResize.bind(this))

        // 开始动画循环
        this.animate()
    }

    private createMeshes(): void {
        // 创建立方体
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
        this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
        this.cube.position.x = -2
        this.scene.add(this.cube)

        // 创建球体
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff })
        this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        this.sphere.position.x = 2
        this.scene.add(this.sphere)
    }

    private addLights(): void {
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)

        // 添加方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 5, 5)
        this.scene.add(directionalLight)
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

        // 旋转物体
        this.cube.rotation.x += 0.01
        this.cube.rotation.y += 0.01
        this.sphere.rotation.y += 0.01

        this.controls.update()
        this.renderer.render(this.scene, this.camera)
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
