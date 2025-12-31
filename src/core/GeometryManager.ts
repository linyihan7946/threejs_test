/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three'

/**
 * 几何体配置接口
 */
export interface GeometryConfig {
  // 通用参数
  width?: number
  height?: number
  depth?: number
  radius?: number
  segments?: number
  detail?: number
  radiusTop?: number
  radiusBottom?: number
  widthSegments?: number
  heightSegments?: number
  radialSegments?: number
  openEnded?: boolean
  thetaStart?: number
  thetaLength?: number
  tube?: number
  tubularSegments?: number
  arc?: number
  p?: number
  q?: number
  innerRadius?: number
  outerRadius?: number
  thetaSegments?: number
  phiSegments?: number
  points?: THREE.Vector3[] | THREE.Vector2[]
  extrudeSettings?: THREE.ExtrudeGeometryOptions
  parameters?: any
}

/**
 * 几何体管理器
 * 负责几何体的生成、缓存和管理
 */
export class GeometryManager {
  // 几何体缓存池
  private static geometryCache: Map<string, THREE.BufferGeometry> = new Map()
  // 缓存大小限制
  private static cacheSize: number = 100

  /**
   * 创建立方体几何体
   */
  static createBoxGeometry(config: Partial<GeometryConfig> = {}): THREE.BoxGeometry {
    const { width = 1, height = 1, depth = 1 } = config
    const key = this.generateGeometryKey('box', { width, height, depth })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.BoxGeometry
    }

    const geometry = new THREE.BoxGeometry(width, height, depth)
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建球体几何体
   */
  static createSphereGeometry(config: Partial<GeometryConfig> = {}): THREE.SphereGeometry {
    const { radius = 1, segments = 32 } = config
    const key = this.generateGeometryKey('sphere', { radius, segments })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.SphereGeometry
    }

    const geometry = new THREE.SphereGeometry(radius, segments, segments)
    this.cacheGeometry(key, geometry)
    return geometry
  }



  /**
   * 创建圆柱体几何体
   */
  static createCylinderGeometry(config: Partial<GeometryConfig> = {}): THREE.CylinderGeometry {
    const {
      radiusTop = 1,
      radiusBottom = 1,
      height = 1,
      radialSegments = 32,
      heightSegments = 1,
      openEnded = false
    } = config
    const key = this.generateGeometryKey('cylinder', {
      radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded
    })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.CylinderGeometry
    }

    const geometry = new THREE.CylinderGeometry(
      radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded
    )
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建圆锥几何体
   */
  static createConeGeometry(config: Partial<GeometryConfig> = {}): THREE.ConeGeometry {
    const {
      radius = 1,
      height = 1,
      radialSegments = 32,
      heightSegments = 1,
      openEnded = false
    } = config
    const key = this.generateGeometryKey('cone', {
      radius, height, radialSegments, heightSegments, openEnded
    })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.ConeGeometry
    }

    const geometry = new THREE.ConeGeometry(
      radius, height, radialSegments, heightSegments, openEnded
    )
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建圆环几何体
   */
  static createTorusGeometry(config: Partial<GeometryConfig> = {}): THREE.TorusGeometry {
    const {
      radius = 1,
      tube = 0.4,
      radialSegments = 16,
      tubularSegments = 100,
      arc = Math.PI * 2
    } = config
    const key = this.generateGeometryKey('torus', {
      radius, tube, radialSegments, tubularSegments, arc
    })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.TorusGeometry
    }

    const geometry = new THREE.TorusGeometry(
      radius, tube, radialSegments, tubularSegments, arc
    )
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建圆环结几何体
   */
  static createTorusKnotGeometry(config: Partial<GeometryConfig> = {}): THREE.TorusKnotGeometry {
    const {
      radius = 1,
      tube = 0.4,
      tubularSegments = 64,
      radialSegments = 8,
      p = 2,
      q = 3
    } = config
    const key = this.generateGeometryKey('torusKnot', {
      radius, tube, tubularSegments, radialSegments, p, q
    })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.TorusKnotGeometry
    }

    const geometry = new THREE.TorusKnotGeometry(
      radius, tube, tubularSegments, radialSegments, p, q
    )
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建十二面体几何体
   */
  static createDodecahedronGeometry(config: Partial<GeometryConfig> = {}): THREE.DodecahedronGeometry {
    const { radius = 1, detail = 0 } = config
    const key = this.generateGeometryKey('dodecahedron', { radius, detail })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.DodecahedronGeometry
    }

    const geometry = new THREE.DodecahedronGeometry(radius, detail)
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建二十面体几何体
   */
  static createIcosahedronGeometry(config: Partial<GeometryConfig> = {}): THREE.IcosahedronGeometry {
    const { radius = 1, detail = 0 } = config
    const key = this.generateGeometryKey('icosahedron', { radius, detail })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.IcosahedronGeometry
    }

    const geometry = new THREE.IcosahedronGeometry(radius, detail)
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建四面体几何体
   */
  static createTetrahedronGeometry(config: Partial<GeometryConfig> = {}): THREE.TetrahedronGeometry {
    const { radius = 1, detail = 0 } = config
    const key = this.generateGeometryKey('tetrahedron', { radius, detail })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.TetrahedronGeometry
    }

    const geometry = new THREE.TetrahedronGeometry(radius, detail)
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建八面体几何体
   */
  static createOctahedronGeometry(config: Partial<GeometryConfig> = {}): THREE.OctahedronGeometry {
    const { radius = 1, detail = 0 } = config
    const key = this.generateGeometryKey('octahedron', { radius, detail })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.OctahedronGeometry
    }

    const geometry = new THREE.OctahedronGeometry(radius, detail)
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建圆环几何体
   */
  static createRingGeometry(config: Partial<GeometryConfig> = {}): THREE.RingGeometry {
    const {
      innerRadius = 0.5,
      outerRadius = 1,
      thetaSegments = 32,
      phiSegments = 1,
      thetaStart = 0,
      thetaLength = Math.PI * 2
    } = config
    const key = this.generateGeometryKey('ring', {
      innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength
    })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.RingGeometry
    }

    const geometry = new THREE.RingGeometry(
      innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength
    )
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建平面几何体
   */
  static createPlaneGeometry(config: Partial<GeometryConfig> = {}): THREE.PlaneGeometry {
    const { width = 1, height = 1, widthSegments = 1, heightSegments = 1 } = config
    const key = this.generateGeometryKey('plane', { width, height, widthSegments, heightSegments })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.PlaneGeometry
    }

    const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments)
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 创建挤压几何体
   */
  static createExtrudeGeometry(config: Partial<GeometryConfig> = {}): THREE.ExtrudeGeometry {
    const { points, extrudeSettings } = config
    if (!points) {
      throw new Error('Points are required for extrude geometry')
    }

    const shape = new THREE.Shape(points as THREE.Vector2[])
    const key = this.generateGeometryKey('extrude', { points: points.length, ...extrudeSettings })

    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key) as THREE.ExtrudeGeometry
    }

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    this.cacheGeometry(key, geometry)
    return geometry
  }

  /**
   * 生成几何体缓存键
   */
  private static generateGeometryKey(type: string, config: any): string {
    const props = Object.entries(config)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:[${value.length}]`
        }
        return `${key}:${value}`
      })
      .join('_')

    return `${type}_${props}`
  }

  /**
   * 缓存几何体
   */
  private static cacheGeometry(key: string, geometry: THREE.BufferGeometry): void {
    if (this.geometryCache.size >= this.cacheSize) {
      // 移除最早的几何体
      const firstKey = Array.from(this.geometryCache.keys())[0]
      if (firstKey) {
        const oldGeometry = this.geometryCache.get(firstKey)
        if (oldGeometry) {
          oldGeometry.dispose()
        }
        this.geometryCache.delete(firstKey)
      }
    }

    this.geometryCache.set(key, geometry)
  }

  /**
   * 清理指定几何体
   */
  static clearGeometry(key: string): void {
    const geometry = this.geometryCache.get(key)
    if (geometry) {
      geometry.dispose()
      this.geometryCache.delete(key)
    }
  }

  /**
   * 清理所有几何体
   */
  static clearAllGeometries(): void {
    this.geometryCache.forEach(geometry => geometry.dispose())
    this.geometryCache.clear()
  }

  /**
   * 获取缓存中的几何体数量
   */
  static getCacheSize(): number {
    return this.geometryCache.size
  }

  /**
   * 设置缓存大小
   */
  static setCacheSize(size: number): void {
    this.cacheSize = Math.max(10, size)

    // 如果当前缓存超过新大小，清理多余几何体
    while (this.geometryCache.size > this.cacheSize) {
      const firstKey = Array.from(this.geometryCache.keys())[0]
      if (firstKey) {
        const oldGeometry = this.geometryCache.get(firstKey)
        if (oldGeometry) {
          oldGeometry.dispose()
        }
        this.geometryCache.delete(firstKey)
      } else {
        break
      }
    }
  }

  /**
   * 检查几何体是否存在于缓存中
   */
  static hasGeometry(key: string): boolean {
    return this.geometryCache.has(key)
  }

  /**
   * 获取指定几何体
   */
  static getGeometry(key: string): THREE.BufferGeometry | undefined {
    return this.geometryCache.get(key)
  }
}
