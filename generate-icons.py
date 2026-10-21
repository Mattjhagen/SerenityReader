#!/usr/bin/env python3
"""
Generate extension icons using PIL/Pillow
Install: pip install pillow
Run: python3 generate-icons.py
"""

from PIL import Image, ImageDraw
import os

def create_icon(size):
    """Create a book icon for the extension"""
    # Create image with green background
    img = Image.new('RGB', (size, size), '#4CAF50')
    draw = ImageDraw.Draw(img)

    padding = int(size * 0.2)
    book_width = size - (padding * 2)
    book_height = size - (padding * 2)

    # Draw book (white rectangle)
    draw.rectangle(
        [padding, padding, padding + book_width, padding + book_height],
        fill='white'
    )

    # Draw book spine (darker green)
    spine_width = int(book_width * 0.15)
    draw.rectangle(
        [padding, padding, padding + spine_width, padding + book_height],
        fill='#2E7D32'
    )

    # Draw bookmark (orange)
    bookmark_width = int(book_width * 0.15)
    bookmark_height = int(book_height * 0.4)
    bookmark_x = (size - bookmark_width) // 2
    draw.rectangle(
        [bookmark_x, padding, bookmark_x + bookmark_width, padding + bookmark_height],
        fill='#FF9800'
    )

    # Draw lines (representing text)
    line_color = '#757575'
    line_width = max(1, int(size * 0.03))
    line_start_x = padding + int(book_width * 0.25)
    line_end_x = size - padding - int(book_width * 0.1)
    line_spacing = int(book_height * 0.2)

    for i in range(3):
        y = padding + int(book_height * 0.3) + (i * line_spacing)
        draw.line(
            [(line_start_x, y), (line_end_x, y)],
            fill=line_color,
            width=line_width
        )

    return img

def main():
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)

    # Generate icons in required sizes
    sizes = [16, 48, 128]

    for size in sizes:
        print(f"Generating {size}x{size} icon...")
        icon = create_icon(size)
        icon.save(f'icons/icon{size}.png')
        print(f"✓ Saved icons/icon{size}.png")

    print("\n✨ All icons generated successfully!")
    print("Your extension is ready to load in Chrome.")

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print("Error: Pillow is not installed")
        print("Install it with: pip install pillow")
        print("\nAlternatively, you can:")
        print("1. Create simple 16x16, 48x48, and 128x128 PNG images")
        print("2. Save them as icon16.png, icon48.png, icon128.png in the icons/ folder")
        print("3. Or use any image editing software to create custom icons")
