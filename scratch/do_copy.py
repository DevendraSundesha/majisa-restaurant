import shutil
import os

src = r"C:\Users\NexSecure\Downloads\majisa.mp4"
dst1 = r"c:\Users\NexSecure\Desktop\majisa restorent website\public\uploads\majisa.mp4"
dst2 = r"c:\Users\NexSecure\Desktop\majisa restorent website\uploads\majisa.mp4"

os.makedirs(os.path.dirname(dst1), exist_ok=True)
os.makedirs(os.path.dirname(dst2), exist_ok=True)

if os.path.exists(src):
    shutil.copy2(src, dst1)
    shutil.copy2(src, dst2)
    print("SUCCESSFULLY COPIED majisa.mp4 to public/uploads/majisa.mp4!")
else:
    print("Source majisa.mp4 not found in Downloads!")
