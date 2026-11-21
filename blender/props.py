# Renderar appikonen och pokalerna till Flodljus Manager med Blender (modulen bpy).
#
#   python props.py <utmapp> [--preview]
import math
import sys

import bpy
import bmesh  # måste läsas in efter bpy
from mathutils import Vector


def mat(name, color, rough=0.5, metallic=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metallic
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = strength
    return m


def add(obj_mat):
    bpy.context.object.data.materials.append(obj_mat)
    return bpy.context.object


def camera(loc, target, lens=50):
    d = bpy.data.cameras.new('cam')
    d.lens = lens
    cam = bpy.data.objects.new('cam', d)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = loc
    cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam


def world(color, strength=1.0):
    w = bpy.data.worlds.new('w')
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (*color, 1)
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = strength
    bpy.context.scene.world = w


def area(loc, target, energy, size, color=(1, 1, 1)):
    bpy.ops.object.light_add(type='AREA', location=loc)
    L = bpy.context.object
    L.data.energy, L.data.size, L.data.color = energy, size, color
    L.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


def render(path, res, preview, transparent=False):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 24 if preview else 128
    sc.cycles.use_denoising = True
    sc.render.film_transparent = transparent
    sc.render.resolution_x, sc.render.resolution_y = (res[0] // 2, res[1] // 2) if preview else res
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA' if transparent else 'RGB'
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


def icon(out, preview):
    """Appikon: en tänd strålkastarramp mot natthimmel."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    steel = mat('steel', (0.10, 0.13, 0.24), 0.35, 0.9)
    lamp = mat('lamp', (1, 1, 1), 0.2, emit=(1.0, 0.80, 0.32), strength=22.0)
    rim = mat('rim', (1.0, 0.62, 0.12), 0.3, 0.8)
    back = mat('back', (0.02, 0.035, 0.11), 0.9)
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 3, 0), rotation=(math.radians(90), 0, 0))
    add(back)
    # ram
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.55))
    o = add(steel)
    o.scale = (4.5, 0.5, 4.5)
    # nio lampor
    for ix in range(3):
        for iz in range(3):
            x, z = (ix - 1) * 1.38, 0.55 + (iz - 1) * 1.38
            bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.56, depth=0.2, location=(x, -0.3, z), rotation=(math.radians(90), 0, 0))
            add(lamp)
            bpy.ops.mesh.primitive_torus_add(major_radius=0.58, minor_radius=0.07, location=(x, -0.36, z), rotation=(math.radians(90), 0, 0))
            add(rim)
    # mast
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.1, -3.4))
    o = add(steel)
    o.scale = (0.55, 0.4, 4.0)
    world((0.02, 0.03, 0.09), 1.0)
    area((-5, -7, 5), (0, 0, 0.5), 900, 6, (0.6, 0.7, 1.0))
    area((4, -6, -3), (0, 0, 0), 300, 5, (1.0, 0.8, 0.5))
    camera((2.2, -11.5, -1.6), (0, 0, 0.2), lens=58)
    render(f'{out}/icon.png', (1024, 1024), preview)


def lathe(profile, m, steps=64):
    """Svarvad form av en profil [(radie, höjd), …]."""
    mesh = bpy.data.meshes.new('lathe')
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, axis=(0, 0, 1), cent=(0, 0, 0), angle=math.tau, steps=steps, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new('lathe', mesh)
    mesh.materials.append(m)
    bpy.context.scene.collection.objects.link(o)
    return o


def trophy_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    world((0.55, 0.6, 0.75), 0.7)
    area((-4, -5, 6), (0, 0, 2), 900, 5, (1.0, 0.95, 0.85))
    area((5, -3, 3), (0, 0, 2), 500, 4, (0.8, 0.9, 1.0))
    area((0, 5, 5), (0, 0, 2), 400, 6, (1.0, 0.8, 0.5))
    # ljusa skivor som guldet kan spegla
    for x in (-6, 6):
        bpy.ops.mesh.primitive_plane_add(size=7, location=(x, -2, 3), rotation=(0, math.radians(90), 0))
        o = add(mat(f'card{x}', (1, 1, 1), emit=(1, 0.97, 0.9), strength=2.5))
        o.visible_camera = False


def trophy_cup(out, preview):
    """Stor pokal: ligamästare och cupen."""
    trophy_scene()
    gold = mat('gold', (1.0, 0.70, 0.22), 0.16, 1.0)
    wood = mat('wood', (0.10, 0.045, 0.02), 0.45)
    plate = mat('plate', (0.9, 0.75, 0.4), 0.3, 1.0)
    lathe([(0, 0), (1.25, 0), (1.25, 0.55), (1.05, 0.7), (0, 0.7)], wood)
    lathe([(0, 0.7), (0.85, 0.7), (0.8, 0.82), (0.32, 0.95), (0.2, 1.25), (0.26, 1.5), (0.2, 1.75), (0.3, 1.95),
           (0.75, 2.2), (1.12, 2.75), (1.3, 3.5), (1.36, 4.1), (1.42, 4.16), (1.36, 4.2), (1.22, 4.12), (1.16, 3.5),
           (1.0, 2.85), (0.6, 2.4), (0, 2.3)], gold)
    for s in (-1, 1):  # handtag
        bpy.ops.mesh.primitive_torus_add(major_radius=0.55, minor_radius=0.085, location=(s * 1.42, 0, 3.25), rotation=(math.radians(90), 0, 0))
        o = add(gold)
        o.scale = (0.8, 1.25, 1)
        bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -1.22, 0.3))
    o = add(plate)
    o.scale = (0.9, 0.06, 0.3)
    camera((0, -11.5, 3.3), (0, 0, 2.1), lens=62)
    render(f'{out}/trophy-cup.png', (512, 512), preview, transparent=True)


def trophy_plate(out, preview):
    """Liten sköld på fot: seriesegrar."""
    trophy_scene()
    gold = mat('gold', (1.0, 0.70, 0.22), 0.18, 1.0)
    wood = mat('wood', (0.10, 0.045, 0.02), 0.45)
    lathe([(0, 0), (1.0, 0), (1.0, 0.4), (0.85, 0.5), (0, 0.5)], wood)
    lathe([(0, 0.5), (0.35, 0.5), (0.22, 0.7), (0.18, 1.0), (0, 1.0)], gold)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=1.35, depth=0.16, location=(0, 0, 2.3), rotation=(math.radians(90), 0, 0))
    add(gold)
    bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_torus_add(major_radius=1.35, minor_radius=0.1, location=(0, 0, 2.3), rotation=(math.radians(90), 0, 0))
    add(gold)
    bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_torus_add(major_radius=0.85, minor_radius=0.05, location=(0, -0.09, 2.3), rotation=(math.radians(90), 0, 0))
    add(gold)
    # stjärna i mitten
    mesh = bpy.data.meshes.new('star')
    bm = bmesh.new()
    pts = [bm.verts.new((math.sin(i * math.pi / 5) * (0.62 if i % 2 == 0 else 0.26), -0.1, 2.3 + math.cos(i * math.pi / 5) * (0.62 if i % 2 == 0 else 0.26))) for i in range(10)]
    face = bm.faces.new(pts)
    bmesh.ops.extrude_face_region(bm, geom=[face])
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new('star', mesh)
    mesh.materials.append(mat('star', (1.0, 0.93, 0.7), 0.35, 0.0, emit=(1.0, 0.85, 0.45), strength=0.6))
    bpy.context.scene.collection.objects.link(o)
    camera((0, -10, 2.4), (0, 0, 1.75), lens=62)
    render(f'{out}/trophy-plate.png', (512, 512), preview, transparent=True)


if __name__ == '__main__':
    out = sys.argv[1]
    pv = '--preview' in sys.argv
    icon(out, pv)
    trophy_cup(out, pv)
    trophy_plate(out, pv)
