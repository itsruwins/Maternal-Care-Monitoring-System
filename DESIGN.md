---
name: Taysan MaternaCare
description: The health center's prenatal appointment card, on her phone.
colors:
  press: "#3e584c"
  press-deep: "#2f473c"
  sage: "#769382"
  stamp: "#4d6b5c"
  brick: "#9a4a36"
  ink: "#1f2d27"
  ink-label: "#46604f"
  folder: "#e8ddc9"
  card-stock: "#f3efe3"
  paper: "#fbf9f3"
  rule: "#c0c3b9"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7.2vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 82"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 82"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    fontVariation: "\"wdth\" 100"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
    fontVariation: "\"wdth\" 75"
  hand:
    fontFamily: "Kalam, ui-serif, cursive"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.15
    fontFeature: "\"tnum\", \"lnum\""
rounded:
  sm: "3px"
  md: "5px"
  lg: "8px"
spacing:
  gutter: "16px"
  gutter-wide: "24px"
  card-inset: "24px"
  card-inset-wide: "40px"
  card-foot: "48px"
  tap: "44px"
  row: "60px"
  row-wide: "72px"
components:
  button-primary:
    backgroundColor: "{colors.press}"
    textColor: "{colors.card-stock}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.press-deep}"
    textColor: "{colors.card-stock}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.card-stock}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
  button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.brick}"
    rounded: "{rounded.md}"
    height: "44px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "0"
    padding: "0 12px"
    height: "44px"
  field-label:
    textColor: "{colors.ink-label}"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-inset}"
  card-tab:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.ink-label}"
    typography: "{typography.label}"
    padding: "10px 16px 8px"
  stamp-done:
    textColor: "{colors.stamp}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  stamp-upcoming:
    textColor: "{colors.press}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  stamp-missed:
    textColor: "{colors.brick}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  language-switch-active:
    backgroundColor: "{colors.press}"
    textColor: "{colors.card-stock}"
    typography: "{typography.label}"
    height: "32px"
---

# Design System: Taysan MaternaCare

## Overview

**Creative North Star: "The Balik Card"**

Every screen is the Barangay Taysan Health Center's prenatal appointment card, held in her hand. A beige folder is the ground; cream card stock sits on it with a tabbed head, a punched hole and a faint paper grain. Printed text is the clinic's voice: condensed green-black capitals for labels, extra-bold condensed headings. Her own values are written in a neat ballpoint hand. Visits are marked with rubber stamps that have a double rule, a slight tilt and uneven ink. Earlier cards sit beneath later ones as she scrolls.

The world is light only. Mothers use it in daylight at home and at the health center, mostly on modern phones, so tap targets are 44px by default and the card turns portrait on narrow screens. Staff screens in later phases use the same card world on desktop, tablet and phone. It must never feel corporate or techy, cute, cold and clinical, or bureaucratic. It is the paper card she already knows, made legible.

Density is calm. Rows on a card are tall and evenly ruled, each holds one fact, and every visit state (done, upcoming, waiting, missed) stays visible at once.

**Key Characteristics:**
- Beige folder ground, cream card stock, paper-white writable fields.
- Two voices: printed Archivo (condensed via its width axis) and handwritten Kalam.
- Rubber stamps for visit state, with a double rule, a tilt and uneven ink.
- Tabbed cards that overlap as they stack, with soft resting shadows.
- Hairline sage-gray rules, dashed internal dividers, perforated tear lines.
- Tabular lining numerals on every date and week.

## Colors

The client's four colors (green, beige, sage-gray, cream) set the world. Darker inks derived from the same green carry every piece of text.

### Primary
- **Press Green** (#3e584c): fills primary buttons and the active language toggle, with cream text at 6.8:1. Also the ink for "upcoming" stamps, focus outlines and the caret. **Press Green Deep** (#2f473c) is its hover state only.

### Secondary
- **Client Sage** (#769382): the client's own green. At 2.9:1 on cream it is too light for text, so it is used for decoration only: completed stepper segments, the focus ring tint, text selection (45% mix) and fills.
- **Stamp Ink** (#4d6b5c): the "done" stamp and check icons. It is a step lighter than Label Ink, so completed visits read as quieter than upcoming ones, yet it still reaches 5.1:1 on cream and 5.6:1 on paper, passing AA at the 0.82rem bold stamp size. It is a stamp ink, not a body or label ink.

### Tertiary
- **Muted Brick** (#9a4a36): the only warm color, and the only alarm. Use it for missed visits, form errors, alert panels (6% fill, 50% border) and the urgent danger-signs list. Nothing decorative is ever brick.

### Neutral
- **Folder Beige** (#e8ddc9): the page ground and browser theme color. At 45–60% it also tints the card foot, dialog head and stepper strip.
- **Card Stock Cream** (#f3efe3): every card, tab, dialog and toast, with a 5% fractal-noise grain.
- **Writing Paper** (#fbf9f3): writable input fields, and at 50–70% the working-rows panel of a card.
- **Ink** (#1f2d27): body text and written values, 12.5:1 on cream. Running prose uses it at 80–85% opacity.
- **Label Ink** (#46604f): printed labels, hints, secondary text and input base lines. 6.0:1 on cream, 5.1:1 on beige.
- **Rule Sage-Gray** (#c0c3b9): the client's sage-gray. Used for hairline card borders, ruled rows, dashed dividers and perforation dots. It is decorative and never carries meaning alone.

### Named Rules
**The Ink-Not-Paint Rule.** The client's light green (#769382) and sage-gray (#c0c3b9) never carry text. Text is Ink, Label Ink, Press Green, Stamp Ink (on stamps) or Brick (for danger), so all text on cream reaches at least 5:1.

**The Brick Means Danger Rule.** Brick is used for missed, error and urgent danger signs, and nothing else. If a screen shows brick, something needs action.

**The Full-Ink Rule.** The fact she needs most is the one value written in full Ink at the largest hand size (the due date until a Balik date exists, then the next Balik date). Other written values sit in Label Ink.

## Typography

**Display Font:** Archivo, variable with a `wdth` axis (fallback ui-sans-serif, system-ui)
**Body Font:** Archivo at normal width (`wdth` 100)
**Hand Font:** Kalam 400/700 (fallback ui-serif, cursive)

**Character:** Archivo is the card's printing. Its width axis turns one family into three printed voices: condensed extra-bold headings, condensed small capitals for labels, and normal-width body text. Kalam is the midwife's ballpoint. It writes only values, never instructions.

### Hierarchy
- **Display** (800, `wdth` 82, clamp(2.5rem, 7.2vw, 4.75rem), line-height 0.95, max 12ch): the hero card's printed header only. Word spacing is opened slightly (0.12em) to balance the condensed face.
- **Headline** (800, `wdth` 82, clamp(2rem, 4.4vw, 3rem), line-height 1): section card titles, and account card titles at clamp(2rem, 5.5vw, 2.75rem).
- **Title** (700, 1.125rem, line-height 1.375): step and list headings inside a card. Dialog titles use 1.25rem bold.
- **Body** (400, 1rem–1.075rem, line-height 1.625, 38–46ch): leads and explanations. Hints and notes use 0.875rem in Label Ink.
- **Label** (600, `wdth` 75, uppercase, 0.06em tracking, 0.66–0.8rem, Label Ink): field labels, card tabs, row labels, the location line. Stamps reuse this voice at 700 with 0.1em tracking.
- **Hand** (Kalam 400, 1.125rem–1.65rem, line-height 1.15, tabular): her values (dates, weeks, center details) and step numerals (2.25rem). The full-ink fact is set bold at 1.65rem.

### Named Rules
**The Printed-vs-Written Rule.** The clinic speaks in Archivo and her values are written in Kalam. Never set an instruction, a label or a button in the hand face.

**The Tabular Date Rule.** Every date, week count and step number uses tabular lining numerals so columns of visits line up.

**The No-Kicker Rule.** No small label sits above a heading. The tab on a card is the only printed label above the title, and it must say something the heading does not.

## Layout

Mobile-first. Content sits in one centered column with a maximum width of 72rem (`max-w-6xl`), with 16px gutters on phones and 24px from 640px up. Account pages narrow to 28rem, or 48rem for the multi-step sign-up.

Inside a card, the inset is 24px on phones, 40px from 640px and 48px on the hero at 1024px. Cards keep 48–56px of empty card stock at the bottom so the next stacked card only ever overlaps blank paper.

Working rows are ruled with hairline Rule borders at a steady rhythm: at least 60px on phones, 72px from 640px, and 56–68px on reference lists. The label sits on the left and the written value is right-aligned. Divisions inside a card are dashed. Divisions between a card's parts (header to rows, rows to foot) are solid.

Responsive shifts are structural, not just smaller. The hero card is portrait on phones (printed header above, rows below) and landscape from 1024px (header panel left, rows right, about 1.08 : 1). Step grids go from one column to two at 640px and four at 1024px. Tear lines run across on phones and down the side on wide screens. Card tabs swap to shorter text under 420px.

**The One Ruled Grid Rule.** Rows on a card share one ruled rhythm and one alignment (label left, value right). New rows join that grid rather than starting a new one.

## Elevation & Depth

Depth is physical: paper resting on paper. Cards cast soft, offset, blurred shadows tinted with Ink, never pure black. No shadow is hard-edged, colored or glowing. The dialog overlay dims with Ink at 35% and does not blur.

### Shadow Vocabulary
- **Resting card** (`0 1px 1px rgb(31 45 39 / 0.06), 0 6px 18px -6px rgb(31 45 39 / 0.18)`): small objects on the folder, such as the seal disc, secondary buttons and toasts.
- **Lifted card** (`0 2px 2px rgb(31 45 39 / 0.06), 0 18px 40px -12px rgb(31 45 39 / 0.28)`): a full card on the folder, such as the hero, account cards, dialogs and the first card in a stack.
- **Stacked card** (`0 -10px 24px -16px rgb(31 45 39 / 0.35), 0 2px 2px …, 0 18px 40px -12px rgb(31 45 39 / 0.24)`): a card laid over the one before it. It casts shadow upward too, and it overlaps by 40px (48px from 640px).
- **Punched hole** (`inset 0 1px 2px rgb(31 45 39 / 0.35)` on a folder-colored disc): the hole in the card, a cut-out rather than a raised object.

**The Paper-On-Paper Rule.** Only paper objects cast shadows: cards, tabs, the seal disc and toasts. Rows, stamps and text never do.

## Shapes

Corners are small and cut, like card stock. Buttons use a gentle 5px radius, cards and dialogs 8px, and stamps 3px. Writable fields are square-cornered with a 2px base line, like a printed blank. A card's tab has rounded top corners and joins the card body, which drops its top-left radius under the tab. Only the seal disc, the punched hole and small dots are fully round. Card borders are 1px Rule hairlines. Blanks waiting for a value are a short 1px Label Ink line, and a slot not yet stamped is a dashed Rule rectangle. Motion follows the card's physics: values are written left to right with a 650ms clip reveal, stamps thump down from 1.35× scale over 320ms (both on an expo ease-out), and buttons press down 1px. With reduced motion, every animation resolves straight to its final state.

## Components

### Buttons
Printed-ink rectangles, firm and plain.
- **Shape:** gently curved (5px), with a 2px border matching the fill. The default height is 44px, small is 36px and large is 48px. Labels are 0.95rem semibold.
- **Primary:** Press Green fill, cream text, a 1px ink edge below (`0 1px 0 rgb(31 45 39 / 0.25)`). One per card, in the card foot.
- **Hover / Focus / Active:** hover deepens the fill to Press Green Deep. Focus is a 2px Press Green outline offset 2px. Active presses down 1px. Transitions run 150ms on the expo ease-out. Disabled buttons drop to 55% opacity.
- **Outline:** a Label Ink border with Ink text that fills with card stock on hover. Used for the secondary action beside a primary.
- **Ghost:** no border or fill, with a 6% Ink wash on hover. Used for header Log in and the dialog close.
- **Destructive:** a brick border and brick text on a transparent fill, with an 8% brick wash on hover.
- **Link:** Press Green text with a 1px underline offset 4px. On hover the underline thickens to 2px.

### Cards / Containers (Folder Card)
- **Corner Style:** 8px, square under the tab.
- **Background:** card stock with grain. The working-rows panel uses paper at 50%, and the card foot uses folder at 45%.
- **Shadow Strategy:** Lifted when alone, Stacked when laid over a previous card (see Elevation & Depth).
- **Border:** a 1px Rule hairline.
- **Tab:** a card-stock tab offset 20px (32px from 640px) from the left edge, in the label voice at 0.66–0.7rem. It names the card's kind or adds context the title lacks, and never repeats the heading.
- **Internal Padding:** 24px / 40px / 48px (see Layout), with 48–56px of empty space at the bottom.

### Inputs / Fields
- **Style:** a paper fill with 1px Rule sides and a 2px Label Ink base line (the visible boundary, 6:1). Square corners, 44px tall, 1rem Ink text, tabular numerals. Placeholders use Label Ink at 75%.
- **Focus:** the base line turns Press Green and thickens through a 2px Press Green underline shadow. There is no ring around the field.
- **Error / Disabled:** errors turn the base line and underline brick, with a 0.875rem brick message below. Hints in Label Ink appear only when there is no error. Disabled fields drop to 55% opacity.
- **Label:** printed label voice at 0.8rem, above the field. An optional status sits right-aligned on the same baseline.

### Stamps (signature)
A rubber stamp: label voice at 700 with 0.1em tracking, a 3px double-rule border, a 3px radius, an uneven-ink mask and a tilt between −3° and −8°.
- **Upcoming:** Press Green, used for the SMS reminder stamp and "to be decided" placeholders.
- **Done:** Stamp Ink, the quietest tone (5.1:1 on cream at 0.82rem bold).
- **Missed:** Brick.
- **Waiting:** an empty dashed Rule rectangle where the stamp will land.
- Only a stamp that has just been earned animates (the stamp thump).

### Navigation (Folder Bar)
A slim bar above the cards, on the folder with no background of its own. On the left, the seal sits in a 40px cream disc with a resting shadow beside the bold wordmark (the location line in label voice appears from 420px). On the right are the EN/FIL toggle, a ghost Log in, and a small primary Sign up from 640px. The language toggle is a bordered card-stock pill whose active segment fills Press Green with cream label text.

### Dialog
A card laid over the folder: card stock with grain, an 8px radius, a Rule border and the Lifted shadow, max 28rem wide. The head strip is folder at 60% over a Rule bottom border. The foot is separated by a Rule top border, with its actions stacking reversed on phones. It enters with a fade and a 12px rise over 300ms.

### Stepper (multi-step sign-up)
The card's tab row. From 640px, each step is a label-voice tab with a 3px bottom bar: Press Green for the current step, Sage for completed steps (with a Stamp Ink check), and transparent for later steps. On phones it collapses into 6px rounded segments in the same three colors, under a "Step n of N · name" label line.

## Do's and Don'ts

### Do:
- **Do** set every text color from Ink (#1f2d27), Label Ink (#46604f) or Press Green (#3e584c). Keep cream text on Press Green fills only.
- **Do** keep 44px tap targets as the default for anything a mother touches.
- **Do** write her values in Kalam with tabular numerals, and print everything else in Archivo.
- **Do** show every visit state at once: done stamps, an upcoming stamp, an empty dashed slot, and a brick stamp only when a visit is missed.
- **Do** stack section cards with the Stacked shadow and 40–48px overlap, and leave empty card stock at each card's foot.
- **Do** keep the hand-written due date in full Ink until a midwife sets a Balik date. An estimate is never shown as a Balik date.
- **Do** take all text from the EN/FIL dictionaries, and test layouts with the longer Filipino strings (tabs have short variants under 420px).
- **Do** let reduced motion show the final written and stamped state immediately.

### Don't:
- **Don't** set text in the client green (#769382) or sage-gray (#c0c3b9). They are decoration, fills and rules only.
- **Don't** lighten stamp ink toward the client green to make a stamp look fainter. Every stamp's text must reach 4.5:1 at 0.82rem bold.
- **Don't** use brick for anything that isn't missed, an error or an urgent danger sign.
- **Don't** put a kicker or eyebrow label above a heading, or a card tab that restates its heading.
- **Don't** add a dark mode. The card is a daylight object.
- **Don't** use hard offset shadows, glows or blurred glass overlays. Depth is paper resting on paper.
- **Don't** print day counts or timings on stamps that the health center hasn't confirmed (the reminder stamp reads "SMS reminder").
- **Don't** fall back to the headline + phone mockup + feature cards layout. New surfaces are cards in the folder.
