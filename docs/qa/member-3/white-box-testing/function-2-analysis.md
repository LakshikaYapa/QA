# Function 2 — `toggleStep`

## Source and purpose

- **File:** `client/src/pages/Roadmap/Roadmap.tsx`
- **Location:** line 137
- **Function form:** local arrow function, `toggleStep(skill: string)`
- **Feature:** F5 — Lessons and Progress Tracking

The function applies a React state update that toggles one skill in the current
roadmap's `completedSteps`. It removes the skill if already completed;
otherwise it appends the skill. The containing page persists the updated list
to local storage.

## Interface

| Item | Description |
|---|---|
| Input | `skill: string`, the roadmap step to toggle |
| Output | No direct return value; schedules a roadmap state update |
| State effect | Removes an existing completion or adds a missing completion while preserving other roadmap state |

## Decision point

`current.completedSteps.includes(skill)` selects the remove or append branch
(line 140). The state-updater and `filter` callbacks are nested functions
within this source range and are separately measured by coverage.

## White-box suitability

This function implements the reversible completion action central to F5. Its
two outcomes have clearly observable behavior: the completed-step count,
progress percentage, button label, and persisted local-storage list. The
existing test covers adding a step; the new white-box case covers undoing one.
