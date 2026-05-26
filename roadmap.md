# Llamadoro Roadmap

A Pomodoro timer for iOS and Android built around a collection of llama illustrations with names, personalities, and reactive art states. Free tier ships 5 starter llamas plus ~3 unlockable through session/streak milestones. A $2.99 one-time IAP unlocks the rest of the ~45-llama gallery, custom intervals, configurable long-break cycles, and most accessories. Local-only — no backend, no accounts, no sync.

**Product thesis: aesthetic identity is the moat.** Mechanically, Llamadoro is Forest-with-llamas — the collection mechanic, streaks, standard 25/5 work/break cycles are settled solutions. What makes someone keep this app on the home screen is taste: the look, feel, character, and personality of the llamas. Every other decision serves this.

**Success criteria for v1:**

- Paid release live in both stores
- Timer reliably alerts when the app is backgrounded or the screen is off
- iOS Live Activities + Dynamic Island show the active llama and countdown during sessions
- Purchase flow works end-to-end in production
- Stats persist across restarts and OS updates
- A real human screenshots one of the llamas and shares it to a friend within their first week of use (the only proof aesthetic-as-moat is real)
- Dusty wants Llamadoro on his own home screen and uses it daily

**Quality bar:** Solo developer, no deadline pressure. Prefer fewer phases done at "screenshot-worthy" quality than many phases at "competent." Each phase must end in a buildable, testable state on a real device.

**Scope discipline (since solo + maximal + no deadline = motivation risk):** Self-imposed monthly checkpoint. If a phase is taking >50% longer than the previous month's estimate, cut the next item off the cut list. Cut order, first to cut: accessories → Live Activities (degrade to v1.1) → lock-screen widget → home-screen widget → 3-state animations (degrade to 2 states) → personality variants (degrade to 1 line per category). The collection mechanic and the llama gallery itself are never on the cut list — those are the product.

---

## Architecture

### Folder structure

```
llamadoro/
├── src/
│   ├── app/                      # expo-router file-based routes (SDK 56+ default)
│   │   ├── _layout.tsx           # root layout, theme provider, store hydration
│   │   ├── index.tsx             # timer screen (primary)
│   │   ├── gallery.tsx           # llama gallery
│   │   ├── settings.tsx          # settings
│   │   ├── stats.tsx             # stats screen
│   │   ├── paywall.tsx           # modal paywall
│   │   └── unlock.tsx            # "new llama unlocked!" celebration modal
│   ├── components/
│   │   ├── timer/                # TimerRing, TimerControls, LlamaStage, SessionLabel
│   │   ├── gallery/              # LlamaCard, LlamaGrid, LockBadge, AccessoryPicker
│   │   ├── stats/                # StatCard, MonthChart, StreakBadge
│   │   ├── paywall/              # Paywall, PriceCard, ValueProps
│   │   ├── personality/          # PersonalityLine (animated text overlay)
│   │   └── ui/                   # Button, Screen, Text, Toggle, SettingRow
│   ├── stores/                   # zustand slices
│   │   ├── timer.ts              # session state, end timestamp, phase
│   │   ├── settings.ts           # intervals, sound, haptics, theme, a11y
│   │   ├── stats.ts              # session log, rollup selectors
│   │   ├── llamas.ts             # active llama, equipped accessories, unlock state
│   │   └── purchases.ts          # entitlement cache, RC sync state
│   ├── lib/
│   │   ├── timer/engine.ts       # pure timer math, phase transitions, long-break rule
│   │   ├── notifications/        # schedule, cancel, permission, channels
│   │   ├── liveActivities/       # iOS Live Activity start/update/end, Dynamic Island state
│   │   ├── widgets/              # widget data publishing
│   │   ├── storage/              # AsyncStorage wrapper, zustand persist adapter
│   │   ├── purchases/            # RevenueCat init, listeners, entitlement checks
│   │   ├── personality/          # line selection, firing triggers
│   │   ├── unlocks/              # milestone detection, unlock celebration trigger
│   │   ├── sound/                # expo-av wrapper, preload, play
│   │   └── haptics/              # expo-haptics wrapper
│   ├── data/
│   │   ├── llamas.ts             # catalog: id, name, tier, art refs, personality, unlock
│   │   ├── accessories.ts        # catalog: id, slot, art ref, tier, unlock
│   │   └── milestones.ts         # unlock thresholds (session counts, streak days)
│   ├── hooks/                    # useTimer, useEntitlements, useStats, useActiveLlama
│   ├── constants/                # colors, spacing, typography, defaults
│   ├── types/                    # shared TS types
│   └── assets/                   # in-repo runtime assets (sounds, optional images)
│       ├── llamas/               # llama art (45 × 3 states = 135 base images)
│       ├── accessories/          # accessory overlays (8-12 items)
│       └── sounds/               # session-end chimes
├── assets/                       # Expo build-time assets (icon, splash, adaptive icon)
├── ios/                          # generated by expo prebuild once widget extension exists
│   └── LlamadoroWidget/          # native iOS widget + Live Activity extension target
├── android/                      # generated by expo prebuild
├── docs/                         # planning docs, style guide, aesthetic spike artifacts
├── app.json                      # Expo config (will migrate to app.config.ts when dynamic config needed)
├── eas.json                      # EAS build/submit profiles (added in Phase 2.1)
├── global.d.ts                   # ambient TS module declarations (CSS imports)
└── tsconfig.json
```

### State management — Zustand

One store per concern (timer, settings, stats, llamas, purchases), each created with `create()` and a `persist` middleware where appropriate.

**Persisted slices:** `settings`, `stats`, `llamas` (active + accessories + unlock state), `purchases` (entitlement cache).
**Minimal persistence on `timer`:** only `{ endTimestamp, phase, notificationId, liveActivityId, remainingMs }` is persisted — just enough to survive force-kill and reconstruct the active session on cold launch. The rest of the timer state is in-memory and rebuilt from this bookmark via the AppState reconciliation hook.

All persisted slices include a `version` field; on hydration, version mismatch triggers a documented migration or a controlled reset (settings → defaults, stats → preserve session log, llamas → preserve unlock state, purchases → re-sync from RevenueCat).

### Timer model — timestamps, not counters

The in-app countdown is a UI projection of `endTimestamp - Date.now()`. The scheduled notification is the source of truth for "session ended." Same approach as before.

**Start:** compute `endTimestamp = now + durationMs` → schedule local notification at `endTimestamp` → start Live Activity (iOS 16.1+) → store `{ endTimestamp, phase, notificationId, liveActivityId }` in timer store → UI ticks every 250ms displaying `Math.max(0, endTimestamp - Date.now())`.

**Pause:** cancel notification, end Live Activity, store `remainingMs`.

**Resume:** recompute `endTimestamp`, reschedule notification, start new Live Activity.

**Session end (foregrounded):** tick interval sees `now >= endTimestamp`, calls `commitPhaseCompletion({ sessionId, phaseIndex, phase })`, ends Live Activity (or transitions it to next phase).

**Session end (backgrounded):** notification fires. On return, `AppState` listener inspects `endTimestamp` against `now`, calls the same `commitPhaseCompletion()`.

**Idempotency rule:** all phase-completion side effects (sound/haptic, personality line fire, stats append, milestone detection, Live Activity end, unlock queue push) go through one function: `commitPhaseCompletion({ sessionId, phaseIndex, phase })`. This function records `lastCommittedKey = "{sessionId}:{phaseIndex}"` on completion. If called twice with the same key (e.g., notification handler races AppState reconciliation), the second call no-ops. This is the single guard against double-counting across all entry points: foreground tick, AppState reconciliation, notification handler, cold-launch recovery, notification tap.

**`sessionId`** is a UUID generated when the user first starts a session (or resumes after reset). `phaseIndex` increments on every phase transition within that sessionId. Together they form the canonical idempotency key.

**No side effects from render paths.** Concurrent rendering and Hermes engine can replay effects. All side effects (notification scheduling, stats commits, Live Activity start/update/end, unlock queueing) live in explicit store actions called from event handlers or AppState listeners — never from `useEffect` bodies in components that can re-render.

### AsyncStorage write policy

Zustand `persist` writes on every state mutation by default. This is wrong for high-frequency mutations like the timer tick.

- **Timer tick state (remainingMs displayed in UI)** lives in-memory only; not persisted.
- **Timer bookmark** (`endTimestamp`, `phase`, `notificationId`, `liveActivityId`, `sessionId`, `phaseIndex`) is persisted, but only written on phase transitions and pause/resume, not on tick.
- **Stats, llamas, purchases, settings:** writes are debounced (200-500ms) through a shared wrapper in `lib/storage/zustandPersist.ts`. Multiple rapid mutations within the debounce window coalesce to one write.
- **Stats session-log append is not coalesced** — each completed work session writes immediately to avoid losing data on a crash between two rapid sessions.

### Personality system

Each llama has a personality block:

```ts
type LlamaPersonality = {
  voice: 'warm' | 'sassy' | 'stoic' | 'silly';  // tagged for tone consistency
  lines: {
    greeting: string[];          // 1-3 lines, fired on session start
    completion: string[];        // 1-3 lines, fired on session end
    streakBreak: string[];       // 1-3 lines, fired when a streak breaks
  };
};
```

Line firing: pick one at random from the category. Display as a brief overlay on the llama stage, then fade. The library of lines is a content artifact — written by Dusty, possibly AI-assisted but voice-edited.

### Art state model

Each llama has three art assets:

```ts
type LlamaArt = {
  focus: ImageRequireSource;   // alert, eyes open, working
  break: ImageRequireSource;   // resting, eyes closed
  idle: ImageRequireSource;    // default home-screen pose
};
```

State selection is driven by timer phase:
- Timer running, phase = work → `focus`
- Timer running, phase = break or longBreak → `break`
- Timer idle or paused → `idle`

Transitions: cross-fade between states (250-400ms). On top of states, lightweight procedural motion is applied — subtle breathing scale (1.0 → 1.02 on a 4-second cycle), occasional eye blinks via opacity mask. Respects reduced-motion accessibility setting.

### Collection mechanic + unlocks

**Definition of "completed session" (single source of truth for stats, unlocks, and streaks):** a completed **work** phase. Short breaks and long breaks do not count. The timer engine fires phase-end events for all phases; only the `phase: 'work'` ones write to the session log, advance streaks, or check milestones.

**Streak definition:** calendar-day, local-device midnight boundaries. A day counts toward the streak if it contains ≥1 completed work session between local midnight and the next local midnight. Streak breaks fire when starting a new session and the calendar gap since the last work session is more than 1 day (i.e., at least one full day was skipped). No 24-hour-grace logic — only calendar days.

Each llama has an `unlockCondition`:

```ts
type UnlockCondition =
  | { type: 'starter' }              // free, always unlocked (5 of these)
  | { type: 'sessions'; count: number }    // unlock after N completed work sessions
  | { type: 'streak'; days: number }       // unlock after N-day streak
  | { type: 'paid' };                       // unlock via IAP entitlement
```

Proposed milestone thresholds (tune during build):
- 10 sessions → first earnable llama
- 50 sessions → second earnable llama
- 200 sessions → third earnable llama
- 7-day streak → bonus earnable
- 30-day streak → bonus earnable

Total free-tier reachable: 5 starter + ~3-5 earnable = 8-10 llamas. Remaining ~35-40 require the $2.99 IAP.

Milestone detection runs after every completed work session. New unlocks are pushed to a persisted queue (`pendingUnlockIds: string[]` in the llamas store) and consumed one-at-a-time by the `/unlock.tsx` celebration modal. Modals display back-to-back. The queue survives force-kill — `shownUnlockIds: string[]` records what's been displayed, `pendingUnlockIds` records what's still owed. Single-fire — once a llama is in `shownUnlockIds` it never re-shows.

### Accessories + composition

Universal slot system. Three slots: `head`, `neck`, `prop`. Each accessory targets one slot and renders as an overlay PNG composed on top of the llama art at a known anchor point.

```ts
type Accessory = {
  id: string;
  name: string;
  slot: 'head' | 'neck' | 'prop';
  asset: ImageRequireSource;
  tier: 'free' | 'paid' | 'earned';
  unlockCondition?: UnlockCondition;
};
```

8-12 accessories in v1, distributed across slots. Most are paid-tier. A few earned through deeper milestones (e.g., 100-session streak gets a sunglasses item). Equipped accessories persist per-llama (each llama remembers what it wears).

Compositing: simple absolute-positioned `<Image>` stack inside `LlamaStage`. Llama base art reserves anchor points; accessory PNGs are pre-aligned to those anchors. No runtime warping or rigging.

### iOS Live Activities + Dynamic Island

Native iOS feature, not Expo managed. Requires:
- iOS 16.1+ runtime
- Native widget extension target (created via `expo prebuild` + committed native dirs — see "Native code commit policy" below)
- WidgetKit + ActivityKit code in Swift
- Community plugin (`expo-live-activity` or successor) or hand-rolled config plugin

**Update strategy: OS-rendered countdown, not JS-driven.** The Live Activity is given a `startDate` and `endDate` and uses Apple's `Text(timerInterval:)` to render the countdown — iOS handles all per-second updates with zero RN bridge traffic. JS only calls `Activity.update(using:)` on **phase transitions** (work→break, pause, resume, end) — maybe 4-8 updates per session total. This keeps the app well inside ActivityKit's ~30-60 updates/hour budget and avoids ever appearing frozen.

**Image payload constraints.** ActivityKit's image rendering has size limits and the widget extension has its own asset bundle (it cannot freely access RN's static `require()`'d assets — see "Widget asset strategy" below). For Dynamic Island and lock-screen LA, plan for pre-bundled compressed llama thumbnails (~80x80 PNG/WebP per llama state) in the extension's asset catalog. Fallback to symbolic silhouettes if a full thumbnail is unavailable.

Three Dynamic Island sizes to design for: **compact** (small llama avatar + OS countdown), **expanded** (larger llama + phase label + OS countdown + progress ring), **minimal** (single llama avatar or time digit).

Lock screen Live Activity: full session card — llama art (current state), phase, OS-rendered countdown, progress ring.

**Orphan cleanup on cold launch.** If the app crashes after starting an LA but before ending it, iOS does not automatically reap the LA. On every cold launch, enumerate `Activity<LlamadoroAttributes>.activities` and compare against the persisted timer bookmark; end any orphans that don't match an active session.

Feasibility validated by Phase 1 spike. If the spike reveals the Expo plugin path is too rough, commit to prebuild + manual native code (decision documented in spike notes), or drop Live Activities from v1.

### Widget asset strategy

The iOS widget extension bundles independently from the main RN app. It cannot directly `require()` the same llama art the JS uses. Two viable approaches:

1. **Pre-bundled compressed thumbnails in the extension's `Assets.xcassets`.** Per llama, per state, a small (~80-120px) PNG/WebP. Adds ~few-hundred-KB to extension bundle but keeps widgets self-contained.
2. **Shared container via App Groups.** Main app writes the active llama art to the App Group's shared file storage; extension reads from there. Better for arbitrary art but adds runtime complexity.

v1 uses approach 1 — simpler, faster, no runtime sync. Approach 2 reserved for v1.1 if needed.

### Native code commit policy

Once the widget extension target exists (Phase 1 stub), `ios/` and `android/` directories contain hand-edited Swift / Kotlin source. **These directories are committed to git and are the source of truth.** Do not run `expo prebuild --clean` after this point — it would wipe widget extension code. New Expo SDK upgrades must be applied carefully, ideally via a temporary regenerate-and-diff against a clean prebuild rather than `--clean`.

This is the "we are effectively on the bare workflow" trade-off accepted in the design doc.

### Widgets

iOS home-screen widget: shows the user's active llama in its idle pose with today's session count. Small + medium sizes.
iOS lock-screen widget: shows today's session count + a llama silhouette. Circular and rectangular complications where supported.
Android home-screen widget: shows the user's active llama + today's session count. Glance + AppWidget API.

Android lock-screen widgets dropped for v1 — too inconsistent across the Android 8+ floor.

### Purchase gating

`purchases` store holds `{ entitlements: { fullUnlock: boolean }, status, lastSyncedAt }`. Hydrates from AsyncStorage on launch, syncs from RevenueCat in the background. Cache survives offline launches.

`useEntitlements()` hook returns `{ hasFullUnlock, isPaid, lastSyncedAt }`. Gates:
- Gallery: paid llamas show lock overlay; tap → paywall.
- Settings: custom interval and long-break controls disabled for free tier.
- Accessories: paid accessories locked; tap → paywall.

**Cache refresh policy:** the cached entitlement is *optimistic*. RC sync runs on every cold launch and on every `AppState` → `active` transition. `lastSyncedAt` is recorded with every successful sync. If the cache is older than 7 days *and* the device is offline, downgrade premium gates gracefully (keep functionality but show a "couldn't verify purchase, going online will refresh" banner). On refund / entitlement revocation, the next sync removes premium silently.

### Crash reporting and diagnostics

Sentry integrates at app start (initialized in `_layout.tsx`). Catches crashes, JS errors, and unhandled promise rejections. No user identifiers attached. Telemetry beyond crashes (usage funnels, paywall conversion) is deferred to v1.1.

RevenueCat is the second SDK that phones home — it syncs entitlements with an anonymous-by-default RC user ID. Both SDK behaviors are reflected in the Phase 11 privacy declarations (diagnostic data + purchase data, not linked to identity).

---

## Phases

### Phase 1 — Skeleton + Spikes + Storefront Paperwork

**Goal:** Buildable Expo project. Two existential-risk spikes resolved. Storefront accounts created.

**Done when:**

- **Aesthetic spike passes:** 2-3 candidate aesthetic directions tested, each with at least 2 different llamas across all 3 states. Winner picked against the 4-question rubric: would you post one? would you pay $2.99 for an app of these as a stranger? do two different llamas in the same style look like one set? does the same llama across states look like one character? All four must be honest yeses. Style locked in a written guide.
- **Live Activities feasibility spike passes:** "Hello world" Live Activity bring-up succeeds on a real iPhone 14 Pro+ in an EAS dev build with a config plugin. If not, decide: drop Live Activities from v1, or commit to `expo prebuild` / bare workflow for the project. Decision documented.
- `npx create-expo-app` scaffold with TypeScript, expo-router, ESLint, Prettier.
- Folder structure created with stub files.
- App boots on iOS simulator and Android emulator showing a placeholder timer screen.
- Apple Developer Program enrollment submitted ($99/yr).
- Google Play Developer account created ($25 one-time).
- App Store Connect paid apps agreement initiated, banking + tax forms started.
- Google Play Console merchant setup started.
- RevenueCat account + project created with stub iOS and Android app entries.

**Risks:**

- Aesthetic spike fails — must be willing to switch to commissioned art. If unwilling, the whole premise (aesthetic-as-moat) collapses.
- Live Activities plugin is rough — may force expo prebuild, which changes the workflow.
- Storefront approval takes days. Submit early.

**Learnings:** Whether the moat is achievable with AI-gen. Whether the iOS feature ambition is achievable in Expo.

---

### Phase 2 — Background-Safe Timer Core

**Goal:** Working timer with reliable background notification alerts. No UI polish, no llamas, just the engine.

**Done when:**

- Switched from Expo Go to EAS dev builds.
- Timer store with start/pause/resume/reset/skip actions.
- Notification scheduling integrated; permissions requested on first session start (not on launch).
- `AppState` listener handles session-end-while-backgrounded correctly.
- Pause cancels the pending notification (no phantom alerts).
- Verified on physical iPhone and physical Android device with a real 25-minute session, screen off, alert fires on time.

**Risks:** Time drift on long sessions (mitigated by timestamp-based math). Android notification channel priority + Doze mode interactions.

**Learnings:** Whether the notification-as-source-of-truth model holds on both platforms.

---

### Phase 3 — UI Shell + Llama Catalog (Real Art)

**Goal:** All four screens navigable. Real aesthetic-spike-approved art populates the gallery. Timer screen shows the active llama in correct state (focus / break / idle) but without animation polish or personality lines yet.

**Done when:**

- Navigation via expo-router tabs (Timer / Gallery / Stats / Settings) with safe-area handling on both platforms.
- Llama catalog (`data/llamas.ts`) populated with all 45 llamas: id, name, tier, 3 art assets each, unlock condition, personality voice tag (lines come in Phase 4).
- Llamas store: active llama, persisted; defaults to first starter on fresh install.
- Timer screen: large llama stage that switches between focus / break / idle states based on timer phase. Circular progress ring around countdown. Start/pause/reset controls. Phase label.
- Gallery screen: scrollable grid. Locked llamas (paid + not-yet-unlocked) show a lock badge. Tapping a free unlocked llama sets active. Tapping a locked llama is a no-op (gating in Phase 7).
- Settings screen: scaffold with theme toggle wired; other rows render but inert.
- Stats screen: scaffold with hardcoded placeholder data.
- Both light and dark themes look intentional.

**Risks:** State transitions on the timer screen might look janky without polish. Live with it for now; Phase 4 fixes.

**Learnings:** How the real art holds up in actual UI. Sometimes art that looks great in isolation falls apart in a grid.

---

### Phase 4 — Personality + State Animations

**Goal:** Llamas feel alive. Personality lines fire at the right moments. State transitions cross-fade cleanly. Subtle ambient motion makes idle llamas feel less static.

**Done when:**

- Personality line catalog written for all 45 llamas (greeting / completion / streak-break × ~3 variants each).
- `lib/personality/` selects and fires lines on session start, session complete, and streak break.
- Personality lines render as an animated overlay on the llama stage — fade in, hold ~3 seconds, fade out.
- State transitions cross-fade between focus / break / idle (250-400ms).
- Idle ambient motion: subtle breathing scale + occasional blinks. Respects reduced-motion setting.
- Reduced-motion path: skip transitions and ambient motion, show focus state only during active sessions.

**Risks:** Personality writing is content work that solo devs underestimate. Block out time. AI assist okay but voice-edit every line.

**Learnings:** Whether the personality voice is actually distinct, or whether all 45 llamas blur into one tone.

---

### Phase 5 — Settings + Stats Persistence

**Goal:** All settings persist. Stats track real session completions with expanded history.

**Done when:**

- Settings store wired to UI: sound, haptics, theme, keep-awake, reduced motion. Custom interval and long-break inputs present but disabled (gating in Phase 7).
- Sound playback at session end if enabled.
- Haptics at phase transitions if enabled.
- `expo-keep-awake` activates during active sessions if setting enabled.
- Stats store: session log + version field, persisted.
- Stats rollups (today / week / 30-day series / current streak / longest streak / total all-time) as derived selectors. Use local-device midnight for day boundaries.
- Stats screen shows real data.

**Risks:** Streak edge cases around timezone and day boundaries. Pick "local device midnight" and document it.

**Learnings:** Whether the storage schema needs flexibility (it probably will).

---

### Phase 6 — Collection Mechanic + Milestones

**Goal:** Free-tier users have progression. Unlocking a new llama feels like a moment.

**Done when:**

- Milestones catalog defined in `data/milestones.ts` with thresholds (10/50/200 sessions, 7/30-day streaks — tune by feel).
- Llamas store tracks unlock state per llama.
- Milestone detection runs after every completed work session.
- New unlock triggers the `/unlock.tsx` celebration modal with llama art, name, and an introductory personality line.
- Once-only firing — no re-triggers.
- Gallery shows newly unlocked llamas without their lock badge.

**Risks:** Milestone thresholds feel off (too easy / too rare). Tune by playtesting.

**Learnings:** Whether collection-mechanic progression actually changes the feel of using the app vs. having all llamas available immediately.

---

### Phase 7 — RevenueCat + Paywall

**Goal:** Purchase flow works end-to-end in sandbox. Premium features gate correctly.

**Done when:**

- App Store Connect: `llamadoro_full_unlock` non-consumable, $2.99.
- Google Play Console: same product, managed non-consumable.
- RevenueCat: products linked, `fullUnlock` entitlement attached.
- `react-native-purchases` integrated via Expo plugin.
- Purchases store hydrated from RC on launch with AsyncStorage fallback.
- Paywall screen: triggered by tapping a locked llama, tapping a locked accessory, or tapping a disabled custom-interval / long-break setting. Shows price, value props, purchase + restore.
- Sandbox purchase succeeds → entitlement updates → all paid llamas unlock → custom intervals + long-break inputs enable → all paid accessories unlock.
- Restore Purchases works on a fresh install with the same sandbox account.
- Settings has an explicit "Restore Purchases" row (App Review requirement).
- Offline launch: cached entitlement keeps premium unlocked.

**Risks:** iOS sandbox testing is finicky. Document the test procedure. Android requires upload to internal testing first.

**Learnings:** Whether the paywall placement feels intrusive or appropriate.

---

### Phase 8 — Live Activities + Dynamic Island + Widgets

**Goal:** The platform-native polish that signals "this is a 2026 app, not a 2020 app."

**Done when:**

- iOS Live Activity starts on session start, updates as time passes, ends on session end.
- Dynamic Island compact, expanded, and minimal layouts designed and implemented.
- Lock-screen Live Activity full layout designed and implemented.
- Active llama art (current state) renders inside the Live Activity at acceptable resolution.
- iOS home-screen widget (small + medium): active llama idle pose + today's session count.
- iOS lock-screen widget: today's session count + llama silhouette (circular + rectangular).
- Android home-screen widget: active llama + today's session count (Glance API).
- Widget data publishing via shared UserDefaults (iOS) / SharedPreferences (Android) updated on session end.
- All widgets refresh promptly when active llama changes or sessions complete.

**Risks:** This is the most native-heavy phase. If the Phase 1 Live Activities spike already revealed roughness, expect more here. Budget extra time. Test on multiple devices.

**Learnings:** Whether the Dynamic Island moment lands the way it does in the imagination.

---

### Phase 9 — Accessories

**Goal:** Llamas can wear hats. Customization is a real engagement deepener.

**Done when:**

- 8-12 accessories generated in the established aesthetic, distributed across `head` / `neck` / `prop` slots.
- Accessory catalog wired (`data/accessories.ts`).
- Composition: `LlamaStage` composes equipped accessories on top of llama art at known anchor points.
- Each llama remembers its equipped accessories per slot.
- Gallery has an accessory picker (per-llama).
- A few accessories (2-3) are earned via deeper milestones (e.g., 100-session, 60-day streak); the rest are paid-tier.
- Paid-tier accessories show a lock badge; tap → paywall.

**Risks:** Accessory art consistency with llama art. Each accessory needs to look right on every llama.

**Learnings:** Whether accessories deepen attachment or just add clutter. Could be the first cut if the build stretches.

---

### Phase 10 — Art Volume + Polish

**Goal:** Final llama set fully generated. Visual identity locked. App icon, splash, accessibility, performance.

**Done when:**

- All 45 llamas × 3 states = 135 base images, generated, curated, optimized (target <100KB each).
- Plus accessory overlays, optimized.
- App icon + splash featuring a hero llama at all required sizes.
- Accessibility audit: VoiceOver labels for every llama (name + voice description); dynamic-type support on stats screen; reduced-motion path verified.
- Performance pass: timer screen renders at 60fps, gallery scrolls smoothly with 45 images.
- Bundle size check: iOS .ipa < 100MB, Android .aab base APK < 50MB. If approaching limits, consider WebP, deferred asset loading, or CDN delivery.

**Risks:** Style consistency across 45 AI-gen llamas is hard even after the spike picks a direction. Budget time for re-rolls.

**Learnings:** Whether the visual identity holds at full volume.

---

### Phase 11 — Store Assets + Submission

**Goal:** Live in both stores.

**Done when:**

- Screenshots at all required device sizes (iPhone 6.7", 6.5", 5.5"; Android phone, 7" tablet, 10" tablet).
- App Store and Play Store listing copy: title, subtitle/short description, description, keywords, category, age rating.
- Privacy policy hosted publicly (GitHub Pages fine).
- Apple App Privacy questionnaire + Google Data Safety form — declared honestly per task 11.5: diagnostic data (Sentry) + purchase data (RevenueCat), both "Not Linked to User Identity." No analytics-of-user-behavior, no advertising identifiers.
- EAS Build production profiles for iOS and Android pass.
- EAS Submit configured for both stores.
- TestFlight build distributed to 2-3 testers, real bugs filed and triaged.
- Google Play internal testing track populated, same testers.
- Beta bugs fixed.
- Submission to App Review and Play Store production.
- App Store review notes prepped (RevenueCat usage; no demo account needed; Restore Purchases is on the paywall AND in settings).

**Risks:** First submission almost always finds something. Budget for 1-2 review cycles.

**Learnings:** What the store review process looks like for a paid app with IAP.

---

## Open Questions

1. **Aesthetic direction.** Decided by Phase 1 aesthetic spike. Candidates: watercolor, flat illustration, storybook gouache, low-poly 3D render, vector / minimalist.
2. **Personality voice spine.** Warm? Sassy? Stoic? Decided alongside aesthetic. Llamas can have individual personalities but they need a shared tone.
3. **Llama naming convention.** Real names (Pedro, Beatrix), pun names (Llamonardo, Daa-vinci, Llama del Rey), or both? Pun names commit you to a tone — strong choice if the tone lands.
4. **Live Activity visual treatment.** Llama art directly, or stylized representation? Decided in Phase 8 design pass, informed by Phase 1 spike findings.
5. **Branch typo.** `dustyf/lamadoro-planning-docs` should be renamed to `dustyf/llamadoro-planning-docs` before more commits.

## Deferred to v1.1 (intentionally out of scope)

These got considered and cut. Listed so they don't sneak back in mid-build:

- Bespoke commissioned chime sound (use a tasteful stock chime for v1)
- Android lock-screen widget (API floor too low for reliable support)
- Apple Watch app, Wear OS app
- Themes beyond light/dark
- Social/sharing features (a shareable session-end image is *maybe* in scope if the aesthetic justifies it — decide during build, default no)
- Statistics export, CSV download, etc.
- Cloud sync, accounts, multi-device
- Llama trading, social leaderboards, anything multiplayer
