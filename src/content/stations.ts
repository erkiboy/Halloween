export type StationId =
  | 'entrance'
  | 'wc'
  | 'bistro'
  | 'meeting-room'
  | 'office-management';

export interface Station {
  readonly id: StationId;
  readonly ghostName: string;
  readonly acceptedAnswers: readonly string[];
  readonly nextRiddle: string | null;
}

export const STATIONS: readonly Station[] = [
  {
    id: 'entrance',
    ghostName: 'König Buu Huu',
    acceptedAnswers: ['König Buu Huu', 'Buu Huu', 'King Boo'],
    nextRiddle:
      'Dein nächster Geist versteckt sich dort, wo selbst Geisterjäger kurz allein verschwinden und Wasser rauscht.',
  },
  {
    id: 'wc',
    ghostName: 'Maulende Myrte',
    acceptedAnswers: ['Maulende Myrte', 'Myrte'],
    nextRiddle:
      'Folge dem Duft gerösteter Bohnen. Zwischen Tassen und Koffein wartet der nächste Spuk.',
  },
  {
    id: 'bistro',
    ghostName: 'Hackfleisch hassender Zerhacker',
    acceptedAnswers: ['Hackfleisch hassender Zerhacker'],
    nextRiddle:
      'Viele Stimmen, ein großer Tisch: Suche den Raum, in dem die meisten Geister gleichzeitig tagen könnten.',
  },
  {
    id: 'meeting-room',
    ghostName: 'Hui Buh',
    acceptedAnswers: ['Hui Buh'],
    nextRiddle:
      'Für deinen letzten Einsatz brauchst du jene, die im Office Ordnung schaffen, Fragen lösen und den Treat bewachen.',
  },
  {
    id: 'office-management',
    ghostName: 'Freddy Krueger',
    acceptedAnswers: ['Freddy Krueger', 'Freddy'],
    nextRiddle: null,
  },
] as const;
