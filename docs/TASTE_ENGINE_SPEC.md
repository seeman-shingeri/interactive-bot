# VISTA Taste Engine Specification

The VISTA Taste Engine models a user's entertainment preferences through passive visual observation, explicit sentiment signals, and temporal decay.

---

## 📐 Scoring Formula

The taste affinity score $S$ for a genre or aesthetic $k$ is calculated as:

$$S_k(t) = \alpha \cdot \bar{I}_k + \beta \cdot \frac{N^+_k - N^-_k}{N_k + \epsilon} \cdot e^{-\lambda(t - t_0)}$$

Where:
* $\alpha$: Weight of passive observation and dwell time ($0.4$).
* $\beta$: Weight of explicit conversational signals and feedback ($0.6$).
* $\bar{I}_k$: Normalized average visual intensity or frequency for genre/theme $k$.
* $N^+_k, N^-_k$: Number of positive vs. negative user reactions registered for genre $k$.
* $\lambda$: Temporal decay factor ($\lambda = 0.05 / \text{day}$).
* $t - t_0$: Time elapsed since the last observation in days.

---

## 🎯 Signal Ingestion Hierarchy

VISTA categorizes inputs into four levels of confidence:

| Signal Type | Weight | Description |
|---|---|---|
| **Explicit Reaction** (Laugh, Favorite, Skip) | $1.0$ | Direct user interaction via the player or companion feedback |
| **Conversational Sentiment** | $0.8$ | Natural language sentiment detected during video discussion |
| **Completion Rate** | $0.6$ | Watched $>80\%$ vs. skipped in the first 30 seconds |
| **Visual Gaze / Attention** | $0.4$ | Companion visual detection of sustained high-energy scenes |

---

## 🛡️ Privacy Constraints on Taste Profile

1. **Opt-In Learning:** If `learnVisualTaste` is disabled in privacy settings, visual cues are completely omitted from the vector calculation.
2. **Instant Deletion:** If a user deletes a memory item, the taste vector recalculated retroactively without that session's data points.
3. **No External Profiling:** All taste vectors are computed and stored strictly in the local database (`vista_db.json`).
