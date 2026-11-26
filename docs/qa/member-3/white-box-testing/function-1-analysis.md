# Function 1 — `loadRoadmapProgress`

## Source and purpose

- **File:** `client/src/pages/Roadmap/Roadmap.tsx`
- **Location:** line 35
- **Function form:** local arrow function, `loadRoadmapProgress(title: string)`
- **Feature:** F5 — Lessons and Progress Tracking

The function reads `roadmap-${title}` from browser local storage. When a saved
value parses as an array, it returns only string entries. Missing data, a
non-array JSON value, or a storage/JSON parsing exception results in an empty
array.

## Interface

| Item | Description |
|---|---|
| Input | `title: string`, used to build the local-storage key |
| Output | `string[]` of completed step names; `[]` for missing, invalid-shape, or inaccessible data |
| Side effect | Reads browser local storage; it does not call an API |

## Decision points

1. The `saved ? JSON.parse(saved) : []` conditional distinguishes saved data
   from a missing key (line 38).
2. `Array.isArray(parsed)` selects filtering or the empty-array result
   (line 40).
3. `localStorage.getItem` and `JSON.parse` can throw; the `catch` returns `[]`
   (lines 36–44).
4. The `filter` predicate keeps string values and rejects non-strings
   (line 41). This predicate is an independently instrumented nested callback,
   not a decision in the outer function's CFG.

## White-box suitability

The function is a core F5 persistence boundary with distinct valid, absent,
malformed, wrong-shape, and storage-error paths. Tests can cover those outcomes
through the actual page while verifying the displayed completion count and
progress bar. The mixed-value input also checks both outcomes of the nested
filter predicate without copying the implementation into test code.
