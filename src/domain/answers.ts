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
    (answer) => normalizeAnswer(answer) === candidate,
  );
}
