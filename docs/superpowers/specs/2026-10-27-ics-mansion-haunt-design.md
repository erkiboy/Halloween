# ICS Mansion Haunt Design

## Purpose

Create a mobile-first Halloween scavenger hunt for the ICS office. Participants
visit five physical locations in a fixed order, identify the ghost shown on a
flyer at each location, enter that ghost's name in the web app, and receive the
next location riddle. Completing the final capture unlocks a confirmation that
can be shown to Office Management in exchange for a treat.

The experience runs from October 28 through October 30, 2026, during regular
office hours.

## Scope

The first release provides:

- one fixed five-location route;
- a start page, riddle screens, capture screens, and a final confirmation;
- local progress persistence without accounts or server-side storage;
- a responsive, accessible mobile interface;
- deployment to GitLab Pages, with GitHub Pages as a host-compatible fallback;
- content and visuals inspired by humorous haunted-mansion video games without
  copying proprietary assets, logos, interfaces, music, or sound effects.

The first release does not provide:

- accounts, participant names, analytics, rankings, or completion times;
- a backend, database, administration interface, or anti-cheat system;
- branching routes or randomized riddles;
- generated or externally hosted QR codes;
- offline-first installation as a progressive web app.

## Route and Ghosts

The route is fixed:

1. Entrance: König Buu Huu
2. WC: Maulende Myrte
3. Bistro: Hackfleisch hassender Zerhacker
4. Largest meeting room: Hui Buh
5. Office Management: Freddy Krueger

The entrance flyer contains the real start QR code and the first ghost's name.
Every other location has a flyer that clearly shows the local ghost's name as
the code word. The app never depends on image recognition or camera access.

## Experience Flow

### Start

Scanning the entrance QR code opens the public web app without authentication.
The first visit briefly introduces the mission and then presents the capture
screen for the entrance ghost.

### Capture

Every capture screen contains:

- an original ghost-vacuum illustration or animation;
- a text field for the ghost's name;
- one primary "Einsaugen" action;
- a neutral validation message when the answer is empty or incorrect.

An accepted name triggers a short capture animation, records progress locally,
adds the ghost to the collection, and opens the riddle for the next location.

### Riddle

Each riddle fits on one typical smartphone screen and indirectly identifies the
next location. The location name must not be stated verbatim. Riddles use
recognizable office characteristics:

- WC: facilities-related clues;
- Bistro: coffee-related clues;
- largest meeting room: meetings, capacity, or room-size clues;
- Office Management: organizational help and the treat destination.

Selecting "Ich habe den Geist gefunden" opens the capture screen. It does not
mark the station complete.

### Finale

Capturing Freddy Krueger records completion and displays:

- all five captured ghosts;
- an unmistakable success state;
- a short completion phrase to show Office Management;
- the instruction to collect the treat.

The completion phrase is presentation evidence, not a security credential.

## Answer Validation

Answer matching is case-insensitive. Before comparison, the app:

1. trims leading and trailing whitespace;
2. collapses repeated internal whitespace;
3. normalizes Unicode characters;
4. treats German umlaut spellings and their `ae`, `oe`, and `ue` equivalents as
   equal where relevant;
5. compares the result with an explicit allowlist for the current station.

Accepted answers:

| Station | Canonical answer | Additional accepted answers |
| --- | --- | --- |
| Entrance | König Buu Huu | Buu Huu, King Boo |
| WC | Maulende Myrte | Myrte |
| Bistro | Hackfleisch hassender Zerhacker | whitespace and punctuation-normalized variants |
| Meeting room | Hui Buh | none |
| Office Management | Freddy Krueger | Freddy |

Empty input shows: `Gib den Namen des Geistes ein.`

Incorrect input shows:
`Geist entwischt – Name prüfen und erneut versuchen.`

Attempts are unlimited. The app never reveals the answer and provides no
attempt-based hint.

## Architecture

The application is a static single-page web app. It has no runtime server
dependency beyond ordinary static file hosting.

Responsibilities are separated into:

- **content model:** stations, accepted answers, riddles, and display copy;
- **game state:** current station, captured ghosts, and completion state;
- **validation:** deterministic input normalization and answer matching;
- **persistence:** versioned serialization to browser `localStorage`;
- **views:** start, riddle, capture, success, and reset controls;
- **effects:** optional animations and sound isolated from game logic.

All internal navigation derives from validated game state. A route or URL alone
cannot advance progress. Client-side checks are a usability constraint, not a
security boundary.

## Persistence

Only the following data is stored locally:

- schema version;
- current station identifier;
- captured station identifiers;
- completion flag;
- sound preference.

No names, free-text attempts, timestamps, identifiers, cookies, or analytics
are stored or transmitted.

If `localStorage` is unavailable, the game continues with in-memory state and
warns that reloading may lose progress. If persisted state has an unsupported
schema version or invalid station data, the app discards it and displays a
controlled reset notice.

A visible "Fortschritt zurücksetzen" action requires confirmation and removes
only this application's local state.

## Visual and Interaction Design

The interface uses an original ICS haunted-mansion game aesthetic:

- dark office interiors;
- green and violet ghost energy;
- flashlight beams;
- playful three-dimensional or cartoon-like ghosts;
- restrained motion and a humorous rather than frightening tone.

It must not reuse protected game assets, logos, characters, interface layouts,
music, or sound effects. Referenced ghost names may appear as event code words;
all artwork remains original rather than copied from films, games, or series.

Each screen has one dominant action. A five-slot silhouette tracker shows
progress without revealing future ghost names. The layout supports narrow
iPhone and Android viewports, keyboard navigation, visible focus states,
adequate contrast, and `prefers-reduced-motion`.

Sound is optional, muted by default, and activated only by explicit user input.
The game remains understandable and complete without images, animation, or
sound.

## Hosting and Delivery

GitLab Pages is the primary target. GitHub Pages is the fallback. The build must
use relative asset paths and must not depend on host-specific runtime APIs.

The public deployment contains no secrets, internal floor plans, personal data,
or confidential office information. Source code may remain private if the
chosen GitLab configuration supports a public Pages site from a private
repository, but all delivered HTML, CSS, JavaScript, and assets are assumed
publicly readable.

The QR code is generated separately from the final deployment URL and inserted
into the physical entrance flyer after the URL is verified. Image generators
must not create the functional QR code.

## Error Handling

- Empty and incorrect answers receive distinct inline messages.
- Failed optional media never blocks text, input, or navigation.
- Unsupported or malformed persisted state resets safely with an explanation.
- Storage failure falls back to in-memory state instead of reporting success
  for persistence.
- A missing station or content configuration is treated as a build/test error,
  not silently skipped at runtime.

## Acceptance Criteria

1. The game follows the defined five-station order.
2. Each riddle and capture interaction fits on one typical smartphone screen
   without hiding the primary action under normal browser zoom.
3. Every canonical answer and documented alias advances only its station.
4. Answer matching handles case, surrounding whitespace, repeated whitespace,
   Unicode normalization, and documented umlaut equivalents.
5. Empty or incorrect answers never change progress.
6. Reloading restores the current valid station when local storage is
   available.
7. Direct navigation cannot mark an uncompleted station as captured.
8. Reset confirmation clears only application-owned local state.
9. The entire game remains usable with sound disabled, reduced motion enabled,
   or optional media unavailable.
10. Automated tests cover normalization, aliases, invalid answers, state
    transitions, persistence validation, and completion.
11. Browser-level tests cover the full route, reload restoration, reset,
    keyboard operation, and representative mobile viewport sizes.
12. One production build deploys unchanged to GitLab Pages and GitHub Pages.

