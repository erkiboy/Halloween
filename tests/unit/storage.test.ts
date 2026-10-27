import { describe, expect, it } from 'vitest';

import {
  captureCurrentGhost,
  initialGameState,
} from '../../src/domain/game-state';
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

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class ThrowingStorage implements Storage {
  get length(): number {
    throw new Error('blocked');
  }

  clear(): void {
    throw new Error('blocked');
  }

  getItem(): string | null {
    throw new Error('blocked');
  }

  key(): string | null {
    throw new Error('blocked');
  }

  removeItem(): void {
    throw new Error('blocked');
  }

  setItem(): void {
    throw new Error('blocked');
  }
}
