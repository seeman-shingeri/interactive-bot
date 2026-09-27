# Contributing to VISTA

Thank you for contributing to VISTA (Visual Interactive Smart Taste Assistant)!
We welcome improvements, new video channels, additional AI providers, and UI enhancements.

---

## 1. Development Workflow

1. **Clone the repository**:
   ```bash
   git clone https://github.com/seeman-shingeri/interactive-bot.git
   cd interactive-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Environment**:
   ```bash
   npm run dev
   ```
   - Vite client runs at `http://localhost:5173`
   - Express server runs at `http://localhost:3001`

---

## 2. Adding a New Video Channel

To add a new curated video source:
1. Open [`src/data/sampleVideos.ts`](file:///src/data/sampleVideos.ts).
2. Append a new `VideoItem` adhering to the schema:
   ```typescript
   {
     id: 'unique-id',
     title: 'Title of Video',
     category: 'Category Name',
     duration: 180,
     thumbnailUrl: 'https://...',
     videoUrl: 'https://...',
     description: '...',
     genres: ['Genre1', 'Genre2'],
     themes: ['Theme1'],
     visualStyles: ['Style1'],
     chapters: [{ time: 0, title: 'Intro' }],
     scenes: [...],
     transcript: [...]
   }
   ```

---

## 3. Implementing a New AI Provider

VISTA utilizes a pluggable `AIProvider` contract:
1. Review [`server/ai/types.ts`](file:///server/ai/types.ts).
2. Create your provider class implementing `AIProvider` (`analyzeFrame`, `analyzeScene`, `generateReaction`, `chat`, etc.).
3. Register the provider in [`server/ai/providerFactory.ts`](file:///server/ai/providerFactory.ts).

---

## 4. Running Verification Tests

Before submitting a Pull Request, ensure all automated verification tests pass:
```bash
npx tsx test_suite.ts
npx tsx tests/simulation_suite.ts
npm run build
```
