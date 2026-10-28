# ICS Mansion English-Only Localization

## Goal

Convert the complete participant experience and printable hunt package from
German to English while preserving the existing route, game state, mobile
behavior, typo tolerance, and public GitHub Pages URL.

## Scope

### Web application

All participant-facing content becomes English:

- document language, title, metadata, and theme copy;
- intro and tutorial;
- mission orders and progress labels;
- capture form, validation feedback, and storage notices;
- all four riddles;
- completion screen and reset confirmation;
- accessibility labels and image alternative text.

The README becomes English. Internal station IDs, storage keys, and the
versioned state shape remain unchanged.

### Canonical ghost names

The hunt uses original English names where an English original exists:

1. `King Boo` — tutorial sighting, automatically recorded as `1/5`;
2. `Moaning Myrtle`;
3. `Hash-Slinging Slasher`;
4. `Hui Buh` — unchanged because the original name is German;
5. `Freddy Krueger`.

Common punctuation-free variants and useful short forms remain accepted.
Typo tolerance remains length-dependent and capped at two edits. Canonical
English names are displayed on all participant-facing surfaces.

### Riddles

The four clues retain their approved pop-culture references and route:

1. King Boo points to the restroom through the Chamber of Secrets, a language
   without legs, a complaining student, and deep pipes.
2. Moaning Myrtle points to the bistro through the Hash-Slinging Slasher's
   signs, Bikini Bottom's night shift, and replacing burgers with beans.
3. Hash-Slinging Slasher points to the largest meeting room through an
   unlicensed castle ghost and the office's largest gathering.
4. Hui Buh points to Office Management through office nightmares involving
   missing keys, supplies, and room ownership.

Location names are not stated directly inside riddles.

## Print package

A new English package is generated independently from the German package.
The German files remain available and unchanged.

### Main poster

Create a clean A4 portrait poster instead of painting over baked German text.
It retains the neon haunted-office visual direction and includes:

- `ICS MANSION IS HAUNTED`;
- short paranormal-activity introduction;
- `October 29–30, 2026`;
- regular office-hours wording;
- five-step mission instructions;
- route summary;
- smartphone reminder;
- public QR code for `https://erkiboy.github.io/Halloween/`;
- final treat call to action.

### Station posters

Create four A4 portrait posters for:

- Moaning Myrtle;
- Hash-Slinging Slasher;
- Hui Buh;
- Freddy Krueger.

Each poster shows its sequence number, canonical name, and the instruction
`Enter this name into the ECTO-VAC`. Locations are omitted so posters can be
placed flexibly.

### Outputs

The English package contains:

- main poster as PNG and PDF;
- four individual station posters as PNG;
- one four-page station-poster PDF;
- standalone QR PNG;
- one ZIP containing all English assets.

## Architecture

No localization framework is introduced. English is the only runtime
language, so existing content and rendering structures are updated directly.
`src/content/stations.ts` remains the single source for canonical names,
aliases, and riddles. Existing stable station IDs preserve saved progress.

Print assets are generated outside the application bundle. They do not add
runtime dependencies or increase page weight.

## Validation

Automated coverage verifies:

- every participant-facing app surface renders English;
- canonical names and accepted aliases work;
- typo tolerance still accepts bounded mistakes and rejects excessive ones;
- the full four-capture route completes after the tutorial;
- saved progress restores;
- mobile Safari and Chrome remain touch-friendly and do not overflow;
- production build succeeds with relative asset paths.

Generated assets are inspected visually. The QR is decoded from both the
standalone image and final main poster and must resolve exactly to the public
GitHub Pages URL.

## Delivery

Implementation is committed to a dedicated branch, reviewed through a pull
request, and merged into `main` after successful validation. GitHub Pages
deployment remains manual; the existing workflow must be started again after
merge.
