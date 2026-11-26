# Coverage Summary

Coverage was generated from the existing configured runners. The baseline was
collected before the TDD implementation; the after results were collected
after all changes.

## Before and after

| Suite | Metric | Before | After |
|---|---|---:|---:|
| Frontend | Statements | 86.16% (635/737) | 86.16% (635/737) |
| Frontend | Branches | 79.34% (338/426) | 79.34% (338/426) |
| Frontend | Functions | 72.10% (168/233) | 72.10% (168/233) |
| Frontend | Lines | 86.60% (614/709) | 86.60% (614/709) |
| Backend | Statements | 88.72% | 90.04% |
| Backend | Branches | 86.66% | 87.14% |
| Backend | Functions | 93.33% | 93.47% |
| Backend | Lines | 88.91% | 90.24% |

The added production validation service has 100% statement, branch, function,
and line coverage. Backend coverage improved by 1.32 percentage points in
statements and 0.48 points in branches. Frontend source was unchanged.

## Test counts

| Run | Before | After |
|---|---:|---:|
| Frontend tests | 54 passed | 54 passed |
| Backend Jest tests | 64 passed | 82 passed |
| New backend Jest tests | — | 18 passed |
| Cucumber scenario executions | — | 3 passed (2 scenario definitions) |

The full final backend report shows `server/index.js` at 88.91% statements,
86.43% branches, 93.02% functions, and 89.13% lines. It remains the only
backend source file below 100%; the new validation service and other reported
backend files are at 100%.

The frontend report remains partially uncovered in
[AuthenticatedLayout.tsx](../../../../client/src/components/AuthenticatedLayout/AuthenticatedLayout.tsx),
[ThemeProvider.tsx](../../../../client/src/hooks/ThemeProvider.tsx),
[useTheme.ts](../../../../client/src/hooks/useTheme.ts),
[CareerPaths.tsx](../../../../client/src/pages/CareerPaths/CareerPaths.tsx),
[Dashboard.tsx](../../../../client/src/pages/Dashboard/Dashboard.tsx),
[Login.tsx](../../../../client/src/pages/Login/Login.tsx),
[Portfolio.tsx](../../../../client/src/pages/Portfolio/Portfolio.tsx),
[Profile.tsx](../../../../client/src/pages/Profile/Profile.tsx),
[Progress.tsx](../../../../client/src/pages/Progress/Progress.tsx),
[Projects.tsx](../../../../client/src/pages/Projects/Projects.tsx),
[Register.tsx](../../../../client/src/pages/Register/Register.tsx),
[Roadmap.tsx](../../../../client/src/pages/Roadmap/Roadmap.tsx), and
[Skills.tsx](../../../../client/src/pages/Skills/Skills.tsx).

No SonarQube analysis was run, so these are local test-runner metrics and not
a Sonar quality-gate result. The Cucumber installation reported 18 moderate
dependency audit advisories; they were not automatically fixed or upgraded
as part of this testing task.
