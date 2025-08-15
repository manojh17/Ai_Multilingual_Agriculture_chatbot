from flask import Flask, render_template, request
import joblib

# Load models and encoders
model_method = joblib.load("harvesting_method_model.pkl")
model_time = joblib.load("harvesting_time_model.pkl")
le_crop = joblib.load("crop_encoder.pkl")
le_method = joblib.load("method_encoder.pkl")
le_time = joblib.load("time_encoder.pkl")

# Prepare cleaned class list for crop encoder
clean_classes = [c.strip().lower() for c in le_crop.classes_]

# Create Flask app
app = Flask(__name__)

# Home route
@app.route("/", methods=["GET", "POST"])
def home():
    result = None
    if request.method == "POST":
        crop_name = request.form["crop"].strip().lower()
        if crop_name in clean_classes:
            crop_index = clean_classes.index(crop_name)
            crop_encoded = [crop_index]

            method_encoded = model_method.predict([crop_encoded])[0]
            time_encoded = model_time.predict([crop_encoded])[0]

            method = le_method.inverse_transform([method_encoded])[0]
            time = le_time.inverse_transform([time_encoded])[0]

            result = {
                "method": method,
                "time": time
            }
        else:
            result = "Crop not found in dataset."

    return render_template("index.html", result=result)

if __name__ == "__main__":
    app.run(debug=True)
