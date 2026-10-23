import numpy as np
from PIL import Image

def generate_seamless_ultravibe_dark(width=2400, height=1300):
    # Create RGBA float array (all transparent initially)
    img = np.zeros((height, width, 4), dtype=np.float32)

    center_x = width / 2.0
    center_y = height * 1.48
    radius = height * 1.12

    y_coords, x_coords = np.ogrid[:height, :width]
    dist_from_center = np.sqrt((x_coords - center_x)**2 + (y_coords - center_y)**2)
    dist_from_rim = dist_from_center - radius

    # Gaussian / exponential falloff curves
    # 1. Intense rim core (Lime Cream #ECF39E -> 236, 243, 158)
    rim_core = np.exp(-(dist_from_rim**2) / (2.0 * 22.0**2))
    
    # 2. Glowing Halo (Sage Olive #90A955 -> 144, 169, 85)
    rim_halo = np.exp(-(dist_from_rim**2) / (2.0 * 75.0**2))

    # 3. Inner body glow (Forest Green #31572C -> 49, 87, 44) - fades downwards smoothly
    inner_glow = np.exp(-np.maximum(0, -dist_from_rim) / 220.0) * (dist_from_rim < 0)
    
    # 4. Outer sky glow (Emerald #4F772D -> 79, 119, 45) - fades upwards smoothly
    outer_glow = np.exp(-np.maximum(0, dist_from_rim) / 130.0) * (dist_from_rim >= 0)

    # Edge vignette factor to fade left & right boundaries to 0 alpha
    x_norm = np.abs(x_coords - center_x) / (width / 2.0)
    horiz_fade = np.clip(1.0 - (x_norm ** 2.2), 0.0, 1.0)
    
    # Vertical fade factor at very bottom to fade to 0 alpha
    vert_fade = np.clip((height - y_coords) / (height * 0.15), 0.0, 1.0) * np.clip(y_coords / (height * 0.1), 0.0, 1.0)

    vignette = horiz_fade * vert_fade

    # Blend RGB colors
    r = rim_core * 236.0 + rim_halo * 144.0 + inner_glow * 49.0 + outer_glow * 79.0
    g = rim_core * 243.0 + rim_halo * 169.0 + inner_glow * 87.0 + outer_glow * 119.0
    b = rim_core * 158.0 + rim_halo * 85.0 + inner_glow * 44.0 + outer_glow * 45.0

    # Calculate alpha based on light intensity with soft gamma
    alpha = np.clip((rim_core * 1.0 + rim_halo * 0.75 + inner_glow * 0.55 + outer_glow * 0.35) * vignette, 0.0, 1.0) * 255.0

    img[:, :, 0] = np.clip(r, 0, 255)
    img[:, :, 1] = np.clip(g, 0, 255)
    img[:, :, 2] = np.clip(b, 0, 255)
    img[:, :, 3] = alpha

    # Add very faint micro-grain ONLY where alpha > 10 (not on transparent space)
    np.random.seed(42)
    subtle_grain = np.random.normal(0, 3.5, (height, width))
    mask = img[:, :, 3] > 10
    for c in range(3):
        img[:, :, c] = np.where(mask, np.clip(img[:, :, c] + subtle_grain, 0, 255), img[:, :, c])

    final_img = Image.fromarray(img.astype(np.uint8), mode='RGBA')
    final_img.save('assets/ultravibe-20-dark.png')
    final_img.save('assets/ultravibe-20-dark.webp', quality=95)
    print("Generated seamless ultravibe-20-dark (RGBA transparent)")

def generate_seamless_ultravibe_light(width=2400, height=1300):
    img = np.zeros((height, width, 4), dtype=np.float32)

    center_x = width / 2.0
    center_y = height * 1.48
    radius = height * 1.12

    y_coords, x_coords = np.ogrid[:height, :width]
    dist_from_center = np.sqrt((x_coords - center_x)**2 + (y_coords - center_y)**2)
    dist_from_rim = dist_from_center - radius

    rim_core = np.exp(-(dist_from_rim**2) / (2.0 * 25.0**2))
    rim_halo = np.exp(-(dist_from_rim**2) / (2.0 * 85.0**2))
    inner_glow = np.exp(-np.maximum(0, -dist_from_rim) / 250.0) * (dist_from_rim < 0)
    outer_glow = np.exp(-np.maximum(0, dist_from_rim) / 140.0) * (dist_from_rim >= 0)

    x_norm = np.abs(x_coords - center_x) / (width / 2.0)
    horiz_fade = np.clip(1.0 - (x_norm ** 2.2), 0.0, 1.0)
    vert_fade = np.clip((height - y_coords) / (height * 0.15), 0.0, 1.0) * np.clip(y_coords / (height * 0.1), 0.0, 1.0)
    vignette = horiz_fade * vert_fade

    # Light palette: Sage & Leaf green dawn glow
    r = rim_core * 144.0 + rim_halo * 79.0 + inner_glow * 49.0 + outer_glow * 144.0
    g = rim_core * 169.0 + rim_halo * 119.0 + inner_glow * 87.0 + outer_glow * 169.0
    b = rim_core * 85.0 + rim_halo * 45.0 + inner_glow * 44.0 + outer_glow * 85.0

    alpha = np.clip((rim_core * 0.7 + rim_halo * 0.5 + inner_glow * 0.35 + outer_glow * 0.25) * vignette, 0.0, 1.0) * 200.0

    img[:, :, 0] = np.clip(r, 0, 255)
    img[:, :, 1] = np.clip(g, 0, 255)
    img[:, :, 2] = np.clip(b, 0, 255)
    img[:, :, 3] = alpha

    final_img = Image.fromarray(img.astype(np.uint8), mode='RGBA')
    final_img.save('assets/ultravibe-20-light.png')
    final_img.save('assets/ultravibe-20-light.webp', quality=95)
    print("Generated seamless ultravibe-20-light (RGBA transparent)")

if __name__ == '__main__':
    generate_seamless_ultravibe_dark()
    generate_seamless_ultravibe_light()
