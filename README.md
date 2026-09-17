<div align="center">

# 🏭 Belt-Guard AI

### *AI-Powered Conveyor Belt Health Monitoring System*

**Real-time sensor fusion · Predictive fault detection · Actionable maintenance intelligence**

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.x-FF6B6B?style=flat-square)](https://recharts.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![SIH](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-f59e0b?style=flat-square&logo=gov.in)](https://www.sih.gov.in/)

</div>

---

## 🔴 The Problem

Conveyor belt systems are the backbone of industrial manufacturing, mining, and logistics. **They fail silently — and expensively.**

| Impact | Reality |
|---|---|
| 💸 **Unplanned downtime** | Costs ₹5–50 lakh per hour in heavy industries |
| 🔩 **Belt misalignment** | Most common failure mode — causes edge wear, material spillage, fire risk |
| 🌡️ **Overload & overheating** | Leads to motor burnout and belt ruptures |
| 🔧 **Reactive maintenance** | Operators only discover faults *after* a breakdown occurs |
| 🚫 **No early warning** | Traditional systems have no predictive intelligence — just on/off switches |

> **The core issue**: There is no affordable, intelligent, real-time system that fuses multiple sensor signals, detects faults early, and tells operators *exactly* what is wrong and what to do — before catastrophic failure occurs.

---

## 🟢 The Solution — Belt-Guard AI

**Belt-Guard AI** is a full-stack industrial IoT monitoring dashboard that:

1. **Ingests** live telemetry from 6 sensor channels (or simulates them faithfully)
2. **Fuses** the signals using a weighted AI risk engine to compute a 0–100 Health Score
3. **Classifies** the system state as `NORMAL`, `WARNING`, or `CRITICAL` in real time
4. **Explains** the fault — *what* is wrong, *why* the score dropped, and *what to do*
5. **Logs** all events with timestamps for maintenance history and traceability

**The result**: Operators get a single, clear, actionable number — backed by sensor-level evidence — updated every 500 ms.

---

## 🧠 How the AI Works

### Step 1 — Sensor Fusion

The system reads 6 sensors every tick. Each sensor has a **known healthy baseline** and a **fusion weight** that reflects its importance to overall belt health:

| # | Sensor | Hardware | Baseline Range | Weight | Why It Matters |
|---|---|---|---|---|---|
| 1 | **Belt Offset** | Camera (OpenCV) | ±5 px | **28%** | Primary misalignment indicator — most critical fault signal |
| 2 | **Vibration (RMS)** | MPU6050 IMU | 0.10–0.18 RMS | **22%** | Bearing wear, roller eccentricity, mechanical looseness |
| 3 | **Motor Current** | Current Sensor | 1.1–1.5 A | **18%** | Overload, drive coupling fault, motor degradation |
| 4 | **RPM** | Encoder | 115–125 RPM | **14%** | Speed anomaly, belt slip, shaft misalignment |
| 5 | **Load** | Load Cell | 0.5–3.5 kg | **10%** | Overload condition detection |
| 6 | **Temperature** | DS18B20 | 30–40 °C | **8%** | Thermal stress in motor and bearings |

### Step 2 — Deviation Scoring

For each sensor, the engine computes a **deviation score** — how far outside the healthy baseline the reading is, scaled by the sensor's weight:

```
deviationScore = clamp(distance_from_range / (range × 0.25) × weight, 0, weight)

totalRisk = sum of all 6 deviation scores  (clamped 0–1)
```

The formula is intentionally **2× more sensitive** to out-of-range values — small deviations in healthy ranges contribute minimally, but crossing a threshold causes a sharp score drop.

### Step 3 — Health Score & Risk Classification

```
Health Score (0–100) = round((1 − totalRisk) × 100)
```

| Score | Level | Meaning | Action Required |
|---|---|---|---|
| **≥ 80** | 🟢 NORMAL | All sensors within baseline | Continue normal operation |
| **60–79** | 🟡 WARNING | One or more sensors deviating | Schedule inspection soon |
| **< 60** | 🔴 CRITICAL | Significant multi-sensor deviation | **Stop conveyor immediately** |

### Step 4 — Fault Explainability

The engine doesn't just give a number. It ranks all 6 sensors by their contribution, identifies the **primary fault**, builds an **evidence list**, and generates a **human-readable recommendation**:

```
Primary Fault:   BELT MISALIGNMENT SUSPECTED
Evidence:        Belt offset: +22 px (above ±5 px threshold)
                 Vibration elevated: 0.28 RMS (above 0.18 baseline)
Recommendation:  Inspect belt alignment and roller positioning. Check belt tension.
```

### Step 5 — Anomaly Score (Isolation Forest Proxy)

In addition to the deterministic health score, each snapshot carries an **anomaly score (0–1)** derived from the total risk value — mimicking what an Isolation Forest model would output for the same reading.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         HARDWARE LAYER                          │
│   ESP32 ──► MPU6050 (vibration) · Current Sensor · Encoder     │
│              Load Cell · DS18B20 (temp) · Camera (OpenCV)       │
└───────────────────────┬─────────────────────────────────────────┘
                        │ MQTT over Wi-Fi
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER (Planned)                    │
│        MQTT Broker (HiveMQ / Mosquitto)                         │
│        Backend API — Node.js / FastAPI                          │
│        REST / WebSocket bridge → Frontend                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP / WebSocket
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (Current)                   │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ Telemetry       │    │  Risk Engine      │                   │
│  │ Simulator       │───►│  (Sensor Fusion)  │                   │
│  │ (demo mode)     │    │  Health Score 0-100│                  │
│  └─────────────────┘    └────────┬─────────┘                   │
│                                  │                              │
│  ┌───────────────────────────────▼─────────────────────────┐   │
│  │                    React Dashboard                       │   │
│  │  Dashboard · Live Monitoring · Camera Vision            │   │
│  │  AI Analytics · Events & Alerts · Maintenance           │   │
│  │  System Health · Settings                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Project File Structure

```
Belt-Guard-AI/
├── src/
│   ├── pages/
│   │   ├── DashboardPage.tsx          # Health gauge, alert banner, sensor cards
│   │   ├── LiveMonitoringPage.tsx     # Real-time time-series charts (pause/resume)
│   │   ├── CameraVisionPage.tsx       # Simulated CV belt alignment feed
│   │   ├── AIAnalyticsPage.tsx        # Anomaly score, fusion weights, explainability
│   │   ├── EventsAlertsPage.tsx       # Fault log with ACK / Resolve workflow
│   │   ├── MaintenancePage.tsx        # Predictive maintenance schedule
│   │   ├── SystemHealthPage.tsx       # Node diagnostics & comms status
│   │   └── SettingsPage.tsx           # Thresholds & configuration
│   │
│   ├── services/
│   │   ├── telemetrySimulator.ts      # Physics-based Gaussian noise + lerp engine
│   │   ├── riskEngine.ts              # Weighted sensor-fusion health-score algorithm
│   │   ├── backendApi.ts              # API stub — swap in for real ESP32 data
│   │   └── exportService.ts           # CSV telemetry export
│   │
│   ├── hooks/
│   │   ├── useTelemetry.ts            # Reactive state + 500 ms simulator tick loop
│   │   ├── useEvents.ts               # Fault event & notification management
│   │   └── useTheme.ts                # Dark / light theme persistence
│   │
│   ├── types/
│   │   ├── telemetry.ts               # TelemetrySnapshot, SensorBaseline, ConveyorProfile
│   │   ├── ai.ts                      # RiskAnalysis, SensorFusionWeight
│   │   ├── scenarios.ts               # ScenarioId, ScenarioDefinition
│   │   ├── events.ts                  # FaultEvent, Notification
│   │   └── system.ts                  # SystemHealth, NodeStatus
│   │
│   └── components/
│       ├── dashboard/                 # HealthRiskGauge, CriticalAlertBanner, ExplainabilityModal
│       ├── monitoring/                # Sensor chart widgets
│       ├── vision/                    # Camera feed simulation
│       └── common/                    # Shared UI primitives
│
├── README.md · LICENSE · CONTRIBUTING.md · SECURITY.md · CHANGELOG.md
└── vite.config.ts · package.json · tsconfig.json
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **UI Framework** | React | 19 | Component-based UI with concurrent rendering |
| **Language** | TypeScript | 6.0 | Full type safety across all services and types |
| **Build Tool** | Vite | 8.x | Lightning-fast HMR dev server + production builds |
| **Styling** | Tailwind CSS + Vanilla CSS | 4.x | Design system tokens, dark/light theming |
| **Charts** | Recharts | 3.x | Real-time sensor time-series and bar visualizations |
| **Icons** | Lucide React | 1.x | Consistent icon system across all pages |
| **Routing** | React Router DOM | 7.x | Client-side SPA routing across 8 pages |
| **Date Handling** | date-fns | 4.x | Timestamp formatting and relative time |
| **Linting** | Oxlint | 1.x | Fast Rust-based linting for TypeScript/React |

---

## ⚙️ Setup & Installation

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Git | any |

### 1. Clone & Install

```bash
git clone https://github.com/Vedd023/Belt-Guard-AI.git
cd Belt-Guard-AI
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** — the dashboard loads immediately in demo/simulation mode. No hardware or API key required.

### 3. Explore the Dashboard

Once running, use the **scenario switcher in the top header** to simulate different fault conditions:

```
Header → Scenario Dropdown → Select any of the 7 scenarios
```

### 4. Other Commands

```bash
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview the production build locally
npm run lint      # Run Oxlint static analysis
```

---

## 🎭 Demo Scenarios — Results

The system was validated across 7 distinct fault conditions. Each scenario produces a deterministic, physically-grounded response:

| Scenario | Simulated Conditions | Expected Health Score | Risk Level | Primary Fault Detected |
|---|---|---|---|---|
| ✅ Normal Operation | All sensors in baseline | **95–100** | 🟢 NORMAL | No fault |
| ↔️ Belt Misalignment | Offset +22 px, Vibration ↑, Current ↑ | **60–70** | 🟡 WARNING | BELT MISALIGNMENT SUSPECTED |
| ⚖️ Overload Condition | Load ~6.2 kg, Current ~2.4 A, RPM ↓ | **40–55** | 🔴 CRITICAL | MOTOR OVERLOAD SUSPECTED |
| 🌀 Speed Variation / Slip | RPM oscillates ±15, Belt offset unstable | **65–75** | 🟡 WARNING | SPEED ANOMALY DETECTED |
| 📳 High Vibration | Vibration ~0.38 RMS, bearing signature | **62–72** | 🟡 WARNING | MECHANICAL ANOMALY SUSPECTED |
| 🔌 Sensor Disconnect | MPU6050 offline (-1 flag), confidence ↓ | **75–85** | 🟡 WARNING | Reduced confidence flagged |
| 📵 Communication Loss | ESP32 / MQTT stream drops, data frozen | **0** | 🔴 CRITICAL | Communication Loss |

### Key Behaviours Validated

- **Fault isolation**: The engine correctly identifies the top contributing sensor in every scenario
- **Graceful degradation**: When the vibration sensor goes offline, the system reduces its weight without triggering a false alarm
- **Comms loss detection**: A complete MQTT dropout immediately drives the health score to 0 and triggers a CRITICAL alert
- **Smooth transitions**: Scenario changes use eased interpolation (lerp + ease-in-out) — no instantaneous jumps in sensor values

---

## 📸 Screenshots

> The dashboard runs in simulation mode by default — switch scenarios from the top header to see the risk engine respond in real time.

| Page | What You'll See |
|---|---|
| **Dashboard** | Health gauge (0–100), critical alert banner with fault evidence, sensor summary cards |
| **Live Monitoring** | 6 real-time scrolling time-series charts, pause/resume controls |
| **AI Analytics** | Sensor fusion weight chart, anomaly score, ranked contributor breakdown |
| **Events & Alerts** | Timestamped fault event log, acknowledge / resolve workflow |
| **Camera Vision** | Simulated CV feed showing belt alignment status |
| **Predictive Maintenance** | Component health forecast, next maintenance schedule |
| **System Health** | Node diagnostics, MQTT status, uptime counters |

*Screenshots coming soon — run `npm run dev` to see it live.*

---

## 🚀 Future Scope

### Phase 2 — Real Hardware Integration
- [ ] Flash ESP32 firmware to read MPU6050, current sensor, encoder, load cell, DS18B20
- [ ] Set up MQTT broker (HiveMQ Cloud or local Mosquitto)
- [ ] Build FastAPI backend to bridge MQTT → REST/WebSocket
- [ ] Swap `telemetrySimulator.ts` → `backendApi.ts` with a single config flag

### Phase 3 — Advanced AI
- [ ] Train a real **Isolation Forest** or **Autoencoder** model on labeled historical data
- [ ] Replace the deterministic risk engine with an ML inference API
- [ ] Add **RUL (Remaining Useful Life)** prediction using LSTM time-series models
- [ ] Adaptive baselines that self-calibrate to each conveyor's real-world profile

### Phase 4 — Production Features
- [ ] User authentication and role-based access (Operator / Engineer / Admin)
- [ ] Multi-site dashboard with map view of all conveyors
- [ ] SMS / email / push notification alerting on critical events
- [ ] PDF maintenance report generation
- [ ] Historical data storage and trend analysis (PostgreSQL / TimescaleDB)
- [ ] Mobile-responsive layout for shop-floor tablets

### Phase 5 — Edge Intelligence
- [ ] Run a lightweight TensorFlow Lite model **on the ESP32** for local fault detection
- [ ] Operate in offline mode when MQTT connectivity is lost

---

## 👥 Contributors

| Name | Role |
|---|---|
| **Ved Dixit** | Project Lead · Full-Stack Development · AI/Risk Engine |

*Want to contribute? See [CONTRIBUTING.md](CONTRIBUTING.md).*

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 🔗 Links

| Resource | Link |
|---|---|
| 📦 Repository | [github.com/Vedd023/Belt-Guard-AI](https://github.com/Vedd023/Belt-Guard-AI) |
| 📋 Contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |
| 🔒 Security | [SECURITY.md](SECURITY.md) |
| 📝 Changelog | [CHANGELOG.md](CHANGELOG.md) |

---

<div align="center">

*Built with ❤️ for Smart India Hackathon 2026*

**Making conveyor belt maintenance smarter, safer, and more predictable.**

</div>
