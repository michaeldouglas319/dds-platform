'use client'

import { useGLTF } from '@react-three/drei'
import { getResumeModelConfig, type ModelType } from '@/lib/config/models/resumeModels.config'

interface ModelRendererProps {
  modelType: ModelType
  color: string
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export function ModelRenderer({
  modelType,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: ModelRendererProps) {
  const modelConfig = getResumeModelConfig(modelType)

  // Handle different model formats
  if (modelConfig.format === 'glb') {
    return (
      <GLBModel path={modelConfig.path} position={position} rotation={rotation} />
    )
  }

  if (modelConfig.format === 'texture') {
    return (
      <TexturedPlane
        path={modelConfig.path}
        color={color}
        position={position}
        rotation={rotation}
      />
    )
  }

  if (modelConfig.format === 'geometry') {
    return (
      <ProceduralGeometry
        type={modelType}
        color={color}
        position={position}
        rotation={rotation}
      />
    )
  }

  if (modelConfig.format === 'component') {
    // For component-based models, render a placeholder
    return <ProceduralGeometry type={modelType} color={color} position={position} rotation={rotation} />
  }

  return null
}

function GLBModel({
  path,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: {
  path: string
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const gltf = useGLTF(path)
  const scene = gltf?.scene

  if (!scene) {
    // Fallback while loading
    return (
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial color="#666" />
      </mesh>
    )
  }

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={0.3}
      dispose={null}
    />
  )
}

function TexturedPlane({
  path,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: {
  path: string
  color: string
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[4, 4]} />
      <meshStandardMaterial
        map={null}
        color={color}
        transparent
      />
      {/* Image texture would be loaded here */}
    </mesh>
  )
}

function ProceduralGeometry({
  type,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: {
  type: ModelType
  color: string
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  // Simple box for procedural/geometry models
  const scale = getGeometryScale(type)
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[2 * scale, 2 * scale, 2 * scale]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function getGeometryScale(type: ModelType): number {
  const scaleMap: Record<ModelType, number> = {
    'tesla': 0.3,
    'renewed-vision': 0.3,
    'skyline': 0.3,
    'neural-network': 0.25,
    'gcs': 0.3,
    'building': 0.35,
    'uav-drone': 0.2,
    'book': 0.25,
    'island': 0.4
  }
  return scaleMap[type] || 0.3
}
