import { describe, expect, it } from 'vitest';

import { STATIONS } from '../../src/content/stations';
import { isAcceptedAnswer, normalizeAnswer } from '../../src/domain/answers';

describe('normalizeAnswer', () => {
  it.each([
    ['  KING   BOO ', 'king boo'],
    ['Freddy-Krueger', 'freddy krueger'],
    ['Moaning\u00a0Myrtle', 'moaning myrtle'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });
});

describe('isAcceptedAnswer', () => {
  it.each([
    ['entrance', 'king boo'],
    ['wc', 'MOANING MYRTLE'],
    ['wc', 'Myrtle'],
    ['bistro', 'Hash Slinging Slasher'],
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

  it.each([
    ['wc', 'Moaning Myrta'],
    ['bistro', 'Hash Slingin Slashe'],
    ['meeting-room', 'Hui Buhh'],
  ] as const)('accepts bounded typos for %s', (id, answer) => {
    const station = STATIONS.find((candidate) => candidate.id === id);
    expect(station).toBeDefined();
    expect(isAcceptedAnswer(station!, answer)).toBe(true);
  });

  it.each([
    ['wc', 'Monin Myrta'],
    ['meeting-room', 'Hai Bux'],
  ] as const)('rejects excessive typos for %s', (id, answer) => {
    const station = STATIONS.find((candidate) => candidate.id === id);
    expect(station).toBeDefined();
    expect(isAcceptedAnswer(station!, answer)).toBe(false);
  });
});
