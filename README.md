# Novus Ordo Mundi — De Stilte van Az-Sahar

Een interactieve desert-fantasy D&D-tempelproef voor vijf spelers en één Dungeon Master.

## Huidige status

**De visuele game en de lokale browserdemo zijn geïmplementeerd en getest. De live backend is nog niet gekoppeld.**

In de lokale demo werken de vijf verschillende kamers, puzzelmechaniek, geluidspulsen, de DM-besturing, noodhulp, het grote scherm en de afsluitende Testament-scène. De demo deelt status via `localStorage` en `BroadcastChannel` tussen **tabbladen binnen dezelfde browser**, en **werkt niet als echte multiplayer over vijf telefoons**. Dit is bewust aangegeven op de website.

De repository bevat daarnaast een backendimplementatie voor Supabase Edge Functions, een database-migratie en de configuratie-instructies. Deze zijn **nog niet op een afzonderlijk Supabase-project uitgerold**. Ze zijn ook niet end-to-end in een echte Supabase-omgeving getest.

## Openen

- [Website — GitHub Pages](https://fathom-web.github.io/D-D-Puzzle-I/)
- Open `index.html` in een webserver. Met `npm run serve` is de lokale site op `http://localhost:8000` beschikbaar.
- Kies **Start lokale demo** voor het DM-scherm. Kopieer de vijf unieke spelerslinks naar andere tabbladen van dezelfde browser.
- Geef iedere speler alleen zijn eigen link; de presentatielink hoort op het extra scherm.
- De offline demo is niet beveiligd als echte DM-sessie en is alleen voor testen.

## Volgorde van de game

1. DM maakt een sessie en start de proef.
2. Iedere speler wekt zijn persoonlijke steen in een unieke kamer.
3. Zes opeenvolgende signaaloverdrachten tussen de vijf kamers; Quasar speelt twee keer.
4. Alle vijf zegels activeren binnen één tijdvenster van twintig seconden.
5. Poorten gaan open. Nu volgt **het fysieke D&D-gevecht**, niet in de app.
6. DM activeert de afzonderlijke Testament-onthulling nadat het gevecht is afgerond.

## Projectstructuur

- `index.html`, `favicon.svg` — statische entrypoint
- `src/styles.css` — desert-fantasy interface
- `src/app.js` — UI, audio en transports
- `src/engine.js` — deterministische puzzelregels en rolgefilterde schermdata
- `src/config.js` — **uitsluitend publieke configuratie**, nu leeg
- `backend/index.ts` en `backend/engine.js` — Supabase Edge Function, validatie met een per-sessie capability-token
- `supabase/migrations/...sql` — afgeschermde speltabellen, realtime update-notificaties
- `tests/engine.test.mjs` — unit tests voor puzzelregels
- `tests/browser_qa.py` — Chromium UI smoke test; geen echte multiplayer-netwerktest
- `docs/SETUP.md` — backendconfiguratie
- `docs/ARCHITECTURE.md` — ontwerpkeuzes en beperkingen

## Testen

```sh
npm test
# Voor lokale preview
npm run serve
```

Optioneel: met geïnstalleerde Python Playwright en Chromium kun je `python tests/browser_qa.py` uitvoeren. Deze smoketest inline de bronnen vanwege de beperkte netwerktoegang in de testomgeving. Ze valideert wel de UI-stroom maar **niet** Supabase of iOS.

## Backendsamenwerking

De echte multiplayer is ontworpen rond een speciale Supabase-projectdatabase. **Gebruik hiervoor geen bestaande sv Diemen- of StudyForge-database.** Zie [docs/SETUP.md](docs/SETUP.md).

## Security

- De live Edge Function controleert rollen via willekeurige 256-bit tokens, niet via `?dm=1`.
- Tokens staan alleen in URL-fragmenten en worden als SHA-256 hashes in de database opgeslagen.
- Alle database-tabellen hebben RLS aan en staan niet direct open voor anonieme clients.
- Het publiek realtimekanaal verstuurt alleen een niet-gevoelige `revision`-waarde; persoonlijke game-informatie wordt via de Edge Function opgevraagd.
- Dezelfde spelerlink kan door een ander worden gebruikt als de ontvanger de URL doorstuurt. Tokens zijn dus vertrouwelijk.
- De spelmechaniek zit in een **publieke repository**. Vastberaden spelers kunnen broncode lezen. Niet gebruiken voor echte persoonlijke geheimen.
- Nog nodig vóór livegang: deployed backend, controle van databasebeveiliging en echte zes-apparaten-test.

## Canon

De Vergeten Tempel is een **nieuw campagnevoorstel**, niet de bevestigde biologische geboorteplaats van Quasar. Az-Sahar, Meester Azim en de vier oerkrachten volgen de Canon Bible 8.2. De canonieke Eerste Diepte onder de Heilige Bron blijft een afzonderlijk mysterie. Het Testament is een kennisboek en geen sleutel of verplichte keten van vijf sleutels.
