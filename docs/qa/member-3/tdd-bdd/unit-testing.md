# Unit and API Testing

## Functions and feature availability

The selected F5 production function is
[`isValidProgressValue`](../../../../server/services/progressValidation.js).
It accepts finite numeric progress values from 0 through 100 inclusive. The
POST and PUT progress routes in
[`server/index.js`](../../../../server/index.js) use this shared function.

F6 quiz/assessment behavior is absent from the inspected source. No quiz tests
were fabricated. The team must implement and define quiz questions, scoring,
pass/fail rules, attempt limits, persistence, and an API/UI before F6 can be
tested.

## New test cases

All 18 new Jest tests passed in the final backend run. The actual result column
records the asserted outcome from execution.

### Progress validation service — 11 tests

| Test ID | Input | Expected result | Actual result | Status |
|---|---|---|---|---|
| PV-01 | `0` | Valid | Returned `true` | PASS |
| PV-02 | `100` | Valid | Returned `true` | PASS |
| PV-03 | `45` | Valid | Returned `true` | PASS |
| PV-04 | `37.5` | Valid finite decimal | Returned `true` | PASS |
| PV-05 | `-0.01` | Invalid, below minimum | Returned `false` | PASS |
| PV-06 | `100.01` | Invalid, above maximum | Returned `false` | PASS |
| PV-07 | `'50'` | Invalid type; do not coerce | Returned `false` | PASS |
| PV-08 | `null` | Invalid type | Returned `false` | PASS |
| PV-09 | `undefined` | Invalid/missing value | Returned `false` | PASS |
| PV-10 | `NaN` | Invalid non-finite value | Returned `false` | PASS |
| PV-11 | `Infinity` | Invalid non-finite value | Returned `false` | PASS |

### Progress API — 7 tests

| Test ID | Input / condition | Expected result | Actual result | Status |
|---|---|---|---|---|
| PA-01 | POST progress as string `'50'` | HTTP 400 before model lookups | HTTP 400; no Skill/Progress lookup or create | PASS |
| PA-02 | POST `progress: null` | HTTP 400 before model lookup | HTTP 400; Skill lookup not called | PASS |
| PA-03 | POST values `0` and `100` | Both inclusive boundaries accepted | Both requests returned 201; exact values were passed to create | PASS |
| PA-04 | PUT progress as string `'50'` | HTTP 400 before model lookup | HTTP 400; Progress lookup not called | PASS |
| PA-05 | PUT `progress: null` | HTTP 400 before model lookup | HTTP 400; Progress lookup not called | PASS |
| PA-06 | PUT database lookup rejects | HTTP 500 with server error response | HTTP 500, `{ "message": "Server error" }` | PASS |
| PA-07 | DELETE database operation rejects | HTTP 500 with server error response | HTTP 500, `{ "message": "Server error" }` | PASS |

The original TDD example remains and now imports the production validation
service through `tests/tdd/progressValidation.js`; it was not removed.
Existing tests also cover duplicate progress creation, missing skills,
unauthenticated requests, missing records, and model-level numeric bounds.
