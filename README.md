# LUMEA — Skin Studio

A front-end prototype of an AI-assisted skin analysis + dermatologist-reviewed skincare platform.
HTML5 + CSS3 + vanilla JavaScript. No backend, no build step, no dependencies (Google Fonts only).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | App shell only — header, nav, `#view` mount point, toast/modal/curtain roots |
| `styles.css` | Design system + all component styles (21 numbered sections) |
| `app.js` | Whole application, organised into modules (see below) |
| `build.py` | Inlines CSS + JS into `dist/lumea.html` for single-file hosting |
| `.claude/launch.json` | Local preview config (`python3 -m http.server 8899`) |

Run locally:

```bash
python3 -m http.server 8899
```

then open `http://localhost:8899`.

## Demo account

`demo@lumea.co` / `demo1234` — or create your own; everything persists in `localStorage`.

## Module map in `app.js`

| Module | Responsibility | Backend swap |
| --- | --- | --- |
| `Util` | DOM + formatting helpers, inline icon set | — |
| `Store` | Persistence, session, per-user state | Replace each `Store.*` method with an API call; shape is already user-scoped |
| `Catalog` | `CONCERNS`, `PRODUCTS`, inline SVG product art | `GET /products` |
| `Engine` | `analyse()` (AI-assisted report), `buildRoutine()` (product selection) | `POST /analyze`, `POST /routine` — both are pure functions of their inputs |
| `Journey` | Stage machine + gating (`status()`, `can()`, `reason()`) | Server-authoritative stage |
| `Cart` / `Trial` | Basket maths, trial-kit bundling, 14-day tracker | `POST /orders`, `POST /trial/logs` |
| `Review` | Dermatologist turnaround — `release()` is shared by the automatic path and the clinician portal | `POST /reviews`, or a webhook when a real clinician confirms |
| `Ratings` | Per-product star rating + written review; community figures derived from the product id | `GET/POST /products/:id/reviews` |
| `Chat` | Dermatologist reply simulation (keyword-matched) | Real messaging endpoint / websocket |
| `Views.plan` | The dermatologist's report: letterhead, assessment, prescribed routine with when-to-use per step | `GET /reports/:id` |
| `UI` | Toasts, modals, reveal-on-scroll, curtain transitions, skeletons | — |
| `Views` | One function per screen, each returning `{ html, after() }` | — |
| `Router` | Hash routing with auth + stage guards | — |

`window.LUMEA` exposes the modules for inspection; `LUMEA.reset()` wipes the demo data.

## The state machine

The whole app is gated on one journey, and the UI derives from it rather than from
navigation history:

```
Sign up → Photo → Concerns → AI analysis → Send to dermatologist
  → Request approved → Report + recommended products returned
  → Choose sample kit or full routine → Pay (KNET / card / cash) → Receipt
  → 14-day trial → Check-ins + chat → Rate products, clinician, service
  → Monthly subscription
```

- **My Routine** is locked until `review.status === 'confirmed'`.
- **The trial** is locked until a routine exists.
- **Subscription** opens from day 7 of the trial (or after 3 check-ins) — or immediately if the routine was bought full size instead of trialled.
- Locked nav items say *why* they're locked instead of failing silently.
- Receipts live at `#/order?id=…`, and every purchase is listed under Account → Order history &amp; receipts.
- Members can rate products, their dermatologist and the overall service (Account → Ratings &amp; reviews).
- Updating your concerns produces a fresh report and returns you to pending review;
  the previously approved routine stays saved to the account meanwhile.

Once a report is sent for review, `Review.schedule()` turns it around in about seven
seconds and releases the routine on its own — the pending screen updates itself, and the
timer resumes correctly after a reload. Asking the patient for more information cancels it.

The journey is patient-side only — there is no clinician screen. Sending the report shows
**Request approved**, and `Review.release()` returns the dermatologist's report and the
recommended products on its own.

Trial days don't wait for real time — the tracker has an explicit *Advance 1 day* /
*Jump to day N* control, labelled as a prototype control.

## What persists

Account, session, profile, photo, concerns and priorities, notes, AI report, review status
and clinician notes, routine (with version), basket, saved-for-later, orders, trial day and
check-in logs, subscription state, chat transcript, progress photos, skin ratings, product
reviews and star ratings, settings.
Refreshing or signing out and back in resumes exactly where you left off.

Photographs are downscaled to 760px JPEG in-browser before storage, and never leave the
browser. Account → Privacy & data shows everything held and deletes it.

## Medical framing

Deliberate throughout: the analysis is labelled *AI-assisted*, never diagnostic; AI output
and dermatologist-approved recommendations are visually distinct; the report carries a
prominent disclaimer; chat carries an urgent-care notice; progress bars are labelled
*self-reported* rather than presented as clinical measurement.

## Currency

Kuwaiti dinar, formatted to 3 decimals (`KD 14.250`). Change `CUR` and `money()` at the top
of `app.js` to switch.
