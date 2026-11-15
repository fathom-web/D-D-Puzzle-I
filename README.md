# Novus Ordo Mundi — De Stilte van Az-Sahar

Een multiplayer D&D-tempelproef voor vijf helden, één Dungeon Master en één extra presentatiescherm.

## Live status

- **Website:** https://fathom-web.github.io/D-D-Puzzle-I/
- **Backend:** apart Supabase-project **Novus Ordo Mundi** in `eu-west-1` (`brjvnwsilfdrmbgsnoqs`).
- **Edge Function:** `az-sahar-game`, actief en verbonden met de publieke frontend.
- **Database:** `nom_az_sessions` en `nom_az_members`, RLS ingeschakeld, geen rechtstreekse anonieme toegang.
- **Integratietest:** geslaagd met vijf spelersrollen, zes signaaloverdrachten, vijf gelijktijdige zegels, DM-onthulling, rolfilters en controle op verboden databasetoegang.
- **Fysieke iPhone-/Android-test:** nog door de spelers uit te voeren voor de D&D-avond.

## Start een spel

1. Open de website op de DM-laptop.
2. Kies **Creëer een speelsessie**; de DM krijgt een geheime sessielink.
3. Kopieer via de DM-tafel een unieke URL naar elk van de vijf spelers: Quasar, Gnarly, Kagen, Bryndis en Vespera.
4. Open de URL van **Groot scherm** op het extra HDMI-scherm.
5. Laat iedereen zijn audio testen en gebruik zo nodig oordopjes.
6. De DM begint met **Sluit de vijf deuren**.
7. Iedere speler activeert zijn eigen resonantiesteen; vervolgens reizen zes signalen door de vijf kamers.
8. De vijf spelers activeren het Vijfvoudige Zegel. De deuren openen.
9. Het fysieke D&D-gevecht vindt plaats **buiten de applicatie**.
10. Alleen daarna activeert de DM de afzonderlijke Testament-scène.

Een spelerlink geeft toegang tot één specifieke kamer; behandel deze link als privé. Deel nooit de DM-link.

## Architectuur

- `index.html`, `favicon.svg`: statische website voor GitHub Pages.
- `src/styles.css`: zandsteen- en goudthema.
- `src/app.js`: vijf ruimtes, DM-dashboard, cinema, audio, realtime notificaties en fallback-polling.
- `src/config.js`: uitsluitend de **publieke** Supabase URL, publishable key en functie-URL.
- `src/engine.js`: gedeelde spelregels en zichtbare rolfilters; de server is leidend.
- `backend/index.ts`, `backend/engine.js`, `backend/deno.json`: beveiligde serverkant met willekeurige rol- en DM-tokens.
- `supabase/migrations/`: database + minimale realtime-broadcasts met uitsluitend revisienummers.
- `docs/ARCHITECTURE.md` en `docs/SETUP.md`: ontwerp en beheer.
- `tests/engine.test.mjs`: offline unit tests.
- `tests/live_backend.test.mjs`: netwerk-E2E met de daadwerkelijke Supabase-projectserver.
- `tests/live_browser.test.js`: test van de gepubliceerde website met vijf afzonderlijke mobiele browserclients, DM en bioscoopscherm.
- `tests/browser_qa.py`: optionele lokale browser-demo-test.

## Testen

```sh
npm test
npm run test:live
```

De live GitHub Actions-workflows worden uitgevoerd wanneer hun respectievelijke testbestanden worden bijgewerkt of handmatig vanuit GitHub Actions worden gestart.

## Beveiliging en beperkingen

- De spelstatus wordt uitsluitend op de server gewijzigd. De Edge Function controleert elke actie en roltoegang.
- RLS weigert rechtstreekse toegang tot de databasetabellen vanuit gewone browsers.
- Browserclients zien niet de volledige oplossing of andere privérolgegevens uit serverstatus.
- Alleen de publieke revisienummers worden via een openbaar realtimekanaal verspreid. Een mislukte realtimeverbinding schakelt over op statuscontroles.
- **Er bestaat geen gebruikersaccount voor de DM.** Een niet te raden persoonlijke DM-link is de toegangssleutel. Wie die link ontvangt, kan ook de DM-besturing gebruiken.
- De spelmechaniek is in een publieke GitHub-repository in te zien. Dit is een hobby-escape room, geen opslagplaats voor echte geheimen.
- De sessieaanmaak kent een eenvoudige limiet; dit is geen volwaardig antimisbruiksysteem.
- De game is ontworpen om op smartphones te werken, maar echte mobiele Safari-/Android-handmatige tests en audioafstemming blijven nodig.

## Canon

Deze Vergeten Tempel is een **nieuw campagnevoorstel** en bevestigt niet Quasars biologische geboorteplaats. De Eerste Diepte onder de Heilige Bron blijft een apart canoniek mysterie. De vier oerkrachten zijn Aether, Vitae, Umbra en Ruin. Het Testament is een kennisboek, geen sleutel of verplichte vijf-sleuteljacht.

**DM-spoilers:** houd de volledige DM-handleiding buiten deze openbare repository.
