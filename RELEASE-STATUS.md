# Release status — De Stilte van Az-Sahar

## Built and checked

- New standalone Dutch desert-temple frontend: hero landing, five visual role chambers, projector and DM dashboard.
- Three-stage cooperative puzzle: stone discovery, six-step audio chain and timed five-seal ending.
- Separate DM-controlled physical-battle holding stage and editable Testament reveal.
- Local same-browser rehearsal that explicitly marks itself **not live multiplayer**.
- Supabase migration, RLS-locked private tables, opaque role tokens, DM login and rate limit, revision-based optimistic updates, and Realtime broadcasts with polling fallback.
- Runtime syntax check of `app.js` using Node.
- Browser rendering smoke-check of homepage in Chromium (no page errors in initial successful run).
- Automated Node engine test: 200 randomized puzzle seeds all return the complement, complete five-role chain, seal and reveal, and wrong-player rejection.

## Not completed / external prerequisites

- **Supabase is not connected to this chat.** The DB migration and Edge Function cannot be deployed from here without explicit connection to a Supabase project. Therefore real five-phone multiplayer is **not live**.
- Browser test harness cannot navigate to localhost because the managed browser blocks page navigations; later mobile and DM screenshot automation also stalled. Treat the more extensive cross-device QA as pending.
- Real iPhone Safari and Android Chrome testing still required.
- QR codes and dedicated original music/sound assets have not been implemented; there are personal links and Web Audio synthesized pulse sounds.
- Planned DM pause/resume is not yet implemented; existing DM can change phases and override stalled chain steps.
- Supabase credentials and Edge Function environment setup remain manual. No secrets are included here.
- No proof of GitHub Pages live publication until the new frontend is merged into `main` and the Pages workflow succeeds.

## Deployment gate

Verify the Supabase account setup and execute the five-client E2E tests before telling players this is ready for the real session. The static site remains useful for preview and same-browser practice.