# Backend instellen — Supabase (live multiplayer)

**Status: configuratiebeschrijving. De uitvoering en echte multiplayer-E2E-controle staan open.**

## A. Nieuw, afzonderlijk project

Maak een eigen Supabase-project **Novus Ordo Mundi** aan in de organisatie die de eigenaar expliciet kiest. Meng de speldatabase niet met bestaande systemen voor StudyForge of sv Diemen. Controleer het actuele kostenoverzicht en accountbeperkingen vóór het maken.

Regio: `eu-west-1` is logisch voor een groep in Nederland. Kies dit alleen bij projectcreatie als de gebruiker akkoord is.

## B. Database

Voer de SQL uit `supabase/migrations/20261115172000_az_sahar_temple.sql` uit via een migration tool of Supabase SQL Editor, of pas hem toe als geregistreerde migratie. De tabellen `public.nom_az_sessions` en `public.nom_az_members` krijgen RLS zonder clientbeleid, zodat alléén serverfuncties met geheime sleutel erbij kunnen.

De trigger gebruikt `realtime.send()` om **uitsluitend revisienummers** als publieke realtime-broadcasts te versturen. Deze events bevatten geen persoonsgegevens of geheime roldata. Als broadcasts niet werken, valt de client terug op periodiek ophalen van de status.

## C. Edge Function

De runtime in `backend/index.ts` gebruikt een service-role (of nieuwe secret) server-side. Maak een Edge Function met naam `az-sahar-game` en deploy de drie bestanden:

- `backend/index.ts` → `index.ts`
- `backend/engine.js` → `engine.js`
- `backend/deno.json` → `deno.json`

De function moet worden geconfigureerd met **verify_jwt=false** omdat de functie per sessie zijn eigen veilige capability-tokencontrole uitvoert. Dit is geen algemene permissie om gameacties ongeauthenticeerd uit te voeren: alleen `create` is zonder token toegestaan, met een limiet per IP. Andere acties eisen een token van de DM of de juiste rol.

De server verwacht bestaande door Supabase beheerde omgevingvariabelen `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` (of `SUPABASE_SECRET_KEY`). **Nooit secretkeys in de GitHub-repository of `src/config.js` opnemen.**

Configureer waar nodig `AZ_SAHAR_ALLOWED_ORIGINS` als komma-gescheiden lijst. Standaard opgenomen: `https://fathom-web.github.io`, `https://novyxforge.com`, `http://localhost:4173`, `http://localhost:8000`. Beperk productie tot de werkelijk gebruikte domeinen.

## D. Public frontend configureren

Na deployment kun je de volgende **publieke** waarden invullen in `src/config.js`:

```js
window.AZ_SAHAR_CONFIG = {
  supabaseUrl: 'https://<PROJECT_REF>.supabase.co',
  supabasePublishableKey: 'sb_publishable_...',
  apiUrl: 'https://<PROJECT_REF>.supabase.co/functions/v1/az-sahar-game'
};
```

**Plak uitsluitend een publishable key.** Het is expliciet veilig dat die publiek in browsercode staat. De secret key hoort uitsluitend in Supabase Edge Function secrets.

Publiceer de gewijzigde `src/config.js` daarna op GitHub Pages.

## E. Live testen (verplicht voor de game-avond)

1. Maak vanaf de live website één sessie aan.
2. Open elk van de vijf spelerslinks op **verschillende apparaten**.
3. Open het presentatiescherm op een zesde client.
4. Test alle stenen, alle zes stappen van de echo, de vijf zegels en de DM-onthulling.
5. Test een verkeerde rol-/DM-token en bevestig HTTP 403.
6. Test dat een speler geen DM-acties kan uitvoeren.
7. Test dat een bevroren netwerkverbinding na herstel correct gesynchroniseerd wordt.
8. Bekijk de Supabase Security Advisor, logs en usage na het testen.

## F. Beperkingen die bewust gemeld moeten blijven

- De demo is géén internetmultiplayer.
- De live Edge Function heeft een publieke sessieaanmaakroute met een eenvoudige rate limit; harde abuse-limits kunnen aanvullende infrastructuur vereisen.
- Een persoon die een rolgebonden link krijgt, kan die doorsturen; linkbezit geeft roltoegang.
- De broncode is publiek, dus een technisch vaardige speler kan de statische voorbeeldoplossingen inspecteren.
- Browsertrillingen zijn niet essentieel; iPhone Safari biedt daar geen betrouwbare standaardondersteuning voor.
- Voor het echte speelevenement dient native Safari en Android Chrome op fysieke toestellen getest te worden.
