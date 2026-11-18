"""Build the app's icon and splash assets from the brand sources in assets/brand/source/.

Run from the repo root with any Python that has Pillow:
    python3 tools/build_icons.py

Sources (copied from the Jajan Tenang logo set; replace them there, then copy again):
    app-icon-1024.png           iOS / store icon on Ice Blue
    adaptive-foreground-432.png Android adaptive icon foreground (logo inside the safe zone)
    adaptive-background-432.png Android adaptive icon background (Ice Blue)
    icon-white-600.png          white silhouette of the logo mark
    icon-color-600.png          the logo mark in colour (splash screen)

Outputs in assets/brand/:
    app-icon.png, adaptive-foreground.png, adaptive-background.png  (copied as is)
    adaptive-monochrome.png  white silhouette placed like the foreground (Android 13 themed icons)
    notification-icon.png    96x96 white silhouette on transparent (Android notification small icon)
    splash-logo.png          logo mark centred on a square canvas so that it fits the circle
                             Android 12+ crops splash icons to (a wide logo with text gets cut)
"""

from pathlib import Path
import shutil

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/brand/source"
OUT = ROOT / "assets/brand"


def fit_into(mark: Image.Image, box: tuple[int, int, int, int], canvas: int) -> Image.Image:
    """Scale `mark` to fit inside `box` (left, top, right, bottom), centred, on a transparent canvas."""
    left, top, right, bottom = box
    w, h = right - left, bottom - top
    scaled = mark.copy()
    scaled.thumbnail((w, h), Image.LANCZOS)
    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    out.paste(scaled, (left + (w - scaled.width) // 2, top + (h - scaled.height) // 2), scaled)
    return out


def main() -> None:
    for name, target in [
        ("app-icon-1024.png", "app-icon.png"),
        ("adaptive-foreground-432.png", "adaptive-foreground.png"),
        ("adaptive-background-432.png", "adaptive-background.png"),
    ]:
        shutil.copyfile(SRC / name, OUT / target)

    mark = Image.open(SRC / "icon-white-600.png").convert("RGBA")
    mark = mark.crop(mark.getbbox())

    # Themed icon: same position and size as the coloured foreground's logo.
    foreground = Image.open(SRC / "adaptive-foreground-432.png").convert("RGBA")
    fit_into(mark, foreground.getbbox(), foreground.width).save(OUT / "adaptive-monochrome.png")

    # Splash: Android 12+ shows the icon inside a circle whose diameter is 2/3 of the image.
    # Size the canvas so the mark's diagonal fits that circle, with a little air.
    color_mark = Image.open(SRC / "icon-color-600.png").convert("RGBA")
    color_mark = color_mark.crop(color_mark.getbbox())
    diagonal = (color_mark.width**2 + color_mark.height**2) ** 0.5
    canvas = int(diagonal * 1.5 * 1.08)
    margin_x, margin_y = (canvas - color_mark.width) // 2, (canvas - color_mark.height) // 2
    fit_into(color_mark, (margin_x, margin_y, canvas - margin_x, canvas - margin_y), canvas).save(OUT / "splash-logo.png")

    # Notification small icon: 96x96 with a small margin.
    fit_into(mark, (8, 8, 88, 88), 96).save(OUT / "notification-icon.png")
    print("Built icons in", OUT)


if __name__ == "__main__":
    main()
