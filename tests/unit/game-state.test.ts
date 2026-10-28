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
    for (let index = 0; index < 5; index += 1) {
      state = captureCurrentGhost(state);
    }
    expect(state.completed).toBe(true);
    expect(state.captured).toHaveLength(5);
    expect(() => captureCurrentGhost(state)).toThrow('Game already completed');
  });
});
