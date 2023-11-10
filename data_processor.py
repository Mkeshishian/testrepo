import pandas as pd
import json
import fitz
from pptx import Presentation
from pptx.util import Inches
from PIL import Image
import io

import pandas as pd
import json

# Prompt the user for the month and year for pie charts
month_input = "September"
year_input = 2023

# Read the excel file
df = pd.read_excel('salesmaster200997.xlsx')

# Validate the month and year input
if not df[(df['Month'] == month_input) & (df['Year'] == year_input)].empty:
    chosen_year = year_input
else:
    print("Invalid month or year input! Please check your Excel data.")
    exit()

# Calculate the percentage change for sales (useful for your trend analysis)
df['PercentageChange'] = df['Sales'].pct_change() * 100

# Define original columns and their new names
column_map = {
    'No of Invoices': 'Invoices',
    'No of Customers': 'Customers',
    'Customers did not purchase': 'NonEngaged',
    'Customers did not purchase 3 years or more': 'LongInactive',
    'No of Items': 'Items',
    'No of Items Sold': 'SoldItems',
    'No of Remote customers': 'RemoteUsers',
    'Receivables': 'Receivables'
}

# Extract data for the additionalData section using original column names
columns_to_extract = ['Year', 'Month', 'Sales'] + list(column_map.keys())
additional_data = df[columns_to_extract].rename(columns=column_map).to_dict(orient='records')

# Organize the data
complete_data = {
    'chosenMonth': month_input,
    'chosenYear': chosen_year,
    'additionalData': additional_data  # Contains data for all months and years
}

# Save the data in a JSON file
with open('sales_data.json', 'w') as f:
    json.dump(complete_data, f)

print(f"Data saved to 'sales_data.json'. Pie chart data for {month_input} {chosen_year} is also saved.")
