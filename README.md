<div align="center">

<img src="https://img.shields.io/badge/Belt--Guard--AI-Industrial%20Intelligence-0ea5e9?style=for-the-badge&logo=databricks&logoColor=white" alt="Belt-Guard-AI" height="40"/>

<h1>🏭 Belt-Guard AI</h1>

<p><strong>Real-Time Conveyor Belt Monitoring & Predictive Fault Detection System</strong></p>
<p><em>An AI-powered industrial dashboard that fuses multi-sensor telemetry to compute live health scores, detect anomalies, and prevent costly equipment failures before they happen.</em></p>

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.x-FF6B6B?style=flat-square&logo=chartdotjs&logoColor=white)](https://recharts.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

**Belt-Guard AI** is a full-stack industrial IoT dashboard designed for real-time health monitoring of conveyor belt systems. Built as part of **Smart India Hackathon (SIH)**, it simulates the kind of live telemetry pipeline an ESP32-based sensor node would stream over MQTT — without requiring physical hardware to demonstrate.

The system ingests 6 sensor channels simultaneously, runs them through a **weighted sensor-fusion risk engine**, and surfaces actionable fault diagnoses with explainability — all updated live in the browser every ~500 ms.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **AI Risk Engine** | Weighted sensor-fusion algorithm computes a 0–100 health score in real time, classifying as `NORMAL`, `WARNING`, or `CRITICAL` |
| 📡 **6-Sensor Telemetry** | Monitors Belt Offset (px), Vibration (RMS), Motor Current (A), RPM, Load (kg), Temperature (°C) |
| 🎭 **7 Demo Scenarios** | Simulate Normal, Misalignment, Overload, Speed Variation, High Vibration, Sensor Disconnect, and Communication Loss |
| 🏭 **4 Conveyor Profiles** | Switch between 4 independent conveyor units, each with their own baseline parameters |
| 📷 **Camera Vision Module** | Simulated computer vision feed for visual belt alignment detection |
| 📊 **AI Analytics Page** | Isolation Forest anomaly scoring, sensor contribution breakdown, and fusion weight visualization |
| 🔔 **Events & Alerts** | Timestamped fault event log with acknowledge/resolve workflow and unread notification badge |
| 🔧 **Predictive Maintenance** | Maintenance schedule forecasting based on real-time sensor trends |
| 💪 **System Health Page** | Node-level diagnostics, uptime counters, and communication status |
| 🌙 **Dark / Light Theme** | Full theme toggle with smooth transitions |
| 📤 **CSV Export** | One-click telemetry history export |

---

## 🏗️ Architecture

```
Belt-Guard-AI/
├── src/
│   ├── pages/                      # Full-page route components
│   │   ├── DashboardPage.tsx       # Main overview — health gauge, alerts, sensor cards
│   │   ├── LiveMonitoringPage.tsx  # Real-time sensor charts (pause/resume)
│   │   ├── CameraVisionPage.tsx    # Simulated CV belt alignment feed
│   │   ├── AIAnalyticsPage.tsx     # Anomaly scores, explainability, fusion weights
│   │   ├── EventsAlertsPage.tsx    # Fault event log with ACK/Resolve
│   │   ├── MaintenancePage.tsx     # Predictive maintenance schedule
│   │   ├── SystemHealthPage.tsx    # Node diagnostics & comms status
│   │   └── SettingsPage.tsx        # Configuration & thresholds
│   │
│   ├── services/
│   │   ├── telemetrySimulator.ts   # Physics-based sensor data generator (Gaussian noise + lerp)
│   │   ├── riskEngine.ts           # Weighted sensor-fusion health-score computation
│   │   ├── backendApi.ts           # API client stub for real ESP32 integration
│   │   └── exportService.ts        # Telemetry CSV export
│   │
│   ├── hooks/
│   │   ├── useTelemetry.ts         # Reactive telemetry state + simulator tick loop
│   │   ├── useEvents.ts            # Fault event & notification management
│   │   └── useTheme.ts             # Dark/light theme persistence
│   │
│   ├── components/
│   │   ├── dashboard/              # HealthRiskGauge, CriticalAlertBanner, SensorSummaryCards
│   │   ├── monitoring/             # Live chart widgets
│   │   ├── vision/                 # Camera feed simulation
│   │   └── common/                 # Shared UI primitives
│   │
│   ├── types/                      # TypeScript type definitions (telemetry, AI, scenarios)
│   ├── context/                    # React context providers
│   ├── layouts/                    # Sidebar & TopHeader shell
│   └── utils/                      # Helper functions
│
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🧠 Risk Engine — How It Works

The core of Belt-Guard AI is the **Sensor Fusion Risk Engine** (`src/services/riskEngine.ts`). It combines 6 sensor channels using configurable fusion weights to produce a single health score:

```
Health Score (0–100) = (1 − totalRisk) × 100
```

**Fusion Weights:**

| Sensor | Weight | Rationale |
|---|---|---|
| Belt Offset | **28%** | Primary misalignment indicator |
| Vibration (RMS) | **22%** | Mechanical anomaly / bearing wear proxy |
| Motor Current | **18%** | Overload & drive fault indicator |
| RPM | **14%** | Speed anomaly detection |
| Load | **10%** | Overload condition |
| Temperature | **8%** | Thermal stress monitoring |

**Risk Thresholds:**

```
Score ≥ 80  →  🟢 NORMAL    — Continue operation
Score 60–79 →  🟡 WARNING   — Schedule inspection
Score < 60  →  🔴 CRITICAL  — Stop conveyor immediately
```

Each fault is surfaced with a **primary fault label**, ranked **evidence list**, and an **actionable recommendation** — ready for a maintenance operator to act on.

---

## 🎭 Demo Scenarios

Belt-Guard AI ships with 7 switchable simulation scenarios to showcase the full fault detection range:

| Scenario | What it simulates |
|---|---|
| ✅ **Normal** | All sensors within baseline — Health ≈ 95–100 |
| ↔️ **Misalignment** | Belt drifts +22 px, elevated vibration & current |
| ⚖️ **Overload** | Load +6.5 kg, current surge, RPM drop, temperature rise |
| 🌀 **Speed Variation** | RPM oscillates sinusoidally, belt offset drifts |
| 📳 **High Vibration** | Vibration spikes to 0.45 RMS — bearing wear scenario |
| 🔌 **Sensor Disconnect** | MPU6050 vibration sensor goes offline (-1 flag) |
| 📵 **Communication Loss** | ESP32 MQTT stream drops — all data frozen, score → 0 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Vedd023/Belt-Guard-AI.git
cd Belt-Guard-AI

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 6 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 4 + Vanilla CSS |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **Routing** | React Router DOM 7 |
| **Linting** | Oxlint |
| **Date Handling** | date-fns 4 |

---

## 📡 Hardware Integration (Planned)

The `backendApi.ts` service is designed as a drop-in replacement for the simulator. When real ESP32 hardware is connected:

1. **ESP32** reads sensors (MPU6050 for vibration, current sensor, encoder for RPM, load cell, thermistor, and camera module for belt offset)
2. **MQTT Broker** (e.g., HiveMQ / Mosquitto) receives live sensor packets
3. **Backend API** (Node.js / FastAPI) bridges MQTT → REST/WebSocket
4. **Belt-Guard AI frontend** switches from `telemetrySimulator` → `backendApi` with a single config flag

```
ESP32 Hardware  ──►  MQTT Broker  ──►  Backend API  ──►  Belt-Guard AI Dashboard
   (Sensors)           (HiveMQ)        (REST/WS)           (React + Vite)
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Smart India Hackathon**

*Making conveyor belt maintenance smarter, safer, and more predictable.*

</div>
