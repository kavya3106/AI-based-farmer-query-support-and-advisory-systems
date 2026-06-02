import re
from config import Config

# Fallback Responses Dictionary for Farmers (English and Tamil)
KNOWLEDGE_BASE = {
    'en': [
        {
            'keywords': [r'crop', r'grow', r'sow', r'plant', r'seed'],
            'response': "For sowing crops, ensure the soil is tilled to a depth of 15-20 cm and has a suitable pH (typically 6.0-7.0). Excellent monsoon options include Rice and Maize, whereas winter crops like Wheat or Mustard do best under dry, cooler conditions. What crop are you planning to grow?"
        },
        {
            'keywords': [r'fertilizer', r'manure', r'urea', r'dap', r'potash', r'npk', r'nutrient'],
            'response': "To address nutrient deficiencies: Nitrogen (Urea) promotes green leaf growth; Phosphorus (DAP) supports healthy root development; Potassium (MOP/Potash) strengthens stems and disease resistance. Always conduct a soil test before applying chemical fertilizers, and combine them with organic compost to build soil structure."
        },
        {
            'keywords': [r'disease', r'leaf', r'spot', r'blight', r'rust', r'pest', r'bug', r'insect'],
            'response': "If you spot leaf lesions, yellow spots, or pests: 1. Keep leaves dry by watering near the base. 2. Remove infected parts immediately. 3. Spray organic neem oil (5ml per liter of water) for mild infestations. For severe fungal diseases, look into copper oxychloride or customized bio-pesticides. You can upload a photo of the leaf in our 'Disease Detection' tab!"
        },
        {
            'keywords': [r'water', r'irrigate', r'irrigation', r'rain', r'moisture'],
            'response': "Efficient watering is vital. Loamy soils require moderate watering every 3-4 days, sandy soils dry quickly and need frequent light watering, and clayey soils retain water longer. Try watering in the early morning or evening to minimize evaporation."
        },
        {
            'keywords': [r'soil', r'clay', r'loam', r'sand', r'ph', r'acidity'],
            'response': "Soil texture determines water and nutrient retention. A pH range of 6.0 to 6.8 is optimal for most crops. Acidic soils can be treated with agricultural lime, while alkaline soils can be balanced with gypsum. Adding organic manure improves all soil types."
        },
        {
            'keywords': [r'hello', r'hi', r'hey', r'greetings', r'help'],
            'response': "Hello! I am your AI Farmer Advisor. How can I help you today? You can ask me about soil, crop suggestions, fertilizers, watering, or leaf diseases."
        }
    ],
    'ta': [
        {
            'keywords': [r'பயிர்', r'விதை', r'வளர்க்க', r'நாற்று', r'விளைச்சல்'],
            'response': "பயிர்களை விதைக்க, மண்ணை 15-20 செ.மீ ஆழத்திற்கு உழுது, தகுந்த pH (பொதுவாக 6.0-7.0) இருப்பதை உறுதிசெய்யவும். மழைக்காலத்தில் நெல், மக்காச்சோளம் போன்ற பயிர்களும், குளிர்காலத்தில் கோதுமை அல்லது கடுகு போன்ற பயிர்களும் நன்றாக வளரும். நீங்கள் என்ன பயிரிட விரும்புகிறீர்கள்?"
        },
        {
            'keywords': [r'உரம்', r'யூரியா', r'டிஏபி', r'பொட்டாஷ்', r'சத்து', r'NPK'],
            'response': "ஊட்டச்சத்து குறைபாட்டை போக்க: நைட்ரஜன் (யூரியா) இலை வளர்ச்சிக்கு உதவுகிறது; பாஸ்பரஸ் (DAP) வேர் வளர்ச்சிக்கு உதவுகிறது; பொட்டாசியம் தண்டு வளர்ச்சி மற்றும் நோய் எதிர்ப்பிற்கு உதவுகிறது. இரசாயன உரங்களைப் பயன்படுத்துவதற்கு முன்பு மண் பரிசோதனை செய்வது நல்லது. மேலும் இயற்கை மட்கு உரங்களையும் சேர்த்துப் பயன்படுத்தவும்."
        },
        {
            'keywords': [r'நோய்', r'இலை', r'புள்ளி', r'கருகல்', r'பூச்சி', r'வண்டு'],
            'response': "இலைகளில் கருகல், புள்ளி அல்லது பூச்சிகள் தென்பட்டால்: 1. செடியின் வேர்ப்பகுதியில் மட்டும் நீர் பாய்ச்சவும். 2. பாதிக்கப்பட்ட இலைகளை உடனடியாக அகற்றவும். 3. 1 லிட்டர் நீரில் 5 மிலி வேப்பெண்ணெய் கலந்து தெளிக்கவும். தீவிர நோய்களுக்கு பொருத்தமான பூஞ்சைக் கொல்லிகளைப் பயன்படுத்தலாம். எங்கள் 'நோய் கண்டறிதல்' பக்கத்தில் இலை படத்தை பதிவேற்றிப் பகுப்பாய்வு செய்யலாம்!"
        },
        {
            'keywords': [r'நீர்', r'பாசனம்', r'தண்ணீர்', r'மழை', r'ஈரப்பதம்'],
            'response': "முறையான நீர்ப்பாசனம் மிக முக்கியம். வண்டல் மண்ணிற்கு 3-4 நாட்களுக்கு ஒருமுறை மிதமான நீர்ப்பாசனம் தேவை, மணல் மண் விரைவாக காய்வதால் அடிக்கடி நீர் பாய்ச்ச வேண்டும். ஆவியாதலைக் குறைக்க அதிகாலை அல்லது மாலையில் நீர் பாய்ச்சவும்."
        },
        {
            'keywords': [r'மண்', r'களிமண்', r'வண்டல்', r'மணல்', r'pH'],
            'response': "மண்ணின் தன்மை நீர் மற்றும் ஊட்டச்சத்து சேமிப்பை தீர்மானிக்கிறது. பெரும்பாலான பயிர்களுக்கு pH 6.0 முதல் 6.8 வரை உகந்தது. அமில மண்ணை விவசாய சுண்ணாம்பைக் கொண்டும், கார மண்ணை ஜிப்சம் கொண்டும் சீரமைக்கலாம். இயற்கை உரம் மண்ணின் தரத்தை மேம்படுத்தும்."
        },
        {
            'keywords': [r'வணக்கம்', r'ஹலோ', r'உதவி', r'யார்'],
            'response': "வணக்கம்! நான் உங்களின் AI விவசாய உதவியாளர். இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்? மண், பயிர் பரிந்துரைகள், உரங்கள், நீர் பாசனம் அல்லது இலை நோய்கள் பற்றி என்னிடம் கேட்கலாம்."
        }
    ]
}

def get_chatbot_reply(message, history, language='en'):
    # Sanitise inputs
    lang = 'ta' if language == 'ta' else 'en'
    msg_lower = message.lower().strip()
    
    # Check if Gemini API key exists
    if Config.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=Config.GEMINI_API_KEY)
            
            # Formulate prompt with farming system instructions
            system_prompt = (
                "You are an expert, empathetic AI Farmer Advisor designed to help farmers. "
                "Provide helpful, accurate, and easy-to-understand advice about crops, soil, pest management, "
                "weather adaptations, and sustainable farming. Answer in the language the user is speaking "
                "or asks for (Tamil or English). Keep answers practical and safe for farmers."
            )
            
            # Simple generative AI call
            model = genai.GenerativeModel('gemini-pro')
            
            # Construct simple history
            prompt_context = system_prompt + "\n\n"
            for h in history[-4:]: # Use last 4 turns
                role_label = "Farmer" if h.get('role') == 'user' else "Advisor"
                text = h.get('parts', [{}])[0].get('text', '')
                prompt_context += f"{role_label}: {text}\n"
                
            prompt_context += f"Farmer: {message}\nAdvisor: "
            
            response = model.generate_content(prompt_context)
            if response.text:
                return response.text
        except Exception as e:
            print(f"Gemini API failure: {e}. Falling back to rules database...")
            
    # Offline Rule Engine fallback
    for item in KNOWLEDGE_BASE[lang]:
        for pattern in item['keywords']:
            if re.search(pattern, msg_lower):
                return item['response']
                
    # Default fallbacks
    if lang == 'ta':
        return ("விவசாய நடைமுறைகள் பற்றிய உங்கள் கேள்வி எனக்குப் புரிந்தது. "
                "முறையான விதை நேர்த்தி, மண் பரிசோதனை மற்றும் சரியான நீர்ப்பாசனம் சிறந்த விளைச்சலைத் தரும். "
                "உங்கள் கேள்விக்கான கூடுதல் விவரங்களை உரம், பயிர் அல்லது நோய் கண்டறிதல் போன்ற பிற பக்கங்களில் சரிபார்க்கலாம்.")
    else:
        return ("I understand your query regarding agricultural practices. "
                "Optimizing soil nutrients (NPK), selecting high-quality seeds, and monitoring weather forecasts "
                "are key pillars of a successful harvest. Feel free to use our specialized recommendation forms for specific advice.")
