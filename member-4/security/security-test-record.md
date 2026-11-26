# Member 4 — Security test record

**Target:** local Skill & Career Development Platform source and its local API  
**Environment:** source inspection plus direct authentication-middleware unit
tests; no database-backed API request completed in this run  
**Status:** source review and middleware checks complete; API ownership and
injection checks pending an isolated local MongoDB-backed test environment

## Feature applicability

No certificate feature, instructor/admin panel, role property, or role-specific
API route was found in the inspected application. Role-escalation checks for
those absent features are not applicable; do not report their absence as an
exploitable vulnerability.

## OWASP review findings

| Category | Test/check | Expected result | Actual result | Finding |
|---|---|---|---|---|
| A01 Broken Access Control | Source review of protected profile, skill, progress, and project routes | Protected routes require authentication; user-owned records are scoped to the authenticated user | Source review found JWT middleware on protected routes and user-ID filters on the inspected user-owned data handlers. No role-specific functionality was found. Not dynamically verified. | No substantiated source-level vulnerability found; runtime tests pending |
| A01 Broken Access Control | Request protected API without or with invalid token | API returns HTTP 401 and no protected data | Not executed in this Member 4 run. Earlier Member 1 evidence documents local no-token/invalid-token profile checks, but this report does not count them as a new run. | Pending |
| A01 Broken Access Control | User B attempts to update User A's skill | Request is denied and User A's data is unchanged | Not executed dynamically. The Newman collection includes this check; result awaits execution against the isolated database. | Pending |
| A03 Injection | Operator-like email supplied as a JSON string to login | Input remains data; request does not authenticate or return an unhandled server error | Not executed dynamically. The Newman collection includes the validation request; result awaits execution. | Pending |
| A03 Injection | Malformed project identifier supplied to update route | Invalid identifier is rejected with a client error before a database lookup | Source includes an explicit 400 validation for malformed project IDs. Runtime result pending. | No source-level vulnerability established; dynamic check pending |
| A07 Authentication Failures | Password storage and login flow source review | Passwords are hashed; invalid login does not reveal whether the account exists | Source uses bcrypt hashing/comparison and returns the same 401 message for unknown user and wrong password. No dynamic verification performed. | No substantiated source-level vulnerability found |
| A07 Authentication Failures | Token verification and expiry source review | Missing, invalid, or expired tokens are rejected | Source uses JWT verification and signs tokens with a one-day expiry. Runtime verification pending. | No substantiated source-level vulnerability found |
| A07 Authentication Failures | Middleware unit checks for missing, wrong-scheme, malformed, expired, and valid bearer tokens | Invalid tokens are rejected with HTTP 401; valid signed token proceeds and attaches user ID | Published repository Jest suite executed: 6 suites/33 tests passed, including authentication middleware cases. These are unit-level checks, not a live HTTP API test. | No middleware defect observed in tested cases |
| A01/A03/A07 | Start local API for Newman smoke tests | API starts with test DB and validation/auth requests return expected responses | Attempted with a disposable local URI. No MongoDB service was listening; the in-memory fallback in the earlier inspected application copy could not find a MongoDB binary with downloads disabled. The published repository backend requires MongoDB and has no embedded fallback; API requests did not run. | Blocked; not a vulnerability finding |

## Evidence and limits

- Security review was read-only and source-level. It did not exploit a system,
  change data, or test a production/external target.
- The API collection uses synthetic test accounts and a test skill; run it only
  against a disposable isolated MongoDB database.
- A local test-DB startup attempt failed because MongoDB/Docker was unavailable;
  no Newman response has been counted as a pass in this run.
- Do not mark the pending rows as passed until Newman has run successfully and
  its report is saved under `reports/`.
- No vulnerability is claimed based solely on a missing feature or an unrun
  test.
