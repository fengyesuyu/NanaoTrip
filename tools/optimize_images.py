# -*- coding: utf-8 -*-
"""把 ImageGen 产出的 PNG 压缩为站点用的 JPG（零外链，本地化）。"""
import os
from PIL import Image

IMG_DIR = r"E:\Workbuddy\国庆旅游计划\nanao\assets\img"

# 文件名 -> 目标最大宽度
TARGETS = {
    "hero-coastal-road": 1600,
    "nanao-bridge": 1400,
    "old-street": 1400,
    "qingao-sunrise": 1400,
    "lighthouse": 1200,
    "windmill-hill": 1200,
    "beef-hotpot": 1200,
    "shengyan": 1200,
    "oyster-omelette": 1200,
    "chicken-wings": 1200,
    "fruit-box": 1200,
    "dessert": 1200,
    "tea-drink": 900,
}

total_before = 0
total_after = 0

for name, max_w in TARGETS.items():
    src = os.path.join(IMG_DIR, name + ".png")
    dst = os.path.join(IMG_DIR, name + ".jpg")
    if not os.path.exists(src):
        print("MISSING:", src)
        continue
    total_before += os.path.getsize(src)
    im = Image.open(src).convert("RGB")
    w, h = im.size
    if w > max_w:
        im = im.resize((max_w, round(h * max_w / w)), Image.LANCZOS)
    im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
    after = os.path.getsize(dst)
    total_after += after
    print(f"{name:22s} {w}x{h} -> {im.size[0]}x{im.size[1]}  "
          f"{os.path.getsize(src)/1024:7.0f}KB -> {after/1024:6.0f}KB")

print("-" * 62)
print(f"合计: {total_before/1024/1024:.1f}MB -> {total_after/1024/1024:.1f}MB")

# 清理 PNG
for name in TARGETS:
    p = os.path.join(IMG_DIR, name + ".png")
    if os.path.exists(p):
        os.remove(p)
print("PNG 已清理")
