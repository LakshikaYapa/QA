# STLC and Reusable Test Case Format — Member 1

**Execution date:** 2026-11-25
**Environment:** See [test-execution-report.md](./test-execution-report.md). The formal assignment documents were not present in the QA repository, so this mapping is based on the assignment prompt and inspected SUT.

## Project-specific STLC mapping

| STLC phase | Application to F1/F2 | Evidence / output |
|---|---|---|
| Requirement analysis | Confirm assigned responsibilities against the official brief; inspect actual registration, login, profile, auth, and upload behavior. Formal brief/work split unavailable. | Feature register and unresolved requirement questions |
| Test planning | Define F1/F2 boundary, risks, environment, test data, entry/exit criteria, and safe services. | [test-plan.md](./test-plan.md) |
| Test design | Prepare positive/negative/boundary cases from actual UI constraints and API behavior. Mark conditional features as not implemented only when source/UI inspection supports it. | [F1 cases](./f1-registration-login-test-cases.md) and [F2 cases](./f2-profile-test-cases.md) |
| Environment setup | Restore locked client/server dependencies; start local Vite; identify missing MongoDB URI and Cloudinary configuration. | Environment and blocker record in execution report |
| Test execution | Execute manual/browser cases; record build, date, actual result, status, and screenshot evidence. Do not submit successful auth forms without a safe backend. | Case tables and `evidence/` |
| Defect reporting / triage | Report only reproducible failures against an agreed expectation; assign owner, severity, priority, and status with the group. | [defect-management.md](./defect-management.md) |
| Retest / regression | Retest the original steps and related cases against a recorded build and the same test environment. | Updated case result and issue history |
| Closure / reporting | Reconcile statuses and open dependencies; report coverage using executed tests only. | [test-execution-report.md](./test-execution-report.md) |

## Reusable manual test case template

Copy this block for each scenario. Leave actual result and evidence empty until execution.

| Field | Value |
|---|---|
| Test Case ID | Unique ID, e.g. `F1-REG-01` |
| Feature / requirement | Feature and approved requirement reference |
| Description | One behavior to verify |
| Preconditions | Required SUT state, account/role, data, and service availability |
| Steps | Numbered, repeatable user actions |
| Expected result | Observable outcome tied to an approved requirement or documented constraint |
| Actual result | What occurred, including environment/build; leave empty until run |
| Status | `PASS` / `FAIL` / `BLOCKED` / `NOT EXECUTED` |
| Evidence | Screenshot or sanitized log filename; never attach secrets |
| Defect ID | Tracker reference, if an observed failure is filed |
| Tester / date | Executor and execution date |

### Status definitions

- **PASS:** performed and expected result observed.
- **FAIL:** performed and expected result not observed; link a defect or record an agreed disposition.
- **BLOCKED:** the test could not be performed because a prerequisite, service, or safe test account was unavailable.
- **NOT EXECUTED:** not run, including conditional functionality not implemented or excluded. Explain why.

Source inspection alone does not count as a passed functional test. A case that cannot reach the real API must not be reported as a successful integration test.
