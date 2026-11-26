# Cucumber Implementation

## Dependency and compatibility

The backend uses `@cucumber/cucumber` **13.3.0**. Its published engine range
includes Node 24; the verified environment is Node.js 24.15.0. Cucumber is
installed only as a backend development dependency.

## Files and configuration

- Gherkin: `server/tests/bdd/features/progress.feature`
- Step definitions: `server/tests/bdd/step-definitions/progress.steps.js`
- Script: `server/package.json` → `test:bdd`

The script invokes the installed Cucumber JavaScript CLI through Node directly:

```json
"test:bdd": "node node_modules/@cucumber/cucumber/bin/cucumber.js tests/bdd/features --require tests/bdd/step-definitions/**/*.js"
```

The direct Node invocation is deliberate: the workspace path contains spaces,
and the initial Windows command-shim invocation split the path. The corrected
script was executed successfully.

## Test isolation

Step definitions import the real Express app and use Supertest. They replace
the relevant Mongoose model methods per scenario and restore them afterward.
The scenarios do not open a database connection. A test-only Gemini key is
provided only to allow the application module to initialize; no Gemini or
Cloudinary request is made.

## Execution

From `server`:

```powershell
npm run test:bdd
```

Actual final result: **3 scenarios passed, 18 steps passed**. The captured
terminal output is in [cucumber-run.txt](./evidence/cucumber-run.txt).
