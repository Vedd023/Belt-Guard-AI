# Changelog

All notable changes to **Belt-Guard AI** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Real ESP32 hardware integration via MQTT
- Backend API (FastAPI / Node.js) bridging MQTT → REST/WebSocket
- User authentication for the dashboard
- Persistent alert history stored in a database
- Mobile-responsive layout improvements
- Automated unit and integration tests

---

## [1.0.0] — 2026-09-17

### 🎉 Initial Release — Smart India Hackathon (SIH) Demo

#### Added
- **Dashboard Page** — Health risk gauge (0–100), critical alert banner, sensor summary cards, and fault explainability modal
- **Live Monitoring Page** — Real-time sensor time-series charts with pause/resume controls
- **Camera Vision Page** — Simulated computer vision feed for belt alignment detection
- **AI Analytics Page** — Isolation Forest anomaly score, sensor contribution breakdown, and fusion weight visualization
- **Events & Alerts Page** — Timestamped fault event log with acknowledge and resolve workflow + unread notification badge
- **Predictive Maintenance Page** — Maintenance schedule forecasting based on sensor trends
- **System Health Page** — Node-level diagnostics, uptime counters, and communication status
- **Settings Page** — Configuration panel for thresholds and system preferences

#### Core Engine
- **Telemetry Simulator** — Physics-based sensor data generator using Gaussian noise + linear interpolation (lerp)
- **Risk Engine** — 6-sensor weighted fusion algorithm producing a 0–100 health score
  - Belt Offset: 28%, Vibration: 22%, Motor Current: 18%, RPM: 14%, Load: 10%, Temperature: 8%
  - Thresholds: CRITICAL < 60, WARNING < 80, NORMAL ≥ 80
- **7 Demo Scenarios** — Normal, Misalignment, Overload, Speed Variation, High Vibration, Sensor Disconnect, Communication Loss
- **4 Conveyor Profiles** — Independent baseline parameters per conveyor unit (conv-01 through conv-04)

#### Infrastructure
- **Tech Stack** — React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Recharts 3, React Router 7, Lucide React
- **Dark / Light Theme** — Full theme toggle with CSS custom properties
- **CSV Export** — One-click telemetry history export
- **Backend API Stub** — `backendApi.ts` ready for real ESP32 / MQTT integration

#### Documentation
- `README.md` — Comprehensive project documentation
- `LICENSE` — MIT License
- `CONTRIBUTING.md` — Contributor guide
- `SECURITY.md` — Security policy and responsible disclosure
- `CHANGELOG.md` — This file
- `.gitignore` — Updated with `.env` and `build/` patterns

---

[Unreleased]: https://github.com/Vedd023/Belt-Guard-AI/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Vedd023/Belt-Guard-AI/releases/tag/v1.0.0
