import { isAcceptedAnswer } from '../domain/answers';
import {
  captureCurrentGhost,
  getCurrentStation,
  initialGameState,
  type GameState,
} from '../domain/game-state';
import type {
  GameStateStore,
  LoadResult,
} from '../infrastructure/storage';
import {
  renderGame,
  type GameViewModel,
} from '../ui/render';
import { playCaptureEffect } from '../ui/effects';

export class GameController {
  private state = initialGameState();
  private phase: GameViewModel['phase'] = 'intro';
  private error: GameViewModel['error'] = null;
  private notice: LoadResult['notice'] = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly storage: GameStateStore,
    private readonly confirmReset: () => boolean = () =>
      window.confirm('Fortschritt wirklich zurücksetzen?'),
  ) {}

  start(): void {
    const loaded = this.storage.load();
    this.state = loaded.state;
    this.notice = loaded.notice;
    this.phase = this.state.completed
      ? 'complete'
      : this.state.captured.length > 0
        ? 'riddle'
        : 'intro';
    this.root.addEventListener('click', this.handleClick);
    this.root.addEventListener('submit', this.handleSubmit);
    this.render();
  }

  private readonly handleClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    switch (action) {
      case 'start':
      case 'found':
        this.phase = 'capture';
        this.error = null;
        this.render();
        break;
      case 'reset':
        this.reset();
        break;
      case 'toggle-sound':
        this.toggleSound();
        break;
    }
  };

  private readonly handleSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (
      !(form instanceof HTMLFormElement) ||
      form.dataset.action !== 'capture'
    ) {
      return;
    }

    event.preventDefault();
    const data = new FormData(form);
    const answer = data.get('ghostName');
    if (typeof answer !== 'string' || answer.trim() === '') {
      this.error = 'empty';
      this.render();
      return;
    }

    if (!isAcceptedAnswer(getCurrentStation(this.state), answer)) {
      this.error = 'incorrect';
      this.render();
      return;
    }

    this.state = captureCurrentGhost(this.state);
    this.notice =
      this.storage.save(this.state) === 'memory-only'
        ? 'memory-only'
        : this.notice;
    this.phase = this.state.completed ? 'complete' : 'riddle';
    this.error = null;
    this.render();
    const screen = this.root.querySelector<HTMLElement>('.screen');
    if (screen) {
      void playCaptureEffect(screen);
    }
  };

  private reset(): void {
    if (!this.confirmReset()) {
      return;
    }

    this.storage.clear();
    this.state = initialGameState();
    this.phase = 'intro';
    this.error = null;
    this.notice = null;
    this.render();
  }

  private toggleSound(): void {
    this.state = {
      ...this.state,
      soundEnabled: !this.state.soundEnabled,
    };
    this.notice =
      this.storage.save(this.state) === 'memory-only'
        ? 'memory-only'
        : this.notice;
    this.render();
  }

  private render(): void {
    renderGame(this.root, {
      state: this.state,
      phase: this.phase,
      error: this.error,
      notice: this.notice,
    });
  }
}
