# Section 3.5 — TDD and BDD

## Introduction

Test-Driven Development (TDD) develops behavior through a short RED–GREEN–
REFACTOR cycle: first observe a focused requirement test fail, implement the
smallest correction, then refactor while retaining a passing suite.
Behaviour-Driven Development (BDD) expresses user-visible behavior as
executable Given/When/Then scenarios.

## Project approach

This work focuses on the existing F5 progress API and its progress-value
validation. It promotes validation into a production service shared by the
create and update routes. Unit tests cover the validator's numeric boundaries
and invalid types; Supertest exercises the actual Express routes with mocked
Mongoose model methods. Cucumber scenarios use the same Express app and test
model stubs, without connecting to a database.

The source inspection found no F6 quiz or assessment implementation in the
client, server, or tests. No quiz model, route, scoring rule, attempt limit, or
quiz UI was added or claimed.

## Tools

- Jest and Supertest for backend unit and route tests.
- `@cucumber/cucumber` 13.3.0 for executable Gherkin scenarios.
- Vitest and React Testing Library for the existing frontend suite.
- Node.js 24.15.0; the selected Cucumber release supports Node 24.

## Documents and executable evidence

- [Unit test matrix](./unit-testing.md)
- [TDD cycle](./tdd-cycle.md)
- [BDD scenarios](./bdd-scenarios.md)
- [Cucumber implementation](./cucumber-implementation.md)
- [Coverage summary](./coverage-summary.md)
- [Test evidence and commands](./test-evidence.md)
- [Evidence logs and screenshot instructions](./evidence/README.md)

No application credentials or live database were used. No commits or pushes
were made.
