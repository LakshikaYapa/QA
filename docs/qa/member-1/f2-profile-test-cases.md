# F2 — User Profile Test Cases

**Execution date:** 2026-11-25
**Environment:** Local frontend only. Profile API calls require an authenticated JWT and MongoDB; neither a test account nor database configuration was available. Cloudinary configuration was absent.

## Confirmed feature inventory

The protected profile route and page support viewing and editing name, university, degree, study year, career goal, GitHub URL, and LinkedIn URL. The server exposes profile GET/PUT routes and a photo-upload endpoint. The UI accepts JPEG, PNG, or WebP up to 5 MB; server upload uses Cloudinary. No change-password route or profile UI was found. Because profile rendering requires an API response, profile behavior could not be reached safely without a real test backend.

## Cases

| ID | Description | Preconditions and steps | Expected result | Actual result | Status | Evidence / defect |
|---|---|---|---|---|---|---|
| F2-01 | View authenticated user's profile | Requires valid synthetic login and MongoDB; open `/profile`. | Correct account's permitted profile fields are displayed without exposing password data. | No profile data was fetched: a valid token, test account, and database were unavailable. The UI redirect is covered by F1-09; API rejection of missing/invalid tokens is covered by F1-14. | BLOCKED | Authenticated API/database unavailable; no defect |
| F2-02 | Update valid profile data and verify persistence | Requires valid account and test database; edit permitted synthetic fields, save, reload. | Valid changes persist; unrelated fields remain unchanged. | Not attempted: no authenticated profile response or database. | BLOCKED | MongoDB/API unavailable; no defect |
| F2-03 | Reject invalid profile values / cross-account access | Requires valid test accounts and API; test required name, year range, URL validation, and ownership boundaries against documented requirements. | Invalid data is rejected without partial persistence; one user cannot access another user's private profile. | Profile field validation, persistence, and cross-account behavior were not attempted: no database/test accounts were available and product rules were not fully specified. The API's missing/invalid-token rejection was tested separately in F1-14. | BLOCKED | Database, test accounts, and approved field rules unavailable; no defect |
| F2-04 | Change password | Conditional on a password-change feature being implemented. | If implemented, current/new password rules and authentication behavior meet approved requirements. | No password-change UI or API route was found in inspected source; no behavior was executed. | NOT EXECUTED | Conditional feature not found |
| F2-05 | Upload valid and invalid profile pictures | Requires authenticated test user and configured test Cloudinary account; test supported formats, size boundary, and persistence. | Supported JPEG/PNG/WebP within the 5 MB limit uploads; unsupported/oversized files are rejected and do not replace the prior image. | UI and route exist, but no authenticated profile could be loaded and Cloudinary was not configured; no upload was attempted. | BLOCKED | API/Cloudinary unavailable; no defect |

No profile test is marked PASS or FAIL. Source presence confirms available routes, not successful runtime behavior.
