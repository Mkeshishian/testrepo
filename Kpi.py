from selenium import webdriver
from selenium.webdriver.common.by import By
from fpdf import FPDF
from pdfminer.high_level import extract_text
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import re



def capture_screenshots():
    driver = webdriver.Chrome()
    driver.set_window_size(1920, 1080)  # Set window size before maximizing
    driver.get('http://localhost:8000')
    driver.maximize_window()

    wait = WebDriverWait(driver, 10)  # Set up the explicit wait

    elements_to_capture = [
        (By.ID, 'sales-container'),
        (By.ID, 'percentage-container'),
        (By.ID, 'receivables-container'),
        (By.ID, 'invoices-container'),
        (By.ID, 'average-invoice-2022'),
        (By.ID, 'average-invoice-2023'),
        (By.ID, 'customer-engagement-container'),
        (By.ID, 'inventory-container'),
        (By.ID, 'remote-utilization-container'),
        (By.XPATH, '//*[contains(text(),"CR 2022")]/ancestor::div[@class="card"]'),
        (By.XPATH, '//*[contains(text(),"CR 2023")]/ancestor::div[@class="card"]'),
        (By.XPATH, '//*[contains(text(),"Average Invoice 2022")]/ancestor::div[@class="card"]'),
        (By.XPATH, '//*[contains(text(),"Average Invoice 2023")]/ancestor::div[@class="card"]')
    ]

    for index, (by, identifier) in enumerate(elements_to_capture):
        try:
            wait.until(EC.presence_of_element_located((by, identifier)))  # Waiting for the element to appear
            element = driver.find_element(by, identifier)
            driver.execute_script("arguments[0].scrollIntoView();", element)

            # Move mouse away for the first element (index 0)
            if index == 0:
                action = ActionChains(driver)
                action.move_by_offset(50, 50)  # Move mouse by x, y offset
                action.perform()

            if by == By.ID:
                filename = f"{identifier}.png"
            else:
                filename = element.text.split('\n')[0].lower().replace(' ', '-') + ".png"

            element.screenshot(filename)
        except Exception as e:
            print(f"Error capturing screenshot for {identifier}. Error: {e}")

    driver.quit()

class PDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def safe_multi_cell(pdf, width, height, txt):
    lines = txt.split('\n')
    for line in lines:
        pdf.cell(width, height, line)
        pdf.ln(height)


class PDF(FPDF):
    def header(self):
        pass

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')


def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)


def safe_multi_cell(pdf, width, height, txt):
    lines = txt.split('\n')
    for line in lines:
        pdf.cell(width, height, line)
        pdf.ln(height)


capture_screenshots()

pdf = PDF(orientation='P', unit='mm', format='A4')
pdf.set_margins(25, 25, 25)
pdf.set_auto_page_break(auto=False)
pdf.set_font('Helvetica', size=9)

text = extract_text_from_pdf('kpi200997.pdf')

# Extracting the introduction and the rest of the sections
intro, sections_text = text.split("1. Sales:", 1)
intro = intro.strip()
sections = re.split(r'(\d+\..+?:)', "1. Sales:" + sections_text)[1:]
sections = [(sections[i], sections[i + 1].strip()) for i in range(0, len(sections), 2)]

section_images = {
    '1. Sales:': ['sales-container.png', 'percentage-container.png'],
    '2. Receivables:': ['receivables-container.png'],
    '3. Volume :': ['invoices-container.png', 'average-invoice-2022.png', 'average-invoice-2023.png'],
    '4. Database :': ['customer-engagement-container.png', 'inventory-container.png'],
    '5. Remote :': ['remote-utilization-container.png']
}

# Inserting the introduction before the first section on the same page
pdf.add_page()
pdf.set_font('Helvetica', '', 9)
safe_multi_cell(pdf, 190, 10, intro)

for section_title, section_content in sections:
    if section_title != '1. Sales:':
        pdf.add_page()

    # Setting font for the section title and adding it to the PDF
    pdf.set_font('Helvetica', 'BU', 9)
    safe_multi_cell(pdf, 190, 10, section_title)

    # Setting font for the section content and adding it to the PDF
    pdf.set_font('Helvetica', '', 9)
    safe_multi_cell(pdf, 190, 10, section_content)

    # Adding images only for sections with available images
    if section_title in section_images:
        for image_name in section_images[section_title]:
            if os.path.exists(image_name):
                # Default width for images
                image_width = 120

                # Adjust width for images in section 4
                if section_title == '4. Database :':
                    image_width = 100  # or whatever size you find appropriate

                pdf.image(image_name, x=25, w=image_width)
                os.remove(image_name)
        pdf.ln(10)

pdf.output('200997.pdf')