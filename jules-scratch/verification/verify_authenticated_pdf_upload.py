from playwright.sync_api import sync_playwright, expect, Page
import os

def verify_authenticated_pdf_upload(page: Page):
    """
    This test verifies the PDF upload flow for an authenticated user.
    It logs in, navigates to the upload page, uploads a sample PDF,
    and checks that the application processes it.
    """
    # 1. Arrange: Go to the login page.
    page.goto("http://127.0.0.1:8080/auth")

    # 2. Act: Log in to the application.
    # Use dummy credentials as we only need to pass the client-side checks.
    # In a real-world scenario, you would use test user credentials.
    email_input = page.locator("#email-signin")
    password_input = page.locator("#password-signin")

    # Wait for the email input to be visible to ensure the page has loaded
    expect(email_input).to_be_visible(timeout=15000)

    email_input.fill("test@example.com")
    password_input.fill("password123")

    # Click the "Sign In" button
    page.get_by_role("button", name="Sign In").click()

    # 3. Assert: Wait for navigation to the dashboard and then go to the upload page.
    # We expect to be redirected to the dashboard after login.
    expect(page).to_have_url("http://127.0.0.1:8080/dashboard", timeout=30000)

    # Navigate to the upload page
    page.goto("http://127.0.0.1:8080/dashboard/upload")

    # 4. Act: Upload a sample PDF file.
    file_input = page.locator("#pdf-upload")
    expect(file_input).to_be_visible(timeout=15000)

    file_path = "formspree.io-Formspree.pdf"
    file_input.set_input_files(file_path)

    # 5. Assert: Check for the processing indicator and the expected error message.
    expect(page.get_by_text("Processing...")).to_be_visible(timeout=15000)

    # We expect an error because the PDF is not a valid bank statement.
    error_message_locator = page.get_by_text("Error processing file")
    expect(error_message_locator).to_be_visible(timeout=60000)

    # 6. Screenshot: Capture the final result.
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot saved to jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_authenticated_pdf_upload(page)
        except Exception as e:
            print(f"Verification script failed: {e}")
            # Take a screenshot on error for debugging
            page.screenshot(path="jules-scratch/verification/error.png")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    main()