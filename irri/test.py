import joblib
import numpy as np

# Load saved models and encoders
clf = joblib.load("irrigation_classifier.pkl")
reg = joblib.load("irrigation_regressor.pkl")
scaler = joblib.load("scaler.pkl")
label_encoders = joblib.load("label_encoders.pkl")
le_method = joblib.load("irrigation_method_encoder.pkl")

# Sample farmer input
input_data = {
    "Crop": "Rice",
    "Soil Type": "Red",
    "Moisture": 30.5,
    "Rainfall": 95.0,
    "Temperature": 31.0
}

# Encode categorical inputs
encoded_input = [
    label_encoders['Crop'].transform([input_data['Crop']])[0],
    label_encoders['Soil Type'].transform([input_data['Soil Type']])[0],
    input_data['Moisture'],
    input_data['Rainfall'],
    input_data['Temperature']
]

# Scale features
input_scaled = scaler.transform([encoded_input])

# Predict
predicted_method = le_method.inverse_transform(clf.predict(input_scaled))[0]
predicted_schedule = reg.predict(input_scaled)[0]

# Output result
print("\n🌾 Recommended Irrigation Plan:")
print(f"Irrigation Method: {predicted_method}")
print(f"Frequency per Week: {predicted_schedule[0]:.1f} times")
print(f"Water Amount per Day: {predicted_schedule[1]:.0f} L")
