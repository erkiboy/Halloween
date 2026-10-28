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
    ghostName: 'King Boo',
    acceptedAnswers: ['King Boo'],
    nextRiddle:
      'The next haunting guards an entrance opened only by a language without legs. Where a student has complained for decades and pipes lead deeper than any drain, your search begins.',
  },
  {
    id: 'wc',
    ghostName: 'Moaning Myrtle',
    acceptedAnswers: ['Moaning Myrtle', 'Myrtle'],
    nextRiddle:
      'Three signs announce him: the lights flicker, the phone falls silent, and a bus appears. In Bikini Bottom they marked a feared night shift. At ICS, replace burgers with beans and follow the crew to where hunger and fatigue are defeated.',
  },
  {
    id: 'bistro',
    ghostName: 'Hash-Slinging Slasher',
    acceptedAnswers: ['Hash-Slinging Slasher', 'Hash Slinging Slasher'],
    nextRiddle:
      "For centuries he has haunted without a valid license. His castle is missing, but one hall will do. Do not seek a knight's table: find the room that gathers more living souls than any other in the building. The officially inspected ghost is waiting there.",
  },
  {
    id: 'meeting-room',
    ghostName: 'Hui Buh',
    acceptedAnswers: ['Hui Buh'],
    nextRiddle:
      'The last one is not waiting where you sleep, but where office nightmares end: missing keys, empty supplies, and rooms nobody can identify. Find the team that manages them all. Your reward is already in their custody.',
  },
  {
    id: 'office-management',
    ghostName: 'Freddy Krueger',
    acceptedAnswers: ['Freddy Krueger', 'Freddy'],
    nextRiddle: null,
  },
] as const;
