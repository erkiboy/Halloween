import { describe, expect, it } from 'vitest';

import { STATIONS } from '../../src/content/stations';

describe('station riddles', () => {
  it('uses indirect pop-culture clues without naming target rooms', () => {
    const riddles = STATIONS.slice(0, -1).map(
      ({ nextRiddle }) => nextRiddle ?? '',
    );

    expect(riddles[0]).toContain('Sprache ohne Beine');
    expect(riddles[0]).toContain('Rohre');
    expect(riddles[1]).toContain('Das Licht flackert');
    expect(riddles[1]).toContain('Bikini Bottom');
    expect(riddles[2]).toContain('ohne gültige Lizenz');
    expect(riddles[2]).toContain('mehr Lebende');
    expect(riddles[3]).toContain('Albträume des Büroalltags');
    expect(riddles[3]).toContain('verlorene Schlüssel');

    for (const riddle of riddles) {
      expect(riddle).not.toMatch(
        /\b(?:WC|Bistro|Meetingraum|Office Management)\b/i,
      );
    }
  });
});
