import { describe, expect, it } from 'vitest';

import { STATIONS } from '../../src/content/stations';

describe('station riddles', () => {
  it('uses canonical original ghost names', () => {
    expect(STATIONS.map(({ ghostName }) => ghostName)).toEqual([
      'King Boo',
      'Moaning Myrtle',
      'Hash-Slinging Slasher',
      'Hui Buh',
      'Freddy Krueger',
    ]);
  });

  it('uses indirect pop-culture clues without naming target rooms', () => {
    const riddles = STATIONS.slice(0, -1).map(
      ({ nextRiddle }) => nextRiddle ?? '',
    );

    expect(riddles[0]).toContain('language without legs');
    expect(riddles[0]).toContain('pipes');
    expect(riddles[1]).toContain('lights flicker');
    expect(riddles[1]).toContain('Bikini Bottom');
    expect(riddles[2]).toContain('without a valid license');
    expect(riddles[2]).toContain('more living souls');
    expect(riddles[3]).toContain('office nightmares');
    expect(riddles[3]).toContain('missing keys');

    for (const riddle of riddles) {
      expect(riddle).not.toMatch(
        /\b(?:restroom|bistro|meeting room|office management)\b/i,
      );
    }
  });
});
