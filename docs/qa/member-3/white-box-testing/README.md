# Section 3.4 — White-Box Testing

## Scope

This evidence analyses two existing F5 roadmap-progress functions in
`client/src/pages/Roadmap/Roadmap.tsx`:

1. `loadRoadmapProgress(title)` reads and validates saved completion data.
2. `toggleStep(skill)` adds or removes a completed roadmap step.

The inspected client, server, and test sources contain no quiz or assessment
implementation for F6. The section therefore uses two existing F5 functions
and does not claim that F6 functionality exists.

No production behavior was changed. The automated tests mount the real
`Roadmap` component and exercise its actual functions through the UI; Axios is
mocked so the tests do not require external services.

## Evidence

- [Function 1 analysis](./function-1-analysis.md)
- [Function 2 analysis](./function-2-analysis.md)
- [Function 1 CFG](./cfg-function-1.mmd)
- [Function 2 CFG](./cfg-function-2.mmd)
- [Test cases](./test-cases.md)
- [Cyclomatic complexity](./cyclomatic-complexity.md)
- [Coverage summary](./coverage-summary.md)
- [Test execution evidence](./test-evidence.md)

The Mermaid files are editable diagram sources. No PNG or SVG exports were
created.
