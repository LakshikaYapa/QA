# Test Execution Evidence

Commands were run from their respective package directories.

| Command | Result |
|---|---|
| `client: npm run test:coverage` | 3 test files passed; 54 tests passed; generated frontend V8 text/LCOV coverage |
| `client: npm run test:coverage -- --coverage.reporter=json` | 3 test files passed; 54 tests passed; used to calculate selected-function statement, branch, and function counts |
| `server: npm test -- --coverage` | 8 test suites passed; 64 tests passed; server statement coverage 88.72%, branch 86.66%, function 93.33%, line 88.91% |
| `client: npm run lint` | Passed |
| `client: npm run build` | Passed; TypeScript build and Vite production build completed |

The frontend full-suite summary was 635/737 statements, 338/426 branches,
168/233 functions, and 614/709 lines. Function-span counts are recorded in
[coverage-summary.md](./coverage-summary.md).

The backend run emitted Mongoose `validateSync()` deprecation warnings; all
tests passed. The test suite mocks Axios and requires no real external
services. No production source, test configuration, SonarQube settings, or
existing teammate documentation was changed.
