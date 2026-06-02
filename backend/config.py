import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-agricultural-token-key-9988')
    
    # Database Configurations
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
    DB_NAME = os.environ.get('DB_NAME', 'farmer_advisory')
    
    # External API Keys (Optional fallbacks are handled in code)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', '')
