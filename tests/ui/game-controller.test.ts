import {
  fireEvent,
  getByLabelText,
  getByRole,
  queryByText,
} from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GameController } from '../../src/app/game-controller';
import {
  captureCurrentGhost,
  initialGameState,
  type GameState,
} from '../../src/domain/game-state';
import type {
  GameStateStore,
  LoadResult,
} from '../../src/infrastructure/storage';

describe('GameController', () => {
  let root: HTMLElement;
  let store: FakeStore;

  beforeEach(() => {
    root = document.createElement('main');
    document.body.replaceChildren(root);
    store = new FakeStore();
  });

  it('starts at entrance capture after the intro action', () => {
    new GameController(root, store).start();
    fireEvent.click(
      getByRole(root, 'button', { name: 'Einsatz beginnen' }),
    );
    expect(getByLabelText(root, 'Name des Geistes')).toBeVisible();
  });

  it('shows empty error without mutating state', () => {
    startCapture(root, store);
    fireEvent.submit(getByRole(root, 'form', { name: 'Geist einfangen' }));
    expect(getByRole(root, 'alert')).toHaveTextContent(
      'Gib den Namen des Geistes ein.',
    );
    expect(store.saved).toHaveLength(0);
  });

  it('shows incorrect error without persisting or rendering the attempt', () => {
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
    expect(queryByText(root, /Sprache ohne Beine/)).toBeVisible();
    expect(store.saved.at(-1)?.currentStationId).toBe('wc');
  });

  it('opens the next capture only through the found action', () => {
    store.result = {
      state: captureCurrentGhost(initialGameState()),
      notice: null,
    };
    new GameController(root, store).start();
    expect(queryByText(root, /Sprache ohne Beine/)).toBeVisible();
    fireEvent.click(
      getByRole(root, 'button', {
        name: 'Ziel vor Ort gefunden',
      }),
    );
    expect(getByLabelText(root, 'Name des Geistes')).toBeVisible();
  });

  it('restores persisted progress on start', () => {
    store.result = {
      state: captureCurrentGhost(initialGameState()),
      notice: null,
    };
    new GameController(root, store).start();
    expect(queryByText(root, /Sprache ohne Beine/)).toBeVisible();
  });

  it('requires confirmation before reset', () => {
    store.result = {
      state: captureCurrentGhost(initialGameState()),
      notice: null,
    };
    const confirmReset = vi.fn(() => false);
    new GameController(root, store, confirmReset).start();
    fireEvent.click(
      getByRole(root, 'button', { name: 'Akte zurücksetzen' }),
    );
    expect(confirmReset).toHaveBeenCalledOnce();
    expect(store.clearCount).toBe(0);
  });
});

function startCapture(root: HTMLElement, store: FakeStore): void {
  new GameController(root, store).start();
  fireEvent.click(
    getByRole(root, 'button', { name: 'Einsatz beginnen' }),
  );
}

class FakeStore implements GameStateStore {
  result: LoadResult = { state: initialGameState(), notice: null };
  readonly saved: GameState[] = [];
  clearCount = 0;

  load(): LoadResult {
    return this.result;
  }

  save(state: GameState): 'persistent' {
    this.saved.push(state);
    this.result = { state, notice: null };
    return 'persistent';
  }

  clear(): void {
    this.clearCount += 1;
  }
}
