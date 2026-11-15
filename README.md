# De Stilte van Az-Sahar — Novus Ordo Mundi

Chapter 3 of Rob's Vareth campaign. Five phones, five isolated desert-temple chambers, one echo chain, a separate cinematic audience screen, and a DM control room. Dutch UI.

**Current deployment state:** The static frontend works as a clearly marked same-browser rehearsal. **Real cross-device multiplayer requires a connected Supabase project**, deployment of the included migration and Edge Function, and editing the public values in `config.js`. Do not tell players that five-phone multiplayer works before completing and testing that configuration.

## Sites and routes

The GitHub Pages repository is `fathom-web/D-D-Puzzle-I`, with site `https://fathom-web.github.io/D-D-Puzzle-I/`.

- `/` — start screen
- `/?dm=1` — DM access and session creator
- `/?dm=1&code=XXXXXXX` — DM room
- `/?screen=XXXXXXX` — large cinematic screen, **no spoilers or private player data**
- `/?code=XXXXXXX&role=quasar&token=...` — Quasar's personal room; analogous for gnarly, kagen, bryndis, vespera

## Play flow

1. DM logs in, creates a session and sends each player their **personal, secret** link.
2. Each player opens their assigned link and performs an audio check.
3. DM starts intro, then selects *Open puzzel* when the room descriptions end.
4. Each player discovers their chamber stone bearing the chamber glyph.
5. The signal chain runs Quasar → Gnarly → Kagen → Bryndis → Vespera → Quasar.
6. All five activate their seals in one 22-second window.
7. The doors open; the DM leads a physical tabletop D&D battle.
8. After the battle, the DM may manually trigger the Testament reveal.

## Live backend setup (mandatory for five phones)

1. Create or connect a Supabase project. You can connect the Supabase app within ChatGPT for direct project configuration, or follow these manual steps.
2. Run `supabase/migrations/20261115_az_sahar.sql` in the Supabase SQL editor or via CLI migration.
3. Deploy `supabase/functions/temple-api/index.ts` as an Edge Function named `temple-api`, **with JWT verification disabled** (`supabase functions deploy temple-api --no-verify-jwt`). This is necessary for guest player links; all sensitive actions are protected separately by cryptographically random role tokens and the server-side DM passphrase. The server uses service-role credentials; never put them in the browser.
4. In Supabase Edge Functions Secrets set:
   - `TEMPLE_DM_PASSPHRASE` = a unique secret phrase of **at least 24 characters**, not a short PIN;
   - `TEMPLE_ALLOWED_ORIGINS` = `https://fathom-web.github.io` (add local development origins only if needed).
5. Edit `config.js` using the **public** `supabaseUrl` and `supabaseAnonKey` from your project's API settings. Supabase anon keys are public by design, but service-role credentials are **never** public.
6. Commit the resulting public frontend configuration to `main`. GitHub Pages rebuilds automatically.
7. Test with **five separate devices** and a DM computer. Do not assume the local rehearsal mode is multiplayer.

### Backend contract

The frontend posts to `${supabaseUrl}/functions/v1/temple-api` with public Supabase `apikey`, `Content-Type: application/json`, and private `X-Temple-Token` for authenticated actions.

DM commands: `dm.login` (returns high-entropy token), `dm.create`, and `session.act` with `dm.start`, `dm.advance`, `dm.phase`, `dm.reset`, `dm.hint`, `dm.force`, `dm.setReveal`. Guest actions: `player.ping`, `player.stone`, `player.pattern`, `player.seal`. Views: `session.view` with modes `dm`, `player`, or `screen`.

Server data is in RLS-restricted `temple_sessions` and `temple_tokens` tables. The Edge Function uses service-role access to validate every private action, hashes bearer tokens, and updates session state optimistically using revisions to prevent lost simultaneous updates. Realtime update notifications use the Supabase broadcast endpoint and WebSocket; periodic authenticated fetches provide reconnect/fallback behavior. No private answers are transmitted over broadcast or to the audience screen.

The large-screen URL accepts the room code and deliberately shows only public state. **Do not use the same browser profile as the DM for players during a real session**, since it could see DM localStorage.

## Local rehearsal (no Supabase required)

Open the static site. A banner explicitly says **OEFENMODUS · ÉÉN BROWSER**. Create a room as DM and open the five player links in tabs **in that same browser profile**. Progress is shared via localStorage and BroadcastChannel. This is only for design, scripting, and mechanic rehearsal; **not actual multi-device gameplay**. DM authorization in rehearsal is a mock. Never use rehearsal to claim backend security.

### Puzzle transformation

The server generates a five-bit seed (short=0, long=1), constrained so positions 2 and 4 are different. Each role transforms as follows:

- Quasar: replay seed
- Gnarly: reverse order
- Kagen: invert positions 2 and 4
- Bryndis: swap first and last
- Vespera: invert all five signals
- Quasar: replay the returned complement

This condition guarantees the final returned pattern is the exact complement of the original. The DM can inspect the state and help a stuck role.

## Content and canon

This is a **PROPOSAL** for an Az-Sahar temple, not a canon declaration. The original Canon Bible 8.2 has Quasar growing up in Az-Sahar, but his biological birthplace remains unknown. The canonical *Eerste Diepte* remains a separate sealed location. The four canonical primal powers are **Aether, Vitae, Umbra and Ruin**. The Testament reveals **where** relevant places may be, rather than being a magic key. The late-game revelation text is editable by the DM and only appears after the physical fight when the DM triggers it.

## Quality and limitations

- No provider credentials are stored in this repository.
- Fingerprinted high-entropy player tokens are required for private server actions; only session-safe projection is given to the projection screen.
- Public static assets can always be examined. Real secret puzzle-state validation is server-side in the supplied backend, once deployed.
- Audio is synthesized with Web Audio and requires a user gesture on iOS.
- Browser vibration is **not** required. Audio and visual contrasts carry clues.
- QR codes are not generated in this version; role-specific copyable links are available in the DM dashboard.
- Local rehearsal is not secure multiplayer; first configure Supabase.

## Files

```
index.html           Homepage / entry point
styles.css           Desert temple look and responsive layout
app.js               Player, DM and projector views; local rehearsal and live API adapter
config.js            Public Supabase configuration; blank in rehearsal build
favicon.svg          Golden rune icon
supabase/
  migrations/20261115_az_sahar.sql
  functions/temple-api/index.ts
DM-HANDLEIDING.md    Private DM script and spoilers: keep out of public GitHub
```

## Future extensions

- Generate local QR images, without sending role secrets to third-party QR services.
- Mobile device in-person tests (Safari and Android) and accessibility audit.
- More sophisticated camera movement, original ambience and expanded scene transitions.
- Robust session-creation monitoring and provider-level function rate limits.

**Do not publish `DM-HANDLEIDING.md` into the public repository.**