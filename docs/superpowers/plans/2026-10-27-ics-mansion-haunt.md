# ICS Mansion Haunt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, mobile-first five-station Halloween scavenger hunt that validates ghost names, persists progress locally, and deploys unchanged to GitLab Pages or GitHub Pages.

**Architecture:** A Vite-built TypeScript single-page app keeps immutable station content separate from pure answer-validation and game-state modules. A small controller connects versioned browser persistence to DOM views; CSS and local SVG assets provide the original haunted-office presentation without adding a component framework or runtime service.

**Tech Stack:** Node.js 22, npm, Vite 7, TypeScript 5.9, Vitest 3, Testing Library DOM 10, jsdom 26, Playwright 1.56, HTML5, CSS3, local SVG assets

**Spec:** `docs/superpowers/specs/2026-10-27-ics-mansion-haunt-design.md`

## Global Constraints

- Fixed route: entrance, WC, Bistro, largest meeting room, Office Management.
- Canonical answers: `König Buu Huu`, `Maulende Myrte`, `Hackfleisch hassender Zerhacker`, `Hui Buh`, `Freddy Krueger`.
- No backend, accounts, analytics, cookies, participant data, rankings, or completion times.
- Persist only schema version, current station, captured station identifiers, completion flag, and sound preference.
- App must remain usable without images, animation, sound, or `localStorage`.
- Sound is optional and muted by default.
- Use original local assets; do not copy proprietary logos, game UI, artwork, music, or sound effects.
- Build must use relative asset paths and deploy unchanged to GitLab Pages and GitHub Pages.
- Public bundle must contain no secrets, personal data, floor plans, or confidential office information.
- All user-facing copy is German.
- Node.js major version is exactly `22`; package manager is npm.

## File Map

| Path | Responsibility |
| --- | --- |
| `package.json` | Scripts, exact runtime tooling, and development dependencies |
| `.nvmrc` | Node.js major-version pin |
| `vite.config.ts` | Relative production base and Vitest jsdom setup |
| `tsconfig.json` | Strict browser TypeScript configuration |
| `playwright.config.ts` | Mobile browser test server and device projects |
| `index.html` | Accessible app shell and static metadata |
| `src/main.ts` | Composition root only |
| `src/content/stations.ts` | Immutable station IDs, riddles, aliases, and final copy |
| `src/domain/answers.ts` | Input normalization and station answer validation |
| `src/domain/game-state.ts` | Pure game-state transitions and invariants |
| `src/infrastructure/storage.ts` | Versioned `localStorage` adapter and in-memory fallback |
| `src/app/game-controller.ts` | UI event orchestration and persistence calls |
| `src/ui/render.ts` | DOM rendering for intro, capture, riddle, and completion views |
| `src/ui/effects.ts` | Reduced-motion-aware capture effect and optional sound boundary |
| `src/styles.css` | Responsive visual system, focus states, and motion fallbacks |
| `src/assets/ghost-vacuum.svg` | Original generic ghost-vacuum illustration |
| `src/assets/ghost-mark.svg` | Original generic ghost silhouette/progress marker |
| `tests/unit/*.test.ts` | Pure domain and storage tests |
| `tests/ui/*.test.ts` | jsdom rendering and controller tests |
| `tests/e2e/hunt.spec.ts` | Full mobile route, reload, reset, and keyboard acceptance tests |
| `.gitlab-ci.yml` | GitLab Pages build and artifact publication |
| `.github/workflows/pages.yml` | GitHub Pages fallback workflow |
| `README.md` | Local development, content editing, deployment, and QR workflow |

---

### Task 1: Project Foundation and Accessible App Shell

**Files:**
- Create: `package.json`
- Create: `.nvmrc`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/styles.css`
- Create: `tests/ui/app-shell.test.ts`

**Interfaces:**
- Consumes: none
- Produces: `src/main.ts` composition entry and `#app` mount element used by later UI tasks

- [ ] **Step 1: Add the failing app-shell test**

Create `tests/ui/app-shell.test.ts`:

```ts
import { getByRole } from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';

describe('app shell', () => {
  beforeEach(async () => {
    document.body.innerHTML = '<main id="app"></main>';
    await import('../../src/main');
  });

  it('renders the German mission heading and start action', () => {
    const app = document.querySelector<HTMLElement>('#app');
    expect(app).not.toBeNull();
    expect(getByRole(app!, 'heading', { name: 'ICS Mansion is haunted' })).toBeVisible();
    expect(getByRole(app!, 'button', { name: 'Geisterjagd starten' })).toBeVisible();
  });
});
```

- [ ] **Step 2: Add strict tooling and run the test red**

Create `package.json` with:

```json
{
  "name": "ics-mansion-haunt",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "engines": { "node": "22.x" },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:unit": "vitest run tests/unit tests/ui",
    "test:e2e": "playwright test",
    "check": "npm run test:unit && npm run build && npm run test:e2e"
  },
  "devDependencies": {
    "@playwright/test": "1.56.1",
    "@testing-library/dom": "10.4.1",
    "@testing-library/jest-dom": "6.9.1",
    "@types/node": "24.9.1",
    "jsdom": "26.1.0",
    "typescript": "5.9.3",
    "vite": "7.1.12",
    "vitest": "3.2.4"
  }
}
```

Create `.nvmrc` containing `22`, then run:

```bash
npm install
npm run test:unit -- tests/ui/app-shell.test.ts
```

Expected: FAIL because `src/main.ts` does not exist.

- [ ] **Step 3: Add TypeScript, Vite, HTML, and minimal shell**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests", "vite.config.ts", "playwright.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
  },
});
```

Create `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Create `index.html` with a viewport meta tag, German language, title
`ICS Mansion Haunt`, theme color `#10061f`, and `<main id="app"></main>`.

Create `src/main.ts`:

```ts
import './styles.css';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Missing #app mount element');

app.innerHTML = `
  <section class="screen" aria-labelledby="mission-title">
    <p class="eyebrow">Paranormale Aktivität erkannt</p>
    <h1 id="mission-title">ICS Mansion is haunted</h1>
    <p>Fange fünf Geister und sichere dir deinen Treat.</p>
    <button class="primary-action" type="button">Geisterjagd starten</button>
  </section>
`;
```

Create minimal `src/styles.css` with `box-sizing: border-box`, dark body colors,
system fonts, a centered `#app` capped at `32rem`, and a minimum 44px button
target.

- [ ] **Step 4: Verify shell, typecheck, and production build**

Run:

```bash
npm run test:unit -- tests/ui/app-shell.test.ts
npm run build
```

Expected: one passing test and generated `dist/index.html` with relative assets.

- [ ] **Step 5: Commit foundation**

```bash
git add package.json package-lock.json .nvmrc tsconfig.json vite.config.ts index.html src tests/setup.ts
git commit -m "build: scaffold static hunt app"
```

### Task 2: Station Content and Answer Validation

**Files:**
- Create: `src/content/stations.ts`
- Create: `src/domain/answers.ts`
- Create: `tests/unit/answers.test.ts`

**Interfaces:**
- Consumes: none
- Produces: `StationId`, `Station`, `STATIONS`, `normalizeAnswer(value: string): string`, and `isAcceptedAnswer(station: Station, value: string): boolean`

- [ ] **Step 1: Write table-driven failing validation tests**

Create `tests/unit/answers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { STATIONS } from '../../src/content/stations';
import { isAcceptedAnswer, normalizeAnswer } from '../../src/domain/answers';

describe('normalizeAnswer', () => {
  it.each([
    ['  KÖNIG   BUU HUU ', 'koenig buu huu'],
    ['Freddy-Krueger', 'freddy krueger'],
    ['Maulende\u00a0Myrte', 'maulende myrte'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });
});

describe('isAcceptedAnswer', () => {
  it.each([
    ['entrance', 'König Buu Huu'],
    ['entrance', 'king boo'],
    ['wc', 'MYRTE'],
    ['bistro', 'Hackfleisch-hassender Zerhacker'],
    ['meeting-room', 'hui buh'],
    ['office-management', 'Freddy'],
  ] as const)('accepts %s answer %s', (id, answer) => {
    const station = STATIONS.find((candidate) => candidate.id === id)!;
    expect(isAcceptedAnswer(station, answer)).toBe(true);
  });

  it('rejects another station answer', () => {
    expect(isAcceptedAnswer(STATIONS[0], 'Hui Buh')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify missing modules**

Run:

```bash
npm run test:unit -- tests/unit/answers.test.ts
```

Expected: FAIL resolving `src/content/stations.ts`.

- [ ] **Step 3: Define immutable content and German riddle copy**

Create `src/content/stations.ts`:

```ts
export type StationId =
  | 'entrance'
  | 'wc'
  | 'bistro'
  | 'meeting-room'
  | 'office-management';

export interface Station {
  readonly id: StationId;
  readonly ghostName: string;
  readonly acceptedAnswers: readonly string[];
  readonly nextRiddle: string | null;
}

export const STATIONS: readonly Station[] = [
  {
    id: 'entrance',
    ghostName: 'König Buu Huu',
    acceptedAnswers: ['König Buu Huu', 'Buu Huu', 'King Boo'],
    nextRiddle:
      'Dein nächster Geist versteckt sich dort, wo selbst Geisterjäger kurz allein verschwinden und Wasser rauscht.',
  },
  {
    id: 'wc',
    ghostName: 'Maulende Myrte',
    acceptedAnswers: ['Maulende Myrte', 'Myrte'],
    nextRiddle:
      'Folge dem Duft gerösteter Bohnen. Zwischen Tassen und Koffein wartet der nächste Spuk.',
  },
  {
    id: 'bistro',
    ghostName: 'Hackfleisch hassender Zerhacker',
    acceptedAnswers: ['Hackfleisch hassender Zerhacker'],
    nextRiddle:
      'Viele Stimmen, ein großer Tisch: Suche den Raum, in dem die meisten Geister gleichzeitig tagen könnten.',
  },
  {
    id: 'meeting-room',
    ghostName: 'Hui Buh',
    acceptedAnswers: ['Hui Buh'],
    nextRiddle:
      'Für deinen letzten Einsatz brauchst du jene, die im Office Ordnung schaffen, Fragen lösen und den Treat bewachen.',
  },
  {
    id: 'office-management',
    ghostName: 'Freddy Krueger',
    acceptedAnswers: ['Freddy Krueger', 'Freddy'],
    nextRiddle: null,
  },
] as const;
```

- [ ] **Step 4: Implement deterministic normalization**

Create `src/domain/answers.ts`:

```ts
import type { Station } from '../content/stations';

export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('de-DE')
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function isAcceptedAnswer(station: Station, value: string): boolean {
  const candidate = normalizeAnswer(value);
  return station.acceptedAnswers.some(
    (answer) => normalizeAnswer(answer) === candidate,
  );
}
```

- [ ] **Step 5: Verify and commit content boundary**

Run:

```bash
npm run test:unit -- tests/unit/answers.test.ts
npm run build
```

Expected: all answer tests pass and strict TypeScript build succeeds.

```bash
git add src/content src/domain/answers.ts tests/unit/answers.test.ts
git commit -m "feat: define hunt stations and answers"
```

### Task 3: Game State and Versioned Persistence

**Files:**
- Create: `src/domain/game-state.ts`
- Create: `src/infrastructure/storage.ts`
- Create: `tests/unit/game-state.test.ts`
- Create: `tests/unit/storage.test.ts`

**Interfaces:**
- Consumes: `StationId` and ordered `STATIONS`
- Produces: `GameState`, `initialGameState()`, `captureCurrentGhost(state)`, `getCurrentStation(state)`, `GameStorage.load()`, `GameStorage.save(state)`, and `GameStorage.clear()`

- [ ] **Step 1: Write failing state-transition tests**

Create `tests/unit/game-state.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  captureCurrentGhost,
  getCurrentStation,
  initialGameState,
} from '../../src/domain/game-state';

describe('game state', () => {
  it('starts at entrance with no captures', () => {
    const state = initialGameState();
    expect(getCurrentStation(state).id).toBe('entrance');
    expect(state.captured).toEqual([]);
    expect(state.completed).toBe(false);
  });

  it('advances exactly one station per capture', () => {
    const next = captureCurrentGhost(initialGameState());
    expect(next.captured).toEqual(['entrance']);
    expect(next.currentStationId).toBe('wc');
  });

  it('marks completion only after the fifth capture', () => {
    let state = initialGameState();
    for (let index = 0; index < 5; index += 1) state = captureCurrentGhost(state);
    expect(state.completed).toBe(true);
    expect(state.captured).toHaveLength(5);
    expect(() => captureCurrentGhost(state)).toThrow('Game already completed');
  });
});
```

- [ ] **Step 2: Run state tests red**

Run:

```bash
npm run test:unit -- tests/unit/game-state.test.ts
```

Expected: FAIL because `game-state.ts` is missing.

- [ ] **Step 3: Implement pure state invariants**

Create `src/domain/game-state.ts` with:

```ts
import { STATIONS, type Station, type StationId } from '../content/stations';

export interface GameState {
  readonly schemaVersion: 1;
  readonly currentStationId: StationId;
  readonly captured: readonly StationId[];
  readonly completed: boolean;
  readonly soundEnabled: boolean;
}

export function initialGameState(): GameState {
  return {
    schemaVersion: 1,
    currentStationId: 'entrance',
    captured: [],
    completed: false,
    soundEnabled: false,
  };
}

export function getCurrentStation(state: GameState): Station {
  const station = STATIONS.find(({ id }) => id === state.currentStationId);
  if (!station) throw new Error(`Unknown station: ${state.currentStationId}`);
  return station;
}

export function captureCurrentGhost(state: GameState): GameState {
  if (state.completed) throw new Error('Game already completed');
  const currentIndex = STATIONS.findIndex(({ id }) => id === state.currentStationId);
  const captured = [...state.captured, state.currentStationId];
  const next = STATIONS[currentIndex + 1];
  return next
    ? { ...state, captured, currentStationId: next.id }
    : { ...state, captured, completed: true };
}
```

- [ ] **Step 4: Write failing persistence validation tests**

Create `tests/unit/storage.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { captureCurrentGhost, initialGameState } from '../../src/domain/game-state';
import { GameStorage } from '../../src/infrastructure/storage';

const KEY = 'ics-mansion-haunt:game-state';

describe('GameStorage', () => {
  it('round-trips valid state', () => {
    const browserStorage = new MapStorage();
    const storage = new GameStorage(browserStorage);
    const state = captureCurrentGhost(initialGameState());
    expect(storage.save(state)).toBe('persistent');
    expect(storage.load()).toEqual({ state, notice: null });
  });

  it('returns initial state and reset notice for malformed JSON', () => {
    const browserStorage = new MapStorage([[KEY, '{broken']]);
    expect(new GameStorage(browserStorage).load()).toEqual({
      state: initialGameState(),
      notice: 'reset',
    });
    expect(browserStorage.getItem(KEY)).toBeNull();
  });

  it('rejects duplicate or out-of-order captured stations', () => {
    const invalid = {
      ...initialGameState(),
      currentStationId: 'bistro',
      captured: ['entrance', 'entrance'],
    };
    const browserStorage = new MapStorage([[KEY, JSON.stringify(invalid)]]);
    expect(new GameStorage(browserStorage).load().notice).toBe('reset');
  });

  it('falls back to memory when browser storage throws', () => {
    const storage = new GameStorage(new ThrowingStorage());
    const state = captureCurrentGhost(initialGameState());
    expect(storage.save(state)).toBe('memory-only');
    expect(storage.load()).toEqual({ state, notice: 'memory-only' });
  });

  it('clear removes only the app-owned key', () => {
    const browserStorage = new MapStorage([
      [KEY, JSON.stringify(initialGameState())],
      ['other-app', 'keep'],
    ]);
    new GameStorage(browserStorage).clear();
    expect(browserStorage.getItem(KEY)).toBeNull();
    expect(browserStorage.getItem('other-app')).toBe('keep');
  });
});

class MapStorage implements Storage {
  private readonly values: Map<string, string>;
  constructor(entries: readonly (readonly [string, string])[] = []) {
    this.values = new Map(entries);
  }
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

class ThrowingStorage implements Storage {
  get length(): number { throw new Error('blocked'); }
  clear(): void { throw new Error('blocked'); }
  getItem(): string | null { throw new Error('blocked'); }
  key(): string | null { throw new Error('blocked'); }
  removeItem(): void { throw new Error('blocked'); }
  setItem(): void { throw new Error('blocked'); }
}
```

- [ ] **Step 5: Implement storage adapter and state parser**

Create `src/infrastructure/storage.ts`:

```ts
import { STATIONS } from '../content/stations';
import { initialGameState, type GameState } from '../domain/game-state';

const STORAGE_KEY = 'ics-mansion-haunt:game-state';

export interface LoadResult {
  readonly state: GameState;
  readonly notice: 'reset' | 'memory-only' | null;
}

export interface GameStateStore {
  load(): LoadResult;
  save(state: GameState): 'persistent' | 'memory-only';
  clear(): void;
}

export class GameStorage implements GameStateStore {
  private memoryState = initialGameState();

  constructor(private readonly storage: Storage | null = globalThis.localStorage) {}

  load(): LoadResult {
    if (!this.storage) return { state: this.memoryState, notice: 'memory-only' };
    let raw: string | null;
    try {
      raw = this.storage.getItem(STORAGE_KEY);
    } catch {
      return { state: this.memoryState, notice: 'memory-only' };
    }
    if (raw === null) return { state: initialGameState(), notice: null };
    try {
      const state = parseState(JSON.parse(raw));
      this.memoryState = state;
      return { state, notice: null };
    } catch {
      this.clearSafely();
      return { state: initialGameState(), notice: 'reset' };
    }
  }

  save(state: GameState): 'persistent' | 'memory-only' {
    this.memoryState = state;
    try {
      if (!this.storage) return 'memory-only';
      this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return 'persistent';
    } catch {
      return 'memory-only';
    }
  }

  clear(): void {
    this.memoryState = initialGameState();
    this.clearSafely();
  }

  private clearSafely(): void {
    try {
      this.storage?.removeItem(STORAGE_KEY);
    } catch {
      // Memory state remains authoritative when browser storage is unavailable.
    }
  }
}

function parseState(value: unknown): GameState {
  if (!isRecord(value) || value.schemaVersion !== 1) throw new Error('Invalid schema');
  const ids = STATIONS.map(({ id }) => id);
  if (
    typeof value.currentStationId !== 'string'
    || !ids.some((id) => id === value.currentStationId)
  ) {
    throw new Error('Invalid station');
  }
  if (!Array.isArray(value.captured)) throw new Error('Invalid captures');
  const expected = ids.slice(0, value.captured.length);
  if (JSON.stringify(value.captured) !== JSON.stringify(expected)) {
    throw new Error('Invalid capture order');
  }
  const completed = value.captured.length === ids.length;
  if (value.completed !== completed || typeof value.soundEnabled !== 'boolean') {
    throw new Error('Invalid flags');
  }
  const expectedCurrent = completed ? ids.at(-1) : ids[value.captured.length];
  if (value.currentStationId !== expectedCurrent) throw new Error('Invalid progress');
  return value as unknown as GameState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
```

- [ ] **Step 6: Verify state and storage, then commit**

Run:

```bash
npm run test:unit -- tests/unit/game-state.test.ts tests/unit/storage.test.ts
npm run build
```

Expected: all state and persistence tests pass.

```bash
git add src/domain/game-state.ts src/infrastructure tests/unit
git commit -m "feat: persist validated hunt progress"
```

### Task 4: Render Complete Game Flow

**Files:**
- Create: `src/ui/render.ts`
- Create: `src/app/game-controller.ts`
- Modify: `src/main.ts`
- Create: `tests/ui/render.test.ts`
- Create: `tests/ui/game-controller.test.ts`

**Interfaces:**
- Consumes: `STATIONS`, `GameState`, answer validator, state transitions, and `GameStorage`
- Produces: `renderGame(root, model)`, `GameController.start()`, and stable `data-action` hooks for controller events

- [ ] **Step 1: Write failing view tests for every screen**

Create `tests/ui/render.test.ts`:

```ts
import { getAllByRole, getByLabelText, getByRole, queryByText } from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { initialGameState, type GameState } from '../../src/domain/game-state';
import { renderGame, type GameViewModel } from '../../src/ui/render';

describe('renderGame', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('main');
  });

  it('renders intro before the mission starts', () => {
    renderGame(root, model({ phase: 'intro' }));
    expect(getByRole(root, 'button', { name: 'Geisterjagd starten' })).toBeVisible();
  });

  it('renders current ghost capture with labeled input', () => {
    renderGame(root, model({ phase: 'capture' }));
    expect(getByLabelText(root, 'Name des Geistes')).toHaveAttribute('autocomplete', 'off');
    expect(getByRole(root, 'button', { name: 'Einsaugen' })).toBeVisible();
  });

  it('renders one-screen riddle after a capture', () => {
    const state = {
      ...initialGameState(),
      currentStationId: 'wc',
      captured: ['entrance'],
    } satisfies GameState;
    renderGame(root, model({ state, phase: 'riddle' }));
    expect(queryByText(root, /Wasser rauscht/)).not.toBeNull();
    expect(getByRole(root, 'button', { name: 'Ich habe den Geist gefunden' })).toBeVisible();
  });

  it('renders five progress slots without future names', () => {
    renderGame(root, model({ phase: 'capture' }));
    expect(getAllByRole(root, 'listitem')).toHaveLength(5);
    expect(queryByText(root, 'Freddy Krueger')).toBeNull();
  });

  it('renders completion phrase after final capture', () => {
    const state = {
      ...initialGameState(),
      currentStationId: 'office-management',
      captured: ['entrance', 'wc', 'bistro', 'meeting-room', 'office-management'],
      completed: true,
    } satisfies GameState;
    renderGame(root, model({ state, phase: 'complete' }));
    expect(queryByText(root, 'Mission erfüllt: Alle fünf Geister wurden eingefangen.')).toBeVisible();
  });

  it('renders storage notices as status messages', () => {
    renderGame(root, model({ notice: 'memory-only' }));
    expect(getByRole(root, 'status')).toHaveTextContent('Fortschritt kann nach dem Neuladen verloren gehen.');
  });
});

function model(overrides: Partial<GameViewModel>): GameViewModel {
  return {
    state: initialGameState(),
    phase: 'intro',
    error: null,
    notice: null,
    ...overrides,
  };
}
```

Use this explicit view model:

```ts
export interface GameViewModel {
  readonly state: GameState;
  readonly phase: 'intro' | 'capture' | 'riddle' | 'complete';
  readonly error: 'empty' | 'incorrect' | null;
  readonly notice: 'reset' | 'memory-only' | null;
}
```

- [ ] **Step 2: Run render tests red**

Run:

```bash
npm run test:unit -- tests/ui/render.test.ts
```

Expected: FAIL because `renderGame` is missing.

- [ ] **Step 3: Implement semantic rendering**

Create `src/ui/render.ts`. Render with DOM creation or escaped template values;
never interpolate user input. Required hooks and accessible labels:

```html
button[data-action="start"]
button[data-action="found"]
form[data-action="capture"]
input[name="ghostName"][autocomplete="off"]
button[data-action="reset"]
button[data-action="toggle-sound"][aria-pressed]
```

Use `aria-live="polite"` for validation and storage notices. The completion
phrase is exactly:

```text
Mission erfüllt: Alle fünf Geister wurden eingefangen.
```

The final action copy is:

```text
Zeig diesen Bildschirm beim Office Management und hol dir deinen Treat.
```

- [ ] **Step 4: Write failing controller tests**

Create `tests/ui/game-controller.test.ts` with a structural
`GameStateStore` fake:

```ts
import { fireEvent, getByLabelText, getByRole, queryByText } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameController } from '../../src/app/game-controller';
import { captureCurrentGhost, initialGameState, type GameState } from '../../src/domain/game-state';
import type { GameStateStore, LoadResult } from '../../src/infrastructure/storage';

describe('GameController', () => {
  let root: HTMLElement;
  let store: FakeStore;

  beforeEach(() => {
    root = document.createElement('main');
    store = new FakeStore();
  });

  it('starts at entrance capture after the intro action', () => {
    new GameController(root, store).start();
    fireEvent.click(getByRole(root, 'button', { name: 'Geisterjagd starten' }));
    expect(getByLabelText(root, 'Name des Geistes')).toBeVisible();
  });

  it('shows empty error without mutating state', () => {
    startCapture(root, store);
    fireEvent.submit(getByRole(root, 'form', { name: 'Geist einfangen' }));
    expect(getByRole(root, 'alert')).toHaveTextContent('Gib den Namen des Geistes ein.');
    expect(store.saved).toHaveLength(0);
  });

  it('shows incorrect error without persisting the attempt', () => {
    startCapture(root, store);
    fireEvent.input(getByLabelText(root, 'Name des Geistes'), {
      target: { value: '<img src=x onerror=alert(1)>' },
    });
    fireEvent.submit(getByRole(root, 'form', { name: 'Geist einfangen' }));
    expect(getByRole(root, 'alert')).toHaveTextContent('Geist entwischt');
    expect(root.querySelector('img[src="x"]')).toBeNull();
    expect(store.saved).toHaveLength(0);
  });

  it('captures a valid alias and opens the next riddle', () => {
    startCapture(root, store);
    fireEvent.input(getByLabelText(root, 'Name des Geistes'), {
      target: { value: 'king boo' },
    });
    fireEvent.submit(getByRole(root, 'form', { name: 'Geist einfangen' }));
    expect(queryByText(root, /Wasser rauscht/)).toBeVisible();
    expect(store.saved.at(-1)?.currentStationId).toBe('wc');
  });

  it('opens the next capture only through the found action', () => {
    store.result = { state: captureCurrentGhost(initialGameState()), notice: null };
    new GameController(root, store).start();
    expect(queryByText(root, /Wasser rauscht/)).toBeVisible();
    fireEvent.click(getByRole(root, 'button', { name: 'Ich habe den Geist gefunden' }));
    expect(getByLabelText(root, 'Name des Geistes')).toBeVisible();
  });

  it('restores persisted progress on start', () => {
    store.result = { state: captureCurrentGhost(initialGameState()), notice: null };
    new GameController(root, store).start();
    expect(queryByText(root, /Wasser rauscht/)).toBeVisible();
  });

  it('requires confirmation before reset', () => {
    store.result = { state: captureCurrentGhost(initialGameState()), notice: null };
    const confirmReset = vi.fn(() => false);
    new GameController(root, store, confirmReset).start();
    fireEvent.click(getByRole(root, 'button', { name: 'Fortschritt zurücksetzen' }));
    expect(confirmReset).toHaveBeenCalledOnce();
    expect(store.clearCount).toBe(0);
  });
});

function startCapture(root: HTMLElement, store: FakeStore): void {
  new GameController(root, store).start();
  fireEvent.click(getByRole(root, 'button', { name: 'Geisterjagd starten' }));
}

class FakeStore implements GameStateStore {
  result: LoadResult = { state: initialGameState(), notice: null };
  readonly saved: GameState[] = [];
  clearCount = 0;
  load(): LoadResult { return this.result; }
  save(state: GameState): 'persistent' {
    this.saved.push(state);
    this.result = { state, notice: null };
    return 'persistent';
  }
  clear(): void { this.clearCount += 1; }
}
```

- [ ] **Step 5: Implement controller and composition root**

Create `src/app/game-controller.ts` with constructor:

```ts
constructor(
  root: HTMLElement,
  storage: GameStateStore,
  confirmReset: () => boolean = () => window.confirm('Fortschritt wirklich zurücksetzen?'),
)
```

`start()` loads state, chooses `intro` only for pristine state, renders, and
registers one delegated click listener plus one delegated submit listener.
Capture submit calls `isAcceptedAnswer`; only accepted input invokes
`captureCurrentGhost` and `storage.save`. A successful non-final capture opens
the current station's riddle before the next capture screen. Reset renders the
intro with a fresh state only after confirmation.

Replace `src/main.ts` with composition only:

```ts
import './styles.css';
import { GameController } from './app/game-controller';
import { GameStorage } from './infrastructure/storage';

const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Missing #app mount element');

new GameController(app, new GameStorage()).start();
```

- [ ] **Step 6: Verify complete DOM flow and commit**

Run:

```bash
npm run test:unit -- tests/ui/render.test.ts tests/ui/game-controller.test.ts
npm run build
```

Expected: all UI tests and strict build pass.

```bash
git add src tests/ui
git commit -m "feat: implement complete ghost hunt flow"
```

### Task 5: Original Visual System and Reduced-Motion Effects

**Files:**
- Create: `src/assets/ghost-vacuum.svg`
- Create: `src/assets/ghost-mark.svg`
- Create: `src/ui/effects.ts`
- Modify: `src/ui/render.ts`
- Modify: `src/app/game-controller.ts`
- Modify: `src/styles.css`
- Create: `tests/unit/effects.test.ts`
- Modify: `tests/ui/render.test.ts`

**Interfaces:**
- Consumes: successful capture events and rendered `data-effect="capture"` node
- Produces: `playCaptureEffect(element: HTMLElement): Promise<void>` and original local visual assets

- [ ] **Step 1: Write failing reduced-motion effect test**

Create `tests/unit/effects.test.ts`:

```ts
import { expect, it, vi } from 'vitest';
import { playCaptureEffect } from '../../src/ui/effects';

it('finishes immediately when reduced motion is requested', async () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: true,
  } as MediaQueryList);
  const element = document.createElement('div');
  await playCaptureEffect(element);
  expect(element.dataset.captureState).toBe('complete');
});
```

- [ ] **Step 2: Add original SVG assets and effect boundary**

Create simple original SVGs from geometric paths only:

- `ghost-vacuum.svg`: generic backpack canister, hose, and green energy spiral;
- `ghost-mark.svg`: round ghost silhouette with asymmetric arms and no franchise
  facial details.

Create `src/ui/effects.ts`:

```ts
export async function playCaptureEffect(element: HTMLElement): Promise<void> {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.dataset.captureState = 'complete';
    return;
  }
  element.dataset.captureState = 'active';
  await new Promise<void>((resolve) => {
    element.addEventListener('animationend', () => resolve(), { once: true });
    window.setTimeout(resolve, 900);
  });
  element.dataset.captureState = 'complete';
}
```

- [ ] **Step 3: Apply responsive haunted-office styling**

Expand `src/styles.css` with:

- custom properties for `#10061f`, `#23113d`, `#91ff65`, `#ba75ff`, and
  high-contrast text;
- `min-height: 100dvh` and safe-area padding;
- fluid type using `clamp`;
- one-column cards capped at `32rem`;
- 44px minimum interactive controls;
- `:focus-visible` outline at least 3px;
- five-slot progress grid;
- capture animation no longer than 900ms;
- `@media (prefers-reduced-motion: reduce)` disabling transitions and animation;
- no horizontal scrolling at 320px width.

Render local SVGs with descriptive `alt` text or empty `alt` when decorative.
Keep all instructions and actions usable if SVG loading fails.

- [ ] **Step 4: Wire effect without delaying state persistence**

On successful capture, save state first, render a transient success layer, await
`playCaptureEffect`, then render riddle or completion. Do not play any sound in
this task; keep sound toggle state present but muted.

- [ ] **Step 5: Verify visuals structurally and commit**

Run:

```bash
npm run test:unit -- tests/unit/effects.test.ts tests/ui
npm run build
```

Expected: effects and UI tests pass; production build contains both SVG assets.

```bash
git add src tests
git commit -m "feat: add haunted office presentation"
```

### Task 6: Browser Acceptance Tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/hunt.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: production-equivalent Vite dev server and stable accessible roles
- Produces: end-to-end acceptance coverage on iPhone and Android viewport profiles

- [ ] **Step 1: Configure Playwright and write failing full-route test**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://127.0.0.1:4173' },
  projects: [
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
```

Create `tests/e2e/hunt.spec.ts` with helper:

```ts
async function capture(page: Page, name: string) {
  await page.getByLabel('Name des Geistes').fill(name);
  await page.getByRole('button', { name: 'Einsaugen' }).click();
}
```

Test full route using aliases and canonical names. At each step, assert the
riddle text appears, click `Ich habe den Geist gefunden`, then capture next
ghost. Finish by asserting the exact completion phrase.

- [ ] **Step 2: Add reload, reset, invalid-answer, and keyboard tests**

Add separate tests that:

- capture entrance, reload, and assert WC riddle/current progress remains;
- submit `Hui Buh` at entrance and assert no progress;
- tab through input and submit with Enter;
- reject reset when confirmation is false, then accept and assert intro;
- assert `document.documentElement.scrollWidth <= window.innerWidth`;
- emulate reduced motion and complete one capture without timeout.

- [ ] **Step 3: Install browsers and run tests red**

Run:

```bash
npx playwright install chromium webkit
npm run test:e2e
```

Expected: tests expose any missing labels, flow timing, reset behavior, or
mobile overflow.

- [ ] **Step 4: Fix only acceptance failures in production code**

Adjust semantic labels, controller timing, and CSS as required. Do not weaken
assertions or add test-only branches.

- [ ] **Step 5: Run complete local quality gate and commit**

Run:

```bash
npm run check
```

Expected: unit/UI tests, strict production build, and both mobile browser
projects pass.

```bash
git add playwright.config.ts tests/e2e package.json package-lock.json src
git commit -m "test: cover mobile hunt journey"
```

### Task 7: GitLab Pages, GitHub Pages Fallback, and Operations Guide

**Files:**
- Create: `.gitlab-ci.yml`
- Create: `.github/workflows/pages.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: `npm ci`, `npm run test:unit`, and `npm run build`
- Produces: GitLab `public/` Pages artifact, GitHub Pages artifact, and operator instructions

- [ ] **Step 1: Add GitLab Pages pipeline**

Create `.gitlab-ci.yml`:

```yaml
image: node:22-alpine

stages:
  - test
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm run test:unit
    - npm run build

pages:
  stage: deploy
  script:
    - npm ci
    - npm run build
    - mv dist public
  artifacts:
    paths:
      - public
  rules:
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
```

If the target GitLab version requires the newer Pages syntax, replace only the
job declaration with `pages: true` while preserving `public/` output and the
default-branch rule.

- [ ] **Step 2: Add disabled-by-default GitHub Pages fallback workflow**

Create `.github/workflows/pages.yml`:

```yaml
name: Deploy GitHub Pages

on:
  workflow_dispatch:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run test:unit
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

Do not enable or run deployment during implementation. Repository owner chooses
one hosting target after review.

- [ ] **Step 3: Write operational README**

Document exact commands:

```bash
nvm use
npm ci
npm run dev
npm run check
npm run build
```

Also document:

- station content lives only in `src/content/stations.ts`;
- published JavaScript exposes answers by design;
- no sensitive data belongs in source or assets;
- GitLab Pages is primary and GitHub Pages fallback;
- verify final public URL on a private phone without VPN;
- generate QR code only after URL verification;
- test printed QR at intended physical size on iOS and Android;
- place flyers in fixed route order;
- use browser reset control when testing a second run.

- [ ] **Step 4: Validate host-neutral artifact without deploying**

Run:

```bash
npm ci
npm run check
test -f dist/index.html
grep -qE '(src|href)=\"\\./assets/' dist/index.html
```

Expected: full quality gate passes and `dist/index.html` references relative
assets. Do not execute GitLab or GitHub deployment.

- [ ] **Step 5: Commit deployment configuration and docs**

```bash
git add .gitlab-ci.yml .github/workflows/pages.yml README.md
git commit -m "ci: prepare static pages delivery"
```

### Task 8: Final Verification and Content Sign-Off

**Files:**
- Modify only files implicated by verification failures

**Interfaces:**
- Consumes: entire application and both static-host configurations
- Produces: verified release candidate; no deployment

- [ ] **Step 1: Review all German copy against physical flyer names**

Confirm exact canonical spellings:

```text
König Buu Huu
Maulende Myrte
Hackfleisch hassender Zerhacker
Hui Buh
Freddy Krueger
```

Confirm every physical flyer uses the same canonical spelling and the entrance
flyer alone carries the start QR code.

- [ ] **Step 2: Run clean-install release verification**

Run:

```bash
rm -rf node_modules dist
npm ci
npm run check
```

Expected: clean dependency install, all tests, production build, and browser
acceptance suite pass.

- [ ] **Step 3: Inspect production bundle for prohibited data**

Run:

```bash
grep -RniE '(password|token|secret|api[_-]?key|floor.?plan|employee)' dist || true
```

Expected: no credentials, personal data, or confidential office details.
Expected ghost-answer matches are acceptable because client-side answers are
explicitly public.

- [ ] **Step 4: Verify repository state**

Run:

```bash
git status --short
git log --oneline --decorate -8
```

Expected: clean working tree and one focused commit per completed task.

- [ ] **Step 5: Commit only if verification required a production fix**

If Step 2 or Step 3 required code changes, rerun `npm run check`, inspect
`git status --short`, stage each listed fix by its exact path, then commit:

```bash
git commit -m "fix: address release verification findings"
```

Do not deploy, merge, or generate the final production QR code without explicit
user confirmation.
