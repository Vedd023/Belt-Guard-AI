// ============================================================
// useTelemetry — Centralized Telemetry & Conveyor Control Hook
// Manages:
// - Live telemetry sensor stream & history
// - Conveyor selection
// - System Power (OFF / STARTING / ONLINE)
// - Conveyor Running State
// - Acceleration rate
// - Backend AI risk analysis
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';

import type {
  TelemetrySnapshot,
  ConveyorId,
  SystemPower,
  ConveyorState,
  AccelerationRate,
} from '../types/telemetry';

import { getAlignmentInfo } from '../types/telemetry';

import type { ScenarioId } from '../types/scenarios';

import type { RiskAnalysis } from '../services/riskEngine';

import {
  telemetrySimulator,
} from '../services/telemetrySimulator';

import {
  computeRiskAnalysis,
} from '../services/riskEngine';

import {
  sendSensorData,
  type BackendSensorPayload,
} from '../services/backendApi';


const HISTORY_MAX = 3600;


export interface TelemetryState {
  current: TelemetrySnapshot | null;
  history: TelemetrySnapshot[];
  riskAnalysis: RiskAnalysis | null;

  isPaused: boolean;
  scenario: ScenarioId;

  isCommsLost: boolean;
  isVibOffline: boolean;

  lastUpdateMs: number;
  updateCount: number;

  systemPower: SystemPower;
  startingStep: string;

  conveyorState: ConveyorState;
  selectedConveyorId: ConveyorId;

  acceleration: AccelerationRate;

  alignmentInfo: ReturnType<typeof getAlignmentInfo>;
}


export function useTelemetry() {

  const [state, setState] = useState<TelemetryState>({
    current: null,
    history: [],
    riskAnalysis: null,

    isPaused: false,
    scenario: 'normal',

    isCommsLost: true,
    isVibOffline: false,

    lastUpdateMs: 0,
    updateCount: 0,

    systemPower: 'OFF',
    startingStep: '',

    conveyorState: 'STOPPED',
    selectedConveyorId: 'conv-01',

    acceleration: 1,

    alignmentInfo: getAlignmentInfo(0),
  });


  const pausedRef = useRef(false);

  const lastTickRef = useRef<number>(Date.now());

  const bufferTimerRef =
    useRef<ReturnType<typeof setTimeout>[]>([]);

  // Smooth the health gauge so small sensor fluctuations
  // do not cause large visual jumps between readings.
  const smoothedHealthRef = useRef<number | null>(null);


  // ============================================================
  // TELEMETRY TICK
  // ============================================================

  const tick = useCallback(() => {

    if (pausedRef.current) return;


    const now = Date.now();

    const delta =
      now - lastTickRef.current;

    lastTickRef.current = now;


    // Generate simulator telemetry
    const snapshot =
      telemetrySimulator.tick(delta);


    const simulatorCommsLost =
      telemetrySimulator.isCommsLost();

    const isVibOffline =
      telemetrySimulator.isVibrationOffline();


    const alignInfo =
      getAlignmentInfo(snapshot.beltOffset);


    // Keep local risk calculation as fallback
    const localRisk =
      computeRiskAnalysis(
        snapshot,
        simulatorCommsLost,
        isVibOffline
      );


    // ============================================================
    // SEND SENSOR DATA TO PYTHON BACKEND
    // ============================================================

    const backendPayload: BackendSensorPayload = {
      device_id: 'CONV_01',

      timestamp:
        new Date(now).toISOString(),

      temperature:
        snapshot.temperature,

      rpm:
        snapshot.rpm,

      vibration:
        snapshot.vibration,
    };


    sendSensorData(backendPayload)

      .then((backendResponse) => {

        const backendAnalysis =
          backendResponse.analysis;


        // Convert backend status to frontend risk level
        const backendLevel =
          backendAnalysis.overall_status === 'Normal'
            ? 'normal'
            : backendAnalysis.overall_status === 'Warning'
              ? 'warning'
              : 'critical';


        // Backend returns a RISK score (0 = healthy, 100 = critical).
        // Frontend displays a HEALTH score (100 = healthy, 0 = critical).
        const rawHealth =
          100 - backendAnalysis.risk_score;

        // Exponential smoothing prevents noisy sensor readings
        // from making the health gauge jump rapidly.
        if (smoothedHealthRef.current === null) {
          smoothedHealthRef.current = rawHealth;
        } else {
          const alpha = 0.20;

          smoothedHealthRef.current =
            smoothedHealthRef.current +
            alpha *
            (rawHealth - smoothedHealthRef.current);
        }

        const combinedRisk: RiskAnalysis = {
          ...localRisk,

          score:
            Math.round(smoothedHealthRef.current),

          level:
            backendLevel,

          label:
            backendAnalysis.overall_status,

          primaryFault:
            backendAnalysis.alerts.length > 0
              ? backendAnalysis.alerts[0]
              : 'No active fault',

          evidence:
            backendAnalysis.alerts,

          recommendation:
            backendAnalysis.overall_status === 'Critical'
              ? 'Inspect conveyor system and schedule maintenance.'
              : backendAnalysis.overall_status === 'Warning'
                ? 'Monitor conveyor condition closely.'
                : 'Continue normal operation.',
        };


        setState(prev => {

          const newHistory =
            [...prev.history, snapshot];


          if (newHistory.length > HISTORY_MAX) {
            newHistory.shift();
          }


          return {
            ...prev,

            current: snapshot,

            history: newHistory,

            riskAnalysis: combinedRisk,

            isCommsLost: false,

            isVibOffline,

            alignmentInfo: alignInfo,

            lastUpdateMs: now,

            updateCount:
              prev.updateCount + 1,
          };
        });

      })


      // ============================================================
      // BACKEND FAILURE FALLBACK
      // ============================================================

      .catch((error) => {

        console.error(
          'Backend connection failed:',
          error
        );


        // If Python backend is unavailable,
        // keep the existing frontend simulator working.

        setState(prev => {

          const newHistory =
            [...prev.history, snapshot];


          if (newHistory.length > HISTORY_MAX) {
            newHistory.shift();
          }


          return {
            ...prev,

            current: snapshot,

            history: newHistory,

            riskAnalysis: localRisk,

            isCommsLost: true,

            isVibOffline,

            alignmentInfo: alignInfo,

            lastUpdateMs: now,

            updateCount:
              prev.updateCount + 1,
          };
        });

      });

  }, []);


  // ============================================================
  // TELEMETRY TIMER
  // ============================================================

  useEffect(() => {

    if (state.systemPower === 'OFF') {

      tick();

      return;
    }


    const intervalMs =
      Math.round(
        1200 / state.acceleration
      );


    const interval =
      setInterval(
        tick,
        intervalMs
      );


    tick();


    return () =>
      clearInterval(interval);

  }, [
    tick,
    state.acceleration,
    state.systemPower,
  ]);


  // ============================================================
  // BUFFER TIMER CLEANUP
  // ============================================================

  const clearBufferTimers =
    useCallback(() => {

      bufferTimerRef.current.forEach(
        timer => clearTimeout(timer)
      );

      bufferTimerRef.current = [];

    }, []);


  // ============================================================
  // CONVEYOR SELECTION
  // ============================================================

  const setConveyor =
    useCallback((id: ConveyorId) => {

      telemetrySimulator.setConveyor(id);

      setState(prev => ({
        ...prev,

        selectedConveyorId: id,

        history: [],
      }));

      tick();

    }, [tick]);


  // ============================================================
  // SYSTEM POWER
  // ============================================================

  const setSystemPower =
    useCallback((power: SystemPower) => {

      clearBufferTimers();


      // ----------------------------------------------------------
      // POWER OFF
      // ----------------------------------------------------------

      if (power === 'OFF') {

        telemetrySimulator.setSystemPower('OFF');

        telemetrySimulator.setConveyorState(
          'STOPPED'
        );


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


      // ----------------------------------------------------------
      // POWER ON
      // ----------------------------------------------------------

      if (power === 'ONLINE') {

        telemetrySimulator.setSystemPower(
          'STARTING'
        );


        setState(prev => ({
          ...prev,

          systemPower: 'STARTING',

          startingStep:
            '⟳ Connecting to sensors...',
        }));


        const t1 =
          setTimeout(() => {

            setState(prev => ({
              ...prev,

              startingStep:
                '⟳ Initializing ESP32...',
            }));

          }, 1000);


        const t2 =
          setTimeout(() => {

            setState(prev => ({
              ...prev,

              startingStep:
                '⟳ Establishing MQTT connection...',
            }));

          }, 2200);


        const t3 =
          setTimeout(() => {

            setState(prev => ({
              ...prev,

              startingStep:
                '⟳ Loading sensor telemetry...',
            }));

          }, 3300);


        const t4 =
          setTimeout(() => {

            telemetrySimulator.setSystemPower(
              'ONLINE'
            );


            setState(prev => ({
              ...prev,

              systemPower: 'ONLINE',

              startingStep: '',

              isCommsLost: false,
            }));


            tick();

          }, 4200);


        bufferTimerRef.current =
          [t1, t2, t3, t4];
      }

    }, [
      clearBufferTimers,
      tick,
    ]);


  // ============================================================
  // CONVEYOR START / STOP
  // ============================================================

  const setConveyorState =
    useCallback(
      (targetState: ConveyorState) => {

        if (
          state.systemPower !== 'ONLINE'
        ) {
          return;
        }


        // --------------------------------------------------------
        // START
        // --------------------------------------------------------

        if (
          targetState === 'RUNNING'
        ) {

          telemetrySimulator.setConveyorState(
            'STARTING'
          );


          setState(prev => ({
            ...prev,

            conveyorState:
              'STARTING',
          }));


          const timer =
            setTimeout(() => {

              telemetrySimulator.setConveyorState(
                'RUNNING'
              );


              setState(prev => ({
                ...prev,

                conveyorState:
                  'RUNNING',
              }));


              tick();

            }, 1500);


          bufferTimerRef.current.push(timer);
        }


        // --------------------------------------------------------
        // STOP
        // --------------------------------------------------------

        else if (
          targetState === 'STOPPED'
        ) {

          telemetrySimulator.setConveyorState(
            'STOPPING'
          );


          setState(prev => ({
            ...prev,

            conveyorState:
              'STOPPING',
          }));


          const timer =
            setTimeout(() => {

              telemetrySimulator.setConveyorState(
                'STOPPED'
              );


              setState(prev => ({
                ...prev,

                conveyorState:
                  'STOPPED',
              }));


              tick();

            }, 1200);


          bufferTimerRef.current.push(timer);
        }

      },
      [
        state.systemPower,
        tick,
      ]
    );


  // ============================================================
  // ACCELERATION
  // ============================================================

  const setAcceleration =
    useCallback(
      (acc: AccelerationRate) => {

        telemetrySimulator.setAcceleration(
          acc
        );


        setState(prev => ({
          ...prev,

          acceleration: acc,
        }));

      },
      []
    );


  // ============================================================
  // DEMO SCENARIO
  // ============================================================

  const setScenario =
    useCallback(
      (id: ScenarioId) => {

        telemetrySimulator.setScenario(id);

        // Reset the smoothed health so the gauge jumps immediately
        // to reflect the new scenario rather than slowly drifting.
        smoothedHealthRef.current = null;

        if (
          state.systemPower === 'ONLINE' &&
          state.conveyorState === 'STOPPED' &&
          id !== 'normal'
        ) {

          telemetrySimulator.setConveyorState(
            'RUNNING'
          );


          setState(prev => ({
            ...prev,

            scenario: id,

            conveyorState:
              'RUNNING',
          }));

        } else {

          setState(prev => ({
            ...prev,

            scenario: id,
          }));

        }


        tick();

      },
      [
        state.systemPower,
        state.conveyorState,
        tick,
      ]
    );


  // ============================================================
  // PAUSE / RESUME
  // ============================================================

  const togglePause =
    useCallback(() => {

      pausedRef.current =
        !pausedRef.current;


      setState(prev => ({
        ...prev,

        isPaused:
          !prev.isPaused,
      }));

    }, []);


  const pause =
    useCallback(() => {

      pausedRef.current = true;


      setState(prev => ({
        ...prev,

        isPaused: true,
      }));

    }, []);


  const resume =
    useCallback(() => {

      pausedRef.current = false;


      setState(prev => ({
        ...prev,

        isPaused: false,
      }));

    }, []);


  // ============================================================
  // HISTORY
  // ============================================================

  const getHistory =
    useCallback(
      (seconds: number) => {

        const cutoff =
          Date.now() -
          seconds * 1000;


        return state.history.filter(
          snapshot =>
            snapshot.timestamp.getTime() >= cutoff
        );

      },
      [state.history]
    );


  // ============================================================
  // RETURN
  // ============================================================

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