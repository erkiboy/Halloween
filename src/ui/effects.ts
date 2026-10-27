export async function playCaptureEffect(
  element: HTMLElement,
): Promise<void> {
  if (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  ) {
    element.dataset.captureState = 'complete';
    return;
  }

  element.dataset.captureState = 'active';
  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    element.addEventListener('animationend', finish, { once: true });
    window.setTimeout(finish, 900);
  });
  element.dataset.captureState = 'complete';
}
