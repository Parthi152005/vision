"""
Downloads real soil images using icrawler (Bing) to replace synthetic training data.
"""
import os
import shutil
from icrawler.builtin import BingImageCrawler  # type: ignore

DATASET_DIR = "soil_dataset"

# The 6 soil classes we need
SOIL_CLASSES = {
    'Chalky': "chalky soil field farming close up real",
    'Clay': "clay soil farm field close up dry real photography",
    'Loamy': "loamy soil dark rich farming close up real",
    'Peaty': "peaty soil dark black organic farming ground",
    'Sandy': "sandy soil dry farm field close up photography",
    'Silty': "silty soil river bank farming close up dirt"
}

IMAGES_PER_CLASS = 150


def setup_real_dataset():
    print("Downloading real soil images using icrawler...")

    for class_name, query in SOIL_CLASSES.items():
        print(f"\n🌱 Searching for '{class_name}' soil (Query: '{query}')")

        train_dir = os.path.join(DATASET_DIR, "train", class_name)
        val_dir = os.path.join(DATASET_DIR, "val", class_name)

        os.makedirs(train_dir, exist_ok=True)
        os.makedirs(val_dir, exist_ok=True)

        # Clear old synthetic images
        for d in [train_dir, val_dir]:
            for f in os.listdir(d):
                os.remove(os.path.join(d, f))

        # Use a temporary folder for downloading
        temp_dir = os.path.join(DATASET_DIR, f"temp_{class_name}")
        os.makedirs(temp_dir, exist_ok=True)

        try:
            crawler = BingImageCrawler(storage={'root_dir': temp_dir})
            crawler.crawl(keyword=query, max_num=IMAGES_PER_CLASS)

            # Move images to train/val
            downloaded = os.listdir(temp_dir)
            success_count = 0

            for i, fname in enumerate(downloaded):
                ext = os.path.splitext(fname)[1]
                src = os.path.join(temp_dir, fname)
                split_dir = train_dir if success_count < int(
                    len(downloaded) * 0.8) else val_dir
                dst = os.path.join(
                    split_dir, f"{class_name}_real_{success_count}{ext}")

                shutil.move(src, dst)
                success_count += 1

            print(f"✅ Finished '{class_name}': "
                  f"{success_count} real images downloaded.")
        except Exception as e:
            print(f"❌ Error downloading {class_name}: {e}")
        finally:
            # Cleanup temp dir
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    setup_real_dataset()
