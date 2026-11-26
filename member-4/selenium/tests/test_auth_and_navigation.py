from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from conftest import BASE_URL
from pages.authenticated_page import AuthenticatedPage
from pages.login_page import LoginPage
from pages.register_page import RegisterPage


def test_login_page_shows_existing_sign_in_form(driver):
    page = LoginPage(driver, BASE_URL)
    page.open()

    assert driver.find_element(*page.EMAIL).is_displayed()
    assert driver.find_element(*page.PASSWORD).is_displayed()
    assert driver.find_element(*page.SUBMIT).text.startswith("Sign In")
    assert driver.find_element(By.LINK_TEXT, "Create one").is_displayed()


def test_login_rejects_missing_email(driver):
    page = LoginPage(driver, BASE_URL)
    page.open()
    driver.find_element(*page.PASSWORD).send_keys("synthetic-test-password")
    driver.find_element(*page.SUBMIT).click()

    assert "Email is required" in page.email_error_message()
    assert driver.current_url.endswith("/login")


def test_unauthenticated_user_is_redirected_from_dashboard(driver):
    driver.get(f"{BASE_URL}/dashboard")

    WebDriverWait(driver, 10).until(EC.url_contains("/login"))
    assert driver.current_url.endswith("/login")


def test_registered_learner_can_sign_in_and_navigate(driver, test_account):
    login = LoginPage(driver, BASE_URL)
    login.open()
    login.sign_in(test_account.email, test_account.password)

    authenticated = AuthenticatedPage(driver)
    authenticated.wait_for_navigation()
    assert driver.current_url.endswith("/dashboard")
    assert {
        "Dashboard",
        "Profile",
        "Skills",
        "Progress",
        "Career Paths",
        "Roadmap",
        "Projects",
        "Portfolio",
    }.issubset(set(authenticated.navigation_labels()))


def test_logout_clears_session_and_protects_dashboard(driver, test_account):
    login = LoginPage(driver, BASE_URL)
    login.open()
    login.sign_in(test_account.email, test_account.password)

    authenticated = AuthenticatedPage(driver)
    authenticated.wait_for_navigation()
    authenticated.log_out()
    WebDriverWait(driver, 10).until(EC.url_contains("/login"))

    assert driver.execute_script(
        "return window.localStorage.getItem('token')"
    ) is None
    driver.get(f"{BASE_URL}/dashboard")
    WebDriverWait(driver, 10).until(EC.url_contains("/login"))
    assert driver.current_url.endswith("/login")


def test_registration_keeps_weak_password_submission_disabled(driver):
    page = RegisterPage(driver, BASE_URL)
    page.open()
    driver.find_element(*page.NAME).send_keys("Synthetic QA Learner")
    driver.find_element(*page.EMAIL).send_keys("weak-password@example.invalid")
    driver.find_element(*page.PASSWORD).send_keys("weak")

    assert not page.password_submit_enabled()
