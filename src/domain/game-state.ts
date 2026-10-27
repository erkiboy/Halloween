import { STATIONS, type Station, type StationId } from '../content/stations';

export interface GameState {
  readonly schemaVersion: 1;
  readonly currentStationId: StationId;
  readonly captured: readonly StationId[];
  readonly completed: boolean;
  readonly soundEnabled: boolean;
}

export function initialGameState(): GameState {
  return {
    schemaVersion: 1,
    currentStationId: 'entrance',
    captured: [],
    completed: false,
    soundEnabled: false,
  };
}

export function getCurrentStation(state: GameState): Station {
  const station = STATIONS.find(({ id }) => id === state.currentStationId);

  if (!station) {
    throw new Error(`Unknown station: ${state.currentStationId}`);
  }

  return station;
}

export function captureCurrentGhost(state: GameState): GameState {
  if (state.completed) {
    throw new Error('Game already completed');
  }

  const currentIndex = STATIONS.findIndex(
    ({ id }) => id === state.currentStationId,
  );
  const current = STATIONS[currentIndex];

  if (!current) {
    throw new Error(`Unknown station: ${state.currentStationId}`);
  }

  if (state.captured.includes(current.id)) {
    throw new Error(`Station already captured: ${current.id}`);
  }

  const captured = [...state.captured, current.id];
  const next = STATIONS[currentIndex + 1];

  return next
    ? { ...state, captured, currentStationId: next.id }
    : { ...state, captured, completed: true };
}
