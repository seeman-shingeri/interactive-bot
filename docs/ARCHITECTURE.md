# VISTA System Architecture & Interaction Diagrams

## 1. System Topology Overview

```mermaid
graph TD
    Client[React 18 + Vite Frontend]
    VP[Video Player Component]
    FS[Offscreen Frame Sampler]
    CA[Animated Companion Avatar]
    RM[Grab Control Radial Menu]
    API[Express REST API Gateway]
    PF[AI Provider Factory]
    GEM[Google Gemini 1.5/2.5 Flash]
    LOC[VISTA Local Semantic Engine]
    DB[ACID JSON/SQLite Database]

    Client --> VP
    Client --> CA
    VP -->|Canvas frame draw| FS
    FS -->|Sampled base64 + Context| API
    CA -->|2s Hold Event| RM
    API --> PF
    PF -->|Cloud Multimodal| GEM
    PF -->|Offline Deterministic| LOC
    API --> DB
```

---

## 2. Asynchronous Frame Sampling & Reaction Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Video as HTML5 Video Player
    participant Sampler as VideoFrameSampler
    participant Backend as Express API (/api/ai/reaction)
    participant Engine as AI Provider (Gemini / Local)
    participant Companion as CompanionAvatar

    User->>Video: Play Video
    loop Every 5-8 seconds or Scene Cut
        Video->>Sampler: drawImage(video, 0, 0, 384, 216)
        Sampler->>Sampler: Compute pixel luminance delta
        alt Luminance delta > 0.18 OR cooldown expired
            Sampler->>Backend: POST /api/ai/analyze-frame (base64, timestamp, scene)
            Backend->>Engine: analyzeFrame(imageBase64, context)
            Engine-->>Backend: Suggested Emotion, Comment, Taste Signal
            Backend-->>Companion: BotReaction Payload
            Companion->>Companion: Transition Emotion (e.g. Surprised / Laughing)
            Companion->>Companion: Display SpeechBubble
            Companion->>User: Play Web Speech Audio (if voice enabled)
        end
    end
```

---

## 3. Physical "Grab the Bot" 2-Second Hold Detection

```mermaid
stateDiagram-v2
    [*] --> Idle: Companion docked
    Idle --> PointerDown: User touches/clicks bot
    PointerDown --> Dragging: Moved > 8px within 2000ms
    Dragging --> Idle: Pointer released (Bot repositioned)
    PointerDown --> Charging: Held in place
    Charging --> ControlMode: 2000ms reached (Haptic feedback)
    ControlMode --> RadialMenuOpen: 10-node radial menu blooms
    RadialMenuOpen --> Idle: Option selected or backdrop clicked
    PointerDown --> ChatOpen: Released < 400ms without dragging
```

---

## 4. Sovereign Memory & Privacy Gatekeeper

```mermaid
flowchart TD
    SignalIn[User Rating / Watch Complete Event] --> CheckMem{Personal Memory Master Switch ON?}
    CheckMem -->|No| Discard[Do NOT save to profile. Session ephemeral only.]
    CheckMem -->|Yes| CheckMode{Data Storage Mode?}
    CheckMode -->|No Storage| Discard
    CheckMode -->|Session Only| RamCache[Store in volatile RAM session cache]
    CheckMode -->|Personal Memory| Persist[Recalculate Taste Profile & Persist in DB]
    Persist --> Toast[Optional Transparency Toast: 'Nova learned you enjoy...']
```
