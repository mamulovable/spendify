from playwright.sync_api import sync_playwright, expect, Page

def verify_pdf_upload(page: Page):
    """
    This test verifies that the PDF upload flow is functional.
    It uploads a sample PDF and checks that the application processes it,
    even if it results in a "no transactions found" error, which is expected
    for a non-bank-statement PDF.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://127.0.0.1:8080/")

    # 2. Act: Upload a sample PDF file.
    # The file input is hidden, but Playwright can still interact with it.
    file_input = page.locator("#pdf-upload")

    # Use an existing PDF file from the repo for the test.
    file_path = "formspree.io-Formspree.pdf"
    file_input.set_input_files(file_path)

    # 3. Assert: Check that processing starts and then shows an error for the invalid file.
    # We expect to see a "Processing..." indicator.
    # The timeout is increased to allow for the app to initialize.
    expect(page.get_by_text("Processing...")).to_be_visible(timeout=15000)

    # Since formspree.io-Formspree.pdf is not a bank statement, we expect
    # the processing to finish with an error message. This confirms the
    # processing logic was triggered. We wait up to 60 seconds.
    error_message_locator = page.get_by_text("Error processing file")
    expect(error_message_locator).to_be_visible(timeout=60000)

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot saved to jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_pdf_upload(page)
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
            # Re-raise the exception to fail the script
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    main()