import * as THREE from 'three'

export class MeshGenerator {
  static createBox(size: number = 1000, color: number = 0x00ff00): THREE.Mesh {
    const boxGeometry = new THREE.BoxGeometry(size, size, size)
    const material = new THREE.MeshStandardMaterial({ color: color })
    const boxMesh = new THREE.Mesh(boxGeometry, material)
    boxMesh.receiveShadow = true
    boxMesh.castShadow = true
    return boxMesh
  }

  static createSphere(radius: number = 500, color: number = 0xff0000): THREE.Mesh {
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32)
    const material = new THREE.MeshStandardMaterial({ color: color })
    const sphereMesh = new THREE.Mesh(sphereGeometry, material)
    sphereMesh.receiveShadow = true
    sphereMesh.castShadow = true
    return sphereMesh
  }

  static createPlane(width: number = 1000, height: number = 1000, color: number = 0x0000ff): THREE.Mesh {
    const planeGeometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide })
    const planeMesh = new THREE.Mesh(planeGeometry, material)
    planeMesh.receiveShadow = true
    planeMesh.castShadow = true
    return planeMesh
  }
}
