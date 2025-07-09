import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'

export class GltfLoader {
  static Instance: GltfLoader = new GltfLoader();
  private loader: GLTFLoader

  constructor() {
    this.loader = new GLTFLoader()
  }

  /**
   * 加载 GLTF 文件
   * @param gltfUrl GLTF 文件的 URL
   * @returns Promise<GLTF> 加载的 GLTF 对象
   */
  public async loadGltf(gltfUrl: string): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        gltfUrl,
        (gltf) => {
          resolve(gltf)
          console.log("加载gltf完成")
        },
        (xhr) => {
          const progress = (xhr.loaded / xhr.total) * 100
          console.log(`GLTF 加载进度: ${progress}%`)
        },
        (error) => {
          console.error('加载 GLTF 文件时出错:', error)
          reject(error)
        }
      )
    })
  }

  /**
   * 从文件对象加载 GLTF
   * @param file 文件对象
   * @returns Promise<GLTF> 加载的 GLTF 对象
   */
  public async loadGltfFromFile(file: File): Promise<GLTF> {
    const url = URL.createObjectURL(file)
    try {
      const gltf = await this.loadGltf(url)
      URL.revokeObjectURL(url)
      return gltf
    } catch (error) {
      URL.revokeObjectURL(url)
      throw error
    }
  }

  /**
   * 获取模型的所有动画名称
   * @param gltf GLTF 对象
   * @returns 动画名称数组
   */
  public getAnimationNames(gltf: GLTF): string[] {
    if (!gltf.animations || gltf.animations.length === 0) return []
    return gltf.animations.map((clip: THREE.AnimationClip) => clip.name)
  }

  /**
   * 获取模型的边界框
   * @param gltf GLTF 对象
   * @returns 边界框
   */
  public getBoundingBox(gltf: GLTF): THREE.Box3 {
    const box = new THREE.Box3()
    box.setFromObject(gltf.scene)
    return box
  }

  /**
   * 获取模型的中心点
   * @param gltf GLTF 对象
   * @returns 中心点
   */
  public getCenter(gltf: GLTF): THREE.Vector3 {
    const box = this.getBoundingBox(gltf)
    return box.getCenter(new THREE.Vector3())
  }

  /**
   * 获取模型的尺寸
   * @param gltf GLTF 对象
   * @returns 尺寸
   */
  public getSize(gltf: GLTF): THREE.Vector3 {
    const box = this.getBoundingBox(gltf)
    return box.getSize(new THREE.Vector3())
  }
}
