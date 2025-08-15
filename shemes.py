import os
import re
import json
import pandas as pd
from datetime import datetime
import google.generativeai as genai

# 1️⃣ — SET YOUR GEMINI API KEY
API_KEY ="AIzaSyBk0U0R2za6lSB5mUBsxf1FFEUBYfPNkZI"  # ← Replace with your actual Gemini API key

# 2️⃣ — CONFIGURE GEMINI
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# 3️⃣ — PROMPT TO GEMINI
prompt = """
imagine you are an scheme expert , you know the all agrischemes , insurence, and other financial aids, and all data you known is official and not generative
List every agriculture-related government scheme, subsidy, insurance, loan or financial aid program
that is currently active in the Indian state of Tamil Nadu (newly released data and existing and still in valid scheme data).

Use only official Tamil Nadu government sources:
- tn.gov.in
- tnagrisnet.tn.gov.in
- agritech.tnau.ac.in
- any *.tn.gov.in domain

For each scheme, return a JSON object with:
- "scheme_name"
- "description"
- "eligibility"
- "apply_link"  (official link only; landing page of the site if unavailable)

Output: Only a pure JSON array, no markdown, no explanation, also 100 rows of data.
"""

# 4️⃣ — CALL GEMINI
response = model.generate_content(prompt)
raw_output = response.text.strip()

# 5️⃣ — EXTRACT JSON FROM GEMINI OUTPUT
match = re.search(r"```json(.*?)```", raw_output, re.S)
json_data = match.group(1).strip() if match else raw_output

try:
    schemes = json.loads(json_data)
except json.JSONDecodeError as e:
    print("❌ Failed to parse JSON. Error:", e)
    print("Raw Gemini Output:\n", raw_output)
    exit()

# 6️⃣ — ADD DATE/TIME COLUMN TO EACH SCHEME
today_str = datetime.now().strftime("%Y-%m-%d")
for scheme in schemes:
    scheme["scraped_date"] = today_str

# 7️⃣ — SAVE TO A DAILY NAMED CSV FILE
df = pd.DataFrame(schemes)
output_file = f"tn_agri_schemes_{today_str}.csv"
df.to_csv(output_file, index=False, encoding="utf-8")
print(f"✅ Saved {len(df)} schemes → {output_file}")
