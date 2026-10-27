import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
F = '/tmp/claude-0/font/e/package/800ExtraBold/Baloo2_800ExtraBold.ttf'
INK = (42, 34, 48, 255)

def word(text, size, colors, stroke):
    f = ImageFont.truetype(F, size)
    W = int(f.getlength(text)) + stroke * 4 + 20; H = int(size * 1.5) + stroke * 4
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    x = stroke * 2 + 10; y = stroke * 2
    for i, ch in enumerate(text):
        c = colors[i % len(colors)]
        d.text((x, y), ch, font=f, fill=c, stroke_width=stroke, stroke_fill=INK)
        # vệt sáng trên mỗi chữ
        x += f.getlength(ch)
    return im.crop(im.getbbox())

def shadow(im, off=10, blur=6):
    a = im.split()[3]
    s = Image.new('RGBA', (im.width + off * 2 + blur * 4, im.height + off * 2 + blur * 4), (0, 0, 0, 0))
    sh = Image.new('RGBA', im.size, (42, 34, 48, 150)); sh.putalpha(a.point(lambda v: v * 0.55))
    s.alpha_composite(sh, (blur * 2 + off, blur * 2 + off)); s = s.filter(ImageFilter.GaussianBlur(blur))
    s.alpha_composite(im, (blur * 2, blur * 2))
    return s

def logo(scale=1.0):
    CREAM = (255, 246, 230, 255)
    l1 = word('Phố Cũ', int(170 * scale), [CREAM], int(14 * scale))
    l2 = word('Bạc Màu', int(190 * scale), [(196, 191, 184, 255), (178, 173, 166, 255), (160, 155, 148, 255), CREAM,
                                             (226, 69, 45, 255), (242, 181, 50, 255), (46, 156, 147, 255)], int(14 * scale))
    tf = ImageFont.truetype(F, int(44 * scale)); tag = 'bóc lớp xám, trả lại màu cho phố'
    tw = int(tf.getlength(tag)); th = int(44 * scale * 1.35); pad = int(26 * scale)
    pill = Image.new('RGBA', (tw + pad * 2 + 12, th + 22), (0, 0, 0, 0)); pd = ImageDraw.Draw(pill)
    pd.rounded_rectangle((4, 4, pill.width - 5, pill.height - 5), radius=pill.height // 2, fill=(247, 208, 74, 255), outline=INK, width=max(4, int(7 * scale)))
    pd.text((pad + 6, (pill.height - th) // 2 - int(4 * scale)), tag, font=tf, fill=INK)
    pill = pill.rotate(2.5, expand=True, resample=Image.BICUBIC)
    gap = int(-28 * scale)
    W = max(l1.width, l2.width, pill.width) + 40
    H = pill.height + l1.height + l2.height + gap * 2 + 40
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    y = 0
    out.alpha_composite(pill, ((W - pill.width) // 2, y)); y += pill.height + int(6 * scale)
    out.alpha_composite(l1, ((W - l1.width) // 2 - int(40 * scale), y)); y += l1.height + gap
    out.alpha_composite(l2, ((W - l2.width) // 2 + int(30 * scale), y))
    return shadow(out.crop(out.getbbox()), off=int(9 * scale), blur=int(5 * scale))

if __name__ == '__main__':
    lg = logo(float(sys.argv[3]) if len(sys.argv) > 3 else 1.0)
    lg.save(sys.argv[2])
    bg = Image.open(sys.argv[1]).convert('RGBA')
    print(lg.size)
