# Standalone VISTA Companion Guide

The standalone VISTA companion (`vista-companion.html`) is a self-contained, single-file HTML/CSS/JS application that delivers Nova's entire companion experience without requiring node_modules, npm, build tooling, or a complex environment.

---

## 🌟 Key Features

1. **Zero-Dependency Architecture**
   - Pure standard HTML5, CSS3, and ES6 JavaScript.
   - Operates in any modern web browser on Windows, macOS, Linux, Android, and iOS.
   - Can be pinned to desktop, loaded in an iframe, or launched as a floating window.

2. **Visor Face Click Interaction**
   - Clicking directly on Nova's visor/face toggles the slide-out **Companion UI Interface**.
   - Contains live chat dialogue, Web Speech API speech-to-text mic input, text-to-speech audio feedback, personality sliders (Talkativeness & Humor Level), and privacy toggles.

3. **2-Second Hold Radial Quick Controls**
   - Pressing and holding on Nova activates an animated SVG progress charging ring.
   - After holding for 2 seconds, the 10-node radial menu blooms outward:
     - 💬 Open Chat
     - 🎨 Bot Studio
     - 🛡️ Privacy Controls
     - 🔇 Mute / Unmute
     - 🔄 Reset Session
     - 🎯 Re-center
     - ❌ Close Menu

4. **Biometric Eye Saccades & Physics**
   - Simulated micro-saccadic eye movements mimic natural biological eye drift.
   - Dynamic pupil dilation and mouse cursor tracking with inertia smoothing.
   - Periodic involuntary blinks and floating physics.

5. **Dual-Mode Intelligence Engine**
   - **Online Mode:** Automatically detects and connects to the local VISTA backend (`http://localhost:3001/api`).
   - **Offline / Standalone Fallback:** When the backend is offline, an intelligent local heuristic conversation and reaction engine processes dialogue natively in the browser.

---

## 🚀 How to Run

### Method 1: Direct File Execution
1. Download `vista-companion.html` via the in-app "Download Bot" modal, or download directly from GitHub.
2. Double-click `vista-companion.html` in your file explorer.
3. The companion will immediately appear in your browser.

### Method 2: Pop-Out Window Mode
From the running VISTA application:
1. Click the **"Download Bot"** button in the top navigation bar.
2. Select **"Launch Pop-Out Window"**.
3. A sleek 440x720 floating companion window will appear, perfect for positioning alongside streaming services, movies, or workspaces.

---

## 🎨 Keyboard Shortcuts & Controls

| Action | Control |
|---|---|
| Open/Close Chat Drawer | Click Nova's Face or Press `C` |
| Drag Companion | Click and drag anywhere on Nova's body |
| Radial Menu | Press and hold for 2 seconds |
| Voice Dictation | Click the microphone button in the dialogue drawer |
| Mute/Unmute Speech | Press `M` or toggle voice switch in drawer |
