import { STATIONS, type StationId } from '../content/stations';
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
  private readonly storage: Storage | null;

  constructor(storage?: Storage | null) {
    this.storage = storage === undefined ? getBrowserStorage() : storage;
  }

  load(): LoadResult {
    if (!this.storage) {
      return { state: this.memoryState, notice: 'memory-only' };
    }

    let raw: string | null;
    try {
      raw = this.storage.getItem(STORAGE_KEY);
    } catch {
      return { state: this.memoryState, notice: 'memory-only' };
    }

    if (raw === null) {
      return { state: initialGameState(), notice: null };
    }

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
      if (!this.storage) {
        return 'memory-only';
      }
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
      // Memory state stays authoritative when browser storage is unavailable.
    }
  }
}

function parseState(value: unknown): GameState {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    throw new Error('Invalid schema');
  }

  const ids = STATIONS.map(({ id }) => id);
  if (!isStationId(value.currentStationId, ids)) {
    throw new Error('Invalid station');
  }
  if (!Array.isArray(value.captured)) {
    throw new Error('Invalid captures');
  }

  const expectedCaptured = ids.slice(0, value.captured.length);
  if (
    value.captured.length > ids.length ||
    !value.captured.every(
      (id, index) => id === expectedCaptured[index],
    )
  ) {
    throw new Error('Invalid capture order');
  }

  const completed = value.captured.length === ids.length;
  if (
    value.completed !== completed ||
    typeof value.soundEnabled !== 'boolean'
  ) {
    throw new Error('Invalid flags');
  }

  const expectedCurrent = completed
    ? ids.at(-1)
    : ids[value.captured.length];
  if (value.currentStationId !== expectedCurrent) {
    throw new Error('Invalid progress');
  }

  return {
    schemaVersion: 1,
    currentStationId: value.currentStationId,
    captured: [...expectedCaptured],
    completed,
    soundEnabled: value.soundEnabled,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStationId(
  value: unknown,
  ids: readonly StationId[],
): value is StationId {
  return typeof value === 'string' && ids.some((id) => id === value);
}

function getBrowserStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
