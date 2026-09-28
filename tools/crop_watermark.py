# -*- coding: utf-8 -*-
"""裁掉图片底部 8%，去掉生成水印。"""
import os
from PIL import Image

IMG_DIR = r"E:\Workbuddy\国庆旅游计划\nanao\assets\img"
CROP_RATIO = 0.08

for fn in sorted(os.listdir(IMG_DIR)):
    if not fn.lower().endswith(".jpg"):
        continue
    p = os.path.join(IMG_DIR, fn)
    im = Image.open(p)
    w, h = im.size
    new_h = int(h * (1 - CROP_RATIO))
    im.crop((0, 0, w, new_h)).save(p, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"{fn:26s} {w}x{h} -> {w}x{new_h}  {os.path.getsize(p)/1024:6.0f}KB")

total = sum(os.path.getsize(os.path.join(IMG_DIR, f)) for f in os.listdir(IMG_DIR) if f.endswith(".jpg"))
print(f"合计 {total/1024/1024:.1f}MB")
