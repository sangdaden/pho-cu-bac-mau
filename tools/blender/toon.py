"""Phong cách toon giống bản mẫu: tô phẳng 2 tông, viền đen inverted hull, mắt to trắng, đá low-poly. Render bằng EEVEE."""
import bpy, bmesh, math, random
from mathutils import Vector
import clay as C

_tm = {}


def toon(name, hexcol, *a, gloss=False, **kw):
    key = hexcol
    if key in _tm:
        return _tm[key]
    m = bpy.data.materials.new('toon_' + hexcol)
    m.use_nodes = True
    nt = m.node_tree; n = nt.nodes; l = nt.links
    n.remove(n['Principled BSDF'])
    dif = n.new('ShaderNodeBsdfDiffuse')
    s2r = n.new('ShaderNodeShaderToRGB'); l.new(dif.outputs[0], s2r.inputs[0])
    bw = n.new('ShaderNodeRGBToBW'); l.new(s2r.outputs['Color'], bw.inputs[0])
    ramp = n.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation = 'CONSTANT'
    e = ramp.color_ramp.elements
    e[0].position = 0.0; e[0].color = (0.66, 0.63, 0.7, 1)   # bóng: hơi ngả tím lạnh
    e[1].position = 0.32; e[1].color = (0.86, 0.84, 0.87, 1)
    m3 = ramp.color_ramp.elements.new(0.62); m3.color = (1, 1, 1, 1)
    l.new(bw.outputs[0], ramp.inputs['Fac'])
    mul = n.new('ShaderNodeMix'); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1
    mul.inputs['A'].default_value = C.srgb(hexcol)
    l.new(ramp.outputs['Color'], mul.inputs['B'])
    em = n.new('ShaderNodeEmission'); l.new(mul.outputs['Result'], em.inputs['Color'])
    if gloss:
        # đốm sáng nhỏ cho mắt
        pass
    l.new(em.outputs[0], n['Material Output'].inputs['Surface'])
    _tm[key] = m
    return m


OUT = None


def outline_mat():
    global OUT
    if OUT is None:
        OUT = bpy.data.materials.new('outline'); OUT.use_nodes = True
        n = OUT.node_tree.nodes; n.remove(n['Principled BSDF'])
        em = n.new('ShaderNodeEmission'); em.inputs['Color'].default_value = C.srgb('#141019')
        OUT.node_tree.links.new(em.outputs[0], n['Material Output'].inputs['Surface'])
        OUT.use_backface_culling = True
    return OUT


def smooth_only(obj, strength=0, level=2):
    s = obj.modifiers.new('sub', 'SUBSURF'); s.levels = 1; s.render_levels = level
    for p in obj.data.polygons:
        p.use_smooth = True


def add_outline(ob, width=0.028):
    if ob.type != 'MESH':
        return
    sc = (abs(ob.scale.x) + abs(ob.scale.y) + abs(ob.scale.z)) / 3
    p = ob.parent
    while p:
        sc *= p.scale.x
        p = p.parent
    ob.data.materials.append(outline_mat())
    so = ob.modifiers.new('outline', 'SOLIDIFY')
    so.thickness = -width / max(sc, 0.01) if False else width / max(sc, 0.01)
    so.offset = 1; so.use_flip_normals = True; so.material_offset = len(ob.data.materials) - 1
    so.use_rim = False


def patch():
    C.clay = toon
    C.lumpy = smooth_only


def googly_eyes(root, look=(0.25, 0)):
    """Mắt to tròn trắng, con ngươi tím đen nhìn lệch một bên như bản mẫu."""
    for o in list(root.children):
        if o.name.startswith(('eye', 'spec')):
            bpy.data.objects.remove(o)
    W = toon('', '#FFFFFF'); P = toon('', '#1E1530'); G = toon('', '#FFFFFE')
    for s in (-1, 1):
        cx = s * 0.33
        e = C.blob(f'eyeW{s}', (s * 0.36, -0.75, 2.74), (0.33, 0.2, 0.37), W, parent=root, seg=32)
        px = s * 0.36 + look[0] * 0.13
        C.blob(f'pupil{s}', (px, -0.94, 2.72 + look[1] * 0.1), (0.17, 0.04, 0.2), P, parent=root, seg=24)
        C.blob(f'glint{s}', (px + 0.06, -0.98, 2.8), (0.05, 0.02, 0.055), G, parent=root, seg=16)


def lowpoly_rock(name, loc, size, hexcol, seed=1):
    random.seed(seed)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=loc)
    ob = bpy.context.active_object; ob.name = name
    for v in ob.data.vertices:
        v.co *= random.uniform(0.82, 1.12)
    ob.scale = size
    for p in ob.data.polygons:
        p.use_smooth = False
    ob.data.materials.append(toon('', hexcol))
    return ob


def eevee(scene, w, h, samples=32):
    scene.render.engine = 'BLENDER_EEVEE'
    scene.eevee.taa_render_samples = samples
    scene.render.resolution_x = w; scene.render.resolution_y = h; scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
