import * as THREE from 'three'
export class MeshGenerator {

  /**
   * @Date: 2022-04-29 10:36:24
   * @description: 完全释放Object3D所有的geometry、texture、material
   * @return {*}
   * @author: LinYiHan
   */
  static disposeObject3D(obj: THREE.Object3D, delSelf = false): void {
    if (!obj || obj.traverse === undefined) {
        return;
    }
    // const cssObjectList: CSS2DObject[] = [];
    // 释放内存
    obj.traverse(child => {
        const c = child as THREE.Mesh | THREE.Line;
        if (!c) {
            return;
        }
        // if (child instanceof CSS2DObject) {
        //     cssObjectList.push(child);
        //     return;
        // }
        if (c.geometry) {
            if (c.geometry.dispose) {
                c.geometry.dispose();
            }
        }
        if (c.material) {
            let materialList: THREE.Material[] = [];
            if (c.material instanceof Array) {
                materialList = materialList.concat(c.material);
            } else {
                materialList.push(c.material);
            }

            materialList.forEach((m: THREE.Material) => {
                if (!m) {
                    return;
                }
                const keyList: string[] = [
                    "map",
                    "lightMap",
                    "aoMap",
                    "aoMapIntensity",
                    "emissiveMap",
                    "bumpMap",
                    "normalMap",
                    "displacementMap",
                    "roughnessMap",
                    "metalnessMap",
                    "alphaMap",
                    "envMap",
                ];
                keyList.forEach(key => {
                    const material = m as unknown as Record<string, unknown>;
                    if (material[key] && typeof material[key] === 'object' && material[key] !== null && 'dispose' in (material[key] as object)) {
                        (material[key] as { dispose: () => void }).dispose();
                    }
                });
                if (m.dispose) {
                    m.dispose();
                }
            });
        }
    });

    // cssObjectList.reverse().forEach(o => {
    //     o.remove();
    // });

    // 移除子物体
    for (let i: number = obj.children.length - 1; i >= 0; i--) {
        const c = obj.children[i];
        obj.remove(c);
    }
    obj.children.length = 0;

    // 从父物体删除自身
    if (delSelf && obj.parent) {
        obj.parent.remove(obj);
    }
  }


}
