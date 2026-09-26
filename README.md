# Aura Health Lab

A polished, responsive appointment-planning experience for an executive wellness and longevity clinic. Patients choose a care experience and clinician, find an open time, share intake details, and receive a booking pass with a Google Calendar link.

## Run locally

This is a static web app with no package install or build step. Serve the project directory over HTTP so the ES module can load:

```sh
python -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173). You can also deploy the project directory directly to Vercel.

## Booking flow

1. **Services:** compare three visit types and clinician profiles, including credentials, focus areas, and consultation rates. The summary shows the estimated total before the patient proceeds.
2. **Schedule:** browse the current month and the next two months, select an available weekday, and choose from remaining appointment slots.
3. **Details:** enter contact and date-of-birth information, add optional goals, select email and/or SMS reminders, and consent to appointment preparation. Inline validation points to fields that need attention.
4. **Confirmation:** review a uniquely referenced booking pass, copy its reference, open a prefilled Google Calendar event, start another booking, or review saved visits.

Appointment summaries are stored in browser `localStorage` under `aura-health-lab.bookings.v1` (up to 30 recent items). Name, contact, birth-date, and health-goal inputs stay in page memory while planning the visit; they are not sent to the clinic or persisted. Availability is deterministic sample data and is generated in the browser. Practitioner profiles, clinic details, and prices are demo content. The app does not transmit patient information or create a real clinic reservation; the confirmation screen states this clearly. Connect a scheduling, privacy, and notification backend before accepting real patient information.

## Implementation

- Semantic HTML, responsive CSS, and vanilla JavaScript ES modules
- Accessible progress navigation, labels, keyboard focus states, validation feedback, and reduced-motion support
- No framework, runtime package dependencies, build step, ZIP tooling, or export-to-archive flow
- Practitioner photography is served from Unsplash; the rest of the booking flow works independently of those images

## Deployment

The project is configured as a static site for Vercel. From the project root, run `vercel --prod --yes` after authenticating the Vercel CLI.
