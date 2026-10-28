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
      'Der nächste Spuk bewacht einen Eingang, den nur eine Sprache ohne Beine öffnen kann. Wo eine Schülerin seit Jahrzehnten klagt und Rohre tiefer führen als jeder Abfluss, beginnt deine Suche.',
  },
  {
    id: 'wc',
    ghostName: 'Maulende Myrte',
    acceptedAnswers: ['Maulende Myrte', 'Myrte'],
    nextRiddle:
      'Drei Zeichen kündigen ihn an: Das Licht flackert. Das Telefon schweigt. Ein Bus erscheint. In Bikini Bottom begann damit eine gefürchtete Nachtschicht. Im ICS ersetzt du Burger durch Bohnen und folgst dorthin, wo die Crew ihren Hunger und ihre Müdigkeit besiegt.',
  },
  {
    id: 'bistro',
    ghostName: 'Hackfleisch hassender Zerhacker',
    acceptedAnswers: ['Hackfleisch hassender Zerhacker'],
    nextRiddle:
      'Seit Jahrhunderten spukt er ohne gültige Lizenz. Seine Burg fehlt, doch ein Saal genügt. Suche keine Rittertafel: Finde jene Runde, die mehr Lebende versammelt als jede andere im Haus. Dort wartet der einzig behördlich geprüfte Spuk.',
  },
  {
    id: 'meeting-room',
    ghostName: 'Hui Buh',
    acceptedAnswers: ['Hui Buh'],
    nextRiddle:
      'Der Letzte wartet nicht dort, wo du schläfst, sondern dort, wo Albträume des Büroalltags enden: verlorene Schlüssel, fehlende Vorräte, unbekannte Räume. Finde die Stelle, die all das verwaltet. Dein Lohn liegt bereits in ihrer Obhut.',
  },
  {
    id: 'office-management',
    ghostName: 'Freddy Krueger',
    acceptedAnswers: ['Freddy Krueger', 'Freddy'],
    nextRiddle: null,
  },
] as const;
