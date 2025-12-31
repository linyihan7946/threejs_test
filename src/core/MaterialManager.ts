import * as THREE from 'three'

export interface MaterialConfig {
  color?: number
  opacity?: number
  transparent?: boolean
  wireframe?: boolean
  side?: THREE.Side
  roughness?: number
  metalness?: number
  emissive?: number
  emissiveIntensity?: number
  map?: THREE.Texture
  normalMap?: THREE.Texture
  roughnessMap?: THREE.Texture
  metalnessMap?: THREE.Texture
  emissiveMap?: THREE.Texture
  alphaMap?: THREE.Texture
}

export class MaterialManager {
  private static materialCache: Map<string, THREE.Material> = new Map()
  private static cacheSize: number = 100

  // 基础材质
  static createBasicMaterial(config: Partial<MaterialConfig> = {}): THREE.MeshBasicMaterial {
    const key = this.generateMaterialKey('basic', config)

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshBasicMaterial
    }

    const material = new THREE.MeshBasicMaterial({
      color: config.color || 0xffffff,
      opacity: config.opacity,
      transparent: config.transparent,
      wireframe: config.wireframe,
      side: config.side,
      map: config.map,
      alphaMap: config.alphaMap
    })

    this.cacheMaterial(key, material)
    return material
  }

  // 标准材质（PBR）
  static createStandardMaterial(config: Partial<MaterialConfig> = {}): THREE.MeshStandardMaterial {
    const key = this.generateMaterialKey('standard', config)

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial
    }

    const material = new THREE.MeshStandardMaterial({
      color: config.color || 0xffffff,
      opacity: config.opacity,
      transparent: config.transparent,
      wireframe: config.wireframe,
      side: config.side,
      roughness: config.roughness,
      metalness: config.metalness,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      map: config.map,
      normalMap: config.normalMap,
      roughnessMap: config.roughnessMap,
      metalnessMap: config.metalnessMap,
      emissiveMap: config.emissiveMap,
      alphaMap: config.alphaMap
    })

    this.cacheMaterial(key, material)
    return material
  }

  // 物理材质（更高级的PBR）
  static createPhysicalMaterial(config: Partial<MaterialConfig> = {}): THREE.MeshPhysicalMaterial {
    const key = this.generateMaterialKey('physical', config)

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshPhysicalMaterial
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: config.color || 0xffffff,
      opacity: config.opacity,
      transparent: config.transparent,
      wireframe: config.wireframe,
      side: config.side,
      roughness: config.roughness,
      metalness: config.metalness,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      map: config.map,
      normalMap: config.normalMap,
      roughnessMap: config.roughnessMap,
      metalnessMap: config.metalnessMap,
      emissiveMap: config.emissiveMap,
      alphaMap: config.alphaMap
    })

    this.cacheMaterial(key, material)
    return material
  }

  // Lambert材质
  static createLambertMaterial(config: Partial<MaterialConfig> = {}): THREE.MeshLambertMaterial {
    const key = this.generateMaterialKey('lambert', config)

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshLambertMaterial
    }

    const material = new THREE.MeshLambertMaterial({
      color: config.color || 0xffffff,
      opacity: config.opacity,
      transparent: config.transparent,
      wireframe: config.wireframe,
      side: config.side,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      map: config.map,
      emissiveMap: config.emissiveMap,
      alphaMap: config.alphaMap
    })

    this.cacheMaterial(key, material)
    return material
  }

  // Phong材质
  static createPhongMaterial(config: Partial<MaterialConfig> = {}): THREE.MeshPhongMaterial {
    const key = this.generateMaterialKey('phong', config)

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshPhongMaterial
    }

    const material = new THREE.MeshPhongMaterial({
      color: config.color || 0xffffff,
      opacity: config.opacity,
      transparent: config.transparent,
      wireframe: config.wireframe,
      side: config.side,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      shininess: 30,
      map: config.map,
      normalMap: config.normalMap,
      emissiveMap: config.emissiveMap,
      alphaMap: config.alphaMap
    })

    this.cacheMaterial(key, material)
    return material
  }

  // 线框材质
  static createWireframeMaterial(color: number = 0x000000): THREE.MeshBasicMaterial {
    const key = this.generateMaterialKey('wireframe', { color })

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshBasicMaterial
    }

    const material = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      side: THREE.DoubleSide
    })

    this.cacheMaterial(key, material)
    return material
  }

  // 透明材质
  static createTransparentMaterial(color: number = 0xffffff, opacity: number = 0.5): THREE.MeshBasicMaterial {
    const key = this.generateMaterialKey('transparent', { color, opacity })

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshBasicMaterial
    }

    const material = new THREE.MeshBasicMaterial({
      color: color,
      opacity: opacity,
      transparent: true,
      side: THREE.DoubleSide
    })

    this.cacheMaterial(key, material)
    return material
  }

  // 发光材质
  static createEmissiveMaterial(color: number = 0xffff00, intensity: number = 1): THREE.MeshStandardMaterial {
    const key = this.generateMaterialKey('emissive', { color, emissiveIntensity: intensity })

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.2,
      metalness: 0.2
    })

    this.cacheMaterial(key, material)
    return material
  }

  // 金属材质
  static createMetalMaterial(color: number = 0xc0c0c0, roughness: number = 0.1): THREE.MeshStandardMaterial {
    const key = this.generateMaterialKey('metal', { color, roughness, metalness: 1 })

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness,
      metalness: 1
    })

    this.cacheMaterial(key, material)
    return material
  }

  // 玻璃材质
  static createGlassMaterial(color: number = 0xffffff, opacity: number = 0.3): THREE.MeshPhysicalMaterial {
    const key = this.generateMaterialKey('glass', { color, opacity })

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshPhysicalMaterial
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      opacity: opacity,
      transparent: true,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    })

    this.cacheMaterial(key, material)
    return material
  }

  // 辅助方法：生成材质缓存键
  private static generateMaterialKey(type: string, config: Partial<MaterialConfig>): string {
    const props = Object.entries(config)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        if (value instanceof THREE.Texture) {
          return `${key}:texture`
        }
        return `${key}:${value}`
      })
      .join('_')

    return `${type}_${props}`
  }

  // 辅助方法：缓存材质
  private static cacheMaterial(key: string, material: THREE.Material): void {
    if (this.materialCache.size >= this.cacheSize) {
      // 移除最早的材质
      const firstKey = Array.from(this.materialCache.keys())[0]
      if (firstKey) {
        const oldMaterial = this.materialCache.get(firstKey)
        if (oldMaterial) {
          oldMaterial.dispose()
        }
        this.materialCache.delete(firstKey)
      }
    }

    this.materialCache.set(key, material)
  }

  // 清理指定材质
  static clearMaterial(key: string): void {
    const material = this.materialCache.get(key)
    if (material) {
      material.dispose()
      this.materialCache.delete(key)
    }
  }

  // 清理所有材质
  static clearAllMaterials(): void {
    this.materialCache.forEach(material => material.dispose())
    this.materialCache.clear()
  }

  // 获取缓存中的材质数量
  static getCacheSize(): number {
    return this.materialCache.size
  }

  // 设置缓存大小
  static setCacheSize(size: number): void {
    this.cacheSize = Math.max(10, size)

    // 如果当前缓存超过新大小，清理多余材质
    while (this.materialCache.size > this.cacheSize) {
      const firstKey = Array.from(this.materialCache.keys())[0]
      if (firstKey) {
        const oldMaterial = this.materialCache.get(firstKey)
        if (oldMaterial) {
          oldMaterial.dispose()
        }
        this.materialCache.delete(firstKey)
      } else {
        break
      }
    }
  }
}
