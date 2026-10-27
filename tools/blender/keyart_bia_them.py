# ---- phần thêm cho ảnh bìa (chạy trong không gian tên của keyart.py) ----
random.seed(21)
def G(x):
    return x < F0

def ico(name, loc, size, mat, sub=1, rot=None):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=1, location=loc)
    ob = bpy.context.active_object; ob.name = name; ob.scale = size
    ob.rotation_euler = rot or (random.uniform(0, 3), random.uniform(0, 3), random.uniform(0, 3))
    ob.data.materials.append(mat)
    return ob

def cyl(name, loc, r, d, mat, rot=(0, 0, 0), v=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=d, location=loc, rotation=rot)
    ob = bpy.context.active_object; ob.name = name; ob.data.materials.append(mat)
    b = ob.modifiers.new('bv', 'BEVEL'); b.width = min(r, d) * 0.25; b.segments = 3
    for p in ob.data.polygons: p.use_smooth = True
    return ob

# 1) dãy nhà xa phía sau, mái ngói, bồn nước, ăng-ten
x = -22.0
pal = ['#E7B36A', '#E59A86', '#8CC3B8', '#F3E4C8', '#D9C27A', '#C98F7A']
while x < 22:
    w = random.uniform(2.2, 3.6); h = random.uniform(8.0, 11.5); g = G(x + w / 2)
    col = random.choice(pal)
    box('far', (x + w / 2, FY + 6.5, h / 2), (w, 3.0, h), M(col, g), bevel=0.08, lump=0.01)
    for f in range(int(h // 1.6) - 1):
        for fx in (0.3, 0.7):
            box('farwin', (x + w * fx, FY + 4.95, 1.6 + f * 1.6), (0.42, 0.1, 0.6), M('#5B4A40', g), bevel=0.03, lump=0)
    if random.random() < 0.5:
        bpy.ops.mesh.primitive_cylinder_add(vertices=3, radius=0.95, depth=w + 0.2, location=(x + w / 2, FY + 6.5, h + 0.3))
        r = bpy.context.active_object; r.rotation_euler = (math.radians(90), 0, math.radians(90)); r.scale = (1, 0.5, 1)
        r.data.materials.append(M('#C9694A', g))
    else:
        cyl('tank', (x + w * 0.65, FY + 6.2, h + 0.45), 0.35, 0.8, M('#C9CDD2', g))
        rod('ant', (x + w * 0.3, FY + 6.0, h), (x + w * 0.3, FY + 6.0, h + 1.6), 0.02, M('#3A3530', g))
        rod('ant2', (x + w * 0.3 - 0.35, FY + 6.0, h + 1.3), (x + w * 0.3 + 0.35, FY + 6.0, h + 1.3), 0.015, M('#3A3530', g))
    x += w + 0.05

# 2) cây: bàng bên xám, phượng nở đỏ bên màu
def tree(tx, ty, h, grey, flowers):
    rod('trunk', (tx, ty, 0.2), (tx + 0.25, ty, h * 0.65), 0.22, M('#7A5534', grey))
    rod('branch', (tx + 0.2, ty, h * 0.55), (tx + 1.3, ty - 0.2, h * 0.8), 0.1, M('#7A5534', grey))
    rod('branch', (tx + 0.2, ty, h * 0.5), (tx - 1.0, ty + 0.1, h * 0.78), 0.1, M('#7A5534', grey))
    for k in range(9):
        cx = tx + random.uniform(-1.9, 2.0); cz = h * 0.82 + random.uniform(-0.6, 0.9)
        s = random.uniform(0.9, 1.4)
        blob('canopy', (cx, ty + random.uniform(-0.6, 0.6), cz), (s, s * 0.85, s * 0.8), M(random.choice(['#4F9A45', '#5FAE4E', '#3F8A3E']), grey, bump=0.9), lump=0.15)
        if flowers and not grey:
            for q in range(10):
                blob('phuong', (cx + random.uniform(-s, s) * 0.8, ty - s * 0.75 + random.uniform(-0.15, 0.1), cz + random.uniform(-s, s) * 0.6),
                     (0.09, 0.07, 0.08), clay('phuong', random.choice(['#E2452D', '#F0622F', '#D8351F'])), lump=0.02)
tree(4.4, -0.2, 6.2, False, True)
tree(-8.4, 0.2, 6.0, True, False)

# 3) cột và dây điện chùng
poles = [(-13.0, 1.7), (-6.6, 1.7), (-1.8, 1.7), (10.6, 1.7)]
for px, py in poles:
    box('pole', (px, py, 3.6), (0.22, 0.22, 7.2), M('#9C958B', G(px)), bevel=0.04, lump=0)
    box('arm', (px, py, 6.7), (1.4, 0.12, 0.12), M('#6A635B', G(px)), bevel=0.02, lump=0)
for (ax, ay), (bx, by) in zip(poles, poles[1:]):
    for k, dz in enumerate((6.75, 6.45, 6.15)):
        off = (k - 1) * 0.5
        pts = []
        for i in range(17):
            t = i / 16
            pts.append(Vector((ax + (bx - ax) * t + off * 0.2, ay + 0.05 * k, dz - 1.0 * math.sin(math.pi * t))))
        for p0, p1 in zip(pts, pts[1:]):
            rod('wire', p0, p1, 0.018, M('#2E2A27', G((p0.x + p1.x) / 2)))
# chim đậu trên dây (bên màu)
for bxp in (2.6, 3.1, 7.9):
    t = (bxp + 1.8) / 12.4; z = 6.75 - 1.0 * math.sin(math.pi * t)
    blob('bird', (bxp, 1.7, z + 0.1), (0.09, 0.07, 0.08), clay('bird', '#3B3A4A'), lump=0)
    blob('birdh', (bxp + 0.07, 1.67, z + 0.2), (0.05, 0.05, 0.05), clay('bird', '#3B3A4A'), lump=0)

# 4) dây đèn lồng nhỏ bắc ngang bên màu
for i in range(15):
    t = i / 14; lx = 0.6 + 8.0 * t; lz = 5.0 - 0.6 * math.sin(math.pi * t)
    blob('minilan', (lx, -0.6, lz), (0.13, 0.13, 0.16), clay('ml', random.choice(['#E2452D', '#F2B532', '#2E9C93', '#F28BA8'])), lump=0)
    if i < 14:
        t2 = (i + 1) / 14
        rod('lancord', (lx, -0.6, lz + 0.14), (0.6 + 8.0 * t2, -0.6, 5.0 - 0.6 * math.sin(math.pi * t2) + 0.14), 0.01, clay('cord', '#2E2A27'))

# 5) hoa giấy đổ xuống từ ban công bên màu
for (hx, hz) in [(0.2, 4.3), (1.8, 5.8), (3.0, 4.3), (6.0, 4.1), (7.2, 5.6), (9.3, 4.6)]:
    for q in range(16):
        blob('hoagiay', (hx + random.uniform(-0.6, 0.6), FY - 0.75 + random.uniform(-0.15, 0.15), hz - random.uniform(0, 1.3) * (1 - abs(random.gauss(0, 0.4)))),
             (0.11, 0.09, 0.1), clay('hg', random.choice(['#E6529A', '#F06BAA', '#D93F86'])), lump=0.01)
    for q in range(5):
        blob('hgleaf', (hx + random.uniform(-0.5, 0.5), FY - 0.7, hz - random.uniform(0, 0.8)), (0.13, 0.06, 0.1), clay('hgl', '#4F8E3C'), lump=0)

# 6) quán trà đá vỉa hè: ghế nhựa, bàn, ấm, ly; xe đạp; nón lá
def stool(sx, sy, col, grey):
    cyl('stool', (sx, sy, 0.62), 0.24, 0.07, M(col, grey))
    for a in range(4):
        ang = a * math.pi / 2 + 0.6
        rod('leg', (sx + 0.17 * math.cos(ang), sy + 0.17 * math.sin(ang), 0.6), (sx + 0.24 * math.cos(ang), sy + 0.24 * math.sin(ang), 0.24), 0.035, M(col, grey))
for sx, sy, col in [(5.6, -2.6, '#D8352B'), (7.0, -2.3, '#2D6FB8'), (6.2, -1.4, '#D8352B')]:
    stool(sx, sy, col, False)
cyl('table', (6.3, -2.0, 0.78), 0.45, 0.06, clay('tbl', '#3E78B8'))
rod('tleg', (6.3, -2.0, 0.76), (6.3, -2.0, 0.24), 0.05, clay('tbl', '#3E78B8'))
for k, (cx_, cy_) in enumerate([(6.1, -2.15), (6.45, -1.85), (6.5, -2.25)]):
    cyl('ly', (cx_, cy_, 0.92), 0.06, 0.18, clay('ly', '#F2D27A', rough=0.2, sss=0.5), v=16)
blob('am', (6.15, -1.8, 0.98), (0.17, 0.17, 0.15), clay('am', '#E9E2D4', gloss=True), lump=0)
bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.42, depth=0.32, location=(7.0, -2.3, 0.82))
non = bpy.context.active_object; non.data.materials.append(clay('non', '#E8CF8F', bump=0.8)); non.rotation_euler = (0.15, 0.1, 0)
for sx, sy in [(-3.0, -2.3), (-2.2, -1.6)]:
    stool(sx, sy, '#888', True)

def bike(bx, by, grey, col):
    for wx in (bx - 0.55, bx + 0.55):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.38, minor_radius=0.035, location=(wx, by, 0.64), rotation=(math.radians(90), 0, 0))
        bpy.context.active_object.data.materials.append(M('#2E2A27', grey))
    mm = M(col, grey)
    rod('f1', (bx - 0.55, by, 0.64), (bx - 0.05, by, 1.05), 0.03, mm)
    rod('f2', (bx - 0.05, by, 1.05), (bx + 0.45, by, 1.05), 0.03, mm)
    rod('f3', (bx - 0.1, by, 0.6), (bx + 0.45, by, 1.05), 0.03, mm)
    rod('f4', (bx + 0.55, by, 0.64), (bx + 0.45, by, 1.25), 0.03, mm)
    rod('f5', (bx - 0.55, by, 0.64), (bx - 0.1, by, 0.6), 0.03, mm)
    rod('f6', (bx - 0.1, by, 0.6), (bx - 0.05, by, 1.05), 0.03, mm)
    rod('bar', (bx + 0.35, by - 0.25, 1.28), (bx + 0.55, by + 0.25, 1.28), 0.025, M('#2E2A27', grey))
    blob('seat', (bx - 0.07, by, 1.12), (0.16, 0.07, 0.05), M('#5A3B27', grey), lump=0)
    box('basket', (bx + 0.72, by, 1.12), (0.32, 0.36, 0.24), M('#C99A52', grey), bevel=0.04, lump=0)
bike(8.6, -1.2, False, '#2E9C93')
for q in range(4):
    blob('hoaxe', (8.6 + 0.72 + random.uniform(-0.1, 0.1), -1.2 + random.uniform(-0.12, 0.12), 1.3), (0.09, 0.09, 0.09), clay('hx', random.choice(['#F7D04A', '#F28BA8', '#FFFFFF'])), lump=0)
bike(-6.0, -1.0, True, '#888')

# 7) đá vụn xám và mảnh lịch bong ở tiền cảnh trái
for k in range(14):
    rx = random.uniform(-9.5, F0 - 0.3); ry = random.uniform(-5.5, -3.4)
    s = random.uniform(0.12, 0.38)
    ico('rock', (rx, ry, 0.26 + s * 0.4), (s, s * 0.9, s * 0.7), clay('g_rock', '#A9A49D', rough=0.9, bump=0.6))
for k in range(10):
    fx_ = random.uniform(F0 - 2.0, F0 + 1.8); fz = random.uniform(1.2, 4.5); fy = random.uniform(-2.6, -0.8)
    box('flake', (fx_, fy, fz), (random.uniform(0.18, 0.4), 0.03, random.uniform(0.15, 0.3)), clay('flk', '#CBC6BE'), bevel=0.01, lump=0).rotation_euler = (random.uniform(0, 3), random.uniform(0, 3), random.uniform(0, 3))
# cánh hoa bay bên màu
for k in range(26):
    px_ = random.uniform(F0 + 0.4, 9.0); pz = random.uniform(1.0, 5.5); py_ = random.uniform(-3.0, 0.0)
    pt = blob('petal', (px_, py_, pz), (0.08, 0.02, 0.06), clay('pt', random.choice(['#F28BA8', '#F7D04A', '#E2452D', '#FFFFFF'])), lump=0)
    pt.rotation_euler = (random.uniform(0, 3), random.uniform(0, 3), random.uniform(0, 3))

# 8) mây bông trên trời
for (cx_, cz_, s) in [(-9, 11.5, 2.2), (-2, 12.8, 1.6), (6, 12.0, 2.5), (13, 11.0, 1.8), (-16, 10.5, 1.5)]:
    for q in range(6):
        blob('cloud', (cx_ + random.uniform(-s, s) * 1.2, 12.5, cz_ + random.uniform(-0.3, 0.5) * s), (s * random.uniform(0.6, 1.0),) * 2 + (s * 0.55,),
             clay('cloud', '#FFF6EE', sss=0.6, bump=0.1), lump=0.05)
