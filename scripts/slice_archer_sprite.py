#!/usr/bin/env python3
"""
从 `public/assets/sprites/archer-ranger.png` 切出芽弓多部件 PNG，
写入 `public/assets/sprites/archer/`（head / torso / legs / arm-bow / bow）。

比例按不透明包围盒内相对坐标划分，侧视朝右：躯干偏左、右臂与弓在右侧。
需 Pillow：`pip install pillow`
"""

from __future__ import annotations

import os

from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, "public/assets/sprites/archer-ranger.png")
OUT_DIR = os.path.join(REPO, "public/assets/sprites/archer")


def opaque_bbox(im: Image.Image, alpha_threshold: int = 40) -> tuple[int, int, int, int]:
    px = im.load()
    w, h = im.size
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > alpha_threshold:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    return minx, miny, maxx - minx + 1, maxy - miny + 1


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    bx, by, bw, bh = opaque_bbox(im)

    def crop_box(x0: int, y0: int, x1: int, y1: int) -> Image.Image:
        x0 = max(0, min(w - 1, x0))
        y0 = max(0, min(h - 1, y0))
        x1 = max(0, min(w, x1 + 1))
        y1 = max(0, min(h, y1 + 1))
        return im.crop((x0, y0, x1, y1))

    # 头 / 躯干 / 腿 / 右臂+弓 / 弓身条
    # 侧视时面部在 x 上很宽（约 0.04–0.98 不透明区）；躯干若只取左 58% 会把眼睛、鼻梁裁到「手臂层」，
    # 叠层接缝稍有偏差就会出现竖向空洞。躯干加宽到 ~72%，手臂层从 ~50% 起并与躯干重叠，接缝藏在重叠区内。
    head = crop_box(bx, by, bx + bw - 1, by + int(bh * 0.32))
    torso = crop_box(
        bx,
        by + int(bh * 0.26),
        bx + int(bw * 0.72),
        by + int(bh * 0.58),
    )
    legs = crop_box(bx, by + int(bh * 0.54), bx + bw - 1, by + bh - 1)
    arm_bow = crop_box(
        bx + int(bw * 0.50),
        by + int(bh * 0.14),
        bx + bw - 1,
        by + int(bh * 0.56),
    )
    bow = crop_box(
        bx + int(bw * 0.60),
        by + int(bh * 0.12),
        bx + bw - 1,
        by + int(bh * 0.46),
    )

    os.makedirs(OUT_DIR, exist_ok=True)
    parts = [
        ("head.png", head),
        ("torso.png", torso),
        ("legs.png", legs),
        ("arm-bow.png", arm_bow),
        ("bow.png", bow),
    ]
    for name, img in parts:
        img.save(os.path.join(OUT_DIR, name), optimize=True)
        print(name, img.size)
    print("opaque_bbox", bx, by, bw, bh)


if __name__ == "__main__":
    main()
