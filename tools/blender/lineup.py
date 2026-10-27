"""Ảnh xếp hàng so chiều cao: nhập khối đã duyệt từ trang 3D (glTF), gắn vật liệu toon + viền đen, render màu và xám."""
import sys, os, bpy, math, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
sys.path.insert(0, os.path.dirname(__file__))
import clay as C
import toon as T

gltf, outdir, W, H = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
C.reset()
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=gltf)

keep = set()
for ob in list(bpy.data.objects):
    if ob.type != 'MESH':
        continue
    names = [s.material.name for s in ob.material_slots if s.material]
    if names and names[0].startswith('toon_'):
        continue  # dữ liệu lưới dùng chung, đã gắn vật liệu toon ở object trước
    ob.data = ob.data.copy() if ob.data.users > 1 and False else ob.data
    hexcol = names[0].split('_')[0].split('.')[0] if names else '#CCCCCC'
    if '_keep' in (names[0] if names else ''):
        keep.add(hexcol)
    ob.data.materials.clear()
    ob.data.materials.append(T.toon('', hexcol))
    flat = '_flat' in ob.name
    for p in ob.data.polygons:
        p.use_smooth = not flat
bpy.context.view_layer.update()
for ob in list(bpy.data.objects):
    if ob.type == 'MESH' and ob.name.startswith('ol'):
        T.add_outline(ob, 0.05)

# đo chiều cao từng nhân vật theo bbox thế giới
roots = {o.name.split('.')[0]: o for o in bpy.data.objects if o.name.split('.')[0] in ('to', 'ba', 'hai', 'bong', 'tu', 'bui')}
info = {}
for k, r in roots.items():
    pts = []
    for d in [r] + list(r.children_recursive):
        if d.type == 'MESH':
            pts += [d.matrix_world @ Vector(c) for c in d.bound_box]
    info[k] = dict(top=max(p.z for p in pts), x=(min(p.x for p in pts) + max(p.x for p in pts)) / 2)
to_h = info['to']['top']

GR = '#D9D0C4'
bpy.ops.mesh.primitive_plane_add(size=120, location=(0, 0, 0)); g = bpy.context.active_object
g.data.materials.append(T.toon('', GR))
for i, (y, h, c) in enumerate([(9, 1.3, '#CBC1B5'), (11.5, 2.8, '#C2B8AB'), (14, 7.0, '#CBC1B5')]):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, y, h / 2)); b = bpy.context.active_object
    b.scale = (90, 3, h); b.data.materials.append(T.toon('', c))
# vạch chiều cao Tò = 1 và Tò = 0.5 trên tường sau

sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 4.2; sun.angle = math.radians(3)
so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
so.rotation_euler = (math.radians(48), math.radians(-28), math.radians(-25))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes['Background']
bg.inputs['Color'].default_value = C.srgb('#E8E1D8'); bg.inputs['Strength'].default_value = 0.55

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam)
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 24.5
cam.location = (1.6, -40, 9.0); C.look_at(cam, (1.6, 0, 2.7))
sc.camera = cam
T.eevee(sc, W, H, 48)

bpy.context.view_layer.update()
labels = {k: list(world_to_camera_view(sc, cam, Vector((v['x'], 0, 0))))[:2] + [round(v['top'] / to_h, 2)] for k, v in info.items()}
y1 = world_to_camera_view(sc, cam, Vector((0, -1.2, to_h)))[1]
y05 = world_to_camera_view(sc, cam, Vector((0, -1.2, to_h * .5)))[1]
json.dump(dict(labels=labels, line1=y1, line05=y05), open(os.path.join(outdir, 'lineup.json'), 'w'))

sc.render.filepath = os.path.join(outdir, 'lineup_mau.png')
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(outdir, 'dan-nhan-vat-toon.blend'))

# phủ xám: đổi màu gốc của mọi vật liệu toon (trừ Lũ Bụi) sang xám ấm
for hexcol, m in T._tm.items():
    if hexcol in keep:
        continue
    r, g_, b_, _ = C.srgb(hexcol)
    lin = lambda v: v  # srgb() trả về giá trị tuyến tính
    l = 0.299 * r + 0.587 * g_ + 0.114 * b_
    mix = [n for n in m.node_tree.nodes if n.bl_idname == 'ShaderNodeMix'][0]
    mix.inputs['A'].default_value = (l * 0.8 + 0.08, l * 0.78 + 0.08, l * 0.76 + 0.08, 1)
bg.inputs['Color'].default_value = C.srgb('#D6D3D0')
sc.render.filepath = os.path.join(outdir, 'lineup_xam.png')
bpy.ops.render.render(write_still=True)
print('DONE', json.dumps(labels))
