# Ảnh bìa Phố Cũ Bạc Màu, bố cục kiểu "xé tấm xám": Tò ở tiền cảnh kéo một tấm giấy xám khổng lồ,
# lỗ rách lộ ra phố cổ ven sông rực màu (nhà vàng mái ngói, đèn lồng, hoa giấy, phượng, thuyền, cầu).
# Chạy: python keyart_bia2.py out.png W H SAMPLES [file.blend]
import sys, os, bpy, bmesh, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clay import *
from mathutils import Vector

out = sys.argv[1]; W = int(sys.argv[2]); H = int(sys.argv[3]); S = int(sys.argv[4])
reset()
sc = bpy.context.scene
random.seed(11)
WY = 1.0                       # mặt phẳng tấm giấy xám
HC = (1.6, 4.4); HR = (6.4, 5.0)   # tâm và bán kính lỗ rách (x, z)
GREYS = ['#A39D94', '#968F86', '#ADA79E', '#8C867D']


def g():
    return clay('g' + str(random.randint(0, 3)), random.choice(GREYS), rough=0.8, bump=0.5)


def box(name, c, size, mat, bevel=0.06, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c, rotation=rot)
    ob = bpy.context.active_object; ob.name = name; ob.scale = size
    bpy.ops.object.transform_apply(scale=True)
    ob.data.materials.append(mat)
    if bevel:
        b = ob.modifiers.new('bv', 'BEVEL'); b.width = bevel; b.segments = 3; b.limit_method = 'NONE'
    return ob


def ball(name, loc, s, mat, seg=20, lump=0.0):
    return blob(name, loc, s if isinstance(s, tuple) else (s, s, s), mat, seg=seg, lump=lump)


def hole_r(ang):
    # bán kính lỗ theo góc, có mép lởm chởm
    k = 1 + 0.07 * math.sin(3 * ang + 0.7) + 0.05 * math.sin(7 * ang + 2.1) + 0.03 * math.sin(13 * ang)
    return k


def inside(x, z, shrink=1.0):
    dx = (x - HC[0]) / (HR[0] * shrink); dz = (z - HC[1]) / (HR[1] * shrink)
    return math.hypot(dx, dz) < hole_r(math.atan2(dz, dx))


def outline(shrink, n=360, seed=5):
    rnd = random.Random(seed)
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        r = hole_r(a) * shrink * (1 + rnd.uniform(-0.018, 0.018))
        pts.append((HC[0] + HR[0] * r * math.cos(a), HC[1] + HR[1] * r * math.sin(a)))
    return pts


def sheet(name, y, shrink, col, thick):
    ob = box(name, (0, y + thick / 2, 6.2), (30, thick, 13.6), clay(name, col, rough=0.85, bump=0.9), bevel=0)
    me = bpy.data.meshes.new(name + 'cut'); bm = bmesh.new()
    f = bm.faces.new([bm.verts.new((x, y - 1, z)) for x, z in outline(shrink)])
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]:
        v.co.y += 2 + thick
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    cut = bpy.data.objects.new(name + 'cut', me); sc.collection.objects.link(cut); cut.hide_render = True
    bo = ob.modifiers.new('hole', 'BOOLEAN'); bo.operation = 'DIFFERENCE'; bo.object = cut; bo.solver = 'EXACT'
    d = ob.modifiers.new('dp', 'DISPLACE'); t = bpy.data.textures.new(name + 't', 'CLOUDS'); t.noise_scale = 1.2
    d.texture = t; d.strength = 0.1; d.direction = 'Y'; d.texture_coords = 'GLOBAL'
    return ob

# ---------- tấm xám và viền giấy trắng ----------
sheet('wall', WY, 1.0, '#A8A299', 0.12)
sheet('rim', WY + 0.12, 0.955, '#F1ECE3', 0.05)

# ---------- thế giới xám phía trước ----------
box('ground', (0, -6, -0.1), (40, 16, 0.2), clay('gground', '#9C968D', rough=0.9, bump=0.7), bevel=0)
# khối nhà xám tròn trịa hai bên mép khung
for (x, y, w, d, h) in [(-9.5, -0.2, 3.2, 2.0, 5.5), (-6.6, 0.0, 2.2, 1.6, 3.2), (-11.5, -2.5, 2.5, 2.0, 2.4),
                         (9.6, -0.2, 3.0, 2.0, 6.2), (7.1, 0.0, 2.0, 1.6, 3.0), (11.2, -2.8, 2.4, 2.0, 2.0)]:
    box('gblock', (x, y, h / 2), (w, d, h), g(), bevel=0.35)
    box('gcap', (x, y - 0.1, h + 0.15), (w + 0.4, d + 0.3, 0.3), g(), bevel=0.12)
    for k in range(int(h // 1.4)):
        box('gwin', (x, y - d / 2 - 0.02, 1.0 + k * 1.4), (w * 0.5, 0.12, 0.7), g(), bevel=0.06)
for (x, y, s) in [(-8.0, -1.8, 0.9), (-7.2, -2.6, 0.6), (-10.8, -4.6, 0.8), (8.4, -2.0, 1.0), (10.2, -4.8, 0.7), (6.6, -3.2, 0.5)]:
    ball('gball', (x, y, s), (s, s, s * 0.95), g(), seg=32, lump=0.03)
# chậu cây, ghế, đèn lồng... cũng xám
for (x, y) in [(-5.6, -1.5), (5.8, -1.6)]:
    box('gpot', (x, y, 0.35), (0.7, 0.7, 0.7), g(), bevel=0.12)
    ball('gbush', (x, y, 1.1), (0.7, 0.65, 0.6), g(), seg=24, lump=0.08)
for (x, y) in [(-4.6, -3.0), (4.4, -3.6)]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=0.08, location=(x, y, 0.7)); bpy.context.active_object.data.materials.append(g())
    for a in range(4):
        an = a * math.pi / 2 + 0.6
        rod('gleg', (x + 0.22 * math.cos(an), y + 0.22 * math.sin(an), 0.68), (x + 0.3 * math.cos(an), y + 0.3 * math.sin(an), 0.0), 0.04, g())
rod('gpole', (-6.0, 0.4, 0), (-6.0, 0.4, 7.5), 0.12, g())
for k in range(3):
    ball('glan', (-5.5 + k * 0.1, 0.3, 6.4 - k * 0.9), (0.28, 0.28, 0.36), g(), seg=20)
for k in range(5):
    box('gstep', (-10.5 + k * 0.0, -4.5 + k * 0.9, 0.25 + k * 0.5), (3.4, 1.0, 0.5 + k * 1.0), g(), bevel=0.15)
for (x, y, h) in [(-7.4, 0.2, 6.5), (7.9, 0.3, 7.0)]:
    rod('gcol', (x, y, 0), (x, y, h), 0.45, g())
    box('gcolcap', (x, y, h + 0.2), (1.3, 1.3, 0.4), g(), bevel=0.12)
# đá vụn
for k in range(60):
    x = random.uniform(-13, 13); y = random.uniform(-9.5, 0.6); s = random.uniform(0.06, 0.32) * (1.4 if y < -6 else 1)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=(x, y, s * 0.5))
    r = bpy.context.active_object; r.scale = (s, s * 0.9, s * 0.7)
    r.rotation_euler = (random.uniform(0, 3), random.uniform(0, 3), random.uniform(0, 3)); r.data.materials.append(g())

# ---------- thế giới có màu sau lỗ rách: phố cổ ven sông ----------
RIVER = (-1.2, 4.0)   # hai bờ sông theo x
WATER = clay('water', '#3FA9C9', rough=0.05, sss=0.0, bump=0.05, gloss=True)
box('water', (1.4, 26, -0.35), (5.2, 50, 0.1), WATER, bevel=0)
box('bankL', (-8, 26, -0.15), (13.6, 50, 0.3), clay('stoneL', '#D9B98E', bump=0.6), bevel=0.05)
box('bankR', (11, 26, -0.15), (14, 50, 0.3), clay('stoneR', '#D9B98E', bump=0.6), bevel=0.05)
for y in range(3, 48, 2):
    box('kerbL', (RIVER[0] - 0.15, y + 0.5, 0.05), (0.3, 1.9, 0.25), clay('kerb', '#C9A57A'), bevel=0.05)
    box('kerbR', (RIVER[1] + 0.15, y + 0.5, 0.05), (0.3, 1.9, 0.25), clay('kerb', '#C9A57A'), bevel=0.05)

def hbox(s, xf, c, size, mat, bevel=0.05, tilt=0.0):
    # c = (a dọc phố, d nhô ra phía sông, z); size = (dài dọc phố, nhô, cao)
    a, d, z = c
    ob = box('h', (xf + s * d, a, z), (size[1], size[0], size[2]), mat, bevel=bevel)
    if tilt:
        ob.rotation_euler = (0, s * tilt, 0)
    return ob

WALLS = ['#EDC14E', '#E9B23C', '#F2CF6A', '#E7A24A', '#F0C35A', '#8CC9B9']
SHUT = ['#2E8C7F', '#3D6E9E', '#7A4A2A', '#2E9C93']
LAN = ['#E2452D', '#F2B532', '#C23A6A', '#F06B2F', '#7B4BB0', '#E8333A']

def house(s, xf, a0, L, h, wall, shut):
    a = a0 + L / 2
    hbox(s, xf, (a, -1.6, h / 2), (L, 3.2, h), clay('w' + wall, wall, bump=0.7), bevel=0.06)
    # mái ngói hai mái, dốc ra phía sông
    for k in range(2 if h > 4 else 1):
        rz = h + 0.15 if k == 0 else 3.0
        r = hbox(s, xf, (a, 0.35 if k else -0.5, rz), (L + 0.3, 3.4 if k == 0 else 1.4, 0.16), clay('roof', '#C25A3C', bump=0.9), bevel=0.04, tilt=-0.42 if k == 0 else -0.3)
        for q in range(int(L / 0.32)):
            hbox(s, xf, (a0 + 0.16 + q * 0.32, 0.35 if k else -0.5, rz - 0.08), (0.1, 3.4 if k == 0 else 1.4, 0.06), clay('roofl', '#A94A30'), bevel=0.02, tilt=-0.42 if k == 0 else -0.3)
    # cửa sổ tầng trên, cửa gỗ tầng dưới
    for fx in (0.25, 0.75):
        wa = a0 + L * fx
        hbox(s, xf, (wa, 0.02, 3.9), (0.6, 0.1, 0.9), clay('dark', '#3A2A20'), bevel=0.02)
        for sd in (-1, 1):
            hbox(s, xf, (wa + sd * 0.45, 0.08, 3.9), (0.28, 0.06, 0.94), clay('s' + shut, shut), bevel=0.02)
    for q in range(3):
        hbox(s, xf, (a0 + L * (0.2 + 0.3 * q), 0.03, 1.1), (0.55, 0.08, 2.0), clay('door', '#6B3F22', bump=0.6), bevel=0.02)
    # ban công gỗ + hoa giấy rủ
    hbox(s, xf, (a, 0.45, 3.2), (L * 0.9, 0.9, 0.08), clay('wood', '#7A4A2A'), bevel=0.02)
    hbox(s, xf, (a, 0.88, 3.45), (L * 0.9, 0.05, 0.05), clay('wood', '#7A4A2A'), bevel=0.01)
    for q in range(int(L * 4)):
        aa = a0 + 0.1 + q * L / (L * 4)
        hbox(s, xf, (aa, 0.88, 3.33), (0.03, 0.03, 0.25), clay('wood', '#7A4A2A'), bevel=0)
    if random.random() < 0.7:
        for q in range(22):
            aa = a0 + random.uniform(0.1, L - 0.1); zz = 3.4 - abs(random.gauss(0, 0.6))
            ball('hg', (xf + s * random.uniform(0.6, 1.0), aa, zz), random.uniform(0.09, 0.14), clay('hg', random.choice(['#E6529A', '#F06BAA', '#D93F86', '#F28BC0'])), seg=12)
        for q in range(8):
            ball('hgl', (xf + s * random.uniform(0.5, 0.95), a0 + random.uniform(0.1, L - 0.1), 3.4 - abs(random.gauss(0, 0.4))), (0.12, 0.12, 0.08), clay('hgl', '#4E8E3C'), seg=12)
    # đèn lồng dưới mái hiên
    for q in range(3):
        aa = a0 + L * (0.2 + 0.3 * q)
        ball('lan', (xf + s * 1.3, aa, 2.35), (0.2, 0.2, 0.26), clay('l', random.choice(LAN), sss=0.6), seg=20)
        ball('lant', (xf + s * 1.3, aa, 2.05), (0.04, 0.04, 0.1), clay('tas', '#F2B532'), seg=10)
    # mái hiên vải dưới tầng
    hbox(s, xf, (a, 0.9, 2.65), (L * 0.85, 1.8, 0.06), clay('awn', random.choice(['#E2452D', '#2E9C93', '#F2B532'])), bevel=0.02, tilt=-0.3)

for side, xf in ((1, RIVER[0] - 1.6), (-1, RIVER[1] + 1.6)):
    a = 2.2
    while a < 44:
        L = random.uniform(2.6, 3.8); h = random.uniform(4.6, 6.4)
        house(side, xf, a, L, h, random.choice(WALLS), random.choice(SHUT))
        a += L + 0.08

# cây phượng và cây xanh hai bờ
def tree(x, y, h, flowers):
    rod('trunk', (x, y, 0), (x + 0.2, y, h * 0.6), 0.2, clay('bark', '#7A5534'))
    for k in range(8):
        cx = x + random.uniform(-1.5, 1.5); cz = h * 0.78 + random.uniform(-0.5, 0.8); s = random.uniform(0.8, 1.25)
        ball('cano', (cx, y + random.uniform(-1, 1), cz), (s, s, s * 0.8), clay('leaf' + str(k % 3), ['#4F9A45', '#62B04F', '#3F8A3E'][k % 3], bump=0.9), seg=24, lump=0.12)
        if flowers:
            for q in range(14):
                ball('ph', (cx + random.uniform(-s, s) * 0.85, y - s * 0.7 + random.uniform(-0.3, 0.3), cz + random.uniform(-s, s) * 0.6), 0.09, clay('ph', random.choice(['#E2452D', '#F0622F', '#D8351F'])), seg=10)
tree(-3.0, 6.5, 6.5, True)
tree(5.8, 9.0, 6.0, False)
tree(-3.2, 17, 6.0, False)
tree(6.0, 21, 6.5, True)

for k in range(26):
    side = random.choice((-1, 1)); x = (RIVER[0] - 0.6) if side < 0 else (RIVER[1] + 0.6); y = random.uniform(3, 30)
    box('cpot', (x, y, 0.3), (0.5, 0.5, 0.5), clay('cpot', random.choice(['#C2643F', '#2E9C93', '#3D6E9E'])), bevel=0.08)
    ball('cbush', (x, y, 0.85), (0.5, 0.5, 0.45), clay('leaf1', '#62B04F', bump=0.9), seg=20, lump=0.1)
    for q in range(5):
        ball('cfl', (x + random.uniform(-0.35, 0.35), y + random.uniform(-0.35, 0.35), 0.9 + random.uniform(-0.1, 0.35)), 0.07, clay('fl', random.choice(['#F28BA8', '#F7D04A', '#FFFFFF', '#E2452D'])), seg=10)
for k in range(30):
    x = random.uniform(RIVER[0] + 0.3, RIVER[1] - 0.3); y = random.uniform(3.5, 25)
    if abs(x - 1.4) < 0.9 and random.random() < 0.7:
        continue
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=random.uniform(0.18, 0.32), depth=0.03, location=(x, y, -0.28))
    bpy.context.active_object.data.materials.append(clay('lotus', '#5FA84E'))
    if random.random() < 0.3:
        ball('lotusf', (x, y, -0.18), (0.1, 0.1, 0.12), clay('lotf', '#F49AC1'), seg=12)

# dây đèn lồng giăng ngang sông (kiểu Hội An)
for y, zt in [(5.5, 6.8), (10.0, 6.4), (15.5, 6.2), (22.0, 6.0)]:
    pts = [Vector((RIVER[0] - 0.9 + (RIVER[1] - RIVER[0] + 1.8) * t / 20, y, zt - 1.0 * math.sin(math.pi * t / 20))) for t in range(21)]
    for p0, p1 in zip(pts, pts[1:]):
        rod('cord', p0, p1, 0.012, clay('cord', '#2E2A27'))
    for p in pts[1:-1:2]:
        ball('lan2', (p.x, p.y, p.z - 0.3), (0.17, 0.17, 0.22), clay('l', random.choice(LAN), sss=0.6), seg=16)

# thuyền nhỏ có đèn trên sông
def boat(x, y, col):
    b = ball('boat', (x, y, -0.2), (0.55, 1.6, 0.3), clay('boat', '#6B3F22'), seg=24)
    box('boatin', (x, y, 0.0), (0.7, 2.4, 0.1), clay('boati', '#A87A4A'), bevel=0.05)
    for k in (-0.6, 0.5):
        ball('blan', (x, y + k, 0.35), (0.14, 0.14, 0.17), clay('l', col, sss=0.6), seg=14)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.35, depth=0.25, location=(x, y + 0.1, 0.35))
    bpy.context.active_object.data.materials.append(clay('non', '#E8CF8F'))
boat(1.0, 8.5, '#E2452D')
boat(2.2, 16.0, '#F2B532')

# cầu vòm đá phía xa
for k in range(13):
    t = k / 12; x = RIVER[0] - 0.5 + (RIVER[1] - RIVER[0] + 1) * t; z = 1.0 + 1.0 * math.sin(math.pi * t)
    box('bridge', (x, 30, z), (0.5, 1.6, 0.35), clay('brg', '#E0C092'), bevel=0.05)
box('bridgeRoof', (1.4, 30, 3.1), (5.0, 2.0, 0.25), clay('roof', '#C25A3C'), bevel=0.05)
for x in (-1.0, 3.8):
    rod('bp', (x, 30, 0), (x, 30, 3.0), 0.12, clay('brp', '#9B3E2A'))

# đồi xanh và trời
for k in range(10):
    x = random.uniform(-16, 18); s = random.uniform(4, 8)
    ball('hill', (x, 52 + random.uniform(0, 6), 0.5), (s, s * 0.6, s * 0.55), clay('hill', random.choice(['#7DBE6A', '#6CB25E', '#8FCB78'])), seg=24, lump=0.2)
sky = bpy.data.materials.new('sky'); sky.use_nodes = True
nt = sky.node_tree; n = nt.nodes; l = nt.links
n.remove(n['Principled BSDF'])
em = n.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1.6
tc = n.new('ShaderNodeTexCoord'); sep = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Generated'], sep.inputs[0])
cr = n.new('ShaderNodeValToRGB')
cr.color_ramp.elements[0].color = srgb('#FFE7B8'); cr.color_ramp.elements[1].color = srgb('#5FA8E8')
cr.color_ramp.elements[0].position = 0.25; cr.color_ramp.elements[1].position = 0.75
l.new(sep.outputs['Y'], cr.inputs['Fac']); l.new(cr.outputs['Color'], em.inputs['Color'])
l.new(em.outputs['Emission'], n['Material Output'].inputs['Surface'])
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 62, 12)); sp = bpy.context.active_object
sp.scale = (120, 40, 1); sp.rotation_euler = (math.radians(90), 0, 0); sp.data.materials.append(sky)
for (cx, cz, s) in [(-6, 13, 3.2), (4, 15, 2.6), (12, 12, 3.4), (-14, 11, 2.8)]:
    for q in range(7):
        ball('cloud', (cx + random.uniform(-1.3, 1.3) * s, 58, cz + random.uniform(-0.3, 0.5) * s), (s * random.uniform(0.55, 0.9),) * 2 + (s * 0.5,),
             clay('cloud', '#FFFAF2', sss=0.5, bump=0.1), seg=24, lump=0.05)

# ---------- Tò và tấm giấy đang bóc ----------
s = 0.68
to = build_to(root_loc=(-3.3, -6.0, 0.0), lean=-0.25, arms='grab', turn=math.radians(62))
to.scale = (s, s, s)
bpy.context.view_layer.update()
hands = [o for o in to.children if o.name.startswith('hand')]
hp = sum((o.matrix_world.translation for o in hands), Vector()) / len(hands)

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return p0 * u ** 3 + p1 * 3 * u * u * t + p2 * 3 * u * t * t + p3 * t ** 3

# tấm bóc: gốc ở mép dưới-trái lỗ rách trên tường, đổ xuống đất, cuộn một vòng rồi lên tay Tò
P0 = Vector((-2.9, WY - 0.06, 0.9)); P1 = Vector((-1.6, -0.8, 3.6)); P2 = Vector((-0.4, -4.4, 3.2)); P3 = hp + Vector((0.3, 0.05, 0.05))
me = bpy.data.meshes.new('flap'); bm = bmesh.new()
N, M = 64, 22
grid = []
for i in range(N + 1):
    t = i / N
    p = bez(P0, P1, P2, P3, t)
    tang = (bez(P0, P1, P2, P3, min(1, t + 0.01)) - bez(P0, P1, P2, P3, max(0, t - 0.01))).normalized()
    side = tang.cross(Vector((0, 0, 1)))
    if side.length < 0.1:
        side = Vector((1, 0, 0))
    side.normalize()
    wid = 4.2 * (1 - 0.8 * t ** 1.1)
    row = []
    for j in range(M + 1):
        u = j / M - 0.5
        jag = random.uniform(-0.07, 0.07) if j in (0, M) else 0
        q = p + side * (u * wid + jag)
        q.z += 0.25 * math.sin(u * math.pi * 2 + t * 6) * t   # gợn sóng giấy
        row.append(bm.verts.new(q))
    grid.append(row)
for i in range(N):
    for j in range(M):
        bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
bm.to_mesh(me); bm.free()
flap = bpy.data.objects.new('flap', me); sc.collection.objects.link(flap)
for p in me.polygons: p.use_smooth = True
so = flap.modifiers.new('so', 'SOLIDIFY'); so.thickness = 0.06
sb = flap.modifiers.new('sub', 'SUBSURF'); sb.levels = 1; sb.render_levels = 2
flap.data.materials.append(clay('flapc', '#EFEAE0', rough=0.85, bump=0.8)); flap.data.materials.append(clay('flapg', '#B3ADA4', rough=0.85, bump=0.8)); so.material_offset = 1

# mảnh giấy bay, cánh hoa và đốm nắng gần lỗ rách
for k in range(12):
    x = random.uniform(-5, 7); y = random.uniform(-3, 0.8); z = random.uniform(0.6, 7.5)
    if inside(x, z, 1.1) or random.random() < 0.4:
        box('flake', (x, y, z), (random.uniform(0.12, 0.3), 0.025, random.uniform(0.1, 0.22)), clay('flk', '#E2DDD3'), bevel=0.01,
            rot=(random.uniform(0, 3), random.uniform(0, 3), random.uniform(0, 3)))
for k in range(14):
    x = random.uniform(-2, 5); y = random.uniform(-1.5, 0.8); z = random.uniform(1.5, 6.5)
    pt = ball('petal', (x, y, z), (0.07, 0.02, 0.05), clay('pt', random.choice(['#F28BA8', '#F7D04A', '#E2452D', '#FFFFFF'])), seg=10)
    pt.rotation_euler = (random.uniform(0, 3), random.uniform(0, 3), random.uniform(0, 3))
glow = bpy.data.materials.new('glow'); glow.use_nodes = True
gn = glow.node_tree.nodes; gn.remove(gn['Principled BSDF'])
ge = gn.new('ShaderNodeEmission'); ge.inputs['Color'].default_value = srgb('#FFE9A8'); ge.inputs['Strength'].default_value = 8
glow.node_tree.links.new(ge.outputs[0], gn['Material Output'].inputs['Surface'])
for k in range(26):
    ang = random.uniform(0, 2 * math.pi); rr = random.uniform(0.6, 1.1)
    x = HC[0] + HR[0] * rr * math.cos(ang); z = HC[1] + HR[1] * rr * math.sin(ang)
    if z > 0.5:
        ball('spark', (x, random.uniform(-0.5, 0.8), z), 0.035, glow, seg=8)

# ---------- ánh sáng, máy quay ----------
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 5.5; sun.color = (1.0, 0.86, 0.66); sun.angle = math.radians(4)
so_ = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so_)
so_.rotation_euler = (math.radians(52), math.radians(-14), math.radians(205))   # nắng từ phía sau-trái chiếu tới
area('key', (-6, -12, 7), (-2, 0, 2), 1500, (1.0, 0.93, 0.85), 10)
area('fill', (7, -10, 4), (2, 0, 2), 900, (0.85, 0.9, 1.0), 10)
area('holeglow', (1.4, 3.0, 4.0), (0, -6, 2), 1500, (1.0, 0.9, 0.7), 8)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = srgb('#CFE3F5')
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam)
cam.location = (0.6, -13.0, 2.3); look_at(cam, (0.6, 2.0, 3.4))
cam.data.lens = 24
cam.data.dof.use_dof = True; cam.data.dof.focus_object = to; cam.data.dof.aperture_fstop = 4.0
sc.camera = cam

cycles(sc, W, H, S)
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
if len(sys.argv) > 5:
    bpy.ops.wm.save_as_mainfile(filepath=sys.argv[5])
