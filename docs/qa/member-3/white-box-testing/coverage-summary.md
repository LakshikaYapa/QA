# Coverage Summary

## Selected functions

Fresh Vitest V8 JSON coverage was measured for source locations in
`client/src/pages/Roadmap/Roadmap.tsx`. The selected source spans include the
nested callbacks, which are reported as functions in their own right.

| Function | Statements | Branches | Functions | Result |
|---|---:|---:|---:|---|
| `loadRoadmapProgress` (lines 35–45; includes filter callback) | 6/6 (100%) | 4/4 (100%) | 2/2 (100%) | PASS |
| `toggleStep` (lines 137–144; includes state-updater and filter callbacks) | 4/4 (100%) | 2/2 (100%) | 3/3 (100%) | PASS |

The `loadRoadmapProgress` branch denominator is the four V8-instrumented
outcomes at the saved-value and array checks. Storage and parse exceptions
were also exercised by tests; V8 reports those catch paths through statement
coverage rather than as additional `BRDA` outcomes. The nested filter
predicate was exercised with both strings and non-strings.

## Full-suite coverage

| Suite | Statements | Branches | Functions | Lines | Test result |
|---|---:|---:|---:|---:|---|
| Frontend | 86.16% (635/737) | 79.34% (338/426) | 72.10% (168/233) | 86.60% (614/709) | 3 files; 54 passed |
| Backend | 88.72% | 86.66% | 93.33% | 88.91% | 8 suites; 64 passed |

The remaining frontend uncovered lines are listed in the generated report;
they include unrelated branches in the other pages and components. The
Roadmap file overall has 91.34% statements, 92.50% branches, 79.41% functions,
and 92.47% lines. These are file-level figures, distinct from the 100%
function-span measurements above.

The frontend report still has uncovered lines in
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
[Skills.tsx](../../../../client/src/pages/Skills/Skills.tsx). On the backend,
[index.js](../../../../server/index.js) is the only file below full coverage;
the other reported server files are at 100%.

No SonarQube analysis was run, so no new Sonar quality-gate result is claimed.
