from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver


class RegisterPage:
    NAME = (By.ID, "register-name")
    EMAIL = (By.ID, "register-email")
    PASSWORD = (By.ID, "register-password")
    SUBMIT = (By.CSS_SELECTOR, "button.register-submit")

    def __init__(self, driver: WebDriver, base_url: str):
        self.driver = driver
        self.base_url = base_url.rstrip("/")

    def open(self) -> None:
        self.driver.get(f"{self.base_url}/register")

    def password_submit_enabled(self) -> bool:
        return self.driver.find_element(*self.SUBMIT).is_enabled()
