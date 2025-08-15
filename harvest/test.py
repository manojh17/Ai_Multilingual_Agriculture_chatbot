import pandas as pd
import pickle

# Load model and encoders
model = pickle.load(open('harvest_model.pkl', 'rb'))
label_encoders = pickle.load(open('label_encoders.pkl', 'rb'))

# Input data for prediction (as dictionary or DataFrame)
input_data = pd.DataFrame([{
    'Crop_Type': 'Wheat',
    'Soil_Type': 'Loamy',
    'Climate': 'Temperate'
}])

# Encode input using the saved encoders
for col in input_data.columns:
    le = label_encoders[col]
    input_data[col] = le.transform(input_data[col])

# Predict
prediction_encoded = model.predict(input_data)[0]

# Decode the predicted label
target_encoder = label_encoders['Best_Harvesting_Method']
prediction = target_encoder.inverse_transform([prediction_encoded])[0]

print(f"Predicted Harvesting Method: {prediction}")
