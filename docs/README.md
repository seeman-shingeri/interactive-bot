# VISTA Documentation Index

Welcome to the comprehensive documentation suite for **VISTA** (Visual Interactive Smart Taste Assistant).

---

## 📚 Technical Specifications & Guides

| Document | Description |
|---|---|
| 🤖 [**Standalone Companion Guide**](./STANDALONE_COMPANION_GUIDE.md) | Single-file zero-dependency companion, eye saccades, and UI click features. |
| 📐 [**Taste Engine Specification**](./TASTE_ENGINE_SPEC.md) | Mathematical formulation of genre vectors, visual taste scoring, and temporal decay. |
| 🛡️ [**Privacy Manifesto**](./PRIVACY_MANIFESTO.md) | Local-first sovereign database, GDPR right to be forgotten, and real-time consent. |
| 🔒 [**Security & Deployment Guide**](./SECURITY_AND_DEPLOYMENT.md) | CSP headers, CORS policies, Docker containerization, and API key management. |
| 🏛️ [**Architecture Overview**](./ARCHITECTURE.md) | Multi-layered perception loop, Ambilight video synchronization, and component hierarchy. |
| 📡 [**REST API Reference**](./API_REFERENCE.md) | Complete documentation of all Express endpoints, payloads, and response schemas. |
| ♿ [**Accessibility & Shortcuts**](./ACCESSIBILITY_AND_SHORTCUTS.md) | Keyboard navigation, high-contrast states, and screen reader compatibility. |
| 🩺 [**Troubleshooting & Diagnostics**](./TROUBLESHOOTING.md) | Practical fixes for mic permissions, TTS audio autoplay, and stream errors. |

---

## 🧪 Verification & Running Tests

```bash
# Run 15-Point Core Verification Test
npm run test

# Run Companion State Machine & Taste Vector Unit Tests
npm run test:unit

# Run End-to-End PWA & Standalone Flow Verification
npm run test:e2e

# Run Stress & Memory Resilience Suite
npm run test:stress

# Validate Standalone Single-File HTML Bundle
npm run verify:companion

# Snapshot & Verify Database Health
npm run backup:db
```
