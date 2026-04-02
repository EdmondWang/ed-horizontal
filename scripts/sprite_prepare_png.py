#!/usr/bin/env python3
"""
将带浅灰 / 浅白 / 假棋盘格背景的精灵 PNG 转为透明底并裁边（供 `public/assets/sprites` 使用）。
边泛洪：与边缘连通的低饱和背景色视为透明；可去除灰底、白底及误烘焙的棋盘噪点。
依赖：Pillow（`pip install pillow`）。
用法：python3 scripts/sprite_prepare_png.py public/assets/sprites/foo.png
"""

from __future__ import annotations

import sys
from collections import deque

from PIL import Image


def is_bg_like(r: int, g: int, b: int) -> bool:
    """与边缘连通的背景：浅白、浅灰、中灰（低饱和）。"""
    mx, mn = max(r, g, b), min(r, g, b)
    if mx - mn > 42:
        return False
    if mn >= 248:
        return True
    if mn >= 88 and mx <= 175:
        return True
    if mn >= 165 and mx <= 252:
        return True
    return False


def remove_edge_gray(path: str) -> None:
    im = Image.open(path).convert('RGBA')
    px = im.load()
    w, h = im.size
    visited = [[False] * h for _ in range(w)]
    q: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        if not (0 <= x < w and 0 <= y < h):
            return
        if visited[x][y]:
            return
        r, g, b, a = px[x, y]
        if not a:
            visited[x][y] = True
            return
        if is_bg_like(r, g, b):
            visited[x][y] = True
            q.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            if visited[nx][ny]:
                continue
            r, g, b, a = px[nx, ny]
            if not a:
                visited[nx][ny] = True
                continue
            if is_bg_like(r, g, b):
                visited[nx][ny] = True
                q.append((nx, ny))

    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 32:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    pad = 4
    minx = max(0, minx - pad)
    miny = max(0, miny - pad)
    maxx = min(w - 1, maxx + pad)
    maxy = min(h - 1, maxy + pad)
    cropped = im.crop((minx, miny, maxx + 1, maxy + 1))
    cropped.save(path, optimize=True)
    print(f'OK: {path} -> {cropped.size}')


def main() -> None:
    if len(sys.argv) != 2:
        print('用法: python3 scripts/sprite_prepare_png.py <png路径>', file=sys.stderr)
        sys.exit(1)
    remove_edge_gray(sys.argv[1])


if __name__ == '__main__':
    main()
