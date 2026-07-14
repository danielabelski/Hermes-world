#!/usr/bin/env python3
"""Normalize a generated contact sheet into fixed-pivot source/runtime strips."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--source-output", required=True, type=Path)
    parser.add_argument("--runtime-output", required=True, type=Path)
    parser.add_argument("--columns", type=int, default=4)
    parser.add_argument("--rows", type=int, default=2)
    parser.add_argument("--alpha-threshold", type=int, default=8)
    parser.add_argument("--max-width", type=int, default=188)
    parser.add_argument("--max-height", type=int, default=218)
    parser.add_argument("--baseline", type=int, default=238)
    return parser.parse_args()


def alpha_bbox(image: Image.Image, threshold: int) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A").point(lambda value: 255 if value > threshold else 0)
    return alpha.getbbox()


def premultiplied_resize(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return image.convert("RGBa").resize(size, Image.Resampling.LANCZOS).convert("RGBA")


def main() -> None:
    args = parse_args()
    sheet = Image.open(args.input).convert("RGBA")
    frames: list[Image.Image] = []
    boxes: list[tuple[int, int, int, int]] = []

    for index in range(args.columns * args.rows):
        column = index % args.columns
        row = index // args.columns
        left = round(column * sheet.width / args.columns)
        right = round((column + 1) * sheet.width / args.columns)
        top = round(row * sheet.height / args.rows)
        bottom = round((row + 1) * sheet.height / args.rows)
        frame = sheet.crop((left, top, right, bottom))
        bbox = alpha_bbox(frame, args.alpha_threshold)
        if bbox is None:
            raise RuntimeError(f"Frame {index + 1} has no visible pixels")
        frames.append(frame.crop(bbox))
        boxes.append(bbox)

    max_content_width = max(frame.width for frame in frames)
    max_content_height = max(frame.height for frame in frames)
    scale = min(args.max_width / max_content_width, args.max_height / max_content_height)

    source_strip = Image.new("RGBA", (len(frames) * 256, 256), (0, 0, 0, 0))
    frame_manifest: list[str] = []
    for index, frame in enumerate(frames):
        width = max(1, round(frame.width * scale))
        height = max(1, round(frame.height * scale))
        normalized = premultiplied_resize(frame, (width, height))
        x = index * 256 + (256 - width) // 2
        y = args.baseline - height + 1
        source_strip.alpha_composite(normalized, (x, y))
        frame_manifest.append(
            f"frame={index + 1} source_bbox={boxes[index]} output_bbox=({x - index * 256},{y},{x - index * 256 + width - 1},{args.baseline})"
        )

    args.source_output.parent.mkdir(parents=True, exist_ok=True)
    args.runtime_output.parent.mkdir(parents=True, exist_ok=True)
    source_strip.save(args.source_output, optimize=True, compress_level=9)
    runtime_strip = premultiplied_resize(source_strip, (1024, 128))
    runtime_strip.save(args.runtime_output, optimize=True, compress_level=9)

    print(f"source={args.source_output} size={source_strip.size}")
    print(f"runtime={args.runtime_output} size={runtime_strip.size}")
    print(f"scale={scale:.6f} baseline={args.baseline}")
    print("\n".join(frame_manifest))


if __name__ == "__main__":
    main()
