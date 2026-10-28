import type { Station } from '../content/stations';

export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('de-DE')
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function isAcceptedAnswer(station: Station, value: string): boolean {
  const candidate = normalizeAnswer(value);
  return station.acceptedAnswers.some(
    (answer) => {
      const accepted = normalizeAnswer(answer);
      const tolerance = accepted.length <= 8 ? 1 : 2;
      return editDistance(accepted, candidate) <= tolerance;
    },
  );
}

function editDistance(left: string, right: string): number {
  let previous = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (
      let rightIndex = 1;
      rightIndex <= right.length;
      rightIndex += 1
    ) {
      const substitutionCost =
        left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        (current[rightIndex - 1] ?? 0) + 1,
        (previous[rightIndex] ?? 0) + 1,
        (previous[rightIndex - 1] ?? 0) + substitutionCost,
      );
    }
    previous = current;
  }

  return previous[right.length] ?? right.length;
}
