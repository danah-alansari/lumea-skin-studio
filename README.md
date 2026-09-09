# LUMEA — Skin Studio

A front-end prototype of an AI-assisted skin analysis + dermatologist-reviewed skincare platform.
HTML5 + CSS3 + vanilla JavaScript, backed by **Supabase** (Postgres + Auth + Storage).
No build step. One runtime dependency: `@supabase/supabase-js` (pinned, from jsdelivr).

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

`demo@lumea.co` / `demo1234` — a real, pre-confirmed Supabase account, so anything you do is
saved server-side and waiting on any device. Or create your own: sign-up sends a confirmation
email, and the app shows a *Check your email* screen until you click the link.

## Backend

| Piece | Where |
| --- | --- |
| Postgres | Supabase project `lumea-skin-studio` (`jwfxasnjbyvodtfuymic`), eu-central-1 |
| Identity | Supabase Auth — passwords never touch application tables |
| Photographs | Private `skin-photos` bucket, path `{user_id}/{uuid}.jpg`, served as signed URLs |
| Access control | RLS on all 33 tables; a member can only read and write their own rows |

Two `SECURITY DEFINER` functions are the only sanctioned write paths for clinician-owned data,
because RLS deliberately forbids a member from authoring their own routine:

- `release_review(analysis, items, notes)` — confirms the review and writes routine + items
- `set_routine_items(routine, items)` — replaces the steps of a routine you own

Both verify `auth.uid()` owns the row before doing anything.

## Module map in `app.js`

| Module | Responsibility | Backend swap |
| --- | --- | --- |
| `Util` | DOM + formatting helpers, inline icon set | — |
| `Cloud` | Supabase client, auth, `hydrate()` (server → state) and `push()` (state → server, debounced) | This *is* the API layer |
| `Store` | In-memory state + localStorage cache; every `commit()` queues a cloud push | — |
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

Everything, in Postgres: profile, address, concerns and priorities, photographs, the AI
report with its seven indicators and three focus areas, the review decision and clinician
note, the versioned routine and its steps, basket, orders and receipts, trial and check-in
logs, subscription, chat transcript, product/clinician/service reviews, skin ratings,
settings and the activity feed.

Rendering stays synchronous: `Cloud.hydrate()` loads the account into the same state shape
the views already expect, then `Cloud.push()` writes changes back (debounced, idempotent,
per-domain, so one failure never blocks the rest). localStorage is only a paint cache — the
server is the authority, and a stale local session is never honoured.

Photographs are downscaled to 760px JPEG in-browser, uploaded to a private bucket, and
displayed through short-lived signed URLs.

### Still to configure

- Supabase → Authentication → URL Configuration: set **Site URL** to the deployed origin,
  or confirmation links in sign-up emails will point at `localhost:3000`.
- Supabase → Authentication: **leaked password protection** is off (flagged by the linter).

## Medical framing

Deliberate throughout: the analysis is labelled *AI-assisted*, never diagnostic; AI output
and dermatologist-approved recommendations are visually distinct; the report carries a
prominent disclaimer; chat carries an urgent-care notice; progress bars are labelled
*self-reported* rather than presented as clinical measurement.

## Currency

Kuwaiti dinar, formatted to 3 decimals (`KD 14.250`). Change `CUR` and `money()` at the top
of `app.js` to switch.
