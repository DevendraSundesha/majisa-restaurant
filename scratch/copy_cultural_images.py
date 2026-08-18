import shutil
import os

brain_dir = r"C:\Users\NexSecure\.gemini\antigravity-ide\brain\86e399b7-3fd8-4faf-b691-237e7aa99e40"
public_images_dir = r"c:\Users\NexSecure\Desktop\majisa restorent website\public\images"

os.makedirs(public_images_dir, exist_ok=True)

files_to_copy = {
    "charpai_dining_photo_1785303470124.png": "charpai_dining.png",
    "desi_chulha_cooking_photo_1785303486092.png": "desi_chulha.png",
    "earthen_clay_cookery_photo_1785303501104.png": "earthen_cookery.png",
    "marwari_manuhaar_thali_photo_1785303516199.png": "marwari_manuhaar.png"
}

for src_name, dst_name in files_to_copy.items():
    src_path = os.path.join(brain_dir, src_name)
    dst_path = os.path.join(public_images_dir, dst_name)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dst_path)
        print(f"Copied {src_name} -> {dst_name}")
    else:
        print(f"Source not found: {src_path}")
