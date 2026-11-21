# Renderar arenabilderna till Flodljus Manager med Blender (modulen bpy).
#
#   python arena.py <utmapp> [steg] [day|night] [--preview]
#
# Sex steg (1 = gräsplan med en liten ståplats, 6 = storarena i två våningar),
# vart och ett i dagsljus (utan strålkastare) och på kvällen (med strålkastare).
import math
import random
import sys

import bpy
from mathutils import Vector

ROW_D, ROW_H = 0.85, 0.42      # djup och höjd per läktarrad
PITCH_L, PITCH_W = 64.0, 40.0  # planen

# rader på huvudläktare / motstående / kortsidor, tak, våningar, skärm, master
STAGES = {
    1: dict(main=0, opp=0, ends=0, terrace=2, roof=(), tier=0, screen=False, masts=2, hut=True),
    2: dict(main=5, opp=0, ends=3, terrace=0, roof=(), tier=0, screen=False, masts=4, hut=True),
    3: dict(main=9, opp=4, ends=6, terrace=0, roof=('main',), tier=0, screen=False, masts=4, hut=False),
    4: dict(main=14, opp=9, ends=9, terrace=0, roof=('main',), tier=0, screen=False, masts=4, hut=False),
    5: dict(main=18, opp=14, ends=13, terrace=0, roof=('main', 'opp'), tier=0, screen=True, masts=4, hut=False),
    6: dict(main=16, opp=16, ends=18, terrace=0, roof=('main', 'opp', 'ends'), tier=1, screen=True, masts=4, hut=False, corners=True),
}


def mat(name, color, rough=0.7, emit=None, strength=0.0, metallic=0.0):
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


def beam_mat(strength):
    # Ljuskägla: genomskinlig med svag glöd
    m = bpy.data.materials.new('beam')
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    mix = nt.nodes.new('ShaderNodeAddShader')
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (1.0, 0.9, 0.62, 1)
    em.inputs['Strength'].default_value = strength
    nt.links.new(tr.outputs[0], mix.inputs[0])
    nt.links.new(em.outputs[0], mix.inputs[1])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    return m


_cubes = {}


def box(size, loc, m, rot=0.0):
    """Låda med mitten i loc (x, y, z) och storlek size."""
    if m.name not in _cubes:
        bpy.ops.mesh.primitive_cube_add(size=1)
        base = bpy.context.object
        base.data.materials.append(m)
        _cubes[m.name] = base.data
        bpy.data.objects.remove(base)
    o = bpy.data.objects.new('b', _cubes[m.name])
    o.scale = size
    o.location = loc
    o.rotation_euler[2] = rot
    bpy.context.scene.collection.objects.link(o)
    return o


def stand(M, rows, length, side, offset, seated=True, base=0.6, z0=0.0):
    """Trappad läktare. side: 'N' 'S' 'E' 'W'; offset = avstånd från planens mitt till första raden."""
    seat = M['seat'] if seated else M['terrace']
    for i in range(rows):
        h = base + i * ROW_H
        d = offset + i * ROW_D + ROW_D / 2
        accent = seated and (i == rows // 2)
        m = M['gold'] if accent else (M['seat2'] if seated and i % 2 else seat)
        if side in 'NS':
            y = d if side == 'N' else -d
            box((length, ROW_D, h), (0, y, z0 + h / 2), M['concrete'])
            box((length - 0.6, ROW_D * 0.8, 0.12), (0, y, z0 + h + 0.06), m)
        else:
            x = d if side == 'E' else -d
            box((ROW_D, length, h), (x, 0, z0 + h / 2), M['concrete'])
            box((ROW_D * 0.8, length - 0.6, 0.12), (x, 0, z0 + h + 0.06), m)
    depth = rows * ROW_D
    top = base + rows * ROW_H
    # bakvägg
    if rows:
        d = offset + depth + 0.2
        if side in 'NS':
            box((length, 0.4, top + 1.2), (0, d if side == 'N' else -d, z0 + (top + 1.2) / 2), M['wall'])
        else:
            box((0.4, length, top + 1.2), (d if side == 'E' else -d, 0, z0 + (top + 1.2) / 2), M['wall'])
    return depth, top


def roof(M, length, side, offset, depth, top, z0=0.0):
    h = z0 + top + 4.2
    over = depth * 0.6 + 2.5
    c = offset + depth - over / 2 + 0.8
    n = max(2, int(length // 12))
    if side in 'NS':
        s = 1 if side == 'N' else -1
        r = box((length + 1.5, over, 0.35), (0, s * c, h), M['roof'])
        r.rotation_euler[0] = s * math.radians(4)
        box((length + 1.5, 0.3, 0.9), (0, s * (c - over / 2), h - 0.5), M['fascia'])
        for i in range(n + 1):
            x = -length / 2 + i * length / n
            box((0.35, 0.35, h), (x, s * (offset + depth + 0.5), h / 2), M['steel'])
    else:
        s = 1 if side == 'E' else -1
        r = box((over, length + 1.5, 0.35), (s * c, 0, h), M['roof'])
        r.rotation_euler[1] = -s * math.radians(4)
        box((0.3, length + 1.5, 0.9), (s * (c - over / 2), 0, h - 0.5), M['fascia'])
        for i in range(n + 1):
            y = -length / 2 + i * length / n
            box((0.35, 0.35, h), (s * (offset + depth + 0.5), y, h / 2), M['steel'])
    return h


def mast(M, x, y, height, night, heads=3):
    box((0.5, 0.5, height), (x, y, height / 2), M['steel'])
    ang = math.atan2(-y, -x)
    hd = box((0.5, 3.2, 1.2 * heads * 0.55), (x, y, height + 0.4), M['lamp_on'] if night else M['lamp_off'], rot=ang)
    hd.rotation_euler[1] = math.radians(-18)
    if night:
        bpy.ops.object.light_add(type='SPOT', location=(x, y, height + 0.4))
        L = bpy.context.object
        L.data.energy = 260000 * (height / 22) ** 2
        L.data.spot_size = math.radians(72)
        L.data.spot_blend = 0.6
        L.data.color = (1.0, 0.93, 0.78)
        L.data.shadow_soft_size = 1.2
        aim = Vector((x * 0.18, y * 0.18, 0)) - Vector((x, y, height))
        L.rotation_euler = aim.to_track_quat('-Z', 'Y').to_euler()
        # synlig ljuskägla
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=height * 0.42, radius2=0.5, depth=aim.length * 0.72)
        c = bpy.context.object
        c.data.materials.append(M['beam'])
        c.location = Vector((x, y, height)) + aim * 0.36
        c.rotation_euler = aim.to_track_quat('-Z', 'Y').to_euler()
        c.visible_shadow = False


def tree(M, x, y, s):
    box((0.4 * s, 0.4 * s, 2.2 * s), (x, y, 1.1 * s), M['trunk'])
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=2.1 * s, location=(x, y, 3.6 * s))
    o = bpy.context.object
    o.scale = (1, 1, 1.25)
    o.data.materials.append(M['leaf'])
    bpy.ops.object.shade_smooth()


def build(stage, night):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _cubes.clear()
    random.seed(stage * 7 + 1)
    cfg = STAGES[stage]
    lit = 1.0
    M = dict(
        grass1=mat('grass1', (0.035, 0.22, 0.05), 0.9), grass2=mat('grass2', (0.05, 0.28, 0.07), 0.9),
        ground=mat('ground', (0.05, 0.13, 0.05), 1.0), line=mat('line', (0.9, 0.9, 0.9), 0.6),
        asphalt=mat('asphalt', (0.035, 0.038, 0.05), 0.9), concrete=mat('concrete', (0.33, 0.35, 0.40), 0.85),
        terrace=mat('terrace', (0.42, 0.44, 0.48), 0.85), wall=mat('wall', (0.10, 0.14, 0.30), 0.7),
        seat=mat('seat', (0.07, 0.13, 0.42), 0.5), seat2=mat('seat2', (0.09, 0.17, 0.52), 0.5),
        gold=mat('gold', (1.0, 0.62, 0.12), 0.45), roof=mat('roof', (0.55, 0.60, 0.72), 0.35, metallic=0.5),
        fascia=mat('fascia', (1.0, 0.66, 0.16), 0.4, emit=(1.0, 0.66, 0.16), strength=1.5 if night else 0.0),
        steel=mat('steel', (0.5, 0.52, 0.58), 0.4, metallic=0.8), trunk=mat('trunk', (0.12, 0.07, 0.04), 0.9),
        leaf=mat('leaf', (0.03, 0.14, 0.05), 0.95), board=mat('board', (0.85, 0.87, 0.92), 0.5),
        boardgold=mat('boardgold', (1.0, 0.62, 0.12), 0.5), hut=mat('hut', (0.45, 0.10, 0.07), 0.8),
        hutroof=mat('hutroof', (0.08, 0.08, 0.10), 0.6), net=mat('net', (0.95, 0.95, 0.95), 0.5),
        lamp_on=mat('lamp_on', (1, 1, 1), 0.3, emit=(1.0, 0.92, 0.7), strength=40.0),
        lamp_off=mat('lamp_off', (0.75, 0.77, 0.8), 0.3),
        window=mat('window', (0.05, 0.07, 0.1), 0.1, emit=(1.0, 0.78, 0.4), strength=2.5 if night else 0.3),
        screen=mat('screen', (0.02, 0.04, 0.10), 0.2, emit=(0.15, 0.35, 1.0), strength=5.0 if night else 1.2),
        screentxt=mat('screentxt', (1, 0.8, 0.3), 0.2, emit=(1.0, 0.75, 0.25), strength=9.0 if night else 2.5),
        beam=beam_mat(0.005),
    )

    # mark, plan och linjer
    box((700, 700, 0.2), (0, 0, -0.1), M['ground'])
    box((PITCH_L + 14, PITCH_W + 12, 0.1), (0, 0, 0.0), M['asphalt'] if stage >= 3 else M['ground'])
    n = 12
    for i in range(n):
        w = PITCH_L / n
        box((w, PITCH_W, 0.1), (-PITCH_L / 2 + w * (i + 0.5), 0, 0.06), M['grass1'] if i % 2 else M['grass2'])
    z, t = 0.125, 0.22
    for y in (-PITCH_W / 2, PITCH_W / 2):
        box((PITCH_L, t, 0.02), (0, y, z), M['line'])
    for x in (-PITCH_L / 2, 0, PITCH_L / 2):
        box((t, PITCH_W, 0.02), (x, 0, z), M['line'])
    bpy.ops.mesh.primitive_torus_add(major_radius=6, minor_radius=0.12, major_segments=64, minor_segments=4, location=(0, 0, 0.08))
    bpy.context.object.data.materials.append(M['line'])
    for s in (-1, 1):
        x = s * PITCH_L / 2
        box((t, 20, 0.02), (x - s * 9, 0, z), M['line'])
        for y in (-10, 10):
            box((9, t, 0.02), (x - s * 4.5, y, z), M['line'])
        # mål
        for y in (-2.5, 2.5):
            box((0.14, 0.14, 2.1), (x, y, 1.05), M['net'])
        box((0.14, 5.14, 0.14), (x, 0, 2.1), M['net'])
        box((1.4, 5.0, 0.05), (x + s * 0.7, 0, 2.05), M['net'])
    # sarg runt planen
    bx, by = PITCH_L / 2 + 1.2, PITCH_W / 2 + 1.2
    k = 0
    for i in range(16):
        w = 2 * bx / 16
        for y in (-by, by):
            box((w - 0.1, 0.12, 1.0), (-bx + w * (i + 0.5), y, 0.5), M['boardgold'] if (i + k) % 4 == 0 else M['board'])
    for i in range(10):
        w = 2 * by / 10
        for x in (-bx, bx):
            box((0.12, w - 0.1, 1.0), (x, -by + w * (i + 0.5), 0.5), M['boardgold'] if i % 4 == 1 else M['board'])

    off_ns, off_ew = by + 2.0, bx + 2.0
    L_ns = PITCH_L + 6
    L_ew = PITCH_W + 6
    tops = {}
    if cfg['terrace']:
        stand(M, cfg['terrace'], 26, 'N', off_ns, seated=False, base=0.4)
    if cfg['main']:
        d, top = stand(M, cfg['main'], L_ns if stage >= 3 else 34, 'N', off_ns)
        tops['main'] = (d, top, 0.0)
        if cfg['tier']:
            z0 = top + 2.6
            box((L_ns, d * 0.75, 0.5), (0, off_ns + d * 0.72 + d * 0.375, z0 - 0.25), M['concrete'])
            box((L_ns, 0.3, 1.3), (0, off_ns + d * 0.72, z0 + 0.2), M['fascia'])
            for i in range(-3, 4):
                box((7.0, 0.1, 1.0), (i * 9.5, off_ns + d * 0.72 - 0.25, top + 1.4), M['window'])
            # övre våningen
            for i in range(12):
                h = 0.5 + i * (ROW_H + 0.1)
                y = off_ns + d * 0.72 + 0.6 + i * ROW_D + ROW_D / 2
                box((L_ns, ROW_D, h), (0, y, z0 + h / 2), M['concrete'])
                box((L_ns - 0.6, ROW_D * 0.8, 0.12), (0, y, z0 + h + 0.06), M['gold'] if i == 6 else (M['seat2'] if i % 2 else M['seat']))
            d2 = d * 0.72 + 0.6 + 12 * ROW_D
            top2 = z0 + 0.5 + 12 * (ROW_H + 0.1)
            box((L_ns, 0.4, top2 + 1.2), (0, off_ns + d2 + 0.2, (top2 + 1.2) / 2), M['wall'])
            tops['main'] = (d2, top2, 0.0)
    if cfg['opp']:
        d, top = stand(M, cfg['opp'], L_ns, 'S', off_ns)
        tops['opp'] = (d, top, 0.0)
        if cfg['tier']:
            z0 = top + 2.6
            box((L_ns, d * 0.75, 0.5), (0, -(off_ns + d * 0.72 + d * 0.375), z0 - 0.25), M['concrete'])
            box((L_ns, 0.3, 1.3), (0, -(off_ns + d * 0.72), z0 + 0.2), M['fascia'])
            for i in range(10):
                h = 0.5 + i * (ROW_H + 0.1)
                y = -(off_ns + d * 0.72 + 0.6 + i * ROW_D + ROW_D / 2)
                box((L_ns, ROW_D, h), (0, y, z0 + h / 2), M['concrete'])
                box((L_ns - 0.6, ROW_D * 0.8, 0.12), (0, y, z0 + h + 0.06), M['gold'] if i == 5 else (M['seat2'] if i % 2 else M['seat']))
            d2 = d * 0.72 + 0.6 + 10 * ROW_D
            top2 = z0 + 0.5 + 10 * (ROW_H + 0.1)
            box((L_ns, 0.4, top2 + 1.2), (0, -(off_ns + d2 + 0.2), (top2 + 1.2) / 2), M['wall'])
            tops['opp'] = (d2, top2, 0.0)
    if cfg['ends']:
        for side in 'EW':
            d, top = stand(M, cfg['ends'], L_ew, side, off_ew, seated=stage >= 5)
            tops[side] = (d, top, 0.0)
    for key in cfg['roof']:
        if key == 'main':
            d, top, _ = tops['main']
            hroof = roof(M, L_ns, 'N', off_ns, d, top)
        elif key == 'opp':
            d, top, _ = tops['opp']
            roof(M, L_ns, 'S', off_ns, d, top)
        else:
            for side in 'EW':
                d, top, _ = tops[side]
                roof(M, L_ew, side, off_ew, d, top)
    # hörn som binder ihop läktarna på den största arenan
    if cfg.get('corners'):
        dm, tm, _ = tops['main']
        de, te, _ = tops['E']
        for sx in (-1, 1):
            for sy in (-1, 1):
                dd = tops['main'][0] if sy > 0 else tops['opp'][0]
                tt = min(te, tops['main'][1] if sy > 0 else tops['opp'][1])
                cx, cy = sx * (L_ns / 2 + de / 2 + 1.0), sy * (L_ew / 2 + dd / 2 + 1.0)
                box((de + 1.5, dd + 1.5, tt * 0.8), (cx, cy, tt * 0.4), M['wall'])
                box((de + 1.5, dd + 1.5, 0.3), (cx, cy, tt * 0.8 + 0.15), M['concrete'])
    # VIP-fönster högst upp på huvudläktaren (steg 4+)
    if stage >= 4 and 'main' in tops and not cfg['tier']:
        d, top, _ = tops['main']
        for i in range(-3, 4):
            box((6.5, 0.12, 1.3), (i * 9, off_ns + d - 0.2, top + 1.3), M['window'])
    # storbildsskärm på kortsidan
    if cfg['screen']:
        d, top, _ = tops['E']
        zs = top + (11.5 if 'ends' in cfg['roof'] else 6.0)
        xs = off_ew + d + (-(d * 0.5) if 'ends' in cfg['roof'] else 1.2)
        box((0.5, 13, 6.5), (xs, 0, zs), M['screen'])
        box((0.2, 9.5, 1.0), (xs - 0.32, 0, zs + 1.2), M['screentxt'])
        box((0.2, 5.5, 0.7), (xs - 0.32, 0, zs - 1.0), M['screentxt'])
        if 'ends' not in cfg['roof']:
            for y in (-5, 5):
                box((0.4, 0.4, zs), (xs + 0.3, y, zs / 2), M['steel'])
    # klubbstuga
    if cfg['hut']:
        hx, hy = -PITCH_L / 2 - 4, off_ns + (9 if stage == 2 else 5)
        box((10, 6, 3.2), (hx, hy, 1.6), M['hut'])
        box((11, 7, 0.4), (hx, hy, 3.4), M['hutroof'])
        box((2.2, 0.1, 1.2), (hx - 2, hy - 3.02, 1.9), M['window'])
        box((2.2, 0.1, 1.2), (hx + 2, hy - 3.02, 1.9), M['window'])
    # strålkastarmaster
    extent_x = off_ew + (tops['E'][0] if 'E' in tops else 0) + 5
    extent_y = off_ns + max((tops[k][0] for k in ('main', 'opp') if k in tops), default=3) + 5
    if night or stage >= 3:
        hm = [0, 13, 17, 22, 27, 33, 40][stage]
        if cfg['masts'] == 2:
            pts = [(-extent_x * 0.75, extent_y), (extent_x * 0.75, extent_y)]
        else:
            pts = [(sx * extent_x, sy * extent_y) for sx in (-1, 1) for sy in (-1, 1)]
        if stage == 6:
            # storarenan har strålkastarna i takkanten i stället för master
            for (x, y) in pts if night else []:
                bpy.ops.object.light_add(type='SPOT', location=(x * 0.62, y * 0.55, 30))
                L = bpy.context.object
                L.data.energy, L.data.spot_size, L.data.spot_blend = 200000, math.radians(95), 0.7
                L.data.color = (1.0, 0.93, 0.78)
                aim = Vector((x * 0.1, y * 0.1, 0)) - L.location
                L.rotation_euler = aim.to_track_quat('-Z', 'Y').to_euler()
        else:
            for (x, y) in pts:
                mast(M, x, y, hm, night, heads=2 + stage // 2)
    # träd och omgivning
    for _ in range(46 + stage * 4):
        a = random.uniform(0, math.tau)
        r = random.uniform(1.25, 3.2)
        x, y = math.cos(a) * extent_x * r * 1.1, math.sin(a) * extent_y * r * 1.5
        if abs(x) < extent_x + 6 and abs(y) < extent_y + 6:
            continue
        if y < -extent_y and abs(x) < extent_x * 0.6:
            continue
        tree(M, x, y, random.uniform(0.9, 1.7))
    # väg och parkering framför arenan
    box((500, 7, 0.06), (0, -(extent_y + 16), 0.03), M['asphalt'])
    if stage >= 3:
        box((extent_x * 1.3, 12, 0.06), (0, -(extent_y + 6), 0.03), M['asphalt'])

    # ljus och himmel
    world = bpy.data.worlds.new('w')
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bpy.context.scene.world = world
    if night:
        bg.inputs['Color'].default_value = (0.02, 0.035, 0.10, 1)
        bg.inputs['Strength'].default_value = 1.0
        bpy.ops.object.light_add(type='SUN', rotation=(math.radians(50), 0, math.radians(140)))
        bpy.context.object.data.energy = 0.6
        bpy.context.object.data.color = (0.55, 0.65, 1.0)
        if cfg['masts'] and stage == 1:
            pass
    else:
        bg.inputs['Color'].default_value = (0.42, 0.60, 0.95, 1)
        bg.inputs['Strength'].default_value = 0.9
        bpy.ops.object.light_add(type='SUN', rotation=(math.radians(52), 0, math.radians(215)))
        bpy.context.object.data.energy = 4.2
        bpy.context.object.data.color = (1.0, 0.93, 0.82)
        bpy.context.object.data.angle = math.radians(2)

    # kamera: snett uppifrån framför arenan
    size = max(extent_x, extent_y * 1.35)
    cam_d = bpy.data.cameras.new('cam')
    cam_d.lens = 40
    cam = bpy.data.objects.new('cam', cam_d)
    bpy.context.scene.collection.objects.link(cam)
    dist = size * (2.75 if stage < 5 else 2.45) + 24
    cam.location = (dist * 0.38, -dist * 0.70, dist * (0.58 if stage < 5 else 0.72))
    target = Vector((0, 2 + stage, 1.5 + stage * 0.9))
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam
    return cam, extent_x, extent_y


def render(path, preview):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 16 if preview else 64
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 4
    sc.cycles.transparent_max_bounces = 8
    sc.render.resolution_x, sc.render.resolution_y = (640, 360) if preview else (1280, 720)
    sc.render.image_settings.file_format = 'PNG'
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = args[0]
    stages = [int(args[1])] if len(args) > 1 else list(STAGES)
    modes = [args[2]] if len(args) > 2 else ['day', 'night']
    if '--hero' in sys.argv:
        # startskärmens bakgrund: kvällsarenan snett från sidan, lägre kamera
        cam, ex, ey = build(4, True)
        cam.data.lens = 30
        d = max(ex, ey * 1.35) * 1.55
        cam.location = (d * 0.46, -d * 0.78, d * 0.32)
        cam.rotation_euler = (Vector((-4, 6, 9)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        render(f'{out}/hero.png', '--preview' in sys.argv)
        sys.exit()
    for st in stages:
        for mode in modes:
            build(st, mode == 'night')
            render(f'{out}/arena-{st}-{mode}.png', '--preview' in sys.argv)
