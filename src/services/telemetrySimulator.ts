// ============================================================
// TELEMETRY SIMULATOR SERVICE
// Generates realistic physics-based mock sensor readings.
// Supports:
// - Multiple conveyors (Conveyor #01, #02, #03, #04)
// - System Power (OFF / STARTING / ONLINE)
// - Conveyor State (STOPPED / STARTING / RUNNING / STOPPING)
// - Acceleration rate (0.5x, 1x, 1.5x, 2x)
// - Demo scenarios (Normal, Misalignment, Overload, etc.)
// ============================================================

import type {
  TelemetrySnapshot,
  ConveyorId,
  SystemPower,
  ConveyorState,
  AccelerationRate,
} from '../types/telemetry';
import { CONVEYOR_PROFILES } from '../types/telemetry';
import type { ScenarioId } from '../types/scenarios';

// ---------- Noise helpers ----------

function gaussianNoise(mean: number, stddev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stddev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------- Simulator internal state ----------

interface SimulatorState {
  rpm:         number;
  current:     number;
  load:        number;
  vibration:   number;
  temperature: number;
  beltOffset:  number;
}

// Scenario-specific offsets/overrides applied on top of the active conveyor baseline
const SCENARIO_OFFSETS: Record<ScenarioId, Partial<SimulatorState>> = {
  normal:             {},
  misalignment:       { beltOffset: 22, vibration: 0.28, current: 0.6,  rpm: -8  },
  overload:           { load: 6.5,     current: 1.8,  rpm: -20, vibration: 0.20, temperature: 12 },
  speed_variation:    { vibration: 0.18, beltOffset: 14, rpm: -15 },
  high_vibration:     { vibration: 0.45, current: 0.35, temperature: 8 },
  sensor_disconnect:  { vibration: -99 }, // special code for offline sensor
  communication_loss: { rpm: -999 },       // special code for comms lost
};

export class TelemetrySimulator {
  private activeConveyorId: ConveyorId = 'conv-01';
  private systemPower: SystemPower = 'OFF';
  private conveyorState: ConveyorState = 'STOPPED';
  private acceleration: AccelerationRate = 1;
  private scenario: ScenarioId = 'normal';

  private currentState: SimulatorState;
  private transitionProgress: number = 1;
  private previousState: SimulatorState;
  private ticker: number = 0;

  constructor() {
    const profile = CONVEYOR_PROFILES['conv-01'];
    this.currentState = { ...profile };
    this.previousState = { ...profile };
  }

  // --- Configuration Setters ---

  setConveyor(id: ConveyorId): void {
    if (this.activeConveyorId === id) return;
    this.activeConveyorId = id;
    const profile = CONVEYOR_PROFILES[id];
    this.previousState = { ...this.currentState };
    this.currentState = { ...profile };
    this.transitionProgress = 0;
  }

  getConveyor(): ConveyorId {
    return this.activeConveyorId;
  }

  setSystemPower(power: SystemPower): void {
    this.systemPower = power;
  }

  getSystemPower(): SystemPower {
    return this.systemPower;
  }

  setConveyorState(state: ConveyorState): void {
    this.conveyorState = state;
  }

  getConveyorState(): ConveyorState {
    return this.conveyorState;
  }

  setAcceleration(acc: AccelerationRate): void {
    this.acceleration = acc;
  }

  getAcceleration(): AccelerationRate {
    return this.acceleration;
  }

  setScenario(id: ScenarioId): void {
    this.scenario = id;
    this.previousState = { ...this.currentState };
    this.transitionProgress = 0;
  }

  getScenario(): ScenarioId {
    return this.scenario;
  }

  isCommsLost(): boolean {
    return this.scenario === 'communication_loss' || this.systemPower === 'OFF';
  }

  isVibrationOffline(): boolean {
    return this.scenario === 'sensor_disconnect';
  }

  // --- Core Simulation Engine Tick ---

  tick(deltaMs: number): TelemetrySnapshot {
    const profile = CONVEYOR_PROFILES[this.activeConveyorId];

    // Case 1: System is OFF
    if (this.systemPower === 'OFF') {
      return {
        timestamp: new Date(),
        rpm: 0,
        current: 0,
        load: profile.load,
        vibration: -1,
        temperature: 25.0,
        beltOffset: profile.beltOffset,
        dataSource: 'demo',
      };
    }

    // Case 2: System is STARTING (Buffering phase)
    if (this.systemPower === 'STARTING') {
      return {
        timestamp: new Date(),
        rpm: 0,
        current: 0.05,
        load: profile.load,
        vibration: 0.01,
        temperature: 28.5,
        beltOffset: profile.beltOffset,
        dataSource: 'demo',
      };
    }

    // Case 3: System ONLINE & Conveyor STOPPED or STOPPING
    if (this.conveyorState === 'STOPPED' || this.conveyorState === 'STOPPING') {
      return {
        timestamp: new Date(),
        rpm: 0,
        current: 0.12, // Standby current draw
        load: profile.load,
        vibration: 0.02, // Idle mechanical hum
        temperature: parseFloat(profile.temperature.toFixed(1)),
        beltOffset: parseFloat(profile.beltOffset.toFixed(1)),
        dataSource: 'demo',
      };
    }

    // Case 4: System ONLINE & Conveyor STARTING
    if (this.conveyorState === 'STARTING') {
      const startProgress = Math.random() * 0.3 + 0.1;
      return {
        timestamp: new Date(),
        rpm: parseFloat((profile.rpm * startProgress).toFixed(0)),
        current: parseFloat((profile.current * 1.8).toFixed(2)), // Inrush current spike
        load: profile.load,
        vibration: 0.08,
        temperature: parseFloat(profile.temperature.toFixed(1)),
        beltOffset: parseFloat(profile.beltOffset.toFixed(1)),
        dataSource: 'demo',
      };
    }

    // Case 5: System ONLINE & Conveyor RUNNING
    // Scale tick delta by acceleration multiplier
    const effectiveDelta = (deltaMs / 1000) * this.acceleration;
    this.ticker += effectiveDelta;

    const transitionRate = 0.02 * this.acceleration;
    this.transitionProgress = clamp(this.transitionProgress + transitionRate, 0, 1);
    const t = this.easeInOut(this.transitionProgress);

    const offsets = SCENARIO_OFFSETS[this.scenario];

    // Compute target target state by combining conveyor profile + scenario offset
    let targetRpm = profile.rpm + (offsets.rpm ?? 0);
    if (this.scenario === 'speed_variation') {
      targetRpm = profile.rpm + 15 * Math.sin(this.ticker * 1.2 * this.acceleration);
    }

    const targetCurrent     = profile.current + (offsets.current ?? 0);
    const targetLoad        = profile.load + (offsets.load ?? 0);
    const targetVib         = offsets.vibration === -99 ? -1 : profile.vibration + (offsets.vibration ?? 0);
    const targetTemp        = profile.temperature + (offsets.temperature ?? 0);
    const targetOffset      = profile.beltOffset + (offsets.beltOffset ?? 0);

    if (this.scenario === 'communication_loss') {
      return {
        timestamp: new Date(),
        rpm: this.currentState.rpm,
        current: this.currentState.current,
        load: this.currentState.load,
        vibration: this.currentState.vibration,
        temperature: this.currentState.temperature,
        beltOffset: this.currentState.beltOffset,
        dataSource: 'demo',
      };
    }

    // Noise scaling by acceleration
    const noiseScale = Math.sqrt(this.acceleration);

    if (targetVib === -1) {
      this.currentState.rpm         = gaussianNoise(lerp(this.previousState.rpm,         targetRpm,     t), 0.8 * noiseScale);
      this.currentState.current     = gaussianNoise(lerp(this.previousState.current,     targetCurrent,  t), 0.04 * noiseScale);
      this.currentState.load        = gaussianNoise(lerp(this.previousState.load,        targetLoad,     t), 0.08 * noiseScale);
      this.currentState.vibration   = -1;
      this.currentState.temperature = gaussianNoise(lerp(this.previousState.temperature, targetTemp,     t), 0.15 * noiseScale);
      this.currentState.beltOffset  = gaussianNoise(lerp(this.previousState.beltOffset,  targetOffset,   t), 0.5 * noiseScale);
    } else {
      this.currentState.rpm         = gaussianNoise(lerp(this.previousState.rpm,         targetRpm,     t), 0.8 * noiseScale);
      this.currentState.current     = gaussianNoise(lerp(this.previousState.current,     targetCurrent,  t), 0.04 * noiseScale);
      this.currentState.load        = gaussianNoise(lerp(this.previousState.load,        targetLoad,     t), 0.08 * noiseScale);
      this.currentState.vibration   = clamp(gaussianNoise(lerp(this.previousState.vibration, targetVib, t), 0.008 * noiseScale), 0.01, 2.0);
      this.currentState.temperature = gaussianNoise(lerp(this.previousState.temperature, targetTemp,     t), 0.15 * noiseScale);
      this.currentState.beltOffset  = gaussianNoise(lerp(this.previousState.beltOffset,  targetOffset,   t), 0.5 * noiseScale);
    }

    // Physical clamps
    this.currentState.rpm         = clamp(this.currentState.rpm,         0,   300);
    this.currentState.current     = clamp(this.currentState.current,     0,   10);
    this.currentState.load        = clamp(this.currentState.load,        0,   20);
    this.currentState.temperature = clamp(this.currentState.temperature, 10,  90);
    this.currentState.beltOffset  = clamp(this.currentState.beltOffset,  -50, 50);

    return {
      timestamp:   new Date(),
      rpm:         parseFloat(this.currentState.rpm.toFixed(1)),
      current:     parseFloat(this.currentState.current.toFixed(3)),
      load:        parseFloat(this.currentState.load.toFixed(2)),
      vibration:   this.currentState.vibration === -1 ? -1 : parseFloat(this.currentState.vibration.toFixed(4)),
      temperature: parseFloat(this.currentState.temperature.toFixed(1)),
      beltOffset:  parseFloat(this.currentState.beltOffset.toFixed(1)),
      dataSource:  'demo',
    };
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

// Singleton instance
export const telemetrySimulator = new TelemetrySimulator();
