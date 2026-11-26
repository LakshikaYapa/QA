# White-Box Test Cases

All cases use the real `Roadmap` component and mocked HTTP client. The
`loadRoadmapProgress` cases are in
`client/src/test/white-box-roadmap.test.tsx`; the add-step case is the existing
test in `client/src/test/profile-roadmap-theme.test.tsx`.

| Test Case ID | Function | Input | Preconditions | Execution path | Expected result | Actual result | Status |
|---|---|---|---|---|---|---|---|
| WB-F1-01 | `loadRoadmapProgress` | No value stored for the career key | Two roadmap skills; local storage has no roadmap value | Saved-value false → empty array → array branch → return | 0 of 2 steps complete; progress 0 | UI showed 0 of 2; progress bar value was 0 | PASS |
| WB-F1-02 | `loadRoadmapProgress` | `["React", 42, null, "TypeScript"]` | Two roadmap skills | Saved-value true → JSON parse → array branch → string filter | Only the two strings count; 2 of 2 complete | UI showed 2 of 2; progress bar value was 100 | PASS |
| WB-F1-03 | `loadRoadmapProgress` | `{"completed":["React"]}` | Two roadmap skills | Saved-value true → JSON parse → non-array branch | Empty completion list; progress 0 | UI showed 0 of 2 | PASS |
| WB-F1-04 | `loadRoadmapProgress` | Malformed JSON (`{invalid json`) | Matching roadmap key is stored | JSON parse throws → catch | Empty completion list; progress 0 | UI showed 0 of 2 | PASS |
| WB-F1-05 | `loadRoadmapProgress` | `localStorage.getItem` throws | Storage method is mocked to throw | Storage exception → catch | Empty completion list; progress 0 | UI showed 0 of 2 | PASS |
| WB-F2-01 | `toggleStep` | Click Mark Complete when TypeScript is not complete | Saved completion contains React only | Skill absent → append | 2 of 2 complete and both steps persisted | Existing interaction test observed 100% progress and persisted `["React","TypeScript"]` | PASS |
| WB-F2-02 | `toggleStep` | Click Undo when React is complete | Saved completion contains React | Skill present → remove | 0 of 2 complete and empty list persisted | UI showed 0 of 2; local storage contained `[]` | PASS |

WB-F2-01 is an existing test, not a duplicate new test. Six new tests were
added for the uncovered persistence/error cases and the remove branch.
