declare module '@mkkellogg/gaussian-splats-3d' {
    import * as THREE from 'three'

    export enum RenderMode {
        Unlit = 'unlit',
        Lit = 'lit',
        Normals = 'normals',
        Depth = 'depth'
    }

    export enum SceneFormat {
        Ply = 'ply',
        Splat = 'splat',
        KSplat = 'ksplat'
    }

    export enum SceneRevealMode {
        Instant = 'instant',
        Fade = 'fade',
        Grow = 'grow'
    }

    export class Viewer {
      constructor(options?: {
          cameraUp?: number[],
          initialCameraPosition?: number[],
          initialCameraLookAt?: number[],
          sphericalHarmonicsDegree?: number,
          threeScene?: THREE.Scene,
          threeCamera?: THREE.Camera,
          threeRenderer?: THREE.Renderer,
      });

      public addSplatScene(path: string, options: {
        progressiveLoad?: boolean,
        // format: number,
        // showLoadingUI: boolean,
        // onProgress: (progress: number) => void,
      } = {}): Promise<void>;

      public start(): void;
    }

    // export class SplatLoader {
    //     renderMode: RenderMode
    //     sceneRevealMode: SceneRevealMode
    //     loadFromURL(url: string, onProgress?: (progress: number) => void): Promise<THREE.Object3D>
    //     loadFromFile(file: File, onProgress?: (progress: number) => void): Promise<THREE.Object3D>
    // }

    // export class PlyLoader {
    //     renderMode: RenderMode
    //     sceneRevealMode: SceneRevealMode
    //     loadFromURL(url: string, onProgress?: (progress: number) => void): Promise<THREE.Object3D>
    //     loadFromFile(file: File, onProgress?: (progress: number) => void): Promise<THREE.Object3D>
    // }

    // export class KSplatLoader {
    //     // renderMode: RenderMode
    //     // sceneRevealMode: SceneRevealMode
    //     // static loadFromURL(fileName, externalOnProgress, progressiveLoadToSplatBuffer, onSectionBuilt, headers): any;
    //     static checkVersion(buffer: ArrayBuffer): boolean;
    //     static loadFromURL(url: string, onProgress?: (progress: number) => void): Promise<THREE.Object3D>
    //     static loadFromFileData(file: File, onProgress?: (progress: number) => void): Promise<THREE.Object3D>
    // }

    // export class DropInViewer {
    //     constructor(container: HTMLElement, options?: {
    //         url?: string
    //         renderMode?: RenderMode
    //         sceneRevealMode?: SceneRevealMode
    //         onProgress?: (progress: number) => void
    //     })
    //     loadFile(url: string, onProgress?: (progress: number) => void): void
    // }

    // export class AbortablePromise {
    //     promise: Promise<any>
    //     abort(): void
    // }

    // export class OrbitControls {
    //     // OrbitControls 相关类型定义
    // }

    // export class PlayCanvasCompressedPlyParser {
    //     // PlayCanvasCompressedPlyParser 相关类型定义
    // }

    // export class PlyParser {
    //     // PlyParser 相关类型定义
    // }

    // export class SplatBuffer {
    //     // SplatBuffer 相关类型定义
    // }

    // export class SplatBufferGenerator {
    //     // SplatBufferGenerator 相关类型定义
    // }

    // export class SplatParser {
    //     // SplatParser 相关类型定义
    // }

    // export class SplatPartitioner {
    //     // SplatPartitioner 相关类型定义
    // }

    // export class SplatRenderMode {
    //     // SplatRenderMode 相关类型定义
    // }

    // export const LoaderUtils: any
    // export const LogLevel: any
}
