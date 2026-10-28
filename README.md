# ICS Mansion Haunt

Mobile Halloween-Schnitzeljagd für das ICS Office. Die statische Web-App führt
Teilnehmende über fünf Stationen, prüft Geisternamen und speichert Fortschritt
ausschließlich im Browser.

## Voraussetzungen

- Node.js 22
- npm 10 oder neuer
- Playwright Chromium und WebKit für Browser-Tests

## Lokale Entwicklung

```bash
nvm use
npm ci
npm run dev
```

Vollständige Prüfung:

```bash
npx playwright install chromium webkit
npm run check
```

Produktions-Build:

```bash
npm run build
```

Der host-neutrale Build liegt danach unter `dist/` und verwendet relative
Asset-Pfade.

## Inhalte ändern

Reihenfolge, Geisternamen, erlaubte Aliase und Rätseltexte liegen ausschließlich
in [`src/content/stations.ts`](src/content/stations.ts). Bei Änderungen immer
Tests anpassen und `npm run check` ausführen.

Die feste Reihenfolge lautet:

1. Eingang – König Buu Huu
2. WC – Maulende Myrte
3. Bistro – Hackfleisch hassender Zerhacker
4. größter Meetingraum – Hui Buh
5. Office Management – Freddy Krueger

Clientseitige Antworten sind im ausgelieferten JavaScript lesbar. Keine
Zugangsdaten, personenbezogenen Daten, internen Raumpläne oder vertraulichen
Office-Informationen in Source oder Assets ablegen.

## Hosting

### GitLab Pages

GitLab Pages ist Primärziel. `.gitlab-ci.yml` führt Tests automatisch aus; der
`pages`-Job ist absichtlich **manuell**. Deployment erst nach Review explizit in
GitLab starten.

Vor Aktivierung prüfen:

1. GitLab-Instanz unterstützt öffentlich erreichbare Pages.
2. Projekt darf eine öffentliche Pages-Seite aus privatem Repository liefern.
3. `npm run check` läuft lokal grün.
4. Pages-URL enthält keine interne Host-Bezeichnung, die nicht extern auflösbar
   ist.

### GitHub Pages

`.github/workflows/pages.yml` ist Fallback und ausschließlich über
`workflow_dispatch` startbar. Vor Nutzung GitHub Pages mit GitHub Actions als
Source konfigurieren.

## QR-Code und Office-Abnahme

1. Gewähltes Pages-Deployment nach expliziter Freigabe ausführen.
2. Finale URL auf privatem Smartphone ohne Firmen-VPN öffnen.
3. Komplette Route auf iOS und Android durchspielen.
4. Erst danach QR-Code aus finaler URL erzeugen.
5. QR-Code in den Eingangs-Flyer einsetzen.
6. Gedruckten QR-Code in geplanter Größe und Beleuchtung erneut mit iOS und
   Android testen.
7. Weitere Flyer in fester Route platzieren; Schreibweise muss exakt den
   kanonischen Namen oben entsprechen.

Für wiederholte Testläufe `Akte zurücksetzen` in der App verwenden.

## Datenschutz

App besitzt kein Backend, Tracking, Analytics oder Login. Gespeichert werden nur
Schema-Version, aktuelle Station, gefangene Stationen, Abschlussstatus und
Tonpräferenz unter `ics-mansion-haunt:game-state` in `localStorage`.
