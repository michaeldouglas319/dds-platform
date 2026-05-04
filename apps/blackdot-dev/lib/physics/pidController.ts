/**
 * PID (Proportional-Integral-Derivative) Controller
 *
 * Generic PID controller for feedback control systems.
 * Used for altitude control, pitch control, speed control, etc.
 *
 * The PID formula:
 * output = Kp*error + Ki*integral(error) + Kd*derivative(error)
 *
 * Where:
 * - Kp (proportional gain): immediate response to error
 * - Ki (integral gain): cumulative correction for steady-state error
 * - Kd (derivative gain): dampening of overshoot
 */
export class PIDController {
  private kp: number
  private ki: number
  private kd: number

  private integral: number = 0
  private previousError: number = 0
  private previousTime: number = 0

  private minOutput: number = -Infinity
  private maxOutput: number = Infinity
  private minIntegral: number = -Infinity
  private maxIntegral: number = Infinity

  /**
   * Create a new PID controller
   *
   * @param kp Proportional gain (0.1 - 2.0 typical)
   * @param ki Integral gain (0.01 - 0.5 typical)
   * @param kd Derivative gain (0.05 - 0.3 typical)
   */
  constructor(kp: number, ki: number, kd: number) {
    this.kp = kp
    this.ki = ki
    this.kd = kd
  }

  /**
   * Set output bounds to prevent wind-up
   * @param min Minimum output value
   * @param max Maximum output value
   */
  setOutputBounds(min: number, max: number): void {
    this.minOutput = min
    this.maxOutput = max
  }

  /**
   * Set integral bounds to prevent integral wind-up
   * @param min Minimum integral value
   * @param max Maximum integral value
   */
  setIntegralBounds(min: number, max: number): void {
    this.minIntegral = min
    this.maxIntegral = max
  }

  /**
   * Update controller and return output
   *
   * @param error Current error (setpoint - measured value)
   * @param deltaTime Time since last update in seconds
   * @returns Controller output command
   */
  update(error: number, deltaTime: number): number {
    // Handle first update or large time gaps
    if (this.previousTime === 0 || deltaTime <= 0) {
      this.previousTime = deltaTime
      this.previousError = error
      return 0
    }

    // Proportional term: immediate response to error
    const pTerm = this.kp * error

    // Integral term: cumulative correction
    this.integral += error * deltaTime
    this.integral = this.clamp(this.integral, this.minIntegral, this.maxIntegral)
    const iTerm = this.ki * this.integral

    // Derivative term: dampening (based on rate of change of error)
    const derivative = (error - this.previousError) / deltaTime
    const dTerm = this.kd * derivative

    // Combine all terms
    let output = pTerm + iTerm + dTerm

    // Clamp output to bounds
    output = this.clamp(output, this.minOutput, this.maxOutput)

    // Store for next iteration
    this.previousError = error
    this.previousTime = deltaTime

    return output
  }

  /**
   * Get detailed controller state (for debugging/tuning)
   */
  getState(error: number, deltaTime: number): {
    pTerm: number
    iTerm: number
    dTerm: number
    total: number
  } {
    const pTerm = this.kp * error
    const iTerm = this.ki * this.integral
    const derivative = deltaTime > 0 ? (error - this.previousError) / deltaTime : 0
    const dTerm = this.kd * derivative
    const total = pTerm + iTerm + dTerm

    return { pTerm, iTerm, dTerm, total }
  }

  /**
   * Reset controller state
   */
  reset(): void {
    this.integral = 0
    this.previousError = 0
    this.previousTime = 0
  }

  /**
   * Set gains (for tuning)
   */
  setGains(kp: number, ki: number, kd: number): void {
    this.kp = kp
    this.ki = ki
    this.kd = kd
  }

  /**
   * Get current gains
   */
  getGains(): { kp: number; ki: number; kd: number } {
    return { kp: this.kp, ki: this.ki, kd: this.kd }
  }

  /**
   * Clamp value to range [min, max]
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }
}

// ============================================================================
// SPECIALIZED PID CONTROLLERS
// ============================================================================

/**
 * Altitude controller for vertical position control
 * Maintains target altitude above ground
 */
export class AltitudeController {
  private pid: PIDController
  private targetAltitude: number

  constructor(kp: number, ki: number, kd: number, targetAltitude: number) {
    this.pid = new PIDController(kp, ki, kd)
    this.pid.setOutputBounds(-10, 10) // Max vertical velocity change
    this.targetAltitude = targetAltitude
  }

  update(currentAltitude: number, deltaTime: number): number {
    const error = this.targetAltitude - currentAltitude
    return this.pid.update(error, deltaTime)
  }

  setTarget(altitude: number): void {
    this.targetAltitude = altitude
  }

  reset(): void {
    this.pid.reset()
  }
}

/**
 * Pitch controller for pitch angle control
 * Maintains target pitch during maneuvers
 */
export class PitchController {
  private pid: PIDController
  private targetPitch: number

  constructor(kp: number, ki: number, kd: number, targetPitch: number) {
    this.pid = new PIDController(kp, ki, kd)
    // Output is pitch rate in radians/second
    const maxRate = Math.PI / 2 // 90 deg/s max
    this.pid.setOutputBounds(-maxRate, maxRate)
    this.targetPitch = targetPitch
  }

  update(currentPitch: number, deltaTime: number): number {
    const error = this.targetPitch - currentPitch
    return this.pid.update(error, deltaTime)
  }

  setTarget(pitch: number): void {
    this.targetPitch = pitch
  }

  reset(): void {
    this.pid.reset()
  }
}

/**
 * Speed controller for horizontal velocity control
 * Maintains target speed in taxi/orbit phases
 */
export class SpeedController {
  private pid: PIDController
  private targetSpeed: number

  constructor(kp: number, ki: number, kd: number, targetSpeed: number) {
    this.pid = new PIDController(kp, ki, kd)
    // Output is acceleration in units/s²
    this.pid.setOutputBounds(-5, 5)
    this.targetSpeed = targetSpeed
  }

  update(currentSpeed: number, deltaTime: number): number {
    const error = this.targetSpeed - currentSpeed
    return this.pid.update(error, deltaTime)
  }

  setTarget(speed: number): void {
    this.targetSpeed = speed
  }

  reset(): void {
    this.pid.reset()
  }
}

/**
 * Bank angle controller for coordinated turns
 * Maintains proper bank angle for given turn radius
 */
export class BankController {
  private pid: PIDController
  private targetBankAngle: number

  constructor(kp: number, ki: number, kd: number, targetBankAngle: number) {
    this.pid = new PIDController(kp, ki, kd)
    // Output is bank rate in radians/second
    const maxRate = Math.PI // 180 deg/s max
    this.pid.setOutputBounds(-maxRate, maxRate)
    this.targetBankAngle = targetBankAngle
  }

  update(currentBankAngle: number, deltaTime: number): number {
    const error = this.targetBankAngle - currentBankAngle
    return this.pid.update(error, deltaTime)
  }

  setTarget(bankAngle: number): void {
    this.targetBankAngle = bankAngle
  }

  reset(): void {
    this.pid.reset()
  }
}

/**
 * Multi-axis controller combining altitude and pitch
 * Used during takeoff phase for synchronized climb
 */
export class ClimbController {
  private altitudeController: AltitudeController
  private pitchController: PitchController

  constructor(
    altitudeKp: number,
    altitudeKi: number,
    altitudeKd: number,
    pitchKp: number,
    pitchKi: number,
    pitchKd: number,
    targetAltitude: number,
    targetPitch: number
  ) {
    this.altitudeController = new AltitudeController(
      altitudeKp,
      altitudeKi,
      altitudeKd,
      targetAltitude
    )
    this.pitchController = new PitchController(pitchKp, pitchKi, pitchKd, targetPitch)
  }

  updateClimb(
    currentAltitude: number,
    currentPitch: number,
    deltaTime: number
  ): {
    verticalVelocity: number
    pitchRate: number
  } {
    return {
      verticalVelocity: this.altitudeController.update(currentAltitude, deltaTime),
      pitchRate: this.pitchController.update(currentPitch, deltaTime)
    }
  }

  setTargets(altitude: number, pitch: number): void {
    this.altitudeController.setTarget(altitude)
    this.pitchController.setTarget(pitch)
  }

  reset(): void {
    this.altitudeController.reset()
    this.pitchController.reset()
  }
}
