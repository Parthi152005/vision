from flask import Flask, render_template, request, jsonify  # type: ignore
from flask_cors import CORS  # type: ignore
import pickle
import numpy as np  # type: ignore
import os
import tensorflow as tf  # type: ignore
from PIL import Image  # type: ignore

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Enable CORS for all API routes manually
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load Models (We'll load them lazily or in try-except
# so the app doesn't crash if they aren't generated yet)
crop_model = None
fertilizer_model = None
disease_model = None
soil_model = None


def load_models():
    global crop_model, fertilizer_model, disease_model, soil_model
    try:
        if os.path.exists('models/crop_model.pkl'):
            with open('models/crop_model.pkl', 'rb') as f:
                crop_model = pickle.load(f)

        if os.path.exists('models/fertilizer_model.pkl'):
            with open('models/fertilizer_model.pkl', 'rb') as f:
                fertilizer_model = pickle.load(f)

        if os.path.exists('models/disease_model.h5'):
            disease_model = tf.keras.models.load_model(
                'models/disease_model.h5', compile=False)

        if os.path.exists('models/soil_model.h5'):
            soil_model = tf.keras.models.load_model(
                'models/soil_model.h5', compile=False)

        print("✅ Models loaded successfully!")
    except Exception as e:
        print(f"⚠️ Warning loading models: {e}")


load_models()


@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"status": "success", "message": "Backend connected!"})


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/crop-recommendation')
def crop_recommend():
    return render_template('crop.html')


@app.route('/fertilizer')
def fertilizer():
    return render_template('fertilizer.html')


@app.route('/disease')
def disease():
    return render_template('disease.html')


def is_likely_soil(img_array_raw):
    """
    Smarter color heuristic to reject obviously non-soil images (landscapes, roads, sky, grass).
    Returns (True, None) if the image could be soil.
    Returns (False, reason) if it is clearly not soil.
    """
    h, w, _ = img_array_raw.shape
    
    img_f = img_array_raw.astype(np.float32) / 255.0
    r_mean = float(np.mean(img_f[:, :, 0]))
    g_mean = float(np.mean(img_f[:, :, 1]))
    b_mean = float(np.mean(img_f[:, :, 2]))
    brightness = (r_mean + g_mean + b_mean) / 3.0
    
    max_diff = max(abs(r_mean - g_mean), abs(r_mean - b_mean), abs(g_mean - b_mean))
    is_gray = max_diff < 0.06

    # 1. Roads / asphalt / concrete (Gray/Neutral)
    if is_gray and 0.10 < brightness < 0.75:
        return False, "This appears to be a road, pavement, or structure. Please upload a clear, close-up picture of farming soil."

    # 2. Vegetation / Grass / Trees (Green dominant)
    # Soil is rarely ever greener than it is red/brown.
    if g_mean > r_mean + 0.01 and g_mean > b_mean:
        return False, "This appears to be mostly vegetation, grass, or a tree. Please upload a picture of the raw dirt/soil."

    # 3. Sky / Water (Blue dominant in the top half)
    top_third = img_f[:h//3, :, :]
    top_r, top_g, top_b = np.mean(top_third[:, :, 0]), np.mean(top_third[:, :, 1]), np.mean(top_third[:, :, 2])
    
    # If the top third is bluer than it is red/green, it's a landscape with a sky
    if top_b > top_r + 0.05 and top_b > top_g + 0.02:
        return False, "This appears to be a landscape photo with sky or water. Please upload a close-up picture of the soil surface."

    # 4. Sunsets / Very bright backlights (Huge contrast or blowing out red/yellow)
    bot_third = img_f[2*h//3:, :, :]
    top_bright = (top_r + top_g + top_b) / 3.0
    bot_bright = (np.mean(bot_third[:, :, 0]) + np.mean(bot_third[:, :, 1]) + np.mean(bot_third[:, :, 2])) / 3.0
    
    if top_bright > bot_bright + 0.40:
        return False, "This appears to be a landscape photo (bright sky, dark ground). Please upload a close-up of the soil."

    # Very bright / washed-out (snow, white walls, pure blank sky)
    if brightness > 0.88:
        return False, "This image appears too bright, washed out, or white. Please upload a clear picture of brownish/dark farming soil."

    return True, None


@app.route('/api/predict_crop', methods=['POST'])
def predict_crop():
    if not soil_model:
        return jsonify({'error': 'Soil model not loaded'}), 500
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # Load and preprocess image
        img = Image.open(filepath).convert('RGB').resize((224, 224))
        img_array = np.array(img)  # type: ignore

        # --- Layer 1: Smarter Color heuristic check ---
        likely_soil, heuristic_reason = is_likely_soil(img_array)
        if not likely_soil:
            try:
                os.remove(filepath)
            except:
                pass
            return jsonify({'error': heuristic_reason}), 400

        img_normalized = img_array / 255.0
        img_input = np.expand_dims(img_normalized, axis=0)

        prediction = soil_model.predict(img_input)
        confidence = float(np.max(prediction[0]))
        class_idx = int(np.argmax(prediction[0]))

        # The model will output its highest confidence prediction.
        # We rely on Layer 1 (Color heuristic) to reject non-soil images.

        # Soil classes (alphabetical order from training - MUST match training class_indices):
        # Chalky(0), Clay(1), Loamy(2), Peaty(3), Sandy(4), Silty(5)
        soil_db = {0: {"soil_type": "Chalky Soil",
                       "recommended_crops": "Barley, Spinach, Beetroot, Cabbage",
                       "suggestion": "Chalky soil is alkaline and free-draining. Add organic matter to lower pH and improve nutrient retention."},
                   1: {"soil_type": "Clay Soil",
                       "recommended_crops": "Rice (Paddy), Wheat, Broccoli, Cabbage",
                       "suggestion": "Clay holds moisture well but drains poorly. Avoid overwatering and consider raised beds."},
                   2: {"soil_type": "Loamy Soil",
                       "recommended_crops": "Cotton, Wheat, Sugarcane, Tomato, Maize",
                       "suggestion": "Loam is ideal for most crops. Maintain soil health with regular crop rotation."},
                   3: {"soil_type": "Peaty Soil",
                       "recommended_crops": "Lettuce, Onion, Carrot, Potato",
                       "suggestion": "Peaty soil is very high in organic matter and retains water well. Ensure good drainage and lime to reduce acidity."},
                   4: {"soil_type": "Sandy Soil",
                       "recommended_crops": "Carrot, Potato, Groundnut (Peanut), Watermelon, Cucumber",
                       "suggestion": "Sandy soil drains quickly. Ensure frequent watering and add organic compost to retain nutrients."},
                   5: {"soil_type": "Silt Soil",
                       "recommended_crops": "Wheat, Rice, Sugarcane, Soybean",
                       "suggestion": "Silty soil is fertile but prone to compaction. Avoid walking on wet soil to prevent compacting."}}

        result = soil_db.get(class_idx,
                             {"soil_type": "Unknown",
                              "recommended_crops": "None relevant",
                              "suggestion": "Consult local experts."})
        result['confidence'] = round(confidence * 100, 2)  # type: ignore

        # If the class was Not Soil, return 400
        if "error" in result:
            try:
                os.remove(filepath)
            except BaseException:
                pass
            return jsonify({'error': result['error']}), 400

        # Cleanup
        try:
            os.remove(filepath)
        except BaseException:
            pass

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict_fertilizer', methods=['POST'])
def predict_fertilizer():
    if not fertilizer_model:
        return jsonify({'error': 'Model not loaded'}), 500
    try:
        data = request.json

        # Crop mapping to match train_models.py
        crops_list = [
            'rice',
            'maize',
            'chickpea',
            'kidneybeans',
            'pigeonpeas',
            'mothbeans',
            'mungbean',
            'blackgram',
            'lentil',
            'pomegranate',
            'banana',
            'mango',
            'grapes',
            'watermelon',
            'muskmelon',
            'apple',
            'orange',
            'papaya',
            'coconut',
            'cotton',
            'jute',
            'coffee']

        crop_name = data.get('crop', 'rice').lower()
        crop_idx = 0
        if crop_name in crops_list:
            crop_idx = crops_list.index(crop_name)

        features = [
            float(data.get('n', 0)),
            float(data.get('p', 0)),
            float(data.get('k', 0)),
            float(crop_idx)
        ]
        prediction = fertilizer_model.predict([features])[0]
        return jsonify({'prediction': str(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict_disease', methods=['POST'])
def predict_disease():
    if not disease_model:
        return jsonify({'error': 'Model not loaded'}), 500
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)

        # Preprocess image
        img = Image.open(filepath).resize((224, 224))
        img_array = np.array(img)
        if img_array.shape != (224, 224, 3):
            # handle png with alpha, or grayscale
            img = img.convert('RGB')
            img_array = np.array(img)

        img_array = img_array / 255.0
        
        # Protect the disease scanner from non-leaf images
        likely_soil, reason = is_likely_soil((img_array * 255).astype(np.uint8))
        if likely_soil:
            error_msg = "This appears to be a picture of bare soil. Please upload a clear photo of a plant leaf to scan for diseases."
        elif reason and "vegetation" not in reason:
            # Rejects roads, skies, and bright lights
            error_msg = "This does not appear to be a plant leaf. " + reason
        else:
            error_msg = None

        if error_msg:
            try:
                os.remove(filepath)
            except:
                pass
            return jsonify({'error': error_msg}), 400

        img_array = np.expand_dims(img_array, axis=0)

        prediction = disease_model.predict(img_array)
        class_idx = np.argmax(prediction[0])

        # Dummy disease classes
        disease_classes = {
            0: {"name": "Apple Scab", "treatment": "Fungicide sprays (Captan, Mancozeb) and removing fallen infected leaves."},
            1: {"name": "Healthy Plant", "treatment": "No treatment required. Maintain proper watering and nutrition."},
            2: {"name": "Potato Early Blight", "treatment": "Apply copper-based fungicides or chlorothalonil. Ensure proper crop rotation."}
        }

        result = disease_classes.get(
            class_idx, {
                "name": "Unknown", "treatment": "Consult a local agricultural expert."})

        # Cleanup
        try:
            os.remove(filepath)
        except BaseException:
            pass

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000)


