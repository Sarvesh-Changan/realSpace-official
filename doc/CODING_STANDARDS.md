# CODING_STANDARDS.md — REALSPACE Website Rebuild

Audience: any developer *and* any AI coding agent (Claude, Gemini, etc.) working on this codebase. This document is the contract an AI agent must follow when writing or modifying code here.

## 1. Non-negotiable AI Agent Workflow Rules

These exist because of a real incident on this project: an AI Studio agent previously deleted all project files mid-build. The rules below prevent a repeat.

1. **Commit before every agent-driven change.** Never let an agent begin a multi-file edit against an uncommitted working tree. If something goes wrong, `git restore` / `git reset --hard` must always be one command away.
2. **Agents never delete files or directories.** Not `rm`, not "clean up unused files," not "start fresh." If a file genuinely needs removal, the developer removes it manually after reviewing why.
3. **Build after every section, not at the end.** After each meaningfully-sized change (a new route, a new admin module, a schema migration), run `npm run build` before proceeding to the next section. Catching a broken build immediately, one section at a time, is far cheaper than debugging a collapsed build after ten sections of agent output.
4. **One section, one reviewable diff.** Prefer an approval-gated, iterative workflow: agent proposes a change for one section/feature → developer reviews the diff → build passes → commit → move to next section. Do not let an agent make sweeping, multi-module changes in a single unreviewed pass.
5. **No dependency additions without a visible diff.** If an agent adds an npm package, it must show up explicitly in `package.json`'s diff for review — never silently installed as a side effect of "fixing" something.
6. **Migrations are reviewed, not auto-applied blindly.** `prisma migrate dev` output is read before it's committed; an agent does not get to run `prisma migrate deploy` against production data unsupervised.

## 2. Project & File Structure Conventions

- Follow the route structure defined in ARCHITECTURE.md §3 exactly — don't introduce parallel/ad hoc folder patterns (e.g., no mixing `pages/`-style files into an App Router project).
- Colocate: a feature's components, server actions, and types live near the route that owns them (`app/admin/projects/_components/`, `app/admin/projects/actions.ts`), rather than a single sprawling `components/` or `lib/` dumping ground.
- Shared, cross-feature code (Prisma client singleton, auth helpers, Cloudinary signing helper, shared UI primitives) lives in `lib/` and `components/ui/` — nothing else goes there.
- `next.config.ts` is valid only from **Next.js 15+** — confirm the installed Next.js major version before using the `.ts` config file; on anything earlier it must be `next.config.js`/`.mjs`.

## 3. TypeScript

- `strict: true` in `tsconfig.json`. No `any`; use `unknown` + narrowing, or generate/derive types from the Prisma schema (`Prisma.ProjectGetPayload<...>`) instead of hand-duplicating shapes.
- All Server Action inputs and API route bodies are validated with a Zod schema, and the **inferred Zod type**, not a hand-written interface, is the source of truth for that input shape — one definition, not two that can drift.
- No implicit `null`/`undefined` leaks into components — model optionality explicitly (`string | null`, not assuming a field is always present because "it usually is").

## 4. React / Next.js Conventions

- **Server Components by default.** A component becomes a Client Component (`"use client"`) only when it needs interactivity (state, effects, browser APIs, the quote calculator's step logic, admin form inputs) — not by default.
- **Mutations go through Server Actions**, not client-side `fetch` to a hand-rolled API route, except for the two documented exceptions in ARCHITECTURE.md (`api/cloudinary/sign`, and any endpoint that genuinely needs a stable external HTTP contract).
- Every list-rendering component (`Project` cards, `Service` cards, filter results) uses stable, real `key`s (`project.id`), never array index.
- Loading and error states are explicit (`loading.tsx`, `error.tsx` per route segment) — an admin CRUD action failing silently is not acceptable given it directly affects lead handling.
- Forms (quote calculator, contact form, all admin CRUD forms) use a consistent form pattern (e.g., `react-hook-form` + the same Zod schema used server-side) so client and server validation never disagree.

## 5. Styling

- Tailwind only — no ad hoc inline `style={}` unless dynamically computed (e.g., a Cloudinary-derived image aspect ratio) and unavoidable.
- Brand tokens (white/light backgrounds, red/yellow accents, dark grey/black text) are defined once in `tailwind.config.ts` as named theme colors (e.g., `brand.red`, `brand.yellow`) — never hex codes scattered inline through components. This is what makes "red/yellow as accent only, never dominant" actually enforceable in review: a PR that turns a large background `bg-brand.red` is trivially spottable.
- Framer Motion is used for **purposeful** transitions only (page/section entrance, hover micro-interactions) — the PRD explicitly calls out "excessive animation" as something to avoid; if a motion effect doesn't clarify hierarchy or provide feedback, don't add it.

## 6. Pricing & Data Rules (product-critical — see PRD/DATABASE)

- **No pricing numbers are ever hard-coded in a component, constant file, or Server Action.** All calculator math reads `PricingOption` rows at request time. A PR that introduces a literal price value outside a migration/seed file should be rejected in review.
- Any change to the calculator's *math* (how selected options combine into a range) is reviewed as carefully as a payment feature would be, even though no money moves — it directly produces the number a customer sees and the estimate stored on their `Lead`.

## 7. Accessibility & SEO (treated as code-review checklist items, not afterthoughts)

- Every `ProjectImage` requires non-empty `altText` — enforced by the Zod schema on the admin form, not just a DB column.
- Every public page exports `generateMetadata()`; no page ships with default/empty Next.js metadata.
- Semantic HTML first (`<nav>`, `<main>`, `<article>` for project cards, proper heading hierarchy) before reaching for generic `<div>` soup.

## 8. Testing & Verification Discipline

- After any schema change: run the affected page(s) locally against a seeded dev DB before committing — don't trust types alone to catch a runtime query mismatch.
- Before merging a PR touching the quote calculator: manually walk the full flow (BHK → Rooms → Package → Get Quote) and confirm the resulting `Lead` row and displayed estimate match expectations.
- Before merging a PR touching `/admin/**`: confirm an unauthenticated request is actually redirected/rejected — don't assume the layout guard alone is sufficient (see SECURITY.md §1).

## 9. Commit & PR Hygiene

- Small, single-purpose commits mapped to the "one section" unit described in §1.
- Commit messages describe *what changed and why* in product terms where relevant (e.g., `feat(admin): add pricing option CRUD for quote calculator groups`), not generic `fix stuff`.
- No `console.log` left in committed code; use a structured logger or remove debug output before commit.

## 10. What NOT to over-engineer

Per ARCHITECTURE.md §10 — resist the AI-agent tendency to add abstraction "just in case":
- No multi-role permission system until there's actually a second admin user.
- No custom plugin/CMS abstraction layer — the Prisma schema + Admin Dashboard *is* the CMS.
- No premature caching/queueing layers for lead volume this project will realistically see.
- No generic "field builder" for the pricing calculator beyond the `groupKey`-based `PricingOption` model already defined in DATABASE.md — it's flexible enough without inventing a rules engine.
