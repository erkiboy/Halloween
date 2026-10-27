import { STATIONS } from '../content/stations';
import type { GameState } from '../domain/game-state';

export interface GameViewModel {
  readonly state: GameState;
  readonly phase: 'intro' | 'capture' | 'riddle' | 'complete';
  readonly error: 'empty' | 'incorrect' | null;
  readonly notice: 'reset' | 'memory-only' | null;
}

export function renderGame(root: HTMLElement, model: GameViewModel): void {
  const screen = createElement('section', 'screen');
  screen.setAttribute('aria-labelledby', 'screen-title');

  screen.append(createUtilityBar(model), createNotice(model.notice));

  switch (model.phase) {
    case 'intro':
      screen.append(renderIntro());
      break;
    case 'capture':
      screen.append(renderCapture(model));
      break;
    case 'riddle':
      screen.append(renderRiddle(model.state));
      break;
    case 'complete':
      screen.append(renderCompletion(model.state));
      break;
  }

  screen.append(renderProgress(model.state));
  root.replaceChildren(screen);
}

function renderIntro(): DocumentFragment {
  const content = document.createDocumentFragment();
  content.append(
    textElement('p', 'Paranormale Aktivität erkannt', 'eyebrow'),
    heading('ICS Mansion is haunted'),
    textElement(
      'p',
      'Fange fünf Geister und sichere dir deinen Treat.',
      'lead',
    ),
    actionButton('Geisterjagd starten', 'start', 'primary-action'),
  );
  return content;
}

function renderCapture(model: GameViewModel): DocumentFragment {
  const content = document.createDocumentFragment();
  const vacuum = document.createElement('img');
  vacuum.className = 'ghost-vacuum';
  vacuum.src = new URL(
    '../assets/ghost-vacuum.svg',
    import.meta.url,
  ).href;
  vacuum.alt = 'Aktiver ICS-Geistersauger';

  content.append(
    textElement('p', 'Geist entdeckt', 'eyebrow'),
    heading('Fang den Geist'),
    textElement(
      'p',
      'Lies den Namen auf dem Flyer und speise ihn in den Geistersauger ein.',
      'lead',
    ),
    vacuum,
  );

  const form = createElement('form', 'capture-form');
  form.dataset.action = 'capture';
  form.setAttribute('aria-label', 'Geist einfangen');

  const label = textElement('label', 'Name des Geistes', 'field-label');
  label.htmlFor = 'ghost-name';
  const input = document.createElement('input');
  input.id = 'ghost-name';
  input.name = 'ghostName';
  input.type = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'words';
  input.spellcheck = false;
  input.setAttribute('aria-required', 'true');

  form.append(label, input);
  if (model.error) {
    const error = textElement(
      'p',
      model.error === 'empty'
        ? 'Gib den Namen des Geistes ein.'
        : 'Geist entwischt – Name prüfen und erneut versuchen.',
      'form-error',
    );
    error.setAttribute('role', 'alert');
    form.append(error);
  }
  form.append(actionButton('Einsaugen', undefined, 'primary-action', 'submit'));
  content.append(form);
  return content;
}

function renderRiddle(state: GameState): DocumentFragment {
  const content = document.createDocumentFragment();
  const capturedId = state.captured.at(-1);
  const capturedStation = STATIONS.find(({ id }) => id === capturedId);

  if (!capturedStation?.nextRiddle) {
    throw new Error('Missing riddle for current progress');
  }

  content.append(
    textElement('p', 'Neue Spur', 'eyebrow'),
    heading('Wo spukt es als Nächstes?'),
    textElement('p', capturedStation.nextRiddle, 'riddle'),
    actionButton(
      'Ich habe den Geist gefunden',
      'found',
      'primary-action',
    ),
  );
  return content;
}

function renderCompletion(state: GameState): DocumentFragment {
  const content = document.createDocumentFragment();
  content.append(
    textElement('p', 'Jagd abgeschlossen', 'eyebrow'),
    heading('Mission erfüllt'),
    textElement(
      'p',
      'Mission erfüllt: Alle fünf Geister wurden eingefangen.',
      'lead',
    ),
    textElement(
      'p',
      'Zeig diesen Bildschirm beim Office Management und hol dir deinen Treat.',
      'final-instruction',
    ),
  );

  const captured = createElement('ul', 'captured-ghosts');
  captured.setAttribute('aria-label', 'Vollständige Geistersammlung');
  for (const id of state.captured) {
    const station = STATIONS.find((candidate) => candidate.id === id);
    if (station) {
      captured.append(textElement('li', station.ghostName));
    }
  }
  content.append(captured);
  return content;
}

function renderProgress(state: GameState): HTMLOListElement {
  const list = createElement('ol', 'progress') as HTMLOListElement;
  list.setAttribute('aria-label', 'Jagdfortschritt');

  for (const station of STATIONS) {
    const isCaptured = state.captured.includes(station.id);
    const item = textElement(
      'li',
      isCaptured ? station.ghostName : 'Unbekannter Geist',
      isCaptured ? 'captured' : 'pending',
    );
    list.append(item);
  }
  return list;
}

function createUtilityBar(model: GameViewModel): HTMLElement {
  const utility = createElement('div', 'utility-bar');
  const sound = actionButton(
    model.state.soundEnabled ? 'Ton ausschalten' : 'Ton einschalten',
    'toggle-sound',
    'utility-action',
  );
  sound.setAttribute('aria-pressed', String(model.state.soundEnabled));
  utility.append(
    sound,
    actionButton(
      'Fortschritt zurücksetzen',
      'reset',
      'utility-action',
    ),
  );
  return utility;
}

function createNotice(
  notice: GameViewModel['notice'],
): HTMLParagraphElement {
  const status = textElement(
    'p',
    notice === 'memory-only'
      ? 'Fortschritt kann nach dem Neuladen verloren gehen.'
      : notice === 'reset'
        ? 'Ungültiger Spielstand wurde zurückgesetzt.'
        : '',
    'status',
  );
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  return status;
}

function heading(value: string): HTMLHeadingElement {
  const element = textElement('h1', value);
  element.id = 'screen-title';
  return element;
}

function actionButton(
  label: string,
  action?: string,
  className?: string,
  type: 'button' | 'submit' = 'button',
): HTMLButtonElement {
  const button = textElement('button', label, className);
  button.type = type;
  if (action) {
    button.dataset.action = action;
  }
  return button;
}

function textElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  text: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  return element;
}
