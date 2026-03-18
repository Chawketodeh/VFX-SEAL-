# VFX Seal Professionalization Roadmap

## Vision
Build VFX Seal into a trusted B2B platform for vendor discovery, verification, and procurement decisions, with audit-grade data quality, enterprise security, and AI-powered decision support.

## Product Strategy (Big Moves)

### 1) Become a Procurement Decision Platform (not only a directory)
- Add "shortlist workflows" for studios to compare vendors side-by-side.
- Add "RFP mode" where a buyer publishes requirements and invited vendors respond.
- Add "decision evidence" snapshots (score evolution, audit recency, reviewer credibility, SLA readiness).

### 2) Build a Trust Graph
- Introduce confidence scoring per data field (verified by audit, self-declared, stale, disputed).
- Show timeline history for major vendor profile changes.
- Add reviewer credibility model (account maturity, verification level, review quality).

### 3) Launch a Paid B2B Model
- Free: directory browsing and basic reviews.
- Pro Buyer: advanced filters, benchmark exports, AI recommendations.
- Pro Vendor: profile analytics, lead intelligence, RFP participation, reputation insights.

## AI Feature Stack (High ROI)

### A) AI Vendor Matchmaking
- Input: project constraints (budget, style, region, timeline, capacity, tools).
- Output: ranked shortlist with reasoned explanations.
- Model: hybrid ranking = rule-based constraints + embedding similarity + historical outcomes.

### B) AI Review Quality and Safety
- Toxicity and abuse detection (already started, improve with confidence thresholds).
- AI summary of all reviews into strengths, risks, and recurring concerns.
- Contradiction detector (e.g., "excellent communication" vs "slow communication").

### C) AI Profile Copilot for Vendors
- Suggest profile improvements for higher trust score.
- Recommend missing artifacts (case studies, compliance docs, pipeline proof).
- Generate structured capability narrative from portfolio metadata.

### D) AI Buyer Copilot
- Chat: "Find me studios in Europe with strong compositing and data-security readiness."
- Explainability: show why each recommendation was selected.
- Export: AI-generated executive briefing PDF for procurement meetings.

## Engineering Professionalization

### 1) Backend Architecture
- Split monolith routes into domain modules:
  - auth, vendors, feedback, moderation, notifications, audits, recommendations.
- Add service layer + repository layer to isolate DB logic.
- Introduce request validation (Zod/Joi) for every write endpoint.

### 2) Data Model Upgrades
- Add immutable audit logs for moderation and admin actions.
- Add review "visibility state machine" with explicit transitions.
- Create normalized "ExternalVendorMapping" table for Odoo/local ID sync.

### 3) Reliability and Observability
- Add structured logging (pino/winston) with correlation IDs.
- Add centralized error taxonomy with stage + code + safe user message.
- Add metrics: request latency, error rates, review submit success ratio, mapping failures.

### 4) Testing Standards
- Backend:
  - unit tests for mapping/moderation logic,
  - integration tests for feedback submit and Odoo mapping,
  - contract tests for key APIs.
- Frontend:
  - component tests for vendor cards/reviews,
  - E2E flows for register -> browse -> review submit.

## Security and Compliance

### Immediate
- Enforce rate limits on auth and feedback endpoints.
- Input sanitization and output encoding for all user-generated content.
- CSRF strategy for cookie flows or strict token handling with refresh policy.

### Enterprise Ready
- Role/permission matrix (RBAC) with policy checks server-side only.
- Security headers and CSP hardening.
- Secrets scanning + dependency vulnerability CI gate.
- Optional SOC2-readiness checklist and data retention policy.

## DevOps and Release Discipline

### CI/CD Blueprint
- PR pipeline:
  - lint + type-check + test + build + security scan.
- Staging deploy on merge to develop.
- Production deploy with approvals + smoke tests + rollback plan.

### Runtime
- Dockerize backend/frontend.
- Add environment-specific config management.
- Add health checks and readiness checks.

## UX Professionalization

### Vendor Cards and Profiles
- Standardize logo handling with deterministic containers and fallback initials.
- Add profile completeness bars.
- Add trust badges with tooltip explanations.

### Review System
- Always visible submission state:
  - sending, accepted, pending moderation, published.
- Show transparent moderation policy and appeal flow.

### Admin Experience
- Queue-based moderation dashboard with bulk actions.
- Explain why item was flagged (model reason + confidence + highlighted terms).

## Data and Analytics

### Core KPIs
- Vendor discovery to shortlist conversion rate.
- Review submission success rate and publish rate.
- Avg time to moderation decision.
- Buyer retention (weekly active buyers).

### Product Analytics
- Event tracking schema (search, filter, click card, open detail, review submit, shortlist add).
- Dashboard for growth + trust + quality KPIs.

## Recommended 90-Day Plan

### Phase 1 (Weeks 1-3) — Stabilize Core
- Fix Odoo/local vendor mapping with deterministic external mapping collection.
- Add robust error codes and user-facing error reasons.
- Add integration tests for feedback submit path.

### Phase 2 (Weeks 4-6) — Security + CI
- Add validation middleware and rate limiting.
- Add CI pipeline with tests and dependency scans.
- Add structured logs and request tracing.

### Phase 3 (Weeks 7-9) — AI Foundation
- Review summarization API.
- Basic recommendation API (constraint + ranking).
- Admin moderation-assist model output.

### Phase 4 (Weeks 10-12) — Monetization + Enterprise
- Pro plans and feature gates.
- Exportable vendor comparison reports.
- Buyer workflow: shortlist + notes + share.

## "If You Want To Go Big" Initiatives

### 1) Verified Outcome Ledger
- Let buyers validate project outcomes after engagements.
- Build an outcome-backed reputation score.

### 2) Benchmark Intelligence Product
- Quarterly anonymized VFX capability index by region/size/discipline.
- Sell benchmark reports to enterprise buyers.

### 3) AI Negotiation Assistant
- Generate fair baseline SLAs and vendor comparison terms.
- Highlight contract risk clauses from uploaded documents.

## Team Structure Recommendation
- Product Lead (procurement workflow + trust UX)
- Tech Lead (architecture + quality)
- Full-Stack Engineers x2-3
- ML Engineer (recommendations + moderation quality)
- QA/Automation Engineer
- Part-time Security/Compliance advisor

## Definition of Professional Quality (Done Criteria)
- Every critical user flow has automated tests.
- Every production error has a code, stage, and dashboard trace.
- Every write endpoint has validation and access controls.
- Every release has rollback and smoke-test verification.
- User-facing trust signals are transparent and explainable.

## Immediate Next Actions (This Week)
1. Create `ExternalVendorMapping` model and migrate Odoo linkage there.
2. Add backend error codes for feedback endpoints (`FBK_MAP_001`, `FBK_SAVE_001`, etc.).
3. Add integration tests for:
   - Odoo vendor first review submit,
   - duplicate review prevention,
   - moderation states.
4. Add a basic AI review summary endpoint for vendor detail page.
5. Set up CI pipeline with lint/test/build/security checks.

---
This roadmap is intentionally ambitious. You can execute it incrementally while keeping current UI and product momentum.
