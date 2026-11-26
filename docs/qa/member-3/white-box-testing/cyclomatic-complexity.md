# Cyclomatic Complexity

Both calculations use one connected component (`P = 1`). Function 1 models
the storage-read and JSON-parse exceptions as separate edges into the same
catch path; function 2 contains one conditional expression. These are
source-level CFGs, with nested callbacks called out separately in the function
analysis.

## Calculation table

| Function | Nodes (N) | Edges (E) | P | Calculation | V(G) |
|---|---:|---:|---:|---|---:|
| `loadRoadmapProgress` | 10 | 13 | 1 | `13 - 10 + 2(1)` | 5 |
| `toggleStep` | 6 | 6 | 1 | `6 - 6 + 2(1)` | 2 |

## Function 1: `loadRoadmapProgress`

The CFG's ten nodes and thirteen edges are enumerated in
[cfg-function-1.mmd](./cfg-function-1.mmd). Its four independent outcomes are:

1. Local-storage read throws.
2. Read succeeds with no saved value (the ternary uses `[]`).
3. Saved JSON parses successfully, including an array.
4. JSON parsing throws.
5. Parsed value is not an array.

Thus `V(G) = E - N + 2P = 13 - 10 + 2 = 5`. Equivalently, the model has four
binary decision points (storage-read success/error, saved/missing, parse
success/error, and array/non-array) and `V(G) = 4 + 1 = 5`.

| Path ID | Execution path (CFG nodes) | Input condition | Expected behaviour |
|---|---|---|---|
| P1 / WB-F1-05 | 1 → 2 → 9 → 10 | Storage read throws | Catch returns `[]` |
| P2 / WB-F1-01 | 1 → 2 → 3 → 5 → 6 → 7 → 10 | No saved value | Empty array is returned |
| P3 / WB-F1-02 | 1 → 2 → 3 → 4 → 6 → 7 → 10 | Saved value is a JSON array with strings and non-strings | Only string entries are returned |
| P4 / WB-F1-03 | 1 → 2 → 3 → 4 → 6 → 8 → 10 | Saved JSON parses to a non-array | Empty array is returned |
| P5 / WB-F1-04 | 1 → 2 → 3 → 4 → 9 → 10 | Saved value is malformed JSON | Catch returns `[]` |

These five paths form a basis for the five independent paths in the CFG. The
two exception paths, missing/saved values, and array/non-array outcomes each
add a distinct edge to the basis.

The list-filter callback is a separate nested function. The mixed-value test
checks its string and non-string outcomes; it is not counted as an outer
function CFG decision. The outer function has no explicit loop; iteration is
performed by JavaScript's `Array.prototype.filter`.

## Function 2: `toggleStep`

The six nodes and six edges are enumerated in
[cfg-function-2.mmd](./cfg-function-2.mmd). The single decision is whether the
requested skill is already in `completedSteps`:

`V(G) = E - N + 2P = 6 - 6 + 2 = 2`, also `1 decision + 1 = 2`.

The independent basis consists of the append path and the remove path. There
is no explicit loop in `toggleStep`; the remove branch delegates list
filtering to the array method.

| Path ID | Execution path (CFG nodes) | Input condition | Expected behaviour |
|---|---|---|---|
| P1 / WB-F2-01 | 1 → 2 → 3 → 5 → 6 | Skill is absent from `completedSteps` | Append the skill |
| P2 / WB-F2-02 | 1 → 2 → 3 → 4 → 6 | Skill is present in `completedSteps` | Remove the skill |
