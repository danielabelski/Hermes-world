#!/usr/bin/env python
"""Turn a purpose-built 4x2 character sheet into anchored 128px map sprites."""

from __future__ import annotations

import argparse
from collections import deque
import json
from pathlib import Path

from PIL import Image


DEFAULT_NAMES = (
    "idle-se",
    "walk-se-a",
    "walk-se-a-pass",
    "walk-se-b-pass",
    "walk-se-b",
    "work-se",
    "alert-se",
    "success-se",
)


def alpha_bbox(image: Image.Image, threshold: int = 8) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > threshold else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("frame has no visible pixels")
    return bbox


def remove_small_components(image: Image.Image, threshold: int = 8, min_area: int = 800) -> Image.Image:
    """Remove isolated chroma-removal crumbs without touching the character."""
    alpha = image.getchannel("A")
    pixels = alpha.load()
    width, height = image.size
    visited = bytearray(width * height)
    remove: list[tuple[int, int]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or pixels[x, y] <= threshold:
                continue
            visited[index] = 1
            queue = deque([(x, y)])
            component: list[tuple[int, int]] = []
            while queue:
                current_x, current_y = queue.popleft()
                component.append((current_x, current_y))
                for next_x, next_y in ((current_x - 1, current_y), (current_x + 1, current_y), (current_x, current_y - 1), (current_x, current_y + 1)):
                    if next_x < 0 or next_y < 0 or next_x >= width or next_y >= height:
                        continue
                    next_index = next_y * width + next_x
                    if visited[next_index] or pixels[next_x, next_y] <= threshold:
                        continue
                    visited[next_index] = 1
                    queue.append((next_x, next_y))
            if len(component) < min_area:
                remove.extend(component)

    if remove:
        cleaned = image.copy()
        cleaned_alpha = cleaned.getchannel("A")
        cleaned_pixels = cleaned_alpha.load()
        for x, y in remove:
            cleaned_pixels[x, y] = 0
        cleaned.putalpha(cleaned_alpha)
        return cleaned
    return image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--names", default=",".join(DEFAULT_NAMES))
    parser.add_argument("--target-height", type=int, default=112)
    parser.add_argument("--max-width", type=int, default=120)
    parser.add_argument("--foot-y", type=int, default=124)
    parser.add_argument("--canvas", type=int, default=128)
    parser.add_argument("--duplicate", action="append", default=[])
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args()

    names = tuple(name.strip() for name in args.names.split(",") if name.strip())
    if len(names) != 8:
        raise ValueError("exactly eight frame names are required for the 4x2 sheet")

    sheet = Image.open(args.input).convert("RGBA")
    if sheet.width % 4 or sheet.height % 2:
        raise ValueError(f"sheet must divide into a 4x2 grid, got {sheet.size}")

    cell_width = sheet.width // 4
    cell_height = sheet.height // 2
    frames: list[dict[str, object]] = []
    for index, name in enumerate(names):
        column = index % 4
        row = index // 4
        cell = sheet.crop((column * cell_width, row * cell_height, (column + 1) * cell_width, (row + 1) * cell_height))
        cell = remove_small_components(cell)
        bbox = alpha_bbox(cell)
        frames.append({"name": name, "image": cell.crop(bbox), "source_bbox": bbox})

    # Idle + the four walking poses share one scale, preventing visible body
    # pumping. Work/alert/success keep it unless an extended tool would clip.
    locomotion_names = {"idle-se", "walk-se-a", "walk-se-a-pass", "walk-se-b", "walk-se-b-pass"}
    locomotion = [frame["image"] for frame in frames if frame["name"] in locomotion_names]
    max_locomotion_width = max(image.width for image in locomotion)
    max_locomotion_height = max(image.height for image in locomotion)
    locked_scale = min(args.max_width / max_locomotion_width, args.target_height / max_locomotion_height)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    report: list[dict[str, object]] = []
    for frame in frames:
        source = frame["image"]
        scale = min(locked_scale, args.max_width / source.width, args.target_height / source.height)
        size = (max(1, round(source.width * scale)), max(1, round(source.height * scale)))
        resized = source.resize(size, Image.Resampling.LANCZOS)

        canvas = Image.new("RGBA", (args.canvas, args.canvas), (0, 0, 0, 0))
        x = round((args.canvas - resized.width) / 2)
        y = args.foot_y - resized.height
        canvas.alpha_composite(resized, (x, y))

        png_path = args.output_dir / f"{frame['name']}.png"
        webp_path = args.output_dir / f"{frame['name']}.webp"
        canvas.save(png_path, optimize=True)
        canvas.save(webp_path, format="WEBP", lossless=True, quality=100, method=6, exact=True)

        final_bbox = alpha_bbox(canvas)
        alpha = canvas.getchannel("A")
        alpha_values = alpha.get_flattened_data()
        visible = sum(1 for value in alpha_values if value > 8)
        alpha_values = alpha.get_flattened_data()
        opaque = sum(1 for value in alpha_values if value >= 250)
        report.append({
            "frame": frame["name"],
            "sourceBBox": frame["source_bbox"],
            "finalBBox": final_bbox,
            "scale": round(scale, 5),
            "opaqueRatio": round(opaque / max(1, visible), 4),
            "webpBytes": webp_path.stat().st_size,
        })

    for duplicate in args.duplicate:
        target, source = duplicate.split("=", 1)
        for extension in ("png", "webp"):
            source_path = args.output_dir / f"{source}.{extension}"
            target_path = args.output_dir / f"{target}.{extension}"
            target_path.write_bytes(source_path.read_bytes())

    if args.preview:
        args.preview.parent.mkdir(parents=True, exist_ok=True)
        walk_names = ("walk-se-a", "walk-se-a-pass", "walk-se-b", "walk-se-b-pass")
        walk_frames = [Image.open(args.output_dir / f"{name}.png").convert("RGBA") for name in walk_names]
        walk_frames[0].save(
            args.preview,
            save_all=True,
            append_images=walk_frames[1:],
            duration=150,
            loop=0,
            disposal=2,
        )

    report_path = args.output_dir / "asset-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
