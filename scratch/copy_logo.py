import shutil
import os

src = r"C:\Users\NexSecure\Downloads\New folder (3)\logo majisa rehan.png"
dst1 = r"c:\Users\NexSecure\Desktop\majisa restorent website\public\logo.png"
dst2 = r"c:\Users\NexSecure\Desktop\majisa restorent website\public\images\logo.png"

os.makedirs(os.path.dirname(dst1), exist_ok=True)
os.makedirs(os.path.dirname(dst2), exist_ok=True)

shutil.copyfile(src, dst1)
shutil.copyfile(src, dst2)

print("Logo copied successfully!")
