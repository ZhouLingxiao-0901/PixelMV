#!/usr/bin/env python3
"""Build the static character preview for the PixelMV.

This script is intentionally separate from build_assets.py.  It does not
touch the existing 48x64 sample atlas, the scenes, or the runtime.  It draws
two new 96x160 characters at 1x, then composes a presentation sheet with
nearest-neighbour upscaling only.

Run:
    python tools/build_character_preview.py
"""

from __future__ import annotations

import os
from PIL import Image, ImageColor, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "characters", "preview")
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------------------
# Palette: same 16-bit family as js/engine/palette.js, with a few extra
# in-family mixtures for the larger character tier.
# ---------------------------------------------------------------------------

INK = "#16131d"
INK_SOFT = "#211c2a"

SKIN = "#f4cba6"
SKIN_SH = "#dda57e"
SKIN_DEEP = "#b97b5c"
SKIN_LINE = "#8d5a43"

HAIR_M_D = "#1d1a23"
HAIR_M_M = "#2b2632"
HAIR_M_H = "#443b49"
HAIR_M_HI = "#5a4c58"

HAIR_F_D = "#211a1f"
HAIR_F_M = "#33272b"
HAIR_F_H = "#4d3a39"
HAIR_F_HI = "#68504a"

NAVY = "#2f3f60"
NAVY_D = "#1f2a44"
NAVY_DD = "#161e33"
NAVY_L = "#4a5f86"
NAVY_LL = "#607699"

CREAM = "#f2eee2"
CREAM_SH = "#cfc8b7"
CREAM_D = "#9d978a"
WHITE = "#f7f3e9"
SOLE = "#5f5d65"
SOLE_D = "#3d3b44"

BLUSH = "#d97a6c"
BLUSH_SOFT = "#e08a7f"
GOLD = "#d9a441"
GOLD_D = "#a9792c"
RED = "#b4473e"
RED_HI = "#c9564f"

BOOK = "#51453c"
BOOK_HI = "#736253"
PAPER = "#e8d8c8"
PAPER_SH = "#d6c3b0"

# Local outline colours.  They keep the outer line dark but never pure black.
OUTLINE = {
    SKIN: "#8d5a43",
    SKIN_SH: "#764633",
    SKIN_DEEP: "#5e3728",
    HAIR_M_D: "#0e0c12",
    HAIR_M_M: "#0e0c12",
    HAIR_M_H: "#0e0c12",
    HAIR_M_HI: "#0e0c12",
    HAIR_F_D: "#100c11",
    HAIR_F_M: "#100c11",
    HAIR_F_H: "#100c11",
    HAIR_F_HI: "#100c11",
    NAVY: "#131a2b",
    NAVY_D: "#0e1320",
    NAVY_DD: "#0b0f18",
    NAVY_L: "#131a2b",
    NAVY_LL: "#182138",
    CREAM: "#8f887b",
    CREAM_SH: "#7e786c",
    CREAM_D: "#6d685e",
    WHITE: "#8f887b",
    SOLE: "#2a292f",
    SOLE_D: "#1c1b20",
    BLUSH: "#8d4c43",
    BLUSH_SOFT: "#8d4c43",
    GOLD: "#6d4f1d",
    GOLD_D: "#5a4017",
    RED: "#5a211e",
    RED_HI: "#5a211e",
    BOOK: "#2d231d",
    BOOK_HI: "#2d231d",
}

CELL_W, CELL_H = 96, 160
FEET = 156


# ---------------------------------------------------------------------------
# Small drawing helpers
# ---------------------------------------------------------------------------

def canvas(w=CELL_W, h=CELL_H):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def poly(d, pts, fill):
    d.polygon([(int(x), int(y)) for x, y in pts], fill=fill)


def box(d, x0, y0, x1, y1, fill):
    """Inclusive pixel rectangle."""
    d.rectangle((int(x0), int(y0), int(x1), int(y1)), fill=fill)


def put(d, x, y, fill):
    d.point((int(x), int(y)), fill=fill)


def dither_poly(img, pts, color, phase=0, step=4):
    """One-colour checker inside a polygon.  Used only at shade boundaries."""
    mask = Image.new("L", img.size, 0)
    md = ImageDraw.Draw(mask)
    md.polygon([(int(x), int(y)) for x, y in pts], fill=255)
    x0 = max(0, min(p[0] for p in pts))
    y0 = max(0, min(p[1] for p in pts))
    x1 = min(img.width - 1, max(p[0] for p in pts))
    y1 = min(img.height - 1, max(p[1] for p in pts))
    pix = img.load()
    mp = mask.load()
    for y in range(int(y0), int(y1) + 1):
        for x in range(int(x0), int(x1) + 1):
            if mp[x, y] and (x + y + phase) % step == 0:
                pix[x, y] = ImageColor.getrgb(color) + (255,)


def outline_sprite(img):
    """Wrap the filled silhouette in a 1 px locally-coloured outline."""
    w, h = img.size
    src = img.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dst = out.load()

    cardinals = ((-1, 0), (1, 0), (0, -1), (0, 1))
    diagonals = ((-1, -1), (1, -1), (-1, 1), (1, 1))

    for y in range(h):
        for x in range(w):
            if src[x, y][3] != 0:
                continue
            neigh = []
            for dx, dy in cardinals:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] != 0:
                    neigh.append(src[nx, ny][:3])
            if not neigh:
                for dx, dy in diagonals:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] != 0:
                        neigh.append(src[nx, ny][:3])
            if neigh:
                # Most common neighbour colour, then map to its dark tone.
                counts = {}
                for c in neigh:
                    counts[c] = counts.get(c, 0) + 1
                c = max(counts, key=counts.get)
                hexc = "#%02x%02x%02x" % c
                oc = OUTLINE.get(hexc, INK)
                dst[x, y] = ImageColor.getrgb(oc) + (255,)

    out.alpha_composite(img)
    return out


def limb(d, pts, width, fill):
    d.line([(int(x), int(y)) for x, y in pts], fill=fill, width=width, joint="curve")


def seam(d, pts, color=NAVY_DD):
    d.line([(int(x), int(y)) for x, y in pts], fill=color, width=1)


# ---------------------------------------------------------------------------
# Heads
# ---------------------------------------------------------------------------

def draw_head_base(img, female, cx, top):
    """Skin, ears and hair mass.  Face details are a later pass so they are
    not eaten by the outline."""
    d = ImageDraw.Draw(img)

    # Neck.  A teenager's neck is visible but not giraffe-long.
    box(d, cx - 4, top + 19, cx + 4, top + 31 if not female else top + 29, SKIN)
    box(d, cx + 1, top + 20, cx + 3, top + 29, SKIN_SH)
    box(d, cx - 4, top + 19, cx + 4, top + 20, SKIN_SH)

    # Face: a soft oval with a small, squared jaw.
    if female:
        face = [
            (cx - 9, top + 6), (cx + 9, top + 6), (cx + 10, top + 9),
            (cx + 10, top + 14), (cx + 9, top + 18), (cx + 6, top + 21),
            (cx + 3, top + 22), (cx - 3, top + 22), (cx - 6, top + 21),
            (cx - 9, top + 18), (cx - 10, top + 14), (cx - 10, top + 9),
        ]
    else:
        face = [
            (cx - 10, top + 6), (cx + 10, top + 6), (cx + 11, top + 9),
            (cx + 11, top + 14), (cx + 10, top + 18), (cx + 7, top + 21),
            (cx + 4, top + 23), (cx - 4, top + 23), (cx - 7, top + 21),
            (cx - 10, top + 18), (cx - 11, top + 14), (cx - 11, top + 9),
        ]
    poly(d, face, SKIN)

    # Minimal face shading: a far-cheek line and a small shadow under the
    # lower lip.  A broad plane across the chin reads as stubble at this size.
    if female:
        box(d, cx + 9, top + 10, cx + 9, top + 16, SKIN_SH)
        box(d, cx - 3, top + 21, cx - 1, top + 21, SKIN_SH)
        put(d, cx + 4, top + 21, SKIN_SH)
        put(d, cx + 8, top + 18, SKIN_SH)
    else:
        box(d, cx + 10, top + 10, cx + 10, top + 17, SKIN_SH)
        box(d, cx - 3, top + 22, cx, top + 22, SKIN_SH)
        put(d, cx + 4, top + 22, SKIN_SH)
        put(d, cx + 9, top + 18, SKIN_SH)

    # Hair.  A short side-part for him, a softer shoulder-length mass with
    # tapered locks for her.  Both hairlines clear the brows by 2 px.
    if female:
        hair = [
            (cx - 8, top), (cx + 7, top), (cx + 10, top + 1),
            (cx + 11, top + 4), (cx + 12, top + 8), (cx + 12, top + 14),
            (cx + 12, top + 22), (cx + 11, top + 30), (cx + 11, top + 38),
            (cx + 10, top + 44), (cx + 9, top + 50), (cx + 8, top + 54),
            (cx + 7, top + 48), (cx + 7, top + 38), (cx + 7, top + 28),
            (cx + 8, top + 18), (cx + 8, top + 8), (cx + 6, top + 8),
            (cx + 4, top + 8), (cx + 2, top + 9), (cx, top + 9),
            (cx - 2, top + 9), (cx - 4, top + 10), (cx - 6, top + 10),
            (cx - 8, top + 10), (cx - 8, top + 18), (cx - 8, top + 28),
            (cx - 8, top + 38), (cx - 9, top + 48), (cx - 10, top + 54),
            (cx - 11, top + 50), (cx - 12, top + 44), (cx - 12, top + 38),
            (cx - 12, top + 30), (cx - 13, top + 22), (cx - 13, top + 14),
            (cx - 12, top + 8), (cx - 12, top + 4), (cx - 11, top + 1),
        ]
        poly(d, hair, HAIR_F_M)
        # Dark inner plane on the viewer-right side.
        poly(d, [(cx + 2, top + 1), (cx + 7, top), (cx + 10, top + 1),
                 (cx + 11, top + 4), (cx + 12, top + 8), (cx + 12, top + 14),
                 (cx + 12, top + 22), (cx + 11, top + 30), (cx + 11, top + 38),
                 (cx + 10, top + 44), (cx + 9, top + 50), (cx + 8, top + 54),
                 (cx + 7, top + 48), (cx + 7, top + 38), (cx + 7, top + 28),
                 (cx + 8, top + 18), (cx + 8, top + 8), (cx + 6, top + 8),
                 (cx + 4, top + 8), (cx + 2, top + 9)], HAIR_F_D)
        d.line([(cx - 8, top + 10), (cx - 4, top + 10), (cx, top + 9),
                (cx + 4, top + 8), (cx + 8, top + 8)],
               fill=HAIR_F_D, width=1)
        # A soft side part; the fringe sweeps across to the viewer right.
        d.line([(cx - 2, top + 1), (cx - 3, top + 4), (cx - 4, top + 7)],
               fill=HAIR_F_D, width=1)
        # Separation marks keep the long locks from reading as one slab.
        d.line([(cx - 11, top + 24), (cx - 11, top + 40)],
               fill=HAIR_F_D, width=1)
        d.line([(cx + 10, top + 22), (cx + 10, top + 38)],
               fill=HAIR_F_D, width=1)
    else:
        hair = [
            (cx - 8, top), (cx + 7, top), (cx + 10, top + 1),
            (cx + 12, top + 3), (cx + 12, top + 6), (cx + 12, top + 9),
            (cx + 11, top + 12), (cx + 10, top + 14), (cx + 9, top + 13),
            (cx + 9, top + 10), (cx + 8, top + 8), (cx + 6, top + 7),
            (cx + 4, top + 8), (cx + 2, top + 7), (cx, top + 8),
            (cx - 2, top + 7), (cx - 4, top + 8), (cx - 6, top + 8),
            (cx - 8, top + 9), (cx - 9, top + 11), (cx - 10, top + 13),
            (cx - 11, top + 14), (cx - 12, top + 12), (cx - 12, top + 9),
            (cx - 12, top + 5), (cx - 11, top + 2),
        ]
        poly(d, hair, HAIR_M_M)
        poly(d, [(cx + 2, top + 1), (cx + 7, top), (cx + 10, top + 1),
                 (cx + 12, top + 3), (cx + 12, top + 6), (cx + 12, top + 9),
                 (cx + 11, top + 12), (cx + 10, top + 14), (cx + 9, top + 13),
                 (cx + 9, top + 10), (cx + 8, top + 8), (cx + 6, top + 7),
                 (cx + 4, top + 8), (cx + 2, top + 7)], HAIR_M_D)
        d.line([(cx - 8, top + 9), (cx - 4, top + 8), (cx, top + 8),
                (cx + 4, top + 8), (cx + 8, top + 8)],
               fill=HAIR_M_D, width=1)
        # Side part and a short fringe sweep.
        d.line([(cx - 3, top + 1), (cx - 4, top + 4), (cx - 5, top + 7)],
               fill=HAIR_M_D, width=1)
        d.line([(cx + 1, top + 2), (cx + 5, top + 4), (cx + 8, top + 7)],
               fill=HAIR_M_H, width=1)
        box(d, cx - 9, top + 10, cx - 9, top + 13, HAIR_M_D)
        box(d, cx + 8, top + 9, cx + 8, top + 12, HAIR_M_D)

    # Ears sit in front of the side hair.  Three pixels wide leaves a
    # visible skin pixel inside the outline.
    if female:
        box(d, cx - 12, top + 12, cx - 10, top + 15, SKIN)
        box(d, cx + 10, top + 12, cx + 12, top + 15, SKIN)
        put(d, cx - 11, top + 14, SKIN_SH)
        put(d, cx + 11, top + 14, SKIN_SH)
    else:
        box(d, cx - 13, top + 12, cx - 11, top + 15, SKIN)
        box(d, cx + 11, top + 12, cx + 13, top + 15, SKIN)
        put(d, cx - 12, top + 14, SKIN_SH)
        put(d, cx + 12, top + 14, SKIN_SH)


def draw_face(img, female, cx, top, expression):
    """Small, readable features.  expression: calm | shy | smile | down."""
    d = ImageDraw.Draw(img)
    eye = INK_SOFT
    brow = HAIR_F_H if female else HAIR_M_H
    y_eye = top + 14
    y_brow = top + 11

    # Eyebrows: four pixels, one pixel thick.  Their angle carries most of
    # the expression so the eyes can stay small and quiet.
    if expression == "shy":
        left_brow = [(cx - 8, y_brow), (cx - 5, y_brow - 1)]
        right_brow = [(cx + 4, y_brow - 1), (cx + 7, y_brow)]
    elif expression == "down":
        left_brow = [(cx - 8, y_brow - 1), (cx - 5, y_brow)]
        right_brow = [(cx + 4, y_brow), (cx + 7, y_brow - 1)]
    else:
        left_brow = [(cx - 8, y_brow), (cx - 5, y_brow)]
        right_brow = [(cx + 4, y_brow), (cx + 7, y_brow)]
    d.line(left_brow, fill=brow, width=1)
    d.line(right_brow, fill=brow, width=1)

    # Eyelid crease.
    d.line([(cx - 8, y_eye - 1), (cx - 4, y_eye - 1)], fill=SKIN_SH, width=1)
    d.line([(cx + 3, y_eye - 1), (cx + 7, y_eye - 1)], fill=SKIN_SH, width=1)

    if expression == "smile":
        # Closed, warm eyes: a shallow arc with the corners lifted.
        box(d, cx - 7, y_eye + 1, cx - 5, y_eye + 1, eye)
        box(d, cx + 4, y_eye + 1, cx + 6, y_eye + 1, eye)
        put(d, cx - 8, y_eye, eye)
        put(d, cx - 4, y_eye, eye)
        put(d, cx + 3, y_eye, eye)
        put(d, cx + 7, y_eye, eye)
        box(d, cx - 7, y_eye + 2, cx - 5, y_eye + 2, SKIN_SH)
        box(d, cx + 4, y_eye + 2, cx + 6, y_eye + 2, SKIN_SH)
    else:
        # Open 4 x 2 eyes with a single catchlight.
        for ex in (cx - 7, cx + 3):
            if expression == "down":
                box(d, ex, y_eye, ex + 3, y_eye, SKIN_SH)
                box(d, ex + 1, y_eye + 1, ex + 3, y_eye + 1, eye)
            else:
                box(d, ex, y_eye, ex + 3, y_eye + 1, eye)
                put(d, ex + 1, y_eye, CREAM)
            box(d, ex, y_eye + 2, ex + 3, y_eye + 2, SKIN_SH)
        if expression == "shy":
            # A one-pixel glance toward the other person.
            box(d, cx - 7, y_eye, cx - 6, y_eye, SKIN_SH)
            box(d, cx + 6, y_eye, cx + 6, y_eye, SKIN_SH)

    # Nose: two soft pixels, no hard dark bridge.
    put(d, cx, top + 17, SKIN_SH)
    put(d, cx - 1, top + 18, SKIN_SH)

    # Mouth.
    my = top + 20
    if expression == "smile":
        d.line([(cx - 2, my), (cx + 2, my)], fill=SKIN_DEEP, width=1)
        put(d, cx - 3, my - 1, SKIN_DEEP)
        put(d, cx + 3, my - 1, SKIN_DEEP)
        put(d, cx, my + 1, BLUSH_SOFT)
    elif expression == "shy":
        d.line([(cx - 1, my), (cx + 1, my)], fill=SKIN_DEEP, width=1)
        put(d, cx + 2, my - 1, SKIN_SH)
    elif expression == "down":
        d.line([(cx - 1, my + 1), (cx + 1, my + 1)], fill=SKIN_DEEP, width=1)
        put(d, cx - 2, my, SKIN_SH)
        put(d, cx + 2, my, SKIN_SH)
    else:
        d.line([(cx - 1, my), (cx + 1, my)], fill=SKIN_DEEP, width=1)

    # Blush, sparse so it does not become a sticker.
    if expression in ("shy", "smile"):
        for bx in (cx - 8, cx + 7):
            put(d, bx, top + 17, BLUSH)
            put(d, bx + 1, top + 17, BLUSH_SOFT)
            if expression == "shy":
                put(d, bx, top + 18, BLUSH)

    # Ear interior.
    if female:
        put(d, cx - 11, top + 14, SKIN_SH)
        put(d, cx + 11, top + 14, SKIN_SH)
    else:
        put(d, cx - 12, top + 14, SKIN_SH)
        put(d, cx + 12, top + 14, SKIN_SH)


def draw_hair_details(img, female, cx, top):
    d = ImageDraw.Draw(img)
    if female:
        # Soft highlight along the crown and the viewer-left lock.
        d.line([(cx - 7, top + 2), (cx - 1, top + 1), (cx + 5, top + 2)],
               fill=HAIR_F_H, width=1)
        d.line([(cx - 11, top + 7), (cx - 12, top + 15), (cx - 11, top + 24),
                (cx - 10, top + 34), (cx - 9, top + 44)],
               fill=HAIR_F_H, width=1)
        d.line([(cx + 9, top + 9), (cx + 9, top + 20), (cx + 8, top + 30)],
               fill=HAIR_F_H, width=1)
        put(d, cx + 6, top + 2, HAIR_F_HI)
        put(d, cx - 5, top + 1, HAIR_F_HI)
        # A few separated locks rather than a solid dark curtain.
        put(d, cx - 10, top + 27, HAIR_F_H)
        put(d, cx - 10, top + 31, HAIR_F_H)
        put(d, cx + 10, top + 24, HAIR_F_H)
        put(d, cx + 10, top + 28, HAIR_F_H)
    else:
        d.line([(cx - 7, top + 2), (cx - 2, top + 1), (cx + 3, top + 2)],
               fill=HAIR_M_H, width=1)
        d.line([(cx - 11, top + 5), (cx - 11, top + 11)],
               fill=HAIR_M_H, width=1)
        d.line([(cx + 2, top + 3), (cx + 5, top + 5), (cx + 7, top + 7)],
               fill=HAIR_M_H, width=1)
        put(d, cx - 6, top + 1, HAIR_M_HI)
        put(d, cx + 4, top + 2, HAIR_M_HI)
        put(d, cx - 2, top + 9, HAIR_M_D)
        put(d, cx + 3, top + 9, HAIR_M_D)


# ---------------------------------------------------------------------------
# Standing figures
# ---------------------------------------------------------------------------

def draw_male_base():
    img = canvas()
    d = ImageDraw.Draw(img)
    cx = 48
    top = 6

    # Neck and head are behind the collar.
    draw_head_base(img, False, cx, top)

    # Pants: waist at the hip, then a natural straight leg.  The two legs
    # are separated by a visible gap rather than merging into a column.
    poly(d, [(35, 78), (61, 78), (60, 86), (50, 86),
             (48, 89), (46, 86), (36, 86)], NAVY_D)
    poly(d, [(36, 84), (46, 84), (44, 147), (37, 147)], NAVY_D)
    poly(d, [(50, 84), (60, 84), (59, 147), (52, 147)], NAVY_D)
    # Lit front plane on the left leg, sparse dithered transition.
    poly(d, [(37, 85), (43, 85), (41, 146), (38, 146)], NAVY)
    dither_poly(img, [(41, 85), (45, 85), (43, 146), (41, 146)],
                NAVY, phase=0, step=6)
    # Shade the right leg's inner plane.
    dither_poly(img, [(50, 85), (54, 85), (53, 146), (52, 146)],
                NAVY_DD, phase=1, step=6)
    seam(d, [(45, 86), (44, 112), (44, 146)], NAVY_DD)
    seam(d, [(51, 86), (52, 112), (52, 146)], NAVY_DD)
    box(d, 48, 86, 49, 91, NAVY_DD)

    # Shoes: rounded cream sneakers, a 2 px gap, and a two-tone sole.
    poly(d, [(32, 146), (45, 146), (46, 148), (47, 151),
             (46, 153), (44, 154), (34, 154), (31, 152), (30, 149)], CREAM)
    poly(d, [(51, 146), (64, 146), (65, 149), (66, 152),
             (63, 154), (53, 154), (51, 153), (50, 151)], CREAM)
    box(d, 32, 153, 47, 154, SOLE)
    box(d, 50, 153, 65, 154, SOLE)
    box(d, 33, 155, 46, 155, SOLE_D)
    box(d, 51, 155, 64, 155, SOLE_D)
    box(d, 33, 146, 44, 147, WHITE)
    box(d, 52, 146, 63, 147, WHITE)
    box(d, 31, 149, 32, 152, CREAM_SH)
    box(d, 50, 149, 51, 152, CREAM_SH)
    box(d, 45, 148, 46, 152, CREAM_SH)
    box(d, 64, 148, 65, 152, CREAM_SH)

    # Torso: loose school tracksuit.  A solid shade plane plus a narrow
    # dithered edge reads as cloth, not as an all-over pattern.
    torso = [
        (42, 35), (54, 35), (59, 37), (67, 39), (66, 81),
        (64, 85), (32, 85), (30, 81), (29, 39), (37, 37),
    ]
    poly(d, torso, NAVY)
    poly(d, [(58, 38), (67, 39), (66, 81), (64, 85), (58, 85),
             (60, 72), (59, 55), (58, 44)], NAVY_D)
    dither_poly(img, [(56, 39), (58, 38), (58, 44), (59, 55),
                      (60, 72), (58, 85), (56, 85), (57, 70), (56, 53)],
                NAVY_D, phase=0, step=6)
    dither_poly(img, [(30, 40), (37, 37), (42, 37), (42, 45),
                      (35, 50), (31, 58)], NAVY_L, phase=1, step=8)
    box(d, 33, 83, 63, 83, NAVY_D)
    box(d, 34, 84, 62, 84, NAVY_DD)
    seam(d, [(31, 45), (30, 66), (31, 82)], NAVY_D)
    seam(d, [(65, 45), (66, 66), (65, 82)], NAVY_D)

    # Arms.  Left hand is in the pocket, right hand hangs.
    limb(d, [(31, 39), (27, 61), (32, 79)], 7, NAVY)
    limb(d, [(65, 39), (68, 62), (67, 84)], 7, NAVY)
    dither_poly(img, [(25, 44), (29, 42), (27, 62), (31, 78), (34, 80),
                      (32, 83), (28, 79), (23, 62)], NAVY_L, phase=0, step=6)
    dither_poly(img, [(68, 44), (71, 43), (72, 63), (71, 82), (68, 85),
                      (66, 83), (69, 63)], NAVY_D, phase=1, step=6)
    seam(d, [(35, 38), (33, 52), (34, 68), (36, 79)], NAVY_DD)
    seam(d, [(61, 38), (63, 52), (63, 68), (62, 82)], NAVY_DD)

    # Hands: four fingers are enough; no mitten blocks.
    box(d, 31, 79, 35, 82, SKIN)
    box(d, 32, 80, 34, 82, SKIN_SH)
    box(d, 65, 82, 69, 87, SKIN)
    box(d, 66, 83, 68, 86, SKIN_SH)
    put(d, 69, 83, SKIN)
    put(d, 66, 85, SKIN_DEEP)
    put(d, 68, 85, SKIN_DEEP)

    # Pocket opening sits over the hand.
    box(d, 30, 77, 37, 78, NAVY_DD)
    d.line([(31, 78), (36, 78)], fill=NAVY_LL, width=1)

    return img


def draw_male_details(img):
    d = ImageDraw.Draw(img)
    cx, top = 48, 6

    # Face.
    draw_face(img, False, cx, top, "calm")
    draw_hair_details(img, False, cx, top)

    # Collar: a low cream stand collar with a small center notch.
    poly(d, [(42, 34), (54, 34), (55, 36), (53, 37),
             (48, 35), (43, 37), (41, 36)], CREAM)
    box(d, 42, 36, 54, 36, CREAM_SH)
    box(d, 47, 35, 49, 37, NAVY_DD)
    put(d, 48, 37, NAVY_DD)

    # Zip line.
    d.line([(48, 37), (48, 81)], fill=CREAM_SH, width=1)
    d.line([(49, 38), (49, 80)], fill=NAVY_D, width=1)
    box(d, 47, 37, 49, 40, CREAM)
    put(d, 48, 39, GOLD)

    # Sleeve tape: one cream line with a muted inner edge.
    d.line([(29, 42), (25, 62), (30, 78)], fill=CREAM, width=1)
    d.line([(30, 42), (26, 62), (31, 78)], fill=CREAM_SH, width=1)
    d.line([(67, 42), (70, 63), (69, 82)], fill=CREAM, width=1)
    d.line([(68, 42), (71, 63), (70, 83)], fill=CREAM_SH, width=1)

    # Cuffs.
    box(d, 29, 76, 34, 78, CREAM_SH)
    box(d, 66, 81, 70, 83, CREAM_SH)

    # Chest badge: a school-crest scale accent, not a readable logo.
    box(d, 57, 46, 61, 51, GOLD_D)
    box(d, 58, 47, 60, 50, GOLD)
    put(d, 59, 48, RED)
    put(d, 59, 49, CREAM)

    # Trouser stripes, inset one pixel from the outer edge.
    d.line([(38, 86), (38, 144)], fill=CREAM_SH, width=1)
    d.line([(57, 86), (56, 144)], fill=CREAM_SH, width=1)
    put(d, 38, 108, CREAM)
    put(d, 57, 108, CREAM)
    put(d, 38, 132, CREAM)
    put(d, 56, 132, CREAM)

    # Laces: a light panel with two horizontal bars, plus the ankle opening.
    box(d, 35, 148, 41, 151, CREAM_SH)
    d.line([(36, 149), (40, 149)], fill=CREAM_D, width=1)
    d.line([(36, 151), (40, 151)], fill=CREAM_D, width=1)
    box(d, 53, 148, 59, 151, CREAM_SH)
    d.line([(54, 149), (58, 149)], fill=CREAM_D, width=1)
    d.line([(54, 151), (58, 151)], fill=CREAM_D, width=1)
    box(d, 37, 146, 43, 146, SOLE_D)
    box(d, 52, 146, 58, 146, SOLE_D)
    put(d, 31, 150, SOLE_D)
    put(d, 50, 151, SOLE_D)


def draw_female_base():
    img = canvas()
    d = ImageDraw.Draw(img)
    cx = 48
    top = 17

    # Back hair: a soft mass behind the shoulders.  The visible locks are
    # drawn with the head, in front of the jacket.
    back = [
        (39, 17), (57, 17), (61, 21), (62, 30), (60, 44),
        (61, 55), (58, 63), (56, 61), (55, 48), (41, 48),
        (40, 61), (38, 63), (35, 55), (36, 44), (34, 30),
        (35, 21),
    ]
    poly(d, back, HAIR_F_M)
    dither_poly(img, [(50, 18), (57, 17), (61, 21), (62, 30), (60, 44),
                      (61, 55), (58, 63), (56, 61), (55, 48)],
                HAIR_F_D, phase=0, step=6)

    # Pants.  The jacket ends at the hip; the legs are the longer half of
    # the silhouette instead of being hidden by a coat.
    poly(d, [(37, 84), (59, 84), (58, 94), (49, 94),
             (48, 96), (47, 94), (38, 94)], NAVY_D)
    poly(d, [(38, 92), (47, 92), (45, 147), (39, 147)], NAVY_D)
    poly(d, [(49, 92), (58, 92), (57, 147), (51, 147)], NAVY_D)
    poly(d, [(39, 93), (44, 93), (42, 146), (40, 146)], NAVY)
    dither_poly(img, [(44, 93), (47, 93), (45, 146), (42, 146)],
                NAVY, phase=1, step=6)
    dither_poly(img, [(49, 93), (52, 93), (52, 146), (51, 146)],
                NAVY_DD, phase=0, step=6)
    seam(d, [(46, 94), (45, 114), (45, 146)], NAVY_DD)
    seam(d, [(50, 94), (51, 114), (51, 146)], NAVY_DD)
    box(d, 48, 93, 49, 98, NAVY_DD)

    # Shoes, slightly smaller and closer together than his.
    poly(d, [(33, 146), (45, 146), (46, 148), (47, 151),
             (45, 153), (44, 154), (35, 154), (32, 152), (32, 149)], CREAM)
    poly(d, [(51, 146), (63, 146), (64, 149), (65, 152),
             (62, 154), (52, 154), (51, 153), (50, 151)], CREAM)
    box(d, 33, 153, 46, 154, SOLE)
    box(d, 50, 153, 64, 154, SOLE)
    box(d, 34, 155, 45, 155, SOLE_D)
    box(d, 51, 155, 63, 155, SOLE_D)
    box(d, 34, 146, 44, 147, WHITE)
    box(d, 52, 146, 62, 147, WHITE)
    box(d, 32, 149, 33, 152, CREAM_SH)
    box(d, 50, 149, 51, 152, CREAM_SH)
    box(d, 45, 148, 46, 152, CREAM_SH)
    box(d, 63, 148, 64, 152, CREAM_SH)

    # Torso: narrower shoulders, jacket ending at the hip.
    torso = [
        (43, 44), (53, 44), (58, 46), (63, 48), (62, 89),
        (60, 92), (36, 92), (34, 89), (33, 48), (38, 46),
    ]
    poly(d, torso, NAVY)
    poly(d, [(56, 45), (63, 48), (62, 89), (60, 92), (56, 92),
             (58, 77), (57, 60), (56, 52)], NAVY_D)
    dither_poly(img, [(54, 46), (56, 45), (56, 52), (57, 60),
                      (58, 77), (56, 92), (55, 92), (56, 76), (55, 58)],
                NAVY_D, phase=1, step=6)
    dither_poly(img, [(34, 49), (38, 46), (43, 45), (42, 52),
                      (36, 56), (34, 62)], NAVY_L, phase=0, step=8)
    box(d, 35, 90, 61, 90, NAVY_D)
    box(d, 36, 91, 60, 91, NAVY_DD)
    seam(d, [(34, 54), (33, 72), (34, 89)], NAVY_D)
    seam(d, [(63, 54), (64, 72), (63, 89)], NAVY_D)

    # Arms.  Left hangs; right is bent around a notebook.
    limb(d, [(35, 49), (31, 69), (34, 84)], 7, NAVY)
    limb(d, [(61, 49), (65, 69), (60, 82)], 7, NAVY)
    dither_poly(img, [(31, 53), (35, 51), (33, 71), (35, 82), (38, 84),
                      (36, 88), (31, 83), (28, 70)], NAVY_L, phase=1, step=6)
    dither_poly(img, [(64, 53), (67, 53), (69, 69), (67, 79), (63, 84),
                      (60, 82), (64, 70)], NAVY_D, phase=0, step=6)
    seam(d, [(38, 48), (35, 60), (36, 74), (37, 83)], NAVY_DD)
    seam(d, [(58, 48), (61, 60), (60, 74), (58, 81)], NAVY_DD)

    # Low ponytail, falling in front of the viewer-right shoulder.
    poly(d, [(57, 39), (62, 41), (66, 47), (67, 54), (66, 61),
             (64, 68), (61, 73), (59, 72), (60, 65), (61, 57),
             (59, 49), (56, 43)], HAIR_F_M)
    poly(d, [(62, 42), (66, 47), (67, 54), (66, 61), (64, 68),
             (61, 73), (59, 72), (60, 65), (61, 57), (60, 50)],
         HAIR_F_D)
    d.line([(58, 43), (59, 54), (60, 67)], fill=HAIR_F_H, width=1)
    put(d, 60, 48, HAIR_F_HI)
    put(d, 61, 61, HAIR_F_H)

    # Head is drawn after the shoulders so the side hair falls in front.
    draw_head_base(img, True, cx, top)

    # Hands.
    box(d, 31, 83, 35, 87, SKIN)
    box(d, 32, 84, 34, 86, SKIN_SH)
    box(d, 57, 80, 61, 84, SKIN)
    box(d, 58, 81, 60, 83, SKIN_SH)

    return img


def draw_female_details(img):
    d = ImageDraw.Draw(img)
    cx, top = 48, 17

    # Face and hair.
    draw_face(img, True, cx, top, "calm")
    draw_hair_details(img, True, cx, top)

    # Back hair detail: a couple of soft locks visible beside the neck.
    d.line([(38, 41), (37, 49), (38, 57)], fill=HAIR_F_H, width=1)
    d.line([(58, 42), (59, 50), (58, 59)], fill=HAIR_F_H, width=1)
    d.line([(63, 47), (65, 56), (64, 66)], fill=HAIR_F_H, width=1)

    # Collar: low stand collar with a small center notch.
    poly(d, [(42, 43), (54, 43), (55, 45), (53, 46),
             (48, 44), (43, 46), (41, 45)], CREAM)
    box(d, 42, 45, 54, 45, CREAM_SH)
    box(d, 47, 44, 49, 46, NAVY_DD)
    put(d, 48, 46, NAVY_DD)

    # Zip.
    d.line([(48, 46), (48, 89)], fill=CREAM_SH, width=1)
    d.line([(49, 47), (49, 88)], fill=NAVY_D, width=1)
    box(d, 47, 46, 49, 49, CREAM)
    put(d, 48, 48, GOLD)

    # Sleeve tape, kept inside the outline.
    d.line([(33, 52), (29, 70), (33, 83)], fill=CREAM, width=1)
    d.line([(34, 52), (30, 70), (34, 83)], fill=CREAM_SH, width=1)
    d.line([(64, 52), (67, 69), (62, 80)], fill=CREAM, width=1)
    d.line([(65, 52), (68, 69), (63, 81)], fill=CREAM_SH, width=1)
    box(d, 31, 81, 35, 83, CREAM_SH)
    box(d, 58, 79, 62, 81, CREAM_SH)

    # School badge.
    box(d, 57, 52, 61, 57, GOLD_D)
    box(d, 58, 53, 60, 56, GOLD)
    put(d, 59, 54, RED)
    put(d, 59, 55, CREAM)

    # Notebook held against the right hip, tilted a little.  The page
    # block on its right edge separates it from the jacket.
    poly(d, [(54, 81), (64, 83), (63, 93), (53, 91)], INK)
    poly(d, [(55, 82), (63, 84), (62, 92), (54, 90)], BOOK)
    d.line([(62, 84), (61, 92)], fill=PAPER, width=1)
    d.line([(61, 84), (60, 92)], fill=PAPER_SH, width=1)
    d.line([(56, 83), (55, 89)], fill=BOOK_HI, width=1)
    put(d, 56, 87, PAPER_SH)
    put(d, 58, 87, PAPER_SH)
    # Hand over the notebook.
    box(d, 56, 79, 61, 84, SKIN)
    box(d, 57, 80, 60, 83, SKIN_SH)
    put(d, 61, 82, SKIN_DEEP)
    put(d, 61, 84, SKIN_DEEP)
    put(d, 56, 84, SKIN_DEEP)

    # Trouser stripes, inset one pixel from the outer edge.
    d.line([(39, 94), (39, 144)], fill=CREAM_SH, width=1)
    d.line([(57, 94), (56, 144)], fill=CREAM_SH, width=1)
    put(d, 39, 116, CREAM)
    put(d, 57, 116, CREAM)
    put(d, 39, 136, CREAM)
    put(d, 56, 136, CREAM)

    # Laces: a light panel with two horizontal bars, plus the ankle opening.
    box(d, 35, 148, 41, 151, CREAM_SH)
    d.line([(36, 149), (40, 149)], fill=CREAM_D, width=1)
    d.line([(36, 151), (40, 151)], fill=CREAM_D, width=1)
    box(d, 53, 148, 59, 151, CREAM_SH)
    d.line([(54, 149), (58, 149)], fill=CREAM_D, width=1)
    d.line([(54, 151), (58, 151)], fill=CREAM_D, width=1)
    box(d, 37, 146, 43, 146, SOLE_D)
    box(d, 52, 146, 58, 146, SOLE_D)
    put(d, 32, 150, SOLE_D)
    put(d, 50, 151, SOLE_D)


def make_standing(female):
    img = draw_female_base() if female else draw_male_base()
    img = outline_sprite(img)
    if female:
        draw_female_details(img)
    else:
        draw_male_details(img)
    return img


# ---------------------------------------------------------------------------
# Expression busts
# ---------------------------------------------------------------------------

BUST_W, BUST_H = 52, 60


def draw_bust(female, expression):
    img = canvas(BUST_W, BUST_H)
    d = ImageDraw.Draw(img)
    cx = 26
    top = 4 if female else 2

    if female:
        # Hair mass behind the shoulders.
        poly(d, [(17, top + 1), (35, top + 1), (38, top + 5), (39, top + 18),
                 (37, top + 30), (39, top + 40), (36, BUST_H - 1),
                 (16, BUST_H - 1), (13, top + 40), (15, top + 30),
                 (13, top + 18), (14, top + 5)], HAIR_F_M)
        dither_poly(img, [(28, top + 1), (35, top + 1), (38, top + 5),
                          (39, top + 18), (37, top + 30), (39, top + 40),
                          (36, BUST_H - 1), (29, BUST_H - 1)],
                    HAIR_F_D, phase=0, step=6)
        # Low ponytail peeking on viewer right.
        poly(d, [(34, top + 23), (39, top + 27), (41, top + 36),
                 (39, BUST_H - 1), (35, BUST_H - 1), (36, top + 37)],
             HAIR_F_M)
    else:
        box(d, cx - 4, top + 19, cx + 4, top + 29, SKIN)
        box(d, cx + 1, top + 20, cx + 3, top + 28, SKIN_SH)

    # Shoulders and jacket crop, drawn behind the head.  They start below
    # the chin so the bust keeps a visible neck.
    if female:
        poly(d, [(23, top + 28), (29, top + 28), (34, top + 31),
                 (39, top + 33), (39, BUST_H - 1), (13, BUST_H - 1),
                 (13, top + 33), (18, top + 31)], NAVY)
        dither_poly(img, [(33, top + 31), (39, top + 33), (39, BUST_H - 1),
                          (32, BUST_H - 1)], NAVY_D, phase=1, step=6)
    else:
        poly(d, [(21, top + 28), (31, top + 28), (35, top + 31),
                 (41, top + 33), (41, BUST_H - 1), (11, BUST_H - 1),
                 (11, top + 33), (17, top + 31)], NAVY)
        dither_poly(img, [(34, top + 31), (41, top + 33), (41, BUST_H - 1),
                          (33, BUST_H - 1)], NAVY_D, phase=0, step=6)

    draw_head_base(img, female, cx, top)

    # Hands/props are omitted in the bust.  Outline then details.
    img = outline_sprite(img)
    draw_face(img, female, cx, top, expression)
    draw_hair_details(img, female, cx, top)

    d = ImageDraw.Draw(img)
    # Collar and zip, sitting below the jaw.  Two cream collar strips with
    # a dark zipper channel between them read as a zipped track jacket.
    if female:
        poly(d, [(20, top + 27), (25, top + 27), (25, top + 30),
                 (23, top + 31), (21, top + 30)], CREAM)
        poly(d, [(27, top + 27), (32, top + 27), (31, top + 30),
                 (29, top + 31), (27, top + 30)], CREAM)
        box(d, 25, top + 27, 27, top + 30, NAVY_DD)
        d.line([(21, top + 30), (23, top + 31), (25, top + 30)],
               fill=CREAM_SH, width=1)
        d.line([(27, top + 30), (29, top + 31), (31, top + 30)],
               fill=CREAM_SH, width=1)
    else:
        poly(d, [(19, top + 27), (25, top + 27), (25, top + 30),
                 (23, top + 31), (20, top + 30)], CREAM)
        poly(d, [(27, top + 27), (33, top + 27), (32, top + 30),
                 (29, top + 31), (27, top + 30)], CREAM)
        box(d, 25, top + 27, 27, top + 30, NAVY_DD)
        d.line([(20, top + 30), (23, top + 31), (25, top + 30)],
               fill=CREAM_SH, width=1)
        d.line([(27, top + 30), (29, top + 31), (32, top + 30)],
               fill=CREAM_SH, width=1)
    d.line([(26, top + 30), (26, BUST_H - 1)], fill=CREAM_SH, width=1)
    box(d, 25, top + 30, 27, top + 32, CREAM)
    put(d, 26, top + 31, GOLD)

    # A hint of the sleeve stripe at the crop edges.
    if female:
        d.line([(18, top + 34), (17, BUST_H - 1)], fill=CREAM_SH, width=1)
        d.line([(34, top + 34), (35, BUST_H - 1)], fill=CREAM_SH, width=1)
    else:
        d.line([(16, top + 34), (15, BUST_H - 1)], fill=CREAM_SH, width=1)
        d.line([(36, top + 34), (37, BUST_H - 1)], fill=CREAM_SH, width=1)

    return img


# ---------------------------------------------------------------------------
# Compose the presentation sheet
# ---------------------------------------------------------------------------

def load_font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/simsun.ttc",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_text_px(img, xy, text, size, color, bold=False, anchor="la"):
    """Render a font then threshold it, so it stays hard-edged pixel text."""
    font = load_font(size, bold)
    tmp = Image.new("L", (1600, 200), 0)
    td = ImageDraw.Draw(tmp)
    td.text((0, 0), text, font=font, fill=255)
    bbox = tmp.getbbox()
    if not bbox:
        return
    tmp = tmp.crop(bbox)
    # Threshold first, then scale is 1:1, so no grey antialiasing survives.
    tmp = tmp.point(lambda p: 255 if p >= 128 else 0)
    layer = Image.new("RGBA", tmp.size, ImageColor.getrgb(color) + (255,))
    layer.putalpha(tmp)
    if anchor == "ma":
        xy = (xy[0] - tmp.width // 2, xy[1])
    elif anchor == "ra":
        xy = (xy[0] - tmp.width, xy[1])
    img.alpha_composite(layer, (int(xy[0]), int(xy[1])))


def fit_text(img, text, size, color, max_width, bold=False):
    while size > 10:
        font = load_font(size, bold)
        if font.getlength(text) <= max_width:
            break
        size -= 1
    draw_text_px(img, (0, 0), text, size, color, bold=bold)


def make_sheet():
    SW, SH = 1920, 1080
    sheet = Image.new("RGBA", (SW, SH), ImageColor.getrgb(PAPER) + (255,))
    d = ImageDraw.Draw(sheet)

    # Subtle paper grain: sparse 3px dither clusters, not a gradient.
    grain = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grain)
    for y in range(0, SH, 6):
        for x in range(0, SW, 6):
            if (x // 6 + y // 6) % 7 == 0:
                gd.rectangle((x, y, x + 2, y + 2), fill=ImageColor.getrgb(PAPER_SH) + (60,))
    sheet.alpha_composite(grain)

    # Border.
    d.rectangle((36, 36, SW - 37, SH - 37), outline=ImageColor.getrgb("#8d7c6c") + (255,), width=3)
    d.rectangle((45, 45, SW - 46, SH - 46), outline=ImageColor.getrgb("#c0ad99") + (255,), width=1)

    # Header.
    draw_text_px(sheet, (78, 64), "CHARACTER PREVIEW  /  01", 22, "#7a5a4c", bold=True)
    draw_text_px(sheet, (76, 92), "角色静态预览", 68, "#1f2a44", bold=True)
    draw_text_px(sheet, (82, 174), "《刻在我心底的名字》 · 高中时期 · 16-bit pixel study", 25, "#5a4a42")
    d.rectangle((78, 218, 1110, 218), fill=ImageColor.getrgb("#1f2a44") + (255,))

    draw_text_px(sheet, (78, 238),
                 "同一套藏青运动校服，用轮廓、发型、体态与表情区分两个人。",
                 26, "#3b3030")

    # Main pair.  Paste 1x sprites at 3x, feet on one line.
    male = make_standing(False)
    female = make_standing(True)
    male3 = male.resize((CELL_W * 3, CELL_H * 3), Image.NEAREST)
    female3 = female.resize((CELL_W * 3, CELL_H * 3), Image.NEAREST)

    feet_y = 930
    pair_y = feet_y - FEET * 3
    mx, fx = 470, 802
    # Soft dithered ground shadow.
    shadow = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    for i, (sx, w) in enumerate(((mx + 40, 210), (fx + 40, 190))):
        for yy in range(0, 14):
            for xx in range(0, w, 2):
                if (xx + yy) % 4 == 0:
                    sd.point((sx + xx, feet_y + yy - 4),
                             fill=ImageColor.getrgb("#7b6759") + (44,))
    sheet.alpha_composite(shadow)
    sheet.alpha_composite(male3, (mx, pair_y))
    sheet.alpha_composite(female3, (fx, pair_y))

    # Height notes sit above each head, clear of the palette column.
    male_top = pair_y + 6 * 3
    female_top = pair_y + 17 * 3
    draw_text_px(sheet, (mx + 144, 440), "≈6.5 头身", 19, "#3b3030", anchor="ma")
    draw_text_px(sheet, (fx + 144, 474), "≈6.3 头身", 19, "#3b3030", anchor="ma")

    # One ground line under both pairs.
    d.line([(440, 934), (1140, 934)], fill=ImageColor.getrgb("#8d7c6c") + (200,), width=1)
    draw_text_px(sheet, (78, 924), "同一条地面线", 17, "#6b5a4e")

    # Labels under the pair.
    draw_text_px(sheet, (mx + 144, 952), "男主 · 高中校服", 27, "#1f2a44", anchor="ma", bold=True)
    draw_text_px(sheet, (mx + 144, 982), "左手插袋 · 肩线略松", 19, "#5a4a42", anchor="ma")
    draw_text_px(sheet, (fx + 144, 952), "女主 · 高中校服", 27, "#1f2a44", anchor="ma", bold=True)
    draw_text_px(sheet, (fx + 144, 982), "抱书于侧 · 低马尾", 19, "#5a4a42", anchor="ma")

    # Right panel: expressions.
    px0, py0, px1, py1 = 1168, 238, 1846, 1000
    d.rectangle((px0, py0, px1, py1), fill=ImageColor.getrgb("#1f2a44") + (255,))
    d.rectangle((px0, py0, px1, py1), outline=ImageColor.getrgb("#4a5f86") + (255,), width=3)
    d.rectangle((px0 + 9, py0 + 9, px1 - 10, py1 - 10), outline=ImageColor.getrgb("#2f3f60") + (255,), width=1)
    draw_text_px(sheet, (px0 + 28, py0 + 24), "表情 / EXPRESSIONS", 24, "#e8d8c8", bold=True)
    draw_text_px(sheet, (px0 + 28, py0 + 56), "同一张脸，只改眉眼与嘴角。", 19, "#9fb2c8")

    expr_labels_m = [("平静", "calm"), ("局促", "shy"), ("微笑", "smile"), ("失落", "down")]
    expr_labels_f = [("平静", "calm"), ("腼腆", "shy"), ("微笑", "smile"), ("低落", "down")]

    def expression_row(female, labels, y_label, y_img):
        draw_text_px(sheet, (px0 + 28, y_label), "男主" if not female else "女主",
                     22, "#e8d8c8", bold=True)
        for i, (label, expr) in enumerate(labels):
            b = draw_bust(female, expr)
            b3 = b.resize((BUST_W * 3, BUST_H * 3), Image.NEAREST)
            bx = px0 + 24 + i * 160
            # cream card
            d.rectangle((bx - 4, y_img - 4, bx + BUST_W * 3 + 3, y_img + BUST_H * 3 + 3),
                        fill=ImageColor.getrgb("#e8d8c8") + (255,))
            d.rectangle((bx - 4, y_img - 4, bx + BUST_W * 3 + 3, y_img + BUST_H * 3 + 3),
                        outline=ImageColor.getrgb("#cfc8b7") + (255,), width=1)
            sheet.alpha_composite(b3, (bx, y_img))
            draw_text_px(sheet, (bx + BUST_W * 3 // 2, y_img + BUST_H * 3 + 10),
                         label, 19, "#e8d8c8", anchor="ma")

    expression_row(False, expr_labels_m, 326, 358)
    expression_row(True, expr_labels_f, 592, 624)

    draw_text_px(sheet, (px0 + 28, 848),
                 "表情只验证基础可读性；细化与\n口型/眨眼帧留待批准后制作。",
                 18, "#9fb2c8")
    draw_text_px(sheet, (px0 + 28, 902),
                 "统一处理：1px 局部深色描边 /\n3–4 阶明暗 / 无抗锯齿 / 无渐变",
                 18, "#9fb2c8")

    # Left column: palette.
    lx = 78
    draw_text_px(sheet, (lx, 300), "色板 / PALETTE", 24, "#1f2a44", bold=True)
    pal = [
        ("描边", "#16131d"), ("肤色", SKIN), ("肤色阴影", SKIN_SH),
        ("发色·男", HAIR_M_M), ("发色·女", HAIR_F_M), ("校服藏青", NAVY),
        ("藏青暗部", NAVY_D), ("米白", CREAM), ("鞋/纸", CREAM_D),
        ("腮红", BLUSH), ("校徽金", GOLD), ("笔记本", BOOK),
    ]
    for i, (name, hexc) in enumerate(pal):
        col = i % 2
        row = i // 2
        sx = lx + col * 190
        sy = 342 + row * 54
        d.rectangle((sx, sy, sx + 30, sy + 30),
                    fill=ImageColor.getrgb(hexc) + (255,),
                    outline=ImageColor.getrgb("#6b5a4e") + (255,), width=2)
        draw_text_px(sheet, (sx + 40, sy + 1), name, 17, "#3b3030")
        draw_text_px(sheet, (sx + 40, sy + 20), hexc.upper(), 13, "#7a6a5c")

    # Left column: style notes.
    draw_text_px(sheet, (lx, 680), "风格 / STYLE", 24, "#1f2a44", bold=True)
    notes = [
        "· 6.3–6.5 头身，普通高中生比例",
        "· 肩宽、腰线自然，不拉长腿",
        "· 校服为宽松藏青运动服",
        "· 1px 局部深色描边，非纯黑",
        "· 3–4 阶明暗，少量 Bayer 抖动",
        "· 角色 12fps / 镜头 24fps（后续）",
    ]
    for i, line in enumerate(notes):
        draw_text_px(sheet, (lx, 724 + i * 32), line, 18, "#4a3d36")

    # Bottom note.
    draw_text_px(sheet, (78, 1014),
                 "静态预览 v1 · 用于确认画风、比例与两人辨识度，不是最终动画资产。",
                 17, "#6b5a4e")

    return sheet


def main():
    male = make_standing(False)
    female = make_standing(True)
    male.save(os.path.join(OUT, "male_stand_v1.png"))
    female.save(os.path.join(OUT, "female_stand_v1.png"))

    # Expression strips, useful for review at 1x.
    for female_flag, name in ((False, "male"), (True, "female")):
        strip = Image.new("RGBA", (BUST_W * 4, BUST_H), (0, 0, 0, 0))
        for i, expr in enumerate(("calm", "shy", "smile", "down")):
            strip.alpha_composite(draw_bust(female_flag, expr), (i * BUST_W, 0))
        strip.save(os.path.join(OUT, f"{name}_expressions_v1.png"))

    sheet = make_sheet()
    sheet.convert("RGB").save(os.path.join(OUT, "character_preview_v1.png"))
    print("wrote", os.path.join(OUT, "character_preview_v1.png"))


if __name__ == "__main__":
    main()
