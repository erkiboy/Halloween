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
    textElement('p', 'FALL-NR. ICS-2026-10', 'case-id'),
  );

  const status = textElement(
    'span',
    model.state.completed ? 'GESCHLOSSEN' : 'AKTIV',
    `case-stamp${model.state.completed ? ' closed' : ''}`,
  );
  header.append(identity, status);

  const utility = createElement('div', 'utility-bar');
  utility.append(
    actionButton(
      'Akte zurücksetzen',
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
    textElement('p', 'Fall ICS-2026-10', 'document-code'),
    heading('Einsatzbefehl: ICS Mansion'),
    textElement(
      'p',
      'Eine Beispiel-Sichtung wurde bereits dokumentiert. Nutze sie, um den Ablauf zu prüfen. Danach beginnt die echte Jagd mit der ersten codierten Spur.',
      'lead',
    ),
  );

  const example = createElement('section', 'tutorial-sighting');
  example.setAttribute('aria-label', 'Beispiel-Sichtung');
  example.append(
    textElement('p', 'Beispiel-Sichtung', 'reference-label'),
    textElement('p', 'König Buu Huu', 'tutorial-ghost'),
    textElement(
      'p',
      'Vor Ort findest du für jedes Ziel einen Geisternamen. Übertrage ihn exakt ins ECTO-VAC. Eine bestätigte Identität schaltet die nächste Spur frei.',
    ),
  );

  const orders = createElement('dl', 'mission-orders');
  orders.append(
    term('Auftrag'),
    definition('4 weitere Erscheinungen lokalisieren und einfangen'),
    term('Ausrüstung'),
    definition('Smartphone, Kombinationsgabe, stabile Nerven'),
    term('Belohnung'),
    definition('Treat-Ausgabe nach vollständiger Akte'),
  );
  content.append(
    example,
    orders,
    actionButton('Jagd beginnen', 'start', 'primary-action'),
  );
  return content;
}

function renderCapture(model: GameViewModel): DocumentFragment {
  const content = document.createDocumentFragment();
  content.append(
    textElement('p', 'ECTO-VAC // NAME INPUT', 'device-label'),
    heading('Ziel identifizieren'),
    textElement(
      'p',
      'Übernimm den exakten Namen vom Fundstück. Nur bestätigte Identitäten werden versiegelt.',
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
  vacuum.alt = 'Aktiver ICS-Geistersauger';
  equipment.append(
    vacuum,
    textElement('figcaption', 'UNIT 03 // CONTAINMENT READY'),
  );
  content.append(equipment);

  const form = createElement('form', 'capture-form');
  form.dataset.action = 'capture';
  form.setAttribute('aria-label', 'Geist einfangen');

  const label = textElement('label', 'Identität des Ziels', 'field-label');
  label.htmlFor = 'ghost-name';
  const input = document.createElement('input');
  input.id = 'ghost-name';
  input.name = 'ghostName';
  input.type = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'words';
  input.spellcheck = false;
  input.inputMode = 'text';
  input.placeholder = 'GEISTERNAME';
  input.setAttribute('enterkeyhint', 'done');
  input.setAttribute('aria-label', 'Name des Geistes');
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
  form.append(actionButton('Ziel versiegeln', undefined, 'primary-action', 'submit'));
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
    textElement('p', `SPUR ${clueNumber}/04`, 'document-code'),
    heading('Codierte Fallnotiz'),
    textElement(
      'p',
      'QUERVERWEIS // POPKULTURARCHIV',
      'reference-label',
    ),
  );

  const clue = createElement('blockquote', 'riddle');
  clue.append(
    textElement('p', capturedStation.nextRiddle),
    textElement('span', 'ORT NICHT DIREKT BENANNT', 'clue-stamp'),
  );
  content.append(
    clue,
    actionButton(
      'Ziel vor Ort gefunden',
      'found',
      'primary-action',
    ),
  );
  return content;
}

function renderCompletion(state: GameState): DocumentFragment {
  const content = document.createDocumentFragment();
  content.append(
    textElement('p', 'ABSCHLUSSBERICHT // 05/05', 'document-code'),
    heading('Akte geschlossen'),
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
  const list = createElement('ol', 'evidence-index') as HTMLOListElement;
  list.setAttribute('aria-label', 'Jagdfortschritt');

  STATIONS.forEach((station, index) => {
    const isCaptured = state.captured.includes(station.id);
    const item = createElement('li', isCaptured ? 'secured' : 'open');
    item.setAttribute(
      'aria-label',
      `Akte ${index + 1}: ${isCaptured ? 'gesichert' : 'offen'}`,
    );
    item.append(
      textElement('span', String(index + 1).padStart(2, '0'), 'evidence-number'),
      textElement(
        'span',
        isCaptured ? 'GESICHERT' : 'OFFEN',
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
