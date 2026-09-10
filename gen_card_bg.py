#!/usr/bin/env python3
# Generates web/contact-card-bg.svg — black background with a dome/fan of gradient
# arrow-beads (teal->green->yellow->pink), like the reference image.
import math, random

W, H = 360, 452
CX, CY = 180, 26          # pivot near top-center
RMIN, RMAX = 2.2, 9.5
SPACING = 24.0            # arc spacing between beads
HALF_SPAN = math.radians(84)
DMAX = 500.0
random.seed(7)

# gradient bands (top of dome -> outer/bottom): teal -> green -> yellow -> salmon -> pink
BANDS = [
    ("#93e6d6", "#7ecfe0"),  # 0 teal/cyan
    ("#96e6c4", "#bfe79a"),  # 1 teal->green
    ("#c2e79a", "#e6df8c"),  # 2 green->yellow
    ("#e6df8c", "#ecc885"),  # 3 yellow->gold
    ("#ebc281", "#e8a29a"),  # 4 gold->salmon
    ("#e8a29a", "#e79ab2"),  # 5 salmon->pink
]

def band_for(v):
    i = int(v * len(BANDS))
    return max(0, min(len(BANDS) - 1, i))

defs = []
for i, (top, bot) in enumerate(BANDS):
    defs.append(
        f'<linearGradient id="g{i}" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{top}"/>'
        f'<stop offset="1" stop-color="{bot}"/></linearGradient>'
    )

beads = []
d = 34.0
while d < DMAX:
    v = min(1.0, d / DMAX)
    r = RMIN + (RMAX - RMIN) * (math.sin(math.pi * min(v, 0.98)) ** 0.62)
    dtheta = SPACING / d
    n = int((2 * HALF_SPAN) / dtheta)
    for k in range(n + 1):
        theta = -HALF_SPAN + k * dtheta
        # tiny organic jitter
        jt = (random.random() - 0.5) * dtheta * 0.28
        jr = (random.random() - 0.5) * SPACING * 0.16
        th = theta + jt
        dd = d + jr
        x = CX + dd * math.sin(th)
        y = CY + dd * math.cos(th)
        if x < -8 or x > W + 8 or y < -8 or y > H + 8:
            continue
        # edge dropout: sparser near angular edges and near the far fringe
        edge = abs(th) / HALF_SPAN
        p_keep = 1.0 - 0.55 * (edge ** 2.4) - 0.35 * max(0.0, (v - 0.82) / 0.18)
        rr = r
        if random.random() > p_keep:
            # sometimes leave a tiny faint dot instead of full bead
            if random.random() < 0.5:
                continue
            rr = max(1.4, r * 0.32)
        b = band_for(v)
        rot = math.degrees(th)
        beads.append((x, y, rr, b, rot))
    d += SPACING

# draw beads (sorted so larger ones are drawn first -> smaller on top reads cleaner)
body = []
for (x, y, r, b, rot) in beads:
    body.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="url(#g{b})"/>')
    if r >= 3.4:
        # arrow group rotated around bead center
        ah = r * 0.62          # half-length
        hw = r * 0.34          # head half-width
        hy = -ah + r * 0.42    # head base y
        sw = max(0.9, r * 0.24)
        path = (f'M0,{ah:.1f} L0,{-ah:.1f} '
                f'M0,{-ah:.1f} L{-hw:.1f},{hy:.1f} '
                f'M0,{-ah:.1f} L{hw:.1f},{hy:.1f}')
        body.append(
            f'<g transform="translate({x:.1f},{y:.1f}) rotate({rot:.1f})">'
            f'<path d="{path}" stroke="#0c1512" stroke-width="{sw:.2f}" '
            f'stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.82"/></g>'
        )

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
    f'width="{W}" height="{H}" preserveAspectRatio="xMidYMax slice">'
    f'<defs>{"".join(defs)}</defs>'
    f'<rect width="{W}" height="{H}" fill="#000000"/>'
    f'{"".join(body)}</svg>'
)

with open("web/contact-card-bg.svg", "w", encoding="utf-8") as f:
    f.write(svg)
print("beads:", len(beads), "bytes:", len(svg))
