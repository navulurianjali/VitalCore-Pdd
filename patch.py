import re

def patch_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        return

    new_fixture = '''@pytest.fixture(scope="function")
def driver(request):
    opts = Options()
    opts.add_argument("--window-size=1366,768")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--use-fake-ui-for-media-stream")
    opts.add_argument("--use-fake-device-for-media-stream")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)
    if request.config.getoption("--headless", default=False):
        opts.add_argument("--headless=new")

    drv = webdriver.Chrome(service=Service(CHROMEDRIVER), options=opts)
    drv.set_page_load_timeout(35)
    drv.implicitly_wait(4)
    drv._base = BASE_URL
    
    class_name = request.node.parent.name
    auth_classes = ["TestDashboard", "TestFitnessPage", "TestNutritionPage", "TestSleepPage", "TestAICoachPage", "TestScannerPage", "TestFutureLabPage", "TestChallengesPage", "TestCommunityPage", "TestSleepPageDeep", "TestAICoachDeep"]
    
    if class_name in auth_classes:
        import uuid
        uid = uuid.uuid4().hex[:8]
        drv.get(f"{BASE_URL}/auth/signup")
        try:
            WebDriverWait(drv, 10).until(EC.visibility_of_element_located((By.NAME, "fullName"))).send_keys(f"Test User {uid}")
            drv.find_element(By.NAME, "username").send_keys(f"test_user_{uid}")
            drv.find_element(By.NAME, "email").send_keys(f"test_{uid}@vitalcore.ai")
            drv.find_element(By.NAME, "password").send_keys("Password123!")
            btn = WebDriverWait(drv, 10).until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']")))
            drv.execute_script("arguments[0].click();", btn)
            WebDriverWait(drv, 15).until(EC.url_contains("/dashboard"))
            import time
            time.sleep(1)
        except Exception as e:
            print(f"Auth failed: {e}")
            
    yield drv
    drv.quit()'''

    pattern = re.compile(r'@pytest\.fixture\(scope="function"\)\ndef driver\(request\):.*?drv\.quit\(\)', re.DOTALL)
    
    new_content, count = pattern.subn(new_fixture, content)
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Successfully patched {filepath}')
    else:
        print(f'Failed to patch {filepath}')

patch_file('tests/test_vitalcore_e2e.py')
patch_file('tests/test_vitalcore_v2_e2e.py')
