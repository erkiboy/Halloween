import { getByRole } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('app shell', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.body.innerHTML = '<main id="app"></main>';
  });

  it('renders the English mission heading and start action', async () => {
    await import('../../src/main');
    const app = document.querySelector<HTMLElement>('#app');
    expect(app).not.toBeNull();
    expect(
      getByRole(app!, 'heading', { name: 'Mission briefing: ICS Mansion' }),
    ).toBeVisible();
    expect(
      getByRole(app!, 'button', { name: 'Start the hunt' }),
    ).toBeVisible();
  });
});
