import * as THREE from 'three'
import CryptoJS from 'crypto-js'

interface ObjectInfo {
    geometry: THREE.BufferGeometry
    materials: THREE.Material[]
    matrix: THREE.Matrix4
}

interface GeometryInfo {
    geometry: THREE.BufferGeometry
    matrix: THREE.Matrix4
    object: THREE.Object3D
}

interface MaterialData {
    material: THREE.Material
    geometryInfo: GeometryInfo[]
}

export class SceneOptimizer {
    static Instance = new SceneOptimizer();
    private objectInfoMap: Map<THREE.Object3D, ObjectInfo> = new Map()
    private materialDataMap: Map<string, MaterialData> = new Map()

    /**
     * 优化场景，提取mesh和line信息并进行批处理
     * @param scene 原始场景
     * @returns 优化后的新场景
     */
    public optimizeScene(scene: THREE.Object3D): THREE.Object3D {
        // 清空之前的数据
        this.objectInfoMap.clear()
        this.materialDataMap.clear()

        // 提取场景中的mesh和line信息
        console.time("extractSceneObjects");
        this.extractSceneObjects(scene)
        console.timeEnd("extractSceneObjects");
        console.log("objectInfoMap:%o,objectInfoMap.size:%d", this.objectInfoMap, this.objectInfoMap.size);

        // 根据材质分组并计算MD5
        console.time("groupByMaterial");
        this.groupByMaterial()
        console.timeEnd("groupByMaterial");
        console.log("materialDataMap:%o,materialDataMap.size:%d", this.materialDataMap, this.materialDataMap.size);
        // 创建优化后的场景
        console.time("createOptimizedScene");
        const optimizedScene = this.createOptimizedScene()
        console.timeEnd("createOptimizedScene");

        return optimizedScene
    }

    /**
     * 递归提取场景中的所有mesh和line对象
     * @param object 当前对象
     * @param worldMatrix 世界矩阵
     */
    private extractSceneObjects(object: THREE.Object3D, worldMatrix: THREE.Matrix4 = new THREE.Matrix4()): void {
        // 计算当前对象的世界矩阵
        const currentWorldMatrix = new THREE.Matrix4()
        currentWorldMatrix.multiplyMatrices(worldMatrix, object.matrix)

        // 检查是否是mesh或line
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
            this.extractObjectInfo(object, currentWorldMatrix)
        }

        // 递归处理子对象
        for (const child of object.children) {
            this.extractSceneObjects(child, currentWorldMatrix)
        }
    }

    /**
     * 提取单个对象的信息
     * @param object Mesh或Line对象
     * @param worldMatrix 世界矩阵
     */
    private extractObjectInfo(object: THREE.Mesh | THREE.Line, worldMatrix: THREE.Matrix4): void {
        if (!object.geometry) return

        const materials = Array.isArray(object.material) ? object.material : [object.material]

        const objectInfo: ObjectInfo = {
            geometry: object.geometry,
            materials: materials,
            matrix: worldMatrix.clone()
        }

        this.objectInfoMap.set(object, objectInfo)
    }

    /**
     * 根据材质分组对象
     */
    private groupByMaterial(): void {
        for (const [object, info] of this.objectInfoMap) {
            for (const material of info.materials) {
                const materialMd5 = this.calculateMaterialMd5(material)

                if (!this.materialDataMap.has(materialMd5)) {
                    this.materialDataMap.set(materialMd5, {
                        material: material,
                        geometryInfo: []
                    })
                }

                const materialData = this.materialDataMap.get(materialMd5)!
                materialData.geometryInfo.push({
                    geometry: info.geometry,
                    matrix: info.matrix,
                    object: object
                })
            }
        }
    }

    /**
     * 计算材质的MD5值
     * @param material 材质对象
     * @returns MD5字符串
     */
    private calculateMaterialMd5(material: THREE.Material): string {
        // 创建材质的序列化字符串
        const materialData = {
            type: material.type,
            uuid: material.uuid,
            // 根据材质类型提取关键属性
            ...(material instanceof THREE.MeshBasicMaterial && {
                color: material.color.getHex(),
                map: material.map?.uuid,
                alphaMap: material.alphaMap?.uuid,
                transparent: material.transparent,
                opacity: material.opacity
            }),
            ...(material instanceof THREE.MeshStandardMaterial && {
                color: material.color.getHex(),
                roughness: material.roughness,
                metalness: material.metalness,
                map: material.map?.uuid,
                normalMap: material.normalMap?.uuid,
                roughnessMap: material.roughnessMap?.uuid,
                metalnessMap: material.metalnessMap?.uuid
            }),
            ...(material instanceof THREE.LineBasicMaterial && {
                color: material.color.getHex(),
                linewidth: material.linewidth
            })
        }

        const materialString = JSON.stringify(materialData)
        return CryptoJS.MD5(materialString).toString()
    }

    /**
     * 拿到Geometry信息
     *
     * @private
     * @param {THREE.BufferGeometry} g
     * @returns {{vertexCount: number, indexCount: number}}
     */
    private getGeometryInfo(g: THREE.BufferGeometry): {vertexCount: number, indexCount: number} {
        const pointCount = g.attributes.position.count;
        const normalCount = g.attributes.normal ? g.attributes.normal.count : 0;
        const colorCount = g.attributes.color ? g.attributes.color.count : 0
        const vertexCount: number = Math.max(pointCount, normalCount, colorCount);
        const index = g.getIndex();
        const indexCount: number = index ? index.count : vertexCount;
        return {vertexCount, indexCount};
    }

    private createBatchedMesh(material: THREE.Material, geometryInfoList: GeometryInfo[]): {batchedMesh: THREE.BatchedMesh, sourceMeshList: THREE.Object3D[]} {
        let maxVertexCount = 0;
        let maxIndexCount = 0;
        geometryInfoList.forEach(info => {
            const i = this.getGeometryInfo(info.geometry);
            maxVertexCount = Math.max(maxVertexCount, i.vertexCount);
            maxIndexCount = Math.max(maxIndexCount, i.indexCount);
        });
        const maxInstanceCount = geometryInfoList.length;
        maxVertexCount *= maxInstanceCount;
        maxIndexCount *= maxInstanceCount;
        const batchedMesh = new THREE.BatchedMesh(maxInstanceCount, maxVertexCount, maxIndexCount, material);
        const sourceMeshList: THREE.Object3D[] = [];
        for (let i = 0; i < geometryInfoList.length; i++) {
            const info = geometryInfoList[i];
            const g1 = geometryInfoList[i].geometry;
            const matrix = geometryInfoList[i].matrix;
            const geometryId = batchedMesh.addGeometry(g1);
            const instanceId = batchedMesh.addInstance(geometryId);
            batchedMesh.setMatrixAt(instanceId, matrix);
            if (info.object) {
                sourceMeshList.push(info.object);
            }
        }

        const result: {batchedMesh: THREE.BatchedMesh, sourceMeshList: THREE.Object3D[]} = {
            batchedMesh, sourceMeshList
        }
        return result;
    }

    /**
     * 创建优化后的场景
     * @returns 新的优化场景
     */
    private createOptimizedScene(): THREE.Object3D {
        const optimizedScene = new THREE.Object3D()

        for (const [, materialData] of this.materialDataMap) {
            const geometryInfoList = materialData.geometryInfo

            if (geometryInfoList.length > 5) {
                // 创建批处理mesh
                const batchedMesh = this.createBatchedMesh(materialData.material, geometryInfoList)
                if (batchedMesh) {
                    optimizedScene.add(batchedMesh.batchedMesh)
                }
            } else {
                // 创建普通mesh或line
                for (const geometryInfo of geometryInfoList) {
                    const newObject = this.createSingleObject(materialData.material, geometryInfo)
                    if (newObject) {
                        optimizedScene.add(newObject)
                    }
                }
            }
        }

        return optimizedScene
    }

    /**
     * 创建单个对象
     * @param material 材质
     * @param geometryInfo 几何体信息
     * @returns 新的mesh或line对象
     */
    private createSingleObject(material: THREE.Material, geometryInfo: GeometryInfo): THREE.Object3D | null {
        try {
            let newObject: THREE.Object3D

            if (geometryInfo.object instanceof THREE.Mesh) {
                newObject = new THREE.Mesh(geometryInfo.geometry, material)
            } else if (geometryInfo.object instanceof THREE.Line) {
                newObject = new THREE.Line(geometryInfo.geometry, material)
            } else {
                return null
            }

            // 应用世界矩阵
            newObject.matrix.copy(geometryInfo.matrix)
            newObject.matrixAutoUpdate = false

            return newObject
        } catch (error) {
            console.warn('创建单个对象失败:', error)
            return null
        }
    }

    /**
     * 获取优化统计信息
     * @returns 统计信息
     */
    public getOptimizationStats(): {
        totalObjects: number
        uniqueMaterials: number
        batchedMeshCount: number
        singleObjectCount: number
    } {
        const batchedMeshCount = 0 // 暂时不支持批处理
        let singleObjectCount = 0

        for (const materialData of this.materialDataMap.values()) {
            if (materialData.geometryInfo.length > 5) {
                // 暂时不支持批处理，所以都算作单独对象
                singleObjectCount += materialData.geometryInfo.length
            } else {
                singleObjectCount += materialData.geometryInfo.length
            }
        }

        return {
            totalObjects: this.objectInfoMap.size,
            uniqueMaterials: this.materialDataMap.size,
            batchedMeshCount,
            singleObjectCount
        }
    }
}
