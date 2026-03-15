"""
AgriVision - Soil Classification Model Training Script
Uses MobileNetV2 Transfer Learning for accurate soil type classification.

Classes: Sandy (0), Clay (1), Loamy (2), Silty (3), Not Soil (4)

Usage:
    1. Create a 'soil_dataset/' folder with subfolders: Sandy, Clay, Loamy, Silty, NotSoil
    2. Place ~50+ images in each subfolder
    3. Run: python train_soil_model.py

    OR: Run directly - it will generate a synthetic dataset for demonstration.
"""

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import os
from PIL import Image

DATASET_DIR = 'soil_dataset'
MODEL_PATH = 'models/soil_model.h5'
IMG_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 10

def generate_synthetic_dataset():
    """Generate a synthetic soil dataset with color-based patterns for demonstration."""
    print("Generating synthetic soil + diverse NotSoil images for training...")

    soil_classes = {
        'Sandy':  {'base_color': (194, 178, 128), 'noise': 40},  # Light tan/yellow
        'Clay':   {'base_color': (139, 90, 43),   'noise': 30},  # Dark brown/red
        'Loamy':  {'base_color': (101, 67, 33),   'noise': 35},  # Dark brown
        'Silty':  {'base_color': (160, 140, 100), 'noise': 25},  # Gray-brown
        'Peaty':  {'base_color': (45, 30, 15),    'noise': 20},  # Very dark brown/black
        'Chalky': {'base_color': (220, 210, 185), 'noise': 20},  # Off-white / pale beige
    }

    # Multiple distinct non-soil profiles so the model learns a wide variety of "not soil"
    not_soil_profiles = [
        {'base_color': (245, 245, 243), 'noise': 8},   # White / plain paper
        {'base_color': (200, 195, 190), 'noise': 15},  # Crumpled gray paper / concrete
        {'base_color': (100, 149, 237), 'noise': 30},  # Sky blue
        {'base_color': (34, 139, 34),   'noise': 50},  # Green grass / leaves
        {'base_color': (70, 70, 70),    'noise': 20},  # Dark asphalt / road
    ]

    def make_image(base_color, noise_level):
        base = np.array(base_color, dtype=np.float32)
        variation = np.random.uniform(-15, 15, 3)
        img_color = np.clip(base + variation, 0, 255)
        img = np.full((IMG_SIZE[0], IMG_SIZE[1], 3), img_color, dtype=np.uint8)
        noise_arr = np.random.randint(-noise_level, noise_level,
                                      (IMG_SIZE[0], IMG_SIZE[1], 3), dtype=np.int16)
        img = np.clip(img.astype(np.int16) + noise_arr, 0, 255).astype(np.uint8)
        for _ in range(np.random.randint(5, 20)):
            x, y = np.random.randint(0, 200, 2)
            w, h = np.random.randint(5, 30, 2)
            patch_color = np.clip(img_color + np.random.uniform(-40, 40, 3), 0, 255)
            img[y:y+h, x:x+w] = patch_color.astype(np.uint8)
        return img

    for split in ['train', 'val']:
        n_soil = 150 if split == 'train' else 30

        # --- Soil classes ---
        for class_name, props in soil_classes.items():
            dir_path = os.path.join(DATASET_DIR, split, class_name)
            os.makedirs(dir_path, exist_ok=True)
            for i in range(n_soil):
                img = make_image(props['base_color'], props['noise'])
                Image.fromarray(img).save(os.path.join(dir_path, f'{class_name}_{i}.jpg'))

        # --- NotSoil class: generate equal share from each sub-profile ---
        not_soil_dir = os.path.join(DATASET_DIR, split, 'NotSoil')
        os.makedirs(not_soil_dir, exist_ok=True)
        n_not_soil = 150 if split == 'train' else 30
        imgs_per_profile = n_not_soil // len(not_soil_profiles)
        img_idx = 0
        for profile in not_soil_profiles:
            for _ in range(imgs_per_profile):
                img = make_image(profile['base_color'], profile['noise'])
                Image.fromarray(img).save(os.path.join(not_soil_dir, f'NotSoil_{img_idx}.jpg'))
                img_idx += 1
        # Fill any remainder with the first profile
        while img_idx < n_not_soil:
            img = make_image(not_soil_profiles[0]['base_color'], not_soil_profiles[0]['noise'])
            Image.fromarray(img).save(os.path.join(not_soil_dir, f'NotSoil_{img_idx}.jpg'))
            img_idx += 1

    print(f"Generated synthetic dataset in '{DATASET_DIR}/'")


def train_model():
    """Train a soil classification model using MobileNetV2 transfer learning."""
    
    # Check if dataset exists, if not generate synthetic data
    if not os.path.exists(os.path.join(DATASET_DIR, 'train')):
        generate_synthetic_dataset()
    
    train_dir = os.path.join(DATASET_DIR, 'train')
    val_dir = os.path.join(DATASET_DIR, 'val')
    
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )
    
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='sparse',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='sparse',
        shuffle=False
    )
    
    # Print class mapping
    print("\n📋 Class Mapping:")
    for class_name, idx in sorted(train_generator.class_indices.items(), key=lambda x: x[1]):
        print(f"   {idx}: {class_name}")
    
    # Build a simple Custom CNN that will easily learn the color distributions
    model = models.Sequential([
        layers.Input(shape=(224, 224, 3)),
        layers.Conv2D(16, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(6, activation='softmax')
    ])
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    # Train
    print("\n🚀 Starting Training...\n")
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_generator,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2)
        ]
    )
    
    # Save model
    os.makedirs('models', exist_ok=True)
    model.save(MODEL_PATH)
    
    # Print results
    val_loss, val_acc = model.evaluate(val_generator)
    print(f"\n✅ Model saved to '{MODEL_PATH}'")
    print(f"📊 Validation Accuracy: {val_acc*100:.1f}%")
    print(f"\n📋 Class Index Order (IMPORTANT - must match app.py):")
    for class_name, idx in sorted(train_generator.class_indices.items(), key=lambda x: x[1]):
        print(f"   {idx}: {class_name}")
    print("\n⚠️  Make sure the class order above matches the soil_db dictionary in app.py!")
    

if __name__ == '__main__':
    train_model()
