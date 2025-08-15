import os
import json
from datetime import datetime
import shutil

from flask import Flask, request, redirect, url_for, render_template, flash, session, send_from_directory,jsonify

# Pest detection
from utils import classify_image  # from the pest model file you created
import pandas as pd


app = Flask(__name__)
app.secret_key = "agri_secret_key"
USERDATA_PATH = "users"
os.makedirs(USERDATA_PATH, exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')

#===================================lang============================================
def get_language():
    return session.get('language', 'ta')

@app.route('/set_language', methods=['POST'])
def set_language():
    data = request.get_json()
    lang = data.get('language', 'ta')
    session['language'] = lang
    return jsonify({'message': 'Language set successfully', 'language': lang})
# --------------------------------- REGISTER ROUTE (as before) ----------------------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        user_id = request.form['user_id']
        password = request.form['password']
        name = request.form['name']
        land_owned = request.form['land_owned']
        organic_farming = request.form['organic_farming']
        kcc = request.form['kcc']
        community = request.form['community']

        user_folder = os.path.join(USERDATA_PATH, user_id)

        if os.path.exists(user_folder):
            flash("User ID already exists.")
            return redirect(url_for('register'))

        os.makedirs(user_folder)
        profile_data = {
            "user_id": user_id,
            "password": password,
            "name": name,
            "land_owned": float(land_owned),
            "organic_farming": organic_farming == "yes",
            "kcc_holder": kcc == "yes",
            "community": community
        }

        with open(os.path.join(user_folder, "profile.json"), "w") as f:
            json.dump(profile_data, f, indent=4)

        flash("Registered successfully!")
        return redirect(url_for('login'))

    return render_template("Register.html")


# --------------------------------- LOGIN ROUTE ----------------------------------
def load_json(filepath):
    if os.path.exists(filepath):
        with open(filepath) as f:
            return json.load(f)
    return {}


@app.route('/login', methods=['GET', 'POST'])
def login():
    next_page = request.args.get('next') or url_for('dashboard')  # default to dashboard

    if request.method == 'POST':
        user_id = request.form['user_id']
        password = request.form['password']
        user_folder = os.path.join(USERDATA_PATH, user_id)
        profile_file = os.path.join(user_folder, 'profile.json')

        if os.path.exists(profile_file):
            with open(profile_file, 'r') as f:
                profile = json.load(f)
            if profile.get('password') == password:
                session['user_id'] = user_id
                flash("Login successful", "success")
                return redirect(next_page)
            else:
                flash("Invalid password", "danger")
        else:
            flash("User not found", "danger")

    return render_template('login.html')




# ---------------------------------DASHBOARD ROUTE ----------------------------------
@app.route('/dashboard')
def dashboard():
    user_id = session.get("user_id")
    if not user_id:
        flash("Please login first.")
        return redirect(url_for('login'))

    user_folder = os.path.join(USERDATA_PATH, user_id)

    profile = load_json(os.path.join(user_folder, "profile.json"))
    soil = load_json(os.path.join(user_folder, "soil_test.json"))
    crop = load_json(os.path.join(user_folder, "crop_recommendation.json"))
    irrigation = load_json(os.path.join(user_folder, "irrigation.json"))

    # Pest detection stats
    pest_folder = os.path.join(user_folder, "pest_reports")
    pest_images = [f for f in os.listdir(pest_folder)] if os.path.exists(pest_folder) else []
    pest_jsons = [f for f in pest_images if f.endswith('.json') and f != "pest_summary.json"]
    pest_imgs = [f for f in pest_images if f.lower().endswith(('.jpg', '.png'))]
    pest_percent = f"{(len(pest_jsons)/len(pest_imgs))*100:.1f}%" if pest_imgs else "0%"

    schemes = recommend_user_schemes(profile)

    return render_template("dashboard.html", profile=profile, soil=soil, crop=crop,
                           irrigation=irrigation, pest_percent=pest_percent,
                           schemes=schemes)

def recommend_user_schemes(profile):
    all_schemes = [
        {"name": "PM-KISAN", "criteria": lambda p: p["land_owned"] <= 2},
        {"name": "Organic Farming Aid", "criteria": lambda p: p["organic_farming"]},
        {"name": "KCC Loan", "criteria": lambda p: not p["kcc_holder"]},
        {"name": "Crop Insurance", "criteria": lambda p: p["land_owned"] >= 1},
        {"name": "SC/ST Subsidy", "criteria": lambda p: p["community"] in ["sc", "st"]}
    ]
    return [s["name"] for s in all_schemes if s["criteria"](profile)]



##-----------------------------------------soil-testing--------------------------
import numpy as np
import pickle
import os


# Load ML model and preprocessing artifacts
soil_model = pickle.load(open("./models/soil/fertilizer_model.pkl", "rb"))
soil_scaler = pickle.load(open("./models/soil/scaler.pkl", "rb"))
soil_label_encoders = pickle.load(open("./models/soil/label_encoders.pkl", "rb"))

@app.route("/soil")
def serve_html():
    return render_template("soiltesting.html")

@app.route("/soil_testing", methods=["POST"])
def predict_fertilizer():
    try:
        data = request.form
        # Extract and process form data
        temperature = float(data['Temparature'])
        humidity = float(data['Humidity'])
        moisture = float(data['Moisture'])
        soil_type = data['Soil_Type']
        crop_type = data['Crop_Type']
        nitrogen = float(data['Nitrogen'])
        potassium = float(data['Potassium'])
        phosphorous = float(data['Phosphorous'])

        # Encode categories
        soil_encoded = soil_label_encoders["Soil_Type"].transform([soil_type])[0]
        crop_encoded = soil_label_encoders["Crop_Type"].transform([crop_type])[0]

        features = np.array([[temperature, humidity, moisture,
                              soil_encoded, crop_encoded,
                              nitrogen, potassium, phosphorous]])

        scaled_features = soil_scaler.transform(features)
        prediction = soil_model.predict(scaled_features)[0]
        fertilizer = soil_label_encoders["Fertilizer"].inverse_transform([prediction])[0]

        return jsonify({"fertilizer": fertilizer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

###--------------------------pest---------------------------
from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for, session, flash
import os
import json
from datetime import datetime
from utils import classify_image



os.makedirs(USERDATA_PATH, exist_ok=True)

@app.route('/pest')
def pest():
    return render_template('tests.html')




@app.route('/esp', methods=['POST'])
def esp_upload():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    # Set up user folders
    user_folder = os.path.join(USERDATA_PATH, user_id)
    pest_folder = os.path.join(user_folder, 'pest_reports')
    esp_folder = os.path.join(user_folder, 'esp_images')
    os.makedirs(pest_folder, exist_ok=True)
    os.makedirs(esp_folder, exist_ok=True)

    # Save image with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f'image_{timestamp}.jpg'
    esp_image_path = os.path.join(esp_folder, filename)
    pest_image_path = os.path.join(pest_folder, filename)

    with open(esp_image_path, 'wb') as f:
        f.write(request.data)
    with open(pest_image_path, 'wb') as f:
        f.write(request.data)

    # Run pest detection
    label, confidence = classify_image(pest_image_path)

    result_json = {
        "label": label,
        "confidence": confidence,
        "image": filename,
        "timestamp": timestamp,
        "source": "esp"
    }

    # Save JSON report
    report_path = pest_image_path.replace(".jpg", ".json")
    with open(report_path, 'w') as f:
        json.dump(result_json, f, indent=4)

    return jsonify({
        "status": "success",
        "label": label,
        "confidence": confidence
    })

@app.route('/static/pest_reports/<user_id>/<filename>')
def serve_pest_image(user_id, filename):
    return send_from_directory(os.path.join(USERDATA_PATH, user_id, 'pest_reports'), filename)

@app.route('/reports/<user_id>')
def pest_reports(user_id):
    if 'user_id' not in session or session['user_id'] != user_id:
        return redirect(url_for('login', next=url_for('pest_reports', user_id=user_id)))


    pest_folder = os.path.join(USERDATA_PATH, user_id, 'pest_reports')
    if not os.path.exists(pest_folder):
        return f"No pest reports found for user: {user_id}", 404

    reports = []
    for file in os.listdir(pest_folder):
        if file.endswith(".json"):
            with open(os.path.join(pest_folder, file), 'r') as f:
                reports.append(json.load(f))

    reports.sort(key=lambda x: x['timestamp'], reverse=True)

    return render_template('pes.html', user_id=user_id, reports=reports)


# --------------------------------- LOGOUT ----------------------------------
@app.route('/logout')
def logout():
    session.clear()
    flash("Logged out successfully.")
    return render_template('index.html')


#------------------------------------chatbot---------------------------------
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_file
import os, json, uuid, threading, tempfile, asyncio, subprocess, platform
from werkzeug.security import generate_password_hash, check_password_hash
import speech_recognition as sr
import pyttsx3
from langdetect import detect
from googletrans import Translator
import edge_tts
from chat import AgriGPT  # Ensure chat.py exists with AgriGPT class


translator = Translator()
USERS_DIR = 'users'
os.makedirs(USERS_DIR, exist_ok=True)

# ---------- TTS FUNCTION ----------
@app.route('/speak', methods=['POST'])
def speak_reply():
    text = request.json.get('text')
    lang = detect(text)

    voice = "ta-IN-PallaviNeural" if lang == 'ta' else "en-US-JennyNeural"
    path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4().hex}.mp3")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    async def generate():
        tts = edge_tts.Communicate(text=text, voice=voice)
        await tts.save(path)

    loop.run_until_complete(generate())
    loop.close()

    return send_file(path, mimetype='audio/mpeg', as_attachment=False)



def play_audio(file_path):
    try:
        if platform.system() == 'Windows':
            subprocess.run(['start', '', file_path], shell=True)
        elif platform.system() == 'Darwin':
            subprocess.run(['afplay', file_path])
        else:
            subprocess.run(['ffplay', '-nodisp', '-autoexit', file_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as e:
        print(f"Audio Playback Error: {e}")

# ---------- TRANSLATION ----------
def translate_to_english(text):
    return translator.translate(text, src='ta', dest='en').text

def translate_to_tamil(text):
    return translator.translate(text, src='en', dest='ta').text

# ---------- VOICE INPUT ----------
def recognize_speech_from_mic():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)
    return r.recognize_google(audio, language='ta-IN')

# ---------- ROUTES ----------
@app.route('/chat')
def chat():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    with open(f"{USERS_DIR}/{session['user_id']}/profile.json") as f:
        profile = json.load(f)
    return render_template('chat.html', username=profile['name'], profile=profile)


@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    user_input = data['message']
    lang = 'en'
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"response": "Error: User not authenticated."}), 403

    try:
        detected_lang = detect(user_input)
        if detected_lang == 'ta':
            lang = 'ta'
            user_input = translate_to_english(user_input)

        profile_path = os.path.join(USERS_DIR, user_id, "profile.json")
        with open(profile_path) as f:
            profile = json.load(f)

        bot = AgriGPT(user_id)
        reply = bot.ask(user_input)

        if lang == 'ta':
            reply = translate_to_tamil(reply)

        history_path = os.path.join(USERS_DIR, user_id, "chat_history.json")
        history = []
        if os.path.exists(history_path):
            with open(history_path) as f:
                history = json.load(f)
        history.append({"user": user_input, "bot": reply})
        with open(history_path, 'w') as f:
            json.dump(history, f, indent=2)

        return jsonify({"response": reply, "lang": lang})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

@app.route('/voice_input')
def voice_input():
    try:
        user_input = recognize_speech_from_mic()
        return jsonify({"transcript": user_input})
    except Exception as e:
        return jsonify({"transcript": "", "error": str(e)})


##=================================schemes========================================================
import csv

USERDATA_PATH = "users"
os.makedirs(USERDATA_PATH, exist_ok=True)

SCHEME_DATA_PATH = 'schemedata.csv'
SCHEMES = []

def get_user_folder(user_id):
    return os.path.join(USERDATA_PATH, user_id)

def get_profile_path(user_id):
    return os.path.join(get_user_folder(user_id), "profile.json")

def load_json(filepath):
    if os.path.exists(filepath):
        with open(filepath) as f:
            return json.load(f)
    return {}

def load_schemes():
    global SCHEMES
    SCHEMES.clear()
    with open(SCHEME_DATA_PATH, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            SCHEMES.append({
                'name': row.get('Name', 'No Name'),
                'description': row.get('Description', 'No description'),
                'min_land': float(row.get('Minimum Land Size', 0)),
                'max_land': float(row.get('Maximum Land Size', 1e9)),
                'district': row.get('District', '').lower(),
                'crop': row.get('Crop Type', '').lower()
            })

load_schemes()



@app.route('/schemes')
def schemes_page():
    return render_template('schemes.html')

@app.route('/api/profile')
def get_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    profile_path = get_profile_path(session['user_id'])
    with open(profile_path) as f:
        profile = json.load(f)
    return jsonify(profile)

@app.route('/api/all_schemes')
def get_all_schemes():
    all_schemes = []
    with open(SCHEME_DATA_PATH, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            all_schemes.append({
                "name": row['scheme_name'],
                "description": row['description'],
                "eligibility": row['eligibility'],
                "apply_link": row['apply_link']
            })
    return jsonify(all_schemes)

@app.route('/api/schemes')
def get_eligible_schemes():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    profile_path = get_profile_path(session['user_id'])
    with open(profile_path) as f:
        profile = json.load(f)

    land = float(profile.get('land_owned', 0))
    district = profile.get('district', '').lower()
    crop = profile.get('cropType', '').lower()

    eligible = [scheme for scheme in SCHEMES if (
        scheme['min_land'] <= land <= scheme['max_land'] and
        (scheme['district'] in ('', district)) and
        (scheme['crop'] in ('', crop))
    )]
    return jsonify(eligible)

@app.route('/check_eligibility', methods=['POST'])
def check():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    profile_path = get_profile_path(session['user_id'])
    with open(profile_path) as f:
        farmer = json.load(f)

    scheme_definitions = [
        {
            "name": "PM-KISAN",
            "required_params": ["land_owned"],
            "eligibility": lambda f: f.get("land_owned", 0) <= 2
        },
        {
            "name": "Organic Farming Support",
            "required_params": ["organic_farming"],
            "eligibility": lambda f: f.get("organic_farming") is True
        },
        {
            "name": "KCC Scheme",
            "required_params": ["kcc_holder"],
            "eligibility": lambda f: f.get("kcc_holder") is False
        },
        {
            "name": "SC/ST Subsidy",
            "required_params": ["community"],
            "eligibility": lambda f: f.get("community", "").lower() in ["sc", "st"]
        }
    ]

    def check_eligibility(farmer, scheme):
        missing = [p for p in scheme["required_params"] if p not in farmer]
        if missing:
            return {"scheme": scheme["name"], "eligible": False, "reason": f"Missing: {', '.join(missing)}"}
        eligible = scheme["eligibility"](farmer)
        return {
            "scheme": scheme["name"],
            "eligible": eligible,
            "reason": "Eligible" if eligible else "Does not meet criteria"
        }

    result = [check_eligibility(farmer, s) for s in scheme_definitions]
    return jsonify(result)

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

#------------------------------------------------------------------------------
import joblib

# Initialize Flask app


# Load models and encoders
model_method = joblib.load("models/harvest/harvesting_method_model.pkl")
model_time = joblib.load("models/harvest/harvesting_time_model.pkl")
le_crop = joblib.load("models/harvest/crop_encoder.pkl")
le_methods = joblib.load("models/harvest/method_encoder.pkl")
le_time = joblib.load("models/harvest/time_encoder.pkl")  # fixed name to match saved file

# Clean crop class names
clean_classes = [c.strip().lower() for c in le_crop.classes_]

@app.route("/harvest", methods=["GET", "POST"])
def harvest():
    result = None
    if request.method == "POST":
        crop_name = request.form.get("crop", "").strip().lower()

        if crop_name in clean_classes:
            crop_index = clean_classes.index(crop_name)
            crop_encoded = [crop_index]

            method_encoded = model_method.predict([crop_encoded])[0]
            time_encoded = model_time.predict([crop_encoded])[0]

            method = le_methods.inverse_transform([method_encoded])[0]
            time = le_time.inverse_transform([time_encoded])[0]  # fixed here

            result = {
                "method": method,
                "time": time
            }
        else:
            result = "Crop not found in dataset."

    return render_template("harvest.html", result=result)
#---------------------------------------------HARVEST------------------------
#=================================irrigation===



# Load models and encoders once when app starts
clf = joblib.load("./models/irrigation/irrigation_classifier.pkl")
reg = joblib.load("./models/irrigation/irrigation_regressor.pkl")
irri_scaler = joblib.load("./models/irrigation/scaler.pkl")
irri_label_encoders = joblib.load("./models/irrigation/label_encoders.pkl")
le_method = joblib.load("./models/irrigation/irrigation_method_encoder.pkl")

@app.route("/irrigation", methods=["GET", "POST"])
def irrigation():
    result = None
    error = None
    if request.method == "POST":
        try:
            # Get data from form
            crop = request.form.get("crop")
            soil_type = request.form.get("soil_type")
            moisture = float(request.form.get("moisture"))
            rainfall = float(request.form.get("rainfall"))
            temperature = float(request.form.get("temperature"))
            
            # Encode categorical inputs
            encoded_input = [
                irri_label_encoders['Crop'].transform([crop])[0],
                irri_label_encoders['Soil Type'].transform([soil_type])[0],
                moisture,
                rainfall,
                temperature
            ]
            
            # Scale features
            input_scaled = irri_scaler.transform([encoded_input])
            
            # Predict
            predicted_method = le_method.inverse_transform(clf.predict(input_scaled))[0]
            predicted_schedule = reg.predict(input_scaled)[0]
            
            # Prepare result
            result = {
                "method": predicted_method,
                "frequency": f"{predicted_schedule[0]:.1f} times/week",
                "water_amount": f"{predicted_schedule[1]:.0f} L/day"
            }
        except Exception as e:
            error = f"Error: {str(e)}"
    
    return render_template("irrigation.html", result=result, error=error)




# --------------------------------- SERVER ----------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True, port=5000)
