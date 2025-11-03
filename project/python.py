from selenium import webdriver
# Create Chrome browser
driver = webdriver.Chrome()

# Open your local HTML file
driver.get(r"C:\Users\Dev Singhal\OneDrive\Desktop\Web dev\Project\project\index.html")

print("Browser is open. Close it manually when you're done testing.")

# Keep the script running until you close Chrome manually
driver.implicitly_wait(1000000)  # Keeps session alive
input("Press ENTER here in the console to quit...\n")

driver.quit()