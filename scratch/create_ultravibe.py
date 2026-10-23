import numpy as np
from PIL import Image

def create_ultravibe_dark(width=2400, height=1400):
    # Base: Deep forest dark #0D170D
    img = np.zeros((height, width, 3), dtype=np.float32)
    img[:, :] = [13.0, 23.0, 13.0]

    center_x = width / 2.0
    center_y = height * 1.52
    radius = height * 1.15

    y_coords, x_coords = np.ogrid[:height, :width]
    dist_from_center = np.sqrt((x_coords - center_x)**2 + (y_coords - center_y)**2)
    dist_from_rim = dist_from_center - radius

    # Outer glow (above the arc)
    outer_glow = np.exp(-np.maximum(0, dist_from_rim) / 110.0) * (dist_from_rim >= 0)
    # Inner glow (under the horizon)
    inner_glow = np.exp(-np.maximum(0, -dist_from_rim) / 240.0) * (dist_from_rim < 0)
    # Sharp intense rim core
    rim_core = np.exp(-(dist_from_rim**2) / (2.0 * 20.0**2))
    # Secondary halo
    rim_halo = np.exp(-(dist_from_rim**2) / (2.0 * 60.0**2))

    # Leafy Green Garden Colors:
    # 1. Lime-Cream Rim: #ECF39E -> (236, 243, 158)
    # 2. Sage Green Halo: #90A955 -> (144, 169, 85)
    # 3. Leaf Green Horizon: #4F772D -> (79, 119, 45)
    # 4. Forest Green Body: #31572C -> (49, 87, 44)

    # Channel 0 (R), Channel 1 (G), Channel 2 (B)
    for c, (c_rim, c_halo, c_inner, c_outer) in enumerate([
        (236, 144, 49, 79),    # Red
        (243, 169, 87, 119),   # Green
        (158, 85, 44, 45)      # Blue
    ]):
        img[:, :, c] += rim_core * (c_rim - img[:, :, c]) * 0.98
        img[:, :, c] += rim_halo * (c_halo - img[:, :, c]) * 0.70
        img[:, :, c] += inner_glow * (c_inner - img[:, :, c]) * 0.60
        img[:, :, c] += outer_glow * (c_outer - img[:, :, c]) * 0.40

    # Authentic fine film grain noise
    np.random.seed(42)
    noise = np.random.normal(0, 10.5, (height, width, 3))
    img = np.clip(img + noise, 0, 255).astype(np.uint8)

    pil_img = Image.fromarray(img)
    pil_img.save('assets/ultravibe-20-dark.png', quality=95)
    print('Updated ultravibe-20-dark.png')

def create_ultravibe_light(width=2400, height=1400):
    # Base: Fresh botanical ivory #F8FAF7
    img = np.zeros((height, width, 3), dtype=np.float32)
    img[:, :] = [248.0, 250.0, 247.0]

    center_x = width / 2.0
    center_y = height * 1.52
    radius = height * 1.15

    y_coords, x_coords = np.ogrid[:height, :width]
    dist_from_center = np.sqrt((x_coords - center_x)**2 + (y_coords - center_y)**2)
    dist_from_rim = dist_from_center - radius

    outer_glow = np.exp(-np.maximum(0, dist_from_rim) / 95.0) * (dist_from_rim >= 0)
    inner_glow = np.exp(-np.maximum(0, -dist_from_rim) / 220.0) * (dist_from_rim < 0)
    rim_core = np.exp(-(dist_from_rim**2) / (2.0 * 18.0**2))
    rim_halo = np.exp(-(dist_from_rim**2) / (2.0 * 50.0**2))

    # For light mode: Emerald & Sage horizon curve with gentle gradient depth
    for c, (t_rim, t_halo, t_inner, t_outer) in enumerate([
        (60, 110, 160, 130),   # Red
        (105, 150, 195, 175),  # Green
        (40, 75, 120, 95)      # Blue
    ]):
        img[:, :, c] -= rim_core * (248 - t_rim) * 0.75
        img[:, :, c] -= rim_halo * (248 - t_halo) * 0.45
        img[:, :, c] -= inner_glow * (248 - t_inner) * 0.35
        img[:, :, c] -= outer_glow * (248 - t_outer) * 0.20

    np.random.seed(42)
    noise = np.random.normal(0, 6.5, (height, width, 3))
    img = np.clip(img + noise, 0, 255).astype(np.uint8)

    pil_img = Image.fromarray(img)
    pil_img.save('assets/ultravibe-20-light.png', quality=95)
    print('Updated ultravibe-20-light.png')

create_ultravibe_dark()
create_ultravibe_light()
