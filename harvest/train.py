import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

# Make path relative to the script location
csv_path = os.path.join(os.path.dirname(__file__), "harvi.csv")
df = pd.read_csv(csv_path, encoding='ISO-8859-1')

# Clean column names
df.columns = df.columns.str.strip()

# Normalize crop names to lowercase for consistency
df["Crop"] = df["Crop"].str.lower()

# Initialize LabelEncoders
le_crop = LabelEncoder()
le_method = LabelEncoder()
le_time = LabelEncoder()

# Encode the columns
df["Crop_encoded"] = le_crop.fit_transform(df["Crop"])
df["Method_encoded"] = le_method.fit_transform(df["Best Harvesting Method"])
df["Time_encoded"] = le_time.fit_transform(df["Harvest Time"])

# Prepare input (X) and output (y)
X = df[["Crop_encoded"]].values
y_method = df["Method_encoded"].values
y_time = df["Time_encoded"].values

# Train models
model_method = RandomForestClassifier()
model_method.fit(X, y_method)

model_time = RandomForestClassifier()
model_time.fit(X, y_time)

# Save models and encoders
joblib.dump(model_method, os.path.join(os.path.dirname(__file__), "../models/harvest/harvesting_method_model.pkl"))
joblib.dump(model_time, os.path.join(os.path.dirname(__file__), "../models/harvest/harvesting_time_model.pkl"))
joblib.dump(le_crop, os.path.join(os.path.dirname(__file__), "../models/harvest/crop_encoder.pkl"))
joblib.dump(le_method, os.path.join(os.path.dirname(__file__), "../models/harvest/method_encoder.pkl"))
joblib.dump(le_time, os.path.join(os.path.dirname(__file__), "../models/harvest/time_encoder.pkl"))

# Prediction function
def predict_for_crop(crop_name):
    crop_name = crop_name.strip().lower()

    # Rebuild the list of cleaned class names
    clean_classes = [c.strip().lower() for c in le_crop.classes_]

    if crop_name not in clean_classes:
        return "Crop not found in dataset."

    # Get the correct index for the input crop
    crop_index = clean_classes.index(crop_name)
    crop_encoded = [crop_index]

    method_encoded = model_method.predict([crop_encoded])[0]
    time_encoded = model_time.predict([crop_encoded])[0]

    method = le_method.inverse_transform([method_encoded])[0]
    time = le_time.inverse_transform([time_encoded])[0]

    return method, time

# User interaction loop
def main():
    while True:
        user_input = input("Enter a crop name (or type 'exit' to quit): ").strip()
        if user_input.lower() == 'exit':
            print("Goodbye!")
            break

        result = predict_for_crop(user_input)
        if isinstance(result, str):
            print(result)
        else:
            method, time = result
            print(f"\n✅ Best Harvesting Method: {method}")
            print(f"📅 Harvest Time: {time}\n")

if __name__ == "__main__":
    main()