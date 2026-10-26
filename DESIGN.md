---
name: Taysan MaternaCare
description: A soft, Flo-like prenatal care web app for the Barangay Taysan Health Center; greens, beige and cream with one dusty-rose accent.
colors:
  leaf: "#3e5a4d"
  leaf-deep: "#2f473c"
  fern: "#769382"
  mint: "#e3eae4"
  sage: "#c0c3b9"
  rose: "#d9a5a0"
  rose-deep: "#9c4f4a"
  blush: "#f6e6e1"
  beige: "#e8ddc9"
  cream: "#f3efe3"
  milk: "#fbf8f3"
  white: "#ffffff"
  ink: "#1f2d27"
  ink-soft: "#56665d"
  line: "#e6e0d4"
  field: "#879389"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 3.6vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
    fontFeature: "\"cv11\""
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.35rem + 1.4vw, 2rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: "\"cv11\""
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.5rem
    fontFeature: "\"cv11\""
  lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75rem
    fontFeature: "\"cv11\""
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5rem
    fontFeature: "\"cv11\""
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25rem
    fontFeature: "\"cv11\""
  caption:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1rem
    fontFeature: "\"cv11\""
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "28px"
  3xl: "36px"
  full: "9999px"
spacing:
  gutter: "16px"
  gutter-sm: "24px"
  stack: "12px"
  card: "20px"
  card-lg: "32px"
  section: "64px"
  section-lg: "96px"
components:
  button-primary:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.leaf-deep}"
  button-primary-lg:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "0 32px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.cream}"
  button-soft:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.full}"
    height: "44px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  button-destructive:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "44px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "48px"
  icon-circle-mint:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.full}"
    size: "48px"
  icon-circle-blush:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    rounded: "{rounded.full}"
    size: "48px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "24px"
  tile-tinted:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  dialog:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    width: "448px"
  chip-sample:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  chip-status:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
---

# Design System: Taysan MaternaCare

## Overview

**Creative North Star: "The Gentle Checkup"**

A soft, Flo-inspired world built around the mother rather than the clinic. The client's palette (leaf and fern greens, beige, sage, cream on a warm milk ground) carries almost everything; one dusty rose carries the few things meant to feel tender or urgent: hearts, the baby glyph, danger signs and soft tints. Surfaces are rounded white cards, pill buttons and circles for dates and icons, sitting on curved tinted panels with low, ink-tinted shadows. It is light only, made for daylight at home and at the health center.

This is a web app, not a mobile app. Desktop gets a real web layout (header with section links, two-column sections, a 72rem container); phone widths borrow Flo's patterns (bottom sheets, full-width pill actions, stacked cards). Nothing imitates an app store, an install prompt or a device frame. Type is Inter alone, with extra-bold titles and a friendly single-storey "a". Motion is one slow float and short expo-out transitions, all stopped by reduced motion.

It refuses the generic SaaS hero (headline, device screenshot, feature grid) and clinical realism. Sample data is shown, but always labelled "Sample".

**Key Characteristics:**
- Greens do the work; rose is a small accent; text only in ink, ink-soft, leaf or rose-deep.
- Inter only, extra-bold display and section titles, tabular numerals for every date and count.
- Rounded white cards (20–36px), pill buttons, icons in soft colour circles.
- Curved tinted hero panels with a faint white ring for depth.
- Soft, low shadows tinted with ink; one gentle float.
- Web layout on desktop, Flo patterns at phone width.

## Colors

A warm, quiet green-and-cream palette with one dusty-rose accent; every text colour clears 4.5:1 on its ground.

### Primary
- **Leaf Green** (leaf): primary buttons, links, the selected language pill, the current step, the "Sample" pill on floating hero cards. White on leaf is 7.6:1; leaf on mint is 6.2:1.
- **Deep Leaf** (leaf-deep): hover state of primary buttons and links only.
- **Fern** (fern): fill and decoration only: filled icon circles, completed stepper lines, habit check marks. Too light for text.
- **Mint** (mint): the green tint: default icon circles, soft buttons (the slider −/+), done status chips, service tiles, the tips band (at 60%).

### Secondary
- **Dusty Rose** (rose): fill and decoration only: the slider fill, the closing heart, selection highlight (at 45%), SMS-thread dividers (at 40%). Never text.
- **Blush** (blush): the rose tint: danger-sign card, SMS thread panel, blush icon circles, error notices, the destructive button, the top of the rose hero gradient.
- **Rose Deep** (rose-deep): rose text and glyphs: danger signs, form errors, the baby glyph, reminder flags. 5.8:1 on white, 4.8:1 on blush.

### Neutral
- **Milk** (milk): the page ground and the browser theme colour.
- **White** (white): cards, dialogs, inputs, the footer.
- **Cream** (cream): quiet fills: services band, info tiles inside cards, the dialog close button, sample chips.
- **Beige** (beige): warm tiles and the "To be announced" chip; the end of the beige hero tone.
- **Sage** (sage): soft borders (outline button, dashed timeline), scrollbar thumb. Not text.
- **Ink** (ink): body and heading text, 14.4:1 on white; the dialog overlay at 40%.
- **Ink Soft** (ink-soft): secondary text, placeholders, leading input icons. 6.1:1 on white, 5.3:1 on cream, 4.5:1 on beige, at least 4.67:1 across the rose hero.
- **Line** (line): decorative hairlines and dividers only.
- **Field** (field): input borders, 3:1 on white and milk.

Tinted panels use radial gradients that stay inside the palette: rose (blush → #f2dfd6 → #eedfd2), green (#eef2ec → mint → #d6e0d8) and beige (#f7f1e6 → #efe6d6 → beige). The rose end was lightened to #eedfd2 so ink-soft keeps 4.5:1 at the bottom of the hero.

### Named Rules
**The Rose Is an Accent Rule.** Rose appears only on hearts, the baby glyph, danger signs, errors and soft tints. It never becomes a primary button, a section heading colour or a large flat fill beyond blush.

**The Light Colours Don't Speak Rule.** Fern, sage and rose are fills and decoration only. Text and meaningful glyphs use ink, ink-soft, leaf or rose-deep.

**The One Tint Rule.** A tinted tile holds a white icon circle whose glyph takes the tile's own deep colour: leaf on mint or beige, rose-deep on blush.

**The Danger Rule.** Danger signs and errors are rose-deep text with a filled warning icon, on white or blush. Colour never carries the message alone.

## Typography

**Display Font:** Inter (with ui-sans-serif, system-ui), optical-size axis on
**Body Font:** Inter (same family)

**Character:** One friendly grotesque. Extra-bold, tightly tracked titles give warmth and confidence; the `cv11` single-storey "a" softens every word; Inter's optical sizing tightens the large headings.

### Hierarchy
- **Display** (800, 40–56px fluid, 1.04, −0.035em): the hero headline only, capped near 13ch.
- **Headline** (800, 28–32px fluid, 1.2, −0.025em): section titles, auth card titles, area titles. Dialog titles use the same weight at 24px.
- **Title** (600, 18px, 24px line): card and step titles, the slider question. Small tile titles drop to 15–17px semibold.
- **Lead** (400, 18px, 28px line): the paragraph under a display or section title, in ink-soft, 40–52ch.
- **Body** (400, 16px, 24px line): running text, list items, 46–48ch. Dense UI text uses 15.2px (0.95rem).
- **Label** (500, 14px, 20px line): form labels, hints, footer links, notes.
- **Caption** (500, 12px, 16px line): chip text, meta lines, trimester ticks, weekday letters (the only uppercase, in the week strip).

### Named Rules
**The Extra-Bold Title Rule.** Every display, section and dialog title is weight 800 with negative tracking. Body never goes above 600 except numbers and key values (700).

**The Tabular Numbers Rule.** Every date, week count and time uses tabular lining numerals so values never jitter as they change.

**The Gentle Wrap Rule.** Headings h1–h3 balance their lines; paragraphs and list items wrap pretty. No orphaned last words.

## Layout

The page is a stack of full-width bands (milk, cream, mint at 60%, the curved rose hero) holding a centred container of 72rem with 16px gutters (24px from 640px). Sections breathe at 64px vertical padding, 96px from 1024px. Breakpoints follow Tailwind: 640px (dialog becomes a centred card, step labels appear), 768px, 1024px (desktop header navigation, two-column sections, all three hero cards).

Desktop gets a real web layout: header with brand, section links, language switch, Log in and Sign up; two-column hero (text, slider card and Sign up on the left, illustration on the right); two-column sections with an intro column beside a sample artifact; a five-tile row for services. Phones stack the same content in reading order (hero: headline, lead, illustration, slider card, full-width Sign up), turn tiles into a list and make primary actions full width.

### Named Rules
**The Web, Not App Rule.** Desktop is a website, not a stretched phone. Phone-width layouts borrow Flo's patterns, but there are no app-store badges, install prompts or device frames; the product says it works in the phone's browser.

**The Clear Face Rule.** Floating hero cards never cover the mother's face or the belly glyph. Phones and tablets show only the weeks card; the SMS and next-visit cards appear from 1024px.

**The Shared Header Rule.** Paired cards share header height (icon circle plus title at a 48px minimum) so their lists start and run on the same lines; tile rows top-align their titles.

## Elevation & Depth

A hybrid: tonal layering does most of the work (milk ground, cream and mint bands, white cards), and soft, low shadows tinted with ink lift cards a little. Shadows are never black and never hard-edged.

### Shadow Vocabulary
- **Soft** (`0 1px 2px rgb(31 45 39 / 0.04), 0 4px 14px -4px rgb(31 45 39 / 0.08)`): resting white elements on a tinted ground: brand disc, language switch, secondary button, SMS bubbles, habit card.
- **Raised** (`0 2px 4px rgb(31 45 39 / 0.04), 0 14px 32px -10px rgb(31 45 39 / 0.16)`): primary content cards: slider card, records card, health center card, auth card, floating hero cards, toasts, slider thumb.
- **Float** (`0 4px 10px rgb(31 45 39 / 0.05), 0 28px 60px -18px rgb(31 45 39 / 0.28)`): the highest layer: dialogs and bottom sheets, the weeks card.
- **Leaf glow** (`0 1px 2px rgb(31 45 39 / 0.12), 0 8px 18px -8px rgb(62 90 77 / 0.55)`): under the primary button only.

### Named Rules
**The Ink-Tinted Shadow Rule.** All shadows use ink (31 45 39) at low alpha with negative spread. No black, no offset hard shadows.

**The One Float Rule.** The only ambient motion is a 6s, 8px float on the hero cards and the "New reminder" badge, staggered by animation delay. Reduced motion stops it, along with every transition.

## Shapes

Soft and round throughout. Radii step 8 / 12 / 16 / 20 / 28 / 36px: inputs 8px, tiles inside cards 12px, floating and slider cards 16px, service tiles 16px, large cards and dialogs 28px (the 3xl utility), photos and the health center card 32px, the closing panel 40px. Buttons, chips, the language switch and every icon, date and step indicator are full circles or pills.

Hero panels curve: the bottom edge bulges down as an elliptical radius (50% wide by 28, 44 or 72px tall). The illustration sits in an arch (fully rounded top, 40px bottom corners) with a thin white ring. A large, faint white ring (22–28px border at 35–40% white) sits half off the corner of tinted panels for depth without content. SMS bubbles take one tighter corner on the speaker's side.

## Components

### Buttons
Calm, round and tactile, with a small squeeze on press.
- **Shape:** full pill (9999px); 44px tall by default, 36px small, 52px large; icon buttons are 44px circles.
- **Primary:** leaf with white text, 15.2px semibold, 24px side padding, leaf glow underneath; hover to leaf-deep.
- **Secondary:** white with leaf text and the soft shadow; hover to cream. Pairs with primary on tinted panels.
- **Soft:** mint with leaf text; for in-card controls like the slider −/+.
- **Outline / Ghost:** sage border or none, ink text; hover to white or 5% ink. Ghost is the header Log in.
- **Destructive:** blush with rose-deep text, never a saturated red.
- **Link:** leaf, 1px underline offset 4px, thickening to 2px on hover.
- **Focus / Press:** 2px leaf outline offset 2px; scale to 0.97 on press with expo-out easing; trailing arrow icons in bold weight.

### Chips
- **Sample:** "Sample" in caption semibold. Inside a card header it is a cream pill with ink-soft text; on a floating hero card it is a small leaf pill with white text perched on the top edge.
- **Status:** 28px pills with caption semibold: mint and leaf with a bold check for done, solid leaf with white for booked.
- **To be announced:** beige pill, ink-soft text.

### Cards / Containers
- **Corner Style:** 16px for small floating and slider cards, 28px for content cards, 32–40px for photo cards and closing panels.
- **Background:** white on milk or tinted bands; tinted tiles (mint, blush, beige, cream) inside or beside them.
- **Shadow Strategy:** soft on tinted grounds, raised for primary cards, float for overlays (see Elevation).
- **Border:** none; hairline line dividers between list rows.
- **Internal Padding:** 20px on phones, 24–32px from 640px, up to 48px on the health center card.

### Inputs / Fields
- **Style:** 48px tall, white, 1px field border, 8px radius, 16px text, ink-soft placeholder; optional leading icon (regular weight, ink-soft) with 44px left padding.
- **Focus:** leaf border with a 4px fern glow at 25%.
- **Error / Disabled:** rose-deep border with a 4px rose glow; the message below in rose-deep with a filled warning icon. Disabled at 50% opacity.
- **Labels:** 14px medium ink above the field; hints in ink-soft below; an optional status link (Forgot password) aligned right of the label.
- **Slider:** a 10px cream track with rose fill to the value, a white round thumb with a 3px leaf ring and raised shadow; trimester ticks underneath.

### Navigation
- **Header:** sits on the rose hero: brand mark (seal on a white disc plus the bold wordmark), section links as 40px ghost pills in ink-soft (hover to 70% white and ink) from 1024px, the EN/FIL switch, ghost Log in and primary Sign up (hidden below 640px).
- **Language switch:** a white pill with the soft shadow holding two pills; the active one is leaf with white text.
- **Footer:** white, four columns from 768px, bold 14px column headings, ink-soft links that turn leaf and underline on hover, regular-weight leaf icons beside details.
- **Icons:** navigation icons are regular-weight outlines; the selected item uses fill.

### Icon Circle
The signature carrier for every feature icon: a round tile in mint, blush, beige, cream, white, fern, leaf or rose at 36, 48, 64 or 80px, glyph in fill or duotone weight, always at least 3:1 against its circle. Decorative unless given a label.

### Dialog (Auth Sheet)
One dialog serves Log in and Sign up and switches between them in place. On phones it is a bottom sheet (28px top corners, up to 92% of the viewport, safe-area padding, slides up with expo-out); from 640px it is a centred 448px card (672px for sign-up) with a float shadow over a 40% ink overlay. No fake drag handle. A 40px cream round close button sits top right. Log in leads with a blush heart circle and a centred title; sign-up shows a five-step icon-circle stepper (current step solid leaf, done steps mint with a check, later steps cream) with a sticky Back/Next bar at the bottom.

### Curved Hero and Fetus Picture
The curved hero is a radial-gradient tinted panel (rose, green or beige) with a curved bottom edge and a faint corner ring. The fetus picture is the Health Icons baby-in-womb glyph in rose-deep on a blush circle; it grows by trimester (50%, 60%, 70% of the circle) with a 500ms expo-out transition, driven by the hero's weeks slider.

### Week Strip and Insight Card
Flo patterns ready for the mother's Today screen. The week strip shows seven 40px date circles whose fill tells the day's state (leaf for appointment, dashed leaf for requested, mint for done, blush for missed; today is white with a soft shadow). Insight cards are 144 × 176px tinted or white tiles with a title on top and a visual at the bottom, in a sideways snap-scrolling row.

## Do's and Don'ts

### Do:
- **Do** import every icon from the one icon index (Phosphor, plus the Health Icons fetus glyph). The same icon always means the same thing.
- **Do** put feature icons in soft colour circles (fill or duotone weight); use regular-weight outlines for navigation, switching to fill for the selected item.
- **Do** label every piece of sample data "Sample" (or "Your estimate" once she has entered her own weeks).
- **Do** keep text in ink, ink-soft, leaf or rose-deep, and check 4.5:1 on any new tint.
- **Do** set titles at weight 800 with negative tracking, and use tabular numerals for every date and count.
- **Do** give paired cards the same header height so their lists align.
- **Do** use expo-out easing (cubic-bezier(0.16, 1, 0.3, 1)) for transitions and keep the reduced-motion block intact.
- **Do** make primary actions full-width pills at phone width and keep tap targets at 44px.

### Don't:
- **Don't** set text in fern, sage or rose; they are too light.
- **Don't** let rose spread beyond hearts, the baby glyph, danger signs, errors and tints.
- **Don't** place floating cards over the mother's face or the belly glyph.
- **Don't** add app-store badges, install prompts or device frames; this is a web app.
- **Don't** use black or hard offset shadows; shadows are low and ink-tinted.
- **Don't** add a second ambient motion or a fake sheet drag handle.
- **Don't** add a second typeface, a dark theme or kicker labels above titles.
