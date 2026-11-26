# Member 4 — Automation, CI/CD, Performance and Security Testing

## Scope verified from the application

The application currently implements learner registration/login, JWT-protected
pages and API routes, profile, skills, progress, career-path recommendations,
roadmaps, projects, and a portfolio view.

The assigned example features do **not** map to working functionality:

- **F7 — Certificates:** no certificate page, API route, model, or download
  flow was found. No certificate tests or endpoints are invented here.
- **F8 — Instructor/Admin panel:** no instructor/admin UI, role field, or
  role-specific route was found. Tests cover existing authentication and
  per-user resource ownership instead; they do not claim role-based access.

The backend is Express/Mongoose with MongoDB and JWT authentication. Use a
disposable local MongoDB database for tests; do not point test runs at
production, a shared Atlas database, or real user accounts.

## Contents

```text
member-4/
  selenium/
    pages/                 Page Object Model classes
    tests/                 Six Selenium UI cases and test setup
    requirements.txt
    pytest.ini
  postman/
    skill-career-api.postman_collection.json
    skill-career-api.postman_environment.json
  jmeter/
    skill-career-api-load.jmx
  security/
    security-test-record.md
  reports/                 Test output destination (created on execution)
  screenshots/             Selenium failure screenshots
```

## Requirements

- Node.js 20.19 or newer, npm, and the project's existing dependencies.
- A local MongoDB Community Server on `127.0.0.1:27017` (or an explicitly
  authorized isolated test MongoDB URI).
- Python 3.10+ and Google Chrome. Selenium Manager obtains a matching driver
  when it is not already installed.
- Newman is invoked by `npx` for API tests; it does not need to be added to the
  application's dependency manifest.
- Apache JMeter 5.6.3 and a Java runtime for the load plan. JMeter is not
  required for the Selenium or API checks.
- A running Docker Desktop engine can be used to start a disposable local
  MongoDB container if MongoDB Community Server is not installed.

## Safe local setup

First install the application's existing dependencies, if not already
installed:

```powershell
cd D:\QA-publish\server
npm ci
cd ..\client
npm ci
```

Start a **dedicated disposable** MongoDB database. In a backend terminal,
override environment values for this test process only; do not put these
values in committed files:

```powershell
docker run --rm --name member4-mongo -p 27017:27017 -d mongo:7

cd D:\QA-publish\server
$env:MONGO_URI = 'mongodb://127.0.0.1:27017/skill-career-platform-member4-test'
$env:JWT_SECRET = [guid]::NewGuid().ToString('N')
$env:PORT = '5000'
npm start
```

In another terminal, launch the frontend against that local API:

```powershell
cd D:\QA-publish\client
$env:VITE_API_URL = 'http://127.0.0.1:5000'
npm run dev -- --host 127.0.0.1
```

The backend requires an explicit MongoDB URI and does not fall back to an
embedded database. Stop the disposable MongoDB container after testing with
`docker stop member4-mongo`.

## Selenium UI tests

The suite uses Selenium WebDriver, pytest, and Page Object Model classes. It
has six tests covering login page rendering, missing-email validation,
unauthenticated dashboard redirection, valid synthetic-user login and
navigation, logout/protected-route behavior, and weak-password registration
validation.

The suite creates one synthetic user through the existing registration API
for authenticated tests. This writes data to MongoDB, so only run it against
the disposable test database above.

```powershell
cd D:\QA-publish\member-4\selenium
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:BASE_URL = 'http://127.0.0.1:5173'
$env:API_URL = 'http://127.0.0.1:5000'
$env:HEADLESS = 'true'
python -m pytest
```

Expected result: `6 passed` when Chrome, the frontend, backend, and test
MongoDB are available. Failed UI tests save screenshots under
`member-4/screenshots/`. Setup/network/database errors fail the suite; they
are not silently skipped.

### Results verified in this workspace

- The published repository's backend Jest suite passed: 6 suites and 33 tests.
- The frontend Vitest suite passed: 1 file and 33 tests.
- The frontend production build passed.
- Four browser-only Selenium tests passed against the published frontend:
  login form rendering, missing-email validation, protected-route redirect,
  and weak-password registration.
- The two tests needing a created account and successful authenticated
  navigation/logout require the backend and MongoDB; they were not completed
  because no local MongoDB service was available.

## Postman / Newman API tests

The collection targets existing routes only. It tests API health, account
registration and duplicate/weak-password rejection, login success/failure,
protected profile access, skill creation/listing, cross-user skill update
rejection, and malformed project-ID validation. It creates two synthetic
accounts and one skill, so use the same disposable database.

```powershell
cd D:\QA-publish\server
npx --yes newman@6.2.3 run D:\QA-publish\member-4\postman\skill-career-api.postman_collection.json `
  --environment D:\QA-publish\member-4\postman\skill-career-api.postman_environment.json `
  --bail `
  --reporters cli,junit `
  --reporter-junit-export D:\QA-publish\member-4\reports\newman-results.xml
```

Expected result: all collection assertions pass. A non-zero Newman exit code
means the run failed. No real credentials or tokens are stored in the
collection/environment exports.

Database-backed API tests require the disposable MongoDB service. The
GitHub Actions workflow provisions MongoDB as a service for CI.

## Backend authentication middleware unit tests

The published repository already contains Jest tests for backend routes,
models, and authentication middleware. Run those with:

```powershell
cd D:\QA-publish
npm test --prefix server
```

The authentication middleware cases include missing, malformed, expired, and
valid bearer tokens. The CI workflow runs the complete existing backend test
suite; no duplicate authentication unit test is added here.

## JMeter performance plan — approval required before execution

`jmeter/skill-career-api-load.jmx` contains sequential 50-user and 100-user
scenarios, each with a 10-second ramp-up. Each virtual user calls the existing
health GET route and login POST route once. Login assertions require valid
disposable test-account credentials supplied at run time. The plan has **not**
been run. Do not run it until the user approves and confirms the local/test
target is authorized.

After approval, use a test-only properties file outside the repository. It
must contain a valid test account and the local host/port, and must not be
committed or shared:

```text
baseHost=127.0.0.1
basePort=5000
baseProtocol=http
loginEmail=<disposable-test-email>
loginPassword=<disposable-test-password>
```

Create the private local folder and open a text editor to save that file:

```powershell
New-Item -ItemType Directory -Force "$env:LOCALAPPDATA\Member4"
notepad "$env:LOCALAPPDATA\Member4\load-test.properties"
```

Replace both placeholders with a synthetic test account before running JMeter.

```powershell
jmeter -n `
  -t D:\QA-publish\member-4\jmeter\skill-career-api-load.jmx `
  -q "$env:LOCALAPPDATA\Member4\load-test.properties" `
  -l D:\QA-publish\member-4\reports\jmeter-results.jtl `
  -e -o D:\QA-publish\member-4\reports\jmeter-html
```

Use a new/empty output folder for each HTML report run. Review average and
90th-percentile response times, throughput, and error percentage in the
report. A high error percentage or a login assertion failure invalidates
performance conclusions; record machine specs, MongoDB configuration, and
test-account setup with the results. Do not run against production or an
external host.

## Security test status

See [security/security-test-record.md](./security/security-test-record.md).
The source review found no substantiated vulnerabilities in the requested
categories; dynamic checks must still be run against the local isolated test
environment before recording runtime results.

## CI/CD status and workflow

The workflow is at `.github/workflows/tests.yml` in this QA repository. It
starts a disposable MongoDB service, runs the existing backend and frontend
tests, QA-owned middleware tests, builds the frontend, then runs Newman and
headless Selenium. It intentionally does not run JMeter.

The published QA repository is
`https://github.com/LakshikaYapa/QA`. Pushes and pull requests that change
application or QA test files trigger the workflow. Open the repository's
**Actions** tab, select **Member 4 QA checks**, and inspect the latest run.
A green check indicates success; open a red run and its failed job step to
diagnose a failure. Do not report CI as verified until a successful run is
visible.

## Evidence checklist

- Capture the pytest summary and Selenium screenshots only for failed cases.
- Save the Newman CLI summary and JUnit XML report.
- After approved JMeter execution, save the HTML dashboard and JTL results.
- Record environment, date, run identifier, and actual outcome for each run.
- Never capture real passwords, database URIs, API keys, or bearer tokens.
