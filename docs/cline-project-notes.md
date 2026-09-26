# HealthPath (IATRIC) — project notes for AI sessions

Read this **only when the task touches these areas**. It is deliberately a normal doc
(not a `.clinerules` file) so it costs zero context until it is opened.

## Stack / commands
- Next.js 14.1 pages router (`pages/`), plain JS/JSX (no TypeScript) under `src/`.
- React 18, react-bootstrap 1.6.1, redux 2.5 (`@reduxjs/toolkit`), swiper 7, MUI (Dialogs/NoSsr), firebase + firebase-admin.
- Constants + API map: `src/constant.js` (`api.*`) | i18n: `src/i18n/translations.js` (`useLanguage().t(key, fallback)`) | store: `src/store/store.js` + `src/store/slices/**`.
- Styles: per-feature CSS modules + `styles/globals.css` + `public/css/customStyle.css` (site CSS overrides bootstrap form controls: `.appointment-form .form-control` height, `.form-group` padding).
- Verify with `npx next lint`; full build with `npm run build`; e2e specs live in `tests/` (excluded in `tsconfig.json`) and run with `npm run test:e2e`.
- DB from `.env` (`MONGO_URI`): **`IATRIC_test`**. Read-only checks are easy with `node -e` + mongoose run from the repo root.

## Super-admin & API conventions
- Panels use react-bootstrap (Modal/Form/Row/Col); tag/chip UI uses inline styles; local component state, no new store slices.
- Service options: redux `superAdminHomePage.serviceOffered` (fetched from `api.serviceOffered`), filter `option.isActive !== false`.
- Consultation types: `superAdminConsultationtype` (Audio, Video, Home visit, Clinic).
- Doctor model `src/models/doctorModel.js`: `consultationType` and `serviceOffered` are arrays (`serviceOffered` required); there is **no `speciality` field**.
- FormData PUTs must append every editable array field or `pages/api/addDoctor.js` drops it; that PUT parses comma-joined strings into trimmed arrays (`consultationType`, and `serviceOffered` only when the client sends it).
- Doctor profile edits are APPROVAL-BASED: `RegisterDocLoginHeader.handleSaveDoctor` diffs fields (arrays element-wise) and POSTs `{changedFields}` to `/api/registerDoc/doctorUpdateReq` → stored in `src/models/docDetailsChangeReqSchema.js` → applied only when a super-admin PUTs `?action=approve`. New doctor fields must be primitive/array-comparable so the diff detects them.
- The doctor profile modal is the shared `src/components/superAdminComponent/DoctorModalComp.js` (used by the super-admin doctor list **and** the doctor's own header) — keep both panels working.

## Doctor panel (registerDoc)
- Routes `pages/registerDoc/{login,homepage,viewAllAppointment,prescription,doctorEarnings}.js`; each wraps content in `<DoctorAuthenticatedComponent>` + `<Layouts header={9} footer={7}>`.
- Data: `state.appointment.{appointments,todaysAppointments,doctorEarnings}` from `src/store/slices/registerDoc/appointmentSlice.js`.
- Endpoints via `api.*` (`updateDoctorStatus`, `doctorUpdateRequest`, `leaveRequest`, `doctorEarning`, `prescriptionCall`); handlers in `pages/api/registerDoc/`.
- Styles: per-feature CSS modules (`HomePage/StatsCard/DoctorEarnings/DoctorLogin/ManageSlotsModal/GeneratePdf .module.css`); dialogs in `registerDocComponent/model/`; helpers in `registerDocComponent/utils/{constant,helper,helperApi}.js` (helperApi uses axios).
- Prescription/print: `prescriptionComp.js` + `lib/{DoctorPrescriptionGenerator,MedicineForm,FrequencyTimeSelector,DoctorStampGenerator}.js`; section labels are local constants in `utils/constant.js` (not i18n).

## Website services/speciality (single source of truth)
- `state.globalData.{services,speciality}` (`src/store/slices/bookingWebsite/globalDataSlice.js`): `setServiceOfferedData(payload)` filters `isActive !== false` and splits by `categoryType` — MAJOR → `services`, SUB → `speciality` (missing value counts as MAJOR).
- Read it through `useGlobalData()` (`src/customUtils/useGlobalData.js`); never import `speciality` from `src/constant.js`, never read `state.superAdminHomePage.serviceOffered` on the website (that slice is super-admin only).
- Blended fallback: slice when populated, else the static lists (`src/constant.js` `speciality`, `data/services.js` `servicesData` / `AllDepartmentService` / `demo5ServiceHighlights`).
- Presentation assets (icon/image/slug/description) stay keyed by NAME via `getServiceAsset()` / `mergeServiceLists()`; DB membership + order win, unknown names render with defaults.
- Writers: `UtilService.fetchBasicConfiguration` (homepage) and `BookConsultationApiCall.getServiceOffered` (appointment page) dispatch `setServiceOfferedData`; the hook fetches once when the slice is empty.
- DB collection for serviceOffered rows: **`servicesoffereds`** (mongoose pluralises the `servicesoffered` model): 9 MAJOR, 11 SUB.
- A doctor's specialities live in `doctor.serviceOffered`; the appointment form matches with `matchesSpeciality()` in `src/components/Appointment/Appointmentform.js` (case/slug/partial), never `doctor.speciality ===`.
- DB-driven lists need an icon fallback keyed by name (`ICON_BY_NAME` + default icon in `Demo5Services1` / `Demo5Services2`).

## Marketing panel (Phase 1)
- Client: `src/marketing/components/**` (`MarketingAuthGuard`, `MarketingLogin`, `MarketingDashboard`, `blocks/*`, `css/marketingPanel.module.css`).
- Routes: `pages/marketing/login.js` (`/marketing/login`) and `pages/marketing/index.js` (`/marketing`, guarded). Standalone pages — they do NOT use `src/layout/Layouts.js`.
- API routes (root `pages/api`, not `src/pages/api`): `pages/api/marketing/{auth/login,auth/logout,auth/session,modules}.js`.
  Server helpers/utils live in `src/api/marketing/{helpers,utils}` — never under `pages/`, or Next exposes every module as a public endpoint.
- Session: HMAC-signed token in an httpOnly `marketing_session` cookie (Node `crypto`, no deps, 8 h TTL). Helpers: `src/api/marketing/utils/token.js`, `src/api/marketing/utils/validation.js`, `src/api/marketing/helpers/apiHandler.js`, `src/api/marketing/helpers/requireMarketingAuth.js`.
- Cookie flags: `Secure` is added only for real HTTPS requests (`x-forwarded-proto: https` / TLS socket) or when `MARKETING_COOKIE_SECURE=true`. Do NOT tie it to `NODE_ENV` — a production build served over plain HTTP (e.g. `http://192.168.x.x:3000`) would silently drop the session and bounce the user back to the login page.
- Login trims username/password (mobile autofill and paste often append a space) and lowercases the username; failures answer with a `reason` (`missing` / `username` / `password`) so the form can name the wrong field. The form also verifies `/api/marketing/auth/session` right after a successful POST and reports an explicit "browser did not keep the session cookie" message instead of silently redirecting back.
- Credentials (Phase 1, server-side only): `marketing@healthpath.com` / `Marketing123!` — override with `MARKETING_USERNAME` / `MARKETING_PASSWORD` / `MARKETING_SESSION_SECRET`.
- `api.*` in `src/constant.js`: `marketingLogin`, `marketingLogout`, `marketingSession`, `marketingModules`; sessionStorage key `marketing_info_local_storage`.
- Next phases: 2 SEO keywords (model + CRUD + `next/head`), 3 popup banner (DB + Firebase upload/schedule; `BannerPopup` then reads the API), 4 Demo5Blog1 content, 5 DB-backed marketing user + hashed password + rate limiting.

## Marketing panel — SEO keywords module (Phase 2)
- Model `src/models/marketingPanelSchema.js` — model `MarketingPanel`, schema option `{ collection: "marketingPanel", minimize: false }` (the explicit name is required; mongoose would pluralise to `marketingpanels`, and `minimize: false` keeps the reserved empty objects). One document per site page: `pageIdentifier` (unique, lowercase), `pageTitle` (drives the `<title>`), `seoKeywords[]`, `metaDescription`, `isActive`, `updatedBy`, timestamps, plus `bannerPopup: {}` / `blogDetails: {}` reserved for Phases 3–4.
- API (session required): `pages/api/marketing/seo/index.js` — GET list, POST create/upsert-by-`pageIdentifier`, PUT partial update by `_id` (publish toggle + field edits, with a duplicate-identifier guard), DELETE `?id=`. Public read-only: `pages/api/marketing/seo/metadata.js` (`?path=/`, 60 s cache, active rows only). Queries live in `src/api/marketing/helpers/seoQueries.js`.
- `pageIdentifier` ↔ route map: `MARKETING_PAGES` in `src/api/marketing/utils/seoPayload.js` (`home` → `/`, `services` → `/all-services`, …) with `pathToPageIdentifier()` / `identifierToPath()`; add new pages there.
- Shared payload rules live in `src/api/marketing/utils/seoPayload.js` (`normalizePagePath`, `sanitizeSeoPayload`, `SEO_LIMITS`) and are imported by both the API and the form — keep it free of server-only imports.
- UI: dashboard tile `src/marketing/components/SEOKeywordsCard.jsx` (pure navigation - no form controls in it) → route `pages/marketing/seo.js` → view `src/marketing/seo/index.jsx` → dialog `src/marketing/components/seo/EditSEOModal.jsx`. Shared chrome for every marketing screen: `src/marketing/components/MarketingShell.js`.
- react-bootstrap here is **1.6.8**: use `<Form.Control as="select">` (there is no `Form.Select`), and no `Form.Floating`.
- Site wiring (server-side, Option A): the 15 pages in `MARKETING_PAGES` export `getStaticProps = () => getSeoStaticProps("/path")` (`src/api/marketing/helpers/seoServer.js`) → they build as `● (ISR: 60s)` while all other pages stay `○` static. `pages/_app.js` passes `pageProps.seoMetadata` into `<SeoMetadata metadata=…>`, which renders `<title>`, `meta description`, `meta keywords`, `og:title/description/type` (canonical + `og:url` only when `NEXT_PUBLIC_SITE_URL` is set). Panel POST/PUT/DELETE call `res.revalidate(identifierToPath(...))` so a save rebuilds that page immediately (no-op in dev).
- `<SeoMetadata>` must stay OUTSIDE `<NoSsr>` and `<PersistGate>` in `pages/_app.js`: both render nothing on the server, so anything inside them can never appear in the HTML that crawlers receive. Pages without server props fall back to a client fetch.
- `src/lib/db.js` keeps its connect promise **module-scoped** (never on `global`): the page bundle and the API bundle can hold different mongoose copies while `global` is shared, which made one bundle believe it was connected ("buffering timed out"). Do not reintroduce `global.mongoose`.
- Env/DB split: `.env` (dev, `next dev`) → **`IATRIC_test`**; `.env.production` → **`IATRIC`**. `npm start` runs a custom `NODE_ENV=production node server.js` (and `next start` also loads `.env.production`), so a built app writes to `IATRIC` — check the right database before/after tests.
- `api.*` additions: `marketingSeo`, `marketingSeoMetadata`.
- Next: Phase 4 Demo5Blog1 content, Phase 5 hashed DB user.

## Marketing panel — homepage banner (Phase 3)
- **Inline on the dashboard** (no separate page): `src/marketing/components/banner/HomepageBannerCard.jsx` renders the block (thumbnail, Active/Paused badge, "Last updated", storage path) and hosts `src/marketing/components/banner/EditBannerModal.jsx` (drag & drop + file picker + live preview + "Save & Replace").
- Storage: the `bannerPopup` field of the **`home`** document in `marketingPanel` — `{ bannerUrl, altText, href, isActive, lastUpdated, updatedBy }`; helpers in `src/api/marketing/helpers/bannerQueries.js` (upsert creates the home doc when the panel is empty).
- Firebase: `src/services/firebaseStorage.js` uploads with **overwrite** to the fixed path `metadata/img.png` (`uploadBannerImage`, `cacheControl: no-cache`), and exposes `getBannerImageUrl()` + `withCacheBuster(url, lastUpdated)` — the card and the popup append `v=<timestamp>` so a replaced image is never served from cache.
- API: `pages/api/marketing/banner/index.js` (guarded GET/PUT, stamps `lastUpdated`) and `pages/api/marketing/banner/metadata.js` (public, 30 s cache, returns nothing unless active AND a URL is stored).
- UI: dashboard tile `src/marketing/components/PopupBannerCard.jsx` (navigation only, shows the current status) → `pages/marketing/banner.js` → view `src/marketing/banner/index.jsx` → dialog `src/marketing/components/banner/EditBannerModal.jsx`. Upload goes to Firebase Storage via `sendBannerToFirebase()` (`src/utils.js`, folder `popup_banner_img_path` = `images/popupBanner/`); a pasted URL also works when Storage rules block the upload.
- `BannerPopup` resolves in this order: panel record → `metadata/img.png` via `getBannerImageUrl()` → static `data/popupBanner.js` → nothing (the popup is not rendered at all).
- react-bootstrap 1.6 `Form.Check type="switch"` needs an explicit **`id`** (the input is visually hidden, so its `<label for=…>` only toggles it when the id matches) — see the banner and SEO modals.

## Marketing panel — blog management (Phase 4)
- Storage: `marketingPanel.blogDetails.posts[]` on the **`blog`** document (the same doc holds the `/blog-listing` SEO entry). Sub-schema `blogPostSchema` in `src/models/marketingPanelSchema.js`: `title, slug, excerpt, content, coverImage, author ("Marketing Team"), isPublished (true), publishedAt, updatedAt` (+ `_id` per post). No separate collection.
- Rules: slug is auto-generated from the title (`slugify`), unique across posts (validated on POST and PUT), and content is rendered as **plain text** on the website (never `dangerouslySetInnerHTML`).
- API: `pages/api/marketing/blog/index.js` (guarded GET/POST/PUT/DELETE — PUT also accepts just `{ _id, isPublished }` for the publish toggle) · `pages/api/marketing/blog/public.js` (public: list of published posts, or `?slug=` for one).
- Panel UI: dashboard tile `src/marketing/components/BlogManagementCard.jsx` → `pages/marketing/blog.js` → view `src/marketing/blog/index.jsx` → dialog `src/marketing/components/blog/EditBlogModal.jsx` (slug preview, counters, cover upload to `metadata/blog/` via `uploadBlogCover`).
- Website: `src/components/Demo-5/Demo5Blog1.js` renders the published posts (newest first, max 3) and **falls back to its original static cards** while loading or when the panel has no posts; each card links to `/blog/<slug>`.
- **`/blog` is the "Our Blog" listing page** (`pages/blog/index.js`): every published post with cover, date/author, excerpt and a "Read more" link; it is the breadcrumb target for the detail pages. `pages/blog/[slug].js` (client-fetched, Layouts + PageBanner) shows one post with loading / not-found states, and its breadcrumb is `Home / Our Blog / <title>` — `PageBanner` builds the parent link as `/${url}`, so pass `url="blog"` (never `blog-listing`, that template page no longer exists).
- `MARKETING_PAGES.blog` → `/blog`, so the listing page can carry panel-managed SEO (`pages/blog/index.js` exports `getSeoStaticProps("/blog")` like the other managed pages).
- Helpers: `src/api/marketing/helpers/blogQueries.js`, payload rules in `src/api/marketing/utils/blogPayload.js` (`BLOG_LIMITS`, `slugify`, `sanitizeBlogPayload`); `api.marketingBlog` / `api.marketingBlogPublic` in `src/constant.js`.

## Homepage banner popup
- ONE image; source order: the marketing panel banner (`marketingPanel.home.bannerPopup`) → `data/popupBanner.js` (static fallback) → nothing (the popup is not rendered at all). `POPUP_FALLBACK_IMAGE` (`/images/popup-placeholder.png`) is used when the chosen `url` fails to load (next/image `onError`).
- Mounted only in `pages/index.js` (route `/`, not `/demo-5`); shown once per browser session via `sessionStorage: popup_banner_shown`.
- Closes ONLY via its × button (`backdrop="static"`, `keyboard={false}`) — backdrop clicks, ESC and banner clicks must not dismiss it.
- Additional image hosts must be added to `images.remotePatterns` in `next.config.js` (`firebasestorage.googleapis.com` is already allowed).
