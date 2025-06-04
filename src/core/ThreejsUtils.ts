import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class ThreejsUtils{
    static Instance: ThreejsUtils = new ThreejsUtils();

    // 渲染器
    private _renderer: THREE.WebGLRenderer | undefined = undefined;
    public get renderer(): THREE.WebGLRenderer{
        const isUseWebGL2 = true;
        if (this._renderer) {
            return this._renderer;
        } else {
            if (isUseWebGL2) {
                const canvas = document.createElement("canvas");
                let context: any = canvas.getContext("webgl2");
                if (!context) {
                    context = canvas.getContext("webgl"); // 如果不支持WebGL2.0，选择执行WebGL1.0
                }
                this._renderer = new THREE.WebGLRenderer({
                    canvas,
                    context,
                    antialias: true,
                    preserveDrawingBuffer: true,
                    alpha: true,// LYH <MODIFY> 20210304 5G屏截图需要用到这个
                });
            } else {
                this._renderer = new THREE.WebGLRenderer({
                    alpha: true,// LYH <MODIFY> 20210304 5G屏截图需要用到这个
                    antialias: true,
                    preserveDrawingBuffer: true,
                });
            }
    
            this._renderer.shadowMap.enabled = true;
            this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this._renderer.setClearColor(0xffffff);
            this._renderer.outputEncoding = THREE.sRGBEncoding; // ljk.
            this._renderer.domElement.style.cssText = "position:absolute; left:0px; top:0px; width:100%; height:100%";
            return this._renderer;
        }
    }
    public set renderer(value: THREE.WebGLRenderer) {
        this._renderer = value;
    }

    // 场景
    private _scene: THREE.Scene = new THREE.Scene();
    public get scene(): THREE.Scene {
        return this._scene;
    }
    public set scene(value: THREE.Scene) {
        this._scene = value;
    }

    // 相机
    private _camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
    public get camera(): THREE.PerspectiveCamera {
        return this._camera;
    }
    public set camera(value: THREE.PerspectiveCamera) {
        this._camera = value;
    }

    private _isLeftMouseDown: boolean = false;
    public get isLeftMouseDown(): boolean {
        return this._isLeftMouseDown;
    }
    public set isLeftMouseDown(value: boolean) {
        this._isLeftMouseDown = value;
    }

    // 视图控制器
    public controls: OrbitControls | undefined = undefined;

    // 画布的容器
    public div: HTMLElement | undefined = undefined;

    constructor() {
    }

    /**
     * @author: LinYiHan
     * @Date: 2023-05-10 15:27:17
     * @description: 打开全景图
     * @param {string} url
     * @param {PanoramaType} type
     * @return {*}
     */    
    public open(canvas: HTMLElement): void {
        const renderer: THREE.WebGLRenderer = this.renderer;
        const scene: THREE.Scene = this.scene;
        this.div = canvas;
        
        const width: number = canvas.offsetWidth;
        const height: number = canvas.offsetHeight;
        const camera: THREE.PerspectiveCamera = this.camera;
        {
            // 创建渲染器
            renderer.domElement.setAttribute("isWebGLRendererCanvas", "true");
            canvas.appendChild(renderer.domElement);
            renderer.setSize(width, height);
            
            // 创建相机
            const target: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
            camera.fov = 75;
            camera.aspect = width / height;
            camera.near = 0.1;
            camera.far = 1.0E8;
            camera.position.set(0, 0, 1000);
            camera.lookAt(target);
            camera.up.set(0, 1, 0);
            camera.updateProjectionMatrix();
            camera.updateMatrix();
            camera.updateMatrixWorld(true);
            scene.add(camera);

            // 创建控制器
            this.controls = new OrbitControls(camera, renderer.domElement);
            this.controls.target = new THREE.Vector3();// 经验值
            // 禁止平移（好像没什么用）
            this.controls.enablePan = false;
            this.controls.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };

            // 创建几何体
            this.createMesh();
        }

        this.initEventListener();

        this.animate();

        const obj1 = {
            name: "obj1",
            ar: [{
                name: "ar1",
                ar: [1, 2, 3],
            }, {
                name: "ar2",
                ar: [4, 5, 6],
            }, {
                name: "ar3",
                ar: [7, 8, 9],
            }],
        }
        const obj2 = obj1;

        obj1.ar = [{
            name: "ar4",
            ar: [10, 11, 12],
        }, {
            name: "ar5",
            ar: [13, 14, 15],
        }];

        console.log(obj1);
        console.log(obj2);
    }

    private createMesh(): void {
        // 创建一个正方体
        const cubeGeometry = new THREE.BoxGeometry(100, 100, 100);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(-150, 0, 0);
        this.scene.add(cube);

        // 创建一个球体
        const sphereGeometry = new THREE.SphereGeometry(60, 32, 32);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(150, 0, 0);
        this.scene.add(sphere);

        // 添加一个环境光和一个平行光，方便看到物体
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);
    }

    /**
     * @author: LinYiHan
     * @Date: 2023-05-10 15:27:30
     * @description: 关闭全景图
     * @param {*}
     * @return {*}
     */    
    public close(): void {
        this.renderer.dispose();
    }

    /**
     * @author: LinYiHan
     * @Date: 2023-05-10 15:47:44
     * @description: 渲染
     * @param {*}
     * @return {*}
     */    
    private render(): void {
        if (this.controls) {
            this.controls.update();   
        }
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * @author: LinYiHan
     * @Date: 2023-05-10 15:47:51
     * @description: 动画
     * @param {*}
     * @return {*}
     */    
    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }


    private initEventListener(): void {
        const domElement: HTMLElement | undefined = this.div;
        if (!domElement) {
            return;
        }
        domElement.addEventListener( "mousedown", this.onMouseDown.bind(this), false );
        domElement.addEventListener( "mouseup", this.onMouseUp.bind(this), false );
        domElement.addEventListener( "mousemove", this.onMouseMove.bind(this), false );
    }

    private onMouseMove(ev: MouseEvent): void {
        
    }

    private onMouseDown(ev: MouseEvent): void {
        
    }

    private onMouseUp(ev: MouseEvent): void {
        
    }
}