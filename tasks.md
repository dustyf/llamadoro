# Llamadoro Tasks

Ordered execution list. Each task is sized for one focused session. Complete in order unless noted. Acceptance criteria are verification steps, not just "code compiles."

**Art volume strategy:** Phase 3 generates 10 first-pass llamas to support development. Phase 10 scales up to the full 45. Same approach for personality lines — write 10 sets in Phase 4, complete the rest in Phase 10.

---

## Phase 1 — Skeleton + Spikes + Storefront Paperwork

### 1.1 Aesthetic spike — generate samples
- **Description:** Generate sample llamas in 2-3 candidate aesthetic directions (e.g., watercolor, flat illustration, storybook gouache). For each direction, generate at least 2 different llamas × 3 states (focus / break / idle) = 6 images per direction.
- **Files:** `docs/aesthetic-spike/{direction-name}/*.png`
- **Acceptance:** Per direction, 6 images exist showing 2 distinct llamas across all 3 states. No code yet.

### 1.2 Aesthetic spike — judge against rubric
- **Description:** Score each candidate direction against the 4-question rubric: (1) would you post one to your personal feed? (2) would you pay $2.99 as a stranger? (3) do two llamas in this style look like one set? (4) does one llama across states look like one character? All four must be honest yeses.
- **Files:** `docs/aesthetic-spike/decision.md`
- **Acceptance:** Decision document names the winning direction and explains why. If no direction passes, decision is "switch to commissioned art" — document next step. Style guide for the winning direction written: prompt template, palette, crop, framing.

### 1.3 Live Activities feasibility spike
- **Description:** Stand up a "hello world" Live Activity in an Expo + EAS dev build on a real iPhone 14 Pro+. Use community `expo-live-activity` or equivalent config plugin. Document what worked, what didn't.
- **Files:** `docs/live-activities-spike/notes.md`, throwaway spike branch
- **Acceptance:** A Live Activity successfully appears on the lock screen and in the Dynamic Island during a test trigger. If it doesn't work cleanly, the notes document the decision: drop Live Activities from v1, or commit to `expo prebuild` / bare workflow.

### 1.3b Asset pipeline spec
- **Description:** Write the production spec for llama and accessory assets *before* generating anything beyond spike samples. Cover: canvas dimensions, transparent background convention, exact accessory anchor coordinates (head / neck / prop), naming convention (`{llama-id}-{state}.webp`), color space (sRGB), max file size per asset, dark/light-mode compatibility, native widget extension asset sharing (App Groups for iOS), and a one-time review checklist. Should be done *after* the aesthetic spike winner is picked (so dimensions match the chosen style) and *before* any large-volume art generation.
- **Files:** `docs/asset-pipeline.md`
- **Acceptance:** Spec document exists, reviewed, and at least one spike-output llama has been re-exported to confirm the spec works in practice. Pipeline survives the production of one full llama (3 states + 1 accessory composed).

### 1.3c Widget extension target stub + native code commit policy
- **Description:** Create the iOS widget extension target as a "Hello World" stub during the Phase 1 Live Activities spike. Configure: bundle ID for the extension, App Group identifier (e.g., `group.com.dustyf.llamadoro`), entitlements files for both main app and extension, provisioning profiles. Commit `ios/` and `android/` to git as source of truth. Document in `CLAUDE.md` that `expo prebuild --clean` must NOT be run after this point — it would wipe widget extension Swift code. The extension renders a placeholder ("Llamadoro coming soon") until Phase 8 wires it up.
- **Files:** `ios/LlamadoroWidget/`, `ios/Llamadoro.entitlements`, `ios/LlamadoroWidget/LlamadoroWidget.entitlements`, `app.config.ts` (App Group plugin config), `CLAUDE.md`, `.gitignore` (remove ios/android exclusion)
- **Acceptance:** Stub extension installs alongside the main app in an EAS dev build. App Group is wired in both entitlements files. CLAUDE.md documents the no-`prebuild --clean` rule. `ios/` and `android/` are tracked in git.

### 1.4 Initialize Expo project
- **Description:** Create the Expo TypeScript project with expo-router at the repo root.
- **Files:** `package.json`, `tsconfig.json`, `app.config.ts`, `app/_layout.tsx`, `app/index.tsx`, `.gitignore`
- **Acceptance:** `npx expo start` boots, iOS simulator and Android emulator both render the default route. Repo committed.

### 1.5 Folder structure
- **Description:** Create the `src/` tree from the roadmap with stub `index.ts` files. Configure TypeScript path aliases.
- **Files:** entire `src/` tree per roadmap; `tsconfig.json` (paths)
- **Acceptance:** Directory tree matches roadmap. Path aliases (`@/components/*`, etc.) resolve in a sample import.

### 1.6 ESLint + Prettier
- **Description:** Set up linting and formatting with Expo-recommended config.
- **Files:** `.eslintrc.js`, `.prettierrc`, `package.json` scripts
- **Acceptance:** `npm run lint` and `npm run format` work. Optional: husky + lint-staged pre-commit hook.

### 1.7 Zustand + AsyncStorage persist adapter
- **Description:** Install dependencies and write the persist adapter for Zustand backed by AsyncStorage.
- **Files:** `src/lib/storage/zustandPersist.ts`, `package.json`
- **Acceptance:** A throwaway store using the adapter survives app reload with persisted state intact.

### 1.8 Theme + design tokens
- **Description:** Define color, spacing, and typography constants. Wire light/dark theme detection.
- **Files:** `src/constants/colors.ts`, `src/constants/spacing.ts`, `src/constants/typography.ts`, `src/components/ui/Screen.tsx`, `src/components/ui/Text.tsx`
- **Acceptance:** Switching device dark mode flips the app's theme without restart.

### 1.9 Apple Developer Program enrollment
- **Description:** Pay $99, complete enrollment.
- **Files:** N/A (external)
- **Acceptance:** Apple Developer account is active; App Store Connect accessible.

### 1.10 Google Play Developer account
- **Description:** Pay $25, complete identity verification.
- **Files:** N/A (external)
- **Acceptance:** Play Console accessible.

### 1.11 Paid apps agreements
- **Description:** Initiate App Store Connect Paid Apps agreement, Google Play merchant setup, banking + tax forms.
- **Files:** N/A (external)
- **Acceptance:** Agreements visible as "pending" or "active" in both consoles.

### 1.12 RevenueCat project setup
- **Description:** Create RevenueCat account + project + stub iOS and Android app entries.
- **Files:** N/A (external)
- **Acceptance:** RC project exists with both app entries. API keys saved.

---

## Phase 2 — Background-Safe Timer Core

### 2.1 EAS dev build setup
- **Description:** Configure EAS, create dev client profile, build for iOS and Android.
- **Files:** `eas.json`, `app.config.ts` (bundle IDs, plugins)
- **Acceptance:** Dev client installed on a physical iPhone and physical Android device. App loads from `npx expo start --dev-client`.

### 2.2 Install expo-notifications + request permissions
- **Description:** Add the package, configure Android notification channel at app start.
- **Files:** `src/lib/notifications/setup.ts`, `app/_layout.tsx`
- **Acceptance:** Permission prompt appears on iOS first call. Android channel exists (verify via device settings).

### 2.3 Timer engine (pure functions)
- **Description:** Pure functions for computing remaining time, advancing phases, determining session end, applying long-break-every-N rule.
- **Files:** `src/lib/timer/engine.ts`, `src/lib/timer/engine.test.ts`
- **Acceptance:** Unit tests cover countdown math, phase transitions (work → break → work), long-break rule. All green.

### 2.4 Timer Zustand store with idempotent commit
- **Description:** Store with `{ sessionId, phaseIndex, phase, endTimestamp, remainingMs, notificationId, liveActivityId, lastCommittedKey }` and actions start / pause / resume / reset / skip. **All phase-completion side effects go through a single function `commitPhaseCompletion({ sessionId, phaseIndex, phase })`** — it records `lastCommittedKey = "{sessionId}:{phaseIndex}"`, no-ops if called twice with the same key. Foreground tick, AppState reconciliation, notification handler, and cold-launch recovery all call this function. Tick state (the displayed remaining time) lives in-memory only; only the bookmark (`sessionId`, `phaseIndex`, `endTimestamp`, `phase`, `notificationId`, `liveActivityId`) is persisted, and only on phase transitions / pause / resume — NOT on tick.
- **Files:** `src/stores/timer.ts`, `src/stores/timer.test.ts`
- **Acceptance:** Store actions update state correctly. Tick mutations don't trigger AsyncStorage writes (verify by instrumenting the persist adapter). Calling `commitPhaseCompletion` twice with the same `{sessionId, phaseIndex}` only commits side effects once. Test fires foregrounded completion and immediately-after AppState reconciliation: stats incremented exactly once.

### 2.5 Notification scheduling integration
- **Description:** Schedule notification on start, cancel on pause/reset, reschedule on resume. Phase-aware copy.
- **Files:** `src/lib/notifications/schedule.ts`, `src/stores/timer.ts`
- **Acceptance:** Start a 15-second session, lock device, notification arrives on time. Pause mid-session, no notification arrives at original end time.

### 2.6 AppState reconciliation
- **Description:** On `AppState` change to 'active', check if `Date.now() >= endTimestamp` and commit phase transition.
- **Files:** `src/hooks/useAppStateReconcile.ts`, `app/_layout.tsx`
- **Acceptance:** Start a 20-second session, background app, wait 30 seconds, return — app shows next phase correctly. No double-counting.

### 2.7 End-to-end timer verification on device
- **Description:** Bare-bones UI (countdown text + start/pause/reset) to verify the whole stack works.
- **Files:** `app/index.tsx`
- **Acceptance:** Real 25-minute session on physical iPhone and Android, screen off for >10 min, alert fires on time, returning to app shows break phase.

### 2.8 Notification-permission-denied flow
- **Description:** Detect when the user denies notification permissions (or has them revoked later). Show a persistent in-app banner on the timer screen explaining "background alerts need notification permission" with a deep-link to system Settings → app permissions. Foreground timer continues to work normally.
- **Files:** `src/lib/notifications/permissionStatus.ts`, `src/components/timer/PermissionBanner.tsx`, `app/index.tsx`
- **Acceptance:** Deny permissions on iPhone in Settings → app starts → banner appears on timer screen. Tap banner → opens iOS Settings to the app's notification page. Same on Android. Foreground timer still ticks correctly with banner shown.

### 2.9 Persist timer bookmark to survive force-kill
- **Description:** Add minimal persistence to the timer store: `{ endTimestamp, phase, notificationId, liveActivityId, remainingMs }`. Survives cold launch after force-kill. AppState reconciliation hook reads from this bookmark on launch. Cleared on session end, pause, or reset.
- **Files:** `src/stores/timer.ts`, `src/hooks/useAppStateReconcile.ts`
- **Acceptance:** Start a 5-minute session, force-kill the app (swipe-away), wait 1 minute, relaunch — timer shows correct remaining time. Force-kill after end time has passed, relaunch — timer commits the missed phase transition and updates stats.

### 2.10 Tests for timer lifecycle edge cases
- **Description:** Integration tests covering: AppState reconciliation when session ended while backgrounded; notification cancellation correctness (pause → no phantom alert); force-kill recovery from persisted bookmark; clock-change during session (system clock advanced or reversed mid-session); rapid start/pause/resume cycles.
- **Files:** `src/lib/timer/lifecycle.test.ts`, test fixtures
- **Acceptance:** All tests pass. Each named scenario above has at least one test case.

---

## Phase 3 — UI Shell + Llama Catalog (Real Art)

### 3.1 Navigation structure
- **Description:** Set up expo-router tabs: Timer / Gallery / Stats / Settings.
- **Files:** `app/_layout.tsx`, `app/(tabs)/_layout.tsx`
- **Acceptance:** All four screens navigable. Active tab highlight works. Safe areas correct on iPhone with notch and on Android with status bar.

### 3.2 Generate first 10 llamas (real art)
- **Description:** Per the Phase 1.2 winning style guide, generate 10 first-pass llamas — each with focus / break / idle states. These are the "MVP llamas" used through Phase 9 development.
- **Files:** `src/assets/llamas/{id}-{state}.png`
- **Acceptance:** 30 images exist (10 llamas × 3 states). All consistent with the style guide. File sizes optimized (<150KB each at this pass).

### 3.3 Llama catalog scaffolding
- **Description:** Define types and populate `data/llamas.ts` with 45 entries — first 10 reference real art from 3.2, remaining 35 reference placeholder art (a single placeholder image is fine).
- **Files:** `src/types/llama.ts`, `src/data/llamas.ts`, `src/assets/llamas/placeholder.png`
- **Acceptance:** 45 entries total. Each has id, name, tier, unlock condition, 3 art refs, personality voice tag. Tier split: 5 starter + 5 earnable + 35 paid.

### 3.4 Llamas store
- **Description:** Zustand store tracking active llama ID, equipped accessories (Phase 9 wiring), unlock state. Persisted.
- **Files:** `src/stores/llamas.ts`
- **Acceptance:** Setting active llama persists across cold launches. Default to first starter llama. Unlock state defaults to "starters unlocked, rest locked."

### 3.5 Timer screen visual with LlamaStage
- **Description:** Large `LlamaStage` component that switches between focus / break / idle images based on timer phase. Circular progress ring around countdown. Start/pause/reset controls. Phase label.
- **Files:** `app/index.tsx`, `src/components/timer/LlamaStage.tsx`, `src/components/timer/TimerRing.tsx`, `src/components/timer/TimerControls.tsx`, `src/components/timer/SessionLabel.tsx`
- **Acceptance:** Looks intentional in both light and dark mode on iPhone and Android. State switches between focus/break/idle when timer phase changes (transitions can be a hard cut for now; cross-fade in Phase 4). Ring updates smoothly.

### 3.5b expo-image as default image component
- **Description:** Install `expo-image` and replace RN's default `Image` across `LlamaStage`, gallery cards, and any other llama art rendering. Configure cache policy (`cachePolicy="memory-disk"`), placeholder strategy (blurhash or low-res placeholder), and content fit. Preload only the active llama + nearby gallery rows to avoid mounting all 45 full-resolution images at once.
- **Files:** `src/components/timer/LlamaStage.tsx`, `src/components/gallery/LlamaCard.tsx`, `package.json`
- **Acceptance:** No RN default `Image` imports in app code (verify via grep). Gallery scrolls smoothly with 45 cells on a 2-3 year old device in release build. Memory profile shows reasonable footprint (not all 45×3 = 135 images loaded simultaneously).

### 3.6 Gallery screen (with FlashList)
- **Description:** Scrollable grid of llamas using `@shopify/flash-list` rather than vanilla FlatList — significantly better with image-heavy cells and 45 items. Tap to set active. Locked llamas (paid + not-yet-unlocked) show a lock badge. Tapping a free unlocked llama updates active. Tapping a locked llama is a no-op for now (gating in Phase 7).
- **Files:** `app/gallery.tsx`, `src/components/gallery/LlamaCard.tsx`, `src/components/gallery/LlamaGrid.tsx`, `src/components/gallery/LockBadge.tsx`, `package.json`
- **Acceptance:** All 45 llamas render. Scroll is smooth (no dropped frames) on a 2-3 year old phone. Free unlocked tap → active updates → timer screen shows new llama. Locked tap → no-op (placeholder for paywall).

### 3.7 Settings screen scaffold
- **Description:** Layout for theme, sound, haptics, reduced motion, keep-awake, custom interval inputs, long-break inputs. Only theme toggle wired this phase.
- **Files:** `app/settings.tsx`, `src/components/ui/SettingRow.tsx`, `src/components/ui/Toggle.tsx`
- **Acceptance:** Theme toggle works and persists. Other rows render but inert.

### 3.8 Stats screen scaffold
- **Description:** Layout with placeholder data: today, week, 30-day chart, current streak, longest streak, total. Pick a chart library (e.g., `victory-native`).
- **Files:** `app/stats.tsx`, `src/components/stats/StatCard.tsx`, `src/components/stats/MonthChart.tsx`, `src/components/stats/StreakBadge.tsx`
- **Acceptance:** Visually complete with hardcoded data. Chart library installed and rendering.

### 3.9 Empty states + first-run onboarding
- **Description:** Design and implement empty states for screens that need them — especially the Stats screen for users with zero sessions. Options: hero llama with "let's get started" copy + CTA back to timer; or hide the Stats tab until first session is complete. Also: first-launch experience — what does the user see the very first time they open Llamadoro? Brief onboarding (1-2 screens max) introducing the timer and the active starter llama, then drop them on the timer screen ready to start.
- **Files:** `app/stats.tsx`, `app/index.tsx` (first-launch flag), `src/components/stats/EmptyState.tsx`, `src/components/onboarding/Welcome.tsx`, `src/stores/settings.ts` (hasCompletedOnboarding flag)
- **Acceptance:** Fresh install on a new device: launch → onboarding screen → tap "let's go" → timer screen with first starter llama active. Visit Stats screen before first session → see designed empty state, not a blank chart. After completing one session, Stats shows real numbers.

---

## Phase 4 — Personality + State Animations

### 4.1 Personality line catalog (first 10 llamas)
- **Description:** Write personality lines for the 10 MVP llamas: 3 categories (greeting / completion / streak-break) × ~3 variants each = ~90 lines total. Lines may be AI-assisted but voice-edited.
- **Files:** `src/data/llamas.ts` (extend entries with `personality.lines`)
- **Acceptance:** Each of the 10 MVP llamas has 3 categories with 3 variants each. Tone is consistent with the voice spine decided alongside the aesthetic.

### 4.2 Personality firing logic
- **Description:** `lib/personality/` module with a `pickLine(llamaId, category)` selector and firing triggers wired to timer events.
- **Files:** `src/lib/personality/index.ts`, `src/stores/timer.ts` (fire on transitions)
- **Acceptance:** Session start fires a greeting line. Session completion fires a completion line. Breaking a streak (starting a session and the calendar gap to the last work session is more than 1 day — i.e., at least one full day was skipped per the rule in roadmap.md) fires a streak-break line. Random variant within category.

### 4.3 PersonalityLine UI overlay
- **Description:** Animated text overlay on the LlamaStage. Fades in, holds ~3 seconds, fades out.
- **Files:** `src/components/personality/PersonalityLine.tsx`, `src/components/timer/LlamaStage.tsx` (integration)
- **Acceptance:** Lines render readably over both light and dark llama art. Animation is smooth. Respects reduced-motion (snap in/out instead of fade if reduced motion).

### 4.4 State transition cross-fade
- **Description:** Cross-fade between focus / break / idle states on LlamaStage. 250-400ms duration.
- **Files:** `src/components/timer/LlamaStage.tsx`
- **Acceptance:** Phase change triggers a smooth cross-fade, not a hard cut. Reduced-motion skips the fade.

### 4.5 Idle ambient motion
- **Description:** Subtle breathing scale (1.0 → 1.02 on a 4-second cycle) + occasional blinks (eye-mask opacity dip every 6-10 seconds).
- **Files:** `src/components/timer/LlamaStage.tsx` (Reanimated)
- **Acceptance:** Idle llamas feel alive without being distracting. Reduced-motion path disables both.

### 4.6 Reduced-motion respect (audit)
- **Description:** Verify reduced-motion setting (system or app-level) disables transitions and ambient motion. State changes still happen — just without animation.
- **Files:** `src/hooks/useReducedMotion.ts`, audit all motion sites
- **Acceptance:** Enabling reduced motion in iOS Settings → Accessibility → Motion (or app toggle) immediately removes all animations from the app.

---

## Phase 5 — Settings + Stats Persistence

### 5.1 Settings store
- **Description:** Zustand store for `{ workMinutes, breakMinutes, longBreakMinutes, longBreakEvery, soundEnabled, hapticsEnabled, keepAwake, reducedMotion, theme }`. Persisted.
- **Files:** `src/stores/settings.ts`
- **Acceptance:** All settings survive cold launch. Free-tier defaults: 25/5/15/4.

### 5.2 Wire settings UI to store
- **Description:** Connect toggles and inputs to settings store. Custom interval inputs and long-break inputs visually disabled for free tier (gating in Phase 7).
- **Files:** `app/settings.tsx`
- **Acceptance:** Toggles flip state, persist, and affect runtime behavior. Disabled inputs show explanation text.

### 5.3 Sound playback
- **Description:** expo-av wrapper that preloads and plays the session-end chime. Use a tasteful stock chime for v1.
- **Files:** `src/lib/sound/index.ts`, `src/assets/sounds/session-end.mp3`
- **Acceptance:** Session end plays sound if enabled, silent if disabled. No audio glitches on rapid start/end cycles.

### 5.4 Haptics
- **Description:** expo-haptics wrapper, triggered at phase transitions.
- **Files:** `src/lib/haptics/index.ts`
- **Acceptance:** Phase transitions produce a haptic on iPhone and Android when enabled, none when disabled.

### 5.5 expo-keep-awake integration
- **Description:** Activate keep-awake during active sessions if setting enabled.
- **Files:** `src/hooks/useKeepAwakeDuringSession.ts`, `app/index.tsx`
- **Acceptance:** Screen stays on during active session, sleeps normally when paused or idle.

### 5.6 Stats store with versioned schema
- **Description:** Zustand store with session log `Array<{ completedAt: number, durationMs: number, type: 'work' | 'shortBreak' | 'longBreak' }>` and `version: 1`. Persisted. **Only `type: 'work'` entries count toward stats rollups, streaks, and milestone unlocks** — short and long break completions are logged but ignored by everything downstream. Apply the same `version` + migration pattern to settings, llamas, and purchases stores (each gets a `version: 1` and an explicit hydration migration function, even if v1 is a no-op).
- **Files:** `src/stores/stats.ts`, `src/stores/settings.ts`, `src/stores/llamas.ts`, `src/stores/purchases.ts`
- **Acceptance:** Completing a work session appends to log. Cold launch retains log. All four persisted stores have version fields and migration hooks (even if no-op). Stats rollups verifiably exclude break sessions.

### 5.7 Stats rollups (selectors)
- **Description:** Selectors for today / week / 30-day series / current streak / longest streak / total all-time. Local-device midnight for day boundaries. **Streak rule:** a day counts toward the streak if it contains ≥1 completed work session between local midnight boundaries. Streak breaks fire when starting a new session and the calendar gap to the last work session is more than 1 day. No 24h-grace logic — calendar days only.
- **Files:** `src/stores/stats.ts` (selectors), `src/lib/stats/rollups.ts`, `src/lib/stats/rollups.test.ts`
- **Acceptance:** Unit tests cover: timezone edge cases (session at 11:59pm vs 12:01am), DST transitions, manual clock changes, streak boundary (skip 1 day = break, same day twice = still streak of 1, two consecutive days = streak of 2). All green.

### 5.8 Wire stats screen to real data
- **Description:** Replace hardcoded placeholders with store-derived values.
- **Files:** `app/stats.tsx`
- **Acceptance:** Real sessions update stats in real time. Persistence verified across restart.

### 5.9 Sentry crash reporting
- **Description:** Install `sentry-expo` (or current equivalent), initialize at app start in `_layout.tsx`. Configure to send crashes, unhandled promise rejections, and JS errors. No user identifiers attached. Verify a deliberately-thrown error appears in the Sentry dashboard.
- **Files:** `app/_layout.tsx`, `src/lib/sentry/init.ts`, `app.config.ts`, `package.json`
- **Acceptance:** Trigger a thrown error in dev → appears in Sentry dashboard within ~1 min with full stack trace. Production builds report similarly. No PII leaks (verify by checking what Sentry sees).

---

## Phase 6 — Collection Mechanic + Milestones

### 6.1 Milestones catalog
- **Description:** Define unlock thresholds. Proposed: 10 / 50 / 200 sessions, 7 / 30-day streaks. Each milestone names a specific llama to unlock.
- **Files:** `src/data/milestones.ts`
- **Acceptance:** Milestones defined. Each references a real llama ID. Tunable in one place.

### 6.2 Unlock state + persisted unlock queue in llamas store
- **Description:** Extend llamas store with `unlockedIds: string[]`, `pendingUnlockIds: string[]`, and `shownUnlockIds: string[]` (NOT `Set` — doesn't JSON-serialize through Zustand persist). Actions: `addUnlock(id)` pushes to both `unlockedIds` and `pendingUnlockIds`; `consumeNextPendingUnlock()` removes from `pendingUnlockIds` and adds to `shownUnlockIds`. The celebration modal consumes one at a time; queue survives force-kill mid-celebration.
- **Files:** `src/stores/llamas.ts`, `src/stores/llamas.test.ts`
- **Acceptance:** Starter llamas always unlocked. Multiple unlocks from one session land in `pendingUnlockIds` in order. Force-kill mid-celebration: relaunch shows the next pending modal. Once a llama is in `shownUnlockIds` it never re-celebrates.

### 6.3 Milestone detection on session end
- **Description:** After each completed **work** session (not break, not long-break), evaluate milestones against current stats. If a milestone fires, unlock the corresponding llama and queue the celebration. Includes test for milestone *not* firing on break/longBreak completion.
- **Files:** `src/lib/unlocks/detect.ts`, `src/lib/unlocks/detect.test.ts`, `src/stores/timer.ts` (call on work session complete only)
- **Acceptance:** Completing the 10th work session unlocks the designated llama. Once-only — completing the 11th doesn't re-fire. Completing a break or long-break never triggers milestone detection. Tests verify all three.

### 6.4 New-unlock celebration modal (with queue consumption)
- **Description:** `/unlock.tsx` modal showing newly unlocked llama art, name, and an introductory personality line. Consumes from `pendingUnlockIds[]` one at a time via `consumeNextPendingUnlock()` on dismiss. If pending queue is non-empty on app launch, modal opens automatically. Multiple-unlocks-from-one-session result in back-to-back modals.
- **Files:** `app/unlock.tsx`, `src/components/unlock/UnlockCelebration.tsx`
- **Acceptance:** Modal opens automatically when pending queue is non-empty. Shows the next pending llama. Tap-to-dismiss advances the queue. With 3 unlocks queued from one session: 3 modals shown back-to-back, each with the correct llama. Force-killing between modal 1 and modal 2: relaunch resumes modal 2. Once `shownUnlockIds` records a llama, it never re-shows.

### 6.5 Gallery reflects unlock state
- **Description:** Locked-by-milestone llamas show a different lock badge than paid-locked ones (e.g., "Unlock at 50 sessions" vs "Locked — tap to unlock"). Newly unlocked llamas appear without lock.
- **Files:** `app/gallery.tsx`, `src/components/gallery/LlamaCard.tsx`
- **Acceptance:** Visually distinct lock states. Tapping a milestone-locked llama shows the requirement (not the paywall).

---

## Phase 7 — RevenueCat + Paywall

### 7.1 Create IAP products in stores
- **Description:** `llamadoro_full_unlock` non-consumable, $2.99, in App Store Connect and Google Play Console.
- **Files:** N/A (external)
- **Acceptance:** Products visible in both consoles, "Ready to Submit" or equivalent.

### 7.2 Configure RevenueCat dashboard
- **Description:** Link products to RC. Create `fullUnlock` entitlement attached to both products.
- **Files:** N/A (external)
- **Acceptance:** RC dashboard shows products + entitlement mapped. API keys retrieved.

### 7.3 Install react-native-purchases
- **Description:** Add via Expo plugin, configure with API keys.
- **Files:** `app.config.ts`, `src/lib/purchases/init.ts`, `package.json`
- **Acceptance:** New EAS dev build installs cleanly. SDK initializes without errors.

### 7.4 Purchases store with stale-cache refresh policy
- **Description:** Zustand store `{ entitlements: { fullUnlock: boolean }, status, lastSyncedAt }`. Cache is *optimistic*. Sync runs on every cold launch AND on every `AppState` → `active` transition (debounced to avoid hammering RC on rapid backgrounding). If cache is older than 7 days AND device is offline, show a "couldn't verify purchase" banner but keep premium features functional. On refund / revocation, next sync removes premium silently.
- **Files:** `src/stores/purchases.ts`, `src/lib/purchases/listener.ts`, `src/lib/purchases/refresh.ts`, `src/hooks/usePurchasesRefresh.ts`
- **Acceptance:** Fresh install → `fullUnlock: false`. Sandbox purchase → updates within seconds via listener. AppState → active triggers refresh; refresh while offline updates `status` but not entitlements. Refund-then-launch (sandbox flow with revoked entitlement) removes premium. Cache older than 7 days + offline shows the banner.

### 7.5 useEntitlements hook
- **Description:** Hook returning `{ hasFullUnlock, isPaid, refresh }`.
- **Files:** `src/hooks/useEntitlements.ts`
- **Acceptance:** Returns correct values in components. `refresh()` triggers a fresh sync.

### 7.6 Gate paid llamas
- **Description:** Tapping a paid-locked llama opens the paywall. Non-paid users can't set a paid llama as active.
- **Files:** `app/gallery.tsx`, `src/components/gallery/LlamaCard.tsx`
- **Acceptance:** Free user tap on paid-locked → paywall opens. Paid user tap → llama becomes active.

### 7.7 Gate custom intervals + long-break controls
- **Description:** Free-tier locked to 25/5/15/4. Paid tier can edit. Tapping a disabled input opens the paywall.
- **Files:** `app/settings.tsx`
- **Acceptance:** Free user sees disabled inputs with explanation; tap → paywall. Paid user edits flow into timer engine.

### 7.8 Paywall screen
- **Description:** Modal screen showing price, value props (full gallery, custom intervals, long breaks, accessories), Purchase + Restore buttons.
- **Files:** `app/paywall.tsx`, `src/components/paywall/Paywall.tsx`, `src/components/paywall/ValueProps.tsx`
- **Acceptance:** Sandbox purchase completes on iOS and Android. Restore Purchases works on fresh install with same sandbox account.

### 7.9 Restore Purchases in settings
- **Description:** Explicit "Restore Purchases" row in settings (App Review requirement).
- **Files:** `app/settings.tsx`
- **Acceptance:** Tap → RC restore call → entitlements update → success or "nothing to restore" feedback.

### 7.10 Offline entitlement test
- **Description:** Verify cached entitlement keeps premium unlocked when offline.
- **Files:** N/A (verification)
- **Acceptance:** Paid sandbox user — turn off wifi and cellular, cold launch, premium features still work.

---

## Phase 8 — Live Activities + Dynamic Island + Widgets

### 8.1 Live Activity native target wire-up (extension already stubbed in Phase 1)
- **Description:** Widget extension target already exists from Phase 1 stub (task 1.3c). Wire it up with full LA + widget code. Verify App Groups still work, entitlements still sign correctly. No new target creation — just code inside the existing target.
- **Files:** `ios/LlamadoroWidget/LlamadoroWidget.swift`, `ios/LlamadoroWidget/LiveActivity.swift`, `app.config.ts` (no changes expected)
- **Acceptance:** EAS build still succeeds. App still runs. Existing widget stub replaced with real implementation.

### 8.2 Live Activity start/update/end with OS-rendered countdown
- **Description:** RN-side bridge calls into native LA to start (with `startDate` + `endDate` + phase metadata), update on phase transitions ONLY (work→break, pause, resume — not every tick), end on session complete or reset. Native side uses `Text(timerInterval:)` for the countdown so iOS renders it without any bridge calls. Total `update()` calls per session: 4-8 max, well inside ActivityKit's rate budget.
- **Files:** `src/lib/liveActivities/index.ts`, `ios/LlamadoroWidget/LiveActivity.swift`, `src/stores/timer.ts` (integration via commitPhaseCompletion)
- **Acceptance:** Starting a session on iPhone 14 Pro+ shows a Live Activity that ticks on the lock screen without any RN bridge traffic (verify with native logs). Phase transitions trigger exactly one `update()` call. Total updates over a 25/5/25 cycle: ≤4. No throttling warnings from ActivityKit.

### 8.2b Live Activity orphan cleanup on cold launch
- **Description:** On every cold launch (in `_layout.tsx` startup), enumerate `Activity<LlamadoroAttributes>.activities` via the native bridge. For each active Activity, compare against the persisted timer bookmark. End any orphans that don't match an active session.
- **Files:** `src/lib/liveActivities/cleanup.ts`, `ios/LlamadoroWidget/Cleanup.swift`, `app/_layout.tsx`
- **Acceptance:** Start a session, force-kill app while LA is showing. Relaunch the app (no active session in bookmark): the orphan LA is ended within 1 second. Test verifies the enumerate-and-reap logic.

### 8.3 Dynamic Island compact layout
- **Description:** Compact-leading + compact-trailing views for the Dynamic Island: small llama avatar + remaining time.
- **Files:** `ios/LlamadoroWidget/CompactView.swift`
- **Acceptance:** During an active session, the compact layout renders with a recognizable llama and the current countdown.

### 8.4 Dynamic Island expanded layout
- **Description:** Expanded view: larger llama art (current state) + phase label + remaining time + progress ring.
- **Files:** `ios/LlamadoroWidget/ExpandedView.swift`
- **Acceptance:** Long-press / hover on the Dynamic Island shows the expanded layout. Updates as the timer progresses.

### 8.5 Dynamic Island minimal layout
- **Description:** Minimal layout (shown when another Live Activity is active): single small icon.
- **Files:** `ios/LlamadoroWidget/MinimalView.swift`
- **Acceptance:** Minimal layout renders a llama silhouette or time digit.

### 8.6 Lock-screen Live Activity layout
- **Description:** Full lock-screen card: llama art (current state) + phase + remaining time + progress ring.
- **Files:** `ios/LlamadoroWidget/LockScreenView.swift`
- **Acceptance:** On the lock screen during an active session, the card renders cleanly and updates.

### 8.7 iOS home-screen widget (small + medium)
- **Description:** Active llama in idle pose + today's session count. Two sizes.
- **Files:** `ios/LlamadoroWidget/HomeWidget.swift`
- **Acceptance:** Added to home screen, both sizes render correctly. Updates when active llama changes or session completes.

### 8.8 iOS lock-screen widget
- **Description:** Circular and rectangular complications: session count + llama silhouette.
- **Files:** `ios/LlamadoroWidget/LockWidget.swift`
- **Acceptance:** Available in the lock-screen widget picker. Renders. Updates daily.

### 8.9 Android home-screen widget (Glance)
- **Description:** Active llama + today's session count. Glance / AppWidget API.
- **Files:** `android/app/src/main/java/.../LlamadoroWidget.kt`
- **Acceptance:** Added to Android home screen, renders correctly, updates on session completion.

### 8.10 Widget data publishing (App Group)
- **Description:** Bridge from RN to native: write active llama ID, today's session count, and current timer phase to the App Group shared UserDefaults (iOS — group identifier already configured in Phase 1.3c) and SharedPreferences (Android). Widgets read from these on every refresh.
- **Files:** `src/lib/widgets/publish.ts`, `ios/LlamadoroWidget/SharedStore.swift`, `android/app/src/main/java/.../SharedStore.kt`
- **Acceptance:** Changing active llama in-app immediately updates widget on next refresh (verify both platforms). Session completion updates today's count in the widget. App Group is read-write from both targets without permission errors.

### 8.11 Widget asset strategy — pre-bundled thumbnails
- **Description:** Llama thumbnails for the widget extension live in the extension's own `Assets.xcassets` (iOS) and `res/drawable/` (Android). One ~80-120px PNG/WebP per llama × per state. Total ~135 small assets (~few hundred KB). Sync between main app and extension art happens at build time, not runtime. Symbolic silhouette fallback if a specific thumbnail is missing.
- **Files:** `ios/LlamadoroWidget/Assets.xcassets/*`, `android/app/src/main/res/drawable/*`, build script in `scripts/sync-widget-assets.sh`
- **Acceptance:** All 45 llamas have widget-extension thumbnails for each of 3 states. Build script regenerates thumbnails from the master art when run. Fallback silhouette renders correctly when a thumbnail is missing.

---

## Phase 9 — Accessories

### 9.1 Generate accessory art
- **Description:** Generate 8-12 accessories in the established aesthetic, distributed across head / neck / prop slots. Each must compose cleanly on any llama at the defined anchor points.
- **Files:** `src/assets/accessories/*.png`
- **Acceptance:** All 8-12 accessories exist as transparent PNGs. Manual visual check on 3+ different llamas confirms composition works for each.

### 9.2 Accessories catalog
- **Description:** Define types and populate `data/accessories.ts`.
- **Files:** `src/types/accessory.ts`, `src/data/accessories.ts`
- **Acceptance:** All accessories cataloged with id, name, slot, art ref, tier, unlock condition. Tier split: most paid, 2-3 earned via deeper milestones (e.g., 100-session, 60-day streak).

### 9.3 LlamaStage composition pipeline
- **Description:** Extend LlamaStage to compose equipped accessories on top of llama art. Absolute-positioned overlay stack at known anchor points per slot.
- **Files:** `src/components/timer/LlamaStage.tsx`, `src/components/gallery/LlamaCard.tsx`
- **Acceptance:** Accessory renders at the correct position on top of any llama, in any state. Z-order: llama → neck → head → prop (or whatever ordering looks right).

### 9.4 Equipped accessories state per llama
- **Description:** Extend llamas store: each llama has `equipped: { head?: id, neck?: id, prop?: id }`. Persisted.
- **Files:** `src/stores/llamas.ts`
- **Acceptance:** Each llama remembers its equipped accessories independently. Persistence works.

### 9.5 Accessory picker UI
- **Description:** Per-llama accessory picker in the gallery (or as a modal from the timer screen). Shows accessories grouped by slot; tap to equip/unequip.
- **Files:** `src/components/gallery/AccessoryPicker.tsx`
- **Acceptance:** User can equip a hat on Pedro, a scarf on Beatrix, and see both render correctly on the timer screen.

### 9.6 Earned vs paid accessory gating
- **Description:** Paid accessories show lock; tap → paywall. Earned accessories show "Unlock at X sessions" lock; tap → no-op until earned.
- **Files:** `src/components/gallery/AccessoryPicker.tsx`
- **Acceptance:** Free user can't equip paid accessories. Paid user can. Earned accessories unlock automatically at milestone.

---

## Phase 10 — Art Volume + Polish

### 10.1 Generate remaining 35 llamas
- **Description:** Per the locked style guide, generate the remaining ~35 llamas, each with all 3 states. Re-roll and curate aggressively to maintain style consistency at volume.
- **Files:** `src/assets/llamas/*.png`
- **Acceptance:** Total 45 llamas × 3 states = 135 base images. All consistent with the style guide. Manual visual review: shuffle the gallery, every llama feels like part of the same set.

### 10.2 Optimize all 45 llamas
- **Description:** Compress, convert to WebP if helpful, ensure file sizes are reasonable.
- **Files:** `src/assets/llamas/*.png` (or `.webp`)
- **Acceptance:** Target <100KB per llama state. Total llama asset weight under bundle-budget headroom.

### 10.3 Write personality lines for remaining llamas
- **Description:** Write personality lines for the 35 non-MVP llamas. 3 categories × ~3 variants each = ~315 more lines. AI-assist okay, voice-edit every line.
- **Files:** `src/data/llamas.ts`
- **Acceptance:** Every llama has 3 categories with 3 variants. Spot-check: random llama feels distinct from neighboring entries.

### 10.4 App icon + splash screen
- **Description:** Design icon and splash featuring one hero llama. Generate all required sizes.
- **Files:** `src/assets/icon.png`, `src/assets/splash.png`, `app.config.ts`
- **Acceptance:** Icon visible on home screen, splash on launch. Both look intentional on iOS and Android.

### 10.5 Accessibility audit
- **Description:** VoiceOver labels for every llama (name + voice description), every button, every interactive element. Dynamic-type support on stats screen. Reduced-motion path verified end-to-end.
- **Files:** Audit across all screens; add `accessibilityLabel` props
- **Acceptance:** Navigate the entire app with VoiceOver enabled and accomplish a full session, change active llama, view stats. Dynamic type at largest setting doesn't break any layout. Reduced motion produces a usable app.

### 10.6 Performance pass
- **Description:** Profile timer screen, gallery scroll, paywall open. Fix jank.
- **Files:** Varies
- **Acceptance:** Timer screen sustains 60fps with active ambient motion. Gallery scrolls smoothly with all 45 llamas. No frame drops on paywall transitions.

### 10.7 Bundle size audit
- **Description:** Check final app size. If approaching limits (iOS .ipa ~200MB soft limit, Android base APK 100MB hard limit), consider WebP, deferred asset loading, or CDN delivery.
- **Files:** N/A (audit + potential `app.config.ts` changes)
- **Acceptance:** iOS .ipa under 100MB, Android .aab base APK under 50MB.

### 10.8 Final visual identity review
- **Description:** Sit with the app for a week. Use it daily. Note what feels off. Fix what matters.
- **Files:** Varies
- **Acceptance:** Personal use confirms the app feels like the product imagined at the start. If not, identify the gap and decide: fix, defer, or accept.

---

## Phase 11 — Store Assets + Submission

### 11.1 Privacy policy
- **Description:** Write privacy policy ("Llamadoro collects no personal data"). Host on GitHub Pages or similar.
- **Files:** `docs/privacy.md`, public URL
- **Acceptance:** Privacy policy URL loads publicly.

### 11.2 App Store listing copy
- **Description:** Title, subtitle, description, keywords, category, age rating, support URL.
- **Files:** N/A (App Store Connect)
- **Acceptance:** All required listing fields filled.

### 11.3 Google Play listing copy
- **Description:** Same content adapted for Play Store length limits and format.
- **Files:** N/A (Play Console)
- **Acceptance:** All required listing fields filled.

### 11.4 Screenshots
- **Description:** Generate screenshots at required sizes: iPhone 6.7", 6.5", 5.5"; Android phone, 7" tablet, 10" tablet. Show: timer with llama, gallery, stats, Live Activity / Dynamic Island, paywall.
- **Files:** `docs/screenshots/`
- **Acceptance:** All required device sizes uploaded to both stores.

### 11.5 App Privacy + Data Safety forms
- **Description:** Apple's App Privacy questionnaire and Google's Data Safety form. Honestly declare SDK behavior: **diagnostic data** (Sentry — crash reports, device info, OS version, stack traces) and **purchase data** (RevenueCat — anonymous purchase ID, entitlement state). Both categories declared as "Not Linked to User Identity" since the app has no accounts. Nothing collected for advertising or analytics-of-user-behavior.
- **Files:** N/A (external — but reference the SDKs' privacy documentation: Sentry's data collection page and RevenueCat's privacy page).
- **Acceptance:** Both forms submitted and accepted. Declarations match actual SDK behavior verifiable in dev tools (network inspector confirms the categories of data leaving the device).

### 11.6 EAS production build profiles
- **Description:** Configure production profiles for iOS and Android.
- **Files:** `eas.json`
- **Acceptance:** `eas build --profile production --platform ios` and `--platform android` both succeed.

### 11.7 TestFlight beta
- **Description:** Upload iOS production build to TestFlight, distribute to 2-3 testers.
- **Files:** N/A (external)
- **Acceptance:** Testers install and run real sessions. Bugs filed.

### 11.8 Google Play internal testing
- **Description:** Upload Android build to internal testing track, same testers.
- **Files:** N/A (external)
- **Acceptance:** Testers install and run real sessions. Bugs filed.

### 11.9 Fix beta bugs
- **Description:** Address bugs surfaced in beta. Re-upload as needed.
- **Files:** Varies
- **Acceptance:** Known-bug list is empty or accepted-as-cosmetic for v1.

### 11.10 Submit to App Review
- **Description:** Submit iOS build via App Store Connect. Notes mention RevenueCat usage, no demo account needed (no login), Restore Purchases is on the paywall AND in settings.
- **Files:** N/A (external)
- **Acceptance:** Submission shows "Waiting for Review."

### 11.11 Submit to Google Play production
- **Description:** Promote internal track build to production review.
- **Files:** N/A (external)
- **Acceptance:** Submission shows "In review."

### 11.12 Respond to review feedback
- **Description:** Address any rejections. Re-submit.
- **Files:** Varies
- **Acceptance:** Both apps approved and live on stores.
