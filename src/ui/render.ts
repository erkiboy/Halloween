import { STATIONS } from '../content/stations';
import type { GameState } from '../domain/game-state';

export interface GameViewModel {
  readonly state: GameState;
  readonly phase: 'intro' | 'capture' | 'riddle' | 'complete';
  readonly error: 'empty' | 'incorrect' | null;
  readonly notice: 'reset' | 'memory-only' | null;
}

export function renderGame(root: HTMLElement, model: GameViewModel): void {
  const screen = createElement('section', 'screen case-file');
  screen.setAttribute('aria-labelledby', 'screen-title');
  screen.append(createCaseHeader(model), createNotice(model.notice));

  const body = createElement('div', 'case-body');
  switch (model.phase) {
    case 'intro':
      body.append(renderIntro());
      break;
    case 'capture':
      body.append(renderCapture(model));
      break;
    case 'riddle':
      body.append(renderRiddle(model.state));
      break;
    case 'complete':
      body.append(renderCompletion(model.state));
      break;
  }
  body.append(renderProgress(model.state));
  screen.append(body);
  root.replaceChildren(screen);
}

function createCaseHeader(model: GameViewModel): HTMLElement {
  const header = createElement('header', 'case-header');
  const identity = createElement('div');
  identity.append(
    textElement('p', 'ICS // PARANORMAL RESPONSE UNIT', 'unit-name'),
    textElement('p', 'CASE NO. ICS-2026-10', 'case-id'),
  );

  const status = textElement(
    'span',
    model.state.completed ? 'CLOSED' : 'ACTIVE',
    `case-stamp${model.state.completed ? ' closed' : ''}`,
  );
  header.append(identity, status);

  const utility = createElement('div', 'utility-bar');
  utility.append(
    actionButton(
      'Reset case file',
      'reset',
      'utility-action',
    ),
  );
  header.append(utility);
  return header;
}

function renderIntro(): DocumentFragment {
  const content = document.createDocumentFragment();
  content.append(
    textElement('p', 'Case ICS-2026-10', 'document-code'),
    heading('Mission briefing: ICS Mansion'),
    textElement(
      'p',
      'One example sighting has already been documented. Use it to learn the procedure. The real hunt begins with the first encoded clue.',
      'lead',
    ),
  );

  const example = createElement('section', 'tutorial-sighting');
  example.setAttribute('aria-label', 'Example sighting');
  example.append(
    textElement('p', 'Example sighting', 'reference-label'),
    textElement('p', 'King Boo', 'tutorial-ghost'),
    textElement(
      'p',
      'Each target has a ghost name hidden on site. Enter it into the ECTO-VAC. A confirmed identity unlocks the next clue.',
    ),
  );

  const orders = createElement('dl', 'mission-orders');
  orders.append(
    term('Mission'),
    definition('Locate and capture 4 more apparitions'),
    term('Equipment'),
    definition('Smartphone, deduction skills, steady nerves'),
    term('Reward'),
    definition('Treat issued when the case file is complete'),
  );
  content.append(
    example,
    orders,
    actionButton('Start the hunt', 'start', 'primary-action'),
  );
  return content;
}

function renderCapture(model: GameViewModel): DocumentFragment {
  const content = document.createDocumentFragment();
  content.append(
    textElement('p', 'ECTO-VAC // NAME INPUT', 'device-label'),
    heading('Identify target'),
    textElement(
      'p',
      'Enter the name from the evidence marker. Only confirmed identities can be sealed.',
      'lead',
    ),
  );

  const equipment = createElement('figure', 'equipment-panel');
  const vacuum = document.createElement('img');
  vacuum.className = 'ghost-vacuum';
  vacuum.src = new URL(
    '../assets/ghost-vacuum.svg',
    import.meta.url,
  ).href;
  vacuum.alt = 'Active ICS ghost vacuum';
  equipment.append(
    vacuum,
    textElement('figcaption', 'UNIT 03 // CONTAINMENT READY'),
  );
  content.append(equipment);

  const form = createElement('form', 'capture-form');
  form.dataset.action = 'capture';
  form.setAttribute('aria-label', 'Capture ghost');

  const label = textElement('label', 'Target identity', 'field-label');
  label.htmlFor = 'ghost-name';
  const input = document.createElement('input');
  input.id = 'ghost-name';
  input.name = 'ghostName';
  input.type = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'words';
  input.spellcheck = false;
  input.inputMode = 'text';
  input.placeholder = 'GHOST NAME';
  input.setAttribute('enterkeyhint', 'done');
  input.setAttribute('aria-label', 'Ghost name');
  input.setAttribute('aria-required', 'true');

  form.append(label, input);
  if (model.error) {
    const error = textElement(
      'p',
      model.error === 'empty'
        ? 'Enter the ghost name.'
        : 'Ghost escaped — check the name and try again.',
      'form-error',
    );
    error.setAttribute('role', 'alert');
    form.append(error);
  }
  form.append(actionButton('Seal target', undefined, 'primary-action', 'submit'));
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

  const clueNumber = String(state.captured.length).padStart(2, '0');
  content.append(
    textElement('p', `CLUE ${clueNumber}/04`, 'document-code'),
    heading('Encoded case note'),
    textElement(
      'p',
      'CROSS-REFERENCE // POP CULTURE ARCHIVE',
      'reference-label',
    ),
  );

  const clue = createElement('blockquote', 'riddle');
  clue.append(
    textElement('p', capturedStation.nextRiddle),
    textElement('span', 'LOCATION NOT DIRECTLY NAMED', 'clue-stamp'),
  );
  content.append(
    clue,
    actionButton(
      'Target located',
      'found',
      'primary-action',
    ),
  );
  return content;
}

function renderCompletion(state: GameState): DocumentFragment {
  const content = document.createDocumentFragment();
  content.append(
    textElement('p', 'FINAL REPORT // 05/05', 'document-code'),
    heading('Case closed'),
    textElement(
      'p',
      'Mission complete: All five ghosts captured.',
      'lead',
    ),
    textElement(
      'p',
      'Show this screen at Office Management and claim your treat.',
      'final-instruction',
    ),
  );

  const captured = createElement('ul', 'captured-ghosts');
  captured.setAttribute('aria-label', 'Complete ghost collection');
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
  const list = createElement('ol', 'evidence-index') as HTMLOListElement;
  list.setAttribute('aria-label', 'Hunt progress');

  STATIONS.forEach((station, index) => {
    const isCaptured = state.captured.includes(station.id);
    const item = createElement('li', isCaptured ? 'secured' : 'open');
    item.setAttribute(
      'aria-label',
      `File ${index + 1}: ${isCaptured ? 'secured' : 'open'}`,
    );
    item.append(
      textElement('span', String(index + 1).padStart(2, '0'), 'evidence-number'),
      textElement(
        'span',
        isCaptured ? 'SECURED' : 'OPEN',
        'evidence-state',
      ),
    );
    list.append(item);
  });
  return list;
}

function createNotice(
  notice: GameViewModel['notice'],
): HTMLParagraphElement {
  const status = textElement(
    'p',
    notice === 'memory-only'
      ? 'Progress may be lost after reloading.'
      : notice === 'reset'
        ? 'Invalid saved game was reset.'
        : '',
    'status',
  );
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  return status;
}

function term(text: string): HTMLElement {
  return textElement('dt', text);
}

function definition(text: string): HTMLElement {
  return textElement('dd', text);
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
