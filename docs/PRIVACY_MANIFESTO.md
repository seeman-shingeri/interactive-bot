# VISTA Privacy Manifesto & Data Architecture

At VISTA, privacy is not a passive settings page—it is an active architectural guarantee.

---

## 🔒 Foundational Principles

1. **Local-First Sovereign Storage**
   - All profile data, taste signals, chat logs, and memory items are saved locally on the user's system in `server/data/vista_db.json`.
   - No external trackers, telemetry, analytics beacons, or third-party cookies exist in the codebase.

2. **Visible Consent Indicators**
   - The top navigation bar always displays live status pills:
     - 👁️ **Vision Indicator:** Green when visual analysis is active; muted grey when disabled.
     - 🧠 **Memory Indicator:** Purple when personal memory retention is enabled; grey when off.
     - ⚡ **AI Engine Status:** Shows whether local heuristic processing or external Gemini API is engaged.

3. **Granular Memory Control**
   - Users can view every single observation Nova records.
   - Any individual memory can be audited, edited, or deleted in the Privacy & Memory Center.
   - Deleting a memory instantly purges it from the vector scoring algorithm.

4. **GDPR Right to be Forgotten**
   - The "Delete All Data" action in the Privacy Center immediately overwrites and truncates:
     - All chat logs
     - All taste signals and genre affinities
     - All viewing history sessions
     - All recorded visual memories
   - The action is instantaneous and irreversible.

---

## 🛡️ Data Storage Modes

VISTA supports two operational modes:

| Mode | Memory Retention | Storage Location | Use Case |
|---|---|---|---|
| **Personal Memory (Default)** | Persisted across sessions | Local JSON database | Building a personalized friendship with Nova over time |
| **Incognito / Ephemeral** | Memory kept in RAM only; discarded on exit | In-Memory volatile state | Private viewing, shared machines, or guests |
