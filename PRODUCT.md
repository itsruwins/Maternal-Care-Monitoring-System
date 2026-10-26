# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Health workers** (barangay health workers, midwives, other authorized personnel) at the Barangay Taysan Health Center. The main users. They register mothers, review appointment requests, record prenatal visits and vital signs, and follow up on missed appointments. They use desktops/laptops at the center, and phones and tablets, including during home visits.
- **Mothers** (pregnant women in Barangay Taysan). They sign up themselves (or are registered by staff), view their pregnancy and visit records, request appointments, and receive SMS reminders. They use typical modern smartphones.
- **Administrator.** Manages user accounts and activity types. The first admin is also a health worker.

## Product Purpose

Taysan MaternaCare (full title: *Maternal Care Monitoring System with SMS Reminder for Barangay Taysan, Legazpi City*) replaces the health center's paper logbooks for maternal care. It organizes mothers' records and pregnancy history, schedules prenatal checkups and other maternal-care activities, sends SMS reminders, and flags missed appointments for follow-up. Success: fewer missed checkups, records that are quick to find and update, and timely follow-up.

This is a capstone/thesis system. It will be evaluated for usability, reliability and maintainability.

## Positioning

Built for one barangay health center and its existing manual process: the same steps (registration → checkup → next appointment → follow-up on missed visits), now digital, plus SMS reminders that reach mothers.

## Operating Context

- One health center (Barangay Taysan). Addresses are by purok/sitio; the barangay is always Taysan.
- Workflows: registration → pregnancy record (gravida, para, LMP, EDD) → appointment (requested → confirmed/rescheduled → completed/missed/cancelled) → SMS reminder → prenatal visit (vitals + services given) → missed appointment → staff follow-up (call, SMS, home visit) → reports.
- Activity types: Prenatal Checkup, Tetanus Toxoid Vaccination, Iron/Folic Acid Supplementation, Laboratory Test, Health Education Session.
- Login is by username and password. Email is optional and only used for password recovery; a health worker resets passwords for mothers without email.

## Capabilities and Constraints

- Roles: ADMIN, HEALTH_WORKER, MOTHER. Access restricted to authorized users.
- Out of scope: diagnosis, prescriptions, treatment, delivery management, newborn care, predicting complications. The system is a monitoring and record tool, not medical advice.
- Languages: English and Filipino (UI and SMS).
- Stack: Next.js 16 + Supabase, hosted on Vercel. SMS via HTTPSMS.
- Undecided: health center address, clinic days and hours, contact number.

## Brand Commitments

- Name: **Taysan MaternaCare** (short), with the full title above.
- Logo: the official Barangay 56 Taysan seal (`Files/Logo.jpg`). Shown small, on a neutral background, with a text wordmark.
- Palette chosen by the client: `#769382` green, `#E8DDC9` beige, `#C0C3B9` sage, `#F3EFE3` cream.

## Evidence on Hand

- ERD and system notes (`Files/Maternal Care Monitoring System – ERD.pdf`), project overview (`Files/Maternal Care Monitoring System.docx`), seal, color scheme image.
- No photos of the health center, no testimonials and no usage statistics. These must not be invented.

## Product Principles

1. **The health worker's time comes first.** Common tasks (find a mother, confirm a request, record a visit) take the fewest steps.
2. **Nothing gets missed.** Upcoming, overdue and missed items are always visible and actionable.
3. **Plain and bilingual.** Simple words in English and Filipino; no medical jargon shown to mothers.
4. **Records, not diagnosis.** Show data clearly; never interpret it medically.
5. **Private by default.** Mothers see only their own records; staff see only what their role needs.

## Accessibility & Inclusion

- WCAG 2.1 AA contrast and keyboard access.
- Large tap targets and readable text sizes for mothers on phones.
- Every screen works in both English and Filipino without layout breaks.
