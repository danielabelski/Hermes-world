#!/usr/bin/env python3
"""Remove residual magenta chroma spill without changing cyan or amber VFX."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--threshold", type=int, default=7)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    image = Image.open(args.input).convert("RGBA")
    cleaned: list[tuple[int, int, int, int]] = []
    changed = 0

    for red, green, blue, alpha in image.getdata():
        dominance = min(red, blue) - green
        if alpha == 0 or dominance <= args.threshold:
            cleaned.append((red, green, blue, alpha))
            continue

        strength = min(1.0, (dominance - args.threshold) / 72)
        neutral = max(green, round((red + green + blue) / 4))
        red = round(red + (neutral - red) * strength * 0.9)
        blue = round(blue + (neutral - blue) * strength * 0.9)
        alpha_factor = 1 - strength * (0.9 if alpha < 160 else 0.55)
        alpha = round(alpha * alpha_factor)
        if alpha < 5:
            alpha = 0
        cleaned.append((red, green, blue, alpha))
        changed += 1

    image.putdata(cleaned)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.output, optimize=True, compress_level=9)
    print(f"output={args.output} changed_pixels={changed}")


if __name__ == "__main__":
    main()
