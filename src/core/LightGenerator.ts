import * as THREE from 'three'

export class LightGenerator {
  static createAmbientLight(color: number = 0xffffff, intensity: number = 0.5): THREE.AmbientLight {
    return new THREE.AmbientLight(color, intensity)
  }

  static createDirectionalLight(color: number = 0xffffff, intensity: number = 1, position: THREE.Vector3 = new THREE.Vector3(5, 5, 5)): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.copy(position)
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
}
