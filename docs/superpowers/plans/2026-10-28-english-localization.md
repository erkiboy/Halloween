# English-Only Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the complete participant-facing app and printable hunt package to English while preserving route behavior, saved progress, typo tolerance, mobile usability, and the public Pages URL.

**Architecture:** Keep the current English-only runtime simple: update the existing station content and renderer directly instead of introducing an i18n layer. Preserve stable station IDs and storage schema. Generate a separate English print package outside the application bundle so print tooling adds no runtime dependency.

**Tech Stack:** TypeScript 5.9, Vite 7, Vitest 3, Testing Library, Playwright 1.56, HTML/CSS/SVG, Python Pillow, QRCode CLI.

**Spec:** `docs/superpowers/specs/2026-10-28-english-localization-design.md`

## Global Constraints

- Runtime language is English only; do not add an i18n framework.
- Stable station IDs, storage key, and state schema remain unchanged.
- Canonical names are `King Boo`, `Moaning Myrtle`, `Hash-Slinging Slasher`, `Hui Buh`, and `Freddy Krueger`.
- Tutorial remains automatically recorded as `1/5`.
- Typo tolerance remains length-dependent and capped at two edits.
- Riddles must not directly name destination rooms.
- Public QR target is exactly `https://erkiboy.github.io/Halloween/`.
- Main poster date is `October 29–30, 2026`.
- German print assets remain unchanged and available.
- No deployment is executed; GitHub Pages workflow remains manual.

---

### Task 1: English Station Content and Answer Validation

**Files:**
- Modify: `src/content/stations.ts`
- Modify: `tests/unit/stations.test.ts`
- Modify: `tests/unit/answers.test.ts`

**Interfaces:**
- Consumes: `Station` with `id`, `ghostName`, `acceptedAnswers`, and `nextRiddle`.
- Produces: English `STATIONS` content consumed by controller, renderer, and completion screen.

- [ ] **Step 1: Replace station expectations with failing English tests**

Update `tests/unit/stations.test.ts` to assert canonical names and English clue references:

```ts
expect(STATIONS.map(({ ghostName }) => ghostName)).toEqual([
  'King Boo',
  'Moaning Myrtle',
  'Hash-Slinging Slasher',
  'Hui Buh',
  'Freddy Krueger',
]);

expect(STATIONS[0]?.nextRiddle).toMatch(/language without legs/i);
expect(STATIONS[1]?.nextRiddle).toMatch(/Bikini Bottom/i);
expect(STATIONS[2]?.nextRiddle).toMatch(/unlicensed ghost/i);
expect(STATIONS[3]?.nextRiddle).toMatch(/missing keys/i);
```

Update accepted-answer cases in `tests/unit/answers.test.ts`:

```ts
it.each([
  ['entrance', 'King Boo'],
  ['wc', 'Moaning Myrtle'],
  ['wc', 'Myrtle'],
  ['bistro', 'Hash Slinging Slasher'],
  ['meeting-room', 'Hui Buh'],
  ['office-management', 'Freddy'],
] as const)('accepts %s answer %s', (id, answer) => {
  const station = STATIONS.find((candidate) => candidate.id === id);
  expect(isAcceptedAnswer(station!, answer)).toBe(true);
});
```

- [ ] **Step 2: Run tests and verify English expectations fail**

Run:

```bash
. "$HOME/.nvm/nvm.sh" && nvm use 22 >/dev/null
npm run test:unit -- tests/unit/stations.test.ts tests/unit/answers.test.ts
```

Expected: FAIL because German canonical names and riddles are still present.

- [ ] **Step 3: Replace station content with canonical English data**

Use these canonical values in `src/content/stations.ts`:

```ts
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
    'For centuries he has haunted without a valid license. His castle is missing, but one hall will do. Do not seek a knights table: find the room that gathers more living souls than any other in the building. The officially inspected ghost is waiting there.',
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
```

- [ ] **Step 4: Run content and answer tests**

Run:

```bash
npm run test:unit -- tests/unit/stations.test.ts tests/unit/answers.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit English station content**

```bash
git add src/content/stations.ts tests/unit/stations.test.ts tests/unit/answers.test.ts
git commit -m "Translate hunt content to English"
```

---

### Task 2: English Application Shell and Game UI

**Files:**
- Modify: `index.html`
- Modify: `src/app/game-controller.ts`
- Modify: `src/ui/render.ts`
- Modify: `tests/ui/app-shell.test.ts`
- Modify: `tests/ui/render.test.ts`
- Modify: `tests/ui/game-controller.test.ts`
- Modify: `tests/e2e/hunt.spec.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: English `STATIONS` from Task 1.
- Produces: English DOM, accessibility labels, validation feedback, completion copy, and documentation.

- [ ] **Step 1: Write failing English UI tests**

Replace German role/text expectations with English equivalents:

```ts
expect(
  getByRole(root, 'heading', { name: 'Mission briefing: ICS Mansion' }),
).toBeVisible();
expect(
  getByRole(root, 'button', { name: 'Start the hunt' }),
).toBeVisible();
expect(queryByText(root, 'Example sighting')).toBeVisible();
expect(queryByText(root, 'King Boo')).toBeVisible();
```

Capture view expectations:

```ts
expect(queryByText(root, 'ECTO-VAC // NAME INPUT')).toBeVisible();
expect(getByLabelText(root, 'Ghost name')).toBeVisible();
expect(
  getByRole(root, 'button', { name: 'Seal target' }),
).toBeVisible();
```

Error expectations:

```ts
expect(getByRole(root, 'alert')).toHaveTextContent(
  'Enter the ghost name.',
);
expect(getByRole(root, 'alert')).toHaveTextContent('Ghost escaped');
```

- [ ] **Step 2: Run UI tests and verify they fail on German copy**

Run:

```bash
npm run test:unit -- tests/ui/app-shell.test.ts tests/ui/render.test.ts tests/ui/game-controller.test.ts
```

Expected: FAIL because headings, buttons, labels, and errors are German.

- [ ] **Step 3: Translate document metadata and controller confirmation**

Set `index.html` language and metadata:

```html
<html lang="en">
<meta
  name="description"
  content="The virtual Halloween ghost hunt at the ICS office."
/>
```

Set reset confirmation in `src/app/game-controller.ts`:

```ts
window.confirm('Reset the case file and all progress?')
```

- [ ] **Step 4: Translate renderer copy and accessibility labels**

Use consistent English labels in `src/ui/render.ts`:

```ts
'Reset case file'
'Mission briefing: ICS Mansion'
'Example sighting'
'Start the hunt'
'Identify target'
'Ghost name'
'Seal target'
'Encoded case note'
'Target located'
'CASE CLOSED'
```

Translate all supporting paragraphs, mission-order terms, progress states,
status messages, form errors, completion instructions, ARIA labels, and image
alternative text. Keep `ECTO-VAC` and `ICS // PARANORMAL RESPONSE UNIT`.

- [ ] **Step 5: Update controller and E2E flows to English names and roles**

The E2E route must use:

```ts
const names = [
  'Moaning Myrtle',
  'Hash-Slinging Slasher',
  'Hui Buh',
  'Freddy Krueger',
] as const;
```

Translate all Playwright locators and expected clue fragments. Preserve the
same route, reset, keyboard, reduced-motion, reload, 320 px overflow, and
touch-target scenarios.

- [ ] **Step 6: Translate README participant and operator guidance**

Translate headings, setup, controls, reset wording, hosting instructions, and
manual deployment guidance. Preserve command names and file paths unchanged.

- [ ] **Step 7: Run complete app validation**

Run:

```bash
npm run check
```

Expected: all Unit/UI tests, build, and Mobile Safari/Chrome E2E tests pass.

- [ ] **Step 8: Commit English application UI**

```bash
git add index.html src/app/game-controller.ts src/ui/render.ts README.md tests/ui tests/e2e/hunt.spec.ts
git commit -m "Translate hunt interface to English"
```

---

### Task 3: Generate English Printable Package

**Files:**
- Create: session artifact `ics-mansion-english-print-package/`
- Create: `ics-mansion-english-print-package.zip`
- Preserve: existing `ics-mansion-print-package/`

**Interfaces:**
- Consumes: canonical names and public URL from Tasks 1–2.
- Produces: one English main poster, four English station posters, PDFs, QR PNG, and ZIP.

- [ ] **Step 1: Create standalone high-error-correction QR**

Run:

```bash
npx --yes qrcode@1.5.4 \
  -o "$OUT/ics-mansion-github-pages-qr.png" \
  -w 1024 -m 4 -e H \
  'https://erkiboy.github.io/Halloween/'
```

- [ ] **Step 2: Build clean English A4 poster source**

Create a local HTML/CSS print source with five A4 portrait pages. Page one
must contain:

```text
ICS MANSION IS HAUNTED
Paranormal activity has been reported in the office.
October 29–30, 2026
During regular office hours

YOUR MISSION
1. Scan the QR code and open the ghost hunt.
2. Solve the first clue.
3. Find the next location in the office.
4. Enter the hidden ghost name.
5. Catch every ghost and claim your treat.

SCAN TO START
Bring your smartphone.
CATCH THEM ALL. CLAIM YOUR TREAT.
```

Pages two through five use `TARGET 02/05` through `TARGET 05/05`, canonical
names, and `ENTER THIS NAME INTO THE ECTO-VAC`. Keep locations off station
posters.

- [ ] **Step 3: Render print outputs**

Use Playwright Chromium to produce:

```text
ics-mansion-main-poster-en.png
ics-mansion-main-poster-en.pdf
01-moaning-myrtle.png
02-hash-slinging-slasher.png
03-hui-buh.png
04-freddy-krueger.png
ics-mansion-solution-posters-en.pdf
```

Render PNGs at 2× device scale and PDFs with `printBackground: true` and
`preferCSSPageSize: true`.

- [ ] **Step 4: Decode QR from standalone and final poster images**

Use `jsqr` with `pngjs` and assert both decoded strings equal:

```text
https://erkiboy.github.io/Halloween/
```

Expected: both decode successfully with exact URL equality.

- [ ] **Step 5: Inspect every generated page**

Check main poster and all four station PNGs for:

- no German text;
- no clipped or overlapping text;
- correct target numbering;
- correct canonical names;
- visible QR quiet zone;
- consistent A4 portrait composition.

- [ ] **Step 6: Package English assets without modifying German package**

Create:

```bash
ditto -c -k --sequesterRsrc --keepParent \
  ics-mansion-english-print-package \
  ics-mansion-english-print-package.zip
```

Expected: English ZIP exists beside unchanged German package.

---

### Task 4: Final Verification, Pull Request, and Merge

**Files:**
- Verify all files changed by Tasks 1–3.

**Interfaces:**
- Consumes: complete English app branch and print package.
- Produces: reviewed commit history, merged PR, and manual deployment instruction.

- [ ] **Step 1: Scan runtime source for remaining German participant copy**

Run:

```bash
rg -n \
  'Einsatz|Jagd|Geist|Akte|Ziel|Spur|Fortschritt|zurücksetzen|eingeben|gefunden|Maulende|Zerhacker|König' \
  index.html src README.md tests
```

Expected: no participant-facing German strings; only intentional test data is
allowed and must be explained.

- [ ] **Step 2: Run final full verification**

Run:

```bash
npm run check
```

Expected: zero failures across unit, UI, build, Mobile Safari, and Mobile
Chrome.

- [ ] **Step 3: Push branch and create pull request**

```bash
git push -u origin feature/english-localization
gh pr create \
  --base main \
  --head feature/english-localization \
  --title "Translate ICS Mansion hunt to English" \
  --body "English-only app content, canonical ghost names, riddles, validation, documentation, and refreshed mobile tests."
```

- [ ] **Step 4: Merge approved pull request**

```bash
gh pr merge --merge
```

Expected: PR state is `MERGED` and merge commit targets `main`.

- [ ] **Step 5: Report manual publication step**

Tell the operator to open GitHub Actions, select `Deploy GitHub Pages`, and
run the workflow on `main`. Do not execute deployment.

