# ICS Mansion Haunt

Mobile Halloween scavenger hunt for the ICS office. The static web app guides
participants through five stations, validates ghost names, and stores progress
exclusively in the browser.

## Requirements

- Node.js 22
- npm 10 or newer
- Playwright Chromium and WebKit for browser tests

## Local development

```bash
nvm use
npm ci
npm run dev
```

Full validation:

```bash
npx playwright install chromium webkit
npm run check
```

Production build:

```bash
npm run build
```

The host-neutral build is written to `dist/` and uses relative asset paths.

## Changing content

Route order, ghost names, accepted aliases, and riddle text live exclusively in
[`src/content/stations.ts`](src/content/stations.ts). Update tests and run
`npm run check` whenever this content changes.

The fixed route is:

1. Entrance tutorial – King Boo
2. Restroom – Moaning Myrtle
3. Bistro – Hash-Slinging Slasher
4. Largest meeting room – Hui Buh
5. Office Management – Freddy Krueger

Client-side answers are readable in the delivered JavaScript. Never store
credentials, personal data, internal floor plans, or confidential office
information in source files or assets.

## Hosting

### GitLab Pages

GitLab Pages is the primary target. `.gitlab-ci.yml` runs tests automatically;
the `pages` job is intentionally **manual**. Start deployment explicitly only
after review.

Before enabling:

1. The GitLab instance supports publicly reachable Pages.
2. The project may publish a public Pages site from a private repository.
3. `npm run check` passes locally.
4. The Pages URL contains no internal hostname that cannot resolve externally.

### GitHub Pages

`.github/workflows/pages.yml` is the fallback and can only be started through
`workflow_dispatch`. Configure GitHub Pages to use GitHub Actions as its source
before running it.

## QR code and office acceptance

1. Run the selected Pages deployment after explicit approval.
2. Open the final URL on a personal smartphone without corporate VPN.
3. Complete the entire route on iOS and Android.
4. Generate the QR code from the final URL only after that check.
5. Place the QR code on the entrance poster.
6. Test the printed QR at its intended size and lighting on iOS and Android.
7. Place station posters along the fixed route using the canonical names above.

For repeated test runs, use `Reset case file` in the app.

## Privacy

The app has no backend, tracking, analytics, or login. It stores only schema
version, current station, captured stations, completion status, and sound
preference under `ics-mansion-haunt:game-state` in `localStorage`.
