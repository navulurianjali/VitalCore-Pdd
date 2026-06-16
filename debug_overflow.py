from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import time

opts = Options()
opts.add_argument("--headless=new")
drv = webdriver.Chrome(service=Service(r"C:\Users\navul\.wdm\drivers\chromedriver\win64\149.0.7827.55\chromedriver-win64\chromedriver.exe"), options=opts)

drv.get("http://localhost:3000/")
drv.set_window_size(375, 812)
time.sleep(2)

script = "return window.innerWidth + ' x ' + window.innerHeight;"
print("Window size: " + drv.execute_script(script))
drv.quit()
