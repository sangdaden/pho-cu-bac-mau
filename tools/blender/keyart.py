import sys, os, bpy, bmesh, math, random
sys.path.insert(0, os.path.dirname(__file__))
from clay import *
from mathutils import Vector

out = sys.argv[1]; W = int(sys.argv[2]); H = int(sys.argv[3]); S = int(sys.argv[4])
reset()
sc = bpy.context.scene
random.seed(7)

F0 = -0.6          # đường ranh bóc trên mặt đất: trái còn xám, phải đã có màu
FY = 3.0           # mặt tiền nhà
GREY = '#A8A39C'


def box(name, c, size, mat, bevel=0.06, lump=0.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=c)
    ob = bpy.context.active_object; ob.name = name; ob.scale = size
    bpy.ops.object.transform_apply(scale=True)
    ob.data.materials.append(mat)
    b = ob.modifiers.new('bv', 'BEVEL'); b.width = bevel; b.segments = 4; b.limit_method = 'NONE'
    if lump:
        r = ob.modifiers.new('rm', 'SUBSURF'); r.subdivision_type = 'SIMPLE'; r.levels = 2; r.render_levels = 3
        d = ob.modifiers.new('lump', 'DISPLACE')
        t = bpy.data.textures.get('blump') or bpy.data.textures.new('blump', 'CLOUDS'); t.noise_scale = 0.6
        d.texture = t; d.strength = lump; d.texture_coords = 'GLOBAL'
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def M(hexcol, grey, **kw):
    return clay(('g_' if grey else 'c_') + hexcol, GREY if grey else hexcol, **kw)


def house(x0, w, h, col, shutter, grey, roof=False, lantern=False, awning='#C8402E'):
    cx = x0 + w / 2
    box('wall', (cx, FY + 1.5, h / 2), (w, 3.0, h), M(col, grey))
    # mái ngói hoặc tường chắn mái
    if roof:
        bpy.ops.mesh.primitive_cylinder_add(vertices=3, radius=1.1, depth=w + 0.3, location=(cx, FY + 1.2, h + 0.35))
        r = bpy.context.active_object; r.rotation_euler = (math.radians(90), 0, math.radians(90)); r.scale = (1, 0.55, 1)
        r.data.materials.append(M('#C9694A', grey, bump=0.7))
        b = r.modifiers.new('bv', 'BEVEL'); b.width = 0.08; b.segments = 3
    else:
        box('parapet', (cx, FY - 0.05, h + 0.12), (w + 0.12, 0.35, 0.28), M('#E9DCC4', grey))
    # các tầng: cửa sổ + chớp + ban công
    floors = int((h - 2.2) // 1.7)
    for f in range(floors):
        zc = 2.9 + f * 1.7
        for fx in (0.28, 0.72):
            wx = x0 + w * fx
            box('win', (wx, FY - 0.02, zc), (0.5, 0.12, 0.8), M('#3A2E28', grey), bevel=0.03, lump=0)
            for s in (-1, 1):
                sh = box('shutter', (wx + s * 0.4, FY - 0.12, zc), (0.26, 0.06, 0.82), M(shutter, grey), bevel=0.03, lump=0.004)
                sh.rotation_euler = (0, 0, s * 0.35)
        box('balcony', (cx, FY - 0.3, zc - 0.62), (w * 0.86, 0.6, 0.1), M('#E9DCC4', grey), bevel=0.03)
        box('rail', (cx, FY - 0.58, zc - 0.36), (w * 0.86, 0.05, 0.05), M('#2E2A27', grey), bevel=0.02, lump=0)
        for k in range(9):
            rx = x0 + w * 0.07 + k * w * 0.86 / 8
            box('bar', (rx, FY - 0.58, zc - 0.47), (0.035, 0.035, 0.24), M('#2E2A27', grey), bevel=0.01, lump=0)
        if f % 2 == 0:
            for k in range(2):
                px = x0 + w * (0.15 + 0.7 * k)
                box('pot', (px, FY - 0.4, zc - 0.42), (0.22, 0.22, 0.2), M('#B5603F', grey), bevel=0.04, lump=0)
                blob('plant', (px, FY - 0.4, zc - 0.15), (0.24, 0.22, 0.22), M('#5E9E4A', grey, bump=0.8), lump=0.06)
    # tầng trệt: cửa hàng + mái hiên
    box('door', (cx, FY - 0.02, 1.0), (w * 0.6, 0.1, 2.0), M('#5A3B27', grey), bevel=0.03, lump=0)
    aw = box('awning', (cx, FY - 0.55, 2.15), (w * 0.84, 1.1, 0.07), M(awning, grey), bevel=0.03)
    aw.rotation_euler = (-0.35, 0, 0)
    for k in range(int(w * 0.84 / 0.3)):
        if k % 2:
            continue
        st = box('stripe', (x0 + w * 0.08 + k * 0.3 + 0.15, FY - 0.56, 2.19), (0.15, 1.12, 0.02), M('#F3E7D3', grey), bevel=0.01, lump=0)
        st.rotation_euler = (-0.35, 0, 0)
    if lantern:
        for k, lx in enumerate((cx - w * 0.3, cx + w * 0.3)):
            box('cord', (lx, FY - 0.9, 2.95), (0.02, 0.02, 0.5), M('#2E2A27', grey), bevel=0.005, lump=0)
            lb = blob('lantern', (lx, FY - 0.9, 2.5), (0.22, 0.22, 0.28), M('#D23A26', grey, sss=0.4), lump=0.01)
            if not grey:
                bpy.ops.object.light_add(type='POINT', location=(lx, FY - 1.3, 2.5)); bpy.context.active_object.data.energy = 25; bpy.context.active_object.data.color = (1, 0.55, 0.3)
            blob('tassel', (lx, FY - 0.9, 2.12), (0.05, 0.05, 0.12), M('#E8A41A', grey), lump=0)


# nhà: x0, rộng, cao, màu, màu chớp
houses = [(-12.6, 3.0, 5.6, '#E3A21A', '#2E9C93', True, False), (-9.6, 2.6, 7.0, '#D9826B', '#F1E2C6', False, True),
          (-7.0, 3.2, 6.2, '#2E9C93', '#F1E2C6', True, False), (-3.8, 3.2, 7.4, '#F1E2C6', '#2E9C93', False, True),
          (-0.6, 3.0, 6.0, '#E3A21A', '#2E9C93', True, True), (2.4, 2.8, 7.2, '#2E9C93', '#F1E2C6', False, False),
          (5.2, 3.0, 5.8, '#D9826B', '#2E9C93', True, True), (8.2, 3.4, 6.8, '#F1E2C6', '#C8402E', False, False)]
for x0, w, h, col, sh, roof, lan in houses:
    house(x0, w, h, col, sh, grey=(x0 + w <= F0 + 0.01), roof=roof, lantern=lan)

# vỉa hè có màu (phải) và lớp xám dày trên vỉa hè bên trái
box('walk', (6, 0, -0.1), (16, 7, 0.2), clay('tile', '#D9A07C', bump=0.6), bevel=0.04, lump=0)
box('walkL', (-9, 0, -0.1), (16.8, 7, 0.2), clay('g_tile', GREY), bevel=0.04, lump=0)
for k in range(-12, 13):
    box('seam', (k * 0.9 + 0.45, 0, 0.0), (0.03, 7, 0.02), clay('seam', '#B47B5A'), bevel=0.005, lump=0) if k * 0.9 > F0 else None

# lớp lịch xám: tấm dày trên đất, mép rách ở F0
me = bpy.data.meshes.new('greyground'); bm = bmesh.new()
pts = []
for i in range(41):
    y = -3.4 + i * 0.17
    pts.append((F0 + random.uniform(-0.12, 0.12), y))
vs = [bm.verts.new((-14, -3.4, 0.0)), ]
outline = [(-14, -3.4)] + [(x, y) for x, y in pts] + [(-14, 3.4)]
f = bm.faces.new([bm.verts.new((x, y, 0.02)) for x, y in outline])
bm.verts.remove(vs[0])
ext = bmesh.ops.extrude_face_region(bm, geom=[f])
for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]:
    v.co.z += 0.24
bm.to_mesh(me); bm.free()
gg = bpy.data.objects.new('greyground', me); sc.collection.objects.link(gg)
gg.data.materials.append(clay('paper_grey', '#B3AEA6', rough=0.85, bump=0.6))
b = gg.modifiers.new('bv', 'BEVEL'); b.width = 0.03; b.segments = 2

# mép rách trên mặt tiền: lớp xám dày phủ nhà bên trái, mép lởm chởm ở x = F0
me = bpy.data.meshes.new('greywall'); bm = bmesh.new()
edge = [(F0 + random.uniform(-0.15, 0.15), z * 0.25) for z in range(0, 33)]
poly = [(F0 - 0.5, 0)] + edge + [(F0 - 0.5, 8.2)]
fw = bm.faces.new([bm.verts.new((x, FY - 0.06, z)) for x, z in poly])
ext = bmesh.ops.extrude_face_region(bm, geom=[fw])
for v in [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]:
    v.co.y -= 0.08
bm.to_mesh(me); bm.free()
gw = bpy.data.objects.new('greywall', me); sc.collection.objects.link(gw)
gw.data.materials.append(clay('paper_grey2', '#B9B4AC', rough=0.85, bump=0.6))

# Tò: nắm mép, ngả người, đi lùi sang trái
s = 0.8
to = build_to(root_loc=(F0 - 3.3, -2.1, 0.26), lean=-0.3, arms='grab', turn=math.radians(70))
to.scale = (s, s, s)
bpy.context.view_layer.update()
hands = [o for o in to.children if o.name.startswith('hand')]
hp = sum((o.matrix_world.translation for o in hands), Vector()) / len(hands)

# tấm lịch đang bóc: từ mép đất cong lên rồi gập về tay Tò
def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return p0 * u ** 3 + p1 * 3 * u * u * t + p2 * 3 * u * t * t + p3 * t ** 3

P0 = Vector((F0 + 0.05, 0, 0.26)); P1 = Vector((F0 + 0.9, 0, 2.6)); P2 = Vector((F0 - 1.0, 0, 3.6)); P3 = Vector((hp.x + 0.15, 0, hp.z + 0.05))
me = bpy.data.meshes.new('flap'); bm = bmesh.new()
N, Mw = 40, 16
y0, y1 = -3.4, 2.6
grid = []
for i in range(N + 1):
    t = i / N
    p = bez(P0, P1, P2, P3, t)
    row = []
    for j in range(Mw + 1):
        y = y0 + (y1 - y0) * j / Mw
        # đầu tấm hẹp lại về phía tay
        y = hp.y + (y - hp.y) * (1 - 0.75 * t ** 1.5)
        jag = random.uniform(-0.05, 0.05) if j in (0, Mw) else 0
        row.append(bm.verts.new((p.x, y + jag, p.z)))
    grid.append(row)
for i in range(N):
    for j in range(Mw):
        bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
bm.to_mesh(me); bm.free()
flap = bpy.data.objects.new('flap', me); sc.collection.objects.link(flap)
for p in me.polygons: p.use_smooth = True
so = flap.modifiers.new('so', 'SOLIDIFY'); so.thickness = 0.2; so.offset = 0
sb = flap.modifiers.new('sub', 'SUBSURF'); sb.levels = 1; sb.render_levels = 2
flap.data.materials.append(clay('paper_grey3', '#C7C2BA', rough=0.85, bump=0.7))

# số "14" đỏ phai trên mặt sau tờ lịch
bpy.ops.object.text_add(location=bez(P0, P1, P2, P3, 0.42) + Vector((0, 0, 0.1)))
tx = bpy.context.active_object; tx.data.body = '14'; tx.data.size = 0.9; tx.data.align_x = 'CENTER'; tx.data.extrude = 0.02
tx.rotation_euler = (math.radians(70), 0, math.radians(-90 + 0)); tx.data.materials.append(clay('faded_red', '#B8584A'))
tx.hide_render = True

# lũ bụi nấp ở mép rách
for k, (bx, by, r) in enumerate([(F0 - 0.45, -3.0, 0.3), (F0 - 0.3, -0.6, 0.24), (F0 - 1.6, -3.3, 0.2)]):
    bd = blob(f'bui{k}', (bx, by, 0.26 + r), (r, r, r * 0.9), clay('bui', '#9C978F', rough=1.0, bump=1.0), lump=r * 0.5)
    bd.modifiers['sub'].render_levels = 3
    for sgn in (-1, 1):
        blob('bui_eye', (bx + sgn * r * 0.4, by - r * 0.88, 0.26 + r * 1.1), (r * 0.16, r * 0.1, r * 0.22), clay('to_ink', '#15110F', gloss=True), lump=0)

# bên đã bóc: vài thứ sống lại
for k, (px, py) in enumerate([(1.2, -2.2), (3.8, -1.6), (6.6, -2.4)]):
    box('bigpot', (px, py, 0.3), (0.5, 0.5, 0.6), clay('pot2', '#C2643F'), bevel=0.08)
    blob('bush', (px, py, 0.95), (0.55, 0.5, 0.5), clay('leaf', '#4F9A45', bump=0.9), lump=0.12)
    for q in range(5):
        blob('flower', (px + random.uniform(-0.4, 0.4), py - 0.35, 0.9 + random.uniform(-0.2, 0.35)), (0.08, 0.08, 0.08), clay('fl', random.choice(['#F28BA8', '#F7D04A', '#FFFFFF'])), lump=0)
# đèn ông sao trên cây sào
bpy.ops.mesh.primitive_circle_add(vertices=10, radius=0.6, fill_type='NGON', location=(0, 0, 0))
st = bpy.context.active_object
for i, v in enumerate(st.data.vertices[:10]):
    if i % 2:
        v.co *= 0.45
st.rotation_euler = (math.radians(90), 0, 0); st.location = (2.9, -1.0, 3.1)
so2 = st.modifiers.new('so', 'SOLIDIFY'); so2.thickness = 0.12
b2 = st.modifiers.new('bv', 'BEVEL'); b2.width = 0.03
st.data.materials.append(clay('star', '#F2B532', sss=0.5))
rod('pole', (2.9, -1.0, 0.0), (2.9, -1.0, 2.55), 0.04, clay('bamboo', '#C99A52'))

# trời chiều hồng cam + nắng thấp
sky = bpy.data.materials.new('sky'); sky.use_nodes = True
nt = sky.node_tree; n = nt.nodes; l = nt.links
n.remove(n['Principled BSDF'])
em = n.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1.3
tc = n.new('ShaderNodeTexCoord'); sep = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Generated'], sep.inputs[0])
cr = n.new('ShaderNodeValToRGB')
cr.color_ramp.elements[0].color = srgb('#F29A6B'); cr.color_ramp.elements[1].color = srgb('#8FB8E0')
cr.color_ramp.elements[0].position = 0.35
l.new(sep.outputs['Y'], cr.inputs['Fac']); l.new(cr.outputs['Color'], em.inputs['Color'])
l.new(em.outputs['Emission'], n['Material Output'].inputs['Surface'])
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 14, 6)); sp = bpy.context.active_object
sp.scale = (70, 30, 1); sp.rotation_euler = (math.radians(90), 0, 0); sp.data.materials.append(sky)

sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 6.0; sun.color = (1.0, 0.72, 0.48); sun.angle = math.radians(6)
so_ = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so_)
so_.rotation_euler = (math.radians(58), math.radians(-8), math.radians(-38))
area('fill', (-3, -9, 5), (0, 1, 2), 900, (0.8, 0.86, 1.0), 8)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = srgb('#F2C7A6')
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.45

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam)
cam.location = (-1.0, -14.5, 4.4); look_at(cam, (0.1, 0.5, 2.9))
cam.data.lens = 28
cam.data.dof.use_dof = True; cam.data.dof.focus_object = to; cam.data.dof.aperture_fstop = 5.6
sc.camera = cam

cycles(sc, W, H, S)
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
if len(sys.argv) > 5:
    bpy.ops.wm.save_as_mainfile(filepath=sys.argv[5])
