# 🩺 VISTA Troubleshooting & Diagnostics Guide

This guide helps resolve common platform, audio, media, and network configuration issues when running VISTA.

---

## 🎙️ 1. Microphone Access & Speech Recognition

### Issue: Companion does not transcribe voice
**Symptoms:** The microphone indicator blinks red or "Microphone access denied" appears in dialogue.

**Solutions:**
1. **Browser Permission:** Click the lock/tune icon in the browser address bar (left of `localhost:5173`) and ensure **Microphone** is toggled to **Allow**.
2. **Secure Context:** The Web Speech API requires `localhost` or an `https://` origin. Do not access via an unencrypted local IP (e.g. `http://192.168.x.x`).
3. **Browser Engine Support:** Chrome, Edge, Safari, and Brave have native speech recognition. In Firefox, text typing is used as the standard accessible fallback.

---

## 🔊 2. Companion Voice Output (Text-to-Speech)

### Issue: Voice does not speak or stops mid-sentence
**Solutions:**
1. **Autoplay Policy:** Browsers block audio playback until the user interacts with the page. Click anywhere on the screen or click Nova's face once to unlock the Web Audio context.
2. **Chromium 15-Second Cutoff:** VISTA includes a built-in keep-alive pulse (`speech.ts`) to prevent Chrome from freezing utterances.
3. **Mute Toggle:** Check if Nova is muted in the top navbar or by pressing hotkey `M`.

---

## 🎬 3. Video Playback & Custom Streams

### Issue: "Stream Unavailable or Format Error"
**Symptoms:** The video player displays the error recovery screen.

**Causes & Fixes:**
* **CORS Blocked Streams:** Some external video servers block cross-origin video embedding. Use direct MP4/WebM URLs that allow `Access-Control-Allow-Origin: *`.
* **Local Video File Uploads:** Use the **"Upload Video"** button to load any local `.mp4`, `.webm`, or `.mkv` file directly from your computer. VISTA uses zero-copy blob streaming with automatic memory disposal.

---

## 🚨 4. Recovering from an Error Boundary

If an unexpected exception occurs, VISTA's `ErrorBoundary` catches the crash and displays Nova's recovery screen.
1. Click **"Recover Companion"** to safely re-initialize the application state.
2. All saved memories, taste profiles, and personality configurations are safe in `server/data/vista_db.json`.

---

## 🧪 5. Running Health Diagnostics

You can verify the entire application stack anytime using our built-in scripts:

```bash
# 1. Run Core Verification
npm run test

# 2. Run Stress & Memory Resilience Suite
npm run test:stress

# 3. Validate Standalone Single-File Bundle
npm run verify:companion

# 4. Backup & Check Database JSON
npm run backup:db
```
