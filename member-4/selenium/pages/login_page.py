from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class LoginPage:
    EMAIL = (By.ID, "email")
    PASSWORD = (By.ID, "password")
    SUBMIT = (By.CSS_SELECTOR, "button.login-submit")
    ERROR = (By.CSS_SELECTOR, ".login-error")
    EMAIL_ERROR = (By.CSS_SELECTOR, ".login-field-error")

    def __init__(self, driver: WebDriver, base_url: str):
        self.driver = driver
        self.base_url = base_url.rstrip("/")

    def open(self) -> None:
        self.driver.get(f"{self.base_url}/login")

    def sign_in(self, email: str, password: str) -> None:
        self.driver.find_element(*self.EMAIL).send_keys(email)
        self.driver.find_element(*self.PASSWORD).send_keys(password)
        self.driver.find_element(*self.SUBMIT).click()

    def error_message(self) -> str:
        return WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located(self.ERROR)
        ).text

    def email_error_message(self) -> str:
        return WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located(self.EMAIL_ERROR)
        ).text
