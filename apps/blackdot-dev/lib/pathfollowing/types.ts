import * as THREE from 'three'

export type ControllerType = 'stanley' | 'purePursuit'

export interface TaxiRoute {
  id: string
  name: string
  waypoints: THREE.Vector3[]
  speedLimit: number
  controller: ControllerType
  controllerParams: Record<string, number>
}

export interface PathFollowingState {
  currentPoint: THREE.Vector3
  currentTangent: THREE.Vector3
  currentCurvature: number
  pathParameter: number // 0 to 1 along the path
  crossTrackError: number
  headingError: number
}

export interface StanleyControllerParams {
  lookAheadDistance: number
  lateralGain: number // k_e in Stanley formula
  headingGain: number // k_psi in Stanley formula
  maxSteering: number // rad/s
}

export interface PurePursuitParams {
  lookAheadDistance: number
  minLookAhead: number
  maxLookAhead: number
}
