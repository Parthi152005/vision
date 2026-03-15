from PIL import Image
import numpy as np
import tensorflow as tf

model = tf.keras.models.load_model('models/soil_model.h5')

# Test with different soil-like colors
test_cases = {
    'Sandy': [194, 178, 128],
    'Clay': [139, 90, 43],
    'Loamy': [101, 67, 33],
    'Silty': [160, 140, 100],
    'Green (Not Soil)': [34, 139, 34],
}

classes = ['Clay', 'Loamy', 'NotSoil', 'Sandy', 'Silty']

for name, color in test_cases.items():
    img = np.full((224, 224, 3), color, dtype=np.uint8)
    noise = np.random.randint(-30, 30, (224, 224, 3), dtype=np.int16)
    img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    img_array = img / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    pred = model.predict(img_array, verbose=0)
    idx = np.argmax(pred[0])
    conf = pred[0][idx] * 100
    print(f"{name:20s} -> Predicted: {classes[idx]:10s} ({conf:.1f}%)")
    for c, p in zip(classes, pred[0]):
        print(f"   {c}: {p*100:.1f}%")
    print()
