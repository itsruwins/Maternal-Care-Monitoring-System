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
  chart-green: "#16805f"
  chart-rose: "#e08f82"
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
  visit-time-tile:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.2xl}"
    width: "80px"
    height: "56px"
  visit-week-tile:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    rounded: "{rounded.md}"
    size: "56px"
  vital-tile:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  unit-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "0 96px 0 16px"
    height: "48px"
  service-toggle:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "4px 16px 4px 6px"
    height: "44px"
  service-toggle-on:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.ui}"
    rounded: "{rounded.full}"
    padding: "4px 16px 4px 6px"
    height: "44px"
  service-entry:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  notice-check:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  chart-readout:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  follow-up-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  choice-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "10px 8px"
    height: "48px"
  choice-card-checked:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "10px 8px"
    height: "48px"
  chip-follow-up-reached:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-follow-up-not-reached:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-ending:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.2xl}"
    padding: "4px 10px"
  chip-ending-closed:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.2xl}"
    padding: "4px 10px"
  missed-notice:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "28px"
  missed-notice-today:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  chip-sms-waiting:
    backgroundColor: "transparent"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-sms-retrying:
    backgroundColor: "transparent"
    textColor: "{colors.rose-deep}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-sms-sent:
    backgroundColor: "transparent"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-sms-delivered:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-sms-failed:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-sms-skipped:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  sms-send-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  sms-limit-notice:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.rose-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  sms-count-tile:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "14px 16px"
  sms-count-tile-active:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.leaf}"
    rounded: "{rounded.2xl}"
    padding: "14px 16px"
  sms-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  sms-text-panel:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.xl}"
    padding: "10px 14px"
  greeting-panel:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "24px"
  figure-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.xl}"
    height: "44px"
  due-soon-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "0 20px"
  sms-usage-panel:
    backgroundColor: "{colors.milk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  sms-usage-meter:
    backgroundColor: "{colors.mint}"
    rounded: "{rounded.full}"
    height: "8px"
  sms-usage-meter-fill:
    backgroundColor: "{colors.leaf}"
    rounded: "{rounded.full}"
    height: "8px"
  report-total-tile:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "14px 16px"
  report-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  report-detail-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  chart-column:
    backgroundColor: "{colors.chart-green}"
    width: "24px"
  service-bar:
    backgroundColor: "{colors.chart-green}"
    height: "16px"
---

# Design System: Taysan MaternaCare

## Overview

**Creative North Star: "The Gentle Checkup"**

A soft, Flo-inspired world built around the mother rather than the clinic. The client's palette (leaf and fern greens, beige, sage, cream on a warm milk ground) carries almost everything; one dusty rose carries the few things meant to feel tender or urgent: hearts, the baby, danger signs and soft tints. Surfaces are rounded white cards, pill buttons and circles for dates and icons, sitting on curved tinted panels with low, ink-tinted shadows. It is light only, made for daylight at home and at the health center.

This is a web app, not a mobile app. Desktop gets a real web layout (header with section links, two-column sections, a 72rem container); phone widths borrow Flo's patterns (bottom sheets, full-width pill actions, stacked cards). Nothing imitates an app store, an install prompt or a device frame. Type is Inter alone, with extra-bold titles and a friendly single-storey "a". Motion is one slow float and short expo-out transitions, all stopped by reduced motion.

It refuses the generic SaaS hero (headline, device screenshot, feature grid) and clinical realism. Sample data is shown, but always labelled "Sample".

Behind the login the same world turns into a quiet working app. Staff (health workers and admins) get a white sidebar and top bar on the milk ground; mothers get a slim top bar and a floating bottom-nav pill. Content sits in white cards with the soft shadow, the selected place is always a mint pill with a filled icon, and roles are told apart by tint (beige admin, mint health worker, blush mother), never by a new colour. The baby is shown two ways: a soft 3D picture per trimester inside the app, and the flat baby-in-womb glyph on the public landing hero.

Booking a visit is the warmest moment of the app. Services are big white tiles with the client's flat people illustrations; small places show the service as a filled icon on a pastel blob. Days and times are white cards and chips; the one she picks turns solid leaf. A visit's state is always a small tint chip from the same palette, the same on her side and the health center's.

Recording a visit is the health worker's working moment, kept as calm as the rest: vital signs in big-numbered fields with their units inside, services toggled on as pills, and unusual values met with a quiet cream "double-check" note rather than an alarm; only impossible values are errors. The mother sees the same visit as her numbers: a blush week tile per visit, milk value tiles, and two number cards (weight, blood pressure) that show her latest reading big, say in plain words what changed since the visit before, and list her recent readings by date. No charts to read and no good/high colours: her midwife explains what the numbers mean.

Following up a missed visit stays gentle on both sides. Staff see open items oldest first, each led by a small rose-deep "Missed N days ago" line, with one leaf action (Log follow-up) beside a mint Rebook and the log of every try kept in place. The mother is never scolded: she gets a blush "We missed you" notice with a heart and a way to ask for a new visit.

Text reminders stay out of the way until something needs a person. Admins get an SMS log: an Automatic sending card with the SMS phone's status, three tappable count tiles, a filter card and the texts as a table or cards, each with a status chip whose outline says how settled it is (dashed waiting, solid sent, filled done). Staff see one bell line per visit; the mother sees one quiet line about her reminder, and is asked to act only when the fault is her number.

Dashboards and reports are where the counts live, and they stay as quiet as the rest. Staff open on a short rose greeting, five tappable count tiles in the SMS log's style, today's appointments beside the pregnancies due within 30 days and, for admins, two cards of line-divided figures (accounts and SMS health). Reports are one page of link tabs and a filter card over either a Summary (four totals, then a card of figures per subject, a chart-green column chart and ranked service bars) or a detail tab (a table on wide screens, cards on phones). The same page prints: on paper it becomes a plain black-on-white report with the health center's letterhead and signature lines, and every chart becomes a table.

**Key Characteristics:**
- Greens do the work; rose is a small accent; text only in ink, ink-soft, leaf or rose-deep.
- Inter only, extra-bold display and section titles, tabular numerals for every date and count.
- Rounded white cards (20–36px), pill buttons, icons in soft colour circles.
- Curved tinted hero panels with a faint white ring for depth.
- Soft, low shadows tinted with ink; one gentle float.
- Web layout on desktop, Flo patterns at phone width.
- Signed-in app: white sidebar or floating bottom nav, mint active pill with a filled icon, sentence-case labels.
- Booking: illustrated service tiles, a sideways day strip, Morning / Afternoon time chips, and a solid leaf pick.
- Visits: unit-inside vital fields, pill service toggles, a soft cream double-check before any hard error, and plain number cards for the mother (latest reading, what changed, recent readings).
- Follow-ups: oldest first, a rose-deep "Missed N days ago" clue, a leaf Log follow-up beside a mint Rebook, outcome and ending chips in mint or cream, and a blush heart notice for her.
- SMS: dashed, solid or filled status chips, tappable count tiles with a leaf caret, a folded "Show text", every text opening "Hi, {name}!" and signed "From: Brgy. Taysan Health Center", and rose-deep only for a text that failed or is being tried again.
- Dashboards and reports: count tiles with the caret glued to the last word, line-divided figure rows with bold tabular counts, rose-deep only for a count above zero that needs someone, chart-green columns and bars that always write their counts, and a black-on-white print with a letterhead and signature lines.

## Colors

A warm, quiet green-and-cream palette with one dusty-rose accent; every text colour clears 4.5:1 on its ground. Two disabled states sit below that on purpose and are accepted: a taken time chip faded on cream (1.77:1) and a closed staff calendar day (2.16:1). Both are disabled, and each also says so another way (struck through, or the Closed label).

### Primary
- **Leaf Green** (leaf): primary buttons, links, the dashed Waiting and solid-outline Sent SMS chips, the count tiles' carets, "See in SMS log", the online dot on the SMS phone line, the selected language pill, the current step, the "Sample" pill on floating hero cards; the chosen day card, time chip and month day in the slot picker, and the selected day in the staff calendar; on the dashboard, the carets on count tiles and figure rows, the "See all" link and the filled part of the SMS usage meter. White on leaf is 7.6:1; leaf on mint is 6.2:1.
- **Deep Leaf** (leaf-deep): hover state of primary buttons and links only.
- **Fern** (fern): fill and decoration only: filled icon circles, completed stepper lines, habit check marks; the open-day dot in the month view, the duotone sun and cloud-sun beside Morning and Afternoon, the leaf accent on service art. Too light for text.
- **Mint** (mint): the green tint: default icon circles, soft buttons (the slider −/+), done status chips, service tiles, the tips band (at 60%); in the app, the active nav pill, the Active status badge, the Health worker role badge and the selected role choice; the active record tab, the countdown pill, the Live birth outcome chip, a shown purok's icon circle and the checked login option card (at 50%); in booking, the mint service-art blob, the month label in the day strip, the date tile on visit cards, the Confirmed and Completed chips, the calendar's per-day count badges and the open-day hover (at 40%); in visits, the time tile on today's appointments, a service toggle that is on (and its hover at 40%), and the checkup and "Visit saved" icon circles on staff pages; in follow-ups, the Rebook button, the "Reached her" outcome chip, the "Rebooked for …" and "Came in on …" ending chips, and a chosen method or outcome card (at 50%); in SMS, the Delivered chip, the chosen count tile (with a leaf border) and the soft Retry button; in dashboards and reports, the small icon circle on every admin and report card, the current report tab and the track of the SMS usage meter.

### Secondary
- **Dusty Rose** (rose): fill and decoration only: the slider fill, the closing heart, selection highlight (at 45%), SMS-thread dividers (at 40%), the small plus and sparkle accents on service art. Never text.
- **Blush** (blush): the rose tint: danger-sign card, SMS thread panel, blush icon circles, error notices, the destructive button, the top of the rose hero gradient; in the app, the initials avatar and the Mother role badge; the "Week N" pregnancy chip, the overdue countdown pill and the Today danger panel (at 60%); the blush service-art blob, the Rescheduled ("New time sent") and Missed chips, the new-time proposal panel (at 70%), the closed-day icon circle and every inline form error notice; in visits, the week tile on each of her visit rows and the checkup icon circle on her visit page; her missed-visit notice (at 70%); in SMS, the Failed chip and the monthly-limit notice; the staff dashboard's greeting panel (the rose gradient, without the curve).
- **Rose Deep** (rose-deep): rose text and glyphs: danger signs and the danger panel's action line, form errors, the landing baby glyph, reminder flags, the Week chip and overdue countdown; in booking, the Closed label on calendar days, the "still has bookings" warning on a closed day, a failed reminder line, the Cancel action, and the solid request-count badge (white numerals); in follow-ups, the "Missed N days ago" line with its bold clock, the open count on the Open tab and the record's Follow-ups tab, the "Date passed" line on a request that went by, the heart and bullets of her missed-visit notice, and Delete on a log entry; in SMS, the Failed chip and its reason, the dashed "Trying again" chip and its reason line, a Failed count above zero, the offline dot on the SMS phone line and the monthly-limit notice; the staff reminder line when a text failed or is being tried again, and her reminder note when it failed (with an underlined profile link only for a bad number). In dashboards and reports it marks only a count above zero that needs someone (Waiting requests, Needs follow-up, Missed appointments, Failed texts), the "Past due by N days" line with its bold clock, a month's text count once it reaches the plan limit, and a missed appointment's "Still open" follow-up. 5.8:1 on white, 4.77:1 on blush (the visit week tile is the lowest text pair in the app).

### Neutral
- **Milk** (milk): the page ground and the browser theme colour; inside white cards, the vital-value tiles, the mother's weight and blood-pressure number cards, the SMS usage panel on the admin dashboard, and the hover on search-result rows and on figure rows that open a list.
- **White** (white): cards, dialogs, inputs, the footer; the staff sidebar, top bars, bottom nav, menus and sheets.
- **Cream** (cream): quiet fills: services band, unavailable day cards and taken time chips (at 70%), the beige-tone service-art blob, the Cancelled chip, info tiles inside cards, the dialog and sheet close button, sample chips; the hover fill for nav and menu rows and the Inactive status badge; the outcome chip for every outcome except live birth, the Hidden purok badge and the login info notice; the visit form's double-check notice (ink text, filled leaf info icon); the "Couldn't reach her" outcome chip and the ending chip of a follow-up closed without a visit; the "Not sent" SMS chip and the opened "Show text" panel.
- **Beige** (beige): warm tiles and the "To be announced" chip; the end of the beige hero tone; the Admin role badge and the pending-password chip; a hidden purok's icon circle and the past-pregnancies icon circle.
- **Sage** (sage): soft borders (outline button, dashed timeline), scrollbar thumb, the dot on an SMS phone line with no status yet. Not text.
- **Ink** (ink): body and heading text, 14.4:1 on white; the dialog overlay at 40%; the small hover readout over a report column (white text); the rules under the printed letterhead and over the signature names.
- **Ink Soft** (ink-soft): secondary text, placeholders, leading input icons. 6.1:1 on white, 5.3:1 on cream, 4.5:1 on beige, at least 4.67:1 across the rose hero.
- **Line** (line): decorative hairlines and dividers only: sidebar and top-bar edges, table and list row dividers, menu separators; chart gridlines, the border of an off service toggle, a service-entry card and the chart readout; figure-row hairlines, the hover border of count tiles and, on paper, the border of each summary block.
- **Field** (field): input borders, 3:1 on white and milk.

### Tertiary (charts only)
- **Chart Green** (chart-green): the weight bars in the mother's number cards, and the one series in the reports' visits columns and service bars. 4.9:1 on white. A data colour, never UI chrome or text.
- **Chart Rose** (chart-rose): reserved for a second series (no chart uses it now). About 2.5:1 on white, chosen for colour-blind separation from chart green; it is never the only carrier of a value (see The Said Twice Chart Rule).

Tinted panels use radial gradients that stay inside the palette: rose (blush → #f2dfd6 → #eedfd2), green (#eef2ec → mint → #d6e0d8) and beige (#f7f1e6 → #efe6d6 → beige). The rose end was lightened to #eedfd2 so ink-soft keeps 4.5:1 at the bottom of the hero.

### Named Rules
**The Rose Is an Accent Rule.** Rose appears only on hearts, the baby (glyph or picture), danger signs, errors, soft tints and the few things that need her or the staff's attention (a new time to answer, a missed visit and how long ago it was, a request whose date has passed, a closed day, the waiting-request and open follow-up counts, a text that failed or is being tried again). Once a follow-up is sorted it leaves rose: reached, rebooked and came-in states are mint, the rest cream. It never becomes a primary button, a section heading colour or a large flat fill beyond blush; the solid rose-deep count badge stays 24px. On dashboards and reports a count turns rose-deep only above zero, and only when it needs someone (waiting requests, open follow-ups, missed appointments, failed texts); every other count stays ink.

**The Light Colours Don't Speak Rule.** Fern, sage and rose are fills and decoration only. Text and meaningful glyphs use ink, ink-soft, leaf or rose-deep.

**The One Tint Rule.** A tinted tile holds a white icon circle whose glyph takes the tile's own deep colour: leaf on mint or beige, rose-deep on blush.

**The Danger Rule.** Danger signs and errors are rose-deep text with a filled warning icon, on white or blush. Colour never carries the message alone.

**The Role Tint Rule.** A person's role is shown by tint pairs already in the palette: Admin beige with ink, Health worker mint with leaf, Mother blush with rose-deep. Status pairs mint and leaf (Active) or cream and ink-soft (Inactive), always with a small dot and a word.

**The Said Twice Chart Rule.** Chart series colours never carry a value alone. A chart with two series names each line at its end in 13px ink-soft semibold (no separate legend), the readout repeats every value in ink bold beside a short swatch, and a "Show as table" disclosure lists them all. Chart green and chart rose stay inside charts.

**The Visit Status Rule.** A visit's status is a 28px chip from the same tints, identical for mothers and staff: Requested is a dashed leaf border with leaf text and no fill (asked, not yet real); Confirmed and Completed are mint with leaf; Rescheduled ("New time sent") and Missed are blush with rose-deep; Cancelled is cream with ink-soft. The Today week strip repeats the map on its date circles.

**The Black on White Rule.** Everything inside a printed report is black on no fill: chips, tints, chart green, rose-deep alerts and shadows all drop, and links print as plain text. A printed value is always written, never carried by colour.

**The Outline Says How Settled Rule.** A chip's edge tells how far along it is, across visits and texts alike. A dashed outline with no fill is not settled yet: a Requested visit and a Waiting text in leaf, a text "Trying again" in rose-deep. A solid 1px leaf outline with no fill is a text Sent but not yet confirmed. A fill is an outcome: Delivered mint with leaf, Failed blush with rose-deep, Not sent cream with ink-soft (and the visit fills above).

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

In visits: vital-sign fields set the typed value at 18px semibold with the unit in 14px ink-soft inside the field's right edge; a recorded value is 18px bold tabular with its unit in 14px medium ink-soft (milk tiles); the time tile on today's appointments is UI-size bold tabular; the mother's week tile stacks "Week" over the number in 14px bold tabular. In her number cards the title is body-size bold, the latest reading 40px extra-bold tabular with its unit in 16px medium ink-soft, the change line a white pill in 14px semibold ink with a bold leaf arrow (up, down or equals; the words carry the meaning), and "Recent readings" a 14px semibold ink-soft label over line-divided rows: the short date in 14px ink-soft, an 8px chart-green bar on a cream track for weight (starting 5 kg under her lowest recent weight), and the value in semibold tabular. History group labels ("This pregnancy", "Earlier pregnancies") are 14px semibold ink-soft, sentence case.

In follow-ups: the mother's name and the service are semibold (the service medium in the table) over the missed date and time in 14px ink-soft tabular; the "Missed N days ago" clue is 14px semibold rose-deep; the try count is semibold over "Last: …" in 14px ink-soft; a log entry leads with its date and method in semibold tabular. On her record the groups ("Needs follow-up", "Closed") are 18px bold and each card's "Follow-ups" label is 14px semibold ink-soft. Her missed-visit notice title is 18px bold; its list and body are UI size.

In dashboards and reports: the greeting takes the Headline style over today's long date in ink-soft tabular. Section headings (Today's appointments, Due within 30 days, Admin, the report's tab name) and every admin or report card title are 18px bold; the report's "Showing {period}" sits under its heading in UI-size medium ink-soft. Count tiles and summary totals set the number at 24px extra-bold tabular over the label in 14px medium ink-soft. Figure rows are UI size: the label medium ink (a sub-row regular ink-soft, indented 16px) and the count bold tabular at the right. Due-soon rows give the name in semibold over purok and week in 14px ink-soft, and "Due {date}" in semibold tabular over the days line in 14px. Detail tables are UI size with caption semibold ink-soft heads, under a 14px ink-soft count line. The visits chart writes counts above its columns and dates below them in 12px tabular ink-soft (counts semibold). On paper the letterhead name is 16px bold, the report title 20px bold, the rest 14px, and detail tables drop to 10pt.

Implementation note: the class merger (`cn`) registers the caption, title and display size utilities as font sizes, so they survive next to a text colour class. Any new custom text-size token must be added there too, or it will be dropped silently. (The `title` utility carries the Headline size.) Inter preloads only its latin subset, which covers English and Filipino; other subsets still load on demand.

### Named Rules
**The Extra-Bold Title Rule.** Every display, section and dialog title is weight 800 with negative tracking. Body never goes above 600 except numbers and key values (700).

**The Tabular Numbers Rule.** Every date, week count and time uses tabular lining numerals so values never jitter as they change. The tabular class goes on the numeric element itself (a date, time, week, BP, weight or count cell), never on a whole row, card or block of mixed text: tabular figures also widen hyphens and dashes, so names and sentences inside a tabular container space oddly.

**The Gentle Wrap Rule.** Headings h1–h3 balance their lines; paragraphs and list items wrap pretty. No orphaned last words.

**The Unbroken Time Rule.** A time never breaks from its AM or PM: the shared date and time formatters put a no-break space before it, and times written into copy do the same. A short date and time inside a labelled line ("Next visit: Thu, Oct 29 · 9:00 AM") is joined with no-break spaces throughout, so the line breaks after the label, never before "· 9:00 AM"; a status after it, like "(Requested)", may still wrap. The shared date formatter (`formatDate`) returns its date with no-break spaces, so every displayed date stays whole. A Filipino hyphenated word that must stay whole (makipag-ugnayan) takes a word joiner after its hyphen. Reminder lines (staff and hers) and every SMS log slot (send and retry times, "Service · date · time", the phone-status time, the limit notice's date) join every space with a no-break space, so the sentence wraps only before the slot. Her long date lines ("Wednesday, November 4 · 1:30 PM") go through `unbroken()`, which swaps every space not after a comma for a no-break space, so the line can only break after the weekday. In JSX the joiner is a string expression, `{"\u00a0·\u00a0"}`; a `\u00a0` typed as bare JSX text is not an escape and prints as six characters. A short word that leads into a date is joined to it in the dictionary (Filipino "para sa {when}" uses no-break spaces), so no single word is left alone at a line end. Report dates come from the report formatters, which join a day with no-break spaces ("Nov 5, 2026") and keep a time with its AM or PM; a date and time in one cell are joined with a no-break middle dot. The pager joins the last two words of "Page {page} of {pages}" ("Pahina {page} ng {pages}"), so a narrow phone breaks "Pahina / 1 ng 3", never before the last number. An SMS text preview is joined on screen only: its dates ("Tue, Nov 3, 10:00 AM", "Fri, Oct 30") take no-break spaces and a hyphenated word (Mag-log, Naka-schedule) takes a word joiner after its hyphen; the stored and sent text stays plain GSM-7, which has neither character. A short tag that must stay whole takes whitespace-nowrap (Walk-in, the Filipino "May appointment"), and a count tile's last word is wrapped with its caret so the caret never starts a line alone.

**The Sentence Case Label Rule.** Small labels stay in sentence case at normal tracking: sidebar group labels, table column heads, badges, form labels and bottom-nav labels. No uppercase or letter-spaced micro-labels; the week strip's weekday letters are the one exception.

## Layout

The page is a stack of full-width bands (milk, cream, mint at 60%, the curved rose hero) holding a centred container of 72rem with 16px gutters (24px from 640px). Sections breathe at 64px vertical padding, 96px from 1024px. Breakpoints follow Tailwind: 640px (dialog becomes a centred card, step labels appear), 768px (lists become tables), 1024px (desktop header navigation, two-column sections, all three hero cards), 1280px (wide tables and filter rows unfold).

Desktop gets a real web layout: header with brand, section links, language switch, Log in and Sign up; two-column hero (text, slider card and Sign up on the left, illustration on the right); two-column sections with an intro column beside a sample artifact; a five-tile row for services. Phones stack the same content in reading order (hero: headline, lead, illustration, slider card, full-width Sign up), turn tiles into a list and make primary actions full width.

### App shells
- **Staff shell** (health workers and admins): from 1024px a sticky white sidebar 288px wide with a line border on its right, holding the full brand mark, the main nav and, for admins, a sentence-case "Admin" group below it. Beside it, a sticky 64px white top bar (line border below) with the current section title on the left and the language switch and initials avatar on the right. Content sits on milk in a 72rem column with 16 / 24 / 32px side padding and 24px (32px from 1024px) top padding. Below 1024px the sidebar is hidden and a 44px menu button at the left of the top bar opens the same nav in a sheet from the left.
- **Mother shell**: a sticky 64px white top bar (compact brand mark, language switch, avatar) over a 64rem content column, and a floating bottom-nav pill on every screen size: centred, up to 448px wide, 16px above the bottom edge plus the safe area. Content keeps 144px of bottom padding so the pill never covers it.
- **Inside pages:** the page title and intro sit top left with the primary action (New staff account, Add activity type) beside them from 640px and below them on phones. Lists become a table from 768px and stacked cards below. Detail and profile pages put a summary card on top and two cards side by side from 1024px (1 : 1.3), stacked below. Forms are one column on phones and two from 640px; short pairs (first and middle name) share a row and longer fields (last name, position, Other, mobile number) span both columns. Submit buttons are full width on phones and fit their label from 640px.
- **Lists that fold:** the mother registry is a table from 768px; below 1280px its Login column folds under the name, and below 768px each mother is a whole-card link (the name link covers the card, one tab stop, a bold caret top right). The purok list keeps one card of rows at every width; on phones a row's actions drop under the name. A shared pager (Previous / "Page 2 of 5" / Next) closes every paged list; its page line is centred, keeps its last two words together (see The Unbroken Time Rule) and sets only the numbers in tabular figures. Below 360px, Previous and Next show only their carets (44px wide; the words stay for screen readers), so the pager fits a 320px phone.
- **Filters that fold:** the mother filter card stacks search over the selects on phones, where the three extra selects fold behind a full-width secondary "Filters" toggle (showing the count in use, open when any is set); three columns from 640px; one row from 1280px with Search aligned to the field bottoms.
- **Long forms:** registration is a stack of section cards (icon circle plus title), each a two-column grid from 640px; Cancel and Register sit at the end, full width and stacked (primary on top) on phones, right-aligned from 640px.
- **Record pages:** back link, a header card, a link-tab bar, then the tab's cards; Overview puts details beside login at 1.4 : 1 from 1024px.
- **Booking a visit (mother):** a back link and title, then three steps that fold as she goes: the service tiles (two per row on phones, three from 640px, four from 1024px), then the chosen service as one white chip with a small secondary Change, then the slot picker's day card and time card stacked. Once a day and time are chosen, a white summary bar (up to 576px, float shadow) is fixed 88px above the bottom edge plus the safe area, just over the bottom nav, and the page gains 176px of bottom padding so it never covers the last chips.
- **Booking a visit (staff):** the same steps in white cards on the full staff column: a mother search, compact service tiles (two per row, three from 640px, five from 1024px), the slot picker and a remarks card with a fit-width primary from 640px. Only this page numbers its steps (1. Mother, 2. Service, 3. Day, 4. Time); rebooking and the next-checkup step already know the mother and reuse the same form with plain headings (Service, Day, Time).
- **Staff appointments:** title and intro with Book appointment beside them from 640px, then a link-tab bar in the record-tab style (Requests with its count, List, Calendar). Requests and the record's Appointments tab are a grid of appointment cards, two columns from 1024px. List is a filter card (two fields per row with a full-width Show from 640px; four fields and Show in one row only from 1280px) above a table from 1024px whose actions stay on one line, with stacked cards below 1024px. Calendar is a month grid beside the chosen day's cards at 1.15 : 1 from 1024px, stacked below.
- **Closed days (admin):** one 36px card of line-divided upcoming rows (blush icon circle, date, reason, the rose-deep warning when visits remain, then Remove; on phones Remove drops under the text), then past days in a quieter card on 60% white.
- **Staff Visits:** title and intro with a primary Walk-in visit beside them from 640px (full width on phones), then "Today" with the date (one line from 640px joined by a middle dot; on phones the date drops to its own ink-soft line), today's confirmed appointments as cards two per row from 768px, then recent visits as one line-divided card. In an appointment card the Record visit button fits its label from 640px and takes its own full-width 44px row on phones; once recorded it becomes a leaf "Recorded" link with a filled check.
- **Recording a visit:** back link and title, then either a find-a-mother card (search with the button aligned to the field bottom from 640px; results in a bordered list) or the mother's summary card with a small secondary Change, then three 36px section cards: vital signs (fields one column on phones, two from 640px, three from 1024px; blood pressure spans the row as a systolic / diastolic pair up to 576px wide), services given, and notes with the save button (full width on phones). After the first save a confirmation card sits on top of the optional "Book next checkup" step (the shared staff booking form, prefilled).
- **Visit detail (staff):** back link, a 36px header card (checkup circle, title, the mother as a link, week, source and who recorded it, secondary Edit or a lock line), then vitals beside services and notes at 1 : 1 from 1024px, stacked below. Editing reuses the visit form under the same header text.
- **Mother Visits:** title and intro (up to 56ch), the next-visit card (secondary action full width on phones), her numbers card with the two milk number cards (weight, blood pressure; up to five recent readings each) side by side from 1024px and stacked below, then her visit history (this pregnancy, then earlier ones). Her visit page: back link, a blush checkup circle beside the title and week, then a vitals card (tiles two per row, three from 640px) and a services card. Staff notes never appear on her side.
- **Mother Today:** date and greeting, then from 1024px two columns at 1.05 : 1 with the hero sticky 96px from the top on the left and insight grid, tip, danger and past pregnancies stacked on the right; one column below. With no pregnancy, a health-center card and the danger panel take the two columns. While she has an open missed visit, the next-visit insight becomes her missed-visit notice across the width of the insight grid, with Tip and Danger signs side by side below it.
- **My Appointments (mother):** her missed-visit notice appears once, right under the header, above any new time to answer and her upcoming visits.
- **Staff Follow-ups:** title and intro, an Open / Closed link-tab bar in the record-tab style (Open carries the open count), the filter card, a result count, then the list: a table from 1280px (room for the actions beside the sidebar) and cards below it, two per row from 768px. Open items run oldest first. The filter card spans the search across two columns with the other four fields two per row and a full-width Show; it becomes four columns at 1280px; below 640px purok, follow-up and the date range fold behind the "Filters" disclosure, as on the mother list.
- **Follow-ups tab (mother record):** two groups under 18px bold headings, "Needs follow-up" (open, oldest first) then "Closed" (newest first), each a grid of cards, two per row from 1280px.
- **SMS log (admin):** title and intro (up to 60ch), the Automatic sending card (Send now beside the text from 640px, full width below it on phones), three count tiles in one row at every width, the filter card, a result count, then the texts: a table from 1280px, cards below it, two per row from 768px, and the shared pager. The filter card spans the search across two columns with status, type and the date range two per row from 640px and four columns from 1280px; below 640px those four fold behind the "Filters" disclosure, as on the mother list. Search keeps a full-width row (fit-width from 1280px) with a ghost Clear when filters are set.
- **SMS log tab (mother record):** the record's "SMS log" tab holds an 18px bold "Her texts" heading over her texts as the same cards without her name, two per row from 1280px; Retry shows for admins only; with none, a centred white empty card.
- **Rebook:** back link, title and intro, the mother's summary card, an ink-soft suggested-date line, then the shared staff booking form without step numbers. A missed visit already sorted shows one card saying how it ended instead.
- **Staff dashboard (Home):** blocks 24px apart: the greeting panel, then five count tiles 12px apart, two per row on phones (the fifth spans the row), three from 768px and five from 1280px (beside the sidebar there is no room at 1024px). Then Today's appointments beside Due within 30 days from 1280px, top-aligned, stacked below, each under an 18px bold heading. Admins get an "Admin" heading over Accounts and SMS health, side by side from 1280px.
- **Reports:** title and intro, the report tab bar, the filter card, then the report: its tab name with "Showing {period}" below it on the left and Print and Download CSV on the right, wrapping under it when there is no room. On phones the tab bar bleeds to the screen edge, scrolls sideways and fades its ends (16px on the left, 24px on the right) below 640px. The filter card is one column on phones and two per row from 640px with Show (and a ghost Clear) across the full width; from 1280px it becomes one wrapping row where each field keeps at least 192px and Show fits its label. From / To join Period only while "Custom dates" is chosen.
- **Report Summary:** four totals two per row, four from 1280px; then the subject cards one column, two across from 1280px and top-aligned; the admin Text messages card spans both columns with its five figures in one row.
- **Report detail tabs:** a count line, then a table from 1280px and cards below it, two per row from 768px. On paper the table always prints (see Printed Report).

### Named Rules
**The Web, Not App Rule.** Desktop is a website, not a stretched phone. Phone-width layouts borrow Flo's patterns, but there are no app-store badges, install prompts or device frames; the product says it works in the phone's browser. Copy says so too, texts included: "Mag-log in sa website", never "app".

**The Clear Face Rule.** Floating hero cards never cover the mother's face or the belly glyph. Phones and tablets show only the weeks card; the SMS and next-visit cards appear from 1024px.

**The Shared Header Rule.** Paired cards share header height (icon circle plus title at a 48px minimum) so their lists start and run on the same lines; tile rows top-align their titles.

**The One Place Rule.** The current place in either shell is a mint pill with leaf text and a filled icon; every other item is ink-soft with a regular-weight icon and a cream hover. Nothing else marks position. The record tab bar follows the same rule without icons.

**The Wide Row Rule.** A filter card goes to a single row only when every field still has room: four fields and their button share a row from 1280px. Below that, fields sit two per row and the button takes the full width.

**The Real Steps Rule.** Step headings carry numbers only when the sequence is real: the staff booking page, where finding the mother is step one. A form reused where the mother is already known drops the numbers.

**The Mark the Exception Rule.** In a list, only the unusual state carries a badge (a hidden purok is badged, a shown one is not); the normal state stays unmarked.

**The Brand Gives Way Rule.** In the landing header the brand mark may shrink (min-w-0) and the action group may not (shrink-0), so Log in is never pushed off screen. The compact wordmark wraps to two lines (1.1 line height) from 360 to 419px instead of truncating, and truncates only below 360px. Below 400px the header tightens: 6px gaps between brand and actions (4px inside the action group), 6px side padding on Log in, a narrower EN/FIL switch (36px pill buttons with 8px padding) and an 8px gap inside the brand mark.

**The Current Tab Shows Rule.** A tab bar that scrolls sideways on phones scrolls its current tab into view when the page loads (record tabs and report tabs), so the place she is in is never off screen; the report bar also fades its ends to say there is more.

**The Zero Minimum Rule.** A grid whose children hold long no-wrap content names its phone column as `grid-cols-1` (minmax(0, 1fr)); an implicit column sizes to min-content and pushes the page sideways (the How-it-works SMS bubble was the case). `truncate` works only when every flex parent between it and the bounded box has min-w-0.

## Elevation & Depth

A hybrid: tonal layering does most of the work (milk ground, cream and mint bands, white cards), and soft, low shadows tinted with ink lift cards a little. Shadows are never black and never hard-edged.

### Shadow Vocabulary
- **Soft** (`0 1px 2px rgb(31 45 39 / 0.04), 0 4px 14px -4px rgb(31 45 39 / 0.08)`): resting white elements on a tinted ground: brand disc, language switch, secondary button, SMS bubbles, habit card.
- **Raised** (`0 2px 4px rgb(31 45 39 / 0.04), 0 14px 32px -10px rgb(31 45 39 / 0.16)`): primary content cards: slider card, records card, health center card, auth card, floating hero cards, toasts, slider thumb.
- **Float** (`0 4px 10px rgb(31 45 39 / 0.05), 0 28px 60px -18px rgb(31 45 39 / 0.28)`): the highest layer: dialogs and bottom sheets, the weeks card; in the app, the mother bottom nav, the booking summary bar, the staff menu sheet and the profile menu.

In the signed-in app, content cards, filter cards, tables and list cards rest on milk with the soft shadow, not raised; the white sidebar and top bars are flat with a line border instead of a shadow. In pickers the chosen day card, time chip and month day take the soft shadow under their leaf fill; service tiles rest flat with a line border and lift 2px with the soft shadow and a leaf border on hover. In visits, every card rests with the soft shadow; only the "Visit saved" confirmation is raised. The chart readout takes the soft shadow and a line border; service toggles and service-entry cards are flat with borders. On the dashboard and reports every tile, card, filter card and table card rests on milk with the soft shadow; count tiles add a 2px border, clear at rest and line on hover. Paper has no shadows at all (see The Black on White Rule).
- **Leaf glow** (`0 1px 2px rgb(31 45 39 / 0.12), 0 8px 18px -8px rgb(62 90 77 / 0.55)`): under the primary button only.

### Named Rules
**The Ink-Tinted Shadow Rule.** All shadows use ink (31 45 39) at low alpha with negative spread. No black, no offset hard shadows.

**The One Float Rule.** The only ambient motion is a 6s, 8px float on the hero cards and the "New reminder" badge, staggered by animation delay. Reduced motion stops it, along with every transition.

## Shapes

Soft and round throughout. Radii step 8 / 12 / 16 / 20 / 28 / 36px: inputs 8px, tiles inside cards 12px, floating and slider cards 16px, service tiles 16px, large cards and dialogs 28px (the 3xl utility), photos and the health center card 32px, the closing panel 40px. Buttons, chips, the language switch and every icon, date and step indicator are full circles or pills.

In the signed-in app: section cards (summary, security, profile, activity types, the mother record header and pregnancy cards, registration sections, Today panels and the purok list) use the 36px radius; filter cards, tables, list cards, the login option card and the profile menu use 28px; sidebar nav items, menu rows, insight cards and notices use 20px; inputs, selects and the role choice 8px. Badges, the avatar, the bottom nav, the record tab bar, countdown pills and the trimester picture are pills or circles.

In booking: service tiles, the chosen-service chip, the summary bar, slot-picker cards, the proposal panel and the staff calendar card use 36px; day cards, time chips, the visit date tile, staff appointment cards, the filter card and the picture-picker options use 28px; staff calendar day cells and inline notices 20px; the white card inside the proposal panel 12px. Month-view days, the month label, status chips and count badges are circles or pills. Service art sits on an irregular soft blob rather than a circle.

In visits: section cards, the visit lists and the mother's history use 36px; today's appointment cards, the time tile, service-entry cards and empty states use 28px; the double-check and error notices and the chart readout use 20px; vital tiles and the week tile use 12px; vital inputs 8px. Service toggles are pills.

In follow-ups: the filter card, the table card, list and record cards, method and outcome choice cards and the "No more follow-up needed" option use 28px; the missed-visit notice is 36px on My Appointments and 20px as the Today insight; outcome chips are pills, while ending chips keep a 28px radius so a long "Rebooked for …" can wrap.

In SMS: the Automatic sending card, count tiles, filter card, table card and text cards use 28px; the monthly-limit notice and the opened text panel use 20px; status chips, the phone-status dot and Retry are pills or circles.

In dashboards and reports: the greeting panel, the due-soon card, the admin cards and the report subject cards use 36px; count tiles, summary totals, the filter card, the detail table card, detail cards and empty notes use 28px; the SMS usage panel, a linked figure row's hover and the column readout use 20px. Chart columns round 4px at the top and sit square on the baseline; service bars round 4px at their end; the usage meter is a pill. On paper every corner is square.

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
- **Focus / Press:** a solid 2px leaf outline offset 2px on every button and the profile avatar (offset 4px on whole-card links); scale to 0.97 on press with expo-out easing; trailing arrow icons in bold weight. Implementation note: in Tailwind v4 the outline-none reset also sets the outline style to none, so any control that removes the browser ring must name the solid style in its focus-visible set, or the ring never draws.
- **Companion action:** beside a leaf primary on a white card, the second action is soft (mint), as Rebook is beside Log follow-up; a white secondary pill on a white card reads only by its shadow.
- **Text actions in lists:** "See log" is a link-style button kept at a 44px target height so a text action in a dense row stays easy to hit.
- **Account actions:** Reset password is an outline button with a bold lock icon; Deactivate is destructive and Activate is soft. Both open a confirmation dialog whose confirm button repeats the action's style (destructive for Deactivate, primary otherwise) beside a ghost Cancel. Paging uses small secondary buttons with bold carets, dimmed to 40% at the ends.
- **Row and card actions:** small (36px) buttons with bold icons: secondary for Rename, Edit and Add past pregnancy; outline for Close pregnancy; ghost for Hide / Show and editing a past row. Full-size primary only for the one main action of a page or empty state (Add purok, Register a mother, Start a new pregnancy).

### Chips
- **Sample:** "Sample" in caption semibold. Inside a card header it is a cream pill with ink-soft text; on a floating hero card it is a small leaf pill with white text perched on the top edge.
- **Status:** 28px pills with caption semibold: mint and leaf with a bold check for done, solid leaf with white for booked.
- **To be announced:** beige pill, ink-soft text.
- **Role and status badges:** 28px pills in caption semibold, by role tint (see The Role Tint Rule). The status badge leads with a 6px dot in its text colour. A beige pending-password chip joins them on the account summary. The same Inactive badge, worded "Hidden", marks a hidden purok.
- **Pregnancy chip:** while pregnant, a 28px blush pill reading "Week N" in rose-deep, followed by the trimester in 14px ink-soft text; after a pregnancy, a cream outcome pill with the outcome and date. Past-pregnancy outcome chips are mint and leaf for a live birth, cream and ink-soft otherwise.
- **Visit status:** 28px caption-semibold pills per The Visit Status Rule; Requested is outlined and dashed because it is not settled yet (see The Outline Says How Settled Rule).
- **SMS status:** the same 28px caption-semibold pill, never wrapping, in six states: Waiting (dashed leaf), Trying again (dashed rose-deep), Sent (solid 1px leaf outline), Delivered (mint, leaf), Failed (blush, rose-deep), Not sent (cream, ink-soft). Under it sit 14px detail lines: "Goes out …", "Next try …" or "Sent …" in ink-soft, and the reason in rose-deep when it failed or is being retried (ink-soft for a text not sent).
- **Count badges:** the waiting-request count on the Requests tab is a 24px solid rose-deep circle with white bold tabular numerals; the staff calendar's per-day counts are mint circles with leaf numerals (white with leaf on the selected day).
- **Follow-up chips:** each log entry carries an outcome pill (28px, caption semibold): "Reached her" mint with leaf, "Couldn't reach her" cream with ink-soft. A closed item carries one ending chip, "Rebooked for …" or "Came in on …" in mint with leaf, closed without a visit in cream with ink-soft; it keeps a 28px radius and wraps rather than truncating the date.
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
- **Choice cards:** a one-of choice inside a dialog (how you reached out, did you reach her, why it ends) is a grid of radio cards: 48px minimum, 28px radius, line border on white with a leaf border and milk hover, leaf border on 50% mint when chosen; the radio itself is hidden and the card takes the leaf focus outline. Method cards (Call, SMS, Home visit) put a 24px duotone leaf icon above the name in 14px semibold; outcome cards are words only. With an error, the unchosen cards take a faded rose-deep border and the message sits below in rose-deep with a filled warning icon.
- **Keep input on error:** every form submits through the shared submit-without-reset helper, so a server error never wipes what was typed; forms that should clear after saving remount instead.
- **Slider:** a 10px cream track with rose fill to the value, a white round thumb with a 3px leaf ring and raised shadow; trimester ticks underneath.

### Navigation
- **Header:** sits on the rose hero: brand mark (seal on a white disc plus the bold wordmark), section links as 40px ghost pills in ink-soft (hover to 70% white and ink) from 1024px, the EN/FIL switch, ghost Log in and primary Sign up (hidden below 640px). The brand mark is compact and allowed to wrap; see The Brand Gives Way Rule for how it yields at phone width.
- **Language switch:** a white pill with the soft shadow holding two pills; the active one is leaf with white text.
- **Footer:** white, four columns from 768px, bold 14px column headings, ink-soft links that turn leaf and underline on hover, regular-weight leaf icons beside details.
- **Icons:** navigation icons are regular-weight outlines; the selected item uses fill.
- **Staff sidebar nav:** 44px rows, 20px radius, 20px icon with a 12px gap, UI-size text; ink-soft medium at rest with a cream hover, mint with leaf semibold and a filled icon when current. The admin group label is caption semibold in ink-soft, sentence case.
- **Menu sheet:** below 1024px the sidebar opens as a white sheet from the left (up to 320px, 86% of the viewport) over a 40% ink overlay, sliding in over 300ms with expo-out, with the same 44px cream close button as dialogs.
- **Mother bottom nav:** a snug white pill (only as wide as its tabs, never wider than the screen less 32px) at 95% white with a line border, backdrop blur and the float shadow, 6px padding and 4px gaps. Tabs are icon-only 48px pills (24px regular icon, ink-soft, cream hover); the current tab opens into a mint pill with a filled icon and its name in UI-size leaf semibold. The name slides open by animating its grid column from 0fr to 1fr with fade and margin over 420ms on cubic-bezier(0.32, 0.72, 0, 1); reduced motion turns the transition off. Folded names stay in the accessible name.
- **Profile menu:** a 44px initials avatar (blush, rose-deep bold) opens a white menu (28px radius, float shadow, at least 224px wide) with the name in UI semibold and role · @username in caption ink-soft, a line separator, then 44px rows with ink-soft icons and a cream highlight.
- **Record tabs:** plain links in a white pill bar (6px padding, soft shadow); 40px pill tabs in UI-size text, ink-soft medium with a cream hover, mint with leaf semibold when current. On phones the bar scrolls sideways to the screen edge with the current tab scrolled into view (see The Current Tab Shows Rule). The report tabs are the same bar.
- **Back link:** a leaf 14px semibold underlined link with a bold left caret above the page ("Mothers", "Appointments"). It is 44px tall at minimum with a −12px vertical margin, so it gets a full 44px target without moving anything around it; every back link uses it.
- **Skip link:** the first stop on every page, "Skip to content" ("Lumaktaw sa nilalaman"), hidden until focused. Then it shows as a white pill fixed 12px from the top left (20px by 12px padding, semibold ink, raised shadow, the 2px leaf outline offset 2px) and jumps past the header and menus to the page's main region, `<main id="main">`, which every shell and the auth pages provide (focusable by script, with no outline of its own).
- **Compact brand mark:** in crowded top bars the wordmark drops to UI size at phone width (17px from 640px) and the location line appears only from 640px.

### Accounts and Mother Lists
From 768px a white table in a 28px card with the soft shadow: caption semibold ink-soft column heads in sentence case, UI-size body, line dividers, a milk row hover; the name links to the account (leaf underline on hover) above the @username in ink-soft; dates in tabular numerals. Below 768px each account is a white card with name, username, badges and a bold caret. A result count sits above in label size; an empty state is a centred white card.

The mother registry uses the same table (name over the phone number, purok, pregnancy chip, due date, login with a filled leaf check) and the same card fallback; see Layout for its folds. The purok list is one 36px white card of line-divided rows: a small icon circle (mint when shown, beige when hidden) beside the name in UI semibold (ink-soft when hidden), the Hidden badge only on hidden rows, then Rename and Hide / Show; two ink-soft info notes with regular info icons sit under the list.

### Icon Circle
The signature carrier for every feature icon: a round tile in mint, blush, beige, cream, white, fern, leaf or rose at 36, 48, 64 or 80px, glyph in fill or duotone weight, always at least 3:1 against its circle. Decorative unless given a label.

### Dialog (Auth Sheet)
Every dialog's grid has a single minmax(0, 1fr) column, so wide content (a day strip, a picture grid) scrolls inside it instead of widening it. One dialog serves Log in and Sign up and switches between them in place. On phones it is a bottom sheet (28px top corners, up to 92% of the viewport, safe-area padding, slides up with expo-out); from 640px it is a centred 448px card (672px for sign-up) with a float shadow over a 40% ink overlay. No fake drag handle. A 44px cream round close button sits top right (the same close in every dialog and the menu sheet). Log in leads with a blush heart circle and a centred title; sign-up shows a five-step icon-circle stepper (current step solid leaf, done steps mint with a check, later steps cream) with a sticky Back/Next bar at the bottom. The sign-up form loads only when someone heads for it (hovering or focusing a Sign up button starts the download); while it loads, the dialog holds a centred status placeholder at least 320px tall with a 20px spinner and "Loading…" ("Naglo-load…") in ink-soft, and focus moves to the first field when the form arrives, as it does on opening and on every switch.

### App Cards (Profile, Account, Activity Types)
Pages open with a summary card: a large icon circle (mint user for staff, blush pregnancy for mothers) beside the headline-style name, the @username and badges. Section cards follow with a 20px bold heading, optionally led by a small icon circle (mint lock for password, blush email for recovery email). Read-only facts are a definition list with line dividers, label in label-size ink-soft above the value. The mother record header card leads with a large blush pregnancy circle beside the name, a meta line (age, phone, purok with small icons), the pregnancy chip with a Login status badge, and the registration line in 14px ink-soft. Its Overview pairs a details card (blush user circle) with a login card (mint user circle) whose facts are a label / value definition list, a cream info notice, and outline Reset password beside a soft or destructive status button, each opening a confirmation dialog. Activity types are cards in a two-column grid from 768px: the service's small art, a Title-style name, a UI-size description in ink-soft, and a line-divided footer with the reminder timing in leaf (filled bell) and an Edit button.

### Forced Password Change
The auth card alone on milk: headline-style title, an ink-soft lead, a mint info notice (leaf text with a filled info icon, 14px, 20px radius; the calm twin of the blush error notice), the two password fields with leading lock icons, the primary Save and continue, and a ghost Log out in ink-soft with its icon centred under it, so a user who isn't ready can still leave.

### Forgot Password
The auth card alone on milk under the headline-style title. The ink-soft subtitle belongs to the form (pulled up to sit 8px under the title), so it leaves with the form: once sent, only the title stays above the "Check your email" panel, a large mint duotone email circle, a 20px bold heading, the ink-soft message (which also says to check the Spam folder) and a secondary Back to log in with a bold left arrow. Too many tries shows the blush 20px notice with rose-deep text and a filled warning icon above the submit button.

### Curved Hero and Fetus Picture
The curved hero is a radial-gradient tinted panel (rose, green or beige) with a curved bottom edge and a faint corner ring. The baby appears in two forms:
- **Trimester picture (the app):** client-approved soft 3D renders, one per trimester, cropped from the same 1100px window so the baby visibly grows from one to the next. Shown full-bleed in a circle on a pale blush plate; decorative (empty alt) because the week and trimester are always written beside it. 96px on the staff pregnancy card (112px from 640px); 192px in the Today hero (224px from 640px) with an 8px ring of 60% white.
- **Fetus glyph (the landing hero):** by client decision the public landing keeps the Health Icons baby-in-womb glyph in rose-deep, on the belly of the hero illustration and in a blush circle on the weeks card, growing by trimester (50%, 60%, 70% of the circle) with a 500ms expo-out transition driven by the weeks slider.

### Pregnancy Card (staff)
A 36px white card: a header row with a 20px bold title and its small actions (Edit, Close pregnancy) on the right from 640px. Below, the trimester picture beside the extra-bold week, the trimester and the countdown pill; then a definition list (due date, last period, gravida / para, remarks) with ink-soft labels and medium values, below on phones and beside it behind a line divider from 768px. Past pregnancies follow in a second card of line-divided rows: outcome chip, the date in semibold, G/P and due date in ink-soft, remarks, and a ghost Edit. Pregnancy forms open in a 576px dialog with two-column date pairs.

### Mother Today
The mother's home after Flo's pregnancy screen. The rose curved hero (large curve, 36px top corners) holds the week strip, the trimester picture, the week number, "2nd trimester · 21 weeks and 1 day" in 18px ink-soft, the countdown pill, the due date and a 14px note on how it was counted. Beside it, the insight grid, then white panels with a 36px icon circle and an 18px bold title: the tip of the week (mint), danger signs (on 60% blush, rose-deep dots, a rose-deep semibold action line and the health center's number as a rose-deep link) and past pregnancies (beige). With no pregnancy she gets a raised card (large blush circle, a milk inset with the health center's address, hours and contact, label above value on phones and beside it from 640px) and a leaf link to Appointments.

### Week Strip and Insight Card
The week strip shows seven 40px date circles, Sunday to Saturday, whose fill tells the day's state (leaf for appointment, dashed leaf for requested, mint for done, blush for missed; today is white with a soft shadow). Insight cards are 20px-radius tiles (white with the soft shadow, mint or blush) with a 15px semibold title on top, the body filling the space right under it, and a small icon circle at the bottom, so every tile in a row lines up. On Today they ship as a three-column grid of whole-card links (next visit, its short date on one line, kept whole, over the time on the next, with no dot between, and the status in brackets until confirmed; tip; danger signs), at least 160px tall, a 14px ink-soft body clamped to three lines that keeps its own line breaks and breaks an overlong word rather than overflowing, lifting 2px on hover; each points at its fuller panel. While she has an open missed visit the row becomes two columns: the missed-visit notice spans both (20px radius, 16–20px padding) with her next visit as a leaf-icon line and a primary Request a visit (full width on phones), and Tip and Danger signs sit side by side below it. The 144 × 176px snap-scrolling row remains available (design preview) for longer sets.

### Service Tiles and Service Art
A service has two pictures. **Service tiles** (the first booking step) are white 36px buttons with a line border holding the client-approved flat people illustration (square, up to 208px; 128px compact) above the name only, centred; hover lifts 2px with a leaf border and the soft shadow, focus is the leaf outline. The admin picture picker repeats the illustrations as 64px thumbnails in a four-column grid of 28px radio options (line border, milk hover, leaf border on 50% mint when chosen) with the picture name in caption ink-soft. **Service art** is for small places (the chosen-service chip, the summary bar, Activity types cards): a filled Phosphor icon on a pastel blob (mint with leaf, blush with rose-deep, cream with leaf), with a fern leaf, a rose plus and a rose sparkle around it at the larger sizes; at the smallest (56px) the accents drop and the icon turns duotone. Both are decorative; the name is always written beside them.

**The Two Pictures Rule.** The people illustration appears only where the picture is big (service tiles, the picker thumbnails); everywhere small uses service art. Never squeeze an illustration into a chip or blow service art up into a tile.

### Slot Picker
One shared day-and-time picker for mothers requesting, staff booking and staff offering another time. In pages each part is a 36px white card with an 18px bold heading; in dialogs (the plain variant) the cards drop away. The day part has the month of the first visible card in semibold ink-soft and a leaf "See full month" text button with a calendar icon; below, a snap-scrolling strip of 76 × 96px day cards (weekdays only), with 36px white round caret buttons at either end from 640px. A new month inserts a small mint caption pill between cards. Open cards are white with a line border (leaf border on 40% mint at hover); the chosen card is solid leaf with white text; full and closed cards fade on 70% cream and can't be picked, the Closed label in faded rose-deep. "See full month" opens a month grid in a dialog: 48px round days, open days with a 4px fern dot, the chosen day solid leaf, today ringed with a line ring, closed days struck through. Times follow the date in two groups, Morning (duotone sun) and Afternoon (duotone cloud-sun) in fern, as 48px chips three per row (four from 640px) with the same open / chosen states; taken times fade on cream and are struck through.

**The Filled Pick Rule.** In a picker the one chosen day or time is solid leaf with white text and the soft shadow; open choices are white with a line border; unavailable ones fade on cream and are disabled. Navigation keeps the mint pill; choices fill with leaf.

### Booking Summary Bar
Once a service, day and time are chosen, a white 36px bar with a line border and the float shadow rises above the bottom nav: the service art beside the day and time in bold tabular numerals and the service name in ink-soft, then a leaf underlined "Add a note" (opening a 48px input with a "Hide note" link) and the primary Send request. A send error appears inside it in rose-deep with a filled warning icon.

### Visit Cards (mother)
Upcoming visits are white 36px cards with the soft shadow: a 64px mint date tile (month over day), the service in semibold, the date in ink-soft with the time in semibold ink (kept whole by `unbroken()`), the status chip top right, an optional note, her reminder note, then a ghost Cancel or a 14px ink-soft "call to cancel" line. A new time from the health center comes first, as a 70% blush panel with an 18px bold title, an ink-soft line, a white 12px inner card (date tile, service, the new time, "You asked for" in 14px ink-soft) and Accept (primary) / Decline beside it. Past visits are one white card of line-divided rows with their status chips. A request whose date has gone by without an answer shows a 14px line with a bold rose-deep clock: "Date passed." in rose-deep semibold, then an ink-soft note that the health center will suggest another time.

**Reminder note (hers):** a 14px line with a top-aligned 16px bell. Waiting or sent, it is ink-soft and tabular ("Text reminder on … to …", "Reminder sent …"), its slot joined with no-break spaces; a text not needed shows nothing. A failed text is rose-deep and worded by its reason: only a bad number asks her to act, with an underlined semibold "Check your mobile number in your profile." link; any other failure is the health center's to fix, so it only reassures her that the visit is still on.

### Staff Appointments
Appointment cards are white 28px cards with the soft shadow: the time in semibold ink after the date in ink-soft, the mother's name as a semibold link to her record (leaf underline on hover), the service, the status chip top right, waiting-since or asked-for lines and remarks in 14px ink-soft, the reminder line, then small actions: Confirm (primary, bold check), Other time (secondary) and Cancel (ghost in rose-deep). Other time opens a 576px dialog with the current time on a 20px milk strip, the plain slot picker and a remark; Cancel opens a confirmation. Inline errors in every booking dialog are 20px blush notices with rose-deep text and a filled warning icon. The calendar is a 36px white card: month title between 40px caret links, caption weekday heads, 20px day cells (56px tall, 80px from 640px) with the date in semibold tabular numerals and either a count badge or "Closed" in rose-deep; weekends and closed days fade; today is ringed in leaf; the chosen day is solid leaf. The chosen day's cards sit beside it under an 18px bold date heading. A request whose time has passed drops Confirm and shows a 14px rose-deep semibold "Date passed" line with a bold clock, in cards and table rows alike; a Missed visit gains a small secondary "See follow-ups" (bold call icon) that opens her record's Follow-ups tab.

**Reminder line:** a 14px line led by a 16px bell, top-aligned with the first line of text (items-start, the bell nudged 2px down) so a wrapped line keeps the bell beside its first row. It is ink-soft for queued, sent, delivered, not needed and no reminder, and rose-deep when the text failed or is being tried again. The slot inside it is all no-break spaces. On a failed text, admins get a leaf underlined "See in SMS log" on its own line below, 44px tall and never wrapping, opening the log filtered to failed texts for her number.

### Visit Form (staff)
Calm and numeric, with typos stopped and unusual values only questioned.
- **Vital fields:** the 48px input with the value at 18px semibold and the unit (mmHg, kg, °C, per minute, cm) in 14px ink-soft inside the right edge (96px right padding); numeric or decimal keypad. Blood pressure is a fieldset of two inputs split by a large light ink-soft slash, with its hint below. The visible "Blood pressure" group label names the pair; the two inputs are named only by aria-label ("Top number", "Bottom number"). Known and left as is. Fundal height and fetal heart rate say "(optional)" in their labels; weight shows the last visit's weight as a hint.
- **Two kinds of message:** an impossible value is an error (rose-deep border and glow, a rose-deep line with a filled warning icon). An unusual but possible value gets a double-check note under its field: 14px medium ink with a filled leaf info icon, never rose. The first save with unusual values shows a cream 20px status notice above Save naming those fields, then scrolls to and focuses the first one; saving again keeps them. A server error is a blush 20px notice with rose-deep text and a filled warning icon.
- **Services given:** pill toggles (44px min, 32px service art, UI-size semibold); off is white with a line border (leaf border on 40% mint at hover), on is mint with a leaf border, leaf text and a bold check, pressed state announced. Each service that is on adds a 28px line-bordered entry card: art and name, a small ghost Remove, then Details (with a per-service example placeholder) and an optional Result or note, side by side from 640px.
- **Notes and save:** a textarea with an ink-soft hint, then the primary Save visit with a spinner while saving.
- **After saving:** a raised card with a large mint check circle, "Visit saved", a line naming her and her week, and a secondary Skip; below it the optional "Book next checkup" step with the suggested date.

### Visit Lists and Detail
- **Today's appointments (staff):** white 28px cards with the soft shadow: a mint 80 × 56px time tile, the mother's name as a semibold link (leaf underline on hover) over the service in 14px ink-soft, then a small primary Record visit with a bold checkup icon, or the "Recorded" link.
- **Visit rows:** one 36px white card of line-divided rows. Staff rows give the name or date in semibold, then "Wk N" in semibold ink, BP and kg in ink-soft tabular, and the services joined by middle dots. The mother's rows are whole-row links: a 56px blush week tile (Week over the number in rose-deep bold), the date in semibold, blood pressure and weight in 14px ink-soft tabular, the services, and a bold caret.
- **Vital tiles:** read-only values in 12px milk tiles inside the card: label in 14px ink-soft above an 18px bold tabular value with its unit in 14px ink-soft; a missing optional value reads "Not recorded" in ink-soft.
- **Services given (read-only):** 40px service art beside the name in semibold, the details, and the result note in 14px ink-soft.
- **Locked editing:** past a visit's day (for health workers) Edit gives way to a regular lock icon and an ink-soft line.

### Trend Chart
A small, quiet line chart across weeks of pregnancy, display only. 200px tall, drawn at the real width so labels stay 13px. Lines are 2px with round joins; dots 8px (12px when chosen) in the series colour with a 2px white ring. Gridlines are 1px line, about four, with ink-soft tick values on the left; three week ticks below and the "Week of pregnancy" caption under the chart. A two-series chart labels each line at its end; there is no legend. Hover, tap or the arrow keys move a 1px ink-soft crosshair (50%) and a white 20px readout (line border, soft shadow) with the week and date in ink-soft medium and each value in ink bold beside a short swatch; it flips to the left of the point past 60% of the width, persists after a touch tap and clears on blur. One always-present visually hidden live region announces the chosen point; the readout itself is hidden from screen readers. The 2px leaf focus outline wraps the chart. "Show as table" is a leaf underlined disclosure led by the bold caret (turning 90° when open) above a compact table with caption heads and line dividers. Fewer than two visits shows a milk note instead of a chart.

### Follow-ups (staff)
Calm working lists for missed visits, built from the same cards, tabs and chips.
- **Rows and cards:** from 1280px a 28px white table card with the soft shadow and caption heads (Mother, Missed visit, Follow-ups, then actions): the name as a semibold link to her record's Follow-ups tab, her number as a leaf underlined call link with a call icon, and her purok with a location icon; the service, the missed date and time, and on open items the "Missed N days ago" clue; the try count and last try, with See log under it. Below 1280px each item is a 28px white card in the same order with the clue on top, a line divider before the tries, and its actions at the bottom.
- **Actions:** open items get Log follow-up (primary, bold plus) and Rebook (soft, bold calendar). On cards Log follow-up takes a full-width 44px row with Call (secondary, bold phone icon) and Rebook side by side below it; in the table Log follow-up and Rebook are small and stay on one line. Closed items show their ending chip instead.
- **Log follow-up dialog:** a 512px dialog: the headline-style title, an ink-soft line naming her, the missed service and time, then method choice cards (three across), outcome cards (two across), a 224px date field limited to the days since the visit, notes with an ink-soft hint, and a "No more follow-up needed" option card that opens the reasons when checked. Ghost Cancel and primary Save follow-up close it, stacked full width on phones with the primary on top. When she was reached, the dialog turns into a centred offer (large mint check circle, title, line) with a primary Book a new appointment and a ghost Not now.
- **See log:** a 512px dialog listing the entries newest first, line-divided: date and method in semibold tabular with the outcome pill on the right, the notes, a 14px medium leaf line naming why it was closed, "Logged by" in ink-soft, then small secondary Edit and a ghost rose-deep Delete whose confirmation opens in place under a dashed line, with a destructive confirm. Entries past editing show an ink-soft italic note instead.
- **Record cards:** on her Follow-ups tab each missed visit is a 28px white card: the clue (open only), the service in semibold and the date; the ending chip when closed; a line divider, a 14px semibold ink-soft "Follow-ups" label and the entries shown in place; then Log follow-up and Rebook side by side at 44px, wrapping to full width on narrow cards.

### Missed Visit Notice
The mother's side of a missed visit, gentle rather than alarming: a blush section (at 70%) with a white 36px icon circle holding a rose-deep heart beside an 18px bold title. One missed visit makes a single sentence ("We missed you at your Prenatal Checkup on Fri, Oct 23."); several make a short title and a list, each row a small rose-deep dot, the service in semibold and the date in tabular numerals. Below sit an ink-soft body line, the health center's number as a rose-deep underlined phone link once a real number is set (never while it is a placeholder), and any extra content, such as the next-visit line and Request a visit on Today. 36px radius with 20px padding (28px from 640px) on My Appointments; 20px radius as the Today insight.

### SMS Log (admin)
A quiet record of every text, built from the same cards, chips and filters.
- **Automatic sending card:** a 28px white card with the soft shadow (20px padding, 24px from 640px): a small mint SMS icon circle beside an 18px bold title, the ink-soft intro, and the SMS phone line in 14px medium ink-soft, led by a 20px phone icon and an 8px dot (leaf online, rose-deep offline, sage with no status yet); its time is joined with no-break spaces. Send now is the primary with a bold send icon (a spinner while running), full width on phones; results arrive as toasts. When HTTPSMS refused texts for the monthly limit, a 20px blush status notice with rose-deep text and a filled warning icon sits below, its date unbroken.
- **Count tiles:** Waiting, Sent today and Failed as three 28px white tiles in one row at every width, each a link with the soft shadow and a 2px border (clear at rest, line on hover): the count in 24px extra-bold tabular (rose-deep for Failed once above zero) over the label in 14px medium ink-soft followed by a bold 14px leaf caret, which says the tile opens a list. The tile in use is mint with a leaf border and leaf label (marked as current); tapping it again shows all texts.
- **Filter fold:** search by name or number, status, type and a date range in the shared filter card, a plain GET form so filters live in the address. Types are grouped: "Visit booked" ("Naka-schedule na bisita", sent right away when staff book or rebook a visit) sits in "Answers and changes" with the other answers, moves and cancellations. On phones the four extra fields fold behind the secondary "Filters" toggle with the count in use.
- **Table and cards:** from 1280px a 28px white table card with caption semibold heads (Mother, Text, Status and an unlabelled action column): her name as a semibold link to her record's SMS log tab over "To 09…" with a phone icon; the type in medium over "Service · date · time" in 14px ink-soft tabular and Show text; the chip with its detail lines. Below 1280px each text is a 28px white card (16px padding, 20px from 640px): chip and details on top, a line divider, then her name, the type, the slot, the number and Show text.
- **Show text:** a folded summary, a leaf underlined 14px semibold "Show text" with a bold caret that turns over when open, at a 44px target height; it opens a 20px cream panel with the full message in 14px text that keeps its own line breaks (pre-wrap) and breaks long words. Every text has the same shape: "Hi, {name}!", a blank line, the message, a blank line, then "From: Brgy. Taysan Health Center". The panel keeps its dates and hyphenated words whole on screen only (see The Unbroken Time Rule). It is a plain disclosure, so it works without JavaScript.
- **Retry:** on failed texts only, for admins: a small soft (mint) button with a bold retry icon, no confirmation; full width at 44px at the foot of a card, and at the end of a table row. Results come as toasts.
- **Empty:** a centred white 28px card in ink-soft, worded for "no texts yet" or "nothing matches".

### Staff Dashboard
A glance, then the way in: every count opens the list behind it.
- **Greeting panel:** the rose gradient of the curved hero, without the curve, at 36px (24px padding, 32px from 640px) with the faint white corner ring: a large white icon circle holding a rose-deep heart beside "Hello, {name}" in the Headline style, and today's long date in ink-soft.
- **Count tiles:** the SMS count tile, five times (Today's appointments, Waiting requests, Needs follow-up, Pregnant now, Due within 30 days), as a list inside a labelled nav: 28px white, soft shadow, a 2px border clear at rest and line on hover, the leaf focus outline; the count in 24px extra-bold tabular over the label in 14px medium ink-soft with a bold 14px leaf caret glued to its last word. Waiting requests and Needs follow-up turn rose-deep above zero.
- **Due within 30 days:** one 36px white card of line-divided rows, past due first, then soonest: the name as a semibold link to her Pregnancy tab (leaf with an underline on hover) over purok and week in 14px ink-soft; on the right (below on phones) "Due {date}" in semibold tabular over the days line, ink-soft ("In 12 days", "Tomorrow", "Due today") or rose-deep semibold with a bold clock once past due. A leaf underlined "See all N" with a bold caret closes the card when there are more than shown; with none, a centred white 28px note.
- **Admin cards:** Accounts and SMS health are 36px white cards with a small mint icon circle beside an 18px bold title, then figure rows (below). SMS health adds the SMS phone line and a 20px milk usage panel: "Sent in {month}" against "{count} of {limit}" (rose-deep at the limit), an 8px mint meter with a leaf fill, the month's delivered / failed / not sent line and the plan note in 14px ink-soft. The blush monthly-limit notice appears only when the limit was hit this month. Its last rows are Waiting now and Failed texts (the alert row).
- **Figure rows:** 44px rows with a hairline between: the label on the left (medium ink; a sub-row indented 16px in regular ink-soft) and the count in bold tabular on the right. A row that opens a list is a whole-row link with a milk hover at 20px and a bold leaf caret; rows without a list keep an invisible caret so every count lines up. Report cards use the same rows without links.

### Reports
One page for counts and lists, to read, print or download.
- **Report tabs:** Summary, Pregnancies, Visits, Appointments, Services and (admins only) SMS, in the record-tab bar; the period and purok carry over between tabs.
- **Filter card:** a plain GET form in the shared 28px filter card: Period (This month, Last month, This year, Custom dates, with From and To for custom), Purok, then each tab's own selects (which pregnancies, service, status, kind of text), all 48px native fields with labels above; Show is the 48px primary and Clear a ghost link back to this month.
- **Actions:** Print and Download CSV are 44px secondary pills with bold printer and download icons; Download CSV is a plain link. Hidden on paper.
- **Summary totals:** four 28px white tiles with the soft shadow, not links, so they carry no border or caret: the number in 24px extra-bold tabular over the label in 14px medium ink-soft. Missed appointments turns rose-deep above zero.
- **Report cards:** 36px white cards (20px padding, 24px from 640px) led by a small mint icon circle and an 18px bold title, an optional 14px ink-soft note on what is counted, then figure rows. Pregnancies indents its four outcomes under "Closed in the period"; Visits adds the column chart under a line divider; Appointments lists the six statuses with Missed as the alert; Services given holds the service bars; Text messages (admins) has Failed as the alert.
- **Detail tabs:** an ink-soft count line ("12 visits"), then from 1280px one 28px white table card: caption semibold ink-soft heads that never wrap, UI-size body, line dividers, top-aligned rows. The mother cell is her name as a semibold ink link to her record (leaf underline on hover) over her purok in 14px ink-soft; a visit or service date is a medium tabular link to the visit. Below 1280px each row is a 28px white card (16px padding, 20px from 640px): an optional top block (a status chip with its detail lines, the date and time, or the service and its date), a line divider, her name, then a label / value grid with ink-soft labels. States reuse the visit status, follow-up ending and SMS status chips; an open follow-up on a missed appointment is "Still open" in rose-deep semibold over its tries in 14px ink-soft. With nothing to show, a centred white 28px note.
- **Words:** a missing value reads "Not recorded" ("Hindi naitala"); in Filipino a failed text is "Pumalya" and a pregnancy week on the dashboard is "Ika-{n} linggo"; a visit is "Walk-in" or "Appointment" ("May appointment"), each kept whole.

### Visits Chart and Service Bars
Bars for counts in a period, quiet and saying every value in writing.
- **Visits chart:** one series of chart-green columns, at most 24px wide with 4px gaps, rounded 4px at the top and square on a 1px baseline (ink-soft at 40%). The plot is 160px tall and its bars use up to 132px, so each count fits above its column. Columns are weeks, Monday to Sunday (with a 14px ink-soft note that the first and last may be part-weeks), or months for long periods; the caption is semibold ink.
- **Date labels:** at most seven under the baseline, the rest thinned out. A week reads on two lines, its start over its end ("Nov 2" over "–8", "–Dec 6" across months; a one-day part-week has one line); a month is "Jan".
- **Hover and reading:** hovering a column fades it to 80% and shows a small 20px ink readout with white text (the dates, then the count in bold tabular). Each column also carries its dates and count as screen-reader text, and "Show as table" is a leaf disclosure over a compact table of every column.
- **Service bars:** services most first, each name in UI size above a 16px chart-green bar rounded 4px at its end and scaled to the largest, with the count in 14px bold tabular beside it; a service given 0 times shows only its 0. One series, so no legend. With no services at all, a UI-size ink-soft line.

### Printed Report
Print turns the same page into a plain paper report; there is no separate print layout.
- **Page:** 12mm margins. The staff sidebar and top bar, the page title, tabs, filter card and actions hide with the print variant; the content drops its column width and padding and the ground turns white.
- **Letterhead (paper only):** the 56px seal beside the health center's name in 16px bold, its address and, once a real one is set, its contact number; then "{Tab} report" in 20px bold, the period, the filters in use joined by middle dots (the purok always), and when it was printed; an ink rule below.
- **Summary on paper:** the four totals stay four across as square blocks with a line border; the subject cards stack as square line-bordered blocks (16px padding, 24px apart); service bars become name and count rows; the column chart gives way to its table, printed as its own copy because a closed disclosure doesn't print.
- **Detail on paper:** always the table, in 10pt, its header repeated on each page, cells tightened to 6px with no outer side padding; a visit's date cell may wrap.
- **Signature lines:** after the report, two columns 48px apart in 14px: "Prepared by:" over 40px of space, an ink rule, the staff member's name in semibold and the position; "Noted by:" over a blank ink rule with "Name and position". The two labels are English in both languages. The footer is kept whole.
- **Breaks:** table rows, figure rows and the footer never break inside. A heading block (a report card's icon, title and note; the chart's caption) is marked as a print heading: unbreakable, with about 6rem reserved under it by padding that a negative margin cancels, so it always travels with its first rows.

**The Heading Travels Rule.** On paper a heading never ends a page. Mark the heading block as a print heading (unbreakable, about 6rem reserved below); Chrome ignores break-after: avoid, so never rely on it.

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
- **Do** separate impossible values (rose-deep error) from unusual ones (ink note with a filled leaf info icon, a cream notice naming the fields, kept on the second save).
- **Do** put a measured value's unit inside its field and beside every recorded value, and set values in tabular numerals.
- **Do** say every chart value twice: direct line-end labels, the readout and "Show as table"; chart green and chart rose stay in charts.
- **Do** give every focusable control the solid 2px leaf outline; where a control resets the browser outline, name the solid style in its focus-visible set.
- **Do** make the companion action beside a leaf primary on a white card soft (mint).
- **Do** keep a filter card's single row for 1280px and up; below that, two fields per row and a full-width button.
- **Do** keep every time joined to its AM or PM with a no-break space, keep a short date and time inside a labelled line whole so it breaks after the label, and join Filipino hyphenated words that must not break with a word joiner.
- **Do** let an insight tile's body fill the space under its title, clamped to three lines, with the icon at the bottom.
- **Do** number step headings only where the steps are real; a reused form that already knows the mother uses plain headings.
- **Do** run open follow-ups oldest first and lead each with its "Missed N days ago" clue; closed ones run newest first.
- **Do** let a chip's edge say how settled it is: dashed for not yet, a solid outline for sent, a fill for an outcome.
- **Do** join every space in a reminder line or SMS slot with a no-break space, and join a short leading word to its date in the dictionary.
- **Do** ask the mother to act on a failed text only when her number was the cause; otherwise reassure her the visit stands.
- **Do** give phone grids with long no-wrap children an explicit minmax(0, 1fr) column, and min-w-0 on every flex parent of a truncated line.
- **Do** turn a dashboard or report count rose-deep only above zero, and only when it needs someone; every other count stays ink.
- **Do** put the tabular class on the numeric element (a date, time, week, BP, weight or count), never on a container of mixed text.
- **Do** keep short tags whole with whitespace-nowrap (Walk-in, May appointment) and glue a trailing caret to the last word of its label.
- **Do** wrap a printable view in the report wrapper, hide the shell and controls with the print variant, and mark each heading block as a print heading so it travels with its first rows.
- **Do** give every chart a printed table; a closed disclosure doesn't print.
- **Do** write "Not recorded" ("Hindi naitala") for a missing value, and keep the signature labels "Prepared by:" and "Noted by:" in English in both languages.
- **Do** scroll a sideways tab bar's current tab into view on phones.
- **Do** give every back link a 44px minimum height with a matching −12px vertical margin, so the target grows without moving the page.
- **Do** keep the skip link first on every page and give each page's main region `id="main"`.
- **Do** open every SMS with "Hi, {name}!" and end it with "From: Brgy. Taysan Health Center"; join its dates and hyphenated words only in the on-screen preview.
- **Do** call her "nanay" in Filipino copy ("nanay na …"), and call the product a website, never an app, texts included.
- **Do** load the hero, trimester and service illustrations eagerly where they sit above the fold.

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
- **Don't** colour an unusual-but-possible vital sign in rose or blush; rose is for errors the form will not accept.
- **Don't** add a separate chart legend or let a series colour be the only way to read a value.
- **Don't** put rose on a follow-up once it is sorted; reached, rebooked and came-in states are mint, the rest cream.
- **Don't** put a white secondary pill beside the primary on a white card; it disappears into the card.
- **Don't** let a time wrap between the number and AM or PM.
- **Don't** type `\u00a0` as bare JSX text; put it in a string expression.
- **Don't** let a header's actions shrink; the brand mark wraps or truncates first.
- **Don't** rely on break-after: avoid to keep a heading with its rows; Chrome ignores it.
- **Don't** print colour, fills or shadows inside a report, or let a printed value depend on colour.
- **Don't** put a second colour in a one-series chart; columns and service bars are chart green, and rose stays an accent outside charts.
- **Don't** set the tabular class on a whole row, card or table body.
- **Don't** put a no-break space or word joiner into a stored or sent SMS; the text stays plain GSM-7.
- **Don't** write "ina" or "inang" for mother in Filipino copy.
