# AI-Powered Farmer Advisory System

The AI-Powered Farmer Advisory System is a full-stack digital solution for farmers, designed to promote data-driven agriculture, increase yields, and reduce costs. The system offers intelligent crop recommendation, soil fertilizer management, plant leaf disease detection, smart irrigation scheduling, real-time weather analytics, and a voice-enabled AI Chatbot that communicates in both **English** and **Tamil**.

---

## Pre-configured Test Accounts

Upon starting the backend Flask app, the system automatically seeds the database with the following demo credentials:

*   **Farmer Role:**
    *   **Email:** `farmer@farmer.com`
    *   **Password:** `farmer123`
*   **Admin Role:**
    *   **Email:** `admin@farmer.com`
    *   **Password:** `admin123`

---

## Project Structure

```
AI farmer advisory sys/
├── README.md                 <-- Master Instructions
├── setup_backend.ps1         <-- PowerShell Automation Setup
├── backend/                  <-- Flask Server
│   ├── app.py                <-- Main Flask Router & Endpoints
│   ├── db.py                 <-- Dual-Mode DB Manager (Mongo / SQLite)
│   ├── chatbot.py            <-- Chatbot NLP & Gemini Integration
│   ├── disease.py            <-- Plant Disease Image Color Space Classifier
│   ├── config.py             <-- Secret Keys and API Configurations
│   └── requirements.txt      <-- Pip Dependencies
└── frontend/                 <-- Vite + React Client
    ├── index.html            <-- Main HTML template (SEO optimized)
    ├── package.json          <-- Node Dependencies
    └── src/
        ├── index.css         <-- Emerald-Green Theme Stylesheet
        ├── App.jsx           <-- State & Route Coordinator
        ├── components/       <-- Navbar, Sidebar, Auth Protection
        ├── pages/            <-- Dashboard, Crop, Fertilizer, Disease, etc.
        └── utils/            <-- API Helpers, Translations (English/Tamil)
```

---

## Step-by-Step Launch Guide

### 1. Start the Backend (Flask Server)

The backend exposes the advisory endpoints on `http://localhost:5000`.

#### Option A: Automatic Setup (PowerShell)
1. Open PowerShell inside the project root folder.
2. Run the script:
   ```powershell
   .\setup_backend.ps1
   ```
   *Note: If you receive a permission script execution error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, then rerun.*

#### Option B: Manual Setup
1. Verify Python 3.9+ is installed on your system.
2. Enter the backend folder:
   ```bash
   cd backend
   ```
3. Initialize virtual environment:
   ```bash
   python -m venv .venv
   ```
4. Activate it:
   *   **Windows (CMD):** `.venv\Scripts\activate.bat`
   *   **Windows (PowerShell):** `.venv\Scripts\Activate.ps1`
   *   **Mac/Linux:** `source .venv/bin/activate`
5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Start the server:
   ```bash
   python app.py
   ```

---

### 2. Start the Frontend (React.js Client)

The React client compiles and runs on `http://localhost:5173`.

1. Open a new terminal in the project root folder.
2. Enter the frontend folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the local dev server:
   ```bash
   npm run dev
   ```
5. Click the link `http://localhost:5173` displayed in your terminal.

---

## Core Features & Fallback Design

### 🗄️ Database Fallback (MongoDB to SQLite)
*   **Default:** The server checks for MongoDB on `mongodb://localhost:27017/`.
*   **Fail-Safe:** If MongoDB is unavailable or times out, the system automatically initializes a local **SQLite** database (`farmers_advisory.db`) and executes authentication and logging endpoints seamlessly.

### 🍃 Plant Disease Detection Fallback
*   **Default:** Features hooks to load a Convolutional Neural Network (CNN) in TensorFlow.
*   **Fail-Safe:** If running on standard CPU-only machines, the system employs a pixel color-distribution analyzer (using `Pillow` and `NumPy`). It inspects the green-to-brown/yellow ratio to diagnose Leaf Blight, Brown Spot, or Powdery Mildew, returning symptoms and organic vs. chemical sprays.

### 💬 Multilingual Voice/Text Chatbot
*   **Default:** Generates contextual solutions using Gemini generative models (configurable in `config.py` via `GEMINI_API_KEY`).
*   **Fail-Safe:** Operates a local pattern-matching engine in English and Tamil that parses agricultural terms (soil, water, pest, fertilizer) and delivers relevant advisory tips.
*   **Voice Capability:** Uses browser-native HTML5 speech-to-text (`webkitSpeechRecognition`) and text-to-speech (`speechSynthesis`) to allow hands-free voice operations.

### 🌦️ Simulated Weather forecasting
*   If `WEATHER_API_KEY` (OpenWeatherMap) is empty, the system generates simulated regional weather data, with realistic humidity, wind, and rain alerts, along with a 5-day crop forecast.
