import './styles.css';

import { GameController } from './app/game-controller';
import { GameStorage } from './infrastructure/storage';

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('Missing #app mount element');
}

new GameController(app, new GameStorage()).start();
