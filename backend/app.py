import os
import jwt
import datetime
import bcrypt
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS

from config import Config
from db import db
from chatbot import get_chatbot_reply
from disease import classify_disease

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# ------------------ JWT UTILITIES ------------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check Authorization Header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token header format'}), 401
                
        if not token:
            return jsonify({'message': 'Authorization token is missing'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = db.get_user_by_id(data['id'])
            if not current_user:
                return jsonify({'message': 'User not found in system'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid authorization token'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# ------------------ AUTHENTICATION ROUTES ------------------

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing registration parameters'}), 400
        
    name = data['name']
    email = data['email']
    password = data['password']
    role = data.get('role', 'farmer') # Default is farmer, can select admin
    
    if db.get_user_by_email(email):
        return jsonify({'message': 'Email address already registered'}), 409
        
    # Hash password
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        user = db.create_user(name, email, hashed, role)
        # Create token
        token = jwt.encode({
            'id': user['id'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        user_info = {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
        return jsonify({'token': token, 'user': user_info}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
        
    email = data['email']
    password = data['password']
    
    user = db.get_user_by_email(email)
    if not user:
        return jsonify({'message': 'Invalid email or password'}), 401
        
    # Verify password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'message': 'Invalid email or password'}), 401
        
    token = jwt.encode({
        'id': user['id'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    user_info = {
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role']
    }
    return jsonify({'token': token, 'user': user_info}), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_me(current_user):
    user_info = {
        'id': current_user['id'],
        'name': current_user['name'],
        'email': current_user['email'],
        'role': current_user['role']
    }
    return jsonify(user_info), 200

# ------------------ ADVISORY ROUTES ------------------

@app.route('/api/recommend/crop', methods=['POST'])
@token_required
def recommend_crop(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input parameters provided'}), 400
        
    # Soil/climate parameters
    n = data.get('n', 80)
    p = data.get('p', 40)
    k = data.get('k', 40)
    ph = data.get('ph', 6.5)
    temp = data.get('temp', 28)
    humidity = data.get('humidity', 70)
    rainfall = data.get('rainfall', 100)
    
    # Advanced logic decision tree for crop suitability
    crop = 'Maize'
    reasoning = "Maize is highly suited for your soil's moderate Nitrogen levels and balanced climate."
    details = {
        'duration': '110-120 days',
        'market_value': '₹22,000 / ton',
        'season': 'Kharif / Rabi',
        'water_need': 'Moderate',
        'tips': ['Keep soil well-drained during early growth.', 'Apply N-P-K in two splits: basal and 30-day top dress.']
    }
    
    if rainfall > 150 and humidity > 75 and ph >= 5.5 and ph <= 7.0:
        crop = 'Rice (Paddy)'
        reasoning = "High rainfall, high relative humidity, and slightly acidic-to-neutral soil pH are perfect parameters for high-yield paddy cultivation."
        details = {
            'duration': '125-135 days',
            'market_value': '₹24,500 / ton',
            'season': 'Kharif (Monsoon)',
            'water_need': 'High (standing water)',
            'tips': ['Ensure continuous flooding of 2-5cm depth until grain hardening.', 'Monitor closely for blast disease in humid periods.']
        }
    elif temp < 23 and rainfall < 90 and ph >= 6.0 and ph <= 7.5:
        crop = 'Wheat'
        reasoning = "A cooler temperature combined with moderate rainfall and neutral loamy soils supports maximum wheat grain development."
        details = {
            'duration': '140 days',
            'market_value': '₹23,000 / ton',
            'season': 'Rabi (Winter)',
            'water_need': 'Moderate (5-6 irrigations)',
            'tips': ['Apply first irrigation at Crown Root Initiation stage (21 days post sowing).', 'Ensure soil is moist but not saturated during tillering.']
        }
    elif rainfall < 80 and temp > 25 and ph >= 6.0 and ph <= 7.5:
        crop = 'Groundnut'
        reasoning = "Low rainfall, higher ambient temperatures, and sandy-loam soils allow easy pegging and pod development for groundnut."
        details = {
            'duration': '110 days',
            'market_value': '₹68,000 / ton',
            'season': 'Kharif / Summer',
            'water_need': 'Low (drought resistant)',
            'tips': ['Apply Gypsum (200 kg/acre) at pegging stage to ensure pod density.', 'Avoid soil compaction around the root zone.']
        }
    elif temp >= 25 and temp <= 35 and rainfall >= 90 and rainfall <= 140 and ph >= 5.8 and ph <= 7.8:
        crop = 'Cotton'
        reasoning = "Warm temperatures, moderate monsoon rains, and deep alluvial or black cotton soils are highly favorable for fiber development."
        details = {
            'duration': '160-180 days',
            'market_value': '₹72,000 / ton',
            'season': 'Kharif (Sowing May-June)',
            'water_need': 'Moderate',
            'tips': ['Maintain uniform soil moisture during flowering and boll opening.', 'Ensure field has excellent drainage during heavy showers.']
        }
        
    result = {'recommended_crop': crop, 'reasoning': reasoning, 'details': details}
    
    # Save search to user history
    db.add_history(current_user['id'], 'crop', data, result)
    return jsonify(result), 200

@app.route('/api/recommend/fertilizer', methods=['POST'])
@token_required
def recommend_fertilizer(current_user):
    data = request.get_json()
    if not data or not data.get('crop'):
        return jsonify({'message': 'Missing target crop or NPK parameters'}), 400
        
    crop = data['crop'].lower()
    n = data.get('n', 0)
    p = data.get('p', 0)
    k = data.get('k', 0)
    
    # Target N-P-K requirement profiles (in kg/acre)
    crop_targets = {
        'rice': {'n': 100, 'p': 50, 'k': 50},
        'wheat': {'n': 120, 'p': 60, 'k': 40},
        'maize': {'n': 110, 'p': 60, 'k': 40},
        'cotton': {'n': 80, 'p': 40, 'k': 40},
        'sugarcane': {'n': 150, 'p': 75, 'k': 75},
        'groundnut': {'n': 25, 'p': 50, 'k': 50} # Legume fixes N, requires less N
    }
    
    target = crop_targets.get(crop, {'n': 80, 'p': 40, 'k': 40})
    
    # Calculate deficiencies
    def_n = max(0, target['n'] - n)
    def_p = max(0, target['p'] - p)
    def_k = max(0, target['k'] - k)
    
    # Calculate fertilizer requirements (Approximated conversion ratios)
    # 1. DAP provides both N (18%) and P (46%). So we satisfy P using DAP first
    dap_req = round(def_p * (100 / 46))
    
    # Nitrogen supplied by DAP = 18% of DAP quantity
    n_from_dap = dap_req * 0.18
    remaining_n_deficit = max(0, def_n - n_from_dap)
    
    # 2. Urea (46% N) satisfies the remaining N deficit
    urea_req = round(remaining_n_deficit * (100 / 46))
    
    # 3. Muriate of Potash (MOP - 60% K2O) satisfies K
    mop_req = round(def_k * (100 / 60))
    
    result = {
        'deficiencies': {'n': def_n, 'p': def_p, 'k': def_k},
        'targets': target,
        'fertilizer_advice': {
            'urea': urea_req,
            'dap': dap_req,
            'mop': mop_req,
            'schedule': {
                'basal': f"Apply all DAP ({dap_req} kg), all MOP ({mop_req} kg), and 1/3 of Urea ({round(urea_req/3)} kg) at the time of sowing.",
                'tillering_stage': f"Apply 1/3 of Urea ({round(urea_req/3)} kg) 30 days after sowing.",
                'panicle_initiation': f"Apply the remaining Urea ({round(urea_req/3)} kg) 55-60 days after sowing."
            }
        }
    }
    
    db.add_history(current_user['id'], 'fertilizer', data, result)
    return jsonify(result), 200

@app.route('/api/recommend/irrigation', methods=['POST'])
@token_required
def recommend_irrigation(current_user):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing inputs'}), 400
        
    crop = data.get('crop', 'rice').lower()
    soil_type = data.get('soil_type', 'loamy').lower()
    growth_stage = data.get('growth_stage', 'vegetative').lower()
    moisture = data.get('moisture', 30)
    
    # Calculate irrigation needs
    watering_schedule = "Every 3-4 days"
    water_volume = 12000 # Liters per acre per day
    soil_status = "Optimal"
    
    if moisture < 20:
        soil_status = "Critical (Dry)"
        watering_schedule = "Immediately, then repeat every 2 days"
        water_volume = 18000
    elif moisture > 55:
        soil_status = "Saturated"
        watering_schedule = "Suspend watering for 3 days"
        water_volume = 0
        
    # Crop specifics adjusting volume
    if crop == 'rice':
        water_volume = int(water_volume * 1.5)
        watering_schedule = "Maintain standing water (daily topping)" if moisture < 45 else watering_schedule
    elif crop == 'cotton' or crop == 'groundnut':
        water_volume = int(water_volume * 0.8)
        
    # Growth stage adjustments
    advice = f"Keep soil damp. During the {growth_stage} stage, root moisture absorption is crucial."
    if growth_stage == 'flowering':
        advice = "Critical flowering stage! Avoid water stress to prevent flower dropping and yield loss."
        water_volume = int(water_volume * 1.2)
        
    result = {
        'soil_status': soil_status,
        'watering_schedule': watering_schedule,
        'water_volume': water_volume,
        'advice': advice
    }
    
    db.add_history(current_user['id'], 'irrigation', data, result)
    return jsonify(result), 200

@app.route('/api/disease/detect', methods=['POST'])
@token_required
def detect_disease(current_user):
    if 'image' not in request.files:
        return jsonify({'message': 'No image file uploaded'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'message': 'Empty file uploaded'}), 400
        
    image_bytes = file.read()
    result = classify_disease(image_bytes)
    
    db.add_history(current_user['id'], 'disease', {'filename': file.filename}, result)
    return jsonify(result), 200

# ------------------ WEATHER ROUTE ------------------

@app.route('/api/weather', methods=['GET'])
@token_required
def get_weather(current_user):
    # Simulated weather forecast, providing realistic seasonal changes
    today = datetime.date.today()
    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    # Fetch 5 days forecast
    forecast = []
    for i in range(1, 6):
        future_date = today + datetime.timedelta(days=i)
        day_name = weekdays[future_date.weekday()]
        
        # Add realistic rain variations
        rain_prob = 15 if i % 2 == 0 else 65
        desc = "Light Showers" if rain_prob > 50 else "Mostly Sunny"
        
        forecast.append({
            'day': day_name,
            'temp_max': 32 + (i % 2),
            'temp_min': 24 - (i % 3),
            'description': desc,
            'rain_prob': rain_prob
        })
        
    weather_report = {
        'location': 'Coimbatore Region, TN',
        'temp': 29.5,
        'description': 'Scattered Clouds',
        'humidity': 68,
        'wind_speed': 14.2,
        'rain_prob': 40,
        'uv_index': 'Moderate (6)',
        'forecast': forecast
    }
    
    return jsonify(weather_report), 200

# ------------------ HISTORY & ADMIN ROUTES ------------------

@app.route('/api/history', methods=['GET'])
@token_required
def get_user_history(current_user):
    history = db.get_history(current_user['id'])
    return jsonify(history), 200

@app.route('/api/admin/users', methods=['GET', 'PUT'])
@token_required
def manage_users(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Access denied: Admin role required'}), 403
        
    if request.method == 'GET':
        users = db.get_all_users()
        return jsonify(users), 200
        
    elif request.method == 'PUT':
        data = request.get_json()
        if not data or not data.get('userId') or not data.get('role'):
            return jsonify({'message': 'Missing parameters'}), 400
            
        target_id = data['userId']
        new_role = data['role']
        
        if new_role not in ['admin', 'farmer']:
            return jsonify({'message': 'Invalid role specified'}), 400
            
        db.update_user_role(target_id, new_role)
        return jsonify({'message': f'Role updated successfully to {new_role}'}), 200

# ------------------ SEED ADMIN BOOTSTRAP ------------------

def bootstrap_admin():
    # Insert default admin to test out of the box if no users exist
    try:
        if not db.get_user_by_email('admin@farmer.com'):
            hashed_pw = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            db.create_user('Super Admin', 'admin@farmer.com', hashed_pw, 'admin')
            print("Bootstrapped default admin credentials - email: admin@farmer.com, password: admin123")
            
        if not db.get_user_by_email('farmer@farmer.com'):
            hashed_pw = bcrypt.hashpw('farmer123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            db.create_user('Muthu Velan', 'farmer@farmer.com', hashed_pw, 'farmer')
            print("Bootstrapped default farmer credentials - email: farmer@farmer.com, password: farmer123")
    except Exception as e:
        print(f"Bootstrap warning: {e}")

if __name__ == '__main__':
    bootstrap_admin()
    # Run server
    app.run(host='0.0.0.0', port=5000, debug=True)
