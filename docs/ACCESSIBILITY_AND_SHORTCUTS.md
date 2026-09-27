# VISTA Accessibility & Keyboard Navigation Guide

VISTA is designed to be accessible, intuitive, and navigable via standard keyboard controls, screen readers, and touch gestures.

---

## 1. Global Keyboard Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| `Space` | Video Player | Toggle Play / Pause |
| `M` | Companion | Mute / Unmute companion speech |
| `C` | Watch Room | Open / Close Companion Chat drawer |
| `Esc` | Radial Menu | Close Grab Control Radial Menu or Modals |
| `Enter` | Chat Input | Send dialogue message to companion |
| `Tab` / `Shift+Tab` | Global | Navigate interactive elements in visual order |

---

## 2. Touch & Gesture Controls (Mobile / Tablet)

- **Long-Press (~2 seconds)** on Companion Avatar:
  - Activates **Control Mode** and blooms the 10-node radial menu.
  - Generates subtle haptic vibration on supported devices.
- **Drag & Reposition**:
  - Drag the companion to any edge of the viewport (smoothly clamped to screen bounds).
- **Single Tap**:
  - Interacts with companion and opens dialogue panel.

---

## 3. Screen Reader & ARIA Standards

- All interactive buttons include explicit `title` and `aria-label` attributes.
- Live companion status indicators (Watching, Thinking, Speaking, Paused, Memory Off) communicate textual states for assistive technologies.
- Color alone is never the only means of conveying status (every pill combines an icon, color dot, and explicit text label).
