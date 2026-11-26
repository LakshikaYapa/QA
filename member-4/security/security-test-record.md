# Member 4 — Security test record

**Target:** Skill & Career Development Platform source and isolated CI API
**Environment:** source inspection, Jest unit tests, GitHub Actions run #8 with
its disposable MongoDB service, and a separate authorized local JMeter run
**Status:** source review and database-backed Newman checks passed in CI; the
independent local security run was not performed. No vulnerability was
substantiated by the reviewed evidence.

## Feature applicability

No certificate feature, instructor/admin panel, role property, or role-specific
API route was found in the inspected application. Role-escalation checks for
those absent features are not applicable; do not report their absence as an
exploitable vulnerability.

## OWASP review findings

| Category | Test/check | Expected result | Actual result | Finding |
|---|---|---|---|---|
| A01 Broken Access Control | Source review of protected profile, skill, progress, and project routes | Protected routes require authentication; user-owned records are scoped to the authenticated user | Source review found JWT middleware on protected routes and user-ID filters on the inspected user-owned data handlers. Newman dynamically checked profile authentication and skill ownership; progress/project ownership was not dynamically tested. No role-specific functionality was found. | No vulnerability substantiated; untested routes remain |
| A01 Broken Access Control | Request protected API without token | API returns HTTP 401 and no protected data | Newman assertion passed in GitHub Actions run #8 (commit `3015627`) using the workflow's disposable MongoDB service. | No issue observed in this test |
| A01 Broken Access Control | Request protected API with invalid token | API returns HTTP 401 and no protected data | Newman assertion passed in GitHub Actions run #8 (commit `3015627`) using the workflow's disposable MongoDB service. | No issue observed in this test |
| A01 Broken Access Control | User B attempts to update User A's skill | Request is denied and User A's data is unchanged | Newman asserted HTTP 404 (`Skill not found`) for the other user's skill update; the request passed in GitHub Actions run #8. | No cross-user update observed in this test |
| A03 Injection | Operator-like email supplied as a JSON string to login | Input remains data; request does not authenticate or return an unhandled server error | Newman asserted HTTP 401 and not HTTP 500; the request passed in GitHub Actions run #8. | No injection behavior observed in this test |
| A03 Injection | Malformed project identifier supplied to update route | Invalid identifier is rejected with a client error before a database lookup | Newman asserted HTTP 400 (`Invalid project ID`); the request passed in GitHub Actions run #8. | No issue observed in this test |
| A07 Authentication Failures | Password storage and login flow source review | Passwords are hashed; invalid login does not reveal whether the account exists | Source uses bcrypt hashing/comparison and returns the same 401 message for unknown user and wrong password. Newman valid/invalid login assertions passed in CI run #8. | No issue observed in reviewed and tested behavior |
| A07 Authentication Failures | Token verification and expiry source review | Missing, invalid, or expired tokens are rejected | Source uses JWT verification and signs tokens with a one-day expiry. Missing/invalid token API assertions passed in Newman; unit cases also cover malformed and expired tokens. | No issue observed in reviewed and tested behavior |
| A07 Authentication Failures | Middleware unit checks for missing, wrong-scheme, malformed, expired, and valid bearer tokens | Invalid tokens are rejected with HTTP 401; valid signed token proceeds and attaches user ID | Published repository Jest suite passed: 6 suites/33 tests, including authentication middleware cases. These are unit-level checks, not all live HTTP requests. | No middleware defect observed in tested cases |
| A01/A03/A07 | Database-backed Newman collection | API health, synthetic account registration/login, protected profile/skills, cross-user denial, injection-like login, and malformed project ID behave as asserted | Newman step passed in GitHub Actions run #8 for commit `3015627`; the job also reports Selenium success. GitHub Actions provisioned its own disposable MongoDB service. | No failures reported by the automated assertions |

## Evidence and limits

- Security review was read-only and source-level. It did not exploit a system,
  change data, or test a production/external target.
- The Newman results above are from the CI run, not a separate local security
  run. CI run #8: https://github.com/LakshikaYapa/QA/actions/runs/45742456912
- The CI workflow used a disposable MongoDB service and synthetic account data;
  no production system or real user account was tested.
- The separate local JMeter run targeted `127.0.0.1:5000`. It was a
  performance check, not a replacement for the CI security assertions.
- No vulnerability is claimed based solely on a missing feature or an unrun
  test.
