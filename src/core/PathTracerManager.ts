import * as THREE from 'three';
import { WebGLPathTracer } from 'three-gpu-pathtracer';

export class PathTracerManager {
    public pathTracer: WebGLPathTracer;
    private renderer: THREE.WebGLRenderer;
    private isPathTracingEnabled: boolean = false;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // 1. 初始化最新的 WebGLPathTracer
        this.pathTracer = new WebGLPathTracer(renderer);

        // 2. 绑定场景与相机
        // 注意：新版本会自动为场景中的几何体构建 BVH
        this.pathTracer.setScene(scene, camera);

        // 3. 基础配置
        this.setConfig({
            bounces: 3,           // 光线弹射次数
            renderScale: 1.0,     // 渲染缩放，低端显卡可以调为 0.5
            tiles: new THREE.Vector2(2, 2) // 分块渲染，防止高分辨率下浏览器卡死
        });
    }

    /**
     * 配置光追参数
     */
    public setConfig(config: { bounces?: number, renderScale?: number, tiles?: THREE.Vector2 }) {
        if (config.bounces !== undefined) this.pathTracer.bounces = config.bounces;
        if (config.renderScale !== undefined) this.pathTracer.renderScale = config.renderScale;
        if (config.tiles !== undefined) this.pathTracer.tiles.copy(config.tiles);
        this.pathTracer.reset();
    }

    /**
     * 设置相机参数。相机移动后要调用
     */
    public setCamera(camera: THREE.PerspectiveCamera): void {
        this.camera = camera;
        this.pathTracer.setCamera(camera);
    }

    /**
     * 启用光线追踪
     */
    public enable(): void {
        this.isPathTracingEnabled = true;
    }

    /**
     * 禁用光线追踪
     */
    public disable(): void {
        this.isPathTracingEnabled = false;
        this.pathTracer.reset();
    }

    /**
     * 切换光线追踪状态
     */
    public toggle(): void {
        if (this.isPathTracingEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    /**
     * 检查光线追踪是否启用
     */
    public isEnabled(): boolean {
        return this.isPathTracingEnabled;
    }

    /**
     * 设置 HDR 环境图
     */
    public setEnvironment(texture: THREE.Texture): void {
        // 直接修改 scene 即可，WebGLPathTracer 会自动捕获变化
        const scene = this.pathTracer.scene;
        if (scene) {
            scene.environment = texture;
        }

        // 当环境贴图变化时，通常需要重置累积采样
        this.pathTracer.setScene(this.scene, this.camera);
        this.pathTracer.reset();
    }

    /**
     * 每一帧调用的渲染函数
     */
    public update(): void {
        // update() 方法包含了：
        // 1. 监测场景变化并更新加速结构 (BVH)
        // 2. 进行一次光线追踪采样累积
        // 3. 将结果输出到屏幕
        this.pathTracer.renderSample();
    }

    /**
     * 重置累积采样
     * 当你手动改变了物体位置、材质属性或相机参数时调用
     */
    public reset(): void {
        this.pathTracer.reset();
    }

    /**
     * 获取当前渲染状态
     */
    public get status() {
        return {
            samples: Math.floor(this.pathTracer.samples), // 当前采样数
            // isCompiling: this.pathTracer.sceneGenerator.isWorking // 是否正在构建 BVH
        };
    }

    /**
     * 窗口大小调整
     */
    public resize(): void {
        // WebGLPathTracer 会监听 renderer 的大小变化，但手动调用 reset 确保画面不拉伸
        this.pathTracer.reset();
    }

    /**
     * 销毁资源
     */
    public dispose(): void {
        this.pathTracer.dispose();
    }
}
