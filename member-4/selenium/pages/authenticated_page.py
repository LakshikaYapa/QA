from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class AuthenticatedPage:
    NAVIGATION = (By.CSS_SELECTOR, "nav[aria-label='Main navigation']")
    NAV_LINKS = (By.CSS_SELECTOR, "nav[aria-label='Main navigation'] a")
    LOGOUT = (By.CSS_SELECTOR, "button.authenticated-logout")

    def __init__(self, driver: WebDriver):
        self.driver = driver

    def wait_for_navigation(self) -> None:
        WebDriverWait(self.driver, 15).until(
            EC.visibility_of_element_located(self.NAVIGATION)
        )

    def navigation_labels(self) -> list[str]:
        return [
            link.text.strip()
            for link in self.driver.find_elements(*self.NAV_LINKS)
        ]

    def log_out(self) -> None:
        self.driver.find_element(*self.LOGOUT).click()
