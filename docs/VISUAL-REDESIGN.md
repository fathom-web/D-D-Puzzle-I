# Az-Sahar — visuele herontwikkeling

## Richting: een begraven heiligdom dat langzaam ontwaakt

De oorspronkelijke gecentreerde webpagina met een kleine CSS-deur is vervangen door een beeldvullend tempelinterieur. De titel en bediening staan in de schaduw; architectuur en invallend goud licht dragen de compositie. Cinzel blijft het monumentale displaylettertype, Manrope de leesbare interfaceletter. Oud goud, obsidiaan en ingetogen rolaccenten vormen één samenhangend palet.

| Scherm | Voorheen | Nieuwe uitvoering |
| --- | --- | --- |
| Landing | Titel boven een klein deurpaneel | Beeldvullende architectuur, asymmetrische titelcompositie, rituele knoppen, rustige sessie-indicatie |
| Spelerkamers | Vrijwel identieke cirkel en paneel | Eigen SVG-sigil, kamersilhouet, achtergrondgeometrie en steenbediening per rol |
| Echo | Doorlopende stapel bediening | Genummerd luisteren en antwoorden; op desktop twee kolommen, op mobiel één duidelijke volgorde |
| Zegels | Standaard cirkel met teken | Gegraveerd rolzegel, gloed, duidelijke bevestiging en gezamenlijke voortgang |
| Cinema | Cirkel met nummers | Langzaam bewegende astrolabiumringen, vijf herkenbare rolzegels, centraal licht en subtiele architectuur |
| Onthulling | Rechthoekig boekicoon | Zwevend open boek, lichtzuil, heilige geometrie, vertraagde entree en grote oerkrachtnamen |
| DM | Vier gelijksoortige panelen | Genummerde werkgebieden, roliconen, geordende status/acties/links/hints/onthulling; reset achter uitklapper |

## Vijf kamers

- **Quasar:** sacrale zonnestralen, concentrische ringen, goud en symmetrie.
- **Gnarly:** elliptische resonantiebanen, ronde resonantiestenen en turquoise.
- **Kagen:** gedraaide vierkanten, massief steenreliëf en een geometrische kern.
- **Bryndis:** schildvorm, verticale wachtlijnen en koel zilverblauw.
- **Vespera:** hoge schaduwbogen, maansikkel en violet.

## Implementatie

`src/visuals.js` bevat de decoratieve SVG's en de Testament-presentatie. `src/app.js` behoudt de bestaande spelacties en verbindingen; een aparte, alleen visuele voorbeeldstand maakt de eerder niet-werkende knop ‘Bekijk de tempel’ bruikbaar. Deze stand maakt geen sessie aan en verzendt geen spelacties. `src/styles.css` bevat de nieuwe visuele laag en responsieve indeling.

De gedeelde spelengine, server, databaseconfiguratie, oplossingen en canoninhoud zijn ongewijzigd. De achtergrond is één geoptimaliseerde WebP van circa 232 KiB, zonder nieuwe runtime-afhankelijkheden. Animaties gebruiken voornamelijk transforms en opacity; reduced-motion schakelt ze uit. Bediening blijft toetsenbordtoegankelijk met zichtbare focusranden.

## Validatie — 15 november 2026

- Vier bestaande engine-tests geslaagd.
- JavaScript-syntaxcontrole en `git diff --check` geslaagd.
- Volledige lokale browserdoorloop met vijf spelers, DM en cinema: ontdekking, zes correcte echo's, vijf zegels, poorten openen en DM-onthulling geslaagd.
- Alle vijf kameridentiteiten visueel gecontroleerd.
- Mobiele landing en echo-interface op 390 CSS-pixels gecontroleerd; bodybreedte en scrollbreedte beide 390 pixels.
- De screenshots tonen de visuele voorbeeldstand of een geïsoleerde lokale demosessie. Ze bevatten geen echte persoonlijke sessielinks.
- Geen fysieke iPhone-/Android-test of nieuwe live-backendintegratietest uitgevoerd. De server en netwerkcode zijn niet opnieuw ontworpen.

## Screenshots

Zie [screenshots](screenshots/): landing, spelerkamer, DM-dashboard, cinema, onthulling, mobiele preview, aanvullende kamers en de oorspronkelijke landing. `overview.jpg` combineert de zes gevraagde hoofdweergaven.

## Achtergrondasset

Bestand: `assets/az-sahar-sanctuary.webp`. Gegenereerd met de ingebouwde afbeeldingsgenerator en daarna naar WebP geoptimaliseerd. Art-directionprompt: monumentale symmetrische zandstenen tempelarchitectuur rond een hoge bronzen deur, sacrale zoninscriptie, dun witgoud licht langs de deur, zwevend stof, warme lichtbundels, geoxideerd brons, donkere vrije ruimte links voor tekst; geen personages, tekst of interface. Het volledige prompt staat in `assets/ART-DIRECTION.txt`.
