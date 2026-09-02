// ============================================================
// useTelemetry — Centralized Telemetry & Conveyor Control Hook
// Manages:
// - Live telemetry sensor stream & history
// - Conveyor selection (Conveyor #01, #02, #03, #04)
// - System Power (OFF / STARTING / ONLINE) with 4s buffering sequence
// - Conveyor Running State (STOPPED / STARTING / RUNNING / STOPPING)
// - Acceleration rate (0.5x, 1x, 1.5x, 2x)
// - Dynamic Risk Score & Alignment Status
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  TelemetrySnapshot,
  ConveyorId,
  SystemPower,
  ConveyorState,
  AccelerationRate,
} from '../types/telemetry';
import { CONVEYOR_PROFILES, getAlignmentInfo } from '../types/telemetry';
import type { ScenarioId } from '../types/scenarios';
import type { RiskAnalysis } from '../services/riskEngine';
import { telemetrySimulator } from '../services/telemetrySimulator';
import { computeRiskAnalysis } from '../services/riskEngine';

const HISTORY_MAX = 3600;

export interface TelemetryState {
  current:            TelemetrySnapshot | null;
  history:            TelemetrySnapshot[];
  riskAnalysis:       RiskAnalysis | null;
  isPaused:           boolean;
  scenario:           ScenarioId;
  isCommsLost:        boolean;
  isVibOffline:       boolean;
  lastUpdateMs:       number;
  updateCount:        number;

  // New Interactive State Controls
  systemPower:        SystemPower;
  startingStep:       string;
  conveyorState:      ConveyorState;
  selectedConveyorId: ConveyorId;
  acceleration:       AccelerationRate;
  alignmentInfo:      ReturnType<typeof getAlignmentInfo>;
}

export function useTelemetry() {
  const [state, setState] = useState<TelemetryState>({
    current:            null,
    history:            [],
    riskAnalysis:       null,
    isPaused:           false,
    scenario:           'normal',
    isCommsLost:        true, // Initialized as OFF / lost
    isVibOffline:       false,
    lastUpdateMs:       0,
    updateCount:        0,

    // Controls initial values
    systemPower:        'OFF',
    startingStep:       '',
    conveyorState:      'STOPPED',
    selectedConveyorId: 'conv-01',
    acceleration:       1,
    alignmentInfo:      getAlignmentInfo(0),
  });

  const pausedRef    = useRef(false);
  const lastTickRef  = useRef<number>(Date.now());
  const bufferTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Telemetry tick callback
  const tick = useCallback(() => {
    if (pausedRef.current) return;

    const now = Date.now();
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;

    const snapshot     = telemetrySimulator.tick(delta);
    const isCommsLost  = telemetrySimulator.isCommsLost();
    const isVibOffline = telemetrySimulator.isVibrationOffline();
    const risk         = computeRiskAnalysis(snapshot, isCommsLost, isVibOffline);
    const alignInfo    = getAlignmentInfo(snapshot.beltOffset);

    setState(prev => {
      const newHistory = [...prev.history, snapshot];
      if (newHistory.length > HISTORY_MAX) newHistory.shift();
      return {
        ...prev,
        current:       snapshot,
        history:       newHistory,
        riskAnalysis:  risk,
        isCommsLost,
        isVibOffline,
        alignmentInfo: alignInfo,
        lastUpdateMs:  now,
        updateCount:   prev.updateCount + 1,
      };
    });
  }, []);

  // Interval timer recalculation when acceleration or power changes
  useEffect(() => {
    if (state.systemPower === 'OFF') {
      tick(); // Single update to show OFF state
      return;
    }

    const intervalMs = Math.round(1200 / state.acceleration);
    const interval = setInterval(tick, intervalMs);
    tick(); // immediate tick

    return () => clearInterval(interval);
  }, [tick, state.acceleration, state.systemPower]);

  // Helper to clear pending buffering timers
  const clearBufferTimers = useCallback(() => {
    bufferTimerRef.current.forEach(t => clearTimeout(t));
    bufferTimerRef.current = [];
  }, []);

  // --- Interactive Control Actions ---

  // 1. Conveyor Number Selection
  const setConveyor = useCallback((id: ConveyorId) => {
    telemetrySimulator.setConveyor(id);
    setState(prev => ({
      ...prev,
      selectedConveyorId: id,
      history: [], // Clear history for clean view of new conveyor
    }));
    tick();
  }, [tick]);

  // 2. System ON / OFF Toggle with 4-second Buffering Sequence
  const setSystemPower = useCallback((power: SystemPower) => {
    clearBufferTimers();

    if (power === 'OFF') {
      telemetrySimulator.setSystemPower('OFF');
      telemetrySimulator.setConveyorState('STOPPED');
      setState(prev => ({
        ...prev,
        systemPower: 'OFF',
        conveyorState: 'STOPPED',
        startingStep: '',
        isCommsLost: true,
      }));
      tick();
      return;
    }

    if (power === 'ONLINE') {
      // Begin 4-second initialization buffering sequence
      telemetrySimulator.setSystemPower('STARTING');
      setState(prev => ({
        ...prev,
        systemPower: 'STARTING',
        startingStep: '⟳ Connecting to sensors...',
      }));

      const t1 = setTimeout(() => {
        setState(prev => ({ ...prev, startingStep: '⟳ Initializing ESP32...' }));
      }, 1000);

      const t2 = setTimeout(() => {
        setState(prev => ({ ...prev, startingStep: '⟳ Establishing MQTT connection...' }));
      }, 2200);

      const t3 = setTimeout(() => {
        setState(prev => ({ ...prev, startingStep: '⟳ Loading sensor telemetry...' }));
      }, 3300);

      const t4 = setTimeout(() => {
        telemetrySimulator.setSystemPower('ONLINE');
        setState(prev => ({
          ...prev,
          systemPower: 'ONLINE',
          startingStep: '',
          isCommsLost: false,
        }));
        tick();
      }, 4200);

      bufferTimerRef.current = [t1, t2, t3, t4];
    }
  }, [clearBufferTimers, tick]);

  // 3. Start / Stop Conveyor Action
  const setConveyorState = useCallback((targetState: ConveyorState) => {
    if (state.systemPower !== 'ONLINE') return;

    if (targetState === 'RUNNING') {
      telemetrySimulator.setConveyorState('STARTING');
      setState(prev => ({ ...prev, conveyorState: 'STARTING' }));

      const timer = setTimeout(() => {
        telemetrySimulator.setConveyorState('RUNNING');
        setState(prev => ({ ...prev, conveyorState: 'RUNNING' }));
        tick();
      }, 1500);

      bufferTimerRef.current.push(timer);
    } else if (targetState === 'STOPPED') {
      telemetrySimulator.setConveyorState('STOPPING');
      setState(prev => ({ ...prev, conveyorState: 'STOPPING' }));

      const timer = setTimeout(() => {
        telemetrySimulator.setConveyorState('STOPPED');
        setState(prev => ({ ...prev, conveyorState: 'STOPPED' }));
        tick();
      }, 1200);

      bufferTimerRef.current.push(timer);
    }
  }, [state.systemPower, tick]);

  // 4. ACC (Acceleration) Control
  const setAcceleration = useCallback((acc: AccelerationRate) => {
    telemetrySimulator.setAcceleration(acc);
    setState(prev => ({ ...prev, acceleration: acc }));
  }, []);

  // 5. Demo Mode Scenario Selector
  const setScenario = useCallback((id: ScenarioId) => {
    telemetrySimulator.setScenario(id);
    // If system is ONLINE and stopped, automatically start conveyor for demo visibility if fault scenario chosen
    if (state.systemPower === 'ONLINE' && state.conveyorState === 'STOPPED' && id !== 'normal') {
      telemetrySimulator.setConveyorState('RUNNING');
      setState(prev => ({ ...prev, scenario: id, conveyorState: 'RUNNING' }));
    } else {
      setState(prev => ({ ...prev, scenario: id }));
    }
    tick();
  }, [state.systemPower, state.conveyorState, tick]);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const pause  = useCallback(() => { pausedRef.current = true;  setState(prev => ({ ...prev, isPaused: true  })); }, []);
  const resume = useCallback(() => { pausedRef.current = false; setState(prev => ({ ...prev, isPaused: false })); }, []);

  const getHistory = useCallback((seconds: number) => {
    const cutoff = Date.now() - seconds * 1000;
    return state.history.filter(s => s.timestamp.getTime() >= cutoff);
  }, [state.history]);

  return {
    ...state,
    setConveyor,
    setSystemPower,
    setConveyorState,
    setAcceleration,
    setScenario,
    togglePause,
    pause,
    resume,
    getHistory,
  };
}
