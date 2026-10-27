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
  ui:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
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
  select:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 44px 0 16px"
    height: "48px"
  dialog-close:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    size: "44px"
  badge-role-admin:
    backgroundColor: "{colors.beige}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  badge-role-health-worker:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  badge-role-mother:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  badge-status-inactive:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  staff-sidebar:
    backgroundColor: "{colors.white}"
    width: "288px"
  top-bar:
    backgroundColor: "{colors.white}"
    height: "64px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.ui}"
    rounded: "{rounded.xl}"
    padding: "0 12px"
    height: "44px"
  nav-item-hover:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
  nav-item-active:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.ui}"
    rounded: "{rounded.xl}"
    padding: "0 12px"
    height: "44px"
  bottom-nav:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "6px"
    width: "max-content"
  bottom-nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    padding: "0 14px"
    height: "48px"
  bottom-nav-item-active:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "0 18px 0 14px"
    height: "48px"
  avatar-initials:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    rounded: "{rounded.full}"
    size: "44px"
  menu:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "6px"
    width: "224px"
  sheet:
    backgroundColor: "{colors.white}"
    width: "min(20rem, 86vw)"
  chip-week:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-outcome-live-birth:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-outcome:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  countdown-pill:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  countdown-pill-overdue:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  record-tabs:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.full}"
    padding: "6px"
  record-tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  record-tab-active:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  insight-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "14px"
  trimester-picture:
    rounded: "{rounded.full}"
    size: "96px"
  option-card-checked:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  service-tile:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "16px 12px 20px"
  service-tile-compact:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "12px 12px 14px"
  service-chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "16px"
  service-art-sm:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    size: "56px"
  slot-day-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    width: "76px"
    height: "96px"
  slot-day-card-selected:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.white}"
  slot-day-card-off:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
  slot-month-label:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
  slot-time-chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.2xl}"
    height: "48px"
  slot-time-chip-selected:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.white}"
  slot-time-chip-taken:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
  month-day:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "48px"
  month-day-selected:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    size: "48px"
  summary-bar:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "16px"
    width: "576px"
  date-tile:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.2xl}"
    size: "64px"
  proposal-panel:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "28px"
  proposal-inner:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  chip-appt-requested:
    backgroundColor: "transparent"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-appt-confirmed:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-appt-rescheduled:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-appt-cancelled:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  appointment-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  count-badge:
    backgroundColor: "{colors.rose-deep}"
    textColor: "{colors.white}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    size: "24px"
  calendar-count:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    size: "24px"
  calendar-day:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    height: "80px"
  calendar-day-selected:
    backgroundColor: "{colors.leaf}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    height: "80px"
---

# Design System: Taysan MaternaCare

## Overview

**Creative North Star: "The Gentle Checkup"**

A soft, Flo-inspired world built around the mother rather than the clinic. The client's palette (leaf and fern greens, beige, sage, cream on a warm milk ground) carries almost everything; one dusty rose carries the few things meant to feel tender or urgent: hearts, the baby, danger signs and soft tints. Surfaces are rounded white cards, pill buttons and circles for dates and icons, sitting on curved tinted panels with low, ink-tinted shadows. It is light only, made for daylight at home and at the health center.

This is a web app, not a mobile app. Desktop gets a real web layout (header with section links, two-column sections, a 72rem container); phone widths borrow Flo's patterns (bottom sheets, full-width pill actions, stacked cards). Nothing imitates an app store, an install prompt or a device frame. Type is Inter alone, with extra-bold titles and a friendly single-storey "a". Motion is one slow float and short expo-out transitions, all stopped by reduced motion.

It refuses the generic SaaS hero (headline, device screenshot, feature grid) and clinical realism. Sample data is shown, but always labelled "Sample".

Behind the login the same world turns into a quiet working app. Staff (health workers and admins) get a white sidebar and top bar on the milk ground; mothers get a slim top bar and a floating bottom-nav pill. Content sits in white cards with the soft shadow, the selected place is always a mint pill with a filled icon, and roles are told apart by tint (beige admin, mint health worker, blush mother), never by a new colour. The baby is shown two ways: a soft 3D picture per trimester inside the app, and the flat baby-in-womb glyph on the public landing hero.

Booking a visit is the warmest moment of the app. Services are big white tiles with the client's flat people illustrations; small places show the service as a filled icon on a pastel blob. Days and times are white cards and chips; the one she picks turns solid leaf. A visit's state is always a small tint chip from the same palette, the same on her side and the health center's.

**Key Characteristics:**
- Greens do the work; rose is a small accent; text only in ink, ink-soft, leaf or rose-deep.
- Inter only, extra-bold display and section titles, tabular numerals for every date and count.
- Rounded white cards (20–36px), pill buttons, icons in soft colour circles.
- Curved tinted hero panels with a faint white ring for depth.
- Soft, low shadows tinted with ink; one gentle float.
- Web layout on desktop, Flo patterns at phone width.
- Signed-in app: white sidebar or floating bottom nav, mint active pill with a filled icon, sentence-case labels.
- Booking: illustrated service tiles, a sideways day strip, Morning / Afternoon time chips, and a solid leaf pick.

## Colors

A warm, quiet green-and-cream palette with one dusty-rose accent; every text colour clears 4.5:1 on its ground.

### Primary
- **Leaf Green** (leaf): primary buttons, links, the selected language pill, the current step, the "Sample" pill on floating hero cards; the chosen day card, time chip and month day in the slot picker, and the selected day in the staff calendar. White on leaf is 7.6:1; leaf on mint is 6.2:1.
- **Deep Leaf** (leaf-deep): hover state of primary buttons and links only.
- **Fern** (fern): fill and decoration only: filled icon circles, completed stepper lines, habit check marks; the open-day dot in the month view, the duotone sun and cloud-sun beside Morning and Afternoon, the leaf accent on service art. Too light for text.
- **Mint** (mint): the green tint: default icon circles, soft buttons (the slider −/+), done status chips, service tiles, the tips band (at 60%); in the app, the active nav pill, the Active status badge, the Health worker role badge and the selected role choice; the active record tab, the countdown pill, the Live birth outcome chip, a shown purok's icon circle and the checked login option card (at 50%); in booking, the mint service-art blob, the month label in the day strip, the date tile on visit cards, the Confirmed and Completed chips, the calendar's per-day count badges and the open-day hover (at 40%).

### Secondary
- **Dusty Rose** (rose): fill and decoration only: the slider fill, the closing heart, selection highlight (at 45%), SMS-thread dividers (at 40%), the small plus and sparkle accents on service art. Never text.
- **Blush** (blush): the rose tint: danger-sign card, SMS thread panel, blush icon circles, error notices, the destructive button, the top of the rose hero gradient; in the app, the initials avatar and the Mother role badge; the "Week N" pregnancy chip, the overdue countdown pill and the Today danger panel (at 60%); the blush service-art blob, the Rescheduled ("New time sent") and Missed chips, the new-time proposal panel (at 70%), the closed-day icon circle and every inline form error notice.
- **Rose Deep** (rose-deep): rose text and glyphs: danger signs and the danger panel's action line, form errors, the landing baby glyph, reminder flags, the Week chip and overdue countdown; in booking, the Closed label on calendar days, the "still has bookings" warning on a closed day, a failed reminder line, the Cancel action, and the solid request-count badge (white numerals). 5.8:1 on white, 4.8:1 on blush.

### Neutral
- **Milk** (milk): the page ground and the browser theme colour.
- **White** (white): cards, dialogs, inputs, the footer; the staff sidebar, top bars, bottom nav, menus and sheets.
- **Cream** (cream): quiet fills: services band, unavailable day cards and taken time chips (at 70%), the beige-tone service-art blob, the Cancelled chip, info tiles inside cards, the dialog and sheet close button, sample chips; the hover fill for nav and menu rows and the Inactive status badge; the outcome chip for every outcome except live birth, the Hidden purok badge and the login info notice.
- **Beige** (beige): warm tiles and the "To be announced" chip; the end of the beige hero tone; the Admin role badge and the pending-password chip; a hidden purok's icon circle and the past-pregnancies icon circle.
- **Sage** (sage): soft borders (outline button, dashed timeline), scrollbar thumb. Not text.
- **Ink** (ink): body and heading text, 14.4:1 on white; the dialog overlay at 40%.
- **Ink Soft** (ink-soft): secondary text, placeholders, leading input icons. 6.1:1 on white, 5.3:1 on cream, 4.5:1 on beige, at least 4.67:1 across the rose hero.
- **Line** (line): decorative hairlines and dividers only: sidebar and top-bar edges, table and list row dividers, menu separators.
- **Field** (field): input borders, 3:1 on white and milk.

Tinted panels use radial gradients that stay inside the palette: rose (blush → #f2dfd6 → #eedfd2), green (#eef2ec → mint → #d6e0d8) and beige (#f7f1e6 → #efe6d6 → beige). The rose end was lightened to #eedfd2 so ink-soft keeps 4.5:1 at the bottom of the hero.

### Named Rules
**The Rose Is an Accent Rule.** Rose appears only on hearts, the baby (glyph or picture), danger signs, errors, soft tints and the few things that need her or the staff's attention (a new time to answer, a missed visit, a closed day, the waiting-request count). It never becomes a primary button, a section heading colour or a large flat fill beyond blush; the solid rose-deep count badge stays 24px.

**The Light Colours Don't Speak Rule.** Fern, sage and rose are fills and decoration only. Text and meaningful glyphs use ink, ink-soft, leaf or rose-deep.

**The One Tint Rule.** A tinted tile holds a white icon circle whose glyph takes the tile's own deep colour: leaf on mint or beige, rose-deep on blush.

**The Danger Rule.** Danger signs and errors are rose-deep text with a filled warning icon, on white or blush. Colour never carries the message alone.

**The Role Tint Rule.** A person's role is shown by tint pairs already in the palette: Admin beige with ink, Health worker mint with leaf, Mother blush with rose-deep. Status pairs mint and leaf (Active) or cream and ink-soft (Inactive), always with a small dot and a word.

**The Visit Status Rule.** A visit's status is a 28px chip from the same tints, identical for mothers and staff: Requested is a dashed leaf border with leaf text and no fill (asked, not yet real); Confirmed and Completed are mint with leaf; Rescheduled ("New time sent") and Missed are blush with rose-deep; Cancelled is cream with ink-soft. The Today week strip repeats the map on its date circles.

## Typography

**Display Font:** Inter (with ui-sans-serif, system-ui), optical-size axis on
**Body Font:** Inter (same family)

**Character:** One friendly grotesque. Extra-bold, tightly tracked titles give warmth and confidence; the `cv11` single-storey "a" softens every word; Inter's optical sizing tightens the large headings.

### Hierarchy
- **Display** (800, 40–56px fluid, 1.04, −0.035em): the hero headline only, capped near 13ch.
- **Headline** (800, 28–32px fluid, 1.2, −0.025em): section titles, auth card titles, area titles. Dialog titles use the same weight at 24px.
- **Title** (600, 18px, 24px line): card and step titles, the slider question. Small tile titles drop to 15–17px semibold.
- **Lead** (400, 18px, 28px line): the paragraph under a display or section title, in ink-soft, 40–52ch.
- **Body** (400, 16px, 24px line): running text, list items, 46–48ch.
- **UI** (500, 15.2px / 0.95rem, 24px line): the dense step between body and label: buttons, sidebar nav items and menu rows (semibold when selected), table body, activity-type descriptions, the role choice, the compact wordmark at phone width.
- **Label** (500, 14px, 20px line): form labels, hints, footer links, notes.
- **Caption** (500, 12px, 16px line): chip and badge text, meta lines, trimester ticks, the sidebar "Admin" group label, table column heads, bottom-nav labels, weekday letters (the only uppercase, in the week strip, including the "Today" label in today's slot).

In the signed-in app, page titles take the Headline style; card section headings are 20px bold (700); form section and Today panel headings are 18px bold; the staff top-bar section title is 18px bold; activity-type card titles take the Title style. In booking: service tile names are 16px bold (18px from 640px; 15.2px in the compact staff tiles); day cards stack the weekday in caption, the date in 20px bold tabular numerals and the status ("9 open", Full, Closed) in caption semibold; time chips are UI-size semibold tabular; the summary bar leads with the day and time at 16.8px bold; the visit date tile is the month in caption semibold over the day at 24px extra-bold; Morning and Afternoon are 14px semibold ink-soft. The pregnancy week is the one large number: extra-bold at −0.02em, 32px on the staff pregnancy card and 44px (52px from 640px) in the mother's Today hero, with the trimester in ink-soft below.

Implementation note: the class merger (`cn`) registers the caption, title and display size utilities as font sizes, so they survive next to a text colour class. Any new custom text-size token must be added there too, or it will be dropped silently. (The `title` utility carries the Headline size.)

### Named Rules
**The Extra-Bold Title Rule.** Every display, section and dialog title is weight 800 with negative tracking. Body never goes above 600 except numbers and key values (700).

**The Tabular Numbers Rule.** Every date, week count and time uses tabular lining numerals so values never jitter as they change.

**The Gentle Wrap Rule.** Headings h1–h3 balance their lines; paragraphs and list items wrap pretty. No orphaned last words.

**The Sentence Case Label Rule.** Small labels stay in sentence case at normal tracking: sidebar group labels, table column heads, badges, form labels and bottom-nav labels. No uppercase or letter-spaced micro-labels; the week strip's weekday letters are the one exception.

## Layout

The page is a stack of full-width bands (milk, cream, mint at 60%, the curved rose hero) holding a centred container of 72rem with 16px gutters (24px from 640px). Sections breathe at 64px vertical padding, 96px from 1024px. Breakpoints follow Tailwind: 640px (dialog becomes a centred card, step labels appear), 768px (lists become tables), 1024px (desktop header navigation, two-column sections, all three hero cards), 1280px (wide tables and filter rows unfold).

Desktop gets a real web layout: header with brand, section links, language switch, Log in and Sign up; two-column hero (text, slider card and Sign up on the left, illustration on the right); two-column sections with an intro column beside a sample artifact; a five-tile row for services. Phones stack the same content in reading order (hero: headline, lead, illustration, slider card, full-width Sign up), turn tiles into a list and make primary actions full width.

### App shells
- **Staff shell** (health workers and admins): from 1024px a sticky white sidebar 288px wide with a line border on its right, holding the full brand mark, the main nav and, for admins, a sentence-case "Admin" group below it. Beside it, a sticky 64px white top bar (line border below) with the current section title on the left and the language switch and initials avatar on the right. Content sits on milk in a 72rem column with 16 / 24 / 32px side padding and 24px (32px from 1024px) top padding. Below 1024px the sidebar is hidden and a 44px menu button at the left of the top bar opens the same nav in a sheet from the left.
- **Mother shell**: a sticky 64px white top bar (compact brand mark, language switch, avatar) over a 64rem content column, and a floating bottom-nav pill on every screen size: centred, up to 448px wide, 16px above the bottom edge plus the safe area. Content keeps 144px of bottom padding so the pill never covers it.
- **Inside pages:** the page title and intro sit top left with the primary action (New staff account, Add activity type) beside them from 640px and below them on phones. Lists become a table from 768px and stacked cards below. Detail and profile pages put a summary card on top and two cards side by side from 1024px (1 : 1.3), stacked below. Forms are one column on phones and two from 640px; short pairs (first and middle name) share a row and longer fields (last name, position, Other, mobile number) span both columns. Submit buttons are full width on phones and fit their label from 640px.
- **Lists that fold:** the mother registry is a table from 768px; below 1280px its Login column folds under the name, and below 768px each mother is a whole-card link (the name link covers the card, one tab stop, a bold caret top right). The purok list keeps one card of rows at every width; on phones a row's actions drop under the name. A shared pager (Previous / "Page 2 of 5" / Next) closes every paged list.
- **Filters that fold:** the mother filter card stacks search over the selects on phones, where the three extra selects fold behind a full-width secondary "Filters" toggle (showing the count in use, open when any is set); three columns from 640px; one row from 1280px with Search aligned to the field bottoms.
- **Long forms:** registration is a stack of section cards (icon circle plus title), each a two-column grid from 640px; Cancel and Register sit at the end, full width and stacked (primary on top) on phones, right-aligned from 640px.
- **Record pages:** back link, a header card, a link-tab bar, then the tab's cards; Overview puts details beside login at 1.4 : 1 from 1024px.
- **Booking a visit (mother):** a back link and title, then three steps that fold as she goes: the service tiles (two per row on phones, three from 640px, four from 1024px), then the chosen service as one white chip with a small secondary Change, then the slot picker's day card and time card stacked. Once a day and time are chosen, a white summary bar (up to 576px, float shadow) is fixed 88px above the bottom edge plus the safe area, just over the bottom nav, and the page gains 176px of bottom padding so it never covers the last chips.
- **Booking a visit (staff):** the same steps in white cards on the full staff column: a mother search, compact service tiles (two per row, three from 640px, five from 1024px), the slot picker and a remarks card with a fit-width primary from 640px.
- **Staff appointments:** title and intro with Book appointment beside them from 640px, then a link-tab bar in the record-tab style (Requests with its count, List, Calendar). Requests and the record's Appointments tab are a grid of appointment cards, two columns from 1024px. List is a filter card (four fields and Search in one row from 1024px) above a table from 1024px whose actions stay on one line, with stacked cards below 1024px. Calendar is a month grid beside the chosen day's cards at 1.15 : 1 from 1024px, stacked below.
- **Closed days (admin):** one 36px card of line-divided upcoming rows (blush icon circle, date, reason, the rose-deep warning when visits remain, then Remove; on phones Remove drops under the text), then past days in a quieter card on 60% white.
- **Mother Today:** date and greeting, then from 1024px two columns at 1.05 : 1 with the hero sticky 96px from the top on the left and insight grid, tip, danger and past pregnancies stacked on the right; one column below. With no pregnancy, a health-center card and the danger panel take the two columns.

### Named Rules
**The Web, Not App Rule.** Desktop is a website, not a stretched phone. Phone-width layouts borrow Flo's patterns, but there are no app-store badges, install prompts or device frames; the product says it works in the phone's browser.

**The Clear Face Rule.** Floating hero cards never cover the mother's face or the belly glyph. Phones and tablets show only the weeks card; the SMS and next-visit cards appear from 1024px.

**The Shared Header Rule.** Paired cards share header height (icon circle plus title at a 48px minimum) so their lists start and run on the same lines; tile rows top-align their titles.

**The One Place Rule.** The current place in either shell is a mint pill with leaf text and a filled icon; every other item is ink-soft with a regular-weight icon and a cream hover. Nothing else marks position. The record tab bar follows the same rule without icons.

**The Mark the Exception Rule.** In a list, only the unusual state carries a badge (a hidden purok is badged, a shown one is not); the normal state stays unmarked.

## Elevation & Depth

A hybrid: tonal layering does most of the work (milk ground, cream and mint bands, white cards), and soft, low shadows tinted with ink lift cards a little. Shadows are never black and never hard-edged.

### Shadow Vocabulary
- **Soft** (`0 1px 2px rgb(31 45 39 / 0.04), 0 4px 14px -4px rgb(31 45 39 / 0.08)`): resting white elements on a tinted ground: brand disc, language switch, secondary button, SMS bubbles, habit card.
- **Raised** (`0 2px 4px rgb(31 45 39 / 0.04), 0 14px 32px -10px rgb(31 45 39 / 0.16)`): primary content cards: slider card, records card, health center card, auth card, floating hero cards, toasts, slider thumb.
- **Float** (`0 4px 10px rgb(31 45 39 / 0.05), 0 28px 60px -18px rgb(31 45 39 / 0.28)`): the highest layer: dialogs and bottom sheets, the weeks card; in the app, the mother bottom nav, the booking summary bar, the staff menu sheet and the profile menu.

In the signed-in app, content cards, filter cards, tables and list cards rest on milk with the soft shadow, not raised; the white sidebar and top bars are flat with a line border instead of a shadow. In pickers the chosen day card, time chip and month day take the soft shadow under their leaf fill; service tiles rest flat with a line border and lift 2px with the soft shadow and a leaf border on hover.
- **Leaf glow** (`0 1px 2px rgb(31 45 39 / 0.12), 0 8px 18px -8px rgb(62 90 77 / 0.55)`): under the primary button only.

### Named Rules
**The Ink-Tinted Shadow Rule.** All shadows use ink (31 45 39) at low alpha with negative spread. No black, no offset hard shadows.

**The One Float Rule.** The only ambient motion is a 6s, 8px float on the hero cards and the "New reminder" badge, staggered by animation delay. Reduced motion stops it, along with every transition.

## Shapes

Soft and round throughout. Radii step 8 / 12 / 16 / 20 / 28 / 36px: inputs 8px, tiles inside cards 12px, floating and slider cards 16px, service tiles 16px, large cards and dialogs 28px (the 3xl utility), photos and the health center card 32px, the closing panel 40px. Buttons, chips, the language switch and every icon, date and step indicator are full circles or pills.

In the signed-in app: section cards (summary, security, profile, activity types, the mother record header and pregnancy cards, registration sections, Today panels and the purok list) use the 36px radius; filter cards, tables, list cards, the login option card and the profile menu use 28px; sidebar nav items, menu rows, insight cards and notices use 20px; inputs, selects and the role choice 8px. Badges, the avatar, the bottom nav, the record tab bar, countdown pills and the trimester picture are pills or circles.

In booking: service tiles, the chosen-service chip, the summary bar, slot-picker cards, the proposal panel and the staff calendar card use 36px; day cards, time chips, the visit date tile, staff appointment cards, the filter card and the picture-picker options use 28px; staff calendar day cells and inline notices 20px; the white card inside the proposal panel 12px. Month-view days, the month label, status chips and count badges are circles or pills. Service art sits on an irregular soft blob rather than a circle.

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
- **Account actions:** Reset password is an outline button with a bold lock icon; Deactivate is destructive and Activate is soft. Both open a confirmation dialog whose confirm button repeats the action's style (destructive for Deactivate, primary otherwise) beside a ghost Cancel. Paging uses small secondary buttons with bold carets, dimmed to 40% at the ends.
- **Row and card actions:** small (36px) buttons with bold icons: secondary for Rename, Edit and Add past pregnancy; outline for Close pregnancy; ghost for Hide / Show and editing a past row. Full-size primary only for the one main action of a page or empty state (Add purok, Register a mother, Start a new pregnancy).

### Chips
- **Sample:** "Sample" in caption semibold. Inside a card header it is a cream pill with ink-soft text; on a floating hero card it is a small leaf pill with white text perched on the top edge.
- **Status:** 28px pills with caption semibold: mint and leaf with a bold check for done, solid leaf with white for booked.
- **To be announced:** beige pill, ink-soft text.
- **Role and status badges:** 28px pills in caption semibold, by role tint (see The Role Tint Rule). The status badge leads with a 6px dot in its text colour. A beige pending-password chip joins them on the account summary. The same Inactive badge, worded "Hidden", marks a hidden purok.
- **Pregnancy chip:** while pregnant, a 28px blush pill reading "Week N" in rose-deep, followed by the trimester in 14px ink-soft text; after a pregnancy, a cream outcome pill with the outcome and date. Past-pregnancy outcome chips are mint and leaf for a live birth, cream and ink-soft otherwise.
- **Visit status:** 28px caption-semibold pills per The Visit Status Rule; the Requested chip is the only outlined chip in the system.
- **Count badges:** the waiting-request count on the Requests tab is a 24px solid rose-deep circle with white bold tabular numerals; the staff calendar's per-day counts are mint circles with leaf numerals (white with leaf on the selected day).
- **Countdown pill:** "132 days to go" in 14px semibold; mint and leaf on white cards, blush and rose-deep once overdue. On the rose Today hero it is 16px semibold on 80% white with ink text (solid white with rose-deep when overdue).

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
- **Select:** the browser's own select styled as an input (48px, field border, 8px radius) with a bold caret 16px from the right; it opens the phone's native picker.
- **Leading icon:** a 20px ink-soft icon 16px from the left; the field takes 44px left padding.
- **Role choice:** two 48px segmented options at the input radius; the selected one has a leaf border on mint with leaf text, the other a field border on white with ink-soft text.
- **Filter card:** search, role and status in one white card; one column on phones, a single row from 640px with the 48px Search button aligned to the field bottoms and a ghost Clear when filters are set.
- **Mother filter card:** search, purok, due month and pregnancy in one white 28px card (16px padding, 20px from 640px); see Layout for how it folds.
- **Option card:** an optional choice (create a login) is a checkbox card: 28px radius, 16px padding, a 20px leaf-accent checkbox beside a semibold title and an ink-soft hint; line border at rest with a milk hover, leaf border on 50% mint when checked. Its fields appear below only when checked.
- **Keep input on error:** every form submits through the shared submit-without-reset helper, so a server error never wipes what was typed; forms that should clear after saving remount instead.
- **Slider:** a 10px cream track with rose fill to the value, a white round thumb with a 3px leaf ring and raised shadow; trimester ticks underneath.

### Navigation
- **Header:** sits on the rose hero: brand mark (seal on a white disc plus the bold wordmark), section links as 40px ghost pills in ink-soft (hover to 70% white and ink) from 1024px, the EN/FIL switch, ghost Log in and primary Sign up (hidden below 640px).
- **Language switch:** a white pill with the soft shadow holding two pills; the active one is leaf with white text.
- **Footer:** white, four columns from 768px, bold 14px column headings, ink-soft links that turn leaf and underline on hover, regular-weight leaf icons beside details.
- **Icons:** navigation icons are regular-weight outlines; the selected item uses fill.
- **Staff sidebar nav:** 44px rows, 20px radius, 20px icon with a 12px gap, UI-size text; ink-soft medium at rest with a cream hover, mint with leaf semibold and a filled icon when current. The admin group label is caption semibold in ink-soft, sentence case.
- **Menu sheet:** below 1024px the sidebar opens as a white sheet from the left (up to 320px, 86% of the viewport) over a 40% ink overlay, sliding in over 300ms with expo-out, with the same 44px cream close button as dialogs.
- **Mother bottom nav:** a snug white pill (only as wide as its tabs, never wider than the screen less 32px) at 95% white with a line border, backdrop blur and the float shadow, 6px padding and 4px gaps. Tabs are icon-only 48px pills (24px regular icon, ink-soft, cream hover); the current tab opens into a mint pill with a filled icon and its name in UI-size leaf semibold. The name slides open by animating its grid column from 0fr to 1fr with fade and margin over 420ms on cubic-bezier(0.32, 0.72, 0, 1); reduced motion turns the transition off. Folded names stay in the accessible name.
- **Profile menu:** a 44px initials avatar (blush, rose-deep bold) opens a white menu (28px radius, float shadow, at least 224px wide) with the name in UI semibold and role · @username in caption ink-soft, a line separator, then 44px rows with ink-soft icons and a cream highlight.
- **Record tabs:** plain links in a white pill bar (6px padding, soft shadow); 40px pill tabs in UI-size text, ink-soft medium with a cream hover, mint with leaf semibold when current. On phones the bar scrolls sideways to the screen edge.
- **Back link:** a leaf 14px semibold underlined link with a bold left caret above the page ("Mothers").
- **Compact brand mark:** in crowded top bars the wordmark drops to UI size at phone width (17px from 640px) and the location line appears only from 640px.

### Accounts and Mother Lists
From 768px a white table in a 28px card with the soft shadow: caption semibold ink-soft column heads in sentence case, UI-size body, line dividers, a milk row hover; the name links to the account (leaf underline on hover) above the @username in ink-soft; dates in tabular numerals. Below 768px each account is a white card with name, username, badges and a bold caret. A result count sits above in label size; an empty state is a centred white card.

The mother registry uses the same table (name over the phone number, purok, pregnancy chip, due date, login with a filled leaf check) and the same card fallback; see Layout for its folds. The purok list is one 36px white card of line-divided rows: a small icon circle (mint when shown, beige when hidden) beside the name in UI semibold (ink-soft when hidden), the Hidden badge only on hidden rows, then Rename and Hide / Show; two ink-soft info notes with regular info icons sit under the list.

### Icon Circle
The signature carrier for every feature icon: a round tile in mint, blush, beige, cream, white, fern, leaf or rose at 36, 48, 64 or 80px, glyph in fill or duotone weight, always at least 3:1 against its circle. Decorative unless given a label.

### Dialog (Auth Sheet)
Every dialog's grid has a single minmax(0, 1fr) column, so wide content (a day strip, a picture grid) scrolls inside it instead of widening it. One dialog serves Log in and Sign up and switches between them in place. On phones it is a bottom sheet (28px top corners, up to 92% of the viewport, safe-area padding, slides up with expo-out); from 640px it is a centred 448px card (672px for sign-up) with a float shadow over a 40% ink overlay. No fake drag handle. A 44px cream round close button sits top right (the same close in every dialog and the menu sheet). Log in leads with a blush heart circle and a centred title; sign-up shows a five-step icon-circle stepper (current step solid leaf, done steps mint with a check, later steps cream) with a sticky Back/Next bar at the bottom.

### App Cards (Profile, Account, Activity Types)
Pages open with a summary card: a large icon circle (mint user for staff, blush pregnancy for mothers) beside the headline-style name, the @username and badges. Section cards follow with a 20px bold heading, optionally led by a small icon circle (mint lock for password, blush email for recovery email). Read-only facts are a definition list with line dividers, label in label-size ink-soft above the value. The mother record header card leads with a large blush pregnancy circle beside the name, a meta line (age, phone, purok with small icons), the pregnancy chip with a Login status badge, and the registration line in 14px ink-soft. Its Overview pairs a details card (blush user circle) with a login card (mint user circle) whose facts are a label / value definition list, a cream info notice, and outline Reset password beside a soft or destructive status button, each opening a confirmation dialog. Activity types are cards in a two-column grid from 768px: the service's small art, a Title-style name, a UI-size description in ink-soft, and a line-divided footer with the reminder timing in leaf (filled bell) and an Edit button.

### Forced Password Change
The auth card alone on milk: headline-style title, an ink-soft lead, a mint info notice (leaf text with a filled info icon, 14px, 20px radius; the calm twin of the blush error notice), the two password fields with leading lock icons, the primary Save and continue, and a ghost Log out in ink-soft with its icon centred under it, so a user who isn't ready can still leave.

### Curved Hero and Fetus Picture
The curved hero is a radial-gradient tinted panel (rose, green or beige) with a curved bottom edge and a faint corner ring. The baby appears in two forms:
- **Trimester picture (the app):** client-approved soft 3D renders, one per trimester, cropped from the same 1100px window so the baby visibly grows from one to the next. Shown full-bleed in a circle on a pale blush plate; decorative (empty alt) because the week and trimester are always written beside it. 96px on the staff pregnancy card (112px from 640px); 192px in the Today hero (224px from 640px) with an 8px ring of 60% white.
- **Fetus glyph (the landing hero):** by client decision the public landing keeps the Health Icons baby-in-womb glyph in rose-deep, on the belly of the hero illustration and in a blush circle on the weeks card, growing by trimester (50%, 60%, 70% of the circle) with a 500ms expo-out transition driven by the weeks slider.

### Pregnancy Card (staff)
A 36px white card: a header row with a 20px bold title and its small actions (Edit, Close pregnancy) on the right from 640px. Below, the trimester picture beside the extra-bold week, the trimester and the countdown pill; then a definition list (due date, last period, gravida / para, remarks) with ink-soft labels and medium values, below on phones and beside it behind a line divider from 768px. Past pregnancies follow in a second card of line-divided rows: outcome chip, the date in semibold, G/P and due date in ink-soft, remarks, and a ghost Edit. Pregnancy forms open in a 576px dialog with two-column date pairs.

### Mother Today
The mother's home after Flo's pregnancy screen. The rose curved hero (large curve, 36px top corners) holds the week strip, the trimester picture, the week number, "2nd trimester · 21 weeks and 1 day" in 18px ink-soft, the countdown pill, the due date and a 14px note on how it was counted. Beside it, the insight grid, then white panels with a 36px icon circle and an 18px bold title: the tip of the week (mint), danger signs (on 60% blush, rose-deep dots, a rose-deep semibold action line and the health center's number as a rose-deep link) and past pregnancies (beige). With no pregnancy she gets a raised card (large blush circle, a milk inset with the health center's address, hours and contact, label above value on phones and beside it from 640px) and a leaf link to Appointments.

### Week Strip and Insight Card
The week strip shows seven 40px date circles, Sunday to Saturday, whose fill tells the day's state (leaf for appointment, dashed leaf for requested, mint for done, blush for missed; today is white with a soft shadow). Insight cards are 20px-radius tiles (white with the soft shadow, mint or blush) with a 15px semibold title on top and a small icon circle at the bottom. On Today they ship as a three-column grid of whole-card links (next visit, showing its day and time with the status in brackets until confirmed; tip; danger signs), at least 160px tall, a 14px ink-soft body clamped to three lines, lifting 2px on hover; each points at its fuller panel. The 144 × 176px snap-scrolling row remains available (design preview) for longer sets.

### Service Tiles and Service Art
A service has two pictures. **Service tiles** (the first booking step) are white 36px buttons with a line border holding the client-approved flat people illustration (square, up to 208px; 128px compact) above the name only, centred; hover lifts 2px with a leaf border and the soft shadow, focus is the leaf outline. The admin picture picker repeats the illustrations as 64px thumbnails in a four-column grid of 28px radio options (line border, milk hover, leaf border on 50% mint when chosen) with the picture name in caption ink-soft. **Service art** is for small places (the chosen-service chip, the summary bar, Activity types cards): a filled Phosphor icon on a pastel blob (mint with leaf, blush with rose-deep, cream with leaf), with a fern leaf, a rose plus and a rose sparkle around it at the larger sizes; at the smallest (56px) the accents drop and the icon turns duotone. Both are decorative; the name is always written beside them.

**The Two Pictures Rule.** The people illustration appears only where the picture is big (service tiles, the picker thumbnails); everywhere small uses service art. Never squeeze an illustration into a chip or blow service art up into a tile.

### Slot Picker
One shared day-and-time picker for mothers requesting, staff booking and staff offering another time. In pages each part is a 36px white card with an 18px bold heading; in dialogs (the plain variant) the cards drop away. The day part has the month of the first visible card in semibold ink-soft and a leaf "See full month" text button with a calendar icon; below, a snap-scrolling strip of 76 × 96px day cards (weekdays only), with 36px white round caret buttons at either end from 640px. A new month inserts a small mint caption pill between cards. Open cards are white with a line border (leaf border on 40% mint at hover); the chosen card is solid leaf with white text; full and closed cards fade on 70% cream and can't be picked, the Closed label in faded rose-deep. "See full month" opens a month grid in a dialog: 48px round days, open days with a 4px fern dot, the chosen day solid leaf, today ringed with a line ring, closed days struck through. Times follow the date in two groups, Morning (duotone sun) and Afternoon (duotone cloud-sun) in fern, as 48px chips three per row (four from 640px) with the same open / chosen states; taken times fade on cream and are struck through.

**The Filled Pick Rule.** In a picker the one chosen day or time is solid leaf with white text and the soft shadow; open choices are white with a line border; unavailable ones fade on cream and are disabled. Navigation keeps the mint pill; choices fill with leaf.

### Booking Summary Bar
Once a service, day and time are chosen, a white 36px bar with a line border and the float shadow rises above the bottom nav: the service art beside the day and time in bold tabular numerals and the service name in ink-soft, then a leaf underlined "Add a note" (opening a 48px input with a "Hide note" link) and the primary Send request. A send error appears inside it in rose-deep with a filled warning icon.

### Visit Cards (mother)
Upcoming visits are white 36px cards with the soft shadow: a 64px mint date tile (month over day), the service in semibold, the date in ink-soft with the time in semibold ink, the status chip top right, an optional note, then a ghost Cancel or a 14px ink-soft "call to cancel" line. A new time from the health center comes first, as a 70% blush panel with an 18px bold title, an ink-soft line, a white 12px inner card (date tile, service, the new time, "You asked for" in 14px ink-soft) and Accept (primary) / Decline beside it. Past visits are one white card of line-divided rows with their status chips.

### Staff Appointments
Appointment cards are white 28px cards with the soft shadow: the time in semibold ink after the date in ink-soft, the mother's name as a semibold link to her record (leaf underline on hover), the service, the status chip top right, waiting-since or asked-for lines and remarks in 14px ink-soft, the reminder line (bell icon, ink-soft, rose-deep when sending failed), then small actions: Confirm (primary, bold check), Other time (secondary) and Cancel (ghost in rose-deep). Other time opens a 576px dialog with the current time on a 20px milk strip, the plain slot picker and a remark; Cancel opens a confirmation. Inline errors in every booking dialog are 20px blush notices with rose-deep text and a filled warning icon. The calendar is a 36px white card: month title between 40px caret links, caption weekday heads, 20px day cells (56px tall, 80px from 640px) with the date in semibold tabular numerals and either a count badge or "Closed" in rose-deep; weekends and closed days fade; today is ringed in leaf; the chosen day is solid leaf. The chosen day's cards sit beside it under an 18px bold date heading.

## Do's and Don'ts

### Do:
- **Do** import every icon from the one icon index (Phosphor, plus the Health Icons fetus glyph). The same icon always means the same thing.
- **Do** show the baby in the app with the trimester picture (decorative, beside written weeks), keeping all three renders in the same crop window; the glyph stays on the landing hero.
- **Do** put feature icons in soft colour circles (fill or duotone weight); use regular-weight outlines for navigation, switching to fill for the selected item.
- **Do** label every piece of sample data "Sample" (or "Your estimate" once she has entered her own weeks).
- **Do** keep text in ink, ink-soft, leaf or rose-deep, and check 4.5:1 on any new tint.
- **Do** set titles at weight 800 with negative tracking, and use tabular numerals for every date and count.
- **Do** give paired cards the same header height so their lists align.
- **Do** use expo-out easing (cubic-bezier(0.16, 1, 0.3, 1)) for transitions and keep the reduced-motion block intact.
- **Do** make primary actions full-width pills at phone width and keep tap targets at 44px.
- **Do** mark the current place in a shell with a mint pill, leaf text and a filled icon.
- **Do** keep small labels, table heads and badges in sentence case.
- **Do** register any new custom text-size token with the class merger so it isn't dropped next to a colour class.
- **Do** badge only the exceptional state in a list; let the normal state stay unmarked.
- **Do** fold secondary columns and filters on narrow screens rather than shrinking them; keep phone list cards as single whole-card links.
- **Do** build every new booking surface from the shared service tiles, service art and slot picker (plain variant inside dialogs) rather than a new date or time control.
- **Do** show a visit's state only with the visit status chips, the same map for mothers and staff.
- **Do** pad the page for anything fixed above the mother bottom nav (like the summary bar) so it never covers content.
- **Do** keep the bottom-nav tab opening on its own curve (cubic-bezier(0.32, 0.72, 0, 1), 420ms) and switched off under reduced motion; every other transition stays expo-out.

### Don't:
- **Don't** set text in fern, sage or rose; they are too light.
- **Don't** let rose spread beyond hearts, the baby (glyph or picture), danger signs, errors and tints.
- **Don't** place floating cards over the mother's face or the belly glyph.
- **Don't** add app-store badges, install prompts or device frames; this is a web app.
- **Don't** use black or hard offset shadows; shadows are low and ink-tinted.
- **Don't** add a second ambient motion or a fake sheet drag handle.
- **Don't** add a second typeface, a dark theme or kicker labels above titles.
- **Don't** set uppercase or letter-spaced micro-labels; the week strip's weekday letters (and its Today label) are the only uppercase.
- **Don't** introduce a new colour for roles or statuses; use the existing tint pairs.
- **Don't** put the people illustrations in small places or the blob icon art in big tiles.
- **Don't** let an unavailable day or time look pickable; fade it on cream, strike taken times, and disable it.
