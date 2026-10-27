import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import clay as C
import toon as T
T.patch()
src = open(os.path.join(os.path.dirname(__file__), 'keyart.py'), encoding='utf-8').read()
tail = """
T.googly_eyes(to, look=(0.9, 0.0))
bpy.context.view_layer.update()
for o in list(to.children):
    if not o.name.startswith(('pupil', 'glint', 'cheek', 'brow', 'smile', 'node')):
        T.add_outline(o, 0.03)
for o in list(bpy.data.objects):
    if o.name.startswith('bui') and not o.name.startswith('bui_eye'):
        T.add_outline(o, 0.025)
T.add_outline(flap, 0.02)
for o in list(bpy.data.objects):
    if o.name.startswith('bui_eye'):
        x, y, z = o.location
        o.scale = (o.scale.x * 1.9, o.scale.y * 1.2, o.scale.z * 1.5)
        o.data.materials.clear(); o.data.materials.append(T.toon('', '#FFFFFF')); T.add_outline(o, 0.012)
        C.blob('bui_pupil', (x + 0.02, y - o.scale.y * 0.9, z), (o.scale.x * 0.5, o.scale.y * 0.4, o.scale.z * 0.5), T.toon('', '#1E1530'), seg=16)
sun.energy = 4.5
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
T.eevee(sc, W, H, 32)
"""
src = src.replace("cycles(sc, W, H, S)", tail)
src = src.replace("cam.data.dof.use_dof = True", "cam.data.dof.use_dof = False")
exec(compile(src, 'keyart.py', 'exec'))
