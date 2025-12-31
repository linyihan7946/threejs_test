import * as THREE from 'three'

export class CameraManager {
    private camera: THREE.PerspectiveCamera
    private defaultPosition: THREE.Vector3
    private defaultLookAt: THREE.Vector3
    private defaultFov: number

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera
        this.defaultPosition = camera.position.clone()
        this.defaultLookAt = new THREE.Vector3(0, 0, 0)
        this.defaultFov = camera.fov
    }

    /**
     * 重置相机到默认位置和视角
     */
    public reset(): void {
        this.camera.position.copy(this.defaultPosition)
        this.camera.lookAt(this.defaultLookAt)
        this.camera.fov = this.defaultFov
        this.camera.updateProjectionMatrix()
    }

    /**
     * 设置相机默认位置
     */
    public setDefaultPosition(position: THREE.Vector3): void {
        this.defaultPosition.copy(position)
    }

    /**
     * 设置相机默认看向的目标点
     */
    public setDefaultLookAt(target: THREE.Vector3): void {
        this.defaultLookAt.copy(target)
    }

    /**
     * 设置相机默认视野角度
     */
    public setDefaultFov(fov: number): void {
        this.defaultFov = fov
    }

    /**
     * 移动相机到指定位置
     */
    public moveTo(position: THREE.Vector3, lookAt: THREE.Vector3 = this.defaultLookAt): void {
        this.camera.position.copy(position)
        this.camera.lookAt(lookAt)
        this.camera.updateProjectionMatrix()
    }

    /**
     * 调整相机视野角度
     */
    public setFov(fov: number): void {
        this.camera.fov = Math.max(1, Math.min(179, fov))
        this.camera.updateProjectionMatrix()
    }

    /**
     * 放大视野（减小FOV）
     */
    public zoomIn(amount: number = 5): void {
        this.setFov(this.camera.fov - amount)
    }

    /**
     * 缩小视野（增大FOV）
     */
    public zoomOut(amount: number = 5): void {
        this.setFov(this.camera.fov + amount)
    }

    /**
     * 围绕目标点旋转相机
     */
    public rotateAroundTarget(angleX: number, angleY: number, target: THREE.Vector3 = this.defaultLookAt): void {
        const offset = this.camera.position.clone().sub(target)
        
        // 绕Y轴旋转
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleY)
        // 绕X轴旋转（限制垂直旋转范围）
        offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), angleX)
        
        this.camera.position.copy(target).add(offset)
        this.camera.lookAt(target)
    }

    /**
     * 设置相机朝向
     */
    public lookAt(target: THREE.Vector3): void {
        this.camera.lookAt(target)
    }

    /**
     * 获取相机当前位置
     */
    public getPosition(): THREE.Vector3 {
        return this.camera.position.clone()
    }

    /**
     * 获取相机当前视野角度
     */
    public getFov(): number {
        return this.camera.fov
    }

    /**
     * 检查相机是否移动
     */
    public hasMoved(comparedTo: THREE.Vector3): boolean {
        return !this.camera.position.equals(comparedTo)
    }

    /**
     * 检查相机是否旋转
     */
    public hasRotated(comparedTo: THREE.Quaternion): boolean {
        return !this.camera.quaternion.equals(comparedTo)
    }
}
