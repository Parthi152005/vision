import requests
from PIL import Image
import numpy as np
import os

test_cases = {
    'Sandy': [194, 178, 128],
    'Clay': [139, 90, 43],
    'Loamy': [101, 67, 33],
    'Silty': [160, 140, 100],
    'Green (Not Soil)': [34, 139, 34],
}

print("Testing API endpoint for all 5 classes...")
for name, color in test_cases.items():
    img = np.full((224, 224, 3), color, dtype=np.uint8)
    noise = np.random.randint(-30, 30, (224, 224, 3), dtype=np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    filename = f'test_{name.split()[0]}.jpg'
    Image.fromarray(img).save(filename)
    
    try:
        with open(filename, 'rb') as f:
            r = requests.post('http://localhost:5000/api/predict_crop', files={'file': f})
        
        if r.status_code == 200:
            print(f"✅ {name:15s} -> Status {r.status_code} | Result: {r.json().get('soil_type')}")
        else:
            print(f"❌ {name:15s} -> Status {r.status_code} | Error: {r.json().get('error')}")
    except Exception as e:
        print(f"⚠️ {name:15s} -> Connection failed: {e}")
        
    os.remove(filename)
