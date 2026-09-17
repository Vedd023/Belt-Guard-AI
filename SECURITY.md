# Security Policy

## Supported Versions

Belt-Guard AI is currently in active development. The following versions receive security updates:

| Version | Supported |
|---|---|
| `main` branch | ✅ Yes |
| Older releases | ❌ No |

---

## ⚠️ Scope

Belt-Guard AI is currently a **frontend simulation / demo project**. It does **not**:
- Store user credentials
- Transmit personal data to external servers
- Connect to a live database

However, the project is designed to eventually integrate with real hardware (ESP32 over MQTT) and a backend API. Security practices are important for that future direction.

---

## 🔒 Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security issue, please report it responsibly:

1. **Email**: Send a detailed report to the project maintainer via GitHub private message or the email listed in your GitHub profile.
2. **Include in your report**:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - The potential impact
   - Any suggested fixes (optional but appreciated)

3. **Expected response time**: We aim to acknowledge reports within **48 hours** and provide a resolution timeline within **7 days**.

---

## 🛡️ Security Best Practices for Contributors

If you are contributing code that involves:

- **API keys / credentials** — Never hardcode them. Use `.env` files (which are in `.gitignore`)
- **MQTT broker connections** — Use TLS/SSL and authenticated connections in production
- **Backend endpoints** — Validate and sanitize all inputs
- **Dependencies** — Run `npm audit` before submitting a PR and fix any high/critical vulnerabilities

---

## 🔑 Environment Variables

If integrating with a real backend, sensitive values should be stored in `.env.local` (never committed):

```env
VITE_MQTT_BROKER_URL=mqtts://your-broker.example.com
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
VITE_API_BASE_URL=https://your-api.example.com
```

These files are listed in `.gitignore` and will never be pushed to the repository.

---

*Thank you for helping keep Belt-Guard AI secure.*
