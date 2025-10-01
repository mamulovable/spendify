import re
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the new /dealfuel page
        page.goto("http://127.0.0.1:8080/dealfuel")

        # Check for DealFuel branding in the title and hero section
        expect(page).to_have_title(re.compile("DealFuel"))

        # Check for the main heading
        hero_heading = page.locator('div:has-text("DealFuel Exclusive Lifetime Deal")').first
        expect(hero_heading).to_be_visible()

        # Check for the banner text
        banner_text = page.locator('span:has-text("Exclusive DealFuel Lifetime Deal - Limited Time Offer")')
        expect(banner_text).to_be_visible()

        # Take a screenshot for visual confirmation
        page.screenshot(path="jules-scratch/verification/dealfuel_page.png")

        browser.close()

if __name__ == "__main__":
    run_verification()