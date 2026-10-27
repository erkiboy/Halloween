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

it('animates when matchMedia is unavailable', async () => {
  const original = window.matchMedia;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: undefined,
  });
  const element = document.createElement('div');

  try {
    const effect = playCaptureEffect(element);
    expect(element.dataset.captureState).toBe('active');
    element.dispatchEvent(new Event('animationend'));
    await effect;
    expect(element.dataset.captureState).toBe('complete');
  } finally {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: original,
    });
  }
});
