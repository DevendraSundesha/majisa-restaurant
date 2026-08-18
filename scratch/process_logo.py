import base64
import os

src = r"C:\Users\NexSecure\Downloads\New folder (3)\logo majisa rehan.png"
dst_public = r"c:\Users\NexSecure\Desktop\majisa restorent website\public\logo.png"
dst_assets = r"c:\Users\NexSecure\Desktop\majisa restorent website\src\assets\logo.png"
dst_component = r"c:\Users\NexSecure\Desktop\majisa restorent website\src\components\Logo.tsx"

os.makedirs(os.path.dirname(dst_public), exist_ok=True)
os.makedirs(os.path.dirname(dst_assets), exist_ok=True)

with open(src, "rb") as f:
    data = f.read()

# Write direct copies
with open(dst_public, "wb") as f:
    f.write(data)

with open(dst_assets, "wb") as f:
    f.write(data)

b64 = base64.b64encode(data).decode('utf-8')

# Try PIL resize to optimize size if PIL is available
try:
    from PIL import Image
    import io
    img = Image.open(src)
    img.thumbnail((600, 600), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format='PNG', optimize=True)
    opt_data = buf.getvalue()
    b64 = base64.b64encode(opt_data).decode('utf-8')
    with open(dst_public, "wb") as f:
        f.write(opt_data)
    with open(dst_assets, "wb") as f:
        f.write(opt_data)
    print("PIL Optimization successful! Compressed logo to", len(opt_data), "bytes")
except Exception as e:
    print("PIL not available, using raw logo bytes:", e)

# Write React Logo Component
component_code = f'''/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {{
  className?: string;
  size?: string;
  alt?: string;
}}

export const LOGO_BASE64 = "data:image/png;base64,{b64}";

export default function Logo({{ className = "w-12 h-12", alt = "Majisa Restaurant Logo" }}: LogoProps) {{
  return (
    <img
      src={{LOGO_BASE64}}
      alt={{alt}}
      className={{`object-contain inline-block rounded-full shadow-md ${{className}}`}}
    />
  );
}}
'''

with open(dst_component, "w", encoding="utf-8") as f:
    f.write(component_code)

print("Logo component created at src/components/Logo.tsx!")
