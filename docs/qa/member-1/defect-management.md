# Defect Management — Member 1

**Execution date:** 2026-11-25

## Current defect status

No confirmed F1/F2 defect was established during the executed local UI tests. Eight integration cases are blocked by missing MongoDB/API and Cloudinary configuration. No GitHub Issue was filed: the QA repository contains no committed project content, and issue enablement/access and group agreement were not verified.

An exploratory synthetic-invalid-token attempt reached an unrelated dashboard while the API was unavailable; the dashboard then errored on a response served by the Vite frontend rather than the API. This is an environment-induced, out-of-scope observation, not a confirmed application defect, and is excluded from test and defect counts. Do not use the public/live demo for retesting.

## Tracker and report format

Use GitHub Issues for one reproducible defect per issue if the group confirms the correct repository, permissions, and team access. Otherwise agree on one shared authorized tracker. Link the failing test case and requirement. Do not create speculative issues for unverified expectations.

```markdown
## Defect ID
<GitHub issue number or agreed tracker ID>

## Title
[Feature] Concise observable failure

## Description
<Observed behavior and impact; separate observation from cause hypothesis>

## Severity
<Critical / High / Medium / Low and impact rationale>

## Priority
<P1 / P2 / P3 / P4, agreed during triage>

## Environment
<Build, OS, browser/client, database/service dependencies; synthetic account/role only>

## Preconditions
<Required state and safe test data; never include passwords, tokens, or secrets>

## Reproduction steps
1. ...

## Expected result
<Approved requirement or test-case outcome>

## Actual result
<Observed result, frequency, and date>

## Evidence
<Redacted screenshot or sanitized log path>

## Status / owner
<Lifecycle state and responsible person>

## Root cause / recommendation
<Only evidence-backed cause; label hypotheses and recommendations separately>
```

### Triage

Severity describes impact: **Critical** (severe system/security/data impact), **High** (major feature unavailable), **Medium** (limited impact or workaround), **Low** (minor/cosmetic). Priority describes urgency and is agreed by the group; it is not the same as severity. Apply any official course definitions if supplied. Reproduce where possible, check for duplicates, agree expected behavior, and redact sensitive data.

## Bug lifecycle

`New → Assigned → Fixed → Verified → Closed`

- **New:** report received with steps and evidence.
- **Assigned:** triaged and assigned to a responsible feature owner.
- **Fixed:** owner reports a fix ready for testing; not yet verified.
- **Verified:** tester reproduces the original steps in a recorded build/environment and confirms the issue is resolved; relevant regression checks pass.
- **Closed:** evidence and disposition reviewed and issue closed.
- **Reopened:** verification fails or the defect recurs; add evidence and reassign.

GitHub Issues may not expose each state as a built-in status. Preserve dated transitions in labels/comments and do not equate issue closure with independent verification.

For the first real defect, record its actual progression and evidence at every stage from New through Assigned, Fixed, Verified, and Closed. There is no genuine defect to document as an example now; do not invent an ID or claim a fix/verification.

## Root Cause Analysis

RCA identifies the evidence-backed underlying condition that allowed a confirmed defect, rather than assigning blame. Establish the failure first, distinguish verified evidence from hypotheses, examine relevant code/configuration and reproduction, then identify corrective and preventive actions. A “5 Whys” or timeline is suitable where proportionate.

### RCA template

```markdown
# Root Cause Analysis — <defect ID>
- Date / author / reviewers:
- Affected requirement, build, and environment:
- Impact / severity:

## Incident summary and timeline
<Observed events and status changes>

## Verified evidence
<Reproduction, logs, test and source references; redact secrets>

## Analysis
- Symptom:
- Contributing factors:
- Root cause (evidence-backed):
- Unverified hypotheses:

## Actions
- Correction / owner / target:
- Regression or detection improvement:
- Prevention/process action:
- Residual risk:

## Validation and review
- Retest evidence/build/environment:
- Reviewer/date:
- Follow-up status:
```

## Group defect intake workflow

1. Each member submits a reproducible report with environment, preconditions, steps, expected/actual results, and redacted evidence.
2. Member 1 checks completeness, traceability, duplicates, and whether the expected behavior is approved; request missing information rather than guessing.
3. The group agrees validity, severity, priority, owner, and disposition. The feature owner investigates/fixes their area; Member 1 coordinates records and verification.
4. Keep fix build and retest evidence on the same tracker item. Verify the original steps and relevant regressions; reopen if unresolved.
5. Reconcile open, blocked, deferred, and closed items before reporting. Report counts only from a dated tracker snapshot.
