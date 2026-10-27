import {
  getAllByRole,
  getByLabelText,
  getByRole,
  queryByText,
} from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  initialGameState,
  type GameState,
} from '../../src/domain/game-state';
import {
  renderGame,
  type GameViewModel,
} from '../../src/ui/render';

describe('renderGame', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('main');
    document.body.replaceChildren(root);
  });

  it('renders intro before the mission starts', () => {
    renderGame(root, model({ phase: 'intro' }));
    expect(
      getByRole(root, 'button', { name: 'Geisterjagd starten' }),
    ).toBeVisible();
  });

  it('renders current ghost capture with labeled input', () => {
    renderGame(root, model({ phase: 'capture' }));
    expect(getByLabelText(root, 'Name des Geistes')).toHaveAttribute(
      'autocomplete',
      'off',
    );
    expect(getByRole(root, 'button', { name: 'Einsaugen' })).toBeVisible();
  });

  it('renders one-screen riddle after a capture', () => {
    const state = {
      ...initialGameState(),
      currentStationId: 'wc',
      captured: ['entrance'],
    } satisfies GameState;
    renderGame(root, model({ state, phase: 'riddle' }));
    expect(queryByText(root, /Wasser rauscht/)).toBeVisible();
    expect(
      getByRole(root, 'button', { name: 'Ich habe den Geist gefunden' }),
    ).toBeVisible();
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
      captured: [
        'entrance',
        'wc',
        'bistro',
        'meeting-room',
        'office-management',
      ],
      completed: true,
    } satisfies GameState;
    renderGame(root, model({ state, phase: 'complete' }));
    expect(
      queryByText(
        root,
        'Mission erfüllt: Alle fünf Geister wurden eingefangen.',
      ),
    ).toBeVisible();
  });

  it('renders storage notices as status messages', () => {
    renderGame(root, model({ notice: 'memory-only' }));
    expect(getByRole(root, 'status')).toHaveTextContent(
      'Fortschritt kann nach dem Neuladen verloren gehen.',
    );
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
