"""Extract the twelve supplied Hermes heroes into stable transparent assets.

This is deliberately deterministic.  It never redraws or generates a hero: it
only crops the user-supplied contact sheet, removes border-connected dark
background pixels, applies a hand-authored safety envelope, and normalises the
result onto a 256x256 bottom-centred canvas.
"""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = Path.home() / "Desktop" / "ChatGPT Image 10 lip 2026, 18_17_45.png"
OUTPUT_DIR = ROOT / "public" / "heroes"
CANVAS_SIZE = 256
MAX_FIGURE_WIDTH = 226
MAX_FIGURE_HEIGHT = 238
BASELINE_Y = 248


@dataclass(frozen=True)
class HeroSpec:
    hero_id: int
    name: str
    crop: tuple[int, int, int, int]
    envelopes: tuple[tuple[tuple[int, int], ...], ...]
    cores: tuple[tuple[tuple[int, int], ...], ...]
    erase: tuple[tuple[int, int, int, int], ...] = ()
    soft_matte: bool = True


def polygon(*points: tuple[int, int]) -> tuple[tuple[int, int], ...]:
    return points


# Coordinates below are local to each audited crop.  Multiple envelopes retain
# detached role props (drones, staves, holograms and retorts) without retaining
# the labels, dividers or rectangular panel background.
HEROES = (
    HeroSpec(1, "Kasztelan", (32, 136, 246, 498), (
        polygon((13, 6), (42, 5), (49, 336), (18, 344)),
        polygon((38, 48), (92, 26), (155, 37), (205, 105), (211, 290), (178, 350), (53, 349), (34, 279)),
    ), (
        polygon((84, 41), (123, 39), (138, 69), (129, 96), (89, 98), (75, 67)),
        polygon((61, 84), (145, 80), (164, 157), (151, 265), (67, 264), (46, 152)),
        polygon((48, 91), (72, 87), (68, 205), (43, 222), (31, 198)),
        polygon((145, 89), (174, 101), (183, 203), (159, 219)),
        polygon((67, 246), (105, 244), (101, 340), (64, 340)),
        polygon((107, 244), (149, 243), (151, 339), (109, 340)),
    ), ((45, 0, 214, 43),)),
    HeroSpec(2, "Zwiadowca", (274, 176, 500, 498), (
        polygon((45, 43), (91, 5), (145, 20), (170, 83), (178, 222), (154, 306), (62, 306), (42, 225)),
        polygon((0, 52), (66, 29), (91, 85), (31, 121)),
        polygon((137, 0), (225, 0), (224, 85), (157, 93)),
        polygon((4, 112), (120, 73), (164, 129), (104, 194), (7, 183)),
    ), (
        polygon((82, 8), (126, 7), (144, 42), (130, 74), (84, 74), (70, 39)),
        polygon((64, 55), (139, 48), (158, 133), (145, 215), (72, 218), (49, 126)),
        polygon((51, 77), (75, 69), (67, 177), (41, 190), (31, 164)),
        polygon((139, 69), (163, 84), (170, 176), (147, 187)),
        polygon((70, 204), (104, 201), (103, 296), (67, 299)),
        polygon((108, 201), (143, 202), (158, 296), (112, 299)),
    ),),
    HeroSpec(3, "Architekt", (520, 176, 740, 498), (
        polygon((22, 19), (104, 4), (158, 33), (182, 102), (180, 295), (35, 303), (13, 194)),
        polygon((117, 66), (220, 57), (220, 163), (123, 177)),
    ), (
        polygon((82, 10), (120, 8), (137, 40), (126, 70), (85, 72), (68, 39)),
        polygon((57, 56), (139, 48), (158, 139), (150, 252), (57, 252), (39, 130)),
        polygon((45, 69), (66, 63), (63, 166), (34, 187), (22, 164)),
        polygon((140, 70), (165, 84), (182, 170), (156, 185)),
        polygon((58, 228), (102, 229), (99, 299), (51, 299)),
        polygon((105, 228), (148, 226), (161, 299), (108, 300)),
    ),),
    HeroSpec(4, "Budowniczy", (776, 178, 1000, 498), (
        polygon((19, 25), (92, 7), (166, 19), (220, 70), (217, 255), (185, 312), (40, 312), (14, 218)),
    ), (
        polygon((79, 10), (130, 8), (148, 43), (137, 75), (84, 77), (64, 42)),
        polygon((48, 60), (159, 49), (187, 147), (170, 229), (53, 230), (29, 139)),
        polygon((31, 82), (57, 72), (54, 181), (25, 205), (13, 176)),
        polygon((158, 74), (190, 86), (207, 187), (177, 202)),
        polygon((52, 213), (102, 211), (100, 304), (48, 306)),
        polygon((109, 210), (163, 211), (178, 304), (112, 306)),
    ),),
    HeroSpec(5, "Straznik", (1018, 176, 1252, 498), (
        polygon((12, 24), (94, 4), (160, 12), (229, 68), (229, 224), (198, 308), (34, 310), (4, 224)),
    ), (
        polygon((91, 10), (134, 8), (148, 38), (137, 67), (94, 68), (79, 38)),
        polygon((65, 67), (151, 60), (169, 119), (156, 211), (72, 212), (55, 120)),
        polygon((47, 76), (73, 68), (77, 121), (59, 143), (41, 126)),
        polygon((53, 121), (67, 132), (54, 194), (35, 207), (29, 188)),
        polygon((20, 176), (45, 163), (59, 208), (36, 226), (13, 208)),
        polygon((151, 68), (190, 72), (225, 121), (224, 224), (180, 250), (158, 190)),
        polygon((68, 199), (109, 198), (105, 303), (60, 306)),
        polygon((113, 197), (157, 198), (173, 302), (111, 306)),
    ), (), False),
    HeroSpec(6, "Uzdrowiciel", (1283, 183, 1503, 498), (
        polygon((0, 0), (60, 0), (70, 315), (16, 315)),
        polygon((37, 24), (112, 2), (171, 27), (219, 76), (216, 246), (181, 307), (52, 309), (29, 211)),
    ), (
        polygon((91, 8), (132, 7), (147, 39), (137, 69), (94, 70), (79, 38)),
        polygon((65, 55), (150, 49), (173, 136), (163, 248), (62, 250), (43, 128)),
        polygon((50, 71), (73, 65), (68, 174), (39, 198), (28, 169)),
        polygon((150, 69), (180, 83), (207, 167), (177, 185)),
        polygon((63, 229), (107, 228), (103, 304), (56, 305)),
        polygon((112, 228), (160, 228), (174, 304), (111, 306)),
    ),),
    HeroSpec(7, "Alchemik", (34, 584, 238, 926), (
        polygon((0, 74), (53, 17), (120, 3), (171, 35), (203, 113), (200, 320), (22, 326), (0, 243)),
    ), (
        polygon((78, 14), (115, 11), (128, 39), (119, 67), (81, 68), (67, 39)),
        polygon((58, 60), (132, 54), (149, 119), (139, 222), (59, 224), (43, 118)),
        polygon((42, 78), (65, 70), (66, 126), (48, 176), (28, 181), (27, 135)),
        polygon((16, 78), (45, 68), (55, 118), (35, 144), (8, 128)),
        polygon((131, 72), (157, 80), (174, 143), (158, 187), (139, 177)),
        polygon((148, 193), (184, 177), (199, 252), (181, 322), (146, 314)),
        polygon((54, 207), (96, 207), (93, 321), (48, 324)),
        polygon((100, 206), (141, 207), (154, 320), (98, 325)),
        polygon((0, 86), (23, 72), (41, 101), (30, 133), (2, 128)),
    ), ((0, 0, 204, 24),), False),
    HeroSpec(8, "Kronikarz", (279, 586, 493, 926), (
        polygon((9, 60), (74, 6), (140, 9), (191, 47), (211, 192), (190, 327), (31, 326), (8, 218)),
    ), (
        polygon((78, 8), (115, 7), (130, 37), (120, 66), (80, 68), (65, 37)),
        polygon((55, 53), (135, 47), (158, 134), (153, 256), (50, 258), (32, 129)),
        polygon((37, 72), (63, 64), (60, 169), (29, 190), (16, 162)),
        polygon((134, 68), (165, 81), (186, 168), (157, 188)),
        polygon((51, 239), (96, 237), (94, 318), (45, 320)),
        polygon((102, 237), (149, 237), (163, 317), (101, 321)),
    ),),
    HeroSpec(9, "Prorok", (516, 584, 748, 926), (
        polygon((0, 57), (83, 4), (153, 10), (227, 53), (231, 210), (204, 329), (29, 330), (0, 220)),
    ), (
        polygon((95, 10), (132, 8), (147, 38), (137, 67), (96, 69), (82, 38)),
        polygon((67, 54), (151, 47), (174, 137), (165, 260), (60, 263), (40, 132)),
        polygon((48, 72), (76, 63), (69, 171), (34, 190), (20, 163)),
        polygon((149, 68), (181, 82), (210, 169), (175, 188)),
        polygon((60, 241), (106, 238), (104, 322), (50, 324)),
        polygon((111, 238), (162, 239), (178, 322), (111, 325)),
    ),),
    HeroSpec(10, "Dyplomata", (776, 584, 1007, 926), (
        polygon((11, 37), (83, 4), (151, 8), (215, 61), (230, 208), (197, 329), (32, 331), (3, 205)),
    ), (
        polygon((86, 9), (125, 8), (141, 39), (131, 68), (89, 70), (73, 39)),
        polygon((59, 55), (143, 47), (169, 137), (160, 258), (53, 261), (33, 130)),
        polygon((41, 73), (67, 64), (61, 174), (29, 197), (16, 168)),
        polygon((142, 70), (174, 82), (205, 170), (171, 190)),
        polygon((53, 240), (99, 238), (97, 322), (46, 324)),
        polygon((105, 237), (157, 238), (174, 321), (105, 325)),
    ),),
    HeroSpec(11, "Komandos", (1017, 576, 1251, 928), (
        polygon((70, 22), (151, 18), (179, 72), (176, 264), (151, 337), (52, 338), (31, 149), (46, 70)),
        polygon((17, 84), (68, 72), (68, 202), (48, 285), (5, 278), (21, 180)),
        polygon((147, 79), (190, 87), (229, 184), (224, 321), (168, 330), (165, 208)),
        polygon((42, 242), (106, 239), (102, 343), (34, 345)),
        polygon((104, 239), (169, 241), (184, 343), (101, 346)),
    ), (
        polygon((96, 30), (137, 29), (146, 55), (136, 80), (99, 81), (90, 55)),
        polygon((73, 75), (159, 72), (169, 128), (153, 205), (79, 206), (63, 128)),
        polygon((57, 88), (80, 80), (82, 130), (65, 168), (47, 159), (48, 119)),
        polygon((48, 151), (67, 157), (55, 223), (34, 236), (27, 213)),
        polygon((157, 84), (181, 92), (198, 127), (185, 150), (164, 135)),
        polygon((184, 118), (216, 132), (226, 174), (211, 185), (190, 160)),
        polygon((72, 191), (115, 190), (111, 338), (57, 340), (66, 242)),
        polygon((117, 190), (160, 191), (181, 338), (109, 341), (119, 246)),
        polygon((7, 164), (45, 141), (59, 179), (43, 285), (3, 281)),
        polygon((151, 137), (183, 142), (228, 184), (222, 318), (169, 330), (159, 210)),
    ), ((55, 0, 233, 40),), False),
    HeroSpec(12, "Wlocznik", (1277, 568, 1507, 926), (
        polygon((0, 0), (45, 0), (55, 357), (7, 357)),
        polygon((68, 36), (148, 30), (174, 86), (170, 271), (151, 347), (55, 348), (35, 160), (49, 82)),
        polygon((22, 95), (70, 86), (67, 214), (46, 286), (19, 278)),
        polygon((145, 96), (181, 104), (211, 199), (205, 303), (165, 328), (159, 217)),
        polygon((49, 261), (104, 258), (101, 350), (44, 351)),
        polygon((103, 258), (161, 259), (178, 349), (100, 352)),
        polygon((151, 32), (230, 22), (229, 111), (167, 124)),
        polygon((160, 117), (230, 107), (229, 236), (164, 238)),
    ), (
        polygon((88, 39), (128, 35), (144, 67), (135, 96), (91, 98), (74, 66)),
        polygon((61, 83), (145, 75), (172, 169), (163, 283), (56, 286), (35, 160)),
        polygon((42, 102), (69, 92), (64, 204), (30, 230), (16, 199)),
        polygon((145, 94), (177, 107), (207, 198), (173, 218)),
        polygon((55, 263), (101, 261), (99, 344), (48, 347)),
        polygon((107, 260), (159, 261), (176, 343), (106, 348)),
    ), ((48, 0, 230, 35),)),
)


def luminance(rgb: tuple[int, int, int]) -> float:
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722


def row_backgrounds(image: Image.Image) -> list[tuple[int, int, int]]:
    pixels = image.load()
    width, height = image.size
    rows: list[tuple[int, int, int]] = []
    for y in range(height):
        samples = []
        for x in (*range(0, min(7, width)), *range(max(0, width - 7), width)):
            value = pixels[x, y]
            if luminance(value) < 82:
                samples.append(value)
        if not samples:
            samples = [pixels[0, y], pixels[width - 1, y]]
        channels = tuple(sorted(value[channel] for value in samples)[len(samples) // 2] for channel in range(3))
        rows.append(channels)

    # A small vertical median suppresses isolated staff/prop contamination at
    # the crop edge while following the sheet's gentle vertical gradient.
    smoothed = []
    for y in range(height):
        window = rows[max(0, y - 5): min(height, y + 6)]
        smoothed.append(tuple(sorted(value[channel] for value in window)[len(window) // 2] for channel in range(3)))
    return smoothed


def border_connected_background(image: Image.Image) -> Image.Image:
    width, height = image.size
    pixels = image.load()
    backgrounds = row_backgrounds(image)
    eligible = bytearray(width * height)

    for y in range(height):
        background = backgrounds[y]
        for x in range(width):
            rgb = pixels[x, y]
            diff = max(abs(rgb[channel] - background[channel]) for channel in range(3))
            light = luminance(rgb)
            chroma = max(rgb) - min(rgb)
            # The sheet background is dark and low-contrast.  Connectedness is
            # essential: equally dark armour remains foreground when enclosed
            # by a brighter rim.
            is_background = (
                (diff <= 22 and light <= 76)
                or (diff <= 36 and light <= 46 and chroma <= 34)
                or (diff <= 52 and light <= 27)
            )
            eligible[y * width + x] = 1 if is_background else 0

    flooded = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        queue.append((x, 0)); queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y)); queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if flooded[index] or not eligible[index]:
            continue
        flooded[index] = 1
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))

    alpha = Image.new("L", (width, height), 255)
    alpha.putdata([0 if flooded[index] else 255 for index in range(width * height)])
    return alpha


def soft_foreground_alpha(image: Image.Image) -> Image.Image:
    """Estimate a soft matte for props and antialiased silhouette edges.

    The source sheet has no alpha and its background is textured.  A soft
    colour-distance matte retains glow, hair, thin weapons and holograms while
    the hand-authored anatomical cores below guarantee opaque dark clothing.
    """
    width, height = image.size
    pixels = image.load()
    backgrounds = row_backgrounds(image)
    values = []
    for y in range(height):
        background = backgrounds[y]
        background_light = luminance(background)
        for x in range(width):
            rgb = pixels[x, y]
            diff = max(abs(rgb[channel] - background[channel]) for channel in range(3))
            light_delta = max(0.0, luminance(rgb) - background_light)
            chroma_delta = max(0, (max(rgb) - min(rgb)) - (max(background) - min(background)))
            score = max(diff * 4.6, light_delta * 3.6, chroma_delta * 2.4)
            alpha = round(max(0, min(255, (score - 20) * 1.35)))
            values.append(alpha)
    matte = Image.new("L", image.size, 0)
    matte.putdata(values)
    return matte.filter(ImageFilter.GaussianBlur(0.45))


def safety_mask(spec: HeroSpec, size: tuple[int, int]) -> tuple[Image.Image, Image.Image]:
    envelope = Image.new("L", size, 0)
    draw = ImageDraw.Draw(envelope)
    for points in spec.envelopes:
        draw.polygon(points, fill=255)
    for box in spec.erase:
        draw.rectangle(box, fill=0)

    core = Image.new("L", size, 0)
    core_draw = ImageDraw.Draw(core)
    for points in spec.cores:
        core_draw.polygon(points, fill=255)
    return envelope, core


def remove_small_islands(mask: Image.Image, core: Image.Image, minimum_area: int = 14) -> Image.Image:
    width, height = mask.size
    source = mask.load()
    core_pixels = core.load()
    visited = bytearray(width * height)
    output = Image.new("L", mask.size, 0)
    output_pixels = output.load()

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or source[x, y] < 128:
                continue
            queue = deque([(x, y)])
            visited[index] = 1
            component = []
            protected = False
            while queue:
                cx, cy = queue.popleft()
                component.append((cx, cy))
                protected = protected or core_pixels[cx, cy] > 0
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        nindex = ny * width + nx
                        if not visited[nindex] and source[nx, ny] >= 128:
                            visited[nindex] = 1
                            queue.append((nx, ny))
            if protected or len(component) >= minimum_area:
                for cx, cy in component:
                    output_pixels[cx, cy] = 255
    return output


def extract(source: Image.Image, spec: HeroSpec) -> Image.Image:
    crop = source.crop(spec.crop).convert("RGB")
    connected = border_connected_background(crop)
    soft = soft_foreground_alpha(crop)
    envelope, core = safety_mask(spec, crop.size)
    # Connected foreground contributes only where the soft matte sees a real
    # colour edge.  This prevents enclosed pieces of the panel background from
    # becoming opaque black wedges.  The near-black Komandos uses its audited
    # anatomical mask only; smoke in that panel is inseparable from the source
    # background without a native alpha render.
    if spec.soft_matte:
        alpha = Image.composite(ImageChops.lighter(soft, soft.point(lambda value: min(255, value * 2))), Image.new("L", crop.size, 0), envelope)
        connected_edges = Image.composite(connected, Image.new("L", crop.size, 0), soft.point(lambda value: 255 if value > 72 else 0))
        alpha = ImageChops.lighter(alpha, connected_edges)
    else:
        alpha = Image.new("L", crop.size, 0)
    # Anatomical cores are intentionally split into head, torso, arms and legs.
    # A translucent floor restores black armour/cloaks, while colour distance
    # supplies opacity to real painted detail.  This avoids turning unavoidable
    # background pixels inside a manual polygon into an opaque black wedge.
    core_alpha = soft.point(lambda value: min(255, 160 + round(value * 0.48)))
    alpha = Image.composite(ImageChops.lighter(alpha, core_alpha), alpha, core)
    for box in spec.erase:
        ImageDraw.Draw(alpha).rectangle(box, fill=0)
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.55))

    rgba = crop.convert("RGBA")
    rgba.putalpha(alpha)
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError(f"hero-{spec.hero_id:02d}: empty mask")
    figure = rgba.crop(bounds)

    scale = min(MAX_FIGURE_WIDTH / figure.width, MAX_FIGURE_HEIGHT / figure.height)
    figure = figure.resize(
        (max(1, round(figure.width * scale)), max(1, round(figure.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    x = round((CANVAS_SIZE - figure.width) / 2)
    y = BASELINE_Y - figure.height
    canvas.alpha_composite(figure, (x, y))
    return canvas


def validate(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    if image.size != (CANVAS_SIZE, CANVAS_SIZE):
        raise ValueError(f"{path.name}: invalid canvas {image.size}")
    alpha = image.getchannel("A")
    bounds = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
    if not bounds:
        raise ValueError(f"{path.name}: empty asset")
    if bounds[0] <= 0 or bounds[2] >= CANVAS_SIZE or bounds[1] <= 0:
        raise ValueError(f"{path.name}: foreground touches a canvas edge: {bounds}")
    if not 246 <= bounds[3] <= 250:
        raise ValueError(f"{path.name}: baseline is not bottom-centred: {bounds}")
    if any(alpha.getpixel(point) > 8 for point in ((0, 0), (255, 0), (0, 255), (255, 255))):
        raise ValueError(f"{path.name}: opaque canvas corner")


def write_montage(paths: list[Path], destination: Path) -> None:
    tile = 280
    montage = Image.new("RGB", (tile * 6, tile * 2), (190, 190, 190))
    draw = ImageDraw.Draw(montage)
    for index, path in enumerate(paths):
        image = Image.open(path).convert("RGBA")
        board = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        checker = Image.new("RGB", (256, 256), (224, 224, 224))
        checker_draw = ImageDraw.Draw(checker)
        for y in range(0, 256, 16):
            for x in range(0, 256, 16):
                if (x // 16 + y // 16) % 2:
                    checker_draw.rectangle((x, y, x + 15, y + 15), fill=(168, 168, 168))
        board.alpha_composite(image)
        col, row = index % 6, index // 6
        montage.paste(checker, (col * tile + 12, row * tile + 12))
        montage.paste(board.convert("RGB"), (col * tile + 12, row * tile + 12), image.getchannel("A"))
        draw.text((col * tile + 18, row * tile + 260), f"hero-{index + 1:02d}", fill=(20, 20, 20))
    destination.parent.mkdir(parents=True, exist_ok=True)
    montage.save(destination, "PNG")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--preview", type=Path)
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGB")
    if source.size != (1536, 1024):
        raise ValueError(f"unexpected source size: {source.size}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs = []
    for spec in HEROES:
        output = OUTPUT_DIR / f"hero-{spec.hero_id:02d}.webp"
        extract(source, spec).save(output, "WEBP", lossless=True, quality=100, method=6, exact=True)
        validate(output)
        outputs.append(output)
        print(f"{output.relative_to(ROOT)}  {spec.name}")

    if args.preview:
        write_montage(outputs, args.preview)
        print(args.preview)


if __name__ == "__main__":
    main()
