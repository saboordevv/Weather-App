import os
from playwright.sync_api import sync_playwright

def generate_screenshots():
    # Ensure screenshot directory exists
    os.makedirs("/home/jules/verification/linkedin", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Setup common context settings (permissions, mock geolocation)
        context_opts = {
            "permissions": ["geolocation"],
            "geolocation": {"latitude": 24.8607, "longitude": 67.0011}
        }

        # -------------------------------------------------------------
        # 1. DESKTOP HERO SCREENSHOT (1280x800)
        # -------------------------------------------------------------
        context_desktop = browser.new_context(viewport={"width": 1280, "height": 800}, **context_opts)
        page = context_desktop.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_timeout(3000) # wait for API loading

        # Let's search for "Karachi" to display a beautiful default city
        page.fill("#location", "Karachi")
        page.click("#searchBtn")
        page.wait_for_timeout(2000)

        # Screenshot of the Hero section on desktop
        page.screenshot(path="/home/jules/verification/linkedin/desktop_hero.png")
        print("Generated desktop_hero.png")

        # -------------------------------------------------------------
        # 2. MOBILE VIEW (390x844 - iPhone 12/13/14 Pro style)
        # -------------------------------------------------------------
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=3,
            **context_opts
        )
        page_mobile = context_mobile.new_page()
        page_mobile.goto("http://localhost:3000")
        page_mobile.wait_for_timeout(3000)
        page_mobile.fill("#location", "Islamabad")
        page_mobile.click("#searchBtn")
        page_mobile.wait_for_timeout(2000)

        # Screenshot of the Hero section on mobile
        page_mobile.screenshot(path="/home/jules/verification/linkedin/mobile_hero.png")
        print("Generated mobile_hero.png")

        # Scroll down mobile to show weather details
        page_mobile.evaluate("window.scrollTo(0, 420);")
        page_mobile.wait_for_timeout(1000)
        page_mobile.screenshot(path="/home/jules/verification/linkedin/mobile_details.png")
        print("Generated mobile_details.png")

        # Scroll down to the footer/WhatsApp
        page_mobile.evaluate("window.scrollTo(0, document.body.scrollHeight);")
        page_mobile.wait_for_timeout(1000)
        page_mobile.screenshot(path="/home/jules/verification/linkedin/mobile_footer.png")
        print("Generated mobile_footer.png")

        # -------------------------------------------------------------
        # 3. AUTOCOMPLETE SUGGESTIONS CLOSEUP (Desktop)
        # -------------------------------------------------------------
        page.evaluate("window.scrollTo(0, 0);")
        page.fill("#location", "")
        page.type("#location", "Kar")
        page.wait_for_timeout(1500) # Wait for autocomplete to populate
        page.screenshot(path="/home/jules/verification/linkedin/autocomplete_closeup.png")
        print("Generated autocomplete_closeup.png")

        # -------------------------------------------------------------
        # 4. ERROR/SPELLING WARNING BANNER (Desktop)
        # -------------------------------------------------------------
        page.click("#location") # Clear focus / select item to close suggestions
        page.fill("#location", "InvalidCityNameXYZ")
        page.click("#searchBtn")
        page.wait_for_timeout(1500)
        page.screenshot(path="/home/jules/verification/linkedin/error_banner_closeup.png")
        print("Generated error_banner_closeup.png")

        context_desktop.close()
        context_mobile.close()
        browser.close()

if __name__ == "__main__":
    generate_screenshots()
