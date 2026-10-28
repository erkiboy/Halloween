import { describe, expect, it } from 'vitest';

import { STATIONS } from '../../src/content/stations';
import { isAcceptedAnswer, normalizeAnswer } from '../../src/domain/answers';

describe('normalizeAnswer', () => {
  it.each([
    ['  KÖNIG   BUU HUU ', 'koenig buu huu'],
    ['Freddy-Krueger', 'freddy krueger'],
    ['Maulende\u00a0Myrte', 'maulende myrte'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });
});

describe('isAcceptedAnswer', () => {
  it.each([
    ['entrance', 'König Buu Huu'],
    ['entrance', 'king boo'],
    ['wc', 'MYRTE'],
    ['bistro', 'Hackfleisch-hassender Zerhacker'],
    ['meeting-room', 'hui buh'],
    ['office-management', 'Freddy'],
  ] as const)('accepts %s answer %s', (id, answer) => {
    const station = STATIONS.find((candidate) => candidate.id === id);
    expect(station).toBeDefined();
    expect(isAcceptedAnswer(station!, answer)).toBe(true);
  });

  it('rejects another station answer', () => {
    expect(isAcceptedAnswer(STATIONS[0]!, 'Hui Buh')).toBe(false);
  });
});
