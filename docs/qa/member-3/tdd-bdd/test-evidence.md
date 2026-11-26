# Test Evidence and Reproduction

All commands below were run in the stated package directory. The captured
outputs are real terminal logs in `docs/qa/member-3/tdd-bdd/evidence/`.

| Check | Command | Result | Captured output |
|---|---|---|---|
| TDD RED | `server: npm test -- --runTestsByPath ../tests/unit/progressApi.test.js` | 1 intended failure (expected 400, received 201); other 5 tests passed | [red-stage.txt](./evidence/red-stage.txt) |
| TDD GREEN | Same focused command after the minimal fix | 6 tests passed | [green-stage.txt](./evidence/green-stage.txt) |
| TDD REFACTOR | Focused progress API, validator, and existing TDD tests | 3 suites; 24 tests passed | [refactor-stage.txt](./evidence/refactor-stage.txt) |
| Full frontend | `client: npm run test:coverage` | 3 files; 54 tests passed; coverage generated | [frontend-coverage.txt](./evidence/frontend-coverage.txt) |
| Full backend | `server: npm test -- --coverage` | 9 suites; 82 tests passed; coverage generated | [backend-coverage.txt](./evidence/backend-coverage.txt) |
| Cucumber | `server: npm run test:bdd` | 3 scenarios; 18 steps passed | [cucumber-run.txt](./evidence/cucumber-run.txt) |
| Frontend lint | `client: npm run lint` | Passed | [frontend-lint.txt](./evidence/frontend-lint.txt) |
| Frontend build | `client: npm run build` | TypeScript and Vite production build passed | [frontend-build.txt](./evidence/frontend-build.txt) |

## Before/after baseline

Before implementation, the frontend run passed 54 tests with 86.16%
statement and 79.34% branch coverage. The backend run passed 64 tests with
88.72% statement and 86.66% branch coverage. Final coverage is detailed in
[coverage-summary.md](./coverage-summary.md).

## Screenshots

No screenshots were captured automatically. The saved logs preserve the
actual outputs. If the instructor requires images, run the commands above in
VS Code's integrated terminal and save genuine captures as
`red-stage.png`, `green-stage.png`, `refactor-stage.png`, and
`cucumber-run.png` in the evidence directory. Further instructions are in
[evidence/README.md](./evidence/README.md).

## Other verification notes

- The backend emitted existing Mongoose `validateSync()` deprecation warnings;
  all tests passed.
- npm reported 18 moderate audit advisories during Cucumber installation;
  none were auto-fixed.
- The pre-existing root lockfile modification and untracked image/backup
  assets were preserved.
- No production behavior was changed outside the numeric-type validation
  correction. Existing tests were retained; no Sonar settings were changed.
