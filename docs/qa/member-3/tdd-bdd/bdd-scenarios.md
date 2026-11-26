# BDD Scenarios

The executable feature is
[`progress.feature`](../../../../server/tests/bdd/features/progress.feature).
It expresses real F5 progress API behavior; it contains no quiz scenario
because F6 is not implemented.

## Scenario outline: inclusive progress boundaries

```gherkin
Scenario Outline: Learners can record progress at either inclusive boundary
  Given an authenticated learner
  And the learner owns skill "skill-1"
  When the learner records <value> percent progress
  Then the API creates a progress record at <value> percent

  Examples:
    | value |
    | 0     |
    | 100   |
```

The examples verify that both endpoints of the supported range are accepted
and stored unchanged.

## Scenario: unavailable progress store

```gherkin
Scenario: A database failure is reported when loading progress
  Given an authenticated learner
  And the progress database is unavailable
  When the learner loads progress
  Then the API responds with a server error
```

This scenario verifies the API's actual error response without requiring a
live database. The final Cucumber run executed **3 scenarios** (the two
outline examples plus the database-failure scenario), with all **18 steps
passing**.
