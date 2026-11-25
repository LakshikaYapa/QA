# Test Plan — Member 1: Test Lead & Defect Manager

**Status:** Execution baseline, based on the available source and the scope in the assignment prompt. The formal assignment requirement and group work division documents were not present in the QA repository at the time of this work; confirm this plan against them when available.

**Execution date:** 2026-11-25

## 1. SUT and repository boundary

The QA repository is the current workspace. The application under test is the separate nested Git repository `Skill-Career-Development-Platform`. QA deliverables belong only in this repository's `docs/qa/member-1/`; no application source files were changed. The SUT README describes a career and skills platform.

Verified application stack: React, TypeScript, and Vite frontend; Node.js and Express backend; MongoDB through Mongoose; JWT authentication and bcryptjs password hashing; Multer and Cloudinary for profile images; Gemini integration for unrelated AI features. The client has registration, login, and protected profile routes. Server endpoints include `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/profile`, and `POST /api/profile/photo`.

The registration UI/backend enforce a password policy (minimum eight characters, upper- and lowercase letters, number, special character, no whitespace). Login uses JWTs. Logout is a client-side action. No password-reset or change-password flow or role-based authorization was found in the inspected UI/routes/schema. Profile-photo upload is implemented and depends on Cloudinary.

The official assignment brief and group division were not available in either repository. This plan therefore follows the Member 1 responsibilities in the assignment prompt and does not invent requirements or acceptance criteria.

## 2. Objectives

- Verify the actual presence and boundaries of F1 registration/login/logout and F2 profile features.
- Run safe, repeatable manual UI tests and record observed results without treating source inspection as execution.
- Identify integration dependencies that prevent end-to-end testing.
- Provide traceable defect intake and status management for the group.
- Deliver honest coverage, evidence, and limitations for group reporting.

## 3. Scope

### In scope

- Registration UI validation, password rules, login UI validation, unauthenticated protected-route behavior.
- Backend authentication, duplicate-account behavior, and account creation when a safe test database and account are available.
- Profile viewing, editing/validation, and image upload when authentication, database, and storage dependencies are available.
- Defect intake, triage, retest coordination, and reporting for the group.

### Out of scope

- Other application modules (skills, progress, career recommendations, roadmap, projects, portfolio).
- Testing against the public/live demo or any production environment.
- Creating or changing application features, test data in an unknown database, or production records.
- Performance, broad penetration, deployment, and unrelated dependency-vulnerability testing.

## 4. Quality attributes

Use the ISO/IEC 25010 edition required by the course if specified in the missing brief. Relevant characteristics for these cases are functional suitability (registration, login, profile outcomes), security (credential handling and protected access), interaction capability/usability (validation feedback), reliability (persistence and session state), and compatibility (supported browser/OS matrix, currently unspecified). Maintainability is considered only when source inspection helps explain a reproducible issue. No quality rating is claimed from the limited UI execution.

## 5. Verification and validation

- **Verification** checks work products against their specified requirements. Here, source inspection confirmed routes, form rules, protected-page wiring, and available setup information; review of this plan checks case traceability and result/status consistency. The official brief was unavailable, so requirement conformance remains incomplete.
- **Validation** exercises the running product to determine whether it meets user needs. Manual browser tests were run against the local frontend for input validation and unauthenticated redirection. Limited API checks also exercised registration/login required-field validation, registration password policy, and rejection of absent/invalid tokens before database access. Database-backed account and profile behaviors could not be validated because no MongoDB test service was available.

## 6. Approach

1. Inspect the application README, package manifests, F1/F2 components, auth middleware, user schema, and relevant API handlers.
2. Use the local Vite frontend only; do not contact the public demo or production services.
3. Execute browser cases and safe API validation cases using synthetic inputs. Do not submit a successful registration or credentials without an approved test database.
4. Attempt backend startup using its documented command; if database-independent validation is exercised, keep any temporary dependency stub local and non-persistent, and restrict requests to paths that return before database access. Record dependency/service failures and block database-dependent cases.
5. Keep expected behavior tied to implemented constraints or explicit user requirements. Record actual observations and evidence separately.
6. File a defect only for an observed, reproducible failure against an agreed expectation. Source observations and environment-induced errors are not automatically defects.
7. Rerun blocked cases after a designated test database, safe accounts, and required storage configuration are provided.

## 7. Resources and environment

| Resource | Observed value/status |
|---|---|
| Host operating system | Windows |
| Node.js / npm | 26.13.1 / 11.20.0 |
| Frontend | React + TypeScript + Vite 8.3.0; local dev server at `http://127.0.0.1:5173` |
| Browser | Integrated browser automation; browser engine/version not exposed |
| Backend | Node/Express; attempted on port 5000 |
| Database | MongoDB/Mongoose expected; no MongoDB service/binary or test database was available. A loopback-only TCP stub was used temporarily for database-independent API checks; it did not implement MongoDB. |
| Test configuration | No app `.env` files were present; no test account or approved test database. Temporary process-only values were not persisted. |
| Image storage | Cloudinary required by upload handler; no credentials/configuration available |
| Test data | Synthetic values only; no account was created |
| Dependencies | Restored using existing client/server lockfiles after startup failed due to missing installed packages; no tracked dependency files changed |

No CI workflow or automated test suite was found. The server's `test` script reports that no test is specified; the client package has no test script. The application README lists automated tests and CI/CD as future improvements.

## 8. Setup and run status

The frontend was successfully started locally using the installed Vite entry point. The standard `npm run dev` script was also attempted but the Windows script shell split the workspace path containing `&`; the direct Node invocation worked:

```powershell
Set-Location "<application>\client"
npm ci
node .\node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173
```

The backend command was attempted after dependencies were restored. With no MongoDB service available, it could not establish a database connection. For database-independent validation checks only, the backend was run with temporary process-only values and a loopback TCP listener that did not implement MongoDB; those requests returned before any database operation. The listener and backend were stopped afterward. No `.env` was created and no database was contacted. To enable remaining tests, configure a designated non-production MongoDB test database and the documented JWT secret in an ignored local server `.env`; configure Cloudinary only for the image-upload case. Do not use production credentials or data.

## 9. Schedule

No course dates or group milestones were supplied. Use the following relative sequence and align it with the group's actual calendar: access and requirements confirmation → feature/test design → environment readiness → manual execution → defect triage and retest → group reporting.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Assignment brief and work division absent | Confirm this plan with the official documents before submission. |
| MongoDB URI/service and test account unavailable | Keep integration cases Blocked; request a dedicated test database and synthetic account. |
| Cloudinary credentials unavailable | Do not upload to a real account; keep photo integration testing Blocked. |
| Missing API base URL/configuration can route requests to the frontend dev server | Configure the API URL only when a local backend is ready; never interpret Vite fallback responses as API results. |
| Test data or screenshots expose personal information | Use synthetic inputs and redact credentials, tokens, and private URLs. |
| Browser and supported OS matrix unspecified | Record the current host only; obtain the project's supported matrix before compatibility claims. |
| Shared issue tracker access unknown | Agree on GitHub Issues only after repository and member access are verified. |

## 11. Entry, exit, and reporting

**Entry:** approved SUT/build and requirements are available; an isolated test database and safe test account are configured for integration cases; test data and environment are recorded.

**Exit:** each applicable case has an accurate status and actual result; failures have evidence and an agreed disposition; blocked/not-executed cases and remaining risks are explicit.

The execution report calculates pass percentage as `PASS / (PASS + FAIL)`. A high percentage among a small UI-only executed subset is not a claim that the full F1/F2 scope passed.
