import os
import secrets
import urllib.error
import urllib.request
import json
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:5173").rstrip("/")
API_URL = os.getenv("API_URL", "http://127.0.0.1:5000").rstrip("/")
SCREENSHOTS_DIR = Path(
    os.getenv(
        "SCREENSHOTS_DIR",
        str(Path(__file__).resolve().parents[2] / "screenshots"),
    )
)


@dataclass(frozen=True)
class TestAccount:
    email: str
    password: str


@pytest.fixture
def driver():
    options = Options()
    if os.getenv("HEADLESS", "true").lower() == "true":
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1440,1000")

    driver_path = os.getenv("CHROMEDRIVER_PATH")
    service = Service(executable_path=driver_path) if driver_path else Service()
    browser = webdriver.Chrome(service=service, options=options)
    browser.implicitly_wait(2)
    yield browser
    browser.quit()


@pytest.fixture(scope="session")
def test_account() -> TestAccount:
    email = f"qaeng-{uuid4().hex}@example.invalid"
    password = f"M4-Test-{secrets.token_hex(8)}!Aa1"
    payload = json.dumps(
        {
            "name": "Member Four Test",
            "email": email,
            "password": password,
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        f"{API_URL}/api/auth/register",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            body = json.loads(response.read().decode("utf-8"))
            if response.status != 201 or body.get("user", {}).get("email") != email:
                pytest.fail(
                    f"Test-account setup returned an unexpected response "
                    f"(HTTP {response.status})."
                )
    except urllib.error.HTTPError as error:
        pytest.fail(
            f"Test-account setup failed with HTTP {error.code}; "
            "check that the API uses an isolated MongoDB test database."
        )
    except urllib.error.URLError as error:
        pytest.fail(
            f"Could not reach the API at {API_URL}: {error.reason}"
        )

    return TestAccount(email=email, password=password)


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    if report.when != "call" or not report.failed:
        return

    browser = item.funcargs.get("driver")
    if browser is None:
        return

    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    screenshot = SCREENSHOTS_DIR / f"{item.name}.png"
    if not browser.save_screenshot(str(screenshot)):
        pytest.fail(f"Could not save failure screenshot to {screenshot}")
