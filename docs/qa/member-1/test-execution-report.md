# Test Execution Report — Member 1

**Execution date:** 2026-11-25
**SUT:** Skill & Career Development Platform (nested application repository)
**Scope:** F1 Registration & Login; F2 User Profile
**QA document basis:** User-provided assignment scope. The formal assignment requirements and group work division documents were not present in the QA repository.

## 1. Executive Summary

Local browser execution covered registration/login UI validation and unauthenticated profile-route behavior. Limited API checks also exercised registration/login input validation and rejection of missing or invalid tokens before database access. Across 19 documented cases, eight passed, zero failed, eight were blocked, and three were not executed. No MongoDB database was available, no account was created, no production service was contacted, and no genuine defect was confirmed.

The pass percentage is 100% for the eight executed cases only: `8 / (8 + 0) × 100`. This limited UI and pre-database API result does not represent overall F1/F2 or database-backed behavior.

## 2. Testing Objectives

- Verify applicable F1/F2 functionality from the actual application rather than assumptions.
- Execute safe local UI tests and record observed outcomes.
- Identify environment dependencies preventing API-backed execution.
- Preserve genuine defect evidence and avoid reporting hypothetical issues as defects.

## 3. Testing Scope

In scope: registration UI and validation, password rules, login required and malformed-email validation, unauthenticated access to the profile route, and API-backed registration/auth/profile/image behavior if a safe local test environment were available.

Out of scope: other application modules, live/production testing, application changes, and destructive data operations.

## 4. Test Environment

| Component | Observed value |
|---|---|
| QA repository | Workspace root; deliverables saved under `docs/qa/member-1/` |
| Application repository | Separate nested `Skill-Career-Development-Platform` repository |
| Operating system | Windows |
| Runtime | Node.js 26.13.1; npm 11.20.0 |
| Frontend | React/TypeScript with Vite 8.3.0 at `http://127.0.0.1:5173` |
| Browser | Integrated browser automation; engine/version not exposed |
| Backend | Node/Express; local API validation checks ran on port 5000 |
| Database | MongoDB/Mongoose required; no MongoDB service/binary or test database available. A temporary loopback-only TCP stub was used solely to keep the backend available for pre-database checks; it did not implement MongoDB or persist data. |
| Configuration | No application `.env` files or approved test account/database available; temporary process-only test values were not written to configuration |
| Image storage | Cloudinary required for profile-photo integration; not configured |
| Test data | Synthetic values only; no persistent records created |

Locked client and server dependencies were restored after startup attempts showed that packages were absent. This populated ignored dependency directories only; no tracked application source or manifests changed. The frontend was started via the Vite Node entry point. The standard client npm script was attempted but Windows shell parsing split the workspace path containing `&`. Initial backend startup exited because no MongoDB URI was configured. Later, limited pre-database API checks were run with temporary process-only values and a local TCP stub that did not implement MongoDB.

## 5. Testing Tools

- Integrated browser page and Playwright interactions for local UI navigation, form input, validity checks, request observation, and screenshots.
- Local Vite development server for the frontend.
- Node.js built-in HTTP client for limited local API validation and token-rejection checks.
- Node.js/npm for the existing application scripts and dependency restoration.
- PowerShell and Git for environment and repository-state verification.

No existing automated test suite was run: the server test script is a placeholder. The API checks did not require a database and did not verify any database-backed operation.

## 6. Test Execution Methodology

1. Identified the QA repository and the nested application Git repository separately.
2. Read the available application README, package manifests, F1/F2 UI, auth middleware, user schema, and relevant API handlers. No formal assignment brief/work division document was present.
3. Checked local ports and configuration without displaying secrets. Started the frontend locally; attempted backend startup with its existing script.
4. Used only synthetic UI inputs. Successful registration and credential-based tests were not submitted without an isolated database/account.
5. For API checks, started the backend with temporary process-only values and a loopback TCP listener that did not implement MongoDB. Sent only requests whose validation/authentication branches return before database access, then stopped both processes.
6. Captured screenshots for executed UI cases and sanitized API responses for API checks. Assigned `PASS` only after observing behavior; marked dependency-limited cases `BLOCKED` and absent conditional features `NOT EXECUTED`.
7. Kept the exploratory invalid-token/dashboard error out of F1/F2 defect counts because the earlier request reached the Vite frontend fallback rather than an API.

## 7. F1 Registration and Login Results

| Test case | Result |
|---|---|
| F1-01 Registration page and fields | PASS |
| F1-02 Weak/strong registration password UI checks | PASS |
| F1-03 Registration required fields | PASS |
| F1-04 Successful registration | BLOCKED — requires a MongoDB test database |
| F1-05 Duplicate registration | BLOCKED — requires an existing account and MongoDB |
| F1-06 Missing login email/password | PASS — UI and API required-field checks |
| F1-07 Malformed login email | PASS — browser `typeMismatch` blocked the auth request; no inline message appeared |
| F1-08 Valid and invalid credentials | BLOCKED — requires a stored synthetic account and MongoDB |
| F1-09 Unauthenticated profile-route redirect | PASS |
| F1-10 Authenticated logout | BLOCKED — no valid account/session available |
| F1-11 Password reset | NOT EXECUTED — no flow found in inspected source |
| F1-12 Role behavior | NOT EXECUTED — no role behavior found in inspected source |
| F1-13 API registration required-field/password validation | PASS — HTTP 400 responses observed before database access |
| F1-14 Profile API rejects missing/invalid token | PASS — HTTP 401 responses observed |

Detailed preconditions, steps, actual results, statuses, and evidence are in [f1-registration-login-test-cases.md](./f1-registration-login-test-cases.md).

## 8. F2 User Profile Results

| Test case | Result |
|---|---|
| F2-01 View profile | BLOCKED — authenticated profile data requires a test account and database; token rejection was separately tested |
| F2-02 Update profile and persistence | BLOCKED — requires authenticated profile API and MongoDB |
| F2-03 Profile validation/ownership | BLOCKED — field validation, ownership, and persistence require test accounts/database and approved field rules; token rejection was separately tested |
| F2-04 Change password | NOT EXECUTED — no change-password flow found |
| F2-05 Profile-image upload | BLOCKED — requires authenticated profile API and Cloudinary configuration |

Detailed actual results and limitations are in [f2-profile-test-cases.md](./f2-profile-test-cases.md).

## 9. Test Execution Summary

| Metric | Count |
|---|---:|
| Total Test Cases | 19 |
| Passed | 8 |
| Failed | 0 |
| Blocked | 8 |
| Not Executed | 3 |
| Pass Percentage | 100% = `8 / (8 + 0) × 100` |

Executed cases (`PASS + FAIL`): **8**. Pass percentage excludes blocked and not-executed cases and is not an overall feature-completion measure.

- **Passed:** F1-01, F1-02, F1-03, F1-06, F1-07, F1-09, F1-13, F1-14.
- **Failed:** None.
- **Blocked:** F1-04, F1-05, F1-08, F1-10, F2-01, F2-02, F2-03, F2-05.
- **Not Executed:** F1-11, F1-12, F2-04.

## 10. Defect Summary

**Genuine defects confirmed: 0.** No GitHub Issue was filed because no defect was confirmed and issue access/team agreement was not established.

Source inspection indicates the client logout removes the token and navigates to login; end-to-end logout could not be tested. The login page stores user metadata separately, so whether logout should also clear that data remains a review question, not a confirmed defect.

A prior browser exploration with a synthetic invalid token reached an unrelated dashboard while the backend was unavailable. The dashboard errored on a response served by the Vite frontend fallback rather than an API. This environment-induced, out-of-scope observation is separate from the later direct API token-rejection checks; it is excluded from test and defect counts and is not evidence of actual API behavior.

## 11. Evidence References

Real local browser captures are stored under [evidence/](./evidence/):

- Login required email: [F1-login-email-required.png](./evidence/F1-login-email-required.png)
- Login required password: [F1-login-password-required.png](./evidence/F1-login-password-required.png)
- Login malformed email: [F1-login-invalid-email.png](./evidence/F1-login-invalid-email.png)
- Registration page / strong password checks: [F1-registration-client-validation.png](./evidence/F1-registration-client-validation.png)
- Registration weak password: [F1-registration-weak-password.png](./evidence/F1-registration-weak-password.png)
- Registration required fields: [F1-registration-required-fields.png](./evidence/F1-registration-required-fields.png)
- Unauthenticated profile redirect: [F1-protected-profile-redirect.png](./evidence/F1-protected-profile-redirect.png)
- Additional login form capture: [F1-login-client-validation.png](./evidence/F1-login-client-validation.png)
- Sanitized API request/response observations: [api-validation-checks.md](./evidence/api-validation-checks.md)

No screenshot or API log is claimed for an unexecuted case. The API log documents only pre-database validation and token rejection; blocked database-backed cases remain untested. Screenshots contain synthetic inputs only; password values are masked.

## 12. Testing Limitations

- Formal assignment requirements and group work division were not present.
- Missing MongoDB service/database prevented successful registration, duplicate detection, credential authentication, authenticated profile access, profile persistence, and image upload. Limited validation and token-rejection API checks do not cover those integrations.
- No approved synthetic account/session was available; authentication and logout integration remain unverified.
- Cloudinary was not configured; image upload remains unverified.
- Browser engine/version and supported compatibility matrix are unknown.
- One local exploratory invalid-token attempt hit the Vite fallback, so its dashboard error is not representative of a running backend.
- No CI workflow or automated test suite was available.

## 13. Recommendations

1. Supply the official brief/work division and confirm acceptance criteria against the cases.
2. Provide an isolated MongoDB test database, ignored local configuration, and synthetic test accounts; rerun blocked auth/profile cases.
3. Provide a Cloudinary test account/configuration or explicitly defer photo upload testing.
4. Confirm whether logout should clear cached user metadata as well as the token, then test with a valid session.
5. Agree on GitHub Issues access and triage ownership before filing group defects.
6. Add or identify repeatable automated checks and CI only through the group's agreed scope; do not claim these currently exist.

## 14. Conclusion

The local frontend cases and limited pre-database API validation cases were executed and documented with evidence. Database-backed F1/F2 behavior remains unverified until a safe MongoDB test database and, for image upload, Cloudinary test configuration are available. Application source was not modified; neither repository was committed or pushed.
