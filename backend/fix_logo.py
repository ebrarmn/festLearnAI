from PIL import Image
import numpy as np

img = Image.open("/Users/ebrarmangan/Desktop/festLearnAI/logo.png").convert("RGBA")
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Arka plan temizleme (ızgara deseni)
max_rgb = np.maximum(np.maximum(r.astype(int), g.astype(int)), b.astype(int))
min_rgb = np.minimum(np.minimum(r.astype(int), g.astype(int)), b.astype(int))
saturation = max_rgb - min_rgb
brightness = (r.astype(int) + g.astype(int) + b.astype(int)) / 3
bg_mask = (saturation < 30) & (brightness > 150)
data[bg_mask, 3] = 0

# Görseli kırpma (transparan kısımları at)
temp_img = Image.fromarray(data)
bbox = temp_img.getbbox() # Transparan olmayan alanın sınırlarını bulur
if bbox:
    cropped_img = temp_img.crop(bbox)
    cropped_img.save("/Users/ebrarmangan/Desktop/festLearnAI/frontend/public/logo.png")
    print("Logo arka planı temizlendi ve görsel başarıyla kırpıldı!")
else:
    temp_img.save("/Users/ebrarmangan/Desktop/festLearnAI/frontend/public/logo.png")
    print("Görsel boş gözüküyor, kırpma yapılmadı.")
