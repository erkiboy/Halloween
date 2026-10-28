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
    expect(queryByText(root, 'Case ICS-2026-10')).toBeVisible();
    expect(queryByText(root, 'Example sighting')).toBeVisible();
    expect(queryByText(root, 'King Boo')).toBeVisible();
    expect(
      getByRole(root, 'button', { name: 'Start the hunt' }),
    ).toBeVisible();
  });

  it('renders current ghost capture with labeled input', () => {
    renderGame(root, model({ phase: 'capture' }));
    expect(queryByText(root, 'ECTO-VAC // NAME INPUT')).toBeVisible();
    expect(
      getByRole(root, 'img', { name: 'Active ICS ghost vacuum' }),
    ).toBeVisible();
    expect(getByLabelText(root, 'Ghost name')).toHaveAttribute(
      'autocomplete',
      'off',
    );
    expect(getByLabelText(root, 'Ghost name')).toHaveAttribute(
      'enterkeyhint',
      'done',
    );
    expect(
      getByRole(root, 'button', { name: 'Seal target' }),
    ).toBeVisible();
  });

  it('renders one-screen riddle after a capture', () => {
    const state = {
      ...initialGameState(),
      currentStationId: 'wc',
      captured: ['entrance'],
    } satisfies GameState;
    renderGame(root, model({ state, phase: 'riddle' }));
    expect(queryByText(root, 'CLUE 01/04')).toBeVisible();
    expect(queryByText(root, /language without legs/)).toBeVisible();
    expect(
      getByRole(root, 'button', { name: 'Target located' }),
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
        'Mission complete: All five ghosts captured.',
      ),
    ).toBeVisible();
  });

  it('renders storage notices as status messages', () => {
    renderGame(root, model({ notice: 'memory-only' }));
    expect(getByRole(root, 'status')).toHaveTextContent(
      'Progress may be lost after reloading.',
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
