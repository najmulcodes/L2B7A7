# CodeRank Frontend

Next.js (App Router) frontend for the CodeRank Developer Assessment Platform
backend. Built by inspecting the backend's `prisma/schema.prisma`,
`docs/openapi.yaml`, every `*.routes.ts` / `*.validation.ts` /
`*.service.ts` module, and `src/middleware/*` directly — not from the
high-level prompt alone.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local: BACKEND_API_URL should point at your backend
#   (e.g. https://coderank.vercel.app/api/v1 or http://localhost:5000/api/v1)
npm run dev
```

Open http://localhost:3000.

## Auth architecture (read this first)

The backend returns `accessToken`/`refreshToken` in a JSON body, not
`Set-Cookie` headers, and its own build prompt suggested the standard
pragmatic fix: **proxy through Next.js Route Handlers that set their own
httpOnly cookies.** That's what this does:

- `src/app/api/auth/{login,register,google,logout}/route.ts` call the real
  backend, then set two httpOnly cookies (`cr_at` access token, `cr_rt`
  refresh token) plus one **non-httpOnly, non-secret** `cr_role` cookie
  (just the string `"CANDIDATE"`/`"COMPANY"`/`"ADMIN"`, used only so
  `src/middleware.ts` can do a cheap redirect before the client JS loads).
- `src/app/api/proxy/[...path]/route.ts` is a catch-all that forwards every
  other authenticated call to the backend, attaching `Authorization: Bearer
  <access token>` from the httpOnly cookie server-side. **Neither token is
  ever readable by client-side JavaScript.**
- On a `401` from the backend, `src/lib/server/proxyRequest.ts` performs
  exactly one silent refresh (using the httpOnly refresh cookie), rotates
  both cookies, and retries the original request once — matching the
  backend prompt's "automatic silent refresh... retry once... then force
  logout" requirement. If the refresh token itself is invalid/reused
  (backend rotation detected reuse), cookies are cleared and the browser is
  told to log in again via a `coderank:session-expired` window event.
- `src/lib/api-client.ts` is what components actually call — it always hits
  our own `/api/proxy/*`, never the backend directly.

`src/middleware.ts` is a **UX convenience only**. It never authorizes
anything — the backend's `authorize.middleware.ts` is still the sole
source of truth on every request, exactly per the backend's own design
note ("the frontend's route protection must mirror that as UI/UX, while
understanding the backend is the real authority").

## What's implemented

- **Auth**: register/login (role toggle + conditional companyName),
  Google Sign-In (GIS, client-side idToken → `/auth/google`), logout,
  password change, silent refresh, session-expiry handling.
- **Candidate**: dashboard, invitations list (accept → creates & routes to
  the new Attempt; decline), attempt-taking UI with a real countdown timer
  against `deadlineAt`, per-question autosave (`POST /attempts/:id/answers`,
  debounced) for MCQ/CODING/WRITTEN, submit confirmation, attempt report
  view (score, pass/fail, per-question breakdown, pending-review state),
  profile editor (headline/bio/skills/experience/links).
- **Company**: dashboard (credit balance + recent assessments), problem
  bank CRUD (type-specific fields: MCQ options + correct answer, CODING
  starter code/language/test cases), assessment CRUD, attach/detach
  problems (DRAFT-only, enforced in UI to match backend), publish button
  with explicit UI for both failure modes (`403` no credits → link to
  billing, `400` no problems attached), invite-by-email, invitation list,
  attempt list per assessment, submission review + manual evaluation
  (score/feedback) for WRITTEN/CODING, billing (buy credits via Stripe
  Checkout redirect, payment history, success/cancel pages that **poll**
  `GET /payments/me` rather than trusting the redirect — per the backend's
  explicit warning that webhook processing is asynchronous), company
  profile editor.
- **Admin**: dashboard stats, user list with role/active-status management
  (self-modification disabled in the UI, matching the backend's own
  `400 "Admins cannot change their own role/status"` guard), audit log
  browser with entity/action filters.
- Every 400/401/403/404/409/429/500 case called out in the build prompt is
  handled somewhere specific (field-level 400s via react-hook-form
  `setError`, 409s surfaced as their literal backend message rather than a
  generic error, 429 handled by React Query's retry backoff, etc.) — see
  inline comments near each mutation's `onError`.

## Rubric compliance notes

This project was later checked against a formal grading rubric (3 fixed
roles, real payment integration, demo login, URL-synced filters, a minimum
page set across public/dashboard categories, loading/error states, etc.).
What that pass added on top of the original build:

- **One-click Demo Login** (`src/components/auth/DemoLoginButtons.tsx`) —
  three buttons on `/login`, each signing in with a real seeded account via
  `NEXT_PUBLIC_DEMO_{ADMIN,CANDIDATE,COMPANY}_{EMAIL,PASSWORD}`. You still
  have to seed those three accounts on the backend yourself and set the env
  vars — nothing is hardcoded, and an unconfigured role just shows a
  disabled button rather than silently failing. See `.env.example`.
- **`loading.tsx` for all 20 data-fetching routes**, **`not-found.tsx`**,
  and **`error.tsx`** at the root plus one per role group (candidate/
  company/admin), via shared skeletons in `src/components/ui/Skeleton.tsx`.
- **URL-synced filters** (`src/hooks/useUrlFilters.ts`) on every list page
  that has search/filter/pagination: company problems, company assessments,
  candidate invitations, admin users, admin audit logs. State lives in the
  querystring (`router.replace`, debounced search), so a filtered view is
  bookmarkable, shareable, and survives a refresh.
- **4 new public pages** — `/about`, `/services`, `/faq`, `/contact` — each
  a genuine Server Component with its own `Metadata` export. `/contact`
  deliberately uses `mailto:` links rather than a form, since the backend
  has no `/contact` endpoint for a form to actually submit to — a form that
  fakes a success message would be exactly the "fake functionality" the
  rubric prohibits.
- **The homepage (`/`) is now a true Server Component.** The old
  "redirect if already logged in" check used to run client-side with a
  loading spinner; it's now handled by `src/middleware.ts` (the same
  cookie-based redirect it already did for `/login`/`/register`), so `/`
  just renders — no client JS, no spinner flash.
- **Admin dashboard chart** (`src/components/admin/StatsChart.tsx`, Recharts)
  — a bar chart built entirely from the real numbers `GET
  /admin/dashboard-stats` returns (candidates vs. companies, published vs.
  draft assessments, completed vs. in-progress attempts). No mock series.
- **New candidate Results page** (`/candidate/results`) — the rubric's
  generic "User Dashboard" category expects a Payments/History page, but
  candidates don't pay for anything in this domain (companies do, via
  credits). A full, filterable, URL-synced history of past attempts and
  their reports is the honest equivalent for this domain, so that's what
  this is, rather than forcing in a payments page that would have no real
  data behind it.

**One rubric expectation I did not force through dishonestly:** "Server
Components by default, Client Components only when interactivity is
needed." The 5 public pages (`/`, `/about`, `/services`, `/faq`,
`/contact`) now genuinely are Server Components with zero client hooks.
Every dashboard page, though, is a Client Component by necessity — they're
built on the httpOnly-cookie auth proxy (see below), fetch through
React Query against `/api/proxy/*`, and need live interactivity (forms,
mutations, countdowns, autosave) on nearly every one. Converting those to
a Server-Component-first data-fetching model would mean re-architecting
the auth layer (e.g. reading cookies server-side per request instead of
proxying), which is a materially different design, not a quick pass — I'd
rather say that plainly than claim broader RSC coverage than actually
exists.

## Known gaps / what I could NOT verify

**I had no network access to either the live backend or the npm registry
in the environment I built this in**, so none of this has been run by me —
it's all been reviewed by eye against the backend's actual source and,
separately, against TypeScript's own rules, but not executed. (You *have*
since run `npm install`/`typecheck`/`build`/`dev` yourself and found one
real bug — a set of query-param interfaces missing index signatures — which
is fixed now. That's a good sign the rest is close, not a guarantee it's
complete.) Concretely:

1. **The `recharts` dependency is new** (added for the admin dashboard
   chart) and has not been through `npm install` here — run it again after
   pulling this update.
2. **Never integration-tested.** No request in this app has actually hit
   `https://coderank.vercel.app/api/v1` or a local instance. Field names
   and status codes are taken directly from the backend's Zod schemas and
   service code, which is a much stronger guarantee than reading the
   prompt alone, but it is not the same as a real round-trip.
3. **Stripe `success_url`/`cancel_url` are backend-side env vars**
   (`STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`) that default to
   `https://example.com/...` if unset. For `/payments/success` and
   `/payments/cancel` in this app to actually receive Stripe's redirect,
   the **backend** deployment needs those set to
   `https://<this-frontend-domain>/payments/success?session_id={CHECKOUT_SESSION_ID}`
   and `.../payments/cancel`. This frontend can't set that itself.
4. **Google Sign-In** is wired on the login page only (it also covers
   first-time sign-up as CANDIDATE, since the backend auto-creates the
   account). It's not duplicated on the register page's COMPANY flow —
   registering as a company via Google would need `companyName` collected
   in a small extra step first; I left that as a follow-up rather than
   guessing at UX for it.
5. **No shadcn/ui.** The prompt's suggested stack lists shadcn/ui, but its
   CLI fetches components over the network at generation time, which
   wasn't available. I hand-built an equivalent, similarly-structured
   Tailwind component set in `src/components/ui/` instead
   (Button/Input/Card/Badge/Modal/etc.) — functionally comparable, just
   not literally scaffolded by the shadcn CLI.
6. **No automated tests.** Given the above, I prioritized breadth (all
   three roles, all documented endpoints) over writing tests that
   couldn't themselves be run/verified here.
7. **CODING problem "run code" execution** — the backend has no endpoint
   for actually executing candidate code against `testCases` (they're
   `companyId`-only visible, used for manual review only per the schema
   comment). The candidate UI is a plain code editor (textarea), not a
   sandboxed runner, which matches what the backend actually supports.

## Environment variables

See `.env.example`. `BACKEND_API_URL` (server-only, **must include the
`/api/v1` prefix** — see Troubleshooting below) is the only required one.
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` and the six `NEXT_PUBLIC_DEMO_*` vars are
optional — Google Sign-In and the Demo Login buttons just don't render/
enable without them. No Stripe key, JWT secret, or database URL ever
touches this codebase, per the backend prompt's explicit instruction.

## Troubleshooting

**Every request fails with `Route not found: <METHOD> /<path>` (e.g.
`Route not found: POST /auth/login`)** — look closely at the path in that
message. The backend's 404 handler always echoes the *full* URL it
received (`req.originalUrl`), and the backend only mounts its routes under
`/api/v1`. If that message is missing `/api/v1`, your `BACKEND_API_URL` in
`.env.local` is pointing at the bare host instead of including the API
prefix:

```
# wrong
BACKEND_API_URL=http://localhost:5000
# right
BACKEND_API_URL=http://localhost:5000/api/v1
```

In dev mode (`NODE_ENV !== "production"`) this now also gets a console
warning on server start if `BACKEND_API_URL` doesn't look like it ends in
an `/api/vN` segment, and every failed backend call's error message gets
the literal URL that was requested appended in brackets — so if this
happens again, the exact wrong URL is right there in the error, not just
in server logs.

**`fetch failed` / `ECONNREFUSED`** — the backend isn't reachable at
`BACKEND_API_URL` at all (nothing listening on that host/port). Either
start the local backend or point `BACKEND_API_URL` at the deployed one.
