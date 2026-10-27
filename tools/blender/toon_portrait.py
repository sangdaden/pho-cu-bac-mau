import sys, os, bpy, math
sys.path.insert(0, os.path.dirname(__file__))
import clay as C
import toon as T
T.patch()

out = sys.argv[1]; W = int(sys.argv[2]); H = int(sys.argv[3])
C.reset()
sc = bpy.context.scene
GR = '#CFC6BB'; GR2 = '#BDB3A7'

bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0)); g = bpy.context.active_object
g.data.materials.append(T.toon('', GR))
# bậc tường phía sau như bản mẫu
for i, (y, z, h) in enumerate([(6, 0, 1.2), (8, 1.2, 1.2), (10, 2.4, 1.6)]):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, y, z + h / 2)); b = bpy.context.active_object
    b.scale = (60, 2, h); b.data.materials.append(T.toon('', GR2 if i % 2 else '#C7BDB1'))
    bv = b.modifiers.new('bv', 'BEVEL'); bv.width = 0.15; bv.segments = 3
# gò vòm
for loc, r in [((3.4, 2.2, 0), 1.9), ((4.2, -0.6, 0), 0.8)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=r, location=loc); d = bpy.context.active_object
    d.scale = (1, 1, 0.45); d.data.materials.append(T.toon('', '#C4BAAE'))
    for p in d.data.polygons: p.use_smooth = True
T.lowpoly_rock('rock1', (-2.6, -2.4, 0.25), (0.75, 0.55, 0.42), '#E2DCD3', seed=3)
T.lowpoly_rock('rock2', (1.6, 1.0, 0.35), (0.6, 0.5, 0.5), '#D9D2C8', seed=8)

to = C.build_to(turn=math.radians(-25))
T.googly_eyes(to, look=(0.7, 0.1))
bpy.context.view_layer.update()
for o in to.children:
    if not o.name.startswith(('pupil', 'glint', 'cheek', 'brow', 'smile', 'node')):
        T.add_outline(o, 0.035)

sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 4.2; sun.angle = math.radians(3)
so = bpy.data.objects.new('sun', sun); sc.collection.objects.link(so)
so.rotation_euler = (math.radians(50), math.radians(-25), math.radians(-30))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = C.srgb('#E8E1D8')
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55

cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam)
cam.location = (1.2, -12.5, 6.0); C.look_at(cam, (0.8, 0, 1.7)); cam.data.lens = 42
sc.camera = cam
T.eevee(sc, W, H, 32)
sc.eevee.use_shadows = True if hasattr(sc.eevee,'use_shadows') else None
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
if len(sys.argv) > 4:
    bpy.ops.wm.save_as_mainfile(filepath=sys.argv[4])
