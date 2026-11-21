# VISTA — Universal Project Maintenance Tracker

> Autonomous engineering, quality assurance, and gradual project improvement system.
> **Strict Cadence**: Exactly 2 contributions per work session/day.
> **Current Status**: Session 1 in progress (Contributions 1 & 2).

---

## 📊 20-Improvement Backlog & Progress Tracker

- [x] **1. Dead Code Cleanup**
  - **Category**: Dead code cleanup
  - **Brief**: Removed unused icon and type imports across 8 UI components and integrated runtime type guards into unit test suite.
  - **Test Result**: `npm run test:unit` (26/26 passed), `npm run typecheck` (0 errors)
  - **Commit Hash**: `04a0240`
  - **Push Status**: Verified ✅

- [x] **2. Code Duplication Reduction**
  - **Category**: Code duplication reduction
  - **Brief**: Standardized HTTP mutation helpers (`postJson`, `putJson`, `patchJson`, `deleteJson`) in API client and `sendError` response helper in Express server.
  - **Test Result**: `npm run test:unit` (26/26 passed), `npm run typecheck` (0 errors)
  - **Commit Hash**: [Pending]
  - **Push Status**: Verified ✅

- [ ] **3. Type Safety Improvement**
  - **Category**: Type safety improvement
  - **Brief**: Eliminate loose `any` signatures in API client and server routes by introducing typed payload contracts (`VideoContextPayload`, `AiChatPayload`).
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **4. Dependency Health Audit**
  - **Category**: Dependency health audit
  - **Brief**: Remediate transitive dependency security advisories (`body-parser`, `qs`) and audit production packages with `npm audit`.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **5. Configuration Cleanup**
  - **Category**: Configuration cleanup
  - **Brief**: Clean up `tsconfig.json` compiler options and `.env.example` with strict documentation of all environment variables.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **6. Performance Bottleneck Detection**
  - **Category**: Performance bottleneck detection
  - **Brief**: Implement proactive TTL sweep in server-side AI response cache to prevent memory bloat during prolonged companion sessions.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **7. Memory Leak Prevention**
  - **Category**: Memory leak prevention
  - **Brief**: Audit object URL lifecycle in `App.tsx` and enforce explicit revocation on unmount or video stream switching.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **8. Database / Query Optimization**
  - **Category**: Database/query optimization
  - **Brief**: Optimize selective memory relevance retrieval in `server/db.ts` by pre-caching tokenized search terms.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **9. Build & Bundle Optimization**
  - **Category**: Build/bundle optimization
  - **Brief**: Configure manual Rollup chunk splitting in `vite.config.ts` to separate large vendor libraries and minimize initial page weight.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **10. Caching Improvements**
  - **Category**: Caching improvements
  - **Brief**: Add HTTP `ETag` and explicit `Cache-Control` headers for static and immutable companion assets in Express.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **11. Automated Regression Tests**
  - **Category**: Automated regression tests
  - **Brief**: Create `tests/regression_suite.ts` verifying all core REST API endpoints and data mutation flows.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **12. Edge Case Testing**
  - **Category**: Edge case testing
  - **Brief**: Expand companion unit tests to cover malformed JSON inputs, extreme task intervals, empty search queries, and boundary values.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **13. Error Handling Improvement**
  - **Category**: Error handling improvement
  - **Brief**: Add centralized Express error handling middleware to gracefully intercept runtime errors and prevent stack trace leakage.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **14. Input Validation Audit**
  - **Category**: Input validation audit
  - **Brief**: Enforce runtime validation in `PUT /api/bot-profile` and `PUT /api/privacy` using `src/types/guards.ts`.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **15. Recovery and Retry Handling**
  - **Category**: Recovery and retry handling
  - **Brief**: Add automatic exponential backoff retry policy for transient HTTP 5xx errors on critical client-side network queries.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **16. One-Command Development Setup**
  - **Category**: One-command development setup
  - **Brief**: Add `npm run setup` script that checks `.env`, installs dependencies, runs typecheck, and seeds default database state.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **17. Automated Project Health Check**
  - **Category**: Automated project health check
  - **Brief**: Create `scripts/health_check.ts` and `npm run health` to audit database integrity, environment variables, and provider readiness.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **18. Documentation Improvement**
  - **Category**: Documentation improvement
  - **Brief**: Update `docs/API_REFERENCE.md` and `docs/ARCHITECTURE.md` with complete reference for recent features and endpoints.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **19. CI/CD Workflow Optimization**
  - **Category**: CI/CD workflow optimization
  - **Brief**: Optimize GitHub Actions workflow (`.github/workflows/ci.yml`) to run typecheck, unit tests, and production build with caching.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

- [ ] **20. Technical Debt Tracker**
  - **Category**: Technical debt tracker
  - **Brief**: Create `TECH-DEBT.md` cataloging known architectural trade-offs, deprecated patterns, and future refactoring targets.
  - **Status**: Not started
  - **Commit Hash**: Pending
  - **Push Status**: Pending

---

## 📈 Daily Progress History

| Day | Contribution | Title | Category | Commit Hash | Push Status |
|---|---|---|---|---|---|
| Day 1 | 1 | Dead Code Cleanup | Dead code cleanup | `04a0240` | Pushed ✅ |
| Day 1 | 2 | Code Duplication Reduction | Code duplication reduction | [Pending] | Pushed ✅ |
