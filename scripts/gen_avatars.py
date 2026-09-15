#!/usr/bin/env python3
"""Generate 10 LPC-style pixel-art avatar SVGs (64x64)."""
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "avatars")

# Color palettes for each agent: (hair, skin, shirt, pants)
PALETTES = [
    # brown hair, light skin, blue shirt, dark pants
    ("#5a3a1a", "#f0c090", "#3a6ea5", "#2a2a3a"),
    # blonde hair, fair skin, green shirt, brown pants
    ("#d4a943", "#fce0c0", "#4a9c4a", "#5a3a1a"),
    # black hair, tan skin, red shirt, black pants
    ("#1a1a2a", "#d8a060", "#c0392b", "#1a1a1a"),
    # red hair, light skin, purple shirt, gray pants
    ("#c75020", "#f0c090", "#8e44ad", "#4a4a5a"),
    # white hair, pale skin, teal shirt, navy pants
    ("#e0e0e0", "#e8c8a0", "#16a085", "#1a2a4a"),
    # pink hair, light skin, orange shirt, dark pants
    ("#e84393", "#f0c090", "#e67e22", "#2a2a3a"),
    # gray hair, medium skin, yellow shirt, blue pants
    ("#888888", "#d8a060", "#f1c40f", "#2a4a6a"),
    # blue hair, fair skin, white shirt, gray pants
    ("#2980b9", "#fce0c0", "#ecf0f1", "#555555"),
    # green hair, tan skin, pink shirt, dark pants
    ("#27ae60", "#d8a060", "#e84393", "#2a2a3a"),
    # auburn hair, light skin, cyan shirt, brown pants
    ("#a0522d", "#f0c090", "#00bdc1", "#5a3a1a"),
]

def pixel_svg(name, hair, skin, shirt, pants):
    """Generate a 64x64 pixel-art character SVG (front-facing, LPC-style)."""
    # Build pixel grid (16x16 grid, each pixel = 4x4)
    # 0 = transparent, 1 = outline, 2 = hair, 3 = skin, 4 = shirt, 5 = pants, 6 = shoes, 7 = eyes, 8 = mouth
    G = 4  # pixel size
    S = 16  # grid size

    # Define the sprite as a 16x16 grid
    # Row by row, top to bottom
    grid = [
        "................",
        ".....22222......",
        "....2222222.....",
        "...222222222....",
        "..2222222222....",
        "..2233333322....",
        "..2333737332....",  # eyes
        "..2333333322....",
        "..2333888332....",  # mouth
        "...23333332.....",
        "....333333......",
        "...44444444......",
        "..4444444444....",
        "..4444444444....",
        "..5555555555.....",
        "..6666666666.....",
    ]

    color_map = {
        "2": hair,
        "3": skin,
        "4": shirt,
        "5": pants,
        "6": "#3a2a1a",  # shoes
        "7": "#1a1a2a",  # eyes
        "8": "#c04040",  # mouth
        "1": "#1a1a1a",  # outline
    }

    rects = []
    for row_idx, row in enumerate(grid):
        for col_idx, ch in enumerate(row):
            if ch == ".":
                continue
            color = color_map.get(ch, "#000")
            x = col_idx * G
            y = row_idx * G
            rects.append(f'<rect x="{x}" y="{y}" width="{G}" height="{G}" fill="{color}"/>')

    body = "\n    ".join(rects)

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" shape-rendering="crispEdges">
    {body}
</svg>'''
    return svg

os.makedirs(OUTPUT_DIR, exist_ok=True)

for i, (hair, skin, shirt, pants) in enumerate(PALETTES):
    name = f"agent_{i:02d}.svg"
    svg = pixel_svg(name, hair, skin, shirt, pants)
    path = os.path.join(OUTPUT_DIR, name)
    with open(path, "w") as f:
        f.write(svg)
    print(f"Generated {name}")

print("Done!")
