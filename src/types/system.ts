// ============================================================
// SYSTEM HEALTH TYPES
// Types for hardware device connectivity and sensor health states.
// ============================================================

export type DeviceStatus = 'online' | 'offline' | 'degraded' | 'unknown' | 'disconnected';

export interface DeviceHealth {
  id: string;
  name: string;
  type: 'microcontroller' | 'protocol' | 'sensor' | 'camera' | 'actuator' | 'network';
  status: DeviceStatus;
  lastSeen: Date | null;
  latencyMs?: number;
  detail?: string;
  icon: string;
}

export interface SystemHealth {
  overall: DeviceStatus;
  devices: DeviceHealth[];
  lastHeartbeat: Date | null;
  mqttConnected: boolean;
  wifiStrength?: number;    // dBm
  uptimeSeconds?: number;
}

export const DEVICE_DEFINITIONS: Omit<DeviceHealth, 'status' | 'lastSeen'>[] = [
  { id: 'esp32',          name: 'ESP32',           type: 'microcontroller', icon: 'cpu',            detail: 'Main controller + MQTT publisher' },
  { id: 'mqtt',           name: 'MQTT Broker',     type: 'protocol',        icon: 'radio',          detail: 'MQTT message broker connection' },
  { id: 'wifi',           name: 'Wi-Fi',           type: 'network',         icon: 'wifi',           detail: 'ESP32 wireless network link' },
  { id: 'camera',         name: 'Camera',          type: 'camera',          icon: 'camera',         detail: 'Belt tracking vision system' },
  { id: 'mpu6050',        name: 'MPU6050',         type: 'sensor',          icon: 'activity',       detail: 'Vibration & IMU sensor' },
  { id: 'current_sensor', name: 'Current Sensor',  type: 'sensor',          icon: 'zap',            detail: 'Motor current measurement' },
  { id: 'encoder',        name: 'Encoder',         type: 'sensor',          icon: 'gauge',          detail: 'RPM / speed encoder' },
  { id: 'load_cell',      name: 'Load Cell',       type: 'sensor',          icon: 'weight',         detail: 'HX711 + load cell (belt load)' },
  { id: 'ds18b20',        name: 'DS18B20',         type: 'sensor',          icon: 'thermometer',    detail: 'Temperature sensor' },
  { id: 'oled',           name: 'OLED Display',    type: 'actuator',        icon: 'monitor',        detail: 'On-device status display' },
  { id: 'buzzer',         name: 'Buzzer',          type: 'actuator',        icon: 'volume-2',       detail: 'Audible alarm output' },
];
