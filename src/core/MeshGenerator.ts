import * as THREE from 'three'

export class MeshGenerator {
  static createBox(size: number = 1000, color: number = 0x00ff00): THREE.Mesh {
    const boxGeometry = new THREE.BoxGeometry(size, size, size)
    const material = new THREE.MeshStandardMaterial({ color: color })
    const boxMesh = new THREE.Mesh(boxGeometry, material)
    return boxMesh
  }

  static createSphere(radius: number = 500, color: number = 0xff0000): THREE.Mesh {
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32)
    const material = new THREE.MeshStandardMaterial({ color: color })
    return new THREE.Mesh(sphereGeometry, material)
  }

  static createPlane(width: number = 1000, height: number = 1000, color: number = 0x0000ff): THREE.Mesh {
    const planeGeometry = new THREE.PlaneGeometry(width, height)
    const material = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide })
    return new THREE.Mesh(planeGeometry, material)
  }
}
