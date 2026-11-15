# Backend instellen — Supabase (live multiplayer)

**Status: Supabase-project, database, Edge Function en GitHub Pages zijn actief. De live backend-E2E met vijf rollen is geslaagd. Een fysieke test op iPhone/Android met eigen oordopjes blijft aanbevolen.**

## A. Nieuw, afzonderlijk project

**Reeds aangemaakt:** Supabase-project **Novus Ordo Mundi**, referentie `brjvnwsilfdrmbgsnoqs`, in de organisatie van fathom-web. Het project staat los van StudyForge en sv Diemen.

**Gekozen regio:** `eu-west-1` (Europa).

## B. Database

**Al toegepast:** `supabase/migrations/20261115172000_az_sahar_temple.sql`. Voor een nieuwe omgeving kan dezelfde migratie worden uitgevoerd. De tabellen `public.nom_az_sessions` en `public.nom_az_members` krijgen RLS zonder clientbeleid, zodat alléén serverfuncties met geheime sleutel erbij kunnen.

De trigger gebruikt `realtime.send()` om **uitsluitend revisienummers** als publieke realtime-broadcasts te versturen. Deze events bevatten geen persoonsgegevens of geheime roldata. Als broadcasts niet werken, valt de client terug op periodiek ophalen van de status.

## C. Edge Function

De runtime in `backend/index.ts` gebruikt een service-role (of nieuwe secret) server-side. Maak een Edge Function met naam `az-sahar-game` en deploy de drie bestanden:

- `backend/index.ts` → `index.ts`
- `backend/engine.js` → `engine.js`
- `backend/deno.json` → `deno.json`

De function is uitgerold als `az-sahar-game`, met **verify_jwt=false** omdat de functie per sessie zijn eigen veilige capability-tokencontrole uitvoert. Dit is geen algemene permissie om gameacties ongeauthenticeerd uit te voeren: alleen `create` is zonder token toegestaan, met een limiet per IP. Andere acties eisen een token van de DM of de juiste rol.

De server verwacht bestaande door Supabase beheerde omgevingvariabelen `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` (of `SUPABASE_SECRET_KEY`). **Nooit secretkeys in de GitHub-repository of `src/config.js` opnemen.**

Configureer waar nodig `AZ_SAHAR_ALLOWED_ORIGINS` als komma-gescheiden lijst. Standaard opgenomen: `https://fathom-web.github.io`, `https://novyxforge.com`, `http://localhost:4173`, `http://localhost:8000`. Beperk productie tot de werkelijk gebruikte domeinen.

## D. Public frontend configureren

De onderstaande publieke configuratie is **reeds ingevuld** in `src/config.js`. Bij migratie naar een ander Supabase-project moeten deze waarden worden vervangen:

```js
window.AZ_SAHAR_CONFIG = {
  supabaseUrl: 'https://<PROJECT_REF>.supabase.co',
  supabasePublishableKey: 'sb_publishable_...',
  apiUrl: 'https://<PROJECT_REF>.supabase.co/functions/v1/az-sahar-game'
};
```

**Plak uitsluitend een publishable key.** Het is expliciet veilig dat die publiek in browsercode staat. De secret key hoort uitsluitend in Supabase Edge Function secrets.

De gewijzigde `src/config.js` is al via GitHub Pages gepubliceerd.

## E. Live testen (backend geslaagd; fysieke apparaatcheck nog doen)

1. Maak vanaf de live website één sessie aan.
2. Open elk van de vijf spelerslinks op **verschillende apparaten**.
3. Open het presentatiescherm op een zesde client.
4. Test alle stenen, alle zes stappen van de echo, de vijf zegels en de DM-onthulling.
5. Test een verkeerde rol-/DM-token en bevestig HTTP 403.
6. Test dat een speler geen DM-acties kan uitvoeren.
7. Test dat een bevroren netwerkverbinding na herstel correct gesynchroniseerd wordt.
8. Bekijk de Supabase Security Advisor, logs en usage na het testen.

## F. Beperkingen die bewust gemeld moeten blijven

- De publieke website is nu gekoppeld aan de live server en ondersteunt echte internetmultiplayer. De lokale browserdemo kan nog apart worden gebruikt als testsituatie.
- De live Edge Function heeft een publieke sessieaanmaakroute met een eenvoudige rate limit; harde abuse-limits kunnen aanvullende infrastructuur vereisen.
- Een persoon die een rolgebonden link krijgt, kan die doorsturen; linkbezit geeft roltoegang.
- De broncode is publiek, dus een technisch vaardige speler kan de statische voorbeeldoplossingen inspecteren.
- Browsertrillingen zijn niet essentieel; iPhone Safari biedt daar geen betrouwbare standaardondersteuning voor.
- Voor het echte speelevenement dient native Safari en Android Chrome op fysieke toestellen getest te worden.
