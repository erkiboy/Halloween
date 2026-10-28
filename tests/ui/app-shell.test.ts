import { getByRole } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('app shell', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.body.innerHTML = '<main id="app"></main>';
  });

  it('renders the German mission heading and start action', async () => {
    await import('../../src/main');
    const app = document.querySelector<HTMLElement>('#app');
    expect(app).not.toBeNull();
    expect(
      getByRole(app!, 'heading', { name: 'Einsatzbefehl: ICS Mansion' }),
    ).toBeVisible();
    expect(
      getByRole(app!, 'button', { name: 'Jagd beginnen' }),
    ).toBeVisible();
  });
});
