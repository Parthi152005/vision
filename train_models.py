import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras import layers, models
import os

# Create dummy datasets and models
np.random.seed(42)

# 1. Crop Recommendation Model
# Features: N, P, K, temperature, humidity, ph, rainfall
# Target: label (rice, maize, chickpea, kidneybeans, pigeonpeas, mothbeans, mungbean, blackgram, lentil, pomegranate, banana, mango, grapes, watermelon, muskmelon, apple, orange, papaya, coconut, cotton, jute, coffee)
crops = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee']

data = []
for _ in range(2000):
    crop = np.random.choice(crops)
    n = np.random.randint(0, 140)
    p = np.random.randint(5, 145)
    k = np.random.randint(5, 205)
    temp = np.random.uniform(8.8, 43.6)
    hum = np.random.uniform(14.2, 99.9)
    ph = np.random.uniform(3.5, 9.9)
    rain = np.random.uniform(20.3, 298.5)
    data.append([n, p, k, temp, hum, ph, rain, crop])

df_crop = pd.DataFrame(data, columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'])
df_crop.to_csv('datasets/crop_data_format.csv', index=False)

X_crop = df_crop.drop('label', axis=1)
y_crop = df_crop['label']
rf_crop = RandomForestClassifier(n_estimators=10, random_state=42)
rf_crop.fit(X_crop, y_crop)
with open('models/crop_model.pkl', 'wb') as f:
    pickle.dump(rf_crop, f)
print("Crop model saved.")

# 2. Fertilizer Recommendation Model
# Features: Temperature, Humidity, Moisture, Soil Type, Crop Type, Nitrogen, Potassium, Phosphorous
# Since we usually only ask for N,P,K and pH or Crop in simple forms, we'll keep it simple for the web app: N, P, K, crop
# Target: Fertilizer Name (Urea, DAP, 14-35-14, 28-28, 20-20, 10-26-26)
fertilizers = ['Urea', 'DAP', '14-35-14', '28-28', '20-20', '10-26-26']

data_fert = []
for _ in range(500):
    n = np.random.randint(0, 140)
    p = np.random.randint(5, 145)
    k = np.random.randint(5, 205)
    # just an integer encoding for crop type for simplicity in the dummy model
    crop_idx = np.random.randint(0, len(crops))
    fert = np.random.choice(fertilizers)
    data_fert.append([n, p, k, crop_idx, fert])
    
df_fert = pd.DataFrame(data_fert, columns=['Nitrogen', 'Phosphorous', 'Potassium', 'CropType', 'Fertilizer'])
df_fert.to_csv('datasets/fertilizer_data_format.csv', index=False)

X_fert = df_fert.drop('Fertilizer', axis=1)
y_fert = df_fert['Fertilizer']
rf_fert = RandomForestClassifier(n_estimators=10, random_state=42)
rf_fert.fit(X_fert, y_fert)
with open('models/fertilizer_model.pkl', 'wb') as f:
    pickle.dump(rf_fert, f)
print("Fertilizer model saved.")

# 3. Plant Disease Detection Model (Dummy CNN)
# We will create a small compiled keras model that takes (224, 224, 3) images.
model = models.Sequential([
    layers.Input(shape=(224, 224, 3)),
    layers.Conv2D(8, (3, 3), activation='relu'),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(3, activation='softmax') # let's say 3 target classes
])
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.save('models/disease_model.h5')
print("Disease model saved.")

# 4. Soil Classification Model (Dummy CNN)
# Classes: Sandy (0), Clay (1), Loamy (2), Silty (3), Not Soil (4)
soil_model = models.Sequential([
    layers.Input(shape=(224, 224, 3)),
    layers.Conv2D(8, (3, 3), activation='relu'),
    layers.MaxPooling2D(),
    layers.Flatten(),
    layers.Dense(5, activation='softmax') # 5 target classes now
])
soil_model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
soil_model.save('models/soil_model.h5')
print("Soil model saved.")

print("All dummy models and datasets generated successfully.")
