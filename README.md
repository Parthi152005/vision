# AgriVision AI - Smart Agriculture Platform

AgriVision is a Progressive Web App (PWA) designed to help farmers analyze soil and plant health using AI.

## Project Structure
- `/` (Root): Flask Backend API.
- `/frontend`: React + Vite Frontend PWA.
- `/models`: Trained Machine Learning models (Pickle & H5).
- `/datasets`: Sample data formats for training.

---

## Getting Started

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **npm** or **yarn**

---

### Step 1: Setup Backend (Flask)
1. Open a terminal in the project root directory.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows**: `.\venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. (Optional) Re-train dummy models if needed:
   ```bash
   python train_models.py
   ```
6. Start the Flask server:
   ```bash
   python app.py
   ```
   *The backend will run on `http://localhost:5000`.*

---

### Step 2: Setup Frontend (React + Vite)
1. Open a **new** terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## Features
- **Crop Selection**: Upload soil images or use your camera to get crop recommendations.
- **Fertilizer Calculator**: Get precision nutrient advice based on N-P-K levels.
- **Disease Detection**: Instantly analyze plant leaf health.
- **Weather Widget**: Automatic local weather fetching via Geolocation.

## Using the Camera
The camera feature requires a secure connection (localhost or HTTPS).
- When running locally, use `http://localhost:5173`.
- If accessing from a different device on the same network, you must use **HTTPS** or configure your browser to treat the IP as a secure origin.

## Tech Stack
- **Backend**: Flask, TensorFlow, Scikit-learn, Pandas.
- **Frontend**: React, Vite, Phosphor Icons, Axios.
- **PWA**: vite-plugin-pwa.
