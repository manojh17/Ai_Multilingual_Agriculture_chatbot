
import google.generativeai as genai
import pandas as pd
import csv
from io import StringIO
import os

# === CONFIGURE YOUR GEMINI API KEY ===
GOOGLE_API_KEY = "AIzaSyAb_SMv2XsXu2mRxMNU3AGXd64S-mWFuYM"
genai.configure(api_key=GOOGLE_API_KEY)

# === MODEL SELECTION ===
model = genai.GenerativeModel("gemini-2.0-flash")  # Use gemini-pro not 2.5-flash

# === SAFE CSV PARSER ===
def safe_parse_csv(text, expected_columns):
    try:
        f = StringIO(text.strip())
        reader = csv.reader(f, delimiter=",", quotechar='"')
        rows = list(reader)

        header = rows[0]
        if len(header) != expected_columns:
            raise ValueError(f"Expected {expected_columns} columns, got {len(header)}")

        valid_rows = [row for row in rows[1:] if len(row) == expected_columns]
        return pd.DataFrame(valid_rows, columns=header)

    except Exception as e:
        print(f"Parsing failed: {e}")
        return None

# === CSV COLUMN HEADERS AND PROMPT ===
expected_columns = 10
prompt_template = """
Generate a dataset in plain CSV format with the following columns for crops grown in Tamil Nadu:

"Crop Name","Sowing Season","Harvesting Season","Harvesting Method","Harvesting Instructions","Suitable Districts","Duration (days)","Soil Type","Irrigation Method","Yield Tips"

- Only include real data relevant to Tamil Nadu (from TNAU, ICAR, Govt. Agri portals).
- Format every field using double quotes.
- No Markdown. No explanations. Only CSV.
- Example row:
"Rice","June - July","November - December","Manual","Cut the paddy using a sickle at 80-85% maturity","Thanjavur, Trichy","120","Clay loam","Canal Irrigation","Use high-yield varieties and proper spacing"

Generate {row_count} rows.
"""

# === GENERATE IN BATCHES ===
all_data = []
batches = 20
rows_per_batch = 50  # 50 * 20 = 1000 rows

for batch in range(1, batches + 1):
    print(f"Batch {batch}/{batches}")
    prompt = prompt_template.format(row_count=rows_per_batch)

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Extract CSV block from markdown if needed
        if "```" in text:
            text = text.split("```")[1].replace("csv", "").strip()

        df = safe_parse_csv(text, expected_columns=expected_columns)
        if df is not None:
            all_data.append(df)

    except Exception as e:
        print(f"Error in batch {batch}: {e}")

# === SAVE FINAL DATA ===
if all_data:
    full_df = pd.concat(all_data, ignore_index=True)
    os.makedirs("output", exist_ok=True)
    full_df.to_csv("output/tamil_nadu_crop_harvesting_data.csv", index=False)
    print(f"\n✅ Dataset saved with {len(full_df)} rows at 'output/tamil_nadu_crop_harvesting_data.csv'")
else:
    print("❌ No valid data generated.")
