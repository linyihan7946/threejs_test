import * as THREE from 'three'

export class LightGenerator {
  static createAmbientLight(color: number = 0xffffff, intensity: number = 0.5): THREE.AmbientLight {
    return new THREE.AmbientLight(color, intensity)
  }

  static createDirectionalLight(
    color: number = 0xffffff,
    intensity: number = 1,
    position: THREE.Vector3 = new THREE.Vector3(5, 5, 5),
    target: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
  ): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.copy(position)
    light.target.position.copy(target); // 光源目标指向原点
    light.castShadow = true
    // 调整阴影相机范围以覆盖你的 10000 单位地面
    const d = 5000;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 10000; // 必须大于光照到地面的距离

    // 增加阴影贴图分辨率（默认 512，针对大场景建议增加）
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    light.shadow.bias = -0.001;
    return light
  }

  static createHemisphereLight(skyColor: number = 0xffffff, groundColor: number = 0x000000, intensity: number = Math.PI, position: THREE.Vector3 = new THREE.Vector3(0, 1, 0)): THREE.HemisphereLight {
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    light.position.copy(position)
    return light
  }

  static createPointLight(color: number = 0xffffff, intensity: number = 1, distance: number = 0, decay: number = 1, position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.PointLight {
    const light = new THREE.PointLight(color, intensity, distance, decay)
    light.position.copy(position)
    light.castShadow = true
    return light
  }

  static createSpotLight(color: number = 0xffffff, intensity: number = 1, position: THREE.Vector3 = new THREE.Vector3(0, 0, 0), target: THREE.Vector3 = new THREE.Vector3(0, 0, 0)): THREE.SpotLight {
    const light = new THREE.SpotLight(color, intensity)
    light.position.copy(position)
    light.target.position.copy(target)
    return light
  }

  static createRectAreaLight(
    color: number = 0xffffff,
    intensity: number = 1,
    width: number = 1,
    height: number = 1,
    position: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    target: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  ): THREE.RectAreaLight {
    const light = new THREE.RectAreaLight(color, intensity, width, height)
    light.position.copy(position)
    light.lookAt(target)
    // light.castShadow = true
    return light
  }
}
