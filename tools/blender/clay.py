"""Thư viện dựng nhân vật Tò và vật liệu đất sét cho Phố Cũ Bạc Màu (Blender 5.x, chạy bằng bpy)."""
import bpy, bmesh, math
from mathutils import Vector


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


_mats = {}


def clay(name, hexcol, rough=0.55, sss=0.12, bump=0.45, gloss=False, print_at=None):
    """Vật liệu đất sét: hạt nhám, vết ấn ngón tay, lốm đốm màu nhẹ."""
    key = (name, hexcol)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    n, l = nt.nodes, nt.links
    bsdf = n['Principled BSDF']
    base = srgb(hexcol)
    bsdf.inputs['Roughness'].default_value = 0.18 if gloss else rough
    bsdf.inputs['Subsurface Weight'].default_value = sss
    bsdf.inputs['Subsurface Radius'].default_value = (0.25, 0.12, 0.08)
    bsdf.inputs['Subsurface Scale'].default_value = 0.08
    tc = n.new('ShaderNodeTexCoord')
    # màu lốm đốm
    nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 4
    l.new(tc.outputs['Object'], nz.inputs['Vector'])
    mix = n.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
    mix.inputs['Factor'].default_value = 0.18
    mix.inputs['A'].default_value = base
    l.new(nz.outputs['Color'], mix.inputs['B'])
    # nâng sáng lại cho khỏi tối đi vì multiply
    bc = n.new('ShaderNodeBrightContrast'); bc.inputs['Bright'].default_value = 0.0
    l.new(mix.outputs['Result'], bc.inputs['Color'])
    l.new(bc.outputs['Color'], bsdf.inputs['Base Color'])
    if gloss:
        return _finish(m, key)
    # hạt nhám mịn
    grain = n.new('ShaderNodeTexNoise'); grain.inputs['Scale'].default_value = 180; grain.inputs['Detail'].default_value = 2
    l.new(tc.outputs['Object'], grain.inputs['Vector'])
    # vết ngón tay: voronoi kéo dài thành vệt cong
    vor = n.new('ShaderNodeTexVoronoi'); vor.feature = 'SMOOTH_F1'; vor.inputs['Scale'].default_value = 2.2
    l.new(tc.outputs['Object'], vor.inputs['Vector'])
    # vân tay dạng sóng vòng
    wave = n.new('ShaderNodeTexWave'); wave.wave_type = 'RINGS'; wave.inputs['Scale'].default_value = 9
    wave.inputs['Distortion'].default_value = 3; wave.inputs['Detail'].default_value = 2
    l.new(tc.outputs['Object'], wave.inputs['Vector'])
    wmask = n.new('ShaderNodeTexNoise'); wmask.inputs['Scale'].default_value = 1.4
    l.new(tc.outputs['Object'], wmask.inputs['Vector'])
    ramp = n.new('ShaderNodeMapRange'); ramp.inputs['From Min'].default_value = 0.55; ramp.inputs['From Max'].default_value = 0.7
    l.new(wmask.outputs['Fac'], ramp.inputs['Value'])
    wm = n.new('ShaderNodeMath'); wm.operation = 'MULTIPLY'
    l.new(wave.outputs['Fac'], wm.inputs[0]); l.new(ramp.outputs['Result'], wm.inputs[1])
    add1 = n.new('ShaderNodeMath'); add1.operation = 'MULTIPLY_ADD'
    l.new(vor.outputs['Distance'], add1.inputs[0]); add1.inputs[1].default_value = 0.6
    wsc = n.new('ShaderNodeMath'); wsc.operation = 'MULTIPLY'; wsc.inputs[1].default_value = 0.3
    l.new(wm.outputs['Value'], wsc.inputs[0]); l.new(wsc.outputs['Value'], add1.inputs[2])
    add2 = n.new('ShaderNodeMath'); add2.operation = 'MULTIPLY_ADD'
    l.new(grain.outputs['Fac'], add2.inputs[0]); add2.inputs[1].default_value = 0.5; l.new(add1.outputs['Value'], add2.inputs[2])
    if print_at is not None:
        # dấu ngón cái của Bà Năm: vòng vân tay lõm trong một vùng tròn
        dist = n.new('ShaderNodeVectorMath'); dist.operation = 'DISTANCE'
        dist.inputs[1].default_value = print_at
        l.new(tc.outputs['Object'], dist.inputs[0])
        msk = n.new('ShaderNodeMapRange'); msk.inputs['From Min'].default_value = 0.22; msk.inputs['From Max'].default_value = 0.16
        l.new(dist.outputs['Value'], msk.inputs['Value'])
        rings = n.new('ShaderNodeTexWave'); rings.wave_type = 'RINGS'; rings.rings_direction = 'SPHERICAL'
        rings.inputs['Scale'].default_value = 26; rings.inputs['Distortion'].default_value = 1.2
        sub = n.new('ShaderNodeVectorMath'); sub.operation = 'SUBTRACT'; sub.inputs[1].default_value = print_at
        l.new(tc.outputs['Object'], sub.inputs[0]); l.new(sub.outputs['Vector'], rings.inputs['Vector'])
        dip = n.new('ShaderNodeMath'); dip.operation = 'MULTIPLY_ADD'
        l.new(rings.outputs['Fac'], dip.inputs[0]); dip.inputs[1].default_value = 0.35; dip.inputs[2].default_value = -0.9
        dm = n.new('ShaderNodeMath'); dm.operation = 'MULTIPLY'
        l.new(dip.outputs['Value'], dm.inputs[0]); l.new(msk.outputs['Result'], dm.inputs[1])
        add3 = n.new('ShaderNodeMath'); add3.operation = 'ADD'
        l.new(add2.outputs['Value'], add3.inputs[0]); l.new(dm.outputs['Value'], add3.inputs[1])
        height = add3.outputs['Value']
    else:
        height = add2.outputs['Value']
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump; bp.inputs['Distance'].default_value = 0.02
    l.new(height, bp.inputs['Height'])
    l.new(bp.outputs['Normal'], bsdf.inputs['Normal'])
    return _finish(m, key)


def _finish(m, key):
    _mats[key] = m
    return m


_lump = None


def lumpy(obj, strength=0.025, level=2):
    """Bề mặt hơi méo như nặn tay + mịn."""
    global _lump
    if _lump is None:
        _lump = bpy.data.textures.new('lump', 'CLOUDS'); _lump.noise_scale = 0.35
    d = obj.modifiers.new('lump', 'DISPLACE'); d.texture = _lump; d.strength = strength; d.mid_level = 0.5
    d.texture_coords = 'GLOBAL'
    s = obj.modifiers.new('sub', 'SUBSURF'); s.levels = 1; s.render_levels = level
    for p in obj.data.polygons:
        p.use_smooth = True


def blob(name, loc, scale, mat, rot=(0, 0, 0), parent=None, shape=None, seg=48, lump=0.02):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=1.0)
    if shape:
        for v in bm.verts:
            v.co = shape(v.co)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    ob.location = loc; ob.scale = scale; ob.rotation_euler = rot
    ob.data.materials.append(mat)
    if parent:
        ob.parent = parent
    lumpy(ob, lump)
    return ob


def rod(name, a, b, r, mat, parent=None):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=d.length, location=(a + b) / 2)
    ob = bpy.context.active_object; ob.name = name
    ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = d.to_track_quat('Z', 'Y')
    ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.use_smooth = True
    bv = ob.modifiers.new('bv', 'BEVEL'); bv.width = r * 0.5; bv.segments = 3
    if parent:
        ob.parent = parent
    return ob


def pear(co):
    z = co.z
    k = 1.0 - 0.2 * z  # rộng ở đáy, hẹp ở vai
    if z < -0.6:
        k *= 1.0 - (-0.6 - z) * 0.5  # đáy bằng hơn
    return Vector((co.x * k, co.y * k, co.z))


def flame(co):
    z = co.z
    k = 1.0 - 0.8 * max(0.0, z) ** 1.2
    # đầu ngọn uốn cong về sau
    return Vector((co.x * k, co.y * k + 0.35 * max(0.0, z) ** 2, co.z))


def tear(co):
    z = co.z
    k = 1.0 - 0.75 * max(0.0, z) ** 1.3
    return Vector((co.x * k, co.y * k, co.z))


def build_to(root_loc=(0, 0, 0), lean=0.0, arms='rest', turn=0.0, name='To'):
    """Dựng Tò. arms: 'rest' (tay buông) hoặc 'grab' (hai tay đưa về trước nắm mép)."""
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    RED = clay('to_red', '#C23A28', print_at=(0.0, -0.78, 1.0))
    REDL = clay('to_red2', '#B4321F')
    IVORY = clay('to_ivory', '#F3D7B4', sss=0.25)
    YEL = clay('to_yellow', '#E8A41A')
    TEAL = clay('to_teal', '#2E9C93')
    PINK = clay('to_pink', '#EE8C78', sss=0.2)
    INK = clay('to_ink', '#15110F', gloss=True)
    BAMBOO = clay('bamboo', '#C99A52', rough=0.5, bump=0.4)
    BAMD = clay('bamboo_node', '#8C6631')

    body = blob('body', (0, 0, 1.0), (0.84, 0.76, 0.95), RED, parent=root, shape=pear)
    blob('legL', (-0.4, -0.08, 0.13), (0.33, 0.38, 0.19), REDL, parent=root)
    blob('legR', (0.4, -0.08, 0.13), (0.33, 0.38, 0.19), REDL, parent=root)
    head = blob('head', (0, 0, 2.72), (0.97, 0.92, 0.9), IVORY, parent=root)
    # cổ áo cánh hoa
    n = 10
    for i in range(n):
        a = 2 * math.pi * i / n
        r = 0.62
        blob(f'petal{i}', (r * math.cos(a), r * math.sin(a), 1.8), (0.25, 0.09, 0.2), YEL,
             rot=(-0.95, 0, a + math.pi / 2), parent=root, seg=32)
    # tay
    if arms == 'rest':
        for s in (-1, 1):
            blob(f'arm{s}', (s * 0.86, -0.04, 1.2), (0.2, 0.21, 0.42), RED, rot=(0, s * -0.42, 0), parent=root)
            blob(f'hand{s}', (s * 1.02, -0.1, 0.8), (0.26, 0.26, 0.26), YEL, parent=root)
    else:  # nắm mép: hai tay đưa thẳng về phía trước-trên
        for s in (-1, 1):
            blob(f'arm{s}', (s * 0.62, -0.72, 1.35), (0.19, 0.42, 0.19), RED, rot=(-0.25, 0, s * -0.25), parent=root)
            blob(f'hand{s}', (s * 0.5, -1.14, 1.45), (0.26, 0.26, 0.26), YEL, parent=root)
    # que tre sau lưng
    rod('stick', (0.25, 0.5, 0.35), (0.95, 0.75, 4.15), 0.07, BAMBOO, parent=root)
    for t in (0.62, 0.8):
        p = Vector((0.25, 0.5, 0.35)).lerp(Vector((0.95, 0.75, 4.15)), t)
        q = Vector((0.25, 0.5, 0.35)).lerp(Vector((0.95, 0.75, 4.15)), t + 0.012)
        rod('node', p, q, 0.085, BAMD, parent=root)
    # chỏm tóc ba màu như ngọn lửa
    blob('tuftC', (0, 0.0, 3.8), (0.26, 0.24, 0.55), RED, rot=(0.15, 0.1, 0), shape=flame, parent=root)
    blob('tuftL', (-0.34, 0.05, 3.62), (0.2, 0.19, 0.42), YEL, rot=(0.1, -0.6, 0), shape=flame, parent=root)
    blob('tuftR', (0.34, 0.05, 3.62), (0.2, 0.19, 0.42), TEAL, rot=(0.1, 0.6, 0), shape=flame, parent=root)
    # mặt: mắt hạt to, đốm sáng, lông mày vẽ đỏ, má hồng
    WHITE = clay('spec', '#FFFFFF', gloss=True)
    for s in (-1, 1):
        blob(f'eye{s}', (s * 0.29, -0.82, 2.66), (0.16, 0.08, 0.21), INK, rot=(0.2, 0, 0), parent=root, seg=32, lump=0)
        blob(f'spec{s}', (s * 0.29 + 0.05, -0.885, 2.74), (0.045, 0.02, 0.05), WHITE, rot=(0.2, 0, 0), parent=root, seg=16, lump=0)
        blob(f'brow{s}', (s * 0.3, -0.8, 2.95), (0.14, 0.045, 0.04), RED, rot=(0.3, s * -0.2, 0), parent=root, seg=24, lump=0)
        blob(f'cheek{s}', (s * 0.55, -0.67, 2.42), (0.19, 0.06, 0.12), PINK, rot=(0, 0, s * -0.55), parent=root, seg=24, lump=0)
    smile(root, (0, -0.86, 2.36), clay('mouth', '#7A2318'))

    root.location = root_loc
    root.rotation_euler = (lean, 0, turn)
    return root


def smile(parent, loc, mat):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.09, minor_radius=0.022, major_segments=32, minor_segments=12, location=(0, 0, 0))
    ob = bpy.context.active_object; ob.name = 'smile'
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > 0.01], context='VERTS')
    bm.to_mesh(ob.data); bm.free()
    for p in ob.data.polygons:
        p.use_smooth = True
    ob.rotation_euler = (math.radians(90) + 0.25, 0, 0)  # nằm trong mặt phẳng mặt, cong xuống
    ob.location = loc
    ob.data.materials.append(mat)
    ob.parent = parent
    return ob


def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_mode = 'QUATERNION'
    ob.rotation_quaternion = d.to_track_quat('-Z', 'Y')


def area(name, loc, target, energy, color, size):
    L = bpy.data.lights.new(name, 'AREA'); L.energy = energy; L.color = color; L.size = size
    ob = bpy.data.objects.new(name, L); bpy.context.collection.objects.link(ob)
    ob.location = loc; look_at(ob, target)
    return ob


def cycles(scene, w, h, samples):
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.resolution_x = w; scene.render.resolution_y = h
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.look = 'AgX - Punchy'
    scene.cycles.max_bounces = 6
