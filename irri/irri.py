import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import classification_report, mean_squared_error
import joblib
import os

# Load dataset
csv_path = os.path.join(os.path.dirname(__file__), "irrigation.csv")
df = pd.read_csv(csv_path)

# Clean "Frequency per Week" and "Water Amount" columns
df['Frequency per Week'] = df['Frequency per Week'].astype(str).str.extract(r'(\d+)').astype(float)
df['Water Amount (L/day)'] = df['Water Amount (L/day)'].astype(str).str.extract(r'(\d+)').astype(float)

# Handle non-numeric values in Moisture, Rainfall, Temperature
for col in ['Moisture', 'Rainfall', 'Temperature']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Drop rows with missing or invalid numeric values
df.dropna(subset=['Moisture', 'Rainfall', 'Temperature', 'Frequency per Week', 'Water Amount (L/day)'], inplace=True)

# Encode categorical features
label_encoders = {}
for col in ['Crop', 'Soil Type']:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Encode target label (Irrigation Method)
le_method = LabelEncoder()
df['Irrigation Method'] = le_method.fit_transform(df['Irrigation Method'])

# Define features and targets
X = df[['Crop', 'Soil Type', 'Moisture', 'Rainfall', 'Temperature']]
y_class = df['Irrigation Method']
y_reg = df[['Frequency per Week', 'Water Amount (L/day)']]

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
    X_scaled, y_class, y_reg, test_size=0.2, random_state=42
)

# Train models
clf = RandomForestClassifier()
reg = MultiOutputRegressor(RandomForestRegressor())

clf.fit(X_train, y_class_train)
reg.fit(X_train, y_reg_train)

# Save models and encoders
joblib.dump(clf,os.path.join(os.path.dirname(__file__), "irrigation_classifier.pkl"))
joblib.dump(reg,os.path.join(os.path.dirname(__file__), "irrigation_regressor.pkl"))
joblib.dump(scaler,os.path.join(os.path.dirname(__file__), "scaler.pkl"))
joblib.dump(label_encoders,os.path.join(os.path.dirname(__file__), "label_encoders.pkl"))
joblib.dump(le_method,os.path.join(os.path.dirname(__file__), "irrigation_method_encoder.pkl"))

# Evaluation
print("\n📊 Classification Report:")
print(classification_report(y_class_test, clf.predict(X_test)))

print("\n📉 Regression MSE:")
print(mean_squared_error(y_reg_test, reg.predict(X_test)))
