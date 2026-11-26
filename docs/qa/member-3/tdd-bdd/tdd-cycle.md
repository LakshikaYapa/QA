# TDD Cycle — Numeric Progress Validation

## Requirement

The progress API accepts a numeric percentage only when it is finite and in
the inclusive range 0–100. A JSON string such as `"50"` must not be accepted
through JavaScript's coercive range comparisons or sent to database work.
This requirement follows the existing numeric progress model and the client,
which sends progress as a number.

## RED

Added a route test to the existing `progressApi.test.js` before changing
production code. It submitted `{ "skillId": "skill-1", "progress": "50" }`,
expected HTTP 400, and asserted that database methods were not called.

Command, from `server`:

```powershell
npm test -- --runTestsByPath ../tests/unit/progressApi.test.js
```

Actual result: **1 failed, 5 passed**. The new assertion expected status 400
but received **201**; the route created the record. This was the intended
failure demonstrating the missing type validation. Captured output:
[red-stage.txt](./evidence/red-stage.txt).

## GREEN

The minimum correction added a finite-number check to POST validation. The
same command then passed: **1 suite, 6 tests passed**. Captured output:
[green-stage.txt](./evidence/green-stage.txt).

## REFACTOR

Extracted the shared check into
[`server/services/progressValidation.js`](../../../../server/services/progressValidation.js)
and reused it from POST and PUT. The prior `tests/tdd` helper now re-exports
the production function rather than maintaining a separate implementation.
Added focused validation boundary/type cases and route checks for null values,
inclusive boundaries, and database failures.

Command, from `server`:

```powershell
npm test -- --runTestsByPath ../tests/unit/progressApi.test.js ../tests/unit/progressValidationService.test.js ../tests/unit/progressValidation.tdd.test.js
```

Actual result: **3 suites, 24 tests passed**. Captured output:
[refactor-stage.txt](./evidence/refactor-stage.txt).

The refactor retained the 0–100 numeric behavior while consistently rejecting
non-numeric and non-finite values in both API routes. The final complete
backend suite also passed; see [test-evidence.md](./test-evidence.md).

## Screenshot note

No terminal screenshots were captured. The command output logs are preserved
in the evidence folder; exact manual screenshot instructions are in
[evidence/README.md](./evidence/README.md).
