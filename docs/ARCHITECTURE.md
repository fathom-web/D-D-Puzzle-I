# Architectuur en ontwerpstatus

## Doel

Een vijfpersoons, geluidsgebaseerde samenwerkingsoefening zonder onderlinge spraak of zicht op de andere kamers, in de woestijnsetting van Az-Sahar. De game is onderdeel van een fysieke D&D-avond, geen vervanging van het gevecht.

## Game state

De statusmachine kent `lobby`, `discovery`, `chain`, `seal`, `escaped`, `reveal`.

De zes echo-stappen gebruiken één doorgestuurd signaal. Elke rol verwerkt alleen het signaal dat die rol binnenkrijgt. De DM krijgt ondersteuning voor hints, pauzeren, voortzetten, overslaan en ontgrendelen.

De game heeft een vaste voorbeeldpuzzel, niet een procedureel gegenereerde puzzel. Dit is bewust voor reproduceerbaar testen en DM-regie. De sessie bewaart de voortgang op één plek.

## Beveiligingsmodel in live modus

- Elke speelsessie krijgt een willekeurige UUID.
- De DM krijgt één geheim 256-bit token; elke speler en het presentatiescherm krijgt een afzonderlijk token.
- SHA-256 van `sessionId:token` wordt bewaard in afgeschermde DB-tabellen. Ruwe tokens worden niet opgeslagen.
- Edge Function bepaalt rol uitsluitend op basis van token, nooit uit een door de browser aangeleverde rolnaam.
- Alleen DM mag de spelregie bedienen.
- De server valideert iedere rolactie, puzzeltransformatie en faseovergang.
- Optimistische concurrency via `revision` verhindert dat gelijktijdige updates elkaars data overschrijven. Een conflicterende actie wordt geweigerd en kan na synchronisatie opnieuw worden aangeboden.
- De database geeft geen directe clienttoegang.
- Realtime-broadcast bevat enkel het revisienummer; `get` bij de Edge Function retourneert afgeschermde rolgegevens.

## Demo-modus

Als `src/config.js` geen backendgegevens bevat, werkt de site als een **lokale single-browser-demo** via `localStorage` en `BroadcastChannel`. De demo is expliciet ongeschikt voor meerdere telefoons en kent geen DM-beveiliging. Hij dient uitsluitend om de gebruikerservaring te bekijken voordat het nieuwe Supabase-project klaar is.

## Audio

Web Audio API genereert twee eenvoudige, herkenbare frequentiepatronen. Een gebruikersklik activeert het AudioContext. Er wordt niet op vibration/haptics vertrouwd. Toegankelijke modus toont de ontvangen reeks visueel.

## Transparante beperkingen

- Geen browserbackend-/Supabase-integrationstest uitgevoerd zolang het aparte project niet bestaat.
- De browser-UI is in Chromium via inline bronnen getest; externe navigatie was in de lokale testrunner niet beschikbaar.
- Geen echte iOS/Android device farm beschikbaar.
- Live kernfunctionaliteit hangt af van migratie, Edge Function-deployment en actuele projectconfiguratie.
